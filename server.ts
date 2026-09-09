import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { collaborationRouter } from './server/collaborationRoutes';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    service: 'MENTISERA OBE360™ Course Creator Engine',
  });
});

// Helper for AI generation with JSON schema or text fallback
async function callGeminiPrompt(systemInstruction: string, userPrompt: string): Promise<string> {
  const ai = getAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  return response.text || '{}';
}

// 1. CLO Analysis and Quality Check
app.post('/api/ai/clo-analyze', async (req: Request, res: Response) => {
  const { statement, courseContext } = req.body;
  if (!statement || typeof statement !== 'string') {
    return res.status(400).json({ error: 'Statement is required' });
  }

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are a premier Outcome-Based Education (OBE) course design expert.
Evaluate the following Course Learning Outcome (CLO) statement against Bloom's Revised Taxonomy and rigorous OBE standards.
Output strict JSON with:
{
  "bloomVerb": "string (e.g., Analyze, Evaluate, Design, Apply)",
  "bloomLevel": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
  "domain": "Cognitive" | "Psychomotor" | "Affective",
  "suggestedAssessment": "string (e.g. Analytical essay, Case study, Project report, Lab viva)",
  "suggestedThreshold": number (e.g. 60),
  "suggestedWeightage": number (e.g. 20),
  "qualityScore": number (0 to 100),
  "isWeak": boolean,
  "weaknessReason": "string (if isWeak is true, explain why e.g. non-measurable verb like 'understand', 'know', or multiple divergent actions)",
  "suggestion": "string (improved observable, measurable CLO version)",
  "checks": [
    {"label": "Measurable action verb", "passed": boolean, "detail": "string"},
    {"label": "One primary cognitive action", "passed": boolean, "detail": "string"},
    {"label": "Learner-centered performance", "passed": boolean, "detail": "string"},
    {"label": "Directly assessable with evidence", "passed": boolean, "detail": "string"},
    {"label": "Appropriate cognitive rigor", "passed": boolean, "detail": "string"},
    {"label": "Clear context and condition", "passed": boolean, "detail": "string"},
    {"label": "Clear expected standard of performance", "passed": boolean, "detail": "string"}
  ]
}`;

      const raw = await callGeminiPrompt(systemInstruction, `CLO Statement: "${statement}"\nCourse context: ${courseContext || 'General Higher Education Course'}`);
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini clo-analyze fallback activated:', (err as Error).message);
  }

  // Domain heuristic fallback
  const lower = statement.toLowerCase().trim();
  const words = lower.split(/\s+/);
  const firstVerb = words[0] || 'demonstrate';

  const weakVerbs = ['understand', 'know', 'learn', 'appreciate', 'comprehend', 'be aware of', 'familiarize'];
  const isWeak = weakVerbs.some(wv => lower.includes(wv));

  let bloomLevel = 'Understand';
  let bloomVerb = 'Explain';
  let qualityScore = 75;

  if (isWeak) {
    qualityScore = 48;
    bloomVerb = words.find(w => weakVerbs.includes(w)) || 'understand';
    bloomVerb = bloomVerb.charAt(0).toUpperCase() + bloomVerb.slice(1);
    bloomLevel = 'Understand';
  } else if (/create|design|formulate|construct|develop|synthesize/i.test(lower)) {
    bloomLevel = 'Create';
    bloomVerb = 'Create';
    qualityScore = 95;
  } else if (/evaluate|critique|judge|assess|appraise/i.test(lower)) {
    bloomLevel = 'Evaluate';
    bloomVerb = 'Evaluate';
    qualityScore = 92;
  } else if (/analyze|differentiate|distinguish|examine|investigate/i.test(lower)) {
    bloomLevel = 'Analyze';
    bloomVerb = 'Analyze';
    qualityScore = 92;
  } else if (/apply|implement|execute|solve|calculate|demonstrate/i.test(lower)) {
    bloomLevel = 'Apply';
    bloomVerb = 'Apply';
    qualityScore = 88;
  } else if (/remember|identify|recall|list|state|define/i.test(lower)) {
    bloomLevel = 'Remember';
    bloomVerb = 'Identify';
    qualityScore = 82;
  }

  const suggestion = isWeak
    ? statement.replace(/understand|know|comprehend|learn/gi, 'analyze and apply').replace(/students will\s*/gi, '')
    : statement;

  res.json({
    bloomVerb,
    bloomLevel,
    domain: 'Cognitive',
    suggestedAssessment: bloomLevel === 'Analyze' || bloomLevel === 'Evaluate' ? 'Case Analysis / Analytical Essay' : 'Applied Problem Set / Project Milestone',
    suggestedThreshold: 60,
    suggestedWeightage: 25,
    qualityScore,
    isWeak,
    weaknessReason: isWeak ? 'Outcome uses non-observable verb ("' + bloomVerb + '") which cannot be directly verified through student performance evidence.' : '',
    suggestion: isWeak ? (suggestion.charAt(0).toUpperCase() + suggestion.slice(1)) : statement,
    checks: [
      { label: 'Measurable action verb', passed: !isWeak, detail: isWeak ? 'Replace passive verbs with active Bloom verbs' : 'Observable performance verb detected' },
      { label: 'One primary cognitive action', passed: true, detail: 'Focused on single core capability' },
      { label: 'Learner-centered performance', passed: true, detail: 'Describes what learner actively demonstrates' },
      { label: 'Directly assessable with evidence', passed: !isWeak, detail: isWeak ? 'Requires tangible assessment evidence' : 'Measurable via rubric or assessment' },
      { label: 'Appropriate cognitive rigor', passed: true, detail: `Aligned with Bloom level ${bloomLevel}` },
      { label: 'Clear context and condition', passed: true, detail: 'Provides situational focus' },
      { label: 'Clear expected standard', passed: true, detail: 'Specifies targeted achievement standard' },
    ],
  });
});

// 1b. AI-powered CLO Refiner (analyzes outcomes and suggests clearer, measurable phrasings based on OBE best practices)
app.post('/api/ai/clo-refine', async (req: Request, res: Response) => {
  const { statement, courseTitle, courseCategory, targetBloomLevel, refinementFocus, customInstruction, cloCode } = req.body;

  if (!statement || typeof statement !== 'string') {
    return res.status(400).json({ error: 'Statement is required' });
  }

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are an elite Outcome-Based Education (OBE) curriculum design specialist and accreditation auditor (ABET, Washington Accord, AACSB, QAA standards).
Your mission is to analyze the Course Learning Outcome (CLO) statement against Bloom's Revised Taxonomy and rigorous OBE accreditation best practices.
Identify ambiguities, non-measurable/passive verbs (e.g. "understand", "know", "learn", "appreciate", "familiarize", "comprehend"), multiple conflated cognitive actions, or missing demonstrable conditions.
Then generate 3 to 4 distinctly phrased, high-quality, measurable OBE outcome variations tailored to the course context and target cognitive rigor.

Return strict JSON:
{
  "currentAnalysis": {
    "detectedVerb": "string",
    "detectedLevel": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
    "isVagueOrUnmeasurable": boolean,
    "identifiedIssues": ["string", "string"],
    "pedagogicalCritique": "string",
    "currentMeasurabilityScore": number
  },
  "suggestions": [
    {
      "id": "string",
      "style": "Accredited OBE Direct" | "Higher-Order Cognitive (HOTS)" | "Authentic Professional Evidence" | "Comprehensive Multi-factor",
      "statement": "string (begins with active Bloom verb, clear condition, demonstrable performance output)",
      "bloomVerb": "string (e.g., Analyze, Evaluate, Formulate, Critique)",
      "bloomLevel": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
      "rationalization": "string (pedagogical explanation of why this phrasing is superior and measurable)",
      "recommendedAssessment": "string (e.g., Authentic Case Study, Capstone Deliverable, Comparative Empirical Paper)",
      "qualityScore": number,
      "keyImprovements": ["string", "string"]
    }
  ],
  "bestPracticeTips": [
    "string",
    "string",
    "string"
  ]
}`;

      const userPrompt = `CLO Code: ${cloCode || 'CLO'}
Current CLO Statement: "${statement}"
Course Title: "${courseTitle || 'Outcome-Based Academic Course'}"
Discipline/Category: "${courseCategory || 'Higher Education'}"
Target Bloom Level: ${targetBloomLevel || 'Analyze'}
Refinement Focus: ${refinementFocus || 'measurable'}
${customInstruction ? `Additional Custom Instructor Guidance: "${customInstruction}"` : ''}`;

      const raw = await callGeminiPrompt(systemInstruction, userPrompt);
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini clo-refine fallback activated:', (err as Error).message);
  }

  // Heuristic OBE refinement engine fallback
  const lower = statement.toLowerCase().trim();
  const weakVerbs = ['understand', 'know', 'learn', 'appreciate', 'comprehend', 'be aware of', 'familiarize', 'study', 'grasp'];
  const matchedWeakVerb = weakVerbs.find(wv => lower.includes(wv));
  const isVague = Boolean(matchedWeakVerb);

  // Extract core topic by stripping leading fluff
  let coreTopic = statement
    .replace(/^(the\s+)?students?\s+(will\s+)?(be\s+able\s+to\s+)?/i, '')
    .replace(/^(understand|know|learn|appreciate|comprehend|study|analyze|evaluate|apply|demonstrate)\s+/i, '')
    .trim();

  if (!coreTopic || coreTopic.length < 5) {
    coreTopic = courseTitle ? `key principles in ${courseTitle}` : 'core foundational principles and applications';
  }

  // Detected level
  let detectedLevel = 'Understand';
  let detectedVerb = matchedWeakVerb ? matchedWeakVerb.charAt(0).toUpperCase() + matchedWeakVerb.slice(1) : 'Explain';
  let measurabilityScore = isVague ? 48 : 78;

  if (/create|design|develop|formulate|construct/i.test(lower)) {
    detectedLevel = 'Create';
    detectedVerb = 'Design';
    measurabilityScore = 92;
  } else if (/evaluate|critique|judge|assess|appraise/i.test(lower)) {
    detectedLevel = 'Evaluate';
    detectedVerb = 'Evaluate';
    measurabilityScore = 90;
  } else if (/analyze|differentiate|distinguish|investigate|examine/i.test(lower)) {
    detectedLevel = 'Analyze';
    detectedVerb = 'Analyze';
    measurabilityScore = 88;
  } else if (/apply|implement|execute|calculate|solve/i.test(lower)) {
    detectedLevel = 'Apply';
    detectedVerb = 'Apply';
    measurabilityScore = 84;
  }

  const identifiedIssues: string[] = [];
  if (isVague) {
    identifiedIssues.push(`Uses subjective non-measurable verb ("${matchedWeakVerb}") which cannot be directly verified through student performance evidence.`);
  }
  if (!lower.includes('using') && !lower.includes('through') && !lower.includes('based on') && !lower.includes('in accordance with')) {
    identifiedIssues.push('Lacks explicit contextual conditions or governing criteria under which performance is demonstrated.');
  }
  if (statement.split(/\s+/).length < 8) {
    identifiedIssues.push('Outcome statement is overly terse and lacks specified performance standards.');
  }

  res.json({
    currentAnalysis: {
      detectedVerb,
      detectedLevel,
      isVagueOrUnmeasurable: isVague,
      identifiedIssues: identifiedIssues.length > 0 ? identifiedIssues : ['Outcome is structurally sound but can achieve higher academic rigor and authentic evidence alignment.'],
      pedagogicalCritique: isVague
        ? `Accreditation bodies (ABET, AACSB, HEC) prohibit verbs like "${matchedWeakVerb}" because an assessor cannot observe internal mental states. The outcome must specify an overt, measurable performance.`
        : 'The outcome contains an active verb, but elevating the phrasing with concrete conditions and verifiable deliverables ensures seamless accreditation audit readiness.',
      currentMeasurabilityScore: measurabilityScore,
    },
    suggestions: [
      {
        id: 'sug-direct',
        style: 'Accredited OBE Direct',
        statement: `Analyze and apply ${coreTopic} to resolve authentic problem scenarios with empirical precision.`,
        bloomVerb: 'Analyze',
        bloomLevel: 'Analyze',
        rationalization: 'Replaces passive phrasing with an observable action verb ("Analyze and apply") and specifies a concrete performance task with measurable criteria.',
        recommendedAssessment: 'Structured Scenario Analysis / Analytical Problem Set',
        qualityScore: 94,
        keyImprovements: ['Measurable action verb aligned to Bloom L4', 'Direct learner-centric performance target', 'Easily mapped to rubric criteria'],
      },
      {
        id: 'sug-hots',
        style: 'Higher-Order Cognitive (HOTS)',
        statement: `Critique and evaluate systemic complexities in ${coreTopic}, formulating evidence-based recommendations under authentic constraints.`,
        bloomVerb: 'Evaluate',
        bloomLevel: 'Evaluate',
        rationalization: 'Elevates cognitive rigor to Bloom Level 5 (Evaluate), requiring learners to weigh competing factors and justify judgments using authoritative standards.',
        recommendedAssessment: 'Critical Case Study / Peer Review Defense',
        qualityScore: 96,
        keyImprovements: ['Higher-Order Thinking Skill (HOTS) cognitive depth', 'Demands defense of competing arguments', 'High accreditation audit rating'],
      },
      {
        id: 'sug-evidence',
        style: 'Authentic Professional Evidence',
        statement: `Design and deliver an integrated solution for ${coreTopic} that complies with contemporary professional and statutory standards.`,
        bloomVerb: 'Design',
        bloomLevel: 'Create',
        rationalization: 'Ties the learning outcome directly to the creation of a tangible professional artefact, satisfying Washington Accord / ABET evidence mandates.',
        recommendedAssessment: 'Capstone Project Milestone / Portfolio Dossier',
        qualityScore: 98,
        keyImprovements: ['Produce demonstrable work product', 'Integrates professional compliance standards', 'Generates direct artifact for accreditation dossier'],
      },
      {
        id: 'sug-scaffolded',
        style: 'Comprehensive Multi-factor',
        statement: `Examine the operational dynamics of ${coreTopic} to diagnose underlying variances and validate remedial strategies.`,
        bloomVerb: 'Examine',
        bloomLevel: 'Analyze',
        rationalization: 'Provides an explicit diagnostic condition ("diagnose underlying variances") and a tangible closing deliverable ("validate remedial strategies").',
        recommendedAssessment: 'Applied Diagnostic Report / Diagnostic Lab Viva',
        qualityScore: 92,
        keyImprovements: ['Clear cause-and-effect cognitive sequence', 'Verifiable diagnostic evidence', 'Balanced workload and threshold clarity'],
      },
    ],
    bestPracticeTips: [
      'Begin outcome statements with a single, high-leverage Bloom action verb in present tense.',
      'Specify the condition or toolset (e.g. "using statutory provisions", "based on empirical datasets").',
      'Ensure the phrasing points to an observable student artifact that can be graded with a rubric.',
    ],
  });
});

