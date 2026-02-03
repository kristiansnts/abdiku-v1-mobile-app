import api from '@/services/api';
import { CompanyLocation } from '@/types/attendance';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const f1 = (lat1 * Math.PI) / 180;
    const f2 = (lat2 * Math.PI) / 180;
    const df = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(df / 2) * Math.sin(df / 2) +
        Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const useGeofence = (enabled: boolean = true) => {
    const [locations, setLocations] = useState<CompanyLocation[]>([]);
    const [isInside, setIsInside] = useState<boolean | null>(null);
    const [nearestPlace, setNearestPlace] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/company/locations');
            setLocations(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Fetch locations error:', err);
            setError('Failed to load company geofences');
        } finally {
            setLoading(false);
        }
    };

    const checkGeofence = useCallback((lat: number, lon: number, currentLocations: CompanyLocation[]) => {
        setCurrentLocation({ lat, lng: lon });
        setError(null); // Clear error if we get a valid location
        let foundInside = false;
        let minDistance = Infinity;
        let closestName = null;

        currentLocations.forEach((loc) => {
            const dist = calculateDistance(lat, lon, loc.latitude, loc.longitude);
            if (dist <= loc.geofence_radius_meters) {
                foundInside = true;
            }
            if (dist < minDistance) {
                minDistance = dist;
                closestName = loc.name;
            }
        });

        setIsInside(foundInside);
        setNearestPlace(closestName);
    }, []);

    const startLocationTracking = useCallback(async (currentLocations: CompanyLocation[]) => {
        try {
            const isServiceEnabled = await Location.hasServicesEnabledAsync();
            if (!isServiceEnabled) {
                setError('Location services are disabled on this device');
                return;
            }

            const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (locStatus !== 'granted') {
                setError('Location permission denied');
                return;
            }

            // Try to get initial location with multiple fallback strategies
            let locationFound = false;

            // Strategy 1: Try to get last known position immediately (fast)
            try {
                const lastKnown = await Location.getLastKnownPositionAsync({
                    maxAge: 60000, // Accept positions up to 1 minute old
                    requiredAccuracy: 100, // Accept accuracy up to 100 meters
                });

                if (lastKnown) {
                    checkGeofence(lastKnown.coords.latitude, lastKnown.coords.longitude, currentLocations);
                    locationFound = true;
                }
            } catch (lastKnownErr) {
                // Silently continue to next strategy
            }

            // Strategy 2: Try current position with lower accuracy first (faster)
            if (!locationFound) {
                try {
                    const quickLocation = await Promise.race([
                        Location.getCurrentPositionAsync({
                            accuracy: Location.Accuracy.Low,
                            mayShowUserSettingsDialog: true
                        }),
                        new Promise<null>((_, reject) =>
                            setTimeout(() => reject(new Error('Quick location timeout')), 3000)
                        )
                    ]);

                    if (quickLocation) {
                        checkGeofence(quickLocation.coords.latitude, quickLocation.coords.longitude, currentLocations);
                        locationFound = true;
                    }
                } catch (quickErr) {
                    // Continue to next strategy
                }
            }

            // Strategy 3: Try with balanced accuracy and longer timeout
            if (!locationFound) {
                try {
                    setError('GPS signal weak. Still searching...');
                    const preciseLocation = await Promise.race([
                        Location.getCurrentPositionAsync({
                            accuracy: Location.Accuracy.Balanced,
                            mayShowUserSettingsDialog: true
                        }),
                        new Promise<null>((_, reject) =>
                            setTimeout(() => reject(new Error('Precise location timeout')), 10000)
                        )
                    ]);

                    if (preciseLocation) {
                        checkGeofence(preciseLocation.coords.latitude, preciseLocation.coords.longitude, currentLocations);
                        locationFound = true;
                    }
                } catch (preciseErr) {
                    // Will continue with watch position
                }
            }

            // If all initial attempts failed, keep the error message
            if (!locationFound) {
                setError('GPS signal weak. Still searching...');
            }

            // Subscribe to continuous updates for real-time tracking
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    distanceInterval: 10,
                    timeInterval: 5000, // Update at least every 5 seconds
                },
                (location) => {
                    checkGeofence(location.coords.latitude, location.coords.longitude, currentLocations);
                }
            );
        } catch (err: any) {
            const errorMessage = err.message || 'Location unavailable';
            setError(errorMessage);
            console.error('Location tracking error:', err);
        }
    }, [checkGeofence]);

    useEffect(() => {
        if (enabled) {
            fetchLocations();
        }
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }
        };
    }, [enabled]);

    useEffect(() => {
        if (locations.length > 0 && enabled) {
            startLocationTracking(locations);
        }
    }, [locations, enabled, startLocationTracking]);

    return {
        isInside,
        nearestPlace,
        currentLocation,
        locations,
        refreshLocations: fetchLocations,
        loading,
        error,
        retryLocation: () => locations.length > 0 && startLocationTracking(locations)
    };
};
