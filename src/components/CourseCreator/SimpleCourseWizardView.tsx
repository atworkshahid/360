import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  Calendar,
  Award,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  FileDown,
  Loader2,
  FileText,
  Printer,
  HelpCircle,
  Lightbulb,
  Layers,
  Wand2,
  Check,
  AlertCircle,
  ExternalLink,
  FolderOpen,
  MessageSquare,
} from 'lucide-react';
import { Course, CLO, WeeklyCoursePlanItem, Assessment, BloomLevel } from '../../types';
import { downloadCoursePDF, exportCourseBlueprintWithGate } from '../../utils/pdfExport';
import { downloadCourseDocx } from '../../utils/docxExport';
import { OutcomeAssessmentDependencyAlert } from './OutcomeAssessmentDependencyAlert';
import { MicroLearningUnitsEditor } from './MicroLearningUnitsEditor';
import { synthesize4MicroUnits, serializeMicroUnitsToSubtopics } from '../../utils/microLearningHelper';
import { CourseResourceLibrary } from '../ResourceLibrary/CourseResourceLibrary';
import { ElementCommentDrawer } from './comments/ElementCommentDrawer';

// Helper to construct fully OBE-compliant CLOs with valid defaults
const createSimpleCLO = (
  id: string,
  code: string,
  statement: string,
  bloomVerb: string = 'Apply',
  bloomLevel: BloomLevel = 'Apply',
  status: 'Draft' | 'Validated' = 'Validated'
): CLO => ({
  id,
  code,
  statement,
  bloomVerb,
  bloomLevel,
  learningDomain: 'Cognitive',
  competency: 'Core Domain Skill',
  skills: 'Practical domain capability',
  assessmentMethod: 'Course Assessment',
  achievementThreshold: 60,
  weightage: 25,
  status,
  qualityScore: 90,
  qualityChecks: [],
  mappedPLOs: [],
});

interface SimpleCourseWizardViewProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNavigateDashboard: () => void;
  onSwitchToProMode: () => void;
  onAskCopilot: (prompt: string) => void;
  onOpenHelpGuide: () => void;
}

