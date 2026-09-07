import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Scale,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  Check,
  Undo2,
} from 'lucide-react';
import { Course, Assessment, AssessmentType, BloomLevel } from '../../../types';
import {
  analyzeAssessmentPlan,
  generateBalancedAssessmentPlan,
  BLOOM_RANK,
} from '../../../utils/assessmentAnalysis';
import { AlignmentAnalysisReport } from '../../AlignmentAnalysis/AlignmentAnalysisReport';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

const ASSESSMENT_TYPES: AssessmentType[] = [
  'Quiz',
  'Assignment',
  'Project',
  'Presentation',
  'Case Study',
  'Portfolio',
  'Practical',
  'Discussion',
  'Midterm Assessment',
  'Final Assessment',
];

export const Step09AssessmentDesigner: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
}) => {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    course.assessments[0]?.id || ''
  );
  const [activeSubTab, setActiveSubTab] = useState<'designer' | 'analysis'>('designer');
  const [previousAssessments, setPreviousAssessments] = useState<Assessment[] | null>(null);
  const [calibrationNotice, setCalibrationNotice] = useState<string>('');

  const selectedAssessment =
    course.assessments.find((a) => a.id === selectedAssessmentId) || course.assessments[0];

  const totalAssessmentWeightage = course.assessments.reduce(
    (acc, a) => acc + (a.weightage || 0),
    0
  );

  // Compute live assessment analysis report
  const analysis = analyzeAssessmentPlan(course);

  const handleUpdateAssessment = (id: string, updates: Partial<Assessment>) => {
    const updated = course.assessments.map((a) => (a.id === id ? { ...a, ...updates } : a));
    onChange({ ...course, assessments: updated });
  };

  const handleAddAssessment = () => {
    const nextNum = course.assessments.length + 1;
    const remainingWeight = Math.max(0, 100 - totalAssessmentWeightage);
    const clo = course.clos[0];

    const newAsmt: Assessment = {
      id: `asmt-${Date.now()}`,
      name: `Assessment ${nextNum}: Performance Task`,
      type: 'Assignment',
      linkedCLOIds: clo ? [clo.id] : [],
      linkedMLOIds: [],
      bloomLevel: 'Apply',
      evidenceType: 'Direct',
      marks: 50,
      weightage: remainingWeight || 20,
      achievementThreshold: 60,
      isSummative: true,
      directOrIndirect: 'Direct',
      questions: [],
    };

    const updated = [...course.assessments, newAsmt];
    onChange({ ...course, assessments: updated });
    setSelectedAssessmentId(newAsmt.id);
  };

  const handleDeleteAssessment = (id: string) => {
    if (course.assessments.length <= 1) {
      alert('A course must have at least one assessment.');
      return;
    }
    const filtered = course.assessments.filter((a) => a.id !== id);
    onChange({ ...course, assessments: filtered });
    if (selectedAssessmentId === id) {
      setSelectedAssessmentId(filtered[0]?.id || '');
    }
  };

  const toggleCLOLink = (cloId: string) => {
    if (!selectedAssessment) return;
    const current = selectedAssessment.linkedCLOIds || [];
    const updated = current.includes(cloId)
      ? current.filter((id) => id !== cloId)
      : [...current, cloId];
    handleUpdateAssessment(selectedAssessment.id, { linkedCLOIds: updated });
  };

  const handleApplyCalibration = () => {
    setPreviousAssessments(course.assessments);
    const calibrated = generateBalancedAssessmentPlan(course);
    onChange({ ...course, assessments: calibrated });
    if (calibrated.length > 0) {
      setSelectedAssessmentId(calibrated[0].id);
    }
    setCalibrationNotice(
      'Balanced calibration successfully applied! Assessment weights and Bloom levels have been harmonized across all CLOs.'
    );
  };

  const handleUndoCalibration = () => {
    if (previousAssessments) {
      onChange({ ...course, assessments: previousAssessments });
      setPreviousAssessments(null);
      setCalibrationNotice('Reverted back to previous assessment configuration.');
      if (previousAssessments.length > 0) {
        setSelectedAssessmentId(previousAssessments[0].id);
      }
    }
  };

  const discrepanciesCount =
    analysis.overAssessedCLOs.length +
    analysis.underAssessedCLOs.length +
    analysis.cognitiveDeficitCLOs.length;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 09</span>
          <span>•</span>
          <span>Performance Measurement & Alignment</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Assessment Designer & Blueprint</h2>
            <p className="text-xs text-slate-500 mt-1">
              Constructively align assessment tasks with Course Learning Outcomes and balance direct evidence distribution.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${
                totalAssessmentWeightage === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              <span>Total Weight:</span>
              <span>{totalAssessmentWeightage}%</span>
              {totalAssessmentWeightage !== 100 && (
                <span className="text-[10px] text-amber-800 font-normal">
                  ({100 - totalAssessmentWeightage > 0 ? `need +${100 - totalAssessmentWeightage}%` : `over by ${totalAssessmentWeightage - 100}%`})
                </span>
              )}
            </div>

            <button
              onClick={handleAddAssessment}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('designer')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'designer'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Assessment Tasks & Rubric Linkage</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('analysis')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'analysis'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>CLO Coverage & Balance Audit Report</span>
          {discrepanciesCount > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              {discrepanciesCount} Discrepancies
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Harmonized ✓
            </span>
          )}
        </button>
      </div>

      {/* Calibration Notice Banner */}
      {calibrationNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{calibrationNotice}</span>
          </div>
          {previousAssessments && (
            <button
              type="button"
              onClick={handleUndoCalibration}
              className="flex items-center space-x-1 font-bold text-emerald-900 underline hover:text-emerald-950 cursor-pointer text-xs"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo Calibration</span>
            </button>
          )}
        </div>
      )}

      {/* VIEW 1: DESIGNER VIEW */}
      {activeSubTab === 'designer' && (
        <div className="space-y-6">
          {/* Unassessed Warning Banner */}
          {analysis.unassessedCLOs.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-xs text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Critical Alignment Defect: Unassessed CLOs Detected!</span>
                <p className="mt-0.5">
                  The following CLOs have no assigned assessments: <strong>{analysis.unassessedCLOs.map((c) => c.code).join(', ')}</strong>. In OBE accreditation, unassessed outcomes cannot be certified.
                </p>
              </div>
            </div>
          )}

          {/* Assessment Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {course.assessments.map((asmt) => (
              <button
                key={asmt.id}
                onClick={() => setSelectedAssessmentId(asmt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border cursor-pointer ${
                  (selectedAssessment?.id || '') === asmt.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                  {asmt.type}
                </span>
                <span className="max-w-[130px] truncate">{asmt.name}</span>
                <span className="text-[10px] font-bold text-slate-400">({asmt.weightage}%)</span>
              </button>
            ))}
          </div>

          {/* Selected Assessment Form */}
          {selectedAssessment && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-800">Assessment Configuration</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{selectedAssessment.type}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAssessment(selectedAssessment.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Delete Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assessment Title & Task Name
                  </label>
                  <input
                    type="text"
                    value={selectedAssessment.name}
                    onChange={(e) => handleUpdateAssessment(selectedAssessment.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Type</label>
                  <select
                    value={selectedAssessment.type}
                    onChange={(e) =>
                      handleUpdateAssessment(selectedAssessment.id, {
                        type: e.target.value as AssessmentType,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {ASSESSMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={selectedAssessment.marks}
                    onChange={(e) =>
                      handleUpdateAssessment(selectedAssessment.id, { marks: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={selectedAssessment.weightage}
                    onChange={(e) =>
                      handleUpdateAssessment(selectedAssessment.id, { weightage: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bloom Level</label>
                  <select
                    value={selectedAssessment.bloomLevel}
                    onChange={(e) =>
                      handleUpdateAssessment(selectedAssessment.id, {
                        bloomLevel: e.target.value as BloomLevel,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Remember">Remember (L1)</option>
                    <option value="Understand">Understand (L2)</option>
                    <option value="Apply">Apply (L3)</option>
                    <option value="Analyze">Analyze (L4)</option>
                    <option value="Evaluate">Evaluate (L5)</option>
                    <option value="Create">Create (L6)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pass Threshold (%)</label>
                  <input
                    type="number"
                    value={selectedAssessment.achievementThreshold}
                    onChange={(e) =>
                      handleUpdateAssessment(selectedAssessment.id, {
                        achievementThreshold: Number(e.target.value) || 50,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* CLO Mapping checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Mapped Course Learning Outcomes (Direct Alignment)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {course.clos.map((clo) => {
                    const isChecked = (selectedAssessment.linkedCLOIds || []).includes(clo.id);
                    return (
                      <div
                        key={clo.id}
                        onClick={() => toggleCLOLink(clo.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-2.5 ${
                          isChecked
                            ? 'bg-blue-50/60 border-blue-300 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-xs shrink-0 border ${
                            isChecked ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300'
                          }`}
                        >
                          {isChecked && '✓'}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold">{clo.code}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                              {clo.bloomLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{clo.statement}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE CLO COVERAGE & BALANCE REPORT */}
      {activeSubTab === 'analysis' && (
        <AlignmentAnalysisReport
          course={course}
          onChange={onChange}
          onAskCopilot={onAskCopilot}
        />
      )}

      {/* Assessment Blueprint Matrix */}
      {activeSubTab === 'designer' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">
              Constructive Alignment Matrix (Assessments ➔ CLO Coverage)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Real-time verification of mark allocation across outcomes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                <th className="p-3 font-bold">Assessment Task</th>
                <th className="p-3 font-bold text-center">Type</th>
                <th className="p-3 font-bold text-center">Bloom</th>
                <th className="p-3 font-bold text-center">Weight</th>
                {course.clos.map((clo) => (
                  <th key={clo.id} className="p-3 font-bold text-center border-l border-slate-200">
                    <div>{clo.code}</div>
                    <div className="text-[10px] text-slate-400 font-normal">({clo.weightage}%)</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {course.assessments.map((asmt) => (
                <tr key={asmt.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{asmt.name}</td>
                  <td className="p-3 text-center text-slate-600">{asmt.type}</td>
                  <td className="p-3 text-center text-slate-600 font-semibold">{asmt.bloomLevel}</td>
                  <td className="p-3 text-center font-bold text-slate-900">{asmt.weightage}%</td>
                  {course.clos.map((clo) => {
                    const isCovered = (asmt.linkedCLOIds || []).includes(clo.id);
                    return (
                      <td key={clo.id} className="p-3 text-center border-l border-slate-100">
                        {isCovered ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <td className="p-3">Calculated Assessed Weight</td>
                <td className="p-3 text-center">-</td>
                <td className="p-3 text-center">-</td>
                <td className="p-3 text-center text-blue-600">{totalAssessmentWeightage}%</td>
                {course.clos.map((clo) => {
                  const coverage = analysis.cloCoverages.find((c) => c.cloId === clo.id);
                  const assessed = coverage?.assessedWeightage || 0;
                  const isUnder = coverage?.coverageStatus === 'under-assessed';
                  const isOver = coverage?.coverageStatus === 'over-assessed';

                  return (
                    <td
                      key={clo.id}
                      className={`p-3 text-center border-l border-slate-200 ${
                        isUnder
                          ? 'bg-amber-50 text-amber-800 font-black'
                          : isOver
                          ? 'bg-purple-50 text-purple-800 font-black'
                          : 'text-slate-800 font-black'
                      }`}
                    >
                      <div>{assessed}%</div>
                      <div className="text-[9px] font-normal text-slate-500">
                        {isUnder ? 'Under-assessed' : isOver ? 'Over-assessed' : 'Balanced'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Activity Designer</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
        >
          <span>Save & Proceed to Question Builder</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
