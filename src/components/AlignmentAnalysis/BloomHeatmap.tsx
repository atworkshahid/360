import React, { useMemo } from 'react';
import { Course, CLO } from '../../types';
import { BLOOM_RANK } from '../../utils/assessmentAnalysis';

interface BloomHeatmapProps {
  course: Course;
  className?: string;
}

export const BloomHeatmap: React.FC<BloomHeatmapProps> = ({ course, className = '' }) => {
  const cloData = useMemo(() => {
    return (course.clos || []).map((clo) => ({
      ...clo,
      rank: BLOOM_RANK[clo.bloomLevel] || 0,
    })).sort((a, b) => a.rank - b.rank);
  }, [course.clos]);

  const getColor = (rank: number) => {
    // 1-2: Lower Order (Blue/Slate), 3-4: Mid (Amber), 5-6: Higher Order (Rose)
    if (rank <= 2) return 'bg-sky-200 text-sky-900';
    if (rank <= 4) return 'bg-amber-200 text-amber-900';
    return 'bg-rose-300 text-rose-950';
  };

  return (
    <div className={`p-5 bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <h3 className="text-sm font-bold text-slate-900 mb-4">CLO Cognitive Level Heatmap</h3>
      <div className="flex flex-wrap gap-2">
        {cloData.map((clo) => (
          <div
            key={clo.id}
            className={`p-3 rounded-lg text-xs font-semibold ${getColor(clo.rank)}`}
            title={`${clo.code}: ${clo.statement} (${clo.bloomLevel})`}
          >
            {clo.code}
            <span className="block text-[10px] opacity-80">{clo.bloomLevel}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sky-200 rounded"></span> Lower Order</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-200 rounded"></span> Mid Order</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-300 rounded"></span> Higher Order</span>
      </div>
    </div>
  );
};
