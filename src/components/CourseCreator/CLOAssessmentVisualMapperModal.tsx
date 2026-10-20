import React from 'react';
import { X, Network, AlertTriangle, CheckCircle2, Maximize2 } from 'lucide-react';
import { Course, BloomLevel } from '../../types';
import { CLOAssessmentVisualMapper } from './CLOAssessmentVisualMapper';

export interface CLOAssessmentVisualMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onChangeCourse: (updatedCourse: Course) => void;
  onOpenTaskSuggester?: (cloId?: string, bloomLevel?: BloomLevel) => void;
}

export const CLOAssessmentVisualMapperModal: React.FC<CLOAssessmentVisualMapperModalProps> = ({
  isOpen,
  onClose,
  course,
  onChangeCourse,
  onOpenTaskSuggester,
}) => {
  if (!isOpen) return null;

  const clos = course.clos || [];
  const assessments = course.assessments || [];

  // Count unassessed CLOs
  const unassessedCount = clos.filter((clo) => {
    return !assessments.some(
      (a) =>
        (a.linkedCLOIds || []).includes(clo.id) ||
        (a.linkedCLOIds || []).includes(clo.code) ||
        (a.cloIds || []).includes(clo.id) ||
        (a.cloIds || []).includes(clo.code)
    );
  }).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clo-asmt-mapper-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-7xl max-h-[95vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="clo-asmt-mapper-title" className="text-base font-bold text-slate-900 leading-tight">
                  CLO-to-Assessment Visual Mapper & Gap Analyzer
                </h3>
                {unassessedCount > 0 ? (
                  <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>{unassessedCount} Unassessed Gap{unassessedCount > 1 ? 's' : ''}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>100% Outcomes Assessed</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Interactive flow connections between Course Learning Outcomes and assessment methods with cognitive depth check.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Houses Visual Mapper Component */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <CLOAssessmentVisualMapper
            course={course}
            onChange={onChangeCourse}
            onOpenTaskSuggester={onOpenTaskSuggester}
            defaultViewMode="flow"
          />
        </div>
      </div>
    </div>
  );
};

export default CLOAssessmentVisualMapperModal;
