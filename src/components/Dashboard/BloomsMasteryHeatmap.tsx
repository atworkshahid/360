import React, { useState, useMemo } from 'react';
import { Course, CLO, BloomLevel } from '../../types';
import { BLOOM_ORDER, BLOOM_RANK } from '../../utils/assessmentAnalysis';
import {
  Grid,
  Filter,
  Search,
  Download,
  Info,
  ChevronRight,
  X,
  Sparkles,
  Target,
  ArrowUpDown,
  Layers,
  Brain,
  Award,
  SlidersHorizontal,
  Flame,
  Check,
} from 'lucide-react';

interface BloomsMasteryHeatmapProps {
  courses: Course[];
  className?: string;
}

export type HeatmapMetricMode = 'count' | 'weight' | 'mastery';

interface CellData {
  course: Course;
  level: BloomLevel;
  clos: CLO[];
  count: number;
  totalWeight: number;
  masteryScore: number; // calculated weighted by proficiency (Expert = 3, Proficient = 2, Novice = 1)
  verbs: string[];
  competencies: string[];
}

const BLOOM_LEVELS: BloomLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

const BLOOM_META: Record<
  BloomLevel,
  {
    rank: number;
    tier: 'LOTS' | 'MOTS' | 'HOTS';
    tierLabel: string;
    description: string;
    colorName: string;
    headerBg: string;
    headerText: string;
  }
> = {
  Remember: {
    rank: 1,
    tier: 'LOTS',
    tierLabel: 'Foundational (LOTS)',
    description: 'Knowledge recall, facts, definitions',
    colorName: 'slate',
    headerBg: 'bg-slate-100 text-slate-800 border-slate-300',
    headerText: 'text-slate-700',
  },
  Understand: {
    rank: 2,
    tier: 'LOTS',
    tierLabel: 'Foundational (LOTS)',
    description: 'Comprehension, explaining concepts',
    colorName: 'sky',
    headerBg: 'bg-sky-100 text-sky-900 border-sky-300',
    headerText: 'text-sky-700',
  },
  Apply: {
    rank: 3,
    tier: 'MOTS',
    tierLabel: 'Mid-Order (MOTS)',
    description: 'Procedural execution, problem solving',
    colorName: 'emerald',
    headerBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    headerText: 'text-emerald-700',
  },
  Analyze: {
    rank: 4,
    tier: 'MOTS',
    tierLabel: 'Mid-Order (MOTS)',
    description: 'Deconstructing systems, comparative diagnosis',
    colorName: 'amber',
    headerBg: 'bg-amber-100 text-amber-900 border-amber-300',
    headerText: 'text-amber-700',
  },
  Evaluate: {
    rank: 5,
    tier: 'HOTS',
    tierLabel: 'Higher-Order (HOTS)',
    description: 'Critical judgment, defense, validation',
    colorName: 'rose',
    headerBg: 'bg-rose-100 text-rose-900 border-rose-300',
    headerText: 'text-rose-700',
  },
  Create: {
    rank: 6,
    tier: 'HOTS',
    tierLabel: 'Higher-Order (HOTS)',
    description: 'Synthesis, original design, innovation',
    colorName: 'purple',
    headerBg: 'bg-purple-100 text-purple-900 border-purple-300',
    headerText: 'text-purple-700',
  },
};

