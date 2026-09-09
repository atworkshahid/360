import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Clock,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  MessageSquare,
  Wand2,
  Check,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Course, Module, WeeklyCoursePlanItem } from '../../../types';
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

export const Step05ModuleCreator: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(course.modules[0]?.id || '');
  const [newResource, setNewResource] = useState('');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const selectedModule = course.modules.find((m) => m.id === selectedModuleId) || course.modules[0];

  // Live Accreditation Evaluation for Stage 05 (Granular15)
  const stageEval = evaluateStage(course, 5, 'granular15');

  // Workload calculations
  const targetWeeks = course.durationWeeks || 16;
  const totalModuleWeeks = course.modules.reduce((sum, m) => sum + (m.durationWeeks || 0), 0);
  const totalStudyHours = course.modules.reduce((sum, m) => sum + (m.expectedStudyHours || 0), 0);
  const expectedCreditHours = (course.credits || 3) * 45; // 45 hours total learner workload per credit
  const weeksBalanced = totalModuleWeeks === targetWeeks;

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

  // Auto-Balance Weeks across modules to hit targetWeeks exactly
  const handleAutoBalanceWeeks = () => {
    const modCount = course.modules.length;
    if (modCount === 0) return;

    const baseWeeks = Math.floor(targetWeeks / modCount);
    const remainder = targetWeeks % modCount;

    const balancedModules = course.modules.map((m, idx) => {
      const extra = idx < remainder ? 1 : 0;
      const weeks = baseWeeks + extra;
      // Pro-rate study hours roughly proportional to weeks (e.g. 8-10 hours/week)
      const hours = Math.round((expectedCreditHours / targetWeeks) * weeks);
      return {
        ...m,
        durationWeeks: weeks,
        expectedStudyHours: hours,
      };
    });

    onChange({
      ...course,
      modules: balancedModules,
    });
  };

  // Modular presets
  const handleApplyPresetArchitecture = (type: 'tripartite' | 'quad' | 'sixunits') => {
    let newMods: Module[] = [];
    const cloIds = course.clos.map((c) => c.id);

    if (type === 'tripartite') {
      newMods = [
        {
          id: `mod-${Date.now()}-1`,
          number: 1,
          title: 'Module 1: Foundations, Theoretical Grounding & Core Principles',
          description: 'Introduction to foundational domain definitions, historical/legal background, and fundamental operating principles.',
          durationWeeks: 5,
          expectedStudyHours: 45,
          relatedCLOIds: cloIds.slice(0, Math.max(1, Math.ceil(cloIds.length / 3))),
          resources: ['Primary reference text chapters 1-3', 'Introductory case study packet'],
        },
        {
          id: `mod-${Date.now()}-2`,
          number: 2,
          title: 'Module 2: Analytical Methodologies & Systemic Application',
          description: 'In-depth quantitative and procedural problem-solving applying standard frameworks to real-world scenarios.',
          durationWeeks: 5,
          expectedStudyHours: 45,
          relatedCLOIds: cloIds.slice(Math.floor(cloIds.length / 3), Math.floor((cloIds.length * 2) / 3)),
          resources: ['Selected industry journal articles', 'Analytical workbook exercises'],
        },
        {
          id: `mod-${Date.now()}-3`,
          number: 3,
          title: 'Module 3: Advanced Synthesis, Emerging Paradigms & Practicum',
          description: 'Critical evaluation of edge cases, multi-criteria trade-offs, modern innovations, and capstone practical demonstration.',
          durationWeeks: targetWeeks - 10,
          expectedStudyHours: 45,
          relatedCLOIds: cloIds.slice(Math.floor((cloIds.length * 2) / 3)),
          resources: ['Capstone case studies', 'Emerging industry whitepapers & standards'],
        },
      ];
    } else if (type === 'quad') {
      const w = Math.floor(targetWeeks / 4);
      newMods = [
        {
          id: `mod-${Date.now()}-1`,
          number: 1,
          title: 'Module 1: Foundational Paradigms & Environment',
          description: 'Conceptual architecture, taxonomy, and baseline disciplinary standards.',
          durationWeeks: w,
          expectedStudyHours: 35,
          relatedCLOIds: cloIds.slice(0, 1),
          resources: ['Foundations textbook readings'],
        },
        {
          id: `mod-${Date.now()}-2`,
          number: 2,
          title: 'Module 2: Core Analytical & Computational Tools',
          description: 'Formulation and analysis of core domain models and experimental protocols.',
          durationWeeks: w,
          expectedStudyHours: 35,
          relatedCLOIds: cloIds.slice(1, 2),
          resources: ['Laboratory manual and modeling guidelines'],
        },
        {
          id: `mod-${Date.now()}-3`,
          number: 3,
          title: 'Module 3: Complex Systems & Applied Problem Solving',
          description: 'System design, optimization under constraints, and integrated practical workflows.',
          durationWeeks: w,
          expectedStudyHours: 35,
          relatedCLOIds: cloIds.slice(2, 3),
          resources: ['Applied design challenges & benchmark datasets'],
        },
        {
          id: `mod-${Date.now()}-4`,
          number: 4,
          title: 'Module 4: Evaluation, Ethics, Governance & Synthesis',
          description: 'Professional responsibility, performance assessment, and final capstone execution.',
          durationWeeks: targetWeeks - w * 3,
          expectedStudyHours: 35,
          relatedCLOIds: cloIds.slice(3),
          resources: ['Code of ethics, regulatory compliance documentation'],
        },
      ];
    } else {
      // 6 units
      const w = Math.max(2, Math.floor(targetWeeks / 6));
      newMods = Array.from({ length: 6 }, (_, i) => ({
        id: `mod-${Date.now()}-${i + 1}`,
        number: i + 1,
        title: `Module ${i + 1}: Thematic Unit ${i + 1}`,
        description: `Focused modular exploration of thematic area ${i + 1}.`,
        durationWeeks: i === 5 ? targetWeeks - w * 5 : w,
        expectedStudyHours: 24,
        relatedCLOIds: cloIds.length > 0 ? [cloIds[i % cloIds.length]] : [],
        resources: [`Unit ${i + 1} reference readings`],
      }));
    }

    onChange({
      ...course,
      modules: newMods,
      modulesCount: newMods.length,
    });
    setSelectedModuleId(newMods[0].id);
  };

  // Synchronize Modules into Weekly Course Plan
  const handleSyncModulesToWeeklyPlan = () => {
    let currentWeek = 1;
    const generatedWeeklyPlan: WeeklyCoursePlanItem[] = [];

    course.modules.forEach((mod) => {
      const weeksForMod = Math.max(1, mod.durationWeeks || 1);
      const hoursPerWeek = Math.round((mod.expectedStudyHours || 32) / weeksForMod);

      for (let i = 1; i <= weeksForMod; i++) {
        generatedWeeklyPlan.push({
          weekNumber: currentWeek,
          topic: `${mod.title} - Part ${i}/${weeksForMod}`,
          subtopics: mod.description,
          linkedCLOIds: mod.relatedCLOIds || [],
          contactHours: 3,
          independentStudyHours: Math.max(3, hoursPerWeek - 3),
          requiredReading: (mod.resources || []).join(', ') || 'Prescribed module materials',
          learningActivity: 'Interactive lecture, seminar discussion, and guided problem solving',
        });
        currentWeek++;
      }
    });

    onChange({
      ...course,
      weeklyPlan: generatedWeeklyPlan,
    });

    setSyncNotice(
      `Successfully generated ${generatedWeeklyPlan.length} weekly syllabus units synchronized with your ${course.modules.length} modules!`
    );
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // Find orphaned CLOs (not mapped to any module)
  const orphanedCLOs = course.clos.filter(
    (clo) => !course.modules.some((m) => (m.relatedCLOIds || []).includes(clo.id))
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 05</span>
          <span>•</span>
          <span>Curricular Architecture & Pacing</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Module Creator</h2>
            <p className="text-xs text-slate-500 mt-1">
              Structure the curriculum into cohesive, paced instructional modules. Each module must explicitly serve one or more Course Learning Outcomes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onOpenComments && selectedModule && (
              <button
                type="button"
                onClick={() =>
                  onOpenComments(
                    selectedModule.id,
                    'Module',
                    `Module ${selectedModule.number}: ${selectedModule.title}`
                  )
                }
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Review Feedback</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                onAskCopilot(
                  `Evaluate the modular curriculum structure for course "${course.title}". Suggest balanced module breakdowns, durations, and CLO mappings.`
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Module Advisor</span>
            </button>

            <button
              onClick={handleAddModule}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Accreditation Readiness Audit Card */}
      <div
        id="step05-granular-accreditation-card"
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
              <span>{stageEval.isCompleted ? 'Modular Architecture Validated' : 'Curricular Chunking Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Stage 05 • Curricular Audit
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
            Pacing: <strong>{totalModuleWeeks} / {targetWeeks} Weeks</strong>
          </span>
          <span>•</span>
          <span>
            Workload: <strong>{totalStudyHours}h</strong> (Target: ~{expectedCreditHours}h)
          </span>
        </div>
      </div>

      {/* Pacing & Workload Balancer Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800">Curricular Pacing & Workload Alignment</span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Course duration: <strong>{targetWeeks} weeks</strong>. Modules currently sum to{' '}
              <strong className={weeksBalanced ? 'text-emerald-700' : 'text-amber-700'}>
                {totalModuleWeeks} weeks
              </strong>
              .
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!weeksBalanced && (
              <button
                type="button"
                onClick={handleAutoBalanceWeeks}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Auto-Balance to {targetWeeks} Weeks</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSyncModulesToWeeklyPlan}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              title="Expand module structure into the course's weekly plan"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync Modules into Weekly Plan</span>
            </button>
          </div>
        </div>

        {/* Visual Week Distribution Bar */}
        <div className="space-y-1">
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
            {course.modules.map((m, idx) => {
              const widthPct = (m.durationWeeks / Math.max(totalModuleWeeks, targetWeeks)) * 100;
              const colors = [
                'bg-blue-500',
                'bg-indigo-500',
                'bg-cyan-500',
                'bg-teal-500',
                'bg-sky-500',
                'bg-violet-500',
              ];
              return (
                <div
                  key={m.id}
                  style={{ width: `${widthPct}%` }}
                  className={`${colors[idx % colors.length]} hover:opacity-90 transition relative group cursor-pointer border-r border-white/40`}
                  onClick={() => setSelectedModuleId(m.id)}
                  title={`Module ${m.number}: ${m.durationWeeks} weeks`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Week 1</span>
            <span>Total: {totalModuleWeeks} Weeks</span>
            <span>Target: Week {targetWeeks}</span>
          </div>
        </div>
      </div>

      {/* Sync Notice Alert */}
      {syncNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Presets Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-700">Quick Curriculum Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyPresetArchitecture('tripartite')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            3-Part Progression (Foundations • Applied • Capstone)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetArchitecture('quad')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            4-Block Architecture (Theory • Methods • Systems • Ethics)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetArchitecture('sixunits')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            6 Thematic Units (2-3 Weeks Each)
          </button>
        </div>
      </div>

      {/* Orphaned CLO Alert */}
      {orphanedCLOs.length > 0 && selectedModule && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Unlinked Outcomes:</strong> {orphanedCLOs.length} CLO(s) (
              {orphanedCLOs.map((c) => c.code).join(', ')}) are not linked to any module.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = selectedModule.relatedCLOIds || [];
              const toAdd = orphanedCLOs.map((c) => c.id).filter((id) => !current.includes(id));
              handleUpdateModule(selectedModule.id, { relatedCLOIds: [...current, ...toAdd] });
            }}
            className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold rounded-lg text-[11px] shrink-0 cursor-pointer"
          >
            Attach All to Module {selectedModule.number}
          </button>
        </div>
      )}

      {/* Module Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {course.modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModuleId(mod.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border cursor-pointer ${
              (selectedModule?.id || '') === mod.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Module {mod.number}</span>
            <span className="text-[11px] text-slate-400 font-normal max-w-[140px] truncate">
              {mod.title.replace(/^Module\s+\d+:\s*/i, '')}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-current">
              {mod.durationWeeks}w
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
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900">
                  Module {selectedModule.number} Configuration
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">
                  {selectedModule.durationWeeks} Weeks • {selectedModule.expectedStudyHours} Hours
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteModule(selectedModule.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
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
                placeholder="e.g. Constitutional Frameworks and Provincial Autonomy"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Module Description & Scope</label>
              <textarea
                rows={3}
                value={selectedModule.description}
                onChange={(e) => handleUpdateModule(selectedModule.id, { description: e.target.value })}
                placeholder="Outline core themes, theoretical frameworks, statutory references, and applied contexts..."
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Related Course Learning Outcomes (CLOs) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {(selectedModule.relatedCLOIds || []).length} linked
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Select which Course Learning Outcomes are scaffolded and assessed in this module.
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
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="text-xs flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{clo.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                            {clo.bloomLevel}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{clo.statement}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Required Resources / Reading List */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prescribed Reading Materials & Resources
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
                      className="text-slate-400 hover:text-rose-500 ml-2 shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Standard Reference Text, Chapter 4 or Case Study"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={addResource}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Module Sub-Elements Summary: 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Module Hierarchy Snapshot</h4>
              <p className="text-[11px] text-slate-500">
                Every module cascades into granular MLOs, active lessons, formative activities, and evidence.
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

            {/* Workload Breakdown Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Workload Estimate</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Weekly Pace:</span>
                  <strong className="text-slate-900">
                    {Math.round(selectedModule.expectedStudyHours / Math.max(1, selectedModule.durationWeeks))} hrs/wk
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Classroom / Lecture:</span>
                  <strong className="text-slate-900">~3 hrs/wk</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Self-Directed Study:</span>
                  <strong className="text-slate-900">
                    ~{Math.max(1, Math.round(selectedModule.expectedStudyHours / Math.max(1, selectedModule.durationWeeks)) - 3)} hrs/wk
                  </strong>
                </div>
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
          <span>Back to PLO Mapping</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
        >
          <span>Save & Proceed to MLO Creator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
