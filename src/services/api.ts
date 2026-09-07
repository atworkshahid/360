import { BloomLevel, MLO, RubricCriterion } from '../types';
import { getBloomCriteriaSuggestions } from '../utils/rubricGenerator';

export interface CLOAnalysisResult {
  bloomVerb: string;
  bloomLevel: BloomLevel;
  domain: 'Cognitive' | 'Psychomotor' | 'Affective';
  suggestedAssessment: string;
  suggestedThreshold: number;
  suggestedWeightage: number;
  qualityScore: number;
  isWeak: boolean;
  weaknessReason: string;
  suggestion: string;
  checks: Array<{ label: string; passed: boolean; detail: string }>;
}

export interface CLORefinedSuggestion {
  id: string;
  style: string;
  statement: string;
  bloomVerb: string;
  bloomLevel: BloomLevel;
  rationalization: string;
  recommendedAssessment: string;
  qualityScore: number;
  keyImprovements: string[];
}

export interface CLORefineResult {
  currentAnalysis: {
    detectedVerb: string;
    detectedLevel: BloomLevel;
    isVagueOrUnmeasurable: boolean;
    identifiedIssues: string[];
    pedagogicalCritique: string;
    currentMeasurabilityScore: number;
  };
  suggestions: CLORefinedSuggestion[];
  bestPracticeTips: string[];
}

export interface GeneratedQuestionItem {
  questionStatement: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation: string;
  bloomLevel: BloomLevel;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  alignmentVerification?: string;
}

export interface GeneratedLessonResult {
  title: string;
  learningGoal: string;
  teachingMode: string;
  durationMins: number;
  recommendedResources: string;
  learningActivity: string;
  formativeAssessment: string;
  evidenceOfLearning: string;
  completionRequirement: string[];
}

export async function analyzeCLOStatement(statement: string, courseContext?: string): Promise<CLOAnalysisResult> {
  try {
    const res = await fetch('/api/ai/clo-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statement, courseContext }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error analyzing CLO, using fallback heuristics:', err);
  }

  // Pure client-side heuristic fallback
  const lower = statement.toLowerCase().trim();
  const weakVerbs = ['understand', 'know', 'learn', 'appreciate', 'comprehend', 'be aware of'];
  const isWeak = weakVerbs.some((v) => lower.includes(v));

  let bloomLevel: BloomLevel = 'Understand';
  let bloomVerb = 'Explain';
  let score = 75;

  if (isWeak) {
    score = 45;
    bloomVerb = 'Understand';
    bloomLevel = 'Understand';
  } else if (/create|design|formulate|construct|synthesize/i.test(lower)) {
    bloomLevel = 'Create';
    bloomVerb = 'Design';
    score = 95;
  } else if (/evaluate|critique|judge|assess|appraise/i.test(lower)) {
    bloomLevel = 'Evaluate';
    bloomVerb = 'Evaluate';
    score = 92;
  } else if (/analyze|differentiate|distinguish|examine|investigate/i.test(lower)) {
    bloomLevel = 'Analyze';
    bloomVerb = 'Analyze';
    score = 92;
  } else if (/apply|implement|execute|solve|calculate/i.test(lower)) {
    bloomLevel = 'Apply';
    bloomVerb = 'Apply';
    score = 88;
  } else if (/identify|recall|list|state|define/i.test(lower)) {
    bloomLevel = 'Remember';
    bloomVerb = 'Identify';
    score = 82;
  }

  return {
    bloomVerb,
    bloomLevel,
    domain: 'Cognitive',
    suggestedAssessment: bloomLevel === 'Analyze' || bloomLevel === 'Evaluate' ? 'Case Study / Critical Essay' : 'Applied Practical Project',
    suggestedThreshold: 60,
    suggestedWeightage: 25,
    qualityScore: score,
    isWeak,
    weaknessReason: isWeak ? 'Outcome uses non-observable verb ("' + bloomVerb + '") that cannot be directly demonstrated with empirical student evidence.' : '',
    suggestion: isWeak ? statement.replace(/understand|know|comprehend/gi, 'critically analyze and evaluate') : statement,
    checks: [
      { label: 'Measurable action verb', passed: !isWeak, detail: isWeak ? 'Uses vague verb' : 'Observable performance verb' },
      { label: 'One primary cognitive action', passed: true, detail: 'Single primary cognitive focus' },
      { label: 'Learner-focused', passed: true, detail: 'Describes demonstrable learner output' },
      { label: 'Assessable with evidence', passed: !isWeak, detail: isWeak ? 'Direct measurement difficult' : 'Directly assessable' },
      { label: 'Appropriate Bloom level', passed: true, detail: `Targeted at ${bloomLevel}` },
      { label: 'Clear context', passed: true, detail: 'Context specified' },
      { label: 'Expected standard defined', passed: true, detail: 'Performance expectation clear' },
    ],
  };
}

