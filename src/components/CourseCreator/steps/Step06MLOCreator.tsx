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
} from 'lucide-react';
import { Course, MLO, BloomLevel } from '../../../types';
import { generateScaffoldedMLOs } from '../../../services/api';
import {
  BloomsTaxonomyHelperModal,
  BLOOM_TAXONOMY_DATA,
} from '../BloomsTaxonomyHelperModal';
import { BloomsTaxonomyPopover } from '../BloomsTaxonomyPopover';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step06MLOCreator: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [selectedMLOId, setSelectedMLOId] = useState<string>(course.mlos[0]?.id || '');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(course.modules[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [bloomsModalOpen, setBloomsModalOpen] = useState(false);

  const selectedMLO = course.mlos.find((m) => m.id === selectedMLOId) || course.mlos[0];
  const moduleMLOs = course.mlos.filter((m) => !selectedModuleId || m.moduleId === selectedModuleId);

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
      code: `MLO ${modNumber}.1.${countInMod}`,
      moduleId: mod?.id || 'mod-1',
      linkedCLOId: cloId,
      statement: `Explain foundational concepts and applications in ${mod?.title || 'this module'}.`,
      bloomVerb: 'Explain',
      bloomLevel: 'Understand',
      requiredActivity: 'Concept synthesis worksheet',
      assessment: 'Diagnostic Quiz / Assignment',
      evidence: 'Direct student work submission evaluated against criteria',
      studyTimeHours: 6,
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
      code: s.code || `MLO ${mod.number}.1.${idx + 1}`,
      moduleId: mod.id,
      linkedCLOId: clo.id,
      statement: s.statement || '',
      bloomVerb: s.bloomVerb || 'Explain',
      bloomLevel: s.bloomLevel || 'Understand',
      requiredActivity: s.requiredActivity || 'Guided worksheet',
      assessment: s.assessment || 'Formative assessment',
      evidence: s.evidence || 'Submitted response',
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

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 06</span>
          <span>•</span>
          <span>Granular Outcomes</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Module Learning Outcomes (MLOs)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Scaffold learning systematically from lower-order concepts to higher-order authentic applications. MLOs cannot remain disconnected from parent CLOs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateScaffolded}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{isGenerating ? 'Scaffolding...' : 'AI Scaffold MLOs'}</span>
            </button>
            <button
              onClick={handleAddMLO}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add MLO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedModuleId('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            !selectedModuleId ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Modules ({course.mlos.length})
        </button>
        {course.modules.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedModuleId(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
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
              onClick={() => setSelectedMLOId(mlo.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border ${
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
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-xs text-slate-600 mb-2">No MLOs created for this module yet.</p>
          <button
            onClick={handleGenerateScaffolded}
            className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Scaffolded MLOs with AI</span>
          </button>
        </div>
      )}

      {/* MLO Editor */}
      {selectedMLO && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
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
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Delete MLO"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

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
              placeholder="Start with an active Bloom verb: e.g. Explain the distribution of legislative powers following the abolition of the Concurrent List..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Connected CLO & Module */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parent CLO <span className="text-rose-500">* (Cannot remain disconnected)</span>
              </label>
              <select
                value={selectedMLO.linkedCLOId}
                onChange={(e) => handleUpdateMLO(selectedMLO.id, { linkedCLOId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {course.clos.map((clo) => (
                  <option key={clo.id} value={clo.id}>
                    {clo.code} — {clo.statement.slice(0, 60)}...
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
                <option value="Remember">Remember</option>
                <option value="Understand">Understand</option>
                <option value="Apply">Apply</option>
                <option value="Analyze">Analyze</option>
                <option value="Evaluate">Evaluate</option>
                <option value="Create">Create</option>
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

          {/* Dynamic Suggested Action Verbs for selected Bloom Level */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-800">
                  Suggested Action Verbs for {selectedMLO.bloomLevel} (Level {BLOOM_TAXONOMY_DATA[selectedMLO.bloomLevel]?.number || 2}):
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBloomsModalOpen(true)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Browse All Verbs</span>
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
            <span className="text-xs font-bold text-slate-900 block">Alignment Triad: Action → Assessment → Evidence</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Required Learning Activity</label>
                <input
                  type="text"
                  value={selectedMLO.requiredActivity || ''}
                  onChange={(e) => handleUpdateMLO(selectedMLO.id, { requiredActivity: e.target.value })}
                  placeholder="e.g. Case brief analysis exercise"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Associated Assessment</label>
                <input
                  type="text"
                  value={selectedMLO.assessment || ''}
                  onChange={(e) => handleUpdateMLO(selectedMLO.id, { assessment: e.target.value })}
                  placeholder="e.g. Diagnostic Quiz / Written Brief"
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

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Module Creator</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
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
