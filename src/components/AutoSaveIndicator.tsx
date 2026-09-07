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
} from 'lucide-react';
import { AutoSaveStatus } from '../hooks/useAutosave';
import { formatRelativeTime, formatExactTimestamp } from '../utils/timeFormat';

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

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        id={`${idPrefix}-indicator-btn`}
        onClick={() => setShowPopover(!showPopover)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer select-none whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          status === 'saving'
            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700'
            : status === 'unsaved'
            ? 'bg-amber-50/80 border-amber-200 text-amber-800'
            : status === 'error'
            ? 'bg-rose-50/80 border-rose-200 text-rose-700'
            : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800 hover:bg-emerald-50'
        }`}
        title={`Auto-save status: ${status}. Click for details.`}
        aria-label={`Auto-save status: ${status}`}
        aria-expanded={showPopover}
      >
        {status === 'saving' ? (
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
            <span className="font-semibold">Auto-saved</span>
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
          className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-slate-200 shadow-xl p-3.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Browser Auto-Save</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                status === 'saved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'saving'
                  ? 'bg-indigo-100 text-indigo-800'
                  : status === 'unsaved'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <span className="text-slate-500">Last Synced:</span>
              <span className="font-semibold text-slate-800 text-right">
                {formattedExact}
                <span className="block text-[10px] font-normal text-slate-400">
                  {relativeTime}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Persistence:</span>
              <span className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                localStorage
              </span>
            </div>

            {errorMessage && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[11px] mt-1">
                {errorMessage}
              </div>
            )}

            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed border-t border-slate-100">
              Changes to learning outcomes, taxonomy levels, modules, activities, and assessments
              are automatically debounced and persisted to browser storage with timestamps.
            </p>

            {onSaveNow && (
              <div className="pt-2">
                <button
                  id={`${idPrefix}-save-now-btn`}
                  onClick={() => {
                    onSaveNow();
                  }}
                  disabled={status === 'saving'}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {status === 'saving' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Storage...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Now (Flush to Disk)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {onOpenSnapshots && (
              <div className="pt-1.5">
                <button
                  type="button"
                  id={`${idPrefix}-view-snapshots-btn`}
                  onClick={() => {
                    setShowPopover(false);
                    onOpenSnapshots();
                  }}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Snapshots & History</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
