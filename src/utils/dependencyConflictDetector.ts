import { Course, CLO, Assessment, BloomLevel } from '../types';
import { BLOOM_RANK } from './assessmentAnalysis';

export type DependencyIssueType =
  | 'circular-dependency'
  | 'cognitive-mismatch'
  | 'chronological-inversion'
  | 'threshold-contradiction'
  | 'modality-incompatibility'
  | 'unassessed-outcome'
  | 'unlinked-assessment';

export type DependencySeverity = 'critical' | 'warning' | 'advisory';

export interface CycleTraceStep {
  fromType: 'clo' | 'assessment';
  fromId: string;
  fromName: string;
  toType: 'clo' | 'assessment';
  toId: string;
  toName: string;
  relationship: string;
}

export interface DependencyIssue {
  id: string;
  type: DependencyIssueType;
  severity: DependencySeverity;
  title: string;
  description: string;
  pedagogicalImpact: string;
  recommendation: string;
  involvedOutcomeIds: string[];
  involvedAssessmentIds: string[];
  cyclePath?: string[];
  cycleTrace?: CycleTraceStep[];
  autoFixAvailable: boolean;
  autoFixLabel?: string;
  autoFixAction?: 'break-cycle' | 'align-bloom' | 'reschedule-assessment' | 'harmonize-threshold' | 'link-default-assessment';
  suggestedFixData?: {
    assessmentId?: string;
    cloId?: string;
    targetBloom?: BloomLevel;
    targetThreshold?: number;
    targetWeek?: number;
  };
}

export interface DependencyAuditReport {
  hasCircularDependency: boolean;
  hasConflicts: boolean;
  totalIssuesCount: number;
  criticalCount: number;
  warningCount: number;
  advisoryCount: number;
  issues: DependencyIssue[];
  circularIssues: DependencyIssue[];
  conflictIssues: DependencyIssue[];
  healthScore: number;
  summaryStatus: 'danger' | 'warning' | 'clean';
}

interface GraphNode {
  id: string;
  type: 'clo' | 'assessment';
  entityId: string;
  label: string;
}

interface GraphEdge {
  from: string;
  to: string;
  relationship: string;
}

/**
 * Builds directed dependency graph and audits for circular loops and conflicting dependencies
 * between Course Outcomes and Assessment Instruments.
 */
