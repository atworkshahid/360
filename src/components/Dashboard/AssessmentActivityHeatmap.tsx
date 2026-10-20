import React, { useMemo } from 'react';
import { Course } from '../../types';

interface AssessmentActivityHeatmapProps {
  courses: Course[];
}

export const AssessmentActivityHeatmap: React.FC<AssessmentActivityHeatmapProps> = ({ courses }) => {
  const { data, coursesList, weeksList } = useMemo(() => {
    const maxWeeks = Math.max(...courses.map(c => c.durationWeeks || 15));
    const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);
    const data: any[] = [];
    
    courses.forEach((c, courseIdx) => {
        weeks.forEach((week, weekIdx) => {
            const weekAssessments = c.assessments?.filter(a => a.scheduledWeek === week) || [];
            const intensity = weekAssessments.reduce((sum, a) => sum + (a.weightage || 0), 0);
            
            data.push({ weekIdx, courseIdx, intensity, week, courseName: c.code || c.title });
        });
    });

    return { data, coursesList: courses.map(c => c.code || c.title), weeksList: weeks };
  }, [courses]);

  const getColor = (intensity: number) => {
      if (intensity === 0) return '#f8fafc'; // slate-50
      if (intensity < 10) return '#dbeafe'; // blue-100
      if (intensity < 20) return '#93c5fd'; // blue-300
      if (intensity < 30) return '#3b82f6'; // blue-500
      return '#1e40af'; // blue-800
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Assessment Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th className="p-2 border">Course</th>
              {weeksList.map(week => <th key={week} className="p-2 border">W{week}</th>)}
            </tr>
          </thead>
          <tbody>
            {coursesList.map((courseName, i) => (
              <tr key={courseName}>
                <td className="p-2 border font-bold text-nowrap">{courseName}</td>
                {weeksList.map((week, j) => {
                    const cell = data.find(d => d.courseIdx === i && d.weekIdx === j);
                    return (
                        <td key={week} className="p-2 border text-center" style={{ backgroundColor: getColor(cell?.intensity || 0) }}>
                            {cell?.intensity > 0 ? `${cell.intensity}%` : ''}
                        </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 text-[10px] items-center">
        <span>Activity Intensity (Weightage %)</span>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(0) }} /><span>Low/None</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(5) }} /><span>Light</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(15) }} /><span>Moderate</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4" style={{ backgroundColor: getColor(25) }} /><span>High Stress</span></div>
        </div>
      </div>
    </div>
  );
};
