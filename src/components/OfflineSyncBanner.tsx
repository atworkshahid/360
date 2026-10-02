import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  X,
  AlertCircle,
  HardDrive,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

export const OfflineSyncBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, lastError, syncNow, queue } = useOfflineSync();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'offline' | 'back-online' | 'synced'>('offline');
  const [wasOffline, setWasOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setNotificationType('offline');
      setShowNotification(true);
      setDismissed(false);
    } else if (wasOffline) {
      // Transition from offline to online
      setNotificationType('back-online');
      setShowNotification(true);
      setDismissed(false);

      // Auto dismiss 6 seconds after sync completes
      const timer = setTimeout(() => {
        setNotificationType('synced');
        setTimeout(() => {
          setShowNotification(false);
          setWasOffline(false);
        }, 3500);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (dismissed && isOnline) return null;
  if (!showNotification && isOnline && pendingCount === 0) return null;

  return (
    <div
      id="offline-sync-status-bar"
      role="region"
      aria-label="Offline and Cloud Sync Status"
      className={`transition-all duration-300 ${
        !isOnline
          ? 'bg-amber-500 text-slate-950 border-b border-amber-600'
          : isSyncing
          ? 'bg-indigo-600 text-white border-b border-indigo-700'
          : pendingCount > 0
          ? 'bg-amber-600 text-white border-b border-amber-700'
          : 'bg-emerald-600 text-white border-b border-emerald-700'
      } px-4 py-2 text-xs font-medium shadow-sm relative z-40`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          {!isOnline ? (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-950/20 text-slate-950">
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            </div>
          ) : isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : pendingCount > 0 ? (
            <CloudOff className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-white" />
          )}

          <div>
            {!isOnline ? (
              <span className="font-bold">
                Offline Mode Active — Continue designing your course blueprint. Changes are saved locally and will auto-sync to Firebase when connected.
              </span>
            ) : isSyncing ? (
              <span>
                <strong>Syncing to Firebase Cloud...</strong> Synchronizing {pendingCount} blueprint update{pendingCount === 1 ? '' : 's'} to Firestore.
              </span>
            ) : pendingCount > 0 ? (
              <span>
                <strong>Back Online:</strong> {pendingCount} local blueprint change{pendingCount === 1 ? '' : 's'} ready to sync with Firebase.
              </span>
            ) : (
              <span>
                <strong>Firebase Cloud Synced:</strong> All course blueprint changes are safely committed to Firestore.
              </span>
            )}

            {pendingCount > 0 && !isOnline && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.2 rounded bg-amber-950/20 text-slate-950 text-[10px] font-bold">
                {pendingCount} queued
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isOnline && pendingCount > 0 && (
            <button
              type="button"
              id="offline-sync-now-btn"
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-[11px] shadow-2xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}

          <button
            type="button"
            id="dismiss-offline-banner-btn"
            onClick={() => {
              setDismissed(true);
              setShowNotification(false);
            }}
            className="p-1 rounded hover:bg-black/10 transition cursor-pointer opacity-80 hover:opacity-100"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
