import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Brain,
  Scale,
  Sliders,
  Check,
  X,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Layers,
  HelpCircle,
  Target,
  FileText,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import { Course, BloomLevel } from '../../types';
import {
  evaluateDesignHealth,
  normalizeAssessmentWeights,
  normalizeCLOWeights,
  replaceVagueVerbInCLO,
  ChecklistItem,
  HealthSuggestion,
} from '../../utils/designHealth';

interface DesignHealthSidebarProps {
  course: Course;
  onChange: (updated: Course) => void;
  currentStep: number;
  onJumpToStep: (stepNumber: number) => void;
  onAskCopilot: (prompt: string) => void;
  onOpenBloomsHelper?: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const DesignHealthSidebar: React.FC<DesignHealthSidebarProps> = ({
  course,
  onChange,
  currentStep,
  onJumpToStep,
  onAskCopilot,
  onOpenBloomsHelper,
  isOpen,
  onToggleOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'measurability' | 'assessments' | 'content'>('suggestions');
  const [filterIssueOnly, setFilterIssueOnly] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Compute live design health audit
  const healthAudit = useMemo(() => evaluateDesignHealth(course), [course]);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  };

  const handleNormalizeAssessments = () => {
    const updated = normalizeAssessmentWeights(course);
    onChange(updated);
    showToast('Assessment weights balanced to 100%');
  };

  const handleNormalizeCLOs = () => {
    const updated = normalizeCLOWeights(course);
    onChange(updated);
    showToast('CLO weights balanced to 100%');
  };

  const handleReplaceVerb = (cloId: string, newVerb: string, level?: BloomLevel) => {
    const updated = replaceVagueVerbInCLO(course, cloId, newVerb, level);
    onChange(updated);
    showToast(`Updated outcome verb to "${newVerb}"`);
  };

  // Grade styling
  const gradeColors = {
    'Audit-Ready': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      ring: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    'Proficient': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      ring: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    'Needs Attention': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      ring: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-800',
    },
    'Incomplete': {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      ring: 'text-rose-600',
      badge: 'bg-rose-100 text-rose-800',
    },
  }[healthAudit.healthGrade];

  // If collapsed, display a sleek vertical dock button
  if (!isOpen) {
    return (
      <aside className="shrink-0 z-20 flex">
        <button
          onClick={onToggleOpen}
          className="fixed right-0 top-36 bg-white hover:bg-slate-50 border-l border-y border-slate-200 shadow-md rounded-l-2xl p-2.5 flex flex-col items-center gap-2 transition cursor-pointer group"
          title="Open Design Health Checklist Sidebar"
          aria-label="Open Design Health Sidebar"
        >
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${gradeColors.bg} ${gradeColors.text} ${gradeColors.border}`}
            >
              {healthAudit.overallScore}%
            </div>
            {healthAudit.suggestions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {healthAudit.suggestions.length}
              </span>
            )}
          </div>

          <div className="writing-vertical-lr text-[11px] font-bold tracking-wider text-slate-700 uppercase py-1 group-hover:text-indigo-600 flex items-center space-x-1">
            <span className="rotate-180">Design Health</span>
          </div>

          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 sm:w-88 shrink-0 bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-5.25rem)] sticky top-[5.25rem] z-20 shadow-sm">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="absolute top-3 left-3 right-3 z-50 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">Design Health</h3>
              <p className="text-[10px] text-slate-500 font-medium">Real-time accreditation audit</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleOpen}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
              title="Collapse sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Health Card */}
        <div className={`p-3 rounded-xl border ${gradeColors.bg} ${gradeColors.border} space-y-2.5`}>
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${gradeColors.badge}`}>
                {healthAudit.healthGrade}
              </span>
              <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline space-x-1">
                <span>{healthAudit.overallScore}%</span>
                <span className="text-[11px] font-medium text-slate-500">OBE Health Index</span>
              </div>
            </div>

            {/* Circular mini badge */}
            <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-slate-200 flex flex-col items-center justify-center p-1 text-center">
              <span className="text-[9px] font-bold text-slate-400 leading-none">SUGG</span>
              <span className={`text-sm font-black leading-none mt-0.5 ${healthAudit.suggestions.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {healthAudit.suggestions.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthAudit.overallScore >= 90
                  ? 'bg-emerald-600'
                  : healthAudit.overallScore >= 75
                  ? 'bg-indigo-600'
                  : healthAudit.overallScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${healthAudit.overallScore}%` }}
            />
          </div>

