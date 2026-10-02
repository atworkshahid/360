import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Layers,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Printer,
  Sparkles,
  Copy,
  Check,
  FileText,
  Clock,
  Target,
  FileCheck,
} from 'lucide-react';
import { Course } from '../../../types';
import { CoursePDFExportModal } from '../../CoursePDFExportModal';
import { PrintFriendlyView } from '../PrintFriendlyView';
import { LogoMark } from '../../Logo';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step14CoursePreview: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'syllabus' | 'hierarchy' | 'assessments'>('outline');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [printFriendlyOpen, setPrintFriendlyOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      initial[m.id] = true;
    });
    return initial;
  });
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      allExpanded[m.id] = true;
    });
    setExpandedModules(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedModules({});
  };

  const totalAssessmentWeight = course.assessments.reduce(
    (acc, a) => acc + (a.weightage || 0),
    0
  );

  const handleCopyMarkdownOutline = () => {
    let md = `# Course Outline: ${course.title} (${course.code})\n`;
    md += `**Department:** ${course.department} | **Level:** ${course.courseLevel} | **Credits:** ${course.creditHours} Credit Hours\n`;
    md += `**Delivery Mode:** ${course.deliveryMode} | **Passing Benchmark:** ${course.passingBenchmark || 60}%\n\n`;
    md += `## Course Description\n${course.description}\n\n`;

    md += `## Course Learning Outcomes (CLOs)\n`;
    course.clos.forEach((clo) => {
      md += `- **${clo.code}** [Bloom: ${clo.bloomLevel} (${clo.bloomVerb}) | Weight: ${clo.weightage}%]: ${clo.statement}\n`;
    });
    md += `\n---\n\n## Modular Course Outline & Hierarchical Alignment\n\n`;

    course.modules.forEach((mod) => {
      const moduleCLOs = course.clos.filter((c) => (mod.relatedCLOIds || []).includes(c.id));
      const moduleMLOs = course.mlos.filter((m) => m.moduleId === mod.id);
      const moduleLessons = course.lessons.filter((l) => l.moduleId === mod.id);
      const moduleActivities = course.activities.filter((a) => a.moduleId === mod.id);
      const moduleAssessments = course.assessments.filter((a) =>
        (a.linkedCLOIds || []).some((id) => (mod.relatedCLOIds || []).includes(id))
      );

      md += `### Module ${mod.number}: ${mod.title}\n`;
      md += `*Duration:* ${mod.durationWeeks} Weeks (${mod.expectedStudyHours} Total Study Hours)\n\n`;
      md += `**Module Overview:** ${mod.description}\n\n`;

      md += `#### 1. Associated Course Learning Outcomes (CLOs):\n`;
      if (moduleCLOs.length > 0) {
        moduleCLOs.forEach((c) => {
          md += `- **${c.code}** (${c.bloomLevel}): ${c.statement}\n`;
        });
      } else {
        md += `- *(Transversal cross-curricular foundation)*\n`;
      }

      md += `\n#### 2. Module Learning Outcomes (MLOs):\n`;
      if (moduleMLOs.length > 0) {
        moduleMLOs.forEach((m) => {
          md += `- **${m.code}** [Bloom: ${m.bloomLevel}]: ${m.statement} *(Study: ${m.studyTimeHours} hrs | Direct Evidence: ${m.evidence})*\n`;
        });
      } else {
        md += `- No MLOs registered.\n`;
      }

      md += `\n#### 3. Instructional Lessons:\n`;
      if (moduleLessons.length > 0) {
        moduleLessons.forEach((l) => {
          md += `- **${l.title}** (${l.durationMins} mins): ${l.learningObjective}\n  - *Active Task:* ${l.requiredActivity}\n`;
        });
      } else {
        md += `- Standard lecture and seminar discussions.\n`;
      }

      md += `\n#### 4. Suggested Active Learning Activities:\n`;
      if (moduleActivities.length > 0) {
        moduleActivities.forEach((act) => {
          md += `- **[${act.activityType}] ${act.title}** (${act.durationMins} mins)\n  - *Prompt:* ${act.description}\n  - *Evidence Produced:* ${act.evidenceProduced}\n`;
        });
      } else {
        md += `- Authentic problem-solving seminars and peer review sessions.\n`;
      }

      md += `\n#### 5. Associated Assessments & Evidence:\n`;
      if (moduleAssessments.length > 0) {
        moduleAssessments.forEach((asmt) => {
          md += `- **${asmt.name}** [${asmt.type} | Weight: ${asmt.weightage}% | Bloom: ${asmt.bloomLevel}]: ${asmt.marks} Marks\n`;
        });
      } else {
        md += `- Formative milestone feedback.\n`;
      }
      md += `\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 14</span>
          <span>•</span>
          <span>Course Synthesis & Outlines</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Hierarchical Course Outline & Master Preview</h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete hierarchical curriculum specification structured by modules, outcomes, activities, and direct evidence plans.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdownOutline}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Copy Outline to Clipboard in Markdown Format"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Outline Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Markdown Outline</span>
                </>
              )}
            </button>

            <button
              onClick={() => setPdfModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Preview and export full course specification as a formatted PDF"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF Dossier</span>
            </button>

            <button
              type="button"
              id="step14-print-friendly-view-btn"
              onClick={() => setPrintFriendlyOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Open clean, single-page layout stripped of UI for physical printing or simplified reading"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print-Friendly View</span>
            </button>

            <button
              onClick={() =>
                onAskCopilot(
                  `Review this complete hierarchical course outline for "${course.title}". Check if all CLOs and MLOs are adequately supported by activities and assessments.`
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Outline Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('outline')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'outline'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hierarchical Course Outline</span>
        </button>

        <button
          onClick={() => setActiveTab('syllabus')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'syllabus'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Institutional Syllabus View</span>
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'hierarchy'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Outcome Cascade Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'assessments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Assessment & Evidence Plan</span>
        </button>
      </div>

      {/* TAB 1: DETAILED HIERARCHICAL COURSE OUTLINE */}
      {activeTab === 'outline' && (
        <div className="space-y-6">
          {/* Top Controls & Outline Meta Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-start space-x-3">
                <div className="shrink-0 mt-0.5">
                  <LogoMark size={32} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    MENTISERA OBE360™ Course Blueprint Specification
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5 font-serif">
                    {course.title} ({course.code})
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleExpandAll}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Course Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Credit Hours</span>
                <span className="font-bold text-slate-900">{course.creditHours} Credits</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Course Level</span>
                <span className="font-bold text-slate-900">{course.courseLevel || 'Undergraduate'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Delivery Mode</span>
                <span className="font-bold text-slate-900">{course.deliveryMode || 'In-Person'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Instructional Modules</span>
                <span className="font-bold text-indigo-700">{course.modules.length} Modules</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">CLO Benchmarks</span>
                <span className="font-bold text-emerald-700">{course.clos.length} Outcomes (≥{course.passingBenchmark || 60}%)</span>
              </div>
            </div>
          </div>

          {/* CLO Target Summary */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Course Learning Outcomes (CLO Architecture)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.clos.map((clo) => (
                <div
                  key={clo.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px]">
                      {clo.code}
                    </span>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-semibold">
                      <span>Bloom: {clo.bloomLevel}</span>
                      <span>•</span>
                      <span>Weight: {clo.weightage}%</span>
                    </div>
                  </div>
                  <p className="text-slate-800 font-medium leading-normal">{clo.statement}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Module-by-Module Hierarchical Outline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Modular Hierarchy & Instructional Plan
              </h4>
              <span className="text-[11px] text-slate-500">
                Includes MLOs, Lessons, Activities, and Direct Assessments
              </span>
            </div>

            {course.modules.map((m) => {
              const isExpanded = !!expandedModules[m.id];
              const moduleCLOs = course.clos.filter((c) => (m.relatedCLOIds || []).includes(c.id));
              const moduleMLOs = course.mlos.filter((ml) => ml.moduleId === m.id);
              const moduleLessons = course.lessons.filter((l) => l.moduleId === m.id);
              const moduleActivities = course.activities.filter((a) => a.moduleId === m.id);
              const moduleAssessments = course.assessments.filter((a) =>
                (a.linkedCLOIds || []).some((id) => (m.relatedCLOIds || []).includes(id))
              );

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
                >
                  {/* Module Header Bar */}
                  <button
                    type="button"
                    onClick={() => toggleModule(m.id)}
                    className="w-full p-4.5 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between text-left transition cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                        {m.number}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                            Module {m.number}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {m.durationWeeks} Weeks • {m.expectedStudyHours} Study Hours • {moduleMLOs.length} MLOs • {moduleLessons.length} Lessons • {moduleActivities.length} Activities
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Modular Hierarchy */}
                  {isExpanded && (
                    <div className="p-6 space-y-6 text-xs divide-y divide-slate-100">
                      {/* Module Description */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Module Pedagogical Scope & Context
                        </span>
                        <p className="text-slate-700 leading-relaxed">{m.description}</p>
                      </div>

                      {/* 1. Associated CLOs */}
                      <div className="pt-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                          1. Associated Course Learning Outcomes (CLOs)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {moduleCLOs.length > 0 ? (
                            moduleCLOs.map((clo) => (
                              <div
                                key={clo.id}
                                className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start space-x-2 text-xs"
                              >
                                <span className="font-bold text-blue-700 shrink-0">{clo.code}:</span>
                                <span className="text-blue-950">{clo.statement}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 italic text-[11px]">
                              Transversal foundation supporting all course outcomes.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 2. Associated MLOs */}
                      <div className="pt-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                            2. Module Learning Outcomes (MLOs)
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {moduleMLOs.length} Outcomes
                          </span>
                        </div>
                        <div className="space-y-2">
                          {moduleMLOs.map((mlo) => (
                            <div
                              key={mlo.id}
                              className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-indigo-700 text-xs">
                                    {mlo.code}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                                    {mlo.bloomLevel} ({mlo.bloomVerb})
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {mlo.studyTimeHours} Study Hours
                                </span>
                              </div>
                              <p className="text-slate-800 font-medium text-xs">{mlo.statement}</p>
                              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-200/60">
                                <span>
                                  <strong>Direct Evidence:</strong> {mlo.evidence}
                                </span>
                                <span>
                                  <strong>Assessment Method:</strong> {mlo.assessment}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Structured Lessons */}
                      <div className="pt-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                            3. Instructional Lessons
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {moduleLessons.length} Scheduled Units
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {moduleLessons.map((l) => (
                            <div
                              key={l.id}
                              className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 line-clamp-1">{l.title}</span>
                                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                  {l.durationMins} mins
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2">{l.learningObjective}</p>
                              <p className="text-[11px] text-indigo-700 font-medium pt-1">
                                Task: {l.requiredActivity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Suggested Active Learning Activities */}
                      <div className="pt-4 space-y-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                          4. Suggested Active Learning Activities
                        </span>
                        <div className="space-y-2">
                          {moduleActivities.length > 0 ? (
                            moduleActivities.map((act) => (
                              <div
                                key={act.id}
                                className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-1.5 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-slate-900">{act.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                      {act.activityType}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {act.durationMins} mins
                                  </span>
                                </div>
                                <p className="text-slate-700 text-xs">{act.description}</p>
                                <div className="text-[11px] text-emerald-800 font-medium">
                                  <strong>Produced Artifact / Evidence:</strong> {act.evidenceProduced}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs italic">
                              Simulated bench oral arguments and problem-solving workshops scheduled.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 5. Associated Assessments */}
                      <div className="pt-4 space-y-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                          5. Associated Performance Assessments & Evaluative Tasks
                        </span>
                        <div className="space-y-2">
                          {moduleAssessments.length > 0 ? (
                            moduleAssessments.map((asmt) => (
                              <div
                                key={asmt.id}
                                className="p-3 bg-purple-50/40 border border-purple-200 rounded-xl flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-purple-950">{asmt.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                                      {asmt.type}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                      Bloom: {asmt.bloomLevel}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5">
                                    Passing Standard: {asmt.achievementThreshold}% • Direct Evidence Mode
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-sm font-black text-purple-900 block">
                                    {asmt.weightage}% Weight
                                  </span>
                                  <span className="text-[10px] text-slate-500">{asmt.marks} Points</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs italic">
                              Evaluated formatively with synthesis in comprehensive capstone final.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INSTITUTIONAL SYLLABUS */}
      {activeTab === 'syllabus' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8 print:p-0 print:border-none">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 text-center space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              MENTISERA Institute of Learning and Development
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-serif">{course.title}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 pt-2 font-medium">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-800">
                {course.code}
              </span>
              <span>•</span>
              <span>{course.department}</span>
              <span>•</span>
              <span>{course.creditHours} Credit Hours</span>
              <span>•</span>
              <span>{course.courseLevel || 'Undergraduate'} Level</span>
              <span>•</span>
              <span>Instructor: {course.instructorName || 'Designated Faculty Lead'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Course Description & Academic Rationale
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{course.description}</p>
          </div>

          {/* CLOs */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Course Learning Outcomes (CLOs)
            </h3>
            <div className="space-y-2.5">
              {course.clos.map((clo) => (
                <div
                  key={clo.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3 text-xs"
                >
                  <span className="font-bold text-blue-700 px-2 py-0.5 bg-blue-100 rounded text-[11px] shrink-0">
                    {clo.code}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">{clo.statement}</p>
                    <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-500">
                      <span>
                        Bloom: <strong className="text-slate-700">{clo.bloomLevel}</strong> ({clo.bloomVerb})
                      </span>
                      <span>•</span>
                      <span>
                        Weightage: <strong className="text-slate-700">{clo.weightage}%</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Passing Benchmark: <strong className="text-slate-700">{clo.achievementThreshold}%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modules & Lessons */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Module Structure & Instructional Timeline
            </h3>
            <div className="space-y-3">
              {course.modules.map((m) => {
                const moduleLessons = course.lessons.filter((l) => l.moduleId === m.id);
                const moduleMLOs = course.mlos.filter((ml) => ml.moduleId === m.id);

                return (
                  <div key={m.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {m.number}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          {m.durationWeeks} Weeks • {moduleLessons.length} Lessons • {moduleMLOs.length} MLOs
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-600">{m.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OUTCOME CASCADE TREE */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900">
            Constructive Alignment Hierarchy: PLO ➔ CLO ➔ MLO ➔ Instructional Task
          </h3>
          <div className="space-y-6">
            {course.clos.map((clo) => {
              const linkedMLOs = course.mlos.filter((m) => m.linkedCLOId === clo.id);
              return (
                <div key={clo.id} className="border-l-2 border-blue-500 pl-4 space-y-3">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-900">{clo.code}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-200 text-blue-800 font-bold">
                        {clo.bloomLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium mt-1">{clo.statement}</p>
                  </div>

                  <div className="pl-4 space-y-2">
                    {linkedMLOs.map((mlo) => {
                      const mloLessons = course.lessons.filter((l) => l.linkedMLOId === mlo.id);
                      return (
                        <div key={mlo.id} className="border-l-2 border-indigo-300 pl-3 space-y-1.5">
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="font-bold text-indigo-700">{mlo.code}: </span>
                            <span className="text-slate-700">{mlo.statement}</span>
                          </div>

                          {mloLessons.length > 0 && (
                            <div className="pl-3 space-y-1">
                              {mloLessons.map((les) => (
                                <div
                                  key={les.id}
                                  className="text-[11px] p-2 bg-white border border-slate-100 rounded text-slate-600 flex items-center space-x-2"
                                >
                                  <BookOpen className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {les.title} ({les.durationMins} mins)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ASSESSMENT PLAN TAB */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Grading & Direct Evidence Distribution</h3>
            <span className="text-xs font-bold text-blue-600">Total: {totalAssessmentWeight}%</span>
          </div>

          <div className="space-y-3">
            {course.assessments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{a.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                      {a.type}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-bold">
                      {a.bloomLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Evaluates:{' '}
                    {a.linkedCLOIds
                      .map((id) => course.clos.find((c) => c.id === id)?.code)
                      .filter(Boolean)
                      .join(', ') || 'No CLO linked'}
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <span className="text-slate-500">{a.marks} Points</span>
                  <span className="font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
                    {a.weightage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Alignment Audit</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
        >
          <span>Proceed to CQI & Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <CoursePDFExportModal
        course={course}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />

      {/* Print-Friendly View (clean layout stripped of UI) */}
      {printFriendlyOpen && (
        <PrintFriendlyView
          course={course}
          onClose={() => setPrintFriendlyOpen(false)}
        />
      )}
    </div>
  );
};
