import React, { useState, useRef, useEffect } from 'react';
import {
  Lightbulb,
  HelpCircle,
  Sparkles,
  ChevronRight,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Brain,
  Scale,
  Award,
} from 'lucide-react';

export interface ObeConceptItem {
  id: string;
  label: string;
  tag: 'Core Principle' | 'Accreditation Rule' | 'Best Practice' | 'Bloom\'s Level' | 'Evaluation';
  shortDef: string;
  details: string;
  accreditationStandard: string;
  example: string;
  commonPitfall?: string;
  actionLabel?: string;
  actionType?: 'blooms_modal' | 'alignment_modal' | 'rubric_modal';
}

export interface StepObeGuidance {
  stepNumber: number;
  stageName: string;
  conceptHeadline: string;
  conceptSummary: string;
  concepts: ObeConceptItem[];
}

export const OBE10_CONCEPTS_DATA: Record<number, StepObeGuidance> = {
  1: {
    stepNumber: 1,
    stageName: 'Accreditation Framework & Standards',
    conceptHeadline: 'Aligning Graduate Attributes with International Accords',
    conceptSummary:
      'Outcome-Based Education (OBE) requires anchoring every course to recognized program attributes (e.g., ABET Student Outcomes, Washington Accord Graduate Attributes, or National Qualifications Frameworks).',
    concepts: [
      {
        id: 'graduate-attributes',
        label: 'Graduate Attributes (PLOs)',
        tag: 'Accreditation Rule',
        shortDef: 'The overarching knowledge, skills, and values graduates must demonstrate upon completion.',
        details:
          'Program Learning Outcomes (PLOs) or Student Outcomes (SOs) define the macro-level profile of an engineer or scholar. Your course must intentionally develop a subset of these attributes.',
        accreditationStandard: 'Washington Accord WA1–WA12 & ABET Criterion 3 require explicit mapping from course activities to program outcomes.',
        example: 'WA1 (Engineering Knowledge) requires students to apply mathematics and natural sciences to complex engineering problems.',
        commonPitfall: 'Selecting too many frameworks at once. Pick the one corresponding to your institution\'s active accreditation body.',
      },
      {
        id: 'constructive-alignment',
        label: 'Constructive Alignment (Biggs)',
        tag: 'Core Principle',
        shortDef: 'Teaching methods and assessment tasks must directly operationalize the intended learning outcomes.',
        details:
          'Coined by Prof. John Biggs, constructive alignment means the learner constructs meaning through relevant learning activities, while the teacher creates a learning environment that supports those activities.',
        accreditationStandard: 'Accreditation panels verify that exam questions test the exact cognitive level promised in the syllabus.',
        example: 'If an outcome promises "Design a bridge", the exam or project must test actual structural design—not merely multiple-choice recall.',
      },
    ],
  },
  2: {
    stepNumber: 2,
    stageName: 'Course Framework & Academic Hours',
    conceptHeadline: 'Credit Calculation and Contact Hour Equilibrium',
    conceptSummary:
      'Standardizing contact hours (Lecture, Lab, Tutorial) ensures equitable student workload and complies with international credit-transfer standards.',
    concepts: [
      {
        id: 'credit-formula',
        label: 'Credit Hour Calculation',
        tag: 'Accreditation Rule',
        shortDef: '1 Credit = 1 lecture hr/week OR 2–3 lab/studio hrs/week across a 14–16 week semester.',
        details:
          'Each lecture credit typically assumes an additional 2 hours of self-directed study by the student outside class time. Over-promising hours causes student cognitive fatigue.',
        accreditationStandard: 'US Carnegie Unit & European ECTS (1 credit = 25-30 student total workload hours).',
        example: 'A 3+1 credit engineering course equals 3 hours of theory + 3 hours of laboratory work each week.',
        commonPitfall: 'Confusing total contact hours with credit hours; lab hours must be weighted proportionally (typically 0.5 or 0.33 per clock hour).',
      },
      {
        id: 'prerequisites',
        label: 'Prerequisite Scaffolding',
        tag: 'Best Practice',
        shortDef: 'Sequencing foundational knowledge prior to higher-order problem solving.',
        details:
          'Prerequisites enforce vertical integration across the multi-year curriculum. In OBE, prerequisites represent mastered prerequisite outcomes, not just course titles.',
        accreditationStandard: 'ABET Criterion 5 (Curriculum depth and progression).',
        example: 'Differential Equations serves as prerequisite to Control Systems so students can solve transfer functions.',
      },
    ],
  },
  3: {
    stepNumber: 3,
    stageName: 'Course Purpose & Rationale',
    conceptHeadline: 'Articulating Course Intent & Societal Context',
    conceptSummary:
      'The course overview explains why this discipline exists in the program and how it prepares students for real-world engineering, scientific, or humanities challenges.',
    concepts: [
      {
        id: 'course-purpose',
        label: 'Course Pedagogical Intent',
        tag: 'Core Principle',
        shortDef: 'The transformative narrative of what students will be empowered to do after completing the course.',
        details:
          'A compelling course rationale bridges theoretical principles with real-world problems. It helps students understand the relevance of difficult technical topics.',
        accreditationStandard: 'Program Educational Objectives (PEO) alignment (preparation for professional practice 3–5 years post-graduation).',
        example: 'Rather than "This course covers algorithms", explain "This course trains students to engineer scalable computational solutions under real-time constraints."',
      },
      {
        id: 'pedagogical-structure',
        label: 'Theory-to-Practice Delivery',
        tag: 'Best Practice',
        shortDef: 'Balancing didactic instruction, hands-on experimentation, and reflective assessment.',
        details:
          'Modern OBE discourages pure lectures. High-impact courses interleave 20-minute lecture blocks with active student drills or simulations.',
        accreditationStandard: 'ABET Criterion 5 requirement for engineering design experience integrated throughout the curriculum.',
        example: 'Structuring the course into modular theory units followed immediately by laboratory synthesis.',
      },
    ],
  },
  4: {
    stepNumber: 4,
    stageName: 'Course Learning Outcomes (CLOs)',
    conceptHeadline: 'Formulating Actionable, Observable Learning Outcomes',
    conceptSummary:
      'Course Learning Outcomes are the core of OBE. They declare what the learner will be able to perform, calculate, design, or evaluate by the end of the term.',
    concepts: [
      {
        id: 'blooms-taxonomy',
        label: 'Bloom\'s Revised Taxonomy',
        tag: 'Bloom\'s Level',
        shortDef: 'Six cognitive levels: Remember (C1) → Understand (C2) → Apply (C3) → Analyze (C4) → Evaluate (C5) → Create (C6).',
        details:
          'University-level courses should minimize C1/C2 outcomes (recall/comprehension) and target C3–C6 (application, modeling, optimization, and synthesis).',
        accreditationStandard: 'ABET & Washington Accord mandate solving "Complex Engineering Problems" requiring C4 (Analyze) or higher.',
        example: 'Level C4: "Analyze stability margins of feedback amplifiers using Bode plots and Nyquist criteria."',
        actionLabel: 'Open Bloom\'s Helper',
        actionType: 'blooms_modal',
      },
      {
        id: 'measurable-action-verbs',
        label: 'Banned vs. Measurable Verbs',
        tag: 'Accreditation Rule',
        shortDef: 'Avoid unobservable verbs like "understand", "know", "appreciate", or "learn".',
        details:
          'Internal mental states cannot be objectively graded or audited by an external reviewer. Always use observable performance verbs: "calculate", "model", "synthesize", "differentiate", "formulate".',
        accreditationStandard: 'Accreditation audit teams flag "Understand" as non-compliant because it lacks objective evaluation criteria.',
        example: 'Weak: "Understand TCP/IP protocols." Strong: "Configure and troubleshoot multi-subnet IP routing using OSPF protocols."',
        commonPitfall: 'Writing CLOs that sound like syllabus chapter titles rather than student performances.',
      },
      {
        id: 'clo-economy',
        label: 'Outcome Economy (4–6 CLOs)',
        tag: 'Best Practice',
        shortDef: 'Limit course outcomes to 4–6 robust, comprehensive statements.',
        details:
          'Having 10+ CLOs fragments the assessment matrix and creates severe grading overhead. A focused set of 4–6 well-crafted CLOs provides thorough coverage with clear assessment evidence.',
        accreditationStandard: 'Best practice recommended by IEEE Education Society and Washington Accord evaluators.',
        example: '4 CLOs covering: 1. Core theory/modeling, 2. Experimental design, 3. Critical evaluation, 4. Professional synthesis/reporting.',
      },
    ],
  },
  5: {
    stepNumber: 5,
    stageName: 'Outcome Mapping (CLO to PLO)',
    conceptHeadline: 'Matrix Mapping and Correlation Depth',
    conceptSummary:
      'Each Course Learning Outcome maps to one or more Program Learning Outcomes on a 1–3 correlation scale, demonstrating constructive alignment to degree objectives.',
    concepts: [
      {
        id: 'correlation-levels',
        label: '1–3 Correlation Scale',
        tag: 'Accreditation Rule',
        shortDef: '1 = Low/Introductory, 2 = Medium/Reinforcing, 3 = High/Substantial Mastery.',
        details:
          'A Level 3 mapping means the CLO provides primary evidence that the student possesses the program attribute. Level 1 indicates incidental coverage.',
        accreditationStandard: 'Accreditation bodies require justifying Level 3 mappings with explicit rubric assessment evidence.',
        example: 'A Senior Capstone project has Level 3 on Problem Analysis and Design, whereas an introductory class has Level 1.',
        commonPitfall: 'Over-mapping: Marking "Level 3" on every PLO dilutes assessment rigor. A course should specialize in 2-4 primary PLOs.',
      },
      {
        id: 'complex-engineering-problems',
        label: 'Complex Engineering Problems (CEP)',
        tag: 'Core Principle',
        shortDef: 'Problems involving wide-ranging issues, conflicting requirements, and no obvious single solution.',
        details:
          'Washington Accord Criterion WP1–WP7 defines complex problems as requiring in-depth engineering knowledge, multidisciplinary considerations, and significant safety or environmental analysis.',
        accreditationStandard: 'Mandatory for WA accreditation; at least two CLOs in 300/400-level courses must incorporate CEP.',
        example: 'Designing a power distribution grid with dynamic solar fluctuations and fault tolerance constraints.',
      },
    ],
  },
  6: {
    stepNumber: 6,
    stageName: 'Weekly Plan & Pacing',
    conceptHeadline: 'Curriculum Pacing and Formative Checkpoint Rhythm',
    conceptSummary:
      'The weekly schedule distributes topical complexity evenly, establishing clear milestones before major exams and reinforcing constructive alignment week-by-week.',
    concepts: [
      {
        id: 'cognitive-pacing',
        label: 'Cognitive Load Pacing',
        tag: 'Best Practice',
        shortDef: 'Scaffolding concepts from foundational theory (Weeks 1-4) to application (Weeks 5-10) and synthesis (Weeks 11-15).',
        details:
          'Avoid backloading difficult topics right before final exams. Insert low-stakes formative checkpoints every 2-3 weeks to catch struggling students early.',
        accreditationStandard: 'Student retention and continuous quality enhancement standards.',
        example: 'Week 4 Quiz on fundamentals; Week 8 Midterm on application; Week 14 Project presentations on synthesis.',
      },
      {
        id: 'module-synchronization',
        label: 'Syllabus-to-Lab Sync',
        tag: 'Core Principle',
        shortDef: 'Ensuring laboratory and tutorial sessions align tightly with the corresponding lecture week.',
        details:
          'Students should never perform a laboratory experiment on an engineering phenomenon they haven\'t yet modeled in lecture.',
        accreditationStandard: 'ABET Criterion 5 laboratory and software tools integration.',
        example: 'Week 7 Lecture on Operational Amplifiers followed by Week 7 Lab building an inverting amplifier circuit.',
      },
    ],
  },
  7: {
    stepNumber: 7,
    stageName: 'Teaching & Learning Activities (TLAs)',
    conceptHeadline: 'Active Learning and Pedagogical Diversity',
    conceptSummary:
      'Outcome-Based Education replaces passive listening with student-centered activities such as Problem-Based Learning (PBL), peer review, and laboratory investigations.',
    concepts: [
      {
        id: 'active-learning',
        label: 'Student-Centered Active Learning',
        tag: 'Core Principle',
        shortDef: 'Instructional methods where students actively engage with course material through problem-solving and collaboration.',
        details:
          'Studies demonstrate active learning reduces failure rates by 33% in STEM compared to pure lectures (Freeman et al., PNAS). Methods include flipped classroom, think-pair-share, and live coding.',
        accreditationStandard: 'CDIO (Conceive-Design-Implement-Operate) and active pedagogy standards.',
        example: 'Having students simulate and debug a circuit model in real-time rather than simply watching a slide demonstration.',
      },
      {
        id: 'tla-alignment',
        label: 'TLA-to-CLO Concordance',
        tag: 'Best Practice',
        shortDef: 'The pedagogical method must mirror the Bloom\'s verb of the intended outcome.',
        details:
          'If a CLO asks students to "Evaluate alternative structural materials", the class session must incorporate a comparative debate or multi-criteria decision matrix activity.',
        accreditationStandard: 'Washington Accord guideline on pedagogical alignment with Bloom\'s taxonomy.',
        example: 'Pairing a design outcome with a collaborative studio workshop.',
      },
    ],
  },
  8: {
    stepNumber: 8,
    stageName: 'Assessment Strategy & Weighting',
    conceptHeadline: 'Balancing Formative Feedback and Direct Summative Evidence',
    conceptSummary:
      'Assessments generate direct empirical evidence of student achievement. In OBE, assessments must directly map to CLOs, with explicit weighting and passing thresholds.',
    concepts: [
      {
        id: 'formative-summative',
        label: 'Formative vs. Summative Assessments',
        tag: 'Core Principle',
        shortDef: 'Formative = assessment for learning (coaching/feedback). Summative = assessment of learning (final grading).',
        details:
          'Formative tasks (weekly quizzes, homework drafts, in-class polls) allow students to fail safely and iterate. Summative tasks (midterms, final projects) measure cumulative mastery.',
        accreditationStandard: 'ABET requires demonstrating timely formative feedback before high-stakes assessments.',
        example: 'A low-stakes draft submission of the final project report in Week 10 with written instructor feedback.',
      },
      {
        id: 'direct-evidence',
        label: 'Direct Assessment Evidence',
        tag: 'Accreditation Rule',
        shortDef: 'Evaluation based on student work (exams, projects, lab reports), not subjective opinion surveys.',
        details:
          'Indirect evidence (student surveys, course evaluations) is insufficient for accreditation. Panels require direct evidence linked to specific rubric scoring criteria for each CLO.',
        accreditationStandard: 'Washington Accord WA Criterion 4 (Direct measurement of student performance).',
        example: 'Question 3 on Midterm 1 explicitly isolates CLO2 performance and generates a statistical pass rate.',
        commonPitfall: 'Lumping all exam questions into a single aggregate course grade without recording individual CLO breakdown scores.',
      },
      {
        id: 'rubric-analytic',
        label: '4-Tier Analytic Rubrics',
        tag: 'Evaluation',
        shortDef: 'Multi-criteria scoring matrix with descriptive performance bands: Exemplary, Proficient, Developing, Unsatisfactory.',
        details:
          'Analytic rubrics eliminate subjective grading variance among teaching assistants and clarify expectations to students before they begin work.',
        accreditationStandard: 'Mandatory for qualitative deliverables (capstone projects, design reports, lab presentations).',
        example: 'A technical writing rubric scoring: 1. Organization, 2. Data Interpretation, 3. Citation Quality on 1-4 scale.',
      },
    ],
  },
  9: {
    stepNumber: 9,
    stageName: 'Alignment Check & CQI Attainment',
    conceptHeadline: 'Closing the Loop: Continuous Quality Improvement (CQI)',
    conceptSummary:
      'The alignment audit verifies that every outcome is evaluated, no orphan topics exist, and attainment thresholds (e.g., 65% target score) are mathematically verified.',
    concepts: [
      {
        id: 'cqi-cycle',
        label: 'The CQI "Plan-Do-Check-Act" Cycle',
        tag: 'Core Principle',
        shortDef: 'Continuous Quality Improvement: measuring student attainment, diagnosing gaps, and applying curriculum fixes.',
        details:
          'Accreditation is not a static test; it is an audit of your continuous improvement cycle. If 40% of students fail CLO3, the instructor documents corrective teaching interventions for the next cohort.',
        accreditationStandard: 'ABET Criterion 4 (Continuous Improvement) & Washington Accord WP6.',
        example: 'Documenting: "CLO 2 attainment was 58% (target 65%); next semester we will introduce a supplemental hands-on simulation lab in Week 6."',
      },
      {
        id: 'attainment-benchmarks',
        label: 'Attainment Thresholds (KPIs)',
        tag: 'Accreditation Rule',
        shortDef: 'Standard threshold: e.g. 60% or 70% of students scoring at least 50–60% marks on a CLO.',
        details:
          'Programs establish target Key Performance Indicators (KPIs) to decide whether an outcome is considered "attained" at the cohort level.',
        accreditationStandard: 'Institutional OBE policy & national qualification framework standards.',
        example: 'Target: "At least 70% of enrolled students achieve a score of 60% or higher on assessments linked to CLO 1."',
      },
    ],
  },
  10: {
    stepNumber: 10,
    stageName: 'Review, Accreditation Dossier & Export',
    conceptHeadline: 'Accreditation Dossier Compilation & Digital Seals',
    conceptSummary:
      'The final course blueprint compiles all matrices, syllabi, rubrics, and approvals into an official accreditation-compliant course dossier ready for academic committee review.',
    concepts: [
      {
        id: 'accreditation-dossier',
        label: 'Official Course Syllabus Dossier',
        tag: 'Accreditation Rule',
        shortDef: 'The complete documentary package submitted during ABET/Washington Accord campus evaluation visits.',
        details:
          'The syllabus dossier contains the course description, CLO-PLO mapping matrix, assessment breakdown, weekly schedule, grading policies, and approved reference materials.',
        accreditationStandard: 'ABET Self-Study Report (SSR) Appendix A (Course Syllabi in standard 2-page format).',
        example: 'Exporting the official PDF with cryptographic seal and dean approval stamps for accreditation binders.',
      },
      {
        id: 'interoperability-cartridge',
        label: 'IMS Common Cartridge & LMS Sync',
        tag: 'Best Practice',
        shortDef: 'Exporting the OBE course architecture into Canvas, Moodle, or Blackboard without manual re-entry.',
        details:
          'Digital alignment ensures the course built in OBE360 directly populates the grading rubrics, quizzes, and modules inside the university Learning Management System.',
        accreditationStandard: 'IMS Global Learning Consortium standards for educational data interoperability.',
        example: 'One-click export of .imscc cartridge or Moodle XML schema.',
      },
    ],
  },
};

