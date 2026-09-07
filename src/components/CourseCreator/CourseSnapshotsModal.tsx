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
  X,
  Maximize2,
  Minimize2,
  Download,
  AlertTriangle,
  BookOpen,
  Calendar,
  Save,
  Undo2,
  Tag,
  ArrowLeftRight,
} from 'lucide-react';
import { Course, CourseVersion, VersionSaveType } from '../../types';
import {
  getCourseVersions,
  saveCourseVersion,
  restoreCourseVersion,
  deleteCourseVersion,
  clearCourseVersions,
  MAX_VERSIONS_PER_COURSE,
  computeCourseDiff,
} from '../../services/versionHistoryService';
import { calculateCourseAudit } from '../../utils/obeCalculator';
import { formatExactTimestamp, formatRelativeTime } from '../../utils/timeFormat';

interface CourseSnapshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onRestore: (restoredCourse: Course) => void;
}

export const CourseSnapshotsModal: React.FC<CourseSnapshotsModalProps> = ({
  isOpen,
  onClose,
  course,
  onRestore,
}) => {
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [confirmRestoreVersion, setConfirmRestoreVersion] = useState<CourseVersion | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isExpandedFull, setIsExpandedFull] = useState<boolean>(false);

  // Manual snapshot form state
  const [newSnapshotLabel, setNewSnapshotLabel] = useState<string>('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);

  // Last safety backup ID to allow quick Undo
  const [lastSafetyBackup, setLastSafetyBackup] = useState<CourseVersion | null>(null);

  // Load versions
  const refreshVersions = () => {
    if (!course?.id) return;
    const list = getCourseVersions(course.id);
    setVersions(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshVersions();
    }
  }, [isOpen, course?.id]);

  // Listen for background auto-save version events
  useEffect(() => {
    const handleSaved = (e: any) => {
      if (e.detail?.courseId === course?.id) {
        refreshVersions();
      }
    };
    window.addEventListener('course_version_saved', handleSaved);
    return () => window.removeEventListener('course_version_saved', handleSaved);
  }, [course?.id]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (confirmRestoreVersion) {
          setConfirmRestoreVersion(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, confirmRestoreVersion, onClose]);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const handleCreateManualSnapshot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!course) return;

    const label = newSnapshotLabel.trim() || `Manual Snapshot at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newVer = saveCourseVersion(course, 'manual', label);

    if (newVer) {
      setNewSnapshotLabel('');
      setIsCreatingSnapshot(false);
      refreshVersions();
      showNotification(`Created new snapshot v${newVer.versionNumber} ("${label}").`, 'success');
    } else {
      showNotification('Failed to create snapshot.', 'error');
    }
  };

  const handleExecuteRestore = (ver: CourseVersion) => {
    if (!course) return;

    const result = restoreCourseVersion(course.id, ver.id, course);
    if (result) {
      onRestore(result.restoredCourse);
      if (result.backupVersion) {
        setLastSafetyBackup(result.backupVersion);
      }
      refreshVersions();
      setConfirmRestoreVersion(null);
      showNotification(
        `Successfully restored "${ver.summary?.title || course.title}" to version #${ver.versionNumber}. A safety rollback snapshot was automatically saved.`,
        'success'
      );
    } else {
      showNotification('Failed to restore snapshot.', 'error');
    }
  };

  const handleUndoRestore = () => {
    if (!lastSafetyBackup || !course) return;
    const result = restoreCourseVersion(course.id, lastSafetyBackup.id, course);
    if (result) {
      onRestore(result.restoredCourse);
      setLastSafetyBackup(null);
      refreshVersions();
      showNotification('Rollback undone. Reverted to state prior to restoration.', 'info');
    }
  };

  const handleDeleteVersion = (verId: string) => {
    if (!course) return;
    deleteCourseVersion(course.id, verId);
    refreshVersions();
    showNotification('Snapshot deleted.', 'info');
  };

  const handleClearAllVersions = () => {
    if (!course) return;
    clearCourseVersions(course.id);
    refreshVersions();
    setConfirmClearHistory(false);
    showNotification(`Cleared all snapshots for "${course.title}".`, 'info');
  };

  const handleExportSnapshotJSON = (ver: CourseVersion) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ver.course, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${(ver.course.code || 'COURSE').replace(/[^a-zA-Z0-9_-]/g, '_')}_v${ver.versionNumber}_snapshot.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification(`Exported snapshot v${ver.versionNumber} as JSON.`, 'info');
  };

  // Live course audit for comparison
  const liveAudit = useMemo(() => calculateCourseAudit(course), [course]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Side Panel / Modal */}
      <div
        id="course-snapshots-panel"
        className={`relative z-10 w-full ${
          isExpandedFull ? 'max-w-4xl' : 'max-w-2xl'
        } bg-white h-full shadow-2xl flex flex-col transform transition-all duration-300 ease-in-out`}
      >
        {/* Panel Header */}
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Course Snapshots & Revisions</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {versions.length} / {MAX_VERSIONS_PER_COURSE} Stored
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {course.code ? `${course.code}: ` : ''}{course.title || 'Current Course'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="snapshots-panel-toggle-width-btn"
              onClick={() => setIsExpandedFull(!isExpandedFull)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition cursor-pointer"
              title={isExpandedFull ? 'Compact View' : 'Expand View'}
            >
              {isExpandedFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              id="snapshots-panel-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              ) : (
                <Clock className="w-4 h-4 shrink-0 text-indigo-600" />
              )}
              <span className="truncate">{statusMessage.text}</span>
            </div>

            {lastSafetyBackup && statusMessage.type === 'success' && (
              <button
                type="button"
                id="snapshots-undo-restore-btn"
                onClick={handleUndoRestore}
                className="ml-3 px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center space-x-1 shrink-0 transition cursor-pointer shadow-2xs"
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo Restore</span>
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Current Live Status Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Workspace State</span>
                <span className="text-[10px] text-slate-400 font-mono">LIVE</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <span><strong>{course.clos?.length || 0}</strong> CLOs</span>
                <span>•</span>
                <span><strong>{course.modules?.length || 0}</strong> Modules</span>
                <span>•</span>
                <span><strong>{course.assessments?.length || 0}</strong> Assessments</span>
                <span>•</span>
                <span className={`font-semibold ${liveAudit.healthScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  Health: {liveAudit.healthScore}%
                </span>
              </div>
            </div>

            <button
              type="button"
              id="take-manual-snapshot-toggle-btn"
              onClick={() => setIsCreatingSnapshot(!isCreatingSnapshot)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{isCreatingSnapshot ? 'Cancel Snapshot' : 'Save Snapshot Now'}</span>
            </button>
          </div>

          {/* Create Manual Snapshot Card */}
          {isCreatingSnapshot && (
            <form
              onSubmit={handleCreateManualSnapshot}
              className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <label htmlFor="snapshot-custom-label" className="text-xs font-bold text-indigo-900">
                  Snapshot Note / Milestone Label
                </label>
              </div>
              <p className="text-[11px] text-indigo-700 leading-normal">
                Tag this version so you can easily identify and revert to this milestone later (e.g., &quot;Pre-Blooms Revision&quot;, &quot;Accreditation Draft 2&quot;).
              </p>
              <div className="flex items-center space-x-2">
                <input
                  id="snapshot-custom-label"
                  type="text"
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  placeholder={`e.g., Milestone Save @ ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  autoFocus
                />
                <button
                  type="submit"
                  id="save-snapshot-confirm-btn"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer shrink-0"
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          )}

          {/* Confirm Restore Dialog Overlay */}
          {confirmRestoreVersion && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3 shadow-md animate-in fade-in duration-150">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">
                    Restore Course to Version #{confirmRestoreVersion.versionNumber}?
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This will replace your current workspace content with the state saved on{' '}
                    <strong>{formatExactTimestamp(confirmRestoreVersion.timestamp)}</strong> (
                    <em>{confirmRestoreVersion.label}</em>).
                  </p>
                  <p className="text-[11px] text-amber-700 bg-amber-100/70 p-2 rounded border border-amber-200 mt-1">
                    ✓ <strong>Safety Guaranteed:</strong> Your active workspace will automatically be saved as a safety snapshot before restoring, allowing instant undo.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  id="cancel-restore-snapshot-btn"
                  onClick={() => setConfirmRestoreVersion(null)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 text-xs font-medium rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-execute-restore-snapshot-btn"
                  onClick={() => handleExecuteRestore(confirmRestoreVersion)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm & Restore v{confirmRestoreVersion.versionNumber}</span>
                </button>
              </div>
            </div>
          )}

          {/* Timeline of Snapshots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Revision History ({versions.length})</span>
              </h3>
              {versions.length > 0 && (
                <button
                  type="button"
                  id="clear-all-snapshots-btn"
                  onClick={() => setConfirmClearHistory(true)}
                  className="text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer flex items-center space-x-1"
                  title="Clear all saved snapshots for this course"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {confirmClearHistory && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs flex items-center justify-between">
                <span className="text-rose-800 font-medium">Delete all {versions.length} saved snapshots?</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistory(false)}
                    className="px-2 py-1 text-slate-600 hover:bg-rose-100 rounded text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="confirm-clear-snapshots-btn"
                    onClick={handleClearAllVersions}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}

            {versions.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No Snapshots Saved Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Auto-save preserves changes as you work, and you can also create manual milestone snapshots anytime before major edits.
                  </p>
                </div>
                <button
                  type="button"
                  id="empty-state-take-snapshot-btn"
                  onClick={() => setIsCreatingSnapshot(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Create First Snapshot</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((ver, idx) => {
                  const isExpanded = expandedVersionId === ver.id;
                  const isPreview = previewVersionId === ver.id;
                  const diffAgainstCurrent = computeCourseDiff(ver.course, course);
                  const isIdenticalToCurrent =
                    diffAgainstCurrent.length === 0 ||
                    (diffAgainstCurrent.length === 1 && diffAgainstCurrent[0] === 'Minor attribute adjustments');

                  const saveTypeBadge =
                    ver.saveType === 'manual'
                      ? { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Manual Snapshot' }
                      : ver.saveType === 'restore'
                      ? { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Restored Version' }
                      : ver.saveType === 'major_milestone'
                      ? { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Milestone' }
                      : { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Auto-Save' };

                  return (
                    <div
                      key={ver.id}
                      id={`snapshot-card-${ver.id}`}
                      className={`border rounded-xl transition-all duration-200 ${
                        idx === 0
                          ? 'border-indigo-200 bg-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 mt-0.5 border border-slate-200">
                            v{ver.versionNumber}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {ver.label || `Version #${ver.versionNumber}`}
                              </span>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${saveTypeBadge.bg}`}>
                                {saveTypeBadge.label}
                              </span>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  Latest
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                              <span title={formatExactTimestamp(ver.timestamp)}>
                                {formatRelativeTime(new Date(ver.timestamp))}
                              </span>
                              <span>•</span>
                              <span>{new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Elements summary chips */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-medium">
                                {ver.summary?.closCount ?? ver.course.clos?.length ?? 0} CLOs
                              </span>
                              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-medium">
                                {ver.summary?.modulesCount ?? ver.course.modules?.length ?? 0} Modules
                              </span>
                              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-medium">
                                {ver.summary?.assessmentsCount ?? ver.course.assessments?.length ?? 0} Assessments
                              </span>
                              {ver.summary?.healthScore !== undefined && (
                                <span
                                  className={`px-2 py-0.5 rounded border font-semibold ${
                                    ver.summary.healthScore >= 80
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  Health: {ver.summary.healthScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top Action buttons */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            id={`restore-snapshot-btn-${ver.id}`}
                            onClick={() => setConfirmRestoreVersion(ver)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                            title="Restore this version to active course"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>

                          <button
                            type="button"
                            id={`toggle-expand-snapshot-btn-${ver.id}`}
                            onClick={() => setExpandedVersionId(isExpanded ? null : ver.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title={isExpanded ? 'Collapse changes' : 'Inspect changes & details'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section: Differences & Quick Preview */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60 rounded-b-xl space-y-3 text-xs">
                          {/* Changes vs Current */}
                          <div>
                            <div className="flex items-center space-x-1 text-slate-500 font-semibold mb-1">
                              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Diff Against Current Active Workspace:</span>
                            </div>

                            {isIdenticalToCurrent ? (
                              <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] font-medium flex items-center space-x-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Identical to current active workspace content.</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {diffAgainstCurrent.map((diffItem, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700 shadow-2xs"
                                  >
                                    {diffItem}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Secondary actions: Preview content & Download JSON */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                            <button
                              type="button"
                              id={`toggle-preview-content-${ver.id}`}
                              onClick={() => setPreviewVersionId(isPreview ? null : ver.id)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 transition cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{isPreview ? 'Hide Content Preview' : 'Preview Saved CLOs & Modules'}</span>
                            </button>

                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                id={`export-json-snapshot-${ver.id}`}
                                onClick={() => handleExportSnapshotJSON(ver)}
                                className="px-2 py-1 rounded text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition cursor-pointer flex items-center space-x-1"
                                title="Download full snapshot as JSON"
                              >
                                <Download className="w-3 h-3" />
                                <span>Export JSON</span>
                              </button>

                              <button
                                type="button"
                                id={`delete-snapshot-${ver.id}`}
                                onClick={() => handleDeleteVersion(ver.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete this snapshot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Content Preview Accordion */}
                          {isPreview && (
                            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 mt-2">
                              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Saved Learning Outcomes (CLOs)
                              </div>
                              {ver.course.clos && ver.course.clos.length > 0 ? (
                                <ul className="space-y-1">
                                  {ver.course.clos.map((c, cIdx) => (
                                    <li key={c.id || cIdx} className="text-[11px] text-slate-600 flex items-start space-x-1.5">
                                      <span className="font-bold text-indigo-600 shrink-0">CLO {cIdx + 1}:</span>
                                      <span className="truncate">{c.statement}</span>
                                      <span className="text-[10px] font-bold px-1.5 rounded bg-slate-100 text-slate-500 shrink-0">
                                        {c.bloomLevel || 'Analyze'}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No CLOs defined in this snapshot.</p>
                              )}

                              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pt-2 border-t border-slate-100">
                                Modules ({ver.course.modules?.length || 0})
                              </div>
                              {ver.course.modules && ver.course.modules.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {ver.course.modules.map((m, mIdx) => (
                                    <span
                                      key={m.id || mIdx}
                                      className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700 font-medium"
                                    >
                                      M{mIdx + 1}: {m.title}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No modules defined in this snapshot.</p>
                              )}
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

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>OBE Version Guard: Auto-safeguarding previous course revisions</span>
          </div>

          <button
            type="button"
            id="snapshots-panel-bottom-close-btn"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
