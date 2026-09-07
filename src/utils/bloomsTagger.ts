import { BloomLevel, CourseLevel, CLO } from '../types';
import { BLOOM_TAXONOMY_DATA, VERBS_TO_AVOID } from '../components/CourseCreator/BloomsTaxonomyHelperModal';

export interface BloomVerbMatch {
  verb: string;
  level: BloomLevel;
  levelNumber: number;
  order: 'LOTS' | 'HOTS';
  category: string;
  isPrimary: boolean;
}

export interface CognitiveDepthAssessment {
  levelNumber: number; // 1 to 6
  order: 'LOTS' | 'HOTS';
  tierLabel: string;
  isAppropriateForCourseLevel: boolean;
  courseLevel: string;
  advice: string;
  targetRecommendedLevels: BloomLevel[];
  canElevate: boolean;
  elevateSuggestions: Array<{
    targetLevel: BloomLevel;
    verbs: string[];
    rationale: string;
  }>;
}

export interface CLOTaggerResult {
  detectedVerb: string;
  normalizedVerb: string;
  secondaryVerbs: string[];
  suggestedLevel: BloomLevel;
  levelNumber: number;
  order: 'LOTS' | 'HOTS';
  isMeasurable: boolean;
  measurabilityScore: number; // 0 to 100
  measurabilityVerdict: 'Directly Measurable' | 'Partially Measurable' | 'Non-Measurable (Action Required)';
  measurabilityFeedback: string;
  vagueVerbIssue?: {
    vagueVerb: string;
    problem: string;
    recommendedSubstitutes: string[];
  };
  cognitiveDepth: CognitiveDepthAssessment;
  hasMultipleVerbs: boolean;
  compoundVerbWarning?: string;
  recommendedBloomVerbs: string[];
  suggestedRephrasedStatement?: string;
}

// Build a fast lookup map of lowercase verb -> BloomLevel & metadata
const VERB_TO_LEVEL_MAP: Map<string, { level: BloomLevel; category: string; order: 'LOTS' | 'HOTS'; levelNumber: number }> = new Map();

(Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).forEach((level) => {
  const detail = BLOOM_TAXONOMY_DATA[level];
  detail.categories.forEach((cat) => {
    cat.verbs.forEach((v) => {
      const lower = v.toLowerCase();
      if (!VERB_TO_LEVEL_MAP.has(lower)) {
        VERB_TO_LEVEL_MAP.set(lower, {
          level,
          category: cat.name,
          order: detail.order,
          levelNumber: detail.number,
        });
      }
    });
  });
});

// Common English verb forms mapping (lemmatization)
const VERB_LEMMATIZATION_MAP: Record<string, string> = {
  analyzing: 'analyze',
  analyzes: 'analyze',
  analysed: 'analyze',
  evaluating: 'evaluate',
  evaluates: 'evaluate',
  evaluated: 'evaluate',
  designing: 'design',
  designs: 'design',
  designed: 'design',
  creating: 'create',
  creates: 'create',
  created: 'create',
  applying: 'apply',
  applies: 'apply',
  applied: 'apply',
  calculating: 'calculate',
  calculates: 'calculate',
  calculated: 'calculate',
  solving: 'solve',
  solves: 'solve',
  solved: 'solve',
  implementing: 'implement',
  implements: 'implement',
  implemented: 'implement',
  executing: 'execute',
  executes: 'execute',
  executed: 'execute',
  critiquing: 'critique',
  critiques: 'critique',
  critiqued: 'critique',
  differentiating: 'differentiate',
  differentiates: 'differentiate',
  differentiated: 'differentiate',
  distinguishing: 'distinguish',
  distinguishes: 'distinguish',
  distinguished: 'distinguish',
  identifying: 'identify',
  identifies: 'identify',
  identified: 'identify',
  defining: 'define',
  defines: 'define',
  defined: 'define',
  explaining: 'explain',
  explains: 'explain',
  explained: 'explain',
  interpreting: 'interpret',
  interprets: 'interpret',
  interpreted: 'interpret',
  summarizing: 'summarize',
  summarizes: 'summarize',
  summarized: 'summarize',
  synthesizing: 'synthesize',
  synthesizes: 'synthesize',
  synthesized: 'synthesize',
  formulating: 'formulate',
  formulates: 'formulate',
  formulated: 'formulate',
  developing: 'develop',
  develops: 'develop',
  developed: 'develop',
  assessing: 'assess',
  assesses: 'assess',
  assessed: 'assess',
  justifying: 'justify',
  justifies: 'justify',
  justified: 'justify',
  demonstrating: 'demonstrate',
  demonstrates: 'demonstrate',
  demonstrated: 'demonstrate',
  investigating: 'investigate',
  investigates: 'investigate',
  investigated: 'investigate',
  understanding: 'understand',
  understands: 'understand',
  understood: 'understand',
  knowing: 'know',
  knows: 'know',
  known: 'know',
  learning: 'learn',
  learns: 'learn',
  learned: 'learn',
  appreciating: 'appreciate',
  appreciates: 'appreciate',
  comprehending: 'comprehend',
  comprehends: 'comprehend',
};

