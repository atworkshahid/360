import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookmarkPlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  GitCommit,
  Layers,
  Sparkles,
  Check,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Course, CourseVersion } from '../types';
import {
  getCourseVersions,
  saveCourseVersion,
  restoreCourseVersion,
  clearCourseVersions,
  MAX_VERSIONS_PER_COURSE,
  computeCourseDiff,
} from '../services/versionHistoryService';
import { calculateCourseAudit } from '../utils/obeCalculator';

interface CourseVersionHistoryViewProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourseId: (id: string) => void;
  onRestoreCourse: (course: Course) => void;
}

export const CourseVersionHistoryView: React.FC<CourseVersionHistoryViewProps> = ({
  courses,
  selectedCourseId,
  onSelectCourseId,
  onRestoreCourse,
}) => {
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [confirmRestoreVersion, setConfirmRestoreVersion] = useState<CourseVersion | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Active course reference
  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Load versions for currently selected course
  const refreshVersions = () => {
    if (!currentCourse) return;
    const list = getCourseVersions(currentCourse.id);
    setVersions(list);
  };

  useEffect(() => {
    refreshVersions();
  }, [currentCourse?.id]);

  // Listen to external save events
  useEffect(() => {
    const handleSaved = (e: any) => {
      if (e.detail?.courseId === currentCourse?.id) {
        refreshVersions();
      }
    };
    window.addEventListener('course_version_saved', handleSaved);
    return () => window.removeEventListener('course_version_saved', handleSaved);
  }, [currentCourse?.id]);

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  const handleManualSnapshot = () => {
    if (!currentCourse) return;
    const newVer = saveCourseVersion(
      currentCourse,
      'manual',
      `Manual Snapshot at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    );
    if (newVer) {
      refreshVersions();
      showNotification(`Saved manual snapshot v${newVer.versionNumber} for "${currentCourse.title}".`);
    }
  };

  const handleExecuteRestore = (ver: CourseVersion) => {
    if (!currentCourse) return;
    const result = restoreCourseVersion(currentCourse.id, ver.id, currentCourse);
    if (result) {
      onRestoreCourse(result.restoredCourse);
      refreshVersions();
      setConfirmRestoreVersion(null);
      showNotification(
        `Successfully restored "${currentCourse.title}" to version #${ver.versionNumber} (${new Date(
          ver.timestamp
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}). A safety backup was saved.`,
        'success'
      );
    }
  };

  const handleClearHistory = () => {
    if (!currentCourse) return;
    clearCourseVersions(currentCourse.id);
    refreshVersions();
    setConfirmClearHistory(false);
    showNotification(`Cleared version history for "${currentCourse.title}".`, 'info');
  };

  const formatExactTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const now = Date.now();
      const then = new Date(iso).getTime();
      const diffSec = Math.floor((now - then) / 1000);

      if (diffSec < 15) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Compare whether snapshot matches current course
  const isCurrentState = (ver: CourseVersion) => {
    if (!currentCourse) return false;
    return JSON.stringify(ver.course) === JSON.stringify(currentCourse);
  };

  return (
    <div className="space-y-4">
      {/* Course Selection & Controls Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Course to Inspect
            </label>
            <select
              value={currentCourse?.id}
              onChange={(e) => onSelectCourseId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-sm w-full cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `[${c.code}] ` : ''}{c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleManualSnapshot}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
              title="Capture a manual checkpoint of the current course state"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Snapshot Now</span>
            </button>

            {versions.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer"
                title="Clear version history for this course"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Course Quick Info */}
        {currentCourse && (
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">{currentCourse.title}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                {currentCourse.code || 'NO-CODE'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-500">
              <span>{currentCourse.clos?.length || 0} CLOs</span>
              <span>•</span>
              <span>{currentCourse.modules?.length || 0} Modules</span>
              <span>•</span>
              <span>{currentCourse.assessments?.length || 0} Assessments</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">
                {versions.length} of {MAX_VERSIONS_PER_COURSE} saves tracked
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Confirmation Dialog: Clear History */}
      {confirmClearHistory && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center space-x-2 text-rose-800 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Clear version history for "{currentCourse?.title}"?</span>
          </div>
          <p className="text-rose-700 text-[11px]">
            This will permanently delete all {versions.length} saved checkpoints for this course. Your current live course remains untouched.
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs transition cursor-pointer"
            >
              Yes, Clear History
            </button>
            <button
              type="button"
              onClick={() => setConfirmClearHistory(false)}
              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Restore Version */}
      {confirmRestoreVersion && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-2.5 animate-in fade-in shadow-xs">
          <div className="flex items-center space-x-2 text-amber-900 font-bold">
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Restore to Version #{confirmRestoreVersion.versionNumber} ({formatRelativeTime(confirmRestoreVersion.timestamp)})?
            </span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            This will replace the active course content with this saved checkpoint.
            <strong> A safety backup of your current active state will be preserved automatically</strong> before restoring.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setConfirmRestoreVersion(null)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleExecuteRestore(confirmRestoreVersion)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirm & Restore</span>
            </button>
          </div>
        </div>
      )}

      {/* Versions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Saved Checkpoints ({versions.length} / {MAX_VERSIONS_PER_COURSE} Saves)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Sliding window keeps last 5 saves</span>
        </div>

        {versions.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No checkpoints recorded yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Checkpoints are automatically created during autosave and manual edits, or you can click "Snapshot Now" above to capture one immediately.
            </p>
            <button
              type="button"
              onClick={handleManualSnapshot}
              className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Create Initial Snapshot</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {versions.map((ver, idx) => {
              const isCurrent = isCurrentState(ver);
              const isExpanded = expandedVersionId === ver.id;
              const isLatest = idx === 0;

              return (
                <div
                  key={ver.id}
                  className={`rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : isLatest
                      ? 'border-indigo-200 bg-indigo-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Version Badge & Details */}
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center pt-0.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isCurrent
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : isLatest
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          v{ver.versionNumber}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-xs font-bold text-slate-900">
                            {ver.label || `Version ${ver.versionNumber}`}
                          </span>

                          {/* Save Type Tag */}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              ver.saveType === 'manual'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : ver.saveType === 'restore'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {ver.saveType}
                          </span>

                          {/* Active / Current State Tag */}
                          {isCurrent && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Check className="w-3 h-3" />
                              <span>Current Active State</span>
                            </span>
                          )}

                          {isLatest && !isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              Latest Save
                            </span>
                          )}
                        </div>

                        {/* Timestamp & Relative Time */}
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-700">{formatRelativeTime(ver.timestamp)}</span>
                          <span>•</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {formatExactTime(ver.timestamp)}
                          </span>
                        </div>

                        {/* Summary Metrics */}
                        <div className="flex items-center space-x-2 pt-1 text-[10px] text-slate-600 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                            {ver.summary.closCount} CLOs
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                            {ver.summary.modulesCount} Modules
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                            {ver.summary.assessmentsCount} Assessments
                          </span>
                          {ver.summary.healthScore !== undefined && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">
                              {ver.summary.healthScore}% OBE Health
                            </span>
                          )}
                        </div>

                        {/* Changes tag */}
                        {ver.changesSummary && ver.changesSummary.length > 0 && (
                          <p className="text-[10px] text-slate-500 pt-0.5">
                            <span className="font-semibold text-slate-600">Changes: </span>
                            {ver.changesSummary.slice(0, 2).join(' • ')}
                            {ver.changesSummary.length > 2 ? ` (+${ver.changesSummary.length - 2} more)` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setExpandedVersionId(isExpanded ? null : ver.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                        title="Compare details with current course"
                      >
                        <span>{isExpanded ? 'Hide Diff' : 'Inspect'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isCurrent ? (
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRestoreVersion(ver)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
                          title="Restore this version to the active workspace"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Comparison Details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50/70 rounded-b-xl text-xs space-y-3">
                      <div className="flex items-center justify-between text-slate-700 font-bold border-b border-slate-200 pb-1.5">
                        <span className="flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Snapshot vs. Current Live State Comparison</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Saved: {formatExactTime(ver.timestamp)}
                        </span>
                      </div>

                      {/* Course Basics comparison */}
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Snapshot State (v{ver.versionNumber})</span>
                          <p className="font-bold text-slate-800">{ver.course.title}</p>
                          <p className="text-slate-500 font-mono text-[10px]">{ver.course.code || 'NO-CODE'}</p>
                          <p className="text-slate-500">{ver.course.level} • {ver.course.deliveryMode}</p>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Current Live State</span>
                          <p className="font-bold text-slate-800">{currentCourse?.title}</p>
                          <p className="text-slate-500 font-mono text-[10px]">{currentCourse?.code || 'NO-CODE'}</p>
                          <p className="text-slate-500">{currentCourse?.level} • {currentCourse?.deliveryMode}</p>
                        </div>
                      </div>

                      {/* Detailed Component Comparison */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Outcome & Assessment Structure
                        </span>
                        <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="text-slate-400 text-[9px] block">CLOs</span>
                            <span className="font-bold text-slate-800">
                              {ver.summary.closCount} → {currentCourse?.clos?.length || 0}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="text-slate-400 text-[9px] block">Modules</span>
                            <span className="font-bold text-slate-800">
                              {ver.summary.modulesCount} → {currentCourse?.modules?.length || 0}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="text-slate-400 text-[9px] block">Assessments</span>
                            <span className="font-bold text-slate-800">
                              {ver.summary.assessmentsCount} → {currentCourse?.assessments?.length || 0}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-slate-200">
                            <span className="text-slate-400 text-[9px] block">Rubrics</span>
                            <span className="font-bold text-slate-800">
                              {ver.summary.rubricsCount} → {currentCourse?.rubrics?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CLO Statements in this version */}
                      {ver.course.clos && ver.course.clos.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            CLOs in this version ({ver.course.clos.length})
                          </span>
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {ver.course.clos.map((clo, cIdx) => (
                              <div
                                key={clo.id || cIdx}
                                className="p-1.5 bg-white border border-slate-200 rounded text-[11px] flex items-start space-x-2"
                              >
                                <span className="px-1 bg-indigo-50 text-indigo-700 font-mono font-bold rounded text-[9px] shrink-0">
                                  {clo.code}
                                </span>
                                <span className="text-slate-700 line-clamp-1 flex-1">{clo.statement}</span>
                                <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                                  {clo.bloomLevel}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Restore Action in Drawer */}
                      {!isCurrent && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setConfirmRestoreVersion(ver)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-2 shadow-sm transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore to Version #{ver.versionNumber}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
