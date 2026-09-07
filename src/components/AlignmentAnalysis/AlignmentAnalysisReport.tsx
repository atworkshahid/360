import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Copy,
  Check,
  Printer,
  Sparkles,
  Info,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sliders,
  Award,
} from 'lucide-react';
import { Course, BloomLevel } from '../../types';
import {
  analyzeAssessmentPlan,
  generateBalancedAssessmentPlan,
  generateAlignmentAnalysisMarkdown,
  BLOOM_RANK,
  CLOAssessmentCoverage,
  AssessmentPlanAnalysisReport,
} from '../../utils/assessmentAnalysis';
import { AlignmentMatrixChart } from './AlignmentMatrixChart';

interface AlignmentAnalysisReportProps {
  course: Course;
  onChange?: (updatedCourse: Course) => void;
  onAskCopilot?: (prompt: string) => void;
  onJumpToStep?: (stepNumber: number) => void;
}

export const AlignmentAnalysisReport: React.FC<AlignmentAnalysisReportProps> = ({
  course,
  onChange,
  onAskCopilot,
  onJumpToStep,
}) => {
  const [filterMode, setFilterMode] = useState<
    'all' | 'flagged' | 'under' | 'over' | 'deficit' | 'balanced'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState<string>('');
  const [expandedCLOIds, setExpandedCLOIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    course.clos.forEach((c) => {
      initial[c.id] = true;
    });
    return initial;
  });

  const report: AssessmentPlanAnalysisReport = analyzeAssessmentPlan(course);

  const toggleExpand = (id: string) => {
    setExpandedCLOIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyMarkdown = () => {
    const md = generateAlignmentAnalysisMarkdown(course, report);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleApplyCalibration = () => {
    if (!onChange) return;
    const balancedAssessments = generateBalancedAssessmentPlan(course);
    onChange({
      ...course,
      assessments: balancedAssessments,
    });
    setCalibrationSuccess('Successfully recalibrated assessment plan to 100% and aligned Bloom cognitive levels.');
    setTimeout(() => setCalibrationSuccess(''), 4000);
  };

  // Filter outcomes
  const filteredCoverages = report.cloCoverages.filter((cov) => {
    // Search query
    const matchesSearch =
      cov.cloCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cov.cloStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cov.cloBloomLevel.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'flagged') {
      return (
        cov.coverageStatus !== 'balanced' ||
        cov.bloomAlignmentStatus === 'cognitive-deficit' ||
        cov.bloomAlignmentStatus === 'unassessed'
      );
    }
    if (filterMode === 'under') return cov.coverageStatus === 'under-assessed';
    if (filterMode === 'over') return cov.coverageStatus === 'over-assessed';
    if (filterMode === 'deficit') return cov.bloomAlignmentStatus === 'cognitive-deficit';
    if (filterMode === 'balanced') return cov.coverageStatus === 'balanced' && cov.bloomAlignmentStatus !== 'cognitive-deficit';

    return true;
  });

  const totalFlaggedCount =
    report.overAssessedCLOs.length +
    report.underAssessedCLOs.length +
    report.cognitiveDeficitCLOs.length +
    report.unassessedCLOs.length;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-700/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>Constructive Alignment Analysis</span>
              <span>•</span>
              <span>CLO vs. Assessment Blueprint</span>
            </div>
            <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
              Assessment Plan Alignment & Cognitive Audit
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automated evaluation of assessment weight distribution and Bloom&apos;s cognitive depth across all Course Learning Outcomes (CLOs).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold backdrop-blur-sm transition cursor-pointer"
              title="Copy analysis report in Markdown format"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold backdrop-blur-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {onAskCopilot && (
              <button
                onClick={() =>
                  onAskCopilot(
                    `Review this OBE assessment alignment report for "${course.title}". Balance score: ${report.overallBalanceScore}%. Please advise on how to resolve the flagged over/under-assessed CLOs.`
                  )
                }
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Advisor</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Health Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                Alignment Score
              </span>
              <ShieldCheck
                className={`w-4 h-4 ${
                  report.overallBalanceScore >= 80
                    ? 'text-emerald-400'
                    : report.overallBalanceScore >= 65
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-white">{report.overallBalanceScore}%</span>
              <span className="text-slate-400 text-[11px]">/ 100%</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">
              {report.overallBalanceScore >= 80
                ? 'Strong constructive alignment'
                : 'Imbalances require adjustment'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                Total Assessment Weight
              </span>
              {report.isTotalWeightageValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-white">{report.totalConfiguredWeightage}%</span>
              <span className="text-slate-400 text-[11px]">/ 100%</span>
            </div>
            <span
              className={`text-[10px] font-semibold block mt-1 ${
                report.isTotalWeightageValid ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {report.isTotalWeightageValid
                ? 'Accreditation target satisfied'
                : `Discrepancy: ${report.totalConfiguredWeightage - 100 > 0 ? '+' : ''}${
                    report.totalConfiguredWeightage - 100
                  }%`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                Flagged Weight Imbalances
              </span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-amber-300">
                {report.underAssessedCLOs.length + report.overAssessedCLOs.length}
              </span>
              <span className="text-slate-400 text-[11px]">outcomes</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">
              {report.underAssessedCLOs.length} under-assessed • {report.overAssessedCLOs.length} over-assessed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                Cognitive Depth Deficits
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-rose-300">
                {report.cognitiveDeficitCLOs.length}
              </span>
              <span className="text-slate-400 text-[11px]">outcomes</span>
            </div>
            <span className="text-[10px] text-slate-300 block mt-1">
              {report.cognitiveDeficitCLOs.length > 0
                ? 'Tested below Bloom target tier'
                : 'All outcomes tested at or above target Bloom'}
            </span>
          </div>
        </div>

        {/* Action button if not balanced */}
        {onChange && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <p className="text-xs text-slate-300">
              {totalFlaggedCount > 0
                ? 'Click below to automatically re-balance assessment weight shares to 100% and align cognitive Bloom verbs.'
                : 'Assessment blueprint is constructively aligned. You may re-calibrate anytime.'}
            </p>
            <button
              onClick={handleApplyCalibration}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-sm transition flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto-Calibrate Assessment Plan</span>
            </button>
          </div>
        )}

        {calibrationSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{calibrationSuccess}</span>
          </div>
        )}
      </div>

      {/* Visual Recharts Alignment Matrix & Bubble Chart */}
      <AlignmentMatrixChart
        course={course}
        onAskCopilot={onAskCopilot}
        onJumpToStep={onJumpToStep}
        title="CLO vs. Assessment Alignment Strength Matrix (Recharts)"
        subtitle="Visual bubble scatter chart & heatmap matrix showing cognitive alignment and weight distribution between outcomes and assessment tasks."
      />

      {/* Comparative Visual Matrix / Weight vs Bloom Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Constructive Alignment Matrix: Target vs. Actual Weight & Bloom Rigor
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct comparison showing whether each outcome is over-assessed, under-assessed, or cognitive deficit.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span className="inline-flex items-center space-x-1 text-purple-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
              <span>Over-Assessed</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>Under-Assessed</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-rose-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              <span>Cognitive Deficit</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              <span>Harmonized</span>
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Target Bloom</th>
                <th className="py-2.5 px-3">Highest Assessment Bloom</th>
                <th className="py-2.5 px-3 text-center">Cognitive Match</th>
                <th className="py-2.5 px-3 text-right">Target Wt.</th>
                <th className="py-2.5 px-3 text-right">Assessed Wt.</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-center">Weight Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.cloCoverages.map((cov) => {
                const isOver = cov.coverageStatus === 'over-assessed';
                const isUnder = cov.coverageStatus === 'under-assessed';
                const isDeficit = cov.bloomAlignmentStatus === 'cognitive-deficit';

                return (
                  <tr
                    key={cov.cloId}
                    className={`hover:bg-slate-50/80 transition ${
                      isUnder
                        ? 'bg-amber-50/30'
                        : isOver
                        ? 'bg-purple-50/30'
                        : isDeficit
                        ? 'bg-rose-50/30'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                          {cov.cloCode}
                        </span>
                        <span className="font-semibold text-slate-800 line-clamp-1 max-w-xs" title={cov.cloStatement}>
                          {cov.cloStatement}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                        {cov.cloBloomLevel} (L{BLOOM_RANK[cov.cloBloomLevel] || 3})
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {cov.maxAssessmentBloom !== 'None' ? (
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isDeficit
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {cov.maxAssessmentBloom} (L{BLOOM_RANK[cov.maxAssessmentBloom as BloomLevel] || 0})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No Assessments</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {cov.bloomAlignmentStatus === 'optimal-match' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Exact Match</span>
                        </span>
                      )}
                      {cov.bloomAlignmentStatus === 'higher-order' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          <TrendingUp className="w-3 h-3 text-blue-600" />
                          <span>Exceeds Target</span>
                        </span>
                      )}
                      {cov.bloomAlignmentStatus === 'cognitive-deficit' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Cognitive Deficit</span>
                        </span>
                      )}
                      {cov.bloomAlignmentStatus === 'unassessed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          <span>Unassessed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-700">
                      {cov.targetWeightage}%
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-indigo-900">
                      {cov.assessedWeightage}%
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-extrabold ${
                          cov.weightVariance > 0
                            ? 'text-purple-700'
                            : cov.weightVariance < 0
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {cov.weightVariance > 0 ? `+${cov.weightVariance}%` : `${cov.weightVariance}%`}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {cov.coverageStatus === 'over-assessed' && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
                          Over-Assessed
                        </span>
                      )}
                      {cov.coverageStatus === 'under-assessed' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Under-Assessed
                        </span>
                      )}
                      {cov.coverageStatus === 'balanced' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Balanced
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

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Outcomes ({report.cloCoverages.length})
          </button>

          <button
            onClick={() => setFilterMode('flagged')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              filterMode === 'flagged'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Flagged Issues</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-900 text-[10px]">
              {totalFlaggedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('under')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              filterMode === 'under'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Under-Assessed</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px]">
              {report.underAssessedCLOs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('over')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              filterMode === 'over'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Over-Assessed</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px]">
              {report.overAssessedCLOs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('deficit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              filterMode === 'deficit'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Cognitive Deficits</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-900 text-[10px]">
              {report.cognitiveDeficitCLOs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('balanced')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              filterMode === 'balanced'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Balanced</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px]">
              {report.balancedCLOs.length}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search outcome code, statement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Outcome-by-Outcome Diagnostic Cards */}
      <div className="space-y-4">
        {filteredCoverages.length > 0 ? (
          filteredCoverages.map((cov) => {
            const isOver = cov.coverageStatus === 'over-assessed';
            const isUnder = cov.coverageStatus === 'under-assessed';
            const isDeficit = cov.bloomAlignmentStatus === 'cognitive-deficit';
            const isExpanded = !!expandedCLOIds[cov.cloId];

            return (
              <div
                key={cov.cloId}
                className={`bg-white rounded-2xl border shadow-xs transition overflow-hidden ${
                  isDeficit
                    ? 'border-rose-300 ring-1 ring-rose-200/60'
                    : isUnder
                    ? 'border-amber-300 ring-1 ring-amber-200/60'
                    : isOver
                    ? 'border-purple-300 ring-1 ring-purple-200/60'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Bar */}
                <div
                  onClick={() => toggleExpand(cov.cloId)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition select-none"
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                        isDeficit
                          ? 'bg-rose-600 text-white'
                          : isUnder
                          ? 'bg-amber-500 text-white'
                          : isOver
                          ? 'bg-purple-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {cov.cloCode}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {cov.cloCode}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          Bloom: {cov.cloBloomLevel} ({cov.cloBloomVerb})
                        </span>

                        {isOver && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            Over-Assessed (+{cov.weightVariance}%)
                          </span>
                        )}
                        {isUnder && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Under-Assessed ({cov.weightVariance}%)
                          </span>
                        )}
                        {isDeficit && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Cognitive Deficit</span>
                          </span>
                        )}
                        {!isOver && !isUnder && !isDeficit && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Constructively Balanced</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {cov.cloStatement}
                      </p>
                    </div>
                  </div>

                  {/* Weight metrics & Toggle */}
                  <div className="flex items-center space-x-5 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1.5 justify-end">
                        <span className="text-xs text-slate-400 font-medium">Assessed:</span>
                        <span className="text-base font-black text-slate-900">
                          {cov.assessedWeightage}%
                        </span>
                        <span className="text-xs text-slate-400">/ {cov.targetWeightage}%</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold block ${
                          cov.weightVariance > 0
                            ? 'text-purple-700'
                            : cov.weightVariance < 0
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        Variance: {cov.weightVariance > 0 ? `+${cov.weightVariance}%` : `${cov.weightVariance}%`}
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Audit */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs">
                    {/* Weight Comparison Progress Bar */}
                    <div className="space-y-1.5 pt-4">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">
                          Assessed Weight ({cov.assessedWeightage}%) vs Target Weight ({cov.targetWeightage}%)
                        </span>
                        <span className="font-bold text-slate-700">
                          {cov.assessedWeightage >= cov.targetWeightage
                            ? `${Math.round((cov.assessedWeightage / Math.max(1, cov.targetWeightage)) * 100)}% of target`
                            : `${Math.round((cov.assessedWeightage / Math.max(1, cov.targetWeightage)) * 100)}% of target`}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver
                              ? 'bg-purple-500'
                              : isUnder
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (cov.assessedWeightage / Math.max(1, cov.targetWeightage)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Pedagogical Diagnosis & Suggested Remedy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Pedagogical Diagnosis
                        </span>
                        <p className="text-slate-700 text-xs leading-relaxed">
                          {cov.pedagogicalDiagnosis}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                          Suggested Remedial Action
                        </span>
                        <p className="text-blue-950 text-xs leading-relaxed font-medium">
                          {cov.suggestedAction}
                        </p>
                      </div>
                    </div>

                    {/* Contributing Assessment Table */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Contributing Assessment Instruments ({cov.linkedAssessments.length})
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {cov.formativeCount} Formative • {cov.summativeCount} Summative
                        </span>
                      </div>

                      {cov.linkedAssessments.length > 0 ? (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                              <tr>
                                <th className="py-2 px-3">Assessment Title</th>
                                <th className="py-2 px-3">Type</th>
                                <th className="py-2 px-3">Task Bloom</th>
                                <th className="py-2 px-3 text-right">Total Marks</th>
                                <th className="py-2 px-3 text-right">Total Weight</th>
                                <th className="py-2 px-3 text-right">CLO Share</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {cov.linkedAssessments.map((asmt) => (
                                <tr key={asmt.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-bold text-slate-800">
                                    <div className="flex items-center space-x-2">
                                      <span>{asmt.name}</span>
                                      {asmt.isSummative ? (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                                          Summative
                                        </span>
                                      ) : (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                                          Formative
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600">{asmt.type}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                      {asmt.bloomLevel}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                                    {asmt.weightage ? `${asmt.weightage} pts` : '—'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                                    {asmt.weightage}%
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-extrabold text-indigo-700">
                                    {asmt.shareForThisCLO}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>
                              <strong>Critical Accreditation Gap:</strong> No assessments are currently mapped to {cov.cloCode}.
                            </span>
                          </div>
                          {onJumpToStep && (
                            <button
                              onClick={() => onJumpToStep(9)}
                              className="px-2.5 py-1 bg-white rounded-lg border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50 transition cursor-pointer"
                            >
                              Add in Step 9 ➔
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h5 className="text-sm font-bold text-slate-800">No Outcomes Match Filter</h5>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or switching the filter pills above.
            </p>
          </div>
        )}
      </div>

      {/* Systemic Findings & Accreditation Action Plan */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>Accreditation Synthesis & Curriculum Quality Assurance</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Systemic Assessment Findings:</span>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              {report.systemicFindings.map((f, i) => (
                <li key={i} className="leading-relaxed">
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Action Recommendations:</span>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              {report.concreteRecommendations.map((r, i) => (
                <li key={i} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
