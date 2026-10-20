import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Course } from '../../types';

interface AssessmentDistributionMapProps {
  course: Course;
}

export const AssessmentDistributionMap: React.FC<AssessmentDistributionMapProps> = ({ course }) => {
  const chartData = useMemo(() => {
    const weeks = Array.from({ length: course.durationWeeks || 15 }, (_, i) => i + 1);
    
    return weeks.map(week => {
      const assessments = course.assessments?.filter(a => a.scheduledWeek === week) || [];
      const formative = assessments.filter(a => !a.isSummative).reduce((sum, a) => sum + (a.weightage || 0), 0);
      const summative = assessments.filter(a => a.isSummative).reduce((sum, a) => sum + (a.weightage || 0), 0);
      return { week: `W${week}`, formative, summative };
    });
  }, [course]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Assessment Distribution Map</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" />
            <YAxis label={{ value: 'Weight (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="formative" name="Formative" stackId="a" fill="#3b82f6" />
            <Bar dataKey="summative" name="Summative" stackId="a" fill="#ef4444" />
            <ReferenceLine y={100} stroke="red" strokeDasharray="3 3" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-500">Visualizes assessment workload balance across the semester. Target: Balanced distribution to avoid assessment clusters.</p>
    </div>
  );
};
