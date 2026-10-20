import React, { useMemo } from 'react';
import { Course } from '../../types';
import { calculateTotalAssessmentHours, getWorkloadWarning } from '../../utils/assessmentEffortEstimator';
import { AlertTriangle, Clock } from 'lucide-react';

interface AssessmentEffortEstimatorProps {
  course: Course;
}

export const AssessmentEffortEstimator: React.FC<AssessmentEffortEstimatorProps> = ({ course }) => {
  const totalHours = useMemo(() => calculateTotalAssessmentHours(course.assessments), [course.assessments]);
  const warning = useMemo(() => getWorkloadWarning(totalHours, course.creditHours), [totalHours, course.creditHours]);

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="w-5 h-5 text-slate-500" />
        <h3 className="font-semibold text-slate-800">Assessment Effort Estimator</h3>
      </div>
      
      <div className="text-sm text-slate-600 mb-2">
        Estimated total student hours for assessments: <span className="font-bold text-slate-900">{totalHours} hours</span>
      </div>

      {warning && (
        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{warning}</p>
        </div>
      )}
    </div>
  );
};
