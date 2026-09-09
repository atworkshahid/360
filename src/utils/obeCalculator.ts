import { Course, CourseAuditReport, AuditGap } from '../types';
import { CourseValidationService } from '../services/courseValidationService';

/**
 * Unified OBE Accreditation & Quality Auditor
 * Harmonized source of truth delegating to CourseValidationService
 */
export function calculateCourseAudit(course: Course): CourseAuditReport {
  const summary = CourseValidationService.validateCourse(course);

  // Map CourseValidationRuleResult[] to AuditGap[]
  const gaps: AuditGap[] = summary.results
    .filter((r) => r.severity !== 'Passed')
    .map((r, idx) => {
      let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
      if (r.severity === 'Error') severity = 'Critical';
      else if (r.severity === 'Warning') severity = 'High';
      else if (r.severity === 'Suggestion') severity = 'Medium';

      let category = 'Instructional Alignment';
      if (r.rule === 'COURSE_REQUIRED_FIELDS' || r.rule === 'COURSE_COMPLETENESS') {
        category = 'Course Information';
      } else if (r.rule === 'CLO_MEASURABLE_VERB' || r.rule === 'CLO_BLOOM_VALID') {
        category = 'CLO Quality';
      } else if (r.rule === 'CLO_FRAMEWORK_MAPPING') {
        category = 'CLO-PLO Mapping';
      } else if (r.rule === 'CLO_WEEKLY_COVERAGE') {
        category = 'Instructional Plan';
      } else if (
        r.rule === 'ASSESSMENT_WEIGHT_TOTAL' ||
        r.rule === 'CLO_ASSESSMENT_COVERAGE' ||
        r.rule === 'ASSESSMENT_BLOOM_ALIGNMENT'
      ) {
        category = 'Assessment Coverage';
      } else if (r.rule === 'RUBRIC_ALIGNMENT') {
        category = 'Rubric Alignment';
      } else if (r.rule === 'EVIDENCE_RULES') {
        category = 'Evidence Rules';
      }

      return {
        id: `gap-${r.rule.toLowerCase()}-${r.affectedEntityId || idx}`,
        severity,
        category,
        title: r.ruleTitle,
        message: r.message,
        recommendation: r.recommendation,
        targetStep: r.targetStep,
      };
    });

  // Actionable recommendations
  const recommendations: string[] = [];
  if (summary.criticalCount > 0) {
    recommendations.push('Resolve all Critical accreditation gaps to satisfy mandatory OBE compliance gates.');
  }
  if (summary.categoryScores.assessmentCoverage < 90) {
    recommendations.push(
      `Ensure total assessment weight sums to exactly 100% (currently ${summary.totalAssessmentWeight}%) and assesses all learning outcomes.`
    );
  }
  if (summary.categoryScores.cloQuality < 85) {
    recommendations.push('Utilize Bloom taxonomy action verbs to eliminate passive or non-observable wording.');
  }
  if (summary.categoryScores.cloPloMapping < 100) {
    recommendations.push('Complete the CLO-to-PLO matrix to assure programmatic graduate attribute coverage.');
  }
  if (summary.categoryScores.rubricAlignment < 100) {
    recommendations.push('Attach multi-tier analytic rubrics to subjective and qualitative assignments.');
  }
  if (summary.categoryScores.evidenceCoverage < 100) {
    recommendations.push('Establish direct achievement threshold rules (e.g. score ≥ 60%) across all course outcomes.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Course demonstrates strong constructive alignment and is ready for academic accreditation review!');
  }

  // Calculate completion percentage across 15 steps (supporting both 10-step macro and 15-step micro formats)
  let completedSteps = 0;
  if (course.title && course.code && (course.description || course.courseRationale)) completedSteps++; // Step 1 / Info
  if (course.blueprint?.purpose || course.learningPromise) completedSteps++; // Step 2 / Purpose
  if (course.frameworkId) completedSteps++; // Framework
  if ((course.clos || []).length >= 3) completedSteps++; // Outcomes
  if ((course.clos || []).some((c) => c.mappedPLOs && c.mappedPLOs.length > 0)) completedSteps++; // Mapping
  
  // Instructional coverage (either weeklyPlan or modules)
  const hasInstructionalSchedule =
    (course.weeklyPlan && course.weeklyPlan.length >= 4) ||
    (course.modules && course.modules.length >= 2);
  if (hasInstructionalSchedule) completedSteps++; // Syllabus / Modules
  
  if ((course.mlos || []).length >= 2 || (course.weeklyPlan && course.weeklyPlan.some((w) => w.learningActivity))) completedSteps++; // MLOs / Activities
  if ((course.lessons || []).length >= 2 || (course.weeklyPlan && course.weeklyPlan.length >= 8)) completedSteps++; // Lessons / Schedule
  if ((course.activities || []).length >= 2 || (course.weeklyPlan && course.weeklyPlan.length >= 10)) completedSteps++; // Activities
  if ((course.assessments || []).length >= 2 && Math.abs(summary.totalAssessmentWeight - 100) < 0.1) completedSteps++; // Assessment Plan
  if ((course.assessments || []).some((a) => a.questions && a.questions.length > 0)) completedSteps++; // Questions
  if ((course.rubrics || []).length > 0) completedSteps++; // Rubrics
  if ((course.evidenceRules || []).length > 0) completedSteps++; // Evidence Rules
  if (summary.readinessScore >= 75) completedSteps++; // Alignment / Audit
  if (course.status && course.status !== 'draft') completedSteps++; // Workflow status

  const completionPercentage = Math.min(100, Math.round((completedSteps / 15) * 100));

  return {
    healthScore: summary.readinessScore,
    completionPercentage,
    categoryScores: summary.categoryScores,
    subscores: summary.categoryScores,
    criticalCount: summary.criticalCount,
    highCount: summary.warningCount,
    mediumCount: summary.suggestionCount,
    gaps,
    issues: gaps,
    recommendations,
    readinessScore: summary.readinessScore,
    passedCount: summary.passedCount,
    totalChecks: summary.totalChecks,
    isCompliant: summary.isCompliant,
  };
}
