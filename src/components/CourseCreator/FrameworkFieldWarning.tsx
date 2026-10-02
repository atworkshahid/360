import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import {
  FrameworkDeviationWarning,
  FrameworkContentValidationReport,
} from '../../services/courseService';

export interface FrameworkFieldWarningProps {
  field: string;
  report?: FrameworkContentValidationReport | null;
  warnings?: FrameworkDeviationWarning[];
  onApplyFix?: (warning: FrameworkDeviationWarning) => void;
  className?: string;
  compact?: boolean;
}

export const FrameworkFieldWarning: React.FC<FrameworkFieldWarningProps> = ({
  field,
  report,
  warnings: explicitWarnings,
  onApplyFix,
  className = '',
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  // Extract matching warnings for this specific input field
  const fieldWarnings: FrameworkDeviationWarning[] = explicitWarnings || (report?.byField?.[field] ?? []);

  if (!fieldWarnings || fieldWarnings.length === 0) {
    return null;
  }

  const primaryWarning = fieldWarnings[0];
  const isError = fieldWarnings.some((w) => w.severity === 'error');
  const isWarning = fieldWarnings.some((w) => w.severity === 'warning');

  const containerStyles = isError
    ? 'border-rose-200 bg-rose-50/80 text-rose-900'
    : isWarning
    ? 'border-amber-200 bg-amber-50/80 text-amber-900'
    : 'border-blue-200 bg-blue-50/80 text-blue-900';

  const badgeStyles = isError
    ? 'bg-rose-100 text-rose-700 border-rose-300'
    : isWarning
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-blue-100 text-blue-700 border-blue-300';

  const handleApply = (warning: FrameworkDeviationWarning, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApplyFix) {
      onApplyFix(warning);
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  const handleOpenGuidebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open_framework_guidebook_modal', {
        detail: { frameworkId: report?.frameworkId },
      })
    );
  };

  return (
    <div
      className={`rounded-xl border transition-all text-xs overflow-hidden shadow-2xs mt-1.5 ${containerStyles} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 flex items-start justify-between gap-2 cursor-pointer hover:bg-black/2 transition-colors select-none"
      >
        <div className="flex items-start space-x-2 min-w-0">
          <div className="mt-0.5 shrink-0">
            {isError ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <Info className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${badgeStyles}`}>
                {report?.frameworkCode || 'OBE Standard'} Deviation
              </span>
              <span className="font-semibold text-xs truncate">{primaryWarning.title}</span>
            </div>
            {!compact && !isExpanded && (
              <p className="text-[11px] opacity-90 line-clamp-1 mt-0.5">
                {primaryWarning.suggestion}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {primaryWarning.suggestedAction && onApplyFix && (
            <button
              type="button"
              onClick={(e) => handleApply(primaryWarning, e)}
              className="px-2 py-0.5 rounded-lg bg-white border border-current hover:bg-slate-50 text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
            >
              {applied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Applied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>{primaryWarning.suggestedAction.label}</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            className="p-1 rounded hover:bg-black/5 transition"
            aria-label={isExpanded ? 'Collapse guidance' : 'Expand guidance'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Guidance & Accreditation Reference */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-black/5 bg-white/60 space-y-2 text-xs">
          <p className="leading-relaxed text-slate-800">
            <strong className="font-semibold text-slate-900">Standard Requirement: </strong>
            {primaryWarning.message}
          </p>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-600" />
                Accreditation Guideline: {primaryWarning.guidebookReference}
              </span>
              <button
                type="button"
                onClick={handleOpenGuidebook}
                className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Guidebook PDF</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-700 leading-normal">
              <strong className="font-semibold text-indigo-900">Alignment Action: </strong>
              {primaryWarning.suggestion}
            </p>
          </div>

          {primaryWarning.suggestedAction && onApplyFix && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={(e) => handleApply(primaryWarning, e)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{primaryWarning.suggestedAction.label}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FrameworkFieldWarning;
