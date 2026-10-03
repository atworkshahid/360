import React, { useMemo } from 'react';
import { Course } from '../../types';
import { BLOOM_RANK } from '../../utils/assessmentAnalysis';
import { getCourseVersions } from '../../services/versionHistoryService';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface BloomTrendReportProps {
  courses: Course[];
}

export const BloomTrendReport: React.FC<BloomTrendReportProps> = ({ courses }) => {
  const reportData = useMemo(() => {
    return courses.map((course) => {
      const versions = getCourseVersions(course.id).slice(0, 5).reverse();
      const versionData = versions.map((v) => {
        const clos = v.course.clos || [];
        const avgRank = clos.length > 0 
          ? clos.reduce((sum, clo) => sum + (BLOOM_RANK[clo.bloomLevel] || 0), 0) / clos.length 
          : 0;
        return { versionNumber: v.versionNumber, avgRank };
      });
      
      const currentAvg = versionData.length > 0 ? versionData[versionData.length - 1].avgRank : 0;
      const prevAvg = versionData.length > 1 ? versionData[versionData.length - 2].avgRank : currentAvg;
      const trend = currentAvg - prevAvg;

      return {
        id: course.id,
        name: course.code || course.title.substring(0, 15),
        versionData,
        trend,
      };
    });
  }, [courses]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Bloom's Taxonomy Cognitive Intensity Trend</h3>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider">Course</th>
            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider text-center">Progression (Last 5)</th>
            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider text-center">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reportData.map((row) => (
            <tr key={row.id}>
              <td className="py-3 px-3 font-semibold text-slate-800">{row.name}</td>
              <td className="py-3 px-3 w-48 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={row.versionData}>
                    <Line type="monotone" dataKey="avgRank" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <XAxis dataKey="versionNumber" hide />
                    <YAxis domain={[0, 6]} hide />
                  </LineChart>
                </ResponsiveContainer>
              </td>
              <td className="py-3 px-3 text-center">
                <div className={`flex items-center justify-center gap-1 font-bold ${row.trend > 0.1 ? 'text-emerald-600' : row.trend < -0.1 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {row.trend > 0.1 ? <TrendingUp className="w-3 h-3" /> : row.trend < -0.1 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {row.trend.toFixed(2)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