          {/* Sub-scores Grid */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
            <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
              <div className="text-[9px] font-bold text-slate-400">CLO Verbs</div>
              <div className="text-xs font-extrabold text-slate-800">{healthAudit.measurabilityScore}%</div>
            </div>
            <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
              <div className="text-[9px] font-bold text-slate-400">Assessments</div>
              <div className="text-xs font-extrabold text-slate-800">{healthAudit.assessmentLinkageScore}%</div>
            </div>
            <div className="bg-white/80 p-1.5 rounded-lg border border-slate-100">
              <div className="text-[9px] font-bold text-slate-400">Content</div>
              <div className="text-xs font-extrabold text-slate-800">{healthAudit.contentRequirementsScore}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 shrink-0">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 pb-2 text-xs font-bold transition border-b-2 text-center flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'suggestions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Suggestions</span>
          {healthAudit.suggestions.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold flex items-center justify-center">
              {healthAudit.suggestions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('measurability')}
          className={`flex-1 pb-2 text-xs font-bold transition border-b-2 text-center cursor-pointer ${
            activeTab === 'measurability'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>CLO Verbs</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex-1 pb-2 text-xs font-bold transition border-b-2 text-center cursor-pointer ${
            activeTab === 'assessments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Linkage</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 pb-2 text-xs font-bold transition border-b-2 text-center cursor-pointer ${
            activeTab === 'content'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Content</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
        {/* ========================================================= */}
        {/* 1. SUGGESTIONS TAB                                        */}
        {/* ========================================================= */}
        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Real-Time Actions ({healthAudit.suggestions.length})
              </span>
              {healthAudit.suggestions.length > 0 && (
                <span className="text-[10px] font-semibold text-slate-400">Priority order</span>
              )}
            </div>

            {healthAudit.suggestions.length === 0 ? (
              <div className="p-5 text-center bg-white rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">All Design Health Checks Passed!</h4>
                <p className="text-[11px] text-slate-500">
                  CLOs use measurable action verbs, all outcomes are mapped to assessments, and content requirements are met.
                </p>
                <button
                  onClick={() => onJumpToStep(15)}
                  className="mt-2 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                >
                  <span>Go to Review & Export</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              healthAudit.suggestions.map((sug) => {
                const isCritical = sug.impact === 'Critical';
                const isWarning = sug.impact === 'Warning';

                return (
                  <div
                    key={sug.id}
                    className={`p-3.5 rounded-xl border bg-white shadow-2xs space-y-2.5 transition ${
                      isCritical
                        ? 'border-rose-200 hover:border-rose-300'
                        : isWarning
                        ? 'border-amber-200 hover:border-amber-300'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        {isCritical ? (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{sug.title}</h4>
                          <span
                            className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md mt-1 ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isWarning
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {sug.impact}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onJumpToStep(sug.targetStep)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 shrink-0 hover:underline"
                        title={`Go to Step ${sug.targetStep}`}
                      >
                        Step {sug.targetStep} →
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {sug.reason}
                    </p>

                    {/* Interactive Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {sug.autoFixType === 'normalize-assessment-weights' && (
                        <button
                          onClick={handleNormalizeAssessments}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Auto-Balance Weights</span>
                        </button>
                      )}

                      {sug.autoFixType === 'normalize-clo-weights' && (
                        <button
                          onClick={handleNormalizeCLOs}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Normalize CLO Weights</span>
                        </button>
                      )}

                      {sug.autoFixType === 'replace-vague-verb' && sug.vagueCLOId && sug.suggestedVerb && (
                        <button
                          onClick={() => handleReplaceVerb(sug.vagueCLOId!, sug.suggestedVerb!, sug.suggestedLevel)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                          title={`Replace vague verb with "${sug.suggestedVerb}"`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Use "{sug.suggestedVerb}"</span>
                        </button>
                      )}

                      {sug.autoFixType === 'open-blooms-helper' && onOpenBloomsHelper && (
                        <button
                          onClick={onOpenBloomsHelper}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center space-x-1 border border-indigo-200 transition cursor-pointer"
                        >
                          <Brain className="w-3 h-3 text-indigo-600" />
                          <span>Bloom's Helper</span>
                        </button>
                      )}

                      <button
                        onClick={() => onJumpToStep(sug.targetStep)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <span>Fix in Step {sug.targetStep}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>

                      {sug.copilotPrompt && (
                        <button
                          onClick={() => onAskCopilot(sug.copilotPrompt!)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Ask Copilot to solve this issue"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. CLO MEASURABILITY TAB                                  */}
        {/* ========================================================= */}
        {activeTab === 'measurability' && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Measurability Integrity</span>
                <span className="text-xs font-black text-indigo-600">{healthAudit.measurabilityScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${healthAudit.measurabilityScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>{healthAudit.measurableCLOsCount} Measurable</span>
                <span className={healthAudit.vagueCLOsCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                  {healthAudit.vagueCLOsCount} Non-Measurable / Vague
                </span>
              </div>
            </div>

            {/* Checklist Items for Measurability */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Criteria Checks
              </span>
              {healthAudit.checklistItems
                .filter((item) => item.category === 'measurability')
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          item.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.metricText}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-snug">{item.description}</p>

                    {item.details && item.details.length > 0 && (
                      <div className="p-1.5 rounded-lg bg-rose-50 text-[10px] text-rose-700 font-medium space-y-0.5">
                        {item.details.map((d, i) => (
                          <div key={i}>• {d}</div>
                        ))}
                      </div>
                    )}

                    {item.actionLabel && (
                      <button
                        onClick={() => {
                          if (item.autoFixType === 'open-blooms-helper' && onOpenBloomsHelper) {
                            onOpenBloomsHelper();
                          } else {
                            onJumpToStep(item.targetStep);
                          }
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center space-x-1"
                      >
                        <span>{item.actionLabel}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* Detailed Outcomes Roster */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Individual Outcomes Status
              </span>
              {healthAudit.cloMeasurabilityAudits.map((clo) => (
                <div
                  key={clo.cloId}
                  className={`p-2.5 rounded-xl border bg-white shadow-2xs space-y-1.5 ${
                    clo.isMeasurable ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-900">{clo.cloCode}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {clo.bloomLevel}
                      </span>
                    </div>
                    {clo.isMeasurable ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded flex items-center space-x-0.5">
                        <Check className="w-2.5 h-2.5" />
                        <span>Measurable</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                        Vague Verb
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-700 line-clamp-2 italic">
                    "{clo.statement || 'No statement written'}"
                  </p>

                  {clo.vagueVerbFound && (
                    <div className="pt-1 border-t border-rose-100 flex items-center justify-between">
                      <span className="text-[10px] text-rose-600 font-medium">
                        Replace "{clo.vagueVerbFound}" with:
                      </span>
                      <div className="flex gap-1">
                        {clo.recommendedSubstitutes?.slice(0, 2).map((sub) => (
                          <button
                            key={sub}
                            onClick={() => handleReplaceVerb(clo.cloId, sub, clo.bloomLevel)}
                            className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. ASSESSMENTS LINKAGE TAB                                */}
        {/* ========================================================= */}
        {activeTab === 'assessments' && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Assessment Linkage</span>
                <span className="text-xs font-black text-indigo-600">{healthAudit.assessmentLinkageScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${healthAudit.assessmentLinkageScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Total Weight: {healthAudit.assessmentTotalWeight}%</span>
                <span className={healthAudit.isAssessmentWeightValid ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {healthAudit.isAssessmentWeightValid ? 'Valid (100%)' : 'Needs 100%'}
                </span>
              </div>
            </div>

            {/* Auto-Balance Button if invalid */}
            {!healthAudit.isAssessmentWeightValid && course.assessments.length > 0 && (
              <button
                onClick={handleNormalizeAssessments}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs transition cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Balance Assessment Weights to 100%</span>
              </button>
            )}

            {/* Checklist Items for Assessment Links */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Linkage Checks
              </span>
              {healthAudit.checklistItems
                .filter((item) => item.category === 'assessments')
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          item.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.metricText}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-snug">{item.description}</p>

                    {item.details && item.details.length > 0 && (
                      <div className="p-1.5 rounded-lg bg-rose-50 text-[10px] text-rose-700 font-medium space-y-0.5">
                        {item.details.map((d, i) => (
                          <div key={i}>• {d}</div>
                        ))}
                      </div>
                    )}

                    {item.actionLabel && (
                      <button
                        onClick={() => {
                          if (item.autoFixType === 'normalize-assessment-weights') {
                            handleNormalizeAssessments();
                          } else {
                            onJumpToStep(item.targetStep);
                          }
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center space-x-1"
                      >
                        <span>{item.actionLabel}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* Assessment Coverage Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Outcome Assessment Matrix
              </span>
              {course.clos.map((clo) => {
                const linkedAssessments = course.assessments.filter((a) =>
                  a.linkedCLOIds.includes(clo.id) || a.linkedCLOIds.includes(clo.code)
                );
                const isAssessed = linkedAssessments.length > 0;

                return (
                  <div
                    key={clo.id}
                    className={`p-2.5 rounded-xl border bg-white shadow-2xs space-y-1.5 ${
                      isAssessed ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{clo.code}</span>
                      {isAssessed ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {linkedAssessments.length} Assessment(s)
                        </span>
                      ) : (
                        <button
                          onClick={() => onJumpToStep(9)}
                          className="text-[10px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-1.5 py-0.2 rounded flex items-center space-x-1 transition"
                        >
                          <span>+ Link in Step 9</span>
                        </button>
                      )}
                    </div>

                    {isAssessed ? (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {linkedAssessments.map((a) => (
                          <span
                            key={a.id}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                          >
                            {a.name} ({a.weightage}%)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-rose-600 italic">
                        Not evaluated by any quiz, assignment, or examination.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CONTENT REQUIREMENTS TAB                               */}
        {/* ========================================================= */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Minimum Requirements</span>
                <span className="text-xs font-black text-indigo-600">{healthAudit.contentRequirementsScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${healthAudit.contentRequirementsScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>10 Accreditation Criteria</span>
                <span className={healthAudit.missingContentCount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {healthAudit.missingContentCount === 0 ? 'All 10 Met ✓' : `${healthAudit.missingContentCount} Incomplete`}
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Syllabus Checklist
                </span>
                <button
                  onClick={() => setFilterIssueOnly(!filterIssueOnly)}
                  className="text-[10px] font-semibold text-indigo-600 hover:underline"
                >
                  {filterIssueOnly ? 'Show All' : 'Show Incomplete Only'}
                </button>
              </div>

              {healthAudit.checklistItems
                .filter((item) => item.category === 'content')
                .filter((item) => (!filterIssueOnly || item.status !== 'passed'))
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          item.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.metricText}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-snug">{item.description}</p>

                    <div className="flex items-center justify-between pt-0.5">
                      {item.actionLabel && (
                        <button
                          onClick={() => {
                            if (item.autoFixType === 'normalize-clo-weights') {
                              handleNormalizeCLOs();
                            } else {
                              onJumpToStep(item.targetStep);
                            }
                          }}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{item.actionLabel}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => onJumpToStep(item.targetStep)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        Step {item.targetStep}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 bg-white space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Active Step:</span>
          <span className="font-bold text-indigo-600">Stage {currentStep} of 15</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onOpenBloomsHelper && (
            <button
              onClick={onOpenBloomsHelper}
              className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bloom's Helper</span>
            </button>
          )}

          <button
            onClick={() => onJumpToStep(13)}
            className="px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Full Audit</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
