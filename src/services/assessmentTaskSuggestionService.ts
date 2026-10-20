import {
  Course,
  CLO,
  BloomLevel,
  Assessment,
  Rubric,
  RubricCriterion,
  MCQQuestion,
  AssessmentTaskSuggestion,
  CourseAssessmentMappingSuite,
  AssessmentType,
  RubricLevelName,
} from '../types';
import { BLOOM_ORDER, BLOOM_RANK } from '../utils/assessmentAnalysis';

// Helper to determine cognitive tier
export function getCognitiveTier(level: BloomLevel): 'LOTS' | 'MOTS' | 'HOTS' {
  const rank = BLOOM_RANK[level] || 1;
  if (rank <= 2) return 'LOTS'; // Remember, Understand
  if (rank === 3) return 'MOTS'; // Apply
  return 'HOTS'; // Analyze, Evaluate, Create
}

export interface TaskArchetype {
  id: string;
  defaultTitleTemplate: string;
  taskType: AssessmentType;
  bloomLevel: BloomLevel;
  format: string;
  rationaleTemplate: string;
  promptTemplate: string;
  evidenceArtifact: string;
  recommendedWeight: number;
  recommendedMarks: number;
  isSummative: boolean;
  directOrIndirect: 'Direct' | 'Indirect';
  achievementThreshold: number;
  rubricBlueprint?: {
    titleTemplate: string;
    criteria: Array<{
      nameTemplate: string;
      weight: number;
      descriptors: Record<RubricLevelName, string>;
    }>;
  };
  sampleQuestionsTemplate?: Array<{
    statementTemplate: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanationTemplate: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }>;
  tags: string[];
}

