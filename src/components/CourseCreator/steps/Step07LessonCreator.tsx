import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckSquare,
  FileText,
  CheckCircle2,
  MessageSquare,
  Laptop,
  Users,
  Video,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Course, Lesson } from '../../../types';
import { generateLessonDesign } from '../../../services/api';
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

type DeliveryModality =
  | 'Synchronous Interactive Seminar'
  | 'Synchronous Lab / Studio Workshop'
  | 'Asynchronous Digital Prep & Reading'
  | 'Flipped Classroom Applied Studio';

export const Step07LessonCreator: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(course.lessons[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Live Accreditation Evaluation for Stage 07 (Granular15)
  const stageEval = evaluateStage(course, 7, 'granular15');

  const selectedLesson = course.lessons.find((l) => l.id === selectedLessonId) || course.lessons[0];

  // Workload metrics
  const totalLessonMins = course.lessons.reduce((acc, l) => acc + (l.durationMins || 60), 0);
  const totalLessonHours = Math.round((totalLessonMins / 60) * 10) / 10;

  // Track MLO coverage by lessons
  const coveredMLOIds = new Set(course.lessons.map((l) => l.linkedMLOId));
  const uncoveredMLOs = course.mlos.filter((m) => !coveredMLOIds.has(m.id));

  const handleUpdateLesson = (id: string, updates: Partial<Lesson>) => {
    const updated = course.lessons.map((l) => (l.id === id ? { ...l, ...updates } : l));
    onChange({ ...course, lessons: updated });
  };

  const handleAddLesson = () => {
    const nextNum = course.lessons.length + 1;
    const mod = course.modules[0];
    const mlo =
      uncoveredMLOs[0] ||
      course.mlos.find((m) => m.moduleId === mod?.id) ||
      course.mlos[0];

    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      moduleId: mod?.id || 'mod-1',
      linkedMLOId: mlo?.id || '',
      title: `Lesson ${nextNum}: Applied Analysis & Verification`,
      learningObjective: 'Analyze key mechanisms and formulate actionable applications.',
      durationMins: 90,
      teachingMode: 'Synchronous Interactive Seminar',
      content: {
        text: 'Detailed conceptual background, theoretical models, and statutory/analytical frameworks.',
        externalResources: [],
      },
      requiredActivity: 'Students analyze case materials or code exercises and draft an evaluative synthesis memo.',
      evidenceOfLearning: 'Submitted 400-word brief or verified solution benchmark evaluated on rubric.',
      completionRequirements: ['read_content', 'complete_activity', 'pass_quiz'],
    };

    const updated = [...course.lessons, newLesson];
    onChange({ ...course, lessons: updated });
    setSelectedLessonId(newLesson.id);
  };

  const handleDeleteLesson = (id: string) => {
    const filtered = course.lessons.filter((l) => l.id !== id);
    onChange({ ...course, lessons: filtered });
    if (selectedLessonId === id) {
      setSelectedLessonId(filtered[0]?.id || '');
    }
  };

  const toggleRequirement = (req: string) => {
    if (!selectedLesson) return;
    const current = selectedLesson.completionRequirements || [];
    const updated = current.includes(req) ? current.filter((r) => r !== req) : [...current, req];
    handleUpdateLesson(selectedLesson.id, { completionRequirements: updated });
  };

  const handleAiGenerateLesson = async () => {
    if (!selectedLesson) return;
    const mlo = course.mlos.find((m) => m.id === selectedLesson.linkedMLOId) || course.mlos[0];
    const mod = course.modules.find((m) => m.id === selectedLesson.moduleId) || course.modules[0];

    setIsGenerating(true);
    const generated = await generateLessonDesign(
      mlo?.code || 'MLO 1.1',
      mlo?.statement || selectedLesson.title,
      mod?.title || course.title
    );
    setIsGenerating(false);

    handleUpdateLesson(selectedLesson.id, {
      title: generated.title || selectedLesson.title,
      learningObjective: generated.learningGoal || selectedLesson.learningObjective,
      teachingMode: generated.teachingMode || selectedLesson.teachingMode,
      durationMins: generated.durationMins || selectedLesson.durationMins,
      content: {
        ...selectedLesson.content,
        text: generated.learningActivity || selectedLesson.content.text,
        reading: generated.recommendedResources,
      },
      requiredActivity: generated.learningActivity,
      evidenceOfLearning: generated.evidenceOfLearning,
      completionRequirements: generated.completionRequirement || selectedLesson.completionRequirements,
    });
  };

  // Scaffold lessons for all uncovered MLOs
  const handleScaffoldMissingMLOs = () => {
    if (uncoveredMLOs.length === 0) return;
    const newLessons: Lesson[] = uncoveredMLOs.map((mlo, idx) => {
      const parentMod = course.modules.find((m) => m.id === mlo.moduleId) || course.modules[0];
      return {
        id: `les-${Date.now()}-${idx}`,
        moduleId: parentMod?.id || 'mod-1',
        linkedMLOId: mlo.id,
        title: `${mlo.code}: Applied Learning Studio`,
        learningObjective: mlo.statement,
        durationMins: 90,
        teachingMode: 'Synchronous Interactive Seminar',
        content: {
          text: `Structured instructional session targeting ${mlo.code} under ${parentMod?.title || 'Course'}.`,
          reading: 'Prescribed reading materials and case studies',
        },
        requiredActivity: mlo.requiredActivity || 'Guided conceptual analysis and practical problem workout',
        evidenceOfLearning: mlo.evidence || 'Evaluated submission meeting benchmark rubrics',
        completionRequirements: ['read_content', 'complete_activity', 'pass_quiz'],
      };
    });

    const combined = [...course.lessons, ...newLessons];
    onChange({ ...course, lessons: combined });
    if (newLessons.length > 0) {
      setSelectedLessonId(newLessons[0].id);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 07</span>
          <span>•</span>
          <span>Instructional Delivery & Pacing</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Lesson Creator</h2>
            <p className="text-xs text-slate-500 mt-1">
              Design actionable lessons aligned to specific MLOs. In OBE, content delivery exists solely to empower student demonstration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenComments && selectedLesson && (
              <button
                type="button"
                onClick={() =>
                  onOpenComments(
                    selectedLesson.id,
                    'General',
                    `Lesson: ${selectedLesson.title}`
                  )
                }
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Review Feedback</span>
              </button>
            )}

            <button
              onClick={handleAiGenerateLesson}
              disabled={isGenerating || !selectedLesson}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{isGenerating ? 'Designing...' : 'AI Lesson Designer'}</span>
            </button>

            <button
              onClick={handleAddLesson}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lesson</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Accreditation Readiness Audit Card */}
      <div
        id="step07-granular-accreditation-card"
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
              <span>{stageEval.isCompleted ? 'Instructional Delivery Validated' : 'Lesson Architecture Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Stage 07 • Curricular Audit
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
            Total Lessons: <strong>{course.lessons.length}</strong> ({totalLessonHours} hrs)
          </span>
          <span>•</span>
          <span className={uncoveredMLOs.length === 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
            {course.mlos.length - uncoveredMLOs.length} / {course.mlos.length} MLOs Addressed
          </span>
        </div>
      </div>

      {/* Uncovered MLO Banner */}
      {uncoveredMLOs.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Uncovered Granular Outcomes:</strong> {uncoveredMLOs.length} MLO(s) (
              {uncoveredMLOs.map((m) => m.code).join(', ')}) do not yet have a dedicated instructional lesson.
            </div>
          </div>
          <button
            type="button"
            onClick={handleScaffoldMissingMLOs}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs shrink-0 cursor-pointer"
          >
            Scaffold Lessons for Missing MLOs
          </button>
        </div>
      )}

      {/* Pedagogical Principle Banner */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-indigo-900">
        <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          <strong>Outcome-Based Principle:</strong> In OBE, passive content consumption (reading or watching) does not constitute outcome attainment. Every lesson must culminate in an authentic student task that yields demonstrable evidence.
        </p>
      </div>

      {/* Lesson Selector Pills */}
      {course.lessons.length > 0 ? (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {course.lessons.map((les) => {
            const mlo = course.mlos.find((m) => m.id === les.linkedMLOId);
            return (
              <button
                key={les.id}
                onClick={() => setSelectedLessonId(les.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border cursor-pointer ${
                  (selectedLesson?.id || '') === les.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span className="max-w-[150px] truncate">{les.title}</span>
                {mlo && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                    {mlo.code}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs text-slate-600">
          <p>No lessons created yet.</p>
          <button
            type="button"
            onClick={handleAddLesson}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Lesson</span>
          </button>
        </div>
      )}

      {/* Selected Lesson Editor */}
      {selectedLesson && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-800">Lesson Configuration</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-blue-600 font-semibold">
                Linked MLO: {course.mlos.find((m) => m.id === selectedLesson.linkedMLOId)?.code || 'Unlinked'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteLesson(selectedLesson.id)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              title="Delete Lesson"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lesson Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={selectedLesson.title}
              onChange={(e) => handleUpdateLesson(selectedLesson.id, { title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Module & MLO Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Module</label>
              <select
                value={selectedLesson.moduleId}
                onChange={(e) => handleUpdateLesson(selectedLesson.id, { moduleId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {course.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module {m.number}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Linked MLO <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedLesson.linkedMLOId}
                onChange={(e) => handleUpdateLesson(selectedLesson.id, { linkedMLOId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {course.mlos.map((mlo) => (
                  <option key={mlo.id} value={mlo.id}>
                    {mlo.code} ({mlo.bloomLevel}) — {mlo.statement.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Objective, Duration, Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Learning Objective</label>
              <input
                type="text"
                value={selectedLesson.learningObjective}
                onChange={(e) => handleUpdateLesson(selectedLesson.id, { learningObjective: e.target.value })}
                placeholder="Observable goal of this session..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
              <input
                type="number"
                min={15}
                max={240}
                value={selectedLesson.durationMins}
                onChange={(e) => handleUpdateLesson(selectedLesson.id, { durationMins: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Teaching Mode & Delivery Modality */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teaching & Delivery Modality
            </label>
            <select
              value={selectedLesson.teachingMode}
              onChange={(e) => handleUpdateLesson(selectedLesson.id, { teachingMode: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Synchronous Interactive Seminar">Synchronous Interactive Seminar (Socratic & Polling)</option>
              <option value="Synchronous Lab / Studio Workshop">Synchronous Lab / Studio Workshop (Hands-on Practice)</option>
              <option value="Asynchronous Digital Prep & Reading">Asynchronous Digital Prep & Case Reading (Self-Paced)</option>
              <option value="Flipped Classroom Applied Studio">Flipped Classroom Applied Studio (Problem-Based)</option>
              <option value="Peer Review & Collaborative Moot Bench">Peer Review & Collaborative Moot Bench</option>
            </select>
          </div>

          {/* Content & Reading */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instructional Content & Case Narrative
              </label>
              <textarea
                rows={3}
                value={selectedLesson.content?.text || ''}
                onChange={(e) =>
                  handleUpdateLesson(selectedLesson.id, {
                    content: { ...selectedLesson.content, text: e.target.value },
                  })
                }
                placeholder="Provide the core academic exposition, theoretical models, or scenario brief..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Prescribed Readings / Citations
                </label>
                <input
                  type="text"
                  value={selectedLesson.content?.reading || ''}
                  onChange={(e) =>
                    handleUpdateLesson(selectedLesson.id, {
                      content: { ...selectedLesson.content, reading: e.target.value },
                    })
                  }
                  placeholder="e.g. Chapter 4 & Relevant Case Briefs"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Worked Example or Case Study
                </label>
                <input
                  type="text"
                  value={selectedLesson.content?.caseStudy || ''}
                  onChange={(e) =>
                    handleUpdateLesson(selectedLesson.id, {
                      content: { ...selectedLesson.content, caseStudy: e.target.value },
                    })
                  }
                  placeholder="e.g. Industry Case Benchmark / Protocol Analysis"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Active Task & Evidence */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-blue-900 block">Performance Demonstration & Evidence</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-blue-800 mb-1">
                  Required Student Activity (Action) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={selectedLesson.requiredActivity}
                  onChange={(e) => handleUpdateLesson(selectedLesson.id, { requiredActivity: e.target.value })}
                  placeholder="What must the student actively DO with this content?"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-blue-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-blue-800 mb-1">
                  Evidence of Learning (Demonstration) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={selectedLesson.evidenceOfLearning}
                  onChange={(e) => handleUpdateLesson(selectedLesson.id, { evidenceOfLearning: e.target.value })}
                  placeholder="What tangible artifact or proof demonstrates outcome mastery?"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-blue-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Completion Requirements */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">Lesson Completion Requirements</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'read_content', label: 'Review core instructional material' },
                { id: 'complete_activity', label: 'Submit required active exercise' },
                { id: 'pass_quiz', label: 'Attain passing grade on formative quiz' },
                { id: 'submit_assignment', label: 'Upload assessed problem brief' },
                { id: 'demonstrate_skill', label: 'Demonstrate competency in practical bench' },
              ].map((req) => {
                const isChecked = (selectedLesson.completionRequirements || []).includes(req.id);
                return (
                  <label
                    key={req.id}
                    className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRequirement(req.id)}
                      className="hidden"
                    />
                    <span>{req.label}</span>
                  </label>
                );
              })}
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
          <span>Back to MLO Creator</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
        >
          <span>Save & Proceed to Activity Designer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