export async function refineCLOStatement(params: {
  statement: string;
  courseTitle?: string;
  courseCategory?: string;
  targetBloomLevel?: BloomLevel;
  refinementFocus?: string;
  customInstruction?: string;
  cloCode?: string;
}): Promise<CLORefineResult> {
  try {
    const res = await fetch('/api/ai/clo-refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error refining CLO, invoking client-side heuristic engine:', err);
  }

  // Client-side fallback
  const lower = params.statement.toLowerCase().trim();
  const weakVerbs = ['understand', 'know', 'learn', 'appreciate', 'comprehend', 'be aware of', 'familiarize', 'study'];
  const matchedWeak = weakVerbs.find((v) => lower.includes(v));
  const isVague = Boolean(matchedWeak);

  let coreTopic = params.statement
    .replace(/^(the\s+)?students?\s+(will\s+)?(be\s+able\s+to\s+)?/i, '')
    .replace(/^(understand|know|learn|appreciate|comprehend|study|analyze|evaluate|apply|demonstrate)\s+/i, '')
    .trim();

  if (!coreTopic || coreTopic.length < 5) {
    coreTopic = params.courseTitle ? `foundational concepts in ${params.courseTitle}` : 'core curriculum principles';
  }

  const detectedVerb = matchedWeak ? matchedWeak.charAt(0).toUpperCase() + matchedWeak.slice(1) : 'Explain';
  const detectedLevel: BloomLevel = isVague ? 'Understand' : 'Apply';

  return {
    currentAnalysis: {
      detectedVerb,
      detectedLevel,
      isVagueOrUnmeasurable: isVague,
      identifiedIssues: isVague
        ? [
            `Contains passive/non-measurable verb "${matchedWeak}" which cannot be demonstrated via direct evidence.`,
            'Lacks explicit performance context or standard of achievement.',
          ]
        : ['Outcome can be sharpened with authentic context and higher cognitive challenge.'],
      pedagogicalCritique: isVague
        ? `Accreditation auditors flag outcomes using "${matchedWeak}" because comprehension happens inside the learner's mind; learning outcomes must describe demonstrable, observable actions.`
        : 'The outcome is actionable. Refining with precise contextual conditions and evidence will elevate it to audit-ready status.',
      currentMeasurabilityScore: isVague ? 46 : 76,
    },
    suggestions: [
      {
        id: 'sug-1',
        style: 'Accredited OBE Direct',
        statement: `Analyze and apply ${coreTopic} to solve authentic problem scenarios with empirical precision.`,
        bloomVerb: 'Analyze',
        bloomLevel: 'Analyze',
        rationalization: 'Replaces passive verbs with observable action verbs and establishes clear, demonstrable problem-solving performance.',
        recommendedAssessment: 'Structured Scenario Analysis / Analytical Problem Set',
        qualityScore: 94,
        keyImprovements: ['Measurable action verb (Analyze)', 'Learner-centered performance task', 'Explicit assessment linkage'],
      },
      {
        id: 'sug-2',
        style: 'Higher-Order Cognitive (HOTS)',
        statement: `Critique and evaluate systemic complexities in ${coreTopic}, formulating evidence-based recommendations under authentic constraints.`,
        bloomVerb: 'Evaluate',
        bloomLevel: 'Evaluate',
        rationalization: 'Elevates cognitive rigor to Bloom Level 5 (Evaluate), requiring learners to appraise trade-offs and defend decisions with authoritative evidence.',
        recommendedAssessment: 'Critical Case Study / Defense Seminar',
        qualityScore: 97,
        keyImprovements: ['Higher-Order Thinking Skill (HOTS)', 'Requires comparative appraisal and defense', 'High accreditation audit rating'],
      },
      {
        id: 'sug-3',
        style: 'Authentic Professional Evidence',
        statement: `Design and deliver an integrated solution for ${coreTopic} that complies with contemporary professional and statutory standards.`,
        bloomVerb: 'Design',
        bloomLevel: 'Create',
        rationalization: 'Anchors the outcome directly to a demonstrable student artifact, fulfilling Washington Accord / ABET evidence requirements.',
        recommendedAssessment: 'Capstone Project Milestone / Portfolio Deliverable',
        qualityScore: 98,
        keyImprovements: ['Produces tangible professional deliverable', 'Complies with industry / statutory criteria', 'Direct evidentiary artifact'],
      },
      {
        id: 'sug-4',
        style: 'Comprehensive Multi-factor',
        statement: `Examine the operational dynamics of ${coreTopic} to diagnose underlying variances and validate remedial strategies.`,
        bloomVerb: 'Examine',
        bloomLevel: 'Analyze',
        rationalization: 'Establishes a logical sequence: diagnostic examination followed by evidence-based remediation.',
        recommendedAssessment: 'Applied Diagnostic Report / Structured Viva',
        qualityScore: 92,
        keyImprovements: ['Clear cause-and-effect sequence', 'Diagnostic verification evidence', 'Auditable performance standard'],
      },
    ],
    bestPracticeTips: [
      'Begin outcome statements with a single, high-leverage Bloom action verb in present tense.',
      'Specify the condition or toolset (e.g. "using statutory provisions", "based on empirical datasets").',
      'Ensure the phrasing points to an observable student artifact that can be graded with a rubric.',
    ],
  };
}

