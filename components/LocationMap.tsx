import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    locations?: Array<{
        latitude: number;
        longitude: number;
        name: string;
        geofence_radius_meters?: number;
    }>;
}

const LocationMap = ({ latitude, longitude, locations = [] }: LocationMapProps) => {
    // Calculate appropriate zoom level based on geofence radius
    const maxRadius = locations.reduce((max, loc) =>
        Math.max(max, loc.geofence_radius_meters || 0), 0
    );

    // Calculate map center and zoom to show both user location and all company locations
    let centerLat = latitude;
    let centerLng = longitude;
    let calculatedDelta = 0.01;

    if (locations.length > 0) {
        // Include user location in bounds calculation
        const allLats = [latitude, ...locations.map(l => l.latitude)];
        const allLngs = [longitude, ...locations.map(l => l.longitude)];

        const minLat = Math.min(...allLats);
        const maxLat = Math.max(...allLats);
        const minLng = Math.min(...allLngs);
        const maxLng = Math.max(...allLngs);

        // Center between all points
        centerLat = (minLat + maxLat) / 2;
        centerLng = (minLng + maxLng) / 2;

        // Calculate delta to show all points plus padding for circles
        const latDelta = (maxLat - minLat) * 1.5; // 1.5x padding
        const lngDelta = (maxLng - minLng) * 1.5;

        // Add extra padding for the geofence radius
        const radiusDelta = maxRadius > 0 ? (maxRadius * 2.5) / 111000 : 0;

        calculatedDelta = Math.max(latDelta, lngDelta, radiusDelta, 0.003);
    }

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                    latitude: centerLat,
                    longitude: centerLng,
                    latitudeDelta: calculatedDelta,
                    longitudeDelta: calculatedDelta,
                }}
            >
                {/* Geofence circles - render first so they're behind markers */}
                {locations.map((loc, index) => {
                    if (!loc.geofence_radius_meters) {
                        return null;
                    }

                    return (
                        <Circle
                            key={`circle-${index}`}
                            center={{ latitude: loc.latitude, longitude: loc.longitude }}
                            radius={loc.geofence_radius_meters}
                            fillColor="rgba(59, 130, 246, 0.3)"
                            strokeColor="#3b82f6"
                            strokeWidth={4}
                        />
                    );
                })}

                {/* Company location markers */}
                {locations.map((loc, index) => (
                    <Marker
                        key={`marker-${index}`}
                        coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                        title={loc.name}
                        description={loc.geofence_radius_meters ? `Radius: ${loc.geofence_radius_meters}m` : undefined}
                        pinColor="red"
                    />
                ))}

                {/* Your current location marker - render last so it's on top */}
                <Marker
                    coordinate={{ latitude, longitude }}
                    title="Your Location"
                    pinColor="blue"
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 350,
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default LocationMap;
