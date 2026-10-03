import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LineChart, Line } from 'recharts';
import { Course } from '../../types';
import { BLOOM_RANK } from '../../utils/assessmentAnalysis';
import { getCourseVersions } from '../../services/versionHistoryService';

interface LongitudinalBloomTrackerProps {
  courses: Course[];
  className?: string;
}

export const LongitudinalBloomTracker: React.FC<LongitudinalBloomTrackerProps> = ({
  courses,
  className = '',
}) => {
  const chartData = useMemo(() => {
    return courses
      .map((course) => {
        const clos = course.clos || [];
        if (clos.length === 0) return null;

        const totalRank = clos.reduce((sum, clo) => sum + (BLOOM_RANK[clo.bloomLevel] || 0), 0);
        const avgRank = totalRank / clos.length;

        // Fetch last 5 versions for trend
        const versions = getCourseVersions(course.id).slice(0, 5).reverse();
        const trendData = versions.map((v) => {
          const vClos = v.course.clos || [];
          const vTotalRank = vClos.reduce((sum, clo) => sum + (BLOOM_RANK[clo.bloomLevel] || 0), 0);
          return vClos.length > 0 ? vTotalRank / vClos.length : 0;
        });

        return {
          name: course.code || course.title.substring(0, 15),
          avgBloomRank: avgRank,
          avgBloomLevel: Object.keys(BLOOM_RANK).find(
            (key) => BLOOM_RANK[key as keyof typeof BLOOM_RANK] === Math.round(avgRank)
          ) || 'Remember',
          trendData,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.avgBloomRank - b.avgBloomRank);
  }, [courses]);

  const getColor = (rank: number) => {
    if (rank <= 2) return '#64748b'; // Lower Order (slate)
    if (rank <= 4) return '#f59e0b'; // Mid Order (amber)
    return '#ec4899'; // Higher Order (pink)
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${className}`}>
      <h3 className="text-sm font-bold text-slate-900 mb-2">Longitudinal Cognitive Progression</h3>
      <p className="text-xs text-slate-500 mb-6">
        Average Bloom's intensity and trend (last 5 versions).
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#475569' }}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              domain={[0, 6]}
              tick={{ fontSize: 10, fill: '#475569' }}
              label={{ value: 'Bloom Intensity', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            />
            <Tooltip
              contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
              formatter={(value: number, name: string, item: any) => [
                `${item.payload.avgBloomLevel} (Rank: ${value.toFixed(1)})`,
                'Avg Bloom'
              ]}
            />
            <Bar dataKey="avgBloomRank">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.avgBloomRank)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 mb-3">Cognitive Trend Indicators</h4>
        <div className="space-y-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-semibold text-slate-700 w-24 truncate">{item.name}</span>
              <div className="flex-1 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.trendData.map((v, i) => ({ val: v }))}>
                    <Line type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
