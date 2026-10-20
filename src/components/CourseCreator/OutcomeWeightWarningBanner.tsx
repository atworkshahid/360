import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { CourseValidationSummary } from '../../../services/courseValidationService';

interface OutcomeWeightWarningBannerProps {
  summary: CourseValidationSummary;
}

export const OutcomeWeightWarningBanner: React.FC<OutcomeWeightWarningBannerProps> = ({ summary }) => {
  const weightIssue = summary.results.find(
    (r) => r.rule === 'OUTCOME_WEIGHT_DISTRIBUTION' && r.severity === 'Error'
  );

  if (!weightIssue) return null;

  return (
    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center space-x-3 mb-4 shadow-sm">
      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
      <div>
        <span className="font-bold">{weightIssue.ruleTitle}</span>
        <p className="opacity-90">{weightIssue.message}</p>
        <p className="font-semibold mt-0.5">{weightIssue.recommendation}</p>
      </div>
    </div>
  );
};
