import React, { useMemo } from 'react';
import { Course } from '../../types';

interface CompetencyHeatmapProps {
  courses: Course[];
}

export const CompetencyHeatmap: React.FC<CompetencyHeatmapProps> = ({ courses }) => {
  const heatmapData = useMemo(() => {
    const ploSupport: Record<string, number> = {};

    courses.forEach(course => {
      course.plos.forEach(plo => {
        if (!ploSupport[plo.id]) ploSupport[plo.id] = 0;
        
        // Count assessments mapped to this PLO (via CLOs)
        course.assessments.forEach(assessment => {
            assessment.linkedCLOIds.forEach(cloId => {
                const clo = course.clos.find(c => c.id === cloId);
                if (clo && clo.mappedPLOs.some(mp => mp.ploId === plo.id)) {
                    ploSupport[plo.id]++;
                }
            });
        });
      });
    });

    return { ploSupport, plos: courses.flatMap(c => c.plos) };
  }, [courses]);

  const getColor = (count: number) => {
    if (count === 0) return '#f8fafc'; // slate-50 (underdeveloped)
    if (count < 2) return '#dcfce7'; // green-100
    if (count < 5) return '#86efac'; // green-300
    if (count < 10) return '#22c55e'; // green-500
    return '#166534'; // green-800 (heavily supported)
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Competency Heatmap (PLO Support)</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {heatmapData.plos.map(plo => (
          <div 
            key={plo.id}
            className="p-4 rounded-lg border flex flex-col justify-between"
            style={{ backgroundColor: getColor(heatmapData.ploSupport[plo.id] || 0) }}
          >
            <span className="font-bold text-xs">{plo.code}: {plo.title}</span>
            <span className="text-xs mt-2 font-mono">Support: {heatmapData.ploSupport[plo.id] || 0}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-[10px] items-center mt-4">
        <span>Density:</span>
        <div className="flex items-center gap-1"><div className="w-4 h-4 border" style={{ backgroundColor: getColor(0) }} /><span>None</span></div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 border" style={{ backgroundColor: getColor(1) }} /><span>Low</span></div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 border" style={{ backgroundColor: getColor(6) }} /><span>High</span></div>
      </div>
    </div>
  );
};
