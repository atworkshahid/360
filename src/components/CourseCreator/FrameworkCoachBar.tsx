import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Download,
  Lock,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Course } from '../../types';
import { getFrameworkGuideline, FrameworkDetailedGuideline } from '../../data/frameworkGuidelines';
import { downloadFrameworkGuidebookPDF } from '../../utils/frameworkGuidebookPdf';

interface FrameworkCoachBarProps {
  course: Course;
  currentStageKey: string;
  stageName: string;
  onOpenGuidance: (stageKey?: string) => void;
  onOpenGuidebook?: (stageKey?: string) => void;
  className?: string;
}

export const FrameworkCoachBar: React.FC<FrameworkCoachBarProps> = ({
  course,
  currentStageKey,
  stageName,
  onOpenGuidance,
  onOpenGuidebook,
  className = '',
}) => {
  const guideline: FrameworkDetailedGuideline = getFrameworkGuideline(course.frameworkId);
  const stage = guideline.stages[currentStageKey] || guideline.stages['step_clos'];

  const handleGuidebookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenGuidebook) {
      onOpenGuidebook(currentStageKey);
    } else {
      downloadFrameworkGuidebookPDF({
        frameworkId: course.frameworkId,
        frameworkName: guideline.frameworkName,
        courseTitle: course.title,
        courseCode: course.code,
      });
    }
  };

  return (
    <div
      className={`p-3.5 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-blue-50/80 border border-indigo-100/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${className}`}
    >
      <div className="flex items-start sm:items-center space-x-3">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0 mt-0.5 sm:mt-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-md bg-indigo-100 text-indigo-800 font-mono">
              {guideline.frameworkCode}
            </span>
            <span className="text-[11px] font-semibold text-slate-700">
              Committed OBE Framework Guidance
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5 text-slate-400" />
              Locked to {course.title || 'Course'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-snug">
            {stage
              ? `Requirements for ${stage.stageTitle}: ${stage.whatIsRequired[0]}`
              : `Review accreditation guidelines for ${stageName} under ${guideline.frameworkName}.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onOpenGuidance(currentStageKey)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          title="Open framework-specific guidelines, exemplars, and requirements"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Stage Guidance</span>
        </button>

        <button
          type="button"
          onClick={handleGuidebookClick}
          className="p-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          title="Open or download the full Accreditation & OBE Frameworks Guidebook in PDF format"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Guidebook (PDF)</span>
          <Download className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