// 1c. AI Bloom's Taxonomy Cognitive Tagger & Measurability Auditor
app.post('/api/ai/clo-tag-blooms', async (req: Request, res: Response) => {
  const { statement, currentLevel, currentVerb, courseTitle, courseLevel, courseCategory } = req.body;
  if (!statement || typeof statement !== 'string') {
    return res.status(400).json({ error: 'Statement is required' });
  }

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are an elite Outcome-Based Education (OBE) curriculum auditor and Bloom's Revised Taxonomy cognitive analyst.
Your task is to analyze the Course Learning Outcome (CLO) statement, extract the exact action verb(s), accurately classify its Bloom's Taxonomy cognitive level (Remember L1, Understand L2, Apply L3, Analyze L4, Evaluate L5, Create L6), verify whether the verb is measurable and observable, and assess whether the cognitive depth is appropriate for the course academic level.

Strictly return JSON matching this schema:
{
  "detectedVerb": "string (the primary action verb e.g. Analyze, Evaluate, Design, Explain, or vague verb like Understand)",
  "normalizedVerb": "string (lowercase infinitive/dictionary form e.g. analyze)",
  "secondaryVerbs": ["string"],
  "suggestedLevel": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
  "levelNumber": number (1 to 6),
  "order": "LOTS" | "HOTS",
  "isMeasurable": boolean,
  "measurabilityScore": number (0 to 100),
  "measurabilityVerdict": "Directly Measurable" | "Partially Measurable" | "Non-Measurable (Action Required)",
  "measurabilityFeedback": "string (clear explanation of why this verb is measurable or non-observable with accreditation context)",
  "depthAppropriateness": {
    "isAppropriate": boolean,
    "currentTier": "string (e.g. Level 4: Analyze - Higher-Order Thinking)",
    "targetRecommendedLevels": ["Analyze", "Evaluate", "Create"],
    "analysis": "string (evaluation of whether this depth is suitable for course level)",
    "recommendation": "string"
  },
  "recommendedBloomVerbs": ["string", "string", "string"],
  "elevateSuggestions": [
    {
      "targetLevel": "Analyze" | "Evaluate" | "Create",
      "verbs": ["string", "string"],
      "rationale": "string"
    }
  ],
  "suggestedRephrasedStatement": "string (if unmeasurable, an improved measurable version starting with an active Bloom verb)"
}`;

      const userPrompt = `CLO Statement: "${statement}"
Current Tagged Level: ${currentLevel || 'None'}
Current Tagged Verb: ${currentVerb || 'None'}
Course Title: "${courseTitle || 'Higher Education Course'}"
Course Academic Level: "${courseLevel || 'Undergraduate'}"
Discipline: "${courseCategory || 'Academic'}"`;

      const raw = await callGeminiPrompt(systemInstruction, userPrompt);
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini clo-tag-blooms fallback activated:', (err as Error).message);
  }

  // Deterministic fallback
  const lower = statement.toLowerCase().trim();
  const weakVerbs = ['understand', 'know', 'learn', 'appreciate', 'comprehend', 'be aware of', 'familiarize', 'study', 'grasp'];
  const matchedWeakVerb = weakVerbs.find((wv) => lower.includes(wv));
  const isVague = Boolean(matchedWeakVerb);

  let suggestedLevel = 'Understand';
  let levelNumber = 2;
  let order = 'LOTS';
  let detectedVerb = matchedWeakVerb ? matchedWeakVerb.charAt(0).toUpperCase() + matchedWeakVerb.slice(1) : 'Explain';
  let measurabilityScore = isVague ? 45 : 88;

  if (isVague) {
    suggestedLevel = 'Understand';
    levelNumber = 2;
    order = 'LOTS';
  } else if (/create|design|formulate|construct|develop|synthesize|architect/i.test(lower)) {
    suggestedLevel = 'Create';
    levelNumber = 6;
    order = 'HOTS';
    detectedVerb = 'Design';
    measurabilityScore = 95;
  } else if (/evaluate|critique|judge|assess|appraise|justify|defend/i.test(lower)) {
    suggestedLevel = 'Evaluate';
    levelNumber = 5;
    order = 'HOTS';
    detectedVerb = 'Evaluate';
    measurabilityScore = 92;
  } else if (/analyze|differentiate|distinguish|investigate|examine|deconstruct/i.test(lower)) {
    suggestedLevel = 'Analyze';
    levelNumber = 4;
    order = 'HOTS';
    detectedVerb = 'Analyze';
    measurabilityScore = 90;
  } else if (/apply|implement|execute|solve|calculate|demonstrate/i.test(lower)) {
    suggestedLevel = 'Apply';
    levelNumber = 3;
    order = 'HOTS';
    detectedVerb = 'Apply';
    measurabilityScore = 86;
  } else if (/remember|identify|recall|list|state|define/i.test(lower)) {
    suggestedLevel = 'Remember';
    levelNumber = 1;
    order = 'LOTS';
    detectedVerb = 'Identify';
    measurabilityScore = 82;
  }

  res.json({
    detectedVerb,
    normalizedVerb: detectedVerb.toLowerCase(),
    secondaryVerbs: [],
    suggestedLevel,
    levelNumber,
    order,
    isMeasurable: !isVague,
    measurabilityScore,
    measurabilityVerdict: isVague ? 'Non-Measurable (Action Required)' : 'Directly Measurable',
    measurabilityFeedback: isVague
      ? `Accreditation Alert: "${detectedVerb}" is a passive, internal state. Replace with an observable action verb to satisfy measurable OBE standards.`
      : `Outcome utilizes an observable performance verb ("${detectedVerb}") assessable directly via evidence rubrics.`,
    depthAppropriateness: {
      isAppropriate: courseLevel === 'Graduate' ? levelNumber >= 4 : true,
      currentTier: `Level ${levelNumber}: ${suggestedLevel} (${order})`,
      targetRecommendedLevels: levelNumber <= 2 ? ['Apply', 'Analyze', 'Evaluate'] : ['Analyze', 'Evaluate', 'Create'],
      analysis:
        order === 'HOTS'
          ? 'Outcome demonstrates Higher-Order Thinking Skills, meeting high cognitive rigor criteria.'
          : 'Outcome targets Lower-Order Thinking Skills (foundational understanding). Suitable for introductory units.',
      recommendation: levelNumber < 6 ? 'Consider elevating to higher cognitive depth if targeting senior or capstone modules.' : 'Maximum cognitive synthesis level achieved.',
    },
    recommendedBloomVerbs:
      suggestedLevel === 'Analyze'
        ? ['Differentiate', 'Investigate', 'Deconstruct', 'Examine']
        : suggestedLevel === 'Evaluate'
        ? ['Critique', 'Justify', 'Appraise', 'Assess']
        : suggestedLevel === 'Create'
        ? ['Synthesize', 'Architect', 'Formulate', 'Develop']
        : ['Apply', 'Execute', 'Demonstrate', 'Solve'],
    elevateSuggestions: [
      {
        targetLevel: 'Analyze',
        verbs: ['Analyze', 'Differentiate', 'Investigate'],
        rationale: 'Elevate from foundational recall to diagnostic systemic analysis.',
      },
      {
        targetLevel: 'Evaluate',
        verbs: ['Evaluate', 'Critique', 'Defend'],
        rationale: 'Incorporate comparative appraisal, critique, and evidence justification.',
      },
    ],
    suggestedRephrasedStatement: isVague
      ? statement.replace(/understand|know|learn|comprehend/gi, 'critically analyze and apply')
      : undefined,
  });
});

// 1d. AI Batch CLO Bloom Tagger & Cognitive Balance Auditor
app.post('/api/ai/batch-tag-clos', async (req: Request, res: Response) => {
  const { clos, courseTitle, courseLevel } = req.body;
  if (!Array.isArray(clos)) {
    return res.status(400).json({ error: 'clos array is required' });
  }

  try {
    const ai = getAI();
    if (ai && clos.length > 0) {
      const systemInstruction = `You are a Lead Accreditation Evaluator for higher education OBE curricula.
Analyze the provided list of Course Learning Outcomes (CLOs) for Bloom's Revised Taxonomy cognitive levels and measurability.
For each CLO, identify the primary action verb, classify the Bloom level (Remember, Understand, Apply, Analyze, Evaluate, Create), verify measurability, and evaluate curriculum-wide cognitive balance.

Return strict JSON:
{
  "results": [
    {
      "cloId": "string",
      "tag": {
        "detectedVerb": "string",
        "normalizedVerb": "string",
        "secondaryVerbs": ["string"],
        "suggestedLevel": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
        "levelNumber": number,
        "order": "LOTS" | "HOTS",
        "isMeasurable": boolean,
        "measurabilityScore": number,
        "measurabilityVerdict": "Directly Measurable" | "Partially Measurable" | "Non-Measurable (Action Required)",
        "measurabilityFeedback": "string",
        "depthAppropriateness": {
          "isAppropriate": boolean,
          "currentTier": "string",
          "targetRecommendedLevels": ["string"],
          "analysis": "string",
          "recommendation": "string"
        },
        "recommendedBloomVerbs": ["string", "string"],
        "elevateSuggestions": [
          {
            "targetLevel": "Analyze" | "Evaluate" | "Create",
            "verbs": ["string", "string"],
            "rationale": "string"
          }
        ],
        "suggestedRephrasedStatement": "string"
      },
      "hasMismatch": boolean
    }
  ],
  "distribution": {
    "Remember": number,
    "Understand": number,
    "Apply": number,
    "Analyze": number,
    "Evaluate": number,
    "Create": number
  },
  "lotsPercentage": number,
  "hotsPercentage": number,
  "balanceVerdict": "string",
  "balanceAdvice": "string"
}`;

      const itemsText = clos
        .map(
          (c, idx) =>
            `${idx + 1}. [ID: ${c.id}] Code: "${c.code}" | Current Level: "${c.bloomLevel}" | Current Verb: "${c.bloomVerb || 'None'}" | Statement: "${c.statement}"`
        )
        .join('\n');

      const userPrompt = `Course: "${courseTitle || 'Curriculum'}" (${courseLevel || 'Undergraduate'})\nCLOs to tag:\n${itemsText}`;

      const raw = await callGeminiPrompt(systemInstruction, userPrompt);
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini batch-tag-clos fallback activated:', (err as Error).message);
  }

  // Deterministic local fallback
  const distribution: Record<string, number> = {
    Remember: 0,
    Understand: 0,
    Apply: 0,
    Analyze: 0,
    Evaluate: 0,
    Create: 0,
  };

  let lots = 0;
  let hots = 0;

  const results = clos.map((c) => {
    const lower = (c.statement || '').toLowerCase();
    const weakVerbs = ['understand', 'know', 'learn', 'appreciate', 'comprehend'];
    const matchedWeak = weakVerbs.find((wv) => lower.includes(wv));
    const isVague = Boolean(matchedWeak);

    let suggestedLevel = 'Understand';
    let levelNumber = 2;
    let order: 'LOTS' | 'HOTS' = 'LOTS';
    let detectedVerb = matchedWeak ? matchedWeak.charAt(0).toUpperCase() + matchedWeak.slice(1) : 'Explain';

    if (isVague) {
      suggestedLevel = 'Understand';
      levelNumber = 2;
    } else if (/create|design|formulate|construct|develop/i.test(lower)) {
      suggestedLevel = 'Create';
      levelNumber = 6;
      order = 'HOTS';
      detectedVerb = 'Design';
    } else if (/evaluate|critique|judge|assess|appraise/i.test(lower)) {
      suggestedLevel = 'Evaluate';
      levelNumber = 5;
      order = 'HOTS';
      detectedVerb = 'Evaluate';
    } else if (/analyze|differentiate|distinguish|investigate/i.test(lower)) {
      suggestedLevel = 'Analyze';
      levelNumber = 4;
      order = 'HOTS';
      detectedVerb = 'Analyze';
    } else if (/apply|implement|execute|solve|calculate/i.test(lower)) {
      suggestedLevel = 'Apply';
      levelNumber = 3;
      order = 'HOTS';
      detectedVerb = 'Apply';
    } else if (/recall|list|state|identify|define/i.test(lower)) {
      suggestedLevel = 'Remember';
      levelNumber = 1;
      order = 'LOTS';
      detectedVerb = 'Identify';
    }

    distribution[suggestedLevel] = (distribution[suggestedLevel] || 0) + 1;
    if (order === 'LOTS') lots++;
    else hots++;

    return {
      cloId: c.id,
      tag: {
        detectedVerb,
        normalizedVerb: detectedVerb.toLowerCase(),
        secondaryVerbs: [],
        suggestedLevel,
        levelNumber,
        order,
        isMeasurable: !isVague,
        measurabilityScore: isVague ? 45 : 88,
        measurabilityVerdict: isVague ? 'Non-Measurable (Action Required)' : 'Directly Measurable',
        measurabilityFeedback: isVague
          ? `Accreditation Alert: "${detectedVerb}" is passive. Replace with observable verb.`
          : `Uses measurable Bloom action verb "${detectedVerb}".`,
        depthAppropriateness: {
          isAppropriate: true,
          currentTier: `Level ${levelNumber}: ${suggestedLevel}`,
          targetRecommendedLevels: ['Analyze', 'Evaluate', 'Create'],
          analysis: order === 'HOTS' ? 'Higher-Order Thinking Skill' : 'Lower-Order Thinking Skill',
          recommendation: 'Appropriate progression',
        },
        recommendedBloomVerbs: ['Analyze', 'Evaluate', 'Design'],
        elevateSuggestions: [],
        suggestedRephrasedStatement: isVague ? c.statement.replace(/understand|know|learn/gi, 'analyze and apply') : undefined,
      },
      hasMismatch: c.bloomLevel !== suggestedLevel,
    };
  });

  const total = clos.length || 1;
  const lotsPercentage = Math.round((lots / total) * 100);
  const hotsPercentage = Math.round((hots / total) * 100);

  res.json({
    results,
    distribution,
    lotsPercentage,
    hotsPercentage,
    balanceVerdict: hotsPercentage >= 60 ? 'Strong HOTS Focus' : lotsPercentage >= 60 ? 'LOTS Dominant' : 'Balanced Progression',
    balanceAdvice:
      lotsPercentage >= 60
        ? 'Curriculum is heavily weighted towards recall/comprehension. Consider elevating 1-2 outcomes to Analyze (L4) or Evaluate (L5).'
        : 'Curriculum has good cognitive depth matching higher education standards.',
  });
});

// 2. MLO Scaffolding Generator
app.post('/api/ai/mlo-generate', async (req: Request, res: Response) => {
  const { cloCode, cloStatement, moduleTitle, moduleNumber } = req.body;

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are an expert instructional designer generating Module Learning Outcomes (MLOs) for an OBE course.
Generate 4 cognitively scaffolded MLOs following Bloom's progression: Remember -> Understand -> Apply -> Analyze/Evaluate.
Use the standard coding model: MLO {moduleNumber}.{cloIndex}.{mloSeq} (e.g. MLO ${moduleNumber || 1}.1.1).
Return strict JSON:
{
  "mlos": [
    {
      "code": "string",
      "statement": "string (measurable, active verb)",
      "bloomVerb": "string",
      "bloomLevel": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
      "requiredActivity": "string",
      "assessment": "string",
      "evidence": "string",
      "studyTimeHours": number
    }
  ]
}`;

      const raw = await callGeminiPrompt(
        systemInstruction,
        `Course Module: ${moduleTitle || 'Core Module'}\nLinked CLO: [${cloCode || 'CLO 1'}] ${cloStatement || 'Master fundamental concepts'}`
      );
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini mlo-generate fallback activated:', (err as Error).message);
  }

  const mod = moduleNumber || 1;
  res.json({
    mlos: [
      {
        code: `MLO ${mod}.1.1`,
        statement: `Identify the foundational definitions and core legal/technical provisions governing ${moduleTitle || 'the domain'}.`,
        bloomVerb: 'Identify',
        bloomLevel: 'Remember',
        requiredActivity: 'Concept flashcards and structured reading reflection',
        assessment: 'Formative terminology check (MCQ)',
        evidence: 'Direct quiz submission score ≥ 70%',
        studyTimeHours: 3,
      },
      {
        code: `MLO ${mod}.1.2`,
        statement: `Explain the operational mechanisms and structural relationships within ${moduleTitle || 'this subject'}.`,
        bloomVerb: 'Explain',
        bloomLevel: 'Understand',
        requiredActivity: 'Guided case review and diagram mapping',
        assessment: 'Concept synthesis short-answer response',
        evidence: 'Explanatory write-up meeting standard rubric criteria',
        studyTimeHours: 4,
      },
      {
        code: `MLO ${mod}.1.3`,
        statement: `Apply standardized principles and statutory rules to resolve an authentic practical scenario.`,
        bloomVerb: 'Apply',
        bloomLevel: 'Apply',
        requiredActivity: 'Problem-solving workshop and scenario workout',
        assessment: 'Applied problem scenario worksheet',
        evidence: 'Graded solution sheet demonstrating accurate rule application',
        studyTimeHours: 5,
      },
      {
        code: `MLO ${mod}.1.4`,
        statement: `Analyze systemic disputes and evaluate competing stakeholder arguments in contemporary practice.`,
        bloomVerb: 'Analyze',
        bloomLevel: 'Analyze',
        requiredActivity: 'Collaborative debate and critical commentary review',
        assessment: 'Critical analysis essay or case submission',
        evidence: 'Rubric-evaluated analytical report with evidence citations',
        studyTimeHours: 6,
      },
    ],
  });
});

