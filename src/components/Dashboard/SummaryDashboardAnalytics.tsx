import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Course } from '../../types';

interface SummaryDashboardAnalyticsProps {
  courses: Course[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const SummaryDashboardAnalytics: React.FC<SummaryDashboardAnalyticsProps> = ({ courses }) => {
  // 1. Completion Status Data
  const completionData = useMemo(() => {
    const completed = courses.filter((c) => c.status === 'approved' || c.status === 'ready_for_review').length;
    const inProgress = courses.filter((c) => c.status === 'draft').length;
    const submitted = courses.filter((c) => c.status === 'submitted').length;
    
    return [
      { name: 'Completed', value: completed },
      { name: 'In Progress', value: inProgress },
      { name: 'Submitted', value: submitted },
    ];
  }, [courses]);

  // 2. MLOs per Course Data
  const mloData = useMemo(() => {
    return courses.map((c) => ({
      name: c.code || c.title.substring(0, 10),
      mlos: (c.mlos || []).length,
    }));
  }, [courses]);

  // 3. Framework Distribution Data
  const frameworkData = useMemo(() => {
    const distribution: Record<string, number> = {};
    courses.forEach((c) => {
      const framework = c.accreditationFramework || 'Unknown';
      distribution[framework] = (distribution[framework] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [courses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Course Completion */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Course Completion Status</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={completionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MLOs per Course */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-2">MLOs per Course</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mloData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="mlos" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pedagogical Frameworks */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Pedagogical Frameworks</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={frameworkData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>
                {frameworkData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
