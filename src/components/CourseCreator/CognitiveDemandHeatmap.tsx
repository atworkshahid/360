import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Course } from '../../types';
import { BLOOM_TAXONOMY_DATA } from '../CourseCreator/BloomsTaxonomyHelperModal';

interface CognitiveDemandHeatmapProps {
  course: Course;
}

export const CognitiveDemandHeatmap: React.FC<CognitiveDemandHeatmapProps> = ({ course }) => {
  const data = useMemo(() => {
    return course.modules.map((mod) => {
      const moduleCLOs = course.clos.filter((clo) => mod.relatedCLOIds?.includes(clo.id));
      const totalLevel = moduleCLOs.reduce((sum, clo) => {
        return sum + (BLOOM_TAXONOMY_DATA[clo.bloomLevel]?.number || 0);
      }, 0);
      const avgLevel = moduleCLOs.length > 0 ? totalLevel / moduleCLOs.length : 0;
      
      return {
        name: `M${mod.number}`,
        avgLevel: avgLevel,
        title: mod.title
      };
    });
  }, [course]);

  const getColor = (level: number) => {
    if (level === 0) return '#f1f5f9'; // slate-100
    if (level <= 2) return '#3b82f6'; // blue-500
    if (level <= 4) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="h-48 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-xs font-bold text-slate-900 mb-2">Cognitive Demand Heatmap</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" fontSize={10} />
          <YAxis domain={[0, 6]} hide />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                        <div className="bg-slate-900 text-white text-[10px] p-2 rounded shadow">
                            <p className="font-bold">{d.title}</p>
                            <p>Avg Bloom Level: {d.avgLevel.toFixed(1)}</p>
                        </div>
                    );
                }
                return null;
            }}
          />
          <Bar dataKey="avgLevel">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.avgLevel)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
