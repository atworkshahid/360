import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Clock,
  Activity as ActivityIcon,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  Zap,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Course, Activity, BloomLevel, ActivityType } from '../../../types';
import { evaluateStage } from '../../../utils/stageProgress';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot?: (prompt: string) => void;
  onOpenComments?: (
    targetId: string,
    targetType: 'CLO' | 'Assessment' | 'Rubric' | 'Module' | 'General',
    targetTitle: string
  ) => void;
}

interface TLATemplate {
  name: string;
  category: 'Active Learning' | 'Direct Instruction' | 'Authentic Practice' | 'Collaborative';
  activityType: ActivityType;
  recommendedBloom: BloomLevel[];
  description: string;
  defaultMins: number;
  evidenceProduced: string;
}

const TLA_CATALOG: TLATemplate[] = [
  {
    name: 'Problem-Based Learning (PBL) Studio',
    category: 'Active Learning',
    activityType: 'Problem Solving',
    recommendedBloom: ['Apply', 'Analyze', 'Evaluate'],
    description: 'Students work in multidisciplinary squads on unstructured, ill-defined industrial scenarios to synthesize verified solutions.',
    defaultMins: 90,
    evidenceProduced: 'Structured solution architecture document with mathematical or algorithmic rationale',
  },
  {
    name: 'Hands-on Laboratory & Bench Workout',
    category: 'Authentic Practice',
    activityType: 'Practical Demonstration',
    recommendedBloom: ['Apply', 'Create'],
    description: 'Practical computing or engineering laboratory session with automated verification suites and immediate diagnostic feedback.',
    defaultMins: 120,
    evidenceProduced: 'Working software/hardware artifact passing automated test cases with verification log',
  },
  {
    name: 'Socratic Seminar & Policy Deconstruction',
    category: 'Active Learning',
    activityType: 'Discussion',
    recommendedBloom: ['Analyze', 'Evaluate'],
    description: 'Facilitated discussion critically scrutinizing ethical dilemmas, statutory interpretations, or professional codes of conduct.',
    defaultMins: 60,
    evidenceProduced: 'Annotated debate transcript, position paper, or analytical synthesis memo',
  },
  {
    name: 'Interactive Lecture with Formative Polling',
    category: 'Direct Instruction',
    activityType: 'Reflection',
    recommendedBloom: ['Remember', 'Understand'],
    description: 'Instructor-led conceptual deconstruction interspersed with real-time diagnostic questions and micro-reflections.',
    defaultMins: 60,
    evidenceProduced: 'Formative concept check score and individual reflective exit ticket',
  },
  {
    name: 'Industrial Case Study Comparative Analysis',
    category: 'Active Learning',
    activityType: 'Case Study',
    recommendedBloom: ['Analyze', 'Evaluate'],
    description: 'In-depth retrospective of catastrophic engineering failures, commercial bankruptcies, or architectural trade-offs.',
    defaultMins: 75,
    evidenceProduced: 'Root-cause analysis memo with alternative preventative risk mitigations',
  },
  {
    name: 'Capstone Design Sprint & Peer Review Bench',
    category: 'Collaborative',
    activityType: 'Collaborative Task',
    recommendedBloom: ['Create', 'Evaluate'],
    description: 'Agile team milestone iteration featuring live artifact demonstrations, reciprocal critiques, and structured peer rubrics.',
    defaultMins: 120,
    evidenceProduced: 'Iterative sprint deliverables and rubric-graded peer evaluations',
  },
];

const BLOOM_RANKS: Record<BloomLevel, number> = {
  Remember: 1,
  Understand: 2,
  Apply: 3,
  Analyze: 4,
  Evaluate: 5,
  Create: 6,
};

