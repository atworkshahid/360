import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  Brain,
  Target,
  BookOpen,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  Sliders,
  Printer,
  Copy,
  Table,
  Scale,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  Course,
  CLO,
  BloomLevel,
  AssessmentTaskSuggestion,
  CourseAssessmentMappingSuite,
  AssessmentType,
  Rubric,
  Assessment,
} from '../../types';
import {
  getSuggestedTasksForCLO,
  getSuggestedTasksForBloomLevel,
  generateCourseWideAssessmentPlan,
  applySuggestionToCourse,
  applyFullSuiteToCourse,
  fetchAIAssessmentSuggestions,
  getCognitiveTier,
} from '../../services/assessmentTaskSuggestionService';
import { BLOOM_ORDER } from '../../utils/assessmentAnalysis';

export interface AssessmentTaskSuggestionModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onChangeCourse: (updatedCourse: Course) => void;
  initialCLOId?: string;
  initialBloomLevel?: BloomLevel;
}

export const AssessmentTaskSuggestionModal: React.FC<AssessmentTaskSuggestionModalProps> = ({
  course,
  isOpen,
  onClose,
  onChangeCourse,
  initialCLOId,
  initialBloomLevel,
}) => {
  const clos = course.clos || [];
  const assessments = course.assessments || [];

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'by_clo' | 'bloom_matrix' | 'full_suite'>('by_clo');

  // Selected CLO state
  const [selectedCLOId, setSelectedCLOId] = useState<string>(
    initialCLOId || (clos[0]?.id || '')
  );

  // Selected Bloom level for the Bloom Matrix tab
  const [selectedBloomLevel, setSelectedBloomLevel] = useState<BloomLevel>(
    initialBloomLevel || 'Analyze'
  );

  // Filter tasks by type in the current view
  const [taskTypeFilter, setTaskTypeFilter] = useState<'all' | AssessmentType>('all');

  // Expanded card details (prompts, rubrics, questions)
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  // Recently applied task feedback
  const [recentlyAppliedId, setRecentlyAppliedId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // AI loading state
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiCustomTasks, setAiCustomTasks] = useState<Record<string, AssessmentTaskSuggestion[]>>({});

  // Customize task before adding modal
  const [customizingTask, setCustomizingTask] = useState<AssessmentTaskSuggestion | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customWeight, setCustomWeight] = useState<number>(15);
  const [customMarks, setCustomMarks] = useState<number>(50);

  // Compute selected CLO
  const selectedCLO = useMemo(() => {
    return clos.find((c) => c.id === selectedCLOId) || clos[0];
  }, [clos, selectedCLOId]);

  // Compute tasks for the selected CLO (deterministic + any AI generated ones)
  const cloSuggestions = useMemo(() => {
    if (!selectedCLO) return [];
    const local = getSuggestedTasksForCLO(selectedCLO, course);
    const aiAdded = aiCustomTasks[selectedCLO.id] || [];
    return [...aiAdded, ...local];
  }, [selectedCLO, course, aiCustomTasks]);

  // Compute tasks for the selected Bloom level tab
  const bloomLevelSuggestions = useMemo(() => {
    return getSuggestedTasksForBloomLevel(selectedBloomLevel, course);
  }, [selectedBloomLevel, course]);

  // Compute the full course automated suite
  const fullCourseSuite = useMemo(() => {
    return generateCourseWideAssessmentPlan(course);
  }, [course]);

  if (!isOpen) return null;

  // Toggle card expansion
  const toggleExpand = (taskId: string) => {
    const next = new Set(expandedTaskIds);
    if (next.has(taskId)) {
      next.delete(taskId);
    } else {
      next.add(taskId);
    }
    setExpandedTaskIds(next);
  };

  // One-click apply single task
  const handleApplyTask = (task: AssessmentTaskSuggestion) => {
    const { updatedCourse, addedAssessment } = applySuggestionToCourse(course, task);
    onChangeCourse(updatedCourse);
    setRecentlyAppliedId(task.id);
    setTimeout(() => {
      setRecentlyAppliedId(null);
    }, 3000);
  };

  // Open customize drawer
  const handleOpenCustomize = (task: AssessmentTaskSuggestion) => {
    setCustomizingTask(task);
    setCustomTitle(task.title);
    setCustomWeight(task.recommendedWeight);
    setCustomMarks(task.recommendedMarks);
  };

  // Confirm customized add
  const handleConfirmCustomizedAdd = () => {
    if (!customizingTask) return;
    const { updatedCourse } = applySuggestionToCourse(course, customizingTask, {
      customName: customTitle,
      customWeight,
      customMarks,
    });
    onChangeCourse(updatedCourse);
    setRecentlyAppliedId(customizingTask.id);
    setCustomizingTask(null);
    setTimeout(() => {
      setRecentlyAppliedId(null);
    }, 3000);
  };

  // Adopt full suite
  const handleAdoptFullSuite = () => {
    if (
      window.confirm(
        `Adopt complete 100% balanced assessment plan with ${fullCourseSuite.suggestedAssessments.length} authentic instruments and ${fullCourseSuite.suggestedRubrics.length} evaluation rubrics? This will calibrate current assessments.`
      )
    ) {
      const updated = applyFullSuiteToCourse(course, fullCourseSuite);
      onChangeCourse(updated);
      onClose();
    }
  };

  // Trigger AI generation for active CLO
  const handleGenerateAIForCLO = async () => {
    if (!selectedCLO) return;
    setIsGeneratingAI(true);
    try {
      const aiResults = await fetchAIAssessmentSuggestions(course, selectedCLO);
      if (aiResults && aiResults.length > 0) {
        setAiCustomTasks((prev) => ({
          ...prev,
          [selectedCLO.id]: aiResults,
        }));
      }
    } catch (err) {
      console.warn('AI suggestions error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Copy blueprint markdown to clipboard
  const handleCopyBlueprint = () => {
    let md = `# Automated Assessment Blueprint by CLO Cognitive Level\n`;
    md += `**Course:** ${course.title} (${course.code})\n\n`;
    md += `| CLO Code | Bloom Cognitive Level | Recommended Task | Format | Weight |\n`;
    md += `|---|---|---|---|---|\n`;
    fullCourseSuite.cloMappings.forEach((m) => {
      md += `| ${m.cloCode} | ${m.bloomLevel} (${m.cognitiveTier}) | ${m.selectedTask.title} | ${m.selectedTask.format} | ${m.selectedTask.recommendedWeight}% |\n`;
    });
    md += `\n**Total Weight:** ${fullCourseSuite.totalSuggestedWeight}%\n`;
    md += `**Cognitive Balance:** HOTS ${fullCourseSuite.overallCognitiveBalance.hotsPercent}%, MOTS ${fullCourseSuite.overallCognitiveBalance.motsPercent}%, LOTS ${fullCourseSuite.overallCognitiveBalance.lotsPercent}%\n`;

    navigator.clipboard.writeText(md);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 border-b border-indigo-900/40">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold tracking-wide uppercase">
                  <Brain className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Constructive Alignment Engine</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bloom's Taxonomy Matched</span>
                </span>
                <span className="text-slate-400 text-xs">
                  {course.code || 'Course'} • {course.title}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
                <span>Automated Assessment Task Suggester</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Recommends authentic assessment tasks (analytic rubrics, scenario quizzes, practical labs, and capstone projects) strictly aligned to the cognitive depth defined in each Course Learning Outcome.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
              title="Close Suggester"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-white/10 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab('by_clo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'by_clo'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>By Course Outcome (CLOs)</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                {clos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bloom_matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'bloom_matrix'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Bloom Cognitive Continuum (L1–L6)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('full_suite')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'full_suite'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>100% Course Blueprint Suite</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-mono">
                100%
              </span>
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          {/* TAB 1: BY COURSE CLO */}
          {activeTab === 'by_clo' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: CLO Selector & Status */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Course Learning Outcomes
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {clos.length} Defined
                  </span>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {clos.map((clo) => {
                    const isSelected = clo.id === selectedCLO?.id;
                    const tier = getCognitiveTier(clo.bloomLevel || 'Apply');
                    // Check if already assessed
                    const isAssessed = assessments.some((a) =>
                      (a.linkedCLOIds || []).includes(clo.id)
                    );

                    return (
                      <div
                        key={clo.id}
                        onClick={() => setSelectedCLOId(clo.id)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-500 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {clo.code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                tier === 'HOTS'
                                  ? 'bg-purple-100 text-purple-800'
                                  : tier === 'MOTS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {tier} • {clo.bloomLevel || 'Apply'}
                            </span>
                          </div>

                          {isAssessed ? (
                            <span
                              className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700"
                              title="Already linked to one or more assessments"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Assessed</span>
                            </span>
                          ) : (
                            <span
                              className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
                              title="No assessment instrument linked yet"
                            >
                              Unassessed
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {clo.statement}
                        </p>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          <span>Verb: <strong className="text-slate-800">{clo.bloomVerb || clo.bloomLevel}</strong></span>
                          <span>Target: <strong className="text-slate-800">{clo.weightage || 20}%</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Tailored Suggestions for Selected CLO */}
              <div className="lg:col-span-8 space-y-4">
                {selectedCLO ? (
                  <>
                    {/* Active CLO Spotlight Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-indigo-700">
                            {selectedCLO.code}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                            Bloom Level: {selectedCLO.bloomLevel || 'Apply'} (L{getCognitiveTier(selectedCLO.bloomLevel || 'Apply')})
                          </span>
                          <span className="text-xs text-slate-500">
                            Weight: {selectedCLO.weightage || 20}%
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleGenerateAIForCLO}
                          disabled={isGeneratingAI}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isGeneratingAI ? 'Synthesizing with AI...' : 'Generate with AI'}</span>
                        </button>
                      </div>

                      <p className="text-sm text-slate-900 font-serif leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{selectedCLO.statement}"
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                        <span>
                          <strong>Cognitive Tier:</strong>{' '}
                          <span className="text-indigo-700 font-semibold">
                            {getCognitiveTier(selectedCLO.bloomLevel || 'Apply')}
                          </span>
                        </span>
                        <span>
                          <strong>Active Verb:</strong>{' '}
                          <span className="text-slate-800 font-semibold">{selectedCLO.bloomVerb || selectedCLO.bloomLevel}</span>
                        </span>
                        <span>
                          <strong>Competency:</strong>{' '}
                          <span className="text-slate-800">{selectedCLO.competency || 'General Competency'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Suggested Assessment Instruments
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {cloSuggestions.length} Available
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-xs">
                        <span className="text-slate-500 text-[11px] mr-1">Filter:</span>
                        {(['all', 'Quiz', 'Assignment', 'Case Study', 'Project', 'Presentation'] as const).map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setTaskTypeFilter(type)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                                taskTypeFilter === type
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {type === 'all' ? 'All Types' : type}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Suggestions Cards List */}
                    <div className="space-y-4">
                      {cloSuggestions
                        .filter(
                          (t) => taskTypeFilter === 'all' || t.taskType === taskTypeFilter
                        )
                        .map((task) => {
                          const isExpanded = expandedTaskIds.has(task.id);
                          const isJustApplied = recentlyAppliedId === task.id;

                          return (
                            <div
                              key={task.id}
                              className={`bg-white rounded-2xl border transition-all p-5 shadow-2xs space-y-4 ${
                                isJustApplied
                                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                                  : 'border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              {/* Card Header */}
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-[240px]">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                                      {task.taskType}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                        task.cognitiveTier === 'HOTS'
                                          ? 'bg-purple-100 text-purple-800'
                                          : task.cognitiveTier === 'MOTS'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-sky-100 text-sky-800'
                                      }`}
                                    >
                                      {task.bloomLevel} ({task.cognitiveTier})
                                    </span>
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                                      {task.isSummative ? 'Summative' : 'Formative'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      Weight: <strong className="text-slate-800">{task.recommendedWeight}%</strong>
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      Marks: <strong className="text-slate-800">{task.recommendedMarks}</strong>
                                    </span>
                                  </div>

                                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                                    {task.title}
                                  </h3>
                                  <div className="text-xs text-slate-500 font-medium">
                                    Format: <span className="text-slate-700">{task.format}</span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCustomize(task)}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                                  >
                                    <Sliders className="w-3.5 h-3.5 inline mr-1" />
                                    <span>Customize</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleApplyTask(task)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer ${
                                      isJustApplied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200'
                                    }`}
                                  >
                                    {isJustApplied ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Added to Course!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add to Course</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Pedagogical Rationale */}
                              <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                                <div className="font-bold flex items-center space-x-1.5 text-indigo-900">
                                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Constructive Alignment Rationale:</span>
                                </div>
                                <p className="leading-relaxed text-indigo-900/90">
                                  {task.pedagogicalRationale}
                                </p>
                              </div>

                              {/* Student Task Prompt Preview */}
                              <div className="space-y-1 text-xs">
                                <span className="font-bold text-slate-700 block">
                                  Student Task Instructions:
                                </span>
                                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                                  {task.studentTaskPrompt}
                                </p>
                              </div>

                              {/* Expandable Rubric or Questions preview */}
                              {(task.rubricBlueprint || task.sampleQuestions) && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(task.id)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 transition cursor-pointer"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                    <span>
                                      {task.rubricBlueprint
                                        ? `Inspect Rubric Criteria (${task.rubricBlueprint.criteria.length} criteria with descriptors)`
                                        : `Inspect Sample Questions (${task.sampleQuestions?.length || 0} items)`}
                                    </span>
                                  </button>

                                  {isExpanded && task.rubricBlueprint && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-800">
                                          {task.rubricBlueprint.rubricTitle}
                                        </span>
                                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                          Ready for Auto-Grading & LMS
                                        </span>
                                      </div>

                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                                          <thead className="bg-slate-100 text-slate-700">
                                            <tr>
                                              <th className="p-2.5 text-left font-bold w-1/4">Criterion</th>
                                              <th className="p-2.5 text-left font-bold w-12">Weight</th>
                                              <th className="p-2.5 text-left font-bold">Performance Descriptors</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {task.rubricBlueprint.criteria.map((crit, cIdx) => (
                                              <tr key={cIdx} className="bg-white">
                                                <td className="p-2.5 font-semibold text-slate-900 align-top">
                                                  {crit.criterionName}
                                                </td>
                                                <td className="p-2.5 text-indigo-700 font-bold align-top">
                                                  {crit.weight}%
                                                </td>
                                                <td className="p-2.5 space-y-1 text-[11px] text-slate-600">
                                                  {crit.levels.map((lvl, lIdx) => (
                                                    <div key={lIdx} className="flex items-start gap-1.5">
                                                      <span className="font-bold text-slate-700 w-24 shrink-0">
                                                        {lvl.level} ({lvl.pointsRange}):
                                                      </span>
                                                      <span className="text-slate-600">{lvl.descriptor}</span>
                                                    </div>
                                                  ))}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {isExpanded && task.sampleQuestions && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                      <span className="font-bold text-xs text-slate-800 block">
                                        Sample Diagnostic Quiz Items:
                                      </span>
                                      <div className="space-y-2">
                                        {task.sampleQuestions.map((q, qIdx) => (
                                          <div
                                            key={qIdx}
                                            className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs"
                                          >
                                            <div className="font-semibold text-slate-900">
                                              Q{qIdx + 1}: {q.questionStatement}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                              {q.options.map((opt, oIdx) => (
                                                <div
                                                  key={oIdx}
                                                  className={`p-1.5 rounded-lg border ${
                                                    oIdx === q.correctAnswerIndex
                                                      ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                                      : 'bg-white border-slate-200 text-slate-600'
                                                  }`}
                                                >
                                                  {String.fromCharCode(65 + oIdx)}. {opt}
                                                  {oIdx === q.correctAnswerIndex && ' ✓ (Correct)'}
                                                </div>
                                              ))}
                                            </div>
                                            <p className="text-[11px] text-slate-500 italic pt-1">
                                              Rationale: {q.explanation}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No course learning outcomes available.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BLOOM COGNITIVE CONTINUUM (L1 - L6) */}
          {activeTab === 'bloom_matrix' && (
            <div className="space-y-6">
              {/* Level Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {BLOOM_ORDER.map((level, idx) => {
                  const isSelected = selectedBloomLevel === level;
                  const tier = getCognitiveTier(level);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedBloomLevel(level)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                        <span>Level {idx + 1}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : tier === 'HOTS'
                              ? 'bg-purple-100 text-purple-800'
                              : tier === 'MOTS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {tier}
                        </span>
                      </div>
                      <div className="font-bold text-sm">{level}</div>
                    </button>
                  );
                })}
              </div>

              {/* Explanatory banner for selected level */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-slate-900">
                    Bloom Level: {selectedBloomLevel} ({getCognitiveTier(selectedBloomLevel)})
                  </span>
                  <span className="text-xs text-indigo-600 font-semibold">
                    Standard Assessment Archetypes
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedBloomLevel === 'Remember' &&
                    'Focuses on immediate factual recall, recognition of terms, formulas, and domain rules. Suitable for low-stakes diagnostic checks and formative MCQ quizzes.'}
                  {selectedBloomLevel === 'Understand' &&
                    'Focuses on conceptual interpretation, classifying mechanisms, and paraphrasing in own words. Suitable for scenario discrimination quizzes and diagrammatic explanation assignments.'}
                  {selectedBloomLevel === 'Apply' &&
                    'Focuses on procedural transfer to concrete problems, calculation problem sets, and practical laboratory exercises with step-by-step verification.'}
                  {selectedBloomLevel === 'Analyze' &&
                    'Focuses on deconstructing complex situations, distinguishing root causes from symptoms, and evaluating trade-offs. Measured by case studies with multi-criterion analytic rubrics.'}
                  {selectedBloomLevel === 'Evaluate' &&
                    'Focuses on judging value against rigorous criteria, defending hypotheses under scrutiny, and compliance audits. Measured by formal defenses and expert appraisal rubrics.'}
                  {selectedBloomLevel === 'Create' &&
                    'Focuses on synthesizing knowledge into original functional artifacts, software prototypes, and innovation proposals. Measured by comprehensive capstone milestone project rubrics.'}
                </p>
              </div>

              {/* Archetype Cards for this level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bloomLevelSuggestions.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                          {task.taskType}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Format: {task.format}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{task.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{task.pedagogicalRationale}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Weight: <strong className="text-slate-800">{task.recommendedWeight}%</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyTask(task)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-2xs cursor-pointer flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 100% COURSE BLUEPRINT SUITE */}
          {activeTab === 'full_suite' && (
            <div className="space-y-5">
              {/* Summary Stats Header */}
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Balanced 100% Weightage Verification</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif">
                    Automated Course Assessment Blueprint
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {fullCourseSuite.evidenceSummary}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyBlueprint}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied Markdown!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Blueprint</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAdoptFullSuite}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Adopt Full 100% Assessment Plan</span>
                  </button>
                </div>
              </div>

              {/* Cognitive Balance Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Higher-Order Skills (HOTS)
                  </span>
                  <div className="text-2xl font-bold text-purple-700 mt-0.5">
                    {fullCourseSuite.overallCognitiveBalance.hotsPercent}%
                  </div>
                  <p className="text-[10px] text-slate-500">Analyze, Evaluate, Create</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mid-Order Skills (MOTS)
                  </span>
                  <div className="text-2xl font-bold text-emerald-700 mt-0.5">
                    {fullCourseSuite.overallCognitiveBalance.motsPercent}%
                  </div>
                  <p className="text-[10px] text-slate-500">Apply</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Lower-Order Skills (LOTS)
                  </span>
                  <div className="text-2xl font-bold text-sky-700 mt-0.5">
                    {fullCourseSuite.overallCognitiveBalance.lotsPercent}%
                  </div>
                  <p className="text-[10px] text-slate-500">Remember, Understand</p>
                </div>
              </div>

              {/* Mapping Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Synthesized Assessment Matrix (CLO → Task Mapping)
                  </span>
                  <span className="text-xs font-bold text-indigo-700 font-mono">
                    Total Weight: {fullCourseSuite.totalSuggestedWeight}%
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">CLO</th>
                        <th className="p-3">Cognitive Level</th>
                        <th className="p-3">Recommended Assessment Instrument</th>
                        <th className="p-3">Format / Artifact</th>
                        <th className="p-3 text-center">Marks</th>
                        <th className="p-3 text-center">Weight</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fullCourseSuite.cloMappings.map((m) => (
                        <tr key={m.cloId} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {m.cloCode}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.cognitiveTier === 'HOTS'
                                  ? 'bg-purple-100 text-purple-800'
                                  : m.cognitiveTier === 'MOTS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {m.bloomLevel} ({m.cognitiveTier})
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{m.selectedTask.title}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Type: {m.selectedTask.taskType} ({m.selectedTask.isSummative ? 'Summative' : 'Formative'})
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate" title={m.selectedTask.format}>
                            {m.selectedTask.format}
                          </td>
                          <td className="p-3 text-center font-semibold text-slate-700">
                            {m.selectedTask.recommendedMarks}
                          </td>
                          <td className="p-3 text-center font-bold text-indigo-700 font-mono">
                            {m.selectedTask.recommendedWeight}%
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleApplyTask(m.selectedTask)}
                              className="px-3 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition cursor-pointer"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All tasks automatically sync with course assessments and rubric criteria.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMIZE TASK MODAL DIALOG */}
      {customizingTask && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Customize Assessment Task
              </h3>
              <button
                type="button"
                onClick={() => setCustomizingTask(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Instrument Name
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={customWeight}
                    onChange={(e) => setCustomWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={customMarks}
                    onChange={(e) => setCustomMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Cognitive Target
                </span>
                <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                  {customizingTask.bloomLevel} ({customizingTask.cognitiveTier}) • {customizingTask.format}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCustomizingTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCustomizedAdd}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Add to Assessment Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
