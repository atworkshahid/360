import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Check,
  AlertCircle,
  Layers,
  Target,
  BookOpen,
  Scale,
  ShieldCheck,
  FileText,
  Clock,
  Zap,
  Award,
  TrendingUp,
  Info,
  ExternalLink,
  Flame,
  CheckSquare,
  Square,
  Compass,
} from 'lucide-react';
import { Course } from '../../types';
import {
  calculateCourseProgress,
  calculateAlignmentTimeEstimate,
  STAGE_DEFINITIONS,
  CATEGORY_DEFINITIONS,
  OBE10_STAGE_DEFINITIONS,
  OBE10_CATEGORY_DEFINITIONS,
  StageTimeEstimate,
} from '../../utils/stageProgress';

interface CourseWizardStepperProps {
  course: Course;
  currentStep: number;
  onJumpToStep: (stepNumber: number) => void;
  onToggleCurrentStageCompleted?: (stepNumber?: number) => void;
  onOpenAlignmentAudit?: () => void;
  mode?: 'obe10' | 'granular15';
}

export const CourseWizardStepper: React.FC<CourseWizardStepperProps> = ({
  course,
  currentStep,
  onJumpToStep,
  onToggleCurrentStageCompleted,
  onOpenAlignmentAudit,
  mode = 'obe10',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showTimePopover, setShowTimePopover] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeMode: 'obe10' | 'granular15' = mode === 'granular15' ? 'granular15' : 'obe10';

  // Compute progress and alignment time estimation with active mode
  const timeProgress = calculateAlignmentTimeEstimate(course, activeMode);
  const generalProgress = calculateCourseProgress(course, activeMode);
  const activeCategories = activeMode === 'obe10' ? OBE10_CATEGORY_DEFINITIONS : CATEGORY_DEFINITIONS;

  const currentStageStatus = timeProgress.stageEstimates.find((s) => s.stepNumber === currentStep);
  const isCurrentStageCompleted = currentStageStatus?.isCompleted ?? false;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowTimePopover(false);
      }
    };
    if (showTimePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimePopover]);

  // Filter stages if category filter is active
  const displayedStages = activeCategoryFilter
    ? timeProgress.stageEstimates.filter((s) => {
        const cat = activeCategories.find((c) => c.id === activeCategoryFilter);
        return cat?.steps.includes(s.stepNumber);
      })
    : timeProgress.stageEstimates;

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'obe_framework':
      case 'foundation':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'obe_design':
      case 'outcomes':
        return <Target className="w-3.5 h-3.5" />;
      case 'obe_curriculum':
      case 'modular':
      case 'delivery':
        return <Layers className="w-3.5 h-3.5" />;
      case 'obe_alignment':
      case 'measurement':
        return <Scale className="w-3.5 h-3.5" />;
      case 'obe_governance':
      case 'quality':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  // Milestone color schemes
  const milestoneColorClasses = {
    slate: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      pill: 'bg-slate-50 text-slate-700 border-slate-200',
      bar: 'bg-slate-500',
    },
    amber: {
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      pill: 'bg-amber-50 text-amber-800 border-amber-200',
      bar: 'bg-amber-500',
    },
    blue: {
      badge: 'bg-blue-100 text-blue-900 border-blue-200',
      pill: 'bg-blue-50 text-blue-800 border-blue-200',
      bar: 'bg-blue-500',
    },
    indigo: {
      badge: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      pill: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      bar: 'bg-indigo-600',
    },
    emerald: {
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      bar: 'bg-emerald-600',
    },
  }[timeProgress.motivationalMilestone.color];

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs transition-all relative z-25">
      {/* Primary Visual Progress & Time Estimation Bar (Always Visible) */}
      <div className="px-3 sm:px-6 py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left Side: Completion Metric & Alignment Health */}
        <div className="flex items-center space-x-2.5 sm:space-x-4 flex-wrap gap-y-1">
          {/* Stage Completion Counter */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Stages:
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {timeProgress.completedStagesCount}/{timeProgress.totalStagesCount}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
                Completed
              </span>
            </div>

            {/* Percentage Pill */}
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-extrabold tracking-tight ${
                timeProgress.progressPercentage >= 80
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : timeProgress.progressPercentage >= 40
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {timeProgress.progressPercentage}%
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Constructive Alignment Health Score */}
          <button
            type="button"
            onClick={onOpenAlignmentAudit}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-left group"
            title="Click to inspect Constructive Alignment Audit details"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-700">Health:</span>
            <span
              className={`text-xs font-black ${
                timeProgress.alignmentHealthScore >= 85
                  ? 'text-emerald-700'
                  : timeProgress.alignmentHealthScore >= 60
                  ? 'text-indigo-700'
                  : 'text-amber-700'
              }`}
            >
              {timeProgress.alignmentHealthScore}%
            </span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Time Remaining to Full Alignment Pill with Interactive Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setShowTimePopover(!showTimePopover)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer text-left ${
                timeProgress.isFullyAligned
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 border-indigo-200 hover:border-indigo-300'
              }`}
              title="Click to view time remaining breakdown to reach full alignment"
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  timeProgress.isFullyAligned ? 'text-emerald-600' : 'text-indigo-600 animate-pulse'
                }`}
              />
              <span className="text-xs font-black">
                {timeProgress.isFullyAligned
                  ? 'Full Alignment Achieved! 🏆'
                  : `${timeProgress.formattedRemainingTime} to full alignment`}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-indigo-500 transition-transform ${
                  showTimePopover ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Time Estimation Popover */}
            {showTimePopover && (
              <div className="absolute left-0 mt-1.5 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Remaining Time to Full Alignment
                    </h4>
                  </div>
                  <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {timeProgress.formattedRemainingTime}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mt-2">
                  Estimated effort based on empirical instructional design pacing and current
                  alignment gaps across the 15 stages:
                </p>

                {/* Phase Breakdown List */}
                <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {timeProgress.categoryEstimates.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 text-xs hover:bg-slate-100/80 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">{getCategoryIcon(cat.id)}</span>
                        <span className="font-semibold text-slate-800 text-[11px]">{cat.name}</span>
                        <span className="text-[10px] text-slate-500">
                          ({cat.completedCount}/{cat.totalCount})
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold ${
                          cat.isFullyCompleted
                            ? 'text-emerald-700'
                            : cat.remainingMinutes > 0
                            ? 'text-indigo-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {cat.isFullyCompleted
                          ? 'Done ✓'
                          : cat.remainingMinutes > 0
                          ? `~${cat.remainingMinutes}m`
                          : '0m'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Audit gaps notice */}
                {timeProgress.unresolvedGapsCount > 0 && !timeProgress.isFullyAligned && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-amber-700 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{timeProgress.unresolvedGapsCount} alignment audit gap(s) detected</span>
                    </span>
                    {onOpenAlignmentAudit && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowTimePopover(false);
                          onOpenAlignmentAudit();
                        }}
                        className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        Inspect Audit
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Motivational Encouragement & Quick Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap justify-between lg:justify-end">
          {/* Motivational Milestone Badge */}
          <div
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition ${milestoneColorClasses.badge}`}
            title={timeProgress.motivationalMilestone.message}
          >
            <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[260px]">
              {timeProgress.motivationalMilestone.badge}
            </span>
          </div>

          {/* Jump to Next Incomplete Button */}
          {generalProgress.nextIncompleteStage &&
            generalProgress.nextIncompleteStage !== currentStep && (
              <button
                type="button"
                onClick={() => onJumpToStep(generalProgress.nextIncompleteStage!)}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                title={`Jump to next incomplete stage: Stage ${generalProgress.nextIncompleteStage}`}
              >
                <span>Next Incomplete: Stage {generalProgress.nextIncompleteStage}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

          {/* Quick Mark Stage Completed Checkbox Toggle */}
          {onToggleCurrentStageCompleted && (
            <button
              type="button"
              onClick={() => onToggleCurrentStageCompleted(currentStep)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition cursor-pointer ${
                isCurrentStageCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title={
                isCurrentStageCompleted
                  ? 'Stage marked complete. Click to uncheck.'
                  : 'Mark current stage completed'
              }
            >
              {isCurrentStageCompleted ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {isCurrentStageCompleted ? 'Stage Done' : 'Mark Done'}
              </span>
            </button>
          )}

          {/* Expand/Collapse 15-Stage Roadmap Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
            title={isExpanded ? 'Collapse 15-Stage Roadmap' : 'Expand 15-Stage Roadmap'}
          >
            <span className="hidden sm:inline">
              {isExpanded ? 'Hide Roadmap' : 'View 15 Stages'}
            </span>
            <span className="sm:hidden">{isExpanded ? 'Hide' : 'Stages'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Track Line (Subtle Visual Continuity) */}
      <div className="w-full bg-slate-100 h-1.5 overflow-hidden flex">
        {/* Completed portion */}
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${timeProgress.progressPercentage}%` }}
          title={`${timeProgress.completedStagesCount} of 15 stages completed (${timeProgress.progressPercentage}%)`}
        />
        {/* Current active step indicator */}
        <div
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${Math.max(2, 100 / 15)}%` }}
          title={`Active on Stage ${currentStep}: ${currentStageStatus?.title}`}
        />
      </div>

      {/* Expanded Roadmap Drawer (Rich 15-Stage Interactive Tracker) */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-slate-50/90 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Motivational Milestone Banner */}
          <div className="mb-4 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {timeProgress.motivationalMilestone.title}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {timeProgress.motivationalMilestone.velocityLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {timeProgress.motivationalMilestone.encouragement}
                </p>
              </div>
            </div>

            {/* Pacing summary pill */}
            <div className="flex items-center space-x-3 shrink-0 self-start md:self-center">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Estimated Remaining
                </div>
                <div className="text-xs font-black text-indigo-600">
                  {timeProgress.formattedRemainingTime}
                </div>
              </div>
              {onOpenAlignmentAudit && (
                <button
                  type="button"
                  onClick={onOpenAlignmentAudit}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Inspect Alignment
                </button>
              )}
            </div>
          </div>

          {/* Category Phase Overview Cards */}
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {timeProgress.categoryEstimates.map((cat) => {
              const isFilterActive = activeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setActiveCategoryFilter(activeCategoryFilter === cat.id ? null : cat.id)
                  }
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isFilterActive
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-200'
                      : cat.isFullyCompleted
                      ? 'bg-white hover:bg-emerald-50/60 text-slate-800 border-emerald-200'
                      : 'bg-white hover:bg-slate-100/70 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`p-1 rounded-md ${
                        isFilterActive
                          ? 'bg-white/20 text-white'
                          : cat.isFullyCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {getCategoryIcon(cat.id)}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isFilterActive
                          ? 'text-white'
                          : cat.isFullyCompleted
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {cat.completedCount}/{cat.totalCount} Done
                    </span>
                  </div>

                  <div className="mt-2">
                    <div
                      className={`text-xs font-bold truncate ${
                        isFilterActive ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {cat.name}
                    </div>
                    <div
                      className={`text-[10px] font-medium mt-0.5 ${
                        isFilterActive
                          ? 'text-indigo-100'
                          : cat.isFullyCompleted
                          ? 'text-emerald-600 font-bold'
                          : 'text-indigo-600 font-semibold'
                      }`}
                    >
                      {cat.isFullyCompleted
                        ? 'Done ✓'
                        : cat.remainingMinutes > 0
                        ? `~${cat.remainingMinutes}m left`
                        : 'Aligned'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Filter Clear Bar */}
          {activeCategoryFilter && (
            <div className="flex items-center justify-between mb-3 px-1 text-xs">
              <span className="text-slate-600 font-medium">
                Showing stages for category:{' '}
                <strong className="text-slate-900">
                  {CATEGORY_DEFINITIONS.find((c) => c.id === activeCategoryFilter)?.name}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter(null)}
                className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                Clear Filter (Show All 15)
              </button>
            </div>
          )}

          {/* The 15-Stage Connected Pipeline Nodes */}
          <div className="overflow-x-auto pb-2 pt-1">
            <div className="flex items-center min-w-max space-x-1.5">
              {displayedStages.map((stage, idx) => {
                const isActive = stage.stepNumber === currentStep;
                const isCompleted = stage.isCompleted;
                const formattedNum = stage.stepNumber < 10 ? `0${stage.stepNumber}` : `${stage.stepNumber}`;

                return (
                  <React.Fragment key={stage.stepNumber}>
                    {/* Stage Card Node */}
                    <button
                      type="button"
                      onClick={() => onJumpToStep(stage.stepNumber)}
                      title={`Stage ${stage.stepNumber}: ${stage.title} (${stage.category}) - ${stage.summary} • Estimated: ~${stage.baselineMinutes}m`}
                      className={`group relative flex items-center space-x-2 px-3 py-2 rounded-xl transition cursor-pointer border text-left shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-200 ring-2 ring-indigo-200'
                          : isCompleted
                          ? 'bg-white hover:bg-emerald-50/70 text-slate-800 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200'
                      }`}
                    >
                      {/* Step Indicator Badge */}
                      <div
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'bg-white text-indigo-700'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : formattedNum}
                      </div>

                      {/* Step Text Info */}
                      <div className="flex flex-col pr-1 min-w-[90px] max-w-[130px]">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {stage.title}
                        </span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span
                            className={`text-[9px] font-semibold ${
                              isActive
                                ? 'text-indigo-100'
                                : isCompleted
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {isCompleted
                              ? 'Done ✓'
                              : isActive
                              ? 'Active Stage'
                              : `~${stage.remainingMinutes}m left`}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Connector Line (unless last item) */}
                    {idx < displayedStages.length - 1 && (
                      <div
                        className={`w-2.5 h-0.5 shrink-0 transition-colors ${
                          stage.isCompleted && displayedStages[idx + 1]?.isCompleted
                            ? 'bg-emerald-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
