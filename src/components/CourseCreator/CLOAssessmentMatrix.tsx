import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Course } from '../../../types';

interface CLOAssessmentMatrixProps {
  course: Course;
}

export const CLOAssessmentMatrix: React.FC<CLOAssessmentMatrixProps> = ({ course }) => {
  const { clos, assessments } = course;

  const data = [];
  clos.forEach((clo, cloIndex) => {
    assessments.forEach((assessment, assessmentIndex) => {
      const isLinked = assessment.linkedCLOIds.includes(clo.id) || (assessment.cloIds?.includes(clo.id));
      data.push({
        clo: clo.code,
        cloIndex,
        assessment: assessment.name,
        assessmentIndex,
        linked: isLinked ? 1 : 0,
        z: isLinked ? 100 : 20,
      });
    });
  });

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">CLO vs Assessment Matrix</h3>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="assessmentIndex" name="Assessment" unit="" hide />
            <YAxis type="number" dataKey="cloIndex" name="CLO" unit="" hide />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.linked ? '#4f46e5' : '#e2e8f0'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-slate-600">
        <p>This matrix visualizes the alignment between CLOs (rows) and Assessments (columns). Blue cells indicate direct alignment, identifying outcomes with adequate assessment coverage.</p>
      </div>
    </div>
  );
};
