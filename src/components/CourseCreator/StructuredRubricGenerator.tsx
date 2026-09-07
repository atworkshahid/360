import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Table,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Brain,
  Sliders,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Target,
  FileText,
  ArrowRight,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Course, CLO, Assessment, Rubric, RubricCriterion, RubricLevel, RubricLevelName, BloomLevel } from '../../types';
import {
  BLOOM_RUBRIC_TEMPLATES,
  getBloomCriteriaSuggestions,
  generateRubricForCLO,
  generateRubricsForEachCLO,
  balanceCriteriaWeights,
} from '../../utils/rubricGenerator';
import { generateRubricCriteria } from '../../services/api';

export interface StructuredRubricGeneratorProps {
  course: Course;
  onChange: (updatedCourse: Course) => void;
  activeRubricId?: string;
  onSelectRubricId?: (id: string) => void;
  initialCLOId?: string;
  onAskCopilot?: (prompt: string) => void;
  className?: string;
}

export type ScalePreset = '5-level' | '4-level' | '3-level';

export interface PerformanceScaleConfig {
  id: ScalePreset;
  name: string;
  description: string;
  levels: Array<{
    level: RubricLevelName;
    pointsRange: string;
    bgClass: string;
    textClass: string;
    badgeClass: string;
    borderClass: string;
  }>;
}

export const PERFORMANCE_SCALES: Record<ScalePreset, PerformanceScaleConfig> = {
  '5-level': {
    id: '5-level',
    name: '5-Tier Standard (OBE Default)',
    description: 'Accredited international standard with 5 granular performance bands',
    levels: [
      {
        level: 'Exemplary',
        pointsRange: '85-100%',
        bgClass: 'bg-emerald-50/60',
        textClass: 'text-emerald-900',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        borderClass: 'border-emerald-200',
      },
      {
        level: 'Proficient',
        pointsRange: '75-84%',
        bgClass: 'bg-blue-50/60',
        textClass: 'text-blue-900',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        borderClass: 'border-blue-200',
      },
      {
        level: 'Achieved',
        pointsRange: '65-74%',
        bgClass: 'bg-indigo-50/60',
        textClass: 'text-indigo-900',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        borderClass: 'border-indigo-200',
      },
      {
        level: 'Developing',
        pointsRange: '50-64%',
        bgClass: 'bg-amber-50/60',
        textClass: 'text-amber-900',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        borderClass: 'border-amber-200',
      },
      {
        level: 'Not Achieved',
        pointsRange: '0-49%',
        bgClass: 'bg-rose-50/60',
        textClass: 'text-rose-900',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        borderClass: 'border-rose-200',
      },
    ],
  },
  '4-level': {
    id: '4-level',
    name: '4-Tier Academic Standard',
    description: 'Traditional 4-level scale (Exemplary, Proficient, Developing, Not Achieved)',
    levels: [
      {
        level: 'Exemplary',
        pointsRange: '85-100%',
        bgClass: 'bg-emerald-50/60',
        textClass: 'text-emerald-900',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        borderClass: 'border-emerald-200',
      },
      {
        level: 'Proficient',
        pointsRange: '70-84%',
        bgClass: 'bg-blue-50/60',
        textClass: 'text-blue-900',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        borderClass: 'border-blue-200',
      },
      {
        level: 'Developing',
        pointsRange: '55-69%',
        bgClass: 'bg-amber-50/60',
        textClass: 'text-amber-900',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        borderClass: 'border-amber-200',
      },
      {
        level: 'Not Achieved',
        pointsRange: '0-54%',
        bgClass: 'bg-rose-50/60',
        textClass: 'text-rose-900',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        borderClass: 'border-rose-200',
      },
    ],
  },
  '3-level': {
    id: '3-level',
    name: '3-Tier Mastery Scale',
    description: 'Streamlined 3-level scale for practical assessments & checkpoints',
    levels: [
      {
        level: 'Exemplary',
        pointsRange: '80-100%',
        bgClass: 'bg-emerald-50/60',
        textClass: 'text-emerald-900',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        borderClass: 'border-emerald-200',
      },
      {
        level: 'Achieved',
        pointsRange: '60-79%',
        bgClass: 'bg-indigo-50/60',
        textClass: 'text-indigo-900',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        borderClass: 'border-indigo-200',
      },
      {
        level: 'Not Achieved',
        pointsRange: '0-59%',
        bgClass: 'bg-rose-50/60',
        textClass: 'text-rose-900',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        borderClass: 'border-rose-200',
      },
    ],
  },
};

