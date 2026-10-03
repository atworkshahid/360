import React, { useState, useMemo } from 'react';
import { Course, CLO } from '../../types';
import { ChevronRight, Circle, Target } from 'lucide-react';

interface MasteryPathTimelineProps {
  course: Course;
}

export const MasteryPathTimeline: React.FC<MasteryPathTimelineProps> = ({ course }) => {
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    course.clos?.forEach(clo => clo.skills?.split(',').forEach(s => skills.add(s.trim())));
    return Array.from(skills).filter(Boolean);
  }, [course.clos]);

  const [selectedSkill, setSelectedSkill] = useState<string>(allSkills[0] || '');

  const path = useMemo(() => {
    if (!selectedSkill) return [];
    // Sort CLOs based on simple index for now as a proxy for timeline
    return course.clos?.filter(clo => clo.skills?.split(',').map(s => s.trim()).includes(selectedSkill)) || [];
  }, [course.clos, selectedSkill]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Mastery Path Timeline</h3>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-2 py-1"
        >
          {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      
      <div className="space-y-4">
        {path.map((clo, idx) => (
          <div key={clo.id} className="flex gap-4 relative">
            {idx < path.length - 1 && <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-slate-200" />}
            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
              clo.proficiencyLevel === 'Expert' ? 'bg-emerald-100 border-emerald-500' :
              clo.proficiencyLevel === 'Proficient' ? 'bg-blue-100 border-blue-500' :
              'bg-slate-100 border-slate-400'
            }`}>
                <Circle className="w-3 h-3 text-slate-700" />
            </div>
            <div className="space-y-1">
                <div className="font-bold text-slate-800 text-xs">{clo.code}</div>
                <div className="text-slate-600 text-xs">{clo.statement}</div>
                <div className="text-[10px] font-bold text-indigo-700 uppercase">{clo.proficiencyLevel || 'Novice'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
