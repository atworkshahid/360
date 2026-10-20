import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Course } from '../../types';
import { TimelineOfEvidence } from './TimelineOfEvidence';
import { CognitiveDepthChart } from './CognitiveDepthChart';

interface VisualizationTabProps {
  course: Course;
}

export const VisualizationTab: React.FC<VisualizationTabProps> = ({ course }) => {
  const chartData = useMemo(() => {
    const data: any[] = [];
    
    // Simple matrix calculation
    // X axis: CLOs, Y axis: PLOs
    course.clos?.forEach((clo, cloIdx) => {
      course.ploMapping?.[clo.id] && Object.keys(course.ploMapping[clo.id]).forEach((ploCode) => {
        data.push({
          clo: clo.code || `CLO${cloIdx + 1}`,
          plo: ploCode,
          mapped: 1, // Represents a mapping exists
        });
      });
    });

    return data;
  }, [course.clos, course.ploMapping]);

  const orphans = useMemo(() => {
    // Logic to find MLOs without assessment evidence
    return course.mlos?.filter(mlo => !mlo.evidence || mlo.evidence.trim() === '').map(mlo => mlo.id) || [];
  }, [course.mlos]);

  return (
    <div className="space-y-6">
        <CognitiveDepthChart course={course} />
        <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Mapping Matrix: PLO to CLO</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="category" dataKey="clo" name="CLO" />
                <YAxis type="category" dataKey="plo" name="PLO" />
                <ZAxis type="number" dataKey="mapped" range={[100, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Alignment" data={chartData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Orphan Outcomes (Lacking Evidence)</h3>
            {orphans.length === 0 ? (
              <p className="text-sm text-emerald-600">No orphan outcomes detected.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-red-600">
                {orphans.map((id, idx) => (
                  <li key={idx}>MLO ID: {id}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <TimelineOfEvidence course={course} />
    </div>
  );
};
