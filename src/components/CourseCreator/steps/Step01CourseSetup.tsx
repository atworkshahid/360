import React, { useState } from 'react';
import { Sparkles, HelpCircle, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Course, DeliveryMode, CourseLevel } from '../../../types';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step01CourseSetup: React.FC<StepProps> = ({ course, onChange, onNext, onAskCopilot }) => {
  const [isRecommending, setIsRecommending] = useState(false);

  const handleChange = (field: keyof Course, value: any) => {
    const updated = { ...course, [field]: value };
    if (field === 'title' && (!course.slug || course.slug === '')) {
      updated.slug = String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    onChange(updated);
  };

  const handleRecommendInitialCLOs = () => {
    setIsRecommending(true);
    const prompt = `Recommend 4 initial measurable Course Learning Outcomes (CLOs) for course: "${course.title}". Capstone goal: "${course.capstoneGoal}". Description: "${course.description}"`;
    onAskCopilot(prompt);
    setTimeout(() => setIsRecommending(false), 800);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Stage Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 01</span>
          <span>•</span>
          <span>Foundation</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif">Course Setup</h2>
        <p className="text-xs text-slate-500 mt-1">
          Establish the foundational administrative and academic parameters of your outcome-based course.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Core Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Course Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Constitutional Law & Federal Governance"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Course Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={course.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="e.g. LAW-401 or CS-201"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Slug</label>
            <input
              type="text"
              value={course.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="e.g. constitutional-law-federal-governance"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Category</label>
            <input
              type="text"
              value={course.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g. Law, Computer Science, Engineering"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Programme</label>
            <input
              type="text"
              value={course.programme}
              onChange={(e) => handleChange('programme', e.target.value)}
              placeholder="e.g. Bachelor of Laws (LL.B Honors)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Academic Structure & Delivery */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Credit Hours</label>
            <input
              type="number"
              min={1}
              max={12}
              value={course.creditHours}
              onChange={(e) => handleChange('creditHours', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Weeks)</label>
            <input
              type="number"
              min={1}
              max={52}
              value={course.durationWeeks}
              onChange={(e) => handleChange('durationWeeks', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Modules / Weeks Count</label>
            <input
              type="number"
              min={1}
              max={30}
              value={course.modulesCount}
              onChange={(e) => handleChange('modulesCount', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expected Study Time (Hrs)</label>
            <input
              type="number"
              min={10}
              max={500}
              value={course.expectedStudyTimeHours}
              onChange={(e) => handleChange('expectedStudyTimeHours', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
            <select
              value={course.deliveryMode}
              onChange={(e) => handleChange('deliveryMode', e.target.value as DeliveryMode)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Face-to-Face">Face-to-Face</option>
              <option value="Online">Online</option>
              <option value="Blended">Blended</option>
              <option value="Self-Paced">Self-Paced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Level</label>
            <select
              value={course.courseLevel}
              onChange={(e) => handleChange('courseLevel', e.target.value as CourseLevel)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="School">School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="Professional">Professional</option>
              <option value="Training">Training</option>
              <option value="Certification">Certification</option>
            </select>
          </div>
        </div>

        {/* Learners & Prerequisites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Learners</label>
            <input
              type="text"
              value={course.targetLearners}
              onChange={(e) => handleChange('targetLearners', e.target.value)}
              placeholder="e.g. Senior undergraduate law students and judicial clerk aspirants"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Prerequisites</label>
            <input
              type="text"
              value={course.prerequisites}
              onChange={(e) => handleChange('prerequisites', e.target.value)}
              placeholder="e.g. Jurisprudence I (LAW-201)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Descriptions & Promises */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Description</label>
            <textarea
              rows={3}
              value={course.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide a concise academic overview of the course scope..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Overview & Scope</label>
            <textarea
              rows={3}
              value={course.overview}
              onChange={(e) => handleChange('overview', e.target.value)}
              placeholder="Detail how the curriculum unfolds across modules..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Learning Promise</label>
            <input
              type="text"
              value={course.learningPromise}
              onChange={(e) => handleChange('learningPromise', e.target.value)}
              placeholder="e.g. Upon successful completion, learners will be capable of drafting appellate petitions..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* The Key Pedagogical Question for AI CLO recommendations */}
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-blue-900">
                What should the learner be capable of doing after completing this course?
              </label>
            </div>
            <button
              type="button"
              onClick={handleRecommendInitialCLOs}
              disabled={!course.capstoneGoal && !course.title}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRecommending ? 'Analyzing...' : 'AI Recommend Initial CLOs'}</span>
            </button>
          </div>
          <p className="text-[11px] text-blue-800">
            This central question anchors your course design. Your response allows OBE360 to recommend high-rigor, constructively aligned CLOs in the next stages.
          </p>
          <textarea
            rows={2}
            value={course.capstoneGoal}
            onChange={(e) => handleChange('capstoneGoal', e.target.value)}
            placeholder="e.g. Analyze Pakistan's constitutional development and evaluate its impact on federal governance, centre-province power distribution, and judicial review."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to Course Blueprint</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
