import api from '../../services/api';
import {
    AttendanceHistoryParams,
    buildClockPayload,
    clockIn,
    clockOut,
    ClockPayload,
    getAttendanceHistory,
    getAttendanceStatus,
    getLocations,
} from '../../services/attendanceService';
import { Attendance, AttendanceStatus, CompanyLocation } from '../../types/attendance';

// Mock the api module
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('attendanceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAttendanceStatus', () => {
        it('fetches attendance status successfully', async () => {
            const mockStatus: AttendanceStatus = {
                can_clock_in: true,
                can_clock_out: false,
                has_clocked_in: false,
                has_clocked_out: false,
                today_attendance: null,
                shift: {
                    id: 1,
                    name: 'Morning Shift',
                    start_time: '08:00',
                    end_time: '17:00',
                    late_after_minutes: 15,
                },
                message: 'You can clock in now',
            };

            mockedApi.get.mockResolvedValue({
                data: { data: mockStatus },
            });

            const result = await getAttendanceStatus();

            expect(mockedApi.get).toHaveBeenCalledWith('/attendance/status');
            expect(result).toEqual(mockStatus);
        });

        it('handles API errors', async () => {
            const error = new Error('Network error');
            mockedApi.get.mockRejectedValue(error);

            await expect(getAttendanceStatus()).rejects.toThrow('Network error');
        });
    });

    describe('getAttendanceHistory', () => {
        const mockHistory: Attendance[] = [
            {
                id: 1,
                date: '2024-03-15',
                clock_in: '08:00:00',
                clock_out: '17:00:00',
                status: 'approved',
                is_late: false,
                late_minutes: 0,
            },
            {
                id: 2,
                date: '2024-03-14',
                clock_in: '08:15:00',
                clock_out: '17:05:00',
                status: 'approved',
                is_late: true,
                late_minutes: 15,
            },
        ];

        it('fetches attendance history with default params', async () => {
            mockedApi.get.mockResolvedValue({
                data: { data: mockHistory },
            });

            const result = await getAttendanceHistory();

            expect(mockedApi.get).toHaveBeenCalledWith('/attendance/history', {
                params: { per_page: 5 },
            });
            expect(result).toEqual(mockHistory);
        });

        it('fetches attendance history with custom params', async () => {
            const params: AttendanceHistoryParams = {
                per_page: 10,
                page: 2,
            };

            mockedApi.get.mockResolvedValue({
                data: { data: mockHistory },
            });

            const result = await getAttendanceHistory(params);

            expect(mockedApi.get).toHaveBeenCalledWith('/attendance/history', {
                params,
            });
            expect(result).toEqual(mockHistory);
        });

        it('handles empty history', async () => {
            mockedApi.get.mockResolvedValue({
                data: { data: [] },
            });

            const result = await getAttendanceHistory();

            expect(result).toEqual([]);
        });

        it('handles API errors', async () => {
            const error = new Error('Unauthorized');
            mockedApi.get.mockRejectedValue(error);

            await expect(getAttendanceHistory()).rejects.toThrow('Unauthorized');
        });
    });

    describe('clockIn', () => {
        it('sends clock in request successfully', async () => {
            const payload: ClockPayload = {
                clock_in_at: '2024-03-15T08:00:00.000Z',
                evidence: {
                    geolocation: {
                        lat: -6.2088,
                        lng: 106.8456,
                        accuracy: 10, is_mocked: false,
                    },
                    device: {
                        device_id: 'test-device',
                        model: 'iPhone 14',
                        os: 'iOS 17',
                        app_version: '1.0.0',
                    },
                },
            };

            mockedApi.post.mockResolvedValue({ data: {} });

            await clockIn(payload);

            expect(mockedApi.post).toHaveBeenCalledWith('/attendance/clock-in', payload);
        });

        it('handles clock in errors', async () => {
            const payload: ClockPayload = {
                clock_in_at: '2024-03-15T08:00:00.000Z',
                evidence: {
                    geolocation: {
                        lat: -6.2088,
                        lng: 106.8456,
                        accuracy: 10, is_mocked: false,
                    },
                    device: {
                        device_id: 'test-device',
                        model: 'iPhone',
                        os: 'ios',
                        app_version: '1.0.0',
                    },
                },
            };

            const error = new Error('Already clocked in');
            mockedApi.post.mockRejectedValue(error);

            await expect(clockIn(payload)).rejects.toThrow('Already clocked in');
        });
    });

    describe('clockOut', () => {
        it('sends clock out request successfully', async () => {
            const payload: ClockPayload = {
                clock_out_at: '2024-03-15T17:00:00.000Z',
                evidence: {
                    geolocation: {
                        lat: -6.2088,
                        lng: 106.8456,
                        accuracy: 15, is_mocked: false,
                    },
                    device: {
                        device_id: 'test-device',
                        model: 'iPhone 14',
                        os: 'iOS 17',
                        app_version: '1.0.0',
                    },
                },
            };

            mockedApi.post.mockResolvedValue({ data: {} });

            await clockOut(payload);

            expect(mockedApi.post).toHaveBeenCalledWith('/attendance/clock-out', payload);
        });

        it('handles clock out errors', async () => {
            const payload: ClockPayload = {
                clock_out_at: '2024-03-15T17:00:00.000Z',
                evidence: {
                    geolocation: {
                        lat: -6.2088,
                        lng: 106.8456,
                        accuracy: 10, is_mocked: false,
                    },
                    device: {
                        device_id: 'test-device',
                        model: 'iPhone',
                        os: 'ios',
                        app_version: '1.0.0',
                    },
                },
            };

            const error = new Error('Not clocked in yet');
            mockedApi.post.mockRejectedValue(error);

            await expect(clockOut(payload)).rejects.toThrow('Not clocked in yet');
        });
    });

    describe('getLocations', () => {
        it('fetches company locations successfully', async () => {
            const mockLocations: CompanyLocation[] = [
                {
                    id: 1,
                    name: 'Main Office',
                    latitude: -6.2088,
                    longitude: 106.8456,
                    geofence_radius_meters: 100,
                },
                {
                    id: 2,
                    name: 'Branch Office',
                    latitude: -6.9175,
                    longitude: 107.6191,
                    geofence_radius_meters: 150,
                },
            ];

            mockedApi.get.mockResolvedValue({
                data: { data: mockLocations },
            });

            const result = await getLocations();

            expect(mockedApi.get).toHaveBeenCalledWith('/company/locations');
            expect(result).toEqual(mockLocations);
        });

        it('handles empty locations', async () => {
            mockedApi.get.mockResolvedValue({
                data: { data: [] },
            });

            const result = await getLocations();

            expect(result).toEqual([]);
        });

        it('handles API errors', async () => {
            const error = new Error('Server error');
            mockedApi.get.mockRejectedValue(error);

            await expect(getLocations()).rejects.toThrow('Server error');
        });
    });

    describe('buildClockPayload', () => {
        beforeEach(() => {
            // Mock Date to return a fixed timestamp
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-03-15T08:00:00.000Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('builds clock-in payload correctly', () => {
            const coords = {
                latitude: -6.2088,
                longitude: 106.8456,
                accuracy: 10, is_mocked: false,
            };

            const payload = buildClockPayload('clock-in', coords);

            expect(payload).toEqual({
                clock_in_at: '2024-03-15T08:00:00.000Z',
                evidence: {
                    geolocation: {
                        lat: -6.2088,
                        lng: 106.8456,
                        accuracy: 10, is_mocked: false,
                    },
                    device: {
                        device_id: 'mobile-device',
                        model: 'iPhone',
                        os: 'ios',
                        app_version: '1.0.0',
                    },
                },
            });
        });

        it('builds clock-out payload correctly', () => {
            const coords = {
                latitude: -6.2088,
                longitude: 106.8456,
                accuracy: 15, is_mocked: false,
            };

            const payload = buildClockPayload('clock-out', coords);

            expect(payload).toEqual({
                clock_out_at: '2024-03-15T08:00:00.000Z',
                evidence: {
                    geolocation: {
                        lat: -6.2088,
                        lng: 106.8456,
                        accuracy: 15, is_mocked: false,
                    },
                    device: {
                        device_id: 'mobile-device',
                        model: 'iPhone',
                        os: 'ios',
                        app_version: '1.0.0',
                    },
                },
            });
        });

        it('handles null accuracy', () => {
            const coords = {
                latitude: -6.2088,
                longitude: 106.8456,
                accuracy: , is_mocked: falsenull,
            };

            const payload = buildClockPayload('clock-in', coords);

            expect(payload.evidence.geolocation.accuracy).toBeNull();
        });

        it('uses current timestamp', () => {
            const coords = {
                latitude: -6.2088,
                longitude: 106.8456,
                accuracy: 10, is_mocked: false,
            };

            const payload = buildClockPayload('clock-in', coords);

            expect(payload.clock_in_at).toBe('2024-03-15T08:00:00.000Z');
        });

        it('preserves coordinate precision', () => {
            const coords = {
                latitude: -6.208812345,
                longitude: 106.845678901,
                accuracy: 5, is_mocked: false.5,
            };

            const payload = buildClockPayload('clock-in', coords);

            expect(payload.evidence.geolocation.lat).toBe(-6.208812345);
            expect(payload.evidence.geolocation.lng).toBe(106.845678901);
            expect(payload.evidence.geolocation.accuracy).toBe(5.5);
        });
    });
});
