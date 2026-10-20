import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Course } from '../../types';

interface CompetencyProgressRadarProps {
  courses: Course[];
}

export const CompetencyProgressRadar: React.FC<CompetencyProgressRadarProps> = ({ courses }) => {
  const data = React.useMemo(() => {
    const competencyMap: Record<string, { totalWeight: number }> = {};

    courses.forEach((course) => {
      course.clos?.forEach((clo) => {
        if (clo.competency && clo.weightage) {
          if (!competencyMap[clo.competency]) {
            competencyMap[clo.competency] = { totalWeight: 0 };
          }
          competencyMap[clo.competency].totalWeight += clo.weightage;
        }
      });
    });

    return Object.entries(competencyMap)
      .map(([name, { totalWeight }]) => ({
        competency: name,
        progress: Math.min(totalWeight, 100), // Cap at 100 for visualization
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6); // Show top 6
  }, [courses]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-2">Competency Domain Progress</h3>
      <p className="text-xs text-slate-500 mb-4">
        Visualizes the distribution of assessment weightage across core competency domains.
      </p>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="competency" tick={{ fontSize: 10, fill: '#334155' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
            <Radar
              name="Progress %"
              dataKey="progress"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