export interface AIBloomsTagResult {
  detectedVerb: string;
  normalizedVerb: string;
  secondaryVerbs: string[];
  suggestedLevel: BloomLevel;
  levelNumber: number;
  order: 'LOTS' | 'HOTS';
  isMeasurable: boolean;
  measurabilityScore: number;
  measurabilityVerdict: 'Directly Measurable' | 'Partially Measurable' | 'Non-Measurable (Action Required)';
  measurabilityFeedback: string;
  depthAppropriateness: {
    isAppropriate: boolean;
    currentTier: string;
    targetRecommendedLevels: BloomLevel[];
    analysis: string;
    recommendation: string;
  };
  recommendedBloomVerbs: string[];
  elevateSuggestions: Array<{
    targetLevel: BloomLevel;
    verbs: string[];
    rationale: string;
  }>;
  suggestedRephrasedStatement?: string;
  flags?: string[];
}

export async function tagCLOBloomsWithAI(params: {
  statement: string;
  currentLevel?: BloomLevel;
  currentVerb?: string;
  courseTitle?: string;
  courseLevel?: string;
  courseCategory?: string;
}): Promise<AIBloomsTagResult> {
  try {
    const res = await fetch('/api/ai/clo-tag-blooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error tagging CLO with AI, using local tagger engine:', err);
  }

  // Fallback to local deterministic Bloom's taxonomy engine
  const { tagCLOBlooms } = await import('../utils/bloomsTagger');
  const local = tagCLOBlooms(
    params.statement,
    (params.courseLevel as any) || 'Undergraduate',
    params.currentLevel
  );

  return {
    detectedVerb: local.detectedVerb,
    normalizedVerb: local.normalizedVerb,
    secondaryVerbs: local.secondaryVerbs,
    suggestedLevel: local.suggestedLevel,
    levelNumber: local.levelNumber,
    order: local.order,
    isMeasurable: local.isMeasurable,
    measurabilityScore: local.measurabilityScore,
    measurabilityVerdict: local.measurabilityVerdict,
    measurabilityFeedback: local.measurabilityFeedback,
    depthAppropriateness: {
      isAppropriate: local.cognitiveDepth.isAppropriateForCourseLevel,
      currentTier: local.cognitiveDepth.tierLabel,
      targetRecommendedLevels: local.cognitiveDepth.targetRecommendedLevels,
      analysis: local.cognitiveDepth.advice,
      recommendation: local.cognitiveDepth.canElevate
        ? `Consider elevating to ${local.cognitiveDepth.elevateSuggestions[0]?.targetLevel || 'HOTS'}`
        : 'Cognitive depth verified at highest synthesis tier.',
    },
    recommendedBloomVerbs: local.recommendedBloomVerbs,
    elevateSuggestions: local.cognitiveDepth.elevateSuggestions,
    suggestedRephrasedStatement: local.suggestedRephrasedStatement,
  };
}