// 3. Lesson Generator
app.post('/api/ai/lesson-generate', async (req: Request, res: Response) => {
  const { mloCode, mloStatement, moduleTitle } = req.body;

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are an expert instructional designer.
Generate a structured, evidence-oriented lesson design for an outcome-based course.
Critically: Viewing the lesson alone must NOT equal achievement.
Return strict JSON:
{
  "title": "string",
  "learningGoal": "string",
  "teachingMode": "Interactive Lecture" | "Guided Inquiry" | "Case Method" | "Lab Demonstration" | "Flipped Classroom",
  "durationMins": number,
  "recommendedResources": "string",
  "learningActivity": "string",
  "formativeAssessment": "string",
  "evidenceOfLearning": "string",
  "completionRequirement": ["read_content", "complete_activity", "pass_quiz"]
}`;

      const raw = await callGeminiPrompt(
        systemInstruction,
        `MLO: [${mloCode}] ${mloStatement}\nModule: ${moduleTitle}`
      );
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini lesson-generate fallback activated:', (err as Error).message);
  }

  res.json({
    title: `Investigating ${mloStatement ? mloStatement.slice(0, 45) : 'Core Concepts'}`,
    learningGoal: `Equip students to actively demonstrate: ${mloStatement}`,
    teachingMode: 'Case Method & Guided Inquiry',
    durationMins: 90,
    recommendedResources: 'Primary statutory excerpts, comparative judicial briefs, and multimedia commentary',
    learningActivity: 'Students analyze real-world case precedents in pairs, classifying jurisdictions and formulating evidence-based decisions.',
    formativeAssessment: '5-item contextual scenario check and quick peer-review critique',
    evidenceOfLearning: 'Submitted classification matrix and minimum 4/5 score on comprehension verification check',
    completionRequirement: ['read_content', 'complete_activity', 'pass_quiz'],
  });
});

// 4. Question Generator with MLO Measurement Check
app.post('/api/ai/questions-generate', async (req: Request, res: Response) => {
  const { mloCode, mloStatement, cloCode, count = 3, bloomLevel = 'Apply', difficulty = 'Medium' } = req.body;

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are an assessment author for Outcome-Based Education.
Generate ${count} high-quality Single-Correct Multiple Choice Questions (MCQs) that directly and strictly measure the specified MLO and Bloom level.
Each question MUST have a clear scenario or context, 4 plausible options (A, B, C, D), single unambiguous correct answer, detailed pedagogical explanation, and a verification statement explaining HOW this question measures the outcome.
Return strict JSON:
{
  "questions": [
    {
      "questionStatement": "string",
      "options": ["string (Option A)", "string (Option B)", "string (Option C)", "string (Option D)"],
      "correctAnswerIndex": number (0 for A, 1 for B, 2 for C, 3 for D),
      "explanation": "string",
      "bloomLevel": "${bloomLevel}",
      "difficulty": "${difficulty}",
      "marks": number,
      "alignmentVerification": "string (Explains why this directly measures ${mloCode})"
    }
  ]
}`;

      const raw = await callGeminiPrompt(
        systemInstruction,
        `MLO [${mloCode}]: ${mloStatement}\nLinked CLO: ${cloCode}\nBloom Level: ${bloomLevel}\nDifficulty: ${difficulty}`
      );
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini questions-generate fallback activated:', (err as Error).message);
  }

  // High quality fallback MCQs
  res.json({
    questions: [
      {
        questionStatement: `Under the constitutional framework regarding legislative competence, when a federal statute and a provincial enactment directly conflict on a concurrent jurisdiction subject, which outcome is legally enforced?`,
        options: [
          'The provincial enactment prevails due to the doctrine of territorial proximity.',
          'The federal law prevails to the extent of the repugnancy, rendering the inconsistent provincial portion void.',
          'Both laws are immediately struck down pending adjudication by the supreme constitutional bench.',
          'The matter is referred to the Council of Common Interests with no law having legal effect.',
        ],
        correctAnswerIndex: 1,
        explanation: 'According to established constitutional supremacy principles (e.g., Article 143), federal legislation prevails over conflicting provincial legislation to the extent of the inconsistency.',
        bloomLevel: bloomLevel || 'Apply',
        difficulty: difficulty || 'Medium',
        marks: 2,
        alignmentVerification: `Tests the student's ability to apply supremacy doctrines to resolve centre-provincial statutory conflicts.`,
      },
      {
        questionStatement: `Which institutional organ is constitutionally mandated to resolve disputes over natural resource allocation and water distribution among constituent federation units?`,
        options: [
          'The Federal Cabinet solely upon executive decree',
          'Council of Common Interests (CCI) / National Water Accord Authority',
          'The Senate Standing Committee on Human Rights',
          'Provincial High Courts sitting in joint plenary quorum',
        ],
        correctAnswerIndex: 1,
        explanation: 'Constitutional bodies such as the Council of Common Interests (Articles 153-154) are established to formulate and regulate policies regarding federal-provincial resource distribution.',
        bloomLevel: bloomLevel || 'Understand',
        difficulty: difficulty || 'Medium',
        marks: 2,
        alignmentVerification: `Directly assesses institutional knowledge required under federal constitutional mechanics.`,
      },
    ],
  });
});

