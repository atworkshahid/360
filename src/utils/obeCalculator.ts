import { Course, CourseAuditReport, AuditGap } from '../types';

export function calculateCourseAudit(course: Course): CourseAuditReport {
  const gaps: AuditGap[] = [];
  const recommendations: string[] = [];

  // 1. Course Info check
  let infoScore = 0;
  if (course.title && course.code) infoScore += 25;
  if (course.category && course.programme) infoScore += 20;
  if (course.deliveryMode && course.courseLevel) infoScore += 20;
  if (course.description && course.learningPromise) infoScore += 20;
  if (course.blueprint.purpose && course.blueprint.targetCompetencies.length > 0) infoScore += 15;

  if (!course.learningPromise) {
    gaps.push({
      id: 'gap-info-promise',
      severity: 'Low',
      category: 'Course Information',
      title: 'Missing Learning Promise',
      message: 'A clear learning promise informs students and external auditors of the core transformation guaranteed.',
      recommendation: 'Specify the definitive capability learner will master upon completion.',
      targetStep: 1,
    });
  }

  // 2. CLO Quality check
  let cloQualityScore = 0;
  if (course.clos.length > 0) {
    const totalCLOQuality = course.clos.reduce((acc, c) => acc + (c.qualityScore || 70), 0);
    cloQualityScore = Math.round(totalCLOQuality / course.clos.length);
  } else {
    gaps.push({
      id: 'gap-clo-none',
      severity: 'Critical',
      category: 'CLO Quality',
      title: 'No Course Learning Outcomes Defined',
      message: 'An outcome-based course requires at least 3 to 6 measurable CLOs.',
      recommendation: 'Define CLOs using observable Bloom verbs in Step 3.',
      targetStep: 3,
    });
  }

  // Check for weak CLOs
  course.clos.forEach((clo) => {
    if (clo.qualityScore < 60) {
      gaps.push({
        id: `gap-clo-${clo.id}-weak`,
        severity: 'High',
        category: 'CLO Quality',
        title: `${clo.code} Quality Flagged (${clo.qualityScore}/100)`,
        message: `${clo.code} uses non-observable or compound language.`,
        recommendation: clo.aiSuggestion ? `Refactor to: "${clo.aiSuggestion}"` : 'Use active Bloom verbs like Analyze, Evaluate, Design, or Apply.',
        targetStep: 3,
      });
    }
  });

  // 3. CLO-PLO Mapping check
  let ploScore = 100;
  if (course.plos.length > 0) {
    const unmappedCLOs = course.clos.filter((c) => !c.mappedPLOs || c.mappedPLOs.length === 0);
    if (unmappedCLOs.length > 0) {
      ploScore = Math.max(0, Math.round(((course.clos.length - unmappedCLOs.length) / course.clos.length) * 100));
      gaps.push({
        id: 'gap-plo-unmapped',
        severity: 'High',
        category: 'CLO-PLO Mapping',
        title: `${unmappedCLOs.length} CLO(s) Not Mapped to Programme Outcomes`,
        message: `CLO(s) ${unmappedCLOs.map((c) => c.code).join(', ')} do not contribute to any PLO.`,
        recommendation: 'Map each CLO to at least one PLO with Introduced, Reinforced, or Mastered level in Step 4.',
        targetStep: 4,
      });
    }
  }

  // 4. MLO Alignment
  let mloScore = 100;
  if (course.mlos.length === 0 && course.modules.length > 0) {
    mloScore = 0;
    gaps.push({
      id: 'gap-mlo-none',
      severity: 'Critical',
      category: 'MLO Alignment',
      title: 'Modules Have No Learning Outcomes (MLOs)',
      message: 'Course modules must contain measurable MLOs linked back to course outcomes.',
      recommendation: 'Generate or write scaffolded MLOs (MLO X.Y.Z) in Step 6.',
      targetStep: 6,
    });
  } else if (course.mlos.length > 0) {
    const unlinkedMLOs = course.mlos.filter((m) => !m.linkedCLOId);
    if (unlinkedMLOs.length > 0) {
      mloScore = Math.round(((course.mlos.length - unlinkedMLOs.length) / course.mlos.length) * 100);
      gaps.push({
        id: 'gap-mlo-unlinked',
        severity: 'High',
        category: 'MLO Alignment',
        title: `${unlinkedMLOs.length} MLO(s) Disconnected from CLOs`,
        message: `MLO(s) ${unlinkedMLOs.map((m) => m.code).join(', ')} have no parent CLO.`,
        recommendation: 'Link every MLO to a primary CLO to maintain the OBE chain.',
        targetStep: 6,
      });
    }
  }

  // 5. Lesson Alignment
  let lessonScore = 100;
  if (course.lessons.length === 0 && course.modules.length > 0) {
    lessonScore = 10;
    gaps.push({
      id: 'gap-lesson-none',
      severity: 'High',
      category: 'Lesson Alignment',
      title: 'No Lessons Designed',
      message: 'Instructional design requires concrete lesson activities and evidence.',
      recommendation: 'Add structured lessons linked to MLOs in Step 7.',
      targetStep: 7,
    });
  } else if (course.lessons.length > 0) {
    const noEvidenceLessons = course.lessons.filter((l) => !l.evidenceOfLearning || l.evidenceOfLearning.trim() === '');
    if (noEvidenceLessons.length > 0) {
      lessonScore = Math.max(20, Math.round(((course.lessons.length - noEvidenceLessons.length) / course.lessons.length) * 100));
      gaps.push({
        id: 'gap-lesson-evidence',
        severity: 'Medium',
        category: 'Lesson Alignment',
        title: `${noEvidenceLessons.length} Lesson(s) Lack Required Evidence of Learning`,
        message: 'Viewing lesson content alone does not equal outcome achievement.',
        recommendation: 'Specify measurable evidence for each lesson (quiz pass, submission, demo).',
        targetStep: 7,
      });
    }
  }

  // 6. Assessment Coverage & Balance
  let assessmentScore = 100;
  const totalWeight = course.assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);

  if (Math.abs(totalWeight - 100) > 0.1 && course.assessments.length > 0) {
    assessmentScore = Math.max(30, 100 - Math.abs(totalWeight - 100) * 2);
    gaps.push({
      id: 'gap-assessment-weight',
      severity: 'Critical',
      category: 'Assessment Coverage',
      title: `Assessment Weightage Totals ${totalWeight}% (Must Be Exactly 100%)`,
      message: `The sum of assessment weightages is ${totalWeight}%, creating grading discrepancies.`,
      recommendation: 'Recalibrate component weights so the total equals exactly 100% in Step 9.',
      targetStep: 9,
    });
  }

  // Check CLO assessment coverage
  const assessedCLOCodes = new Set<string>();
  const summativeCLOCodes = new Set<string>();

  course.assessments.forEach((a) => {
    a.linkedCLOIds.forEach((id) => {
      assessedCLOCodes.add(id);
      if (a.isSummative) {
        summativeCLOCodes.add(id);
      }
    });
  });

  course.clos.forEach((c) => {
    if (!assessedCLOCodes.has(c.code) && !assessedCLOCodes.has(c.id)) {
      assessmentScore = Math.max(20, assessmentScore - 20);
      gaps.push({
        id: `gap-clo-${c.id}-unassessed`,
        severity: 'Critical',
        category: 'Assessment Coverage',
        title: `${c.code} Has No Linked Assessment`,
        message: `${c.code} cannot be demonstrated because no assessment evaluates it.`,
        recommendation: `Add a direct assessment measuring ${c.code} in Step 9.`,
        targetStep: 9,
      });
    } else if (!summativeCLOCodes.has(c.code) && !summativeCLOCodes.has(c.id)) {
      gaps.push({
        id: `gap-clo-${c.id}-no-summative`,
        severity: 'Critical',
        category: 'Assessment Coverage',
        title: `${c.code} Has No Summative Assessment`,
        message: `${c.code} is only formatively evaluated without high-stakes graded verification.`,
        recommendation: `Include ${c.code} in Midterm, Final, or major Project in Step 9.`,
        targetStep: 9,
      });
    }
  });

  // 7. Rubric Alignment
  let rubricScore = 100;
  const subjectiveAssessments = course.assessments.filter((a) =>
    ['Assignment', 'Project', 'Presentation', 'Case Study', 'Portfolio', 'Practical'].includes(a.type)
  );

  if (subjectiveAssessments.length > 0) {
    const unrubricated = subjectiveAssessments.filter((a) => !a.rubricId && course.rubrics.every((r) => r.assessmentId !== a.id));
    if (unrubricated.length > 0) {
      rubricScore = Math.max(30, Math.round(((subjectiveAssessments.length - unrubricated.length) / subjectiveAssessments.length) * 100));
      gaps.push({
        id: 'gap-rubric-missing',
        severity: 'High',
        category: 'Rubric Alignment',
        title: `${unrubricated.length} Qualitative Assessment(s) Lack Grading Rubric`,
        message: `Assessments like "${unrubricated[0]?.name}" require multi-level criteria rubrics for objective scoring.`,
        recommendation: 'Build criteria and 5 achievement levels in the Rubric Builder in Step 11.',
        targetStep: 11,
      });
    }
  }

  // 8. Evidence Coverage
  let evidenceScore = 100;
  const closWithEvidence = new Set(course.evidenceRules.map((er) => er.outcomeId || er.outcomeCode));
  const missingEvidenceCLOs = course.clos.filter((c) => !closWithEvidence.has(c.id) && !closWithEvidence.has(c.code));

  if (missingEvidenceCLOs.length > 0 && course.clos.length > 0) {
    evidenceScore = Math.max(20, Math.round(((course.clos.length - missingEvidenceCLOs.length) / course.clos.length) * 100));
    gaps.push({
      id: 'gap-evidence-rules',
      severity: 'High',
      category: 'Evidence Rules',
      title: `${missingEvidenceCLOs.length} CLO(s) Lack Formulated Evidence Rules`,
      message: `Outcome(s) ${missingEvidenceCLOs.map((c) => c.code).join(', ')} do not have defined achievement threshold rules.`,
      recommendation: 'Configure evidence sources and achievement criteria (e.g. weighted score ≥ 60%) in Step 12.',
      targetStep: 12,
    });
  }

  // Calculate Overall Health Score
  const categoryScores = {
    courseInfo: Math.min(100, infoScore),
    cloQuality: Math.min(100, cloQualityScore || 80),
    cloPloMapping: Math.min(100, ploScore),
    mloAlignment: Math.min(100, mloScore),
    lessonAlignment: Math.min(100, lessonScore),
    assessmentCoverage: Math.min(100, assessmentScore),
    rubricAlignment: Math.min(100, rubricScore),
    evidenceCoverage: Math.min(100, evidenceScore),
  };

  const weights = {
    courseInfo: 0.1,
    cloQuality: 0.15,
    cloPloMapping: 0.1,
    mloAlignment: 0.15,
    lessonAlignment: 0.1,
    assessmentCoverage: 0.2,
    rubricAlignment: 0.1,
    evidenceCoverage: 0.1,
  };

  const healthScore = Math.round(
    categoryScores.courseInfo * weights.courseInfo +
    categoryScores.cloQuality * weights.cloQuality +
    categoryScores.cloPloMapping * weights.cloPloMapping +
    categoryScores.mloAlignment * weights.mloAlignment +
    categoryScores.lessonAlignment * weights.lessonAlignment +
    categoryScores.assessmentCoverage * weights.assessmentCoverage +
    categoryScores.rubricAlignment * weights.rubricAlignment +
    categoryScores.evidenceCoverage * weights.evidenceCoverage
  );

  // Completion Percentage calculation across 15 steps
  let completedSteps = 0;
  if (course.title && course.code && course.description) completedSteps++; // Step 1
  if (course.blueprint.purpose && course.blueprint.targetCompetencies.length > 0) completedSteps++; // Step 2
  if (course.clos.length >= 2) completedSteps++; // Step 3
  if (course.plos.length > 0 && course.clos.some((c) => c.mappedPLOs.length > 0)) completedSteps++; // Step 4
  if (course.modules.length >= 2) completedSteps++; // Step 5
  if (course.mlos.length >= 3) completedSteps++; // Step 6
  if (course.lessons.length >= 2) completedSteps++; // Step 7
  if (course.activities.length >= 2) completedSteps++; // Step 8
  if (course.assessments.length >= 2 && Math.abs(totalWeight - 100) < 1) completedSteps++; // Step 9
  if (course.assessments.some((a) => a.questions && a.questions.length > 0)) completedSteps++; // Step 10
  if (course.rubrics.length > 0) completedSteps++; // Step 11
  if (course.evidenceRules.length > 0) completedSteps++; // Step 12
  if (healthScore >= 80) completedSteps++; // Step 13
  completedSteps++; // Step 14 (Preview accessible)
  if (course.status !== 'draft') completedSteps++; // Step 15

  const completionPercentage = Math.round((completedSteps / 15) * 100);

  // Counts
  const criticalCount = gaps.filter((g) => g.severity === 'Critical').length;
  const highCount = gaps.filter((g) => g.severity === 'High').length;
  const mediumCount = gaps.filter((g) => g.severity === 'Medium').length;

  // Key actionable recommendations
  if (criticalCount > 0) {
    recommendations.push('Resolve all Critical gaps immediately to satisfy mandatory OBE accreditation standards.');
  }
  if (Math.abs(totalWeight - 100) > 0.1) {
    recommendations.push(`Adjust assessment weightages to equal 100% (currently ${totalWeight}%).`);
  }
  if (categoryScores.cloQuality < 85) {
    recommendations.push('Utilize the AI CLO Quality Checker to elevate action verb measurability.');
  }
  if (categoryScores.mloAlignment < 90) {
    recommendations.push('Ensure each module scaffolds cognitive outcomes from Remember to Apply/Analyze.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Course demonstrates strong constructive alignment and is ready for academic review!');
  }

  return {
    healthScore: Math.min(100, Math.max(0, healthScore)),
    completionPercentage: Math.min(100, Math.max(0, completionPercentage)),
    categoryScores,
    subscores: categoryScores,
    criticalCount,
    highCount,
    mediumCount,
    gaps,
    issues: gaps,
    recommendations,
  };
}
