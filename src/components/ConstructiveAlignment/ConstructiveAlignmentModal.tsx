import React from 'react';
import { X, GitGraph, FileText, Maximize2 } from 'lucide-react';
import { Course } from '../../types';
import { ConstructiveAlignmentDashboard } from './ConstructiveAlignmentDashboard';

export interface ConstructiveAlignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onChangeCourse?: (updatedCourse: Course) => void;
  onAskCopilot?: (prompt: string) => void;
  onJumpToStep?: (stepNumber: number) => void;
}

export const ConstructiveAlignmentModal: React.FC<ConstructiveAlignmentModalProps> = ({
  isOpen,
  onClose,
  course,
  onChangeCourse,
  onAskCopilot,
  onJumpToStep,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl max-h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GitGraph className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Constructive Alignment Mapping (Biggs Tripartite Diagram)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                  Node-Link Graph
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Course: <span className="font-semibold text-slate-700">{course.title}</span> ({course.code || 'Draft'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <ConstructiveAlignmentDashboard
            course={course}
            onChangeCourse={onChangeCourse}
            onAskCopilot={onAskCopilot}
            onJumpToStep={onJumpToStep}
            height="620px"
          />
        </div>
      </div>
    </div>
  );
};
