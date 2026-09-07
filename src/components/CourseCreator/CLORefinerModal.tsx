import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Edit3,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Award,
  Layers,
  Sliders,
} from 'lucide-react';
import { CLO, BloomLevel } from '../../types';
import { refineCLOStatement, CLORefineResult, CLORefinedSuggestion } from '../../services/api';

interface CLORefinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clo: CLO | null;
  courseTitle?: string;
  courseCategory?: string;
  onApplyRefinement: (
    cloId: string,
    updates: {
      statement: string;
      bloomVerb: string;
      bloomLevel: BloomLevel;
      qualityScore: number;
      aiSuggestion?: string;
      status: 'Validated';
    }
  ) => void;
}

export const CLORefinerModal: React.FC<CLORefinerModalProps> = ({
  isOpen,
  onClose,
  clo,
  courseTitle,
  courseCategory,
  onApplyRefinement,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<CLORefineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedStatements, setEditedStatements] = useState<Record<string, string>>({});
  const [showABCDGuide, setShowABCDGuide] = useState<boolean>(false);

  // Load refinements whenever modal opens with a target CLO
  useEffect(() => {
    if (isOpen && clo) {
      handleFetchRefinement();
    } else {
      setData(null);
      setError(null);
      setSelectedSuggestionId(null);
      setCustomPrompt('');
      setEditingId(null);
      setEditedStatements({});
    }
  }, [isOpen, clo?.id]);

  const handleFetchRefinement = async (overridePrompt?: string) => {
    if (!clo) return;
    setLoading(true);
    setError(null);

    try {
      const result = await refineCLOStatement({
        statement: clo.statement,
        courseTitle: courseTitle || 'Academic Course',
        courseCategory: courseCategory || 'Higher Education',
        targetBloomLevel: clo.bloomLevel,
        refinementFocus: activeFilter !== 'all' ? activeFilter : undefined,
        customInstruction: overridePrompt ?? customPrompt,
        cloCode: clo.code,
      });

      setData(result);
      if (result.suggestions?.length > 0) {
        setSelectedSuggestionId(result.suggestions[0].id);
        const initialEdits: Record<string, string> = {};
        result.suggestions.forEach((s) => {
          initialEdits[s.id] = s.statement;
        });
        setEditedStatements(initialEdits);
      }
    } catch (err) {
      console.error('Failed to refine CLO:', err);
      setError('Unable to complete AI refinement. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !clo) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (suggestion: CLORefinedSuggestion) => {
    const finalStatement = editedStatements[suggestion.id] || suggestion.statement;
    onApplyRefinement(clo.id, {
      statement: finalStatement,
      bloomVerb: suggestion.bloomVerb,
      bloomLevel: suggestion.bloomLevel,
      qualityScore: Math.max(suggestion.qualityScore, 92),
      aiSuggestion: finalStatement,
      status: 'Validated',
    });
    onClose();
  };

  const filteredSuggestions = (data?.suggestions || []).filter((s) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'direct') return s.style.toLowerCase().includes('direct');
    if (activeFilter === 'hots') return s.style.toLowerCase().includes('higher-order') || s.style.toLowerCase().includes('hots');
    if (activeFilter === 'evidence') return s.style.toLowerCase().includes('evidence') || s.style.toLowerCase().includes('professional');
    if (activeFilter === 'comprehensive') return s.style.toLowerCase().includes('comprehensive') || s.style.toLowerCase().includes('scaffold');
    return true;
  });

  const getBloomBadgeColor = (level: BloomLevel) => {
    switch (level) {
      case 'Create':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Evaluate':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Analyze':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Apply':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Understand':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Remember':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="refiner-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="refiner-modal-title" className="text-base font-bold text-white tracking-tight">
                  Refine Course Learning Outcome
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-mono text-xs font-semibold">
                  {clo.code}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-semibold uppercase tracking-wider">
                  AI-Powered Phrasing
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                {courseTitle ? `${courseTitle} • ` : ''}Accreditation-grade observable phrasing based on Bloom's Taxonomy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Current Statement Analysis Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Current Outcome Statement (Baseline)
              </span>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getBloomBadgeColor(
                    clo.bloomLevel
                  )}`}
                >
                  Level: {clo.bloomLevel}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  Verb: {clo.bloomVerb || 'None'}
                </span>
                {data?.currentAnalysis && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      data.currentAnalysis.currentMeasurabilityScore >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : data.currentAnalysis.currentMeasurabilityScore >= 60
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    Measurability: {data.currentAnalysis.currentMeasurabilityScore}/100
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm font-medium text-slate-900 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed italic">
              "{clo.statement}"
            </p>

            {/* Diagnostic Critique / Identified Issues */}
            {data?.currentAnalysis && (
              <div
                className={`p-3 rounded-lg text-xs space-y-1.5 border ${
                  data.currentAnalysis.isVagueOrUnmeasurable
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : 'bg-indigo-50/60 border-indigo-200/70 text-indigo-950'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold">
                  {data.currentAnalysis.isVagueOrUnmeasurable ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Accreditation Audit Diagnostic:</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Quality & Rigor Diagnostic:</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {data.currentAnalysis.pedagogicalCritique}
                </p>

                {data.currentAnalysis.identifiedIssues && data.currentAnalysis.identifiedIssues.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600 mt-1">
                    {data.currentAnalysis.identifiedIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Refinement Strategy Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Suggested Phrasing Variations (OBE Best Practices)
                </span>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { id: 'all', label: 'All Models' },
                  { id: 'direct', label: 'OBE Direct' },
                  { id: 'hots', label: 'HOTS Rigor (L4-L6)' },
                  { id: 'evidence', label: 'Professional Evidence' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instructor Context Refinement input */}
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchRefinement();
                }}
                placeholder="Optional focus: e.g. Focus on laboratory testing, align with ABET criterion 3, elevate to Create level..."
                className="flex-1 bg-white px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleFetchRefinement()}
                disabled={loading}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refining...' : 'Regenerate'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Loading Skeleton or Error or Suggestions */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
                <Sparkles className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Analyzing outcome against Bloom's Taxonomy and accreditation guidelines...
                </p>
                <p className="text-[11px] text-slate-500">
                  Formulating clearer, observable action verbs and assessment-aligned criteria
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <div>
                <p className="text-xs font-bold text-rose-900">{error}</p>
                <p className="text-[11px] text-rose-700">Please verify your connection and try again.</p>
              </div>
              <button
                onClick={() => handleFetchRefinement()}
                className="px-4 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition cursor-pointer shadow-xs"
              >
                Retry Refinement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuggestions.map((suggestion) => {
                const isSelected = selectedSuggestionId === suggestion.id;
                const isEditing = editingId === suggestion.id;
                const currentText = editedStatements[suggestion.id] || suggestion.statement;

                return (
                  <div
                    key={suggestion.id}
                    onClick={() => setSelectedSuggestionId(suggestion.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/25 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Suggestion Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          <span>{suggestion.style}</span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getBloomBadgeColor(
                            suggestion.bloomLevel
                          )}`}
                        >
                          {suggestion.bloomVerb} • {suggestion.bloomLevel}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>Quality: {suggestion.qualityScore}%</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(currentText, suggestion.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="Copy phrasing to clipboard"
                        >
                          {copiedId === suggestion.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Phrasing Display / Inline Editor */}
                    {isEditing ? (
                      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          rows={3}
                          value={currentText}
                          onChange={(e) =>
                            setEditedStatements({
                              ...editedStatements,
                              [suggestion.id]: e.target.value,
                            })
                          }
                          className="w-full p-2.5 text-xs font-medium rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                        <div className="flex justify-end mt-1 space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800"
                          >
                            Done Editing
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/80 mb-3 group relative">
                        <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                          "{currentText}"
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(suggestion.id);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"
                          title="Customize wording"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Pedagogical Rationalization & Key Improvements */}
                    <div className="space-y-2 text-xs">
                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-700">Why this works:</strong>{' '}
                        {suggestion.rationalization}
                      </div>

                      {suggestion.keyImprovements && suggestion.keyImprovements.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Improvements:
                          </span>
                          {suggestion.keyImprovements.map((imp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                              <span>{imp}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {suggestion.recommendedAssessment && (
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 pt-0.5">
                          <span className="font-semibold text-slate-600">
                            Recommended Assessment:
                          </span>
                          <span className="text-slate-700 font-medium">
                            {suggestion.recommendedAssessment}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar inside Card */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(isEditing ? null : suggestion.id);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditing ? 'Save Custom Text' : 'Tweak Wording'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(suggestion);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        <span>Adopt This Phrasing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section 4: ABCD Outcome Construction Best Practice Collapsible */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs text-slate-600 space-y-2">
            <button
              type="button"
              onClick={() => setShowABCDGuide(!showABCDGuide)}
              className="w-full flex items-center justify-between font-bold text-slate-800 hover:text-indigo-600 transition cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>OBE Accreditation Gold Standards: The ABCD Model</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">
                {showABCDGuide ? 'Hide Guide' : 'Learn More'}
              </span>
            </button>

            {showABCDGuide && (
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] animate-in fade-in">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <strong className="text-indigo-900 block mb-0.5">A - Audience</strong>
                  The learner / student (outcomes always state what the student does, not what the teacher teaches).
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <strong className="text-indigo-900 block mb-0.5">B - Observable Behavior</strong>
                  A single demonstrable Bloom action verb (e.g. *critique*, *design*, *synthesize*).
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <strong className="text-indigo-900 block mb-0.5">C - Condition</strong>
                  Context, instruments, or statutory rules under which performance occurs.
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <strong className="text-indigo-900 block mb-0.5">D - Degree of Mastery</strong>
                  The acceptable standard or empirical criterion of achievement.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Adopting a suggestion automatically validates cognitive alignment and upgrades the quality score.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            {selectedSuggestionId && data?.suggestions && (
              <button
                onClick={() => {
                  const target = data.suggestions.find((s) => s.id === selectedSuggestionId);
                  if (target) handleApply(target);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Adopt Selected</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
