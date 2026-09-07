import { Course, CLO, Activity, Assessment, EvidenceRule, BloomLevel, ActivityType, AssessmentType } from '../types';
import { BLOOM_ORDER, BLOOM_RANK } from '../utils/assessmentAnalysis';

export type AlignmentGapType =
  | 'orphan-clo'
  | 'missing-tla'
  | 'missing-assessment'
  | 'orphan-tla'
  | 'orphan-assessment'
  | 'cognitive-mismatch'
  | 'missing-evidence-rule'
  | 'workload-imbalance'
  | 'indirect-only';

export type GapSeverity = 'critical' | 'warning' | 'info';

export interface AlignmentGap {
  id: string;
  type: AlignmentGapType;
  severity: GapSeverity;
  title: string;
  description: string;
  cloId?: string;
  cloCode?: string;
  tlaId?: string;
  tlaTitle?: string;
  assessmentId?: string;
  assessmentName?: string;
  recommendation: string;
  remediationAction?: 'create-tla' | 'create-assessment' | 'link-evidence' | 'balance-bloom' | 'link-clo';
}

export interface AlignedTriad {
  id: string;
  clo: CLO;
  activities: {
    activity: Activity;
    isDirectCLOLink: boolean;
    linkedViaMLO?: string;
    cognitiveMatch: 'optimal' | 'deficit' | 'higher-order';
  }[];
  assessments: {
    assessment: Assessment;
    isDirectCLOLink: boolean;
    evidenceRule?: EvidenceRule;
    cognitiveMatch: 'optimal' | 'deficit' | 'higher-order';
    hasDirectEvidence: boolean;
  }[];
  isCompleteTriad: boolean; // Has at least 1 activity AND at least 1 assessment
  isHealthy: boolean; // Complete triad with no cognitive deficit
  hasActivityGap: boolean;
  hasAssessmentGap: boolean;
  hasEvidenceRuleGap: boolean;
  hasCognitiveDeficit: boolean;
  gaps: AlignmentGap[];
}

export interface ConstructiveAlignmentReport {
  overallScore: number; // 0 - 100
  totalCLOs: number;
  fullyAlignedCLOsCount: number;
  partiallyAlignedCLOsCount: number;
  unalignedCLOsCount: number;
  totalActivitiesCount: number;
  totalAssessmentsCount: number;
  completeTriadsCount: number;
  brokenChainsCount: number;
  cognitiveConcordanceRate: number; // % of linkages where Bloom level >= CLO level
  evidenceFidelityRate: number; // % of assessments with direct evidence
  gaps: AlignmentGap[];
  triads: AlignedTriad[];
  orphanActivities: Activity[];
  orphanAssessments: Assessment[];
}

/**
 * Determine cognitive alignment between an outcome and a task/activity
 */
export function getCognitiveMatch(
  outcomeBloom: BloomLevel,
  taskBloom?: BloomLevel
): 'optimal' | 'deficit' | 'higher-order' {
  if (!taskBloom) return 'deficit';
  const outcomeRank = BLOOM_RANK[outcomeBloom] || 3;
  const taskRank = BLOOM_RANK[taskBloom] || 3;

  if (taskRank === outcomeRank) return 'optimal';
  if (taskRank > outcomeRank) return 'higher-order';
  return 'deficit';
}

/**
 * Map an activity type to an estimated Bloom cognitive level
 */
export function inferActivityBloomLevel(activityType: ActivityType): BloomLevel {
  switch (activityType) {
    case 'Project':
    case 'Simulation':
      return 'Create';
    case 'Case Study':
    case 'Practical Demonstration':
    case 'Presentation':
      return 'Evaluate';
    case 'Problem Solving':
    case 'Research Task':
    case 'Collaborative Task':
      return 'Analyze';
    case 'Scenario':
      return 'Apply';
    case 'Discussion':
    case 'Reflection':
    case 'Interactive Video':
      return 'Understand';
    case 'Quiz':
    case 'Matching':
    case 'Drag and Drop':
    default:
      return 'Remember';
  }
}

