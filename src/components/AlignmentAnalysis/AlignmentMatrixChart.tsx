import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Info,
  Maximize2,
  Layers,
  Filter,
  ArrowRight,
  TrendingUp,
  Brain,
  Sliders,
  Award,
} from 'lucide-react';
import { Course, CLO, Assessment, BloomLevel } from '../../types';
import { BLOOM_RANK } from '../../utils/assessmentAnalysis';

export interface AlignmentMatrixChartProps {
  course: Course;
  onAskCopilot?: (prompt: string) => void;
  onJumpToStep?: (stepNumber: number) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export interface AlignmentCellData {
  id: string;
  cloId: string;
  cloCode: string;
  cloStatement: string;
  cloBloom: BloomLevel;
  cloTargetWeight: number;
  asmtId: string;
  asmtName: string;
  asmtType: string;
  asmtWeight: number;
  asmtBloom: BloomLevel;
  asmtIndex: number;
  cloIndex: number;
  isSummative: boolean;
  isLinked: boolean;
  shareWeight: number;
  cognitiveMatch: 'optimal' | 'higher-order' | 'deficit' | 'unassessed';
  cognitiveDiff: number;
  alignmentStrength: number; // 0 to 100
  tier: 'Optimal' | 'Strong' | 'Moderate' | 'Deficit' | 'Unassessed';
  color: string;
  rubricCriteriaCount: number;
  questionCount: number;
  recommendation?: string;
}

export const AlignmentMatrixChart: React.FC<AlignmentMatrixChartProps> = ({
  course,
  onAskCopilot,
  onJumpToStep,
  title = 'CLO vs. Assessment Alignment Strength Matrix',
  subtitle = 'Interactive visual matrix and bubble chart illustrating cognitive match and weightage alignment between learning outcomes and assessment methods.',
  compact = false,
}) => {
  const [viewMode, setViewMode] = useState<'bubble' | 'matrix' | 'barchart'>('bubble');
  const [selectedCell, setSelectedCell] = useState<AlignmentCellData | null>(null);
  const [filterTier, setFilterTier] = useState<'all' | 'optimal' | 'moderate' | 'deficit' | 'unlinked'>('all');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('all');

  const clos = course.clos || [];
  const assessments = course.assessments || [];

  // Get unique assessment types
  const assessmentTypes = useMemo(() => {
    const types = Array.from(new Set(assessments.map((a) => a.type || 'Other')));
    return types;
  }, [assessments]);

  // Compute cell alignment data
  const matrixData = useMemo(() => {
    const cells: AlignmentCellData[] = [];

    clos.forEach((clo, cIdx) => {
      const cloRank = BLOOM_RANK[clo.bloomLevel] || 3;
      const targetWeight = Number(clo.weightage) || 0;

      assessments.forEach((asmt, aIdx) => {
        const isLinked =
          (asmt.linkedCLOIds || []).includes(clo.id) ||
          (asmt.linkedCLOIds || []).includes(clo.code);

        const asmtRank = BLOOM_RANK[asmt.bloomLevel] || 3;
        const cognitiveDiff = asmtRank - cloRank;

        let cognitiveMatch: 'optimal' | 'higher-order' | 'deficit' | 'unassessed' = 'unassessed';
        if (isLinked) {
          if (cognitiveDiff === 0) {
            cognitiveMatch = 'optimal';
          } else if (cognitiveDiff > 0) {
            cognitiveMatch = 'higher-order';
          } else {
            cognitiveMatch = 'deficit';
          }
        }

        // Questions linked to this CLO in this assessment
        const questionCount = (asmt.questions || []).filter(
          (q) => q.cloId === clo.id || q.cloId === clo.code
        ).length;

        // Rubrics linked
        const rubric = (course.rubrics || []).find((r) => r.id === asmt.rubricId || r.assessmentId === asmt.id);
        const rubricCriteriaCount = rubric
          ? (rubric.criteria || []).filter((rc) => rc.cloId === clo.id || rc.cloId === clo.code).length
          : 0;

        // Weight share allocated to this outcome
        const totalCLOsInAsmt = Math.max(1, (asmt.linkedCLOIds || []).length);
        const shareWeight = isLinked ? Math.round(((asmt.weightage || 0) / totalCLOsInAsmt) * 10) / 10 : 0;

        // Calculate alignment strength (0 to 100)
        let alignmentStrength = 0;
        let tier: 'Optimal' | 'Strong' | 'Moderate' | 'Deficit' | 'Unassessed' = 'Unassessed';
        let color = '#cbd5e1'; // slate-300
        let recommendation: string | undefined = undefined;

        if (isLinked) {
          // Base score from weight share relative to target (up to 50 points)
          const weightRatio = targetWeight > 0 ? shareWeight / targetWeight : 0.5;
          const weightScore = Math.min(50, Math.round(weightRatio * 50));

          // Cognitive alignment score (up to 40 points)
          let cogScore = 40;
          if (cognitiveDiff === 0) {
            cogScore = 40;
          } else if (cognitiveDiff === 1) {
            cogScore = 38; // 1 level higher is still great
          } else if (cognitiveDiff > 1) {
            cogScore = 32; // significantly higher might be overly demanding
          } else if (cognitiveDiff === -1) {
            cogScore = 20; // 1 level deficit
          } else {
            cogScore = 10; // severe deficit (-2 or more levels)
          }

          // Rigor bonus for questions or rubrics (up to 10 points)
          const rigorBonus = Math.min(10, questionCount * 3 + rubricCriteriaCount * 4 + (asmt.isSummative ? 3 : 1));

          alignmentStrength = Math.min(100, Math.max(15, weightScore + cogScore + rigorBonus));

          if (cognitiveMatch === 'deficit') {
            tier = 'Deficit';
            color = '#f43f5e'; // rose-500
            recommendation = `Increase assessment rigor from ${asmt.bloomLevel} to ${clo.bloomLevel} to avoid cognitive deficit.`;
          } else if (alignmentStrength >= 75) {
            tier = 'Optimal';
            color = '#10b981'; // emerald-500
            recommendation = `Strong constructive alignment. Outcome verified at or above target Bloom level (${clo.bloomLevel}).`;
          } else if (alignmentStrength >= 50) {
            tier = 'Strong';
            color = '#6366f1'; // indigo-500
            recommendation = `Solid alignment. Consider allocating more questions or direct rubric criteria to reinforce mastery.`;
          } else {
            tier = 'Moderate';
            color = '#f59e0b'; // amber-500
            recommendation = `Light coverage (${shareWeight}% marks). Ensure this outcome is also supported by formative or summative checkpoints.`;
          }
        } else {
          tier = 'Unassessed';
          color = '#e2e8f0'; // slate-200
          recommendation = `This assessment does not measure ${clo.code}. If intended, link this outcome in Assessment Designer (Stage 9).`;
        }

        cells.push({
          id: `${clo.id}-${asmt.id}`,
          cloId: clo.id,
          cloCode: clo.code,
          cloStatement: clo.statement,
          cloBloom: clo.bloomLevel,
          cloTargetWeight: targetWeight,
          asmtId: asmt.id,
          asmtName: asmt.name,
          asmtType: asmt.type,
          asmtWeight: asmt.weightage,
          asmtBloom: asmt.bloomLevel,
          asmtIndex: aIdx,
          cloIndex: cIdx,
          isSummative: asmt.isSummative !== false,
          isLinked,
          shareWeight,
          cognitiveMatch,
          cognitiveDiff,
          alignmentStrength,
          tier,
          color,
          rubricCriteriaCount,
          questionCount,
          recommendation,
        });
      });
    });

    return cells;
  }, [clos, assessments, course.rubrics]);

  // Filtered cells for scatter bubble chart
  const filteredData = useMemo(() => {
    return matrixData.filter((cell) => {
      if (selectedAssessmentType !== 'all' && cell.asmtType !== selectedAssessmentType) {
        return false;
      }
      if (filterTier === 'optimal') return cell.tier === 'Optimal' || cell.tier === 'Strong';
      if (filterTier === 'moderate') return cell.tier === 'Moderate';
      if (filterTier === 'deficit') return cell.tier === 'Deficit';
      if (filterTier === 'unlinked') return cell.tier === 'Unassessed';
      return true;
    });
  }, [matrixData, selectedAssessmentType, filterTier]);

  // Points specifically with positive linkage for the Bubble chart (so unlinked points don't clutter bubble chart unless requested)
  const bubbleData = useMemo(() => {
    return filteredData.filter((d) => (filterTier === 'unlinked' ? true : d.isLinked));
  }, [filteredData, filterTier]);

  // Bar chart aggregate data: stacked contribution of each assessment to CLOs
  const barChartData = useMemo(() => {
    return assessments.map((asmt) => {
      const entry: Record<string, string | number> = {
        name: asmt.name.length > 18 ? `${asmt.name.slice(0, 18)}…` : asmt.name,
        fullName: asmt.name,
        type: asmt.type,
        weightage: asmt.weightage,
      };

      clos.forEach((clo) => {
        const isLinked =
          (asmt.linkedCLOIds || []).includes(clo.id) ||
          (asmt.linkedCLOIds || []).includes(clo.code);
        const totalCLOs = Math.max(1, (asmt.linkedCLOIds || []).length);
        const share = isLinked ? Math.round(((asmt.weightage || 0) / totalCLOs) * 10) / 10 : 0;
        entry[clo.code] = share;
      });

      return entry;
    });
  }, [assessments, clos]);

  // Color palette for CLO bars
  const cloBarColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];

