import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Award,
  FileText,
  Sliders,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Course } from '../../types';
import {
  getFrameworkGuideline,
  getStageGuideline,
  FrameworkDetailedGuideline,
  FrameworkStageGuideline,
} from '../../data/frameworkGuidelines';
import { downloadFrameworkGuidebookPDF } from '../../utils/frameworkGuidebookPdf';

interface FrameworkGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  currentStageKey?: string;
  onSelectActionVerb?: (verb: string) => void;
}

export const FrameworkGuidanceModal: React.FC<FrameworkGuidanceModalProps> = ({
  isOpen,
  onClose,
  course,
  currentStageKey = 'step_clos',
  onSelectActionVerb,
}) => {
  const guideline: FrameworkDetailedGuideline = getFrameworkGuideline(course.frameworkId);
  const [selectedStageKey, setSelectedStageKey] = useState<string>(currentStageKey);
  const [activeTab, setActiveTab] = useState<'requirements' | 'alignment' | 'examples' | 'pitfalls' | 'attributes'>('requirements');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync selected stage with prop when opened
  React.useEffect(() => {
    if (currentStageKey && guideline.stages[currentStageKey]) {
      setSelectedStageKey(currentStageKey);
    }
  }, [currentStageKey, guideline]);

  if (!isOpen) return null;

  const currentStage: FrameworkStageGuideline =
    guideline.stages[selectedStageKey] ||
    guideline.stages['step_clos'] ||
    Object.values(guideline.stages)[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      downloadFrameworkGuidebookPDF({
        frameworkId: course.frameworkId,
        frameworkName: guideline.frameworkName,
        courseTitle: course.title,
        courseCode: course.code,
      });
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const stageKeys = Object.keys(guideline.stages);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="framework-guidance-title"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-mono">
                  {guideline.frameworkCode}
                </span>
                <span className="text-[11px] text-slate-300">
                  Committed OBE Framework Guidance
                </span>
              </div>
              <h2 id="framework-guidance-title" className="text-base sm:text-lg font-bold font-serif text-white tracking-tight">
                {guideline.frameworkName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {guideline.accordOrStandard} • {guideline.jurisdiction}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-900/50 disabled:opacity-50"
              title="Download publication-grade Accreditation & OBE Guidebook in PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isDownloading ? 'Generating PDF...' : 'Download Guidebook (PDF)'}
              </span>
              <span className="sm:hidden">Guidebook PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close guidance modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-slate-400" />
            Stage:
          </span>
          {stageKeys.map((key) => {
            const stg = guideline.stages[key];
            const isSelected = selectedStageKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedStageKey(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{stg.stageTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-white border-b border-slate-200 flex items-center space-x-4 text-xs font-semibold shrink-0">
          {[
            { id: 'requirements', label: 'What Is Required', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            { id: 'alignment', label: 'How to Align', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'examples', label: 'Compliant Exemplars', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'pitfalls', label: 'Pitfalls & Anti-Patterns', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> },
            { id: 'attributes', label: `Graduate Attributes (${guideline.graduateAttributes.length})`, icon: <Award className="w-3.5 h-3.5 text-indigo-500" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-1 border-b-2 flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Context Headline */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                Current Curriculum Target
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {currentStage.stageTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Alignment requirements enforced for course: <span className="font-semibold text-slate-900">{course.title}</span> ({course.code || 'Code Pending'})
              </p>
            </div>
            <span className="text-xs bg-white text-indigo-700 px-2 py-1 rounded-md border border-indigo-200 font-mono font-bold shrink-0">
              Stage #{currentStage.stageNumber}
            </span>
          </div>

          {/* TAB 1: REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mandatory Specifications Under {guideline.frameworkCode}
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentStage.whatIsRequired.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-start space-x-3 shadow-2xs hover:border-indigo-300 transition"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{req}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Recommendations Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Accreditation Practitioner Recommendations
                </h5>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {currentStage.practicalRecommendations.map((rec, i) => (
                    <li key={i} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: ALIGNMENT PROTOCOL */}
          {activeTab === 'alignment' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  How to Align with {guideline.frameworkName}
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentStage.howToAlign.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-indigo-100 rounded-xl flex items-start space-x-3 shadow-2xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Philosophy Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Accreditation Threshold & Cognitive Depth
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <p><strong>Cognitive Expectation:</strong> {guideline.cognitiveRequirements}</p>
                  <p><strong>Passing Benchmark:</strong> {guideline.attainmentThreshold}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLIANT EXEMPLARS */}
          {activeTab === 'examples' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Peer-Reviewed Compliant Exemplars
                </h4>
                <span className="text-[11px] text-slate-500">
                  Approved for {guideline.frameworkCode} dossiers
                </span>
              </div>

              <div className="space-y-3">
                {currentStage.compliantExamples.map((eg, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {eg.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(eg.description, `eg-${idx}`)}
                        className="p-1 px-2 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md border border-indigo-200 transition cursor-pointer flex items-center gap-1"
                      >
                        {copiedItem === `eg-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {eg.description}
                    </p>

                    {eg.items && eg.items.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {eg.items.map((item, i) => (
                          <div
                            key={i}
                            className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start justify-between gap-2"
                          >
                            <span className="leading-relaxed">{item}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item, `item-${idx}-${i}`)}
                              className="text-[10px] text-slate-400 hover:text-indigo-600 shrink-0 p-1"
                              title="Copy item"
                            >
                              {copiedItem === `item-${idx}-${i}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PITFALLS & ANTI-PATTERNS */}
          {activeTab === 'pitfalls' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Common Accreditation Deficiencies & Anti-Patterns
                </h4>
                <p className="text-[11px] text-amber-800">
                  Issues frequently flagged by accreditation evaluation teams (PEVs) during institutional on-site audits.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {currentStage.antiPatterns.map((pitfall, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-rose-100 rounded-xl flex items-start space-x-3 shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✕
                    </div>
                    <div>
                      <p className="text-xs text-rose-950 font-semibold">{pitfall}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Remediation: Review compliant exemplars or use AI Copilot with standard Bloom’s verb prompts.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GRADUATE ATTRIBUTES DIRECTORY */}
          {activeTab === 'attributes' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Official {guideline.frameworkCode} Graduate Attributes Catalog
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {guideline.graduateAttributes.length} Attributes Defined
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {guideline.graduateAttributes.map((attr) => (
                  <div
                    key={attr.code}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold font-mono text-xs rounded">
                          {attr.code}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900">{attr.title}</h5>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${attr.code}: ${attr.title} - ${attr.description}`, attr.code)}
                        className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                        title="Copy attribute"
                      >
                        {copiedItem === attr.code ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{attr.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {attr.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md border border-slate-200 font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-2 text-slate-500">
            <span className="font-bold text-slate-700">Committed Framework:</span>
            <span className="text-indigo-600 font-semibold">{guideline.frameworkName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Guidebook (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition cursor-pointer shadow-xs"
            >
              <span>Done &amp; Continue Designing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