/**
 * Perform comprehensive Constructive Alignment Analysis across CLOs, TLAs, and Assessment Evidence
 */
export function analyzeConstructiveAlignment(course: Course): ConstructiveAlignmentReport {
  const clos = course.clos || [];
  const activities = course.activities || [];
  const assessments = course.assessments || [];
  const evidenceRules = course.evidenceRules || [];
  const mlos = course.mlos || [];

  const gaps: AlignmentGap[] = [];
  const triads: AlignedTriad[] = [];

  // Lookup map: MLO id -> linked CLO id
  const mloToCloMap = new Map<string, string>();
  mlos.forEach((mlo) => {
    if (mlo.linkedCLOId) {
      mloToCloMap.set(mlo.id, mlo.linkedCLOId);
    }
  });

  // Track matched activities and assessments to detect orphans
  const matchedActivityIds = new Set<string>();
  const matchedAssessmentIds = new Set<string>();

  // Evaluate each CLO
  clos.forEach((clo) => {
    const cloGaps: AlignmentGap[] = [];

    // 1. Find all Activities associated with this CLO
    const linkedActivities: AlignedTriad['activities'] = [];

    activities.forEach((act) => {
      let isMatch = false;
      let isDirect = false;
      let viaMLO: string | undefined = undefined;

      if (act.outcomeType === 'CLO' && act.outcomeId === clo.id) {
        isMatch = true;
        isDirect = true;
      } else if (act.outcomeType === 'MLO') {
        const targetCLOId = mloToCloMap.get(act.outcomeId);
        if (targetCLOId === clo.id) {
          isMatch = true;
          isDirect = false;
          viaMLO = act.outcomeId;
        }
      }

      if (isMatch) {
        matchedActivityIds.add(act.id);
        const inferredBloom = inferActivityBloomLevel(act.activityType);
        const cognitiveMatch = getCognitiveMatch(clo.bloomLevel, inferredBloom);

        linkedActivities.push({
          activity: act,
          isDirectCLOLink: isDirect,
          linkedViaMLO: viaMLO,
          cognitiveMatch,
        });

        // Check for cognitive deficit in activity
        if (cognitiveMatch === 'deficit') {
          cloGaps.push({
            id: `gap-cog-act-${clo.id}-${act.id}`,
            type: 'cognitive-mismatch',
            severity: 'warning',
            title: `Activity Bloom Deficit (${act.activityType})`,
            description: `${act.title} promotes "${inferredBloom}" cognition, whereas ${clo.code} targets higher-order "${clo.bloomLevel}".`,
            cloId: clo.id,
            cloCode: clo.code,
            tlaId: act.id,
            tlaTitle: act.title,
            recommendation: `Upgrade activity format (e.g. to Problem Solving or Case Analysis) to match ${clo.bloomLevel}.`,
            remediationAction: 'balance-bloom',
          });
        }
      }
    });

    // 2. Find all Assessments associated with this CLO
    const linkedAssessments: AlignedTriad['assessments'] = [];

    assessments.forEach((asmt) => {
      const isLinkedDirect = (asmt.linkedCLOIds || []).includes(clo.id);
      const isLinkedViaMLO = (asmt.linkedMLOIds || []).some((mloId) => mloToCloMap.get(mloId) === clo.id);
      const hasQuestionForCLO = (asmt.questions || []).some((q) => q.cloId === clo.id);

      if (isLinkedDirect || isLinkedViaMLO || hasQuestionForCLO) {
        matchedAssessmentIds.add(asmt.id);

        const rule = evidenceRules.find((r) => r.outcomeId === clo.id);
        const hasRuleForThisAsmt = rule?.evidenceSources?.some((s) => s.assessmentId === asmt.id);
        const matchedRule = hasRuleForThisAsmt ? rule : undefined;

        const cognitiveMatch = getCognitiveMatch(clo.bloomLevel, asmt.bloomLevel);
        const hasDirectEvidence = asmt.evidenceType === 'Direct' || asmt.directOrIndirect === 'Direct';

        linkedAssessments.push({
          assessment: asmt,
          isDirectCLOLink: isLinkedDirect,
          evidenceRule: matchedRule,
          cognitiveMatch,
          hasDirectEvidence,
        });

        // Cognitive deficit in assessment
        if (cognitiveMatch === 'deficit') {
          cloGaps.push({
            id: `gap-cog-asmt-${clo.id}-${asmt.id}`,
            type: 'cognitive-mismatch',
            severity: 'critical',
            title: `Assessment Rigor Deficit (${asmt.name})`,
            description: `${asmt.name} evaluates at "${asmt.bloomLevel}", but ${clo.code} requires "${clo.bloomLevel}". Students may pass without demonstrating target competency.`,
            cloId: clo.id,
            cloCode: clo.code,
            assessmentId: asmt.id,
            assessmentName: asmt.name,
            recommendation: `Elevate assessment prompt or question complexity to target "${clo.bloomLevel}".`,
            remediationAction: 'balance-bloom',
          });
        }

        // Indirect only warning
        if (!hasDirectEvidence) {
          cloGaps.push({
            id: `gap-indirect-${clo.id}-${asmt.id}`,
            type: 'indirect-only',
            severity: 'warning',
            title: `Indirect Evidence Only (${asmt.name})`,
            description: `${asmt.name} relies solely on indirect evidence (e.g. self-report/survey) rather than authentic demonstrable proof.`,
            cloId: clo.id,
            cloCode: clo.code,
            assessmentId: asmt.id,
            assessmentName: asmt.name,
            recommendation: 'Incorporate direct performance criteria or rubric-scored work artifacts.',
            remediationAction: 'link-evidence',
          });
        }
      }
    });

    // 3. Triad Structure Gap Checks
    const hasActivity = linkedActivities.length > 0;
    const hasAssessment = linkedAssessments.length > 0;

    // A. Orphan CLO (Neither activity nor assessment)
    if (!hasActivity && !hasAssessment) {
      cloGaps.push({
        id: `gap-orphan-clo-${clo.id}`,
        type: 'orphan-clo',
        severity: 'critical',
        title: `Completely Unaligned Outcome (${clo.code})`,
        description: `${clo.code} has zero Teaching & Learning Activities and zero Assessment Evidence. It exists only on paper.`,
        cloId: clo.id,
        cloCode: clo.code,
        recommendation: `Design at least one active learning activity and link an assessment task with evidence criteria.`,
        remediationAction: 'create-tla',
      });
    }
    // B. Missing Teaching & Learning Activity (Testing without teaching)
    else if (!hasActivity && hasAssessment) {
      cloGaps.push({
        id: `gap-missing-tla-${clo.id}`,
        type: 'missing-tla',
        severity: 'critical',
        title: `Unpracticed Assessment (${clo.code})`,
        description: `${clo.code} is assessed by ${linkedAssessments.map((a) => a.assessment.name).join(', ')}, but students have NO dedicated learning or practice activities to develop this skill.`,
        cloId: clo.id,
        cloCode: clo.code,
        recommendation: `Add formative practice, collaborative tasks, or authentic workouts directly supporting ${clo.code}.`,
        remediationAction: 'create-tla',
      });
    }
    // C. Missing Assessment Evidence (Teaching without evaluation)
    else if (hasActivity && !hasAssessment) {
      cloGaps.push({
        id: `gap-missing-asmt-${clo.id}`,
        type: 'missing-assessment',
        severity: 'critical',
        title: `Unmeasured Outcome (${clo.code})`,
        description: `${clo.code} has learning activities but zero formal assessment evidence. Learning cannot be verified for accreditation.`,
        cloId: clo.id,
        cloCode: clo.code,
        recommendation: `Link a quiz, assignment, rubric criterion, or project benchmark to collect empirical evidence.`,
        remediationAction: 'create-assessment',
      });
    }

    // D. Missing Evidence Rule
    const hasConfiguredRule = evidenceRules.some(
      (r) => r.outcomeId === clo.id && (r.evidenceSources?.length || 0) > 0
    );
    if (hasAssessment && !hasConfiguredRule) {
      cloGaps.push({
        id: `gap-missing-rule-${clo.id}`,
        type: 'missing-evidence-rule',
        severity: 'warning',
        title: `Missing Evidence Threshold Rule (${clo.code})`,
        description: `${clo.code} is linked to assessment tasks, but lacks a formal empirical attainment formula (e.g. ≥60% on direct benchmarks).`,
        cloId: clo.id,
        cloCode: clo.code,
        recommendation: `Define an explicit evidence aggregation rule and minimum achievement threshold.`,
        remediationAction: 'link-evidence',
      });
    }

    // E. Workload / Weight Imbalance
    if (clo.weightage >= 25 && linkedActivities.length === 1 && (linkedActivities[0].activity.estimatedMins || 0) < 30) {
      cloGaps.push({
        id: `gap-workload-${clo.id}`,
        type: 'workload-imbalance',
        severity: 'info',
        title: `Workload Imbalance (${clo.code})`,
        description: `${clo.code} carries heavy course weightage (${clo.weightage}%), but only has a single short activity (${linkedActivities[0].activity.estimatedMins} min).`,
        cloId: clo.id,
        cloCode: clo.code,
        recommendation: `Provide progressive scaffolding activities across multiple modules.`,
        remediationAction: 'create-tla',
      });
    }

    const isComplete = hasActivity && hasAssessment;
    const hasCognitiveDeficit = cloGaps.some((g) => g.type === 'cognitive-mismatch');
    const isHealthy = isComplete && !hasCognitiveDeficit && cloGaps.filter((g) => g.severity === 'critical').length === 0;

    triads.push({
      id: `triad-${clo.id}`,
      clo,
      activities: linkedActivities,
      assessments: linkedAssessments,
      isCompleteTriad: isComplete,
      isHealthy,
      hasActivityGap: !hasActivity,
      hasAssessmentGap: !hasAssessment,
      hasEvidenceRuleGap: !hasConfiguredRule,
      hasCognitiveDeficit,
      gaps: cloGaps,
    });

    gaps.push(...cloGaps);
  });

  // 4. Check for Orphan Activities (Activities not linked to any CLO or MLO)
  const orphanActivities: Activity[] = [];
  activities.forEach((act) => {
    if (!matchedActivityIds.has(act.id)) {
      orphanActivities.push(act);
      gaps.push({
        id: `gap-orphan-act-${act.id}`,
        type: 'orphan-tla',
        severity: 'warning',
        title: `Orphan Activity (${act.title})`,
        description: `This active learning task is not mapped to any valid Course or Module Learning Outcome. Student effort is untracked.`,
        tlaId: act.id,
        tlaTitle: act.title,
        recommendation: `Align this activity to an appropriate CLO or modular milestone.`,
        remediationAction: 'link-clo',
      });
    }
  });

  // 5. Check for Orphan Assessments (Assessments not linked to any CLO)
  const orphanAssessments: Assessment[] = [];
  assessments.forEach((asmt) => {
    if (!matchedAssessmentIds.has(asmt.id)) {
      orphanAssessments.push(asmt);
      gaps.push({
        id: `gap-orphan-asmt-${asmt.id}`,
        type: 'orphan-assessment',
        severity: 'warning',
        title: `Orphan Assessment (${asmt.name})`,
        description: `Assessment "${asmt.name}" (${asmt.weightage}% course weight) does not measure any defined Course Learning Outcome.`,
        assessmentId: asmt.id,
        assessmentName: asmt.name,
        recommendation: `Tag relevant CLOs in the Assessment Designer or question blueprint.`,
        remediationAction: 'link-clo',
      });
    }
  });

  // 6. Calculate Summary Metrics
  const totalCLOs = clos.length;
  const completeTriadsCount = triads.filter((t) => t.isCompleteTriad).length;
  const fullyAlignedCLOsCount = triads.filter((t) => t.isHealthy).length;
  const partiallyAlignedCLOsCount = triads.filter((t) => t.isCompleteTriad && !t.isHealthy).length;
  const unalignedCLOsCount = triads.filter((t) => !t.isCompleteTriad).length;
  const brokenChainsCount = triads.filter((t) => t.hasActivityGap || t.hasAssessmentGap).length;

  // Concordance: % of linked activities & assessments that meet or exceed the CLO Bloom level
  let totalLinkages = 0;
  let concordantLinkages = 0;
  triads.forEach((t) => {
    t.activities.forEach((a) => {
      totalLinkages++;
      if (a.cognitiveMatch !== 'deficit') concordantLinkages++;
    });
    t.assessments.forEach((a) => {
      totalLinkages++;
      if (a.cognitiveMatch !== 'deficit') concordantLinkages++;
    });
  });

  const cognitiveConcordanceRate =
    totalLinkages > 0 ? Math.round((concordantLinkages / totalLinkages) * 100) : 100;

  // Evidence Fidelity: % of assessments with direct evidence
  const totalAssessmentsCount = assessments.length;
  const directAssessmentsCount = assessments.filter(
    (a) => a.evidenceType === 'Direct' || a.directOrIndirect === 'Direct'
  ).length;
  const evidenceFidelityRate =
    totalAssessmentsCount > 0 ? Math.round((directAssessmentsCount / totalAssessmentsCount) * 100) : 0;

  // Calculate Overall Constructive Alignment Index (CAI %)
  // Weighting: 40% Complete Triads, 30% Cognitive Concordance, 20% Direct Evidence, 10% Zero Orphans
  let overallScore = 0;
  if (totalCLOs > 0) {
    const triadCoverage = (completeTriadsCount / totalCLOs) * 40;
    const cognitiveScore = (cognitiveConcordanceRate / 100) * 30;
    const evidenceScore = (evidenceFidelityRate / 100) * 20;
    const orphanDeduction = Math.min(10, (orphanActivities.length + orphanAssessments.length) * 2.5);
    const orphanScore = Math.max(0, 10 - orphanDeduction);

    overallScore = Math.round(triadCoverage + cognitiveScore + evidenceScore + orphanScore);
  } else {
    overallScore = 0;
  }

  return {
    overallScore,
    totalCLOs,
    fullyAlignedCLOsCount,
    partiallyAlignedCLOsCount,
    unalignedCLOsCount,
    totalActivitiesCount: activities.length,
    totalAssessmentsCount,
    completeTriadsCount,
    brokenChainsCount,
    cognitiveConcordanceRate,
    evidenceFidelityRate,
    gaps,
    triads,
    orphanActivities,
    orphanAssessments,
  };
}

