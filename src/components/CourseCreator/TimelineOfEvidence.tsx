import React, { useMemo } from 'react';
import { Course } from '../../types';
import { Clock, BarChart3 } from 'lucide-react';
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

interface TimelineOfEvidenceProps {
  course: Course;
}

const BLOOM_COLORS: Record<string, string> = {
  Remember: '#94a3b8', // slate-400
  Understand: '#38bdf8', // sky-400
  Apply: '#34d399', // emerald-400
  Analyze: '#fbbf24', // amber-400
  Evaluate: '#f43f5e', // rose-500
  Create: '#a855f7', // purple-500
};

export const TimelineOfEvidence: React.FC<TimelineOfEvidenceProps> = ({ course }) => {
  const { assessments = [], mlos = [], durationWeeks = 15 } = course;
  const weeks = Array.from({ length: durationWeeks }, (_, i) => i + 1);

  const cognitiveDistribution = useMemo(() => {
    const counts = { Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0 };
    assessments.forEach(a => {
        if (a.bloomLevel && counts.hasOwnProperty(a.bloomLevel)) {
            counts[a.bloomLevel as keyof typeof counts]++;
        }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assessments]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">Timeline of Evidence & Cognitive Progression</h3>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-4 border-b border-slate-100 mb-6">
        {weeks.map(week => {
          const weekAssessments = assessments.filter(a => a.scheduledWeek === week);
          return (
            <div key={week} className="flex flex-col items-center min-w-[120px]">
              <div className="w-full h-32 rounded-lg border border-slate-200 bg-slate-50 p-2 flex flex-col gap-1 overflow-y-auto">
                {weekAssessments.map(a => {
                  const linkedMLOs = mlos.filter(mlo => a.linkedMLOIds.includes(mlo.id));
                  return (
                    <div key={a.id} className="text-[10px] bg-indigo-100 text-indigo-800 rounded p-1 truncate" title={a.name}>
                      <span className="font-bold">{a.name}</span>
                      {linkedMLOs.length > 0 && (
                          <div className="text-[8px] text-indigo-600">{linkedMLOs.map(mlo => mlo.code).join(', ')}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-1">Week {week}</span>
            </div>
          );
        })}
      </div>

      <div className="h-64">
        <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-700">Cognitive Level Distribution</h4>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cognitiveDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Bar dataKey="value">
              {cognitiveDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BLOOM_COLORS[entry.name] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