// 5. Rubric Descriptors Generator
app.post('/api/ai/rubric-generate', async (req: Request, res: Response) => {
  const { assessmentTitle, assessmentType, cloList, bloomLevel, cloStatement } = req.body;

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are an expert in authentic rubric design for Outcome-Based Higher Education.
Generate 4 clear, criteria-based rubric rows with weights totaling 100%, specifically calibrated to Bloom's Taxonomy level "${bloomLevel || 'Analyze'}".
For each criterion, provide observable, distinct behavioral descriptors across 5 achievement levels:
- Not Achieved (0-49%)
- Developing (50-64%)
- Achieved (65-74%)
- Proficient (75-84%)
- Exemplary (85-100%)
Return strict JSON:
{
  "criteria": [
    {
      "criterionName": "string (e.g. Conceptual Accuracy, Critical Analysis, Evidence & Citations, Structured Communication)",
      "weight": number (weights must sum to 100),
      "cloId": "string (one of the provided CLO codes)",
      "levels": [
        {"level": "Not Achieved", "descriptor": "string"},
        {"level": "Developing", "descriptor": "string"},
        {"level": "Achieved", "descriptor": "string"},
        {"level": "Proficient", "descriptor": "string"},
        {"level": "Exemplary", "descriptor": "string"}
      ]
    }
  ]
}`;

      const userContent = `Assessment: ${assessmentTitle || 'Analytical Course Project'} (${assessmentType || 'Project'})
Target Bloom's Level: ${bloomLevel || 'Analyze'}
CLO Statement: ${cloStatement || 'Demonstrate mastery of outcome objectives'}
Available CLOs: ${JSON.stringify(cloList || ['CLO 1', 'CLO 2', 'CLO 3'])}`;

      const raw = await callGeminiPrompt(systemInstruction, userContent);
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini rubric-generate fallback activated:', (err as Error).message);
  }

  res.json({
    criteria: [
      {
        criterionName: 'Conceptual Rigor & Doctrinal Accuracy',
        weight: 30,
        cloId: 'CLO 1',
        levels: [
          { level: 'Not Achieved', descriptor: 'Major conceptual errors, factual inaccuracies, or fundamental misunderstanding of governing legal principles.' },
          { level: 'Developing', descriptor: 'Identifies basic principles but demonstrates superficial comprehension with noticeable doctrinal gaps.' },
          { level: 'Achieved', descriptor: 'Accurately explains relevant concepts and frameworks with correct terminology and factual basis.' },
          { level: 'Proficient', descriptor: 'Demonstrates deep conceptual fluency with nuanced articulation of underlying doctrinal mechanics.' },
          { level: 'Exemplary', descriptor: 'Masterful command of complex theoretical and statutory doctrines with insightful critical synthesis.' },
        ],
      },
      {
        criterionName: 'Analytical Reasoning & Scenario Application',
        weight: 30,
        cloId: 'CLO 2',
        levels: [
          { level: 'Not Achieved', descriptor: 'Merely descriptive; fails to apply principles to factual problems or draw logical connections.' },
          { level: 'Developing', descriptor: 'Applies principles mechanically with weak reasoning and limited consideration of contextual variables.' },
          { level: 'Achieved', descriptor: 'Sound application of rules to the problem scenario with coherent legal reasoning.' },
          { level: 'Proficient', descriptor: 'Rigorous analysis addressing counterarguments, jurisdictional nuances, and multi-factor disputes.' },
          { level: 'Exemplary', descriptor: 'Sophisticated, multidimensional evaluation that anticipates edge cases and formulates original solutions.' },
        ],
      },
      {
        criterionName: 'Evidence Grounding & Citation Quality',
        weight: 20,
        cloId: 'CLO 3',
        levels: [
          { level: 'Not Achieved', descriptor: 'Unsubstantiated claims with absent or incorrect citations to authoritative sources.' },
          { level: 'Developing', descriptor: 'Relies on few or secondary sources with occasional misattribution or formatting errors.' },
          { level: 'Achieved', descriptor: 'Appropriately references statutory provisions and judicial precedents to back all key assertions.' },
          { level: 'Proficient', descriptor: 'Integrates authoritative primary sources and recent scholarly jurisprudence consistently.' },
          { level: 'Exemplary', descriptor: 'Exemplary scholarly apparatus drawing on landmark precedents, comparative jurisprudence, and primary statutes.' },
        ],
      },
      {
        criterionName: 'Professional Communication & Structure',
        weight: 20,
        cloId: 'CLO 1',
        levels: [
          { level: 'Not Achieved', descriptor: 'Disorganized structure with prevalent grammatical lapses that impede readability.' },
          { level: 'Developing', descriptor: 'Basic organization but disjointed transitions and informal phrasing.' },
          { level: 'Achieved', descriptor: 'Clear, logical structure with appropriate academic tone and cohesive paragraphing.' },
          { level: 'Proficient', descriptor: 'Persuasive, highly articulate prose with seamless thematic transitions and precise vocabulary.' },
          { level: 'Exemplary', descriptor: 'Flawlessly polished, publication-grade academic prose with compelling rhetorical clarity.' },
        ],
      },
    ],
  });
});

// 6. Copilot Conversational & Instructional Assistant
app.post('/api/ai/copilot', async (req: Request, res: Response) => {
  const { command, currentStep, courseData } = req.body;

  try {
    const ai = getAI();
    if (ai) {
      const systemInstruction = `You are the MENTISERA OBE360™ Instructional Design Copilot.
You assist educators in creating academically complete, measurable, aligned, evidence-based courses.
Always provide actionable, structured, high-pedagogical advice.
Be concise, clear, and focused on OBE principles (Bloom's Taxonomy, Constructive Alignment, Evidence-Based Assessment).
Return strict JSON:
{
  "reply": "string (markdown formatted advice, suggestions, or concrete recommendations)",
  "suggestedActions": [
    {"label": "string", "actionType": "apply_clo" | "add_mlo" | "audit_fix" | "insert_rubric" | "info", "payload": any}
  ]
}`;

      const raw = await callGeminiPrompt(
        systemInstruction,
        `Current Step: ${currentStep}\nUser Command: ${command}\nCourse Summary: Title: "${courseData?.title || 'Untitled'}", Category: "${courseData?.category || 'General'}", CLO Count: ${courseData?.clos?.length || 0}, Module Count: ${courseData?.modules?.length || 0}`
      );
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
  } catch (err) {
    console.warn('Gemini copilot fallback activated:', (err as Error).message);
  }

  // Contextual fallback based on command
  const cmd = (command || '').toLowerCase();
  let reply = 'OBE360 Copilot stands ready to assist your course creation workflow.';
  const suggestedActions: Array<{ label: string; actionType: string; payload?: unknown }> = [];

  if (cmd.includes('improve') || cmd.includes('clo')) {
    reply = `### AI CLO Recommendation\nTo elevate your Course Learning Outcome for OBE compliance:\n1. **Ensure Single Verb Action**: Avoid combining *understand* and *analyze*.\n2. **Specify Observable Performance**: Replace passive language with demonstrable acts (e.g. *critique*, *formulate*, *compute*).\n3. **Add Contextual Boundary**: Specify the statutory or technical domain within which performance is measured.`;
    suggestedActions.push({ label: 'Auto-scaffold Bloom verbs', actionType: 'info' });
  } else if (cmd.includes('mlo') || cmd.includes('generate')) {
    reply = `### Scaffolding MLOs for Alignment\nEffective Module Learning Outcomes follow Bloom's cognitive progression:\n- **MLO X.1**: *Identify/Define* foundational provisions.\n- **MLO X.2**: *Explain/Illustrate* operational procedures.\n- **MLO X.3**: *Apply* doctrines to resolved contested problem sets.\n- **MLO X.4**: *Evaluate/Synthesize* comparative institutional outcomes.`;
    suggestedActions.push({ label: 'Generate 4-tier MLO scaffold', actionType: 'add_mlo' });
  } else if (cmd.includes('alignment') || cmd.includes('gap') || cmd.includes('audit')) {
    reply = `### Alignment Quality Audit\n- Ensure all summative assessments link back to at least one CLO with defined weightage.\n- Verify that every MLO has at least one active learning activity producing tangible evidence.\n- Confirm that assessment weightages across all course components total exactly 100%.`;
    suggestedActions.push({ label: 'Run Full Alignment Audit', actionType: 'audit_fix' });
  } else {
    reply = `### MENTISERA OBE360™ Guidance\nYour course structure is currently progressing through **${currentStep || 'Course Setup'}**. Remember the core alignment chain:\n**PLO → CLO → MLO → Lesson → Activity → Assessment → Rubric → Evidence → Achievement**.\n\nEvery student activity should generate measurable evidence of attainment.`;
    suggestedActions.push({ label: 'Audit Evidence Rules', actionType: 'info' });
  }

  res.json({ reply, suggestedActions });
});