/**
 * Auto-Remediation: Create an aligned activity for a CLO with a missing TLA gap
 */
export function autoCreateAlignedActivity(course: Course, cloId: string): Course {
  const clo = course.clos?.find((c) => c.id === cloId);
  if (!clo) return course;

  const defaultModule = course.modules?.[0];
  const bloomRank = BLOOM_RANK[clo.bloomLevel] || 3;

  let activityType: ActivityType = 'Problem Solving';
  let studentPrompt = `Analyze the authentic scenario and apply ${clo.competency || 'core principles'} to synthesize a reasoned defense.`;
  let evidenceProduced = `Submitted analytic solution brief and structured reflection artifact.`;

  if (bloomRank >= 5) {
    activityType = 'Case Study';
    studentPrompt = `Critically evaluate conflicting case parameters and defend an optimized solution meeting professional standards.`;
    evidenceProduced = `Case evaluation report with rubric-scored justification.`;
  } else if (bloomRank <= 2) {
    activityType = 'Interactive Video';
    studentPrompt = `Engage with guided interactive prompts to solidify fundamental concepts and explain core terminology.`;
    evidenceProduced = `Concept check summary and interactive response log.`;
  }

  const newActivity: Activity = {
    id: `act-aligned-${Date.now()}`,
    moduleId: defaultModule?.id || 'mod-1',
    outcomeType: 'CLO',
    outcomeId: clo.id,
    title: `Active Learning: Authentic Workout for ${clo.code}`,
    activityType,
    studentActionPrompt: studentPrompt,
    evidenceProduced,
    estimatedMins: 45,
  };

  return {
    ...course,
    activities: [...(course.activities || []), newActivity],
  };
}

