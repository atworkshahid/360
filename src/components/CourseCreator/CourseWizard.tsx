import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  Target,
  FileText,
  HelpCircle,
  Table,
  Scale,
  CheckCircle2,
  ShieldCheck,
  Award,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Brain,
  Activity,
  Eye,
  MessageSquare,
  UploadCloud,
  Share2,
  Printer,
  History,
  GraduationCap,
  Upload,
  FileSpreadsheet,
  GitGraph,
  Clock,
  ChevronDown,
  MoreHorizontal,
  Copy,
  Trash2,
  Download,
  LifeBuoy,
} from 'lucide-react';
import { Course, CLO } from '../../types';
import { calculateCourseAudit } from '../../utils/obeCalculator';
import { analyzeAssessmentPlan } from '../../utils/assessmentAnalysis';
import { calculateCourseProgress, calculateAlignmentTimeEstimate } from '../../utils/stageProgress';
import { syncWeeklyPlanToModules, syncModulesToWeeklyPlan } from '../../utils/curriculumSynchronizer';
import { evaluateDesignHealth } from '../../utils/designHealth';
import { getUnresolvedCommentsCount, getTotalCommentsCount } from '../../utils/commentUtils';
import { getCourseVersions } from '../../services/versionHistoryService';
import { CourseValidationService } from '../../services/courseValidationService';
import { TemplateModal } from '../TemplateModal';
import { AlignmentAnalysisModal } from '../AlignmentAnalysis/AlignmentAnalysisModal';
import { CoursePDFExportModal } from '../CoursePDFExportModal';
import { downloadCourseDocx } from '../../utils/docxExport';
import { GoogleDriveSyncModal } from '../GoogleDriveSyncModal';
import { PDFPreviewModal } from '../PDFPreviewModal';
import { LMSIntegrationModal } from '../LMSIntegrationModal';
import { BloomsTaxonomyHelperModal } from './BloomsTaxonomyHelperModal';
import { DesignHealthSidebar } from './DesignHealthSidebar';
import { AutoSaveIndicator } from '../AutoSaveIndicator';
import { AutoSaveStatus } from '../../hooks/useAutosave';
import { StakeholderView } from './StakeholderView';
import { RubricGeneratorModal } from './RubricGeneratorModal';
import { ElementCommentDrawer } from './comments/ElementCommentDrawer';
import { PrintFriendlyView } from './PrintFriendlyView';
import { CourseSnapshotsModal } from './CourseSnapshotsModal';
import { AuditTrailModal } from '../Collaboration/AuditTrailModal';
import { BulkImportCLOsModal } from './BulkImportCLOsModal';
import { LMSFormatExportModal } from '../LMSFormatExportModal';
import { ConstructiveAlignmentModal } from '../ConstructiveAlignment/ConstructiveAlignmentModal';
import { SyllabusGeneratorModal } from './SyllabusGeneratorModal';
import { CourseWizardStepper } from './CourseWizardStepper';
import { ContextualAssistantPanel } from './ContextualAssistantPanel';

// 10-Step OBE360 Primary Flow Components
import { Step01FrameworkSelection } from './steps/Step01FrameworkSelection';
import { Step02CourseInformation } from './steps/Step02CourseInformation';
import { Step03CoursePurpose } from './steps/Step03CoursePurpose';
import { Step04CLOManager } from './steps/Step04CLOManager';
import { Step05OutcomeMapping } from './steps/Step05OutcomeMapping';
import { Step06WeeklyPlan } from './steps/Step06WeeklyPlan';
import { Step07TeachingActivities } from './steps/Step07TeachingActivities';
import { Step08AssessmentPlan } from './steps/Step08AssessmentPlan';
import { Step09AlignmentCheck } from './steps/Step09AlignmentCheck';
import { Step10ReviewExport as Step10ObeReviewExport } from './steps/Step10ReviewExport';

// Legacy 15-Step Modular Deep-Dive Components
import { Step01CourseSetup } from './steps/Step01CourseSetup';
import { Step02CourseBlueprint } from './steps/Step02CourseBlueprint';
import { Step03CLOCreator } from './steps/Step03CLOCreator';
import { Step04PLOMapping } from './steps/Step04PLOMapping';
import { Step05ModuleCreator } from './steps/Step05ModuleCreator';
import { Step06MLOCreator } from './steps/Step06MLOCreator';
import { Step07LessonCreator } from './steps/Step07LessonCreator';
import { Step08ActivityDesigner } from './steps/Step08ActivityDesigner';
import { Step09AssessmentDesigner } from './steps/Step09AssessmentDesigner';
import { Step10QuestionBuilder } from './steps/Step10QuestionBuilder';
import { Step11RubricBuilder } from './steps/Step11RubricBuilder';
import { Step12EvidenceRules } from './steps/Step12EvidenceRules';
import { Step13AlignmentAuditor } from './steps/Step13AlignmentAuditor';
import { Step14CoursePreview } from './steps/Step14CoursePreview';
import { Step15ReviewExport } from './steps/Step15ReviewExport';