export const COGNITIVE_TASK_ARCHETYPES: Record<BloomLevel, TaskArchetype[]> = {
  Remember: [
    {
      id: 'arch-rem-quiz',
      defaultTitleTemplate: 'Diagnostic & Terminology Recall Quiz',
      taskType: 'Quiz',
      bloomLevel: 'Remember',
      format: 'Timed Objective Quiz (MCQs & Definition Matching)',
      rationaleTemplate:
        'Cognitive level "Remember" (LOTS Level 1) assesses factual recall and knowledge recognition. Multiple-choice questions with targeted distractors provide direct, low-friction evidence of baseline terminology mastery.',
      promptTemplate:
        'Complete this objective diagnostic check containing 15-20 questions covering essential terms, foundational definitions, and statutory or formulaic rules defined in {CLO_CODE}.',
      evidenceArtifact: 'Automated LMS Quiz Grade & Distractor Analysis Report',
      recommendedWeight: 10,
      recommendedMarks: 30,
      isSummative: false,
      directOrIndirect: 'Direct',
      achievementThreshold: 70,
      sampleQuestionsTemplate: [
        {
          statementTemplate: 'Which of the following best defines the primary core concept specified under {CLO_STATEMENT}?',
          options: [
            'The standard operational definition recognized by accredited discipline literature',
            'A secondary peripheral application requiring advanced field synthesis',
            'An informal procedural rule with no regulatory or empirical binding',
            'An elective methodology used exclusively in pilot experiments',
          ],
          correctIndex: 0,
          explanationTemplate: 'Directly validates accurate recall of foundational taxonomy and terminology.',
          difficulty: 'Easy',
        },
        {
          statementTemplate: 'Under standard foundational frameworks for this domain, what is the mandatory threshold criteria for identifying {CLO_VERB}?',
          options: [
            'Criterion A with verifiable statutory benchmark verification',
            'Arbitrary subjective inspection without rubric grounding',
            'Discretionary advisory guidelines non-binding in scope',
            'Retrospective post-hoc anecdotal summary',
          ],
          correctIndex: 0,
          explanationTemplate: 'Tests recognition of established domain baselines.',
          difficulty: 'Medium',
        },
      ],
      tags: ['Objective', 'Formative Checkpoint', 'Recall', 'Automated Grading'],
    },
    {
      id: 'arch-rem-check',
      defaultTitleTemplate: 'Foundational Knowledge Checkpoint & Concept Matrix',
      taskType: 'Assignment',
      bloomLevel: 'Remember',
      format: 'Structured Concept Inventory & Nomenclature Sheet',
      rationaleTemplate:
        'Ensures students accurately identify and define key principles before attempting higher-order applications.',
      promptTemplate:
        'Complete the Structured Knowledge Inventory by listing, matching, and identifying all foundational concepts and conventions aligned with {CLO_CODE}.',
      evidenceArtifact: 'Completed Concept Inventory Sheet with verified nomenclature',
      recommendedWeight: 10,
      recommendedMarks: 25,
      isSummative: false,
      directOrIndirect: 'Direct',
      achievementThreshold: 65,
      tags: ['Worksheet', 'Diagnostic', 'Terminology'],
    },
  ],

  Understand: [
    {
      id: 'arch-und-quiz',
      defaultTitleTemplate: 'Conceptual Interpretation & Scenario Quiz',
      taskType: 'Quiz',
      bloomLevel: 'Understand',
      format: 'Scenario-Based Concept Discrimination Quiz',
      rationaleTemplate:
        'Cognitive level "Understand" (LOTS Level 2) requires students to interpret, classify, and explain principles in their own words. Scenario questions evaluate whether learners grasp underlying mechanisms beyond rote memorization.',
      promptTemplate:
        'Evaluate 10 distinct workplace scenarios and identify which principle from {CLO_CODE} explains the observed outcome, explaining why contrasting options are inappropriate.',
      evidenceArtifact: 'Discrimination Quiz Response Matrix with Written Explanations',
      recommendedWeight: 15,
      recommendedMarks: 40,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 65,
      sampleQuestionsTemplate: [
        {
          statementTemplate: 'When analyzing the operational context of {CLO_STATEMENT}, why does Principle X yield the observed outcome?',
          options: [
            'Because underlying causal mechanisms require systematic input-output stabilization',
            'Because random fluctuation forces an automatic default reset',
            'Because external oversight ignores internal state parameters',
            'Because legacy procedures restrict all modern optimization',
          ],
          correctIndex: 0,
          explanationTemplate: 'Demonstrates conceptual comprehension of causal mechanisms.',
          difficulty: 'Medium',
        },
      ],
      tags: ['Scenario Quiz', 'Comprehension', 'Interpretation'],
    },
    {
      id: 'arch-und-summary',
      defaultTitleTemplate: 'Structured Conceptual Synthesis & Schema Explanation',
      taskType: 'Assignment',
      bloomLevel: 'Understand',
      format: 'Diagrammatic Explanation & Paraphrased Summary',
      rationaleTemplate:
        'Requires students to translate complex ideas into clear diagrams and explain workflows using their own words.',
      promptTemplate:
        'Create a visual conceptual schema explaining the core ideas of {CLO_CODE} and write a 500-word explanation detailing the relationships between key components.',
      evidenceArtifact: 'Visual Schema + Written Explanation Document',
      recommendedWeight: 15,
      recommendedMarks: 50,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 65,
      rubricBlueprint: {
        titleTemplate: 'Conceptual Explanation & Schema Rubric',
        criteria: [
          {
            nameTemplate: 'Accuracy of Conceptual Interpretation',
            weight: 50,
            descriptors: {
              'Not Achieved': 'Major conceptual misunderstandings; inaccurate descriptions.',
              Developing: 'Explains basic ideas but confuses key underlying principles.',
              Achieved: 'Accurate explanation of main concepts with minor omissions.',
              Proficient: 'Clear, accurate, and nuanced conceptual explanation with illustrative examples.',
              Exemplary: 'Authoritative, crystal-clear synthesis articulating subtle nuances flawlessly.',
            },
          },
          {
            nameTemplate: 'Clarity of Relationships & Paraphrasing',
            weight: 50,
            descriptors: {
              'Not Achieved': 'Merely copies textbook text without demonstrated comprehension.',
              Developing: 'Paraphrases inconsistently with unclear component linkages.',
              Achieved: 'Accurately articulates relationships between components in own words.',
              Proficient: 'Cohesive, well-structured explanation illustrating dynamic interplay.',
              Exemplary: 'Elegantly explains systemic relationships with compelling pedagogical clarity.',
            },
          },
        ],
      },
      tags: ['Paraphrasing', 'Schema', 'Comprehension'],
    },
  ],

  Apply: [
    {
      id: 'arch-app-problem-set',
      defaultTitleTemplate: 'Practical Problem Set & Applied Implementation',
      taskType: 'Assignment',
      bloomLevel: 'Apply',
      format: 'Applied Problem-Solving Problem Set (Calculations / Case Application)',
      rationaleTemplate:
        'Cognitive level "Apply" (MOTS Level 3) assesses transfer of rules, algorithms, and methodologies to novel concrete problems. Structured problem sets verify procedural fidelity and computational accuracy.',
      promptTemplate:
        'Solve the following 4 applied problem scenarios by directly executing the computational or procedural methodology specified in {CLO_CODE}. Show step-by-step working and verify edge cases.',
      evidenceArtifact: 'Step-by-Step Solution Dossier with Verification Checks',
      recommendedWeight: 20,
      recommendedMarks: 50,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 65,
      rubricBlueprint: {
        titleTemplate: 'Applied Problem-Solving Performance Rubric',
        criteria: [
          {
            nameTemplate: 'Procedural Execution & Method Selection',
            weight: 40,
            descriptors: {
              'Not Achieved': 'Selects inappropriate procedures; inability to apply governing method.',
              Developing: 'Selects the right method but makes repeated execution errors.',
              Achieved: 'Correctly selects and executes governing procedure with minimal errors.',
              Proficient: 'Skillful, efficient execution handling standard and semi-complex scenarios.',
              Exemplary: 'Flawless procedural mastery seamlessly adapting method to tricky boundary conditions.',
            },
          },
          {
            nameTemplate: 'Calculations / Implementation Accuracy',
            weight: 35,
            descriptors: {
              'Not Achieved': 'Computational results invalid or unverified.',
              Developing: 'Calculation errors undermine final outcome accuracy.',
              Achieved: 'Accurate numerical/procedural results with correct units and steps.',
              Proficient: 'Airtight computational rigor with explicit verification checks.',
              Exemplary: 'Zero calculation errors with comprehensive sensitivity verification.',
            },
          },
          {
            nameTemplate: 'Interpretation of Applied Results',
            weight: 25,
            descriptors: {
              'Not Achieved': 'Cannot interpret what the calculated outputs signify in context.',
              Developing: 'Offers superficial interpretation missing practical relevance.',
              Achieved: 'Contextualizes outputs correctly within the problem scenario.',
              Proficient: 'Translates results into actionable practical conclusions.',
              Exemplary: 'Deeply connects applied numerical outputs to broader operational decision points.',
            },
          },
        ],
      },
      tags: ['Problem Set', 'Calculations', 'Method Application'],
    },
    {
      id: 'arch-app-lab',
      defaultTitleTemplate: 'Hands-on Laboratory & Practical Simulation Task',
      taskType: 'Practical',
      bloomLevel: 'Apply',
      format: 'Practical Lab Experiment / Coding Challenge / Clinical Simulation',
      rationaleTemplate:
        'Practical execution provides direct authentic evidence that learners can implement tools and protocols in a live or simulated workspace.',
      promptTemplate:
        'Execute the laboratory / simulation protocol for {CLO_CODE}. Setup environment, execute procedure, capture telemetry data, and document deviations.',
      evidenceArtifact: 'Verified Lab Logbook / Running Code with Test Suite / Execution Checklist',
      recommendedWeight: 20,
      recommendedMarks: 60,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 70,
      tags: ['Hands-on', 'Lab Experiment', 'Simulation', 'Direct Skill'],
    },
  ],

  Analyze: [
    {
      id: 'arch-ana-case-rubric',
      defaultTitleTemplate: 'Case Study Decomposition & Root-Cause Matrix',
      taskType: 'Case Study',
      bloomLevel: 'Analyze',
      format: 'Analytical Case Study with Multi-Criterion Analytic Rubric',
      rationaleTemplate:
        'Cognitive level "Analyze" (HOTS Level 4) demands deconstruction of complex phenomena into constituents, identifying latent causes, trade-offs, and systemic relationships. An analytic rubric provides objective scoring across decomposition criteria.',
      promptTemplate:
        'Analyze the provided complex real-world case study aligned with {CLO_CODE}. Deconstruct the organizational/technical breakdown into root causes, analyze underlying structural constraints, and evaluate conflicting evidence.',
      evidenceArtifact: 'Analytical Case Dossier with Cause-and-Effect Matrix & Analytic Rubric Score',
      recommendedWeight: 25,
      recommendedMarks: 75,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 65,
      rubricBlueprint: {
        titleTemplate: 'Analytical Decomposition & Root-Cause Rubric',
        criteria: [
          {
            nameTemplate: 'Deconstruction of Complex Factors',
            weight: 35,
            descriptors: {
              'Not Achieved': 'Superficial narrative recap without decomposing causal elements.',
              Developing: 'Identifies isolated factors but fails to discern structural connections.',
              Achieved: 'Systematically deconstructs the situation into identifiable sub-components.',
              Proficient: 'Sophisticated deconstruction illuminating subtle systemic interdependencies.',
              Exemplary: 'Exemplary structural analysis disentangling multilayered causal webs with total precision.',
            },
          },
          {
            nameTemplate: 'Evidence-Based Causal Distinction',
            weight: 35,
            descriptors: {
              'Not Achieved': 'Conflates correlation with causation; unsupported conjectures.',
              Developing: 'Identifies correlations but relies on unverified assumptions for root cause.',
              Achieved: 'Clearly distinguishes symptoms from genuine root causes with evidence.',
              Proficient: 'Rigorous root-cause isolation supported by quantitative/statutory evidence.',
              Exemplary: 'Air-tight forensic causal attribution with counter-factual verification.',
            },
          },
          {
            nameTemplate: 'Trade-Off & Vulnerability Analysis',
            weight: 30,
            descriptors: {
              'Not Achieved': 'Ignores systemic trade-offs; binary oversimplification.',
              Developing: 'Acknowledges trade-offs superficially without assessing impact.',
              Achieved: 'Accurately charts risk trade-offs and organizational/technical constraints.',
              Proficient: 'In-depth comparative trade-off matrix forecasting ripple effects.',
              Exemplary: 'Visionary constraint analysis projecting multi-horizon risk exposures.',
            },
          },
        ],
      },
      tags: ['Case Study', 'HOTS', 'Root-Cause', 'Analytic Rubric'],
    },
    {
      id: 'arch-ana-tradeoff-report',
      defaultTitleTemplate: 'Comparative Architectural & Methodological Trade-off Report',
      taskType: 'Assignment',
      bloomLevel: 'Analyze',
      format: 'Technical Trade-off & Comparative Analysis Report',
      rationaleTemplate:
        'Evaluates ability to critically compare competing methodologies, algorithms, or policy frameworks under realistic constraints.',
      promptTemplate:
        'Produce an exhaustive Comparative Analysis of at least two competing approaches addressing {CLO_CODE}. Contrast performance, scalability, risk profile, and resource footprints.',
      evidenceArtifact: 'Analytical Comparative Report (2,000 words + Matrix)',
      recommendedWeight: 20,
      recommendedMarks: 60,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 65,
      tags: ['Comparative Analysis', 'Trade-offs', 'HOTS'],
    },
  ],

  Evaluate: [
    {
      id: 'arch-eva-defense-rubric',
      defaultTitleTemplate: 'Critical Defense & Expert Appraisal Review',
      taskType: 'Presentation',
      bloomLevel: 'Evaluate',
      format: 'Oral Defense / Critical Appraisal Panel with Performance Rubric',
      rationaleTemplate:
        'Cognitive level "Evaluate" (HOTS Level 5) requires students to judge the value of ideas or work based on rigorous standards, critique opposing arguments, and defend positions under scrutiny. Oral/written defenses evaluated by rubric provide gold-standard accreditation evidence.',
      promptTemplate:
        'Critically appraise the proposed strategy, architecture, or legal position addressing {CLO_CODE}. Defend your verdict against opposing expert viewpoints during a formal review panel.',
      evidenceArtifact: 'Written Evaluative Appraisal + Video/In-Person Defense Graded via Rubric',
      recommendedWeight: 25,
      recommendedMarks: 80,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 70,
      rubricBlueprint: {
        titleTemplate: 'Critical Evaluation & Defense Rubric',
        criteria: [
          {
            nameTemplate: 'Evaluation Standards & Criteria Formulation',
            weight: 35,
            descriptors: {
              'Not Achieved': 'Judgments based entirely on subjective preference with no benchmark.',
              Developing: 'Cites standard criteria but applies them inconsistently or arbitrarily.',
              Achieved: 'Applies explicit, recognized evaluation criteria to judge merit and efficacy.',
              Proficient: 'Formulates comprehensive evaluation criteria tailored to regulatory and technical demands.',
              Exemplary: 'Defines authoritative, multi-dimensional evaluative framework of professional caliber.',
            },
          },
          {
            nameTemplate: 'Critique Rigor & Defense Argumentation',
            weight: 40,
            descriptors: {
              'Not Achieved': 'Fails to anticipate or respond to counterarguments during defense.',
              Developing: 'Defensive responses rely on circular logic or dismiss critique.',
              Achieved: 'Robustly defends core judgments using empirical/legal evidence.',
              Proficient: 'Deftly addresses tough objections; concedes minor limitations constructively.',
              Exemplary: 'Impeccable poise and persuasive authority dismantling complex hostile counter-arguments.',
            },
          },
          {
            nameTemplate: 'Ethical & Contextual Soundness',
            weight: 25,
            descriptors: {
              'Not Achieved': 'Ignores ethical, safety, or legal implications entirely.',
              Developing: 'Superficial nod to ethics without genuine impact weighting.',
              Achieved: 'Judgments account for professional ethics, safety, and societal impact.',
              Proficient: 'Nuanced ethical balancing highlighting long-term sustainability.',
              Exemplary: 'Exemplary moral and professional stewardship anticipating societal ramifications.',
            },
          },
        ],
      },
      tags: ['Oral Defense', 'Critique', 'Rubric', 'HOTS L5'],
    },
    {
      id: 'arch-eva-audit',
      defaultTitleTemplate: 'Formal Compliance & Benchmark Quality Audit',
      taskType: 'Case Study',
      bloomLevel: 'Evaluate',
      format: 'Peer Review & Quality Audit Report with Scoring Sheet',
      rationaleTemplate:
        'Auditing peer work or external artifacts against standards demonstrates advanced evaluative discrimination.',
      promptTemplate:
        'Conduct a comprehensive Quality & Accreditation Audit of a benchmark project or dataset against standards required by {CLO_CODE}. Issue formal findings and corrective notices.',
      evidenceArtifact: 'Formal Audit Finding Report & Scorecard',
      recommendedWeight: 20,
      recommendedMarks: 50,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 70,
      tags: ['Audit', 'Benchmarking', 'Quality Assurance'],
    },
  ],

  Create: [
    {
      id: 'arch-cre-capstone-project',
      defaultTitleTemplate: 'Capstone Milestone Project & Working Artifact',
      taskType: 'Project',
      bloomLevel: 'Create',
      format: 'Authentic Design Project / Software or Physical Prototype / Capstone Solution',
      rationaleTemplate:
        'Cognitive level "Create" (HOTS Level 6) is the pinnacle of OBE constructive alignment. Students synthesize cross-disciplinary principles into an original, coherent, and working prototype or design portfolio. A holistic capstone rubric assesses novelty, functional execution, and synthesis.',
      promptTemplate:
        'Design, architect, and construct an original, functional solution fulfilling the requirements of {CLO_CODE}. Submit complete source code / design schematics, architectural specification, and verification testing proof.',
      evidenceArtifact: 'Working Prototype / Repository + Architectural Design Dossier + Demonstration',
      recommendedWeight: 35,
      recommendedMarks: 100,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 70,
      rubricBlueprint: {
        titleTemplate: 'Capstone Synthesis & Artifact Design Rubric',
        criteria: [
          {
            nameTemplate: 'Architectural Design & Innovation',
            weight: 35,
            descriptors: {
              'Not Achieved': 'Trivial copy of tutorial code; lacks coherent architectural plan.',
              Developing: 'Basic architecture functional but derivative and poorly partitioned.',
              Achieved: 'Original, well-structured architecture effectively solving the stated problem.',
              Proficient: 'Elegant, modular, scalable design showing innovative synthesis of principles.',
              Exemplary: 'Groundbreaking, industry-grade architecture exhibiting exceptional elegance and creativity.',
            },
          },
          {
            nameTemplate: 'Functional Implementation & Execution Quality',
            weight: 35,
            descriptors: {
              'Not Achieved': 'Artifact fails to compile/run; non-functional deliverables.',
              Developing: 'Partial functionality with significant bugs and incomplete features.',
              Achieved: 'Fully functional artifact passing all core functional requirements.',
              Proficient: 'Robust, polished implementation handling edge cases with high stability.',
              Exemplary: 'Production-ready execution with comprehensive automated tests and error resilience.',
            },
          },
          {
            nameTemplate: 'Synthesis Documentation & Demonstration',
            weight: 30,
            descriptors: {
              'Not Achieved': 'Missing documentation; unable to explain system operation.',
              Developing: 'Sparse documentation; superficial walkthrough of features.',
              Achieved: 'Thorough technical documentation with clear usage guidelines and demonstration.',
              Proficient: 'Professional-grade technical dossier with architecture diagrams and live demo.',
              Exemplary: 'Publication-quality documentation and executive-caliber oral/visual demonstration.',
            },
          },
        ],
      },
      tags: ['Capstone', 'Prototype', 'Design Project', 'Synthesis', 'HOTS L6'],
    },
    {
      id: 'arch-cre-proposal',
      defaultTitleTemplate: 'Research & Innovation Grant/System Proposal',
      taskType: 'Project',
      bloomLevel: 'Create',
      format: 'Novel System Specification & Research Innovation Proposal',
      rationaleTemplate:
        'Assesses student ability to formulate an original research inquiry or technical venture proposal synthesizing modern literature.',
      promptTemplate:
        'Formulate a comprehensive Innovation Proposal for a novel intervention or technology addressing challenges in {CLO_CODE}. Include problem framing, original methodology, and evaluation framework.',
      evidenceArtifact: 'Formal 15-page Innovation Proposal with Methodology',
      recommendedWeight: 25,
      recommendedMarks: 80,
      isSummative: true,
      directOrIndirect: 'Direct',
      achievementThreshold: 70,
      tags: ['Proposal', 'Research', 'Innovation', 'HOTS L6'],
    },
  ],
};

