import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Plus,
  Trash2,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Target,
  Award,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { Course } from '../../../types';
import { evaluateStage } from '../../../utils/stageProgress';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot?: (prompt: string) => void;
}

export const Step03CoursePurpose: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
}) => {
  const [newObjective, setNewObjective] = useState('');
  const [newCompetency, setNewCompetency] = useState('');

  // Live Accreditation Evaluation for Stage 03
  const stageEval = evaluateStage(course, 3, 'obe10');

  const handleChange = (field: keyof Course, value: any) => {
    const updated: Course = { ...course, [field]: value };
    // Synchronize with blueprint to guarantee parity across 10-step OBE and 15-step granular views
    if (field === 'description') {
      updated.blueprint = {
        ...(updated.blueprint || {
          purpose: '',
          learnerNeed: '',
          targetCompetencies: [],
          requiredSkills: [],
          assessmentStrategy: '',
        }),
        purpose: String(value),
      };
    } else if (field === 'courseRationale') {
      updated.blueprint = {
        ...(updated.blueprint || {
          purpose: '',
          learnerNeed: '',
          targetCompetencies: [],
          requiredSkills: [],
          assessmentStrategy: '',
        }),
        learnerNeed: String(value),
      };
    }
    onChange(updated);
  };

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    const current = course.courseObjectives || [];
    onChange({
      ...course,
      courseObjectives: [...current, newObjective.trim()],
    });
    setNewObjective('');
  };

  const handleRemoveObjective = (index: number) => {
    const current = course.courseObjectives || [];
    onChange({
      ...course,
      courseObjectives: current.filter((_, i) => i !== index),
    });
  };

  const handleAddCompetency = () => {
    if (!newCompetency.trim()) return;
    const currentCompetencies = course.blueprint?.targetCompetencies || [];
    if (!currentCompetencies.includes(newCompetency.trim())) {
      const updatedList = [...currentCompetencies, newCompetency.trim()];
      onChange({
        ...course,
        blueprint: {
          ...(course.blueprint || {
            purpose: course.description || '',
            learnerNeed: course.courseRationale || '',
            targetCompetencies: [],
            requiredSkills: [],
            assessmentStrategy: '',
          }),
          targetCompetencies: updatedList,
        },
      });
    }
    setNewCompetency('');
  };

  const handleRemoveCompetency = (comp: string) => {
    const currentCompetencies = course.blueprint?.targetCompetencies || [];
    onChange({
      ...course,
      blueprint: {
        ...(course.blueprint || {
          purpose: course.description || '',
          learnerNeed: course.courseRationale || '',
          targetCompetencies: [],
          requiredSkills: [],
          assessmentStrategy: '',
        }),
        targetCompetencies: currentCompetencies.filter((c) => c !== comp),
      },
    });
  };

  const handleApplyExemplar = (domain: 'engineering' | 'computing' | 'business' | 'general') => {
    let exemplarRationale = '';
    let exemplarAim = '';
    let exemplarObjectives: string[] = [];
    let exemplarCompetencies: string[] = [];

    if (domain === 'engineering') {
      exemplarRationale = `This course provides foundational and applied mastery in systems design, mathematical modeling, and rigorous engineering problem solving. It bridges fundamental physical principles with advanced professional specifications mandated by ABET / Washington Accord criteria.`;
      exemplarAim = `To cultivate rigorous engineering intuition, enabling students to formulate, model, analyze, and synthesize robust technical solutions under realistic operational, safety, and economic constraints.`;
      exemplarObjectives = [
        'Formulate mathematical representations of complex physical and technological systems.',
        'Apply modern analytical and computational tools to evaluate engineering designs.',
        'Synthesize alternative technical solutions while factoring in safety, regulatory, and environmental standards.',
        'Communicate engineering findings and technical justifications with professional precision.',
      ];
      exemplarCompetencies = ['Complex Problem Solving', 'Systems Modeling', 'Engineering Design', 'Professional Ethics'];
    } else if (domain === 'computing') {
      exemplarRationale = `As modern digital ecosystems grow in scale and complexity, computing graduates must demonstrate robust algorithmic thinking, software architectural acumen, and data security consciousness. This course equips students with both the theoretical foundations and implementation proficiencies required in high-assurance computing.`;
      exemplarAim = `To empower learners to design, implement, test, and optimize scalable, dependable software systems and algorithmic pipelines that solve real-world computational challenges.`;
      exemplarObjectives = [
        'Analyze computational efficiency and complexity of core algorithmic structures.',
        'Design modular, testable, and maintainable software architectures adhering to modern design patterns.',
        'Evaluate security, concurrency, and reliability constraints across computational environments.',
        'Collaborate systematically using industry-standard version control and peer code review practices.',
      ];
      exemplarCompetencies = ['Algorithmic Reasoning', 'Software Architecture', 'Data Structures & Optimization', 'Secure Coding'];
    } else if (domain === 'business') {
      exemplarRationale = `In a volatile and data-intensive global marketplace, organizational leaders require strategic acumen, evidence-based financial intuition, and ethical decision-making frameworks. This course prepares students to navigate strategic trade-offs and drive sustainable organizational value.`;
      exemplarAim = `To develop strategic, data-driven analytical competence for evaluating commercial opportunities, optimizing resource allocation, and leading ethical business transformation.`;
      exemplarObjectives = [
        'Evaluate market dynamics, competitive advantages, and macroeconomic indicators.',
        'Synthesize quantitative data to inform strategic financial and operational decisions.',
        'Formulate actionable business strategies that integrate corporate governance and sustainability.',
        'Present persuasive, evidence-based recommendations to executive stakeholders.',
      ];
      exemplarCompetencies = ['Strategic Decision Making', 'Quantitative Financial Analysis', 'Market Valuation', 'Executive Communication'];
    } else {
      exemplarRationale = `This course serves as a cornerstone academic experience, developing critical inquiry, evidence synthesis, and multi-perspective analytical reasoning across modern academic and professional landscapes.`;
      exemplarAim = `To foster critical, reflective, and methodological intellectual habits that empower learners to evaluate complex claims, conduct rigorous inquiry, and articulate clear positions.`;
      exemplarObjectives = [
        'Critically appraise scholarly literature and primary evidence sources.',
        'Synthesize diverse theoretical frameworks to interpret multidimensional problems.',
        'Construct well-supported arguments grounded in rigorous evidence and ethical consideration.',
        'Communicate complex insights effectively across diverse academic and professional contexts.',
      ];
      exemplarCompetencies = ['Critical Inquiry', 'Evidence Evaluation', 'Written Communication', 'Ethical Reasoning'];
    }

    const currentBlueprint = course.blueprint || {
      purpose: course.description || '',
      learnerNeed: course.courseRationale || '',
      targetCompetencies: [],
      requiredSkills: [],
      assessmentStrategy: '',
    };

    onChange({
      ...course,
      courseRationale: course.courseRationale || exemplarRationale,
      courseAim: course.courseAim || exemplarAim,
      courseObjectives: course.courseObjectives && course.courseObjectives.length > 0 ? course.courseObjectives : exemplarObjectives,
      description: course.description || exemplarRationale,
      blueprint: {
        ...currentBlueprint,
        purpose: currentBlueprint.purpose || exemplarRationale,
        learnerNeed: currentBlueprint.learnerNeed || exemplarRationale,
        targetCompetencies: Array.from(new Set([...currentBlueprint.targetCompetencies, ...exemplarCompetencies])),
      },
    });
  };

  const handleSuggestWithAI = (field: 'rationale' | 'aim' | 'objectives' | 'competencies') => {
    if (!onAskCopilot) return;
    if (field === 'rationale') {
      onAskCopilot(
        `Draft a compelling accreditation-grade Course Rationale for "${course.title}" (${course.code}) in ${course.programme || 'the degree programme'}. Explain its industry significance, societal impact, and role in the curriculum.`
      );
    } else if (field === 'aim') {
      onAskCopilot(
        `Draft a concise, overarching Course Aim statement for "${course.title}" (${course.code}). Ensure it expresses the broad educational mission without confusing it with student-centric learning outcomes.`
      );
    } else if (field === 'competencies') {
      onAskCopilot(
        `Suggest 4 core graduate competencies and target capabilities for "${course.title}" (${course.code}) aligned with international accreditation standards (e.g., ABET, Washington Accord, AACSB).`
      );
    } else {
      onAskCopilot(
        `Suggest 4 clear pedagogical Course Objectives for "${course.title}" (${course.code}). Use clear instructor-directed intent statements.`
      );
    }
  };

  const targetCompetencies = course.blueprint?.targetCompetencies || [];

  return (
    <div className="space-y-6 max-w-4xl" id="step-03-course-purpose-container">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <span>Step 03 of 10</span>
          <span>•</span>
          <span>Pedagogical Purpose & Rationale</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">
              Course Purpose & Curricular Rationale
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Establish why this course exists in the academic curriculum, its broad educational aim, foundational objectives, and graduate competency targets.
            </p>
          </div>
          {onAskCopilot && (
            <button
              type="button"
              id="step03-suggest-all-ai-btn"
              onClick={() => handleSuggestWithAI('rationale')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Suggest Purpose</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Accreditation Readiness Card */}
      <div
        id="step03-accreditation-card"
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
              <span>{stageEval.isCompleted ? 'Stage 03 Validated & Audit-Ready' : 'Stage 03 Purpose Pending'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                OBE 10 • Accreditation Check
              </span>
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {stageEval.isCompleted
                ? stageEval.summary
                : `Action required: ${stageEval.missingRequirements.join(', ')}`}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Exemplar Autofill Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-slate-600 shrink-0" />
          <span className="font-semibold text-slate-800">Quick-Fill Accreditation Exemplar:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyExemplar('engineering')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            ABET Engineering
          </button>
          <button
            type="button"
            onClick={() => handleApplyExemplar('computing')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            Computing / CS
          </button>
          <button
            type="button"
            onClick={() => handleApplyExemplar('business')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            AACSB Business
          </button>
          <button
            type="button"
            onClick={() => handleApplyExemplar('general')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            General Higher Ed
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* 1. Course Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700" htmlFor="course-description-textarea">
              Course Description (Academic Catalog Overview) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Published in syllabus & student handbook • Synced with Blueprint
            </span>
          </div>
          <textarea
            id="course-description-textarea"
            rows={4}
            value={course.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Provide a comprehensive academic summary of the course content, theoretical breadth, practical scope, and modern relevance..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
          />
        </div>

        {/* 2. Course Rationale */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5" htmlFor="course-rationale-textarea">
              <span>Course Rationale & Curricular Justification</span>
              <span className="text-[10px] font-normal text-slate-400">
                (Why is this course placed in this program?)
              </span>
            </label>
            {onAskCopilot && (
              <button
                type="button"
                id="step03-suggest-rationale-btn"
                onClick={() => handleSuggestWithAI('rationale')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Suggest Rationale</span>
              </button>
            )}
          </div>
          <textarea
            id="course-rationale-textarea"
            rows={3}
            value={course.courseRationale || ''}
            onChange={(e) => handleChange('courseRationale', e.target.value)}
            placeholder="Articulate the curricular need for this course: how it connects prerequisite knowledge with capstone professional expectations..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
          />
        </div>

        {/* 3. Course Aim */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5" htmlFor="course-aim-input">
              <span>Course Aim (Broad Educational Mission)</span>
            </label>
            {onAskCopilot && (
              <button
                type="button"
                id="step03-suggest-aim-btn"
                onClick={() => handleSuggestWithAI('aim')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Suggest Aim</span>
              </button>
            )}
          </div>
          <input
            id="course-aim-input"
            type="text"
            value={course.courseAim || ''}
            onChange={(e) => handleChange('courseAim', e.target.value)}
            placeholder="e.g. To empower students with algorithmic intuition, systems design skills, and ethical accountability..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 mt-2 text-[11px] text-blue-900 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              <strong>Pedagogical Distinction:</strong> The <em>Aim</em> is instructor-centric (what the course sets out to cultivate), while <em>Learning Outcomes (CLOs)</em> in Step 4 are student-centric (what learners will demonstrably do).
            </span>
          </div>
        </div>

        {/* 4. Target Competencies & Graduate Attributes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Graduate Competencies & Capabilities</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({targetCompetencies.length} registered • Synced with Blueprint)
              </span>
            </label>
            {onAskCopilot && (
              <button
                type="button"
                id="step03-suggest-competencies-btn"
                onClick={() => handleSuggestWithAI('competencies')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Suggest Competencies</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {targetCompetencies.map((comp) => (
              <span
                key={comp}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-medium"
              >
                <span>{comp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompetency(comp)}
                  className="text-indigo-400 hover:text-indigo-700 p-0.5 transition cursor-pointer"
                  title="Remove competency"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {targetCompetencies.length === 0 && (
              <p className="text-xs text-slate-400 italic py-1">
                No competencies specified yet. Add high-level professional skills like "Complex Systems Modeling", "Algorithmic Reasoning", etc.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              id="new-competency-input"
              value={newCompetency}
              onChange={(e) => setNewCompetency(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCompetency()}
              placeholder="Add a target competency (e.g. Quantitative Risk Analysis)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              type="button"
              id="add-competency-btn"
              onClick={handleAddCompetency}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Competency</span>
            </button>
          </div>
        </div>

        {/* 5. General Course Objectives */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              General Course Objectives ({course.courseObjectives?.length || 0})
            </label>
            {onAskCopilot && (
              <button
                type="button"
                id="step03-suggest-objectives-btn"
                onClick={() => handleSuggestWithAI('objectives')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Suggest Objectives</span>
              </button>
            )}
          </div>

          <div className="space-y-2 mb-2">
            {(course.courseObjectives || []).map((obj, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <span className="font-medium">
                  {idx + 1}. {obj}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                  title="Remove objective"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              id="new-objective-input"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddObjective()}
              placeholder="Type an objective and click Add (e.g. Introduce constraint satisfaction representations)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              type="button"
              id="add-objective-btn"
              onClick={handleAddObjective}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* 6. Prerequisite Knowledge & Expected Student Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="prerequisite-knowledge-textarea">
              Prerequisite Knowledge & Prior Competencies
            </label>
            <textarea
              id="prerequisite-knowledge-textarea"
              rows={3}
              value={course.prerequisiteKnowledge || ''}
              onChange={(e) => handleChange('prerequisiteKnowledge', e.target.value)}
              placeholder="e.g. Basic discrete probability, algorithmic recursion, familiarity with high-level programming in Python..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="expected-student-profile-textarea">
              Expected Student Profile & Readiness
            </label>
            <textarea
              id="expected-student-profile-textarea"
              rows={3}
              value={course.expectedStudentProfile || ''}
              onChange={(e) => handleChange('expectedStudentProfile', e.target.value)}
              placeholder="e.g. Third-year computing majors with intermediate software engineering experience..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          id="step03-back-btn"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Information</span>
        </button>

        <button
          type="button"
          id="step03-next-btn"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Course Learning Outcomes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
