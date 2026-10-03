import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  X,
  ChevronRight,
  Scale,
  Award,
  BookOpen,
  Send,
  Clock,
} from 'lucide-react';
import { Course, BloomLevel } from '../../types';
import {
  CourseValidationService,
  CourseValidationSummary,
} from '../../services/courseValidationService';
import { getFrameworkById } from '../../data/frameworksData';

interface ContextualAssistantPanelProps {
  currentStep: number;
  course: Course;
  onChange: (updatedCourse: Course) => void;
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep?: (step: number) => void;
  onAskCopilot?: (prompt: string) => void;
}

export const ContextualAssistantPanel: React.FC<ContextualAssistantPanelProps> = ({
  currentStep,
  course,
  onChange,
  isOpen,
  onClose,
  onJumpToStep,
  onAskCopilot,
}) => {
  if (!isOpen) return null;

  const summary: CourseValidationSummary = CourseValidationService.validateCourse(course);
  const framework = getFrameworkById(course.frameworkId);

  const handleApplyFix = (rule: CourseValidationRuleResult) => {
    const updated = CourseValidationService.applyAccessibilityFix(course, rule);
    onChange(updated);
  };

  const renderStepSpecificGuidance = () => {
    switch (currentStep) {
      case 1: // Framework
        return (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-indigo-700">
                <Lightbulb className="w-3.5 h-3.5" />
                Accreditation Alignment Tip
              </span>
              <p className="leading-relaxed">
                Selecting the exact accreditation standard automatically maps standard graduate attributes (e.g. ABET SO 1-6 or HEC PLO 1-5), ensuring constructive alignment throughout your syllabus.
              </p>
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <span className="font-bold text-slate-800 block">Active Framework:</span>
              <p className="font-semibold text-indigo-700">{framework.name}</p>
              <p className="text-[11px] text-slate-500">{framework.applicableTerminology}</p>
            </div>
          </div>
        );

      case 2: // Course Info
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-blue-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-blue-700">
                <Clock className="w-3.5 h-3.5" />
                Contact Hours Formula
              </span>
              <p className="text-[11px] leading-relaxed">
                Standard OBE Formula: <strong>1 Theory Credit = 1 Contact Hour</strong>, while{' '}
                <strong>1 Lab Credit = 2 or 3 Contact Hours</strong> per week.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 block text-[11px]">Current Calculations:</span>
              <div className="text-[11px] text-slate-600 mt-1">
                Theory: {course.theoryHours ?? 2} cr | Lab: {course.labHours ?? 1} cr | Contact: {course.contactHours ?? 4} hrs/wk
              </div>
            </div>
          </div>
        );

      case 3: // Course Purpose
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-purple-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-purple-700">
                <BookOpen className="w-3.5 h-3.5" />
                Pedagogical Difference
              </span>
              <ul className="text-[11px] space-y-1 list-disc pl-3 text-slate-600 leading-relaxed">
                <li>
                  <strong>Rationale:</strong> Curricular justification within the degree.
                </li>
                <li>
                  <strong>Aim:</strong> High-level educational mission of the instructor.
                </li>
                <li>
                  <strong>Objectives:</strong> Specific operational milestones.
                </li>
              </ul>
            </div>
          </div>
        );

      case 4: // CLOs
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                Avoid Vague Action Verbs
              </span>
              <p className="text-[11px] leading-relaxed">
                Never use internal cognitive states like <em>"understand"</em>, <em>"know"</em>, or{' '}
                <em>"appreciate"</em>. These cannot be measured or audited. Use observable verbs like{' '}
                <em>"calculate"</em>, <em>"deconstruct"</em>, or <em>"design"</em>.
              </p>
            </div>
            <div className="text-[11px] space-y-1 text-slate-600">
              <span className="font-bold text-slate-800">Recommended Cognitive Distribution:</span>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px]">
                Undergraduate core courses should target a balance of <strong>Understand (20%)</strong>,{' '}
                <strong>Apply (40%)</strong>, and <strong>Analyze/Design (40%)</strong>.
              </div>
            </div>
          </div>
        );

      case 5: // Outcome Mapping
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-emerald-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mapping Density Check
              </span>
              <p className="text-[11px] leading-relaxed">
                A single course should typically address <strong>2 to 4 Program Outcomes</strong> deeply rather than shallowly mapping to all 12. Over-mapping creates unsustainable assessment tracking burdens.
              </p>
            </div>
          </div>
        );

      case 6: // Weekly Plan
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-sky-950 space-y-1">
              <span className="font-bold text-sky-800">16-Week Coverage Rule</span>
              <p className="text-[11px] leading-relaxed">
                Every Course Learning Outcome must appear in at least one instructional week. An outcome that is never scheduled cannot be achieved by students.
              </p>
            </div>
          </div>
        );

      case 7: // TLAs
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-indigo-950 space-y-1">
              <span className="font-bold text-indigo-700">Active Learning Alignment</span>
              <p className="text-[11px] leading-relaxed">
                If an outcome specifies <em>"Design"</em> or <em>"Evaluate"</em>, teaching via passive lecture alone violates constructive alignment. Pair with problem-based labs or peer critiques.
              </p>
            </div>
          </div>
        );

      case 8: // Assessment Plan
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">100% Weightage Mandate</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All summative components must sum to exactly 100%. Accreditation audits strictly penalize syllabi with floating or unspecified weightings.
              </p>
            </div>
          </div>
        );

      case 9: // Alignment Check
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
              <span className="font-bold text-emerald-800">The Alignment Triangle</span>
              <p className="text-[11px] leading-relaxed">
                Constructive alignment is achieved when every outcome has an instructional strategy in the schedule AND a direct assessment instrument.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-slate-500">
            Publish your course syllabus or submit to the Board of Studies for formal accreditation review.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col transition-all">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              OBE Alignment Assistant
            </h3>
            <span className="text-[10px] text-slate-400">
              Constructive Alignment Monitor
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Readiness Score Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Readiness Score
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                summary.readinessScore >= 80
                  ? 'bg-emerald-100 text-emerald-800'
                  : summary.readinessScore >= 60
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {summary.readinessScore}% OBE Ready
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                summary.readinessScore >= 80
                  ? 'bg-emerald-600'
                  : summary.readinessScore >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
              style={{ width: `${summary.readinessScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-rose-600 font-bold">
              {summary.criticalCount} Critical
            </span>
            <span className="text-amber-600 font-semibold">
              {summary.warningCount} Warnings
            </span>
            <span className="text-emerald-600 font-semibold">
              {summary.passedCount} Passed
            </span>
          </div>
        </div>

        {/* Contextual Step Guidance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step {currentStep} Guidance
            </span>
          </div>
          {renderStepSpecificGuidance()}
        </div>

        {/* Critical Issues Alert (if any) */}
        {summary.criticalCount > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
              Critical Actions Required
            </span>
            <div className="space-y-2">
              {summary.results
                .filter((r) => r.severity === 'Error')
                .slice(0, 3)
                .map((r, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 space-y-1"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{r.ruleTitle}</span>
                      <div className="flex items-center gap-2">
                        {r.rule.startsWith('ACCESSIBILITY_') && (
                          <button
                            type="button"
                            onClick={() => handleApplyFix(r)}
                            className="text-[10px] text-white bg-rose-600 hover:bg-rose-500 px-2 py-0.5 rounded font-bold cursor-pointer"
                          >
                            Quick Fix
                          </button>
                        )}
                        {onJumpToStep && (
                          <button
                            type="button"
                            onClick={() => onJumpToStep(r.targetStep)}
                            className="text-[10px] text-rose-700 underline font-semibold"
                          >
                            Step {r.targetStep}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-rose-800 opacity-90">{r.message}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Copilot Prompt */}
      {onAskCopilot && (
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() =>
              onAskCopilot(
                `Review the current course design for "${course.title}". Analyze my CLOs, weekly plan, and assessments for accreditation alignment under ${framework.name}.`
              )
            }
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Review Course Alignment</span>
          </button>
        </div>
      )}
    </div>
  );
};
