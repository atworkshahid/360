import React, { useState } from 'react';
import { X, Scale, FileText, GitGraph, FileCheck2 } from 'lucide-react';
import { Course } from '../../types';
import { AlignmentAnalysisReport } from './AlignmentAnalysisReport';
import { ConstructiveAlignmentDashboard } from '../ConstructiveAlignment/ConstructiveAlignmentDashboard';
import { CoursePDFExportModal } from '../CoursePDFExportModal';

interface AlignmentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onChange?: (updatedCourse: Course) => void;
  onAskCopilot?: (prompt: string) => void;
  onJumpToStep?: (stepNumber: number) => void;
}

export const AlignmentAnalysisModal: React.FC<AlignmentAnalysisModalProps> = ({
  isOpen,
  onClose,
  course,
  onChange,
  onAskCopilot,
  onJumpToStep,
}) => {
  const [activeView, setActiveView] = useState<'node-link-map' | 'report'>('node-link-map');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GitGraph className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Curriculum Alignment &amp; Mapping Engine
              </h3>
              <p className="text-xs text-slate-500">
                Course: {course.title} ({course.code || 'Draft'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/60 text-xs font-semibold">
              <button
                type="button"
                id="modal-view-node-link-btn"
                onClick={() => setActiveView('node-link-map')}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                  activeView === 'node-link-map'
                    ? 'bg-white shadow-xs text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitGraph className="w-3.5 h-3.5" />
                <span>Node-Link Graph</span>
              </button>
              <button
                type="button"
                id="modal-view-report-btn"
                onClick={() => setActiveView('report')}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                  activeView === 'report'
                    ? 'bg-white shadow-xs text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Assessment Audit Report</span>
              </button>
            </div>

            <button
              onClick={() => setPdfModalOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
              title="Export Course Audit & Alignment Report as PDF"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {activeView === 'node-link-map' ? (
            <ConstructiveAlignmentDashboard
              course={course}
              onChangeCourse={onChange}
              onAskCopilot={onAskCopilot}
              onJumpToStep={(step) => {
                onClose();
                if (onJumpToStep) {
                  onJumpToStep(step);
                }
              }}
              height="600px"
            />
          ) : (
            <AlignmentAnalysisReport
              course={course}
              onChange={onChange}
              onAskCopilot={onAskCopilot}
              onJumpToStep={(step) => {
                onClose();
                if (onJumpToStep) {
                  onJumpToStep(step);
                }
              }}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => setPdfModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Alignment PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      <CoursePDFExportModal
        course={course}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </div>
  );
};
