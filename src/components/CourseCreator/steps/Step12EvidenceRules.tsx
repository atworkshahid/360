import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  FileCheck2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Course, EvidenceRule, EvidenceSource } from '../../../types';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step12EvidenceRules: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [selectedCLOId, setSelectedCLOId] = useState<string>(course.clos[0]?.id || '');

  const rules = course.evidenceRules || [];
  const selectedCLO = course.clos.find((c) => c.id === selectedCLOId) || course.clos[0];
  const currentRule = rules.find((r) => r.outcomeId === selectedCLO?.id);

  const handleUpdateRule = (updatedRule: EvidenceRule) => {
    const existing = rules.some((r) => r.outcomeId === updatedRule.outcomeId);
    let updatedRules: EvidenceRule[];
    if (existing) {
      updatedRules = rules.map((r) => (r.outcomeId === updatedRule.outcomeId ? updatedRule : r));
    } else {
      updatedRules = [...rules, updatedRule];
    }
    onChange({ ...course, evidenceRules: updatedRules });
  };

  const ensureRuleForCLO = (cloId: string) => {
    const clo = course.clos.find((c) => c.id === cloId);
    if (!clo) return;

    // Find assessments linked to this CLO
    const linkedAsmts = course.assessments.filter((a) => (a.linkedCLOIds || []).includes(clo.id));
    const equalWeight = linkedAsmts.length > 0 ? Math.round(100 / linkedAsmts.length) : 100;

    const sources: EvidenceSource[] = linkedAsmts.map((a, idx) => ({
      assessmentId: a.id,
      componentName: a.name,
      weightInOutcome: idx === linkedAsmts.length - 1 ? 100 - equalWeight * (linkedAsmts.length - 1) : equalWeight,
    }));

    const newRule: EvidenceRule = {
      id: `er-${clo.id}`,
      outcomeId: clo.id,
      outcomeCode: clo.code,
      evidenceSources: sources,
      minimumThresholdPct: clo.achievementThreshold || 60,
      achievementRuleText: `${clo.code} is achieved if weighted performance across evidence sources ≥ ${
        clo.achievementThreshold || 60
      }%.`,
      explanation: `Learner demonstrates empirical mastery of ${clo.code} through validated assessment benchmarks.`,
    };

    handleUpdateRule(newRule);
  };

  const handleSourceWeightChange = (rule: EvidenceRule, asmtId: string, weight: number) => {
    const updatedSources = rule.evidenceSources.map((s) =>
      s.assessmentId === asmtId ? { ...s, weightInOutcome: weight } : s
    );
    handleUpdateRule({ ...rule, evidenceSources: updatedSources });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 12</span>
          <span>•</span>
          <span>Verifiable Standards</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Course Evidence Rules</h2>
            <p className="text-xs text-slate-500 mt-1">
              Establish transparent evidentiary rules. Define how student performance across assessments proves achievement of each Course Learning Outcome.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onAskCopilot(
                `Review evidence rules for course "${course.title}". Confirm if each CLO has sufficient direct evidence sources.`
              )
            }
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Evidence Audit</span>
          </button>
        </div>
      </div>

      {/* CLO Selector Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {course.clos.map((clo) => {
          const ruleExists = rules.some((r) => r.outcomeId === clo.id);
          return (
            <button
              key={clo.id}
              onClick={() => {
                setSelectedCLOId(clo.id);
                if (!ruleExists) ensureRuleForCLO(clo.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border ${
                (selectedCLO?.id || '') === clo.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{clo.code}</span>
              {ruleExists ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected CLO Evidence Rule Editor */}
      {selectedCLO && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900">
                Evidence Protocol: {selectedCLO.code}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedCLO.statement}</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              Benchmark: {selectedCLO.achievementThreshold}% Passing
            </span>
          </div>

          {/* Evidence Sources List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Contributing Evidence Sources
              </label>
              <span className="text-[11px] text-slate-500">
                Source weight sum:{' '}
                <strong className="text-slate-800">
                  {currentRule?.evidenceSources.reduce((acc, s) => acc + (s.weightInOutcome || 0), 0) || 0}%
                </strong>
              </span>
            </div>

            {currentRule && currentRule.evidenceSources.length > 0 ? (
              <div className="space-y-2.5">
                {currentRule.evidenceSources.map((source, idx) => {
                  const asmt = course.assessments.find((a) => a.id === source.assessmentId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800">{source.componentName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                            {asmt?.type || 'Assessment'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Assesses: {asmt?.bloomLevel} level ({asmt?.marks} points, {asmt?.weightage}% of course)
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs text-slate-500">Weight in {selectedCLO.code}:</span>
                        <input
                          type="number"
                          min={5}
                          max={100}
                          value={source.weightInOutcome}
                          onChange={(e) =>
                            handleSourceWeightChange(currentRule, source.assessmentId, Number(e.target.value))
                          }
                          className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white text-center font-bold"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-2">No direct assessment sources assigned yet.</p>
                <button
                  type="button"
                  onClick={() => ensureRuleForCLO(selectedCLO.id)}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Auto-Populate from Aligned Assessments
                </button>
              </div>
            )}
          </div>

          {/* Formal Achievement Rule Statement */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-blue-900 block">Formal Achievement Rule Text</label>
            <input
              type="text"
              value={
                currentRule?.achievementRuleText ||
                `${selectedCLO.code} is achieved if weighted assessment score ≥ ${selectedCLO.achievementThreshold}%.`
              }
              onChange={(e) => {
                if (currentRule) {
                  handleUpdateRule({ ...currentRule, achievementRuleText: e.target.value });
                }
              }}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-blue-300 bg-white font-medium text-slate-800"
            />
          </div>

          {/* "Why has this learner achieved this outcome?" Verification Preview */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Accreditation Verification Narrative ("Why is this CLO achieved?"):</span>
            </div>
            <textarea
              rows={2}
              value={
                currentRule?.explanation ||
                `Learner demonstrated empirical mastery of ${selectedCLO.code} by meeting minimum threshold across contributing direct assessments.`
              }
              onChange={(e) => {
                if (currentRule) {
                  handleUpdateRule({ ...currentRule, explanation: e.target.value });
                }
              }}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white text-emerald-950"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rubric Builder</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to Alignment Audit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
