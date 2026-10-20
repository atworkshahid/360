import React, { useState, useMemo } from 'react';
import { ShieldAlert, Trash2, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Course, ResourceItem } from '../../types';

interface ResourceIntegrityCheckerProps {
  course: Course;
  onChange: (updated: Course) => void;
}

export const ResourceIntegrityChecker: React.FC<ResourceIntegrityCheckerProps> = ({ course, onChange }) => {
  const [checked, setChecked] = useState(false);

  const { unused, broken } = useMemo(() => {
    const resources = course.resources || [];
    const usedResourceIds = new Set<string>();
    
    // Check usage
    course.modules.forEach(mod => {
      mod.resources.forEach(res => usedResourceIds.add(res));
    });

    const unusedList = resources.filter(r => !usedResourceIds.has(r.id));
    const brokenList = resources.filter(r => r.type === 'link' && (!r.url || !r.url.startsWith('http')));

    return { unused: unusedList, broken: brokenList };
  }, [course]);

  const handleBatchDelete = (ids: string[]) => {
    onChange({
      ...course,
      resources: (course.resources || []).filter(r => !ids.includes(r.id))
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-rose-600" /> Resource Integrity Checker
      </h3>
      
      <div className="flex gap-4">
        <div className="p-3 bg-amber-50 rounded-lg flex-1 border border-amber-100">
            <p className="text-xs font-bold text-amber-900">Unused Resources</p>
            <p className="text-2xl font-bold text-amber-600">{unused.length}</p>
        </div>
        <div className="p-3 bg-rose-50 rounded-lg flex-1 border border-rose-100">
            <p className="text-xs font-bold text-rose-900">Broken Links</p>
            <p className="text-2xl font-bold text-rose-600">{broken.length}</p>
        </div>
      </div>

      {(unused.length > 0 || broken.length > 0) && (
        <button 
          onClick={() => handleBatchDelete([...unused.map(r => r.id), ...broken.map(r => r.id)])}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-500"
        >
          <Trash2 className="w-4 h-4" /> Batch Delete All Issues
        </button>
      )}
    </div>
  );
};
