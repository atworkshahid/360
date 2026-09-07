import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import * as d3 from 'd3';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Download,
  ArrowLeft,
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Eye,
  ChevronRight,
  ExternalLink,
  PieChart as PieIcon,
  Grid,
  Award,
} from 'lucide-react';
import { Course, CLO, Assessment, AssessmentType, BloomLevel } from '../types';

interface DashboardAnalyticsViewProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onBackToCourses?: () => void;
  initialSelectedCourseId?: string;
}

// Standard Bloom order
const BLOOM_LEVELS: BloomLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

const BLOOM_COLORS: Record<BloomLevel, string> = {
  Remember: '#64748b', // slate
  Understand: '#0ea5e9', // sky
  Apply: '#10b981', // emerald
  Analyze: '#f59e0b', // amber
  Evaluate: '#8b5cf6', // violet
  Create: '#ec4899', // pink
};

const ASSESSMENT_TYPE_COLORS: Record<string, string> = {
  Quiz: '#3b82f6',
  Assignment: '#10b981',
  Project: '#8b5cf6',
  Presentation: '#ec4899',
  'Case Study': '#f59e0b',
  Portfolio: '#06b6d4',
  Practical: '#14b8a6',
  Discussion: '#64748b',
  Midterm: '#f97316',
  'Midterm Assessment': '#f97316',
  'Final Assessment': '#ef4444',
  Other: '#94a3b8',
};

