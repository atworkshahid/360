import { Course, CLO, BloomLevel } from '../types';
import { BLOOM_RANK, analyzeAssessmentPlan } from './assessmentAnalysis';
import { BLOOM_TAXONOMY_DATA, VERBS_TO_AVOID } from '../components/CourseCreator/BloomsTaxonomyHelperModal';
import { calculateCourseAudit } from './obeCalculator';

export interface ChecklistItem {
  id: string;
  category: 'measurability' | 'assessments' | 'content';
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  metricText: string;
  targetStep: number;
  details?: string[];
  actionLabel?: string;
  autoFixType?: 'normalize-assessment-weights' | 'normalize-clo-weights' | 'open-blooms-helper' | 'copilot';
  copilotPrompt?: string;
}

export interface HealthSuggestion {
  id: string;
  title: string;
  reason: string;
  category: 'measurability' | 'assessments' | 'content';
  impact: 'Critical' | 'Warning' | 'Opportunity';
  targetStep: number;
  actionText: string;
  autoFixType?: 'normalize-assessment-weights' | 'normalize-clo-weights' | 'replace-vague-verb' | 'open-blooms-helper' | 'copilot';
  vagueCLOId?: string;
  suggestedVerb?: string;
  suggestedLevel?: BloomLevel;
  copilotPrompt?: string;
}

export interface CLOMeasurabilityAudit {
  cloId: string;
  cloCode: string;
  statement: string;
  bloomVerb: string;
  bloomLevel: BloomLevel;
  isMeasurable: boolean;
  vagueVerbFound?: string;
  recommendedSubstitutes?: string[];
  qualityScore: number;
  hasContextAndCriteria: boolean;
  suggestedStatement?: string;
}

export interface DesignHealthAudit {
  overallScore: number;
  healthGrade: 'Audit-Ready' | 'Proficient' | 'Needs Attention' | 'Incomplete';
  measurabilityScore: number;
  assessmentLinkageScore: number;
  contentRequirementsScore: number;
  
  // Specific metrics
  cloMeasurabilityAudits: CLOMeasurabilityAudit[];
  totalCLOs: number;
  measurableCLOsCount: number;
  vagueCLOsCount: number;
  
  unassessedCLOsCount: number;
  unassessedCLOCodes: string[];
  assessmentTotalWeight: number;
  isAssessmentWeightValid: boolean;
  
  missingContentCount: number;
  
  checklistItems: ChecklistItem[];
  suggestions: HealthSuggestion[];
}

/**
 * Check if a verb or statement contains a known vague/non-measurable term
 */
export function detectVagueVerb(statement: string, bloomVerb: string): { found: boolean; vagueVerb?: string; substitutes?: string[] } {
  const statementLower = (statement || '').toLowerCase();
  const verbLower = (bloomVerb || '').toLowerCase();

  for (const item of VERBS_TO_AVOID) {
    const rawVerb = (item.vagueVerb || '').toLowerCase().split('/')[0].trim();
    // Check if the verb or start of statement contains this vague word
    const regex = new RegExp(`\\b${rawVerb}\\b`, 'i');
    if (regex.test(verbLower) || regex.test(statementLower)) {
      return {
        found: true,
        vagueVerb: item.vagueVerb,
        substitutes: item.recommendedSubstitutes,
      };
    }
  }

  // Fallback checks for common non-observable words
  const additionalVague = ['understand', 'know', 'learn', 'comprehend', 'appreciate', 'be familiar', 'familiarize', 'perceive', 'memorize'];
  for (const word of additionalVague) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(verbLower) || regex.test(statementLower)) {
      return {
        found: true,
        vagueVerb: word.charAt(0).toUpperCase() + word.slice(1),
        substitutes: ['Explain', 'Analyze', 'Apply', 'Demonstrate', 'Evaluate'],
      };
    }
  }

  return { found: false };
}

/**
 * Evaluate the comprehensive Design Health of a Course
 */