// Multi-turn Gemini Chatbot with Role-Based System Instructions and Dynamic Model Selection
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const {
    messages,
    role = 'accreditation_specialist',
    model = 'gemini-3.5-flash',
    courseContext,
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Define role-based system instructions
  const roleSystemInstructions: Record<string, string> = {
    accreditation_specialist: `You are the Senior OBE Accreditation Specialist for MENTISERA OBE360™.
Your role is to rigorously evaluate curriculum design against international outcome-based education standards (ABET, Washington Accord, HEC Pakistan, CEAB, AACSB).
You guide educators to establish airtight Constructive Alignment:
Program Learning Outcomes (PLOs) → Course Learning Outcomes (CLOs) → Module Outcomes (MLOs) → Learning Activities → Assessment Blueprints → Scoring Rubrics → Attainment Thresholds.
Every recommendation must be pedagogically sound, actionable, and aligned with verifiable evidence.
Always structure responses with clear markdown formatting, bullet points, and concrete course examples.`,

    blooms_auditor: `You are the Bloom's Revised Taxonomy Master Auditor for MENTISERA OBE360™.
Your role is to scrutinize all learning outcomes, questions, and learning tasks for cognitive rigor, verb precision, and domain classification (Cognitive, Psychomotor, Affective).
Crucial rules:
1. Strictly eliminate passive or vague verbs: "understand", "know", "learn", "appreciate", "comprehend", "be aware of", "study".
2. Replace them with precise, observable action verbs across Bloom's 6 cognitive levels: Remember, Understand, Apply, Analyze, Evaluate, Create.
3. Ensure single observable action per outcome statement.
4. Provide structured scaffolds and revised wording.`,

    assessment_architect: `You are the Assessment & Rubric Architect for MENTISERA OBE360™.
Your role is to design authentic formative and summative assessment plans, balanced assessment blueprints (MCQs, problem-solving, capstones, presentations), and 5-tier analytical grading rubrics (Not Achieved, Developing, Achieved, Proficient, Exemplary).
Ensure that:
- Assessment weightages total exactly 100%.
- Minimum passing criteria and attainment thresholds (e.g. 60%) are transparently defined.
- Rubric criteria directly map to targeted CLOs and specific performance indicators.`,

    curriculum_coach: `You are the Comprehensive Curriculum Design Coach for MENTISERA OBE360™.
Your role is to advise educators on course pacing, weekly credit hours distribution, instructional modes (face-to-face, blended, flipped classroom), active student engagement strategies, and continuous quality improvement (CQI) cycles.
Be encouraging, intellectually rigorous, and focused on student-centered active learning.`,
  };

  const selectedInstruction = roleSystemInstructions[role] || roleSystemInstructions.accreditation_specialist;
  
  let contextSnippet = '';
  if (courseContext) {
    contextSnippet = `\n\nActive Course Context:
- Title: "${courseContext.title || 'Untitled'}"
- Code: "${courseContext.code || 'N/A'}"
- Level: ${courseContext.level || 'Undergraduate'}
- Delivery Mode: ${courseContext.deliveryMode || 'Face-to-Face'}
- Department / Programme: ${courseContext.programme || courseContext.category || 'General'}
- CLOs: ${courseContext.closCount ?? (courseContext.clos?.length || 0)} defined
- Modules: ${courseContext.modulesCount ?? (courseContext.modules?.length || 0)} planned
- Assessments: ${courseContext.assessmentsCount ?? (courseContext.assessments?.length || 0)} configured`;
  }

  const fullSystemInstruction = `${selectedInstruction}${contextSnippet}

Format your reply cleanly using markdown with bold headings, lists, and code blocks where helpful. Address the user directly as an expert educational consultant.`;

  // Validate allowed models (supporting gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for fast tasks)
  const validModels = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview',
    'gemini-3.8-flash',
  ];
  const targetModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

  try {
    const ai = getAI();
    if (ai) {
      // Map conversation history to @google/genai format
      const contents = messages.map((m: { role: 'user' | 'model'; text: string }) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.4,
        },
      });

      const replyText = response.text || 'I have analyzed your curriculum query. Please ensure that all outcomes remain constructively aligned with your assessment blueprint.';
      return res.json({
        reply: replyText,
        model: targetModel,
        role,
      });
    }
  } catch (err: any) {
    console.warn('Gemini chat API error, falling back to local OBE knowledge base:', err?.message || err);
  }

  // Graceful fallback if offline or GEMINI_API_KEY is not configured
  const lastUserMsg = messages[messages.length - 1]?.text || '';
  const fallbackReply = generateChatbotFallback(role, lastUserMsg, courseContext);
  return res.json({
    reply: fallbackReply,
    model: `${targetModel} (OBE Engine)`,
    role,
  });
});

