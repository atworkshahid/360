import { Course, AuditGap } from '../types';

export const runAccessibilityAudit = (course: Course): AuditGap[] => {
  const gaps: AuditGap[] = [];

  // 1. Scan Lessons for content accessibility
  course.lessons.forEach((lesson) => {
    if (!lesson.requiredActivity || lesson.requiredActivity.length < 20) {
      gaps.push({
        id: `acc-lesson-${lesson.id}-desc`,
        severity: 'Medium',
        category: 'Content Clarity',
        title: `Non-descriptive activity description in "${lesson.title}"`,
        message: 'The activity description is too short to be fully accessible or helpful.',
        recommendation: 'Provide a detailed, step-by-step description of the required student activity.',
        targetStep: 7,
      });
    }
  });

  // 2. Scan Assessments for evidence accessibility
  course.assessments.forEach((assessment) => {
    if (!assessment.evidenceType) {
        gaps.push({
            id: `acc-asmt-${assessment.id}-evidence`,
            severity: 'Medium',
            category: 'Assessment Accessibility',
            title: `Unspecified evidence type in "${assessment.name}"`,
            message: 'The assessment does not specify the type of evidence required, making it difficult for students with disabilities to prepare.',
            recommendation: 'Clearly specify the evidence type (e.g., textual report, audio file, visual submission) and provide alternative formats if needed.',
            targetStep: 8,
        });
    }
  });

  // 3. Scan Rubric Criteria for color-dependence or low-clarity issues
  course.rubrics.forEach((rubric) => {
    rubric.criteria.forEach((criterion) => {
        if (criterion.criterionName.toLowerCase().includes('color') || criterion.criterionName.toLowerCase().includes('visual')) {
            gaps.push({
                id: `acc-rubric-${rubric.id}-${criterion.id}-visual`,
                severity: 'High',
                category: 'Visual Accessibility',
                title: `Potentially color-dependent criteria in "${criterion.criterionName}"`,
                message: 'This criterion relies on visual or color cues, which may not be accessible to students with visual impairments.',
                recommendation: 'Ensure rubric levels are clearly defined with textual descriptions rather than relying on color coding.',
                targetStep: 11,
            });
        }
    });
  });

  // 4. Check course theme
  if (!course.dossierColorTheme) {
      gaps.push({
          id: 'acc-theme-contrast',
          severity: 'Low',
          category: 'Visual Design',
          title: 'Color theme not set',
          message: 'The course color theme has not been set, which might affect default color contrast.',
          recommendation: 'Set a dossier color theme to ensure consistent and accessible color usage.',
          targetStep: 1,
      });
  }

  return gaps;
};