export const DashboardAnalyticsView: React.FC<DashboardAnalyticsViewProps> = ({
  courses,
  onSelectCourse,
  onBackToCourses,
  initialSelectedCourseId,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(
    initialSelectedCourseId || 'all'
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bloomFilter, setBloomFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alignmentStatusFilter, setAlignmentStatusFilter] = useState<'all' | 'unaligned' | 'triangulated' | 'single'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'types' | 'matrix' | 'courses' | 'weightage'>('types');

  const d3HeatmapRef = useRef<SVGSVGElement | null>(null);

  // 1. Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (selectedCourseFilter !== 'all' && c.id !== selectedCourseFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      return true;
    });
  }, [courses, selectedCourseFilter, statusFilter]);

  // 2. Extract and link all CLOs to Assessments
  const cloAlignmentData = useMemo(() => {
    const list: Array<{
      courseId: string;
      courseCode: string;
      courseTitle: string;
      courseStatus: string;
      clo: CLO;
      linkedAssessments: Assessment[];
      linkedTypes: AssessmentType[];
      totalWeightage: number;
      alignmentTier: 'unaligned' | 'single' | 'triangulated';
    }> = [];

    filteredCourses.forEach((c) => {
      const courseAssessments = c.assessments || [];
      const courseRubrics = c.rubrics || [];
      const courseEvidenceRules = c.evidenceRules || [];

      (c.clos || []).forEach((clo) => {
        // Collect all assessments linked to this CLO
        const linked = courseAssessments.filter((asmt) => {
          // Direct link in linkedCLOIds
          if (asmt.linkedCLOIds && asmt.linkedCLOIds.includes(clo.id)) {
            return true;
          }
          // Linked via questions
          if (asmt.questions && asmt.questions.some((q) => q.cloId === clo.id)) {
            return true;
          }
          // Linked via rubric criteria
          if (asmt.rubricId) {
            const rub = courseRubrics.find((r) => r.id === asmt.rubricId);
            if (rub && rub.criteria.some((crit) => crit.cloId === clo.id)) {
              return true;
            }
          }
          // Check rubrics targeting this assessment
          const linkedRubric = courseRubrics.find(
            (r) => r.assessmentId === asmt.id && r.criteria.some((crit) => crit.cloId === clo.id)
          );
          if (linkedRubric) return true;

          // Linked via evidence rules
          const rule = courseEvidenceRules.find((er) => er.outcomeId === clo.id);
          if (rule && rule.evidenceSources.some((es) => es.assessmentId === asmt.id)) {
            return true;
          }

          return false;
        });

        const uniqueTypes: AssessmentType[] = Array.from(new Set(linked.map((a) => a.type))).filter(
          (t): t is AssessmentType => Boolean(t)
        );
        const totalWeightage = linked.reduce((sum, a) => sum + (a.weightage || 0), 0);

        let tier: 'unaligned' | 'single' | 'triangulated' = 'unaligned';
        if (uniqueTypes.length >= 2 || linked.length >= 2) {
          tier = 'triangulated';
        } else if (linked.length === 1) {
          tier = 'single';
        }

        list.push({
          courseId: c.id,
          courseCode: c.code || 'NO-CODE',
          courseTitle: c.title,
          courseStatus: c.status || 'draft',
          clo,
          linkedAssessments: linked,
          linkedTypes: uniqueTypes,
          totalWeightage,
          alignmentTier: tier,
        });
      });
    });

    return list;
  }, [filteredCourses]);

  // Apply search, Bloom level, and alignment status filter to the CLO table
  const displayedCLORows = useMemo(() => {
    return cloAlignmentData.filter((row) => {
      if (bloomFilter !== 'all' && row.clo.bloomLevel !== bloomFilter) return false;
      if (alignmentStatusFilter !== 'all' && row.alignmentTier !== alignmentStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = row.clo.code.toLowerCase().includes(q);
        const matchStatement = row.clo.statement.toLowerCase().includes(q);
        const matchCourse = row.courseTitle.toLowerCase().includes(q) || row.courseCode.toLowerCase().includes(q);
        const matchTypes = row.linkedTypes.some((t) => t.toLowerCase().includes(q));
        if (!matchCode && !matchStatement && !matchCourse && !matchTypes) return false;
      }
      return true;
    });
  }, [cloAlignmentData, bloomFilter, alignmentStatusFilter, searchQuery]);

  // 3. KPIs
  const kpis = useMemo(() => {
    const totalCLOs = cloAlignmentData.length;
    const alignedCLOs = cloAlignmentData.filter((r) => r.linkedAssessments.length > 0).length;
    const triangulatedCLOs = cloAlignmentData.filter((r) => r.alignmentTier === 'triangulated').length;
    const unalignedCLOs = totalCLOs - alignedCLOs;
    const alignmentRate = totalCLOs > 0 ? Math.round((alignedCLOs / totalCLOs) * 100) : 0;
    const triangulationRate = totalCLOs > 0 ? Math.round((triangulatedCLOs / totalCLOs) * 100) : 0;

    // Total unique assessments
    const allAssessments = filteredCourses.flatMap((c) => c.assessments || []);
    const totalAssessments = allAssessments.length;

    // Top assessment type
    const typeCountMap: Record<string, number> = {};
    cloAlignmentData.forEach((row) => {
      row.linkedTypes.forEach((t) => {
        typeCountMap[t] = (typeCountMap[t] || 0) + 1;
      });
    });
    const sortedTypes = Object.entries(typeCountMap).sort((a, b) => b[1] - a[1]);
    const topType = sortedTypes.length > 0 ? sortedTypes[0][0] : 'None';

    return {
      totalCourses: filteredCourses.length,
      totalCLOs,
      alignedCLOs,
      unalignedCLOs,
      triangulatedCLOs,
      alignmentRate,
      triangulationRate,
      totalAssessments,
      topType,
    };
  }, [cloAlignmentData, filteredCourses]);

  // 4. Data for Stacked Bar Chart: Assessment Type vs Bloom Level
  const assessmentTypeChartData = useMemo(() => {
    // Collect all distinct assessment types
    const typesSet = new Set<string>();
    filteredCourses.forEach((c) => {
      (c.assessments || []).forEach((a) => {
        if (a.type) typesSet.add(a.type);
      });
    });

    const typesList = Array.from(typesSet);
    if (typesList.length === 0) {
      typesList.push('Quiz', 'Assignment', 'Project', 'Final Assessment', 'Presentation');
    }

    return typesList.map((type) => {
      const dataObj: any = {
        type,
        totalAlignments: 0,
        Remember: 0,
        Understand: 0,
        Apply: 0,
        Analyze: 0,
        Evaluate: 0,
        Create: 0,
      };

      cloAlignmentData.forEach((row) => {
        if (row.linkedTypes.includes(type as AssessmentType)) {
          dataObj.totalAlignments += 1;
          const bl = row.clo.bloomLevel;
          if (bl && dataObj[bl] !== undefined) {
            dataObj[bl] += 1;
          }
        }
      });

      return dataObj;
    }).sort((a, b) => b.totalAlignments - a.totalAlignments);
  }, [filteredCourses, cloAlignmentData]);

  // 5. Data for Course-by-Course Comparison Chart
  const courseComparisonChartData = useMemo(() => {
    return filteredCourses.map((c) => {
      const courseRows = cloAlignmentData.filter((r) => r.courseId === c.id);
      const total = courseRows.length;
      const triangulated = courseRows.filter((r) => r.alignmentTier === 'triangulated').length;
      const single = courseRows.filter((r) => r.alignmentTier === 'single').length;
      const unaligned = courseRows.filter((r) => r.alignmentTier === 'unaligned').length;
      const alignedPct = total > 0 ? Math.round(((triangulated + single) / total) * 100) : 0;

      return {
        id: c.id,
        name: c.code || c.title.substring(0, 15),
        fullName: c.title,
        Triangulated: triangulated,
        SingleAssessment: single,
        Unaligned: unaligned,
        total,
        alignedPct,
      };
    });
  }, [filteredCourses, cloAlignmentData]);

  // 6. Data for Weightage Share Donut Chart
  const weightageShareChartData = useMemo(() => {
    const typeWeightMap: Record<string, number> = {};
    filteredCourses.forEach((c) => {
      (c.assessments || []).forEach((a) => {
        const t = a.type || 'Other';
        typeWeightMap[t] = (typeWeightMap[t] || 0) + (a.weightage || 0);
      });
    });

    const totalWeight = Object.values(typeWeightMap).reduce((s, v) => s + v, 0);

    return Object.entries(typeWeightMap)
      .map(([name, value]) => ({
        name,
        value,
        pct: totalWeight > 0 ? Math.round((value / totalWeight) * 100) : 0,
        color: ASSESSMENT_TYPE_COLORS[name] || '#64748b',
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredCourses]);

  // 7. Data for Radar Chart (Bloom's Cognitive Level coverage by Assessment Types)
  const radarChartData = useMemo(() => {
    return BLOOM_LEVELS.map((bloom) => {
      const rows = cloAlignmentData.filter((r) => r.clo.bloomLevel === bloom);
      const totalCLOs = rows.length;

      let quizCount = 0;
      let projectCount = 0;
      let assignmentCount = 0;
      let finalCount = 0;

      rows.forEach((r) => {
        if (r.linkedTypes.includes('Quiz')) quizCount++;
        if (r.linkedTypes.includes('Project')) projectCount++;
        if (r.linkedTypes.includes('Assignment')) assignmentCount++;
        if (r.linkedTypes.includes('Final Assessment')) finalCount++;
      });

      return {
        bloom,
        totalCLOs,
        Quizzes: quizCount,
        Projects: projectCount,
        Assignments: assignmentCount,
        'Final Exam': finalCount,
      };
    });
  }, [cloAlignmentData]);

  // 8. D3 Interactive Matrix / Heatmap
  useEffect(() => {
    if (activeChartTab !== 'matrix' || !d3HeatmapRef.current) return;

    const svgElement = d3HeatmapRef.current;
    d3.select(svgElement).selectAll('*').remove();

    // Unique assessment types
    const typesSet = new Set<string>();
    filteredCourses.forEach((c) => {
      (c.assessments || []).forEach((a) => {
        if (a.type) typesSet.add(a.type);
      });
    });
    const types = Array.from(typesSet);
    if (types.length === 0) types.push('Quiz', 'Assignment', 'Project', 'Final Assessment');

    const margin = { top: 40, right: 30, bottom: 80, left: 120 };
    const width = 640 - margin.left - margin.right;
    const height = 340 - margin.top - margin.bottom;

    const svg = d3
      .select(svgElement)
      .attr('viewBox', `0 0 640 340`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Assessment Types
    const x = d3.scaleBand().range([0, width]).domain(types).padding(0.08);

    // Y Scale: Bloom Levels
    const y = d3.scaleBand().range([height, 0]).domain(BLOOM_LEVELS).padding(0.08);

    // Matrix counts
    const matrixData: Array<{ type: string; bloom: BloomLevel; count: number }> = [];
    types.forEach((type) => {
      BLOOM_LEVELS.forEach((bloom) => {
        const count = cloAlignmentData.filter(
          (r) => r.clo.bloomLevel === bloom && r.linkedTypes.includes(type as AssessmentType)
        ).length;
        matrixData.push({ type, bloom, count });
      });
    });

    const maxCount = d3.max(matrixData, (d) => d.count) || 1;
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, maxCount]);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-35)')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#475569');

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#334155');

    // Remove axis lines
    svg.selectAll('.domain').remove();

    // Tooltip container
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#0f172a')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '8px')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('z-index', '9999');

    // Draw Heatmap squares
    svg
      .selectAll('rect')
      .data(matrixData)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.type)!)
      .attr('y', (d) => y(d.bloom)!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', (d) => (d.count === 0 ? '#f1f5f9' : colorScale(d.count)))
      .style('stroke', '#cbd5e1')
      .style('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        tooltip
          .style('visibility', 'visible')
          .html(
            `<strong>${d.bloom} Level</strong> with <strong>${d.type}</strong>: ${d.count} CLO${
              d.count === 1 ? '' : 's'
            } aligned`
          );
      })
      .on('mousemove', (event) => {
        tooltip.style('top', `${event.pageY - 28}px`).style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Add count labels inside cells
    svg
      .selectAll('.cell-text')
      .data(matrixData)
      .enter()
      .append('text')
      .attr('class', 'cell-text')
      .attr('x', (d) => x(d.type)! + x.bandwidth() / 2)
      .attr('y', (d) => y(d.bloom)! + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', (d) => (d.count > maxCount * 0.5 ? '#ffffff' : '#475569'))
      .style('pointer-events', 'none')
      .text((d) => (d.count > 0 ? d.count : ''));

    return () => {
      tooltip.remove();
    };
  }, [activeChartTab, filteredCourses, cloAlignmentData]);

  // Export alignment report to CSV
  const handleExportCSV = () => {
    const headers = [
      'Course Code',
      'Course Title',
      'CLO Code',
      'Bloom Level',
      'Learning Domain',
      'CLO Statement',
      'Alignment Status',
      'Linked Assessment Types',
      'Linked Assessments Count',
      'Total Weightage %',
    ];

    const csvRows = cloAlignmentData.map((row) => [
      `"${row.courseCode.replace(/"/g, '""')}"`,
      `"${row.courseTitle.replace(/"/g, '""')}"`,
      `"${row.clo.code.replace(/"/g, '""')}"`,
      `"${row.clo.bloomLevel || ''}"`,
      `"${row.clo.learningDomain || ''}"`,
      `"${row.clo.statement.replace(/"/g, '""')}"`,
      `"${row.alignmentTier}"`,
      `"${row.linkedTypes.join(', ')}"`,
      row.linkedAssessments.length,
      row.totalWeightage,
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `OBE360_CLO_Assessment_Alignment_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                CLO to Assessment Alignment Analytics
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                OBE 360 Verification
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Cross-course analytical verification visualizing constructive alignment between formulated Course Learning Outcomes (CLOs), Bloom’s cognitive hierarchy, and authentic assessment types.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
              title="Download alignment matrix for accreditation dossiers"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export CSV Dossier</span>
            </button>

            {onBackToCourses && (
              <button
                type="button"
                onClick={onBackToCourses}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Courses</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Course Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Course
            </label>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Active Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `[${c.code}] ` : ''}{c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Course Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Course Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts Only</option>
              <option value="submitted">Submitted Only</option>
              <option value="approved">Approved Only</option>
            </select>
          </div>

          {/* Bloom Level */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Bloom's Cognitive Level
            </label>
            <select
              value={bloomFilter}
              onChange={(e) => setBloomFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Cognitive Levels</option>
              {BLOOM_LEVELS.map((bl) => (
                <option key={bl} value={bl}>
                  {bl}
                </option>
              ))}
            </select>
          </div>

          {/* Alignment Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Constructive Alignment
            </label>
            <select
              value={alignmentStatusFilter}
              onChange={(e) => setAlignmentStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Alignment Tiers</option>
              <option value="triangulated">Triangulated (2+ Types)</option>
              <option value="single">Single Assessment Type</option>
              <option value="unaligned">⚠️ Unaligned (0 Assessments)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Alignment Rate */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              CLO Alignment Rate
            </span>
            <ShieldCheck
              className={`w-4 h-4 ${
                kpis.alignmentRate >= 90
                  ? 'text-emerald-500'
                  : kpis.alignmentRate >= 70
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }`}
            />
          </div>
          <p
            className={`text-2xl font-bold mt-1 ${
              kpis.alignmentRate >= 90
                ? 'text-emerald-600'
                : kpis.alignmentRate >= 70
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}
          >
            {kpis.alignmentRate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {kpis.alignedCLOs} of {kpis.totalCLOs} CLOs linked to assessments
          </p>
        </div>

        {/* Triangulation Coverage */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Triangulated Outcomes
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {kpis.triangulationRate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {kpis.triangulatedCLOs} CLOs assessed by 2+ instruments
          </p>
        </div>

        {/* Unaligned CLOs Risk */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Unaligned CLOs
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                kpis.unalignedCLOs === 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            />
          </div>
          <p
            className={`text-2xl font-bold mt-1 ${
              kpis.unalignedCLOs === 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {kpis.unalignedCLOs}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {kpis.unalignedCLOs === 0
              ? 'Zero accreditation gaps detected'
              : 'Require assessment evidence rules'}
          </p>
        </div>

        {/* Dominant Assessment Type */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Dominant Instrument
            </span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 mt-1 truncate">
            {kpis.topType}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {kpis.totalAssessments} active assessments
          </p>
        </div>
      </div>

      {/* Main Visualizations Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        {/* Visualization Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Curricular Alignment Visualizations
            </h3>
            <p className="text-xs text-slate-500">
              Interactive charts exploring alignment distribution, cognitive rigor, and weightage share.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveChartTab('types')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeChartTab === 'types'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Assessment Types</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChartTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeChartTab === 'matrix'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>D3 Heatmap Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChartTab('courses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeChartTab === 'courses'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course Comparison</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChartTab('weightage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeChartTab === 'weightage'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Weightage Share</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Assessment Types vs Bloom's Level (Recharts Stacked Bar + Radar) */}
        {activeChartTab === 'types' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* Stacked Bar Chart */}
              <div className="flex-1 bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      CLO Alignment by Assessment Type (Stacked by Bloom's Level)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Number of distinct CLOs assessed by each instrument, categorized by cognitive tier.
                    </p>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assessmentTypeChartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="type"
                        tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#475569' }}
                        allowDecimals={false}
                        label={{ value: 'CLOs Aligned', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {BLOOM_LEVELS.map((bloom) => (
                        <Bar
                          key={bloom}
                          dataKey={bloom}
                          stackId="a"
                          fill={BLOOM_COLORS[bloom]}
                          radius={[0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar Chart: Cognitive Dimensions */}
              <div className="w-full lg:w-80 bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Cognitive Rigor Radar
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Distribution of top instruments across Bloom levels.
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis
                        dataKey="bloom"
                        tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Radar
                        name="Projects"
                        dataKey="Projects"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.4}
                      />
                      <Radar
                        name="Quizzes"
                        dataKey="Quizzes"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.25}
                      />
                      <Radar
                        name="Final Exam"
                        dataKey="Final Exam"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: D3 Interactive Heatmap Matrix */}
        {activeChartTab === 'matrix' && (
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  D3.js Cross-Tabulation Matrix: Bloom's Level vs. Assessment Types
                </h4>
                <p className="text-[11px] text-slate-500">
                  Density map showing alignment concentration. Hover over any cell to inspect exact CLO counts.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <span>Density:</span>
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />
                <span>0</span>
                <span className="w-3 h-3 rounded bg-blue-200 inline-block" />
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                <span>Max</span>
              </div>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-2">
              <svg ref={d3HeatmapRef} className="max-w-full h-auto" />
            </div>
          </div>
        )}

        {/* VIEW 3: Course-by-Course Comparison Chart */}
        {activeChartTab === 'courses' && (
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Course Alignment Health Breakdown
              </h4>
              <p className="text-[11px] text-slate-500">
                Comparison of Triangulated CLOs (2+ instruments), Single-Assessed, and Unaligned CLOs per course.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseComparisonChartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    allowDecimals={false}
                    label={{ value: 'Total CLOs', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11px',
                    }}
                    formatter={(val, name, item) => [
                      `${val} CLOs`,
                      name === 'Triangulated' ? 'Triangulated (2+ Types)' : name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Triangulated" stackId="course" fill="#10b981" name="Triangulated (Optimal)" />
                  <Bar dataKey="SingleAssessment" stackId="course" fill="#f59e0b" name="Single Instrument" />
                  <Bar dataKey="Unaligned" stackId="course" fill="#ef4444" name="Unaligned (Accreditation Gap)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 4: Weightage Distribution */}
        {activeChartTab === 'weightage' && (
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Assessment Marks & Weightage Allocation by Type
              </h4>
              <p className="text-[11px] text-slate-500">
                Cumulative weightage percentage distribution across all active courses.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="h-64 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={weightageShareChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {weightageShareChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, item: any) => [
                        `${value}% weightage (${item.payload.pct}% share)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Weightage Breakdown
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {weightageShareChartData.map((item) => (
                    <div
                      key={item.name}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CLO Alignment Matrix & Audit Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>CLO Alignment Audit Register</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                {displayedCLORows.length} Outcomes Evaluated
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Granular inspection of learning outcome statements and their verifying assessment instruments.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search outcome text, code, or instrument..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">CLO & Rigor</th>
                <th className="py-3 px-4">Outcome Statement</th>
                <th className="py-3 px-4">Aligned Instruments</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedCLORows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No outcomes match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                displayedCLORows.map((row) => {
                  const bloomColor = BLOOM_COLORS[row.clo.bloomLevel] || '#64748b';

                  return (
                    <tr
                      key={`${row.courseId}-${row.clo.id}`}
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* Course */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">
                          {row.courseCode}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[140px]" title={row.courseTitle}>
                          {row.courseTitle}
                        </span>
                      </td>

                      {/* CLO Code & Bloom */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                          {row.clo.code}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: bloomColor }}
                          />
                          <span className="text-[10px] text-slate-600 font-medium">
                            {row.clo.bloomLevel}
                          </span>
                        </div>
                      </td>

                      {/* Statement */}
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-slate-800 line-clamp-2 text-xs leading-relaxed">
                          {row.clo.statement}
                        </p>
                        {row.clo.competency && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                            Competency: {row.clo.competency}
                          </span>
                        )}
                      </td>

                      {/* Aligned Instruments */}
                      <td className="py-3 px-4">
                        {row.linkedTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.linkedTypes.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs whitespace-nowrap"
                                style={{ backgroundColor: ASSESSMENT_TYPE_COLORS[t] || '#64748b' }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-rose-500 font-semibold italic">
                            None assigned
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {row.linkedAssessments.length} assessment
                          {row.linkedAssessments.length === 1 ? '' : 's'} (
                          {row.totalWeightage}% weight)
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {row.alignmentTier === 'triangulated' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Triangulated</span>
                          </span>
                        )}
                        {row.alignmentTier === 'single' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span>Sufficient (1 Type)</span>
                          </span>
                        )}
                        {row.alignmentTier === 'unaligned' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Unaligned</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectCourse(row.courseId)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