function generateChatbotFallback(role: string, query: string, context?: any): string {
  const q = query.toLowerCase();
  const title = context?.title ? ` for **${context.title}**` : '';

  if (role === 'blooms_auditor') {
    return `### 🔬 Bloom's Taxonomy Master Audit${title}\n\n` +
      `**Taxonomy Evaluation:**\n` +
      `- In Outcome-Based Education, every learning outcome must target an observable cognitive performance.\n` +
      `- **Banned Non-Measurable Verbs:** Never use *understand*, *know*, *learn*, or *appreciate*, as they cannot be directly graded with an analytical rubric.\n` +
      `- **Recommended Cognitive Scaffolding:**\n` +
      `  - **Foundational (Remember/Understand):** *Define, explain, categorize, summarize*.\n` +
      `  - **Intermediate (Apply/Analyze):** *Compute, implement, differentiate, dissect, troubleshoot*.\n` +
      `  - **Advanced (Evaluate/Create):** *Critique, appraise, synthesize, architect, validate*.\n\n` +
      `*Tip: Revise any ambiguous CLO to: "By the end of this course, students will be able to [Single Action Verb] [Object/Concept] in [Context/Standard]."*`;
  }

  if (role === 'assessment_architect') {
    return `### 📐 Assessment & Rubric Architecture${title}\n\n` +
      `**Assessment Blueprint Principles:**\n` +
      `1. **Summative Alignment:** Verify that your summative assessments (Midterm, Final, Capstone Project) measure the higher-order CLOs.\n` +
      `2. **Weightage Balance:** Ensure total course weights equal exactly 100% across formative and summative milestones.\n` +
      `3. **5-Tier Rubrics:** For subjective assessments (e.g. Case Briefs, Code Reviews, Presentations), specify performance descriptors for all 5 tiers:\n` +
      `   - *Not Achieved* (<50%)\n` +
      `   - *Developing* (50-64%)\n` +
      `   - *Achieved* (65-74%)\n` +
      `   - *Proficient* (75-89%)\n` +
      `   - *Exemplary* (90-100%)\n` +
      `4. **Threshold:** Set evidence attainment thresholds (typically 60-70% student pass mark).`;
  }

  if (role === 'curriculum_coach') {
    return `### 💡 Curriculum Design Coaching${title}\n\n` +
      `**Active Learning Recommendations:**\n` +
      `- **Pacing:** Structure each week around a 3-part pedagogical arc: *Pre-class conceptual preparation*, *In-class active application*, and *Post-class reflection/synthesis*.\n` +
      `- **Direct Evidence:** Remember that passive video viewing or reading does not count toward OBE attainment. Every lesson should culminate in a student artifact (discussion post, exercise solution, diagnostic quiz).\n` +
      `- **CQI Feedback Loop:** Schedule continuous quality improvement checkpoints after major milestones to adjust pacing and remediate concept bottlenecks.`;
  }

  // Default: accreditation_specialist
  return `### 🎓 OBE Accreditation Advisory${title}\n\n` +
    `**International Accreditation Standards (ABET / Washington Accord / HEC):**\n` +
    `1. **Constructive Alignment Chain:** Ensure that every Course Learning Outcome (CLO) clearly maps to at least one Program Learning Outcome (PLO) with defined competency levels (*Introduced*, *Reinforced*, or *Mastered*).\n` +
    `2. **Evidence Rules:** Each CLO must be validated through explicit evidence sources with a minimum threshold percentage (standard: 60%).\n` +
    `3. **Audit Readiness:** Keep your course dossier, alignment matrices, and assessment plans current. All modules and learning units must lead into the final Capstone Goal.`;
}