// Non-measurable / vague verb patterns
const VAGUE_VERB_ROOTS: Array<{
  root: string;
  problem: string;
  substitutes: string[];
}> = [
  {
    root: 'understand',
    problem: 'Internal cognitive state; cannot be directly observed or graded on an assessment rubric without observable performance.',
    substitutes: ['Explain', 'Analyze', 'Interpret', 'Demonstrate', 'Classify'],
  },
  {
    root: 'know',
    problem: 'Passive state of memory; lacks demonstrable evidence of student competence.',
    substitutes: ['Identify', 'Define', 'Recall', 'List', 'State'],
  },
  {
    root: 'learn',
    problem: 'Refers to the process of studying rather than the resulting measurable skill or performance standard.',
    substitutes: ['Apply', 'Execute', 'Solve', 'Implement', 'Formulate'],
  },
  {
    root: 'appreciate',
    problem: 'Subjective emotional response or disposition; non-assessable in standardized outcome rubrics.',
    substitutes: ['Evaluate', 'Critique', 'Appraise', 'Justify', 'Assess'],
  },
  {
    root: 'familiar',
    problem: 'Vague mastery boundary; does not define what observable threshold of performance is expected.',
    substitutes: ['Describe', 'Outline', 'Summarize', 'Differentiate'],
  },
  {
    root: 'comprehend',
    problem: 'Synonym of understand; fails OBE standard requirement for observable student evidence.',
    substitutes: ['Paraphrase', 'Illustrate', 'Interpret', 'Explain'],
  },
  {
    root: 'study',
    problem: 'Describes student activity rather than mastered demonstrable learning outcome.',
    substitutes: ['Investigate', 'Analyze', 'Examine', 'Evaluate'],
  },
  {
    root: 'grasp',
    problem: 'Colloquial metaphor; accreditation boards demand rigorous operational verbs.',
    substitutes: ['Synthesize', 'Explain', 'Apply', 'Dissect'],
  },
  {
    root: 'gain insight',
    problem: 'Abstract metaphor; does not generate demonstrable, auditable evidence.',
    substitutes: ['Investigate', 'Diagnose', 'Scrutinize', 'Critique'],
  },
  {
    root: 'be aware',
    problem: 'Unobservable awareness; incapable of being tested via authentic performance tasks.',
    substitutes: ['Identify', 'Recognize', 'Outline', 'State'],
  },
];

/**
 * Strips leading academic preamble and extracts the core verb phrase
 */
export function cleanCLOStatementPreamble(statement: string): { cleaned: string; preambleRemoved: string } {
  const original = statement.trim();
  
  // Standard syllabus preambles
  const preamblePatterns = [
    /^(by the end of (the|this) (course|unit|module|program),?\s*(the\s*)?students?\s+(will\s+)?(be\s+able\s+to\s+)?)/i,
    /^(upon (successful\s+)?completion of (this|the) (course|unit|module),?\s*(the\s*)?students?\s+(will\s+)?(be\s+able\s+to\s+)?)/i,
    /^(the\s+)?students?\s+(will\s+)?(be\s+able\s+to\s+)/i,
    /^(the\s+)?students?\s+(will\s+)?/i,
    /^(the\s+)?learners?\s+(will\s+)?(be\s+able\s+to\s+)?/i,
    /^(participants\s+(will\s+)?(be\s+able\s+to\s+)?)/i,
    /^(able\s+to\s+)/i,
    /^(to\s+)/i,
  ];

  for (const pattern of preamblePatterns) {
    const match = original.match(pattern);
    if (match) {
      return {
        cleaned: original.slice(match[0].length).trim(),
        preambleRemoved: match[0],
      };
    }
  }

  return { cleaned: original, preambleRemoved: '' };
}

