import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Target,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { Course, Activity, ActivityType } from '../../../types';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
  'Discussion',
  'Reflection',
  'Case Study',
  'Problem Solving',
  'Simulation',
  'Presentation',
  'Project',
  'Research Task',
  'Collaborative Task',
  'Interactive Video',
  'Quiz',
  'Matching',
  'Drag and Drop',
  'Scenario',
  'Practical Demonstration',
];

export const Step08ActivityDesigner: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(course.activities[0]?.id || '');

  const selectedActivity = course.activities.find((a) => a.id === selectedActivityId) || course.activities[0];

  const handleUpdateActivity = (id: string, updates: Partial<Activity>) => {
    const updated = course.activities.map((a) => (a.id === id ? { ...a, ...updates } : a));
    onChange({ ...course, activities: updated });
  };

  const handleAddActivity = () => {
    const nextNum = course.activities.length + 1;
    const mod = course.modules[0];
    const lesson = course.lessons[0];
    const mlo = course.mlos[0];

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      moduleId: mod?.id || 'mod-1',
      lessonId: lesson?.id,
      outcomeType: 'MLO',
      outcomeId: mlo?.id || '',
      title: `Learning Activity ${nextNum}: Authentic Scenario Workout`,
      activityType: 'Problem Solving',
      studentActionPrompt: 'Students apply statutory doctrines to analyze an authentic scenario and defend their solution.',
      evidenceProduced: 'Submitted problem-solving brief and peer review critique.',
      estimatedMins: 45,
    };

    const updated = [...course.activities, newActivity];
    onChange({ ...course, activities: updated });
    setSelectedActivityId(newActivity.id);
  };

  const handleDeleteActivity = (id: string) => {
    const filtered = course.activities.filter((a) => a.id !== id);
    onChange({ ...course, activities: filtered });
    if (selectedActivityId === id) {
      setSelectedActivityId(filtered[0]?.id || '');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 08</span>
          <span>•</span>
          <span>Active Learning</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Activity Designer</h2>
            <p className="text-xs text-slate-500 mt-1">
              Design engaging learning tasks across 15 pedagogical formats. Every activity must answer: What outcome does it support? What does the student do? What evidence is produced?
            </p>
          </div>
          <button
            onClick={handleAddActivity}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activity Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {course.activities.map((act) => (
          <button
            key={act.id}
            onClick={() => setSelectedActivityId(act.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border ${
              (selectedActivity?.id || '') === act.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              {act.activityType}
            </span>
            <span className="max-w-[140px] truncate">{act.title}</span>
          </button>
        ))}
      </div>

      {/* Selected Activity Form */}
      {selectedActivity && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-800">Activity Details</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{selectedActivity.activityType}</span>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteActivity(selectedActivity.id)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Delete Activity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Activity Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={selectedActivity.title}
              onChange={(e) => handleUpdateActivity(selectedActivity.id, { title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Activity Type (15 Formats)</label>
              <select
                value={selectedActivity.activityType}
                onChange={(e) => handleUpdateActivity(selectedActivity.id, { activityType: e.target.value as ActivityType })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Module</label>
              <select
                value={selectedActivity.moduleId}
                onChange={(e) => handleUpdateActivity(selectedActivity.id, { moduleId: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Time (Mins)</label>
              <input
                type="number"
                min={10}
                max={300}
                value={selectedActivity.estimatedMins || 45}
                onChange={(e) => handleUpdateActivity(selectedActivity.id, { estimatedMins: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* The 3 Core Outcome-Based Questions */}
          <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100 rounded-2xl space-y-4">
            <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider block">
              The 3 Non-Negotiable Questions of Active Learning
            </span>

            {/* Question 1: What outcome does this support? */}
            <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>1. What outcome does this activity support?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <select
                    value={selectedActivity.outcomeType}
                    onChange={(e) => handleUpdateActivity(selectedActivity.id, { outcomeType: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
                  >
                    <option value="MLO">Module Learning Outcome (MLO)</option>
                    <option value="CLO">Course Learning Outcome (CLO)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={selectedActivity.outcomeId}
                    onChange={(e) => handleUpdateActivity(selectedActivity.id, { outcomeId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {selectedActivity.outcomeType === 'CLO'
                      ? course.clos.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code}: {c.statement.slice(0, 60)}...
                          </option>
                        ))
                      : course.mlos.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.code}: {m.statement.slice(0, 60)}...
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Question 2: What will the student do? */}
            <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>2. What will the student do? (Action Prompt)</span>
              </div>
              <textarea
                rows={3}
                value={selectedActivity.studentActionPrompt}
                onChange={(e) => handleUpdateActivity(selectedActivity.id, { studentActionPrompt: e.target.value })}
                placeholder="Give the precise instructions given to the learner: e.g. Analyze assigned constitutional holding extracts in pairs and draft a 3-point rebuttal..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Question 3: What evidence will be produced? */}
            <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>3. What evidence will be produced? (Demonstrable Artifact)</span>
              </div>
              <textarea
                rows={2}
                value={selectedActivity.evidenceProduced}
                onChange={(e) => handleUpdateActivity(selectedActivity.id, { evidenceProduced: e.target.value })}
                placeholder="Specify the tangible proof of learning: e.g. Submitted 400-word doctrinal brief with citation accuracy verified against rubrics..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
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
          <span>Back to Lesson Creator</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to Assessment Designer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
