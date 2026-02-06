import { Shift } from './attendance';

// Activity types from API (uppercase)
export type ActivityType =
  | 'CLOCK_IN'
  | 'CLOCK_OUT'
  | 'LATE'
  | 'LEAVE_REQUEST'
  | 'CORRECTION'
  | 'MISSING';

// Status from API (uppercase)
export type ActivityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LOCKED';

// Activity item from /home and /activities endpoints
export interface Activity {
  id: number;
  type: ActivityType;
  datetime: string;  // ISO 8601 datetime
  status: ActivityStatus;
  label: string;  // Human-readable label (localized by backend)
  is_late?: boolean;  // Whether the activity is late
  late_minutes?: number;  // Minutes late (only present when is_late is true)
  late_label?: string;  // Localized late label (e.g., "Terlambat 37 menit")
}

// Home endpoint response
export interface HomeData {
  today_attendance: {
    status: string;
    clock_in: string | null;
    clock_out: string | null;
    shift: string | null;
  } | null;
  can_clock_in: boolean;
  can_clock_out: boolean;
  latest_activity: Activity[];
  latest_payslip: {
    id: number;
    period: string;
    net_amount: number;
  } | null;
}

// Evidence types from attendance detail
// API may return either 'data' or 'payload' field
export interface GeolocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  within_geofence?: boolean;
}

export interface DeviceData {
  device_id: string;
  model: string;
  os: string;
  app_version: string;
}

export interface BaseEvidence {
  id: number;
  type_label?: string;
  captured_at?: string;
  action?: 'CLOCK_IN' | 'CLOCK_OUT';  // Action associated with this evidence
}

export interface GeolocationEvidence extends BaseEvidence {
  type: 'GEOLOCATION';
  data?: GeolocationData;
  payload?: GeolocationData;
}

export interface DeviceEvidence extends BaseEvidence {
  type: 'DEVICE';
  data?: DeviceData;
  payload?: DeviceData;
}

export type Evidence = GeolocationEvidence | DeviceEvidence;

// Helper to get evidence data (handles both 'data' and 'payload')
export const getEvidenceData = <T>(evidence: { data?: T; payload?: T }): T | undefined => {
  return evidence.data || evidence.payload;
};

// Location from attendance detail
export interface AttendanceLocation {
  id: number;
  name: string;
  address: string;
}

// Related request in attendance detail
export interface RelatedRequest {
  id: number;
  request_type: 'LATE' | 'CORRECTION' | 'MISSING';
  status: ActivityStatus;
  status_label?: string;
  reason: string;
}

// Full attendance detail from GET /attendance/{id}
export interface AttendanceDetail {
  id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  source: string;
  status: ActivityStatus;
  status_label: string;
  is_late?: boolean;
  late_minutes?: number;
  late_label?: string;
  shift: Shift | null;
  evidences: Evidence[];
  location: AttendanceLocation | null;
  requests: RelatedRequest[];
}

// Request detail from GET /attendance/requests/{id}
export interface RequestDetail {
  id: number;
  request_type: 'LATE' | 'CORRECTION' | 'MISSING';
  request_type_label: string;
  requested_clock_in_at: string | null;
  requested_clock_out_at: string | null;
  reason: string;
  status: ActivityStatus;
  status_label: string;
  requested_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  reviewer: {
    id: number;
    name: string;
  } | null;
  attendance: {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: ActivityStatus;
    evidences?: Evidence[];
  } | null;
}

// Filter options for history page
export type ActivityFilterType = 'all' | 'attendance' | 'requests' | ActivityType;

export interface ActivityFilter {
  month: string;  // Format: YYYY-MM
  type?: ActivityFilterType;
  limit?: number;
}

// Grouped activities by date for history page
export interface ActivityGroup {
  date: string;  // ISO date string (YYYY-MM-DD)
  label: string;  // "Today", "Yesterday", "Monday, 3 Feb 2026"
  activities: Activity[];
}

// Utility function to get activity icon name
export const getActivityIcon = (type: ActivityType): string => {
  switch (type) {
    case 'CLOCK_IN':
      return 'log-in-outline';
    case 'CLOCK_OUT':
      return 'log-out-outline';
    case 'LATE':
      return 'time-outline';
    case 'LEAVE_REQUEST':
      return 'calendar-outline';
    case 'CORRECTION':
      return 'create-outline';
    case 'MISSING':
      return 'help-circle-outline';
    default:
      return 'ellipse-outline';
  }
};

// Utility function to get status color
export const getStatusColor = (status: ActivityStatus): string => {
  switch (status) {
    case 'APPROVED':
      return '#10b981';  // green
    case 'PENDING':
      return '#f59e0b';  // yellow/amber
    case 'REJECTED':
      return '#ef4444';  // red
    case 'LOCKED':
      return '#6b7280';  // gray
    default:
      return '#6b7280';
  }
};

// Check if activity is attendance-related
export const isAttendanceActivity = (type: ActivityType): boolean => {
  return type === 'CLOCK_IN' || type === 'CLOCK_OUT';
};
