import React from 'react';
import { Course } from '../types';
import { Target, BarChart3, BookOpen } from 'lucide-react';

interface StudentCompetencyPortfolioProps {
  course: Course;
}

export const StudentCompetencyPortfolio: React.FC<StudentCompetencyPortfolioProps> = ({ course }) => {
  // Calculate mastery potential per PLO
  const ploMastery = course.plos.map(plo => {
    // Find all CLOs mapped to this PLO
    const mappedCLOs = course.clos.filter(clo => 
      clo.mappedPLOs.some(m => m.ploId === plo.id)
    );
    
    // Sum weights of mapped CLOs
    const masteryPotential = mappedCLOs.reduce((acc, clo) => acc + (clo.weightage || 0), 0);
    
    return {
      plo,
      masteryPotential,
      mappedCLOs
    };
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 rounded-lg">
      <div className="flex items-center space-x-3 mb-6">
        <Target className="w-8 h-8 text-indigo-600" />
        <h2 className="text-2xl font-bold text-slate-900">Student Competency Portfolio</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ploMastery.map(({ plo, masteryPotential, mappedCLOs }) => (
          <div key={plo.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">{plo.code}: {plo.title}</h3>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {masteryPotential}% Mastery Potential
                </span>
            </div>
            <p className="text-sm text-slate-600">{plo.description}</p>
            
            <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mapped CLOs</h4>
                <div className="space-y-1">
                    {mappedCLOs.map(clo => (
                        <div key={clo.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                            <span>{clo.code}</span>
                            <span className="font-semibold text-indigo-700">{clo.weightage}% Weight</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
