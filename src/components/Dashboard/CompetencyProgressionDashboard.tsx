import React, { useMemo } from 'react';
import { Course } from '../../types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CompetencyProgressionDashboardProps {
  courses: Course[];
}

export const CompetencyProgressionDashboard: React.FC<CompetencyProgressionDashboardProps> = ({ courses }) => {
  const competencyData = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    
    courses.forEach(course => {
      course.clos?.forEach(clo => {
        if (clo.competency) {
          if (!map[clo.competency]) map[clo.competency] = { total: 0, count: 0 };
          map[clo.competency].total += 1; // Simplistic aggregation: count of CLOs covering the competency
          map[clo.competency].count += 1;
        }
      });
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      value: data.total
    })).sort((a, b) => b.value - a.value).slice(0, 8); // Top 8
  }, [courses]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-6">Cumulative Competency Development</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
            <Radar
              name="Competency Coverage"
              dataKey="value"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.6}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
