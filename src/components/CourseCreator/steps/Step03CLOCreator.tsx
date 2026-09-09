import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Brain,
  BookOpen,
  Lightbulb,
  Wand2,
  Layers,
  Upload,
  FileSpreadsheet,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { Course, CLO, BloomLevel, LearningDomain, CLOStatus } from '../../../types';
import { analyzeCLOStatement, CLOAnalysisResult } from '../../../services/api';
import {
  BloomsTaxonomyHelperModal,
  BLOOM_TAXONOMY_DATA,
  VERBS_TO_AVOID,
} from '../BloomsTaxonomyHelperModal';
import { BloomsTaxonomyPopover } from '../BloomsTaxonomyPopover';
import { BloomsInteractiveReference } from '../BloomsInteractiveReference';
import { CLORefinerModal } from '../CLORefinerModal';
import { OutcomeDependencyGraph } from '../OutcomeDependencyGraph';
import { ElementCommentButton } from '../comments/ElementCommentButton';
import { BulkImportCLOsModal } from '../BulkImportCLOsModal';
import { BloomsCLOTagger } from '../BloomsCLOTagger';
import { BatchCLOTaggerModal } from '../BatchCLOTaggerModal';
import { BloomsTaxonomyWheel } from '../BloomsTaxonomyWheel';
import { BloomsWheelModal } from '../BloomsWheelModal';
import { evaluateStage } from '../../../utils/stageProgress';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
  onOpenComments?: (
    targetId: string,
    targetType: 'CLO' | 'Assessment' | 'Rubric' | 'Module' | 'General',
    targetTitle?: string
  ) => void;
}