/**
 * Generates tailored suggestions for a specific CLO based on its cognitive level and statement.
 */
export function getSuggestedTasksForCLO(
  clo: CLO,
  courseContext?: Partial<Course>
): AssessmentTaskSuggestion[] {
  const bloomLevel: BloomLevel = clo.bloomLevel || 'Apply';
  const archetypes = COGNITIVE_TASK_ARCHETYPES[bloomLevel] || COGNITIVE_TASK_ARCHETYPES.Apply;
  const tier = getCognitiveTier(bloomLevel);

  // Discipline/domain context
  const courseTitle = courseContext?.title || 'Course';
  const cloCode = clo.code || 'CLO';
  const statement = clo.statement || '';
  const verb = clo.bloomVerb || clo.statement?.split(' ')[0] || bloomLevel;

  return archetypes.map((arch, index) => {
    // Generate tailored title
    const tailoredTitle = `${cloCode} Assessment: ${arch.defaultTitleTemplate}`;

    // Replace template tokens in strings
    const replaceTokens = (str: string) => {
      return str
        .replace(/{CLO_CODE}/g, cloCode)
        .replace(/{CLO_STATEMENT}/g, statement)
        .replace(/{CLO_VERB}/g, verb)
        .replace(/{COURSE_TITLE}/g, courseTitle);
    };

    const prompt = replaceTokens(arch.promptTemplate);
    const rationale = replaceTokens(arch.rationaleTemplate);

    // Build Rubric if applicable
    let rubricBlueprint: AssessmentTaskSuggestion['rubricBlueprint'] = undefined;
    if (arch.rubricBlueprint) {
      rubricBlueprint = {
        rubricTitle: `${cloCode} - ${replaceTokens(arch.rubricBlueprint.titleTemplate)}`,
        criteria: arch.rubricBlueprint.criteria.map((c) => ({
          criterionName: replaceTokens(c.nameTemplate),
          weight: c.weight,
          levels: (['Not Achieved', 'Developing', 'Achieved', 'Proficient', 'Exemplary'] as RubricLevelName[]).map(
            (lvl) => ({
              level: lvl,
              descriptor: replaceTokens(c.descriptors[lvl] || ''),
              pointsRange:
                lvl === 'Not Achieved'
                  ? '0-49%'
                  : lvl === 'Developing'
                  ? '50-64%'
                  : lvl === 'Achieved'
                  ? '65-74%'
                  : lvl === 'Proficient'
                  ? '75-84%'
                  : '85-100%',
            })
          ),
        })),
      };
    }

    // Build sample questions if applicable
    let sampleQuestions: AssessmentTaskSuggestion['sampleQuestions'] = undefined;
    if (arch.sampleQuestionsTemplate) {
      sampleQuestions = arch.sampleQuestionsTemplate.map((q) => ({
        questionStatement: replaceTokens(q.statementTemplate),
        options: q.options.map((opt) => replaceTokens(opt)) as [string, string, string, string],
        correctAnswerIndex: q.correctIndex,
        explanation: replaceTokens(q.explanationTemplate),
        difficulty: q.difficulty,
      }));
    }

    // Base match score is 95-99%
    const alignmentMatchScore = 95 + (index === 0 ? 4 : index === 1 ? 2 : 0);

    return {
      id: `sug-${clo.id}-${arch.id}-${index}`,
      title: tailoredTitle,
      taskType: arch.taskType,
      bloomLevel,
      cognitiveTier: tier,
      format: arch.format,
      pedagogicalRationale: rationale,
      studentTaskPrompt: prompt,
      evidenceArtifact: arch.evidenceArtifact,
      recommendedWeight: Math.round(clo.weightage || arch.recommendedWeight),
      recommendedMarks: arch.recommendedMarks,
      isSummative: arch.isSummative,
      directOrIndirect: arch.directOrIndirect,
      achievementThreshold: arch.achievementThreshold,
      rubricBlueprint,
      sampleQuestions,
      alignmentMatchScore,
      matchedCLOId: clo.id,
      matchedCLOCode: cloCode,
      matchedCLOStatement: statement,
      tags: arch.tags,
    };
  });
}