/**
 * Extracts action verbs from statement
 */
export function extractCandidateVerbs(statement: string): string[] {
  const { cleaned } = cleanCLOStatementPreamble(statement);
  if (!cleaned) return [];

  // Tokenize words, stripping punctuation
  const words = cleaned
    .replace(/[.,;:!?()"']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const candidates: string[] = [];

  for (let i = 0; i < Math.min(words.length, 6); i++) {
    const word = words[i].toLowerCase();
    if (['and', 'or', 'to', 'in', 'the', 'a', 'an', 'for', 'with', 'by'].includes(word)) {
      continue;
    }
    const normalized = VERB_LEMMATIZATION_MAP[word] || word;
    candidates.push(normalized);
  }

  return candidates;
}

/**
 * Evaluates cognitive depth appropriateness based on Course Level
 */
export function evaluateCognitiveDepth(
  level: BloomLevel,
  levelNumber: number,
  courseLevel: CourseLevel = 'Undergraduate'
): CognitiveDepthAssessment {
  const order: 'LOTS' | 'HOTS' = levelNumber <= 2 ? 'LOTS' : 'HOTS';

  let isAppropriate = true;
  let advice = '';
  let targetRecommendedLevels: BloomLevel[] = [];
  const canElevate = levelNumber < 6;
  const elevateSuggestions: CognitiveDepthAssessment['elevateSuggestions'] = [];

  const tierLabels: Record<number, string> = {
    1: 'Level 1: Remember (Foundational Knowledge & Recall)',
    2: 'Level 2: Understand (Comprehension & Explanation)',
    3: 'Level 3: Apply (Practical Computation & Procedural Execution)',
    4: 'Level 4: Analyze (Critical Deconstruction & Diagnostics)',
    5: 'Level 5: Evaluate (Rigorous Appraisal & Strategic Defense)',
    6: 'Level 6: Create (Original Synthesis & Systemic Design)',
  };

  switch (courseLevel) {
    case 'Graduate':
    case 'Professional':
      if (levelNumber <= 2) {
        isAppropriate = false;
        advice = `${courseLevel} courses require predominantly Higher-Order Thinking Skills (HOTS: L4-L6). Outcome depth is currently foundational (${order}). Accreditation standards expect students to deconstruct complex systems, critique evidence, or formulate original solutions.`;
        targetRecommendedLevels = ['Analyze', 'Evaluate', 'Create'];
      } else if (levelNumber === 3) {
        isAppropriate = true;
        advice = `Acceptable application level for ${courseLevel} technical methods, but higher cognitive impact is achieved by pairing application with systemic evaluation or synthesis.`;
        targetRecommendedLevels = ['Analyze', 'Evaluate', 'Create'];
      } else {
        isAppropriate = true;
        advice = `Exemplary cognitive depth for ${courseLevel} study. Aligned with advanced evaluative and creative mastery standards.`;
        targetRecommendedLevels = ['Analyze', 'Evaluate', 'Create'];
      }
      break;

    case 'Undergraduate':
      if (levelNumber === 1) {
        isAppropriate = true;
        advice = 'Appropriate as an introductory prerequisite outcome, but university undergraduate programs require progression to HOTS (L3-L5) for major core competency.';
        targetRecommendedLevels = ['Understand', 'Apply', 'Analyze'];
      } else if (levelNumber <= 3) {
        isAppropriate = true;
        advice = 'Solid foundational/application depth for undergraduate curriculum.';
        targetRecommendedLevels = ['Apply', 'Analyze', 'Evaluate'];
      } else {
        isAppropriate = true;
        advice = 'Strong Higher-Order Thinking depth. Prepares undergraduate learners for independent analysis, capstones, and professional judgment.';
        targetRecommendedLevels = ['Analyze', 'Evaluate', 'Create'];
      }
      break;

    case 'School':
      if (levelNumber >= 5) {
        isAppropriate = true;
        advice = 'High-order challenge level. Ensure appropriate scaffolding and guided rubrics support secondary school learners.';
        targetRecommendedLevels = ['Apply', 'Analyze'];
      } else {
        isAppropriate = true;
        advice = 'Well-calibrated developmental depth for secondary school educational standards.';
        targetRecommendedLevels = ['Understand', 'Apply', 'Analyze'];
      }
      break;

    default:
      if (levelNumber <= 2) {
        advice = 'Foundational comprehension outcome (LOTS). Good for introductory modules.';
        targetRecommendedLevels = ['Apply', 'Analyze'];
      } else {
        advice = 'Demonstrates Higher-Order Thinking (HOTS), meeting rigorous professional accreditation standards.';
        targetRecommendedLevels = ['Analyze', 'Evaluate', 'Create'];
      }
  }

  // Generate elevation suggestions if lower than Level 6
  if (levelNumber < 6) {
    const nextLevelNum = Math.min(6, levelNumber + 1);
    const nextLevelName = (Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).find(
      (k) => BLOOM_TAXONOMY_DATA[k].number === nextLevelNum
    );
    if (nextLevelName) {
      elevateSuggestions.push({
        targetLevel: nextLevelName,
        verbs: BLOOM_TAXONOMY_DATA[nextLevelName].categories[0].verbs.slice(0, 4),
        rationale: `Elevate cognitive rigor to ${nextLevelName} (${BLOOM_TAXONOMY_DATA[nextLevelName].title}) for deeper student agency and authentic assessment.`,
      });
    }

    if (levelNumber <= 3) {
      // Also suggest jumping to Level 4 Analyze
      elevateSuggestions.push({
        targetLevel: 'Analyze',
        verbs: ['Analyze', 'Differentiate', 'Investigate', 'Deconstruct'],
        rationale: 'Shift from passive or procedural execution to critical diagnostic analysis.',
      });
    }
  }

  return {
    levelNumber,
    order,
    tierLabel: tierLabels[levelNumber] || `Level ${levelNumber}`,
    isAppropriateForCourseLevel: isAppropriate,
    courseLevel,
    advice,
    targetRecommendedLevels,
    canElevate,
    elevateSuggestions,
  };
}

/**
 * Main AI & Heuristic CLO Bloom's Taxonomy Tagger
 * Automatically tags CLOs with Bloom's Cognitive Level based on action verb,
 * audits measurability, and assesses cognitive depth.
 */
export function tagCLOBlooms(
  statement: string,
  courseLevel: CourseLevel = 'Undergraduate',
  currentBloomLevel?: BloomLevel
): CLOTaggerResult {
  const trimmed = (statement || '').trim();
  const { cleaned } = cleanCLOStatementPreamble(trimmed);
  const lowerCleaned = cleaned.toLowerCase();

  // 1. Check for vague/unmeasurable verbs
  let vagueMatch: typeof VAGUE_VERB_ROOTS[0] | undefined;
  for (const item of VAGUE_VERB_ROOTS) {
    const regex = new RegExp(`\\b${item.root}\\b`, 'i');
    if (regex.test(lowerCleaned)) {
      vagueMatch = item;
      break;
    }
  }

  // 2. Identify candidate action verbs
  const candidates = extractCandidateVerbs(statement);
  let detectedVerb = '';
  let normalizedVerb = '';
  let suggestedLevel: BloomLevel = currentBloomLevel || 'Understand';
  let levelNumber = 2;
  let order: 'LOTS' | 'HOTS' = 'LOTS';
  const secondaryVerbs: string[] = [];

  // Match against known taxonomy verbs
  for (const cand of candidates) {
    const lookup = VERB_TO_LEVEL_MAP.get(cand);
    if (lookup) {
      if (!detectedVerb) {
        detectedVerb = cand.charAt(0).toUpperCase() + cand.slice(1);
        normalizedVerb = cand;
        suggestedLevel = lookup.level;
        levelNumber = lookup.levelNumber;
        order = lookup.order;
      } else if (cand !== normalizedVerb && !secondaryVerbs.includes(cand)) {
        secondaryVerbs.push(cand.charAt(0).toUpperCase() + cand.slice(1));
      }
    }
  }

  // If no taxonomy verb matched directly, check first word
  if (!detectedVerb && candidates.length > 0) {
    const first = candidates[0];
    detectedVerb = first.charAt(0).toUpperCase() + first.slice(1);
    normalizedVerb = first;

    // Check partial matches or default heuristics
    if (/design|create|formulate|construct|develop|architect|synthesize/i.test(first)) {
      suggestedLevel = 'Create';
      levelNumber = 6;
      order = 'HOTS';
    } else if (/evaluate|critique|judge|assess|appraise|justify|defend/i.test(first)) {
      suggestedLevel = 'Evaluate';
      levelNumber = 5;
      order = 'HOTS';
    } else if (/analyze|differentiate|distinguish|examine|investigate|audit/i.test(first)) {
      suggestedLevel = 'Analyze';
      levelNumber = 4;
      order = 'HOTS';
    } else if (/apply|solve|calculate|implement|execute|demonstrate/i.test(first)) {
      suggestedLevel = 'Apply';
      levelNumber = 3;
      order = 'HOTS';
    } else if (/recall|list|state|identify|define/i.test(first)) {
      suggestedLevel = 'Remember';
      levelNumber = 1;
      order = 'LOTS';
    } else {
      suggestedLevel = 'Understand';
      levelNumber = 2;
      order = 'LOTS';
    }
  }

  // If still empty (e.g. empty statement)
  if (!detectedVerb) {
    detectedVerb = 'Analyze';
    normalizedVerb = 'analyze';
    suggestedLevel = currentBloomLevel || 'Analyze';
    levelNumber = BLOOM_TAXONOMY_DATA[suggestedLevel]?.number || 4;
    order = BLOOM_TAXONOMY_DATA[suggestedLevel]?.order || 'HOTS';
  }

  // 3. Measurability & Quality Scoring
  let isMeasurable = true;
  let measurabilityScore = 90;
  let measurabilityVerdict: CLOTaggerResult['measurabilityVerdict'] = 'Directly Measurable';
  let measurabilityFeedback = 'Outcome uses an observable Bloom action verb that can be scored directly with rubric criteria.';

  if (vagueMatch) {
    isMeasurable = false;
    measurabilityScore = 42;
    measurabilityVerdict = 'Non-Measurable (Action Required)';
    measurabilityFeedback = `Accreditation Warning: "${vagueMatch.root}" describes an unobservable internal mental state. Accreditation frameworks (ABET, AACSB, Washington Accord) require replacement with demonstrable action verbs.`;
  } else if (secondaryVerbs.length > 0) {
    // Compound action outcome
    measurabilityScore = 78;
    measurabilityVerdict = 'Partially Measurable';
    measurabilityFeedback = `Compound outcome detected with multiple verbs (${detectedVerb} and ${secondaryVerbs.join(', ')}). In OBE, conflating multiple cognitive tasks complicates assessment thresholds. Focus on one primary action.`;
  } else if (trimmed.length < 20) {
    measurabilityScore = 65;
    measurabilityVerdict = 'Partially Measurable';
    measurabilityFeedback = 'Statement is very brief; specify the operational context, criteria, or conditions under which performance is demonstrated.';
  }

  // 4. Cognitive Depth Evaluation
  const cognitiveDepth = evaluateCognitiveDepth(suggestedLevel, levelNumber, courseLevel);

  // 5. Compound verb warning
  const hasMultipleVerbs = secondaryVerbs.length > 0;
  const compoundVerbWarning = hasMultipleVerbs
    ? `Multiple action verbs found: "${detectedVerb}" and "${secondaryVerbs.join('", "')}". Best practice is one distinct cognitive verb per outcome.`
    : undefined;

  // 6. Recommended alternative Bloom verbs
  const categoryVerbs = BLOOM_TAXONOMY_DATA[suggestedLevel]?.categories[0]?.verbs || [];
  const recommendedBloomVerbs = categoryVerbs.filter((v) => v.toLowerCase() !== normalizedVerb).slice(0, 5);

  // 7. Auto-suggested rephrased statement if vague
  let suggestedRephrasedStatement: string | undefined;
  if (vagueMatch && vagueMatch.substitutes.length > 0) {
    const bestSubstitute = vagueMatch.substitutes[0];
    const regex = new RegExp(`\\b${vagueMatch.root}\\b`, 'i');
    suggestedRephrasedStatement = cleaned.replace(regex, bestSubstitute);
    // Ensure uppercase start
    suggestedRephrasedStatement =
      suggestedRephrasedStatement.charAt(0).toUpperCase() + suggestedRephrasedStatement.slice(1);
  }

  return {
    detectedVerb,
    normalizedVerb,
    secondaryVerbs,
    suggestedLevel,
    levelNumber,
    order,
    isMeasurable,
    measurabilityScore,
    measurabilityVerdict,
    measurabilityFeedback,
    vagueVerbIssue: vagueMatch
      ? {
          vagueVerb: vagueMatch.root,
          problem: vagueMatch.problem,
          recommendedSubstitutes: vagueMatch.substitutes,
        }
      : undefined,
    cognitiveDepth,
    hasMultipleVerbs,
    compoundVerbWarning,
    recommendedBloomVerbs,
    suggestedRephrasedStatement,
  };
}

/**
 * Batch tags all CLOs in a course, summarizing cognitive distribution
 */
export function batchTagCourseCLOs(clos: CLO[], courseLevel: CourseLevel = 'Undergraduate') {
  const taggedItems = clos.map((clo) => {
    const tag = tagCLOBlooms(clo.statement, courseLevel, clo.bloomLevel);
    const isTagMismatch =
      clo.bloomLevel !== tag.suggestedLevel ||
      (clo.bloomVerb && tag.detectedVerb.toLowerCase() !== clo.bloomVerb.toLowerCase());

    return {
      clo,
      tag,
      isTagMismatch,
      shouldUpdate: isTagMismatch || !tag.isMeasurable,
    };
  });

  // Calculate course-wide cognitive distribution
  const distribution: Record<BloomLevel, number> = {
    Remember: 0,
    Understand: 0,
    Apply: 0,
    Analyze: 0,
    Evaluate: 0,
    Create: 0,
  };

  let lotsCount = 0;
  let hotsCount = 0;
  let unmeasurableCount = 0;

  taggedItems.forEach(({ tag }) => {
    distribution[tag.suggestedLevel] = (distribution[tag.suggestedLevel] || 0) + 1;
    if (tag.order === 'LOTS') lotsCount++;
    else hotsCount++;
    if (!tag.isMeasurable) unmeasurableCount++;
  });

  const total = clos.length || 1;
  const lotsPercentage = Math.round((lotsCount / total) * 100);
  const hotsPercentage = Math.round((hotsCount / total) * 100);

  // Overall curriculum cognitive balance assessment
  let balanceVerdict = 'Well Balanced';
  let balanceAdvice = '';

  if (hotsPercentage >= 60) {
    balanceVerdict = 'High Cognitive Rigor (HOTS Focused)';
    balanceAdvice = 'Strong emphasis on Higher-Order Thinking Skills (Analyze, Evaluate, Create). Ideal for university upper-level and capstone courses.';
  } else if (lotsPercentage >= 60) {
    balanceVerdict = 'Foundational / Recall Heavy (LOTS Focused)';
    balanceAdvice =
      'Over 60% of outcomes are in Lower-Order Thinking Skills (Remember, Understand). Consider elevating 1-2 outcomes to Apply or Analyze to satisfy accreditation standards.';
  } else {
    balanceVerdict = 'Balanced Progression';
    balanceAdvice = 'Good pedagogical scaffold balancing foundational conceptual understanding with applied analysis.';
  }

  return {
    taggedItems,
    distribution,
    lotsCount,
    hotsCount,
    lotsPercentage,
    hotsPercentage,
    unmeasurableCount,
    balanceVerdict,
    balanceAdvice,
  };
}