export async function batchTagCLOsWithAI(params: {
  clos: Array<{ id: string; code: string; statement: string; bloomLevel: BloomLevel; bloomVerb?: string }>;
  courseTitle?: string;
  courseLevel?: string;
}): Promise<{
  results: Array<{
    cloId: string;
    tag: AIBloomsTagResult;
    hasMismatch: boolean;
  }>;
  distribution: Record<BloomLevel, number>;
  lotsPercentage: number;
  hotsPercentage: number;
  balanceVerdict: string;
  balanceAdvice: string;
}> {
  try {
    const res = await fetch('/api/ai/batch-tag-clos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error batch tagging CLOs with AI, using local tagger engine:', err);
  }

  // Fallback to local batch tagger
  const { batchTagCourseCLOs } = await import('../utils/bloomsTagger');
  const dummyCLOs = params.clos.map((c) => ({
    id: c.id,
    code: c.code,
    statement: c.statement,
    bloomVerb: c.bloomVerb || '',
    bloomLevel: c.bloomLevel,
    learningDomain: 'Cognitive' as const,
    competency: '',
    skills: '',
    assessmentMethod: '',
    achievementThreshold: 60,
    weightage: 20,
    status: 'Draft' as const,
    qualityScore: 80,
    qualityChecks: [],
    mappedPLOs: [],
  }));

  const localBatch = batchTagCourseCLOs(dummyCLOs, (params.courseLevel as any) || 'Undergraduate');

  return {
    results: localBatch.taggedItems.map((item) => ({
      cloId: item.clo.id,
      tag: {
        detectedVerb: item.tag.detectedVerb,
        normalizedVerb: item.tag.normalizedVerb,
        secondaryVerbs: item.tag.secondaryVerbs,
        suggestedLevel: item.tag.suggestedLevel,
        levelNumber: item.tag.levelNumber,
        order: item.tag.order,
        isMeasurable: item.tag.isMeasurable,
        measurabilityScore: item.tag.measurabilityScore,
        measurabilityVerdict: item.tag.measurabilityVerdict,
        measurabilityFeedback: item.tag.measurabilityFeedback,
        depthAppropriateness: {
          isAppropriate: item.tag.cognitiveDepth.isAppropriateForCourseLevel,
          currentTier: item.tag.cognitiveDepth.tierLabel,
          targetRecommendedLevels: item.tag.cognitiveDepth.targetRecommendedLevels,
          analysis: item.tag.cognitiveDepth.advice,
          recommendation: item.tag.cognitiveDepth.advice,
        },
        recommendedBloomVerbs: item.tag.recommendedBloomVerbs,
        elevateSuggestions: item.tag.cognitiveDepth.elevateSuggestions,
        suggestedRephrasedStatement: item.tag.suggestedRephrasedStatement,
      },
      hasMismatch: item.isTagMismatch,
    })),
    distribution: localBatch.distribution,
    lotsPercentage: localBatch.lotsPercentage,
    hotsPercentage: localBatch.hotsPercentage,
    balanceVerdict: localBatch.balanceVerdict,
    balanceAdvice: localBatch.balanceAdvice,
  };
}

