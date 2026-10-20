import React from 'react';
import { calculateCourseAudit } from '../../utils/obeCalculator';
import { Course } from '../../types';
import { ShieldCheck } from 'lucide-react';

interface AccreditationReadinessIndicatorProps {
  course: Course;
  className?: string;
}

export const AccreditationReadinessIndicator: React.FC<AccreditationReadinessIndicatorProps> = ({ 
  course,
  className = ''
}) => {
  const audit = calculateCourseAudit(course);
  const score = audit.healthScore;

  let colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
  if (score >= 80) colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  else if (score >= 60) colorClass = 'text-amber-700 bg-amber-50 border-amber-200';

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-full border text-xs font-bold ${colorClass} ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>{score}% Ready</span>
    </div>
  );
};
