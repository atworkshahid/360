import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Plus, Trash2, BookOpen, Layers, Clock, X } from 'lucide-react';
import { Course, Module } from '../../../types';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step05ModuleCreator: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(course.modules[0]?.id || '');
  const [newResource, setNewResource] = useState('');

  const selectedModule = course.modules.find((m) => m.id === selectedModuleId) || course.modules[0];

  const handleUpdateModule = (id: string, updates: Partial<Module>) => {
    const updated = course.modules.map((m) => (m.id === id ? { ...m, ...updates } : m));
    onChange({ ...course, modules: updated });
  };

  const handleAddModule = () => {
    const nextNum = course.modules.length + 1;
    const newMod: Module = {
      id: `mod-${Date.now()}`,
      number: nextNum,
      title: `Module ${nextNum}: Core Subject Analysis`,
      description: 'Comprehensive study of operative frameworks and applied scenarios.',
      durationWeeks: 4,
      expectedStudyHours: 32,
      relatedCLOIds: course.clos.length > 0 ? [course.clos[0].id] : [],
      resources: ['Primary statutory and regulatory texts', 'Core reference book chapters'],
    };
    const updated = [...course.modules, newMod];
    onChange({ ...course, modules: updated, modulesCount: updated.length });
    setSelectedModuleId(newMod.id);
  };

  const handleDeleteModule = (id: string) => {
    if (course.modules.length <= 1) {
      alert('A course must contain at least one module.');
      return;
    }
    const filtered = course.modules.filter((m) => m.id !== id);
    // Renumber
    const renumbered = filtered.map((m, idx) => ({ ...m, number: idx + 1 }));
    onChange({ ...course, modules: renumbered, modulesCount: renumbered.length });
    if (selectedModuleId === id) {
      setSelectedModuleId(renumbered[0]?.id || '');
    }
  };

  const toggleCLOLink = (cloId: string) => {
    if (!selectedModule) return;
    const current = selectedModule.relatedCLOIds || [];
    const updated = current.includes(cloId) ? current.filter((id) => id !== cloId) : [...current, cloId];
    handleUpdateModule(selectedModule.id, { relatedCLOIds: updated });
  };

  const addResource = () => {
    if (!newResource.trim() || !selectedModule) return;
    const current = selectedModule.resources || [];
    handleUpdateModule(selectedModule.id, { resources: [...current, newResource.trim()] });
    setNewResource('');
  };

  const removeResource = (idx: number) => {
    if (!selectedModule) return;
    const current = selectedModule.resources || [];
    handleUpdateModule(selectedModule.id, { resources: current.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 05</span>
          <span>•</span>
          <span>Curricular Chunking</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Module Creator</h2>
            <p className="text-xs text-slate-500 mt-1">
              Structure the curriculum into cohesive instructional modules. Each module must explicitly serve one or more Course Learning Outcomes.
            </p>
          </div>
          <button
            onClick={handleAddModule}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {course.modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModuleId(mod.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border ${
              (selectedModule?.id || '') === mod.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Module {mod.number}</span>
            <span className="text-[11px] text-slate-400 font-normal max-w-[120px] truncate">
              {mod.title.replace(/^Module\s+\d+:\s*/i, '')}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Module Detail Editor */}
      {selectedModule && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Module Inputs: 8 cols */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                Module {selectedModule.number} Configuration
              </span>
              <button
                type="button"
                onClick={() => handleDeleteModule(selectedModule.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                title="Delete Module"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Module Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={selectedModule.title}
                onChange={(e) => handleUpdateModule(selectedModule.id, { title: e.target.value })}
                placeholder="e.g. Federalism and Centre-Province Relations"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Module Description & Scope</label>
              <textarea
                rows={3}
                value={selectedModule.description}
                onChange={(e) => handleUpdateModule(selectedModule.id, { description: e.target.value })}
                placeholder="Outline the core topics, statutory references, or technical themes..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Weeks)</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={selectedModule.durationWeeks}
                  onChange={(e) => handleUpdateModule(selectedModule.id, { durationWeeks: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Study Time (Hours)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={selectedModule.expectedStudyHours}
                  onChange={(e) => handleUpdateModule(selectedModule.id, { expectedStudyHours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Related CLOs Selection */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Related Course Learning Outcomes (CLOs) <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Select which CLOs are developed and assessed within this module.
              </p>
              <div className="space-y-2">
                {course.clos.map((clo) => {
                  const isChecked = (selectedModule.relatedCLOIds || []).includes(clo.id);
                  return (
                    <label
                      key={clo.id}
                      className={`flex items-start space-x-3 p-2.5 rounded-xl border cursor-pointer transition ${
                        isChecked ? 'bg-blue-50/70 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCLOLink(clo.id)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{clo.code}</span>
                        <span className="text-slate-600 ml-1.5">{clo.statement}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Required Resources / Reading List */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reading Materials & Prescribed Resources
              </label>
              <div className="space-y-2 mb-2">
                {(selectedModule.resources || []).map((res, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="text-slate-700 truncate">{res}</span>
                    <button
                      type="button"
                      onClick={() => removeResource(i)}
                      className="text-slate-400 hover:text-rose-500 ml-2 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. 18th Constitutional Amendment Act 2010"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={addResource}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Module Sub-Elements Summary: 4 cols */}
          <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Module Hierarchy Snapshot</h4>
            <p className="text-[11px] text-slate-500">
              Every module must cascade down into scaffolded MLOs, active lessons, formative activities, and evidence.
            </p>

            {/* MLOs count */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Module Learning Outcomes</span>
                <span className="text-xs font-extrabold text-indigo-600">
                  {course.mlos.filter((m) => m.moduleId === selectedModule.id).length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Configured in Stage 06</p>
            </div>

            {/* Lessons count */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Active Lessons</span>
                <span className="text-xs font-extrabold text-blue-600">
                  {course.lessons.filter((l) => l.moduleId === selectedModule.id).length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Configured in Stage 07</p>
            </div>

            {/* Activities count */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Learning Activities</span>
                <span className="text-xs font-extrabold text-emerald-600">
                  {course.activities.filter((a) => a.moduleId === selectedModule.id).length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Configured in Stage 08</p>
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
          <span>Back to PLO Mapping</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to MLO Creator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
