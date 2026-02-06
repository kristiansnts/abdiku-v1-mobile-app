# Offline Mode Implementation Plan

## Problem Statement
Implement offline mode for clock in/out functionality in the Abdiku mobile app. When the user is offline, the app should store attendance data locally and automatically sync it when the internet connection is restored.

## Requirements
- **Scope**: Clock in/out only
- **Sync behavior**: Silent background sync (no user notification)
- **Data retention**: Keep offline data for 7 days
- **User feedback**: Show 'pending sync' status until confirmed by server

## Proposed Approach
Use `@react-native-community/netinfo` to detect network status and AsyncStorage for offline data persistence. Create a sync service that runs automatically when connectivity is restored.

---

## Workplan

### Phase 1: Dependencies & Infrastructure
- [x] Install `@react-native-community/netinfo` for network detection
- [x] Create `types/offline.ts` - define types for offline queue and network status

### Phase 2: Core Offline Services
- [x] Create `services/offlineStorage.ts` - handle AsyncStorage operations for offline queue
  - Store pending clock actions with timestamp
  - Retrieve pending actions
  - Remove synced actions
  - Clean up expired actions (>7 days)
- [x] Create `services/syncService.ts` - handle background sync logic
  - Check for pending actions
  - Attempt to sync with server
  - Handle success/failure

### Phase 3: Network Context
- [x] Create `context/NetworkContext.tsx` - global network status provider
  - Monitor network connectivity
  - Trigger sync when coming online
  - Expose `isConnected` status to components

### Phase 4: Hook Integration
- [x] Modify `hooks/useAttendance.ts` to support offline mode
  - Check network status before API calls
  - Save to offline queue when offline
  - Return 'pending' status for offline actions
  - Integrate with sync service

### Phase 5: UI Updates
- [x] Update attendance components to show 'pending sync' indicator
- [x] Add pending status to attendance status display

### Phase 6: Testing & Cleanup
- [x] Create tests for offline storage service
- [x] Create tests for sync service
- [ ] Test end-to-end offline flow manually

---

## Technical Notes

### Offline Queue Structure
```typescript
interface OfflineClockAction {
  id: string;                    // UUID for tracking
  type: 'clock-in' | 'clock-out';
  payload: ClockPayload;         // Same structure as online
  createdAt: string;             // ISO timestamp
  retryCount: number;            // Track failed attempts
}
```

### Storage Keys
- `offline_queue` - Array of pending clock actions
- `last_sync_attempt` - Timestamp of last sync attempt

### Sync Strategy
1. Listen to network status changes via NetInfo
2. When coming online, fetch pending actions from storage
3. Process actions sequentially (oldest first)
4. On success: remove from queue, refresh attendance status
5. On failure: increment retry count, log error, try next

### Edge Cases
- Multiple clock-ins while offline → process in order
- App closed while items pending → resume on next app open
- Server rejects action → keep in queue with error flag for manual review
