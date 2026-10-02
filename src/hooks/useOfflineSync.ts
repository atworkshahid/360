import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService, SyncState, SyncQueueItem } from '../services/offlineSyncService';
import { Course } from '../types';

export interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: Date | null;
  lastError: string | null;
  swActive: boolean;
  queue: SyncQueueItem[];
  syncNow: () => Promise<{ syncedCount: number; errors: number }>;
  saveCourseOffline: (course: Course) => Promise<{ success: boolean; queued: boolean }>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [state, setState] = useState<SyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null,
    lastError: null,
    swActive: false,
    queue: [],
  });

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribeSyncState((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const syncNow = useCallback(async () => {
    return await offlineSyncService.syncPendingToFirebase();
  }, []);

  const saveCourseOffline = useCallback(async (course: Course) => {
    return await offlineSyncService.saveCourseBlueprintOffline(course);
  }, []);

  return {
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingCount: state.pendingCount,
    lastSyncedAt: state.lastSyncedAt,
    lastError: state.lastError,
    swActive: state.swActive,
    queue: state.queue,
    syncNow,
    saveCourseOffline,
  };
}
