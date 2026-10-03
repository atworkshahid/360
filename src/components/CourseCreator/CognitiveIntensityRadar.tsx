import React, { useMemo } from 'react';
import { Course } from '../../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface CognitiveIntensityRadarProps {
  course: Course;
}

export const CognitiveIntensityRadar: React.FC<CognitiveIntensityRadarProps> = ({ course }) => {
  const data = useMemo(() => {
    const levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    return levels.map(level => {
        const clos = course.clos?.filter(c => c.bloomLevel === level) || [];
        const avg = clos.length > 0 
            ? clos.reduce((acc, c) => {
                const map = { Novice: 1, Proficient: 2, Expert: 3 };
                return acc + (map[c.proficiencyLevel || 'Novice'] || 1);
            }, 0) / clos.length 
            : 0;
        return { level, intensity: avg };
    });
  }, [course.clos]);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200">
      <h4 className="text-xs font-bold text-slate-800 mb-2">Cognitive Intensity Alignment</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="level" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 3]} tickCount={4} />
          <Radar name="Intensity" dataKey="intensity" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
