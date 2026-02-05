import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Attendance, AttendanceStatus, Shift } from '@/types/attendance';
import * as attendanceService from '@/services/attendanceService';
import { TranslationKeys } from '@/constants/translations';

interface UseAttendanceOptions {
  enabled?: boolean;
  onAuthError?: (err: any) => void;
}

interface UseAttendanceReturn {
  status: AttendanceStatus | null;
  history: Attendance[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  initiateClockAction: (type: 'clock-in' | 'clock-out') => void;
  handleClockAction: () => Promise<void>;
  pendingAction: 'clock-in' | 'clock-out' | null;
  setPendingAction: (action: 'clock-in' | 'clock-out' | null) => void;
  isWithinShift: () => boolean;
  getLateMinutes: () => number;
}

/**
 * Custom hook for attendance management
 * Handles status, history, clock in/out actions, and shift validation
 */
export const useAttendance = (
  options: UseAttendanceOptions = {}
): UseAttendanceReturn => {
  const { enabled = true, onAuthError } = options;

  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingAction, setPendingAction] = useState<'clock-in' | 'clock-out' | null>(null);

  const handleError = useCallback((err: any) => {
    console.error('Attendance error:', err);
    if (onAuthError) {
      onAuthError(err);
    }
  }, [onAuthError]);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await attendanceService.getAttendanceStatus();
      setStatus(data);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await attendanceService.getAttendanceHistory({ per_page: 5 });
      setHistory(data);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchHistory()]);
    setRefreshing(false);
  }, [fetchStatus, fetchHistory]);

  useEffect(() => {
    if (enabled) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchStatus(), fetchHistory()]);
        setLoading(false);
      };
      loadData();
    }
  }, [enabled, fetchStatus, fetchHistory]);

  /**
   * Check if current time is within shift hours
   */
  const isWithinShift = useCallback(() => {
    if (!status?.shift) return true; // If no shift, allow clock in/out

    const now = new Date();
    const [startHour, startMin] = status.shift.start_time.split(':').map(Number);
    const [endHour, endMin] = status.shift.end_time.split(':').map(Number);

    const shiftStart = new Date(now);
    shiftStart.setHours(startHour, startMin, 0, 0);

    const shiftEnd = new Date(now);
    shiftEnd.setHours(endHour, endMin, 0, 0);

    return now >= shiftStart && now <= shiftEnd;
  }, [status?.shift]);

  /**
   * Calculate late minutes based on clock in time and shift start
   */
  const getLateMinutes = useCallback(() => {
    if (!status?.shift || !status?.today_attendance?.clock_in) return 0;

    const [startHour, startMin] = status.shift.start_time.split(':').map(Number);
    const [clockHour, clockMin] = status.today_attendance.clock_in.split(':').map(Number);

    const shiftStartMinutes = startHour * 60 + startMin;
    const clockInMinutes = clockHour * 60 + clockMin;
    const lateMinutes = clockInMinutes - shiftStartMinutes - status.shift.late_after_minutes;

    return lateMinutes > 0 ? lateMinutes : 0;
  }, [status?.shift, status?.today_attendance?.clock_in]);

  /**
   * Initiate a clock action with haptic feedback
   */
  const initiateClockAction = useCallback((type: 'clock-in' | 'clock-out') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingAction(type);
  }, []);

  /**
   * Execute the pending clock action
   */
  const handleClockAction = useCallback(async () => {
    if (!pendingAction) return;

    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to mark attendance');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const payload = attendanceService.buildClockPayload(pendingAction, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      if (pendingAction === 'clock-in') {
        await attendanceService.clockIn(payload);
      } else {
        await attendanceService.clockOut(payload);
      }

      setPendingAction(null);
      await refresh();
      return; // Success - caller should show success alert
    } catch (err: any) {
      throw err; // Re-throw for caller to handle
    }
  }, [pendingAction, refresh]);

  return {
    status,
    history,
    loading,
    refreshing,
    refresh,
    initiateClockAction,
    handleClockAction,
    pendingAction,
    setPendingAction,
    isWithinShift,
    getLateMinutes,
  };
};