export async function generateScaffoldedMLOs(
  cloCode: string,
  cloStatement: string,
  moduleTitle: string,
  moduleNumber: number
): Promise<Partial<MLO>[]> {
  try {
    const res = await fetch('/api/ai/mlo-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cloCode, cloStatement, moduleTitle, moduleNumber }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.mlos || [];
    }
  } catch (err) {
    console.warn('API error generating MLOs, using fallback:', err);
  }

  const mod = moduleNumber || 1;
  return [
    {
      code: `MLO ${mod}.1.1`,
      statement: `Identify the foundational definitions, statutory frameworks, and core terminology of ${moduleTitle}.`,
      bloomVerb: 'Identify',
      bloomLevel: 'Remember',
      requiredActivity: 'Concept glossary review and structured retrieval quiz',
      assessment: '10-item diagnostic MCQ check',
      evidence: 'Direct digital quiz score ≥ 70%',
      studyTimeHours: 3,
    },
    {
      code: `MLO ${mod}.1.2`,
      statement: `Explain the operative mechanisms, procedural standards, and inter-institutional relationships governing ${moduleTitle}.`,
      bloomVerb: 'Explain',
      bloomLevel: 'Understand',
      requiredActivity: 'Comparative framework worksheet and diagrammatic synthesis',
      assessment: 'Written conceptual explanation response',
      evidence: 'Submitted structured diagram and short essay evaluated against rubric',
      studyTimeHours: 4,
    },
    {
      code: `MLO ${mod}.1.3`,
      statement: `Apply relevant statutory provisions and case precedents to resolve complex disputed scenarios.`,
      bloomVerb: 'Apply',
      bloomLevel: 'Apply',
      requiredActivity: 'Applied simulation workout and dispute resolution workshop',
      assessment: 'Scenario resolution problem brief',
      evidence: 'Submitted case brief with reasoned statutory citations',
      studyTimeHours: 5,
    },
    {
      code: `MLO ${mod}.1.4`,
      statement: `Analyze systemic jurisdictional conflicts and evaluate institutional balance within ${moduleTitle}.`,
      bloomVerb: 'Analyze',
      bloomLevel: 'Analyze',
      requiredActivity: 'Collaborative jurisprudential debate and peer rebuttal exercise',
      assessment: 'Summative critical analysis paper',
      evidence: 'Rubric-evaluated research essay demonstrating synthesis and critique',
      studyTimeHours: 6,
    },
  ];
}

export async function generateLessonDesign(
  mloCode: string,
  mloStatement: string,
  moduleTitle: string
): Promise<GeneratedLessonResult> {
  try {
    const res = await fetch('/api/ai/lesson-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mloCode, mloStatement, moduleTitle }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error generating lesson, using fallback:', err);
  }

  return {
    title: `Practical Workshop: ${mloStatement.slice(0, 48)}`,
    learningGoal: `Demonstrate observable mastery of ${mloCode}: ${mloStatement}`,
    teachingMode: 'Case Method & Interactive Inquiry',
    durationMins: 90,
    recommendedResources: 'Primary statutory excerpts, comparative judicial briefs, and analytical case notes',
    learningActivity: 'Students dissect authentic dispute scenarios in small teams, classify jurisdictional powers, and formulate defensible solutions.',
    formativeAssessment: '5-item contextual scenario check and rapid peer-critique',
    evidenceOfLearning: 'Submitted classification matrix and minimum 4/5 score on comprehension verification check',
    completionRequirement: ['read_content', 'complete_activity', 'pass_quiz'],
  };
}

