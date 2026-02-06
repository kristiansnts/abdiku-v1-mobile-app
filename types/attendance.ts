export interface Attendance {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    is_late?: boolean;
    late_minutes?: number;
}

export interface Shift {
    id: number;
    name: string;
    start_time: string;  // HH:MM format
    end_time: string;    // HH:MM format
    late_after_minutes: number;
}

export interface Holiday {
    id: number;
    name: string;
    date: string;
    is_paid: boolean;
}

export interface AttendanceStatus {
    can_clock_in: boolean;
    can_clock_out: boolean;
    has_clocked_in: boolean;
    has_clocked_out: boolean;
    today_attendance: Attendance | null;
    shift: Shift | null;
    message: string;
    is_holiday?: boolean;
    holiday?: Holiday | null;
}

export interface CompanyLocation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    geofence_radius_meters: number;
}

export type RequestType = 'LATE' | 'CORRECTION' | 'MISSING';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CorrectionRequest {
    id: number;
    request_type: RequestType;
    attendance_raw_id: number | null;
    date: string | null;
    requested_clock_in_at: string | null;
    requested_clock_out_at: string | null;
    reason: string;
    status: RequestStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    reviewer_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCorrectionRequest {
    request_type: RequestType;
    attendance_raw_id?: number;
    date?: string;
    requested_clock_in_at?: string;
    requested_clock_out_at?: string;
    reason: string;
}