/**
 * Returns generic suggestions for a Bloom level without a specific CLO.
 */
export function getSuggestedTasksForBloomLevel(
  bloomLevel: BloomLevel,
  courseContext?: Partial<Course>
): AssessmentTaskSuggestion[] {
  const dummyCLO: CLO = {
    id: `temp-${bloomLevel.toLowerCase()}`,
    code: `Target (${bloomLevel})`,
    statement: `Demonstrate mastery at the ${bloomLevel} cognitive level.`,
    bloomLevel,
    bloomVerb: bloomLevel,
    learningDomain: 'Cognitive',
    competency: 'Core Domain Competency',
    skills: 'Target Performance Skills',
    weightage: 20,
    achievementThreshold: 60,
    assessmentMethod: 'Direct Evidence',
    status: 'Validated',
    qualityScore: 90,
    qualityChecks: [],
    mappedPLOs: [],
  };
  return getSuggestedTasksForCLO(dummyCLO, courseContext);
}

/**
 * Generates an automated, cohesive course-wide assessment blueprint mapping all CLOs.
 * Calibrates weights to exactly 100% and provides suitable formative/summative tasks.
 */
export function generateCourseWideAssessmentPlan(course: Course): CourseAssessmentMappingSuite {
  const clos = course.clos || [];
  if (clos.length === 0) {
    return {
      courseTitle: course.title || 'Untitled Course',
      courseCode: course.code || 'OBE-101',
      totalSuggestedWeight: 0,
      overallCognitiveBalance: { hotsPercent: 0, motsPercent: 0, lotsPercent: 0 },
      cloMappings: [],
      suggestedAssessments: [],
      suggestedRubrics: [],
      evidenceSummary: 'No course learning outcomes defined yet.',
    };
  }

  // 1. Group CLOs by tier
  const tierCounts = { HOTS: 0, MOTS: 0, LOTS: 0 };
  clos.forEach((c) => {
    const tier = getCognitiveTier(c.bloomLevel || 'Apply');
    tierCounts[tier]++;
  });

  const totalCLOs = clos.length;
  const hotsPercent = Math.round((tierCounts.HOTS / totalCLOs) * 100);
  const motsPercent = Math.round((tierCounts.MOTS / totalCLOs) * 100);
  const lotsPercent = 100 - (hotsPercent + motsPercent);

  // 2. Map each CLO to best task and allocate weights
  // Reserve 25-30% for a Comprehensive Final Synthesis or Capstone, distribute remaining evenly
  const hasMultipleCLOs = totalCLOs >= 3;
  const finalExamWeight = hasMultipleCLOs ? 25 : 0;
  const distributedWeightPool = 100 - finalExamWeight;

  const baseWeightPerCLO = Math.floor(distributedWeightPool / totalCLOs);
  const remainderWeight = distributedWeightPool - baseWeightPerCLO * totalCLOs;

  const suggestedAssessments: Assessment[] = [];
  const suggestedRubrics: Rubric[] = [];

  const cloMappings = clos.map((clo, idx) => {
    const allSuggestions = getSuggestedTasksForCLO(clo, course);
    // Pick the most authentic task:
    const tier = getCognitiveTier(clo.bloomLevel || 'Apply');
    // If HOTS, prioritize Rubric or Project; if LOTS, prioritize Quiz
    let selected = allSuggestions[0];
    if (tier === 'HOTS') {
      selected = allSuggestions.find((s) => s.rubricBlueprint) || allSuggestions[0];
    } else if (tier === 'LOTS') {
      selected = allSuggestions.find((s) => s.taskType === 'Quiz') || allSuggestions[0];
    }

    // Assign weight
    const assignedWeight = baseWeightPerCLO + (idx === 0 ? remainderWeight : 0);
    const adjustedTask: AssessmentTaskSuggestion = {
      ...selected,
      recommendedWeight: assignedWeight,
    };

    // Construct Assessment object
    const asmtId = `asmt-auto-${clo.id}`;
    let rubricId: string | undefined = undefined;

    if (adjustedTask.rubricBlueprint) {
      rubricId = `rubric-${clo.id}`;
      const rubricObj: Rubric = {
        id: rubricId,
        title: adjustedTask.rubricBlueprint.rubricTitle,
        assessmentId: asmtId,
        criteria: adjustedTask.rubricBlueprint.criteria.map((crit, cIdx) => ({
          id: `crit-${clo.id}-${cIdx + 1}`,
          criterionName: crit.criterionName,
          cloId: clo.id,
          weight: crit.weight,
          levels: crit.levels,
        })),
      };
      suggestedRubrics.push(rubricObj);
    }

    // Sample questions
    const questions: MCQQuestion[] = (adjustedTask.sampleQuestions || []).map((sq, qIdx) => ({
      id: `q-${clo.id}-${qIdx + 1}`,
      assessmentId: asmtId,
      questionStatement: sq.questionStatement,
      options: sq.options,
      correctAnswerIndex: sq.correctAnswerIndex,
      explanation: sq.explanation,
      cloId: clo.id,
      mloId: '',
      bloomLevel: clo.bloomLevel || 'Apply',
      difficulty: sq.difficulty,
      marks: 10,
    }));

    suggestedAssessments.push({
      id: asmtId,
      name: adjustedTask.title,
      type: adjustedTask.taskType,
      linkedCLOIds: [clo.id],
      linkedMLOIds: [],
      bloomLevel: adjustedTask.bloomLevel,
      evidenceType: adjustedTask.directOrIndirect,
      marks: adjustedTask.recommendedMarks,
      weightage: assignedWeight,
      achievementThreshold: adjustedTask.achievementThreshold,
      isSummative: adjustedTask.isSummative,
      directOrIndirect: adjustedTask.directOrIndirect,
      questions,
      rubricId,
    });

    return {
      cloId: clo.id,
      cloCode: clo.code,
      cloStatement: clo.statement,
      bloomLevel: clo.bloomLevel || 'Apply',
      cognitiveTier: tier,
      selectedTask: adjustedTask,
      alternativeTasks: allSuggestions.filter((s) => s.id !== selected.id),
    };
  });

  // If we reserved final exam weight, add comprehensive final assessment
  if (finalExamWeight > 0) {
    const finalAsmtId = `asmt-auto-final-synthesis`;
    suggestedAssessments.push({
      id: finalAsmtId,
      name: 'Comprehensive Final Examination & Synthesis',
      type: 'Final Assessment',
      linkedCLOIds: clos.map((c) => c.id),
      linkedMLOIds: [],
      bloomLevel: clos.some((c) => c.bloomLevel === 'Create' || c.bloomLevel === 'Evaluate')
        ? 'Evaluate'
        : 'Analyze',
      evidenceType: 'Direct',
      marks: 100,
      weightage: finalExamWeight,
      achievementThreshold: 60,
      isSummative: true,
      directOrIndirect: 'Direct',
      questions: [],
    });
  }

  const totalCalculated = suggestedAssessments.reduce((acc, a) => acc + (a.weightage || 0), 0);

  return {
    courseTitle: course.title || 'Course',
    courseCode: course.code || 'OBE-101',
    totalSuggestedWeight: totalCalculated,
    overallCognitiveBalance: {
      hotsPercent,
      motsPercent,
      lotsPercent,
    },
    cloMappings,
    suggestedAssessments,
    suggestedRubrics,
    evidenceSummary: `Mapped ${clos.length} course learning outcomes into ${suggestedAssessments.length} authentic assessment instruments (${suggestedRubrics.length} evaluation rubrics created). Total weightage calibrated to 100%.`,
  };
}

