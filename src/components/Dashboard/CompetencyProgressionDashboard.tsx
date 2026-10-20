import React, { useState, useMemo } from 'react';
import { Course, CLO, BloomLevel } from '../../types';
import { BLOOM_ORDER, BLOOM_RANK } from '../../utils/assessmentAnalysis';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import {
  Brain,
  Target,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Award,
  Search,
  Sparkles,
  Scale,
  TrendingUp,
  Info,
  CheckCircle2,
  GraduationCap,
  SlidersHorizontal,
  Grid,
  Table,
} from 'lucide-react';
import { BloomsMasteryHeatmap } from './BloomsMasteryHeatmap';
import { UnifiedMLOCLOPLOMappingModal } from '../ConstructiveAlignment/UnifiedMLOCLOPLOMappingModal';
import { CompetencyProgressRadar } from './CompetencyProgressRadar';

interface CompetencyProgressionDashboardProps {
  courses: Course[];
}

export type CognitiveIntensityTier = 'all' | 'hots' | 'mots' | 'lots' | BloomLevel;

interface CognitiveLevelMeta {
  level: BloomLevel;
  rank: number;
  tier: 'HOTS' | 'MOTS' | 'LOTS';
  tierLabel: string;
  description: string;
  theme: {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    accent: string;
    lightBg: string;
  };
}

const BLOOM_META: Record<BloomLevel, CognitiveLevelMeta> = {
  Create: {
    level: 'Create',
    rank: 6,
    tier: 'HOTS',
    tierLabel: 'Higher-Order Cognitive Skills (HOTS)',
    description: 'Synthesizing novel architectures, formulating original solutions, and innovative creation.',
    theme: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      badgeBorder: 'border-purple-300',
      accent: '#9333ea',
      lightBg: 'bg-purple-500/10',
    },
  },
  Evaluate: {
    level: 'Evaluate',
    rank: 5,
    tier: 'HOTS',
    tierLabel: 'Higher-Order Cognitive Skills (HOTS)',
    description: 'Critical judgment, rigorous validation, defense of design trade-offs, and quality assessment.',
    theme: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      badgeBorder: 'border-rose-300',
      accent: '#e11d48',
      lightBg: 'bg-rose-500/10',
    },
  },
  Analyze: {
    level: 'Analyze',
    rank: 4,
    tier: 'MOTS',
    tierLabel: 'Mid-Order Cognitive Skills (MOTS)',
    description: 'Deconstructing complex systems, comparative diagnosis, root-cause investigation, and data breakdown.',
    theme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-300',
      accent: '#d97706',
      lightBg: 'bg-amber-500/10',
    },
  },
  Apply: {
    level: 'Apply',
    rank: 3,
    tier: 'MOTS',
    tierLabel: 'Mid-Order Cognitive Skills (MOTS)',
    description: 'Direct procedural execution, algorithmic implementation, calculation, and practical problem solving.',
    theme: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-300',
      accent: '#059669',
      lightBg: 'bg-emerald-500/10',
    },
  },
  Understand: {
    level: 'Understand',
    rank: 2,
    tier: 'LOTS',
    tierLabel: 'Foundational Cognitive Skills (LOTS)',
    description: 'Comprehending theoretical concepts, articulating relationships, translating, and interpreting.',
    theme: {
      bg: 'bg-sky-50/70',
      border: 'border-sky-200',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      badgeBorder: 'border-sky-300',
      accent: '#0284c7',
      lightBg: 'bg-sky-500/10',
    },
  },
  Remember: {
    level: 'Remember',
    rank: 1,
    tier: 'LOTS',
    tierLabel: 'Foundational Cognitive Skills (LOTS)',
    description: 'Recognizing foundational terms, recalling definitions, baseline nomenclature, and core facts.',
    theme: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-800',
      badgeBorder: 'border-slate-300',
      accent: '#475569',
      lightBg: 'bg-slate-500/10',
    },
  },
};

