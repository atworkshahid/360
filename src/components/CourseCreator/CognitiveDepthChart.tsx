import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Course } from '../../types';

interface CognitiveDepthChartProps {
  course: Course;
}

const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

export const CognitiveDepthChart: React.FC<CognitiveDepthChartProps> = ({ course }) => {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      Remember: 0,
      Understand: 0,
      Apply: 0,
      Analyze: 0,
      Evaluate: 0,
      Create: 0,
    };
    
    course.mlos?.forEach((mlo) => {
      if (mlo.bloomLevel && counts.hasOwnProperty(mlo.bloomLevel)) {
        counts[mlo.bloomLevel]++;
      }
    });

    return BLOOM_LEVELS.map((name) => ({
      name,
      count: counts[name],
    }));
  }, [course.mlos]);

  const lotsCount = chartData.slice(0, 2).reduce((sum, item) => sum + item.count, 0);
  const hotsCount = chartData.slice(2).reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold mb-2">Cognitive Depth Distribution</h2>
      <p className="text-sm text-slate-500 mb-6">
        Summary: {lotsCount} Lower-Order (LOTS) vs. {hotsCount} Higher-Order (HOTS) outcomes.
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index < 2 ? '#94a3b8' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
