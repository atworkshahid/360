import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Course, Assessment, AssessmentType, BloomLevel } from '../../../types';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot?: (prompt: string) => void;
}

const ASSESSMENT_TYPES: AssessmentType[] = [
  'Quiz',
  'Assignment',
  'Midterm',
  'Project',
  'Presentation',
  'Case Study',
  'Practical',
  'Final Assessment',
];

const BLOOM_LEVELS: BloomLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

export const Step08AssessmentPlan: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
}) => {
  const clos = course.clos || [];
  const assessments: Assessment[] = course.assessments || [];

  const totalWeight = assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.05;

  const handleUpdateAssessment = (id: string, updates: Partial<Assessment>) => {
    const updated = assessments.map((a) => (a.id === id ? { ...a, ...updates } : a));
    onChange({ ...course, assessments: updated });
  };

  const handleAddAssessment = () => {
    const newAsmt: Assessment = {
      id: `asmt-${Date.now()}`,
      name: `New Assessment ${assessments.length + 1}`,
      type: 'Assignment',
      linkedCLOIds: clos[0] ? [clos[0].id] : [],
      linkedMLOIds: [],
      bloomLevel: 'Apply',
      evidenceType: 'Direct',
      marks: 50,
      weightage: Math.max(5, 100 - totalWeight),
      achievementThreshold: 60,
      isSummative: true,
      directOrIndirect: 'Direct',
      questions: [],
    };
    onChange({ ...course, assessments: [...assessments, newAsmt] });
  };

  const handleRemoveAssessment = (id: string) => {
    onChange({
      ...course,
      assessments: assessments.filter((a) => a.id !== id),
    });
  };

  // Find unassessed CLOs
  const assessedCLOIds = new Set<string>();
  assessments.forEach((a) => {
    (a.linkedCLOIds || []).forEach((id) => assessedCLOIds.add(id));
  });
  const unassessedCLOs = clos.filter(
    (c) => !assessedCLOIds.has(c.id) && !assessedCLOIds.has(c.code)
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 08 of 10</span>
            <span>•</span>
            <span>Evidence & Evaluation</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Assessment Plan & Weightage Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define direct and authentic assessment instruments. The cumulative weight of all components must equal exactly 100%.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddAssessment}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assessment Instrument</span>
        </button>
      </div>

      {/* Live Weightage Indicator Bar */}
      <div
        className={`p-4 rounded-xl border-2 flex flex-wrap items-center justify-between gap-4 transition ${
          isWeightValid
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-rose-50/70 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              isWeightValid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {Math.round(totalWeight)}%
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">
              {isWeightValid
                ? 'Assessment Weightage Perfectly Calibrated (100%)'
                : `Total Weightage is ${totalWeight}% (Discrepancy: ${
                    totalWeight < 100
                      ? `Missing ${100 - totalWeight}%`
                      : `Exceeds by ${totalWeight - 100}%`
                  })`}
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isWeightValid
                ? 'All grading components add up to exactly 100.0%. Valid for student transcripts and accreditation audits.'
                : 'Accreditation standard mandate: Total weightage must sum to exactly 100%.'}
            </p>
          </div>
        </div>

        {/* Progress visual bar */}
        <div className="w-full sm:w-60">
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isWeightValid
                  ? 'bg-emerald-600'
                  : totalWeight > 100
                  ? 'bg-rose-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, totalWeight)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unassessed Outcome Warning */}
      {unassessedCLOs.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Unmeasured Outcomes:</strong> Outcome(s){' '}
            <strong>{unassessedCLOs.map((c) => c.code).join(', ')}</strong> have no linked assessment instrument. Students cannot demonstrate achievement without direct evaluation.
          </span>
        </div>
      )}

      {/* Assessment Cards List */}
      <div className="space-y-4">
        {assessments.map((asmt, idx) => (
          <div
            key={asmt.id}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs space-y-4 transition"
          >
            {/* Top Row: Name, Type, Weight, Marks, Delete */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={asmt.name}
                  onChange={(e) => handleUpdateAssessment(asmt.id, { name: e.target.value })}
                  className="font-bold text-xs text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 flex-1"
                  placeholder="Assessment Instrument Name..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Type */}
                <select
                  value={asmt.type}
                  onChange={(e) =>
                    handleUpdateAssessment(asmt.id, { type: e.target.value as AssessmentType })
                  }
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                >
                  {ASSESSMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* Weightage */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-500">Weight:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={asmt.weightage}
                    onChange={(e) =>
                      handleUpdateAssessment(asmt.id, { weightage: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-indigo-200 bg-indigo-50/40 text-indigo-900 text-center"
                  />
                  <span className="text-[11px] font-bold text-indigo-900">%</span>
                </div>

                {/* Marks */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-500">Marks:</span>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={asmt.marks || 100}
                    onChange={(e) =>
                      handleUpdateAssessment(asmt.id, { marks: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAssessment(asmt.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                  title="Remove Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle Row: Cognitive Level, Summative/Formative, Direct/Indirect */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Target Cognitive Domain (Bloom)
                </label>
                <select
                  value={asmt.bloomLevel || 'Apply'}
                  onChange={(e) =>
                    handleUpdateAssessment(asmt.id, { bloomLevel: e.target.value as BloomLevel })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {BLOOM_LEVELS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Evaluation Role
                </label>
                <select
                  value={asmt.isSummative ? 'summative' : 'formative'}
                  onChange={(e) =>
                    handleUpdateAssessment(asmt.id, { isSummative: e.target.value === 'summative' })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="summative">Summative (High-Stakes Graded)</option>
                  <option value="formative">Formative (Developmental Diagnostic)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Evidence Character
                </label>
                <select
                  value={asmt.directOrIndirect || 'Direct'}
                  onChange={(e) =>
                    handleUpdateAssessment(asmt.id, {
                      directOrIndirect: e.target.value as 'Direct' | 'Indirect',
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Direct">Direct Evidence (Student Work / Code / Exam)</option>
                  <option value="Indirect">Indirect Evidence (Survey / Self-Appraisal)</option>
                </select>
              </div>
            </div>

            {/* Bottom Row: Linked CLOs Checkbox Chips */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-600">Assessed CLO(s):</span>
              {clos.map((clo) => {
                const isLinked = (asmt.linkedCLOIds || []).includes(clo.id);
                return (
                  <button
                    key={clo.id}
                    type="button"
                    onClick={() => {
                      const current = asmt.linkedCLOIds || [];
                      const next = isLinked
                        ? current.filter((id) => id !== clo.id)
                        : [...current, clo.id];
                      handleUpdateAssessment(asmt.id, { linkedCLOIds: next });
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer border ${
                      isLinked
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {clo.code} ({clo.bloomLevel})
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Auto Assessment-CLO Matrix Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Assessment-Outcome Coverage Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 font-bold text-slate-700">Assessment Instrument</th>
                <th className="p-3 font-bold text-slate-700 text-center">Weight</th>
                {clos.map((c) => (
                  <th key={c.id} className="p-3 font-bold text-slate-700 text-center font-mono">
                    {c.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{a.name}</td>
                  <td className="p-3 text-center font-bold text-indigo-700">{a.weightage}%</td>
                  {clos.map((c) => {
                    const isLinked = (a.linkedCLOIds || []).includes(c.id);
                    return (
                      <td key={c.id} className="p-3 text-center">
                        {isLinked ? (
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center justify-center">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teaching Activities</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Course Alignment Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