export const Step03CLOCreator: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
}) => {
  const [selectedCLOId, setSelectedCLOId] = useState<string>(course.clos[0]?.id || '');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [bloomsModalOpen, setBloomsModalOpen] = useState(false);
  const [refinerModalOpen, setRefinerModalOpen] = useState(false);
  const [batchTaggerModalOpen, setBatchTaggerModalOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isWheelInlineExpanded, setIsWheelInlineExpanded] = useState(false);
  const [targetRefineCLO, setTargetRefineCLO] = useState<CLO | null>(null);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const selectedCLO = course.clos.find((c) => c.id === selectedCLOId) || course.clos[0];
  const totalWeightage = course.clos.reduce((acc, c) => acc + (c.weightage || 0), 0);
  const stageEval = evaluateStage(course, 3, 'granular15');

  // Detect vague non-measurable verbs in active statement
  const detectedVagueVerb = useMemo(() => {
    if (!selectedCLO?.statement) return null;
    const lower = selectedCLO.statement.toLowerCase();
    return VERBS_TO_AVOID.find((item) => {
      const firstWord = item.vagueVerb.split(' ')[0].toLowerCase();
      const regex = new RegExp(`\\b${firstWord}\\b`, 'i');
      return regex.test(lower);
    });
  }, [selectedCLO?.statement]);

  const handleSelectBloomVerb = (verb: string, level: BloomLevel) => {
    if (!selectedCLO) return;
    let newStatement = selectedCLO.statement || '';
    const trimmed = newStatement.trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/);
      parts[0] = verb;
      newStatement = parts.join(' ');
    } else {
      newStatement = `${verb} `;
    }

    handleUpdateCLO(selectedCLO.id, {
      bloomVerb: verb,
      bloomLevel: level,
      statement: newStatement,
      qualityScore: Math.max(selectedCLO.qualityScore || 75, 88),
    });
  };

  const handleApplyStem = (stem: string, level: BloomLevel) => {
    if (!selectedCLO) return;
    const firstWord = stem.split(' ')[0] || 'Analyze';
    handleUpdateCLO(selectedCLO.id, {
      bloomVerb: firstWord,
      bloomLevel: level,
      statement: stem,
      qualityScore: Math.max(selectedCLO.qualityScore || 75, 92),
    });
  };

  const handleSubstituteVagueVerb = (substituteVerb: string) => {
    if (!selectedCLO || !detectedVagueVerb) return;
    const firstWord = detectedVagueVerb.vagueVerb.split(' ')[0];
    const regex = new RegExp(`\\b${firstWord}\\b`, 'gi');
    const newStatement = selectedCLO.statement.replace(regex, substituteVerb);

    // Identify corresponding level
    let matchedLevel: BloomLevel = selectedCLO.bloomLevel;
    (Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).forEach((lvl) => {
      if (BLOOM_TAXONOMY_DATA[lvl].categories.some((c) => c.verbs.includes(substituteVerb))) {
        matchedLevel = lvl;
      }
    });

    handleUpdateCLO(selectedCLO.id, {
      statement: newStatement,
      bloomVerb: substituteVerb,
      bloomLevel: matchedLevel,
      qualityScore: Math.max(selectedCLO.qualityScore || 70, 88),
    });
  };

  const handleUpdateCLO = (id: string, updates: Partial<CLO>) => {
    const updated = course.clos.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onChange({ ...course, clos: updated });
  };

  const handleAddCLO = () => {
    const nextNum = course.clos.length + 1;
    const newCLO: CLO = {
      id: `clo-${Date.now()}`,
      code: `CLO ${nextNum}`,
      statement: `Analyze and solve relevant problems in ${course.title || 'the subject area'}.`,
      bloomVerb: 'Analyze',
      bloomLevel: 'Analyze',
      learningDomain: 'Cognitive',
      competency: 'Core Subject Competency',
      skills: 'Problem identification, statutory or technical analysis',
      assessmentMethod: 'Analytical Problem Set',
      achievementThreshold: 60,
      weightage: Math.max(0, 100 - totalWeightage),
      status: 'Draft',
      qualityScore: 80,
      qualityChecks: [],
      mappedPLOs: [],
    };
    const updated = [...course.clos, newCLO];
    onChange({ ...course, clos: updated });
    setSelectedCLOId(newCLO.id);
  };

  const handleDeleteCLO = (id: string) => {
    if (course.clos.length <= 1) {
      alert('A course must have at least one Course Learning Outcome (CLO).');
      return;
    }
    const filtered = course.clos.filter((c) => c.id !== id);
    onChange({ ...course, clos: filtered });
    if (selectedCLOId === id) {
      setSelectedCLOId(filtered[0]?.id || '');
    }
  };

  const handleRunAICheck = async (clo: CLO) => {
    setAnalyzingId(clo.id);
    const result: CLOAnalysisResult = await analyzeCLOStatement(clo.statement, course.title);
    handleUpdateCLO(clo.id, {
      bloomVerb: result.bloomVerb,
      bloomLevel: result.bloomLevel,
      qualityScore: result.qualityScore,
      qualityChecks: result.checks,
      aiSuggestion: result.suggestion,
      status: result.qualityScore >= 80 ? 'Validated' : 'Draft',
    });
    setAnalyzingId(null);
  };

  const handleApplySuggestion = (clo: CLO) => {
    if (clo.aiSuggestion) {
      handleUpdateCLO(clo.id, {
        statement: clo.aiSuggestion,
        qualityScore: 90,
        status: 'Validated',
      });
    }
  };

  const handleOpenRefiner = (clo?: CLO) => {
    setTargetRefineCLO(clo || selectedCLO);
    setRefinerModalOpen(true);
  };

  const handleApplyRefinement = (
    cloId: string,
    updates: {
      statement: string;
      bloomVerb: string;
      bloomLevel: BloomLevel;
      qualityScore: number;
      aiSuggestion?: string;
      status: 'Validated';
    }
  ) => {
    handleUpdateCLO(cloId, updates);
  };

  const handleBulkImportCLOs = (importedCLOs: CLO[], mode: 'replace' | 'append') => {
    let updatedCLOs: CLO[];
    if (mode === 'replace') {
      updatedCLOs = importedCLOs;
    } else {
      updatedCLOs = [...course.clos, ...importedCLOs];
    }
    onChange({ ...course, clos: updatedCLOs });
    if (importedCLOs.length > 0) {
      setSelectedCLOId(importedCLOs[0].id);
    }
    setImportNotification(
      `Successfully ${mode === 'replace' ? 'replaced with' : 'appended'} ${importedCLOs.length} Course Learning Outcome(s).`
    );
    setTimeout(() => {
      setImportNotification(null);
    }, 5000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <span>Stage 03</span>
          <span>•</span>
          <span>Core Outcomes</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Step 3: CLO Creator</h2>
            <p className="text-sm text-slate-500 mt-1">
              Define measurable Course Learning Outcomes that align with the course mission.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Weightage Badge */}
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center space-x-1.5 ${
                totalWeightage === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span>Total Weightage:</span>
              <span>{totalWeightage}%</span>
              {totalWeightage !== 100 && (
                <span className="text-[10px] text-amber-800 font-normal">
                  ({100 - totalWeightage > 0 ? `need +${100 - totalWeightage}%` : `over by ${totalWeightage - 100}%`})
                </span>
              )}
            </div>

            <button
              type="button"
              id="clo-bulk-import-btn"
              onClick={() => setBulkImportModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Bulk import Course Learning Outcomes from CSV or text file to speed up course setup"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Bulk Import</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGraphModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Inspect outcome dependency graph between PLOs and CLOs"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>PLO Graph</span>
            </button>

            <button
              type="button"
              id="clo-batch-bloom-tagger-btn"
              onClick={() => setBatchTaggerModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-amber-300 bg-gradient-to-r from-amber-50 to-indigo-50 hover:from-amber-100 hover:to-indigo-100 text-amber-950 text-xs font-bold shadow-2xs transition cursor-pointer"
              title="AI audits all outcome action verbs, suggests Bloom's Taxonomy cognitive levels, and calibrates depth"
            >
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>AI Bloom's Tagger</span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 rounded font-mono font-bold">ALL</span>
            </button>

            <button
              type="button"
              id="clo-bloom-wheel-toolbar-btn"
              onClick={() => setIsWheelModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Visualize and select action verbs using the interactive Bloom's Taxonomy radial sunburst wheel"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Bloom's Wheel</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRefiner(selectedCLO)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Analyze and refine active CLO phrasing with AI"
            >
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span>Refine with AI</span>
            </button>

            <button
              onClick={handleAddCLO}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add CLO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stage 3 Live Accreditation Readiness Card */}
      <div
        id="granular-step03-accreditation-card"
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          stageEval.isCompleted
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start space-x-2.5">
          {stageEval.isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          )}
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>{stageEval.isCompleted ? 'Outcomes (CLOs) Validated & Compliant' : 'CLO Compliance Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Stage 03 • Granular Flow
              </span>
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {stageEval.isCompleted
                ? stageEval.summary
                : `Action required: ${stageEval.missingRequirements.join(', ')}`}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {importNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Fast Setup Callout if course has 1 or fewer CLOs */}
      {course.clos.length <= 1 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-sky-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Fast Setup: Have an existing syllabus or curriculum spreadsheet?</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk-import your Course Learning Outcomes from a CSV spreadsheet or paste directly from Word/PDF syllabus notes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBulkImportModalOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import Outcomes</span>
          </button>
        </div>
      )}

      {/* CLO Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {course.clos.map((clo) => {
          const isSelected = (selectedCLO?.id || '') === clo.id;
          const isVague = VERBS_TO_AVOID.some((item) => {
            const firstWord = item.vagueVerb.split(' ')[0].toLowerCase();
            const regex = new RegExp(`\\b${firstWord}\\b`, 'i');
            return regex.test(clo.statement || '');
          });

          return (
            <button
              key={clo.id}
              onClick={() => setSelectedCLOId(clo.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{clo.code}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                L{BLOOM_TAXONOMY_DATA[clo.bloomLevel]?.number || 2} {clo.bloomLevel}
              </span>
              {isVague && (
                <span
                  title="Accreditation alert: Contains non-measurable action verb"
                  className={`flex items-center ${isSelected ? 'text-amber-200' : 'text-rose-500'}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                </span>
              )}
              {clo.qualityScore !== undefined && (
                <span
                  className={`text-[10px] px-1 font-bold ${
                    isSelected
                      ? 'text-white/90'
                      : clo.qualityScore >= 85
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {clo.qualityScore}/100
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main CLO Editor & AI Quality Analysis */}
      {selectedCLO && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={selectedCLO.code}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { code: e.target.value })}
                  className="w-24 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
                />
                <select
                  value={selectedCLO.status}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { status: e.target.value as CLOStatus })}
                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Validated">Validated</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                {onOpenComments && (
                  <ElementCommentButton
                    comments={course.comments}
                    targetId={selectedCLO.id}
                    targetType="CLO"
                    targetTitle={`${selectedCLO.code}: ${selectedCLO.statement.slice(0, 45)}...`}
                    onClick={onOpenComments}
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteCLO(selectedCLO.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Delete this CLO"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Outcome Statement */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Outcome Statement <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRefiner(selectedCLO)}
                    className="inline-flex items-center space-x-1.5 text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 font-semibold cursor-pointer py-1 px-3 rounded-lg shadow-xs shadow-indigo-200 hover:shadow-sm transition group"
                    title="AI analyzes current outcome and suggests clearer, measurable phrasing based on best practices"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-200 group-hover:rotate-12 transition-transform" />
                    <span>Refine CLO</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded text-white font-mono font-bold">AI</span>
                  </button>
                  <button
                    type="button"
                    id="open-blooms-wheel-modal-btn"
                    onClick={() => setIsWheelModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 text-xs text-amber-950 bg-gradient-to-r from-amber-100 via-rose-50 to-indigo-100 hover:from-amber-200 hover:to-indigo-200 font-bold cursor-pointer py-1 px-2.5 rounded-lg border border-amber-300 shadow-2xs transition"
                    title="Explore and select action verbs using the interactive Bloom's Taxonomy radial sunburst wheel"
                  >
                    <Compass className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Bloom's Wheel</span>
                  </button>
                  <BloomsTaxonomyPopover
                    currentLevel={selectedCLO.bloomLevel}
                    currentVerb={selectedCLO.bloomVerb}
                    onSelectVerb={handleSelectBloomVerb}
                    onOpenFullModal={() => setBloomsModalOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setBloomsModalOpen(true)}
                    className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-indigo-50 transition"
                    title="Open full Bloom's Taxonomy classification and action verbs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Browse Taxonomy</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={selectedCLO.statement}
                onChange={(e) => handleUpdateCLO(selectedCLO.id, { statement: e.target.value })}
                placeholder="Start with an active Bloom verb: e.g. Analyze constitutional crises and evaluate their impact on federal governance..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed"
              />

              {/* AI-Powered Bloom's Taxonomy Cognitive Tagger & Depth Calibrator */}
              <BloomsCLOTagger
                clo={selectedCLO}
                course={course}
                onUpdateCLO={handleUpdateCLO}
                onOpenFullTaxonomy={() => setBloomsModalOpen(true)}
                onOpenWheel={() => setIsWheelModalOpen(true)}
              />

              {/* Inline Interactive Bloom's Taxonomy Wheel Toggle & Viewer */}
              <div className="pt-1">
                <button
                  type="button"
                  id="toggle-inline-blooms-wheel-btn"
                  onClick={() => setIsWheelInlineExpanded(!isWheelInlineExpanded)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/90 px-2.5 py-1.5 rounded-lg border border-indigo-200/80 transition cursor-pointer"
                >
                  <Compass className={`w-3.5 h-3.5 ${isWheelInlineExpanded ? 'text-indigo-600' : 'text-indigo-500'}`} />
                  <span>{isWheelInlineExpanded ? "Hide Bloom's Taxonomy Wheel" : "Show Interactive Bloom's Taxonomy Wheel"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isWheelInlineExpanded ? 'rotate-180 text-indigo-600' : 'text-indigo-500'}`} />
                </button>

                {isWheelInlineExpanded && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                    <BloomsTaxonomyWheel
                      selectedCLO={selectedCLO}
                      course={course}
                      onSelectVerb={handleSelectBloomVerb}
                      onApplyStem={handleApplyStem}
                    />
                  </div>
                )}
              </div>

              {/* Non-measurable vague verb warning banner */}
              {detectedVagueVerb && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 animate-in fade-in">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Accreditation Alert:</strong> Non-measurable verb detected ("{detectedVagueVerb.vagueVerb}").
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenRefiner(selectedCLO)}
                      className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                      title="AI suggests accredited phrasing to replace non-measurable verbs"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-200" />
                      <span>Refine with AI</span>
                    </button>
                    <span className="text-[11px] text-amber-800 font-medium">Or replace:</span>
                    {detectedVagueVerb.recommendedSubstitutes.slice(0, 3).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSubstituteVagueVerb(sub)}
                        className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                        title={`Replace with observable verb "${sub}"`}
                      >
                        + Use "{sub}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bloom Verb & Level */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bloom Verb</label>
                <input
                  type="text"
                  value={selectedCLO.bloomVerb}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { bloomVerb: e.target.value })}
                  placeholder="e.g. Analyze, Apply, Evaluate"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bloom Level</label>
                <select
                  value={selectedCLO.bloomLevel}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { bloomLevel: e.target.value as BloomLevel })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Domain</label>
                <select
                  value={selectedCLO.learningDomain}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { learningDomain: e.target.value as LearningDomain })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Cognitive">Cognitive</option>
                  <option value="Psychomotor">Psychomotor</option>
                  <option value="Affective">Affective</option>
                </select>
              </div>
            </div>

            {/* Bloom's Taxonomy Interactive Reference */}
            <BloomsInteractiveReference
              selectedCLO={selectedCLO}
              course={course}
              onSelectVerb={handleSelectBloomVerb}
              onApplyStem={handleApplyStem}
              onOpenFullModal={() => setBloomsModalOpen(true)}
            />

            {/* Competency & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Related Competency</label>
                <input
                  type="text"
                  value={selectedCLO.competency || ''}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { competency: e.target.value })}
                  placeholder="e.g. Federal Dispute Resolution"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Demonstrable Skills</label>
                <input
                  type="text"
                  value={selectedCLO.skills || ''}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { skills: e.target.value })}
                  placeholder="e.g. Statutory interpretation, precedent synthesis"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Assessment Method, Threshold, Weightage */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Method</label>
                <input
                  type="text"
                  value={selectedCLO.assessmentMethod || ''}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { assessmentMethod: e.target.value })}
                  placeholder="e.g. Case Study & Final Exam"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Threshold (%) <span className="text-slate-400 font-normal">Standard</span>
                </label>
                <input
                  type="number"
                  min={40}
                  max={100}
                  value={selectedCLO.achievementThreshold || 60}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { achievementThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weightage (%)
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={selectedCLO.weightage || 25}
                  onChange={(e) => handleUpdateCLO(selectedCLO.id, { weightage: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column: 5 cols AI Quality Checker Panel */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-indigo-50/40 rounded-2xl border border-indigo-100 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI CLO Quality Checker</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenRefiner(selectedCLO)}
                    className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                    title="Open AI Refine modal for observable OBE phrasing"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Refine CLO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunAICheck(selectedCLO)}
                    disabled={analyzingId === selectedCLO.id}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {analyzingId === selectedCLO.id ? 'Auditing...' : 'Audit Quality'}
                  </button>
                </div>
              </div>

              {/* Phrasing Refiner Action Card */}
              <div className="bg-white p-3.5 rounded-xl border border-indigo-100 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Phrasing Refiner</span>
                  </span>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    OBE Best Practices
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Analyze current statement for non-observable verbs, vague criteria, and generate 4 accredited phrasing options.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenRefiner(selectedCLO)}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Refine CLO Phrasing with AI</span>
                </button>
              </div>

              {/* Quality Score Indicator */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Outcome Quality Score</span>
                  <span
                    className={`text-2xl font-black ${
                      (selectedCLO.qualityScore ?? 75) >= 85
                        ? 'text-emerald-600'
                        : (selectedCLO.qualityScore ?? 75) >= 70
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {selectedCLO.qualityScore ?? 75} / 100
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700">
                  {selectedCLO.qualityScore ?? 75}%
                </div>
              </div>

              {/* Check Criteria List */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-700">OBE Accreditation Criteria</p>
                {(
                  selectedCLO.qualityChecks || [
                    { label: 'Measurable action verb', passed: true, detail: 'Observable performance verb' },
                    { label: 'Single primary cognitive action', passed: true, detail: 'One dominant task' },
                    { label: 'Learner-focused output', passed: true, detail: 'Student demonstrates performance' },
                    { label: 'Assessable with empirical evidence', passed: true, detail: 'Direct evidence possible' },
                    { label: 'Appropriate Bloom taxonomy level', passed: true, detail: `Level: ${selectedCLO.bloomLevel}` },
                    { label: 'Clear disciplinary context', passed: true, detail: 'Context specified' },
                  ]
                ).map((chk, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs bg-white/70 p-2 rounded-lg border border-slate-100">
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-800">{chk.label}</span>
                      <p className="text-[11px] text-slate-500">{chk.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Suggestion Box */}
              {selectedCLO.aiSuggestion && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Suggested Higher-Rigor Version:</span>
                  </div>
                  <p className="text-xs text-blue-800 italic bg-white p-2.5 rounded-lg border border-blue-100">
                    "{selectedCLO.aiSuggestion}"
                  </p>
                  <button
                    type="button"
                    onClick={() => handleApplySuggestion(selectedCLO)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Adopt AI Suggestion
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-indigo-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Domain: {selectedCLO.learningDomain}</span>
              <span>Weight: {selectedCLO.weightage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blueprint</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Save & Proceed to PLO Mapping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {/* Bloom's Taxonomy Helper Modal */}
      <BloomsTaxonomyHelperModal
        isOpen={bloomsModalOpen}
        onClose={() => setBloomsModalOpen(false)}
        selectedLevel={selectedCLO?.bloomLevel || 'Analyze'}
        targetCLO={selectedCLO}
        onSelectVerb={handleSelectBloomVerb}
        onApplyStem={handleApplyStem}
        onOpenWheel={() => setIsWheelModalOpen(true)}
      />

      {/* AI-Powered CLO Refiner Modal */}
      <CLORefinerModal
        isOpen={refinerModalOpen}
        onClose={() => setRefinerModalOpen(false)}
        clo={targetRefineCLO || selectedCLO}
        courseTitle={course.title}
        courseCategory={course.category}
        onApplyRefinement={handleApplyRefinement}
      />

      {/* Visual Outcome Dependency Graph Modal */}
      {isGraphModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGraphModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-3.5 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Outcome Dependency Graph (PLO ↔ CLO)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Inspecting direct programmatic mapping paths for {course.code} - {course.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGraphModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition cursor-pointer"
              >
                Close Graph
              </button>
            </div>
            <div className="flex-1 p-2 bg-slate-100/50 overflow-hidden">
              <OutcomeDependencyGraph
                course={course}
                onUpdateCourse={onChange}
                onAskCopilot={onAskCopilot}
                initialSelectedNodeId={selectedCLOId}
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import CLOs Modal */}
      <BulkImportCLOsModal
        isOpen={bulkImportModalOpen}
        onClose={() => setBulkImportModalOpen(false)}
        existingCLOs={course.clos}
        availablePLOs={course.plos}
        onImportCLOs={handleBulkImportCLOs}
      />

      {/* AI Bloom's Taxonomy Batch Tagger Modal */}
      <BatchCLOTaggerModal
        isOpen={batchTaggerModalOpen}
        onClose={() => setBatchTaggerModalOpen(false)}
        course={course}
        onUpdateCourse={onChange}
      />

      {/* Interactive Bloom's Taxonomy Wheel Modal */}
      <BloomsWheelModal
        isOpen={isWheelModalOpen}
        onClose={() => setIsWheelModalOpen(false)}
        selectedCLO={selectedCLO}
        course={course}
        onSelectVerb={handleSelectBloomVerb}
        onApplyStem={handleApplyStem}
      />
    </div>
  );
};
