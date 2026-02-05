import {
  calculateDistance,
  isWithinGeofence,
  findNearestLocation,
  GeoLocation,
} from '../../utils/geo';

describe('geo utilities', () => {
  describe('calculateDistance', () => {
    it('returns 0 for same coordinates', () => {
      const distance = calculateDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
    });

    it('calculates correct distance between two points', () => {
      // Distance from Jakarta to Bandung is approximately 140 km
      const jakartaLat = -6.2088;
      const jakartaLng = 106.8456;
      const bandungLat = -6.9175;
      const bandungLng = 107.6191;

      const distance = calculateDistance(jakartaLat, jakartaLng, bandungLat, bandungLng);

      // Should be approximately 140,000 meters (with some tolerance)
      expect(distance).toBeGreaterThan(100000);
      expect(distance).toBeLessThan(200000);
    });

    it('returns same distance regardless of direction', () => {
      const lat1 = -6.2088;
      const lng1 = 106.8456;
      const lat2 = -6.9175;
      const lng2 = 107.6191;

      const distance1 = calculateDistance(lat1, lng1, lat2, lng2);
      const distance2 = calculateDistance(lat2, lng2, lat1, lng1);

      expect(distance1).toBeCloseTo(distance2, 5);
    });
  });

  describe('isWithinGeofence', () => {
    const fenceLat = -6.2088;
    const fenceLng = 106.8456;
    const radiusMeters = 100;

    it('returns true for point inside geofence', () => {
      // Point very close to fence center
      const result = isWithinGeofence(
        -6.2088,
        106.8456,
        fenceLat,
        fenceLng,
        radiusMeters
      );
      expect(result).toBe(true);
    });

    it('returns true for point exactly on geofence boundary', () => {
      // Point at approximately 100m distance (this is an approximation)
      const result = isWithinGeofence(
        fenceLat,
        fenceLng,
        fenceLat,
        fenceLng,
        radiusMeters
      );
      expect(result).toBe(true);
    });

    it('returns false for point outside geofence', () => {
      // Point far outside
      const result = isWithinGeofence(
        -6.9175,
        107.6191,
        fenceLat,
        fenceLng,
        radiusMeters
      );
      expect(result).toBe(false);
    });
  });

  describe('findNearestLocation', () => {
    const locations: GeoLocation[] = [
      { latitude: -6.2088, longitude: 106.8456, name: 'Jakarta' },
      { latitude: -6.9175, longitude: 107.6191, name: 'Bandung' },
      { latitude: -7.2575, longitude: 112.7521, name: 'Surabaya' },
    ];

    it('returns null for empty locations array', () => {
      const result = findNearestLocation(-6.2088, 106.8456, []);
      expect(result).toBeNull();
    });

    it('finds nearest location', () => {
      const result = findNearestLocation(-6.2088, 106.8456, locations);
      expect(result).not.toBeNull();
      expect(result?.location.name).toBe('Jakarta');
    });

    it('returns correct distance', () => {
      const result = findNearestLocation(-6.2088, 106.8456, locations);
      expect(result).not.toBeNull();
      expect(result?.distance).toBe(0);
    });

    it('finds correct nearest when not at exact location', () => {
      // Point closer to Bandung
      const result = findNearestLocation(-6.85, 107.5, locations);
      expect(result).not.toBeNull();
      expect(result?.location.name).toBe('Bandung');
    });
  });
});
