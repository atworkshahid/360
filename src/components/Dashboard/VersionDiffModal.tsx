import React, { useMemo } from 'react';
import { X, PlusCircle, MinusCircle, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Course } from '../../types';
import { computeDetailedCourseDiff, DiffResult } from '../../utils/courseDiffEngine';

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshotCourse: Course;
  currentCourse: Course;
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({ isOpen, onClose, snapshotCourse, currentCourse }) => {
  const diff = useMemo(() => computeDetailedCourseDiff(snapshotCourse, currentCourse), [snapshotCourse, currentCourse]);

  if (!isOpen) return null;

  const renderSection = (
    title: string,
    added: any[],
    removed: any[],
    modified: any[],
    renderItem: (item: any) => React.ReactNode
  ) => {
    if (added.length === 0 && removed.length === 0 && modified.length === 0) return null;
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h4>
        {added.map((item, i) => <div key={i} className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded flex items-center gap-2"><PlusCircle className="w-3.5 h-3.5" /> {renderItem(item)}</div>)}
        {removed.map((item, i) => <div key={i} className="text-xs text-rose-700 bg-rose-50 p-2 rounded flex items-center gap-2"><MinusCircle className="w-3.5 h-3.5" /> {renderItem(item)}</div>)}
        {modified.map((mod, i) => <div key={i} className="text-xs text-amber-700 bg-amber-50 p-2 rounded flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> {renderItem(mod.new)} (modified)</div>)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Version Differences
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          {renderSection('CLOs', diff.addedClos, diff.removedClos, diff.modifiedClos, (clo) => clo.code + ': ' + clo.statement)}
          {renderSection('Assessments', diff.addedAssessments, diff.removedAssessments, diff.modifiedAssessments, (asmt) => asmt.name)}
          {renderSection('Lessons', diff.addedLessons, diff.removedLessons, diff.modifiedLessons, (lesson) => lesson.title)}
          {Object.values(diff).every(arr => arr.length === 0) && (
            <div className="text-center py-8 text-slate-500 text-xs">No significant changes detected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