export const CompetencyProgressionDashboard: React.FC<CompetencyProgressionDashboardProps> = ({ courses }) => {
  // Main View Toggle: 'heatmap' (Bloom's Mastery Heatmap grid), 'grouped' (grouped by Bloom's cognitive intensity), 'radar' (competency radar chart), or 'both' (all views)
  const [viewMode, setViewMode] = useState<'heatmap' | 'grouped' | 'radar' | 'both'>('heatmap');

  // Cognitive Intensity Filter Toggle
  const [intensityFilter, setIntensityFilter] = useState<CognitiveIntensityTier>('all');

  // Grouping Strategy: by individual Bloom Level (Create, Evaluate...) or by 3 Cognitive Tiers (HOTS, MOTS, LOTS)
  const [groupingMode, setGroupingMode] = useState<'bloom_level' | 'cognitive_tier'>('bloom_level');

  // Search input for searching CLO statement, code, course, or competency
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Accordion state: which course cards are expanded
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  // Collapsed level sections
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

  // Single Doc I.EMLO-CLO-PLO Alignment Modal
  const [selectedCourseForSingleDoc, setSelectedCourseForSingleDoc] = useState<Course | null>(null);

  // 1. Radar Chart Data: Cumulative Competency Development
  const competencyData = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    courses.forEach((course) => {
      course.clos?.forEach((clo) => {
        if (clo.competency) {
          if (!map[clo.competency]) map[clo.competency] = { total: 0, count: 0 };
          map[clo.competency].total += 1;
          map[clo.competency].count += 1;
        }
      });
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        value: data.total,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 competencies
  }, [courses]);

  // 2. Cognitive Intensity Overall Metrics
  const metrics = useMemo(() => {
    let totalCLOs = 0;
    let totalWeight = 0;
    let rankSum = 0;
    const tierCounts = { HOTS: 0, MOTS: 0, LOTS: 0 };
    const levelCounts: Record<BloomLevel, number> = {
      Create: 0,
      Evaluate: 0,
      Analyze: 0,
      Apply: 0,
      Understand: 0,
      Remember: 0,
    };
    const competencySet = new Set<string>();

    courses.forEach((c) => {
      (c.clos || []).forEach((clo) => {
        totalCLOs += 1;
        totalWeight += clo.weightage || 0;
        const level = clo.bloomLevel || 'Remember';
        const meta = BLOOM_META[level] || BLOOM_META.Remember;
        rankSum += meta.rank;
        tierCounts[meta.tier] += 1;
        levelCounts[level] = (levelCounts[level] || 0) + 1;
        if (clo.competency) competencySet.add(clo.competency);
      });
    });

    const avgRank = totalCLOs > 0 ? (rankSum / totalCLOs).toFixed(1) : '0.0';
    const hotsPct = totalCLOs > 0 ? Math.round((tierCounts.HOTS / totalCLOs) * 100) : 0;
    const motsPct = totalCLOs > 0 ? Math.round((tierCounts.MOTS / totalCLOs) * 100) : 0;
    const lotsPct = totalCLOs > 0 ? Math.round((tierCounts.LOTS / totalCLOs) * 100) : 0;

    return {
      totalCourses: courses.length,
      totalCLOs,
      totalWeight,
      avgRank,
      tierCounts,
      levelCounts,
      hotsPct,
      motsPct,
      lotsPct,
      totalCompetencies: competencySet.size,
    };
  }, [courses]);

  // 3. Courses and CLOs grouped by Bloom's Taxonomy Cognitive Intensity Level
  const groupedData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Helper to test if a CLO matches the cognitive filter and search query
    const cloMatches = (clo: CLO, course: Course): boolean => {
      const level = clo.bloomLevel || 'Remember';
      const meta = BLOOM_META[level] || BLOOM_META.Remember;

      // Cognitive intensity filter check
      if (intensityFilter === 'hots' && meta.tier !== 'HOTS') return false;
      if (intensityFilter === 'mots' && meta.tier !== 'MOTS') return false;
      if (intensityFilter === 'lots' && meta.tier !== 'LOTS') return false;
      if (
        intensityFilter !== 'all' &&
        intensityFilter !== 'hots' &&
        intensityFilter !== 'mots' &&
        intensityFilter !== 'lots' &&
        level !== intensityFilter
      ) {
        return false;
      }

      // Search query check
      if (query) {
        const textMatch =
          clo.statement.toLowerCase().includes(query) ||
          clo.code.toLowerCase().includes(query) ||
          (clo.bloomVerb && clo.bloomVerb.toLowerCase().includes(query)) ||
          (clo.competency && clo.competency.toLowerCase().includes(query)) ||
          (clo.skills && clo.skills.toLowerCase().includes(query)) ||
          course.code.toLowerCase().includes(query) ||
          course.title.toLowerCase().includes(query);
        if (!textMatch) return false;
      }

      return true;
    };

    if (groupingMode === 'cognitive_tier') {
      // Grouping into 3 Tiers: HOTS, MOTS, LOTS
      const tiers: Array<{
        tierKey: 'HOTS' | 'MOTS' | 'LOTS';
        title: string;
        levelsIncluded: BloomLevel[];
        description: string;
        theme: {
          bg: string;
          border: string;
          badgeBg: string;
          badgeText: string;
          badgeBorder: string;
          accent: string;
        };
        coursesWithCLOs: Array<{
          course: Course;
          clos: CLO[];
          totalWeight: number;
        }>;
        totalCLOs: number;
      }> = [
        {
          tierKey: 'HOTS',
          title: 'Higher-Order Cognitive Skills (HOTS)',
          levelsIncluded: ['Create', 'Evaluate'],
          description: 'Advanced cognitive intensity encompassing synthesis, original creation, critical evaluation, and design judgment.',
          theme: {
            bg: 'bg-purple-50/70',
            border: 'border-purple-200',
            badgeBg: 'bg-purple-100',
            badgeText: 'text-purple-800',
            badgeBorder: 'border-purple-300',
            accent: '#9333ea',
          },
          coursesWithCLOs: [],
          totalCLOs: 0,
        },
        {
          tierKey: 'MOTS',
          title: 'Mid-Order Cognitive Skills (MOTS)',
          levelsIncluded: ['Analyze', 'Apply'],
          description: 'Intermediate cognitive intensity targeting systematic deconstruction, procedural application, and algorithmic execution.',
          theme: {
            bg: 'bg-amber-50/70',
            border: 'border-amber-200',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-800',
            badgeBorder: 'border-amber-300',
            accent: '#d97706',
          },
          coursesWithCLOs: [],
          totalCLOs: 0,
        },
        {
          tierKey: 'LOTS',
          title: 'Foundational Cognitive Skills (LOTS)',
          levelsIncluded: ['Understand', 'Remember'],
          description: 'Baseline cognitive intensity focusing on concept comprehension, theoretical articulation, and essential nomenclature recall.',
          theme: {
            bg: 'bg-sky-50/70',
            border: 'border-sky-200',
            badgeBg: 'bg-sky-100',
            badgeText: 'text-sky-800',
            badgeBorder: 'border-sky-300',
            accent: '#0284c7',
          },
          coursesWithCLOs: [],
          totalCLOs: 0,
        },
      ];

      tiers.forEach((t) => {
        courses.forEach((c) => {
          const matchingCLOs = (c.clos || []).filter(
            (clo) => t.levelsIncluded.includes(clo.bloomLevel) && cloMatches(clo, c)
          );
          if (matchingCLOs.length > 0) {
            const totalWeight = matchingCLOs.reduce((sum, clo) => sum + (clo.weightage || 0), 0);
            t.coursesWithCLOs.push({
              course: c,
              clos: matchingCLOs,
              totalWeight,
            });
            t.totalCLOs += matchingCLOs.length;
          }
        });
      });

      return { type: 'tier' as const, groups: tiers };
    }

    // Default: Grouping by each of the 6 Bloom's Taxonomy Cognitive Intensity Levels (Highest to Lowest)
    const bloomLevelsInOrder: BloomLevel[] = ['Create', 'Evaluate', 'Analyze', 'Apply', 'Understand', 'Remember'];

    const groups = bloomLevelsInOrder.map((level) => {
      const meta = BLOOM_META[level];
      const coursesWithCLOs: Array<{
        course: Course;
        clos: CLO[];
        totalWeight: number;
      }> = [];
      let totalCLOs = 0;

      courses.forEach((c) => {
        const matchingCLOs = (c.clos || []).filter(
          (clo) => (clo.bloomLevel || 'Remember') === level && cloMatches(clo, c)
        );

        if (matchingCLOs.length > 0) {
          const totalWeight = matchingCLOs.reduce((sum, clo) => sum + (clo.weightage || 0), 0);
          coursesWithCLOs.push({
            course: c,
            clos: matchingCLOs,
            totalWeight,
          });
          totalCLOs += matchingCLOs.length;
        }
      });

      return {
        level,
        meta,
        coursesWithCLOs,
        totalCLOs,
      };
    });

    return { type: 'level' as const, groups };
  }, [courses, intensityFilter, groupingMode, searchQuery]);

  const toggleCourseExpanded = (courseKey: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseKey]: !prev[courseKey],
    }));
  };

  const toggleLevelCollapsed = (key: string) => {
    setCollapsedLevels((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAllCourses = () => {
    const next: Record<string, boolean> = {};
    courses.forEach((c) => {
      next[c.id] = true;
    });
    setExpandedCourses(next);
  };

  const collapseAllCourses = () => {
    setExpandedCourses({});
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* 1. Header & Primary View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Competency & Cognitive Progression Dashboard
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Audit institutional competency development and analyze courses and Course Learning Outcomes (CLOs)
            grouped by their Bloom's Taxonomy cognitive intensity level.
          </p>
        </div>

        {/* Primary View Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            id="competency-view-heatmap-toggle"
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'heatmap'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Bloom's Mastery Heatmap: Multi-dimensional color-coded matrix across cognitive levels"
          >
            <Grid className="w-3.5 h-3.5 text-purple-600" />
            <span>Bloom's Mastery Heatmap</span>
          </button>

          <button
            type="button"
            id="competency-view-grouped-toggle"
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Group courses and CLOs by Bloom's Taxonomy cognitive intensity level"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Grouped by Bloom Level</span>
          </button>

          <button
            type="button"
            id="competency-view-radar-toggle"
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'radar'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Cumulative competency coverage radar chart"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Competency Radar</span>
          </button>

          <button
            type="button"
            id="competency-view-both-toggle"
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'both'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Show all views combined"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Combined</span>
          </button>
        </div>

        {/* Single Doc I.EMLO-CLO-PLO Quick Button */}
        {courses.length > 0 && (
          <button
            type="button"
            id="competency-dashboard-single-doc-btn"
            onClick={() => setSelectedCourseForSingleDoc(courses[0])}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs shrink-0 self-start lg:self-auto"
            title="Open Single Doc I.EMLO-CLO-PLO Alignment Specification & Custom Mapping Studio"
          >
            <Table className="w-3.5 h-3.5 text-emerald-700" />
            <span>Single Doc I.EMLO-CLO-PLO</span>
          </button>
        )}
      </div>

      {/* 2. Cognitive Intensity Curriculum Distribution Progress Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">
              Curriculum Cognitive Intensity Distribution
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              ({metrics.totalCLOs} CLOs across {metrics.totalCourses} courses)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-medium">
            <span className="text-purple-700 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>HOTS: {metrics.hotsPct}%</span>
            </span>
            <span className="text-amber-700 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>MOTS: {metrics.motsPct}%</span>
            </span>
            <span className="text-sky-700 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>LOTS: {metrics.lotsPct}%</span>
            </span>
            <span className="text-slate-600 border-l border-slate-300 pl-3">
              Avg Bloom Rank: <strong className="text-indigo-700">{metrics.avgRank}</strong> / 6.0
            </span>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${metrics.hotsPct}%` }}
            className="h-full bg-purple-600 transition-all duration-500"
            title={`Higher-Order Cognitive Skills (HOTS): ${metrics.tierCounts.HOTS} CLOs (${metrics.hotsPct}%)`}
          />
          <div
            style={{ width: `${metrics.motsPct}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Mid-Order Cognitive Skills (MOTS): ${metrics.tierCounts.MOTS} CLOs (${metrics.motsPct}%)`}
          />
          <div
            style={{ width: `${metrics.lotsPct}%` }}
            className="h-full bg-sky-500 transition-all duration-500"
            title={`Foundational Cognitive Skills (LOTS): ${metrics.tierCounts.LOTS} CLOs (${metrics.lotsPct}%)`}
          />
        </div>
      </div>

      {/* 2.5 Bloom's Mastery Heatmap Section (rendered when viewMode is 'heatmap' or 'both') */}
      {(viewMode === 'heatmap' || viewMode === 'both') && (
        <BloomsMasteryHeatmap courses={courses} />
      )}

      {/* 3. Radar Chart Section (rendered when viewMode is 'radar' or 'both') */}
      {(viewMode === 'radar' || viewMode === 'both') && (
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Cumulative Competency Coverage Matrix</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Aggregated outcome mapping across institutional target competencies ({metrics.totalCompetencies} active competencies tracked).
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Top 8 Competencies
            </span>
          </div>

          <div className="h-72 w-full bg-white rounded-lg p-2 border border-slate-100 shadow-2xs">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={competencyData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 9 }} />
                <Radar
                  name="CLO Coverage Count"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  formatter={(val: number) => [`${val} CLOs aligned`, 'Competency Coverage']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <CompetencyProgressRadar courses={courses} />
        </div>
      )}

      {/* 4. Filter Toggle Bar for Bloom's Taxonomy Cognitive Intensity Level */}
      {(viewMode === 'grouped' || viewMode === 'both') && (
        <div className="space-y-4 pt-2">
          {/* Main Filter & Grouping Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* Filter Toggle Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 flex items-center space-x-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Intensity Filter:</span>
              </span>

              {/* All Levels */}
              <button
                type="button"
                id="bloom-intensity-filter-all"
                onClick={() => setIntensityFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  intensityFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>All Levels</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  intensityFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {metrics.totalCLOs}
                </span>
              </button>

              {/* Higher-Order (HOTS) */}
              <button
                type="button"
                id="bloom-intensity-filter-hots"
                onClick={() => setIntensityFilter('hots')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  intensityFilter === 'hots'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                }`}
                title="Higher-Order Cognitive Skills: Create (Level 6) & Evaluate (Level 5)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>HOTS (Create / Evaluate)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  intensityFilter === 'hots' ? 'bg-purple-500 text-white' : 'bg-purple-200/60 text-purple-800'
                }`}>
                  {metrics.tierCounts.HOTS}
                </span>
              </button>

              {/* Mid-Order (MOTS) */}
              <button
                type="button"
                id="bloom-intensity-filter-mots"
                onClick={() => setIntensityFilter('mots')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  intensityFilter === 'mots'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
                title="Mid-Order Cognitive Skills: Apply (Level 3) & Analyze (Level 4)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>MOTS (Apply / Analyze)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  intensityFilter === 'mots' ? 'bg-amber-500 text-white' : 'bg-amber-200/60 text-amber-800'
                }`}>
                  {metrics.tierCounts.MOTS}
                </span>
              </button>

              {/* Foundational (LOTS) */}
              <button
                type="button"
                id="bloom-intensity-filter-lots"
                onClick={() => setIntensityFilter('lots')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  intensityFilter === 'lots'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                }`}
                title="Foundational Cognitive Skills: Remember (Level 1) & Understand (Level 2)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>LOTS (Remember / Understand)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  intensityFilter === 'lots' ? 'bg-sky-500 text-white' : 'bg-sky-200/60 text-sky-800'
                }`}>
                  {metrics.tierCounts.LOTS}
                </span>
              </button>
            </div>

            {/* Strategy toggle: Group by 6 Bloom Levels vs 3 Cognitive Tiers */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Group by:</span>
              <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-[11px]">
                <button
                  type="button"
                  id="grouping-strategy-bloom-btn"
                  onClick={() => setGroupingMode('bloom_level')}
                  className={`px-2 py-1 rounded font-bold transition cursor-pointer ${
                    groupingMode === 'bloom_level'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  6 Bloom Levels
                </button>
                <button
                  type="button"
                  id="grouping-strategy-tier-btn"
                  onClick={() => setGroupingMode('cognitive_tier')}
                  className={`px-2 py-1 rounded font-bold transition cursor-pointer ${
                    groupingMode === 'cognitive_tier'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3 Cognitive Tiers
                </button>
              </div>
            </div>
          </div>

          {/* Secondary filter chips for individual Bloom Levels + Search & Expand/Collapse */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Quick Level Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                Specific Level:
              </span>
              {(['Create', 'Evaluate', 'Analyze', 'Apply', 'Understand', 'Remember'] as BloomLevel[]).map((level) => {
                const meta = BLOOM_META[level];
                const count = metrics.levelCounts[level] || 0;
                const isSelected = intensityFilter === level;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensityFilter(isSelected ? 'all' : level)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition cursor-pointer flex items-center space-x-1 ${
                      isSelected
                        ? `${meta.theme.badgeBg} ${meta.theme.badgeText} ${meta.theme.badgeBorder} ring-2 ring-indigo-400 font-bold shadow-2xs`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{level}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-normal">
                      L{meta.rank} ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Expand/Collapse Controls */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter courses, CLOs, competencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
                />
              </div>

              <button
                type="button"
                onClick={expandAllCourses}
                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                title="Expand all course CLO lists"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllCourses}
                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                title="Collapse all course CLO lists"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* 5. Grouped List: Courses and CLOs by Cognitive Intensity Level */}
          <div className="space-y-4 pt-2">
            {groupedData.type === 'bloom_level' ? (
              // RENDER: Grouped by 6 Bloom Levels
              groupedData.groups.map((group) => {
                const isCollapsed = collapsedLevels[group.level];
                const hasResults = group.coursesWithCLOs.length > 0;

                // If filter is active and this group has 0 matches, hide or collapse
                if (!hasResults && intensityFilter !== 'all' && intensityFilter !== group.meta.tier.toLowerCase()) {
                  return null;
                }

                return (
                  <div
                    key={group.level}
                    className={`rounded-2xl border ${group.meta.theme.border} ${group.meta.theme.bg} overflow-hidden shadow-2xs transition`}
                  >
                    {/* Level Header Bar */}
                    <div
                      onClick={() => toggleLevelCollapsed(group.level)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-black/2 transition select-none"
                    >
                      <div className="flex items-start sm:items-center space-x-3">
                        <button
                          type="button"
                          className="mt-0.5 sm:mt-0 p-1 rounded-md text-slate-500 hover:text-slate-800 transition"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${group.meta.theme.badgeBg} ${group.meta.theme.badgeText} ${group.meta.theme.badgeBorder}`}
                            >
                              Bloom Level {group.meta.rank}: {group.level}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600">
                              {group.meta.tierLabel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
                            {group.meta.description}
                          </p>
                        </div>
                      </div>

                      {/* Header Metrics */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200/80 text-slate-800">
                          {group.coursesWithCLOs.length} Courses
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200/80 text-indigo-700">
                          {group.totalCLOs} CLOs
                        </span>
                      </div>
                    </div>

                    {/* Level Body: Courses and CLOs */}
                    {!isCollapsed && (
                      <div className="p-4 pt-1 bg-white/70 border-t border-slate-200/70 space-y-3">
                        {group.coursesWithCLOs.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No courses or CLOs found at this cognitive intensity level matching current filters.
                          </div>
                        ) : (
                          group.coursesWithCLOs.map(({ course, clos, totalWeight }) => {
                            const courseKey = `${group.level}-${course.id}`;
                            const isCourseExpanded = expandedCourses[course.id] ?? true;

                            return (
                              <div
                                key={courseKey}
                                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
                              >
                                {/* Course Row Header */}
                                <div
                                  onClick={() => toggleCourseExpanded(course.id)}
                                  className="px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition select-none border-b border-slate-100"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <button
                                      type="button"
                                      className="p-0.5 text-slate-400 hover:text-slate-600 transition"
                                    >
                                      {isCourseExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <div>
                                      <span className="font-bold text-xs text-slate-900 mr-2">
                                        {course.code}
                                      </span>
                                      <span className="text-xs text-slate-700 font-medium">
                                        {course.title}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 shrink-0">
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                      {clos.length} CLO{clos.length > 1 ? 's' : ''} at {group.level}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      Weight: <strong>{totalWeight}%</strong>
                                    </span>
                                  </div>
                                </div>

                                {/* CLOs List under this course */}
                                {isCourseExpanded && (
                                  <div className="p-3 space-y-2 divide-y divide-slate-100">
                                    {clos.map((clo) => (
                                      <div
                                        key={clo.id}
                                        className="pt-2.5 first:pt-0 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs"
                                      >
                                        <div className="space-y-1.5 flex-1">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                              {clo.code}
                                            </span>
                                            {clo.bloomVerb && (
                                              <span
                                                className={`font-semibold px-2 py-0.5 rounded text-[10px] border ${group.meta.theme.badgeBg} ${group.meta.theme.badgeText} ${group.meta.theme.badgeBorder}`}
                                              >
                                                Verb: {clo.bloomVerb}
                                              </span>
                                            )}
                                            {clo.competency && (
                                              <span className="inline-flex items-center space-x-1 font-semibold px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                <Target className="w-2.5 h-2.5" />
                                                <span>Competency: {clo.competency}</span>
                                              </span>
                                            )}
                                            {clo.proficiencyLevel && (
                                              <span className="font-medium text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                                {clo.proficiencyLevel}
                                              </span>
                                            )}
                                          </div>

                                          <p className="text-slate-800 font-normal leading-relaxed text-xs pl-0.5">
                                            {clo.statement}
                                          </p>

                                          {clo.skills && (
                                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                                              <span className="font-semibold text-slate-600">Skills:</span>
                                              {clo.skills.split(',').map((skill, idx) => (
                                                <span
                                                  key={idx}
                                                  className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 border border-slate-200"
                                                >
                                                  {skill.trim()}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-1 shrink-0 text-right">
                                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                            {clo.weightage}% Course Weight
                                          </span>
                                          {clo.assessmentMethod && (
                                            <span className="text-[10px] text-slate-500">
                                              Assessed: {clo.assessmentMethod}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // RENDER: Grouped by 3 Cognitive Tiers (HOTS, MOTS, LOTS)
              groupedData.groups.map((tierGroup) => {
                const isCollapsed = collapsedLevels[tierGroup.tierKey];
                const hasResults = tierGroup.coursesWithCLOs.length > 0;

                if (!hasResults && intensityFilter !== 'all' && intensityFilter !== tierGroup.tierKey.toLowerCase()) {
                  return null;
                }

                return (
                  <div
                    key={tierGroup.tierKey}
                    className={`rounded-2xl border ${tierGroup.theme.border} ${tierGroup.theme.bg} overflow-hidden shadow-2xs transition`}
                  >
                    {/* Tier Header Bar */}
                    <div
                      onClick={() => toggleLevelCollapsed(tierGroup.tierKey)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-black/2 transition select-none"
                    >
                      <div className="flex items-start sm:items-center space-x-3">
                        <button
                          type="button"
                          className="mt-0.5 sm:mt-0 p-1 rounded-md text-slate-500 hover:text-slate-800 transition"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${tierGroup.theme.badgeBg} ${tierGroup.theme.badgeText} ${tierGroup.theme.badgeBorder}`}
                            >
                              {tierGroup.title}
                            </span>
                            <span className="text-[11px] text-slate-600 font-medium">
                              Includes: {tierGroup.levelsIncluded.join(' & ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
                            {tierGroup.description}
                          </p>
                        </div>
                      </div>

                      {/* Header Metrics */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200/80 text-slate-800">
                          {tierGroup.coursesWithCLOs.length} Courses
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200/80 text-indigo-700">
                          {tierGroup.totalCLOs} CLOs
                        </span>
                      </div>
                    </div>

                    {/* Tier Body: Courses & CLOs */}
                    {!isCollapsed && (
                      <div className="p-4 pt-1 bg-white/70 border-t border-slate-200/70 space-y-3">
                        {tierGroup.coursesWithCLOs.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No courses or CLOs found in this cognitive tier matching current filters.
                          </div>
                        ) : (
                          tierGroup.coursesWithCLOs.map(({ course, clos, totalWeight }) => {
                            const courseKey = `${tierGroup.tierKey}-${course.id}`;
                            const isCourseExpanded = expandedCourses[course.id] ?? true;

                            return (
                              <div
                                key={courseKey}
                                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
                              >
                                <div
                                  onClick={() => toggleCourseExpanded(course.id)}
                                  className="px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition select-none border-b border-slate-100"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <button
                                      type="button"
                                      className="p-0.5 text-slate-400 hover:text-slate-600 transition"
                                    >
                                      {isCourseExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <div>
                                      <span className="font-bold text-xs text-slate-900 mr-2">
                                        {course.code}
                                      </span>
                                      <span className="text-xs text-slate-700 font-medium">
                                        {course.title}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 shrink-0">
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                      {clos.length} CLO{clos.length > 1 ? 's' : ''} in {tierGroup.tierKey}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      Weight: <strong>{totalWeight}%</strong>
                                    </span>
                                  </div>
                                </div>

                                {isCourseExpanded && (
                                  <div className="p-3 space-y-2 divide-y divide-slate-100">
                                    {clos.map((clo) => {
                                      const cloMeta = BLOOM_META[clo.bloomLevel] || BLOOM_META.Remember;

                                      return (
                                        <div
                                          key={clo.id}
                                          className="pt-2.5 first:pt-0 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs"
                                        >
                                          <div className="space-y-1.5 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                                {clo.code}
                                              </span>
                                              <span
                                                className={`font-semibold px-2 py-0.5 rounded text-[10px] border ${cloMeta.theme.badgeBg} ${cloMeta.theme.badgeText} ${cloMeta.theme.badgeBorder}`}
                                              >
                                                {clo.bloomLevel} (L{cloMeta.rank})
                                              </span>
                                              {clo.bloomVerb && (
                                                <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                                  Verb: {clo.bloomVerb}
                                                </span>
                                              )}
                                              {clo.competency && (
                                                <span className="inline-flex items-center space-x-1 font-semibold px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                  <Target className="w-2.5 h-2.5" />
                                                  <span>Competency: {clo.competency}</span>
                                                </span>
                                              )}
                                            </div>

                                            <p className="text-slate-800 font-normal leading-relaxed text-xs pl-0.5">
                                              {clo.statement}
                                            </p>
                                          </div>

                                          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-1 shrink-0 text-right">
                                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                              {clo.weightage}% Weight
                                            </span>
                                            {clo.proficiencyLevel && (
                                              <span className="text-[10px] text-slate-500 font-medium">
                                                Proficiency: {clo.proficiencyLevel}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {/* Single Doc I.EMLO-CLO-PLO Alignment Modal */}
      {selectedCourseForSingleDoc && (
        <UnifiedMLOCLOPLOMappingModal
          course={selectedCourseForSingleDoc}
          isOpen={!!selectedCourseForSingleDoc}
          onClose={() => setSelectedCourseForSingleDoc(null)}
        />
      )}
    </div>
  );
};