export function evaluateDesignHealth(course: Course): DesignHealthAudit {
  const checklistItems: ChecklistItem[] = [];
  const suggestions: HealthSuggestion[] = [];

  // ==========================================
  // 1. CLO MEASURABILITY EVALUATION
  // ==========================================
  const cloAudits: CLOMeasurabilityAudit[] = [];
  let measurableCount = 0;
  let vagueCount = 0;
  let hotsCount = 0; // Higher-Order Thinking Skills: Analyze, Evaluate, Create

  course.clos.forEach((clo) => {
    const vagueCheck = detectVagueVerb(clo.statement || '', clo.bloomVerb || '');
    const isVerbRecognized = Boolean(clo.bloomVerb && clo.bloomVerb.trim().length > 2);
    const wordCount = (clo.statement || '').trim().split(/\s+/).filter(Boolean).length;
    const hasContext = wordCount >= 8;

    const isMeasurable = !vagueCheck.found && isVerbRecognized && (clo.qualityScore >= 60 || !clo.qualityScore);

    if (isMeasurable) {
      measurableCount++;
    } else {
      vagueCount++;
    }

    if (['Analyze', 'Evaluate', 'Create'].includes(clo.bloomLevel)) {
      hotsCount++;
    }

    cloAudits.push({
      cloId: clo.id,
      cloCode: clo.code,
      statement: clo.statement,
      bloomVerb: clo.bloomVerb,
      bloomLevel: clo.bloomLevel,
      isMeasurable,
      vagueVerbFound: vagueCheck.found ? vagueCheck.vagueVerb : undefined,
      recommendedSubstitutes: vagueCheck.substitutes,
      qualityScore: clo.qualityScore || (isMeasurable ? 85 : 45),
      hasContextAndCriteria: hasContext,
      suggestedStatement: clo.aiSuggestion,
    });

    // Create real-time suggestion if vague
    if (vagueCheck.found) {
      const topSubstitute = vagueCheck.substitutes?.[0] || 'Analyze';
      suggestions.push({
        id: `sug-vague-${clo.id}`,
        category: 'measurability',
        title: `Non-Measurable Verb in ${clo.code}: "${vagueCheck.vagueVerb}"`,
        reason: `Accreditation boards reject "${vagueCheck.vagueVerb}" because it cannot be evaluated with direct empirical scoring.`,
        impact: 'Critical',
        targetStep: 3,
        actionText: `Replace with "${topSubstitute}"`,
        autoFixType: 'replace-vague-verb',
        vagueCLOId: clo.id,
        suggestedVerb: topSubstitute,
        suggestedLevel: clo.bloomLevel,
      });
    }
  });

  const cloCount = course.clos.length;
  let measurabilityScore = 0;

  if (cloCount === 0) {
    measurabilityScore = 0;
    checklistItems.push({
      id: 'meas-defined',
      category: 'measurability',
      title: 'Course Learning Outcomes Defined',
      description: 'Outcome-based education requires at least 3-6 measurable CLOs.',
      status: 'failed',
      metricText: '0 defined',
      targetStep: 3,
      actionLabel: 'Define CLOs in Step 3',
    });

    suggestions.push({
      id: 'sug-no-clos',
      category: 'measurability',
      title: 'No Course Learning Outcomes Created',
      reason: 'Course cannot be audited or accredited without defined learning outcomes.',
      impact: 'Critical',
      targetStep: 3,
      actionText: 'Create CLOs in Step 3',
    });
  } else {
    // Check 1: Observable Action Verbs
    const allHaveVerbs = cloAudits.every((c) => c.bloomVerb && c.bloomVerb.trim().length > 1);
    checklistItems.push({
      id: 'meas-verbs',
      category: 'measurability',
      title: 'Observable Action Verbs',
      description: 'Each outcome begins with an observable Bloom taxonomy action verb.',
      status: allHaveVerbs ? 'passed' : 'warning',
      metricText: `${cloAudits.filter((c) => c.bloomVerb).length}/${cloCount} specified`,
      targetStep: 3,
      actionLabel: allHaveVerbs ? undefined : 'Assign Verbs in Step 3',
      autoFixType: allHaveVerbs ? undefined : 'open-blooms-helper',
    });

    // Check 2: No Non-Measurable Verbs
    const zeroVague = vagueCount === 0;
    checklistItems.push({
      id: 'meas-no-vague',
      category: 'measurability',
      title: 'Zero Non-Measurable / Vague Verbs',
      description: 'Free from subjective terms like "understand", "know", "learn", or "appreciate".',
      status: zeroVague ? 'passed' : 'failed',
      metricText: zeroVague ? 'All measurable ✓' : `${vagueCount} flagged`,
      targetStep: 3,
      details: cloAudits.filter((c) => c.vagueVerbFound).map((c) => `${c.cloCode}: uses "${c.vagueVerbFound}"`),
      actionLabel: zeroVague ? undefined : 'Review Vague Verbs',
      autoFixType: zeroVague ? undefined : 'open-blooms-helper',
    });

    // Check 3: Statement Depth & Criteria
    const statementsWithDepth = cloAudits.filter((c) => c.hasContextAndCriteria).length;
    const depthPassed = statementsWithDepth >= Math.ceil(cloCount * 0.75);
    checklistItems.push({
      id: 'meas-depth',
      category: 'measurability',
      title: 'Statement Formulation & Criteria',
      description: 'Statements define active performance, subject context, and observable criteria.',
      status: depthPassed ? 'passed' : 'warning',
      metricText: `${statementsWithDepth}/${cloCount} well-formed`,
      targetStep: 3,
      actionLabel: depthPassed ? undefined : 'Enhance CLO Statements in Step 3',
    });

    // Check 4: Cognitive Rigor (HOTS vs LOTS)
    const hotsRatio = hotsCount / cloCount;
    const hotsPassed = hotsRatio >= 0.4;
    checklistItems.push({
      id: 'meas-hots',
      category: 'measurability',
      title: 'Higher-Order Cognitive Rigor',
      description: 'University/professional courses require at least 40% higher-order outcomes (Analyze, Evaluate, Create).',
      status: hotsPassed ? 'passed' : 'warning',
      metricText: `${Math.round(hotsRatio * 100)}% HOTS (${hotsCount}/${cloCount})`,
      targetStep: 3,
      actionLabel: hotsPassed ? undefined : 'Upgrade Rigor in Step 3',
      autoFixType: hotsPassed ? undefined : 'open-blooms-helper',
    });

    if (!hotsPassed) {
      suggestions.push({
        id: 'sug-hots-low',
        category: 'measurability',
        title: `Low Cognitive Rigor (${Math.round(hotsRatio * 100)}% Higher-Order)`,
        reason: 'Degree programs require learners to demonstrate higher-order capabilities like Analysis, Evaluation, or System Design.',
        impact: 'Warning',
        targetStep: 3,
        actionText: "Open Bloom's Helper to Elevate Levels",
        autoFixType: 'open-blooms-helper',
      });
    }

    // Score calculation: 40% measurable, 30% verbs, 15% depth, 15% HOTS
    const measurableRatio = measurableCount / cloCount;
    measurabilityScore = Math.round(
      measurableRatio * 40 +
      (allHaveVerbs ? 30 : 15) +
      (depthPassed ? 15 : 5) +
      (hotsPassed ? 15 : Math.round(hotsRatio * 15))
    );
  }

  // ==========================================
  // 2. CLO-ASSESSMENT LINKAGE EVALUATION
  // ==========================================
  const assessmentAnalysis = analyzeAssessmentPlan(course);
  const totalAssessmentWeight = course.assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);
  const isAssessmentWeight100 = Math.abs(totalAssessmentWeight - 100) < 0.1 && course.assessments.length > 0;

  const assessedCLOCodes = new Set<string>();
  const summativeCLOCodes = new Set<string>();
  const cloMaxAssessmentBloom: Record<string, BloomLevel> = {};

  course.assessments.forEach((a) => {
    a.linkedCLOIds.forEach((id) => {
      assessedCLOCodes.add(id);
      if (a.isSummative) {
        summativeCLOCodes.add(id);
      }
      // Track highest bloom level
      const currentHighest = cloMaxAssessmentBloom[id];
      if (!currentHighest || (BLOOM_RANK[a.bloomLevel] || 0) > (BLOOM_RANK[currentHighest] || 0)) {
        cloMaxAssessmentBloom[id] = a.bloomLevel;
      }
    });
  });

  const unassessedCLOs = course.clos.filter((c) => !assessedCLOCodes.has(c.code) && !assessedCLOCodes.has(c.id));
  const noSummativeCLOs = course.clos.filter((c) => !summativeCLOCodes.has(c.code) && !summativeCLOCodes.has(c.id));

  // Cognitive deficit check
  const cognitiveDeficitCLOs = course.clos.filter((c) => {
    const highestAssessmentBloom = cloMaxAssessmentBloom[c.id] || cloMaxAssessmentBloom[c.code];
    if (!highestAssessmentBloom) return false;
    return (BLOOM_RANK[highestAssessmentBloom] || 0) < (BLOOM_RANK[c.bloomLevel] || 0);
  });

  // Check 1: 100% Outcome Assessment Coverage
  const fullCoverage = unassessedCLOs.length === 0 && course.clos.length > 0;
  checklistItems.push({
    id: 'link-coverage',
    category: 'assessments',
    title: '100% CLO Assessment Coverage',
    description: 'Every learning outcome is explicitly measured by at least one assessment component.',
    status: fullCoverage ? 'passed' : 'failed',
    metricText: fullCoverage ? 'All CLOs Covered ✓' : `${unassessedCLOs.length} Unassessed`,
    targetStep: 9,
    details: unassessedCLOs.map((c) => `${c.code} (${c.bloomLevel}) has no assessment link`),
    actionLabel: fullCoverage ? undefined : 'Link Assessments in Step 9',
  });

  if (unassessedCLOs.length > 0) {
    unassessedCLOs.forEach((c) => {
      suggestions.push({
        id: `sug-unassessed-${c.id}`,
        category: 'assessments',
        title: `${c.code} Has No Linked Assessment`,
        reason: `Students cannot demonstrate mastery of "${c.statement.slice(0, 50)}..." without a direct assessment tool.`,
        impact: 'Critical',
        targetStep: 9,
        actionText: `Add Assessment for ${c.code}`,
        copilotPrompt: `Generate a valid assessment component measuring ${c.code} at ${c.bloomLevel} level.`,
      });
    });
  }

  // Check 2: Total Assessment Weight Equals 100%
  checklistItems.push({
    id: 'link-weight-100',
    category: 'assessments',
    title: 'Assessment Weights Total Exactly 100%',
    description: 'Grading scale balance: all direct assessment component weights must sum to 100%.',
    status: isAssessmentWeight100 ? 'passed' : 'failed',
    metricText: `${totalAssessmentWeight}% configured`,
    targetStep: 9,
    actionLabel: isAssessmentWeight100 ? undefined : 'Auto-Balance to 100%',
    autoFixType: isAssessmentWeight100 ? undefined : 'normalize-assessment-weights',
  });

  if (!isAssessmentWeight100 && course.assessments.length > 0) {
    const diff = 100 - totalAssessmentWeight;
    suggestions.push({
      id: 'sug-weight-mismatch',
      category: 'assessments',
      title: `Assessment Weights Sum to ${totalAssessmentWeight}% (${diff > 0 ? `+${diff}% needed` : `${diff}% over`})`,
      reason: 'Unequal total marks generate student grade disputes and violate institutional assessment policies.',
      impact: 'Critical',
      targetStep: 9,
      actionText: 'Auto-Balance Weights to 100%',
      autoFixType: 'normalize-assessment-weights',
    });
  }

  // Check 3: Summative Verification
  const allHaveSummative = noSummativeCLOs.length === 0 && course.clos.length > 0;
  checklistItems.push({
    id: 'link-summative',
    category: 'assessments',
    title: 'Summative Verification for All CLOs',
    description: 'Every outcome has at least one graded summative task (Midterm, Final, Project).',
    status: allHaveSummative ? 'passed' : 'warning',
    metricText: allHaveSummative ? '100% Verified ✓' : `${noSummativeCLOs.length} Formative-only`,
    targetStep: 9,
    details: noSummativeCLOs.map((c) => `${c.code} is only formatively evaluated`),
    actionLabel: allHaveSummative ? undefined : 'Add Summative Tasks in Step 9',
  });

  // Check 4: Cognitive Level Alignment
  const noDeficit = cognitiveDeficitCLOs.length === 0;
  checklistItems.push({
    id: 'link-cognitive-match',
    category: 'assessments',
    title: 'Cognitive Level Alignment',
    description: 'Assessment tasks evaluate learners at or above the cognitive depth of the CLO.',
    status: noDeficit ? 'passed' : 'warning',
    metricText: noDeficit ? 'Aligned Rigor ✓' : `${cognitiveDeficitCLOs.length} Deficits`,
    targetStep: 9,
    details: cognitiveDeficitCLOs.map((c) => `${c.code} is ${c.bloomLevel} but highest test is ${cloMaxAssessmentBloom[c.id] || 'None'}`),
    actionLabel: noDeficit ? undefined : 'Upgrade Assessment in Step 9',
  });

  if (cognitiveDeficitCLOs.length > 0) {
    cognitiveDeficitCLOs.forEach((c) => {
      suggestions.push({
        id: `sug-deficit-${c.id}`,
        category: 'assessments',
        title: `Cognitive Deficit on ${c.code} (${c.bloomLevel})`,
        reason: `${c.code} requires "${c.bloomLevel}" capability, but is only tested with lower-order assessments.`,
        impact: 'Warning',
        targetStep: 9,
        actionText: `Align Assessment to ${c.bloomLevel}`,
        copilotPrompt: `Suggest a rubric or assessment task to evaluate ${c.code} at the ${c.bloomLevel} cognitive level.`,
      });
    });
  }

  // Calculate Assessment Linkage Score
  let assessmentLinkageScore = 0;
  if (course.clos.length > 0) {
    const assessedRatio = (course.clos.length - unassessedCLOs.length) / course.clos.length;
    const weightAccuracy = isAssessmentWeight100 ? 1 : Math.max(0, 1 - Math.abs(totalAssessmentWeight - 100) / 100);
    const summativeRatio = (course.clos.length - noSummativeCLOs.length) / course.clos.length;
    const cognitiveRatio = (course.clos.length - cognitiveDeficitCLOs.length) / course.clos.length;

    assessmentLinkageScore = Math.round(
      assessedRatio * 40 +
      weightAccuracy * 25 +
      summativeRatio * 20 +
      cognitiveRatio * 15
    );
  }

  // ==========================================
  // 3. MINIMUM CONTENT REQUIREMENTS EVALUATION
  // ==========================================
  let contentCheckPassed = 0;
  let totalContentChecks = 10;

  // Check 1: Course Metadata
  const hasMetadata = Boolean(course.title && course.code && course.creditHours && course.programme);
  if (hasMetadata) contentCheckPassed++;
  checklistItems.push({
    id: 'req-metadata',
    category: 'content',
    title: 'Course Identification & Metadata',
    description: 'Course Title, Course Code, Credits (>0), and Programme are configured.',
    status: hasMetadata ? 'passed' : 'failed',
    metricText: hasMetadata ? `${course.code} (${course.creditHours} cr)` : 'Incomplete',
    targetStep: 1,
    actionLabel: hasMetadata ? undefined : 'Complete Step 1',
  });

  // Check 2: Blueprint & Learning Promise
  const hasBlueprint = Boolean(course.description && (course.learningPromise || course.blueprint?.purpose));
  if (hasBlueprint) contentCheckPassed++;
  checklistItems.push({
    id: 'req-blueprint',
    category: 'content',
    title: 'Syllabus Blueprint & Promise',
    description: 'Course Description and definitive Learning Promise guarantee are articulated.',
    status: hasBlueprint ? 'passed' : 'warning',
    metricText: hasBlueprint ? 'Articulated ✓' : 'Draft Needed',
    targetStep: 2,
    actionLabel: hasBlueprint ? undefined : 'Set Promise in Step 2',
  });

  // Check 3: Standard CLO Count (3-8)
  const isCLOCountCompliant = course.clos.length >= 3 && course.clos.length <= 8;
  if (isCLOCountCompliant) contentCheckPassed++;
  checklistItems.push({
    id: 'req-clo-count',
    category: 'content',
    title: 'Accreditation CLO Count Range (3 - 8)',
    description: 'Standard institutional accreditation benchmarks require 3 to 8 outcomes per course.',
    status: isCLOCountCompliant ? 'passed' : course.clos.length === 0 ? 'failed' : 'warning',
    metricText: `${course.clos.length} defined ${isCLOCountCompliant ? '(Optimal)' : '(Adjust)'}`,
    targetStep: 3,
    actionLabel: isCLOCountCompliant ? undefined : 'Adjust in Step 3',
  });

  // Check 4: CLO Weightage Sum to 100%
  const totalCLOWeight = course.clos.reduce((acc, c) => acc + (c.weightage || 0), 0);
  const isCLOWeight100 = Math.abs(totalCLOWeight - 100) < 0.1 && course.clos.length > 0;
  if (isCLOWeight100) contentCheckPassed++;
  checklistItems.push({
    id: 'req-clo-weight',
    category: 'content',
    title: 'CLO Outcome Weightages Equal 100%',
    description: 'Each outcome contributes a specific weight toward total course achievement.',
    status: isCLOWeight100 ? 'passed' : 'warning',
    metricText: `${totalCLOWeight}% total`,
    targetStep: 3,
    actionLabel: isCLOWeight100 ? undefined : 'Auto-Balance CLO Weights',
    autoFixType: isCLOWeight100 ? undefined : 'normalize-clo-weights',
  });

  if (!isCLOWeight100 && course.clos.length > 0) {
    suggestions.push({
      id: 'sug-clo-weight-unbalanced',
      category: 'content',
      title: `CLO Weights Sum to ${totalCLOWeight}% (Must Be 100%)`,
      reason: 'Course learning outcomes must accurately partition 100% of the overall course credit.',
      impact: 'Warning',
      targetStep: 3,
      actionText: 'Auto-Balance CLO Weights to 100%',
      autoFixType: 'normalize-clo-weights',
    });
  }

  // Check 5: CLO-to-PLO Mapping
  const unmappedCLOs = course.clos.filter((c) => !c.mappedPLOs || c.mappedPLOs.length === 0);
  const allMappedToPLO = unmappedCLOs.length === 0 && course.clos.length > 0;
  if (allMappedToPLO) contentCheckPassed++;
  checklistItems.push({
    id: 'req-plo-mapping',
    category: 'content',
    title: 'CLO-to-PLO Programme Mapping',
    description: 'Every CLO maps to at least one Programme Outcome (PEO/GA) with mastery level.',
    status: allMappedToPLO ? 'passed' : 'failed',
    metricText: allMappedToPLO ? '100% Mapped ✓' : `${unmappedCLOs.length} Unmapped`,
    targetStep: 4,
    details: unmappedCLOs.map((c) => `${c.code} not mapped to any PLO`),
    actionLabel: allMappedToPLO ? undefined : 'Map Outcomes in Step 4',
  });

  if (unmappedCLOs.length > 0) {
    suggestions.push({
      id: 'sug-unmapped-plos',
      category: 'content',
      title: `${unmappedCLOs.length} CLO(s) Disconnected from Programme Goals (PLOs)`,
      reason: 'Accreditation audits require an unbroken trace from Course Outcomes to Graduate Attributes.',
      impact: 'Critical',
      targetStep: 4,
      actionText: 'Map to PLOs in Step 4',
    });
  }

  // Check 6: Instructional Architecture (Weekly Syllabus or Modules)
  const hasWeeklyPlan = (course.weeklyPlan || []).length >= 4;
  const hasModules = (course.modules || []).length >= 2;
  const instructionalArchPassed = hasWeeklyPlan || hasModules;
  if (instructionalArchPassed) contentCheckPassed++;
  checklistItems.push({
    id: 'req-modules',
    category: 'content',
    title: 'Instructional Architecture (Weekly Syllabus or Modules)',
    description: 'Course content is scheduled into sequenced, manageable instructional units or weekly plans.',
    status: instructionalArchPassed ? 'passed' : 'failed',
    metricText: hasWeeklyPlan ? `${course.weeklyPlan?.length} Weeks Scheduled` : `${course.modules.length} Modules`,
    targetStep: 5,
    actionLabel: instructionalArchPassed ? undefined : 'Schedule Syllabus in Step 6',
  });

  // Check 7: Scaffolding / Learning Outcomes (MLOs or Weekly CLO Links)
  const hasMLOs = course.mlos.length > 0;
  const unlinkedMLOs = course.mlos.filter((m) => !m.linkedCLOId);
  const weeklyClosMapped = (course.weeklyPlan || []).some((w) => (w.linkedCLOIds || []).length > 0);
  const mlosFullyLinked = (hasMLOs && unlinkedMLOs.length === 0) || (hasWeeklyPlan && weeklyClosMapped);
  if (mlosFullyLinked) contentCheckPassed++;
  checklistItems.push({
    id: 'req-mlos-linked',
    category: 'content',
    title: 'Scaffolded Learning Outcomes & Weekly Linkage',
    description: 'Instructional sessions and modules link outcomes directly back to parent CLOs.',
    status: mlosFullyLinked ? 'passed' : (hasMLOs || hasWeeklyPlan) ? 'warning' : 'failed',
    metricText: hasWeeklyPlan ? 'Weekly CLOs Linked' : `${course.mlos.length} MLOs (${unlinkedMLOs.length} unlinked)`,
    targetStep: 6,
    actionLabel: mlosFullyLinked ? undefined : 'Link Outcomes in Step 6',
  });

  // Check 8: Instructional Activities & Demonstrable Evidence
  const hasLessons = course.lessons.length > 0;
  const lessonsWithEvidence = course.lessons.filter((l) => l.evidenceOfLearning && l.evidenceOfLearning.trim().length > 0).length;
  const weeklyActivitiesCount = (course.weeklyPlan || []).filter((w) => w.learningActivity && w.learningActivity.trim().length > 0).length;
  const lessonsPassed = (hasLessons && lessonsWithEvidence >= Math.ceil(course.lessons.length * 0.7)) || (hasWeeklyPlan && weeklyActivitiesCount >= 4);
  if (lessonsPassed) contentCheckPassed++;
  checklistItems.push({
    id: 'req-lessons-evidence',
    category: 'content',
    title: 'Lessons & Activities with Demonstrable Evidence',
    description: 'Instructional sessions specify what tangible artifact or student output demonstrates learning.',
    status: lessonsPassed ? 'passed' : 'warning',
    metricText: hasWeeklyPlan ? `${weeklyActivitiesCount} Weekly Activities` : `${lessonsWithEvidence}/${course.lessons.length} with Evidence`,
    targetStep: 7,
    actionLabel: lessonsPassed ? undefined : 'Add Activities in Step 6/7',
  });

  // Check 9: Rubrics for Qualitative Assessments
  const subjectiveAssessments = course.assessments.filter((a) =>
    ['Assignment', 'Project', 'Presentation', 'Case Study', 'Portfolio', 'Practical'].includes(a.type)
  );
  const unrubricated = subjectiveAssessments.filter((a) => !a.rubricId && course.rubrics.every((r) => r.assessmentId !== a.id));
  const rubricsPassed = subjectiveAssessments.length === 0 || unrubricated.length === 0;
  if (rubricsPassed) contentCheckPassed++;
  checklistItems.push({
    id: 'req-rubrics',
    category: 'content',
    title: 'Grading Rubrics for Qualitative Tasks',
    description: 'Projects, assignments, and presentations have analytic multi-criteria scoring rubrics.',
    status: rubricsPassed ? 'passed' : 'warning',
    metricText: rubricsPassed ? 'Rubrics Linked ✓' : `${unrubricated.length} Missing Rubrics`,
    targetStep: 11,
    actionLabel: rubricsPassed ? undefined : 'Build Rubrics in Step 11',
  });

  // Check 10: Evidence Rules Formulated
  const closWithEvidence = new Set(course.evidenceRules.map((er) => er.outcomeId || er.outcomeCode));
  const missingEvidenceCLOs = course.clos.filter((c) => !closWithEvidence.has(c.id) && !closWithEvidence.has(c.code));
  const evidenceRulesPassed = missingEvidenceCLOs.length === 0 && course.clos.length > 0;
  if (evidenceRulesPassed) contentCheckPassed++;
  checklistItems.push({
    id: 'req-evidence-rules',
    category: 'content',
    title: 'Threshold Evidence Rules (Step 12)',
    description: 'Direct achievement threshold rules (e.g. score ≥ 60%) configured for audit trails.',
    status: evidenceRulesPassed ? 'passed' : 'warning',
    metricText: evidenceRulesPassed ? 'All Rules Set ✓' : `${missingEvidenceCLOs.length} Unconfigured`,
    targetStep: 12,
    actionLabel: evidenceRulesPassed ? undefined : 'Configure Rules in Step 12',
  });

  const contentRequirementsScore = Math.round((contentCheckPassed / totalContentChecks) * 100);

  // ==========================================
  // 4. OVERALL HEALTH SCORE & GRADE (Unified Source of Truth)
  // ==========================================
  const unifiedAudit = calculateCourseAudit(course);
  const overallScore = unifiedAudit.healthScore;

  let healthGrade: DesignHealthAudit['healthGrade'] = 'Needs Attention';
  if (overallScore >= 90) healthGrade = 'Audit-Ready';
  else if (overallScore >= 75) healthGrade = 'Proficient';
  else if (overallScore >= 50) healthGrade = 'Needs Attention';
  else healthGrade = 'Incomplete';

  // Sort suggestions: Critical first, then Warning, then Opportunity
  const impactWeights = { Critical: 3, Warning: 2, Opportunity: 1 };
  suggestions.sort((a, b) => impactWeights[b.impact] - impactWeights[a.impact]);

  return {
    overallScore,
    healthGrade,
    measurabilityScore,
    assessmentLinkageScore,
    contentRequirementsScore,
    cloMeasurabilityAudits: cloAudits,
    totalCLOs: cloCount,
    measurableCLOsCount: measurableCount,
    vagueCLOsCount: vagueCount,
    unassessedCLOsCount: unassessedCLOs.length,
    unassessedCLOCodes: unassessedCLOs.map((c) => c.code),
    assessmentTotalWeight: totalAssessmentWeight,
    isAssessmentWeightValid: isAssessmentWeight100,
    missingContentCount: totalContentChecks - contentCheckPassed,
    checklistItems,
    suggestions,
  };
}

