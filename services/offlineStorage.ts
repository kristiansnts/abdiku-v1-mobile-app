import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OfflineClockAction,
  OFFLINE_STORAGE_KEYS,
  OFFLINE_CONFIG,
} from '@/types/offline';
import { ClockPayload } from './attendanceService';

/**
 * Generate a unique ID for offline actions
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all pending offline actions from storage
 */
export const getPendingActions = async (): Promise<OfflineClockAction[]> => {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_STORAGE_KEYS.QUEUE);
    if (!data) return [];
    return JSON.parse(data) as OfflineClockAction[];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

/**
 * Save a new offline action to the queue
 */
export const saveOfflineAction = async (
  type: 'clock-in' | 'clock-out',
  payload: ClockPayload
): Promise<OfflineClockAction> => {
  const action: OfflineClockAction = {
    id: generateId(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  const existingActions = await getPendingActions();
  const updatedActions = [...existingActions, action];

  await AsyncStorage.setItem(
    OFFLINE_STORAGE_KEYS.QUEUE,
    JSON.stringify(updatedActions)
  );

  return action;
};

/**
 * Remove a synced action from the queue
 */
export const removeAction = async (actionId: string): Promise<void> => {
  const actions = await getPendingActions();
  const filteredActions = actions.filter((a) => a.id !== actionId);

  await AsyncStorage.setItem(
    OFFLINE_STORAGE_KEYS.QUEUE,
    JSON.stringify(filteredActions)
  );
};

/**
 * Update an action's retry count and error
 */
export const updateActionRetry = async (
  actionId: string,
  error?: string
): Promise<void> => {
  const actions = await getPendingActions();
  const updatedActions = actions.map((a) => {
    if (a.id === actionId) {
      return {
        ...a,
        retryCount: a.retryCount + 1,
        lastError: error,
      };
    }
    return a;
  });

  await AsyncStorage.setItem(
    OFFLINE_STORAGE_KEYS.QUEUE,
    JSON.stringify(updatedActions)
  );
};

/**
 * Clean up expired actions (older than retention period)
 */
export const cleanupExpiredActions = async (): Promise<number> => {
  const actions = await getPendingActions();
  const now = new Date();
  const retentionMs = OFFLINE_CONFIG.DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const validActions = actions.filter((action) => {
    const actionDate = new Date(action.createdAt);
    return now.getTime() - actionDate.getTime() < retentionMs;
  });

  const removedCount = actions.length - validActions.length;

  if (removedCount > 0) {
    await AsyncStorage.setItem(
      OFFLINE_STORAGE_KEYS.QUEUE,
      JSON.stringify(validActions)
    );
  }

  return removedCount;
};

/**
 * Get actions that have exceeded max retry count
 */
export const getFailedActions = async (): Promise<OfflineClockAction[]> => {
  const actions = await getPendingActions();
  return actions.filter((a) => a.retryCount >= OFFLINE_CONFIG.MAX_RETRY_COUNT);
};

/**
 * Get count of pending actions
 */
export const getPendingCount = async (): Promise<number> => {
  const actions = await getPendingActions();
  return actions.length;
};

/**
 * Clear all offline actions (for testing or reset)
 */
export const clearAllActions = async (): Promise<void> => {
  await AsyncStorage.removeItem(OFFLINE_STORAGE_KEYS.QUEUE);
};

/**
 * Save last sync attempt timestamp
 */
export const saveLastSyncAttempt = async (): Promise<void> => {
  await AsyncStorage.setItem(
    OFFLINE_STORAGE_KEYS.LAST_SYNC,
    new Date().toISOString()
  );
};

/**
 * Get last sync attempt timestamp
 */
export const getLastSyncAttempt = async (): Promise<string | null> => {
  return AsyncStorage.getItem(OFFLINE_STORAGE_KEYS.LAST_SYNC);
};