  // Global alignment metrics
  const metrics = useMemo(() => {
    const linkedCells = matrixData.filter((c) => c.isLinked);
    const totalPossiblePairs = clos.length * assessments.length;
    const optimalCount = linkedCells.filter((c) => c.tier === 'Optimal').length;
    const strongCount = linkedCells.filter((c) => c.tier === 'Strong').length;
    const deficitCount = linkedCells.filter((c) => c.tier === 'Deficit').length;
    const moderateCount = linkedCells.filter((c) => c.tier === 'Moderate').length;

    const avgStrength =
      linkedCells.length > 0
        ? Math.round(linkedCells.reduce((sum, c) => sum + c.alignmentStrength, 0) / linkedCells.length)
        : 0;

    // Check which CLOs are completely unassessed
    const unassessedCLOs = clos.filter(
      (c) => !assessments.some((a) => (a.linkedCLOIds || []).includes(c.id) || (a.linkedCLOIds || []).includes(c.code))
    );

    return {
      linkedCount: linkedCells.length,
      totalPossiblePairs,
      coveragePercent: totalPossiblePairs > 0 ? Math.round((linkedCells.length / totalPossiblePairs) * 100) : 0,
      optimalCount,
      strongCount,
      moderateCount,
      deficitCount,
      avgStrength,
      unassessedCLOCount: unassessedCLOs.length,
    };
  }, [matrixData, clos, assessments]);

