import React, { useState } from 'react';
import {
  Eye,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  Target,
  Award,
  Layers,
  BookOpen,
  Scale,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  UserCheck,
  Send,
  MessageSquare,
  AlertCircle,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Course, CLO, PLO, Assessment, AcademicReview } from '../../types';
import { calculateCourseAudit } from '../../utils/obeCalculator';
import { downloadCourseDocx } from '../../utils/docxExport';
import { PrintFriendlyView } from './PrintFriendlyView';

interface StakeholderViewProps {
  course: Course;
  onChange: (updatedCourse: Course) => void;
  onExitStakeholderView: () => void;
  onOpenPDFExport: () => void;
}

export const StakeholderView: React.FC<StakeholderViewProps> = ({
  course,
  onChange,
  onExitStakeholderView,
  onOpenPDFExport,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'outcomes' | 'assessments' | 'matrix'>('all');
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState<string>(
    course.academicReview?.reviewerName || ''
  );
  const [reviewerRole, setReviewerRole] = useState<string>(
    course.academicReview?.reviewerRole || 'Academic Committee / Industry Stakeholder'
  );
  const [feedbackText, setFeedbackText] = useState<string>(
    course.academicReview?.feedback || ''
  );
  const [approvalStatus, setApprovalStatus] = useState<'Pending' | 'Approved' | 'Revision Required'>(
    course.academicReview?.status || 'Pending'
  );
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [isDocxDownloading, setIsDocxDownloading] = useState<boolean>(false);
  const [printFriendlyOpen, setPrintFriendlyOpen] = useState<boolean>(false);

  const handleExportDocx = async () => {
    setIsDocxDownloading(true);
    try {
      await downloadCourseDocx(course);
    } catch (err) {
      console.error('Failed to export Word document:', err);
    } finally {
      setIsDocxDownloading(false);
    }
  };

  const auditReport = calculateCourseAudit(course);

  // Total assessment weightage
  const totalAssessmentWeight = course.assessments.reduce(
    (sum, a) => sum + (Number(a.weightage) || 0),
    0
  );

  // Mapping lookup: which assessments measure which CLO
  const cloAssessmentMap: Record<string, Assessment[]> = {};
  course.clos.forEach((clo) => {
    cloAssessmentMap[clo.id] = course.assessments.filter((a) =>
      a.linkedCLOIds.includes(clo.id)
    );
  });

  // Calculate high-level stats
  const totalPLOs = course.plos.length;
  const totalCLOs = course.clos.length;
  const mappedCLOsCount = course.clos.filter(
    (c) => c.mappedPLOs && c.mappedPLOs.length > 0
  ).length;
  const assessedCLOsCount = course.clos.filter(
    (c) => (cloAssessmentMap[c.id] || []).length > 0
  ).length;

  const handleSaveReview = () => {
    const updatedReview: AcademicReview = {
      status: approvalStatus,
      reviewerName: reviewerName || 'Stakeholder Reviewer',
      reviewerRole: reviewerRole,
      reviewDate: new Date().toISOString(),
      feedback: feedbackText,
      checklistItems: course.academicReview?.checklistItems || [
        { id: '1', label: 'Outcomes are clearly measurable and appropriate for course level', checked: true },
        { id: '2', label: 'Assessments directly evaluate the stated competencies', checked: true },
        { id: '3', label: 'Grading weightage reflects course priorities without overload', checked: true },
      ],
      outcomeAlignmentScore: auditReport.healthScore,
      recommendation: approvalStatus,
    };

    onChange({
      ...course,
      academicReview: updatedReview,
      updatedAt: new Date().toISOString(),
    });

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Executive Stakeholder Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
                <Eye className="w-3.5 h-3.5 text-indigo-300" />
                Stakeholder Review View
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-mono">
                {course.code || 'OBE-CRS'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                {course.creditHours} Credit Hours • {course.durationWeeks} Weeks
              </span>
              {course.academicReview?.status && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    course.academicReview.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : course.academicReview.status === 'Revision Required'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  Review: {course.academicReview.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {course.title || 'Untitled Course Curriculum'}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {course.overview ||
                course.description ||
                'High-level educational blueprint designed under Outcome-Based Education (OBE) principles.'}
            </p>

            {course.capstoneGoal && (
              <div className="pt-2 border-t border-white/10 flex items-start gap-2.5 text-xs text-indigo-200/90">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Target Graduate Capability: </span>
                  <span>{course.capstoneGoal}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions for Reviewers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={onExitStakeholderView}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-indigo-50 shadow-md transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Designer View</span>
            </button>

            <button
              id="stakeholder-export-docx-btn"
              onClick={handleExportDocx}
              disabled={isDocxDownloading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs border border-blue-400/30 backdrop-blur-xs transition cursor-pointer"
              title="Download formatted Microsoft Word document (.docx)"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>{isDocxDownloading ? 'Exporting...' : 'Export Word (.docx)'}</span>
            </button>

            <button
              type="button"
              id="stakeholder-print-friendly-btn"
              onClick={() => setPrintFriendlyOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition cursor-pointer"
              title="Open clean, single-page print-friendly layout stripped of UI for physical printing or simplified reading"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>Print-Friendly View</span>
            </button>

            <button
              onClick={onOpenPDFExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-300" />
              <span>Export Executive PDF</span>
            </button>
          </div>
        </div>

        {/* High-Level Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xl font-black text-white">{totalCLOs}</div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Course Outcomes
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xl font-black text-indigo-300">
              {totalPLOs > 0 ? `${mappedCLOsCount}/${totalCLOs}` : 'None'}
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Program Outcomes Aligned
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xl font-black text-emerald-400">
              {course.assessments.length}
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Assessment Milestones
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xl font-black text-amber-300">
              {auditReport.healthScore}%
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Accreditation Health
            </div>
          </div>
        </div>
      </div>

      {/* View Filter Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'outcomes'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Learning Outcomes ({totalCLOs})
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'assessments'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assessment Mappings ({course.assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alignment Matrix
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Non-technical view • Implementation details hidden</span>
        </div>
      </div>

      {/* ================= SECTION 1: HIGH-LEVEL OUTCOMES ================= */}
      {(activeTab === 'all' || activeTab === 'outcomes') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>High-Level Course Learning Outcomes (CLOs)</span>
              </h2>
              <p className="text-xs text-slate-500">
                What students will know, execute, and deliver upon course completion.
              </p>
            </div>
            <div className="text-xs text-slate-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-medium">
              {assessedCLOsCount === totalCLOs ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% of Outcomes Measured
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  {assessedCLOsCount} of {totalCLOs} Outcomes Directly Measured
                </span>
              )}
            </div>
          </div>

          {/* CLO Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.clos.map((clo, idx) => {
              const mappedAssessments = cloAssessmentMap[clo.id] || [];
              const mappedPLOs = clo.mappedPLOs || [];

              return (
                <div
                  key={clo.id || idx}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {clo.code || `CLO ${idx + 1}`}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {clo.competency || 'Core Competency'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {clo.weightage}% Weight
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            clo.bloomLevel === 'Create' || clo.bloomLevel === 'Evaluate'
                              ? 'bg-purple-100 text-purple-800'
                              : clo.bloomLevel === 'Analyze' || clo.bloomLevel === 'Apply'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {clo.bloomLevel} Level
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {clo.statement}
                    </p>

                    {/* Program Outcomes Alignment */}
                    {mappedPLOs.length > 0 ? (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Degree Competency Alignment:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {mappedPLOs.map((mp, pIdx) => {
                            const matchedPLO = course.plos.find((p) => p.id === mp.ploId);
                            return (
                              <span
                                key={pIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-800"
                                title={matchedPLO?.description || mp.rationale || ''}
                              >
                                <Award className="w-3 h-3 text-indigo-600" />
                                <span className="font-bold">{matchedPLO?.code || 'PLO'}:</span>
                                <span className="truncate max-w-[160px]">
                                  {matchedPLO?.title || 'Program Outcome'}
                                </span>
                                <span className="text-[10px] font-black uppercase text-indigo-600 bg-white px-1 rounded ml-0.5">
                                  {mp.level[0]}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Not yet mapped to a degree Program Learning Outcome (PLO).</span>
                      </div>
                    )}
                  </div>

                  {/* Assessment Cross-Reference */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Evaluated By:</span>
                    <div className="flex flex-wrap items-center gap-1 justify-end">
                      {mappedAssessments.length > 0 ? (
                        mappedAssessments.map((a, aIdx) => (
                          <span
                            key={a.id || aIdx}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]"
                          >
                            {a.name} ({a.weightage}%)
                          </span>
                        ))
                      ) : (
                        <span className="text-amber-600 font-semibold text-[11px]">
                          Unassessed in plan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= SECTION 2: ASSESSMENT MAPPINGS & STRATEGY ================= */}
      {(activeTab === 'all' || activeTab === 'assessments') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>Assessment Strategy & Weightage Distribution</span>
              </h2>
              <p className="text-xs text-slate-500">
                High-level grading plan ensuring comprehensive evaluation of all learning competencies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  totalAssessmentWeight === 100
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                Total Weight: {totalAssessmentWeight}% {totalAssessmentWeight === 100 ? '✓ Balanced' : '(Target: 100%)'}
              </span>
            </div>
          </div>

          {/* Assessment Distribution Progress Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Milestone Weight Allocation</span>
              <span>100% Total Course Grade</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
              {course.assessments.map((a, idx) => {
                const colors = [
                  'bg-indigo-600',
                  'bg-emerald-600',
                  'bg-violet-600',
                  'bg-amber-600',
                  'bg-sky-600',
                  'bg-rose-600',
                ];
                const bg = colors[idx % colors.length];
                return (
                  <div
                    key={a.id || idx}
                    className={`${bg} h-full transition-all`}
                    style={{ width: `${Math.max(2, (Number(a.weightage) || 0))}%` }}
                    title={`${a.name}: ${a.weightage}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              {course.assessments.map((a, idx) => {
                const colors = [
                  'bg-indigo-600',
                  'bg-emerald-600',
                  'bg-violet-600',
                  'bg-amber-600',
                  'bg-sky-600',
                  'bg-rose-600',
                ];
                const bg = colors[idx % colors.length];
                return (
                  <div key={a.id || idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className={`w-2.5 h-2.5 rounded-full ${bg}`} />
                    <span className="font-semibold text-slate-800">{a.name}</span>
                    <span className="text-slate-400">({a.weightage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.assessments.map((assessment, idx) => {
              const mappedCLOs = course.clos.filter((c) =>
                assessment.linkedCLOIds.includes(c.id)
              );

              return (
                <div
                  key={assessment.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {assessment.type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {assessment.name}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-slate-900">
                          {assessment.weightage}%
                        </span>
                        <span className="block text-[10px] text-slate-400">Course Grade</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Threshold: {assessment.achievementThreshold}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {assessment.isSummative ? 'Summative Milestone' : 'Formative Check'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                        {assessment.bloomLevel} Level
                      </span>
                    </div>

                    {/* Outcomes Assessed */}
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Demonstrates Course Outcomes:
                      </span>
                      {mappedCLOs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mappedCLOs.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[11px]"
                              title={c.statement}
                            >
                              {c.code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium italic">
                          No outcomes tagged to this assessment
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Evidence Mode:</span>
                    <span className="font-semibold text-slate-700">
                      {assessment.directOrIndirect || 'Direct Evidence'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= SECTION 3: OUTCOME TO ASSESSMENT ALIGNMENT MATRIX ================= */}
      {(activeTab === 'all' || activeTab === 'matrix') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Executive Alignment Matrix (CLO ➔ Assessment)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Visual proof of accreditation coverage verifying that each student competency is validated.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Legend: <span className="font-bold text-emerald-700">✓ Evaluated</span> • <span className="text-slate-400">— Not directly tested</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-3.5 font-bold min-w-[220px]">Course Outcome (CLO)</th>
                    <th className="p-3.5 font-bold text-center w-24">Cognitive</th>
                    <th className="p-3.5 font-bold text-center w-20">Weight</th>
                    {course.assessments.map((a) => (
                      <th
                        key={a.id}
                        className="p-3.5 font-bold text-center border-l border-slate-200 min-w-[110px]"
                      >
                        <div className="truncate max-w-[130px]" title={a.name}>
                          {a.name}
                        </div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {a.weightage}%
                        </div>
                      </th>
                    ))}
                    <th className="p-3.5 font-bold text-center border-l border-slate-200 w-24">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {course.clos.map((clo, idx) => {
                    const isCovered = (cloAssessmentMap[clo.id] || []).length > 0;
                    return (
                      <tr key={clo.id || idx} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-medium text-slate-900">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                              {clo.code}
                            </span>
                            <span className="text-xs text-slate-700 line-clamp-2" title={clo.statement}>
                              {clo.statement}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {clo.bloomLevel}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-700">
                          {clo.weightage}%
                        </td>
                        {course.assessments.map((a) => {
                          const isAssessed = a.linkedCLOIds.includes(clo.id);
                          return (
                            <td
                              key={a.id}
                              className={`p-3.5 text-center border-l border-slate-100 ${
                                isAssessed ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              {isAssessed ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3.5 text-center border-l border-slate-100">
                          {isCovered ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Validated
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Gap
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION 4: STAKEHOLDER ENDORSEMENT & SIGN-OFF ================= */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stakeholder Review & Committee Endorsement
              </h3>
              <p className="text-xs text-slate-500">
                Record formal feedback, advisory suggestions, and accreditation endorsement.
              </p>
            </div>
          </div>
          {course.academicReview?.reviewDate && (
            <span className="text-xs text-slate-400">
              Last saved: {new Date(course.academicReview.reviewDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reviewer Name / Title
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Dr. Arthur Vance, Curriculum Chair"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stakeholder Role
            </label>
            <select
              value={reviewerRole}
              onChange={(e) => setReviewerRole(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="Curriculum Committee Member">Curriculum Committee Member</option>
              <option value="Dean / Department Chair">Dean / Department Chair</option>
              <option value="Industry Advisory Board">Industry Advisory Board</option>
              <option value="Accreditation Evaluator">Accreditation Evaluator</option>
              <option value="External Peer Reviewer">External Peer Reviewer</option>
              <option value="Student Representative">Student Representative</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recommendation Status
            </label>
            <select
              value={approvalStatus}
              onChange={(e) =>
                setApprovalStatus(e.target.value as 'Pending' | 'Approved' | 'Revision Required')
              }
              className={`w-full px-3 py-2 text-xs border rounded-lg font-bold outline-none ${
                approvalStatus === 'Approved'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : approvalStatus === 'Revision Required'
                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <option value="Pending">Pending Decision</option>
              <option value="Approved">Approved for Accreditation</option>
              <option value="Revision Required">Revisions Requested</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Stakeholder Evaluation Notes & Comments
          </label>
          <textarea
            rows={3}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Document any strengths, suggestions for industry alignment, or required adjustments to course outcomes or assessment milestones..."
            className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {saveSuccessNotice ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Review feedback recorded and saved to course state!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Endorsements are synchronized directly to the course audit file.
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="stakeholder-bottom-print-friendly-btn"
              onClick={() => setPrintFriendlyOpen(true)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              title="Open clean, single-page print-friendly layout stripped of UI for physical printing or simplified reading"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print-Friendly View</span>
            </button>
            <button
              onClick={onOpenPDFExport}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
            >
              Export PDF Dossier
            </button>
            <button
              onClick={handleSaveReview}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Record Stakeholder Sign-Off</span>
            </button>
          </div>
        </div>
      </section>

      {/* Print-Friendly View */}
      {printFriendlyOpen && (
        <PrintFriendlyView
          course={course}
          onClose={() => setPrintFriendlyOpen(false)}
        />
      )}
    </div>
  );
};
