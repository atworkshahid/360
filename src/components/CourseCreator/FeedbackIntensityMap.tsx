import React, { useMemo } from 'react';
import { Course, CourseElementComment } from '../../types';
import { AlertTriangle, Lightbulb } from 'lucide-react';

interface FeedbackIntensityMapProps {
  course: Course;
}

export const FeedbackIntensityMap: React.FC<FeedbackIntensityMapProps> = ({ course }) => {
  const intensityData = useMemo(() => {
    const comments = course.comments || [];
    const map: Record<string, { title: string; clarification: number; suggestion: number }> = {};

    comments.forEach((c) => {
      if (!c.tags) return;
      const targetId = c.targetId;
      if (!map[targetId]) {
        map[targetId] = { title: c.targetTitle, clarification: 0, suggestion: 0 };
      }
      if (c.tags.includes('Clarification Needed')) map[targetId].clarification += 1;
      if (c.tags.includes('Suggestion')) map[targetId].suggestion += 1;
    });

    return Object.entries(map)
      .map(([id, data]) => ({ id, ...data, total: data.clarification + data.suggestion }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [course.comments]);

  if (intensityData.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Feedback Intensity Map</h3>
      <div className="space-y-3">
        {intensityData.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
            <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={item.title}>{item.title}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-bold">{item.clarification}</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-700">
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="font-bold">{item.suggestion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
