import { Assessment, AssessmentType } from '../types';

export const ASSESSMENT_HOURS_MAP: Record<AssessmentType, number> = {
  'Quiz': 1,
  'Assignment': 5,
  'Project': 20,
  'Presentation': 4,
  'Case Study': 6,
  'Portfolio': 15,
  'Practical': 8,
  'Discussion': 2,
  'Midterm': 3,
  'Midterm Assessment': 3,
  'Final Assessment': 6,
};

export const calculateTotalAssessmentHours = (assessments: Assessment[]): number => {
  return assessments.reduce((total, assessment) => {
    return total + (ASSESSMENT_HOURS_MAP[assessment.type] || 0);
  }, 0);
};

export const getWorkloadWarning = (totalAssessmentHours: number, creditHours: number): string | null => {
  // A heuristic: 1 credit hour = 45 hours total effort. 
  // Assessments shouldn't exceed 40% of total effort.
  const recommendedMaxHours = creditHours * 45 * 0.4;
  
  if (totalAssessmentHours > recommendedMaxHours) {
    return `Total assessment workload (${totalAssessmentHours} hours) exceeds the recommended threshold (${recommendedMaxHours.toFixed(1)} hours) for a ${creditHours}-credit course. Consider reducing the number or complexity of assessments.`;
  }
  return null;
};