export const BloomsMasteryHeatmap: React.FC<BloomsMasteryHeatmapProps> = ({
  courses,
  className = '',
}) => {
  // Metric display mode: 'count' (CLO count), 'weight' (sum of weightage %), 'mastery' (proficiency weighted score)
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('count');

  // Sorting mode
  const [sortBy, setSortBy] = useState<'code' | 'avg_bloom' | 'hots' | 'total_clos'>('avg_bloom');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Competency filter
  const [selectedCompetency, setSelectedCompetency] = useState<string>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected cell for inspecting details in a slide-over/popover
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  // Extract all distinct competencies across courses
  const allCompetencies = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      (c.clos || []).forEach((clo) => {
        if (clo.competency) set.add(clo.competency);
      });
    });
    return Array.from(set).sort();
  }, [courses]);

  // Compute cell data grid and row stats
  const { gridRows, columnTotals, maxCount, maxWeight, maxMastery, curriculumAverages } = useMemo(() => {
    let maxC = 1;
    let maxW = 1;
    let maxM = 1;

    const colTotals: Record<
      BloomLevel,
      { count: number; totalWeight: number; masteryScore: number }
    > = {
      Remember: { count: 0, totalWeight: 0, masteryScore: 0 },
      Understand: { count: 0, totalWeight: 0, masteryScore: 0 },
      Apply: { count: 0, totalWeight: 0, masteryScore: 0 },
      Analyze: { count: 0, totalWeight: 0, masteryScore: 0 },
      Evaluate: { count: 0, totalWeight: 0, masteryScore: 0 },
      Create: { count: 0, totalWeight: 0, masteryScore: 0 },
    };

    const rows = courses.map((course) => {
      const clos = course.clos || [];
      const filteredCLOs = clos.filter((clo) => {
        if (selectedCompetency !== 'all' && clo.competency !== selectedCompetency) {
          return false;
        }
        return true;
      });

      // Calculate cells for this course
      const cells: Record<BloomLevel, CellData> = {} as any;
      let courseTotalCLOs = 0;
      let courseTotalWeight = 0;
      let courseRankSum = 0;
      let courseHotsCount = 0;

      BLOOM_LEVELS.forEach((level) => {
        const levelCLOs = filteredCLOs.filter(
          (clo) => (clo.bloomLevel || 'Remember') === level
        );

        const count = levelCLOs.length;
        const totalWeight = levelCLOs.reduce((sum, clo) => sum + (clo.weightage || 0), 0);

        // Mastery score calculation: Expert = 3pts, Proficient = 2pts, Novice/unspecified = 1pt
        const masteryScore = levelCLOs.reduce((sum, clo) => {
          const profMultiplier =
            clo.proficiencyLevel === 'Expert'
              ? 3
              : clo.proficiencyLevel === 'Proficient'
              ? 2
              : 1;
          return sum + (clo.weightage ? (clo.weightage / 100) * profMultiplier * 10 : profMultiplier);
        }, 0);

        if (count > maxC) maxC = count;
        if (totalWeight > maxW) maxW = totalWeight;
        if (masteryScore > maxM) maxM = masteryScore;

        // Accumulate column totals
        colTotals[level].count += count;
        colTotals[level].totalWeight += totalWeight;
        colTotals[level].masteryScore += masteryScore;

        courseTotalCLOs += count;
        courseTotalWeight += totalWeight;
        courseRankSum += count * BLOOM_META[level].rank;
        if (level === 'Evaluate' || level === 'Create') {
          courseHotsCount += count;
        }

        const verbs: string[] = Array.from(
          new Set(levelCLOs.map((c) => c.bloomVerb).filter((v): v is string => Boolean(v)))
        );
        const competencies: string[] = Array.from(
          new Set(levelCLOs.map((c) => c.competency).filter((c): c is string => Boolean(c)))
        );

        cells[level] = {
          course,
          level,
          clos: levelCLOs,
          count,
          totalWeight,
          masteryScore: Math.round(masteryScore * 10) / 10,
          verbs,
          competencies,
        };
      });

      const avgBloom = courseTotalCLOs > 0 ? courseRankSum / courseTotalCLOs : 0;
      const hotsRatio = courseTotalCLOs > 0 ? (courseHotsCount / courseTotalCLOs) * 100 : 0;

      return {
        course,
        cells,
        totalCLOs: courseTotalCLOs,
        totalWeight: courseTotalWeight,
        avgBloom,
        hotsRatio,
      };
    });

    // Total curriculum statistics
    const totalCLOsAll = Object.values(colTotals).reduce((sum, v) => sum + v.count, 0);
    const curriculumAvgBloom =
      totalCLOsAll > 0
        ? (
            (colTotals.Remember.count * 1 +
              colTotals.Understand.count * 2 +
              colTotals.Apply.count * 3 +
              colTotals.Analyze.count * 4 +
              colTotals.Evaluate.count * 5 +
              colTotals.Create.count * 6) /
            totalCLOsAll
          ).toFixed(2)
        : '0.00';

    return {
      gridRows: rows,
      columnTotals: colTotals,
      maxCount: maxC,
      maxWeight: maxW,
      maxMastery: maxM,
      curriculumAverages: {
        totalCLOs: totalCLOsAll,
        avgBloom: curriculumAvgBloom,
      },
    };
  }, [courses, selectedCompetency]);

  // Filter and Sort grid rows
  const sortedAndFilteredRows = useMemo(() => {
    let result = [...gridRows];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.course.code.toLowerCase().includes(q) ||
          r.course.title.toLowerCase().includes(q)
      );
    }

    // Sort rows
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'code') {
        comparison = a.course.code.localeCompare(b.course.code);
      } else if (sortBy === 'avg_bloom') {
        comparison = a.avgBloom - b.avgBloom;
      } else if (sortBy === 'hots') {
        comparison = a.hotsRatio - b.hotsRatio;
      } else if (sortBy === 'total_clos') {
        comparison = a.totalCLOs - b.totalCLOs;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [gridRows, searchQuery, sortBy, sortDirection]);

  // Color Intensity Function based on Metric Mode
  const getCellColorStyles = (cell: CellData) => {
    if (cell.count === 0) {
      return {
        bg: 'bg-slate-50/70',
        text: 'text-slate-300',
        border: 'border-slate-100',
        badge: 'bg-transparent text-slate-300',
        hover: 'hover:bg-slate-100/80',
      };
    }

    let ratio = 0;
    if (metricMode === 'count') {
      ratio = maxCount > 0 ? cell.count / maxCount : 0;
    } else if (metricMode === 'weight') {
      ratio = maxWeight > 0 ? cell.totalWeight / maxWeight : 0;
    } else {
      ratio = maxMastery > 0 ? cell.masteryScore / maxMastery : 0;
    }

    // Individual level color schemes
    const level = cell.level;
    if (level === 'Create') {
      if (ratio > 0.66) return { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700', badge: 'bg-purple-700 text-white font-black', hover: 'hover:bg-purple-700' };
      if (ratio > 0.33) return { bg: 'bg-purple-400', text: 'text-white', border: 'border-purple-500', badge: 'bg-purple-500 text-white font-bold', hover: 'hover:bg-purple-500' };
      return { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-200', badge: 'bg-purple-200 text-purple-900 font-semibold', hover: 'hover:bg-purple-200' };
    }
    if (level === 'Evaluate') {
      if (ratio > 0.66) return { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700', badge: 'bg-rose-700 text-white font-black', hover: 'hover:bg-rose-700' };
      if (ratio > 0.33) return { bg: 'bg-rose-400', text: 'text-white', border: 'border-rose-500', badge: 'bg-rose-500 text-white font-bold', hover: 'hover:bg-rose-500' };
      return { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-200', badge: 'bg-rose-200 text-rose-900 font-semibold', hover: 'hover:bg-rose-200' };
    }
    if (level === 'Analyze') {
      if (ratio > 0.66) return { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600', badge: 'bg-amber-600 text-white font-black', hover: 'hover:bg-amber-600' };
      if (ratio > 0.33) return { bg: 'bg-amber-300', text: 'text-amber-950', border: 'border-amber-400', badge: 'bg-amber-400 text-amber-950 font-bold', hover: 'hover:bg-amber-400' };
      return { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-200', badge: 'bg-amber-200 text-amber-900 font-semibold', hover: 'hover:bg-amber-200' };
    }
    if (level === 'Apply') {
      if (ratio > 0.66) return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', badge: 'bg-emerald-700 text-white font-black', hover: 'hover:bg-emerald-700' };
      if (ratio > 0.33) return { bg: 'bg-emerald-400', text: 'text-white', border: 'border-emerald-500', badge: 'bg-emerald-500 text-white font-bold', hover: 'hover:bg-emerald-500' };
      return { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-200', badge: 'bg-emerald-200 text-emerald-900 font-semibold', hover: 'hover:bg-emerald-200' };
    }
    if (level === 'Understand') {
      if (ratio > 0.66) return { bg: 'bg-sky-600', text: 'text-white', border: 'border-sky-700', badge: 'bg-sky-700 text-white font-black', hover: 'hover:bg-sky-700' };
      if (ratio > 0.33) return { bg: 'bg-sky-400', text: 'text-white', border: 'border-sky-500', badge: 'bg-sky-500 text-white font-bold', hover: 'hover:bg-sky-500' };
      return { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-200', badge: 'bg-sky-200 text-sky-900 font-semibold', hover: 'hover:bg-sky-200' };
    }
    // Remember
    if (ratio > 0.66) return { bg: 'bg-slate-700', text: 'text-white', border: 'border-slate-800', badge: 'bg-slate-800 text-white font-black', hover: 'hover:bg-slate-800' };
    if (ratio > 0.33) return { bg: 'bg-slate-400', text: 'text-white', border: 'border-slate-500', badge: 'bg-slate-500 text-white font-bold', hover: 'hover:bg-slate-500' };
    return { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300', badge: 'bg-slate-300 text-slate-900 font-semibold', hover: 'hover:bg-slate-300' };
  };

  const handleExportCSV = () => {
    const headers = [
      'Course Code',
      'Course Title',
      'Total CLOs',
      'Average Bloom Rank',
      'HOTS Ratio (%)',
      ...BLOOM_LEVELS.map((l) => `${l} (Count)`),
      ...BLOOM_LEVELS.map((l) => `${l} (Weight %)`),
    ];

    const rows = sortedAndFilteredRows.map((r) => [
      `"${r.course.code}"`,
      `"${r.course.title.replace(/"/g, '""')}"`,
      r.totalCLOs,
      r.avgBloom.toFixed(2),
      `${Math.round(r.hotsRatio)}%`,
      ...BLOOM_LEVELS.map((l) => r.cells[l].count),
      ...BLOOM_LEVELS.map((l) => r.cells[l].totalWeight),
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Blooms_Mastery_Heatmap_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 ${className}`}>
      {/* Header and Summary Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <Grid className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Bloom's Mastery Heatmap</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Cognitive Matrix
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-dimensional color-coded matrix evaluating course distribution across Bloom's Taxonomy cognitive intensity levels.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Mode Pill Selector */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMetricMode('count')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                metricMode === 'count'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show count of CLOs at each cognitive level"
            >
              <span>CLO Count</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('weight')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                metricMode === 'weight'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show syllabus assessment weight (%) at each cognitive level"
            >
              <span>Weightage (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('mastery')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                metricMode === 'mastery'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show mastery intensity weighted by student proficiency ratings"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Mastery Score</span>
            </button>
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Download full matrix dataset as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Matrix</span>
          </button>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Competency Filter */}
          <div className="flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold text-slate-700">Competency:</span>
            <select
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px] truncate"
            >
              <option value="all">All Competencies ({allCompetencies.length})</option>
              {allCompetencies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="avg_bloom">Average Cognitive Intensity</option>
              <option value="hots">HOTS Ratio (% Evaluate/Create)</option>
              <option value="total_clos">Total CLOs Mapped</option>
              <option value="code">Course Code</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition cursor-pointer"
              title={`Toggle sort order: Currently ${sortDirection === 'desc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'desc' ? 'High → Low' : 'Low → High'}
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-56"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Heatmap Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center space-x-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Heatmap Intensity:</span>
          </span>
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-400">
              0 (No CLOs)
            </span>
            <span className="px-2 py-0.5 rounded border border-purple-200 bg-purple-100 text-purple-800">
              Light Concentration
            </span>
            <span className="px-2 py-0.5 rounded border border-purple-400 bg-purple-400 text-white font-medium">
              Medium Intensity
            </span>
            <span className="px-2 py-0.5 rounded border border-purple-700 bg-purple-600 text-white font-bold">
              Heavy Mastery Focus
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Showing <strong>{sortedAndFilteredRows.length}</strong> of <strong>{courses.length}</strong> courses • Click any cell to inspect learning outcomes
        </div>
      </div>

      {/* Main Heatmap Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-xs">
          {/* Table Header: Bloom Levels Progression */}
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200">
              <th className="p-3.5 font-bold text-slate-700 min-w-[200px] sticky left-0 bg-slate-100/95 z-10 border-r border-slate-200">
                Course Identifier
              </th>
              {BLOOM_LEVELS.map((level) => {
                const meta = BLOOM_META[level];
                return (
                  <th
                    key={level}
                    className="p-3 text-center min-w-[130px] border-r border-slate-200 last:border-r-0"
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-white/90 border border-slate-300 text-slate-700">
                          L{meta.rank}
                        </span>
                        <span className="font-extrabold text-slate-900 tracking-tight">
                          {level}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {meta.tier}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="p-3 text-center font-bold text-slate-700 min-w-[120px] bg-slate-100/95">
                Cognitive Profile
              </th>
            </tr>
          </thead>

          {/* Table Body: Course Rows */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedAndFilteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={BLOOM_LEVELS.length + 2}
                  className="p-8 text-center text-slate-400 text-xs"
                >
                  No courses found matching current search or competency filter.
                </td>
              </tr>
            ) : (
              sortedAndFilteredRows.map((row) => (
                <tr key={row.course.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Sticky Course Column */}
                  <td className="p-3.5 sticky left-0 bg-white hover:bg-slate-50/50 z-10 border-r border-slate-200">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {row.course.code}
                        </span>
                        {row.hotsRatio >= 50 && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200"
                            title="Over 50% Higher-Order Cognitive Focus"
                          >
                            HOTS Focused
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 text-[11px] truncate max-w-[220px]" title={row.course.title}>
                        {row.course.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {row.totalCLOs} CLOs mapped
                      </div>
                    </div>
                  </td>

                  {/* 6 Bloom Level Grid Cells */}
                  {BLOOM_LEVELS.map((level) => {
                    const cell = row.cells[level];
                    const styles = getCellColorStyles(cell);
                    const isSelected =
                      selectedCell?.course.id === row.course.id && selectedCell?.level === level;

                    let primaryValueDisplay = `${cell.count} CLO${cell.count === 1 ? '' : 's'}`;
                    if (metricMode === 'weight') {
                      primaryValueDisplay = `${cell.totalWeight}%`;
                    } else if (metricMode === 'mastery') {
                      primaryValueDisplay = `${cell.masteryScore} pts`;
                    }

                    return (
                      <td
                        key={level}
                        onClick={() => setSelectedCell(cell)}
                        className={`p-2.5 text-center border-r border-slate-100 last:border-r-0 cursor-pointer transition select-none ${
                          styles.bg
                        } ${styles.hover} ${
                          isSelected ? 'ring-2 ring-indigo-500 ring-inset shadow-inner font-bold' : ''
                        }`}
                        title={`Click to inspect ${cell.count} CLOs in ${level} for ${row.course.code}`}
                      >
                        {cell.count > 0 ? (
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-bold ${styles.text}`}
                            >
                              {primaryValueDisplay}
                            </span>

                            {/* Secondary micro-metric badge */}
                            <div className="flex items-center space-x-1 text-[9px] opacity-90 font-medium">
                              {metricMode !== 'count' && (
                                <span className={styles.text}>{cell.count} CLOs</span>
                              )}
                              {metricMode === 'count' && cell.totalWeight > 0 && (
                                <span className={styles.text}>{cell.totalWeight}% wt</span>
                              )}
                            </div>

                            {/* Verb pill preview */}
                            {cell.verbs.length > 0 && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded truncate max-w-[100px] ${styles.badge}`}
                              >
                                {cell.verbs.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-10 flex items-center justify-center text-slate-300 text-xs font-mono">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Rightmost Profile Summary Column */}
                  <td className="p-3 text-center border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="flex items-center space-x-1 font-bold text-slate-800 text-xs">
                        <Brain className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Avg L{row.avgBloom.toFixed(1)}</span>
                      </div>
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${Math.min(100, Math.round(row.hotsRatio))}%` }}
                          className="h-full bg-purple-600"
                          title={`HOTS Ratio: ${Math.round(row.hotsRatio)}%`}
                        />
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium">
                        {Math.round(row.hotsRatio)}% HOTS
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Table Footer: Column Totals */}
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs">
              <td className="p-3.5 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 text-slate-900">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Curriculum Totals</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal">
                  Overall Avg Bloom: <strong>L{curriculumAverages.avgBloom}</strong>
                </div>
              </td>
              {BLOOM_LEVELS.map((level) => {
                const total = columnTotals[level];
                const meta = BLOOM_META[level];
                const pct =
                  curriculumAverages.totalCLOs > 0
                    ? Math.round((total.count / curriculumAverages.totalCLOs) * 100)
                    : 0;

                return (
                  <td
                    key={level}
                    className="p-3 text-center border-r border-slate-200 last:border-r-0"
                  >
                    <div className="flex flex-col items-center justify-center space-y-0.5">
                      <span className="text-xs font-black text-slate-900">
                        {metricMode === 'weight'
                          ? `${total.totalWeight}%`
                          : metricMode === 'mastery'
                          ? `${Math.round(total.masteryScore)}`
                          : `${total.count} CLOs`}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {pct}% of curriculum
                      </span>
                    </div>
                  </td>
                );
              })}
              <td className="p-3 text-center text-slate-900 font-bold">
                <div>{curriculumAverages.totalCLOs} Total</div>
                <div className="text-[10px] text-indigo-700">100% Mapped</div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Selected Cell Modal / Drawer Inspector */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      BLOOM_META[selectedCell.level].headerBg
                    }`}
                  >
                    {selectedCell.level} (Level {BLOOM_META[selectedCell.level].rank})
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {BLOOM_META[selectedCell.level].tierLabel}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedCell.course.code}: {selectedCell.course.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Metrics Bar */}
            <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100/70 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4">
                <span className="text-slate-700 font-medium">
                  Concentration: <strong className="text-indigo-900">{selectedCell.count} CLOs</strong>
                </span>
                <span className="text-slate-700 font-medium">
                  Assessment Weight: <strong className="text-indigo-900">{selectedCell.totalWeight}%</strong>
                </span>
                <span className="text-slate-700 font-medium">
                  Mastery Score: <strong className="text-indigo-900">{selectedCell.masteryScore} pts</strong>
                </span>
              </div>
            </div>

            {/* Modal CLO List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedCell.clos.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No learning outcomes configured at this cognitive level.
                </div>
              ) : (
                selectedCell.clos.map((clo) => (
                  <div
                    key={clo.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {clo.code}
                        </span>
                        {clo.bloomVerb && (
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Action Verb: {clo.bloomVerb}
                          </span>
                        )}
                        {clo.proficiencyLevel && (
                          <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {clo.proficiencyLevel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {clo.weightage}% Course Weight
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-800 font-normal leading-relaxed text-xs">
                      {clo.statement}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      {clo.competency ? (
                        <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                          <Target className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Competency: {clo.competency}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">General Core Competency</span>
                      )}

                      {clo.assessmentMethod && (
                        <div className="text-slate-500">
                          Assessed by: <strong>{clo.assessmentMethod}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
