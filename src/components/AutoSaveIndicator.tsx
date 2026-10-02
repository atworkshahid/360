import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Clock,
  AlertTriangle,
  HardDrive,
  Check,
  ChevronDown,
  History,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Database,
  ArrowRight,
} from 'lucide-react';
import { AutoSaveStatus } from '../hooks/useAutosave';
import { formatRelativeTime, formatExactTimestamp } from '../utils/timeFormat';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  errorMessage?: string | null;
  onSaveNow?: () => void;
  onOpenSnapshots?: () => void;
  compact?: boolean;
  className?: string;
  idPrefix?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved,
  errorMessage,
  onSaveNow,
  onOpenSnapshots,
  compact = false,
  className = '',
  idPrefix = 'autosave',
}) => {
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [relativeTime, setRelativeTime] = useState<string>('just now');
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const {
    isOnline,
    isSyncing: isFirebaseSyncing,
    pendingCount: firebasePendingCount,
    lastSyncedAt: firebaseLastSynced,
    syncNow: forceFirebaseSync,
    swActive,
  } = useOfflineSync();

  // Auto-refresh relative time every 5 seconds
  useEffect(() => {
    const updateRelative = () => {
      setRelativeTime(formatRelativeTime(lastSaved));
    };

    updateRelative();
    const interval = setInterval(updateRelative, 5000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  // Dismiss popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  const formattedExact = formatExactTimestamp(lastSaved);
  const formattedFirebaseSync = formatExactTimestamp(firebaseLastSynced);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        id={`${idPrefix}-indicator-btn`}
        onClick={() => setShowPopover(!showPopover)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer select-none whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          !isOnline
            ? 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100/90'
            : isFirebaseSyncing
            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700'
            : status === 'saving'
            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700'
            : status === 'unsaved'
            ? 'bg-amber-50/80 border-amber-200 text-amber-800'
            : status === 'error'
            ? 'bg-rose-50/80 border-rose-200 text-rose-700'
            : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800 hover:bg-emerald-50'
        }`}
        title={`Auto-save & Cloud Sync status. Click for offline storage and Firebase details.`}
        aria-label={`Storage status: ${isOnline ? 'Online' : 'Offline'}, ${status}`}
        aria-expanded={showPopover}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
            <span className="font-semibold text-amber-900">Offline</span>
            {!compact && (
              <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1 py-0.2 rounded font-bold hidden sm:inline">
                Saved locally{firebasePendingCount > 0 ? ` • ${firebasePendingCount} queued` : ''}
              </span>
            )}
          </>
        ) : isFirebaseSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
            <span>Syncing to Firebase...</span>
          </>
        ) : status === 'saving' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
            <span>Saving...</span>
          </>
        ) : status === 'unsaved' ? (
          <>
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Unsaved</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Save error</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold">Saved</span>
            {!compact && (
              <span className="text-[11px] text-emerald-700/80 hidden sm:inline">
                {relativeTime}
              </span>
            )}
          </>
        )}
        <ChevronDown className="w-3 h-3 opacity-50 shrink-0 ml-0.5" />
      </button>

      {/* Popover Details Menu */}
      {showPopover && (
        <div
          id={`${idPrefix}-popover`}
          className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-slate-200 shadow-xl p-3.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Blueprint Storage &amp; Sync</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                !isOnline
                  ? 'bg-amber-100 text-amber-900'
                  : status === 'saved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'saving' || isFirebaseSyncing
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {!isOnline ? 'Offline Mode' : status}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Live Connectivity */}
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                )}
                <span className="font-semibold text-slate-800">
                  {isOnline ? 'Online (Connected)' : 'Disconnected (Offline)'}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500">
                {isOnline ? 'Auto-sync active' : 'Offline queueing'}
              </span>
            </div>

            {/* Offline Storage Engine */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                Local Storage:
              </span>
              <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-semibold">
                IndexedDB + ServiceWorker
              </span>
            </div>

            {/* Firebase Firestore Cloud Sync */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-sky-500" />
                Firebase Cloud Sync:
              </span>
              <div className="text-right">
                {isFirebaseSyncing ? (
                  <span className="text-indigo-600 font-semibold flex items-center gap-1 justify-end">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Syncing...
                  </span>
                ) : firebasePendingCount > 0 ? (
                  <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded text-[10px]">
                    {firebasePendingCount} pending sync
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Synced with Firestore
                  </span>
                )}
                {firebaseLastSynced && (
                  <span className="block text-[10px] font-normal text-slate-400">
                    {formatRelativeTime(firebaseLastSynced)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500">Local Auto-save:</span>
              <span className="font-semibold text-slate-800 text-right">
                {formattedExact}
                <span className="block text-[10px] font-normal text-slate-400">
                  {relativeTime}
                </span>
              </span>
            </div>

            {errorMessage && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[11px] mt-1">
                {errorMessage}
              </div>
            )}

            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed border-t border-slate-100">
              When disconnected, course blueprints continue saving directly to IndexedDB.
              Changes are queued and automatically pushed to Firebase once your connection is restored.
            </p>

            {/* Action buttons */}
            <div className="pt-2 space-y-1.5">
              {isOnline && (
                <button
                  type="button"
                  id={`${idPrefix}-sync-firebase-now-btn`}
                  onClick={() => forceFirebaseSync()}
                  disabled={isFirebaseSyncing}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
                  <span>{isFirebaseSyncing ? 'Syncing to Firebase...' : 'Force Sync to Firebase Cloud'}</span>
                </button>
              )}

              {onSaveNow && (
                <button
                  type="button"
                  id={`${idPrefix}-save-now-btn`}
                  onClick={() => onSaveNow()}
                  disabled={status === 'saving'}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Flush Local Storage Now</span>
                </button>
              )}

              {onOpenSnapshots && (
                <button
                  type="button"
                  id={`${idPrefix}-view-snapshots-btn`}
                  onClick={() => {
                    setShowPopover(false);
                    onOpenSnapshots();
                  }}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Version History Snapshots</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