/**
 * Auto-fix utility: normalizes assessment weights proportionally so they sum to exactly 100%
 */
export function normalizeAssessmentWeights(course: Course): Course {
  if (course.assessments.length === 0) return course;

  const total = course.assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);
  if (total === 0) {
    const equalWeight = Math.floor(100 / course.assessments.length);
    const remainder = 100 - equalWeight * course.assessments.length;
    const updated = course.assessments.map((a, idx) => ({
      ...a,
      weightage: equalWeight + (idx === 0 ? remainder : 0),
    }));
    return { ...course, assessments: updated, updatedAt: new Date().toISOString() };
  }

  // Scale proportionally
  let runningTotal = 0;
  const updated = course.assessments.map((a, idx) => {
    if (idx === course.assessments.length - 1) {
      return { ...a, weightage: Math.max(1, 100 - runningTotal) };
    }
    const scaled = Math.round(((a.weightage || 0) / total) * 100);
    runningTotal += scaled;
    return { ...a, weightage: scaled };
  });

  return { ...course, assessments: updated, updatedAt: new Date().toISOString() };
}

/**
 * Auto-fix utility: normalizes CLO weights so they sum to exactly 100%
 */
export function normalizeCLOWeights(course: Course): Course {
  if (course.clos.length === 0) return course;

  const total = course.clos.reduce((acc, c) => acc + (c.weightage || 0), 0);
  if (total === 0) {
    const equalWeight = Math.floor(100 / course.clos.length);
    const remainder = 100 - equalWeight * course.clos.length;
    const updated = course.clos.map((c, idx) => ({
      ...c,
      weightage: equalWeight + (idx === 0 ? remainder : 0),
    }));
    return { ...course, clos: updated, updatedAt: new Date().toISOString() };
  }

  let runningTotal = 0;
  const updated = course.clos.map((c, idx) => {
    if (idx === course.clos.length - 1) {
      return { ...c, weightage: Math.max(1, 100 - runningTotal) };
    }
    const scaled = Math.round(((c.weightage || 0) / total) * 100);
    runningTotal += scaled;
    return { ...c, weightage: scaled };
  });

  return { ...course, clos: updated, updatedAt: new Date().toISOString() };
}

/**
 * Auto-fix utility: replaces a vague verb in a specific CLO with a measurable action verb
 */
export function replaceVagueVerbInCLO(course: Course, cloId: string, newVerb: string, newLevel?: BloomLevel): Course {
  const updatedCLOs = course.clos.map((c) => {
    if (c.id !== cloId) return c;

    let statement = c.statement || '';
    const words = statement.trim().split(/\s+/);
    if (words.length > 0) {
      words[0] = newVerb;
      statement = words.join(' ');
    } else {
      statement = `${newVerb} `;
    }

    return {
      ...c,
      bloomVerb: newVerb,
      bloomLevel: newLevel || c.bloomLevel,
      statement,
      status: 'Validated' as const,
      qualityScore: Math.max(c.qualityScore || 70, 85),
    };
  });

  return { ...course, clos: updatedCLOs, updatedAt: new Date().toISOString() };
}