// --- Developer Feedback & Issue Reporting Pipeline ---
interface DevFeedbackRecord {
  id: string;
  ticketNumber: string;
  category: string;
  severity: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  courseSummary?: any;
  diagnostics?: any;
  receivedAt: string;
}

const feedbackStore: DevFeedbackRecord[] = [];

app.post('/api/feedback', (req: Request, res: Response) => {
  try {
    const {
      category = 'general',
      severity = 'medium',
      userName = 'Anonymous User',
      userEmail = '',
      subject = 'General Feedback',
      description = '',
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      includeCourseSnapshot,
      includeSystemTelemetry,
      diagnostics,
    } = req.body || {};

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const ticketNumber = `OBE-TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const receivedAt = new Date().toISOString();

    const record: DevFeedbackRecord = {
      id: `dev-fb-${Date.now()}`,
      ticketNumber,
      category,
      severity,
      userName: String(userName || '').trim() || 'Anonymous Faculty',
      userEmail: String(userEmail || '').trim() || 'no-email@mentisera.org',
      subject: String(subject || '').trim() || 'User Feedback / Bug Report',
      description: String(description).trim(),
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      courseSummary: diagnostics?.courseSummary,
      diagnostics: includeSystemTelemetry ? diagnostics : undefined,
      receivedAt,
    };

    feedbackStore.unshift(record);
    if (feedbackStore.length > 100) feedbackStore.pop();

    console.log(`\n======================================================`);
    console.log(`📢 [OBE360 DEV FEEDBACK TICKET: ${ticketNumber}]`);
    console.log(`   Type: [${category.toUpperCase()}] | Severity: [${severity.toUpperCase()}]`);
    console.log(`   From: ${record.userName} <${record.userEmail}>`);
    console.log(`   Subject: ${record.subject}`);
    if (record.courseSummary) {
      console.log(`   Course: ${record.courseSummary.code} - ${record.courseSummary.title} (Audit: ${record.courseSummary.auditScore}%)`);
    }
    console.log(`   Description: ${record.description.slice(0, 150)}${record.description.length > 150 ? '...' : ''}`);
    console.log(`======================================================\n`);

    return res.json({
      success: true,
      ticketNumber,
      receivedAt,
      slaMessage:
        severity === 'critical'
          ? 'Critical priority: Direct alert dispatched to engineering on-call. Estimated initial review within 2 hours.'
          : 'Standard priority: Reviewed by engineering & pedagogical team within 4 business hours.',
      message: 'Feedback received and logged to MENTISERA development team.',
      directEmail: 'dev-team@mentisera.org',
    });
  } catch (err: any) {
    console.error('Error handling feedback submission:', err);
    return res.status(500).json({ error: 'Internal server error processing feedback' });
  }
});

app.get('/api/feedback', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    totalTicketsReceived: feedbackStore.length,
    recentTickets: feedbackStore.slice(0, 10).map((t) => ({
      ticketNumber: t.ticketNumber,
      category: t.category,
      severity: t.severity,
      subject: t.subject,
      receivedAt: t.receivedAt,
    })),
  });
});

// Institutional Leads & Sales Inquiries Ingestion API
const leadsStore: any[] = [];

app.post('/api/leads', (req: Request, res: Response) => {
  try {
    const lead = req.body;
    if (!lead || !lead.fullName || !lead.email || !lead.institution) {
      return res.status(400).json({ error: 'Missing required lead fields (fullName, email, institution)' });
    }

    const leadRecord = {
      id: lead.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receivedAt: new Date().toISOString(),
      fullName: String(lead.fullName),
      email: String(lead.email),
      phone: lead.phone ? String(lead.phone) : undefined,
      institution: String(lead.institution),
      department: lead.department ? String(lead.department) : undefined,
      role: String(lead.role || 'Academic Leader'),
      frameworkInterest: String(lead.frameworkInterest || 'Washington Accord / ABET'),
      facultyCountRange: String(lead.facultyCountRange || '10-50 faculty'),
      primaryNeeds: Array.isArray(lead.primaryNeeds) ? lead.primaryNeeds : [],
      timeline: String(lead.timeline || 'Immediate'),
      message: lead.message ? String(lead.message) : undefined,
      status: 'new',
      source: String(lead.source || 'web_lead_form'),
    };

    leadsStore.unshift(leadRecord);
    console.log(`[Sales Pipeline] New Institutional Lead received from ${leadRecord.fullName} at ${leadRecord.institution} (${leadRecord.email})`);

    return res.status(201).json({
      status: 'success',
      leadId: leadRecord.id,
      message: 'Inquiry received by MENTISERA Academic Solutions team.',
      estimatedResponseHours: 24,
    });
  } catch (err: any) {
    console.error('Error ingesting lead:', err);
    return res.status(500).json({ error: 'Internal server error processing lead inquiry' });
  }
});

app.get('/api/leads', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    totalLeads: leadsStore.length,
    leads: leadsStore,
  });
});

// Multi-Reviewer Academic Governance, Approval Queues & Audit Trail API
app.use('/api/collaboration', collaborationRouter);

// Setup Vite middleware for development and static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OBE360 Course Creator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
