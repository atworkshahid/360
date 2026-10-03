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
  FileDown,
  Loader2,
  LifeBuoy,
  Wrench,
  Database,
  Code,
  Lightbulb,
  Languages,
  AlertOctagon,
  AlertTriangle,
  Settings,
  SlidersHorizontal,
  FolderOpen,
} from 'lucide-react';
import { Course, CLO } from '../../types';
import { calculateCourseAudit } from '../../utils/obeCalculator';
import { CourseSettingsModal } from '../CourseSettingsModal';
import { CLOBulkEditorModal } from './CLOBulkEditorModal';
import { CourseResourceLibrary } from '../ResourceLibrary/CourseResourceLibrary';
import { getStoredResources } from '../../services/resourceLibraryService';
import { analyzeAssessmentPlan } from '../../utils/assessmentAnalysis';
import { calculateCourseProgress, calculateAlignmentTimeEstimate } from '../../utils/stageProgress';
import { syncWeeklyPlanToModules, syncModulesToWeeklyPlan } from '../../utils/curriculumSynchronizer';
import { evaluateDesignHealth } from '../../utils/designHealth';
import { getUnresolvedCommentsCount, getTotalCommentsCount, COURSE_SECTIONS_META } from '../../utils/commentUtils';
import { ActivityFeed } from './ActivityFeed';
import { FeedbackIntensityMap } from './FeedbackIntensityMap';
import { ReviewLinkModal } from './ReviewLinkModal';
import { getCourseVersions } from '../../services/versionHistoryService';
import { CourseValidationService } from '../../services/courseValidationService';
import { TemplateModal } from '../TemplateModal';
import { AlignmentAnalysisModal } from '../AlignmentAnalysis/AlignmentAnalysisModal';
import { CoursePDFExportModal } from '../CoursePDFExportModal';
import { downloadCoursePDF, exportCourseBlueprintWithGate } from '../../utils/pdfExport';
import { downloadCourseDocx } from '../../utils/docxExport';
import { GoogleDriveSyncModal } from '../GoogleDriveSyncModal';
import { SimpleCourseWizardView } from './SimpleCourseWizardView';
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
import { StudentPerspectiveModal } from './StudentPerspectiveModal';
import { CourseSnapshotsModal } from './CourseSnapshotsModal';
import { AuditTrailModal } from '../Collaboration/AuditTrailModal';
import { BulkImportCLOsModal } from './BulkImportCLOsModal';
import { LMSFormatExportModal } from '../LMSFormatExportModal';
import { ConstructiveAlignmentModal } from '../ConstructiveAlignment/ConstructiveAlignmentModal';
import { SyllabusGeneratorModal } from './SyllabusGeneratorModal';
import { CourseTranslationModal } from './CourseTranslationModal';
import { CourseWizardStepper } from './CourseWizardStepper';
import { DependencyConflictModal } from './DependencyConflictModal';
import { detectDependencyConflicts } from '../../utils/dependencyConflictDetector';
import { ContextualAssistantPanel } from './ContextualAssistantPanel';
import { ObeTipsGuide } from './ObeTipsGuide';
import { FrameworkGuidanceModal } from './FrameworkGuidanceModal';
import { FrameworkCoachBar } from './FrameworkCoachBar';
import { Guidebook } from '../Guidebook';
import { FrameworkGuidebookModal } from '../FrameworkGuidebookModal';
import { FrameworkFieldWarning } from './FrameworkFieldWarning';
import { INITIAL_FRAMEWORKS } from '../../data/frameworksData';
import { getFrameworkGuideline } from '../../data/frameworkGuidelines';
import { downloadFrameworkGuidebookPDF } from '../../utils/frameworkGuidebookPdf';
import {
  CourseService,
  FrameworkDeviationWarning,
  FrameworkContentValidationReport,
} from '../../services/courseService';
import {
  OBEFrameworkRegistry,
  FrameworkValidationResult,
} from '../../utils/OBEFrameworkRegistry';

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
  experienceMode?: 'simple' | 'pro';
  onToggleExperienceMode?: () => void;
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
  experienceMode = 'simple',
  onToggleExperienceMode,
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
  const [isPdfExporting, setIsPdfExporting] = useState<boolean>(false);
  const [bloomsModalOpen, setBloomsModalOpen] = useState<boolean>(false);
  const [rubricGeneratorModalOpen, setRubricGeneratorModalOpen] = useState<boolean>(false);
  const [designHealthOpen, setDesignHealthOpen] = useState<boolean>(false);
  const [isStakeholderView, setIsStakeholderView] = useState<boolean>(false);
  const [snapshotsModalOpen, setSnapshotsModalOpen] = useState<boolean>(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState<boolean>(false);
  const [cloBulkEditorOpen, setCloBulkEditorOpen] = useState<boolean>(false);
  const [lmsModalOpen, setLmsModalOpen] = useState<boolean>(false);
  const [lmsSchemaModalOpen, setLmsSchemaModalOpen] = useState<boolean>(false);
  const [alignmentDashboardOpen, setAlignmentDashboardOpen] = useState<boolean>(false);
  const [syllabusModalOpen, setSyllabusModalOpen] = useState<boolean>(false);
  const [translationModalOpen, setTranslationModalOpen] = useState<boolean>(false);
  const [courseSettingsModalOpen, setCourseSettingsModalOpen] = useState<boolean>(false);
  const [studentPerspectiveModalOpen, setStudentPerspectiveModalOpen] = useState<boolean>(false);
  const [wizardMode, setWizardMode] = useState<'obe10' | 'granular15'>('obe10');
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(() => {
    const saved = localStorage.getItem('obe360_show_tips');
    return saved !== null ? saved === 'true' : true;
  });
  const [openMenu, setOpenMenu] = useState<'actions' | 'audit' | 'tools' | 'export' | 'stakeholderExport' | 'blueprint' | null>(null);
  const [printIndicatorDismissed, setPrintIndicatorDismissed] = useState<boolean>(true);
  const [snapshotsCount, setSnapshotsCount] = useState<number>(() => {
    return course?.id ? getCourseVersions(course.id).length : 0;
  });
  const [activityFeedOpen, setActivityFeedOpen] = useState(false);
  const [reviewLinkModalOpen, setReviewLinkModalOpen] = useState(false);
  const versions = useMemo(() => (course?.id ? getCourseVersions(course.id) : []), [course?.id]);

  // Centralized Course Resource Library State
  const [resourceLibraryOpen, setResourceLibraryOpen] = useState<boolean>(false);
  const [resourceLibraryMode, setResourceLibraryMode] = useState<'modal' | 'drawer'>('modal');
  const [resourceLibraryInitialModule, setResourceLibraryInitialModule] = useState<string | undefined>(undefined);
  const [courseResourcesCount, setCourseResourcesCount] = useState<number>(() => {
    try {
      const stored = getStoredResources();
      return stored.filter((r) => !r.courseId || r.courseId === 'global' || r.courseId === course.id).length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = getStoredResources();
        const count = stored.filter((r) => !r.courseId || r.courseId === 'global' || r.courseId === course.id).length;
        setCourseResourcesCount(count);
      } catch {}
    };
    updateCount();
    window.addEventListener('obe_resources_updated', updateCount);
    return () => window.removeEventListener('obe_resources_updated', updateCount);
  }, [course.id]);

  // Committed OBE Framework Guidance & PDF Guidebook State
  const [frameworkGuidanceOpen, setFrameworkGuidanceOpen] = useState<boolean>(false);
  const [frameworkGuidanceStageKey, setFrameworkGuidanceStageKey] = useState<string>('step_clos');
  const [isDownloadingGuidebook, setIsDownloadingGuidebook] = useState<boolean>(false);
  const [guidebookModalOpen, setGuidebookModalOpen] = useState<boolean>(false);
  const [guidebookSelectedFrameworkId, setGuidebookSelectedFrameworkId] = useState<string>(course?.frameworkId || 'fw-washington-accord');

  // Validate selected accreditation framework ID against OBEFrameworkRegistry on every load
  const frameworkValidation = useMemo<FrameworkValidationResult>(() => {
    return CourseService.validateCourseFramework(course);
  }, [course?.frameworkId, course?.accreditationFramework]);

  // Synchronize framework validation status on course metadata
  useEffect(() => {
    if (
      course &&
      (course.frameworkValidationStatus !== frameworkValidation.status ||
        course.frameworkValidationMessage !== frameworkValidation.message)
    ) {
      onChange({
        ...course,
        frameworkValidationStatus: frameworkValidation.status,
        frameworkValidationMessage: frameworkValidation.message,
      });
    }
  }, [frameworkValidation.status, frameworkValidation.message]);

  // Validate course content against the chosen OBE framework criteria and generate deviation warnings
  const frameworkReport = useMemo<FrameworkContentValidationReport>(() => {
    return CourseService.validateCourseContentAgainstFramework(course);
  }, [course]);

  // Listen to open_framework_guidebook_modal events
  useEffect(() => {
    const handleOpenGuidebookEvent = (e: any) => {
      const fwId = e?.detail?.frameworkId;
      if (fwId) {
        setGuidebookSelectedFrameworkId(fwId);
      } else if (course?.frameworkId) {
        setGuidebookSelectedFrameworkId(course.frameworkId);
      }
      setGuidebookModalOpen(true);
    };
    window.addEventListener('open_framework_guidebook_modal', handleOpenGuidebookEvent);
    return () => window.removeEventListener('open_framework_guidebook_modal', handleOpenGuidebookEvent);
  }, [course?.frameworkId]);

  // Automated Quick-Fix Handler to bring content back into alignment with OBE framework standards
  const handleApplyFrameworkFix = (warning: FrameworkDeviationWarning) => {
    if (!warning.suggestedAction) return;

    if (warning.suggestedAction.type === 'replace_verb' && warning.suggestedAction.targetValue) {
      const rep = warning.suggestedAction.targetValue;
      const updatedClos = (course.clos || []).map((c, i) => {
        if (c.id === warning.cloId || i === warning.cloIndex) {
          let stmt = (c.statement || (c as any).description || '').trim();
          const words = stmt.split(/\s+/);
          if (words.length > 0) {
            words[0] = rep;
            stmt = words.join(' ');
          } else {
            stmt = `${rep} `;
          }
          return {
            ...c,
            statement: stmt,
            bloomVerb: rep,
            status: 'Validated' as const,
          };
        }
        return c;
      });
      onChange({ ...course, clos: updatedClos });
    } else if (warning.suggestedAction.type === 'elevate_bloom') {
      const updatedClos = (course.clos || []).map((c, i) => {
        if (c.id === warning.cloId || i === warning.cloIndex) {
          return {
            ...c,
            bloomLevel: 'Analyze' as const,
            bloomVerb: 'Analyze',
            statement: c.statement ? c.statement.replace(/^\w+/, 'Analyze') : 'Analyze technical system requirements and operational performance',
          };
        }
        return c;
      });
      onChange({ ...course, clos: updatedClos });
    } else if (warning.suggestedAction.type === 'adjust_benchmark') {
      onChange({ ...course, passingBenchmark: warning.suggestedAction.targetValue ?? 60 });
    } else if (warning.suggestedAction.type === 'map_outcome') {
      if (warning.cloId) {
        const targetOutcomeCode = `${frameworkReport.frameworkCode}-SO1`;
        const updatedClos = (course.clos || []).map((c) => {
          if (c.id === warning.cloId) {
            const currentMapped = c.mappedPLOs || [];
            if (!currentMapped.some((m) => m.ploId === targetOutcomeCode)) {
              return {
                ...c,
                mappedPLOs: [...currentMapped, { ploId: targetOutcomeCode, level: 'Substantial' as const }],
              };
            }
          }
          return c;
        });
        const existing = course.ploMapping || {};
        const cloMap = existing[warning.cloId] || {};
        onChange({
          ...course,
          clos: updatedClos,
          ploMapping: {
            ...existing,
            [warning.cloId]: {
              ...cloMap,
              [targetOutcomeCode]: 3,
            },
          },
        });
      }
    }
  };

  const getStageKeyForStep = (stepNum: number, mode: 'obe10' | 'granular15'): string => {
    if (mode === 'obe10') {
      switch (stepNum) {
        case 1:
          return 'step_framework';
        case 2:
          return 'step_course_info';
        case 3:
          return 'step_course_info';
        case 4:
          return 'step_clos';
        case 5:
          return 'step_plo_mapping';
        case 6:
          return 'step_weekly_plan';
        case 7:
          return 'step_weekly_plan';
        case 8:
          return 'step_assessments';
        case 9:
          return 'step_cqi';
        case 10:
          return 'step_cqi';
        default:
          return 'step_clos';
      }
    } else {
      switch (stepNum) {
        case 1:
          return 'step_course_info';
        case 2:
          return 'step_course_info';
        case 3:
          return 'step_clos';
        case 4:
          return 'step_plo_mapping';
        case 5:
          return 'step_weekly_plan';
        case 6:
          return 'step_weekly_plan';
        case 7:
          return 'step_weekly_plan';
        case 8:
          return 'step_weekly_plan';
        case 9:
          return 'step_assessments';
        case 10:
          return 'step_assessments';
        case 11:
          return 'step_rubrics';
        case 12:
          return 'step_assessments';
        case 13:
          return 'step_cqi';
        case 14:
          return 'step_cqi';
        case 15:
          return 'step_cqi';
        default:
          return 'step_clos';
      }
    }
  };

  const handleOpenFrameworkGuidance = (stageKey?: string) => {
    const targetKey = stageKey || getStageKeyForStep(currentStep, wizardMode);
    setFrameworkGuidanceStageKey(targetKey);
    setFrameworkGuidanceOpen(true);
  };

  const handleDownloadGuidebookPDF = () => {
    setIsDownloadingGuidebook(true);
    try {
      const guideline = getFrameworkGuideline(course.frameworkId);
      downloadFrameworkGuidebookPDF({
        frameworkId: course.frameworkId,
        frameworkName: guideline.frameworkName,
        courseTitle: course.title,
        courseCode: course.code,
      });
    } finally {
      setTimeout(() => setIsDownloadingGuidebook(false), 1200);
    }
  };

  const handleToggleTips = () => {
    setShowTips((prev) => {
      const next = !prev;
      localStorage.setItem('obe360_show_tips', String(next));
      window.dispatchEvent(new CustomEvent('obe_tips_toggled', { detail: { showTips: next } }));
      return next;
    });
  };

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

  useEffect(() => {
    const handleOpenTranslation = () => setTranslationModalOpen(true);
    window.addEventListener('open_translation_modal', handleOpenTranslation);
    return () => window.removeEventListener('open_translation_modal', handleOpenTranslation);
  }, []);

  useEffect(() => {
    const handleOpenGuidanceEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ stageKey?: string }>;
      handleOpenFrameworkGuidance(customEv.detail?.stageKey);
    };
    const handleDownloadPdfEvent = () => {
      handleDownloadGuidebookPDF();
    };

    const handleOpenGuidebookEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ frameworkId?: string; stageKey?: string }>;
      if (customEv.detail?.frameworkId) {
        setGuidebookSelectedFrameworkId(customEv.detail.frameworkId);
      }
      if (customEv.detail?.stageKey) {
        setFrameworkGuidanceStageKey(customEv.detail.stageKey);
      }
      setGuidebookModalOpen(true);
    };

    window.addEventListener('open_framework_guidance', handleOpenGuidanceEvent);
    window.addEventListener('download_framework_guidebook_pdf', handleDownloadPdfEvent);
    window.addEventListener('open_framework_guidebook', handleOpenGuidebookEvent);

    return () => {
      window.removeEventListener('open_framework_guidance', handleOpenGuidanceEvent);
      window.removeEventListener('download_framework_guidebook_pdf', handleDownloadPdfEvent);
      window.removeEventListener('open_framework_guidebook', handleOpenGuidebookEvent);
    };
  }, [course?.frameworkId, course?.title, course?.code, currentStep, wizardMode]);

  // Stakeholder Element Comment Drawer State
  const [commentDrawerOpen, setCommentDrawerOpen] = useState<boolean>(false);
  const [commentTargetId, setCommentTargetId] = useState<string | undefined>(undefined);
  const [commentTargetType, setCommentTargetType] = useState<
    'CLO' | 'Assessment' | 'Rubric' | 'Module' | 'General'
  >('General');
  const [commentTargetTitle, setCommentTargetTitle] = useState<string | undefined>(undefined);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [depAuditorModalOpen, setDepAuditorModalOpen] = useState<boolean>(false);

  const auditReport = calculateCourseAudit(course);
  const depAuditReport = useMemo(() => detectDependencyConflicts(course), [course]);
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

  const handleExportPDF = () => {
    setIsPdfExporting(true);
    try {
      exportCourseBlueprintWithGate(course, {}, () => {
        setIsPdfExporting(false);
      });
    } catch (err) {
      console.error('Failed to export PDF blueprint:', err);
    } finally {
      setTimeout(() => setIsPdfExporting(false), 700);
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
              onOpenGuidebook={(fwId) => {
                setGuidebookSelectedFrameworkId(fwId || course.frameworkId || 'fw-washington-accord');
                setGuidebookModalOpen(true);
              }}
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
              frameworkValidationReport={frameworkReport}
              onApplyFrameworkFix={handleApplyFrameworkFix}
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
              onOpenFrameworkGuidance={handleOpenFrameworkGuidance}
              frameworkValidationReport={frameworkReport}
              onApplyFrameworkFix={handleApplyFrameworkFix}
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
              onOpenFrameworkGuidance={handleOpenFrameworkGuidance}
              frameworkValidationReport={frameworkReport}
              onApplyFrameworkFix={handleApplyFrameworkFix}
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
              onOpenFrameworkGuidance={handleOpenFrameworkGuidance}
              frameworkValidationReport={frameworkReport}
              onApplyFrameworkFix={handleApplyFrameworkFix}
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

  if (experienceMode === 'simple') {
    return (
      <SimpleCourseWizardView
        course={course}
        onChange={onChange}
        onNavigateDashboard={onNavigateDashboard}
        onSwitchToProMode={() => {
          if (onToggleExperienceMode) onToggleExperienceMode();
        }}
        onAskCopilot={onAskCopilot}
        onOpenHelpGuide={() => {
          window.dispatchEvent(new CustomEvent('open_layman_guide'));
        }}
      />
    );
  }

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

            {/* Share Link */}
            <button
              type="button"
              id="wizard-share-link-btn"
              onClick={() => setReviewLinkModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* Activity Feed */}
            <button
              type="button"
              id="wizard-activity-feed-btn"
              onClick={() => setActivityFeedOpen(!activityFeedOpen)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                activityFeedOpen
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Activity</span>
            </button>

            {/* Direct Export to PDF */}
            <button
              type="button"
              id="stakeholder-direct-export-pdf-btn"
              onClick={handleExportPDF}
              disabled={isPdfExporting}
              className="px-3 py-1.5 rounded-lg border border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Export printable PDF of current course audit and structure"
            >
              {isPdfExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>{isPdfExporting ? 'Exporting...' : 'Export to PDF'}</span>
            </button>

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
                    Course Blueprints & Documents
                  </div>
                  <button
                    type="button"
                    id="stakeholder-blueprint-pdf-btn"
                    onClick={() => {
                      setOpenMenu(null);
                      handleExportPDF();
                    }}
                    disabled={isPdfExporting}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-800 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        {isPdfExporting ? 'Exporting PDF...' : 'Download Blueprint (PDF)'}
                      </div>
                      <div className="text-[11px] text-slate-500">Print-styled official course blueprint</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    id="stakeholder-blueprint-word-btn"
                    onClick={() => {
                      setOpenMenu(null);
                      handleExportWord();
                    }}
                    disabled={isWordExporting}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-xs text-slate-800 hover:text-blue-900 flex items-start space-x-2.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">
                        {isWordExporting ? 'Exporting Word...' : 'Download Blueprint (Word)'}
                      </div>
                      <div className="text-[11px] text-slate-500">Editable Word document (.docx) with tables</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    id="stakeholder-blueprint-print-btn"
                    onClick={() => {
                      setOpenMenu(null);
                      setPrintFriendlyOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Print-Friendly View</div>
                      <div className="text-[11px] text-slate-500">Live preview with typography & print options</div>
                    </div>
                  </button>
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

            {/* Visual Outcome-Assessment Dependency Conflict Warning Pill */}
            {depAuditReport.totalIssuesCount > 0 && (
              <button
                type="button"
                id="wizard-topbar-dep-conflict-warning"
                onClick={() => setDepAuditorModalOpen(true)}
                className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border shadow-2xs animate-pulse ${
                  depAuditReport.hasCircularDependency
                    ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                }`}
                title="Outcome & Assessment Dependency Conflicts or Cycles detected - Click to review"
              >
                <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>
                  {depAuditReport.hasCircularDependency
                    ? `Circular Deadlock (${depAuditReport.circularIssues.length})`
                    : `Dep Conflict (${depAuditReport.totalIssuesCount})`}
                </span>
              </button>
            )}

            {/* Quick Switch to Simple Layman Mode */}
            {onToggleExperienceMode && (
              <button
                type="button"
                id="pro-wizard-switch-simple-btn"
                onClick={onToggleExperienceMode}
                className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer"
                title="Switch back to Simple Layman Mode"
              >
                <span>🌿 Simple Mode</span>
              </button>
            )}

            {/* Structured Executive Utilities Menu Bar */}
            <div className="wizard-menu-container flex items-center space-x-1.5 sm:space-x-2">
              {/* Student View Button */}
              <button
                type="button"
                onClick={() => setStudentPerspectiveModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                title="Preview course as a student"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                <span>Student View</span>
              </button>
              
              {/* Student View Button */}
              <button
                type="button"
                onClick={() => setStudentPerspectiveModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                title="Preview course as a student"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                <span>Student View</span>
              </button>

              {/* SHARE: Generate Review Link */}
              <button
                type="button"
                id="wizard-header-share-btn"
                onClick={() => setReviewLinkModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                title="Generate a read-only, time-limited review link for collaborators"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                <span>Share</span>
              </button>

              {/* PRIMARY ACTION: Direct Export to PDF (Current Course Audit & Structure) */}
              <button
                type="button"
                id="wizard-header-export-pdf-btn"
                onClick={handleExportPDF}
                disabled={isPdfExporting}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-indigo-600 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
                title="Generate clean, printable PDF of current course audit and structure"
              >
                {isPdfExporting ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                )}
                <span>{isPdfExporting ? 'Exporting PDF...' : 'Export to PDF'}</span>
              </button>

              {/* FORMAT OPTIONS: Download Blueprint (PDF / Word) with Print-Optimized Styles */}
              <div className="relative">
                <button
                  type="button"
                  id="wizard-header-blueprint-btn"
                  onClick={() => setOpenMenu(openMenu === 'blueprint' ? null : 'blueprint')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                    openMenu === 'blueprint'
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-800 shadow-2xs'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs'
                  }`}
                  title="Download print-optimized Course Blueprint as PDF or Word document"
                >
                  <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                  <span>Blueprint</span>
                  <span className="hidden md:inline-block px-1.5 py-0.2 rounded-xs bg-indigo-100 text-indigo-800 text-[9px] font-extrabold uppercase tracking-wider">
                    PDF/Doc
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${openMenu === 'blueprint' ? 'rotate-180' : ''}`} />
                </button>

                {openMenu === 'blueprint' && (
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Course Blueprint Export</span>
                      <span className="text-emerald-700 font-semibold text-[9px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Print-Optimized</span>
                    </div>

                    <button
                      type="button"
                      id="wizard-header-blueprint-pdf-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        handleExportPDF();
                      }}
                      disabled={isPdfExporting}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-800 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <FileDown className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <span>{isPdfExporting ? 'Exporting PDF...' : 'Download Blueprint (PDF)'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Print-styled publication PDF with high-contrast tables</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="wizard-header-blueprint-docx-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        handleExportWord();
                      }}
                      disabled={isWordExporting}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-xs text-slate-800 hover:text-blue-900 flex items-start space-x-2.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <span>{isWordExporting ? 'Exporting Word...' : 'Download Blueprint (Word)'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Editable Word doc (.docx) formatted with clean tables</div>
                      </div>
                    </button>

                    <div className="my-1.5 border-t border-slate-100"></div>

                    <button
                      type="button"
                      id="wizard-header-blueprint-print-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setPrintFriendlyOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Print-Friendly Reading View</div>
                        <div className="text-[11px] text-slate-500">Preview document layout, toggle sections &amp; print</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="wizard-header-blueprint-customize-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setPdfModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Customize Sections &amp; Preview</div>
                        <div className="text-[11px] text-slate-500">Accreditation dossier export modal</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

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

              {/* COURSE SETTINGS: Institutional Logo & Accreditation Branding */}
              <button
                type="button"
                id="wizard-header-course-settings-btn"
                onClick={() => setCourseSettingsModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0"
                title="Course Settings: Upload institutional logo, configure department, and customize accreditation dossier export parameters"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                <span className="hidden sm:inline">Settings</span>
                {course.institutionLogo && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Institutional logo uploaded" />
                )}
              </button>

              {/* COURSE RESOURCE LIBRARY: Centralized documents, syllabi, and rubrics */}
              <button
                type="button"
                id="wizard-header-resource-library-btn"
                onClick={() => {
                  setResourceLibraryInitialModule(undefined);
                  setResourceLibraryMode('modal');
                  setResourceLibraryOpen(true);
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0"
                title="Course Resource Library: Upload, tag, and associate supporting documents (syllabi, rubrics) with course modules"
              >
                <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                <span className="hidden sm:inline">Resources</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-800 text-[10px] font-bold">
                  {courseResourcesCount}
                </span>
              </button>

              {/* Course Section & Module Comments Drawer Trigger */}
              <button
                type="button"
                id="wizard-comments-drawer-btn"
                onClick={() => {
                  const currentSec = COURSE_SECTIONS_META.find((s) => s.stepNumber === currentStep);
                  handleOpenComments(
                    currentSec?.key || `step-${currentStep}`,
                    'General',
                    currentSec ? `Step ${currentStep}: ${currentSec.title}` : `Step ${currentStep}`
                  );
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0"
                title="Section & Module Comments: View feedback threads or leave comments for this section"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                <span className="hidden sm:inline">Comments</span>
                {totalCommentsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                    {totalCommentsCount}
                  </span>
                )}
              </button>

              {/* UNIFIED DROPDOWN: Tools & Review */}
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
                  title="Tools: Bloom's Helper, Rubrics, Alignment Map, Health, Stakeholder View, Revisions, Mode"
                >
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Tools &amp; Review</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === 'tools' ? 'rotate-180' : ''}`} />
                </button>

                {openMenu === 'tools' && (
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 max-h-[82vh] overflow-y-auto">
                    {/* Curriculum Tools */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pedagogical Tools
                    </div>
                    <button
                      type="button"
                      id="wizard-tool-course-settings-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setCourseSettingsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-900">Course Settings &amp; Branding</span>
                          {course.institutionLogo && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              Logo Set
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">Institutional logo, department &amp; PDF options</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-blooms-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setBloomsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Bloom's Taxonomy Helper</div>
                        <div className="text-[11px] text-slate-500">Action verbs &amp; cognitive domain guide</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-rubrics-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setRubricGeneratorModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Rubric Generator</div>
                        <div className="text-[11px] text-slate-500">4-tier analytic criteria for CLOs</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-import-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setBulkImportModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Bulk Import CLOs</div>
                        <div className="text-[11px] text-slate-500">Import outcomes from CSV or text</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-clo-bulk-editor-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setCloBulkEditorOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>CLO Bulk Editor</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                            Reorder / Duplicate / Delete
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">Batch manage and sequence course learning outcomes</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-resource-library-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setResourceLibraryInitialModule(undefined);
                        setResourceLibraryMode('modal');
                        setResourceLibraryOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>Course Resource Library</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                            {courseResourcesCount} Docs
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">Upload, tag, and associate supporting documents with modules</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-translate-course-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setTranslationModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Languages className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-900">Translate Course</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                            Arabic / French / etc.
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">Multilingual OBE localization &amp; RTL support</div>
                      </div>
                    </button>

                    <div className="my-1.5 border-t border-slate-100"></div>

                    {/* Alignment & Audit */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Alignment &amp; Verification
                    </div>
                    <button
                      type="button"
                      id="wizard-tool-alignment-map-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setAlignmentDashboardOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <GitGraph className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Constructive Alignment Map</div>
                        <div className="text-[11px] text-slate-500">Visual node graph from PLOs to Evidence</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-alignment-analysis-btn"
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
                          {flaggedOutcomesCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              {flaggedOutcomesCount} flags
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">Cognitive depth &amp; assessment coverage</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-health-sidebar-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setDesignHealthOpen(!designHealthOpen);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {designHealthOpen ? 'Hide Health Checklist' : 'Show Health Checklist'}
                        </div>
                        <div className="text-[11px] text-slate-500">Live design audit checklist panel</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-audit-trail-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setIsAuditModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Cryptographic Audit Trail</div>
                        <div className="text-[11px] text-slate-500">Dean approvals &amp; digital seals</div>
                      </div>
                    </button>

                    <div className="my-1.5 border-t border-slate-100"></div>

                    {/* Collaboration & History */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Review &amp; History
                    </div>
                    <button
                      type="button"
                      id="wizard-tool-stakeholder-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setIsStakeholderView(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Stakeholder Review View</div>
                        <div className="text-[11px] text-slate-500">Simplified presentation for committees</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-feedback-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        handleOpenComments();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">Discussions &amp; Feedback</span>
                          {totalCommentsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              {totalCommentsCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">Stakeholder commentary on course elements</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-tool-snapshots-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setSnapshotsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <History className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">Snapshots &amp; Revisions</span>
                          {snapshotsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                              {snapshotsCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">View and restore previous versions</div>
                      </div>
                    </button>

                    <div className="my-1.5 border-t border-slate-100"></div>

                    {/* Course Operations */}
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
                        <div className="text-[11px] text-slate-500">Store blueprint as reusable template</div>
                      </div>
                    </button>

                    {/* Workflow Mode Switcher */}
                    <div className="my-1.5 border-t border-slate-100"></div>
                    <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Workflow Mode</span>
                      <span className="text-indigo-600 font-semibold">{wizardMode === 'obe10' ? '10-Step' : '15-Step'}</span>
                    </div>
                    <div className="px-3 py-1 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleWizardMode('obe10')}
                        className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          wizardMode === 'obe10'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        10-Step OBE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleWizardMode('granular15')}
                        className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          wizardMode === 'granular15'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        15-Step Granular
                      </button>
                    </div>

                    {/* Guidance & Tips Mode Toggle */}
                    <div className="my-1.5 border-t border-slate-100"></div>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Guidance &amp; Concept Tips
                    </div>
                    <button
                      type="button"
                      id="wizard-tool-toggle-tips-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        handleToggleTips();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 text-xs text-slate-700 hover:text-amber-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Lightbulb className={`w-4 h-4 mt-0.5 shrink-0 ${showTips ? 'text-amber-500 fill-amber-300' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">Show Concept Tips</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${showTips ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                            {showTips ? 'Active (ON)' : 'Hidden (OFF)'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">Unobtrusive OBE360 concept tooltips for beginners</div>
                      </div>
                    </button>

                    {onDeleteCourse && (
                      <>
                        <div className="my-1.5 border-t border-slate-100"></div>
                        <button
                          type="button"
                          id="wizard-action-delete-btn"
                          onClick={() => {
                            setOpenMenu(null);
                            onDeleteCourse(course.id);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-xs text-rose-600 hover:text-rose-700 flex items-start space-x-2.5 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
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

              {/* OBE Framework Alignment & Deviations Indicator */}
              <button
                type="button"
                id="wizard-framework-deviations-indicator-btn"
                onClick={() => {
                  if (frameworkReport.warnings.length > 0) {
                    const firstWarn = frameworkReport.warnings[0];
                    if (firstWarn.stepNumber) {
                      setCurrentStep(firstWarn.stepNumber);
                    }
                  } else {
                    setGuidebookSelectedFrameworkId(course.frameworkId || 'fw-washington-accord');
                    setGuidebookModalOpen(true);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0 ${
                  frameworkReport.errorsCount > 0
                    ? 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
                    : frameworkReport.warningsCount > 0
                    ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
                title={
                  frameworkReport.warnings.length > 0
                    ? `${frameworkReport.frameworkCode}: ${frameworkReport.warningsCount} deviation(s) detected. Click to navigate to affected field.`
                    : `${frameworkReport.frameworkCode}: 100% compliant with accreditation standards.`
                }
              >
                {frameworkReport.errorsCount > 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : frameworkReport.warningsCount > 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {frameworkReport.frameworkCode}{' '}
                  {frameworkReport.warningsCount > 0
                    ? `${frameworkReport.warningsCount} Deviation${frameworkReport.warningsCount > 1 ? 's' : ''}`
                    : 'Aligned'}
                </span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                    frameworkReport.errorsCount > 0
                      ? 'bg-rose-200 text-rose-900'
                      : frameworkReport.warningsCount > 0
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-emerald-200 text-emerald-950'
                  }`}
                >
                  {frameworkReport.score}%
                </span>
              </button>

              {/* DIRECT BUTTON: OBE Framework Guidebook (PDF) Modal */}
              <button
                type="button"
                id="wizard-guidebook-btn"
                onClick={() => {
                  setGuidebookSelectedFrameworkId(course.frameworkId || 'fw-washington-accord');
                  setGuidebookModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs shrink-0"
                title="Open OBE Accreditation Guidebook & PDF Viewer"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Guidebook (PDF)</span>
                <span className="text-[10px] bg-indigo-200/70 text-indigo-800 px-1 py-0.2 rounded font-mono font-bold">
                  {getFrameworkGuideline(course.frameworkId).frameworkCode}
                </span>
              </button>

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
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Blueprints & Syllabi</span>
                      <span className="text-emerald-700 font-semibold text-[9px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Print-Optimized</span>
                    </div>
                    <button
                      type="button"
                      id="wizard-export-guidebook-pdf-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setGuidebookSelectedFrameworkId(course.frameworkId || 'fw-washington-accord');
                        setGuidebookModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-xs text-indigo-950 flex items-start space-x-2.5 transition cursor-pointer border border-indigo-200/70 mb-1"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>Accreditation Guidebook (PDF)</span>
                          <span className="px-1.5 py-0.2 rounded-xs bg-indigo-600 text-white text-[9px] font-bold">OBE PDF</span>
                        </div>
                        <div className="text-[11px] text-slate-600">Official {getFrameworkGuideline(course.frameworkId).frameworkCode} manual &amp; standards</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-export-blueprint-pdf-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        handleExportPDF();
                      }}
                      disabled={isPdfExporting}
                      className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50/50 hover:bg-indigo-100/70 text-xs text-indigo-950 flex items-start space-x-2.5 transition cursor-pointer border border-indigo-200/50 mb-1 disabled:opacity-50"
                    >
                      <FileDown className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{isPdfExporting ? 'Exporting PDF...' : 'Course Blueprint (PDF)'}</span>
                          <span className="px-1.5 py-0.2 rounded-xs bg-indigo-600 text-white text-[9px] font-bold">PDF</span>
                        </div>
                        <div className="text-[11px] text-slate-600">Print-styled official course blueprint & outcomes</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-export-blueprint-docx-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        handleExportWord();
                      }}
                      disabled={isWordExporting}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <span>{isWordExporting ? 'Exporting Word...' : 'Course Blueprint (Word .docx)'}</span>
                          <span className="px-1.5 py-0.2 rounded-xs bg-blue-100 text-blue-800 text-[9px] font-bold">DOCX</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Editable Word document (.docx) with formatted tables</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="wizard-export-print-view-btn"
                      onClick={() => {
                        setOpenMenu(null);
                        setPrintFriendlyOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Print-Friendly Blueprint View</div>
                        <div className="text-[11px] text-slate-500">Live preview, customizable layout & physical print</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setSyllabusModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <span>Course Syllabus Document</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Generate formatted PDF & Word (.docx) syllabus</div>
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

              {/* OBE FRAMEWORK GUIDELINES POP-UP BUTTON */}
              <button
                type="button"
                id="wizard-framework-guidance-btn"
                onClick={() => handleOpenFrameworkGuidance()}
                className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                title={`Open ${getFrameworkGuideline(course.frameworkId).frameworkCode} Contextual Guidelines & Standards`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline font-mono font-bold">
                  {getFrameworkGuideline(course.frameworkId).frameworkCode}
                </span>
                <span className="hidden md:inline font-medium text-slate-700">Guide</span>
              </button>

              {/* ACCREDITATION GUIDEBOOK (PDF) BUTTON */}
              <button
                type="button"
                id="wizard-framework-guidebook-pdf-btn"
                onClick={handleDownloadGuidebookPDF}
                disabled={isDownloadingGuidebook}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                title="Download complete Accreditation & OBE Frameworks Guidebook in PDF format"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden lg:inline font-medium">
                  {isDownloadingGuidebook ? 'Generating...' : 'Guidebook (PDF)'}
                </span>
                <Download className="w-3 h-3 text-slate-400" />
              </button>

              {/* ALIGNMENT HEALTH PILL */}
              <button
                type="button"
                id="wizard-alignment-health-pill"
                onClick={() => setDesignHealthOpen(!designHealthOpen)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                title="Toggle Live Design Health Checklist"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-slate-600">Health:</span>
                <span className={`font-bold ${auditReport.healthScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {auditReport.healthScore}%
                </span>
              </button>

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
                title="Toggle OBE Advisor & Contextual Guidance"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Advisor</span>
                {validationSummary.issueCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {validationSummary.issueCount}
                  </span>
                )}
              </button>

              {/* SHOW TIPS MODE TOGGLE */}
              <button
                type="button"
                id="wizard-header-tips-toggle-btn"
                onClick={handleToggleTips}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                  showTips
                    ? 'border-amber-300 bg-amber-50/90 text-amber-900 shadow-2xs font-bold'
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
                title={
                  showTips
                    ? 'Tips Mode Active: Click to hide unobtrusive OBE concept tooltips'
                    : 'Enable Tips Mode: Context-aware OBE concepts & guidance for first-time users'
                }
              >
                <Lightbulb className={`w-3.5 h-3.5 ${showTips ? 'text-amber-500 fill-amber-300' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Tips</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                    showTips ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {showTips ? 'ON' : 'OFF'}
                </span>
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

        {/* Prominent Visual Indicator Banner for Missing or Deprecated Framework Documentation */}
        {frameworkValidation.status === 'deprecated' && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-rose-950">
                  Accreditation Framework Deprecated:
                </span>{' '}
                <span className="text-rose-900">
                  The framework '{frameworkValidation.frameworkName}' has been superseded. {frameworkValidation.deprecationReason}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {frameworkValidation.canonicalFrameworkId && (
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...course,
                      frameworkId: frameworkValidation.canonicalFrameworkId,
                      accreditationFramework: frameworkValidation.canonicalFrameworkId,
                    });
                  }}
                  className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                >
                  Upgrade to {frameworkValidation.supersededBy || 'Standard'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setGuidebookSelectedFrameworkId(course.frameworkId || 'fw-washington-accord');
                  setGuidebookModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-md bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 font-semibold text-xs transition cursor-pointer"
              >
                Open Guidebook
              </button>
            </div>
          </div>
        )}

        {frameworkValidation.status === 'missing_docs' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-950">
                  Accreditation Framework Documentation Missing:
                </span>{' '}
                <span className="text-amber-900">
                  This course is not linked to recognized OBE framework criteria. Standardize to ensure compliant graduate attributes.
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
              >
                Select Framework (Step 1)
              </button>
              <button
                type="button"
                onClick={() => {
                  setGuidebookSelectedFrameworkId('fw-washington-accord');
                  setGuidebookModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs transition cursor-pointer"
              >
                Browse Guidebooks
              </button>
            </div>
          </div>
        )}

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

        {activityFeedOpen && (
          <div className="space-y-6">
            <FeedbackIntensityMap course={course} />
            <ActivityFeed versions={versions} comments={course.comments || []} />
          </div>
        )}
        <ReviewLinkModal 
          course={course} 
          isOpen={reviewLinkModalOpen} 
          onClose={() => setReviewLinkModalOpen(false)} 
        />

        {/* Step Content View */}
        <main className="flex-1 p-6 sm:p-8 bg-white min-w-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Print-Optimized Visual Indicator Banner */}
            {!printIndicatorDismissed && (
              <div
                id="print-optimized-indicator-banner"
                className="print:hidden mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-3.5 sm:p-4 text-xs shadow-2xs transition-all animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-bold text-slate-900 text-sm">Print-Optimized Layout</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Print Ready
                      </span>
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                        A4 / US Letter
                      </span>
                      {course.language && course.language !== 'English' ? (
                        <button
                          type="button"
                          onClick={() => setTranslationModalOpen(true)}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 hover:bg-purple-200 text-purple-800 transition cursor-pointer"
                          title="Course is localized. Click to translate or change language."
                        >
                          <Languages className="w-3 h-3 text-purple-600" />
                          <span>{course.language} ({course.textDirection === 'rtl' ? 'RTL' : 'LTR'})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTranslationModalOpen(true)}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                          title="Translate this course into Arabic, French, Spanish, German, etc."
                        >
                          <Languages className="w-3 h-3 text-indigo-600" />
                          <span>Translate Course</span>
                        </button>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5 max-w-2xl">
                      This course specification view is formatted with high-contrast academic typography, strict page-break control, and zero chrome clipping for clean printing and official accreditation filing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    id="print-stage-quick-btn"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                    title="Print current course stage"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  <button
                    type="button"
                    id="print-dossier-quick-btn"
                    onClick={() => setPrintFriendlyOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                    title="Open complete printable accreditation syllabus dossier"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Full Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintIndicatorDismissed(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title="Dismiss indicator banner"
                    aria-label="Dismiss print indicator banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Persistent Committed OBE Framework Guidance & Coach Bar */}
            <FrameworkCoachBar
              course={course}
              currentStageKey={getStageKeyForStep(currentStep, wizardMode)}
              stageName={
                wizardMode === 'obe10'
                  ? OBE10_WIZARD_STEPS[currentStep - 1]?.title || 'Current Stage'
                  : WIZARD_STEPS[currentStep - 1]?.title || 'Current Stage'
              }
              onOpenGuidance={(stageKey) => handleOpenFrameworkGuidance(stageKey)}
              onOpenGuidebook={(stageKey) => {
                setFrameworkGuidanceStageKey(stageKey || getStageKeyForStep(currentStep, wizardMode));
                setGuidebookSelectedFrameworkId(course.frameworkId || 'fw-washington-accord');
                setGuidebookModalOpen(true);
              }}
              className="mb-5"
            />

            {/* Context-Aware OBE360 Concepts Guidance for First-Time Users */}
            <ObeTipsGuide
              currentStep={currentStep}
              wizardMode={wizardMode}
              showTips={showTips}
              onToggleTips={handleToggleTips}
              onOpenBloomsHelper={() => setBloomsModalOpen(true)}
              onOpenAlignmentModal={() => setAlignmentModalOpen(true)}
            />

            {renderCurrentStepComponent()}
          </div>
        </main>

        {/* Contextual Alignment Assistant Panel */}
        <ContextualAssistantPanel
          currentStep={currentStep}
          course={course}
          onChange={onChange}
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

      {/* Course Settings & Institutional Logo Modal */}
      <CourseSettingsModal
        isOpen={courseSettingsModalOpen}
        onClose={() => setCourseSettingsModalOpen(false)}
        course={course}
        onSave={onChange}
        onOpenDossierPreview={() => setPreviewPdfModalOpen(true)}
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

      {/* Student View Modal */}
      <StudentPerspectiveModal
        course={course}
        isOpen={studentPerspectiveModalOpen}
        onClose={() => setStudentPerspectiveModalOpen(false)}
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

      {/* CLO Bulk Editor Modal */}
      <CLOBulkEditorModal
        isOpen={cloBulkEditorOpen}
        onClose={() => setCloBulkEditorOpen(false)}
        clos={course.clos}
        onSave={(updatedCLOs) => {
          onChange({ ...course, clos: updatedCLOs });
        }}
        courseTitle={course.title}
      />

      {/* Centralized Course Resource Library (Modal / Drawer) */}
      <CourseResourceLibrary
        course={course}
        isOpen={resourceLibraryOpen}
        onClose={() => setResourceLibraryOpen(false)}
        onUpdateCourse={onChange}
        mode={resourceLibraryMode}
        initialModuleId={resourceLibraryInitialModule}
      />

      {/* Quick Floating Section & Module Comments Drawer Trigger */}
      <button
        type="button"
        id="wizard-floating-comments-btn"
        onClick={() => {
          const currentSec = COURSE_SECTIONS_META.find((s) => s.stepNumber === currentStep);
          handleOpenComments(
            currentSec?.key || `step-${currentStep}`,
            'General',
            currentSec ? `Step ${currentStep}: ${currentSec.title}` : `Step ${currentStep}`
          );
        }}
        className="fixed right-0 top-[41%] -translate-y-1/2 z-40 bg-amber-600 hover:bg-amber-700 text-white rounded-l-2xl py-3 px-2 shadow-xl border-l border-y border-amber-400 flex flex-col items-center space-y-1.5 transition cursor-pointer group"
        title="Quick Section & Module Feedback (Discussions Drawer)"
      >
        <MessageSquare className="w-4 h-4 text-amber-100 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
          Comments
        </span>
        {totalCommentsCount > 0 && (
          <span className="px-1 py-0.5 rounded-full bg-white text-amber-800 text-[9px] font-extrabold">
            {totalCommentsCount}
          </span>
        )}
      </button>

      {/* Quick Floating Resource Library Drawer Trigger */}
      <button
        type="button"
        id="wizard-floating-resource-library-btn"
        onClick={() => {
          setResourceLibraryInitialModule(undefined);
          setResourceLibraryMode('drawer');
          setResourceLibraryOpen(true);
        }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-l-2xl py-3 px-2 shadow-xl border-l border-y border-indigo-400 flex flex-col items-center space-y-1.5 transition cursor-pointer group"
        title="Quick-access Course Resource Library (Slide-over Drawer)"
      >
        <FolderOpen className="w-4 h-4 text-indigo-100 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
          Resources
        </span>
        <span className="px-1 py-0.5 rounded-full bg-white text-indigo-700 text-[9px] font-extrabold">
          {courseResourcesCount}
        </span>
      </button>

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

      {/* Multilingual Course Translation & Localization Modal */}
      <CourseTranslationModal
        isOpen={translationModalOpen}
        onClose={() => setTranslationModalOpen(false)}
        course={course}
        onCourseUpdated={onChange}
        onCourseCreated={onLoadCourse || onChange}
      />

      {/* Outcome & Assessment Dependency Integrity & Cycle Auditor Modal */}
      <DependencyConflictModal
        course={course}
        isOpen={depAuditorModalOpen}
        onClose={() => setDepAuditorModalOpen(false)}
        onChange={onChange}
        onJumpToStep={handleJumpToStep}
      />

      {/* Contextual OBE Framework Guidance Modal & PDF Guidebook Hub */}
      <FrameworkGuidanceModal
        isOpen={frameworkGuidanceOpen}
        onClose={() => setFrameworkGuidanceOpen(false)}
        course={course}
        currentStageKey={frameworkGuidanceStageKey}
        onSelectActionVerb={(verb) => {
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
              i === 0 ? { ...c, bloomVerb: verb, statement: newStatement } : c
            );
            onChange({ ...course, clos: updatedCLOs });
          }
        }}
      />

      {/* Official OBE Framework PDF Guidebook & Registry Modal */}
      <FrameworkGuidebookModal
        isOpen={guidebookModalOpen}
        onClose={() => setGuidebookModalOpen(false)}
        frameworkId={guidebookSelectedFrameworkId || course.frameworkId || 'fw-washington-accord'}
        course={course}
        initialStageKey={frameworkGuidanceStageKey}
        onNavigateToStep={(stageKey) => {
          const stepMap: Record<string, number> = {
            step_framework: 1,
            step_course_info: 2,
            step_clos: wizardMode === 'obe10' ? 4 : 3,
            step_plo_mapping: wizardMode === 'obe10' ? 5 : 4,
            step_weekly_plan: wizardMode === 'obe10' ? 6 : 5,
            step_assessments: wizardMode === 'obe10' ? 8 : 9,
            step_rubrics: wizardMode === 'obe10' ? 8 : 11,
            step_cqi: wizardMode === 'obe10' ? 10 : 13,
          };
          const targetStep = stepMap[stageKey] || 1;
          handleJumpToStep(targetStep);
        }}
        onAdoptFramework={(fwId) => {
          const fw = INITIAL_FRAMEWORKS.find((f) => f.id === fwId);
          onChange({
            ...course,
            frameworkId: fwId,
            accreditationFramework: fw?.name || fwId,
          });
          setGuidebookSelectedFrameworkId(fwId);
        }}
      />
    </div>
  );
};
