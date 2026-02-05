import api from './api';
import { Attendance, AttendanceStatus, CompanyLocation } from '@/types/attendance';

export interface ClockPayload {
  clock_in_at?: string;
  clock_out_at?: string;
  evidence: {
    geolocation: {
      lat: number;
      lng: number;
      accuracy: number | null;
    };
    device: {
      device_id: string;
      model: string;
      os: string;
      app_version: string;
    };
  };
}

export interface AttendanceHistoryParams {
  per_page?: number;
  page?: number;
}

/**
 * Get current attendance status
 */
export const getAttendanceStatus = async (): Promise<AttendanceStatus> => {
  const res = await api.get('/attendance/status');
  return res.data.data;
};

/**
 * Get attendance history
 */
export const getAttendanceHistory = async (
  params: AttendanceHistoryParams = { per_page: 5 }
): Promise<Attendance[]> => {
  const res = await api.get('/attendance/history', { params });
  return res.data.data;
};

/**
 * Clock in
 */
export const clockIn = async (payload: ClockPayload): Promise<void> => {
  await api.post('/attendance/clock-in', payload);
};

/**
 * Clock out
 */
export const clockOut = async (payload: ClockPayload): Promise<void> => {
  await api.post('/attendance/clock-out', payload);
};

/**
 * Get company locations for geofencing
 */
export const getLocations = async (): Promise<CompanyLocation[]> => {
  const res = await api.get('/company/locations');
  return res.data.data;
};

/**
 * Build clock payload from location data
 */
export const buildClockPayload = (
  actionType: 'clock-in' | 'clock-out',
  coords: { latitude: number; longitude: number; accuracy: number | null }
): ClockPayload => {
  return {
    [`${actionType.replace('-', '_')}_at`]: new Date().toISOString(),
    evidence: {
      geolocation: {
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy,
      },
      device: {
        device_id: 'mobile-device',
        model: 'iPhone',
        os: 'ios',
        app_version: '1.0.0',
      },
    },
  };
};