interface ObeTipsGuideProps {
  currentStep: number;
  wizardMode: 'obe10' | 'granular15';
  showTips: boolean;
  onToggleTips: () => void;
  onOpenBloomsHelper?: () => void;
  onOpenAlignmentModal?: () => void;
}

export const ObeTipsGuide: React.FC<ObeTipsGuideProps> = ({
  currentStep,
  wizardMode,
  showTips,
  onToggleTips,
  onOpenBloomsHelper,
  onOpenAlignmentModal,
}) => {
  // Active popover concept
  const [activeConcept, setActiveConcept] = useState<ObeConceptItem | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Map step number for granular mode if necessary
  const normalizedStep = wizardMode === 'obe10' ? currentStep : Math.min(Math.ceil((currentStep / 15) * 10), 10);
  const guidance = OBE10_CONCEPTS_DATA[normalizedStep] || OBE10_CONCEPTS_DATA[1];

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveConcept(null);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveConcept(null);
      }
    };

    if (activeConcept) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeConcept]);

  // If user turned tips off, return null
  if (!showTips) return null;

  return (
    <div
      id="obe-tips-context-guide"
      className="mb-6 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/70 via-indigo-50/40 to-white p-4 shadow-2xs transition-all animate-fadeIn relative"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left: Indicator & Headline */}
        <div className="flex items-start space-x-3 max-w-2xl">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Lightbulb className="w-4 h-4 fill-amber-200" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                OBE Concept Guide
              </span>
              <span className="text-xs font-bold text-slate-800">
                Stage {currentStep}: {guidance.conceptHeadline}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {guidance.conceptSummary}
            </p>
          </div>
        </div>

        {/* Right: Quick Concept Pills & Dismiss Button */}
        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-between lg:justify-end shrink-0">
          <div className="flex items-center flex-wrap gap-1.5">
            {guidance.concepts.map((concept) => {
              const isSelected = activeConcept?.id === concept.id;
              return (
                <button
                  key={concept.id}
                  type="button"
                  id={`obe-tip-pill-${concept.id}`}
                  onClick={() => setActiveConcept(isSelected ? null : concept)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50/80 hover:border-amber-300'
                  }`}
                  title={`Click to learn more about ${concept.label}`}
                >
                  <span>{concept.label}</span>
                  <HelpCircle className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                </button>
              );
            })}
          </div>

          {/* Dismiss / Toggle Off Button */}
          <button
            type="button"
            id="obe-tips-hide-btn"
            onClick={onToggleTips}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition cursor-pointer ml-1"
            title="Hide Tips mode (re-enable anytime from the top bar)"
            aria-label="Hide Tips mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Popover Deep-Dive Card */}
      {activeConcept && (
        <div
          ref={popoverRef}
          id="obe-concept-popover-card"
          className="mt-3.5 p-4 rounded-xl bg-white border border-amber-300 shadow-xl animate-in fade-in zoom-in-95 z-30 space-y-3"
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeConcept.tag}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{activeConcept.label}</h4>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1">
                {activeConcept.shortDef}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveConcept(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed">
            {activeConcept.details}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {/* Accreditation Callout */}
            <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs">
              <div className="flex items-center space-x-1.5 text-indigo-900 font-bold mb-1">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Accreditation Standard</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {activeConcept.accreditationStandard}
              </p>
            </div>

            {/* Practical Example */}
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Practical Example</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {activeConcept.example}
              </p>
            </div>
          </div>

          {activeConcept.commonPitfall && (
            <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100 text-[11px] text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                <strong>Common Audit Pitfall:</strong> {activeConcept.commonPitfall}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="text-[11px] text-slate-400">
              Tips can be toggled on/off anytime with the "Tips" button in the header.
            </span>
            <div className="flex items-center space-x-2">
              {activeConcept.actionType === 'blooms_modal' && onOpenBloomsHelper && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveConcept(null);
                    onOpenBloomsHelper();
                  }}
                  className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  <Brain className="w-3 h-3" />
                  <span>Launch Bloom's Tool</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveConcept(null)}
                className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Reusable context-aware inline tooltip for input labels or section headings.
 * Displays a subtle question mark or lightbulb only when tips mode is ON.
 */
export interface ObeConceptTooltipProps {
  showTips?: boolean;
  term: string;
  explanation: string;
  accreditationNote?: string;
}

export const ObeConceptTooltip: React.FC<ObeConceptTooltipProps> = ({
  showTips: explicitShowTips,
  term,
  explanation,
  accreditationNote,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTipsActive, setIsTipsActive] = useState<boolean>(() => {
    if (explicitShowTips !== undefined) return explicitShowTips;
    const saved = localStorage.getItem('obe360_show_tips');
    return saved !== null ? saved === 'true' : true;
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (explicitShowTips !== undefined) {
      setIsTipsActive(explicitShowTips);
      return;
    }
    const handleToggled = (e: Event) => {
      const customEvent = e as CustomEvent<{ showTips: boolean }>;
      if (customEvent.detail?.showTips !== undefined) {
        setIsTipsActive(customEvent.detail.showTips);
      }
    };
    window.addEventListener('obe_tips_toggled', handleToggled);
    return () => window.removeEventListener('obe_tips_toggled', handleToggled);
  }, [explicitShowTips]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isTipsActive) return null;

  return (
    <div className="relative inline-flex items-center ml-1.5" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold inline-flex items-center justify-center transition cursor-pointer shadow-2xs"
        title={`OBE Tip: Click to explain ${term}`}
        aria-label={`Explain ${term}`}
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-1.5 w-64 p-3 bg-white rounded-xl shadow-xl border border-amber-300 text-xs z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5">
            <span className="flex items-center space-x-1 text-amber-800">
              <Lightbulb className="w-3 h-3 fill-amber-400 text-amber-600" />
              <span>{term}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-[11px]"
            >
              ×
            </button>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed mb-1.5">
            {explanation}
          </p>
          {accreditationNote && (
            <div className="p-1.5 rounded bg-indigo-50/80 text-[10px] text-indigo-900 border border-indigo-100 font-medium">
              <strong>Accreditation:</strong> {accreditationNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