  // Custom Tooltip for Bubble Chart
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: AlignmentCellData = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs max-w-xs space-y-2 backdrop-blur-md animate-fade-in z-50 pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-indigo-300">{data.cloCode} ⟷ {data.asmtName}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                data.tier === 'Optimal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : data.tier === 'Strong'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : data.tier === 'Deficit'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {data.tier} ({data.alignmentStrength}%)
            </span>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Bloom:</span>
              <span className="font-semibold text-white">{data.cloBloom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assessment Bloom:</span>
              <span className="font-semibold text-white">{data.asmtBloom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cognitive Alignment:</span>
              <span
                className={`font-semibold ${
                  data.cognitiveMatch === 'deficit'
                    ? 'text-rose-400'
                    : data.cognitiveMatch === 'optimal'
                    ? 'text-emerald-400'
                    : 'text-indigo-300'
                }`}
              >
                {data.cognitiveMatch === 'optimal'
                  ? 'Optimal Match (Same Tier)'
                  : data.cognitiveMatch === 'higher-order'
                  ? 'Higher-Order Challenge'
                  : 'Cognitive Deficit'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assessment Contribution:</span>
              <span className="font-semibold text-white">
                {data.shareWeight}% of course ({data.asmtType})
              </span>
            </div>
            {data.questionCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Dedicated Questions:</span>
                <span className="font-semibold text-emerald-400">{data.questionCount} MCQ(s)</span>
              </div>
            )}
            {data.rubricCriteriaCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Rubric Criteria:</span>
                <span className="font-semibold text-indigo-400">{data.rubricCriteriaCount} criterion</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 italic">
            Click bubble to inspect alignment diagnosis & remedies.
          </div>
        </div>
      );
    }
    return null;
  };