/**
 * Inserts a suggested assessment task directly into the course object.
 * Also generates and attaches its Rubric if the suggestion provides one.
 */
export function applySuggestionToCourse(
  course: Course,
  suggestion: AssessmentTaskSuggestion,
  options?: {
    customWeight?: number;
    customName?: string;
    customMarks?: number;
    customPrompt?: string;
  }
): {
  updatedCourse: Course;
  addedAssessment: Assessment;
  addedRubric?: Rubric;
} {
  const asmtId = `asmt-${Date.now()}`;
  const asmtName = options?.customName || suggestion.title;
  const asmtWeight = options?.customWeight ?? suggestion.recommendedWeight;
  const asmtMarks = options?.customMarks ?? suggestion.recommendedMarks;

  let addedRubric: Rubric | undefined = undefined;
  let rubricId: string | undefined = undefined;

  // Create Rubric if applicable
  if (suggestion.rubricBlueprint) {
    rubricId = `rubric-${Date.now()}`;
    addedRubric = {
      id: rubricId,
      title: `${asmtName} Evaluation Rubric`,
      assessmentId: asmtId,
      criteria: suggestion.rubricBlueprint.criteria.map((crit, cIdx) => ({
        id: `crit-${Date.now()}-${cIdx + 1}`,
        criterionName: crit.criterionName,
        cloId: suggestion.matchedCLOId || course.clos[0]?.id || '',
        weight: crit.weight,
        levels: crit.levels,
      })),
    };
  }

  // Create MCQ Questions if applicable
  const questions: MCQQuestion[] = (suggestion.sampleQuestions || []).map((sq, qIdx) => ({
    id: `q-${Date.now()}-${qIdx + 1}`,
    assessmentId: asmtId,
    questionStatement: sq.questionStatement,
    options: sq.options,
    correctAnswerIndex: sq.correctAnswerIndex,
    explanation: sq.explanation,
    cloId: suggestion.matchedCLOId || course.clos[0]?.id || '',
    mloId: '',
    bloomLevel: suggestion.bloomLevel,
    difficulty: sq.difficulty,
    marks: 10,
  }));

  const addedAssessment: Assessment = {
    id: asmtId,
    name: asmtName,
    type: suggestion.taskType,
    linkedCLOIds: suggestion.matchedCLOId ? [suggestion.matchedCLOId] : [],
    linkedMLOIds: [],
    bloomLevel: suggestion.bloomLevel,
    evidenceType: suggestion.directOrIndirect,
    marks: asmtMarks,
    weightage: asmtWeight,
    achievementThreshold: suggestion.achievementThreshold,
    isSummative: suggestion.isSummative,
    directOrIndirect: suggestion.directOrIndirect,
    questions,
    rubricId,
  };

  const updatedAssessments = [...(course.assessments || []), addedAssessment];
  const updatedRubrics = addedRubric
    ? [...(course.rubrics || []), addedRubric]
    : course.rubrics || [];

  const updatedCourse: Course = {
    ...course,
    assessments: updatedAssessments,
    rubrics: updatedRubrics,
  };

  return {
    updatedCourse,
    addedAssessment,
    addedRubric,
  };
}

