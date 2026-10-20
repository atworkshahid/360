import React, { useMemo } from 'react';
import { Course } from '../../types';
import { MLOStatusBadge } from './MLOStatusBadge';

interface MLOStatusTrackerProps {
  course: Course;
}

export const MLOStatusTracker: React.FC<MLOStatusTrackerProps> = ({ course }) => {
  const mloStats = useMemo(() => {
    const mlos = course.modules?.flatMap(m => m.mlos || []) || [];
    const total = mlos.length;
    const approved = mlos.filter(mlo => mlo.status === 'Approved').length;
    const underReview = mlos.filter(mlo => mlo.status === 'Under Review').length;
    const draft = mlos.filter(mlo => mlo.status === 'Draft').length;
    
    return { total, approved, underReview, draft, mlos };
  }, [course.modules]);

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">MLO Status Tracker</h3>
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>Approved: {mloStats.approved}/{mloStats.total}</span>
        <span>Review: {mloStats.underReview}</span>
        <span>Draft: {mloStats.draft}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
        <div className="bg-emerald-500 h-full" style={{ width: `${(mloStats.approved / (mloStats.total || 1)) * 100}%` }} />
        <div className="bg-amber-500 h-full" style={{ width: `${(mloStats.underReview / (mloStats.total || 1)) * 100}%` }} />
        <div className="bg-slate-300 h-full" style={{ width: `${(mloStats.draft / (mloStats.total || 1)) * 100}%` }} />
      </div>
    </div>
  );
};
