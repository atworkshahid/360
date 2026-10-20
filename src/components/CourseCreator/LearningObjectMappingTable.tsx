import React from 'react';
import { Course, ResourceItem, CLO } from '../../types';

interface LearningObjectMappingTableProps {
  course: Course;
}

export const LearningObjectMappingTable: React.FC<LearningObjectMappingTableProps> = ({ course }) => {
  const resources = course.resources || [];
  const clos = course.clos || [];
  const modules = course.modules || [];

  if (resources.length === 0 || clos.length === 0) {
    return <div className="p-4 text-xs text-slate-500">No resources or CLOs to map.</div>;
  }

  const isMapped = (resource: ResourceItem, clo: CLO) => {
    if (!resource.moduleId) return false;
    const mod = modules.find(m => m.id === resource.moduleId);
    return mod?.relatedCLOIds.includes(clo.id) || false;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-3 font-bold text-slate-700">Resource / CLO</th>
            {clos.map(clo => (
              <th key={clo.id} className="p-3 font-bold text-slate-700 text-center" title={clo.statement}>
                {clo.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map(res => (
            <tr key={res.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="p-3 font-semibold text-slate-800">{res.title}</td>
              {clos.map(clo => (
                <td key={clo.id} className="p-3 text-center">
                  {isMapped(res, clo) ? (
                    <span className="inline-block w-4 h-4 rounded-full bg-indigo-500" />
                  ) : (
                    <span className="inline-block w-4 h-4 rounded-full bg-slate-200" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
