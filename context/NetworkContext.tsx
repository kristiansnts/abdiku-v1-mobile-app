import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as syncService from '@/services/syncService';
import { NetworkStatus } from '@/types/offline';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isSyncing: boolean;
  pendingCount: number;
  triggerSync: () => Promise<void>;
  refreshPendingCount: () => Promise<number>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const wasConnected = useRef<boolean | null>(null);
  const syncingRef = useRef(false);
  const initialSyncDone = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const status = await syncService.getSyncStatus();
    setPendingCount(status.pendingCount);
    return status.pendingCount;
  }, []);

  const performSync = useCallback(async () => {
    if (syncingRef.current) return;

    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await syncService.syncPendingActions();
      setPendingCount(result.remaining);

      if (result.synced > 0) {
        console.log(`Synced ${result.synced} offline actions`);
      }
      if (result.failed > 0) {
        console.warn(`${result.failed} actions failed to sync`);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!networkStatus.isConnected) return;
    await performSync();
  }, [networkStatus.isConnected, performSync]);

  // Subscribe to network changes and sync on app start
  useEffect(() => {
    const handleNetworkChange = (state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;

      setNetworkStatus({ isConnected, isInternetReachable });
    };

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // Initial check and sync
    const initializeNetwork = async () => {
      const state = await NetInfo.fetch();
      handleNetworkChange(state);

      // Check for pending actions
      const pending = await refreshPendingCount();

      // If connected and has pending actions, sync immediately on app start
      if (state.isConnected && pending > 0 && !initialSyncDone.current) {
        console.log('App started with pending actions, syncing...');
        initialSyncDone.current = true;
        performSync();
      }
    };

    initializeNetwork();

    return () => {
      unsubscribe();
    };
  }, [refreshPendingCount, performSync]);

  // Trigger sync when connection is restored (after initial load)
  useEffect(() => {
    const currentlyConnected = networkStatus.isConnected;
    const previouslyConnected = wasConnected.current;

    // Trigger sync when transitioning from offline to online
    if (currentlyConnected && previouslyConnected === false) {
      console.log('Network restored, triggering sync...');
      performSync();
    }

    wasConnected.current = currentlyConnected;
  }, [networkStatus.isConnected, performSync]);

  const value: NetworkContextType = {
    isConnected: networkStatus.isConnected,
    isInternetReachable: networkStatus.isInternetReachable,
    isSyncing,
    pendingCount,
    triggerSync,
    refreshPendingCount,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
