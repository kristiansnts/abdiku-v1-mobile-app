/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Check if a point is within a geofence
 */
export const isWithinGeofence = (
  lat: number,
  lng: number,
  fenceLat: number,
  fenceLng: number,
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(lat, lng, fenceLat, fenceLng);
  return distance <= radiusMeters;
};

/**
 * Find the nearest location from a list of locations
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  name?: string;
  geofence_radius_meters?: number;
}

export const findNearestLocation = <T extends GeoLocation>(
  lat: number,
  lng: number,
  locations: T[]
): { location: T; distance: number } | null => {
  if (locations.length === 0) return null;

  let nearest: T = locations[0];
  let minDistance = calculateDistance(lat, lng, nearest.latitude, nearest.longitude);

  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(lat, lng, locations[i].latitude, locations[i].longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = locations[i];
    }
  }

  return { location: nearest, distance: minDistance };
};