export function detectDependencyConflicts(course: Course): DependencyAuditReport {
  const issues: DependencyIssue[] = [];
  const clos = course.clos || [];
  const assessments = course.assessments || [];
  const modules = course.modules || [];

  const cloMap = new Map<string, CLO>();
  clos.forEach((c) => {
    cloMap.set(c.id, c);
    if (c.code) cloMap.set(c.code, c);
  });

  const asmtMap = new Map<string, Assessment>();
  assessments.forEach((a) => asmtMap.set(a.id, a));

  // -------------------------------------------------------------
  // 1. BUILD DIRECTED GRAPH FOR CYCLE DETECTION
  // -------------------------------------------------------------
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const adjacency = new Map<string, Array<{ to: string; relationship: string }>>();

  // Register CLO nodes
  clos.forEach((c) => {
    const nodeId = `clo:${c.id}`;
    nodes.set(nodeId, {
      id: nodeId,
      type: 'clo',
      entityId: c.id,
      label: `${c.code || 'CLO'}: ${c.statement ? c.statement.slice(0, 30) + '...' : 'Outcome'}`,
    });
    adjacency.set(nodeId, []);
  });

  // Register Assessment nodes
  assessments.forEach((a) => {
    const nodeId = `asmt:${a.id}`;
    nodes.set(nodeId, {
      id: nodeId,
      type: 'assessment',
      entityId: a.id,
      label: a.name || 'Assessment',
    });
    adjacency.set(nodeId, []);
  });

  const addEdge = (from: string, to: string, relationship: string) => {
    if (nodes.has(from) && nodes.has(to)) {
      edges.push({ from, to, relationship });
      adjacency.get(from)?.push({ to, relationship });
    }
  };

  // Edge type A: Assessment -> CLO (Assessment evaluates and depends on Outcome achievement)
  assessments.forEach((a) => {
    const asmtNodeId = `asmt:${a.id}`;
    (a.linkedCLOIds || []).forEach((cId) => {
      const clo = cloMap.get(cId);
      if (clo) {
        addEdge(asmtNodeId, `clo:${clo.id}`, 'Evaluates Outcome');
      }
    });

    // Assessment prerequisite assessments (Asmt A requires passing Asmt B)
    (a.prerequisiteAssessmentIds || []).forEach((preAsmtId) => {
      if (asmtMap.has(preAsmtId)) {
        addEdge(asmtNodeId, `asmt:${preAsmtId}`, 'Requires Prerequisite Assessment');
      }
    });

    // Assessment prerequisite CLOs (Asmt A requires mastery of CLO before attempt)
    (a.prerequisiteCLOIds || []).forEach((preCloId) => {
      const clo = cloMap.get(preCloId);
      if (clo) {
        addEdge(asmtNodeId, `clo:${clo.id}`, 'Requires Prerequisite Outcome');
      }
    });
  });

  // Edge type B: CLO -> Assessment (CLO requires completion of Assessment for evidence/certification)
  clos.forEach((c) => {
    const cloNodeId = `clo:${c.id}`;

    // Explicit dependent assessments
    (c.dependentAssessmentIds || []).forEach((aId) => {
      if (asmtMap.has(aId)) {
        addEdge(cloNodeId, `asmt:${aId}`, 'Evidenced by Assessment');
      }
    });

    // Explicit CLO prerequisites (CLO A requires mastery of CLO B)
    (c.prerequisiteCLOIds || []).forEach((preCloId) => {
      const target = cloMap.get(preCloId);
      if (target) {
        addEdge(cloNodeId, `clo:${target.id}`, 'Prerequisite Outcome');
      }
    });

    // If CLO specifies an assessmentMethod by name or keyword matching an assessment
    if (c.assessmentMethod && assessments.length > 0) {
      const targetMethod = c.assessmentMethod.toLowerCase();
      const match = assessments.find(
        (a) => {
          const aName = (a.name || '').toLowerCase();
          const aType = (a.type || '').toLowerCase();
          return (
            aName.includes(targetMethod) ||
            targetMethod.includes(aName) ||
            targetMethod.includes(aType)
          );
        }
      );
      if (match) {
        addEdge(cloNodeId, `asmt:${match.id}`, `Prescribed Method: ${c.assessmentMethod}`);
      }
    }
  });

  // -------------------------------------------------------------
  // 2. CIRCULAR DEPENDENCY CYCLE DETECTION (DFS with Back-Edge Detection)
  // -------------------------------------------------------------
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: Array<{ nodeId: string; relationship: string }> = [];
  const detectedCycles: Array<Array<{ nodeId: string; relationship: string }>> = [];

  const dfsDetectCycles = (nodeId: string) => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        currentPath.push({ nodeId: edge.to, relationship: edge.relationship });
        dfsDetectCycles(edge.to);
        currentPath.pop();
      } else if (recursionStack.has(edge.to)) {
        // Detected a circular back-edge!
        const cycleStartIndex = currentPath.findIndex((item) => item.nodeId === edge.to);
        const rawCycle =
          cycleStartIndex !== -1
            ? currentPath.slice(cycleStartIndex)
            : [{ nodeId: edge.to, relationship: edge.relationship }];

        rawCycle.push({ nodeId: edge.to, relationship: edge.relationship });
        detectedCycles.push([...rawCycle]);
      }
    }

    recursionStack.delete(nodeId);
  };

  nodes.forEach((_, nodeId) => {
    if (!visited.has(nodeId)) {
      currentPath.push({ nodeId, relationship: 'Start' });
      dfsDetectCycles(nodeId);
      currentPath.pop();
    }
  });

  // Also check for direct mutual prerequisite cycles between assessments
  assessments.forEach((a) => {
    (a.prerequisiteAssessmentIds || []).forEach((preId) => {
      const preAsmt = asmtMap.get(preId);
      if (preAsmt && (preAsmt.prerequisiteAssessmentIds || []).includes(a.id)) {
        const path = [
          { nodeId: `asmt:${a.id}`, relationship: 'Requires Prerequisite' },
          { nodeId: `asmt:${preAsmt.id}`, relationship: 'Deadlock: Mutual Prerequisite' },
          { nodeId: `asmt:${a.id}`, relationship: 'Requires Prerequisite' },
        ];
        // Only push if not already detected
        if (
          !detectedCycles.some((c) =>
            c.some((step) => step.nodeId === `asmt:${a.id}`) &&
            c.some((step) => step.nodeId === `asmt:${preAsmt.id}`)
          )
        ) {
          detectedCycles.push(path);
        }
      }
    });
  });

  // Also check for outcome-to-assessment mutual deadlock:
  // e.g. Assessment 1 tests CLO 1, but Assessment 1 requires CLO 2, and Assessment 2 tests CLO 2, but Assessment 2 requires CLO 1!
  assessments.forEach((a1) => {
    const a1CLOs = a1.linkedCLOIds || [];
    const a1PreCLOs = a1.prerequisiteCLOIds || [];

    assessments.forEach((a2) => {
      if (a1.id >= a2.id) return;
      const a2CLOs = a2.linkedCLOIds || [];
      const a2PreCLOs = a2.prerequisiteCLOIds || [];

      // A1 tests X and requires Y; A2 tests Y and requires X
      const hasMutualCross =
        a1CLOs.some((x) => a2PreCLOs.includes(x)) &&
        a2CLOs.some((y) => a1PreCLOs.includes(y));

      if (hasMutualCross) {
        detectedCycles.push([
          { nodeId: `asmt:${a1.id}`, relationship: 'Assesses Outcome X' },
          { nodeId: `asmt:${a2.id}`, relationship: 'Requires Outcome Y (Cross-lock)' },
          { nodeId: `asmt:${a1.id}`, relationship: 'Requires Outcome X' },
        ]);
      }
    });
  });

  // Format detected cycles into issues
  const seenCycleSignatures = new Set<string>();
  detectedCycles.forEach((cycle, idx) => {
    const cycleLabels = cycle.map((step) => nodes.get(step.nodeId)?.label || step.nodeId);
    const signature = cycleLabels.slice().sort().join('->');
    if (seenCycleSignatures.has(signature)) return;
    seenCycleSignatures.add(signature);

    const involvedOutcomes: string[] = [];
    const involvedAssessments: string[] = [];
    const traceSteps: CycleTraceStep[] = [];

    for (let i = 0; i < cycle.length - 1; i++) {
      const fromNode = nodes.get(cycle[i].nodeId);
      const toNode = nodes.get(cycle[i + 1].nodeId);
      if (fromNode && toNode) {
        if (fromNode.type === 'clo') involvedOutcomes.push(fromNode.entityId);
        if (fromNode.type === 'assessment') involvedAssessments.push(fromNode.entityId);
        if (toNode.type === 'clo') involvedOutcomes.push(toNode.entityId);
        if (toNode.type === 'assessment') involvedAssessments.push(toNode.entityId);

        traceSteps.push({
          fromType: fromNode.type,
          fromId: fromNode.entityId,
          fromName: fromNode.label,
          toType: toNode.type,
          toId: toNode.entityId,
          toName: toNode.label,
          relationship: cycle[i + 1].relationship || 'Depends on',
        });
      }
    }

    issues.push({
      id: `cycle-${idx + 1}-${Date.now()}`,
      type: 'circular-dependency',
      severity: 'critical',
      title: `Circular Dependency Cycle Detected (${cycleLabels.length - 1} Nodes)`,
      description: `A circular dependency loop exists between ${cycleLabels.join(
        ' ➔ '
      )}. In this arrangement, an assessment or outcome indirectly requires itself to be completed or passed before it can be attempted.`,
      pedagogicalImpact:
        'Deadlock prevents students from progressing through the curriculum, causes conflicting grade calculation rules in learning management systems (LMS), and violates accreditation constructive alignment standards.',
      recommendation:
        'Break the circular loop by removing the backwards prerequisite edge or detaching the recursive dependency link.',
      involvedOutcomeIds: Array.from(new Set(involvedOutcomes)),
      involvedAssessmentIds: Array.from(new Set(involvedAssessments)),
      cyclePath: cycleLabels,
      cycleTrace: traceSteps,
      autoFixAvailable: true,
      autoFixLabel: 'Break Circular Dependency',
      autoFixAction: 'break-cycle',
      suggestedFixData: {
        assessmentId: involvedAssessments[0],
        cloId: involvedOutcomes[0],
      },
    });
  });

  // -------------------------------------------------------------
  // 3. CONFLICTING DEPENDENCIES DETECTION
  // -------------------------------------------------------------

  // A. Cognitive Bloom Taxonomy Mismatch / Deficit
  clos.forEach((clo) => {
    const linked = assessments.filter(
      (a) => (a.linkedCLOIds || []).includes(clo.id) || (a.linkedCLOIds || []).includes(clo.code)
    );

    if (linked.length > 0) {
      const cloRank = BLOOM_RANK[clo.bloomLevel] || 3;
      const maxAsmtRank = Math.max(...linked.map((a) => BLOOM_RANK[a.bloomLevel] || 3));

      // Severe Cognitive Deficit: CLO is Level 4-6 (Analyze/Evaluate/Create) but ALL assessments are Level 1-2 (Remember/Understand)
      if (cloRank >= 4 && maxAsmtRank <= 2) {
        issues.push({
          id: `conflict-bloom-deficit-${clo.id}`,
          type: 'cognitive-mismatch',
          severity: 'critical',
          title: `Cognitive Level Deficit: ${clo.code} (${clo.bloomLevel}) vs Assessment Instruments`,
          description: `${clo.code} requires higher-order cognitive mastery at Bloom Level ${clo.bloomLevel} (Rank ${cloRank}), but all linked assessments (${linked
            .map((a) => `${a.name} [${a.bloomLevel}]`)
            .join(', ')}) evaluate only lower-order recall or comprehension (Rank ${maxAsmtRank}).`,
          pedagogicalImpact:
            'Construct Under-representation: Assessment fails to measure the intended higher-order learning outcome, jeopardizing Washington Accord / ABET accreditation compliance.',
          recommendation: `Upgrade at least one assessment (such as ${linked[0]?.name}) to evaluate at least Bloom Level ${clo.bloomLevel}, or use performance-based analytical tasks.`,
          involvedOutcomeIds: [clo.id],
          involvedAssessmentIds: linked.map((a) => a.id),
          autoFixAvailable: true,
          autoFixLabel: `Align ${linked[0]?.name} to ${clo.bloomLevel}`,
          autoFixAction: 'align-bloom',
          suggestedFixData: {
            assessmentId: linked[0]?.id,
            cloId: clo.id,
            targetBloom: clo.bloomLevel,
          },
        });
      }
      // Over-demanding Mismatch: CLO is Remember/Understand (Level 1-2) evaluated exclusively by high-order summative project with no direct knowledge check
      else if (cloRank <= 2 && maxAsmtRank >= 5 && linked.every((a) => a.isSummative)) {
        issues.push({
          id: `conflict-bloom-excess-${clo.id}`,
          type: 'cognitive-mismatch',
          severity: 'warning',
          title: `Foundational Outcome Assessed Solely by Complex Summative Task (${clo.code})`,
          description: `${clo.code} is a foundational outcome (${clo.bloomLevel}), but it is only assessed by high-stakes summative instrument (${linked[0]?.name}) with no formative knowledge checks.`,
          pedagogicalImpact:
            'Early knowledge gaps in foundational concepts cannot be detected prior to high-stakes evaluation.',
          recommendation: `Introduce a formative diagnostic check or quiz for ${clo.code} before the high-stakes summative assessment.`,
          involvedOutcomeIds: [clo.id],
          involvedAssessmentIds: linked.map((a) => a.id),
          autoFixAvailable: false,
        });
      }
    }
  });

  // B. Chronological / Scaffolding Inversion (Timing Conflict)
  // Determine earliest module week for each CLO
  const cloIntroWeekMap = new Map<string, number>();
  modules.forEach((mod, modIdx) => {
    const estimatedWeek = Math.max(1, modIdx * 2 + 1);
    (mod.relatedCLOIds || []).forEach((cId) => {
      const clo = cloMap.get(cId);
      if (clo) {
        const currentEarliest = cloIntroWeekMap.get(clo.id) ?? 999;
        if (estimatedWeek < currentEarliest) {
          cloIntroWeekMap.set(clo.id, estimatedWeek);
        }
      }
    });
  });

  // Also check course.weeklyPlan if available
  if (course.weeklyPlan && course.weeklyPlan.length > 0) {
    course.weeklyPlan.forEach((week) => {
      (week.linkedCLOIds || []).forEach((cId) => {
        const clo = cloMap.get(cId);
        if (clo) {
          const current = cloIntroWeekMap.get(clo.id) ?? 999;
          if (week.weekNumber < current) {
            cloIntroWeekMap.set(clo.id, week.weekNumber);
          }
        }
      });
    });
  }

  // Check assessment scheduling against outcome introduction
  assessments.forEach((asmt, asmtIdx) => {
    // Estimate assessment week from explicit property or name/index
    let asmtWeek = asmt.scheduledWeek;
    if (!asmtWeek) {
      const nameLower = (asmt.name || '').toLowerCase();
      if (nameLower.includes('quiz 1') || nameLower.includes('assignment 1')) asmtWeek = 2;
      else if (nameLower.includes('quiz 2') || nameLower.includes('assignment 2')) asmtWeek = 4;
      else if (nameLower.includes('midterm') || nameLower.includes('mid-term')) asmtWeek = 7;
      else if (nameLower.includes('final') || nameLower.includes('capstone')) asmtWeek = 14;
      else asmtWeek = Math.min(14, Math.max(2, (asmtIdx + 1) * 2));
    }

    (asmt.linkedCLOIds || []).forEach((cId) => {
      const clo = cloMap.get(cId);
      if (clo) {
        const introWeek = cloIntroWeekMap.get(clo.id);
        if (introWeek !== undefined && asmtWeek < introWeek) {
          issues.push({
            id: `conflict-timeline-${asmt.id}-${clo.id}`,
            type: 'chronological-inversion',
            severity: 'critical',
            title: `Chronological Inversion: ${asmt.name} (Week ${asmtWeek}) Assesses ${clo.code} Before Instruction (Week ${introWeek})`,
            description: `${asmt.name} is scheduled to evaluate ${clo.code} at Week ${asmtWeek}, but the instructional modules and learning activities for this outcome do not commence until Week ${introWeek}.`,
            pedagogicalImpact:
              'Students are evaluated on competencies prior to receiving instructional scaffolding and practice opportunities, causing artificial failure rates.',
            recommendation: `Reschedule ${asmt.name} to Week ${introWeek} or later, or realign the assessment to test outcomes introduced in earlier modules.`,
            involvedOutcomeIds: [clo.id],
            involvedAssessmentIds: [asmt.id],
            autoFixAvailable: true,
            autoFixLabel: `Reschedule ${asmt.name} to Week ${introWeek}`,
            autoFixAction: 'reschedule-assessment',
            suggestedFixData: {
              assessmentId: asmt.id,
              targetWeek: introWeek,
            },
          });
        }
      }
    });
  });

  // C. Threshold & Passing Standard Contradiction
  clos.forEach((clo) => {
    const cloThreshold = clo.achievementThreshold || 60;
    const linked = assessments.filter(
      (a) => (a.linkedCLOIds || []).includes(clo.id) || (a.linkedCLOIds || []).includes(clo.code)
    );

    linked.forEach((asmt) => {
      const asmtThreshold = asmt.achievementThreshold || 50;
      const discrepancy = Math.abs(cloThreshold - asmtThreshold);

      if (discrepancy >= 20) {
        issues.push({
          id: `conflict-threshold-${clo.id}-${asmt.id}`,
          type: 'threshold-contradiction',
          severity: 'warning',
          title: `Contradictory Mastery Standard: ${clo.code} (${cloThreshold}%) vs ${asmt.name} (${asmtThreshold}%)`,
          description: `${clo.code} defines an institutional achievement threshold of ${cloThreshold}%, but ${asmt.name} sets its achievement cut-score to ${asmtThreshold}% (a ${discrepancy}% conflict).`,
          pedagogicalImpact:
            'Assessment pass/fail outcomes will conflict with institutional outcome attainment reports, leading to erroneous continuous quality improvement (CQI) data.',
          recommendation: `Harmonize the achievement thresholds between ${clo.code} and ${asmt.name} to ensure coherent mastery verification.`,
          involvedOutcomeIds: [clo.id],
          involvedAssessmentIds: [asmt.id],
          autoFixAvailable: true,
          autoFixLabel: `Harmonize Threshold to ${cloThreshold}%`,
          autoFixAction: 'harmonize-threshold',
          suggestedFixData: {
            assessmentId: asmt.id,
            cloId: clo.id,
            targetThreshold: cloThreshold,
          },
        });
      }
    });
  });

  // D. Modality & Learning Domain Incompatibility
  clos.forEach((clo) => {
    const domain = clo.learningDomain || 'Cognitive';
    const isPsychomotor = domain === 'Psychomotor';
    const isAffective = domain === 'Affective';

    if (isPsychomotor || isAffective) {
      const linked = assessments.filter(
        (a) => (a.linkedCLOIds || []).includes(clo.id) || (a.linkedCLOIds || []).includes(clo.code)
      );

      // If all linked assessments are Quiz or written test
      const allPassiveQuizzes =
        linked.length > 0 &&
        linked.every((a) => a.type === 'Quiz' || (a.questions && a.questions.length > 0 && !a.rubricId));

      if (allPassiveQuizzes) {
        issues.push({
          id: `conflict-modality-${clo.id}`,
          type: 'modality-incompatibility',
          severity: 'critical',
          title: `Modality Conflict: ${domain} Outcome (${clo.code}) Assessed Exclusively via Multiple Choice`,
          description: `${clo.code} is registered under the ${domain} domain requiring behavioral demonstration, manual execution, or ethical performance, but its assigned assessment (${linked
            .map((a) => a.name)
            .join(', ')}) consists purely of automated quiz questions without rubrics.`,
          pedagogicalImpact:
            'A written multiple-choice test cannot reliably measure physical psychomotor dexterity or ethical affective judgment, resulting in non-compliant accreditation audits.',
          recommendation: `Add a performance-based instrument (Practical, Presentation, or Project) with an analytic rubric for ${clo.code}.`,
          involvedOutcomeIds: [clo.id],
          involvedAssessmentIds: linked.map((a) => a.id),
          autoFixAvailable: false,
        });
      }
    }
  });

  // E. Dangling / Unassessed Outcomes
  clos.forEach((clo) => {
    const linked = assessments.filter(
      (a) => (a.linkedCLOIds || []).includes(clo.id) || (a.linkedCLOIds || []).includes(clo.code)
    );
    if (linked.length === 0) {
      issues.push({
        id: `unassessed-${clo.id}`,
        type: 'unassessed-outcome',
        severity: 'critical',
        title: `Unassessed Outcome: ${clo.code} Has Zero Assessment Instruments`,
        description: `${clo.code} is defined with ${clo.weightage || 0}% weightage in the course syllabus, but no assessment instrument is linked to evaluate it.`,
        pedagogicalImpact:
          'Students cannot be certified or graded on this outcome, resulting in an immediate accreditation audit failure.',
        recommendation: `Link ${clo.code} to at least one assessment instrument or assign it as a core component in the assessment plan.`,
        involvedOutcomeIds: [clo.id],
        involvedAssessmentIds: [],
        autoFixAvailable: assessments.length > 0,
        autoFixLabel: `Link to ${assessments[0]?.name || 'Assessment'}`,
        autoFixAction: 'link-default-assessment',
        suggestedFixData: {
          cloId: clo.id,
          assessmentId: assessments[0]?.id,
        },
      });
    }
  });

  // F. Dangling Assessments (Unlinked Assessments)
  assessments.forEach((asmt) => {
    const validLinks = (asmt.linkedCLOIds || []).filter((id) => cloMap.has(id));
    if (validLinks.length === 0) {
      issues.push({
        id: `unlinked-asmt-${asmt.id}`,
        type: 'unlinked-assessment',
        severity: 'warning',
        title: `Orphan Assessment: "${asmt.name}" (${asmt.weightage}%) Measures No Outcome`,
        description: `Assessment "${asmt.name}" holds ${asmt.weightage}% of total course grading but is not linked to any valid Course Learning Outcome.`,
        pedagogicalImpact:
          'Ungrounded assessment instruments violate constructive alignment and skew overall course achievement calculations.',
        recommendation: `Assign one or more relevant Course Learning Outcomes to "${asmt.name}".`,
        involvedOutcomeIds: [],
        involvedAssessmentIds: [asmt.id],
        autoFixAvailable: clos.length > 0,
        autoFixLabel: `Link to ${clos[0]?.code || 'CLO 1'}`,
        autoFixAction: 'link-default-assessment',
        suggestedFixData: {
          assessmentId: asmt.id,
          cloId: clos[0]?.id,
        },
      });
    }
  });

  // Categorize
  const circularIssues = issues.filter((i) => i.type === 'circular-dependency');
  const conflictIssues = issues.filter((i) => i.type !== 'circular-dependency');

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const advisoryCount = issues.filter((i) => i.severity === 'advisory').length;

  // Calculate Health Score (100 is perfect)
  const healthScore = Math.max(
    0,
    100 - circularIssues.length * 35 - criticalCount * 15 - warningCount * 5
  );

  const summaryStatus: 'danger' | 'warning' | 'clean' =
    circularIssues.length > 0 || criticalCount > 0
      ? 'danger'
      : warningCount > 0
      ? 'warning'
      : 'clean';

  return {
    hasCircularDependency: circularIssues.length > 0,
    hasConflicts: conflictIssues.length > 0,
    totalIssuesCount: issues.length,
    criticalCount,
    warningCount,
    advisoryCount,
    issues,
    circularIssues,
    conflictIssues,
    healthScore,
    summaryStatus,
  };
}

