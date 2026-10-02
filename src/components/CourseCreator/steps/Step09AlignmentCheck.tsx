import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Award,
  FileDown,
  Loader2,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { Course, BloomLevel } from '../../../types';
import {
  CourseValidationService,
  CourseValidationSummary,
} from '../../../services/courseValidationService';
import { downloadCoursePDF, exportCourseBlueprintWithGate } from '../../../utils/pdfExport';
import { OutcomeAssessmentDependencyAlert } from '../OutcomeAssessmentDependencyAlert';
import { BloomDomainRadarChart } from '../../AlignmentAnalysis/BloomDomainRadarChart';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onJumpToStep?: (stepIndex: number) => void;
  onAskCopilot?: (prompt: string) => void;
}

export const Step09AlignmentCheck: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onJumpToStep,
  onAskCopilot,
}) => {
  const [activeFindingTab, setActiveFindingTab] = useState<
    'all' | 'critical' | 'warning' | 'suggestion' | 'passed'
  >('all');
  const [isPdfExporting, setIsPdfExporting] = useState<boolean>(false);

  const summary: CourseValidationSummary = CourseValidationService.validateCourse(course);

  const filteredResults = summary.results.filter((r) => {
    if (activeFindingTab === 'all') return true;
    if (activeFindingTab === 'critical') return r.severity === 'Error';
    if (activeFindingTab === 'warning') return r.severity === 'Warning';
    if (activeFindingTab === 'suggestion') return r.severity === 'Suggestion';
    if (activeFindingTab === 'passed') return r.severity === 'Passed';
    return true;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Error':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Suggestion':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 09 of 10</span>
            <span>•</span>
            <span>Constructive Alignment Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Course Alignment & Constructive Audit
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional syllabus quality check and constructive alignment verification. Verifies the triangular link between Outcomes, Teaching Activities, and Assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="step09-export-pdf-btn"
            onClick={() => {
              setIsPdfExporting(true);
              try {
                exportCourseBlueprintWithGate(course, {}, () => setIsPdfExporting(false));
              } catch (err) {
                console.error('Failed to export PDF:', err);
              } finally {
                setTimeout(() => setIsPdfExporting(false), 800);
              }
            }}
            disabled={isPdfExporting}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-xs"
            title="Export printable PDF of current course audit and structure"
          >
            {isPdfExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span>{isPdfExporting ? 'Exporting...' : 'Export to PDF'}</span>
          </button>
        </div>
      </div>

      {/* Signature Alignment Score Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Readiness Meter */}
        <div className="flex items-center gap-4">
          <div
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold border-4 ${
              summary.readinessScore >= 80
                ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                : summary.readinessScore >= 60
                ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                : 'border-rose-500 text-rose-700 bg-rose-50/50'
            }`}
          >
            <span className="text-2xl leading-none">{summary.readinessScore}%</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">
              Score
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Evaluation Level
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Internal Course Design Readiness Score
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Institutional Quality Enhancement Audit
            </p>
          </div>
        </div>

        {/* Breakdown Counts */}
        <div className="grid grid-cols-3 gap-2 text-center border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-4">
          <div className="p-2 bg-rose-50/70 rounded-lg border border-rose-200">
            <span className="text-lg font-bold text-rose-700 block leading-none">
              {summary.criticalCount}
            </span>
            <span className="text-[10px] font-bold text-rose-800 uppercase mt-1 block">
              Critical
            </span>
          </div>
          <div className="p-2 bg-amber-50/70 rounded-lg border border-amber-200">
            <span className="text-lg font-bold text-amber-700 block leading-none">
              {summary.warningCount}
            </span>
            <span className="text-[10px] font-bold text-amber-800 uppercase mt-1 block">
              Warnings
            </span>
          </div>
          <div className="p-2 bg-emerald-50/70 rounded-lg border border-emerald-200">
            <span className="text-lg font-bold text-emerald-700 block leading-none">
              {summary.passedCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase mt-1 block">
              Passed
            </span>
          </div>
        </div>

        {/* Cognitive Distribution Quick Summary */}
        <div className="space-y-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Cognitive Rigor (Bloom Profile)
          </span>
          <div className="grid grid-cols-3 gap-1 text-[11px]">
            {Object.entries(summary.bloomDistribution).map(([level, count]) => (
              <div
                key={level}
                className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-200 px-2"
              >
                <span className="text-slate-600">{level}</span>
                <span className="font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bloom's Taxonomy Domain Alignment Radar (D3.js) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100/70 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Compass className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Bloom's Taxonomy Domain Radar</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  D3.js Visualization
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualizes alignment coverage across cognitive domains (Remember to Create), tripartite learning domains, and accreditation benchmark targets.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <BloomDomainRadarChart
            course={course}
            onAskCopilot={onAskCopilot}
            onJumpToStep={onJumpToStep}
          />
        </div>
      </div>

      {/* Outcome & Assessment Dependency and Conflict Warning Card */}
      <OutcomeAssessmentDependencyAlert
        course={course}
        onChange={onChange}
        mode="card"
        onNavigateToStep={onJumpToStep}
      />

      {/* Signature Section: The Alignment Triangle (CLO ↕ TLA ↕ Assessment) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              The Signature Alignment Triangle (CLO ↕ TLA ↕ Assessment)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Verifies Constructive Alignment per Outcome
          </span>
        </div>

        <div className="space-y-3">
          {summary.alignmentTriangle.map((item) => (
            <div
              key={item.cloId}
              className={`p-4 rounded-xl border-2 transition ${
                item.alignmentRating === 'Strong'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : item.alignmentRating === 'Partial'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-rose-300 bg-rose-50/30'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono">
                    {item.cloCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Bloom Level: <strong className="text-slate-900">{item.bloomLevel}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.alignmentRating === 'Strong'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : item.alignmentRating === 'Partial'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {item.alignmentRating} Constructive Alignment
                  </span>
                </div>
              </div>

              {/* Triangle 3 Vertices Visual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Vertex 1: Outcome Statement */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Vertex A: Outcome (CLO)
                  </div>
                  <p className="text-xs text-slate-800 line-clamp-2">{item.statement}</p>
                </div>

                {/* Vertex 2: Teaching Activity */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Vertex B: Instruction (TLA)</span>
                    {item.hasTeachingActivity ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </div>
                  {item.hasTeachingActivity ? (
                    <div className="text-xs text-emerald-900 line-clamp-2">
                      {item.teachingActivities.slice(0, 2).join(', ')}
                    </div>
                  ) : (
                    <div className="text-xs text-rose-600 font-semibold">
                      Missing from syllabus schedule
                    </div>
                  )}
                </div>

                {/* Vertex 3: Assessment */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Vertex C: Evaluation (Assessment)</span>
                    {item.hasAssessment ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </div>
                  {item.hasAssessment ? (
                    <div className="text-xs text-emerald-900 line-clamp-2">
                      {item.assessments.join(', ')}
                    </div>
                  ) : (
                    <div className="text-xs text-rose-600 font-semibold">
                      No linked assessment instrument
                    </div>
                  )}
                </div>
              </div>

              {item.recommendation && (
                <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">Audit Action:</span>
                  <span>{item.recommendation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categorized Audit Findings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Categorized Audit Findings ({summary.totalChecks} Rules Checked)
          </h3>

          <div className="flex gap-1">
            {[
              { id: 'all', label: `All (${summary.results.length})` },
              { id: 'critical', label: `Critical (${summary.criticalCount})` },
              { id: 'warning', label: `Warnings (${summary.warningCount})` },
              { id: 'passed', label: `Passed (${summary.passedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFindingTab(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeFindingTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredResults.map((res, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${getSeverityStyle(
                res.severity
              )}`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/80 border">
                    {res.severity}
                  </span>
                  <span className="text-xs font-bold">{res.ruleTitle}</span>
                </div>
                <p className="text-xs opacity-90">{res.message}</p>
                <div className="text-[11px] font-semibold pt-1">
                  <strong>Recommendation:</strong> {res.recommendation}
                </div>
              </div>

              {onJumpToStep && (
                <button
                  type="button"
                  onClick={() => onJumpToStep(res.targetStep)}
                  className="px-3 py-1.5 bg-white rounded-lg border text-xs font-bold text-slate-800 hover:bg-slate-50 transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                >
                  <span>Fix in Step {res.targetStep}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment Plan</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Review & Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
