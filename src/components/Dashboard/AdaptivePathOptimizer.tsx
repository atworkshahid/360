import React, { useMemo } from 'react';
import { Sparkles, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { Course, MLU } from '../../types';

interface AdaptivePathOptimizerProps {
  courses: Course[];
}

export const AdaptivePathOptimizer: React.FC<AdaptivePathOptimizerProps> = ({ courses }) => {
  const suggestions = useMemo(() => {
    // Simulate analysis: find MLUs with low completion rates across courses
    const mluPerformance: Record<string, { title: string, completed: number, total: number }> = {};
    
    courses.forEach(course => {
      course.modules.forEach(module => {
        // Need to link modules to MLUs - assumed based on course structure
        const courseMLUs = (course.mlos || []).filter(mlu => mlu.moduleId === module.id);
        
        courseMLUs.forEach(mlu => {
          if (!mluPerformance[mlu.id]) {
            mluPerformance[mlu.id] = { title: mlu.title || 'Unknown MLU', completed: 0, total: 0 };
          }
          mluPerformance[mlu.id].total += 1;
          if (mlu.isCompleted) {
            mluPerformance[mlu.id].completed += 1;
          }
        });
      });
    });

    // Suggest reordering based on low completion
    const lowPerformingMLUs = Object.entries(mluPerformance)
      .filter(([id, data]) => data.total > 0 && (data.completed / data.total) < 0.5)
      .map(([id, data]) => ({ id, ...data }));

    return lowPerformingMLUs.slice(0, 3).map(mlu => ({
      ...mlu,
      suggestion: `Consider scaffolding this unit with more foundational material or moving it later in the module sequence.`
    }));
  }, [courses]);

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Adaptive Path Optimizer</h3>
      </div>
      
      {suggestions.length === 0 ? (
        <p className="text-sm text-slate-500">No performance bottlenecks detected. Your learning path is optimized.</p>
      ) : (
        <div className="space-y-4">
          {suggestions.map(s => (
            <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800">{s.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{s.suggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