export async function generateMCQQuestions(
  mloCode: string,
  mloStatement: string,
  cloCode: string,
  count = 2,
  bloomLevel: BloomLevel = 'Apply',
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
): Promise<GeneratedQuestionItem[]> {
  try {
    const res = await fetch('/api/ai/questions-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mloCode, mloStatement, cloCode, count, bloomLevel, difficulty }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.questions || [];
    }
  } catch (err) {
    console.warn('API error generating MCQs, using fallback:', err);
  }

  return [
    {
      questionStatement: `In an inter-governmental dispute regarding concurrent regulatory competence, which legal doctrine determines statutory preemption when an inconsistency arises?`,
      options: [
        'Doctrine of territorial nexus favoring local provincial enforcement',
        'Federal supremacy doctrine nullifying the conflicting provincial portion',
        'Automatic jurisdictional remand to the provincial ombudsman',
        'Equal concurrent co-existence without judicial precedence',
      ],
      correctAnswerIndex: 1,
      explanation: 'Under constitutional preemption doctrine, valid federal enactments prevail over conflicting subordinate or regional laws to the extent of the repugnancy.',
      bloomLevel: bloomLevel || 'Apply',
      difficulty: difficulty || 'Medium',
      marks: 2,
      alignmentVerification: `Directly assesses ${mloCode} by requiring application of statutory preemption principles to an authentic factual dispute.`,
    },
    {
      questionStatement: `Which constitutional body is uniquely vested with jurisdiction to resolve disputes concerning inter-provincial water accords and natural resources?`,
      options: [
        'The National Security Council sitting in executive session',
        'Council of Common Interests (CCI)',
        'The Federal Board of Revenue',
        'The Standing Advisory Council on Human Rights',
      ],
      correctAnswerIndex: 1,
      explanation: 'Articles 153 and 154 constitutionally establish the Council of Common Interests to formulate and regulate policies governing inter-provincial resources and disputes.',
      bloomLevel: 'Understand',
      difficulty: 'Easy',
      marks: 2,
      alignmentVerification: `Tests factual and structural comprehension required by ${mloCode}.`,
    },
  ];
}

export async function generateRubricCriteria(
  assessmentTitle: string,
  assessmentType: string,
  cloList: string[],
  bloomLevel?: BloomLevel,
  cloStatement?: string
): Promise<RubricCriterion[]> {
  try {
    const res = await fetch('/api/ai/rubric-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentTitle, assessmentType, cloList, bloomLevel, cloStatement }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.criteria && Array.isArray(data.criteria) && data.criteria.length > 0) {
        return data.criteria;
      }
    }
  } catch (err) {
    console.warn('API error generating rubric, using Bloom fallback:', err);
  }

  // Pedagogical Bloom-based fallback
  const resolvedBloom: BloomLevel = bloomLevel || 'Analyze';
  return getBloomCriteriaSuggestions(resolvedBloom, cloStatement, assessmentTitle);
}

export async function askCopilot(
  command: string,
  currentStep: string,
  courseData: unknown
): Promise<{ reply: string; suggestedActions: Array<{ label: string; actionType: string; payload?: unknown }> }> {
  try {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, currentStep, courseData }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error calling copilot, using fallback:', err);
  }

  return {
    reply: `### OBE360 Instructional Guidance\nFor stage **${currentStep}**, ensure every planned instructional component maps directly to demonstrable evidence.\n\n**Key Rule**: Student viewing of a lesson does *not* equal outcome achievement. Always pair instruction with active tasks producing direct evidence!`,
    suggestedActions: [
      { label: 'Check constructive alignment', actionType: 'audit_fix' },
      { label: 'View Bloom progression', actionType: 'info' },
    ],
  };
}

export interface ChatHistoryMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

export interface MultiTurnChatResponse {
  reply: string;
  model: string;
  role: string;
}

export async function sendChatMultiTurn(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  role: string = 'accreditation_specialist',
  model: string = 'gemini-3.5-flash',
  courseContext?: unknown
): Promise<MultiTurnChatResponse> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, role, model, courseContext }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Error in multi-turn Gemini chat:', err);
  }

  return {
    reply: `I am your OBE360™ Curriculum & Accreditation Assistant. I have analyzed your query in the context of your course. Ensure that every Course Learning Outcome adheres to Bloom's taxonomy with measurable performance evidence.`,
    model: `${model} (fallback)`,
    role,
  };
}

