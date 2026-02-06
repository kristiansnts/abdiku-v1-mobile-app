import api from './api';
import {
  Activity,
  ActivityFilter,
  AttendanceDetail,
  HomeData,
  RequestDetail,
} from '@/types/activity';

/**
 * Get aggregated home screen data
 * Includes today's attendance, latest activities, and latest payslip
 */
export const getHomeData = async (): Promise<HomeData> => {
  const response = await api.get('/home');
  return response.data.data;
};

/**
 * Get activity feed with optional filters
 * @param filter - Optional filter parameters
 */
export const getActivities = async (filter?: ActivityFilter): Promise<Activity[]> => {
  const params: Record<string, string | number> = {};

  if (filter?.month) {
    params.month = filter.month;
  }
  if (filter?.limit) {
    params.limit = filter.limit;
  }

  const response = await api.get('/activities', { params });
  return response.data.data;
};

/**
 * Get recent activities for home screen
 * @param limit - Number of activities to fetch (default: 5)
 */
export const getRecentActivities = async (limit = 5): Promise<Activity[]> => {
  return getActivities({ month: '', limit });
};

/**
 * Get activities for a specific month
 * @param year - Year (e.g., 2026)
 * @param month - Month (1-12)
 */
export const getActivitiesByMonth = async (year: number, month: number): Promise<Activity[]> => {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  return getActivities({ month: monthStr });
};

/**
 * Get attendance detail by ID
 * @param id - Attendance record ID
 */
export const getAttendanceDetail = async (id: number): Promise<AttendanceDetail> => {
  const response = await api.get(`/attendance/${id}`);
  return response.data.data;
};

/**
 * Get request detail by ID
 * @param id - Request ID
 */
export const getRequestDetail = async (id: number): Promise<RequestDetail> => {
  const response = await api.get(`/attendance/requests/${id}`);
  return response.data.data;
};