/**
 * Auto-Remediation: Create aligned assessment evidence for a CLO with a missing assessment gap
 */
export function autoCreateAlignedAssessment(course: Course, cloId: string): Course {
  const clo = course.clos?.find((c) => c.id === cloId);
  if (!clo) return course;

  const bloomRank = BLOOM_RANK[clo.bloomLevel] || 3;
  let asmtType: AssessmentType = 'Assignment';
  let asmtName = `Authentic Performance Benchmark (${clo.code})`;

  if (bloomRank >= 5) {
    asmtType = 'Project';
    asmtName = `Capstone Synthesis Portfolio (${clo.code})`;
  } else if (bloomRank <= 2) {
    asmtType = 'Quiz';
    asmtName = `Knowledge Verification Assessment (${clo.code})`;
  }

  const newAssessment: Assessment = {
    id: `asmt-aligned-${Date.now()}`,
    name: asmtName,
    type: asmtType,
    linkedCLOIds: [clo.id],
    linkedMLOIds: [],
    bloomLevel: clo.bloomLevel,
    evidenceType: 'Direct',
    directOrIndirect: 'Direct',
    marks: 20,
    weightage: Math.min(20, clo.weightage || 20),
    achievementThreshold: clo.achievementThreshold || 60,
    isSummative: true,
    questions: [],
  };

  // Also provision an EvidenceRule
  const newRule: EvidenceRule = {
    id: `er-${clo.id}-${Date.now()}`,
    outcomeId: clo.id,
    outcomeCode: clo.code,
    evidenceSources: [
      {
        assessmentId: newAssessment.id,
        componentName: newAssessment.name,
        weightInOutcome: 100,
      },
    ],
    minimumThresholdPct: clo.achievementThreshold || 60,
    achievementRuleText: `${clo.code} attained if student scores ≥ ${clo.achievementThreshold || 60}% on direct evidence benchmarks.`,
    explanation: `Direct empirical verification of ${clo.code} mastery aligned to ${clo.bloomLevel} taxonomy level.`,
  };

  return {
    ...course,
    assessments: [...(course.assessments || []), newAssessment],
    evidenceRules: [...(course.evidenceRules || []), newRule],
  };
}

/**
 * Auto-Remediation: Synchronize Bloom levels to eliminate cognitive deficit
 */
export function harmonizeBloomLevels(course: Course, cloId: string): Course {
  const clo = course.clos?.find((c) => c.id === cloId);
  if (!clo) return course;

  // Upgrade linked assessments to match CLO's Bloom level
  const updatedAssessments = (course.assessments || []).map((asmt) => {
    if ((asmt.linkedCLOIds || []).includes(clo.id)) {
      const asmtRank = BLOOM_RANK[asmt.bloomLevel] || 1;
      const cloRank = BLOOM_RANK[clo.bloomLevel] || 3;
      if (asmtRank < cloRank) {
        return { ...asmt, bloomLevel: clo.bloomLevel };
      }
    }
    return asmt;
  });

  return {
    ...course,
    assessments: updatedAssessments,
  };
}
