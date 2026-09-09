import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Layers,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Course, CourseType, DeliveryMode, CourseLevel } from '../../../types';
import { evaluateStage } from '../../../utils/stageProgress';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot?: (prompt: string) => void;
}

const COURSE_TYPES: CourseType[] = [
  'Core',
  'Elective',
  'General Education',
  'Major',
  'Supporting',
  'Lab',
  'Capstone',
  'Other',
];

const DELIVERY_MODES: { label: string; value: DeliveryMode }[] = [
  { label: 'Face-to-Face (On-Campus)', value: 'Face-to-Face' },
  { label: 'Online (Asynchronous/Synchronous)', value: 'Online' },
  { label: 'Hybrid / Blended', value: 'Blended' },
  { label: 'Self-Paced Learning', value: 'Self-Paced' },
];

export const Step02CourseInformation: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
}) => {
  const stageEval = evaluateStage(course, 2, 'obe10');

  const handleChange = (field: keyof Course, value: any) => {
    const updated = { ...course, [field]: value };
    if (field === 'title' && (!course.slug || course.slug === '')) {
      updated.slug = String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    // Synchronize degreeLevel and courseLevel seamlessly
    if (field === 'degreeLevel') {
      const val = String(value);
      const mappedLevel: CourseLevel =
        val === 'Graduate' || val === 'Postgraduate'
          ? 'Graduate'
          : val === 'Associate' || val === 'Undergraduate'
          ? 'Undergraduate'
          : 'Undergraduate';
      updated.courseLevel = mappedLevel;
    }
    onChange(updated);
  };

  const handleTheoryLabChange = (theory: number, lab: number) => {
    const totalCredits = theory + lab;
    const contact = theory + lab * 2; // Standard 1 credit lab = 2-3 contact hours
    onChange({
      ...course,
      theoryHours: theory,
      labHours: lab,
      creditHours: totalCredits || course.creditHours,
      contactHours: contact,
    });
  };

  const theory = course.theoryHours ?? 2;
  const lab = course.labHours ?? 1;
  const creditSum = theory + lab;
  const isCreditMismatch = creditSum !== course.creditHours && course.creditHours > 0;

  const handleAutoAlignCredits = () => {
    handleTheoryLabChange(theory, lab);
  };

  const handleAiSuggestParameters = () => {
    if (onAskCopilot) {
      onAskCopilot(
        `For the course "${course.title || 'Introduction to Computer Science'}" (${course.code || 'CS-101'}), suggest: 1) recommended theory and lab credit hours, 2) weekly contact hours breakdown, 3) realistic prerequisites and co-requisites, and 4) standard OBE passing benchmark.`
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with Step Progress and AI Suggestion */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 02 of 10</span>
            <span>•</span>
            <span>Curricular Parameters</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">Course Information</h2>
          <p className="text-xs text-slate-500 mt-1">
            Establish administrative credentials, academic classification, credit weighting, and contact hour requirements.
          </p>
        </div>

        {onAskCopilot && (
          <button
            type="button"
            onClick={handleAiSuggestParameters}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Suggest Curricular Split</span>
          </button>
        )}
      </div>

      {/* Stage 2 Live Accreditation Readiness Card */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
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
              <span>{stageEval.isCompleted ? 'Curricular Parameters Validated' : 'Parameters Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                OBE Audit
              </span>
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {stageEval.isCompleted
                ? `${course.code || 'Course'} (${course.creditHours} Credits) fulfills standard OBE qualification requirements.`
                : `Missing: ${stageEval.missingRequirements.join(', ')}`}
            </div>
          </div>
        </div>

        {isCreditMismatch && (
          <button
            type="button"
            onClick={handleAutoAlignCredits}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer self-start sm:self-auto shrink-0"
            title="Update Total Credits to match Theory + Lab sum"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync Credits ({creditSum} Cr)</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: Title & Code */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            1. Core Identification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Artificial Intelligence & Intelligent Systems"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                placeholder="e.g. CS-301 or EE-412"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department, Program & Degree Level */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            2. Academic Context & Classification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={course.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree Program</label>
              <input
                type="text"
                value={course.programme || ''}
                onChange={(e) => handleChange('programme', e.target.value)}
                placeholder="e.g. BS Computer Science (BS CS)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Course Level</label>
              <select
                value={course.degreeLevel || 'Undergraduate'}
                onChange={(e) => handleChange('degreeLevel', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Undergraduate">Undergraduate (BS / B.Sc / BA)</option>
                <option value="Graduate">Graduate (MS / M.Phil / MA)</option>
                <option value="Postgraduate">Doctoral (PhD)</option>
                <option value="Associate">Associate Degree / Diploma</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Type</label>
              <select
                value={course.courseType || 'Core'}
                onChange={(e) => handleChange('courseType', e.target.value as CourseType)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {COURSE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type} Course
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <input
                type="text"
                value={course.semester || 'Semester 5'}
                onChange={(e) => handleChange('semester', e.target.value)}
                placeholder="e.g. Semester 5, Fall 2025"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={course.academicYear || '2025-2026'}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                placeholder="e.g. 2025-2026"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Credit Hours & Contact Hours */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Credit Weighting & Contact Hours
            </h3>
            {isCreditMismatch && (
              <span className="text-[11px] text-amber-600 font-semibold flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Theory ({theory}) + Lab ({lab}) = {creditSum} Cr (Mismatch with {course.creditHours})</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Credits</label>
              <input
                type="number"
                min={1}
                max={12}
                value={course.creditHours}
                onChange={(e) => handleChange('creditHours', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-indigo-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Theory Credits</label>
              <input
                type="number"
                min={0}
                max={6}
                value={course.theoryHours ?? 2}
                onChange={(e) => handleTheoryLabChange(Number(e.target.value), course.labHours ?? 1)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Lab Credits</label>
              <input
                type="number"
                min={0}
                max={6}
                value={course.labHours ?? 1}
                onChange={(e) => handleTheoryLabChange(course.theoryHours ?? 2, Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Weekly Contact Hrs</label>
              <input
                type="number"
                min={1}
                max={20}
                value={course.contactHours ?? (course.theoryHours ?? 2) + (course.labHours ?? 1) * 2}
                onChange={(e) => handleChange('contactHours', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min={4}
                max={24}
                value={course.durationWeeks || 16}
                onChange={(e) => handleChange('durationWeeks', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Prerequisites, Delivery Mode & Passing Benchmark */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            4. Requisites, Delivery & Attainment Benchmark
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prerequisites</label>
              <input
                type="text"
                value={course.prerequisites || ''}
                onChange={(e) => handleChange('prerequisites', e.target.value)}
                placeholder="e.g. Data Structures (CS-201)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Co-requisites</label>
              <input
                type="text"
                value={course.corequisites || ''}
                onChange={(e) => handleChange('corequisites', e.target.value)}
                placeholder="e.g. AI Lab (CS-301L)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
              <select
                value={course.deliveryMode}
                onChange={(e) => handleChange('deliveryMode', e.target.value as DeliveryMode)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {DELIVERY_MODES.map((dm) => (
                  <option key={dm.value} value={dm.value}>
                    {dm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Passing Attainment Benchmark (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={30}
                  max={90}
                  value={course.passingBenchmark || 50}
                  onChange={(e) => handleChange('passingBenchmark', Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                />
                <span className="absolute right-3.5 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Minimum student score to count as outcome attained.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Learners Cohort
              </label>
              <input
                type="text"
                value={course.targetLearners || ''}
                onChange={(e) => handleChange('targetLearners', e.target.value)}
                placeholder="e.g. 3rd-year CS & Software Engineering undergraduates"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Instructor & Course Coordinator */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            5. Faculty Personnel
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                value={course.instructorName || ''}
                onChange={(e) => handleChange('instructorName', e.target.value)}
                placeholder="e.g. Prof. Shahid Soomro"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Coordinator / Department Head
              </label>
              <input
                type="text"
                value={course.courseCoordinator || ''}
                onChange={(e) => handleChange('courseCoordinator', e.target.value)}
                placeholder="e.g. Dr. Eleanor Vance"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Framework</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Course Description & Purpose</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