export const Step07TeachingActivities: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
}) => {
  const clos = course.clos || [];
  const activities: Activity[] = course.activities || [];
  const [filterCLOId, setFilterCLOId] = useState<string>('');

  // Live Accreditation Evaluation for Stage 07 (OBE10)
  const stageEval = evaluateStage(course, 7, 'obe10');

  // Workload and Engagement Calculations
  const totalActivityMins = activities.reduce((sum, a) => sum + (a.estimatedMins || 60), 0);
  const activeMins = activities
    .filter((a) => a.activityType !== 'Reflection')
    .reduce((sum, a) => sum + (a.estimatedMins || 60), 0);
  const activePercent = totalActivityMins > 0 ? Math.round((activeMins / totalActivityMins) * 100) : 0;

  const handleAddFromTemplate = (template: TLATemplate) => {
    const matchingCLO =
      clos.find((c) => template.recommendedBloom.includes(c.bloomLevel)) ||
      clos[0] || { id: 'clo-1', code: 'CLO 1', bloomLevel: 'Understand' as BloomLevel };

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      moduleId: course.modules?.[0]?.id || 'mod-1',
      outcomeType: 'CLO',
      outcomeId: matchingCLO.id,
      title: template.name,
      activityType: template.activityType,
      studentActionPrompt: template.description,
      evidenceProduced: template.evidenceProduced,
      estimatedMins: template.defaultMins,
    };

    onChange({ ...course, activities: [...activities, newActivity] });
  };

  const handleAddCustomActivity = () => {
    const defaultCLO = clos[0] || { id: 'clo-1', code: 'CLO 1', bloomLevel: 'Apply' as BloomLevel };
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      moduleId: course.modules?.[0]?.id || 'mod-1',
      outcomeType: 'CLO',
      outcomeId: defaultCLO.id,
      title: 'Interactive Studio & Applied Problem Solving',
      activityType: 'Problem Solving',
      studentActionPrompt: 'Students analyze the prescribed domain scenario, form hypotheses, and test them systematically.',
      evidenceProduced: 'Completed analytical worksheet and diagnostic submission',
      estimatedMins: 60,
    };
    onChange({ ...course, activities: [...activities, newActivity] });
  };

  const handleRemoveActivity = (id: string) => {
    onChange({
      ...course,
      activities: activities.filter((a) => a.id !== id),
    });
  };

  const handleUpdateActivity = (id: string, updates: Partial<Activity>) => {
    onChange({
      ...course,
      activities: activities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    });
  };

  // Sync activities with weekly schedule
  const handleSyncToWeeklyPlan = () => {
    if (!course.weeklyPlan || course.weeklyPlan.length === 0 || activities.length === 0) return;
    const updatedPlan = course.weeklyPlan.map((w, idx) => {
      const assignedAct = activities[idx % activities.length];
      return {
        ...w,
        learningActivity: assignedAct.title,
      };
    });
    onChange({ ...course, weeklyPlan: updatedPlan });
  };

  // Generate activities from Weekly Plan if course has weekly plan but no activities
  const handleImportFromWeeklyPlan = () => {
    if (!course.weeklyPlan || course.weeklyPlan.length === 0) return;
    const created: Activity[] = [];
    course.weeklyPlan.forEach((w, idx) => {
      if (w.learningActivity?.trim()) {
        const linkedId = w.linkedCLOIds?.[0] || clos[0]?.id || 'clo-1';
        created.push({
          id: `act-${Date.now()}-${idx}`,
          moduleId: course.modules?.[0]?.id || 'mod-1',
          outcomeType: 'CLO',
          outcomeId: linkedId,
          title: w.learningActivity,
          activityType: (w.learningActivity || '').toLowerCase().includes('lab')
            ? 'Practical Demonstration'
            : 'Problem Solving',
          studentActionPrompt: `Week ${w.weekNumber} instructional session focusing on ${w.topic}. ${w.subtopics || ''}`,
          evidenceProduced: 'Completed weekly worksheet and problem solutions',
          estimatedMins: (w.contactHours || 3) * 60,
        });
      }
    });

    if (created.length > 0) {
      onChange({ ...course, activities: [...activities, ...created] });
    }
  };

  // Filter activities
  const filteredActivities = filterCLOId
    ? activities.filter((a) => a.outcomeId === filterCLOId)
    : activities;

  // Uncovered CLOs (CLOs without any dedicated TLA)
  const coveredCLOIds = new Set(activities.map((a) => a.outcomeId));
  const uncoveredCLOs = clos.filter((c) => !coveredCLOIds.has(c.id));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 07 of 10</span>
            <span>•</span>
            <span>Instructional Strategies</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Teaching & Learning Activities (TLAs)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Design active, student-centered learning methodologies constructively aligned with your targeted cognitive levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenComments && (
            <button
              type="button"
              onClick={() =>
                onOpenComments(
                  'teaching-learning-activities',
                  'General',
                  `Teaching & Learning Activities (${activities.length} Configured)`
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Review Feedback</span>
            </button>
          )}

          {onAskCopilot && (
            <button
              type="button"
              onClick={() =>
                onAskCopilot(
                  `Review our active Teaching & Learning Activities for "${course.title}". Ensure activities demand observable student action at the proper Bloom level (PBL, Case Studies, Coding workouts). Current active learning ratio: ${activePercent}%.`
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Pedagogy Advisor</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddCustomActivity}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Activity</span>
          </button>
        </div>
      </div>

      {/* Live Accreditation Readiness Audit Card */}
      <div
        id="step07-obe-accreditation-card"
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
              <span>{stageEval.isCompleted ? 'Pedagogical Activities Validated' : 'Activity Plan Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Step 07 • Accreditation Audit
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
            Active Learning Ratio: <strong>{activePercent}%</strong> (Target: &ge; 40%)
          </span>
          <span>•</span>
          <span className={uncoveredCLOs.length === 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
            {clos.length - uncoveredCLOs.length} / {clos.length} CLOs Addressed
          </span>
        </div>
      </div>

      {/* Active Learning Engagement Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Engagement Distribution
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-base">{activePercent}% Active</span>
            <span className="text-[11px] text-slate-500">
              ({activeMins} mins active / {totalActivityMins} total)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex mt-1">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, activePercent)}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Accreditation Benchmark (HEC / ABET)
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {activePercent >= 40 ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Meets active learning threshold (&ge; 40%)
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Shift lectures toward problem solving / studio
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            Student-centered practice fosters demonstrable outcome attainment.
          </p>
        </div>

        <div className="flex flex-col justify-center space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Syllabus Integration
          </span>
          <div className="flex flex-wrap gap-1.5">
            {course.weeklyPlan && course.weeklyPlan.length > 0 && (
              <button
                type="button"
                onClick={handleSyncToWeeklyPlan}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition cursor-pointer"
              >
                Sync to Weekly Schedule
              </button>
            )}
            {activities.length === 0 && course.weeklyPlan && course.weeklyPlan.length > 0 && (
              <button
                type="button"
                onClick={handleImportFromWeeklyPlan}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[11px] transition cursor-pointer"
              >
                Import from Weekly Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Uncovered CLO Banner */}
      {uncoveredCLOs.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Missing Pedagogical Coverage:</strong> Outcome(s){' '}
              <strong>{uncoveredCLOs.map((c) => c.code).join(', ')}</strong> currently have no assigned Teaching & Learning Activity.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newItems: Activity[] = [];
              uncoveredCLOs.forEach((clo) => {
                const template = TLA_CATALOG.find((t) => t.recommendedBloom.includes(clo.bloomLevel)) || TLA_CATALOG[0];
                newItems.push({
                  id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  moduleId: course.modules?.[0]?.id || 'mod-1',
                  outcomeType: 'CLO',
                  outcomeId: clo.id,
                  title: `${clo.code}: ${template.name}`,
                  activityType: template.activityType,
                  studentActionPrompt: template.description,
                  evidenceProduced: template.evidenceProduced,
                  estimatedMins: template.defaultMins,
                });
              });
              onChange({ ...course, activities: [...activities, ...newItems] });
            }}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold rounded-lg text-xs shrink-0 cursor-pointer"
          >
            Auto-Scaffold for Missing CLOs
          </button>
        </div>
      )}

      {/* Curated Active Learning Catalog */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Curated Active Learning Methodologies (Click to Add)
          </span>
          <span className="text-[11px] text-slate-400">
            Constructive Alignment Templates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TLA_CATALOG.map((tla) => (
            <div
              key={tla.name}
              onClick={() => handleAddFromTemplate(tla)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {tla.category}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600">
                  {tla.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {tla.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-500">Target Bloom:</span>
                  <span>{tla.recommendedBloom.join(', ')}</span>
                </div>
                <span>{tla.defaultMins} mins</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configured Course TLAs List */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Configured Course Teaching & Learning Activities ({activities.length})
          </h3>

          {clos.length > 0 && (
            <div className="flex items-center space-x-1.5 text-xs overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterCLOId('')}
                className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                  filterCLOId === ''
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({activities.length})
              </button>
              {clos.map((c) => {
                const count = activities.filter((a) => a.outcomeId === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFilterCLOId(filterCLOId === c.id ? '' : c.id)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer flex items-center space-x-1 ${
                      filterCLOId === c.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.code}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
            No activities configured for this selection. Click any card from the catalog above to add an authentic active learning activity.
          </div>
        ) : (
          filteredActivities.map((act) => {
            const linkedCLO = clos.find((c) => c.id === act.outcomeId);
            const isPassive = act.activityType === 'Reflection';
            const isHighLevelCLO = linkedCLO && BLOOM_RANKS[linkedCLO.bloomLevel] >= 3;
            const hasPedagogicalMismatch = isPassive && isHighLevelCLO;

            return (
              <div
                key={act.id}
                className={`p-4 bg-white rounded-xl border shadow-2xs space-y-3 transition ${
                  hasPedagogicalMismatch ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Pedagogical Mismatch Advisory */}
                {hasPedagogicalMismatch && linkedCLO && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Pedagogical Constructive Alignment Warning:</strong>{' '}
                      {linkedCLO.code} targets <strong>{linkedCLO.bloomLevel}</strong> (Higher-Order Cognitive Level).
                      Accreditation guidelines mandate experiential / active learning (Problem Solving, Practical Lab, Case Study) rather than passive direct instruction.
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white font-mono shrink-0">
                      TLA
                    </span>
                    <input
                      type="text"
                      value={act.title}
                      onChange={(e) => handleUpdateActivity(act.id, { title: e.target.value })}
                      className="font-bold text-xs text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Method:</span>
                      <select
                        value={act.activityType}
                        onChange={(e) =>
                          handleUpdateActivity(act.id, {
                            activityType: e.target.value as ActivityType,
                          })
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Problem Solving">Problem Solving (PBL)</option>
                        <option value="Practical Demonstration">Practical / Lab Workout</option>
                        <option value="Case Study">Case Study Analysis</option>
                        <option value="Discussion">Socratic Seminar / Discussion</option>
                        <option value="Collaborative Task">Collaborative Project Sprint</option>
                        <option value="Simulation">Simulation / Scenario</option>
                        <option value="Reflection">Interactive Lecture & Reflection</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Target CLO:</span>
                      <select
                        value={act.outcomeId}
                        onChange={(e) => handleUpdateActivity(act.id, { outcomeId: e.target.value })}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                      >
                        {clos.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} ({c.bloomLevel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Duration:</span>
                      <input
                        type="number"
                        min={15}
                        max={300}
                        step={15}
                        value={act.estimatedMins || 60}
                        onChange={(e) =>
                          handleUpdateActivity(act.id, { estimatedMins: Number(e.target.value) })
                        }
                        className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 text-center bg-white"
                      />
                      <span className="text-[10px] text-slate-400">mins</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(act.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                      title="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Student Action Prompt & Facilitation Protocol
                    </label>
                    <textarea
                      rows={2}
                      value={act.studentActionPrompt || ''}
                      onChange={(e) => handleUpdateActivity(act.id, { studentActionPrompt: e.target.value })}
                      placeholder="Pedagogical instructions for student activity..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Demonstrable Student Learning Artifact (Evidence)
                    </label>
                    <textarea
                      rows={2}
                      value={act.evidenceProduced || ''}
                      onChange={(e) => handleUpdateActivity(act.id, { evidenceProduced: e.target.value })}
                      placeholder="What artifact is generated (e.g. Code, Case brief, Calculation log)?"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Weekly Plan</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Assessment Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
