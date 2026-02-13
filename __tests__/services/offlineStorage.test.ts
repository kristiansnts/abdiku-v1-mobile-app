import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPendingActions,
  saveOfflineAction,
  removeAction,
  updateActionRetry,
  cleanupExpiredActions,
  getFailedActions,
  getPendingCount,
  clearAllActions,
  saveLastSyncAttempt,
  getLastSyncAttempt,
} from '../../services/offlineStorage';
import { ClockPayload } from '../../services/attendanceService';
import { OFFLINE_STORAGE_KEYS, OFFLINE_CONFIG } from '../../types/offline';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('offlineStorage', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-15T08:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getPendingActions', () => {
    it('returns empty array when no actions stored', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getPendingActions();

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(OFFLINE_STORAGE_KEYS.QUEUE);
      expect(result).toEqual([]);
    });

    it('returns parsed actions from storage', async () => {
      const storedActions = [
        {
          id: 'test-id',
          type: 'clock-in',
          payload: mockPayload,
          createdAt: '2024-03-15T08:00:00.000Z',
          retryCount: 0,
        },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedActions));

      const result = await getPendingActions();

      expect(result).toEqual(storedActions);
    });

    it('returns empty array on parse error', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await getPendingActions();

      expect(result).toEqual([]);
    });
  });

  describe('saveOfflineAction', () => {
    it('saves a new action to empty queue', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await saveOfflineAction('clock-in', mockPayload);

      expect(result.type).toBe('clock-in');
      expect(result.payload).toEqual(mockPayload);
      expect(result.retryCount).toBe(0);
      expect(result.createdAt).toBe('2024-03-15T08:00:00.000Z');
      expect(result.id).toBeDefined();

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        OFFLINE_STORAGE_KEYS.QUEUE,
        expect.any(String)
      );
    });

    it('appends action to existing queue', async () => {
      const existingActions = [
        {
          id: 'existing-id',
          type: 'clock-in' as const,
          payload: mockPayload,
          createdAt: '2024-03-15T07:00:00.000Z',
          retryCount: 0,
        },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await saveOfflineAction('clock-out', mockPayload);

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const savedActions = JSON.parse(setItemCall[1]);

      expect(savedActions).toHaveLength(2);
      expect(savedActions[0].id).toBe('existing-id');
      expect(savedActions[1].type).toBe('clock-out');
    });
  });

  describe('removeAction', () => {
    it('removes action by id', async () => {
      const existingActions = [
        { id: 'action-1', type: 'clock-in', payload: mockPayload, createdAt: '2024-03-15T08:00:00.000Z', retryCount: 0 },
        { id: 'action-2', type: 'clock-out', payload: mockPayload, createdAt: '2024-03-15T17:00:00.000Z', retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await removeAction('action-1');

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const savedActions = JSON.parse(setItemCall[1]);

      expect(savedActions).toHaveLength(1);
      expect(savedActions[0].id).toBe('action-2');
    });

    it('handles removing non-existent action', async () => {
      const existingActions = [
        { id: 'action-1', type: 'clock-in', payload: mockPayload, createdAt: '2024-03-15T08:00:00.000Z', retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await removeAction('non-existent');

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const savedActions = JSON.parse(setItemCall[1]);

      expect(savedActions).toHaveLength(1);
    });
  });

  describe('updateActionRetry', () => {
    it('increments retry count', async () => {
      const existingActions = [
        { id: 'action-1', type: 'clock-in', payload: mockPayload, createdAt: '2024-03-15T08:00:00.000Z', retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await updateActionRetry('action-1', 'Network error');

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const savedActions = JSON.parse(setItemCall[1]);

      expect(savedActions[0].retryCount).toBe(1);
      expect(savedActions[0].lastError).toBe('Network error');
    });

    it('does not modify other actions', async () => {
      const existingActions = [
        { id: 'action-1', type: 'clock-in', payload: mockPayload, createdAt: '2024-03-15T08:00:00.000Z', retryCount: 2 },
        { id: 'action-2', type: 'clock-out', payload: mockPayload, createdAt: '2024-03-15T17:00:00.000Z', retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await updateActionRetry('action-1');

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const savedActions = JSON.parse(setItemCall[1]);

      expect(savedActions[0].retryCount).toBe(3);
      expect(savedActions[1].retryCount).toBe(0);
    });
  });

  describe('cleanupExpiredActions', () => {
    it('removes actions older than retention period', async () => {
      const oldDate = new Date('2024-03-01T08:00:00.000Z').toISOString();
      const newDate = new Date('2024-03-15T08:00:00.000Z').toISOString();

      const existingActions = [
        { id: 'old-action', type: 'clock-in', payload: mockPayload, createdAt: oldDate, retryCount: 0 },
        { id: 'new-action', type: 'clock-out', payload: mockPayload, createdAt: newDate, retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      const removedCount = await cleanupExpiredActions();

      expect(removedCount).toBe(1);

      const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
      const savedActions = JSON.parse(setItemCall[1]);

      expect(savedActions).toHaveLength(1);
      expect(savedActions[0].id).toBe('new-action');
    });

    it('returns 0 when no expired actions', async () => {
      const recentDate = new Date('2024-03-15T07:00:00.000Z').toISOString();

      const existingActions = [
        { id: 'recent-action', type: 'clock-in', payload: mockPayload, createdAt: recentDate, retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));

      const removedCount = await cleanupExpiredActions();

      expect(removedCount).toBe(0);
      expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getFailedActions', () => {
    it('returns actions that exceeded max retry count', async () => {
      const existingActions = [
        { id: 'failed', type: 'clock-in', payload: mockPayload, createdAt: '2024-03-15T08:00:00.000Z', retryCount: OFFLINE_CONFIG.MAX_RETRY_COUNT },
        { id: 'pending', type: 'clock-out', payload: mockPayload, createdAt: '2024-03-15T17:00:00.000Z', retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));

      const result = await getFailedActions();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('failed');
    });

    it('returns empty array when no failed actions', async () => {
      const existingActions = [
        { id: 'pending', type: 'clock-in', payload: mockPayload, createdAt: '2024-03-15T08:00:00.000Z', retryCount: 1 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));

      const result = await getFailedActions();

      expect(result).toEqual([]);
    });
  });

  describe('getPendingCount', () => {
    it('returns count of pending actions', async () => {
      const existingActions = [
        { id: 'action-1', type: 'clock-in', payload: mockPayload, createdAt: '2024-03-15T08:00:00.000Z', retryCount: 0 },
        { id: 'action-2', type: 'clock-out', payload: mockPayload, createdAt: '2024-03-15T17:00:00.000Z', retryCount: 0 },
      ];
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingActions));

      const count = await getPendingCount();

      expect(count).toBe(2);
    });

    it('returns 0 when no actions', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const count = await getPendingCount();

      expect(count).toBe(0);
    });
  });

  describe('clearAllActions', () => {
    it('removes all actions from storage', async () => {
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined);

      await clearAllActions();

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(OFFLINE_STORAGE_KEYS.QUEUE);
    });
  });

  describe('saveLastSyncAttempt', () => {
    it('saves current timestamp', async () => {
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await saveLastSyncAttempt();

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        OFFLINE_STORAGE_KEYS.LAST_SYNC,
        '2024-03-15T08:00:00.000Z'
      );
    });
  });

  describe('getLastSyncAttempt', () => {
    it('returns stored timestamp', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('2024-03-15T07:00:00.000Z');

      const result = await getLastSyncAttempt();

      expect(result).toBe('2024-03-15T07:00:00.000Z');
    });

    it('returns null when no timestamp stored', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getLastSyncAttempt();

      expect(result).toBeNull();
    });
  });
});
