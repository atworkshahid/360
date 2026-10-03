import React, { useState, useMemo } from 'react';
import { Course } from '../../types';

interface MasteryTreeProps {
  course: Course;
}

export const MasteryTree: React.FC<MasteryTreeProps> = ({ course }) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const skillRelationships = useMemo(() => {
    // Simplistic tree: Skills as nodes, CLOs as building blocks
    const nodes: Record<string, string[]> = {};
    const cloMap: Record<string, string[]> = {};

    course.clos?.forEach(clo => {
      const skills = clo.skills?.split(',').map(s => s.trim()) || [];
      skills.forEach(skill => {
        if (!cloMap[skill]) cloMap[skill] = [];
        cloMap[skill].push(`${clo.code}: ${clo.statement}`);
      });
    });
    
    return { cloMap, skills: Object.keys(cloMap) };
  }, [course.clos]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Skill Mastery Tree</h3>
      <div className="flex flex-wrap gap-3">
        {skillRelationships.skills.map(skill => (
          <div 
            key={skill}
            className="relative p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-900 cursor-help"
            onMouseEnter={() => setHoveredSkill(skill)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            {skill}
            {hoveredSkill === skill && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 text-white rounded-lg w-64 z-50 text-[10px] shadow-lg">
                <p className="font-bold mb-1">CLOs building to {skill}:</p>
                <ul className="list-disc list-inside">
                  {skillRelationships.cloMap[skill].map((clo, i) => <li key={i}>{clo}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
