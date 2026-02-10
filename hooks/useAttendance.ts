import { useToast } from '@/context/ToastContext';
import * as attendanceService from '@/services/attendanceService';
import * as offlineStorage from '@/services/offlineStorage';
import { Attendance, AttendanceStatus } from '@/types/attendance';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

interface UseAttendanceOptions {
  enabled?: boolean;
  onAuthError?: (err: any) => void;
  isConnected?: boolean;
  onOfflineAction?: () => void;
}

interface UseAttendanceReturn {
  status: AttendanceStatus | null;
  history: Attendance[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  initiateClockAction: (type: 'clock-in' | 'clock-out') => void;
  handleClockAction: () => Promise<{ offline: boolean }>;
  pendingAction: 'clock-in' | 'clock-out' | null;
  setPendingAction: (action: 'clock-in' | 'clock-out' | null) => void;
  isWithinShift: () => boolean;
  getLateMinutes: () => number;
  getLiveLateMinutes: (now: Date) => number;
  hasPendingOfflineActions: boolean;
}

/**
 * Custom hook for attendance management
 * Handles status, history, clock in/out actions, and shift validation
 * Supports offline mode with automatic queueing
 */
export const useAttendance = (
  options: UseAttendanceOptions = {}
): UseAttendanceReturn => {
  const { enabled = true, onAuthError, isConnected = true, onOfflineAction } = options;
  const { showToast } = useToast();

  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingAction, setPendingAction] = useState<'clock-in' | 'clock-out' | null>(null);
  const [hasPendingOfflineActions, setHasPendingOfflineActions] = useState(false);

  const handleError = useCallback((err: any) => {
    console.error('Attendance error:', err);
    if (onAuthError) {
      onAuthError(err);
    }
  }, [onAuthError]);

  const checkPendingOfflineActions = useCallback(async () => {
    const count = await offlineStorage.getPendingCount();
    setHasPendingOfflineActions(count > 0);
  }, []);

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
    await Promise.all([fetchStatus(), fetchHistory(), checkPendingOfflineActions()]);
    setRefreshing(false);
  }, [fetchStatus, fetchHistory, checkPendingOfflineActions]);

  useEffect(() => {
    if (enabled) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchStatus(), fetchHistory(), checkPendingOfflineActions()]);
        setLoading(false);
      };
      loadData();
    }
  }, [enabled, fetchStatus, fetchHistory, checkPendingOfflineActions]);

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
   * Calculate late minutes based on current time if not clocked in yet
   */
  const getLiveLateMinutes = useCallback((now: Date) => {
    if (!status?.shift || status?.today_attendance?.clock_in) return 0;

    const [startHour, startMin] = status.shift.start_time.split(':').map(Number);
    const shiftStart = new Date(now);
    shiftStart.setHours(startHour, startMin, 0, 0);

    const diffMs = now.getTime() - shiftStart.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const lateMinutes = diffMin - status.shift.late_after_minutes;

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
   * Supports offline mode - saves to queue when offline
   */
  const handleClockAction = useCallback(async (): Promise<{ offline: boolean }> => {
    if (!pendingAction) return { offline: false };

    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        showToast('Location permission is required to mark attendance', 'error');
        return { offline: false };
      }

      const location = await Location.getCurrentPositionAsync({});
      const payload = attendanceService.buildClockPayload(pendingAction, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      // Check if we're online
      if (!isConnected) {
        // Save to offline queue
        await offlineStorage.saveOfflineAction(pendingAction, payload);
        setHasPendingOfflineActions(true);
        setPendingAction(null);

        // Notify caller about offline action
        if (onOfflineAction) {
          onOfflineAction();
        }

        return { offline: true };
      }

      // Online - proceed with API call
      if (pendingAction === 'clock-in') {
        await attendanceService.clockIn(payload);
      } else {
        await attendanceService.clockOut(payload);
      }

      setPendingAction(null);
      await refresh();
      return { offline: false };
    } catch (err: any) {
      // If network error, save to offline queue
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('Network Error') || !isConnected) {
        try {
          const location = await Location.getCurrentPositionAsync({});
          const payload = attendanceService.buildClockPayload(pendingAction, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          });

          await offlineStorage.saveOfflineAction(pendingAction, payload);
          setHasPendingOfflineActions(true);
          setPendingAction(null);

          if (onOfflineAction) {
            onOfflineAction();
          }

          return { offline: true };
        } catch {
          throw err;
        }
      }
      throw err;
    }
  }, [pendingAction, isConnected, refresh, onOfflineAction]);

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
    getLiveLateMinutes,
    hasPendingOfflineActions,
  };
};
