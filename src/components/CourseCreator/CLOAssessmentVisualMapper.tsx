import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Link2,
  Unlink2,
  Brain,
  Plus,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  HelpCircle,
  Eye,
  Info,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  ArrowRight,
  Target,
  Scale,
  Award,
  Check,
} from 'lucide-react';
import { Course, CLO, Assessment, AssessmentType, BloomLevel } from '../../types';
import { BLOOM_RANK, BLOOM_ORDER } from '../../utils/assessmentAnalysis';

export interface CLOAssessmentVisualMapperProps {
  course: Course;
  onChange: (updatedCourse: Course) => void;
  onOpenTaskSuggester?: (cloId?: string) => void;
  className?: string;
  defaultViewMode?: 'flow' | 'matrix';
  compact?: boolean;
}

const BLOOM_COLORS: Record<BloomLevel, { bg: string; text: string; border: string; ring: string }> = {
  Remember: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', ring: 'ring-slate-400' },
  Understand: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', ring: 'ring-sky-400' },
  Apply: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-400' },
  Analyze: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', ring: 'ring-amber-400' },
  Evaluate: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', ring: 'ring-orange-400' },
  Create: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', ring: 'ring-purple-400' },
};

export const CLOAssessmentVisualMapper: React.FC<CLOAssessmentVisualMapperProps> = ({
  course,
  onChange,
  onOpenTaskSuggester,
  className = '',
  defaultViewMode = 'flow',
  compact = false,
}) => {
  const clos: CLO[] = course.clos || [];
  const assessments: Assessment[] = course.assessments || [];

  // State
  const [viewMode, setViewMode] = useState<'flow' | 'matrix'>(defaultViewMode);
  const [filter, setFilter] = useState<'all' | 'gaps' | 'deficits' | 'covered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredCLOId, setHoveredCLOId] = useState<string | null>(null);
  const [hoveredAssessmentId, setHoveredAssessmentId] = useState<string | null>(null);
  const [selectedCLOId, setSelectedCLOId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [quickLinkOpenForCLOId, setQuickLinkOpenForCLOId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SVG connector coordinates ref
  const containerRef = useRef<HTMLDivElement>(null);
  const cloNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const asmtNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [connections, setConnections] = useState<
    Array<{
      cloId: string;
      asmtId: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      isHighlighted: boolean;
      hasCognitiveDeficit: boolean;
    }>
  >([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // Calculations & Gap Diagnostics
  // ---------------------------------------------------------------------------
  const cloAnalysis = useMemo(() => {
    return clos.map((clo) => {
      // Find all assessments linked to this CLO
      const linked = assessments.filter(
        (a) =>
          (a.linkedCLOIds || []).includes(clo.id) ||
          (a.linkedCLOIds || []).includes(clo.code) ||
          (a.cloIds || []).includes(clo.id) ||
          (a.cloIds || []).includes(clo.code)
      );

      const hasGap = linked.length === 0;

      // Cognitive check
      const cloRank = BLOOM_RANK[clo.bloomLevel] || 3;
      let maxAsmtRank = 0;
      let maxAsmtBloom: BloomLevel | 'None' = 'None';
      linked.forEach((a) => {
        const rank = BLOOM_RANK[a.bloomLevel] || 0;
        if (rank > maxAsmtRank) {
          maxAsmtRank = rank;
          maxAsmtBloom = a.bloomLevel;
        }
      });

      const hasCognitiveDeficit = linked.length > 0 && maxAsmtRank < cloRank;
      const isOptimalMatch = linked.length > 0 && maxAsmtRank >= cloRank;

      // Estimated weight contribution
      const assessedWeightShare = linked.reduce((sum, a) => {
        const totalCLOsInA = Math.max(1, (a.linkedCLOIds || []).length);
        return sum + (Number(a.weightage) || 0) / totalCLOsInA;
      }, 0);

      const directCount = linked.filter((a) => a.directOrIndirect !== 'Indirect').length;

      return {
        clo,
        linked,
        hasGap,
        hasCognitiveDeficit,
        isOptimalMatch,
        maxAsmtBloom,
        assessedWeightShare: Math.round(assessedWeightShare * 10) / 10,
        directCount,
      };
    });
  }, [clos, assessments]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalCLOs = clos.length;
    const gaps = cloAnalysis.filter((c) => c.hasGap);
    const deficits = cloAnalysis.filter((c) => c.hasCognitiveDeficit);
    const covered = cloAnalysis.filter((c) => !c.hasGap);
    const coveragePercentage = totalCLOs > 0 ? Math.round((covered.length / totalCLOs) * 100) : 0;

    const totalWeight = assessments.reduce((sum, a) => sum + (Number(a.weightage) || 0), 0);
    const unlinkedAssessments = assessments.filter((a) => (a.linkedCLOIds || []).length === 0);

    return {
      totalCLOs,
      gapCount: gaps.length,
      deficitCount: deficits.length,
      coveredCount: covered.length,
      coveragePercentage,
      totalWeight: Math.round(totalWeight),
      unlinkedAssessmentsCount: unlinkedAssessments.length,
    };
  }, [clos.length, cloAnalysis, assessments]);

  // Filtered CLOs
  const filteredCLOAnalysis = useMemo(() => {
    return cloAnalysis.filter((item) => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = item.clo.code.toLowerCase().includes(q);
        const matchesStatement = (item.clo.statement || '').toLowerCase().includes(q);
        const matchesBloom = item.clo.bloomLevel.toLowerCase().includes(q);
        if (!matchesCode && !matchesStatement && !matchesBloom) return false;
      }

      // Filter category
      if (filter === 'gaps') return item.hasGap;
      if (filter === 'deficits') return item.hasCognitiveDeficit;
      if (filter === 'covered') return !item.hasGap;
      return true;
    });
  }, [cloAnalysis, searchQuery, filter]);

  // ---------------------------------------------------------------------------
  // Recalculate SVG Connector Lines for Flow View
  // ---------------------------------------------------------------------------
  const updateConnections = () => {
    if (viewMode !== 'flow' || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newConns: typeof connections = [];

    clos.forEach((clo) => {
      const cloEl = cloNodeRefs.current.get(clo.id);
      if (!cloEl) return;
      const cloRect = cloEl.getBoundingClientRect();

      assessments.forEach((asmt) => {
        const isLinked =
          (asmt.linkedCLOIds || []).includes(clo.id) ||
          (asmt.linkedCLOIds || []).includes(clo.code) ||
          (asmt.cloIds || []).includes(clo.id) ||
          (asmt.cloIds || []).includes(clo.code);

        if (!isLinked) return;

        const asmtEl = asmtNodeRefs.current.get(asmt.id);
        if (!asmtEl) return;
        const asmtRect = asmtEl.getBoundingClientRect();

        const startX = cloRect.right - containerRect.left;
        const startY = cloRect.top + cloRect.height / 2 - containerRect.top;
        const endX = asmtRect.left - containerRect.left;
        const endY = asmtRect.top + asmtRect.height / 2 - containerRect.top;

        const isHighlighted =
          hoveredCLOId === clo.id ||
          hoveredAssessmentId === asmt.id ||
          selectedCLOId === clo.id;

        const cloRank = BLOOM_RANK[clo.bloomLevel] || 3;
        const asmtRank = BLOOM_RANK[asmt.bloomLevel] || 3;
        const hasCognitiveDeficit = asmtRank < cloRank;

        newConns.push({
          cloId: clo.id,
          asmtId: asmt.id,
          startX,
          startY,
          endX,
          endY,
          isHighlighted,
          hasCognitiveDeficit,
        });
      });
    });

    setConnections(newConns);
  };

  useEffect(() => {
    updateConnections();
    const handleResize = () => updateConnections();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, clos, assessments, hoveredCLOId, hoveredAssessmentId, selectedCLOId, filter]);

  // ---------------------------------------------------------------------------
  // Interactive Link / Unlink Handlers
  // ---------------------------------------------------------------------------
  const handleToggleLink = (cloId: string, asmtId: string) => {
    const updated = assessments.map((a) => {
      if (a.id !== asmtId) return a;
      const currentLinked = a.linkedCLOIds || [];
      const isAlready = currentLinked.includes(cloId);
      const nextLinked = isAlready
        ? currentLinked.filter((id) => id !== cloId)
        : [...currentLinked, cloId];

      return {
        ...a,
        linkedCLOIds: nextLinked,
        cloIds: nextLinked,
      };
    });

    onChange({ ...course, assessments: updated });

    const targetCLO = clos.find((c) => c.id === cloId);
    const targetAsmt = assessments.find((a) => a.id === asmtId);
    const wasLinked = (targetAsmt?.linkedCLOIds || []).includes(cloId);
    showToast(
      wasLinked
        ? `Unlinked ${targetCLO?.code || 'CLO'} from ${targetAsmt?.name || 'Assessment'}`
        : `Linked ${targetCLO?.code || 'CLO'} to ${targetAsmt?.name || 'Assessment'}`
    );
  };

  // Remediation Action 1: Create a dedicated assessment for unassessed CLO
  const handleAutoCreateAssessmentForCLO = (clo: CLO) => {
    let taskType: AssessmentType = 'Assignment';
    let weight = 15;
    let namePrefix = 'Assignment';

    const rank = BLOOM_RANK[clo.bloomLevel] || 3;
    if (rank >= 5) {
      taskType = 'Project';
      weight = 25;
      namePrefix = 'Applied Capstone Project';
    } else if (rank === 4) {
      taskType = 'Case Study';
      weight = 20;
      namePrefix = 'Analytical Case Study';
    } else if (rank === 3) {
      taskType = 'Practical';
      weight = 15;
      namePrefix = 'Laboratory Practical Exam';
    } else {
      taskType = 'Quiz';
      weight = 10;
      namePrefix = 'Concept Mastery Quiz';
    }

    const newAssessment: Assessment = {
      id: `asmt-${Date.now()}`,
      name: `${clo.code}: ${namePrefix}`,
      type: taskType,
      linkedCLOIds: [clo.id],
      cloIds: [clo.id],
      linkedMLOIds: [],
      bloomLevel: clo.bloomLevel,
      evidenceType: 'Direct',
      directOrIndirect: 'Direct',
      marks: 100,
      weightage: weight,
      achievementThreshold: 70,
      isSummative: true,
      questions: [],
    };

    const nextAssessments = [...assessments, newAssessment];
    onChange({ ...course, assessments: nextAssessments });
    showToast(`Created & linked new ${taskType} for ${clo.code}!`);
  };

  // Remediation Action 2: Link all unassessed CLOs to a comprehensive final exam or midterm
  const handleLinkAllGapsToComprehensive = () => {
    const compAsmt =
      assessments.find(
        (a) =>
          a.type === 'Final Assessment' ||
          a.type === 'Midterm' ||
          a.name.toLowerCase().includes('final') ||
          a.name.toLowerCase().includes('comprehensive')
      ) || assessments[0];

    if (!compAsmt) {
      showToast('No assessments available to link to. Add an assessment first.');
      return;
    }

    const gapCLOIds = cloAnalysis.filter((c) => c.hasGap).map((c) => c.clo.id);
    if (gapCLOIds.length === 0) {
      showToast('All CLOs already have assessments linked!');
      return;
    }

    const currentLinked = new Set(compAsmt.linkedCLOIds || []);
    gapCLOIds.forEach((id) => currentLinked.add(id));

    const updatedAssessments = assessments.map((a) =>
      a.id === compAsmt.id
        ? {
            ...a,
            linkedCLOIds: Array.from(currentLinked),
            cloIds: Array.from(currentLinked),
          }
        : a
    );

    onChange({ ...course, assessments: updatedAssessments });
    showToast(`Linked ${gapCLOIds.length} unassessed outcome(s) to "${compAsmt.name}"!`);
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all relative ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-32px)]' : className
      }`}
    >
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="absolute top-3 right-4 z-30 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Visual Audit Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Interactive Constructive Alignment Visualizer
            </span>
            {stats.gapCount > 0 ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{stats.gapCount} Assessment Gap{stats.gapCount > 1 ? 's' : ''} Detected</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>100% Coverage • Zero Gaps</span>
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-serif mt-0.5">
            CLO ↔ Assessment Method Visual Mapping
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect Course Learning Outcomes to evaluation instruments. Gaps where outcomes lack assessments are highlighted for immediate accreditation compliance.
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'flow'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Interactive Visual Bipartite Flow Graph"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Flow Graph</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cross-Tabulation Matrix Grid View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Matrix Grid</span>
            </button>
          </div>

          {/* Quick Gap Remediation Button if gaps exist */}
          {stats.gapCount > 0 && assessments.length > 0 && (
            <button
              type="button"
              onClick={handleLinkAllGapsToComprehensive}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="Auto-link all unmeasured outcomes to the primary comprehensive exam"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Link Gaps ({stats.gapCount})</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Visual Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/70 border-b border-slate-100 text-xs">
        <div className="p-3 px-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Total CLOs
          </span>
          <span className="text-base font-extrabold text-slate-800 font-mono mt-0.5">
            {stats.totalCLOs}
          </span>
        </div>

        <div className="p-3 px-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Assessed Coverage
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <span
              className={`text-base font-extrabold font-mono ${
                stats.coveragePercentage === 100
                  ? 'text-emerald-700'
                  : stats.coveragePercentage >= 80
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {stats.coveragePercentage}%
            </span>
            <span className="text-[11px] text-slate-500">
              ({stats.coveredCount}/{stats.totalCLOs})
            </span>
          </div>
        </div>

        <div
          className={`p-3 px-4 flex flex-col justify-center transition-colors ${
            stats.gapCount > 0 ? 'bg-rose-50/70' : 'bg-transparent'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              stats.gapCount > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}
          >
            Assessment Gaps
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`text-base font-extrabold font-mono ${
                stats.gapCount > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {stats.gapCount}
            </span>
            {stats.gapCount > 0 && (
              <span className="text-[10px] font-semibold text-rose-600">Needs Instrument</span>
            )}
          </div>
        </div>

        <div
          className={`p-3 px-4 flex flex-col justify-center transition-colors ${
            stats.deficitCount > 0 ? 'bg-amber-50/70' : 'bg-transparent'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              stats.deficitCount > 0 ? 'text-amber-700' : 'text-slate-500'
            }`}
          >
            Cognitive Depth Gaps
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`text-base font-extrabold font-mono ${
                stats.deficitCount > 0 ? 'text-amber-700' : 'text-slate-700'
              }`}
            >
              {stats.deficitCount}
            </span>
            {stats.deficitCount > 0 && (
              <span className="text-[10px] font-semibold text-amber-600">Tested Too Low</span>
            )}
          </div>
        </div>

        <div className="p-3 px-4 flex flex-col justify-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Total Weightage
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <span
              className={`text-base font-extrabold font-mono ${
                stats.totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {stats.totalWeight}%
            </span>
            <span className="text-[10px] text-slate-400">Target 100%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer border ${
              filter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Outcomes ({stats.totalCLOs})
          </button>

          <button
            type="button"
            onClick={() => setFilter('gaps')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer border flex items-center space-x-1 ${
              filter === 'gaps'
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : stats.gapCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-extrabold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Gaps Only ({stats.gapCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('deficits')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer border flex items-center space-x-1 ${
              filter === 'deficits'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : stats.deficitCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-3 h-3" />
            <span>Cognitive Deficits ({stats.deficitCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('covered')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer border flex items-center space-x-1 ${
              filter === 'covered'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Fully Covered ({stats.coveredCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search CLO or Bloom verb..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-5 relative min-h-[460px]">
        {clos.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Course Learning Outcomes Defined</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Define Course Learning Outcomes (CLOs) in Step 04 first to visualize their assessment alignment.
            </p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-amber-50/50 rounded-2xl border border-amber-200 p-8">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-base font-bold text-amber-900">Total Assessment Plan Gap</h4>
            <p className="text-xs text-amber-700 max-w-md mx-auto">
              Your course currently has <strong>0 assessment instruments</strong>. Every CLO lacks measurement. Add quizzes, exams, or projects to construct valid constructive alignment.
            </p>
            <button
              type="button"
              onClick={() => handleAutoCreateAssessmentForCLO(clos[0])}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Initial Assessment for {clos[0]?.code}</span>
            </button>
          </div>
        ) : viewMode === 'flow' ? (
          /* ========================================================================= */
          /* VIEW MODE 1: BIPARTITE VISUAL FLOW GRAPH                                   */
          /* ========================================================================= */
          <div className="relative">
            {/* SVG Link Curves Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ minHeight: '100%' }}
            >
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="curveGradientHighlighted" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="curveGradientDeficit" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {connections.map((c, i) => {
                const dx = Math.abs(c.endX - c.startX);
                const controlOffset = Math.max(40, dx * 0.45);
                const path = `M ${c.startX} ${c.startY} C ${c.startX + controlOffset} ${c.startY}, ${
                  c.endX - controlOffset
                } ${c.endY}, ${c.endX} ${c.endY}`;

                return (
                  <path
                    key={`conn-${c.cloId}-${c.asmtId}-${i}`}
                    d={path}
                    fill="none"
                    stroke={
                      c.isHighlighted
                        ? 'url(#curveGradientHighlighted)'
                        : c.hasCognitiveDeficit
                        ? 'url(#curveGradientDeficit)'
                        : 'url(#curveGradient)'
                    }
                    strokeWidth={c.isHighlighted ? 3.5 : 1.75}
                    strokeDasharray={c.hasCognitiveDeficit ? '4 3' : undefined}
                    className="transition-all duration-200"
                  />
                );
              })}
            </svg>

            {/* Bipartite Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 relative z-20">
              {/* LEFT COLUMN: COURSE LEARNING OUTCOMES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Course Learning Outcomes (CLOs)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Showing {filteredCLOAnalysis.length} of {clos.length}
                  </span>
                </div>

                {filteredCLOAnalysis.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No outcomes match current filter.
                  </div>
                ) : (
                  filteredCLOAnalysis.map((item) => {
                    const clo = item.clo;
                    const bColors = BLOOM_COLORS[clo.bloomLevel] || BLOOM_COLORS.Apply;
                    const isHovered = hoveredCLOId === clo.id;
                    const isSelected = selectedCLOId === clo.id;
                    const isQuickLinkOpen = quickLinkOpenForCLOId === clo.id;

                    return (
                      <div
                        key={clo.id}
                        ref={(el) => {
                          if (el) cloNodeRefs.current.set(clo.id, el);
                          else cloNodeRefs.current.delete(clo.id);
                        }}
                        onMouseEnter={() => setHoveredCLOId(clo.id)}
                        onMouseLeave={() => setHoveredCLOId(null)}
                        onClick={() => setSelectedCLOId(isSelected ? null : clo.id)}
                        className={`p-3.5 rounded-xl border-2 transition-all relative cursor-pointer ${
                          item.hasGap
                            ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400 shadow-2xs'
                            : item.hasCognitiveDeficit
                            ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                            : isSelected || isHovered
                            ? 'bg-indigo-50/50 border-indigo-400 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Status Beacon Ribbon */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {clo.code}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bColors.bg} ${bColors.text} ${bColors.border}`}
                            >
                              {clo.bloomLevel} ({clo.bloomVerb || 'Demonstrate'})
                            </span>
                          </div>

                          {/* Gap Status Pill */}
                          {item.hasGap ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>UNASSESSED GAP</span>
                            </span>
                          ) : item.hasCognitiveDeficit ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                              <Scale className="w-2.5 h-2.5 text-amber-600" />
                              <span>Depth Deficit</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{item.linked.length} Instrument{item.linked.length > 1 ? 's' : ''}</span>
                            </span>
                          )}
                        </div>

                        {/* Statement text */}
                        <p className="text-xs text-slate-700 leading-snug line-clamp-2">
                          {clo.statement || 'No statement text entered.'}
                        </p>

                        {/* Connection Summary Footnote */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center space-x-2 text-slate-500">
                            <span>
                              Evaluated Weight:{' '}
                              <strong className="text-slate-800 font-mono">
                                {item.assessedWeightShare}%
                              </strong>
                            </span>
                            <span>•</span>
                            <span>Direct Artifacts: <strong>{item.directCount}</strong></span>
                          </div>

                          {/* Inline Remediation / Quick Actions for Gaps */}
                          {item.hasGap ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickLinkOpenForCLOId(isQuickLinkOpen ? null : clo.id);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[10px] transition cursor-pointer flex items-center space-x-1"
                                title="Attach this outcome to an existing assessment instrument"
                              >
                                <Link2 className="w-2.5 h-2.5" />
                                <span>Link Instrument</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAutoCreateAssessmentForCLO(clo);
                                }}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[10px] transition cursor-pointer flex items-center space-x-1"
                                title="Generate a dedicated assessment instrument tailored to this CLO's Bloom level"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                <span>+ New Task</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              {item.linked.map((asmt) => (
                                <span
                                  key={asmt.id}
                                  className="text-[9px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded border border-slate-200"
                                >
                                  {asmt.type} ({asmt.weightage}%)
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick Link Dropdown Popover */}
                        {isQuickLinkOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 p-2 bg-white rounded-xl border border-slate-300 shadow-lg space-y-1 animate-in fade-in duration-150 z-30"
                          >
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Select Assessment to Evaluate {clo.code}:
                            </p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {assessments.map((asmt) => {
                                const isLinked = (asmt.linkedCLOIds || []).includes(clo.id);
                                return (
                                  <button
                                    key={asmt.id}
                                    type="button"
                                    onClick={() => handleToggleLink(clo.id, asmt.id)}
                                    className={`w-full text-left p-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                                      isLinked
                                        ? 'bg-indigo-50 text-indigo-900 font-bold'
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span className="truncate">{asmt.name}</span>
                                    <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                                      {asmt.type} • {asmt.weightage}%
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* RIGHT COLUMN: ASSESSMENT METHODS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                    <Scale className="w-4 h-4 text-purple-600" />
                    <span>Assessment Instruments &amp; Methods</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {assessments.length} Instruments Defined
                  </span>
                </div>

                {assessments.map((asmt) => {
                  const linkedCLOs = clos.filter(
                    (c) =>
                      (asmt.linkedCLOIds || []).includes(c.id) ||
                      (asmt.linkedCLOIds || []).includes(c.code)
                  );
                  const isHovered = hoveredAssessmentId === asmt.id;
                  const hasNoCLOs = linkedCLOs.length === 0;

                  return (
                    <div
                      key={asmt.id}
                      ref={(el) => {
                        if (el) asmtNodeRefs.current.set(asmt.id, el);
                        else asmtNodeRefs.current.delete(asmt.id);
                      }}
                      onMouseEnter={() => setHoveredAssessmentId(asmt.id)}
                      onMouseLeave={() => setHoveredAssessmentId(null)}
                      className={`p-3.5 rounded-xl border-2 transition-all relative ${
                        hasNoCLOs
                          ? 'bg-amber-50/30 border-amber-300 shadow-2xs'
                          : isHovered
                          ? 'bg-purple-50/50 border-purple-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{asmt.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                            {asmt.type}
                          </span>
                        </div>

                        {/* Weight Badge */}
                        <div className="flex items-center space-x-1">
                          <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {asmt.weightage}% Wt.
                          </span>
                        </div>
                      </div>

                      {/* Attributes ribbon */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mb-2">
                        <span className="font-semibold text-slate-600">
                          Target Bloom: {asmt.bloomLevel || 'Apply'}
                        </span>
                        <span>•</span>
                        <span>{asmt.isSummative ? 'Summative' : 'Formative'}</span>
                        <span>•</span>
                        <span>{asmt.directOrIndirect || 'Direct Evidence'}</span>
                      </div>

                      {/* Evaluated CLOs Chips */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500">Evaluates:</span>
                          {linkedCLOs.length === 0 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              No Outcomes Linked
                            </span>
                          ) : (
                            linkedCLOs.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleToggleLink(c.id, asmt.id)}
                                className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-rose-50 hover:text-rose-700 rounded border border-indigo-200 font-mono text-[10px] font-bold transition cursor-pointer"
                                title={`Click to unlink ${c.code}`}
                              >
                                {c.code} ×
                              </button>
                            ))
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {linkedCLOs.length} CLO{linkedCLOs.length !== 1 ? 's' : ''} Mapped
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW MODE 2: INTERACTIVE CROSS-TABULATION MATRIX GRID                      */
          /* ========================================================================= */
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="p-3 font-bold text-slate-700 min-w-[240px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    Course Learning Outcomes (CLOs)
                  </th>
                  {assessments.map((asmt) => (
                    <th
                      key={asmt.id}
                      className="p-3 text-center min-w-[120px] font-bold text-slate-700 border-r border-slate-200"
                    >
                      <div className="truncate max-w-[140px] mx-auto" title={asmt.name}>
                        {asmt.name}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-600 font-extrabold mt-0.5">
                        {asmt.type} • {asmt.weightage}%
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal">
                        Bloom: {asmt.bloomLevel}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[150px] font-bold text-slate-700 bg-slate-100">
                    Coverage &amp; Gap Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCLOAnalysis.map((item) => {
                  const clo = item.clo;
                  const bColors = BLOOM_COLORS[clo.bloomLevel] || BLOOM_COLORS.Apply;

                  return (
                    <tr
                      key={clo.id}
                      className={`hover:bg-slate-50/60 transition ${
                        item.hasGap ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* CLO Code & Statement */}
                      <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-xs">
                            {clo.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${bColors.bg} ${bColors.text} ${bColors.border}`}
                          >
                            {clo.bloomLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {clo.statement}
                        </p>
                      </td>

                      {/* Assessment Intersection Matrix Cells */}
                      {assessments.map((asmt) => {
                        const isLinked = (asmt.linkedCLOIds || []).includes(clo.id);
                        const cloRank = BLOOM_RANK[clo.bloomLevel] || 3;
                        const asmtRank = BLOOM_RANK[asmt.bloomLevel] || 3;
                        const isDeficit = isLinked && asmtRank < cloRank;

                        return (
                          <td
                            key={asmt.id}
                            onClick={() => handleToggleLink(clo.id, asmt.id)}
                            className={`p-2.5 text-center border-r border-slate-100 cursor-pointer transition select-none ${
                              isLinked
                                ? isDeficit
                                  ? 'bg-amber-50 hover:bg-amber-100'
                                  : 'bg-indigo-50/70 hover:bg-indigo-100'
                                : 'hover:bg-slate-100'
                            }`}
                            title={`Click to ${isLinked ? 'unlink' : 'link'} ${clo.code} with ${asmt.name}`}
                          >
                            {isLinked ? (
                              <div className="inline-flex flex-col items-center justify-center">
                                <span
                                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-2xs ${
                                    isDeficit ? 'bg-amber-600' : 'bg-indigo-600'
                                  }`}
                                >
                                  ✓
                                </span>
                                {isDeficit && (
                                  <span className="text-[9px] font-bold text-amber-700 mt-0.5">
                                    C{asmtRank}&lt;C{cloRank}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 hover:text-slate-500 text-sm font-bold">
                                +
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Right Gap Audit Result Column */}
                      <td className="p-3 text-center bg-slate-50/50">
                        {item.hasGap ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>0 ASSESSMENTS</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAutoCreateAssessmentForCLO(clo)}
                              className="w-full px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              + Fix Gap
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{item.linked.length} Covered</span>
                            </span>
                            <p className="text-[10px] font-mono text-slate-500 font-semibold">
                              ~{item.assessedWeightShare}% Wt.
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Matrix Bottom Totals Summary Row */}
                <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                  <td className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 text-slate-800">
                    Total Outcomes Evaluated
                  </td>
                  {assessments.map((asmt) => {
                    const count = clos.filter((c) => (asmt.linkedCLOIds || []).includes(c.id)).length;
                    return (
                      <td
                        key={asmt.id}
                        className="p-2.5 text-center border-r border-slate-200 font-mono text-slate-800"
                      >
                        <span
                          className={`px-2 py-0.5 rounded ${
                            count === 0 ? 'bg-amber-100 text-amber-800' : 'bg-white text-slate-800'
                          }`}
                        >
                          {count} CLO{count !== 1 ? 's' : ''}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-3 text-center bg-slate-200/60 font-mono text-slate-800">
                    {stats.coveredCount} / {stats.totalCLOs} ({stats.coveragePercentage}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Footer Guidance */}
      <div className="p-3 px-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            <strong>Accreditation Tip:</strong> Every Course Learning Outcome must have at least one direct assessment method before final syllabus sign-off.
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Optimal Bloom Alignment</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Cognitive Depth Deficit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Unassessed Gap</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CLOAssessmentVisualMapper;
