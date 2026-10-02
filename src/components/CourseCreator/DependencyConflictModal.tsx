import React, { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Target,
  FileText,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Course, BloomLevel } from '../../types';
import {
  detectDependencyConflicts,
  resolveDependencyIssue,
  DependencyIssue,
} from '../../utils/dependencyConflictDetector';
import { OutcomeAssessmentDependencyAlert } from './OutcomeAssessmentDependencyAlert';

interface DependencyConflictModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onChange: (updated: Course) => void;
  onJumpToStep?: (stepIndex: number) => void;
}

export const DependencyConflictModal: React.FC<DependencyConflictModalProps> = ({
  course,
  isOpen,
  onClose,
  onChange,
  onJumpToStep,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'configure' | 'simulator'>('audit');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const report = useMemo(() => detectDependencyConflicts(course), [course]);

  if (!isOpen) return null;

  // Simulator helper: Inject a circular dependency for testing if desired
  const handleSimulateCircularDependency = () => {
    if (course.clos.length < 2 || course.assessments.length < 2) {
      setStatusMessage('Please define at least 2 outcomes and 2 assessments to simulate circular loops.');
      return;
    }

    const clo1 = course.clos[0];
    const clo2 = course.clos[1];
    const asmt1 = course.assessments[0];
    const asmt2 = course.assessments[1];

    // Asmt 1 tests CLO 1, but requires CLO 2
    // Asmt 2 tests CLO 2, but requires CLO 1
    const updatedAsmts = course.assessments.map((a) => {
      if (a.id === asmt1.id) {
        return {
          ...a,
          linkedCLOIds: [clo1.id],
          prerequisiteCLOIds: [clo2.id],
          prerequisiteAssessmentIds: [asmt2.id],
        };
      }
      if (a.id === asmt2.id) {
        return {
          ...a,
          linkedCLOIds: [clo2.id],
          prerequisiteCLOIds: [clo1.id],
          prerequisiteAssessmentIds: [asmt1.id],
        };
      }
      return a;
    });

    const updatedCLOs = course.clos.map((c) => {
      if (c.id === clo1.id) {
        return { ...c, prerequisiteCLOIds: [clo2.id] };
      }
      if (c.id === clo2.id) {
        return { ...c, prerequisiteCLOIds: [clo1.id] };
      }
      return c;
    });

    onChange({
      ...course,
      assessments: updatedAsmts,
      clos: updatedCLOs,
    });

    setStatusMessage('Simulated circular dependency between outcomes and assessments injected. Review visual warnings!');
    setActiveTab('audit');
  };

  // Simulator helper: Inject cognitive mismatch
  const handleSimulateCognitiveMismatch = () => {
    if (course.clos.length === 0 || course.assessments.length === 0) return;

    const updatedCLOs = course.clos.map((c, i) =>
      i === 0 ? { ...c, bloomLevel: 'Create' as BloomLevel } : c
    );
    const updatedAsmts = course.assessments.map((a) => ({
      ...a,
      bloomLevel: 'Remember' as BloomLevel,
      type: 'Quiz' as const,
    }));

    onChange({
      ...course,
      clos: updatedCLOs,
      assessments: updatedAsmts,
    });

    setStatusMessage('Cognitive Bloom deficit injected (CLO at "Create" vs all Assessments at "Remember").');
    setActiveTab('audit');
  };

  // Clear all prerequisites to reset to clean state
  const handleResetDependencies = () => {
    const updatedAsmts = (course.assessments || []).map((a) => ({
      ...a,
      prerequisiteAssessmentIds: [],
      prerequisiteCLOIds: [],
    }));
    const updatedCLOs = (course.clos || []).map((c) => ({
      ...c,
      prerequisiteCLOIds: [],
      dependentAssessmentIds: [],
    }));

    onChange({
      ...course,
      assessments: updatedAsmts,
      clos: updatedCLOs,
    });

    setStatusMessage('Cleared all prerequisite locks. Dependencies harmonized.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Outcome &amp; Assessment Dependency Auditor
              </h3>
              <p className="text-xs text-slate-500">
                Detect, trace, and resolve circular loops and conflicting constraints across outcomes and assessments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center space-x-4 bg-white text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Live Audit &amp; Warnings</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                report.hasCircularDependency
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {report.totalIssuesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('configure')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'configure'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Prerequisites</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'simulator'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test &amp; Simulate Scenarios</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between">
              <span>{statusMessage}</span>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-indigo-400 hover:text-indigo-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === 'audit' && (
            <OutcomeAssessmentDependencyAlert
              course={course}
              onChange={onChange}
              mode="card"
              onNavigateToStep={(step) => {
                onClose();
                onJumpToStep?.(step);
              }}
            />
          )}

          {activeTab === 'configure' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800 mb-1">How Dependency Links Work in OBE:</h4>
                <p>
                  Assessments test one or more learning outcomes. If an assessment enforces prerequisite
                  competencies, specify them below. When prerequisite chains link back onto themselves
                  (e.g., A requires B, which requires A), a circular deadlock is triggered.
                </p>
              </div>

              {/* Assessment Prerequisite Configuration */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assessment Prerequisite Sequencing
                </h4>
                <div className="space-y-3">
                  {course.assessments.map((asmt) => (
                    <div
                      key={asmt.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-sm text-slate-900">{asmt.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {asmt.type} ({asmt.weightage}%)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">
                          Bloom: {asmt.bloomLevel}
                        </span>
                      </div>

                      {/* Prerequisite Outcomes */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Requires Prerequisite Mastery of Outcomes:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {course.clos.map((clo) => {
                            const isPrereq = (asmt.prerequisiteCLOIds || []).includes(clo.id);
                            return (
                              <button
                                key={clo.id}
                                type="button"
                                onClick={() => {
                                  const current = asmt.prerequisiteCLOIds || [];
                                  const next = isPrereq
                                    ? current.filter((id) => id !== clo.id)
                                    : [...current, clo.id];
                                  const updated = course.assessments.map((a) =>
                                    a.id === asmt.id ? { ...a, prerequisiteCLOIds: next } : a
                                  );
                                  onChange({ ...course, assessments: updated });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                  isPrereq
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isPrereq ? '✓ ' : '+ '}
                                {clo.code}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Prerequisite Assessments */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Requires Passing Prior Assessment:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {course.assessments
                            .filter((other) => other.id !== asmt.id)
                            .map((other) => {
                              const isPrereq = (asmt.prerequisiteAssessmentIds || []).includes(
                                other.id
                              );
                              return (
                                <button
                                  key={other.id}
                                  type="button"
                                  onClick={() => {
                                    const current = asmt.prerequisiteAssessmentIds || [];
                                    const next = isPrereq
                                      ? current.filter((id) => id !== other.id)
                                      : [...current, other.id];
                                    const updated = course.assessments.map((a) =>
                                      a.id === asmt.id
                                        ? { ...a, prerequisiteAssessmentIds: next }
                                        : a
                                    );
                                    onChange({ ...course, assessments: updated });
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    isPrereq
                                      ? 'bg-rose-600 text-white border-rose-600'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {isPrereq ? '✓ ' : '+ '}
                                  {other.name}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  Interactive Stress Testing &amp; Verification
                </h4>
                <p>
                  Use these instant stress-test triggers to verify how the dependency auditor visualizes
                  circular deadlocks and pedagogical conflicts:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold mb-2">
                      <RotateCw className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">
                      Inject Circular Deadlock
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Creates mutual prerequisite cross-locking between CLO 1, Assessment 1, CLO 2, and Assessment 2.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateCircularDependency}
                    className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Simulate Circular Cycle
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">
                      Inject Cognitive Bloom Conflict
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Configures a high-order outcome at Bloom Level 6 (Create) evaluated only by recall quizzes at Level 1 (Remember).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateCognitiveMismatch}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Simulate Bloom Conflict
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetDependencies}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Clear All Simulated Conflicts &amp; Harmonize
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Status: {report.hasCircularDependency ? '⚠️ Circular Cycle Active' : '✅ Graph Validated'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Close Auditor
          </button>
        </div>
      </div>
    </div>
  );
};
