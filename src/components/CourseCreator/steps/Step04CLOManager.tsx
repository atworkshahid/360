import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  BookOpen,
  Scale,
  Target,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Course, CLO, BloomLevel, LearningDomain } from '../../../types';
import { evaluateStage } from '../../../utils/stageProgress';
import { ObeConceptTooltip } from '../ObeTipsGuide';
import { OutcomeAssessmentDependencyAlert } from '../OutcomeAssessmentDependencyAlert';
import { getFrameworkGuideline } from '../../../data/frameworkGuidelines';
import {
  CourseService,
  FrameworkDeviationWarning,
  FrameworkContentValidationReport,
} from '../../../services/courseService';
import { FrameworkFieldWarning } from '../FrameworkFieldWarning';
import { CLOBulkEditorModal } from '../CLOBulkEditorModal';
import { InlineSectionFeedback } from '../comments/InlineSectionFeedback';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot?: (prompt: string) => void;
  onOpenComments?: (
    targetId: string,
    targetType: 'CLO' | 'Assessment' | 'Rubric' | 'Module' | 'General',
    targetTitle: string
  ) => void;
  onOpenFrameworkGuidance?: (stageKey?: string) => void;
  frameworkValidationReport?: FrameworkContentValidationReport;
  onApplyFrameworkFix?: (warning: FrameworkDeviationWarning) => void;
}

const BLOOM_LEVELS: {
  level: BloomLevel;
  color: string;
  badgeBg: string;
  badgeText: string;
  sampleVerbs: string[];
}[] = [
  {
    level: 'Remember',
    color: '#64748b',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    sampleVerbs: ['Define', 'Recall', 'Identify', 'List', 'State', 'Name'],
  },
  {
    level: 'Understand',
    color: '#0ea5e9',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    sampleVerbs: ['Explain', 'Summarize', 'Paraphrase', 'Classify', 'Interpret', 'Illustrate'],
  },
  {
    level: 'Apply',
    color: '#10b981',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    sampleVerbs: ['Apply', 'Implement', 'Calculate', 'Execute', 'Solve', 'Demonstrate'],
  },
  {
    level: 'Analyze',
    color: '#f59e0b',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    sampleVerbs: ['Analyze', 'Deconstruct', 'Differentiate', 'Compare', 'Distinguish', 'Investigate'],
  },
  {
    level: 'Evaluate',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    sampleVerbs: ['Evaluate', 'Appraise', 'Critique', 'Justify', 'Judge', 'Validate'],
  },
  {
    level: 'Create',
    color: '#ec4899',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    sampleVerbs: ['Design', 'Synthesize', 'Architect', 'Construct', 'Formulate', 'Develop'],
  },
];

const WEAK_VERBS = [
  'understand',
  'understands',
  'know',
  'knows',
  'learn',
  'learns',
  'appreciate',
  'appreciates',
  'familiarize',
  'comprehend',
  'be aware of',
  'study',
];

