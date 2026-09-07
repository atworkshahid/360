import React, { useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import {
  Brain,
  Sparkles,
  Search,
  Check,
  ArrowRight,
  Lightbulb,
  X,
  Layers,
  Award,
  Filter,
  RotateCcw,
  BookOpen,
  Info,
  CheckCircle2,
  Copy,
  ChevronRight,
  Flame,
  Target,
  FileCheck,
} from 'lucide-react';
import { BloomLevel, CLO, Course } from '../../types';
import { BLOOM_TAXONOMY_DATA, BloomLevelDetail } from './BloomsTaxonomyHelperModal';

export interface BloomsTaxonomyWheelProps {
  selectedCLO?: CLO | null;
  course?: Course;
  onSelectVerb: (verb: string, level: BloomLevel) => void;
  onApplyStem?: (stem: string, level: BloomLevel) => void;
  onClose?: () => void;
  isModal?: boolean;
}

// Color palettes for the 6 Bloom's Taxonomy Cognitive Levels
export const BLOOM_WHEEL_THEMES: Record<
  BloomLevel,
  {
    ring1: string; // Core domain ring
    ring2: string; // Sub-categories ring
    ring3: string; // Verb ring
    ring3Hover: string;
    textDark: string;
    textLight: string;
    badgeBg: string;
    border: string;
  }
> = {
  Remember: {
    ring1: '#475569', // Slate 600
    ring2: '#64748b', // Slate 500
    ring3: '#94a3b8', // Slate 400
    ring3Hover: '#334155',
    textDark: '#0f172a',
    textLight: '#ffffff',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    border: '#cbd5e1',
  },
  Understand: {
    ring1: '#0284c7', // Sky 600
    ring2: '#0ea5e9', // Sky 500
    ring3: '#38bdf8', // Sky 400
    ring3Hover: '#0369a1',
    textDark: '#0c4a6e',
    textLight: '#ffffff',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    border: '#bae6fd',
  },
  Apply: {
    ring1: '#059669', // Emerald 600
    ring2: '#10b981', // Emerald 500
    ring3: '#34d399', // Emerald 400
    ring3Hover: '#047857',
    textDark: '#064e3b',
    textLight: '#ffffff',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    border: '#a7f3d0',
  },
  Analyze: {
    ring1: '#d97706', // Amber 600
    ring2: '#f59e0b', // Amber 500
    ring3: '#fbbf24', // Amber 400
    ring3Hover: '#b45309',
    textDark: '#78350f',
    textLight: '#ffffff',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    border: '#fde68a',
  },
  Evaluate: {
    ring1: '#e11d48', // Rose 600
    ring2: '#f43f5e', // Rose 500
    ring3: '#fb7185', // Rose 400
    ring3Hover: '#be123c',
    textDark: '#881337',
    textLight: '#ffffff',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    border: '#fecdd3',
  },
  Create: {
    ring1: '#7c3aed', // Violet 600
    ring2: '#8b5cf6', // Violet 500
    ring3: '#a78bfa', // Violet 400
    ring3Hover: '#6d28d9',
    textDark: '#4c1d95',
    textLight: '#ffffff',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    border: '#ddd6fe',
  },
};

// Recommended assessment deliverables and student artifacts per cognitive stage
export const BLOOM_ASSESSMENT_ARTIFACTS: Record<BloomLevel, string[]> = {
  Remember: [
    'Objective Quizzes & Flashcards',
    'Definition & Terminology Lists',
    'Identification Worksheets',
    'Fact Retrieval Checklists',
    'Historical Timelines',
  ],
  Understand: [
    'Executive Summaries & Memos',
    'Concept Maps & Mind Diagrams',
    'Explanatory Presentations',
    'Paraphrased Case Overviews',
    'Comparative Matrices',
  ],
  Apply: [
    'Working Code Implementations',
    'Computational Problem Sets',
    'Laboratory Simulations',
    'Standard Operating Workflows',
    'Live Technical Demonstrations',
  ],
  Analyze: [
    'Root-Cause Diagnostic Reports',
    'System Architecture Schematics',
    'Performance Bottleneck Audits',
    'Comparative Case Studies',
    'Troubleshooting Decision Trees',
  ],
  Evaluate: [
    'Peer Review Critiques',
    'Architectural Trade-Off Defenses',
    'Statutory Compliance Audits',
    'Benchmarking & Ranking Reports',
    'Policy Recommendation Briefs',
  ],
  Create: [
    'Capstone Project Prototypes',
    'Integrated System Blueprints',
    'Novel Algorithmic Models',
    'Strategic Business Frameworks',
    'Published Research Proposals',
  ],
};

const ORDERED_LEVELS: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

export const BloomsTaxonomyWheel: React.FC<BloomsTaxonomyWheelProps> = ({
  selectedCLO,
  course,
  onSelectVerb,
  onApplyStem,
  onClose,
  isModal = false,
}) => {
  // State
  const [activeLevel, setActiveLevel] = useState<BloomLevel>(selectedCLO?.bloomLevel || 'Analyze');
  const [hoveredLevel, setHoveredLevel] = useState<BloomLevel | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredVerb, setHoveredVerb] = useState<{ verb: string; level: BloomLevel; category: string } | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<{ verb: string; level: BloomLevel; category: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'HOTS' | 'LOTS'>('ALL');
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync active level when selectedCLO changes
  React.useEffect(() => {
    if (selectedCLO?.bloomLevel) {
      setActiveLevel(selectedCLO.bloomLevel);
      if (selectedCLO.bloomVerb) {
        // Find category for the verb
        const lvlData = BLOOM_TAXONOMY_DATA[selectedCLO.bloomLevel];
        let catName = lvlData.categories[0]?.name || 'Verbs';
        lvlData.categories.forEach((cat) => {
          if (cat.verbs.some((v) => v.toLowerCase() === selectedCLO.bloomVerb?.toLowerCase())) {
            catName = cat.name;
          }
        });
        setSelectedVerb({
          verb: selectedCLO.bloomVerb,
          level: selectedCLO.bloomLevel,
          category: catName,
        });
      }
    }
  }, [selectedCLO?.id, selectedCLO?.bloomLevel, selectedCLO?.bloomVerb]);

  // Track course-wide CLO Bloom levels for coverage visualizer
  const courseCoverage = useMemo(() => {
    const counts: Record<BloomLevel, number> = {
      Remember: 0,
      Understand: 0,
      Apply: 0,
      Analyze: 0,
      Evaluate: 0,
      Create: 0,
    };
    const cloMap: Record<BloomLevel, string[]> = {
      Remember: [],
      Understand: [],
      Apply: [],
      Analyze: [],
      Evaluate: [],
      Create: [],
    };

    (course?.clos || []).forEach((c) => {
      if (counts[c.bloomLevel] !== undefined) {
        counts[c.bloomLevel]++;
        cloMap[c.bloomLevel].push(c.code);
      }
    });

    return { counts, cloMap, total: (course?.clos || []).length };
  }, [course?.clos]);

  // Current display target (hover takes temporary precedence in the center hub)
  const displayLevel = hoveredVerb?.level || hoveredLevel || selectedVerb?.level || activeLevel;
  const currentLevelData = BLOOM_TAXONOMY_DATA[displayLevel];

  // Filtered search matching verbs
  const searchMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;
    const matches: Array<{ verb: string; level: BloomLevel; category: string }> = [];

    ORDERED_LEVELS.forEach((lvl) => {
      const data = BLOOM_TAXONOMY_DATA[lvl];
      data.categories.forEach((cat) => {
        cat.verbs.forEach((v) => {
          if (v.toLowerCase().includes(q)) {
            matches.push({ verb: v, level: lvl, category: cat.name });
          }
        });
      });
    });
    return matches;
  }, [searchQuery]);

  // Generate proposed new CLO statement preview when a verb is picked
  const previewStatement = useMemo(() => {
    const targetVerb = selectedVerb?.verb || hoveredVerb?.verb;
    if (!targetVerb) return null;

    const original = selectedCLO?.statement || '';
    if (!original.trim()) {
      return `${targetVerb} [core concept or domain artifact] by [methodology] to [observable outcome]...`;
    }

    // Replace the first word (or introductory phrase) if it resembles an action verb
    const trimmed = original.trim();
    const words = trimmed.split(' ');
    // If statement starts with "Students will be able to ..."
    const swbatRegex = /^(students\s+will\s+be\s+able\s+to\s+|the\s+student\s+will\s+|learners\s+will\s+)/i;
    const match = trimmed.match(swbatRegex);

    if (match) {
      const prefix = match[0];
      const rest = trimmed.substring(prefix.length).trim();
      const restWords = rest.split(' ');
      return `${prefix}${targetVerb} ${restWords.slice(1).join(' ')}`;
    }

    return `${targetVerb} ${words.slice(1).join(' ')}`;
  }, [selectedVerb?.verb, hoveredVerb?.verb, selectedCLO?.statement]);

  // Wheel Geometry constants
  const size = 620;
  const center = size / 2;

  // Radii
  const r0 = 70; // Center Hub outer boundary
  const r1 = 132; // Ring 1: 6 Cognitive Levels
  const r2 = 192; // Ring 2: 12 Sub-categories
  const r3 = 285; // Ring 3: Action Verbs

  // Arc generators using D3
  const arcGen = useMemo(() => {
    return d3.arc<any>()
      .innerRadius((d) => d.innerRadius)
      .outerRadius((d) => d.outerRadius)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle)
      .padAngle((d) => d.padAngle || 0.015)
      .cornerRadius((d) => d.cornerRadius || 2);
  }, []);

  // Compute Wheel Segments
  const wheelData = useMemo(() => {
    // 6 levels, each spans 60 deg (2 * PI / 6)
    const levelAngle = (2 * Math.PI) / 6;
    // Offset starting angle so Level 1 starts at top (-PI/2)
    const startOffset = -Math.PI / 2;

    const levelSlices: Array<{
      level: BloomLevel;
      levelNumber: number;
      order: 'LOTS' | 'HOTS';
      title: string;
      startAngle: number;
      endAngle: number;
      innerRadius: number;
      outerRadius: number;
      midAngle: number;
      theme: typeof BLOOM_WHEEL_THEMES['Remember'];
      categories: Array<{
        name: string;
        startAngle: number;
        endAngle: number;
        midAngle: number;
        verbs: string[];
      }>;
    }> = [];

    const verbSlices: Array<{
      verb: string;
      level: BloomLevel;
      category: string;
      startAngle: number;
      endAngle: number;
      midAngle: number;
      innerRadius: number;
      outerRadius: number;
      theme: typeof BLOOM_WHEEL_THEMES['Remember'];
      isHighlighted: boolean;
      isSelected: boolean;
      isUsedInCourse: boolean;
    }> = [];

    ORDERED_LEVELS.forEach((lvl, idx) => {
      const lvlStart = startOffset + idx * levelAngle;
      const lvlEnd = lvlStart + levelAngle;
      const lvlMid = (lvlStart + lvlEnd) / 2;
      const lvlData = BLOOM_TAXONOMY_DATA[lvl];
      const theme = BLOOM_WHEEL_THEMES[lvl];

      // Two subcategories per level: 30 deg each
      const catCount = lvlData.categories.length;
      const catAngle = levelAngle / catCount;

      const catSlices = lvlData.categories.map((cat, catIdx) => {
        const cStart = lvlStart + catIdx * catAngle;
        const cEnd = cStart + catAngle;
        const cMid = (cStart + cEnd) / 2;

        // Choose up to 5-6 top active verbs for this category in the wheel
        // (If active level is focused, we allocate verbs evenly across the wedge)
        const verbsForCategory = cat.verbs.slice(0, 5);
        const vAngle = catAngle / verbsForCategory.length;

        verbsForCategory.forEach((verb, vIdx) => {
          const vStart = cStart + vIdx * vAngle;
          const vEnd = vStart + vAngle;
          const vMid = (vStart + vEnd) / 2;

          const isSearched = searchMatches
            ? searchMatches.some((m) => m.verb.toLowerCase() === verb.toLowerCase())
            : true;
          const isOrderMatched =
            orderFilter === 'ALL'
              ? true
              : orderFilter === 'HOTS'
              ? lvlData.order === 'HOTS'
              : lvlData.order === 'LOTS';

          const isSelected = selectedVerb?.verb.toLowerCase() === verb.toLowerCase();
          const isUsedInCourse = (course?.clos || []).some(
            (c) =>
              c.bloomVerb?.toLowerCase() === verb.toLowerCase() ||
              new RegExp(`\\b${verb}\\b`, 'i').test(c.statement || '')
          );

          verbSlices.push({
            verb,
            level: lvl,
            category: cat.name,
            startAngle: vStart,
            endAngle: vEnd,
            midAngle: vMid,
            innerRadius: r2 + 4,
            outerRadius: r3,
            theme,
            isHighlighted: isSearched && isOrderMatched,
            isSelected,
            isUsedInCourse,
          });
        });

        return {
          name: cat.name,
          startAngle: cStart,
          endAngle: cEnd,
          midAngle: cMid,
          verbs: cat.verbs,
        };
      });

      levelSlices.push({
        level: lvl,
        levelNumber: lvlData.number,
        order: lvlData.order,
        title: lvlData.title,
        startAngle: lvlStart,
        endAngle: lvlEnd,
        midAngle: lvlMid,
        innerRadius: r0 + 4,
        outerRadius: r1,
        theme,
        categories: catSlices,
      });
    });

    return { levelSlices, verbSlices };
  }, [searchMatches, orderFilter, selectedVerb, course?.clos]);

  // Click handlers
  const handleSelectVerbDirectly = (verb: string, level: BloomLevel, category: string) => {
    setSelectedVerb({ verb, level, category });
    setActiveLevel(level);
    onSelectVerb(verb, level);

    setAppliedFeedback(`Verb "${verb}" applied to CLO!`);
    setTimeout(() => setAppliedFeedback(null), 2500);
  };

  const handleApplyStemDirectly = (stem: string, level: BloomLevel) => {
    if (onApplyStem) {
      onApplyStem(stem, level);
      setAppliedFeedback(`Outcome template stem applied!`);
      setTimeout(() => setAppliedFeedback(null), 2500);
    }
  };

  const handleCopyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 1800);
  };

  // Helper for computing label positions on an arc
  const getArcLabelPosition = (midAngle: number, radius: number) => {
    // midAngle in D3 arc starts from 12 o'clock, clockwise
    // In Cartesian: x = r * sin(midAngle), y = -r * cos(midAngle)
    const x = center + radius * Math.sin(midAngle);
    const y = center - radius * Math.cos(midAngle);
    return { x, y };
  };

  // Rotation angle for readable text along radial rays
  const getRadialRotation = (midAngle: number) => {
    const deg = (midAngle * 180) / Math.PI;
    // Rotate so text is not upside down
    if (deg > 90 && deg < 270) {
      return deg + 90 + 180;
    }
    return deg - 90;
  };

  return (
    <div
      id="blooms-taxonomy-wheel-container"
      ref={containerRef}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col ${
        isModal ? 'max-h-[92vh]' : 'w-full'
      }`}
    >
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Interactive Bloom's Taxonomy Verb Wheel
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                Revised 6-Tier
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Explore cognitive domains radially, select rigorous measurable verbs, and calibrate outcome depth.
            </p>
          </div>
        </div>

        {/* Toolbar & Filter Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* LOTS / HOTS Filter */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shadow-2xs">
            <button
              type="button"
              id="filter-wheel-all"
              onClick={() => setOrderFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                orderFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (L1–L6)
            </button>
            <button
              type="button"
              id="filter-wheel-lots"
              onClick={() => setOrderFilter('LOTS')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex items-center space-x-1 ${
                orderFilter === 'LOTS'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Lower-Order Thinking Skills: Remember & Understand"
            >
              <span>LOTS (L1–L2)</span>
            </button>
            <button
              type="button"
              id="filter-wheel-hots"
              onClick={() => setOrderFilter('HOTS')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex items-center space-x-1 ${
                orderFilter === 'HOTS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Higher-Order Thinking Skills: Apply, Analyze, Evaluate, Create"
            >
              <Flame className="w-3 h-3 text-amber-300" />
              <span>HOTS (L3–L6)</span>
            </button>
          </div>

          {/* Artifacts toggle */}
          <button
            type="button"
            onClick={() => setShowArtifacts(!showArtifacts)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
              showArtifacts
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle assessment products and deliverables"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Artifacts</span>
          </button>

          {/* Close button if modal */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer ml-1"
              aria-label="Close Bloom's Wheel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search & Quick Navigation Strip */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="bloom-wheel-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action verbs (e.g. formulate, critique, calculate, design)..."
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Level Quick Jump Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {ORDERED_LEVELS.map((lvl) => {
            const data = BLOOM_TAXONOMY_DATA[lvl];
            const theme = BLOOM_WHEEL_THEMES[lvl];
            const isActive = activeLevel === lvl;
            const countInCourse = courseCoverage.counts[lvl];

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setActiveLevel(lvl);
                  setHoveredLevel(null);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center space-x-1 border cursor-pointer ${
                  isActive
                    ? `${theme.badgeBg} shadow-2xs scale-105`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: theme.ring1 }}
                />
                <span>
                  L{data.number} {lvl}
                </span>
                {countInCourse > 0 && (
                  <span
                    className="text-[9px] px-1 rounded-full bg-slate-200 text-slate-700 font-mono font-bold"
                    title={`${countInCourse} CLO(s) currently at this level`}
                  >
                    {countInCourse}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Wheel Canvas & Inspection Panel */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        {/* Left / Center: Interactive SVG Sunburst Wheel (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[460px]">
          {/* Wheel SVG container */}
          <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full drop-shadow-sm select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Subtle drop shadow filters for active slices */}
                <filter id="wheel-slice-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
                </filter>
                <radialGradient id="hub-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="85%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </radialGradient>
              </defs>

              <g transform={`translate(${center}, ${center})`}>
                {/* ============================================================ */}
                {/* RING 3: ACTION VERBS (Outer Ring)                           */}
                {/* ============================================================ */}
                {wheelData.verbSlices.map((vSlice, idx) => {
                  const isHovered =
                    hoveredVerb?.verb.toLowerCase() === vSlice.verb.toLowerCase();
                  const isParentLevelHovered =
                    hoveredLevel === vSlice.level || activeLevel === vSlice.level;
                  const isParentCatHovered = hoveredCategory === vSlice.category;

                  const opacity = vSlice.isHighlighted
                    ? isHovered || vSlice.isSelected
                      ? 1
                      : isParentLevelHovered || isParentCatHovered
                      ? 0.92
                      : 0.65
                    : 0.22;

                  const pathD = arcGen({
                    innerRadius: vSlice.innerRadius,
                    outerRadius: isHovered || vSlice.isSelected ? vSlice.outerRadius + 8 : vSlice.outerRadius,
                    startAngle: vSlice.startAngle,
                    endAngle: vSlice.endAngle,
                    padAngle: 0.008,
                    cornerRadius: 3,
                  }) || '';

                  // Text position
                  const labelRadius = (vSlice.innerRadius + vSlice.outerRadius) / 2;
                  const rotDeg = getRadialRotation(vSlice.midAngle);
                  const isUpsideDown = vSlice.midAngle > Math.PI / 2 && vSlice.midAngle < (3 * Math.PI) / 2;

                  return (
                    <g
                      key={`verb-${idx}-${vSlice.verb}`}
                      className="cursor-pointer transition-all duration-150 group"
                      onClick={() => handleSelectVerbDirectly(vSlice.verb, vSlice.level, vSlice.category)}
                      onMouseEnter={() => {
                        setHoveredVerb({
                          verb: vSlice.verb,
                          level: vSlice.level,
                          category: vSlice.category,
                        });
                        setHoveredLevel(vSlice.level);
                        setHoveredCategory(vSlice.category);
                      }}
                      onMouseLeave={() => {
                        setHoveredVerb(null);
                        setHoveredCategory(null);
                      }}
                    >
                      <path
                        d={pathD}
                        fill={
                          vSlice.isSelected
                            ? '#312e81' // Indigo 900 for active selected
                            : isHovered
                            ? vSlice.theme.ring3Hover
                            : vSlice.theme.ring3
                        }
                        stroke="#ffffff"
                        strokeWidth={vSlice.isSelected || isHovered ? 2 : 1}
                        style={{
                          opacity,
                          transition: 'all 0.15s ease-out',
                          filter: isHovered || vSlice.isSelected ? 'url(#wheel-slice-shadow)' : 'none',
                        }}
                      />

                      {/* Small Indicator if verb is already used in this course's CLOs */}
                      {vSlice.isUsedInCourse && (
                        <circle
                          cx={getArcLabelPosition(vSlice.midAngle, vSlice.outerRadius - 6).x - center}
                          cy={getArcLabelPosition(vSlice.midAngle, vSlice.outerRadius - 6).y - center}
                          r={2.5}
                          fill="#ffffff"
                          stroke="#0f172a"
                          strokeWidth={1}
                        />
                      )}

                      {/* Verb Label */}
                      <text
                        transform={`rotate(${rotDeg}) translate(${labelRadius}, 0) ${
                          isUpsideDown ? 'rotate(180)' : ''
                        }`}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={
                          vSlice.isSelected || isHovered
                            ? '#ffffff'
                            : vSlice.theme.textDark
                        }
                        fontSize={vSlice.verb.length > 8 ? 9.5 : 10.5}
                        fontWeight={vSlice.isSelected || isHovered ? 'bold' : '600'}
                        pointerEvents="none"
                        style={{
                          textShadow:
                            vSlice.isSelected || isHovered
                              ? '0 1px 2px rgba(0,0,0,0.4)'
                              : 'none',
                        }}
                      >
                        {vSlice.verb}
                      </text>
                    </g>
                  );
                })}

                {/* ============================================================ */}
                {/* RING 2: SUB-CATEGORIES (Middle Ring)                        */}
                {/* ============================================================ */}
                {wheelData.levelSlices.map((lvlSlice) =>
                  lvlSlice.categories.map((catSlice, cIdx) => {
                    const isHovered = hoveredCategory === catSlice.name;
                    const isParentActive =
                      activeLevel === lvlSlice.level || hoveredLevel === lvlSlice.level;
                    const pathD = arcGen({
                      innerRadius: r1 + 3,
                      outerRadius: r2,
                      startAngle: catSlice.startAngle,
                      endAngle: catSlice.endAngle,
                      padAngle: 0.012,
                      cornerRadius: 2,
                    }) || '';

                    const rotDeg = getRadialRotation(catSlice.midAngle);
                    const isUpsideDown = catSlice.midAngle > Math.PI / 2 && catSlice.midAngle < (3 * Math.PI) / 2;
                    const catRadius = (r1 + r2) / 2;

                    return (
                      <g
                        key={`cat-${lvlSlice.level}-${cIdx}`}
                        className="cursor-pointer transition-all duration-150"
                        onClick={() => {
                          setActiveLevel(lvlSlice.level);
                          setHoveredCategory(catSlice.name);
                        }}
                        onMouseEnter={() => {
                          setHoveredCategory(catSlice.name);
                          setHoveredLevel(lvlSlice.level);
                        }}
                        onMouseLeave={() => {
                          setHoveredCategory(null);
                        }}
                      >
                        <path
                          d={pathD}
                          fill={isHovered ? lvlSlice.theme.ring1 : lvlSlice.theme.ring2}
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          style={{
                            opacity: isParentActive ? 1 : 0.75,
                            filter: isHovered ? 'url(#wheel-slice-shadow)' : 'none',
                          }}
                        />
                        <text
                          transform={`rotate(${rotDeg}) translate(${catRadius}, 0) ${
                            isUpsideDown ? 'rotate(180)' : ''
                          }`}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize={9}
                          fontWeight="700"
                          pointerEvents="none"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                        >
                          {catSlice.name.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })
                )}

                {/* ============================================================ */}
                {/* RING 1: 6 COGNITIVE DOMAINS (Inner Ring)                    */}
                {/* ============================================================ */}
                {wheelData.levelSlices.map((lvlSlice) => {
                  const isActive = activeLevel === lvlSlice.level;
                  const isHovered = hoveredLevel === lvlSlice.level;
                  const pathD = arcGen({
                    innerRadius: r0 + 2,
                    outerRadius: isActive || isHovered ? r1 + 3 : r1,
                    startAngle: lvlSlice.startAngle,
                    endAngle: lvlSlice.endAngle,
                    padAngle: 0.018,
                    cornerRadius: 3,
                  }) || '';

                  const rotDeg = getRadialRotation(lvlSlice.midAngle);
                  const isUpsideDown = lvlSlice.midAngle > Math.PI / 2 && lvlSlice.midAngle < (3 * Math.PI) / 2;
                  const domRadius = (r0 + r1) / 2;

                  return (
                    <g
                      key={`level-${lvlSlice.level}`}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => {
                        setActiveLevel(lvlSlice.level);
                        setHoveredLevel(null);
                      }}
                      onMouseEnter={() => setHoveredLevel(lvlSlice.level)}
                      onMouseLeave={() => setHoveredLevel(null)}
                    >
                      <path
                        d={pathD}
                        fill={lvlSlice.theme.ring1}
                        stroke="#ffffff"
                        strokeWidth={isActive || isHovered ? 2.5 : 1.5}
                        style={{
                          filter: isActive || isHovered ? 'url(#wheel-slice-shadow)' : 'none',
                          transform: isActive ? 'scale(1.01)' : 'scale(1)',
                          transformOrigin: '0 0',
                        }}
                      />
                      <text
                        transform={`rotate(${rotDeg}) translate(${domRadius}, 0) ${
                          isUpsideDown ? 'rotate(180)' : ''
                        }`}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontSize={11}
                        fontWeight="800"
                        letterSpacing="0.02em"
                        pointerEvents="none"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {lvlSlice.level.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* ============================================================ */}
                {/* CENTER HUB: Interactive Feedback & Active Summary           */}
                {/* ============================================================ */}
                <circle
                  cx={0}
                  cy={0}
                  r={r0}
                  fill="url(#hub-gradient)"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  className="drop-shadow-sm cursor-pointer"
                  onClick={() => {
                    // Reset hover
                    setHoveredVerb(null);
                    setHoveredLevel(null);
                  }}
                />

                {/* Center Content */}
                <g className="pointer-events-none select-none text-center">
                  {hoveredVerb ? (
                    // Hovered Verb Quick Snapshot
                    <>
                      <text
                        y={-24}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize={9}
                        fontWeight="700"
                        letterSpacing="0.05em"
                      >
                        ACTION VERB
                      </text>
                      <text
                        y={-4}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={15}
                        fontWeight="900"
                      >
                        {hoveredVerb.verb}
                      </text>
                      <rect
                        x={-42}
                        y={6}
                        width={84}
                        height={16}
                        rx={8}
                        fill={BLOOM_WHEEL_THEMES[hoveredVerb.level].ring1}
                      />
                      <text
                        y={18}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={9}
                        fontWeight="800"
                      >
                        L{BLOOM_TAXONOMY_DATA[hoveredVerb.level].number} • {hoveredVerb.level}
                      </text>
                      <text
                        y={36}
                        textAnchor="middle"
                        fill="#6366f1"
                        fontSize={8.5}
                        fontWeight="700"
                      >
                        Click to select
                      </text>
                    </>
                  ) : (
                    // Active Level Snapshot
                    <>
                      <text
                        y={-28}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize={8.5}
                        fontWeight="800"
                        letterSpacing="0.06em"
                      >
                        LEVEL {currentLevelData.number} • {currentLevelData.order}
                      </text>
                      <text
                        y={-6}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={16}
                        fontWeight="900"
                      >
                        {currentLevelData.level}
                      </text>
                      <text
                        y={14}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize={9}
                        fontWeight="600"
                      >
                        {currentLevelData.title.split('&')[0]}
                      </text>
                      <text
                        y={32}
                        textAnchor="middle"
                        fill="#4338ca"
                        fontSize={9}
                        fontWeight="700"
                      >
                        Select a verb ↵
                      </text>
                    </>
                  )}
                </g>
              </g>
            </svg>
          </div>

          {/* Wheel legend guide */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
              <span>Inner: Cognitive Domain</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />
              <span>Middle: Sub-Dimension</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-300" />
              <span>Outer: Action Verbs</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full border border-slate-900 bg-white" />
              <span>Used in Course</span>
            </span>
          </div>
        </div>

        {/* Right: Inspection, Pedagogical Rationale & 1-Click Application (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Active Level Card */}
          <div
            className={`p-4 rounded-xl border ${currentLevelData.borderColor} ${currentLevelData.bgLight} transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${currentLevelData.badgeBg} ${currentLevelData.badgeText}`}
                >
                  Level {currentLevelData.number}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    currentLevelData.order === 'HOTS'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-sky-100 text-sky-900 border border-sky-300'
                  }`}
                >
                  {currentLevelData.order === 'HOTS'
                    ? 'Higher-Order (HOTS)'
                    : 'Lower-Order (LOTS)'}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {(courseCoverage.counts[currentLevelData.level] || 0)} of {courseCoverage.total} CLOs
              </span>
            </div>

            <h4 className="mt-2 text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
              <span>{currentLevelData.title}</span>
            </h4>

            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {currentLevelData.actionSummary}
            </p>

            <div className="mt-2.5 p-2 rounded-lg bg-white/80 border border-slate-200/80 text-[11px] text-slate-700 italic flex items-start space-x-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>"{currentLevelData.guidingQuestion}"</span>
            </div>
          </div>

          {/* Selected Verb Details & 1-Click Action */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Selected Action Verb</span>
              </span>
              {selectedVerb && (
                <button
                  type="button"
                  onClick={() => handleCopyVerb(selectedVerb.verb)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition flex items-center space-x-1 cursor-pointer"
                  title="Copy verb to clipboard"
                >
                  {copiedVerb === selectedVerb.verb ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedVerb === selectedVerb.verb ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {selectedVerb ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/80 border border-indigo-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-extrabold text-indigo-950 font-mono">
                        {selectedVerb.verb}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200/80 text-indigo-900">
                        {selectedVerb.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800 mt-0.5">
                      Classified under {selectedVerb.level} (Level {BLOOM_TAXONOMY_DATA[selectedVerb.level].number})
                    </p>
                  </div>

                  <button
                    type="button"
                    id="apply-wheel-verb-btn"
                    onClick={() =>
                      handleSelectVerbDirectly(
                        selectedVerb.verb,
                        selectedVerb.level,
                        selectedVerb.category
                      )
                    }
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                    <span>Apply Verb to CLO</span>
                  </button>
                </div>

                {/* Live Preview of resulting CLO statement */}
                {selectedCLO && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Updated CLO Statement Preview:
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-mono bg-white p-2 rounded border border-slate-200">
                      {previewStatement}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                Click any verb on the wheel outer ring or browse below to select an action verb.
              </div>
            )}

            {appliedFeedback && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{appliedFeedback}</span>
              </div>
            )}
          </div>

          {/* Sentence Stems for Active Level */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Recommended Sentence Stems ({currentLevelData.level})</span>
            </span>

            <div className="space-y-2">
              {currentLevelData.sentenceStems.map((stemObj, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition group flex flex-col justify-between gap-1.5 text-xs text-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {stemObj.context}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyStemDirectly(stemObj.stem, currentLevelData.level)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer opacity-80 group-hover:opacity-100 transition"
                    >
                      <span>Insert Stem</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-serif italic text-slate-700 leading-relaxed">
                    "{stemObj.stem}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Artifacts & Deliverables (Collapsible or Toggled) */}
          {(showArtifacts || true) && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aligned Assessment Artifacts ({currentLevelData.level})</span>
                </span>
                <span className="text-[10px] text-slate-400">OBE & ABET Aligned</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {BLOOM_ASSESSMENT_ARTIFACTS[currentLevelData.level].map((art, aIdx) => (
                  <span
                    key={aIdx}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                  >
                    {art}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