interface CourseWizardProps {
  course: Course;
  onChange: (updatedCourse: Course) => void;
  onNavigateDashboard: () => void;
  onAskCopilot: (prompt: string) => void;
  onLoadCourse?: (course: Course) => void;
  onDuplicateCourse?: (courseId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
  autoSaveStatus?: AutoSaveStatus;
  autoSaveLastSaved?: Date | null;
  autoSaveError?: string | null;
  onSaveNow?: () => void;
}

export interface WizardStepDef {
  number: number;
  title: string;
  category: string;
  badge?: string;
}

export const OBE10_WIZARD_STEPS: WizardStepDef[] = [
  { number: 1, title: 'Framework Selection', category: 'Foundation', badge: 'OBE' },
  { number: 2, title: 'Course Information', category: 'Foundation' },
  { number: 3, title: 'Purpose & Description', category: 'Foundation' },
  { number: 4, title: 'Learning Outcomes (CLOs)', category: 'Outcomes & Mapping', badge: 'Core' },
  { number: 5, title: 'Outcome Mapping', category: 'Outcomes & Mapping', badge: 'Matrix' },
  { number: 6, title: 'Weekly Course Plan', category: 'Instructional Design' },
  { number: 7, title: 'Teaching Activities (TLAs)', category: 'Instructional Design' },
  { number: 8, title: 'Assessment Plan', category: 'Performance Measurement', badge: '100%' },
  { number: 9, title: 'Alignment & Audit', category: 'Accreditation Quality', badge: 'Audit' },
  { number: 10, title: 'Review & Export', category: 'Accreditation Quality', badge: 'Syllabus' },
];

export const WIZARD_STEPS: WizardStepDef[] = [
  { number: 1, title: 'Course Setup', category: 'Foundation' },
  { number: 2, title: 'Course Blueprint', category: 'Foundation' },
  { number: 3, title: 'CLO Creator', category: 'Outcomes & Mapping', badge: 'Core' },
  { number: 4, title: 'CLO-PLO Mapping', category: 'Outcomes & Mapping' },
  { number: 5, title: 'Module Creator', category: 'Modular Architecture' },
  { number: 6, title: 'MLO Creator', category: 'Modular Architecture', badge: 'Granular' },
  { number: 7, title: 'Lesson Creator', category: 'Instructional Delivery' },
  { number: 8, title: 'Activity Designer', category: 'Instructional Delivery' },
  { number: 9, title: 'Assessment Designer', category: 'Performance Measurement', badge: 'Blueprint' },
  { number: 10, title: 'Question Builder', category: 'Performance Measurement' },
  { number: 11, title: 'Rubric Builder', category: 'Performance Measurement' },
  { number: 12, title: 'Evidence Rules', category: 'Accreditation Quality', badge: 'Evidence' },
  { number: 13, title: 'Alignment Audit', category: 'Accreditation Quality', badge: 'Audit' },
  { number: 14, title: 'Course Preview', category: 'Accreditation Quality' },
  { number: 15, title: 'Review & Export', category: 'Accreditation Quality', badge: 'Final' },
];

export const CourseWizard: React.FC<CourseWizardProps> = ({
  course,
  onChange,
  onNavigateDashboard,
  onAskCopilot,
  onLoadCourse,
  onDuplicateCourse,
  onDeleteCourse,
  autoSaveStatus,
  autoSaveLastSaved,
  autoSaveError,
  onSaveNow,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [templateModalMode, setTemplateModalMode] = useState<'save' | 'load'>('save');
  const [alignmentModalOpen, setAlignmentModalOpen] = useState<boolean>(false);
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
  const [previewPdfModalOpen, setPreviewPdfModalOpen] = useState<boolean>(false);
  const [printFriendlyOpen, setPrintFriendlyOpen] = useState<boolean>(false);
  const [driveSyncModalOpen, setDriveSyncModalOpen] = useState<boolean>(false);
  const [driveSyncModalMode, setDriveSyncModalMode] = useState<'sync' | 'share'>('sync');
  const [isWordExporting, setIsWordExporting] = useState<boolean>(false);
  const [bloomsModalOpen, setBloomsModalOpen] = useState<boolean>(false);
  const [rubricGeneratorModalOpen, setRubricGeneratorModalOpen] = useState<boolean>(false);
  const [designHealthOpen, setDesignHealthOpen] = useState<boolean>(true);
  const [isStakeholderView, setIsStakeholderView] = useState<boolean>(false);
  const [snapshotsModalOpen, setSnapshotsModalOpen] = useState<boolean>(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState<boolean>(false);
  const [lmsModalOpen, setLmsModalOpen] = useState<boolean>(false);
  const [lmsSchemaModalOpen, setLmsSchemaModalOpen] = useState<boolean>(false);
  const [alignmentDashboardOpen, setAlignmentDashboardOpen] = useState<boolean>(false);
  const [syllabusModalOpen, setSyllabusModalOpen] = useState<boolean>(false);
  const [wizardMode, setWizardMode] = useState<'obe10' | 'granular15'>('obe10');
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<'actions' | 'audit' | 'tools' | 'export' | 'stakeholderExport' | null>(null);
  const [snapshotsCount, setSnapshotsCount] = useState<number>(() => {
    return course?.id ? getCourseVersions(course.id).length : 0;
  });

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.wizard-menu-container')) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Keep snapshots count in sync with course ID and external saves
  useEffect(() => {
    if (course?.id) {
      setSnapshotsCount(getCourseVersions(course.id).length);
    }
  }, [course?.id]);

  useEffect(() => {
    const handleVersionSaved = (e: any) => {
      if (e.detail?.courseId === course?.id) {
        setSnapshotsCount(getCourseVersions(course.id).length);
      }
    };
    window.addEventListener('course_version_saved', handleVersionSaved);
    return () => window.removeEventListener('course_version_saved', handleVersionSaved);
  }, [course?.id]);

  // Stakeholder Element Comment Drawer State
  const [commentDrawerOpen, setCommentDrawerOpen] = useState<boolean>(false);
  const [commentTargetId, setCommentTargetId] = useState<string | undefined>(undefined);
  const [commentTargetType, setCommentTargetType] = useState<
    'CLO' | 'Assessment' | 'Rubric' | 'Module' | 'General'
  >('General');
  const [commentTargetTitle, setCommentTargetTitle] = useState<string | undefined>(undefined);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const auditReport = calculateCourseAudit(course);
  const assessmentAnalysis = analyzeAssessmentPlan(course);
  const stageProgress = useMemo(() => calculateCourseProgress(course, wizardMode), [course, wizardMode]);
  const alignmentTimeEstimate = useMemo(() => calculateAlignmentTimeEstimate(course, wizardMode), [course, wizardMode]);
  const designHealthAudit = useMemo(() => evaluateDesignHealth(course), [course]);
  const unresolvedCommentsCount = useMemo(
    () => getUnresolvedCommentsCount(course.comments),
    [course.comments]
  );
  const totalCommentsCount = useMemo(
    () => getTotalCommentsCount(course.comments),
    [course.comments]
  );
  const validationSummary = useMemo(
    () => CourseValidationService.validateCourse(course),
    [course]
  );

  const handleOpenComments = (
    targetId?: string,
    targetType?: 'CLO' | 'Assessment' | 'Rubric' | 'Module' | 'General',
    targetTitle?: string
  ) => {
    setCommentTargetId(targetId);
    setCommentTargetType(targetType || 'General');
    setCommentTargetTitle(targetTitle);
    setCommentDrawerOpen(true);
  };

  const flaggedOutcomesCount =
    assessmentAnalysis.overAssessedCLOs.length +
    assessmentAnalysis.underAssessedCLOs.length +
    assessmentAnalysis.cognitiveDeficitCLOs.length +
    assessmentAnalysis.unassessedCLOs.length;

  const activeSteps = wizardMode === 'obe10' ? OBE10_WIZARD_STEPS : WIZARD_STEPS;
  const maxStepCount = activeSteps.length;

  const handleNext = () => {
    if (currentStep < maxStepCount) {
      // Auto-record current step as completed in course state
      const currentCompleted = course.completedStages || [];
      if (!currentCompleted.includes(currentStep)) {
        onChange({
          ...course,
          completedStages: [...currentCompleted, currentStep],
          updatedAt: new Date().toISOString(),
        });
      }
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleCurrentStageCompleted = (stepNumber?: number) => {
    const targetStep = stepNumber ?? currentStep;
    const currentCompleted = course.completedStages || [];
    const isCompleted = currentCompleted.includes(targetStep);
    const newCompleted = isCompleted
      ? currentCompleted.filter((s) => s !== targetStep)
      : [...currentCompleted, targetStep];
    onChange({
      ...course,
      completedStages: newCompleted,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExportWord = async () => {
    setIsWordExporting(true);
    try {
      await downloadCourseDocx(course);
    } catch (err) {
      console.error('Failed to export Word document:', err);
    } finally {
      setIsWordExporting(false);
    }
  };

  const handleJumpToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= maxStepCount) {
      setCurrentStep(stepNumber);
      setMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleWizardMode = (newMode: 'obe10' | 'granular15') => {
    setWizardMode(newMode);
    if (newMode === 'obe10' && currentStep > 10) {
      setCurrentStep(10);
    }
    // Harmonize curriculum structures between 10-step (weeklyPlan) and 15-step (modules)
    if (newMode === 'granular15' && (course.weeklyPlan?.length ?? 0) > 0 && (course.modules?.length ?? 0) === 0) {
      const synced = syncWeeklyPlanToModules(course);
      onChange(synced);
    } else if (newMode === 'obe10' && (course.modules?.length ?? 0) > 0 && (course.weeklyPlan?.length ?? 0) === 0) {
      const synced = syncModulesToWeeklyPlan(course);
      onChange(synced);
    }
  };

  const handleWizardBulkImportCLOs = (importedCLOs: CLO[], mode: 'replace' | 'append') => {
    let updatedCLOs: CLO[];
    if (mode === 'replace') {
      updatedCLOs = importedCLOs;
    } else {
      updatedCLOs = [...course.clos, ...importedCLOs];
    }
    onChange({ ...course, clos: updatedCLOs });
    // If user is currently in initial setup phase, navigate to outcomes step
    const targetStep = wizardMode === 'obe10' ? 4 : 3;
    if (currentStep < targetStep) {
      setCurrentStep(targetStep);
    }
  };

  // Listen for global jump requests (e.g. from Navbar Audit widget)
  useEffect(() => {
    const handleGlobalJump = (e: any) => {
      const step = e.detail?.stepNumber;
      if (typeof step === 'number' && step >= 1 && step <= maxStepCount) {
        handleJumpToStep(step);
      }
    };
    window.addEventListener('wizard_jump_step', handleGlobalJump);
    return () => window.removeEventListener('wizard_jump_step', handleGlobalJump);
  }, [maxStepCount]);

  // Group steps by category
  const categories = Array.from(new Set(activeSteps.map((s) => s.category)));

  // Render Step
  const renderCurrentStepComponent = () => {
    if (wizardMode === 'obe10') {
      switch (currentStep) {
        case 1:
          return (
            <Step01FrameworkSelection
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onAskCopilot={onAskCopilot}
            />
          );
        case 2:
          return (
            <Step02CourseInformation
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
            />
          );
        case 3:
          return (
            <Step03CoursePurpose
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
            />
          );
        case 4:
          return (
            <Step04CLOManager
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
              onOpenComments={handleOpenComments}
            />
          );
        case 5:
          return (
            <Step05OutcomeMapping
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
              onOpenComments={handleOpenComments}
            />
          );
        case 6:
          return (
            <Step06WeeklyPlan
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
              onOpenComments={handleOpenComments}
            />
          );
        case 7:
          return (
            <Step07TeachingActivities
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
              onOpenComments={handleOpenComments}
            />
          );
        case 8:
          return (
            <Step08AssessmentPlan
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
              onOpenComments={handleOpenComments}
            />
          );
        case 9:
          return (
            <Step09AlignmentCheck
              course={course}
              onChange={onChange}
              onNext={handleNext}
              onPrev={handlePrev}
              onAskCopilot={onAskCopilot}
              onJumpToStep={handleJumpToStep}
            />
          );
        case 10:
          return (
            <Step10ObeReviewExport
              course={course}
              onChange={onChange}
              onPrev={handlePrev}
              onOpenSyllabusModal={() => setSyllabusModalOpen(true)}
              onAskCopilot={onAskCopilot}
            />
          );
        default:
          return null;
      }
    }
    switch (currentStep) {
      case 1:
        return (
          <Step01CourseSetup
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onAskCopilot={onAskCopilot}
          />
        );
      case 2:
        return (
          <Step02CourseBlueprint
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
          />
        );
      case 3:
        return (
          <Step03CLOCreator
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
            onOpenComments={handleOpenComments}
          />
        );
      case 4:
        return (
          <Step04PLOMapping
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
            onOpenComments={handleOpenComments}
          />
        );
      case 5:
        return (
          <Step05ModuleCreator
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
            onOpenComments={handleOpenComments}
          />
        );
      case 6:
        return (
          <Step06MLOCreator
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
            onOpenComments={handleOpenComments}
          />
        );
      case 7:
        return (
          <Step07LessonCreator
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
            onOpenComments={handleOpenComments}
          />
        );
      case 8:
        return (
          <Step08ActivityDesigner
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
          />
        );
      case 9:
        return (
          <Step09AssessmentDesigner
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
            onOpenComments={handleOpenComments}
          />
        );
      case 10:
        return (
          <Step10QuestionBuilder
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
          />
        );
      case 11:
        return (
          <Step11RubricBuilder
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
          />
        );
      case 12:
        return (
          <Step12EvidenceRules
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
          />
        );
      case 13:
        return (
          <Step13AlignmentAuditor
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onJumpToStep={handleJumpToStep}
            onAskCopilot={onAskCopilot}
          />
        );
      case 14:
        return (
          <Step14CoursePreview
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
          />
        );
      case 15:
        return (
          <Step15ReviewExport
            course={course}
            onChange={onChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onAskCopilot={onAskCopilot}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f8fafc] flex flex-col">
      {/* Top Wizard Status Bar */}
      {isStakeholderView ? (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-14 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
              <Eye className="w-3.5 h-3.5" />
              Stakeholder Review Mode
            </span>
            <span className="font-bold text-slate-900 text-sm hidden sm:inline truncate max-w-md">
              {course.title || 'Course Curriculum'}
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">• Non-Technical Overview</span>

            {/* Visual Auto-saved indicator with timestamp and popover */}
            {autoSaveStatus && (
              <div className="hidden md:flex items-center pl-2 ml-1 border-l border-slate-200">
                <AutoSaveIndicator
                  status={autoSaveStatus}
                  lastSaved={autoSaveLastSaved ?? null}
                  errorMessage={autoSaveError}
                  onSaveNow={onSaveNow}
                  idPrefix="wizard-bar-autosave-stakeholder"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Mobile Auto-saved indicator */}
            {autoSaveStatus && (
              <div className="md:hidden flex items-center">
                <AutoSaveIndicator
                  status={autoSaveStatus}
                  lastSaved={autoSaveLastSaved ?? null}
                  errorMessage={autoSaveError}
                  onSaveNow={onSaveNow}
                  compact
                  idPrefix="wizard-mobile-autosave-stakeholder"
                />
              </div>
            )}

            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500 mr-2">
              <span>Alignment Health:</span>
              <span
                className={`font-bold ${
                  auditReport.healthScore >= 90
                    ? 'text-emerald-600'
                    : auditReport.healthScore >= 75
                    ? 'text-indigo-600'
                    : 'text-amber-600'
                }`}
              >
                {auditReport.healthScore}%
              </span>
            </div>

            {/* Standardized Export & Share Dropdown for Stakeholder View */}
            <div className="relative wizard-menu-container">
              <button
                type="button"
                id="stakeholder-export-menu-btn"
                onClick={() => setOpenMenu(openMenu === 'stakeholderExport' ? null : 'stakeholderExport')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                  openMenu === 'stakeholderExport'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                }`}
                title="Export & Share options"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export & Share</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'stakeholderExport' ? 'rotate-180' : ''}`} />
              </button>

              {openMenu === 'stakeholderExport' && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Documents & Reports
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setSyllabusModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Course Syllabus Document</div>
                      <div className="text-[11px] text-slate-500">PDF & Word docx formatted syllabus</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setPdfModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Accreditation Audit Report (PDF)</div>
                      <div className="text-[11px] text-slate-500">Full audit report & configuration export</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setPreviewPdfModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Preview PDF In-Browser</div>
                      <div className="text-[11px] text-slate-500">Temporary in-browser visual inspection</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cloud & Collaboration
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setDriveSyncModalMode('sync');
                      setDriveSyncModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Google Drive Sync</div>
                      <div className="text-[11px] text-slate-500">Sync course data to cloud storage</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      setDriveSyncModalMode('share');
                      setDriveSyncModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Share Public Snapshot</div>
                      <div className="text-[11px] text-slate-500">Generate read-only shareable cloud link</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsStakeholderView(false)}
              className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-indigo-200 transition cursor-pointer"
              title="Return to the 15-stage detailed course designer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Designer View</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-2xs">
          <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentStep < 10 ? `0${currentStep}` : currentStep}
              </span>
              <span className="font-bold text-slate-900 text-sm hidden sm:inline">
                Step {currentStep}: {activeSteps[currentStep - 1]?.title}
              </span>
              <span className="text-xs text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Stage {currentStep} of {maxStepCount}</span>

              {/* Visual Auto-saved indicator with timestamp and popover */}
              {autoSaveStatus && (
                <div className="hidden md:flex items-center pl-2 ml-1 border-l border-slate-200">
                  <AutoSaveIndicator
                    status={autoSaveStatus}
                    lastSaved={autoSaveLastSaved ?? null}
                    errorMessage={autoSaveError}
                    onSaveNow={onSaveNow}
                    idPrefix="wizard-bar-autosave"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Auto-saved indicator */}
            {autoSaveStatus && (
              <div className="md:hidden flex items-center">
                <AutoSaveIndicator
                  status={autoSaveStatus}
                  lastSaved={autoSaveLastSaved ?? null}
                  errorMessage={autoSaveError}
                  onSaveNow={onSaveNow}
                  onOpenSnapshots={() => setSnapshotsModalOpen(true)}
                  compact
                  idPrefix="wizard-mobile-autosave"
                />
              </div>
            )}

            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500">
              <span>Overall Alignment:</span>
              <span
                className={`font-bold ${
                  auditReport.healthScore >= 90
                    ? 'text-emerald-600'
                    : auditReport.healthScore >= 75
                    ? 'text-indigo-600'
                    : 'text-amber-600'
                }`}
              >
                {auditReport.healthScore}%
              </span>
            </div>

            {/* Structured Executive Utilities Menu Bar */}
            <div className="wizard-menu-container flex items-center space-x-1.5 sm:space-x-2">
              {/* PRIMARY ACTION: Generate Course Syllabus (High-Value Feature) */}
              <button
                type="button"
                id="wizard-header-syllabus-btn"
                onClick={() => setSyllabusModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-indigo-600 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs shadow-indigo-300 shrink-0"
                title="Generate professional, formatted Course Syllabus document (PDF & Word docx) based on OBE360 course structure"
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>Syllabus</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-xs bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  PDF/Doc
                </span>
              </button>

              {/* DROPDOWN 1: Course Actions (Duplicate, Template, Snapshots, Cloud, Delete) */}
              <div className="relative">
                <button
                  type="button"
                  id="wizard-menu-actions-btn"
                  onClick={() => setOpenMenu(openMenu === 'actions' ? null : 'actions')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                    openMenu === 'actions'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                  title="Course Actions: Duplicate, Template, Snapshots, Cloud Sync, Delete"
                >
                  <MoreHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Actions</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'actions' ? 'rotate-180' : ''}`} />
                </button>

                {openMenu === 'actions' && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Course Management
                    </div>
                    {onDuplicateCourse && (
                      <button
                        type="button"
                        id="wizard-action-duplicate-btn"
                        onClick={() => {
                          setOpenMenu(null);
                          onDuplicateCourse(course.id);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                      >
                        <Copy className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">Duplicate Course</div>
                          <div className="text-[11px] text-slate-500">Clone course into a new draft</div>
                        </div>
                      </button>
                    )}
                    <button
                      type="button"
                      id="wizard-action-template-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setTemplateModalMode('save');
                        setTemplateModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Save as Template</div>
                        <div className="text-[11px] text-slate-500">Store blueprint as reusable OBE template</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-action-snapshots-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setSnapshotsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <History className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">Snapshots & Revisions</span>
                          {snapshotsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                              {snapshotsCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">View and restore previous course states</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-action-drive-sync-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setDriveSyncModalMode('sync');
                        setDriveSyncModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Google Drive Sync</div>
                        <div className="text-[11px] text-slate-500">Sync course data to cloud storage</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-action-share-link-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setDriveSyncModalMode('share');
                        setDriveSyncModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Share Public Link</div>
                        <div className="text-[11px] text-slate-500">Generate read-only cloud share link</div>
                      </div>
                    </button>

                    {onDeleteCourse && (
                      <>
                        <div className="my-1 border-t border-slate-100"></div>
                        <button
                          type="button"
                          id="wizard-action-delete-btn"
                          onClick={() => {
                            setOpenMenu(null);
                            onDeleteCourse(course.id);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-xs text-rose-600 hover:text-rose-700 flex items-start space-x-2.5 transition cursor-pointer group"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 group-hover:text-rose-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold text-rose-700">Delete Course</div>
                            <div className="text-[11px] text-rose-500">Remove course from workspace</div>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* DROPDOWN 2: Audit & Align Menu */}
              <div className="relative">
                <button
                  type="button"
                  id="wizard-menu-audit-btn"
                  onClick={() => setOpenMenu(openMenu === 'audit' ? null : 'audit')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                    openMenu === 'audit'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                  title="Audit, Alignment Graph, and OBE Health Verification"
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Audit & Align</span>
                  {flaggedOutcomesCount > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {flaggedOutcomesCount}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                  <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'audit' ? 'rotate-180' : ''}`} />
                </button>

                {openMenu === 'audit' && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Alignment & Quality Audits
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setAlignmentDashboardOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <GitGraph className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Alignment Map</div>
                        <div className="text-[11px] text-slate-500">Visual node-link graph of CLOs & evidence</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setAlignmentModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Scale className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">Alignment Analysis</span>
                          {flaggedOutcomesCount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              {flaggedOutcomesCount} flags
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Aligned
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">Cognitive depth & assessment coverage audit</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setDesignHealthOpen(!designHealthOpen);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">Design Health Sidebar</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              designHealthAudit.overallScore >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {designHealthAudit.overallScore}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">Toggle persistent health checklist panel</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* DROPDOWN 2: Course Tools Menu */}
              <div className="relative">
                <button
                  type="button"
                  id="wizard-menu-tools-btn"
                  onClick={() => setOpenMenu(openMenu === 'tools' ? null : 'tools')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                    openMenu === 'tools'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                  title="Authoring & Curriculum Tools"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Tools</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'tools' ? 'rotate-180' : ''}`} />
                </button>

                {openMenu === 'tools' && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Authoring & Design Tools
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setBloomsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Brain className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Bloom's Taxonomy Helper</div>
                        <div className="text-[11px] text-slate-500">Action verbs, cognitive domains & suggestions</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setRubricGeneratorModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Rubric Generator</div>
                        <div className="text-[11px] text-slate-500">Analytic & holistic criteria for CLOs</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setBulkImportModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Bulk Import CLOs</div>
                        <div className="text-[11px] text-slate-500">Import outcomes from CSV or text paste</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* DROPDOWN 3: Export & Integrations Menu */}
              <div className="relative">
                <button
                  type="button"
                  id="wizard-menu-export-btn"
                  onClick={() => setOpenMenu(openMenu === 'export' ? null : 'export')}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                    openMenu === 'export'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                  title="Export, Documents & LMS Integrations"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Export & LMS</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'export' ? 'rotate-180' : ''}`} />
                </button>

                {openMenu === 'export' && (
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Documents & Syllabi
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setSyllabusModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-xs text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer border border-indigo-200/60 mb-1"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
                          <span>Course Syllabus Document</span>
                          <span className="px-1.5 py-0.2 rounded-xs bg-indigo-600 text-white text-[9px] font-bold">New</span>
                        </div>
                        <div className="text-[11px] text-indigo-700">Generate formatted PDF & Word (.docx) syllabus</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setPdfModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Accreditation Audit Report (PDF)</div>
                        <div className="text-[11px] text-slate-500">Full audit report & configuration export</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        handleExportWord();
                      }}
                      disabled={isWordExporting}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {isWordExporting ? 'Exporting Word...' : 'Export Course Docx (.docx)'}
                        </div>
                        <div className="text-[11px] text-slate-500">Download formatted Microsoft Word document</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setPrintFriendlyOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Print-Friendly View</div>
                        <div className="text-[11px] text-slate-500">Clean single-page view for physical printing</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setPreviewPdfModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Preview PDF In-Browser</div>
                        <div className="text-[11px] text-slate-500">Preview layout with temporary blob URL</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100"></div>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      LMS & Cloud Integrations
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setLmsSchemaModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 text-xs text-slate-700 hover:text-amber-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">LMS Schemas (Moodle / Blackboard)</div>
                        <div className="text-[11px] text-slate-500">Export CSV / JSON schemas for LMS import</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setLmsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">LMS Deploy & Common Cartridge</div>
                        <div className="text-[11px] text-slate-500">Export .imscc or sync to Canvas / Moodle / LTI</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setDriveSyncModalMode('sync');
                        setDriveSyncModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Google Drive Sync</div>
                        <div className="text-[11px] text-slate-500">Sync course data to cloud storage</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setDriveSyncModalMode('share');
                        setDriveSyncModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Share Public Snapshot</div>
                        <div className="text-[11px] text-slate-500">Generate read-only shareable cloud link</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* MODE SWITCHER: 10-Step OBE360 vs 15-Step Granular */}
              <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  id="wizard-mode-obe10-btn"
                  onClick={() => handleToggleWizardMode('obe10')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    wizardMode === 'obe10'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="10-Step OBE360 Streamlined Accreditation Flow (Recommended)"
                >
                  10-Step OBE
                </button>
                <button
                  type="button"
                  id="wizard-mode-granular15-btn"
                  onClick={() => handleToggleWizardMode('granular15')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    wizardMode === 'granular15'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="15-Step Deep-Dive with granular question & rubric builders"
                >
                  15-Step Deep
                </button>
              </div>

              {/* CONTEXTUAL OBE ADVISOR TOGGLE */}
              <button
                type="button"
                id="wizard-header-assistant-btn"
                onClick={() => setAssistantOpen(!assistantOpen)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                  assistantOpen
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-800 shadow-xs font-bold'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                }`}
                title="Toggle OBE Advisor & Contextual Alignment Guidance"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden xl:inline">OBE Advisor</span>
                {validationSummary.issueCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {validationSummary.issueCount}
                  </span>
                )}
              </button>

              {/* STAKEHOLDER VIEW TOGGLE */}
              <button
                type="button"
                id="wizard-header-stakeholder-btn"
                onClick={() => setIsStakeholderView(true)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                title="Switch to Stakeholder View: Simplified view for non-technical review"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden xl:inline">Stakeholder</span>
              </button>

              {/* FEEDBACK COMMENTS PILL */}
              <button
                type="button"
                id="wizard-header-comments-btn"
                onClick={() => handleOpenComments()}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                  unresolvedCommentsCount > 0
                    ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-2xs'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                }`}
                title="Stakeholder Discussions & Feedback on course elements"
              >
                <MessageSquare
                  className={`w-3.5 h-3.5 ${
                    unresolvedCommentsCount > 0 ? 'text-amber-600' : 'text-indigo-600'
                  }`}
                />
                <span className="hidden xl:inline">Feedback</span>
                {totalCommentsCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      unresolvedCommentsCount > 0
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {unresolvedCommentsCount > 0 ? `${unresolvedCommentsCount}` : totalCommentsCount}
                  </span>
                )}
              </button>

              {/* AUDIT TRAIL & DIGITAL SEALS BUTTON */}
              <button
                type="button"
                id="wizard-header-audit-btn"
                onClick={() => setIsAuditModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                title="Cryptographic Audit Trail, Dean Approvals & Digital Seals"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">Audit Trail</span>
              </button>
            </div>

            {/* Step Navigation Actions */}
            <div className="flex items-center space-x-1.5 pl-1 sm:pl-2 border-l border-slate-200">

              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold flex items-center space-x-1 transition"
                title="Previous Step"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === maxStepCount}
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold flex items-center space-x-1 shadow-sm shadow-indigo-200 transition"
                title="Next Step"
              >
                <span className="hidden sm:inline">Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Progress Tracker & Alignment Time Estimator */}
        <CourseWizardStepper
          course={course}
          currentStep={currentStep}
          onJumpToStep={handleJumpToStep}
          onToggleCurrentStageCompleted={handleToggleCurrentStageCompleted}
          onOpenAlignmentAudit={() => setAlignmentModalOpen(true)}
          mode={wizardMode}
        />
      </div>
    )}

      {/* Main Workspace or Stakeholder View */}
      {isStakeholderView ? (
        <main className="flex-1 bg-slate-50 min-w-0 overflow-y-auto">
          <StakeholderView
            course={course}
            onChange={onChange}
            onExitStakeholderView={() => setIsStakeholderView(false)}
            onOpenPDFExport={() => setPdfModalOpen(true)}
            onOpenComments={handleOpenComments}
          />
        </main>
      ) : (
        <>
          {/* Main Workspace: Left Sidebar + Content */}
          <div className="flex-1 flex w-full">
        {/* Left Wizard Sleek Sidebar - Single Source of Navigation */}
        <aside
          className={`fixed md:sticky top-[6.5rem] z-20 md:z-0 w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-[calc(100vh-6.5rem)] shrink-0 transition-transform ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Navigation Title & Progress Summary */}
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Stages Progress
              </span>
              <span className="text-xs font-black text-indigo-700">
                {stageProgress.completedCount}/{maxStepCount} Done
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${stageProgress.percentage}%` }}
              />
            </div>

            {/* Estimated Remaining Time to Full Alignment */}
            <div className="flex items-center justify-between pt-0.5 text-[11px]">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>To Alignment:</span>
              </span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                {alignmentTimeEstimate.formattedRemainingTime}
              </span>
            </div>

            {/* Quick Toggle for Current Stage Completion */}
            <button
              type="button"
              id="sidebar-toggle-stage-complete-btn"
              onClick={handleToggleCurrentStageCompleted}
              className={`w-full mt-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 border transition cursor-pointer ${
                course.completedStages?.includes(currentStep)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${course.completedStages?.includes(currentStep) ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>
                {course.completedStages?.includes(currentStep)
                  ? `Stage ${currentStep} Marked Done`
                  : `Mark Stage ${currentStep} Done`}
              </span>
            </button>
          </div>

          {/* Steps List */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 space-y-1">
              {activeSteps.map((step) => {
                const isActive = currentStep === step.number;
                const stageStatus = stageProgress.stageStatuses.find((s) => s.stepNumber === step.number);
                const isCompleted = stageStatus?.isCompleted ?? false;
                const formattedNum = step.number < 10 ? `0${step.number}` : `${step.number}`;

                return (
                  <button
                    key={step.number}
                    onClick={() => handleJumpToStep(step.number)}
                    title={`Stage ${step.number}: ${step.title} - ${stageStatus?.summary || ''}`}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition text-left cursor-pointer border ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold border-indigo-700 shadow-sm shadow-indigo-200'
                        : isCompleted
                        ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200/80 font-semibold hover:bg-emerald-100/60'
                        : 'bg-white text-slate-600 border-slate-200/80 font-medium hover:bg-slate-100/80'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : formattedNum}
                    </span>
                    <span className="truncate flex-1 font-sans">{step.title}</span>
                    {step.badge && !isActive && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-semibold uppercase ${
                          isCompleted
                            ? 'bg-emerald-200/60 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {step.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Save Action & Developer Feedback */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                onChange({ ...course, updatedAt: new Date().toISOString() });
              }}
              className="w-full py-2 px-4 bg-slate-100 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              id="wizard-report-issue-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open_feedback_modal', {
                    detail: {
                      category: 'bug',
                      subject: `Feedback on Step ${currentStep} (${
                        wizardMode === 'obe10'
                          ? OBE10_WIZARD_STEPS[currentStep - 1]?.title || 'Step'
                          : WIZARD_STEPS[currentStep - 1]?.title || 'Step'
                      })`,
                    },
                  })
                );
              }}
              className="w-full py-1.5 px-2 flex items-center justify-center space-x-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
              title="Report an issue or question about this step with course telemetry attached"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Report Step Issue</span>
            </button>
          </div>
        </aside>

        {/* Step Content View */}
        <main className="flex-1 p-6 sm:p-8 bg-white min-w-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {renderCurrentStepComponent()}
          </div>
        </main>

        {/* Contextual Alignment Assistant Panel */}
        <ContextualAssistantPanel
          currentStep={currentStep}
          course={course}
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          onJumpToStep={handleJumpToStep}
          onAskCopilot={onAskCopilot}
        />

        {/* Persistent Design Health Checklist Sidebar */}
        <DesignHealthSidebar
          course={course}
          onChange={onChange}
          currentStep={currentStep}
          onJumpToStep={handleJumpToStep}
          onAskCopilot={onAskCopilot}
          onOpenBloomsHelper={() => setBloomsModalOpen(true)}
          isOpen={designHealthOpen}
          onToggleOpen={() => setDesignHealthOpen(!designHealthOpen)}
        />
      </div>
      </>
      )}

      {/* Template Management Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        mode={templateModalMode}
        currentCourse={course}
        onTemplateLoaded={(loadedCourse) => {
          if (onLoadCourse) {
            onLoadCourse(loadedCourse);
          } else {
            onChange(loadedCourse);
          }
        }}
      />

      {/* Alignment Analysis Modal */}
      <AlignmentAnalysisModal
        isOpen={alignmentModalOpen}
        onClose={() => setAlignmentModalOpen(false)}
        course={course}
        onChange={onChange}
        onAskCopilot={onAskCopilot}
        onJumpToStep={handleJumpToStep}
      />

      {/* Course PDF Export Modal */}
      <CoursePDFExportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        course={course}
      />

      {/* Bloom's Taxonomy Helper Modal */}
      <BloomsTaxonomyHelperModal
        isOpen={bloomsModalOpen}
        onClose={() => setBloomsModalOpen(false)}
        selectedLevel={course.clos.length > 0 ? (course.clos[0]?.bloomLevel || 'Analyze') : 'Analyze'}
        targetCLO={course.clos.length > 0 ? course.clos[0] : null}
        onSelectVerb={(verb, level) => {
          if (course.clos.length > 0) {
            const target = course.clos[0];
            let newStatement = target.statement || '';
            const words = newStatement.trim().split(/\s+/);
            if (words.length > 0 && words[0]) {
              words[0] = verb;
              newStatement = words.join(' ');
            } else {
              newStatement = `${verb} `;
            }
            const updatedCLOs = course.clos.map((c, i) =>
              i === 0 ? { ...c, bloomVerb: verb, bloomLevel: level, statement: newStatement } : c
            );
            onChange({ ...course, clos: updatedCLOs });
          }
        }}
        onApplyStem={(stem, level) => {
          if (course.clos.length > 0) {
            const firstWord = stem.split(' ')[0] || 'Analyze';
            const updatedCLOs = course.clos.map((c, i) =>
              i === 0 ? { ...c, bloomVerb: firstWord, bloomLevel: level, statement: stem } : c
            );
            onChange({ ...course, clos: updatedCLOs });
          }
        }}
      />

      {/* Bloom's Aligned Rubric Generator Modal */}
      <RubricGeneratorModal
        isOpen={rubricGeneratorModalOpen}
        onClose={() => setRubricGeneratorModalOpen(false)}
        course={course}
        onChange={onChange}
      />

      {/* Stakeholder Feedback & Element Discussions Drawer */}
      <ElementCommentDrawer
        isOpen={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        course={course}
        onChange={onChange}
        initialTargetId={commentTargetId}
        initialTargetType={commentTargetType}
        initialTargetTitle={commentTargetTitle}
        onNavigateToStep={(stepNumber) => {
          handleJumpToStep(stepNumber);
          setCommentDrawerOpen(false);
          setIsStakeholderView(false);
        }}
      />

      {/* Print-Friendly View (strips away all surrounding UI for physical printing & simplified reading) */}
      {printFriendlyOpen && (
        <PrintFriendlyView
          course={course}
          onClose={() => setPrintFriendlyOpen(false)}
        />
      )}

      {/* Preview PDF Modal (Temporary Blob URL) */}
      <PDFPreviewModal
        isOpen={previewPdfModalOpen}
        onClose={() => setPreviewPdfModalOpen(false)}
        course={course}
        onProceedToDriveSync={() => {
          setPreviewPdfModalOpen(false);
          setDriveSyncModalOpen(true);
        }}
      />

      {/* Google Drive Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={driveSyncModalOpen}
        onClose={() => setDriveSyncModalOpen(false)}
        course={course}
        initialFormat="pdf"
        initialShareable={driveSyncModalMode === 'share'}
        mode={driveSyncModalMode}
      />

      {/* LMS Integration Hub Modal */}
      <LMSIntegrationModal
        course={course}
        isOpen={lmsModalOpen}
        onClose={() => setLmsModalOpen(false)}
        onAskCopilot={onAskCopilot}
      />

      {/* Course Snapshots & Revision History Modal / Side Panel */}
      <CourseSnapshotsModal
        isOpen={snapshotsModalOpen}
        onClose={() => setSnapshotsModalOpen(false)}
        course={course}
        onRestore={(restoredCourse) => {
          if (onLoadCourse) {
            onLoadCourse(restoredCourse);
          } else {
            onChange(restoredCourse);
          }
        }}
      />

      {/* Bulk Import CLOs Modal */}
      <BulkImportCLOsModal
        isOpen={bulkImportModalOpen}
        onClose={() => setBulkImportModalOpen(false)}
        existingCLOs={course.clos}
        availablePLOs={course.plos}
        onImportCLOs={handleWizardBulkImportCLOs}
      />

      {/* LMS Format Export Modal (Standard Moodle & Blackboard CSV & JSON) */}
      <LMSFormatExportModal
        course={course}
        isOpen={lmsSchemaModalOpen}
        onClose={() => setLmsSchemaModalOpen(false)}
      />

      {/* Constructive Alignment Visual Node-Link Mapping Dashboard Modal */}
      <ConstructiveAlignmentModal
        isOpen={alignmentDashboardOpen}
        onClose={() => setAlignmentDashboardOpen(false)}
        course={course}
        onChangeCourse={onChange}
        onAskCopilot={onAskCopilot}
        onJumpToStep={handleJumpToStep}
      />

      {/* Automated Course Syllabus Generator (PDF & Word docx) */}
      <SyllabusGeneratorModal
        isOpen={syllabusModalOpen}
        onClose={() => setSyllabusModalOpen(false)}
        course={course}
      />

      {/* Cryptographic Audit Trail & Governance Digital Seals */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        course={course}
      />
    </div>
  );
};
