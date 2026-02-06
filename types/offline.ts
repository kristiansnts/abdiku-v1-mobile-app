import { ClockPayload } from '@/services/attendanceService';

/**
 * Offline clock action stored in the queue
 */
export interface OfflineClockAction {
  id: string;
  type: 'clock-in' | 'clock-out';
  payload: ClockPayload;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

/**
 * Network status information
 */
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Sync result for a single action
 */
export interface SyncResult {
  actionId: string;
  success: boolean;
  error?: string;
}

/**
 * Overall sync status
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAttempt: string | null;
  pendingCount: number;
}

/**
 * Storage keys for offline data
 */
export const OFFLINE_STORAGE_KEYS = {
  QUEUE: 'offline_queue',
  LAST_SYNC: 'last_sync_attempt',
} as const;

/**
 * Configuration for offline behavior
 */
export const OFFLINE_CONFIG = {
  MAX_RETRY_COUNT: 5,
  DATA_RETENTION_DAYS: 7,
  RETRY_DELAY_MS: 1000,
} as const;