  if (clos.length === 0 || assessments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3 shadow-xs">
        <Scale className="w-10 h-10 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">Alignment Matrix Awaiting Course Data</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please define Course Learning Outcomes (Stage 3) and Assessment Tasks (Stage 9) to generate the Recharts alignment strength bubble chart.
        </p>
        {onJumpToStep && (
          <button
            onClick={() => onJumpToStep(3)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <span>Define CLOs in Stage 3</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0 transition-all">
      {/* Top Banner & Header Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" />
              <span>Accreditation Alignment Visualizer</span>
              <span>•</span>
              <span>Recharts OBE Engine</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('bubble')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'bubble'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View Recharts 2D Bubble Scatter Chart"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                <span>Bubble Chart</span>
              </button>

              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View Heatmap Matrix Grid"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Matrix Grid</span>
              </button>

              <button
                onClick={() => setViewMode('barchart')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'barchart'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View Assessment Share Stacked Bar Chart"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Stacked Shares</span>
              </button>
            </div>

            {onAskCopilot && (
              <button
                onClick={() =>
                  onAskCopilot(
                    `Analyze the CLO vs Assessment alignment strength matrix for "${course.title}". Overall alignment strength is ${metrics.avgStrength}%, with ${metrics.deficitCount} cognitive deficits and ${metrics.unassessedCLOCount} unassessed outcomes. Recommend concrete assessment redesign steps.`
                  )
                }
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                title="Consult AI Copilot on alignment gaps"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistical KPI Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-slate-200/80 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg. Alignment Strength
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900">{metrics.avgStrength}%</span>
              <span className="text-[10px] text-emerald-600 font-bold">Index</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Optimal Match
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-600">{metrics.optimalCount}</span>
              <span className="text-[10px] text-slate-400">links</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Strong & Moderate
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-black text-indigo-600">{metrics.strongCount + metrics.moderateCount}</span>
              <span className="text-[10px] text-slate-400">links</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Cognitive Deficits
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-xl font-black ${metrics.deficitCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {metrics.deficitCount}
              </span>
              <span className="text-[10px] text-slate-400">flagged</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Unassessed CLOs
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-xl font-black ${metrics.unassessedCLOCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {metrics.unassessedCLOCount}
              </span>
              <span className="text-[10px] text-slate-400">
                {metrics.unassessedCLOCount === 0 ? '100% Covered' : 'missing direct test'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200/60 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold text-[11px]">Filter Alignment Tier:</span>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { key: 'all', label: 'All Pairs' },
                  { key: 'optimal', label: 'Optimal/Strong (≥50%)' },
                  { key: 'moderate', label: 'Moderate' },
                  { key: 'deficit', label: 'Cognitive Deficit' },
                  { key: 'unlinked', label: 'Unlinked Only' },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterTier(f.key)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    filterTier === f.key
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assessment Type Selector */}
          {assessmentTypes.length > 1 && (
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-500 font-semibold">Method:</span>
              <select
                value={selectedAssessmentType}
                onChange={(e) => setSelectedAssessmentType(e.target.value)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All Assessment Methods</option>
                {assessmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Visualization Body */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        {/* ========================================================= */}
        {/* 1. RECHARTS BUBBLE SCATTER CHART                          */}
        {/* ========================================================= */}
        {viewMode === 'bubble' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">Interactive Bubble Matrix</span>
                <span className="text-slate-400">• Bubble radius = Alignment Strength (15% to 100%)</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] hidden sm:flex">
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-emerald-700 font-medium">Optimal Match (≥75%)</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                  <span className="text-indigo-700 font-medium">Strong (50–74%)</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-amber-700 font-medium">Moderate</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="text-rose-700 font-medium">Cognitive Deficit</span>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
              <div className="w-full h-84 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 20,
                      right: 30,
                      bottom: 40,
                      left: 40,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                    <XAxis
                      type="number"
                      dataKey="asmtIndex"
                      name="Assessment Method"
                      domain={[-0.5, assessments.length - 0.5]}
                      ticks={assessments.map((_, i) => i)}
                      tickFormatter={(idx) => {
                        const asmt = assessments[idx];
                        if (!asmt) return '';
                        return asmt.name.length > 16 ? `${asmt.name.slice(0, 16)}…` : asmt.name;
                      }}
                      interval={0}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                      stroke="#cbd5e1"
                    />

                    <YAxis
                      type="number"
                      dataKey="cloIndex"
                      name="Course Learning Outcome"
                      domain={[-0.5, clos.length - 0.5]}
                      ticks={clos.map((_, i) => i)}
                      tickFormatter={(idx) => clos[idx]?.code || `CLO ${idx + 1}`}
                      interval={0}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                      stroke="#cbd5e1"
                    />

                    <ZAxis
                      type="number"
                      dataKey="alignmentStrength"
                      range={[140, 950]}
                      name="Alignment Strength"
                    />

                    <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} />

                    <Scatter
                      name="Alignment Pairs"
                      data={bubbleData}
                      onClick={(point) => setSelectedCell(point.payload)}
                      className="cursor-pointer"
                    >
                      {bubbleData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.id || index}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={2}
                          className="transition-all hover:opacity-80 hover:stroke-indigo-600 hover:stroke-[3px]"
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500 gap-2">
                <span>X-Axis: Assessment Tasks / Instruments • Y-Axis: Course Learning Outcomes (CLOs)</span>
                <span className="italic">Click any bubble for detailed evidence breakdown</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. HEATMAP MATRIX GRID VIEW                               */}
        {/* ========================================================= */}
        {viewMode === 'matrix' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4 min-w-44 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                        Course Learning Outcome
                      </th>
                      {assessments.map((asmt) => (
                        <th key={asmt.id} className="py-3 px-4 min-w-40 text-center border-r border-slate-200 last:border-r-0">
                          <div className="font-bold text-slate-900 leading-snug">{asmt.name}</div>
                          <div className="flex items-center justify-center space-x-1 mt-1 text-[10px] text-slate-500 font-medium">
                            <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                              {asmt.type}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-indigo-600">{asmt.weightage}% Wt.</span>
                            <span>•</span>
                            <span className="font-semibold">{asmt.bloomLevel}</span>
                          </div>
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center min-w-32 bg-slate-100 font-bold text-slate-800">
                        Total Assessed Wt.
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {clos.map((clo, cIdx) => {
                      // Calculate total assessed weight for this CLO
                      const linkedAsmts = assessments.filter(
                        (a) => (a.linkedCLOIds || []).includes(clo.id) || (a.linkedCLOIds || []).includes(clo.code)
                      );
                      const totalAssessedWeight = Math.round(
                        linkedAsmts.reduce((sum, a) => {
                          const count = Math.max(1, (a.linkedCLOIds || []).length);
                          return sum + (a.weightage || 0) / count;
                        }, 0) * 10
                      ) / 10;
                      const targetWeight = Number(clo.weightage) || 0;
                      const weightVariance = Math.round((totalAssessedWeight - targetWeight) * 10) / 10;

                      return (
                        <tr key={clo.id} className="hover:bg-slate-50/70 transition">
                          {/* CLO Code & Title */}
                          <td className="py-3 px-4 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-black text-indigo-600">{clo.code}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                                {clo.bloomLevel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">
                              "{clo.statement}"
                            </p>
                            <div className="mt-1 text-[10px] text-slate-400 font-medium">
                              Target Weight: <span className="font-bold text-slate-700">{targetWeight}%</span>
                            </div>
                          </td>

                          {/* Assessment Matrix Cells */}
                          {assessments.map((asmt, aIdx) => {
                            const cell = matrixData.find((c) => c.cloId === clo.id && c.asmtId === asmt.id);
                            if (!cell || !cell.isLinked) {
                              return (
                                <td
                                  key={asmt.id}
                                  onClick={() => cell && setSelectedCell(cell)}
                                  className="py-3 px-3 text-center border-r border-slate-200 last:border-r-0 hover:bg-slate-100/50 cursor-pointer text-slate-300"
                                >
                                  <span className="text-xs font-mono select-none">—</span>
                                </td>
                              );
                            }

                            const isOptimal = cell.tier === 'Optimal';
                            const isStrong = cell.tier === 'Strong';
                            const isDeficit = cell.tier === 'Deficit';

                            return (
                              <td
                                key={asmt.id}
                                onClick={() => setSelectedCell(cell)}
                                className={`py-3 px-3 text-center border-r border-slate-200 last:border-r-0 cursor-pointer transition ${
                                  isDeficit
                                    ? 'bg-rose-50/60 hover:bg-rose-100/70'
                                    : isOptimal
                                    ? 'bg-emerald-50/60 hover:bg-emerald-100/70'
                                    : isStrong
                                    ? 'bg-indigo-50/60 hover:bg-indigo-100/70'
                                    : 'bg-amber-50/60 hover:bg-amber-100/70'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span
                                      className={`text-xs font-black ${
                                        isDeficit
                                          ? 'text-rose-700'
                                          : isOptimal
                                          ? 'text-emerald-700'
                                          : isStrong
                                          ? 'text-indigo-700'
                                          : 'text-amber-700'
                                      }`}
                                    >
                                      {cell.alignmentStrength}%
                                    </span>
                                  </div>

                                  {/* Progress micro-bar */}
                                  <div className="w-16 mx-auto bg-slate-200/70 h-1 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${cell.alignmentStrength}%`,
                                        backgroundColor: cell.color,
                                      }}
                                    />
                                  </div>

                                  <div className="text-[10px] font-semibold text-slate-500">
                                    {cell.shareWeight}% share
                                  </div>

                                  <span
                                    className={`inline-block text-[9px] font-bold px-1 py-0.2 rounded ${
                                      isDeficit
                                        ? 'bg-rose-200 text-rose-800'
                                        : isOptimal
                                        ? 'bg-emerald-200 text-emerald-800'
                                        : 'bg-indigo-100 text-indigo-800'
                                    }`}
                                  >
                                    {cell.cognitiveMatch === 'optimal'
                                      ? 'Tier Match'
                                      : cell.cognitiveMatch === 'higher-order'
                                      ? 'Higher-Order'
                                      : 'Deficit'}
                                  </span>
                                </div>
                              </td>
                            );
                          })}

                          {/* Target vs Assessed Total */}
                          <td className="py-3 px-4 text-center bg-slate-50 border-l border-slate-200">
                            <div className="text-xs font-bold text-slate-900">{totalAssessedWeight}%</div>
                            <div
                              className={`text-[10px] font-bold ${
                                Math.abs(weightVariance) <= 2
                                  ? 'text-emerald-600'
                                  : weightVariance > 0
                                  ? 'text-purple-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {weightVariance === 0
                                ? 'Balanced'
                                : `${weightVariance > 0 ? '+' : ''}${weightVariance}%`}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. STACKED BAR CHART VIEW (Recharts)                      */}
        {/* ========================================================= */}
        {viewMode === 'barchart' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Assessment Weight Breakdown by Learning Outcome
                </h4>
                <p className="text-xs text-slate-500">
                  Visualizes how each assessment instrument divides its weight among the enrolled CLOs.
                </p>
              </div>

              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                      stroke="#cbd5e1"
                    />
                    <YAxis
                      label={{ value: 'Weightage (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                      tick={{ fill: '#475569', fontSize: 11 }}
                      stroke="#cbd5e1"
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}% weight contribution`, name]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {clos.map((clo, index) => (
                      <Bar
                        key={clo.id}
                        dataKey={clo.code}
                        stackId="a"
                        fill={cloBarColors[index % cloBarColors.length]}
                        radius={index === clos.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Selected Cell Inspection Drawer */}
        {selectedCell && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-md animate-fade-in space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedCell.color }}
                />
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedCell.cloCode} ⟷ {selectedCell.asmtName}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCell.tier === 'Optimal'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedCell.tier === 'Strong'
                      ? 'bg-indigo-100 text-indigo-800'
                      : selectedCell.tier === 'Deficit'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedCell.tier} Alignment ({selectedCell.alignmentStrength}%)
                </span>
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Outcome Context
                </span>
                <p className="text-slate-800 font-medium line-clamp-2 italic mt-0.5">
                  "{selectedCell.cloStatement}"
                </p>
                <div className="mt-1 flex items-center space-x-1.5 text-[11px]">
                  <span className="text-slate-500">Target Bloom:</span>
                  <span className="font-bold text-indigo-600">{selectedCell.cloBloom}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assessment Instrument
                </span>
                <div className="font-semibold text-slate-800 mt-0.5">{selectedCell.asmtName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Type: <span className="font-medium text-slate-700">{selectedCell.asmtType}</span> • Bloom:{' '}
                  <span className="font-bold text-slate-700">{selectedCell.asmtBloom}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Weight share: <span className="font-bold text-indigo-600">{selectedCell.shareWeight}%</span> of total course
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pedagogical Audit
                </span>
                <p className="text-[11px] text-slate-700 leading-snug mt-0.5">
                  {selectedCell.recommendation}
                </p>
                {selectedCell.cognitiveMatch === 'deficit' && onJumpToStep && (
                  <button
                    onClick={() => onJumpToStep(9)}
                    className="mt-2 text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1 hover:underline cursor-pointer"
                  >
                    <span>Fix Bloom in Assessment Designer (Stage 9)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Guidance Bar */}
      <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Alignment Strength combines weight contribution (share of course grade), cognitive match (Bloom level match), and dedicated question/rubric evidence.
          </span>
        </div>

        {onJumpToStep && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onJumpToStep(9)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Stage 9: Assessments
            </button>
            <button
              onClick={() => onJumpToStep(11)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Stage 11: Rubrics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