export const SimpleCourseWizardView: React.FC<SimpleCourseWizardViewProps> = ({
  course,
  onChange,
  onNavigateDashboard,
  onSwitchToProMode,
  onAskCopilot,
  onOpenHelpGuide,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isPdfExporting, setIsPdfExporting] = useState<boolean>(false);
  const [resourceLibraryOpen, setResourceLibraryOpen] = useState<boolean>(false);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const courseResourcesCount = (course.resources || []).length;
  const totalCommentsCount = (course.comments || []).length;

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Helper to calculate total grading percentage
  const totalGradingPercentage = (course.assessments || []).reduce(
    (acc, a) => acc + (Number(a.weightage) || 0),
    0
  );

  // AI Suggest Goals Generator (fast client preset + contextual synthesis)
  const handleAiSuggestGoals = () => {
    setIsAiGenerating(true);
    const title = course.title?.trim() || 'General Course';

    setTimeout(() => {
      let suggested: string[] = [];
      const lower = title.toLowerCase();

      if (lower.includes('web') || lower.includes('program') || lower.includes('software') || lower.includes('code') || lower.includes('python')) {
        suggested = [
          `Build responsive and well-structured applications using modern standards and best practices.`,
          `Debug, test, and troubleshoot common runtime issues and syntax errors effectively.`,
          `Design clean, maintainable modular code that solves practical user problems.`,
          `Deploy and present a fully working portfolio project following industry workflows.`,
        ];
      } else if (lower.includes('business') || lower.includes('market') || lower.includes('manage') || lower.includes('finance')) {
        suggested = [
          `Analyze core market conditions, financial metrics, and customer demand trends.`,
          `Develop strategic business proposals that address specific organizational challenges.`,
          `Apply ethical decision-making frameworks to operational leadership scenarios.`,
          `Communicate executive summaries and data-backed reports clearly to stakeholders.`,
        ];
      } else if (lower.includes('law') || lower.includes('legal') || lower.includes('justice')) {
        suggested = [
          `Interpret fundamental statutory provisions, constitutional doctrines, and precedents.`,
          `Draft clear, persuasive legal memoranda addressing client dispute scenarios.`,
          `Analyze opposing arguments using rigorous case law reasoning and statutory interpretation.`,
          `Demonstrate professional ethical standards during legal negotiation and advocacy.`,
        ];
      } else {
        suggested = [
          `Explain fundamental concepts, terminology, and key principles of ${title}.`,
          `Apply core methodologies and practical tools to solve typical problems in the field.`,
          `Critically evaluate case studies and identify opportunities for optimization.`,
          `Create and present a final synthesis project demonstrating overall subject mastery.`,
        ];
      }

      const newClos: CLO[] = suggested.map((statement, idx) => {
        const verb = idx === 0 ? 'Explain' : idx === 1 ? 'Apply' : idx === 2 ? 'Evaluate' : 'Create';
        const level: BloomLevel = idx === 0 ? 'Understand' : idx === 1 ? 'Apply' : idx === 2 ? 'Analyze' : 'Create';
        return createSimpleCLO(`clo-simple-${Date.now()}-${idx}`, `Goal ${idx + 1}`, statement, verb, level, 'Validated');
      });

      onChange({
        ...course,
        clos: newClos,
        updatedAt: new Date().toISOString(),
      });
      setIsAiGenerating(false);
      showToast('Generated 4 learning goals for your course!');
    }, 450);
  };

  // AI Suggest Weekly Schedule
  const handleAiSuggestWeeks = () => {
    setIsAiGenerating(true);
    const title = course.title || 'Course';
    const weeksCount = Math.max(4, Math.min(course.durationWeeks || 12, 16));

    setTimeout(() => {
      const generatedWeeks: WeeklyCoursePlanItem[] = [];
      const topicsByWeek = [
        { title: 'Course Introduction & Key Fundamentals', desc: 'Syllabus walkthrough, key concepts, environment setup, and baseline principles.' },
        { title: 'Core Terminology & Foundations', desc: 'Exploration of foundational theories, standard terminology, and initial exercises.' },
        { title: 'Practical Methods & Hands-on Tools', desc: 'Guided demonstration of core techniques, software/tools, and working through examples.' },
        { title: 'Problem Solving & Real-World Scenarios', desc: 'Analyzing common challenges, case studies, and guided problem-solving sessions.' },
        { title: 'Intermediate Applications & Skill Building', desc: 'Deepening practical skills through structured tasks and mini-exercises.' },
        { title: 'Midterm Review & Milestone Check-in', desc: 'Synthesizing knowledge learned so far, reviewing student questions, and milestone assessment.' },
        { title: 'Advanced Concepts & Nuanced Topics', desc: 'Expanding beyond basics into edge cases, optimization, and specialized topics.' },
        { title: 'Collaborative Projects & Workshop', desc: 'Group or individual hands-on project work with instructor feedback and peer critique.' },
        { title: 'Critical Evaluation & Case Studies', desc: 'Reviewing real-world industry or academic case studies and troubleshooting complex problems.' },
        { title: 'Refinement & Portfolio Preparation', desc: 'Polishing deliverables, code or reports with guided feedback from instructors.' },
        { title: 'Course Synthesis & Future Horizons', desc: 'Bringing all modules together, reviewing major learning goals, and career/industry outlook.' },
        { title: 'Final Project Presentations & Wrap-up', desc: 'Showcase of student work, final assessment wrap-up, and feedback reflections.' },
      ];

      for (let w = 1; w <= weeksCount; w++) {
        const topic = topicsByWeek[(w - 1) % topicsByWeek.length];
        const microUnits = synthesize4MicroUnits(w, topic.title, 'Understand');
        generatedWeeks.push({
          weekNumber: w,
          topic: topic.title,
          subtopics: serializeMicroUnitsToSubtopics(microUnits),
          microLearningUnits: microUnits,
          linkedCLOIds: (course.clos || []).slice(0, 2).map((c) => c.id),
          contactHours: 3,
        });
      }

      onChange({
        ...course,
        weeklyPlan: generatedWeeks,
        updatedAt: new Date().toISOString(),
      });
      setIsAiGenerating(false);
      showToast(`Created ${weeksCount}-week schedule with 4 sub-topics each!`);
    }, 450);
  };

  // Add new Goal
  const handleAddGoal = () => {
    const nextIdx = (course.clos?.length || 0) + 1;
    const newClo: CLO = createSimpleCLO(
      `clo-simple-${Date.now()}`,
      `Goal ${nextIdx}`,
      '',
      'Apply',
      'Apply',
      'Draft'
    );
    onChange({
      ...course,
      clos: [...(course.clos || []), newClo],
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Goal
  const handleUpdateGoal = (id: string, statement: string) => {
    onChange({
      ...course,
      clos: (course.clos || []).map((c) => (c.id === id ? { ...c, statement } : c)),
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove Goal
  const handleRemoveGoal = (id: string) => {
    onChange({
      ...course,
      clos: (course.clos || []).filter((c) => c.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Week with 4 Micro-learning Units
  const handleAddWeek = () => {
    const nextWeekNum = (course.weeklyPlan?.length || 0) + 1;
    const topic = `Topic for Week ${nextWeekNum}`;
    const microUnits = synthesize4MicroUnits(nextWeekNum, topic, 'Understand');
    const newWeek: WeeklyCoursePlanItem = {
      weekNumber: nextWeekNum,
      topic,
      subtopics: serializeMicroUnitsToSubtopics(microUnits),
      microLearningUnits: microUnits,
      linkedCLOIds: (course.clos || []).slice(0, 1).map((c) => c.id),
      contactHours: 3,
    };
    onChange({
      ...course,
      weeklyPlan: [...(course.weeklyPlan || []), newWeek],
      durationWeeks: Math.max(course.durationWeeks || 0, nextWeekNum),
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Week Field
  const handleUpdateWeek = (weekNumber: number, field: 'topic' | 'subtopics', val: string) => {
    onChange({
      ...course,
      weeklyPlan: (course.weeklyPlan || []).map((w) => (w.weekNumber === weekNumber ? { ...w, [field]: val } : w)),
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Whole Week Item (including micro-learning units)
  const handleUpdateWeekItem = (weekNumber: number, updatedItem: WeeklyCoursePlanItem) => {
    onChange({
      ...course,
      weeklyPlan: (course.weeklyPlan || []).map((w) => (w.weekNumber === weekNumber ? updatedItem : w)),
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove Week
  const handleRemoveWeek = (weekNumber: number) => {
    const remaining = (course.weeklyPlan || []).filter((w) => w.weekNumber !== weekNumber);
    const renumbered = remaining.map((w, idx) => ({ ...w, weekNumber: idx + 1 }));
    onChange({
      ...course,
      weeklyPlan: renumbered,
      durationWeeks: renumbered.length,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Assessment
  const handleAddAssessment = () => {
    const newAss: Assessment = {
      id: `ass-simple-${Date.now()}`,
      name: 'New Assignment / Quiz',
      type: 'Assignment',
      marks: 100,
      weightage: 20,
      achievementThreshold: 60,
      isSummative: true,
      directOrIndirect: 'Direct',
      bloomLevel: 'Apply',
      evidenceType: 'Direct',
      linkedCLOIds: (course.clos || []).map((c) => c.id),
      linkedMLOIds: [],
      questions: [],
    };
    onChange({
      ...course,
      assessments: [...(course.assessments || []), newAss],
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Assessment
  const handleUpdateAssessment = (id: string, field: 'name' | 'type' | 'weightage', val: any) => {
    onChange({
      ...course,
      assessments: (course.assessments || []).map((a) =>
        a.id === id ? { ...a, [field]: field === 'weightage' ? Number(val) || 0 : val } : a
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove Assessment
  const handleRemoveAssessment = (id: string) => {
    onChange({
      ...course,
      assessments: (course.assessments || []).filter((a) => a.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Top Friendly Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: Back & Course Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onNavigateDashboard}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Return to My Courses Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Simple Mode
                </span>
                <span className="text-xs text-slate-400">Easy Course Builder</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
                {course.title || 'Untitled Course'}
              </h2>
            </div>
          </div>

          {/* Right: Export to PDF, Mode Switch & Help */}
          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              type="button"
              id="simple-wizard-resources-btn"
              onClick={() => setResourceLibraryOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
              title="Course Resource Library: Upload, tag, and associate supporting documents (syllabi, rubrics) with course modules"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Resources</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-800 text-[10px] font-extrabold">
                {courseResourcesCount}
              </span>
            </button>

            <button
              type="button"
              id="simple-wizard-comments-btn"
              onClick={() => setCommentsDrawerOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/90 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
              title="Course Section & Module Comments: View feedback threads or leave comments for this section"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Comments</span>
              {totalCommentsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                  {totalCommentsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="simple-wizard-export-pdf-btn"
              onClick={() => {
                setIsPdfExporting(true);
                try {
                  exportCourseBlueprintWithGate(course, {}, () => {
                    setIsPdfExporting(false);
                  });
                } catch (err) {
                  console.error('Failed to export PDF:', err);
                } finally {
                  setTimeout(() => setIsPdfExporting(false), 800);
                }
              }}
              disabled={isPdfExporting}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Export printable PDF of current course audit and structure"
            >
              {isPdfExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>{isPdfExporting ? 'Exporting...' : 'Export to PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenHelpGuide}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Layman Guide</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToProMode}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
              title="Switch to Pro Mode for Bloom's Taxonomy, Washington Accord, and Accreditation Matrices"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Switch to Pro Mode</span>
            </button>
          </div>
        </div>

        {/* 4 Clean Steps Stepper Bar */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, label: 'Course Basics', icon: BookOpen, summary: 'Name & Overview' },
                { step: 2, label: 'Learning Goals', icon: Target, summary: 'What students learn' },
                { step: 3, label: 'Weekly Schedule', icon: Calendar, summary: 'Topics & Lessons' },
                { step: 4, label: 'Grading & Export', icon: Award, summary: 'Grades & Syllabus' },
              ].map((item) => {
                const isActive = activeStep === item.step;
                const isPast = activeStep > item.step;
                const Icon = item.icon;

                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveStep(item.step as any)}
                    className={`flex items-center space-x-2 p-2 sm:p-2.5 rounded-xl text-left transition cursor-pointer border ${
                      isActive
                        ? 'bg-white text-indigo-700 border-indigo-300 shadow-2xs font-bold'
                        : isPast
                        ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100/50'
                        : 'bg-white/60 text-slate-500 border-slate-200 hover:bg-white hover:text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPast ? '✓' : item.step}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <div className="text-xs truncate font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.summary}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* ================= STEP 1: COURSE BASICS ================= */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Friendly introduction banner */}
            <div className="bg-gradient-to-r from-indigo-50 via-white to-slate-50 border border-indigo-100 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 1: Course Basics</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Start by naming your course and giving learners a clear idea of what it covers and who it is for.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Course Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => onChange({ ...course, title: e.target.value })}
                  placeholder="e.g. Introduction to Web Development, Digital Marketing 101"
                  className="w-full text-sm font-semibold text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  💡 Tip: Make it clear and appealing so students immediately understand the subject.
                </span>
              </div>

              {/* Code & Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Code / ID
                  </label>
                  <input
                    type="text"
                    value={course.code}
                    onChange={(e) => onChange({ ...course, code: e.target.value })}
                    placeholder="e.g. CS-101, MKT-200"
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instructor / Teacher Name
                  </label>
                  <input
                    type="text"
                    value={course.instructorName || ''}
                    onChange={(e) => onChange({ ...course, instructorName: e.target.value })}
                    placeholder="e.g. Sarah Connor, Dr. Alex Smith"
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Subject & Level & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    value={course.category}
                    onChange={(e) => onChange({ ...course, category: e.target.value })}
                    placeholder="e.g. Computer Science, Business, Arts"
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Learner Level
                  </label>
                  <select
                    value={course.courseLevel || 'Undergraduate'}
                    onChange={(e) => onChange({ ...course, courseLevel: e.target.value as any })}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                  >
                    <option value="School">School / High School</option>
                    <option value="Undergraduate">College / Undergraduate (Beginner)</option>
                    <option value="Graduate">Graduate (Advanced)</option>
                    <option value="Professional">Professional / Career</option>
                    <option value="Training">Workshop / Short Course</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={course.durationWeeks || 12}
                    onChange={(e) => onChange({ ...course, durationWeeks: Number(e.target.value) || 12 })}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Short Course Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Summary (What is this course about?)
                </label>
                <textarea
                  rows={4}
                  value={course.description}
                  onChange={(e) => onChange({ ...course, description: e.target.value })}
                  placeholder="In 2 to 4 sentences, describe the core topics and what learners can expect to achieve..."
                  className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  💡 Tip: This will appear on the first page of your generated Course Syllabus!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: LEARNING GOALS ================= */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-purple-50 via-white to-slate-50 border border-purple-100 rounded-2xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Step 2: What Will Students Learn?</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Write 3 to 5 concrete skills or abilities students will have after completing your course.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAiSuggestGoals}
                  disabled={isAiGenerating}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAiGenerating ? 'Generating...' : '✨ AI Suggest 4 Goals'}</span>
                </button>
              </div>
            </div>

            {/* List of Goals */}
            <div className="space-y-3">
              {(course.clos || []).map((goal, idx) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-start space-x-3 hover:border-purple-200 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Learning Goal {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(goal.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                        title="Remove Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={goal.statement}
                      onChange={(e) => handleUpdateGoal(goal.id, e.target.value)}
                      placeholder={`e.g. Build responsive web pages using HTML, CSS, and modern layout techniques.`}
                      className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}

              {(!course.clos || course.clos.length === 0) && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                  <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Learning Goals Added Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click below to write your own goals, or let AI generate a starter set in one click!
                  </p>
                  <div className="flex items-center justify-center space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Goal Manually</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAiSuggestGoals}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Suggest Goals</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Add Goal Button */}
              {course.clos && course.clos.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="w-full py-3 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/60 text-purple-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Goal</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: WEEKLY SCHEDULE ================= */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-blue-50 via-white to-slate-50 border border-blue-100 rounded-2xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Step 3: Weekly Schedule & Lessons</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Plan your course week by week. Each week features 4 structured sub-topics (Micro-learning Units) to scaffold student mastery.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAiSuggestWeeks}
                  disabled={isAiGenerating}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAiGenerating ? 'Building...' : '✨ AI Auto-fill Schedule'}</span>
                </button>
              </div>
            </div>

            {/* Weeks List */}
            <div className="space-y-3">
              {(course.weeklyPlan || []).map((week, idx) => (
                <div
                  key={`week-${week.weekNumber}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-blue-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                        {week.weekNumber || idx + 1}
                      </span>
                      <input
                        type="text"
                        value={week.topic || ''}
                        onChange={(e) => handleUpdateWeek(week.weekNumber, 'topic', e.target.value)}
                        placeholder={`Week ${week.weekNumber || idx + 1}: Topic Name`}
                        className="text-xs font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-64 sm:w-80"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWeek(week.weekNumber)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                      title="Remove Week"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 4 Sub-topics / Micro-learning Units */}
                  <MicroLearningUnitsEditor
                    week={week}
                    onChange={(updated) => handleUpdateWeekItem(week.weekNumber, updated)}
                    defaultExpanded={false}
                    onAskCopilot={onAskCopilot}
                    courseTitle={course.title}
                    courseLevel={course.level}
                  />
                </div>
              ))}

              {(!course.weeklyPlan || course.weeklyPlan.length === 0) && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Weekly Schedule Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Add weeks one by one, or click AI Auto-fill to create a {course.durationWeeks || 12}-week syllabus outline.
                  </p>
                  <div className="flex items-center justify-center space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={handleAddWeek}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Week 1</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAiSuggestWeeks}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Auto-fill Schedule</span>
                    </button>
                  </div>
                </div>
              )}

              {course.weeklyPlan && course.weeklyPlan.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddWeek}
                  className="w-full py-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Next Week</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 4: GRADING & EXPORT ================= */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-emerald-50 via-white to-slate-50 border border-emerald-100 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 4: Grading & Final Syllabus</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Set up how students will be graded, then download your ready-to-use syllabus with 1 click.
                  </p>
                </div>
              </div>
            </div>

            {/* Outcome & Assessment Dependency Integrity Alert */}
            <OutcomeAssessmentDependencyAlert
              course={course}
              onChange={onChange}
              mode="banner"
            />

            {/* Grading Breakdown Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Grading Percentage Breakdown
                  </h4>
                  <p className="text-[11px] text-slate-500">Total must add up to 100%</p>
                </div>

                {/* Live total badge */}
                <div
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5 ${
                    totalGradingPercentage === 100
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {totalGradingPercentage === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>Total: {totalGradingPercentage}% / 100%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    totalGradingPercentage === 100
                      ? 'bg-emerald-500'
                      : totalGradingPercentage > 100
                      ? 'bg-rose-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(totalGradingPercentage, 100)}%` }}
                />
              </div>

              {/* Assessment Rows */}
              <div className="space-y-2.5 pt-2">
                {(course.assessments || []).map((ass) => (
                  <div
                    key={ass.id}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <input
                      type="text"
                      value={ass.name}
                      onChange={(e) => handleUpdateAssessment(ass.id, 'name', e.target.value)}
                      placeholder="e.g. Quizzes, Midterm, Final Project"
                      className="flex-1 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />

                    <select
                      value={ass.type}
                      onChange={(e) => handleUpdateAssessment(ass.id, 'type', e.target.value)}
                      className="text-xs font-medium text-slate-700 border border-slate-300 rounded-lg px-2 py-1.5 bg-white cursor-pointer"
                    >
                      <option value="Assignment">Assignment</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Project">Project</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Final Assessment">Final Exam / Assessment</option>
                    </select>

                    <div className="flex items-center space-x-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={ass.weightage}
                        onChange={(e) => handleUpdateAssessment(ass.id, 'weightage', e.target.value)}
                        className="w-16 text-xs font-bold text-center text-slate-900 border border-slate-300 rounded-lg py-1.5 bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAssessment(ass.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                      title="Remove assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddAssessment}
                  className="w-full py-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Grading Item</span>
                </button>
              </div>
            </div>

            {/* Instant Download Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                  Ready to Teach
                </span>
                <h4 className="text-lg font-bold text-white mt-2">Export Your Course Syllabus</h4>
                <p className="text-xs text-indigo-200 mt-1 max-w-lg leading-relaxed">
                  Your course is packaged and formatted with professional layout, learning goals, weekly schedule, and grading criteria.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  id="simple-step4-export-pdf-btn"
                  onClick={() => exportCourseBlueprintWithGate(course)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-xs"
                  title="Export printable PDF of current course audit and structure"
                >
                  <FileDown className="w-4 h-4 text-indigo-600" />
                  <span>Export to PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadCourseDocx(course)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 text-white font-bold text-xs flex items-center space-x-2 border border-indigo-400/40 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-300" />
                  <span>Download Word (.docx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <footer className="bg-white border-t border-slate-200 sticky bottom-0 z-30 shadow-lg py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1) as any)}
            disabled={activeStep === 1}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onChange({ ...course, updatedAt: new Date().toISOString() });
                showToast('Draft saved successfully!');
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Save Draft
            </button>

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(4, prev + 1) as any)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs shadow-indigo-200"
              >
                <span>Continue to Step {activeStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => exportCourseBlueprintWithGate(course)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs shadow-emerald-200"
              >
                <Download className="w-4 h-4" />
                <span>Finish & Download Syllabus</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed bottom-16 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Course Resource Library Modal for Uploading, Tagging, and Associating Documents */}
      <CourseResourceLibrary
        course={course}
        isOpen={resourceLibraryOpen}
        onClose={() => setResourceLibraryOpen(false)}
        onUpdateCourse={onChange}
        mode="modal"
      />

      {/* Stakeholder Section & Module Feedback Drawer */}
      <ElementCommentDrawer
        isOpen={commentsDrawerOpen}
        onClose={() => setCommentsDrawerOpen(false)}
        course={course}
        onChange={onChange}
        initialTargetId={`step-${activeStep}`}
        initialTargetType="Section"
        initialTargetTitle={`Step ${activeStep} Review`}
      />
    </div>
  );
};
