import * as offlineStorage from '../../services/offlineStorage';
import * as attendanceService from '../../services/attendanceService';
import {
  syncPendingActions,
  hasPendingActions,
  getSyncStatus,
} from '../../services/syncService';
import { OfflineClockAction, OFFLINE_CONFIG } from '../../types/offline';
import { ClockPayload } from '../../services/attendanceService';

// Mock dependencies
jest.mock('../../services/offlineStorage');
jest.mock('../../services/attendanceService');

const mockedOfflineStorage = offlineStorage as jest.Mocked<typeof offlineStorage>;
const mockedAttendanceService = attendanceService as jest.Mocked<typeof attendanceService>;

describe('syncService', () => {
  const mockPayload: ClockPayload = {
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

  const createMockAction = (
    id: string,
    type: 'clock-in' | 'clock-out',
    retryCount = 0,
    createdAt = '2024-03-15T08:00:00.000Z'
  ): OfflineClockAction => ({
    id,
    type,
    payload: mockPayload,
    createdAt,
    retryCount,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('syncPendingActions', () => {
    it('returns zeros when no actions to sync', async () => {
      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([]);

      const result = await syncPendingActions();

      expect(result).toEqual({ synced: 0, failed: 0, remaining: 0 });
    });

    it('syncs clock-in action successfully', async () => {
      const mockAction = createMockAction('action-1', 'clock-in');

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([mockAction]);
      mockedAttendanceService.clockIn.mockResolvedValue(undefined);
      mockedOfflineStorage.removeAction.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(0);

      const result = await syncPendingActions();

      expect(mockedAttendanceService.clockIn).toHaveBeenCalledWith(mockPayload);
      expect(mockedOfflineStorage.removeAction).toHaveBeenCalledWith('action-1');
      expect(result).toEqual({ synced: 1, failed: 0, remaining: 0 });
    });

    it('syncs clock-out action successfully', async () => {
      const mockAction = createMockAction('action-1', 'clock-out');

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([mockAction]);
      mockedAttendanceService.clockOut.mockResolvedValue(undefined);
      mockedOfflineStorage.removeAction.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(0);

      const result = await syncPendingActions();

      expect(mockedAttendanceService.clockOut).toHaveBeenCalledWith(mockPayload);
      expect(mockedOfflineStorage.removeAction).toHaveBeenCalledWith('action-1');
      expect(result).toEqual({ synced: 1, failed: 0, remaining: 0 });
    });

    it('handles sync failure and increments retry count', async () => {
      const mockAction = createMockAction('action-1', 'clock-in', 0);

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([mockAction]);
      mockedAttendanceService.clockIn.mockRejectedValue(new Error('Network error'));
      mockedOfflineStorage.updateActionRetry.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(1);

      const syncPromise = syncPendingActions();
      await jest.runAllTimersAsync();
      const result = await syncPromise;

      expect(mockedOfflineStorage.updateActionRetry).toHaveBeenCalledWith('action-1', 'Network error');
      expect(result).toEqual({ synced: 0, failed: 0, remaining: 1 });
    });

    it('marks action as failed when max retries exceeded', async () => {
      const mockAction = createMockAction('action-1', 'clock-in', OFFLINE_CONFIG.MAX_RETRY_COUNT - 1);

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([mockAction]);
      mockedAttendanceService.clockIn.mockRejectedValue(new Error('Server error'));
      mockedOfflineStorage.updateActionRetry.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(1);

      const syncPromise = syncPendingActions();
      await jest.runAllTimersAsync();
      const result = await syncPromise;

      expect(result.failed).toBe(1);
    });

    it('skips actions that have exceeded max retries', async () => {
      const failedAction = createMockAction('failed', 'clock-in', OFFLINE_CONFIG.MAX_RETRY_COUNT);
      const pendingAction = createMockAction('pending', 'clock-out', 0);

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([failedAction, pendingAction]);
      mockedAttendanceService.clockOut.mockResolvedValue(undefined);
      mockedOfflineStorage.removeAction.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(0);

      const result = await syncPendingActions();

      expect(mockedAttendanceService.clockIn).not.toHaveBeenCalled();
      expect(mockedAttendanceService.clockOut).toHaveBeenCalled();
      expect(result).toEqual({ synced: 1, failed: 1, remaining: 0 });
    });

    it('processes actions in chronological order', async () => {
      const olderAction = createMockAction('older', 'clock-in', 0, '2024-03-15T07:00:00.000Z');
      const newerAction = createMockAction('newer', 'clock-out', 0, '2024-03-15T08:00:00.000Z');

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      // Return in wrong order to test sorting
      mockedOfflineStorage.getPendingActions.mockResolvedValue([newerAction, olderAction]);
      mockedAttendanceService.clockIn.mockResolvedValue(undefined);
      mockedAttendanceService.clockOut.mockResolvedValue(undefined);
      mockedOfflineStorage.removeAction.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(0);

      await syncPendingActions();

      // Should process clock-in (older) before clock-out (newer)
      const clockInCallOrder = mockedAttendanceService.clockIn.mock.invocationCallOrder[0];
      const clockOutCallOrder = mockedAttendanceService.clockOut.mock.invocationCallOrder[0];

      expect(clockInCallOrder).toBeLessThan(clockOutCallOrder);
    });

    it('cleans up expired actions before syncing', async () => {
      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(2);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([]);

      await syncPendingActions();

      expect(mockedOfflineStorage.cleanupExpiredActions).toHaveBeenCalled();
    });

    it('saves last sync attempt timestamp', async () => {
      const mockAction = createMockAction('action-1', 'clock-in');

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([mockAction]);
      mockedAttendanceService.clockIn.mockResolvedValue(undefined);
      mockedOfflineStorage.removeAction.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(0);

      await syncPendingActions();

      expect(mockedOfflineStorage.saveLastSyncAttempt).toHaveBeenCalled();
    });

    it('handles API response errors correctly', async () => {
      const mockAction = createMockAction('action-1', 'clock-in');

      mockedOfflineStorage.cleanupExpiredActions.mockResolvedValue(0);
      mockedOfflineStorage.getPendingActions.mockResolvedValue([mockAction]);
      mockedAttendanceService.clockIn.mockRejectedValue({
        response: { data: { message: 'Already clocked in' } },
      });
      mockedOfflineStorage.updateActionRetry.mockResolvedValue(undefined);
      mockedOfflineStorage.saveLastSyncAttempt.mockResolvedValue(undefined);
      mockedOfflineStorage.getPendingCount.mockResolvedValue(1);

      const syncPromise = syncPendingActions();
      await jest.runAllTimersAsync();
      await syncPromise;

      expect(mockedOfflineStorage.updateActionRetry).toHaveBeenCalledWith(
        'action-1',
        'Already clocked in'
      );
    });
  });

  describe('hasPendingActions', () => {
    it('returns true when there are pending actions', async () => {
      mockedOfflineStorage.getPendingCount.mockResolvedValue(3);

      const result = await hasPendingActions();

      expect(result).toBe(true);
    });

    it('returns false when no pending actions', async () => {
      mockedOfflineStorage.getPendingCount.mockResolvedValue(0);

      const result = await hasPendingActions();

      expect(result).toBe(false);
    });
  });

  describe('getSyncStatus', () => {
    it('returns complete sync status', async () => {
      const mockActions = [
        createMockAction('action-1', 'clock-in', 0),
        createMockAction('action-2', 'clock-out', OFFLINE_CONFIG.MAX_RETRY_COUNT),
      ];

      mockedOfflineStorage.getPendingActions.mockResolvedValue(mockActions);
      mockedOfflineStorage.getFailedActions.mockResolvedValue([mockActions[1]]);
      mockedOfflineStorage.getLastSyncAttempt.mockResolvedValue('2024-03-15T07:00:00.000Z');

      const result = await getSyncStatus();

      expect(result).toEqual({
        pendingCount: 2,
        failedCount: 1,
        lastSyncAttempt: '2024-03-15T07:00:00.000Z',
      });
    });

    it('handles no last sync attempt', async () => {
      mockedOfflineStorage.getPendingActions.mockResolvedValue([]);
      mockedOfflineStorage.getFailedActions.mockResolvedValue([]);
      mockedOfflineStorage.getLastSyncAttempt.mockResolvedValue(null);

      const result = await getSyncStatus();

      expect(result.lastSyncAttempt).toBeNull();
    });
  });
});