const LEARNING_DOMAINS: { domain: LearningDomain; label: string; badge: string }[] = [
  { domain: 'Cognitive', label: 'Cognitive (Knowledge & Thinking)', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { domain: 'Psychomotor', label: 'Psychomotor (Hands-on & Lab Skills)', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { domain: 'Affective', label: 'Affective (Values, Ethics & Teamwork)', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export const Step04CLOManager: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
  onOpenFrameworkGuidance,
  frameworkValidationReport,
  onApplyFrameworkFix,
}) => {
  const clos = course.clos || [];
  const guideline = getFrameworkGuideline(course.frameworkId);
  const [bulkEditorOpen, setBulkEditorOpen] = useState(false);

  // Live Framework Content Validation Report
  const validationReport = React.useMemo(() => {
    return frameworkValidationReport || CourseService.validateCourseContentAgainstFramework(course);
  }, [course, frameworkValidationReport]);

  // Live Accreditation Evaluation for Stage 04
  const stageEval = evaluateStage(course, 4, 'obe10');

  // Total weightage
  const totalWeightage = clos.reduce((sum, c) => sum + (c.weightage || 0), 0);
  const isWeightageBalanced = clos.length === 0 || totalWeightage === 100;

  const handleUpdateCLO = (id: string, updates: Partial<CLO>) => {
    const updated = clos.map((c) => {
      if (c.id !== id) return c;
      const combined = { ...c, ...updates };

      // Re-evaluate quality on verb or statement change
      const statement = (combined.statement || '').toLowerCase();
      const verb = (combined.bloomVerb || '').toLowerCase();
      const hasWeakVerb = WEAK_VERBS.some(
        (w) => verb === w || statement.startsWith(w) || statement.includes(` ${w} `)
      );

      let qualityScore = 90;
      if (hasWeakVerb) qualityScore -= 35;
      if (statement.length < 30) qualityScore -= 20;
      if (!combined.bloomLevel) qualityScore -= 20;
      qualityScore = Math.max(25, Math.min(100, qualityScore));

      combined.qualityScore = qualityScore;
      combined.status = hasWeakVerb ? 'Flagged' : 'Validated';

      return combined;
    });

    onChange({ ...course, clos: updated });
  };

  const handleAddCLO = () => {
    const nextIndex = clos.length + 1;
    const initialWeight = clos.length === 0 ? 100 : Math.max(5, Math.floor(100 / (clos.length + 1)));
    const newCLO: CLO = {
      id: `clo-${Date.now()}-${nextIndex}`,
      code: `CLO ${nextIndex}`,
      statement: '',
      bloomVerb: 'Explain',
      bloomLevel: 'Understand',
      learningDomain: 'Cognitive',
      competency: 'Core Competency',
      achievementThreshold: 65,
      weightage: initialWeight,
      status: 'Draft',
      qualityScore: 70,
      skills: 'Cognitive analysis and comprehension',
      assessmentMethod: 'Direct Examination / Practical Assignment',
      qualityChecks: [],
      mappedPLOs: [],
    };
    onChange({ ...course, clos: [...clos, newCLO] });
  };

  const handleRemoveCLO = (id: string) => {
    const remaining = clos.filter((c) => c.id !== id);
    const recoded = remaining.map((c, i) => ({
      ...c,
      code: `CLO ${i + 1}`,
    }));
    onChange({ ...course, clos: recoded });
  };

  const handleBalanceWeightages = () => {
    if (clos.length === 0) return;
    const equalShare = Math.floor(100 / clos.length);
    const remainder = 100 - equalShare * clos.length;

    const balanced = clos.map((c, idx) => ({
      ...c,
      weightage: equalShare + (idx === 0 ? remainder : 0),
    }));

    onChange({ ...course, clos: balanced });
  };

  const handleApplyExemplarCLOs = (domain: 'engineering' | 'computing' | 'datascience' | 'business') => {
    let preset: CLO[] = [];
    const timestamp = Date.now();

    if (domain === 'engineering') {
      preset = [
        {
          id: `clo-${timestamp}-1`,
          code: 'CLO 1',
          statement: 'Formulate mathematical and physical models to solve complex engineering problems under operational constraints.',
          bloomVerb: 'Formulate',
          bloomLevel: 'Create',
          learningDomain: 'Cognitive',
          competency: 'Engineering Problem Analysis',
          skills: 'Mathematical formulation and numerical simulation',
          assessmentMethod: 'Midterm Examination & Analytical Problem Sets',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 95,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-2`,
          code: 'CLO 2',
          statement: 'Analyze technological components and thermal/mechanical subsystems adhering to international engineering codes.',
          bloomVerb: 'Analyze',
          bloomLevel: 'Analyze',
          learningDomain: 'Cognitive',
          competency: 'System Analysis & Design',
          skills: 'Decomposition of multi-variable engineering systems',
          assessmentMethod: 'Design Assignment & Case Study',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 95,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-3`,
          code: 'CLO 3',
          statement: 'Conduct controlled experimental investigations and instrumented laboratory protocols to validate performance hypotheses.',
          bloomVerb: 'Conduct',
          bloomLevel: 'Apply',
          learningDomain: 'Psychomotor',
          competency: 'Investigation & Instrumentation',
          skills: 'Sensor calibration, data acquisition, and uncertainty analysis',
          assessmentMethod: 'Laboratory Practicum & Formal Technical Report',
          achievementThreshold: 70,
          weightage: 25,
          status: 'Validated',
          qualityScore: 92,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-4`,
          code: 'CLO 4',
          statement: 'Critique safety, sustainability, and ethical trade-offs of proposed engineering solutions within societal contexts.',
          bloomVerb: 'Critique',
          bloomLevel: 'Evaluate',
          learningDomain: 'Affective',
          competency: 'Professional Ethics & Societal Impact',
          skills: 'Life-cycle sustainability appraisal and risk evaluation',
          assessmentMethod: 'Capstone Design Presentation & Peer Review',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 90,
          qualityChecks: [],
          mappedPLOs: [],
        },
      ];
    } else if (domain === 'computing') {
      preset = [
        {
          id: `clo-${timestamp}-1`,
          code: 'CLO 1',
          statement: 'Analyze time-space asymptotic complexity and trade-offs of fundamental algorithmic structures.',
          bloomVerb: 'Analyze',
          bloomLevel: 'Analyze',
          learningDomain: 'Cognitive',
          competency: 'Algorithmic Complexity & Optimization',
          skills: 'Big-O notation proofs and benchmarking',
          assessmentMethod: 'Written Examination & Algorithmic Proofs',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 95,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-2`,
          code: 'CLO 2',
          statement: 'Design modular, maintainable software architectures leveraging object-oriented and structural design patterns.',
          bloomVerb: 'Design',
          bloomLevel: 'Create',
          learningDomain: 'Cognitive',
          competency: 'Software Architectural Synthesis',
          skills: 'UML diagrams, design pattern implementation, clean code',
          assessmentMethod: 'Architecture Review & Code Review Project',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 96,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-3`,
          code: 'CLO 3',
          statement: 'Implement high-assurance software systems featuring comprehensive unit test suites and defensive security practices.',
          bloomVerb: 'Implement',
          bloomLevel: 'Apply',
          learningDomain: 'Psychomotor',
          competency: 'Modern Tool Usage & Secure Coding',
          skills: 'Automated testing (CI/CD), vulnerability profiling, Git workflow',
          assessmentMethod: 'Programming Assignments & Automated Test Coverage',
          achievementThreshold: 70,
          weightage: 25,
          status: 'Validated',
          qualityScore: 94,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-4`,
          code: 'CLO 4',
          statement: 'Demonstrate disciplined peer collaboration and communicative rigor in cross-functional agile development sprints.',
          bloomVerb: 'Demonstrate',
          bloomLevel: 'Apply',
          learningDomain: 'Affective',
          competency: 'Teamwork & Communication',
          skills: 'Scrum facilitation, pull request reviews, technical documentation',
          assessmentMethod: 'Sprint Retrospective & Project Milestone Deliverable',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 90,
          qualityChecks: [],
          mappedPLOs: [],
        },
      ];
    } else if (domain === 'datascience') {
      preset = [
        {
          id: `clo-${timestamp}-1`,
          code: 'CLO 1',
          statement: 'Deconstruct complex multi-dimensional datasets through exploratory data analysis and inferential statistics.',
          bloomVerb: 'Deconstruct',
          bloomLevel: 'Analyze',
          learningDomain: 'Cognitive',
          competency: 'Statistical Inference & EDA',
          skills: 'Hypothesis testing, outlier detection, visual storytelling',
          assessmentMethod: 'EDA Portfolio & Statistical Problem Sets',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 94,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-2`,
          code: 'CLO 2',
          statement: 'Construct supervised and unsupervised machine learning pipelines optimized for predictive generalization.',
          bloomVerb: 'Construct',
          bloomLevel: 'Create',
          learningDomain: 'Cognitive',
          competency: 'Predictive Modeling & ML',
          skills: 'Cross-validation, hyperparameter tuning, loss function optimization',
          assessmentMethod: 'Kaggle-style Model Benchmark & Code Submission',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 95,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-3`,
          code: 'CLO 3',
          statement: 'Execute scalable data processing workflows using distributed cloud computing frameworks.',
          bloomVerb: 'Execute',
          bloomLevel: 'Apply',
          learningDomain: 'Psychomotor',
          competency: 'Big Data Engineering',
          skills: 'SQL/NoSQL querying, Apache Spark/Dask, containerized pipelines',
          assessmentMethod: 'Cloud Lab Practicum & Pipeline Benchmark',
          achievementThreshold: 70,
          weightage: 25,
          status: 'Validated',
          qualityScore: 92,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-4`,
          code: 'CLO 4',
          statement: 'Appraise algorithmic fairness, data privacy standards, and ethical implications of predictive AI deployments.',
          bloomVerb: 'Appraise',
          bloomLevel: 'Evaluate',
          learningDomain: 'Affective',
          competency: 'Data Ethics & Governance',
          skills: 'Bias mitigation auditing, GDPR/governance compliance',
          assessmentMethod: 'Ethics Audit Case Study & Executive Briefing',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 92,
          qualityChecks: [],
          mappedPLOs: [],
        },
      ];
    } else {
      preset = [
        {
          id: `clo-${timestamp}-1`,
          code: 'CLO 1',
          statement: 'Evaluate strategic frameworks, macroeconomic indicators, and competitive market dynamics to inform organizational decisions.',
          bloomVerb: 'Evaluate',
          bloomLevel: 'Evaluate',
          learningDomain: 'Cognitive',
          competency: 'Strategic Analysis',
          skills: 'SWOT/PESTEL synthesis, industry structure appraisal',
          assessmentMethod: 'Case Study Examination',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 94,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-2`,
          code: 'CLO 2',
          statement: 'Synthesize quantitative financial metrics and capital budgeting models to forecast commercial viability.',
          bloomVerb: 'Synthesize',
          bloomLevel: 'Create',
          learningDomain: 'Cognitive',
          competency: 'Financial Decision Modeling',
          skills: 'DCF valuation, NPV/IRR calculations, sensitivity analysis',
          assessmentMethod: 'Financial Modeling Project',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 95,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-3`,
          code: 'CLO 3',
          statement: 'Formulate an actionable corporate growth strategy integrating operational feasibility and digital transformation.',
          bloomVerb: 'Formulate',
          bloomLevel: 'Create',
          learningDomain: 'Cognitive',
          competency: 'Business Innovation & Execution',
          skills: 'Business model canvas, operational roadmap design',
          assessmentMethod: 'Business Plan Milestone',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 94,
          qualityChecks: [],
          mappedPLOs: [],
        },
        {
          id: `clo-${timestamp}-4`,
          code: 'CLO 4',
          statement: 'Demonstrate professional persuasion and stakeholder consensus-building in executive boardroom presentations.',
          bloomVerb: 'Demonstrate',
          bloomLevel: 'Apply',
          learningDomain: 'Affective',
          competency: 'Executive Communication & Leadership',
          skills: 'Stakeholder negotiation, slide deck narrative, defense of recommendations',
          assessmentMethod: 'Executive Pitch Presentation & Q&A',
          achievementThreshold: 70,
          weightage: 25,
          status: 'Validated',
          qualityScore: 91,
          qualityChecks: [],
          mappedPLOs: [],
        },
      ];
    }

    onChange({ ...course, clos: preset });
  };

  const handleSuggestCLOsWithAI = () => {
    if (!onAskCopilot) return;
    onAskCopilot(
      `Generate 4 high-quality, measurable Course Learning Outcomes (CLOs) for "${course.title}" (${course.code}). Ensure each outcome starts with an active Bloom taxonomy verb (Explain, Apply, Analyze, Design), avoids vague verbs like understand/know, covers Cognitive and Psychomotor domains, and spans from foundational concepts to capstone synthesis.`
    );
  };

  return (
    <div className="space-y-6 max-w-4xl" id="step-04-clo-manager-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 04 of 10</span>
            <span>•</span>
            <span>Outcome Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Course Learning Outcomes (CLOs)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Formulate 3 to 6 measurable, student-centered outcomes using Bloom's Revised Cognitive Taxonomy and domain-specific benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="step04-framework-guidelines-btn"
            onClick={() => {
              if (onOpenFrameworkGuidance) {
                onOpenFrameworkGuidance('step_clos');
              } else {
                window.dispatchEvent(
                  new CustomEvent('open_framework_guidance', { detail: { stageKey: 'step_clos' } })
                );
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            title={`View ${guideline.frameworkCode} Guidelines, Alignment Rules & Exemplars`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{guideline.frameworkCode} Guidelines</span>
          </button>

          {onAskCopilot && (
            <button
              type="button"
              id="step04-ai-generate-btn"
              onClick={handleSuggestCLOsWithAI}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Generate CLOs</span>
            </button>
          )}

          <button
            type="button"
            id="step04-bulk-editor-btn"
            onClick={() => setBulkEditorOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Bulk reorder, duplicate, delete, and batch edit CLOs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bulk Editor</span>
          </button>

          <button
            type="button"
            id="step04-add-clo-btn"
            onClick={handleAddCLO}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add CLO</span>
          </button>
        </div>
      </div>

      {/* Contextual Framework Guidance Callout */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-blue-50/80 border border-indigo-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start sm:items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {guideline.frameworkCode} Learning Outcome Criteria
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold">
                Committed Standard
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              {guideline.stages['step_clos']?.whatIsRequired[0] ||
                `Formulate 3-5 measurable CLOs starting with active Bloom's taxonomy verbs.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              if (onOpenFrameworkGuidance) {
                onOpenFrameworkGuidance('step_clos');
              } else {
                window.dispatchEvent(
                  new CustomEvent('open_framework_guidance', { detail: { stageKey: 'step_clos' } })
                );
              }
            }}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3 h-3" />
            <span>View Compliant Exemplars</span>
          </button>
        </div>
      </div>

      {/* Live Accreditation Readiness Card */}
      <div
        id="step04-accreditation-card"
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
          stageEval.isCompleted
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start space-x-2.5">
          {stageEval.isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          )}
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>{stageEval.isCompleted ? 'Outcomes (CLOs) Validated & Compliant' : 'CLO Compliance Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                OBE 10 • Outcome Audit
              </span>
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {stageEval.isCompleted
                ? stageEval.summary
                : `Action required: ${stageEval.missingRequirements.join(', ')}`}
            </div>
          </div>
        </div>
      </div>

      {/* Exemplar Quick Load Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-slate-600 shrink-0" />
          <span className="font-semibold text-slate-800">Quick-Load Accreditation CLO Suites:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            id="exemplar-engineering-btn"
            onClick={() => handleApplyExemplarCLOs('engineering')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            ABET Engineering (4 CLOs)
          </button>
          <button
            type="button"
            id="exemplar-computing-btn"
            onClick={() => handleApplyExemplarCLOs('computing')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            Computing / CS (4 CLOs)
          </button>
          <button
            type="button"
            id="exemplar-datascience-btn"
            onClick={() => handleApplyExemplarCLOs('datascience')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            Data Science & AI (4 CLOs)
          </button>
          <button
            type="button"
            id="exemplar-business-btn"
            onClick={() => handleApplyExemplarCLOs('business')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            AACSB Business (4 CLOs)
          </button>
        </div>
      </div>

      {/* Outcome & Assessment Dependency Integrity Alert */}
      <OutcomeAssessmentDependencyAlert
        course={course}
        onChange={onChange}
        mode="banner"
      />

      {/* Stats & Weightage Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Outcome Count Indicator */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="font-bold text-slate-800">
                Total Outcomes: {clos.length}
              </div>
              <div
                className={`text-[11px] ${
                  clos.length >= 3 && clos.length <= 6
                    ? 'text-emerald-600 font-semibold'
                    : 'text-amber-600 font-semibold'
                }`}
              >
                {clos.length >= 3 && clos.length <= 6
                  ? 'Optimal volume (3-6 recommended for OBE)'
                  : clos.length < 3
                  ? 'Minimum 3 CLOs recommended by accreditation bodies'
                  : 'More than 6 outcomes may cause assessment overhead'}
              </div>
            </div>
          </div>
        </div>

        {/* Weightage Balancer Indicator */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span>Total Weightage: {totalWeightage}%</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isWeightageBalanced
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isWeightageBalanced ? 'Balanced' : 'Mismatch'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Must sum to 100% across all evaluated outcomes
              </div>
            </div>
          </div>
          {!isWeightageBalanced && clos.length > 0 && (
            <button
              type="button"
              id="balance-weightages-btn"
              onClick={handleBalanceWeightages}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Balance to 100%</span>
            </button>
          )}
        </div>
      </div>

      {/* Framework Level CLO Deviations (Count, Bloom Rigor, CEP) */}
      <FrameworkFieldWarning
        field="clos"
        report={validationReport}
        onApplyFix={onApplyFrameworkFix}
      />

      {/* CLO Cards */}
      <div className="space-y-4">
        {clos.map((clo, index) => {
          const statementLower = (clo.statement || '').toLowerCase();
          const verbLower = (clo.bloomVerb || '').toLowerCase();
          const isWeak = WEAK_VERBS.some(
            (w) => verbLower === w || statementLower.startsWith(w) || statementLower.includes(` ${w} `)
          );
          const bloomCfg =
            BLOOM_LEVELS.find((b) => b.level === clo.bloomLevel) || BLOOM_LEVELS[1];

          return (
            <div
              key={clo.id}
              className={`p-5 rounded-xl border-2 transition bg-white ${
                isWeak
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Row: Code, Bloom Selector, Domain, Weightage, Benchmark */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono">
                    {clo.code}
                  </span>

                  {/* Learning Domain Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center">
                      <span>Domain:</span>
                      <ObeConceptTooltip
                        term="Learning Domain"
                        explanation="Cognitive (mental knowledge/problem-solving), Psychomotor (physical/lab instrumentation skills), or Affective (values, ethics, teamwork attitudes)."
                        accreditationNote="Engineering programs predominantly focus on Cognitive & Psychomotor domains."
                      />
                    </span>
                    <select
                      value={clo.learningDomain || 'Cognitive'}
                      onChange={(e) =>
                        handleUpdateCLO(clo.id, {
                          learningDomain: e.target.value as LearningDomain,
                        })
                      }
                      className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {LEARNING_DOMAINS.map((d) => (
                        <option key={d.domain} value={d.domain}>
                          {d.domain}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bloom Cognitive Level */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center">
                      <span>Taxonomy Level:</span>
                      <ObeConceptTooltip
                        term="Bloom's Level"
                        explanation="Hierarchical taxonomy: Remember (C1) → Understand (C2) → Apply (C3) → Analyze (C4) → Evaluate (C5) → Create (C6)."
                        accreditationNote="Higher-level courses (3rd/4th year) must focus on Analyze (C4) or higher for Complex Engineering Problems."
                      />
                    </span>
                    <select
                      value={clo.bloomLevel}
                      onChange={(e) => {
                        const newLevel = e.target.value as BloomLevel;
                        const levelCfg = BLOOM_LEVELS.find((b) => b.level === newLevel);
                        handleUpdateCLO(clo.id, {
                          bloomLevel: newLevel,
                          bloomVerb: levelCfg ? levelCfg.sampleVerbs[0] : clo.bloomVerb,
                        });
                      }}
                      className={`text-xs font-bold px-2 py-1 rounded-md border ${bloomCfg.badgeBg} ${bloomCfg.badgeText} focus:outline-none`}
                    >
                      {BLOOM_LEVELS.map((b) => (
                        <option key={b.level} value={b.level}>
                          {b.level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Verb Helper */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center">
                      <span>Action Verb:</span>
                      <ObeConceptTooltip
                        term="Measurable Verb"
                        explanation="Must describe an observable performance (e.g., 'calculate', 'design', 'debug'). Avoid unmeasurable verbs like 'understand' or 'know'."
                        accreditationNote="Accreditation evaluators reject unmeasurable verbs because they cannot be directly graded."
                      />
                    </span>
                    <input
                      type="text"
                      value={clo.bloomVerb || ''}
                      onChange={(e) => handleUpdateCLO(clo.id, { bloomVerb: e.target.value })}
                      placeholder="e.g. Explain, Apply"
                      className="w-24 px-2 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenFrameworkGuidance) {
                          onOpenFrameworkGuidance('step_clos');
                        } else {
                          window.dispatchEvent(
                            new CustomEvent('open_framework_guidance', { detail: { stageKey: 'step_clos' } })
                          );
                        }
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition px-1.5 py-0.5 rounded hover:bg-indigo-50 border border-transparent hover:border-indigo-200 shrink-0"
                      title={`View ${guideline.frameworkCode} Guidelines & Approved Exemplars`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Criteria</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Weightage input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center">
                      <span>Weight:</span>
                      <ObeConceptTooltip
                        term="Outcome Weightage"
                        explanation="The percentage of overall course grade testing this outcome. All active CLOs should total 100%."
                      />
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={clo.weightage ?? 25}
                      onChange={(e) =>
                        handleUpdateCLO(clo.id, { weightage: Number(e.target.value) || 0 })
                      }
                      className="w-14 px-1.5 py-1 text-xs text-center font-bold rounded-md border border-slate-300 bg-white"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>

                  {/* Achievement Benchmark Threshold */}
                  <div className="flex items-center gap-1" title="Minimum student passing threshold for OBE attainment calculations">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center">
                      <span>Benchmark:</span>
                      <ObeConceptTooltip
                        term="Attainment Benchmark"
                        explanation="Minimum grade threshold (typically 60-70%) a student must achieve on assessments tied to this CLO to be counted as 'attained'."
                        accreditationNote="Institutional KPI for cohort-level Continuous Quality Improvement (CQI) calculations."
                      />
                    </span>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={clo.achievementThreshold ?? 65}
                      onChange={(e) =>
                        handleUpdateCLO(clo.id, {
                          achievementThreshold: Number(e.target.value) || 60,
                        })
                      }
                      className="w-14 px-1.5 py-1 text-xs text-center font-bold rounded-md border border-slate-300 bg-white"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>

                  {/* Quality Badge */}
                  <div
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      isWeak
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isWeak ? (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                    <span>
                      {isWeak
                        ? 'Vague Action Verb'
                        : `Measurable (${clo.qualityScore || 90}/100)`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCLO(clo.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                    title="Delete Outcome"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Verb Quick Chips */}
              <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto text-[11px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                  Recommended {clo.bloomLevel} Verbs:
                </span>
                {bloomCfg.sampleVerbs.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      const stmt = clo.statement ? clo.statement.replace(/^\w+/, v) : `${v} `;
                      handleUpdateCLO(clo.id, { bloomVerb: v, statement: stmt });
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-600 font-medium transition cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Statement Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Outcome Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={clo.statement}
                  onChange={(e) => handleUpdateCLO(clo.id, { statement: e.target.value })}
                  placeholder={`e.g. ${clo.bloomVerb || 'Analyze'} computational models and empirical data to...`}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
                />

                {/* OBE Framework Field Warning & Actionable Guidance */}
                <FrameworkFieldWarning
                  field={`clos[${index}].statement`}
                  report={validationReport}
                  onApplyFix={onApplyFrameworkFix || ((warning) => {
                    if (warning.suggestedAction?.type === 'replace_verb' && warning.suggestedAction.targetValue) {
                      const rep = warning.suggestedAction.targetValue;
                      const words = (clo.statement || '').trim().split(/\s+/);
                      if (words.length > 0) {
                        words[0] = rep;
                      }
                      const stmt = words.length > 0 ? words.join(' ') : `${rep} `;
                      handleUpdateCLO(clo.id, { bloomVerb: rep, statement: stmt });
                    }
                  })}
                />
              </div>

              {/* Competency & Assessment Method Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Target Competency / Capability
                  </label>
                  <input
                    type="text"
                    value={clo.competency || ''}
                    onChange={(e) => handleUpdateCLO(clo.id, { competency: e.target.value })}
                    placeholder="e.g. Complex Problem Analysis, Critical Synthesis"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Direct Assessment Instrument
                  </label>
                  <input
                    type="text"
                    value={clo.assessmentMethod || ''}
                    onChange={(e) => handleUpdateCLO(clo.id, { assessmentMethod: e.target.value })}
                    placeholder="e.g. Midterm Exam, Practical Lab Exam, Capstone Project"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Weak Verb Alert Warning */}
              {isWeak && (
                <div className="mt-2.5 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Accreditation Warning:</strong> "{clo.bloomVerb || 'understand'}" is an unobservable mental state that cannot be directly measured or audited. Replace with active performance verbs like <em>Explain, Apply, Differentiate, or Design</em>.
                    </span>
                  </div>
                  {onAskCopilot && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskCopilot(
                          `Rewrite this outcome to be measurable using Bloom's taxonomy: "${clo.statement}"`
                        )
                      }
                      className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded text-[10px] shrink-0 cursor-pointer"
                    >
                      AI Fix Verb
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course Learning Outcomes Collaborative Comments Thread */}
      <div className="pt-2">
        <InlineSectionFeedback
          course={course}
          onChangeCourse={onChange}
          sectionKey="step-3-clos"
          sectionTitle="Step 3: Course Learning Outcomes (CLOs)"
          stepNumber={3}
          targetType="CLO"
          onOpenFullReview={(targetId, targetType, targetTitle) => {
            if (onOpenComments) onOpenComments(targetId, targetType as any, targetTitle);
          }}
        />
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          id="step04-back-btn"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Purpose</span>
        </button>

        <button
          type="button"
          id="step04-next-btn"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Outcome Mapping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* CLO Bulk Editor Modal */}
      <CLOBulkEditorModal
        isOpen={bulkEditorOpen}
        onClose={() => setBulkEditorOpen(false)}
        clos={clos}
        onSave={(updatedCLOs) => {
          onChange({ ...course, clos: updatedCLOs });
        }}
        courseTitle={course.title}
      />
    </div>
  );
};
