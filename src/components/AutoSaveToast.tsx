import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

export interface AutoSaveToastProps {
  visible: boolean;
  lastSaved?: Date | null;
  onDismiss: () => void;
  courseTitle?: string;
  message?: string;
  subMessage?: string;
}

/**
 * Subtle 'Saved' toast notification providing users with immediate,
 * non-intrusive visual confirmation that their course data is safely persisted.
 */
export const AutoSaveToast: React.FC<AutoSaveToastProps> = ({
  visible,
  lastSaved,
  onDismiss,
  courseTitle,
  message = 'Saved',
  subMessage = 'Work securely stored',
}) => {
  const [shouldRender, setShouldRender] = useState<boolean>(visible);

  // Keep element in DOM while exit animation plays
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <aside
      id="autosave-toast-notification"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 pointer-events-auto transition-all duration-300 ease-out transform ${
        visible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-3 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-800/90 shadow-xl shadow-slate-950/25 rounded-xl px-3.5 py-2.5 flex items-center space-x-3 text-xs font-medium">
        {/* Subtle Check Icon with gentle glow */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* Content Info */}
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-white tracking-tight">{message}</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-normal">
              {subMessage}
            </span>
          </div>

          {courseTitle && (
            <span className="text-[10px] text-slate-400 font-normal truncate max-w-[200px] mt-0.5">
              {courseTitle}
            </span>
          )}
        </div>

        {/* Manual Dismiss Button */}
        <button
          type="button"
          id="autosave-toast-dismiss-btn"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer shrink-0 ml-1"
          aria-label="Dismiss saved notification"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