const BLOOM_COLORS: Record<BloomLevel, { badge: string; border: string; bg: string; text: string }> = {
  Remember: { badge: 'bg-slate-100 text-slate-800 border-slate-300', border: 'border-slate-300', bg: 'bg-slate-50', text: 'text-slate-700' },
  Understand: { badge: 'bg-sky-100 text-sky-800 border-sky-300', border: 'border-sky-300', bg: 'bg-sky-50', text: 'text-sky-700' },
  Apply: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Analyze: { badge: 'bg-amber-100 text-amber-800 border-amber-300', border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  Evaluate: { badge: 'bg-rose-100 text-rose-800 border-rose-300', border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-700' },
  Create: { badge: 'bg-purple-100 text-purple-800 border-purple-300', border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700' },
};

export const StructuredRubricGenerator: React.FC<StructuredRubricGeneratorProps> = ({
  course,
  onChange,
  activeRubricId,
  onSelectRubricId,
  initialCLOId,
  onAskCopilot,
  className = '',
}) => {
  // CLO Selection State
  const [selectedCLOId, setSelectedCLOId] = useState<string>(() => {
    if (initialCLOId && course.clos.some((c) => c.id === initialCLOId)) {
      return initialCLOId;
    }
    return course.clos[0]?.id || '';
  });

  const selectedCLO = useMemo(() => {
    return course.clos.find((c) => c.id === selectedCLOId) || course.clos[0];
  }, [course.clos, selectedCLOId]);

  // Assessment Selection State
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(() => {
    if (selectedCLO) {
      const linked = course.assessments.find((a) => a.linkedCLOIds?.includes(selectedCLO.id));
      if (linked) return linked.id;
    }
    return course.assessments[0]?.id || '';
  });

  const selectedAssessment = useMemo(() => {
    return course.assessments.find((a) => a.id === selectedAssessmentId) || course.assessments[0];
  }, [course.assessments, selectedAssessmentId]);

  // Performance Level Scale Preset State
  const [scalePreset, setScalePreset] = useState<ScalePreset>('5-level');
  const activeScale = PERFORMANCE_SCALES[scalePreset];

  // View Mode: Matrix (2D table) vs Cards
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Rubric Title & Context
  const [rubricTitle, setRubricTitle] = useState<string>(() => {
    if (selectedCLO) {
      return `${selectedCLO.code} (${selectedCLO.bloomLevel || 'Analyze'}) Assessment Rubric${selectedAssessment ? ` - ${selectedAssessment.name}` : ''}`;
    }
    return 'Structured Assessment Rubric';
  });

  // Working Criteria Matrix
  const [criteria, setCriteria] = useState<RubricCriterion[]>(() => {
    if (selectedCLO) {
      return getBloomCriteriaSuggestions(selectedCLO.bloomLevel || 'Analyze', selectedCLO.statement, selectedAssessment?.name);
    }
    return getBloomCriteriaSuggestions('Analyze');
  });

  // UI States
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  // Sync title & default criteria when CLO changes
  const handleCLOSelect = (cloId: string) => {
    setSelectedCLOId(cloId);
    const target = course.clos.find((c) => c.id === cloId);
    if (target) {
      const bloom = target.bloomLevel || 'Analyze';
      const linkedAsmt = course.assessments.find((a) => a.linkedCLOIds?.includes(target.id)) || course.assessments[0];
      if (linkedAsmt) {
        setSelectedAssessmentId(linkedAsmt.id);
      }
      setRubricTitle(`${target.code} (${bloom}) Assessment Rubric${linkedAsmt ? ` - ${linkedAsmt.name}` : ''}`);
      const freshCriteria = getBloomCriteriaSuggestions(bloom, target.statement, linkedAsmt?.name);
      
      // Adapt to current scale if non-5-level
      const adapted = adaptCriteriaToScale(freshCriteria, scalePreset, target.id);
      setCriteria(adapted);
      
      showNotice('info', `Loaded Bloom's criteria templates calibrated for ${target.code} (${bloom})`);
    }
  };

  // Helper to adapt criteria to performance scale levels
  function adaptCriteriaToScale(baseCriteria: RubricCriterion[], scale: ScalePreset, cloId: string): RubricCriterion[] {
    const targetLevels = PERFORMANCE_SCALES[scale].levels;
    return baseCriteria.map((c) => {
      // Map or construct levels matching target scale
      const mappedLevels: RubricLevel[] = targetLevels.map((tl) => {
        const existing = c.levels.find((l) => l.level === tl.level);
        if (existing) {
          return { ...existing, pointsRange: tl.pointsRange };
        }
        return {
          level: tl.level,
          pointsRange: tl.pointsRange,
          descriptor: `Performance at the ${tl.level} standard demonstrating demonstrable mastery for ${c.criterionName}.`,
        };
      });

      return {
        ...c,
        cloId,
        levels: mappedLevels,
      };
    });
  }

  // Handle Scale Preset Change
  const handleScalePresetChange = (newScale: ScalePreset) => {
    setScalePreset(newScale);
    setCriteria((prev) => adaptCriteriaToScale(prev, newScale, selectedCLO?.id || ''));
    showNotice('info', `Adjusted matrix grid to ${PERFORMANCE_SCALES[newScale].name}`);
  };

  // Show temporary banner notice
  const showNotice = (type: 'success' | 'info', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  // Total weight computation
  const totalWeight = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  }, [criteria]);

  // Weight Auto-Balancer
  const handleAutoBalanceWeights = () => {
    const balanced = balanceCriteriaWeights(criteria);
    setCriteria(balanced);
    showNotice('success', 'Automatically balanced all criteria weights to sum to exactly 100%');
  };

  // Update a single criterion
  const handleUpdateCriterion = (critId: string, updates: Partial<RubricCriterion>) => {
    setCriteria((prev) => prev.map((c) => (c.id === critId ? { ...c, ...updates } : c)));
  };

  // Update descriptor cell in matrix
  const handleUpdateDescriptor = (critId: string, levelName: RubricLevelName, newDescriptor: string) => {
    setCriteria((prev) =>
      prev.map((crit) => {
        if (crit.id !== critId) return crit;
        const newLevels = crit.levels.map((lvl) =>
          lvl.level === levelName ? { ...lvl, descriptor: newDescriptor } : lvl
        );
        return { ...crit, levels: newLevels };
      })
    );
  };

  // Delete a criterion
  const handleDeleteCriterion = (critId: string) => {
    if (criteria.length <= 1) {
      showNotice('info', 'A rubric must contain at least 1 criterion');
      return;
    }
    setCriteria((prev) => prev.filter((c) => c.id !== critId));
  };

  // Duplicate a criterion
  const handleDuplicateCriterion = (critId: string) => {
    const target = criteria.find((c) => c.id === critId);
    if (!target) return;
    const duplicated: RubricCriterion = {
      ...target,
      id: `crit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      criterionName: `${target.criterionName} (Copy)`,
      weight: Math.max(5, Math.floor(target.weight / 2)),
    };
    setCriteria((prev) => [...prev, duplicated]);
    showNotice('info', `Duplicated criterion: ${target.criterionName}`);
  };

  // Add new blank criterion
  const handleAddCriterion = () => {
    const targetLevels = activeScale.levels;
    const newCrit: RubricCriterion = {
      id: `crit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      criterionName: 'New Evaluation Criterion',
      cloId: selectedCLO?.id || '',
      weight: Math.max(5, Math.floor(100 / (criteria.length + 1))),
      levels: targetLevels.map((tl) => ({
        level: tl.level,
        pointsRange: tl.pointsRange,
        descriptor: `Provide specific, demonstrable descriptors for ${tl.level} achievement.`,
      })),
    };
    setCriteria((prev) => [...prev, newCrit]);
    showNotice('info', 'Added a new criterion row to the matrix');
  };

  // Archetype Presets Generator
  const handleApplyArchetypePreset = (archetype: 'case_study' | 'capstone' | 'research' | 'presentation' | 'practical') => {
    if (!selectedCLO) return;
    const targetLevels = activeScale.levels;

    let archetypeCriteria: Array<{ name: string; weight: number; exemplary: string; proficient: string; developing: string; notAchieved: string }> = [];

    if (archetype === 'case_study') {
      archetypeCriteria = [
        {
          name: 'Doctrinal Accuracy & Statutory Interpretation',
          weight: 35,
          exemplary: 'Masterful interpretation of governing statutes, case precedents, and jurisdictional doctrines with zero errors.',
          proficient: 'Accurately identifies and applies primary statutory provisions with clear citations.',
          developing: 'Identifies general concepts but exhibits frequent confusion between relevant statutory sections.',
          notAchieved: 'Fundamental conceptual lapses; unable to locate or apply governing legal frameworks.',
        },
        {
          name: 'Fact Pattern Issue Identification & Analysis',
          weight: 35,
          exemplary: 'Exhaustive spot-identification of core and latent legal issues; airtight deductive reasoning applying facts to rules.',
          proficient: 'Identifies all major factual issues and systematically links undisputed facts to applicable legal standards.',
          developing: 'Identifies superficial issues only; relies on unsupported generalizations without fact-law synthesis.',
          notAchieved: 'Overlooks critical factual disputes; answers are descriptive summaries devoid of analysis.',
        },
        {
          name: 'Evaluation of Counterarguments & Remedies',
          weight: 30,
          exemplary: 'Nuanced rebuttal of opposing positions; crafts defensible, pragmatically viable appellate remedies.',
          proficient: 'Evaluates standard counterarguments and proposes appropriate, substantiated legal relief.',
          developing: 'Acknowledges opposing views superficially; proposed remedies lack procedural feasibility.',
          notAchieved: 'Ignores counterarguments entirely; proposes legally flawed or impossible remedies.',
        },
      ];
    } else if (archetype === 'capstone') {
      archetypeCriteria = [
        {
          name: 'System Architecture & Engineering Specification',
          weight: 30,
          exemplary: 'Modular, robust, scalable architecture adhering to international design patterns and fault-tolerant standards.',
          proficient: 'Clean system architecture with well-defined components, clear interfaces, and documented specifications.',
          developing: 'Monolithic or fragmented design with incomplete module boundary definitions.',
          notAchieved: 'No coherent architectural plan; ad-hoc code/system lacking formal specifications.',
        },
        {
          name: 'Technical Implementation & Functional Execution',
          weight: 40,
          exemplary: 'Exemplary code quality, optimized algorithmic complexity, zero critical defects, and passing all automated test suites.',
          proficient: 'Core functional requirements fully met; code is organized, readable, and functional under standard inputs.',
          developing: 'Partial functionality; significant bugs on edge cases and inconsistent error-handling.',
          notAchieved: 'Fails to execute core operations; pervasive fatal bugs or incomplete deliverables.',
        },
        {
          name: 'Empirical Validation & Technical Documentation',
          weight: 30,
          exemplary: 'Comprehensive empirical benchmarks, stress-testing logs, user manuals, and publication-caliber documentation.',
          proficient: 'Structured test cases verifying all specifications; clear installation guide and user manual.',
          developing: 'Superficial testing with anecdotal verification; incomplete technical manual.',
          notAchieved: 'No empirical verification or testing logs; missing or unintelligible documentation.',
        },
      ];
    } else if (archetype === 'research') {
      archetypeCriteria = [
        {
          name: 'Scholarly Thesis & Research Scope Formulation',
          weight: 25,
          exemplary: 'Original, highly focused, intellectually compelling thesis situated within current scholarly discourse.',
          proficient: 'Clear, well-defined thesis statement with distinct research scope and demonstrable significance.',
          developing: 'Vague or overly broad topic; research scope lacks clear boundaries.',
          notAchieved: 'Lacks a discernable thesis; disorganized collection of disparate topics.',
        },
        {
          name: 'Literature Synthesis & Critical Interrogation',
          weight: 35,
          exemplary: 'Exhaustive synthesis of peer-reviewed sources; masterfully interrogates competing theoretical paradigms.',
          proficient: 'Thorough review of relevant academic literature; critically compares key scholarly findings.',
          developing: 'Descriptive summary of sources without thematic synthesis or comparative critique.',
          notAchieved: 'Heavily reliant on non-academic or outdated sources; no theoretical grounding.',
        },
        {
          name: 'Methodological Rigor & Citation Discipline',
          weight: 40,
          exemplary: 'Flawless research methodology; airtight evidentiary conclusions with impeccable academic citations.',
          proficient: 'Sound methodology appropriate to the research question; proper formatting and consistent citations.',
          developing: 'Methodological gaps in data gathering; inconsistent citation styling with occasional errors.',
          notAchieved: 'Flawed methodology invalidating conclusions; pervasive citation omissions or plagiarism risks.',
        },
      ];
    } else if (archetype === 'presentation') {
      archetypeCriteria = [
        {
          name: 'Rhetorical Structure & Conceptual Mastery',
          weight: 35,
          exemplary: 'Compelling narrative arc; commands complex subject matter effortlessly with authoritative eloquence.',
          proficient: 'Logical, organized progression of ideas; demonstrates sound mastery of technical concepts.',
          developing: 'Disjointed presentation flow; relies excessively on scripted reading or memorized text.',
          notAchieved: 'Disorganized and incoherent; unable to articulate fundamental course concepts.',
        },
        {
          name: 'Defense of Counterarguments & Audience Engagement',
          weight: 35,
          exemplary: 'Handles rigorous cross-examination with poise; provides nuanced, substantiated answers to edge cases.',
          proficient: 'Answers questions accurately; articulates justifications clearly and professionally.',
          developing: 'Hesitant in Q&A session; gives defensive or evasive answers to probing inquiries.',
          notAchieved: 'Unable to respond to audience questions; becomes agitated or provides incorrect facts.',
        },
        {
          name: 'Visual Communication & Slide Discipline',
          weight: 30,
          exemplary: 'Minimalist, publication-grade visual design; data visualizations elucidate complex arguments seamlessly.',
          proficient: 'Clean, legible slide layouts supporting oral delivery effectively with proper attribution.',
          developing: 'Text-heavy slides with distracting visual elements or low-contrast charts.',
          notAchieved: 'Unreadable or missing slides; formatting errors and unreferenced media throughout.',
        },
      ];
    } else {
      // Practical
      archetypeCriteria = [
        {
          name: 'Standard Operating Protocol & Laboratory Safety',
          weight: 30,
          exemplary: 'Meticulous adherence to safety protocols, sterile techniques, and calibration procedures with zero infractions.',
          proficient: 'Strict compliance with standard operating procedures and laboratory safety regulations.',
          developing: 'Minor safety lapses that require intervention; irregular tool or equipment handling.',
          notAchieved: 'Egregious safety violations; endangers laboratory personnel or equipment.',
        },
        {
          name: 'Precision of Measurement & Procedural Execution',
          weight: 40,
          exemplary: 'Masterful manual dexterity; measurements demonstrate exceptional repeatability and near-zero tolerance error.',
          proficient: 'Executes procedures systematically; measurements fall well within acceptable engineering tolerances.',
          developing: 'Clumsy procedural handling resulting in noticeable measurement drift or sample contamination.',
          notAchieved: 'Inability to operate equipment; fails to complete procedural steps.',
        },
        {
          name: 'Data Logging, Error Analysis & Diagnostic Troubleshooting',
          weight: 30,
          exemplary: 'Immaculate real-time laboratory notebook; sophisticated error propagation analysis and proactive troubleshooting.',
          proficient: 'Accurate data recording in standard tabular format; identifies potential sources of experimental error.',
          developing: 'Incomplete data records; superficial or speculative explanation of anomalies.',
          notAchieved: 'Falsified or missing experimental data; no attempt to diagnose experimental failures.',
        },
      ];
    }

    const newCriteria: RubricCriterion[] = archetypeCriteria.map((ac, idx) => ({
      id: `crit-arch-${Date.now()}-${idx}`,
      criterionName: ac.name,
      cloId: selectedCLO.id,
      weight: ac.weight,
      levels: targetLevels.map((tl) => {
        let desc = ac.proficient;
        if (tl.level === 'Exemplary') desc = ac.exemplary;
        else if (tl.level === 'Proficient') desc = ac.proficient;
        else if (tl.level === 'Achieved') desc = ac.proficient;
        else if (tl.level === 'Developing') desc = ac.developing;
        else desc = ac.notAchieved;

        return {
          level: tl.level,
          pointsRange: tl.pointsRange,
          descriptor: desc,
        };
      }),
    }));

    setCriteria(newCriteria);
    showNotice('success', `Generated ${archetype.replace('_', ' ').toUpperCase()} rubric matrix aligned with ${selectedCLO.code}`);
  };

  // AI Generation via Gemini API
  const handleAiGenerate = async () => {
    if (!selectedCLO) return;
    setIsAiGenerating(true);

    try {
      const generated = await generateRubricCriteria(
        selectedAssessment?.name || rubricTitle,
        selectedAssessment?.type || 'Assignment',
        [`${selectedCLO.code}: ${selectedCLO.statement}`],
        selectedCLO.bloomLevel || 'Analyze',
        selectedCLO.statement
      );

      if (generated && generated.length > 0) {
        const adapted = adaptCriteriaToScale(generated, scalePreset, selectedCLO.id);
        setCriteria(adapted);
        showNotice('success', `AI drafted ${adapted.length} criteria aligned with ${selectedCLO.code} (${selectedCLO.bloomLevel})`);
      } else {
        // Fallback to Bloom
        const fallback = getBloomCriteriaSuggestions(selectedCLO.bloomLevel || 'Analyze', selectedCLO.statement);
        setCriteria(adaptCriteriaToScale(fallback, scalePreset, selectedCLO.id));
        showNotice('info', 'Loaded calibrated Bloom taxonomy criteria');
      }
    } catch (err) {
      console.error('Error generating criteria:', err);
      showNotice('info', 'Loaded calibrated Bloom taxonomy criteria');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save as New Course Rubric
  const handleSaveAsNewRubric = () => {
    if (!selectedCLO) return;

    const newRubric: Rubric = {
      id: `rubric-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: rubricTitle.trim() || `${selectedCLO.code} Assessment Rubric`,
      assessmentId: selectedAssessmentId || '',
      criteria: criteria.map((c) => ({ ...c, cloId: selectedCLO.id })),
    };

    // Link rubric to the selected assessment if applicable
    const updatedAssessments = course.assessments.map((a) =>
      a.id === selectedAssessmentId ? { ...a, rubricId: newRubric.id } : a
    );

    onChange({
      ...course,
      rubrics: [...course.rubrics, newRubric],
      assessments: updatedAssessments,
      updatedAt: new Date().toISOString(),
    });

    if (onSelectRubricId) {
      onSelectRubricId(newRubric.id);
    }

    showNotice('success', `Saved "${newRubric.title}" as a new course rubric and linked to ${selectedCLO.code}!`);
  };

  // Apply to Currently Active Rubric
  const handleApplyToActiveRubric = () => {
    if (!activeRubricId) {
      handleSaveAsNewRubric();
      return;
    }

    const updatedRubrics = course.rubrics.map((r) =>
      r.id === activeRubricId
        ? {
            ...r,
            title: rubricTitle.trim() || r.title,
            assessmentId: selectedAssessmentId || r.assessmentId,
            criteria: criteria.map((c) => ({ ...c, cloId: c.cloId || selectedCLO?.id || '' })),
          }
        : r
    );

    onChange({
      ...course,
      rubrics: updatedRubrics,
      updatedAt: new Date().toISOString(),
    });

    showNotice('success', `Updated active rubric with the structured matrix!`);
  };

  // Batch Generation: Create custom rubrics for each CLO
  const handleBatchGenerateAllCLOs = () => {
    const result = generateRubricsForEachCLO(course, {
      replaceExisting: false,
      assignAssessments: true,
    });

    onChange({
      ...course,
      rubrics: result.updatedRubrics,
      assessments: result.updatedAssessments || course.assessments,
      updatedAt: new Date().toISOString(),
    });

    showNotice('success', `Generated ${result.generatedCount} structured rubrics for all course CLOs!`);
  };

  // Copy Matrix as Markdown Table
  const handleCopyMarkdown = () => {
    let md = `## ${rubricTitle}\n\n`;
    if (selectedCLO) {
      md += `**Target Outcome:** ${selectedCLO.code}: ${selectedCLO.statement}  \n`;
      md += `**Bloom's Taxonomy Level:** ${selectedCLO.bloomLevel || 'Analyze'} | **Domain:** ${selectedCLO.domain || 'Cognitive'}  \n`;
      if (selectedAssessment) {
        md += `**Target Assessment:** ${selectedAssessment.name} (${selectedAssessment.type}, ${selectedAssessment.weightage}% weight)  \n\n`;
      }
    }

    // Header row
    md += `| Criterion | Weight | ` + activeScale.levels.map((l) => `${l.level} (${l.pointsRange})`).join(' | ') + ' |\n';
    md += `| :--- | :---: | ` + activeScale.levels.map(() => ':---').join(' | ') + ' |\n';

    // Rows
    criteria.forEach((crit) => {
      const levelCells = activeScale.levels.map((l) => {
        const match = crit.levels.find((lvl) => lvl.level === l.level);
        return match ? match.descriptor.replace(/\|/g, '\\|') : '-';
      });
      md += `| **${crit.criterionName}** | **${crit.weight}%** | ` + levelCells.join(' | ') + ' |\n';
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    showNotice('success', 'Copied full structured rubric matrix as a Markdown table to clipboard');
  };

  return (
    <div id="structured-rubric-generator-subcomponent" className={`space-y-6 ${className}`}>
      {/* Top Banner Notice */}
      {actionNotice && (
        <div
          className={`px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm transition ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Primary Generator Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Structured Rubric Generator</span>
              <span>•</span>
              <span>Criteria vs. Performance Levels</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-serif">
              CLO-Aligned Assessment Rubric Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Construct multi-tier qualitative evaluation rubrics mapped directly to Course Learning Outcomes, cognitive Bloom levels, and target evidence artifacts.
            </p>
          </div>

          {/* Quick Preset Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="rubric-generator-ai-btn"
              onClick={handleAiGenerate}
              disabled={isAiGenerating || !selectedCLO}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
              title="Generate tailored criteria and performance level descriptors using Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiGenerating ? 'Drafting Descriptors...' : 'AI Generate for CLO'}</span>
            </button>

            <button
              type="button"
              id="rubric-generator-batch-btn"
              onClick={handleBatchGenerateAllCLOs}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold transition cursor-pointer"
              title="Generate structured rubrics for every CLO in the course in one operation"
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Batch All CLOs</span>
            </button>

            <button
              type="button"
              id="rubric-generator-copy-md-btn"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Copy formatted 2D table as Markdown for syllabi or LMS (Canvas, Moodle, Blackboard)"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotification ? 'Copied Table!' : 'Copy Table'}</span>
            </button>

            <button
              type="button"
              id="rubric-generator-preview-btn"
              onClick={() => setPreviewModalOpen(!previewModalOpen)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Toggle full screen / printable matrix view"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{previewModalOpen ? 'Hide Full View' : 'Full Matrix View'}</span>
            </button>
          </div>
        </div>

        {/* CLO Alignment Selector Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Course Learning Outcome (CLO)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Select an outcome to align the criteria & performance levels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {course.clos.map((clo) => {
              const isSelected = clo.id === selectedCLOId;
              const bloomColor = BLOOM_COLORS[clo.bloomLevel || 'Analyze'] || BLOOM_COLORS.Analyze;
              const hasRubric = course.rubrics.some((r) => r.criteria.some((c) => c.cloId === clo.id));

              return (
                <button
                  key={clo.id}
                  type="button"
                  id={`clo-selector-pill-${clo.id}`}
                  onClick={() => handleCLOSelect(clo.id)}
                  className={`p-3 rounded-xl text-left border transition flex flex-col justify-between space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{clo.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${bloomColor.badge}`}>
                      {clo.bloomLevel || 'Analyze'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {clo.statement}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                    <span className="text-slate-400 font-medium">{clo.domain || 'Cognitive'}</span>
                    {hasRubric && (
                      <span className="text-emerald-700 font-semibold flex items-center space-x-0.5">
                        <Check className="w-2.5 h-2.5" />
                        <span>Rubric Linked</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected CLO Deep Insight Banner */}
        {selectedCLO && (
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{selectedCLO.code} Outcome Definition:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    BLOOM_COLORS[selectedCLO.bloomLevel || 'Analyze'].badge
                  }`}
                >
                  Bloom's {selectedCLO.bloomLevel || 'Analyze'} Level
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-medium">Domain: {selectedCLO.domain || 'Cognitive'}</span>
              </div>

              {onAskCopilot && (
                <button
                  type="button"
                  onClick={() =>
                    onAskCopilot(
                      `Review the qualitative criteria for ${selectedCLO.code} (${selectedCLO.statement}) and recommend objective performance indicators.`
                    )
                  }
                  className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <Brain className="w-3 h-3" />
                  <span>Ask Copilot for Rubric Standards</span>
                </button>
              )}
            </div>

            <p className="text-slate-700 font-serif italic bg-white p-2.5 rounded-lg border border-slate-200">
              "{selectedCLO.statement}"
            </p>
          </div>
        )}

        {/* Configuration Row: Assessment Linkage, Rubric Title & Performance Scale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Associated Assessment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Associated Assessment Component
            </label>
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {course.assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type} • {a.weightage}%)
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Links this rubric directly to student grades in assessment
            </span>
          </div>

          {/* Rubric Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rubric Title / Document Label
            </label>
            <input
              type="text"
              value={rubricTitle}
              onChange={(e) => setRubricTitle(e.target.value)}
              placeholder="e.g. CLO-1 Analytical Rubric"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Title printed on student rubrics and export dossiers
            </span>
          </div>

          {/* Performance Level Scale Preset */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Performance Level Scale</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {activeScale.levels.length} Performance Bands
              </span>
            </label>
            <select
              value={scalePreset}
              onChange={(e) => handleScalePresetChange(e.target.value as ScalePreset)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.values(PERFORMANCE_SCALES).map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {activeScale.description}
            </span>
          </div>
        </div>

        {/* Pedagogical Archetype Presets Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700">Calibrated Presets:</span>
            <span>Instantly seed criteria for specific assessment formats:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyArchetypePreset('case_study')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Case Study
            </button>
            <button
              type="button"
              onClick={() => handleApplyArchetypePreset('capstone')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Capstone / Project
            </button>
            <button
              type="button"
              onClick={() => handleApplyArchetypePreset('research')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Research Paper
            </button>
            <button
              type="button"
              onClick={() => handleApplyArchetypePreset('presentation')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Oral Defense
            </button>
            <button
              type="button"
              onClick={() => handleApplyArchetypePreset('practical')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Lab / Practical
            </button>
          </div>
        </div>
      </div>

      {/* MATRIX CONTROLS & WEIGHT BALANCER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Matrix Rows ({criteria.length} Criteria)
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 font-medium">Sum of Weights:</span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  totalWeight === 100
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {totalWeight}% {totalWeight === 100 ? '✓ Balanced' : '(Target: 100%)'}
              </span>
            </div>
          </div>

          {totalWeight !== 100 && (
            <button
              type="button"
              id="rubric-generator-balance-weights-btn"
              onClick={handleAutoBalanceWeights}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              title="Automatically normalize all weights so they sum to 100%"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Auto-Balance to 100%</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle: Matrix vs Cards */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition cursor-pointer ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matrix Grid (2D)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Stacked Cards</span>
            </button>
          </div>

          <button
            type="button"
            id="rubric-generator-add-crit-btn"
            onClick={handleAddCriterion}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Criterion</span>
          </button>
        </div>
      </div>

      {/* 2D STRUCTURED MATRIX VIEW (CRITERIA VS. PERFORMANCE LEVELS) */}
      {viewMode === 'matrix' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              {/* Matrix Table Header: Performance Levels */}
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-3.5 text-xs font-bold w-[240px] shrink-0">
                    <div className="flex items-center justify-between">
                      <span>Criteria & Weight (%)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Y-Axis</span>
                    </div>
                  </th>
                  {activeScale.levels.map((lvl) => (
                    <th key={lvl.level} className="p-3 text-xs font-bold border-l border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase tracking-wider text-[11px] text-white">
                          {lvl.level}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                          {lvl.pointsRange}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Matrix Table Body: Criteria Rows */}
              <tbody className="divide-y divide-slate-200">
                {criteria.map((crit, cIdx) => {
                  const mappedCLO = course.clos.find((c) => c.id === crit.cloId) || selectedCLO;

                  return (
                    <tr key={crit.id} className="hover:bg-slate-50/50 transition">
                      {/* Left Header Cell: Criterion Info & Weight */}
                      <td className="p-3.5 align-top bg-slate-50/40 border-r border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                          <span>#{cIdx + 1}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateCriterion(crit.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition cursor-pointer"
                              title="Duplicate this criterion"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCriterion(crit.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                              title="Delete this criterion"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Criterion Name */}
                        <input
                          type="text"
                          value={crit.criterionName}
                          onChange={(e) => handleUpdateCriterion(crit.id, { criterionName: e.target.value })}
                          placeholder="Criterion Name"
                          className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />

                        {/* Weight & CLO Linkage */}
                        <div className="flex items-center justify-between gap-1 text-xs pt-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-[11px] text-slate-500">Weight:</span>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={crit.weight}
                              onChange={(e) => handleUpdateCriterion(crit.id, { weight: Number(e.target.value) })}
                              className="w-14 px-1.5 py-1 text-xs text-center font-bold rounded border border-slate-300 bg-white"
                            />
                            <span className="text-[11px] text-slate-500">%</span>
                          </div>

                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0"
                            title={`Linked Outcome: ${mappedCLO?.code}`}
                          >
                            {mappedCLO?.code || 'CLO'}
                          </span>
                        </div>
                      </td>

                      {/* Performance Level Descriptors Cells */}
                      {activeScale.levels.map((scaleLevel) => {
                        const levelData = crit.levels.find((l) => l.level === scaleLevel.level) || {
                          level: scaleLevel.level,
                          pointsRange: scaleLevel.pointsRange,
                          descriptor: '',
                        };

                        return (
                          <td key={scaleLevel.level} className="p-2.5 align-top border-l border-slate-200">
                            <div className="space-y-1 h-full flex flex-col justify-between">
                              <textarea
                                rows={4}
                                value={levelData.descriptor}
                                onChange={(e) => handleUpdateDescriptor(crit.id, scaleLevel.level, e.target.value)}
                                placeholder={`Specify observable evidence for ${scaleLevel.level} (${scaleLevel.pointsRange})...`}
                                className={`w-full p-2 text-[11px] leading-relaxed rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white resize-y font-normal text-slate-700 ${scaleLevel.bgClass}`}
                              />
                              <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                                <span>{scaleLevel.pointsRange}</span>
                                <span>{levelData.descriptor.length} chars</span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STACKED DETAILED CARDS VIEW */
        <div className="space-y-4">
          {criteria.map((crit, cIdx) => {
            const mappedCLO = course.clos.find((c) => c.id === crit.cloId) || selectedCLO;
            const isExpanded = expandedCriteria[crit.id] !== false; // default expanded

            return (
              <div
                key={crit.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex-1 flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      #{cIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={crit.criterionName}
                      onChange={(e) => handleUpdateCriterion(crit.id, { criterionName: e.target.value })}
                      placeholder="Criterion Name"
                      className="text-sm font-bold text-slate-900 border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 flex-1 max-w-md bg-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-slate-500">Weight:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={crit.weight}
                        onChange={(e) => handleUpdateCriterion(crit.id, { weight: Number(e.target.value) })}
                        className="w-16 px-2 py-1 text-xs text-center font-bold rounded-lg border border-slate-300 bg-white"
                      />
                      <span className="text-slate-500">%</span>
                    </div>

                    <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {mappedCLO?.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDuplicateCriterion(crit.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCriterion(crit.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedCriteria((prev) => ({ ...prev, [crit.id]: !isExpanded }))}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Level Descriptors Stack */}
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                    {activeScale.levels.map((scaleLevel) => {
                      const levelData = crit.levels.find((l) => l.level === scaleLevel.level) || {
                        level: scaleLevel.level,
                        pointsRange: scaleLevel.pointsRange,
                        descriptor: '',
                      };

                      return (
                        <div
                          key={scaleLevel.level}
                          className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${scaleLevel.borderClass} ${scaleLevel.bgClass}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${scaleLevel.badgeClass}`}>
                              {scaleLevel.level}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {scaleLevel.pointsRange}
                            </span>
                          </div>

                          <textarea
                            rows={4}
                            value={levelData.descriptor}
                            onChange={(e) => handleUpdateDescriptor(crit.id, scaleLevel.level, e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed text-slate-700"
                            placeholder={`Observable descriptors for ${scaleLevel.level}...`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM ACTIONS BAR (APPLY & INTEGRATION) */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg shadow-slate-900/10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold">Ready to Bind Rubric to OBE Course Model</span>
          </div>
          <p className="text-xs text-slate-300">
            Applying this rubric updates accreditation alignment matrices, constructive audits, and syllabus export packages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="rubric-generator-apply-active-btn"
            onClick={handleApplyToActiveRubric}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
            title="Save changes to the currently active rubric in Step 11"
          >
            <Check className="w-4 h-4" />
            <span>Update Active Rubric</span>
          </button>

          <button
            type="button"
            id="rubric-generator-save-new-btn"
            onClick={handleSaveAsNewRubric}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            title="Save as an entirely new rubric in course"
          >
            <Plus className="w-4 h-4" />
            <span>Save as New Course Rubric</span>
          </button>
        </div>
      </div>

      {/* FULL-SCREEN / PRINTABLE PREVIEW MODAL */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-sm">Printable Assessment Rubric Matrix</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1 rounded text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xl font-bold text-slate-900 font-serif">{rubricTitle}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Course:</span> {course.code} - {course.title}
                  <span>•</span>
                  <span className="font-semibold text-slate-900">Outcome:</span> {selectedCLO?.code} ({selectedCLO?.bloomLevel})
                  <span>•</span>
                  <span className="font-semibold text-slate-900">Total Weight:</span> {totalWeight}%
                </div>
              </div>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2.5 font-bold w-1/4">Criterion</th>
                    {activeScale.levels.map((lvl) => (
                      <th key={lvl.level} className="border border-slate-300 p-2 font-bold text-center">
                        <div>{lvl.level}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{lvl.pointsRange}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((crit) => (
                    <tr key={crit.id} className="border-t border-slate-200">
                      <td className="border border-slate-300 p-2.5 align-top bg-slate-50/50">
                        <div className="font-bold text-slate-900">{crit.criterionName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Weight: {crit.weight}%</div>
                      </td>
                      {activeScale.levels.map((lvl) => {
                        const cell = crit.levels.find((l) => l.level === lvl.level);
                        return (
                          <td key={lvl.level} className="border border-slate-300 p-2.5 align-top text-slate-700 leading-relaxed">
                            {cell?.descriptor || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
