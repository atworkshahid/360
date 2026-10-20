import React from 'react';
import { ModularLearningOutcome } from '../../types/mlu';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ProgressTrackerProps {
  mlos: ModularLearningOutcome[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ mlos }) => {
  const data = mlos.map(mlo => ({
    code: mlo.code,
    threshold: mlo.competencyThreshold ?? 0,
    // Assuming a current performance value exists or is mockable for now
    current: Math.floor(Math.random() * 100) 
  }));

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Student Progress Tracker</h2>
      <p className="text-sm text-slate-600">Visualize MLO competency against expected thresholds.</p>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="current" fill="#4f46e5" name="Current Competency" />
            <Bar dataKey="threshold" fill="#94a3b8" name="Expected Threshold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
