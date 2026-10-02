import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import {
  Brain,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sliders,
  Download,
  Eye,
  Scale,
  Compass,
} from 'lucide-react';
import { Course, BloomLevel, LearningDomain, CLO } from '../../types';
import { BLOOM_TAXONOMY_DATA } from '../CourseCreator/BloomsTaxonomyHelperModal';

export type RadarMode = 'bloom-cognitive' | 'learning-domains' | 'accreditation-dimensions';

export interface RadarAxisData {
  key: string;
  label: string;
  shortLabel: string;
  orderIndex: number;
  actualScore: number; // 0 to 100
  targetScore: number; // 0 to 100 benchmark
  unitLabel: string;
  matchedCLOs: CLO[];
  matchedAssessmentsCount: number;
  description: string;
  recommendation: string;
  levelBadge?: string;
  color: string;
}

interface BloomDomainRadarChartProps {
  course: Course;
  onAskCopilot?: (prompt: string) => void;
  onJumpToStep?: (stepNumber: number) => void;
  initialMode?: RadarMode;
  className?: string;
  isCompact?: boolean;
}

export const BloomDomainRadarChart: React.FC<BloomDomainRadarChartProps> = ({
  course,
  onAskCopilot,
  onJumpToStep,
  initialMode = 'bloom-cognitive',
  className = '',
  isCompact = false,
}) => {
  const [mode, setMode] = useState<RadarMode>(initialMode);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  const [hoveredAxis, setHoveredAxis] = useState<RadarAxisData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute Bloom's Taxonomy Cognitive 6-Level Radar Data
  const bloomCognitiveAxes: RadarAxisData[] = useMemo(() => {
    const levels: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    const totalCLOs = course.clos.length || 1;

    // Recommended Washington Accord / ABET benchmark target distribution for higher education
    const benchmarks: Record<BloomLevel, number> = {
      Remember: 15,
      Understand: 25,
      Apply: 45,
      Analyze: 60,
      Evaluate: 40,
      Create: 30,
    };

    const colors: Record<BloomLevel, string> = {
      Remember: '#64748b',  // Slate
      Understand: '#0284c7', // Sky
      Apply: '#0d9488',      // Teal
      Analyze: '#4f46e5',    // Indigo
      Evaluate: '#7c3aed',   // Violet
      Create: '#db2777',     // Pink
    };

    return levels.map((lvl, idx) => {
      const matched = course.clos.filter((c) => c.bloomLevel === lvl);
      const cloCount = matched.length;
      const weightSum = matched.reduce((sum, c) => sum + (c.weightage || 0), 0);

      // Match assessments targeting this level
      const cloIds = new Set(matched.map((c) => c.id));
      const asmtCount = course.assessments.filter((a) =>
        a.targetCLOIds?.some((id) => cloIds.has(id))
      ).length;

      // Count MLOs targeting this level
      const mloCount = course.modules.flatMap((m) => m.mlos || []).filter(
        (m) => m.bloomLevel === lvl || cloIds.has(m.linkedCLOId)
      ).length;

      // Calculate composite alignment score (0 - 100)
      // Weightage (40%) + CLO presence normalized (30%) + Assessment alignment (30%)
      let score = 0;
      if (cloCount > 0) {
        const weightScore = Math.min(100, (weightSum / 35) * 100);
        const presenceScore = Math.min(100, (cloCount / Math.max(1, totalCLOs * 0.4)) * 100);
        const asmtScore = Math.min(100, (asmtCount / Math.max(1, cloCount)) * 100);
        score = Math.round(weightScore * 0.45 + presenceScore * 0.35 + asmtScore * 0.2);
        score = Math.max(15, Math.min(100, score));
      } else if (mloCount > 0) {
        score = Math.round(Math.min(30, mloCount * 10));
      } else {
        score = 0;
      }

      const isHigherOrder = ['Analyze', 'Evaluate', 'Create'].includes(lvl);
      const rec =
        score === 0
          ? `No outcomes currently target L${idx + 1} (${lvl}). Consider adding an explicit learning outcome if relevant to course scope.`
          : score < benchmarks[lvl] * 0.6
          ? `Alignment is lower than international benchmark (${benchmarks[lvl]}%). Elevate assessment rigor to reinforce ${lvl}.`
          : `Strong, well-calibrated alignment matching international accreditation requirements.`;

      return {
        key: lvl,
        label: `${lvl} (L${idx + 1})`,
        shortLabel: lvl,
        orderIndex: idx,
        actualScore: score,
        targetScore: benchmarks[lvl],
        unitLabel: '% Coverage',
        matchedCLOs: matched,
        matchedAssessmentsCount: asmtCount,
        description: BLOOM_TAXONOMY_DATA[lvl]?.actionSummary || `${lvl} cognitive domain operations.`,
        recommendation: rec,
        levelBadge: isHigherOrder ? 'Higher-Order (HOTS)' : 'Lower-Order (LOTS)',
        color: colors[lvl],
      };
    });
  }, [course]);

  // Compute 3 Primary Learning Domains Radar Data (Cognitive, Psychomotor, Affective)
  const learningDomainAxes: RadarAxisData[] = useMemo(() => {
    const domains: { key: LearningDomain; label: string; target: number; color: string; desc: string }[] = [
      {
        key: 'Cognitive',
        label: 'Cognitive (Head)',
        target: 75,
        color: '#4f46e5',
        desc: 'Intellectual knowledge, conceptual understanding, reasoning, and critical problem solving.',
      },
      {
        key: 'Psychomotor',
        label: 'Psychomotor (Hands)',
        target: 50,
        color: '#059669',
        desc: 'Practical technical competencies, laboratory skills, tool usage, coding, and physical design.',
      },
      {
        key: 'Affective',
        label: 'Affective (Heart)',
        target: 40,
        color: '#d97706',
        desc: 'Professional ethics, engineering leadership, environmental responsibility, and collaborative values.',
      },
    ];

    const totalCLOs = course.clos.length || 1;

    return domains.map((d, idx) => {
      const matched = course.clos.filter((c) => (c.learningDomain || 'Cognitive') === d.key);
      const cloCount = matched.length;
      const weightSum = matched.reduce((sum, c) => sum + (c.weightage || 0), 0);

      // Lab hours boost psychomotor domain
      const labBonus = d.key === 'Psychomotor' && (course.labHours || 0) > 0 ? 25 : 0;
      // Affective bonus if ethical/teamwork PLOs mapped
      const affectiveBonus =
        d.key === 'Affective' &&
        course.clos.some((c) =>
          c.mappedPLOs?.some((p) => p.ploId.toLowerCase().includes('ethic') || p.ploId.toLowerCase().includes('team'))
        )
          ? 20
          : 0;

      let score = 0;
      if (cloCount > 0 || labBonus > 0 || affectiveBonus > 0) {
        const cloRatio = (cloCount / totalCLOs) * 100;
        score = Math.round(cloRatio * 0.6 + weightSum * 0.4 + labBonus + affectiveBonus);
        score = Math.min(100, Math.max(10, score));
      }

      const rec =
        score === 0
          ? `No explicit outcomes defined in the ${d.key} domain. Consider incorporating practical or ethical competencies.`
          : score >= d.target
          ? `Meets the holistic tripartite OBE standard for balanced curriculum delivery.`
          : `Moderate presence. Expand assessment or lab exercises to strengthen the ${d.key} domain.`;

      return {
        key: d.key,
        label: d.label,
        shortLabel: d.key,
        orderIndex: idx,
        actualScore: score,
        targetScore: d.target,
        unitLabel: '% Domain Coverage',
        matchedCLOs: matched,
        matchedAssessmentsCount: course.assessments.filter((a) =>
          a.targetCLOIds?.some((id) => matched.some((c) => c.id === id))
        ).length,
        description: d.desc,
        recommendation: rec,
        levelBadge: 'Tripartite Learning Domain',
        color: d.color,
      };
    });
  }, [course]);

  // Compute 7 OBE Accreditation Quality Dimensions Radar Data
  const accreditationAxes: RadarAxisData[] = useMemo(() => {
    const dimensions = [
      { key: 'CLO Quality', label: 'CLO Quality & Verbs', target: 85, color: '#4f46e5', desc: 'Measurable Bloom action verbs with rigorous thresholds.' },
      { key: 'PLO Mapping', label: 'PLO Articulation', target: 80, color: '#7c3aed', desc: 'Direct alignment to accredited graduate attributes.' },
      { key: 'Modular Alignment', label: 'MLO Granularity', target: 75, color: '#0284c7', desc: 'Pedagogical subdivision into weekly learning modules.' },
      { key: 'Assessment Plan', label: 'Assessment Weighting', target: 90, color: '#0d9488', desc: 'Balanced formative & summative calibration totaling 100%.' },
      { key: 'Rubric Criteria', label: 'Rubrics & Standards', target: 70, color: '#ea580c', desc: 'Qualitative scoring rubrics linked to CLO mastery.' },
      { key: 'Direct Evidence', label: 'Evidence Collection', target: 70, color: '#059669', desc: 'Audit-ready portfolio sampling rules for accreditation visit.' },
    ];

    return dimensions.map((dim, idx) => {
      let score = 75; // baseline
      if (dim.key === 'CLO Quality') {
        const validCount = course.clos.filter((c) => c.status === 'Validated' || (c.qualityScore || 0) >= 80).length;
        score = Math.round((validCount / Math.max(1, course.clos.length)) * 100);
      } else if (dim.key === 'PLO Mapping') {
        const mappedCount = course.clos.filter((c) => c.mappedPLOs && c.mappedPLOs.length > 0).length;
        score = Math.round((mappedCount / Math.max(1, course.clos.length)) * 100);
      } else if (dim.key === 'Modular Alignment') {
        const totalMLOs = course.modules.reduce((sum, m) => sum + (m.mlos?.length || 0), 0);
        score = Math.min(100, Math.round(totalMLOs * 12));
      } else if (dim.key === 'Assessment Plan') {
        const totalW = course.assessments.reduce((sum, a) => sum + (a.weightage || 0), 0);
        score = totalW === 100 ? 100 : Math.max(30, 100 - Math.abs(100 - totalW) * 3);
      } else if (dim.key === 'Rubric Criteria') {
        score = Math.min(100, course.rubrics.length * 25);
      } else if (dim.key === 'Direct Evidence') {
        score = Math.min(100, course.evidenceRules.length * 30);
      }

      return {
        key: dim.key,
        label: dim.label,
        shortLabel: dim.key,
        orderIndex: idx,
        actualScore: Math.min(100, Math.max(15, score)),
        targetScore: dim.target,
        unitLabel: '% Compliance',
        matchedCLOs: course.clos,
        matchedAssessmentsCount: course.assessments.length,
        description: dim.desc,
        recommendation: score >= dim.target ? 'Fully compliant with accreditation criteria.' : 'Action required to close alignment gaps.',
        levelBadge: 'Quality Audit Dimension',
        color: dim.color,
      };
    });
  }, [course]);

  // Current active dataset
  const activeAxesData: RadarAxisData[] = useMemo(() => {
    switch (mode) {
      case 'learning-domains':
        return learningDomainAxes;
      case 'accreditation-dimensions':
        return accreditationAxes;
      case 'bloom-cognitive':
      default:
        return bloomCognitiveAxes;
    }
  }, [mode, bloomCognitiveAxes, learningDomainAxes, accreditationAxes]);

  // Statistics
  const overallCoverage = useMemo(() => {
    if (activeAxesData.length === 0) return 0;
    const sum = activeAxesData.reduce((acc, a) => acc + a.actualScore, 0);
    return Math.round(sum / activeAxesData.length);
  }, [activeAxesData]);

  const targetBenchmarkAvg = useMemo(() => {
    if (activeAxesData.length === 0) return 0;
    const sum = activeAxesData.reduce((acc, a) => acc + a.targetScore, 0);
    return Math.round(sum / activeAxesData.length);
  }, [activeAxesData]);

  // D3 Rendering Logic
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = isCompact ? 340 : 420;
    const height = isCompact ? 340 : 420;
    const margin = isCompact ? 40 : 55;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    const numAxes = activeAxesData.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Radius scale
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Concentric grid circles / polygons
    const levels = [20, 40, 60, 80, 100];

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Radar fill gradient
    const gradient = defs
      .append('radialGradient')
      .attr('id', 'radar-fill-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4f46e5')
      .attr('stop-opacity', 0.55);

    gradient
      .append('stop')
      .attr('offset', '80%')
      .attr('stop-color', '#6366f1')
      .attr('stop-opacity', 0.25);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#818cf8')
      .attr('stop-opacity', 0.08);

    // Glow filter
    const filter = defs.append('filter').attr('id', 'radar-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Concentric grid rings
    levels.forEach((lvl) => {
      const r = rScale(lvl);

      // Polygon points
      const points = activeAxesData.map((_, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });

      g.append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', lvl % 40 === 0 ? 'rgba(241, 245, 249, 0.45)' : 'none')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-dasharray', lvl === 100 ? 'none' : '3,3')
        .attr('stroke-width', lvl === 100 ? 1.2 : 0.7);

      // Percentage level label along 12 o'clock axis
      g.append('text')
        .attr('x', 4)
        .attr('y', -r - 2)
        .attr('font-size', '8px')
        .attr('font-weight', '600')
        .attr('fill', '#94a3b8')
        .text(`${lvl}%`);
    });

    // Spoke Axis Lines & Text Labels
    activeAxesData.forEach((axis, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      // Line
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 0.8)
        .attr('stroke-opacity', 0.7);

      // Label coordinate with offset
      const labelOffset = isCompact ? 16 : 22;
      const labelX = (radius + labelOffset) * Math.cos(angle);
      const labelY = (radius + labelOffset) * Math.sin(angle);

      // Text Anchor based on angle
      let textAnchor = 'middle';
      if (Math.cos(angle) > 0.3) textAnchor = 'start';
      else if (Math.cos(angle) < -0.3) textAnchor = 'end';

      const labelGroup = g
        .append('g')
        .attr('class', 'cursor-pointer select-none')
        .on('mouseenter', (event) => {
          setHoveredAxis(axis);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredAxis(null);
          setTooltipPos(null);
        });

      // Colored bullet indicator
      labelGroup
        .append('circle')
        .attr('cx', labelX - (textAnchor === 'start' ? 8 : textAnchor === 'end' ? -8 : 0))
        .attr('cy', labelY - 3)
        .attr('r', 3)
        .attr('fill', axis.color);

      // Main Axis Title
      labelGroup
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', textAnchor)
        .attr('font-size', isCompact ? '9px' : '10px')
        .attr('font-weight', '700')
        .attr('fill', '#1e293b')
        .text(isCompact ? axis.shortLabel : axis.label);

      // Value subtext
      labelGroup
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY + 11)
        .attr('text-anchor', textAnchor)
        .attr('font-size', '8.5px')
        .attr('font-weight', '600')
        .attr('fill', axis.actualScore > 0 ? axis.color : '#94a3b8')
        .text(`${axis.actualScore}%`);
    });

    // 1. Draw Benchmark Target Polygon (if toggled on)
    if (showBenchmark) {
      const benchmarkPoints = activeAxesData.map((d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const r = rScale(d.targetScore);
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });

      g.append('polygon')
        .attr('points', benchmarkPoints.map((p) => p.join(',')).join(' '))
        .attr('fill', 'rgba(148, 163, 184, 0.12)')
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1.4)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0.85);

      // Benchmark dots
      benchmarkPoints.forEach(([x, y]) => {
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 2.5)
          .attr('fill', '#64748b')
          .attr('opacity', 0.6);
      });
    }

    // 2. Draw Course Actual Coverage Polygon
    const actualPoints = activeAxesData.map((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const r = rScale(d.actualScore);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    });

    // Area polygon
    g.append('polygon')
      .attr('points', actualPoints.map((p) => p.join(',')).join(' '))
      .attr('fill', 'url(#radar-fill-gradient)')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2.2)
      .attr('filter', 'url(#radar-glow)')
      .attr('class', 'transition-all duration-300');

    // 3. Interactive Vertex Circles
    activeAxesData.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const r = rScale(d.actualScore);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      // Outer interactive hover circle
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8)
        .attr('fill', 'transparent')
        .attr('class', 'cursor-pointer')
        .on('mouseenter', (event) => {
          setHoveredAxis(d);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredAxis(null);
          setTooltipPos(null);
        });

      // Visible vertex node
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4.5)
        .attr('fill', '#ffffff')
        .attr('stroke', d.color)
        .attr('stroke-width', 2.2)
        .attr('class', 'pointer-events-none');
    });
  }, [activeAxesData, showBenchmark, isCompact]);

  // Higher-order thinking distribution
  const hotsCount = course.clos.filter((c) =>
    ['Analyze', 'Evaluate', 'Create'].includes(c.bloomLevel)
  ).length;
  const hotsPercent = course.clos.length > 0 ? Math.round((hotsCount / course.clos.length) * 100) : 0;

  // Handle Export SVG / Image
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(course.code || 'Course').replace(/[^a-zA-Z0-9]/g, '_')}_Bloom_Domain_Radar.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      id="d3-bloom-domain-radar-container"
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative ${className}`}
    >
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Compass className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>D3.js Bloom's Taxonomy &amp; Domain Alignment Radar</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  360° Visual Audit
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Multi-axial radial visualization analyzing cognitive depth, learning domains, and accreditation benchmark congruence.
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              id="radar-mode-bloom-btn"
              onClick={() => setMode('bloom-cognitive')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-xs ${
                mode === 'bloom-cognitive'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cognitive (L1–L6)
            </button>
            <button
              type="button"
              id="radar-mode-domain-btn"
              onClick={() => setMode('learning-domains')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-xs ${
                mode === 'learning-domains'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tripartite Domains
            </button>
            <button
              type="button"
              id="radar-mode-accreditation-btn"
              onClick={() => setMode('accreditation-dimensions')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-xs ${
                mode === 'accreditation-dimensions'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Quality
            </button>
          </div>

          {/* Benchmark Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              showBenchmark
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
            title="Toggle international accreditation benchmark target curve"
          >
            <span
              className={`w-2 h-2 rounded-full ${showBenchmark ? 'bg-slate-700' : 'bg-slate-300'}`}
            />
            <span>Target Benchmark</span>
          </button>

          {/* Export SVG */}
          <button
            type="button"
            onClick={handleExportSVG}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Export radar chart as vector SVG image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visual Body: Radar Chart + Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
        {/* Radar SVG Container */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <svg
            ref={svgRef}
            viewBox={isCompact ? '0 0 340 340' : '0 0 420 420'}
            className="w-full max-w-[420px] h-auto overflow-visible select-none drop-shadow-xs"
          />

          {/* Legend Strip */}
          <div className="flex items-center space-x-4 pt-2 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 bg-indigo-600 rounded-sm" />
              <span className="font-bold text-slate-900">Course Actual Alignment</span>
            </div>
            {showBenchmark && (
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-1.5 border-b border-dashed border-slate-600" />
                <span>ABET / WA Benchmark</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Key Metrics & Domain Breakdown Cards */}
        <div className="lg:col-span-6 space-y-4">
          {/* Quick Metrics Header */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-center">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Average Alignment
              </span>
              <span className="text-xl font-black text-indigo-950 font-mono mt-0.5 block">
                {overallCoverage}%
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">
                Across {activeAxesData.length} Axes
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Benchmark
              </span>
              <span className="text-xl font-black text-slate-800 font-mono mt-0.5 block">
                {targetBenchmarkAvg}%
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Accredited Norm
              </span>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-center">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                HOTS (L4–L6) Ratio
              </span>
              <span className="text-xl font-black text-purple-950 font-mono mt-0.5 block">
                {hotsPercent}%
              </span>
              <span className="text-[10px] text-purple-600 font-semibold">
                {hotsPercent >= 50 ? 'Strong HOTS' : 'Need L4–L6'}
              </span>
            </div>
          </div>

          {/* Interactive Inspection or Axis Breakdown List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="font-bold text-slate-800">
                {mode === 'bloom-cognitive'
                  ? "Bloom's Cognitive Domain Balance"
                  : mode === 'learning-domains'
                  ? 'Tripartite Learning Domains Coverage'
                  : 'Quality Audit Dimension Compliance'}
              </span>
              <span className="text-[11px] text-slate-500">
                Hover axis node for details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {activeAxesData.map((axis) => {
                const isHovered = hoveredAxis?.key === axis.key;
                const delta = axis.actualScore - axis.targetScore;

                return (
                  <div
                    key={axis.key}
                    onMouseEnter={() => setHoveredAxis(axis)}
                    onMouseLeave={() => setHoveredAxis(null)}
                    className={`p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                      isHovered
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: axis.color }}
                        />
                        <span className="font-bold text-slate-900 truncate">
                          {axis.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 font-mono font-bold text-xs shrink-0">
                        <span style={{ color: axis.color }}>{axis.actualScore}%</span>
                        <span className="text-slate-400 font-normal">/ {axis.targetScore}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, axis.actualScore)}%`,
                          backgroundColor: axis.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{axis.matchedCLOs.length} CLO(s) mapped</span>
                      <span
                        className={`font-semibold ${
                          delta >= 0 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {delta >= 0 ? `+${delta}% vs target` : `${delta}% vs target`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Callout if Bloom's HOTS is below 50% or Gaps exist */}
          {hotsPercent < 50 && mode === 'bloom-cognitive' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Accreditation Advisory: Cognitive Deficit</span>
                <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
                  Only {hotsPercent}% of outcomes are categorized under Higher-Order Thinking (Analyze, Evaluate, Create).
                  International accreditation frameworks (ABET / Washington Accord) require $\ge 50\%$ higher-order cognitive engagement.
                </span>
                {onJumpToStep && (
                  <button
                    type="button"
                    onClick={() => onJumpToStep(3)}
                    className="mt-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Elevate Bloom Levels in Step 3 (CLO Creator)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Interactive Hover Tooltip */}
      {hoveredAxis && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none p-3.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 max-w-xs animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${Math.min(tooltipPos.x + 15, (containerRef.current?.offsetWidth || 500) - 260)}px`,
            top: `${Math.max(10, tooltipPos.y - 70)}px`,
          }}
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredAxis.color }} />
              <span className="font-bold text-white text-xs">{hoveredAxis.label}</span>
            </div>
            {hoveredAxis.levelBadge && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-slate-200">
                {hoveredAxis.levelBadge}
              </span>
            )}
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Course Actual:</span>
              <span className="font-bold text-white font-mono">{hoveredAxis.actualScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Benchmark:</span>
              <span className="font-bold text-slate-300 font-mono">{hoveredAxis.targetScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mapped Outcomes:</span>
              <span className="font-bold text-indigo-300">{hoveredAxis.matchedCLOs.length} CLO(s)</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-300 mt-2 pt-1.5 border-t border-slate-800 leading-snug">
            {hoveredAxis.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};
