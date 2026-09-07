import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Plus, X, ShieldCheck } from 'lucide-react';
import { Course, CourseBlueprint } from '../../../types';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step02CourseBlueprint: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [newCompetency, setNewCompetency] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const blueprint = course.blueprint || {
    purpose: '',
    learnerNeed: '',
    targetCompetencies: [],
    requiredSkills: [],
    assessmentStrategy: '',
  };

  const handleUpdate = (field: keyof CourseBlueprint, value: any) => {
    onChange({
      ...course,
      blueprint: {
        ...blueprint,
        [field]: value,
      },
    });
  };

  const addCompetency = () => {
    if (!newCompetency.trim()) return;
    handleUpdate('targetCompetencies', [...blueprint.targetCompetencies, newCompetency.trim()]);
    setNewCompetency('');
  };

  const removeCompetency = (index: number) => {
    handleUpdate('targetCompetencies', blueprint.targetCompetencies.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    handleUpdate('requiredSkills', [...blueprint.requiredSkills, newSkill.trim()]);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    handleUpdate('requiredSkills', blueprint.requiredSkills.filter((_, i) => i !== index));
  };

  const handleAiSuggestBlueprint = () => {
    onAskCopilot(
      `Based on course "${course.title}" and purpose "${blueprint.purpose || course.description}", suggest 4 targeted competencies and 4 demonstrable skills contributing to them.`
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 02</span>
          <span>•</span>
          <span>Academic Architecture</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Course Blueprint</h2>
            <p className="text-xs text-slate-500 mt-1">
              Before writing individual lessons, establish the academic architecture and capability gaps this course addresses.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAiSuggestBlueprint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggest Blueprint</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Purpose */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Course Purpose <span className="text-slate-400 font-normal">(Why does this course exist?)</span>
          </label>
          <textarea
            rows={3}
            value={blueprint.purpose}
            onChange={(e) => handleUpdate('purpose', e.target.value)}
            placeholder="e.g. To cultivate critical jurists capable of defending constitutional supremacy, navigating complex federal power allocations, and upholding democratic rule of law."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Learner Need */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Learner Need <span className="text-slate-400 font-normal">(What problem or capability gap does it address?)</span>
          </label>
          <textarea
            rows={3}
            value={blueprint.learnerNeed}
            onChange={(e) => handleUpdate('learnerNeed', e.target.value)}
            placeholder="e.g. Bridging the gap between theoretical knowledge of statutory articles and practical litigation/adjudication skills in constitutional writ jurisdictions."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Target Competencies */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target Competencies <span className="text-slate-400 font-normal">(What broader abilities should the learner develop?)</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Broad macro capabilities defining graduate performance.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {blueprint.targetCompetencies.map((comp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium"
              >
                <span>{comp}</span>
                <button
                  type="button"
                  onClick={() => removeCompetency(idx)}
                  className="text-blue-400 hover:text-blue-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCompetency}
              onChange={(e) => setNewCompetency(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetency())}
              placeholder="e.g. Federal Jurisdictional Dispute Resolution"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              type="button"
              onClick={addCompetency}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
            >
              Add Competency
            </button>
          </div>
        </div>

        {/* Required Skills */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Required Skills <span className="text-slate-400 font-normal">(What demonstrable skills contribute to those competencies?)</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Specific micro-skills observable in authentic tasks.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {blueprint.requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  className="text-indigo-400 hover:text-indigo-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g. Appellate constitutional petition drafting"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Assessment Strategy */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Assessment Strategy <span className="text-slate-400 font-normal">(How will achievement ultimately be demonstrated?)</span>
          </label>
          <textarea
            rows={3}
            value={blueprint.assessmentStrategy}
            onChange={(e) => handleUpdate('assessmentStrategy', e.target.value)}
            placeholder="e.g. Constructively aligned direct performance assessments comprising diagnostic knowledge checks, authentic scenario problem briefs, simulated constitutional bench moot court, and comprehensive multi-issue final examination."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Setup</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to CLO Creator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
