import React, { useMemo } from 'react';
import { Course } from '../../types';
import { ResponsiveContainer, HeatMap, Cell, Tooltip, XAxis, YAxis, Text } from 'recharts'; // Hypothetical heatmap usage

interface SkillGapHeatmapProps {
  courses: Course[];
}

export const SkillGapHeatmap: React.FC<SkillGapHeatmapProps> = ({ courses }) => {
  const { data, coursesList, itemsList } = useMemo(() => {
    const comps = new Set<string>();
    const skills = new Set<string>();
    
    courses.forEach(c => {
      c.blueprint.targetCompetencies.forEach(x => comps.add(x));
      c.blueprint.requiredSkills.forEach(x => skills.add(x));
    });

    const items = [...Array.from(comps), ...Array.from(skills)];
    const data: any[] = [];
    
    items.forEach((item, itemIdx) => {
        courses.forEach((c, courseIdx) => {
            const cloMatches = c.clos?.filter(clo => 
                (clo.competency === item) || (clo.skills?.split(',').map(s => s.trim()).includes(item))
            ) || [];
            
            const intensity = cloMatches.reduce((sum, clo) => {
                const map = { Novice: 1, Proficient: 2, Expert: 3 };
                return sum + (map[clo.proficiencyLevel || 'Novice'] || 1);
            }, 0);
            
            data.push({ itemIdx, courseIdx, intensity, itemName: item, courseName: c.code });
        });
    });

    return { data, coursesList: courses.map(c => c.code), itemsList: items };
  }, [courses]);

  const getColor = (intensity: number) => {
      if (intensity === 0) return '#f8fafc'; // slate-50
      if (intensity < 3) return '#bae6fd'; // sky-200
      if (intensity < 6) return '#38bdf8'; // sky-400
      if (intensity < 9) return '#0284c7'; // sky-600
      return '#0c4a6e'; // sky-900
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Skill Gap & Proficiency Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th className="p-2 border">Skill/Comp</th>
              {coursesList.map(code => <th key={code} className="p-2 border rotate-90">{code}</th>)}
            </tr>
          </thead>
          <tbody>
            {itemsList.map((item, i) => (
              <tr key={item}>
                <td className="p-2 border font-bold">{item}</td>
                {coursesList.map((code, j) => {
                    const cell = data.find(d => d.itemIdx === i && d.courseIdx === j);
                    return (
                        <td key={code} className="p-2 border text-center" style={{ backgroundColor: getColor(cell?.intensity || 0) }}>
                            {cell?.intensity || 0}
                        </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 text-[10px] items-center">
        <span>0 (Gap)</span>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(0) }} /><span>Gap</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(1) }} /><span>Novice</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(4) }} /><span>Proficient</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(8) }} /><span>Expert</span></div>
        </div>
      </div>
    </div>
  );
};
