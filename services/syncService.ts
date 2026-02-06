import { OfflineClockAction, SyncResult, OFFLINE_CONFIG } from '@/types/offline';
import * as offlineStorage from './offlineStorage';
import * as attendanceService from './attendanceService';

/**
 * Attempt to sync a single offline action
 */
const syncAction = async (action: OfflineClockAction): Promise<SyncResult> => {
  try {
    if (action.type === 'clock-in') {
      await attendanceService.clockIn(action.payload);
    } else {
      await attendanceService.clockOut(action.payload);
    }

    return { actionId: action.id, success: true };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
    return { actionId: action.id, success: false, error: errorMessage };
  }
};

/**
 * Process all pending offline actions
 * Returns true if any actions were successfully synced
 */
export const syncPendingActions = async (): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> => {
  // Clean up expired actions first
  await offlineStorage.cleanupExpiredActions();

  const actions = await offlineStorage.getPendingActions();

  if (actions.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  // Sort by creation time (oldest first)
  const sortedActions = [...actions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let synced = 0;
  let failed = 0;

  // Process actions sequentially
  for (const action of sortedActions) {
    // Skip actions that have exceeded max retries
    if (action.retryCount >= OFFLINE_CONFIG.MAX_RETRY_COUNT) {
      failed++;
      continue;
    }

    const result = await syncAction(action);

    if (result.success) {
      await offlineStorage.removeAction(action.id);
      synced++;
    } else {
      await offlineStorage.updateActionRetry(action.id, result.error);

      // Check if this was the last retry
      if (action.retryCount + 1 >= OFFLINE_CONFIG.MAX_RETRY_COUNT) {
        failed++;
      }

      // Add delay between failed attempts
      await new Promise((resolve) =>
        setTimeout(resolve, OFFLINE_CONFIG.RETRY_DELAY_MS)
      );
    }
  }

  // Save last sync attempt
  await offlineStorage.saveLastSyncAttempt();

  const remaining = await offlineStorage.getPendingCount();

  return { synced, failed, remaining };
};

/**
 * Check if there are any pending actions to sync
 */
export const hasPendingActions = async (): Promise<boolean> => {
  const count = await offlineStorage.getPendingCount();
  return count > 0;
};

/**
 * Get sync status summary
 */
export const getSyncStatus = async (): Promise<{
  pendingCount: number;
  failedCount: number;
  lastSyncAttempt: string | null;
}> => {
  const actions = await offlineStorage.getPendingActions();
  const failedActions = await offlineStorage.getFailedActions();
  const lastSync = await offlineStorage.getLastSyncAttempt();

  return {
    pendingCount: actions.length,
    failedCount: failedActions.length,
    lastSyncAttempt: lastSync,
  };
};
