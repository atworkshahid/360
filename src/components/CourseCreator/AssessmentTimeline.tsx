import React from 'react';
import { Course, Assessment } from '../../../types';
import { Target } from 'lucide-react';

interface AssessmentTimelineProps {
  course: Course;
}

export const AssessmentTimeline: React.FC<AssessmentTimelineProps> = ({ course }) => {
  const assessments = course.assessments || [];
  const durationWeeks = course.modules?.reduce((sum, m) => sum + (m.durationWeeks || 0), 0) || 15;
  const weeks = Array.from({ length: durationWeeks }, (_, i) => i + 1);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">Assessment Timeline</h3>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {weeks.map(week => {
          const weekAssessments = assessments.filter(a => a.scheduledWeek === week);
          const workload = weekAssessments.reduce((sum, a) => sum + (a.weightage || 0), 0);
          
          return (
            <div key={week} className="flex flex-col items-center min-w-[60px]">
              <div className={`w-10 h-24 rounded-lg border flex flex-col justify-end p-1 ${workload > 30 ? 'bg-rose-100 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                {weekAssessments.map((a, idx) => (
                  <div key={a.id} className="text-[8px] bg-indigo-500 text-white rounded p-0.5 mt-0.5 truncate">
                    {a.name.slice(0, 5)}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-1">W{week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
