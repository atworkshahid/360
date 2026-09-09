import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  BookOpen,
  TrendingUp,
  Brain,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Info,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { Course, MLO, BloomLevel } from '../../../types';
import { generateScaffoldedMLOs } from '../../../services/api';
import {
  BloomsTaxonomyHelperModal,
  BLOOM_TAXONOMY_DATA,
} from '../BloomsTaxonomyHelperModal';
import { BloomsTaxonomyPopover } from '../BloomsTaxonomyPopover';
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
    targetTitle: string
  ) => void;
}

const BLOOM_RANKS: Record<BloomLevel, number> = {
  Remember: 1,
  Understand: 2,
  Apply: 3,
  Analyze: 4,
  Evaluate: 5,
  Create: 6,
};

export const Step06MLOCreator: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
}) => {
  const [selectedMLOId, setSelectedMLOId] = useState<string>(course.mlos[0]?.id || '');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(course.modules[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [bloomsModalOpen, setBloomsModalOpen] = useState(false);

  // Live Accreditation Evaluation for Stage 06 (Granular15)
  const stageEval = evaluateStage(course, 6, 'granular15');

  const selectedMLO = course.mlos.find((m) => m.id === selectedMLOId) || course.mlos[0];
  const moduleMLOs = course.mlos.filter((m) => !selectedModuleId || m.moduleId === selectedModuleId);

  // Parent CLO of selected MLO
  const parentCLO = course.clos.find((c) => c.id === selectedMLO?.linkedCLOId);

  // Cognitive Ceiling Check
  const mloRank = selectedMLO ? BLOOM_RANKS[selectedMLO.bloomLevel] || 2 : 2;
  const parentRank = parentCLO ? BLOOM_RANKS[parentCLO.bloomLevel] || 3 : 3;
  const isCeilingExceeded = parentCLO && mloRank > parentRank;

  // Active module scaffolding distribution
  const lowerOrderCount = moduleMLOs.filter(
    (m) => m.bloomLevel === 'Remember' || m.bloomLevel === 'Understand'
  ).length;
  const higherOrderCount = moduleMLOs.filter(
    (m) => m.bloomLevel !== 'Remember' && m.bloomLevel !== 'Understand'
  ).length;

  const handleUpdateMLO = (id: string, updates: Partial<MLO>) => {
    const updated = course.mlos.map((m) => (m.id === id ? { ...m, ...updates } : m));
    onChange({ ...course, mlos: updated });
  };

  const handleSelectBloomVerb = (verb: string, level: BloomLevel) => {
    if (!selectedMLO) return;
    let newStatement = selectedMLO.statement || '';
    const trimmed = newStatement.trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/);
      parts[0] = verb;
      newStatement = parts.join(' ');
    } else {
      newStatement = `${verb} `;
    }

    handleUpdateMLO(selectedMLO.id, {
      bloomVerb: verb,
      bloomLevel: level,
      statement: newStatement,
    });
  };

  const handleApplyStem = (stem: string, level: BloomLevel) => {
    if (!selectedMLO) return;
    const firstWord = stem.split(' ')[0] || 'Explain';
    handleUpdateMLO(selectedMLO.id, {
      bloomVerb: firstWord,
      bloomLevel: level,
      statement: stem,
    });
  };

  const handleAddMLO = () => {
    const mod = course.modules.find((m) => m.id === selectedModuleId) || course.modules[0];
    const modNumber = mod?.number || 1;
    const countInMod = course.mlos.filter((m) => m.moduleId === mod?.id).length + 1;
    const cloId = mod?.relatedCLOIds?.[0] || course.clos[0]?.id || '';

    const newMLO: MLO = {
      id: `mlo-${Date.now()}`,
      code: `MLO ${modNumber}.${countInMod}`,
      moduleId: mod?.id || 'mod-1',
      linkedCLOId: cloId,
      statement: `Explain foundational concepts and applications in ${mod?.title || 'this module'}.`,
      bloomVerb: 'Explain',
      bloomLevel: 'Understand',
      requiredActivity: 'Interactive concept analysis & guided worksheet',
      assessment: 'Diagnostic Quiz / Evaluated Assignment',
      evidence: 'Direct student submission meeting grading criteria threshold',
      studyTimeHours: 4,
    };

    const updated = [...course.mlos, newMLO];
    onChange({ ...course, mlos: updated });
    setSelectedMLOId(newMLO.id);
  };

  const handleDeleteMLO = (id: string) => {
    const filtered = course.mlos.filter((m) => m.id !== id);
    onChange({ ...course, mlos: filtered });
    if (selectedMLOId === id) {
      setSelectedMLOId(filtered[0]?.id || '');
    }
  };

  const handleGenerateScaffolded = async () => {
    const mod = course.modules.find((m) => m.id === selectedModuleId) || course.modules[0];
    const clo = course.clos.find((c) => c.id === mod?.relatedCLOIds?.[0]) || course.clos[0];
    if (!clo) {
      alert('Please ensure you have defined at least one CLO first.');
      return;
    }

    setIsGenerating(true);
    const scaffolded = await generateScaffoldedMLOs(clo.code, clo.statement, mod.title, mod.number);
    setIsGenerating(false);

    const newItems: MLO[] = scaffolded.map((s, idx) => ({
      id: `mlo-${Date.now()}-${idx}`,
      code: s.code || `MLO ${mod.number}.${idx + 1}`,
      moduleId: mod.id,
      linkedCLOId: clo.id,
      statement: s.statement || '',
      bloomVerb: s.bloomVerb || 'Explain',
      bloomLevel: s.bloomLevel || 'Understand',
      requiredActivity: s.requiredActivity || 'Guided worksheet and practical exercise',
      assessment: s.assessment || 'Formative assessment item',
      evidence: s.evidence || 'Submitted response evaluated on rubric',
      studyTimeHours: s.studyTimeHours || 4,
    }));

    onChange({
      ...course,
      mlos: [...course.mlos, ...newItems],
    });
    if (newItems.length > 0) {
      setSelectedMLOId(newItems[0].id);
    }
  };

  // Find orphaned MLOs (missing linked CLO)
  const orphanedMLOs = course.mlos.filter(
    (m) => !m.linkedCLOId || !course.clos.some((c) => c.id === m.linkedCLOId)
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 06</span>
          <span>•</span>
          <span>Granular Outcomes & Scaffolding</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">
              Module Learning Outcomes (MLOs)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Scaffold learning systematically from foundational concepts to authentic applications. MLOs must directly trace to and support their parent Course Learning Outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenComments && selectedMLO && (
              <button
                type="button"
                onClick={() =>
                  onOpenComments(
                    selectedMLO.id,
                    'CLO',
                    `${selectedMLO.code}: ${selectedMLO.statement}`
                  )
                }
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Review Feedback</span>
              </button>
            )}

            <button
              onClick={handleGenerateScaffolded}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{isGenerating ? 'Scaffolding...' : 'AI Scaffold MLOs'}</span>
            </button>

            <button
              onClick={handleAddMLO}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add MLO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Accreditation Readiness Audit Card */}
      <div
        id="step06-granular-accreditation-card"
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
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
              <span>{stageEval.isCompleted ? 'Granular Outcomes Scaffolding Validated' : 'Outcome Scaffolding Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Stage 06 • Curricular Audit
              </span>
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {stageEval.isCompleted
                ? stageEval.summary
                : `Action required: ${stageEval.missingRequirements.join(', ')}`}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] bg-white/80 px-3 py-1.5 rounded-lg border border-current/20 shrink-0 self-start sm:self-auto">
          <span>
            Total MLOs: <strong>{course.mlos.length}</strong>
          </span>
          <span>•</span>
          <span>
            Scaffolding: <strong>{lowerOrderCount} Lower / {higherOrderCount} Higher</strong>
          </span>
        </div>
      </div>

      {/* Orphaned MLO Warning Banner */}
      {orphanedMLOs.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Disconnected Outcomes:</strong> {orphanedMLOs.length} MLO(s) (
              {orphanedMLOs.map((m) => m.code).join(', ')}) are not linked to a parent CLO.
            </span>
          </div>
          {course.clos.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const defaultCLO = course.clos[0];
                const fixed = course.mlos.map((m) =>
                  !m.linkedCLOId || !course.clos.some((c) => c.id === m.linkedCLOId)
                    ? { ...m, linkedCLOId: defaultCLO.id }
                    : m
                );
                onChange({ ...course, mlos: fixed });
              }}
              className="px-2.5 py-1 bg-rose-200 hover:bg-rose-300 text-rose-950 rounded-lg font-bold text-[11px] shrink-0 cursor-pointer"
            >
              Bind to {course.clos[0].code}
            </button>
          )}
        </div>
      )}

      {/* Module Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedModuleId('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            !selectedModuleId ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Modules ({course.mlos.length})
        </button>
        {course.modules.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedModuleId(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              selectedModuleId === m.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Module {m.number} ({course.mlos.filter((ml) => ml.moduleId === m.id).length})
          </button>
        ))}
      </div>

      {/* MLO Selector Pills */}
      {moduleMLOs.length > 0 ? (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {moduleMLOs.map((mlo) => (
            <button
              key={mlo.id}
              type="button"
              onClick={() => setSelectedMLOId(mlo.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border cursor-pointer ${
                (selectedMLO?.id || '') === mlo.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{mlo.code}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  mlo.bloomLevel === 'Create'
                    ? 'bg-purple-100 text-purple-700'
                    : mlo.bloomLevel === 'Evaluate'
                    ? 'bg-rose-100 text-rose-700'
                    : mlo.bloomLevel === 'Analyze'
                    ? 'bg-blue-100 text-blue-700'
                    : mlo.bloomLevel === 'Apply'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {mlo.bloomLevel}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
          <p className="text-xs text-slate-600">No MLOs created for this module yet.</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={handleGenerateScaffolded}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Scaffold MLOs</span>
            </button>
            <button
              type="button"
              onClick={handleAddMLO}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
            >
              Create Manually
            </button>
          </div>
        </div>
      )}

      {/* MLO Editor */}
      {selectedMLO && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={selectedMLO.code}
                onChange={(e) => handleUpdateMLO(selectedMLO.id, { code: e.target.value })}
                className="w-28 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50"
              />
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-700">
                {course.modules.find((m) => m.id === selectedMLO.moduleId)?.title || 'Module'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteMLO(selectedMLO.id)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              title="Delete MLO"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Cognitive Ceiling Warning */}
          {isCeilingExceeded && parentCLO && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Cognitive Ceiling Advisory:</span> MLO level is set to{' '}
                <strong>{selectedMLO.bloomLevel}</strong> (Rank {mloRank}), which exceeds parent outcome{' '}
                <strong>{parentCLO.code}</strong> at <strong>{parentCLO.bloomLevel}</strong> (Rank {parentRank}).
                In constructive alignment, granular learning objectives scaffold up to the course outcome rather than out-reaching it.
              </div>
            </div>
          )}

          {/* Statement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Outcome Statement <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <BloomsTaxonomyPopover
                  currentLevel={selectedMLO.bloomLevel}
                  currentVerb={selectedMLO.bloomVerb}
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
              value={selectedMLO.statement}
              onChange={(e) => handleUpdateMLO(selectedMLO.id, { statement: e.target.value })}
              placeholder="Start with an observable Bloom verb: e.g. Analyze the algorithmic efficiency of recursive data structures..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Connected CLO & Module */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parent Course Learning Outcome (CLO) <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedMLO.linkedCLOId}
                onChange={(e) => handleUpdateMLO(selectedMLO.id, { linkedCLOId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {course.clos.map((clo) => (
                  <option key={clo.id} value={clo.id}>
                    {clo.code} ({clo.bloomLevel}) — {clo.statement.slice(0, 55)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Module</label>
              <select
                value={selectedMLO.moduleId}
                onChange={(e) => handleUpdateMLO(selectedMLO.id, { moduleId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {course.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module {m.number}: {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bloom Details & Study Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bloom Verb</label>
              <input
                type="text"
                value={selectedMLO.bloomVerb}
                onChange={(e) => handleUpdateMLO(selectedMLO.id, { bloomVerb: e.target.value })}
                placeholder="e.g. Apply, Critique"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bloom Level</label>
              <select
                value={selectedMLO.bloomLevel}
                onChange={(e) => handleUpdateMLO(selectedMLO.id, { bloomLevel: e.target.value as BloomLevel })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Remember">Remember (Level 1)</option>
                <option value="Understand">Understand (Level 2)</option>
                <option value="Apply">Apply (Level 3)</option>
                <option value="Analyze">Analyze (Level 4)</option>
                <option value="Evaluate">Evaluate (Level 5)</option>
                <option value="Create">Create (Level 6)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Study Time (Hours)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={selectedMLO.studyTimeHours || 4}
                onChange={(e) => handleUpdateMLO(selectedMLO.id, { studyTimeHours: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Dynamic Suggested Action Verbs */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-800">
                  Observable Action Verbs for {selectedMLO.bloomLevel}:
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBloomsModalOpen(true)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Browse Full Matrix</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(BLOOM_TAXONOMY_DATA[selectedMLO.bloomLevel]?.categories.flatMap((c) => c.verbs).slice(0, 10) || []).map((verb) => {
                const isSelected = selectedMLO.bloomVerb?.toLowerCase() === verb.toLowerCase();
                return (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => handleSelectBloomVerb(verb, selectedMLO.bloomLevel)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                        : 'bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 border-slate-200'
                    }`}
                    title={`Set MLO verb to "${verb}"`}
                  >
                    {verb}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Triad of Evidence Alignment: Activity, Assessment, Evidence */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-900 block">
              Constructive Alignment Triad: Activity → Assessment → Evidence
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Required Learning Activity</label>
                <input
                  type="text"
                  value={selectedMLO.requiredActivity || ''}
                  onChange={(e) => handleUpdateMLO(selectedMLO.id, { requiredActivity: e.target.value })}
                  placeholder="e.g. Guided coding workout & review"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Associated Assessment</label>
                <input
                  type="text"
                  value={selectedMLO.assessment || ''}
                  onChange={(e) => handleUpdateMLO(selectedMLO.id, { assessment: e.target.value })}
                  placeholder="e.g. Diagnostic Quiz / Written Lab"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Demonstrable Evidence</label>
                <input
                  type="text"
                  value={selectedMLO.evidence || ''}
                  onChange={(e) => handleUpdateMLO(selectedMLO.id, { evidence: e.target.value })}
                  placeholder="e.g. Direct quiz score ≥ 70%"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Module Creator</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
        >
          <span>Save & Proceed to Lesson Creator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bloom's Taxonomy Helper Modal */}
      <BloomsTaxonomyHelperModal
        isOpen={bloomsModalOpen}
        onClose={() => setBloomsModalOpen(false)}
        selectedLevel={selectedMLO?.bloomLevel || 'Understand'}
        targetCLO={null}
        onSelectVerb={handleSelectBloomVerb}
        onApplyStem={handleApplyStem}
      />
    </div>
  );
};
