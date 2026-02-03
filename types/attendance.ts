export interface Attendance {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
}

export interface AttendanceStatus {
    can_clock_in: boolean;
    can_clock_out: boolean;
    has_clocked_in: boolean;
    has_clocked_out: boolean;
    today_attendance: Attendance | null;
    message: string;
}

export interface CompanyLocation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    geofence_radius_meters: number;
}
