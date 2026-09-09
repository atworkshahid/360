import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  MessageSquare,
  Layers,
  Check,
  Tag,
  Wand2,
} from 'lucide-react';
import { Course, WeeklyCoursePlanItem, BloomLevel } from '../../../types';
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

const SAMPLE_ACTIVITIES = [
  'Interactive Lecture & Active Recall',
  'Laboratory Coding Workout',
  'Problem-Based Learning Lab',
  'Socratic Seminar & Case Discussion',
  'Case Study Comparative Analysis',
  'Team Milestone Sprint & Critique',
  'Tutorial & Mathematical Problem Solving',
  'Simulated Industry Practicum',
];

type WeekMilestoneType = 'Instruction' | 'Midterm' | 'ProjectReview' | 'Recess' | 'FinalExam';

export const Step06WeeklyPlan: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
}) => {
  const durationWeeks = course.durationWeeks || 16;
  const clos = course.clos || [];
  const weeklyPlan: WeeklyCoursePlanItem[] = course.weeklyPlan || [];
  const [filterCLOId, setFilterCLOId] = useState<string>('');

  // Live Accreditation Evaluation for Stage 06 (OBE10)
  const stageEval = evaluateStage(course, 6, 'obe10');

  // Workload calculations
  const totalCredits = course.credits || course.creditHours || 3;
  const expectedTotalHours = totalCredits * 45; // 45 hours total per credit
  const totalContactHours = weeklyPlan.reduce((acc, w) => acc + (w.contactHours || 0), 0);
  const totalStudyHours = weeklyPlan.reduce((acc, w) => acc + (w.independentStudyHours || 0), 0);
  const totalCumulativeHours = totalContactHours + totalStudyHours;

  // Initialize weekly plan if empty or reset
  const handleAutoPopulateWeeks = (presetType: 'standard' | 'lab' | 'intensive' = 'standard') => {
    const newPlan: WeeklyCoursePlanItem[] = [];
    const targetWeeks = presetType === 'intensive' ? 12 : durationWeeks;
    const standardContact = course.theoryHours ? course.theoryHours + (course.labHours || 0) * 2 : 3;
    const standardStudy = Math.max(3, Math.round(expectedTotalHours / targetWeeks) - standardContact);

    for (let w = 1; w <= targetWeeks; w++) {
      const assignedCLO = clos[(w - 1) % (clos.length || 1)] || clos[0];

      let topic = `Core Instructional Topic ${w}: Analytical Principles`;
      let activity = SAMPLE_ACTIVITIES[(w - 1) % SAMPLE_ACTIVITIES.length];
      let notes = 'Standard instructional delivery';

      if (w === 8 && targetWeeks >= 14) {
        topic = 'Midterm Examination, Performance Diagnostics & Formative Debrief';
        activity = 'Formal Written / Practical Assessment & Constructive Feedback';
        notes = 'Midterm Examination Milestone';
      } else if (w === targetWeeks) {
        topic = 'Final Comprehensive Review & Summative Course Evaluation';
        activity = 'Terminal Evaluative Assessment & Portfolios';
        notes = 'Final Examination Milestone';
      } else if (presetType === 'lab' && w % 2 === 0) {
        topic = `Applied Laboratory Practicum ${w / 2}: Experimental Protocols`;
        activity = 'Hands-On Laboratory Experimentation & Benchmark Verification';
      }

      newPlan.push({
        weekNumber: w,
        topic,
        subtopics: 'Foundational concepts, algorithmic formulations, and practical domain problem solving',
        linkedCLOIds: assignedCLO ? [assignedCLO.id] : [],
        bloomLevel: assignedCLO?.bloomLevel || 'Understand',
        learningActivity: activity,
        contactHours: standardContact,
        independentStudyHours: standardStudy,
        requiredReading: `Prescribed course readings & case notes for Week ${w}`,
        notes,
      });
    }

    onChange({ ...course, weeklyPlan: newPlan, durationWeeks: targetWeeks });
  };

  const handleUpdateWeek = (weekNumber: number, updates: Partial<WeeklyCoursePlanItem>) => {
    let current = [...weeklyPlan];
    if (current.length === 0) {
      handleAutoPopulateWeeks();
      return;
    }
    current = current.map((item) =>
      item.weekNumber === weekNumber ? { ...item, ...updates } : item
    );
    onChange({ ...course, weeklyPlan: current });
  };

  const handleAddSingleWeek = () => {
    const nextWeekNum = weeklyPlan.length + 1;
    const assignedCLO = clos[(nextWeekNum - 1) % (clos.length || 1)] || clos[0];
    const newWeek: WeeklyCoursePlanItem = {
      weekNumber: nextWeekNum,
      topic: `Instructional Session ${nextWeekNum}`,
      subtopics: 'Advanced methodologies and critical domain analysis',
      linkedCLOIds: assignedCLO ? [assignedCLO.id] : [],
      bloomLevel: assignedCLO?.bloomLevel || 'Apply',
      learningActivity: 'Interactive Lecture & Problem-Solving Studio',
      contactHours: 3,
      independentStudyHours: 6,
      requiredReading: `Selected readings for Week ${nextWeekNum}`,
    };
    const updated = [...weeklyPlan, newWeek];
    onChange({ ...course, weeklyPlan: updated, durationWeeks: Math.max(durationWeeks, updated.length) });
  };

  const handleDeleteWeek = (weekNum: number) => {
    if (weeklyPlan.length <= 1) {
      alert('Syllabus must contain at least one instructional week.');
      return;
    }
    const filtered = weeklyPlan.filter((w) => w.weekNumber !== weekNum);
    // Renumber sequentially
    const renumbered = filtered.map((w, idx) => ({ ...w, weekNumber: idx + 1 }));
    onChange({ ...course, weeklyPlan: renumbered, durationWeeks: renumbered.length });
  };

  // Balance hours across all weeks
  const handleBalanceHours = () => {
    if (weeklyPlan.length === 0) return;
    const weeklyTarget = Math.round(expectedTotalHours / weeklyPlan.length);
    const standardContact = course.theoryHours ? course.theoryHours + (course.labHours || 0) * 2 : 3;
    const standardStudy = Math.max(2, weeklyTarget - standardContact);

    const balanced = weeklyPlan.map((w) => ({
      ...w,
      contactHours: standardContact,
      independentStudyHours: standardStudy,
    }));

    onChange({ ...course, weeklyPlan: balanced });
  };

  // Automatically distribute unaddressed CLOs into remaining weeks
  const handleDistributeMissingCLOs = () => {
    if (clos.length === 0 || weeklyPlan.length === 0) return;
    const updated = weeklyPlan.map((w, idx) => {
      const assignedCLO = clos[idx % clos.length];
      const existing = w.linkedCLOIds || [];
      const combined = existing.includes(assignedCLO.id) ? existing : [...existing, assignedCLO.id];
      return {
        ...w,
        linkedCLOIds: combined,
        bloomLevel: assignedCLO.bloomLevel || w.bloomLevel,
      };
    });
    onChange({ ...course, weeklyPlan: updated });
  };

  // Check taught CLOs
  const coveredCLOIds = new Set<string>();
  weeklyPlan.forEach((w) => {
    (w.linkedCLOIds || []).forEach((id) => coveredCLOIds.add(id));
  });

  const missingCLOs = clos.filter(
    (c) => !coveredCLOIds.has(c.id) && !coveredCLOIds.has(c.code)
  );

  const filteredWeeks = filterCLOId
    ? weeklyPlan.filter((w) => (w.linkedCLOIds || []).includes(filterCLOId))
    : weeklyPlan;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 06 of 10</span>
            <span>•</span>
            <span>Instructional Sequencing</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Weekly Course Plan & Syllabus Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sequentially map topics, student learning activities, contact hours, and learning outcomes across the {durationWeeks}-week semester.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenComments && (
            <button
              type="button"
              onClick={() =>
                onOpenComments(
                  'weekly-course-plan',
                  'General',
                  `Weekly Course Plan (${durationWeeks} Weeks)`
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
                  `Generate a coherent, paced 16-week instructional syllabus for "${course.title}". Ensure proper mid-term milestone, balanced contact vs self-study hours, and full CLO alignment.`
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Syllabus Advisor</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddSingleWeek}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Week</span>
          </button>
        </div>
      </div>

      {/* Live Accreditation Readiness Audit Card */}
      <div
        id="step06-obe-accreditation-card"
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
              <span>{stageEval.isCompleted ? 'Instructional Schedule Validated' : 'Syllabus Sequencing Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Step 06 • Accreditation Audit
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
            Total Workload: <strong>{totalCumulativeHours}h</strong> (Benchmark: {expectedTotalHours}h)
          </span>
          <span>•</span>
          <span className={missingCLOs.length === 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
            {clos.length - missingCLOs.length} / {clos.length} CLOs Scheduled
          </span>
        </div>
      </div>

      {/* Presets & Pacing Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-700">Quick Syllabus Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleAutoPopulateWeeks('standard')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            16-Week Standard (Midterm W8 + Final W16)
          </button>
          <button
            type="button"
            onClick={() => handleAutoPopulateWeeks('lab')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            16-Week Theory & Lab Alternating
          </button>
          <button
            type="button"
            onClick={() => handleAutoPopulateWeeks('intensive')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            12-Week Intensive Block
          </button>
          <button
            type="button"
            onClick={handleBalanceHours}
            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Balance Hours</span>
          </button>
        </div>
      </div>

      {/* Instructional Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Semester Duration
          </span>
          <span className="font-bold text-slate-900 text-sm">
            {weeklyPlan.length} Scheduled Weeks
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Cumulative Contact Hours
          </span>
          <span className="font-bold text-indigo-700 text-sm">
            {totalContactHours} Contact Hrs
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Independent Self-Study
          </span>
          <span className="font-bold text-slate-700 text-sm">
            {totalStudyHours} Study Hrs
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Outcome Schedule Coverage
          </span>
          <span
            className={`font-bold text-sm ${
              missingCLOs.length === 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {clos.length - missingCLOs.length} / {clos.length} CLOs Covered
          </span>
        </div>
      </div>

      {/* Coverage Alert Banner */}
      {missingCLOs.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Unscheduled Outcomes:</strong> Outcome(s){' '}
              <strong>{missingCLOs.map((c) => c.code).join(', ')}</strong> have not been assigned to any instructional week.
            </div>
          </div>
          <button
            type="button"
            onClick={handleDistributeMissingCLOs}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold rounded-lg text-xs shrink-0 cursor-pointer"
          >
            Auto-Distribute to Weeks
          </button>
        </div>
      )}

      {/* CLO Filter Bar */}
      {clos.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-500 shrink-0">Filter by CLO:</span>
          <button
            type="button"
            onClick={() => setFilterCLOId('')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              filterCLOId === ''
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Weeks ({weeklyPlan.length})
          </button>
          {clos.map((c) => {
            const count = weeklyPlan.filter((w) => (w.linkedCLOIds || []).includes(c.id)).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCLOId(filterCLOId === c.id ? '' : c.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 ${
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

      {/* Week-by-Week Table / List */}
      <div className="space-y-3">
        {filteredWeeks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">
              No Weekly Schedule Populated Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Click below to generate a complete {durationWeeks}-week syllabus breakdown pre-aligned with your Course Learning Outcomes.
            </p>
            <button
              type="button"
              onClick={() => handleAutoPopulateWeeks('standard')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Initialize {durationWeeks} Weeks</span>
            </button>
          </div>
        ) : (
          filteredWeeks.map((week) => {
            const isExam =
              week.weekNumber === 8 ||
              week.weekNumber === weeklyPlan.length ||
              week.topic.toLowerCase().includes('exam');

            return (
              <div
                key={week.weekNumber}
                className={`p-4 rounded-xl border shadow-2xs space-y-3 transition ${
                  isExam
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Row 1: Week badge, Topic, Hours, Milestone Tag, Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                    <span
                      className={`px-2.5 py-1 rounded-md font-bold text-xs font-mono shrink-0 ${
                        isExam ? 'bg-amber-700 text-white' : 'bg-slate-900 text-white'
                      }`}
                    >
                      Week {week.weekNumber}
                    </span>
                    <input
                      type="text"
                      value={week.topic}
                      onChange={(e) =>
                        handleUpdateWeek(week.weekNumber, { topic: e.target.value })
                      }
                      placeholder="Topic title..."
                      className="flex-1 font-bold text-slate-900 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Contact:</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={week.contactHours || 3}
                        onChange={(e) =>
                          handleUpdateWeek(week.weekNumber, {
                            contactHours: Number(e.target.value),
                          })
                        }
                        className="w-14 px-2 py-1 text-xs font-bold rounded-md border border-slate-200 text-center bg-white"
                      />
                      <span className="text-[10px] text-slate-400">hrs</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Self-Study:</span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={week.independentStudyHours || 6}
                        onChange={(e) =>
                          handleUpdateWeek(week.weekNumber, {
                            independentStudyHours: Number(e.target.value),
                          })
                        }
                        className="w-14 px-2 py-1 text-xs font-semibold rounded-md border border-slate-200 text-center bg-white"
                      />
                      <span className="text-[10px] text-slate-400">hrs</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteWeek(week.weekNumber)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer ml-1"
                      title="Delete Week"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Subtopics & Teaching/Learning Activity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Subtopics & Key Concepts
                    </label>
                    <input
                      type="text"
                      value={week.subtopics || ''}
                      onChange={(e) =>
                        handleUpdateWeek(week.weekNumber, { subtopics: e.target.value })
                      }
                      placeholder="e.g. Heuristic admissibility, pruning rules, state space..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Teaching & Learning Activity (TLA)
                    </label>
                    <input
                      type="text"
                      value={week.learningActivity || ''}
                      onChange={(e) =>
                        handleUpdateWeek(week.weekNumber, {
                          learningActivity: e.target.value,
                        })
                      }
                      placeholder="e.g. Laboratory Coding Workout or Interactive Lecture"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Row 3: Linked CLOs check-chips & Readings */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Linked CLOs:</span>
                    {clos.map((c) => {
                      const isLinked = (week.linkedCLOIds || []).includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            const currentIds = week.linkedCLOIds || [];
                            const nextIds = isLinked
                              ? currentIds.filter((id) => id !== c.id)
                              : [...currentIds, c.id];
                            handleUpdateWeek(week.weekNumber, { linkedCLOIds: nextIds });
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer border ${
                            isLinked
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`${c.code}: ${c.statement}`}
                        >
                          {c.code}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">Readings:</span>
                    <input
                      type="text"
                      value={week.requiredReading || ''}
                      onChange={(e) =>
                        handleUpdateWeek(week.weekNumber, {
                          requiredReading: e.target.value,
                        })
                      }
                      placeholder="Chapter / text citations, case reading..."
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 bg-white focus:bg-white"
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
          <span>Back to Outcome Mapping</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Teaching & Learning Activities</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
