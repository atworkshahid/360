import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Award,
  Scale,
  Layers,
  FileText,
  HelpCircle,
  Info,
  ChevronDown,
  GitGraph,
} from 'lucide-react';
import { Course, CourseAuditReport, GapIssue } from '../../../types';
import { calculateCourseAudit } from '../../../utils/obeCalculator';
import { analyzeAssessmentPlan } from '../../../utils/assessmentAnalysis';
import { analyzeConstructiveAlignment } from '../../../services/constructiveAlignmentService';
import { AlignmentAnalysisReport } from '../../AlignmentAnalysis/AlignmentAnalysisReport';
import { AlignmentMatrixChart } from '../../AlignmentAnalysis/AlignmentMatrixChart';
import { ConstructiveAlignmentDashboard } from '../../ConstructiveAlignment/ConstructiveAlignmentDashboard';
import { CoursePDFExportModal } from '../../CoursePDFExportModal';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onJumpToStep: (stepNumber: number) => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step13AlignmentAuditor: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onJumpToStep,
  onAskCopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'node-link-map' | 'matrix' | 'assessment-analysis'>('audit');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [showGapGuidance, setShowGapGuidance] = useState(false);
  const auditReport: CourseAuditReport = calculateCourseAudit(course);
  const assessmentAnalysis = analyzeAssessmentPlan(course);
  const constructiveAlignmentReport = useMemo(() => analyzeConstructiveAlignment(course), [course]);

  const flaggedCount =
    assessmentAnalysis.overAssessedCLOs.length +
    assessmentAnalysis.underAssessedCLOs.length +
    assessmentAnalysis.cognitiveDeficitCLOs.length +
    assessmentAnalysis.unassessedCLOs.length;

  const handleAutoBalanceWeights = () => {
    // Distribute 100% across CLOs equally
    if (course.clos.length > 0) {
      const equalWeight = Math.floor(100 / course.clos.length);
      const remainder = 100 - equalWeight * course.clos.length;
      const updatedCLOs = course.clos.map((c, idx) => ({
        ...c,
        weightage: idx === 0 ? equalWeight + remainder : equalWeight,
      }));

      // Distribute assessments
      let updatedAsmts = [...course.assessments];
      if (updatedAsmts.length > 0) {
        const equalAsmt = Math.floor(100 / updatedAsmts.length);
        const asmtRem = 100 - equalAsmt * updatedAsmts.length;
        updatedAsmts = updatedAsmts.map((a, idx) => ({
          ...a,
          weightage: idx === 0 ? equalAsmt + asmtRem : equalAsmt,
        }));
      }

      onChange({
        ...course,
        clos: updatedCLOs,
        assessments: updatedAsmts,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 13</span>
          <span>•</span>
          <span>Quality Verification</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Course Alignment Audit</h2>
            <p className="text-xs text-slate-500 mt-1">
              Automated audit inspecting constructive alignment across the entire instructional chain: PLO ➔ CLO ➔ MLO ➔ Lesson ➔ Activity ➔ Assessment ➔ Rubric ➔ Evidence.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setPdfModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Export Course Audit Report & Configuration as PDF"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export Audit PDF</span>
            </button>
            <button
              onClick={handleAutoBalanceWeights}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Balance Weights (100%)</span>
            </button>
            <button
              onClick={() =>
                onAskCopilot(
                  `Conduct an academic accreditation audit of "${course.title}". Explain how to elevate the health score from ${auditReport.healthScore}% to 100%.`
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consult Copilot on Audit</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 mt-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Curriculum Quality Audit</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
              {auditReport.healthScore}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('node-link-map')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'node-link-map'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitGraph className="w-4 h-4" />
            <span>Constructive Alignment (Node-Link Diagram)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                constructiveAlignmentReport.gaps.length > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {constructiveAlignmentReport.gaps.length > 0
                ? `${constructiveAlignmentReport.gaps.length} gaps`
                : 'Aligned'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
            <span>Alignment Matrix & Bubble Chart</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              Recharts
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assessment-analysis')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'assessment-analysis'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>CLO vs. Assessment Plan Analysis</span>
            {flaggedCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {flaggedCount} flagged
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Balanced
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'node-link-map' ? (
        <ConstructiveAlignmentDashboard
          course={course}
          onChangeCourse={onChange}
          onAskCopilot={onAskCopilot}
          onJumpToStep={onJumpToStep}
        />
      ) : activeTab === 'matrix' ? (
        <AlignmentMatrixChart
          course={course}
          onAskCopilot={onAskCopilot}
          onJumpToStep={onJumpToStep}
        />
      ) : activeTab === 'assessment-analysis' ? (
        <AlignmentAnalysisReport
          course={course}
          onChange={onChange}
          onAskCopilot={onAskCopilot}
          onJumpToStep={onJumpToStep}
        />
      ) : (
        <>
          {/* Main Health Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Accreditation Readiness Score</span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">
              Overall Health: {auditReport.healthScore} / 100
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              {auditReport.healthScore >= 90
                ? 'Excellent alignment. The curriculum meets international outcome-based standards (ABET, HEC, Washington Accord, AACSB).'
                : auditReport.healthScore >= 75
                ? 'Good baseline alignment. Minor gaps detected in weightage balance or evidence coverage.'
                : 'Action required. Critical alignment gaps detected that may prevent course accreditation approval.'}
            </p>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center bg-slate-900/60">
              <span className="text-2xl font-black text-white">{auditReport.healthScore}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Health</span>
            </div>
          </div>
        </div>

        {/* Sub-Score Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Course Info</span>
              <span className="font-bold text-white">{auditReport.subscores.courseInfo}/10</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.courseInfo / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>CLO Quality</span>
              <span className="font-bold text-white">{auditReport.subscores.cloQuality}/15</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.cloQuality / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>PLO Mapping</span>
              <span className="font-bold text-white">{auditReport.subscores.cloPloMapping}/15</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.cloPloMapping / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>MLO Alignment</span>
              <span className="font-bold text-white">{auditReport.subscores.mloAlignment}/15</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.mloAlignment / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Lesson Tasks</span>
              <span className="font-bold text-white">{auditReport.subscores.lessonAlignment}/15</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.lessonAlignment / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Assessments</span>
              <span className="font-bold text-white">{auditReport.subscores.assessmentCoverage}/15</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.assessmentCoverage / 15) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Rubrics</span>
              <span className="font-bold text-white">{auditReport.subscores.rubricAlignment}/10</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.rubricAlignment / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Evidence Rules</span>
              <span className="font-bold text-white">{auditReport.subscores.evidenceCoverage}/5</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full"
                style={{ width: `${(auditReport.subscores.evidenceCoverage / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Matrix & Bubble Chart Quick Access Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-900">
                CLO vs. Assessment Alignment Bubble Matrix (Recharts)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                Visual Analytics
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Evaluate alignment strength, Bloom cognitive level congruence, and weighted contribution across every course learning outcome and assessment instrument.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('matrix')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
        >
          <span>Explore Bubble Chart & Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Gap Detection Issues List with Context-Aware OBE Guidance Tooltip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">
              Detected Alignment Issues ({auditReport.issues.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowGapGuidance((prev) => !prev)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition cursor-pointer"
              title="Learn what mapping gaps are and how to resolve them under OBE standards"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>What are Mapping Gaps?</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showGapGuidance ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {auditReport.criticalCount} Critical • {auditReport.highCount} High Priority
          </span>
        </div>

        {/* Collapsible OBE Best-Practice Mapping Gap Guide */}
        {showGapGuidance && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-indigo-700 shrink-0" />
                <h4 className="font-bold text-indigo-950 text-xs">
                  OBE Concept: Mapping Gaps & Constructive Alignment
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowGapGuidance(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-700 leading-relaxed text-[11px]">
              In Outcome-Based Education (OBE) (Spady, 1994) and John Biggs' Constructive Alignment framework, a <strong>mapping gap</strong> signifies a break in the educational chain where a Course Learning Outcome (CLO) lacks direct formative or summative assessment evidence, has no linked instructional units, or is disassociated from Program Learning Outcomes (PLOs).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-indigo-100 text-[11px]">
              <div className="bg-white/90 p-3 rounded-xl border border-indigo-100/60 shadow-2xs space-y-1">
                <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                  <span>Typical Root Causes</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li>CLOs defined with no corresponding assessment instrument.</li>
                  <li>Bloom's verb mismatch (e.g., "Design" outcome tested with recall MCQs).</li>
                  <li>Over-assessing lower cognitive levels while neglecting higher ones.</li>
                  <li>Missing rubric criteria or evidence achievement thresholds.</li>
                </ul>
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-indigo-100/60 shadow-2xs space-y-1">
                <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  <span>OBE Best Practices for Resolution</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li><strong>Triangulation:</strong> Pair each CLO with 1 formative check + 1 summative evaluation.</li>
                  <li><strong>Cognitive Harmony:</strong> Align assessment tasks to the exact Bloom's cognitive level.</li>
                  <li><strong>Target Stage:</strong> Click the direct "Go to Stage" button on any gap below to resolve.</li>
                  <li><strong>AI Alignment:</strong> Ask OBE Copilot to suggest rubrics and assessment mappings.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {auditReport.issues && auditReport.issues.length > 0 ? (
          <div className="space-y-3">
            {auditReport.issues.map((issue: GapIssue) => {
              const isCritical = issue.severity === 'Critical';
              const isHigh = issue.severity === 'High';
              const targetStage = issue.stageNumber || issue.targetStep || 1;

              return (
                <div
                  key={issue.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isCritical
                      ? 'bg-rose-50/70 border-rose-200'
                      : isHigh
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {isCritical ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isCritical
                              ? 'bg-rose-200 text-rose-800'
                              : isHigh
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{issue.description || issue.message}</p>
                      <p className="text-[11px] text-blue-700 font-medium mt-1">
                        ➔ Recommendation: {issue.recommendation}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJumpToStep(targetStage)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0 self-start sm:self-center"
                  >
                    <span>Go to Stage {targetStage}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-950">Zero Gaps Detected</h4>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Your course exhibits pristine constructive alignment. Every learning outcome cascades cleanly into direct assessments, rubrics, and evidence.
            </p>
          </div>
        )}
      </div>
      </>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evidence Rules</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Proceed to Course Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <CoursePDFExportModal
        course={course}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </div>
  );
};