/**
 * Auto-fix executor for resolving detected dependency conflicts and cycles.
 */
export function resolveDependencyIssue(course: Course, issue: DependencyIssue): Course {
  const updatedCourse = { ...course };
  const fixData = issue.suggestedFixData;

  switch (issue.autoFixAction) {
    case 'break-cycle': {
      // Remove prerequisite loops between assessments and outcomes
      const updatedAsmts = (updatedCourse.assessments || []).map((a) => {
        if (issue.involvedAssessmentIds.includes(a.id)) {
          return {
            ...a,
            prerequisiteAssessmentIds: (a.prerequisiteAssessmentIds || []).filter(
              (id) => !issue.involvedAssessmentIds.includes(id)
            ),
            prerequisiteCLOIds: (a.prerequisiteCLOIds || []).filter(
              (id) => !issue.involvedOutcomeIds.includes(id)
            ),
          };
        }
        return a;
      });

      const updatedCLOs = (updatedCourse.clos || []).map((c) => {
        if (issue.involvedOutcomeIds.includes(c.id)) {
          return {
            ...c,
            prerequisiteCLOIds: (c.prerequisiteCLOIds || []).filter(
              (id) => !issue.involvedOutcomeIds.includes(id)
            ),
            dependentAssessmentIds: (c.dependentAssessmentIds || []).filter(
              (id) => !issue.involvedAssessmentIds.includes(id)
            ),
          };
        }
        return c;
      });

      return {
        ...updatedCourse,
        assessments: updatedAsmts,
        clos: updatedCLOs,
      };
    }

    case 'align-bloom': {
      if (fixData?.assessmentId && fixData.targetBloom) {
        const updatedAsmts = (updatedCourse.assessments || []).map((a) =>
          a.id === fixData.assessmentId ? { ...a, bloomLevel: fixData.targetBloom! } : a
        );
        return { ...updatedCourse, assessments: updatedAsmts };
      }
      return updatedCourse;
    }

    case 'reschedule-assessment': {
      if (fixData?.assessmentId && fixData.targetWeek) {
        const updatedAsmts = (updatedCourse.assessments || []).map((a) =>
          a.id === fixData.assessmentId ? { ...a, scheduledWeek: fixData.targetWeek } : a
        );
        return { ...updatedCourse, assessments: updatedAsmts };
      }
      return updatedCourse;
    }

    case 'harmonize-threshold': {
      if (fixData?.assessmentId && fixData.targetThreshold !== undefined) {
        const updatedAsmts = (updatedCourse.assessments || []).map((a) =>
          a.id === fixData.assessmentId
            ? { ...a, achievementThreshold: fixData.targetThreshold! }
            : a
        );
        return { ...updatedCourse, assessments: updatedAsmts };
      }
      return updatedCourse;
    }

    case 'link-default-assessment': {
      if (fixData?.assessmentId && fixData?.cloId) {
        const updatedAsmts = (updatedCourse.assessments || []).map((a) => {
          if (a.id === fixData.assessmentId) {
            const currentLinks = a.linkedCLOIds || [];
            if (!currentLinks.includes(fixData.cloId!)) {
              return { ...a, linkedCLOIds: [...currentLinks, fixData.cloId!] };
            }
          }
          return a;
        });
        return { ...updatedCourse, assessments: updatedAsmts };
      }
      return updatedCourse;
    }

    default:
      return updatedCourse;
  }
}