/**
 * Adopts the entire automated course assessment mapping suite.
 */
export function applyFullSuiteToCourse(
  course: Course,
  suite: CourseAssessmentMappingSuite
): Course {
  return {
    ...course,
    assessments: suite.suggestedAssessments,
    rubrics: [...(course.rubrics || []).filter((r) => !r.id.startsWith('rubric-')), ...suite.suggestedRubrics],
  };
}

/**
 * AI-assisted assessment task suggestion fetcher with automatic fallback.
 */
export async function fetchAIAssessmentSuggestions(
  course: Course,
  clo: CLO
): Promise<AssessmentTaskSuggestion[]> {
  try {
    const res = await fetch('/api/ai/suggest-assessment-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseTitle: course.title,
        courseCode: course.code,
        discipline: (course as any).discipline || course.department || 'General',
        clo: {
          id: clo.id,
          code: clo.code,
          statement: clo.statement,
          bloomLevel: clo.bloomLevel,
          bloomVerb: clo.bloomVerb,
          competency: clo.competency,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        return data.suggestions.map((s: any, idx: number) => ({
          ...s,
          id: s.id || `sug-ai-${clo.id}-${idx}`,
          matchedCLOId: clo.id,
          matchedCLOCode: clo.code,
          matchedCLOStatement: clo.statement,
        }));
      }
    }
  } catch (err) {
    console.warn('AI suggestions call bypassed, using deterministic pedagogical engine:', err);
  }

  // Fallback to our deterministic pedagogical engine
  return getSuggestedTasksForCLO(clo, course);
}
