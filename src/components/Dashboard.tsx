import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Search,
  Filter,
  GraduationCap,
  Layers,
  Bookmark,
  Scale,
  UploadCloud,
  Download,
  Settings,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  Eye,
  History,
  BarChart3,
  FileSpreadsheet,
  Share2,
  Printer,
  ArrowRight,
  ChevronDown,
  MoreHorizontal,
  LifeBuoy,
  Lock,
  Languages,
  Folder,
  HelpCircle,
  Building2,
  Award,
  Users,
  UserCheck,
} from 'lucide-react';
import { Course, CourseLanguage, UserRole } from '../types';
import { MentiseraLogo, LogoMark } from './Logo';
import { calculateCourseAudit } from '../utils/obeCalculator';
import { downloadCoursesCSV } from '../utils/csvExport';
import { downloadCourseDocx } from '../utils/docxExport';
import { downloadCoursePDF } from '../utils/pdfExport';
import { triggerWithLeadGate, isLeadGateUnlocked } from '../services/leadService';
import { TemplateModal } from './TemplateModal';
import { CourseTemplateGalleryModal } from './CourseTemplateGalleryModal';
import { AlignmentAnalysisModal } from './AlignmentAnalysis/AlignmentAnalysisModal';
import { DashboardAnalyticsView } from './DashboardAnalyticsView';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { AutoSaveStatus } from '../hooks/useAutosave';
import { formatRelativeTime, formatExactTimestamp } from '../utils/timeFormat';
import { DashboardSettingsModal, SettingsTab } from './DashboardSettingsModal';
import { GoogleDriveSyncModal } from './GoogleDriveSyncModal';
import { PDFPreviewModal } from './PDFPreviewModal';
import { LMSIntegrationModal } from './LMSIntegrationModal';
import { PrintFriendlyView } from './CourseCreator/PrintFriendlyView';
import { SyllabusGeneratorModal } from './CourseCreator/SyllabusGeneratorModal';
import { CourseTranslationModal } from './CourseCreator/CourseTranslationModal';
import { ShareCourseModal } from './ShareCourseModal';
import { isGoogleDriveSyncEnabled } from '../services/googleDriveService';
import { ResourceLibraryView } from './ResourceLibrary/ResourceLibraryView';
import { getStoredResources } from '../services/resourceLibraryService';
import { ReviewsView } from './ReviewsView';
import { UsersView } from './UsersView';
import { InstitutionSettingsView } from './InstitutionSettingsView';
import { FrameworksView } from './FrameworksView';
import { CollaborationService } from '../services/collaborationService';
import { getActiveUserRole, setActiveUserRole } from '../data/institutionData';
import { CourseService } from '../services/courseService';
import { OBEFrameworkRegistry, FrameworkValidationResult } from '../utils/OBEFrameworkRegistry';
import { FrameworkGuidebookModal } from './FrameworkGuidebookModal';
import { CourseSettingsModal } from './CourseSettingsModal';
import { LongitudinalBloomTracker } from './Dashboard/LongitudinalBloomTracker';

const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !query.trim() || !text) return <>{text}</>;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          (part || '').toLowerCase() === trimmed.toLowerCase() ? (
            <mark key={index} className="bg-amber-100 text-amber-900 rounded-xs px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
};

interface StatusBadgeInfo {
  label: string;
  badgeClass: string;
  dotClass: string;
  icon: React.ReactNode;
}

const getCourseStatusBadge = (status?: string): StatusBadgeInfo => {
  const norm = (status || 'draft').toLowerCase().trim();

  if (norm === 'approved' || norm === 'published' || norm === 'ready_to_teach') {
    return {
      label: 'Published',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500/15 shadow-2xs',
      dotClass: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
    };
  }

  if (
    norm === 'submitted' ||
    norm === 'ready_for_review' ||
    norm === 'review' ||
    norm === 'under_review' ||
    norm === 'in_review'
  ) {
    return {
      label: 'Review',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200 ring-1 ring-amber-500/15 shadow-2xs',
      dotClass: 'bg-amber-500 animate-pulse',
      icon: <Clock className="w-3 h-3 text-amber-600 shrink-0" />,
    };
  }

  if (norm === 'changes_requested') {
    return {
      label: 'Changes Requested',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 ring-1 ring-rose-500/15 shadow-2xs',
      dotClass: 'bg-rose-500',
      icon: <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />,
    };
  }

  if (norm === 'archived') {
    return {
      label: 'Archived',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 shadow-2xs',
      dotClass: 'bg-slate-400',
      icon: <Layers className="w-3 h-3 text-slate-500 shrink-0" />,
    };
  }

  // Default: Draft
  return {
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/15 shadow-2xs',
    dotClass: 'bg-slate-400',
    icon: <Sparkles className="w-3 h-3 text-slate-500 shrink-0" />,
  };
};

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onCreateCourse: (language?: CourseLanguage) => void;
  onDuplicateCourse: (courseId: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onBulkDeleteCourses?: (courseIds: string[]) => void;
  onLoadTemplate: (templateType: 'law' | 'cs') => void;
  onCourseCreatedFromTemplate?: (newCourse: Course) => void;
  onUpdateCourse?: (updatedCourse: Course) => void;
  onNavigateMarketing?: () => void;
  autoSaveStatus?: AutoSaveStatus;
  autoSaveLastSaved?: Date | null;
  autoSaveError?: string | null;
  onSaveNow?: () => void;
  experienceMode?: 'simple' | 'pro';
  onToggleExperienceMode?: () => void;
  onOpenHelpGuide?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  courses,
  onSelectCourse,
  onCreateCourse,
  onDuplicateCourse,
  onDeleteCourse,
  onBulkDeleteCourses,
  onLoadTemplate,
  onCourseCreatedFromTemplate,
  onUpdateCourse,
  onNavigateMarketing,
  autoSaveStatus,
  autoSaveLastSaved,
  autoSaveError,
  onSaveNow,
  experienceMode = 'simple',
  onToggleExperienceMode,
  onOpenHelpGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'templates'>('all');
  const [dashboardView, setDashboardView] = useState<
    'courses' | 'analytics' | 'resources' | 'reviews' | 'users' | 'institution' | 'frameworks'
  >('courses');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => getActiveUserRole());
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(() => {
    return courses.filter((c) => c.status === 'submitted' || c.status === 'ready_for_review').length;
  });
  const [analyticsCourseId, setAnalyticsCourseId] = useState<string | undefined>(undefined);
  const [resourceCount, setResourceCount] = useState<number>(() => getStoredResources().length);
  const [searchQuery, setSearchQuery] = useState('');

  // Validated accreditation framework results for all loaded courses
  const frameworkValidationMap = React.useMemo(() => {
    const map = new Map<string, FrameworkValidationResult>();
    courses.forEach((c) => {
      map.set(c.id, CourseService.validateCourseFramework(c));
    });
    return map;
  }, [courses]);

  const coursesWithFrameworkIssues = React.useMemo(() => {
    return courses.filter((c) => {
      const v = frameworkValidationMap.get(c.id);
      return v?.status === 'missing_docs' || v?.status === 'deprecated';
    });
  }, [courses, frameworkValidationMap]);

  // Fetch real-time pending approvals count from collaboration service
  useEffect(() => {
    CollaborationService.getApprovalQueue()
      .then((q) => {
        if (q && q.stats) {
          const activePending =
            q.stats.departmentReview +
            q.stats.boardOfStudies +
            q.stats.deanApproval +
            q.stats.accreditationReview;
          setPendingReviewsCount(activePending);
        }
      })
      .catch(() => {
        const count = courses.filter((c) => c.status === 'submitted' || c.status === 'ready_for_review').length;
        setPendingReviewsCount(count);
      });
  }, [courses]);

  // Listen for open_dashboard_tab custom events to seamlessly navigate across views
  useEffect(() => {
    const handleOpenTab = (e: any) => {
      const tab = e?.detail?.tab;
      if (tab) {
        if (
          tab === 'courses' ||
          tab === 'analytics' ||
          tab === 'resources' ||
          tab === 'reviews' ||
          tab === 'users' ||
          tab === 'institution' ||
          tab === 'frameworks'
        ) {
          setDashboardView(tab);
        } else if (
          tab === 'all' ||
          tab === 'draft' ||
          tab === 'submitted' ||
          tab === 'approved' ||
          tab === 'templates'
        ) {
          setDashboardView('courses');
          setActiveTab(tab);
        }
      }
    };
    window.addEventListener('open_dashboard_tab', handleOpenTab);
    return () => window.removeEventListener('open_dashboard_tab', handleOpenTab);
  }, []);

  useEffect(() => {
    const handleResourcesUpdate = (e: any) => {
      setResourceCount(e?.detail?.count ?? getStoredResources().length);
    };
    window.addEventListener('obe_resources_updated', handleResourcesUpdate);
    return () => window.removeEventListener('obe_resources_updated', handleResourcesUpdate);
  }, []);
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState<boolean>(false);
  const [templateModalMode, setTemplateModalMode] = useState<'save' | 'load'>('load');
  const [selectedCourseForTemplate, setSelectedCourseForTemplate] = useState<Course | undefined>(undefined);
  const [alignmentCourse, setAlignmentCourse] = useState<Course | null>(null);
  const [translationCourse, setTranslationCourse] = useState<Course | null>(null);

  useEffect(() => {
    const handleOpenGallery = () => setTemplateGalleryOpen(true);
    window.addEventListener('open_template_gallery', handleOpenGallery);
    return () => window.removeEventListener('open_template_gallery', handleOpenGallery);
  }, []);

  // Bulk Selection State
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState<boolean>(false);

  // Cloud Storage & Settings State
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('history');
  const [settingsCourseId, setSettingsCourseId] = useState<string | undefined>(undefined);
  const [driveEnabled, setDriveEnabled] = useState<boolean>(isGoogleDriveSyncEnabled());
  const [driveModalOpen, setDriveModalOpen] = useState<boolean>(false);
  const [driveModalCourse, setDriveModalCourse] = useState<Course | undefined>(undefined);
  const [driveModalBulkCourses, setDriveModalBulkCourses] = useState<Course[] | undefined>(undefined);
  const [driveModalMode, setDriveModalMode] = useState<'sync' | 'share'>('sync');
  const [driveModalShareable, setDriveModalShareable] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareModalCourse, setShareModalCourse] = useState<Course | null>(null);
  const [previewPdfCourse, setPreviewPdfCourse] = useState<Course | null>(null);
  const [printFriendlyCourse, setPrintFriendlyCourse] = useState<Course | null>(null);
  const [lmsModalOpen, setLmsModalOpen] = useState<boolean>(false);
  const [lmsModalCourse, setLmsModalCourse] = useState<Course | null>(null);
  const [guidebookModalOpen, setGuidebookModalOpen] = useState<boolean>(false);
  const [guidebookModalCourse, setGuidebookModalCourse] = useState<Course | null>(null);
  const [frameworkDocFilter, setFrameworkDocFilter] = useState<'all' | 'issues' | 'missing' | 'deprecated' | 'valid'>('all');

  // Standardized Menu Dropdown States
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const [openHeaderMenu, setOpenHeaderMenu] = useState<'tools' | null>(null);
  const [openBulkExportMenu, setOpenBulkExportMenu] = useState<boolean>(false);
  const [syllabusModalCourse, setSyllabusModalCourse] = useState<Course | null>(null);
  const [courseSettingsTarget, setCourseSettingsTarget] = useState<Course | null>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.dashboard-dropdown-container')) {
        setOpenCardMenuId(null);
        setOpenHeaderMenu(null);
        setOpenBulkExportMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenCardMenuId(null);
        setOpenHeaderMenu(null);
        setOpenBulkExportMenu(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenVersionHistory = (courseId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSettingsCourseId(courseId);
    setSettingsInitialTab('history');
    setSettingsModalOpen(true);
  };

  useEffect(() => {
    setDriveEnabled(isGoogleDriveSyncEnabled());
  }, [settingsModalOpen]);

  const handleToggleSelectCourse = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedCourseIds(new Set());
  };

  const selectedCoursesList = courses.filter((c) => selectedCourseIds.has(c.id));

  const handleBulkExportJSON = () => {
    if (selectedCoursesList.length === 0) return;
    const exportData = {
      app: 'MENTISERA OBE360™',
      exportedAt: new Date().toISOString(),
      count: selectedCoursesList.length,
      courses: selectedCoursesList,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MENTISERA_OBE360_Batch_${selectedCoursesList.length}_Courses_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkExportCSV = () => {
    if (selectedCoursesList.length === 0) return;
    downloadCoursesCSV(
      selectedCoursesList,
      `OBE360_Selected_${selectedCoursesList.length}_Courses_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleExportFilteredCSV = () => {
    const listToExport = filteredCourses.length > 0 ? filteredCourses : courses;
    downloadCoursesCSV(
      listToExport,
      `OBE360_Course_Catalog_${listToExport.length}_Courses_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleExportAllCoursesJSON = () => {
    const exportData = {
      app: 'MENTISERA OBE360™',
      exportedAt: new Date().toISOString(),
      count: courses.length,
      courses,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MENTISERA_OBE360_All_${courses.length}_Courses_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenBulkDriveSync = () => {
    if (selectedCoursesList.length === 0) return;
    setDriveModalBulkCourses(selectedCoursesList);
    setDriveModalCourse(undefined);
    setDriveModalMode('sync');
    setDriveModalShareable(false);
    setDriveModalOpen(true);
  };

  const handleOpenSingleDriveSync = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDriveModalCourse(course);
    setDriveModalBulkCourses(undefined);
    setDriveModalMode('sync');
    setDriveModalShareable(false);
    setDriveModalOpen(true);
  };

  const handleOpenShareModal = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDriveModalCourse(course);
    setDriveModalBulkCourses(undefined);
    setDriveModalMode('share');
    setDriveModalShareable(true);
    setDriveModalOpen(true);
  };

  const handleOpenShareCourseModal = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShareModalCourse(course);
    setShareModalOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    const ids = Array.from(selectedCourseIds);
    if (onBulkDeleteCourses) {
      onBulkDeleteCourses(ids);
    } else {
      ids.forEach((id) => onDeleteCourse(id));
    }
    setSelectedCourseIds(new Set());
    setBulkDeleteModalOpen(false);
  };

  const filteredCourses = courses.filter((c) => {
    // Tab filter
    if (activeTab === 'draft' && c.status !== 'draft') return false;
    if (activeTab === 'submitted' && c.status !== 'submitted' && c.status !== 'ready_for_review') return false;
    if (activeTab === 'approved' && c.status !== 'approved' && (c.status as string) !== 'published') return false;
    if (activeTab === 'templates' && !c.isTemplate) return false;

    // Framework documentation status filter
    if (frameworkDocFilter === 'issues') {
      const v = CourseService.validateCourseFramework(c);
      if (v.status !== 'missing_docs' && v.status !== 'deprecated') return false;
    } else if (frameworkDocFilter === 'missing') {
      const v = CourseService.validateCourseFramework(c);
      if (v.status !== 'missing_docs') return false;
    } else if (frameworkDocFilter === 'deprecated') {
      const v = CourseService.validateCourseFramework(c);
      if (v.status !== 'deprecated') return false;
    } else if (frameworkDocFilter === 'valid') {
      const v = CourseService.validateCourseFramework(c);
      if (v.status !== 'valid') return false;
    }

    // Search filter - keyword search on title, code, description, category, programme
    if (searchQuery.trim()) {
      const rawQ = searchQuery.trim().toLowerCase();
      const normalizedQ = rawQ.replace(/[\s-_]+/g, '');
      const tokens = rawQ.split(/\s+/).filter(Boolean);

      const title = (c.title || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      const normalizedCode = code.replace(/[\s-_]+/g, '');
      const description = (c.description || c.overview || '').toLowerCase();
      const category = (c.category || '').toLowerCase();
      const programme = (c.programme || '').toLowerCase();

      // Direct exact or substring match on title, code, or description
      const directMatch =
        title.includes(rawQ) ||
        code.includes(rawQ) ||
        (normalizedQ.length >= 2 && normalizedCode.includes(normalizedQ)) ||
        description.includes(rawQ) ||
        category.includes(rawQ) ||
        programme.includes(rawQ);

      if (directMatch) return true;

      // Multi-keyword token match (every token matches title, code, description, category, or programme)
      const allTokensMatch = tokens.every((token) => {
        const normToken = token.replace(/[\s-_]+/g, '');
        return (
          title.includes(token) ||
          code.includes(token) ||
          (normToken.length >= 2 && normalizedCode.includes(normToken)) ||
          description.includes(token) ||
          category.includes(token) ||
          programme.includes(token)
        );
      });

      return allTokensMatch;
    }
    return true;
  });

  const totalCourses = courses.length;
  const totalCLOs = courses.reduce((acc, c) => acc + c.clos.length, 0);
  const totalAssessments = courses.reduce((acc, c) => acc + c.assessments.length, 0);
  const averageHealth =
    courses.length > 0
      ? Math.round(courses.reduce((acc, c) => acc + calculateCourseAudit(c).healthScore, 0) / courses.length)
      : 0;

  // Last 3 edited courses for quick workflow resumption
  const recentCourses = React.useMemo(() => {
    if (!courses || courses.length === 0) return [];
    const nonTemplates = courses.filter((c) => !c.isTemplate);
    const pool = nonTemplates.length > 0 ? nonTemplates : courses;
    return [...pool]
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 3);
  }, [courses]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f8fafc] text-slate-900 pb-16">
      {/* Sleek Hero / Banner */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              {experienceMode === 'simple' ? (
                <>
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>🌿 Simple Course Creator • Layman-Friendly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <LogoMark size={36} />
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      Course Creator & Syllabus Builder
                    </h1>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600 max-w-2xl font-normal">
                    Easily draft courses, define clear student goals, organize weekly lessons, and generate beautiful syllabus documents with 1 click.
                  </p>
                  <div className="mt-2.5 flex items-center space-x-2 text-xs text-emerald-700 font-medium">
                    <span className="font-semibold text-slate-900">Simple 4 Steps:</span>
                    <span>1. Course Basics → 2. Learning Goals → 3. Weekly Schedule → 4. Grading & Syllabus PDF</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Single-Purpose Outcome-Based Course Creator</span>
                  </div>
                  <div className="flex items-center space-x-3.5">
                    <LogoMark size={40} />
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                        MENTISERA <span className="text-indigo-600">OBE360™</span>
                      </h1>
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500 max-w-2xl font-normal">
                    Design complete, measurable, constructively aligned courses from Learning Outcomes (CLOs & MLOs) to assessment evidence and rubrics within one guided workspace.
                  </p>
                  <div className="mt-2.5 flex items-center space-x-2 text-xs text-indigo-600 font-medium">
                    <span className="font-semibold text-slate-900">The Core Chain:</span>
                    <span>PLO → CLO → MLO → Lesson → Activity → Assessment → Rubric → Evidence → Achievement</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Primary Action */}
              <button
                type="button"
                id="dashboard-header-create-btn"
                onClick={onCreateCourse}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm shadow-indigo-200 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{experienceMode === 'simple' ? '+ Create New Course (4 Steps)' : 'Create New Course'}</span>
              </button>

              {/* Template Gallery Fast-Track Button */}
              <button
                type="button"
                id="dashboard-browse-templates-btn"
                onClick={() => setTemplateGalleryOpen(true)}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shadow-2xs transition cursor-pointer"
                title="Browse visual course templates across Science, Humanities, Technical & Business"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Templates</span>
              </button>

              {/* Standardized Workspace Tools Dropdown */}
              <div className="relative dashboard-dropdown-container">
                <button
                  type="button"
                  id="dashboard-header-tools-menu-btn"
                  onClick={() => setOpenHeaderMenu(openHeaderMenu === 'tools' ? null : 'tools')}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border font-bold text-xs transition cursor-pointer ${
                    openHeaderMenu === 'tools'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Workspace authoring tools, analytics, history, and LMS integrations"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Workspace Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openHeaderMenu === 'tools' ? 'rotate-180' : ''}`} />
                </button>

                {openHeaderMenu === 'tools' && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Authoring & Blueprints
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenHeaderMenu(null);
                        setTemplateGalleryOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Template Gallery</div>
                        <div className="text-[11px] text-slate-500">Visual Science, Humanities & Technical blueprints</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenHeaderMenu(null);
                        setTemplateModalMode('load');
                        setSelectedCourseForTemplate(undefined);
                        setTemplateModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Load Saved Template</div>
                        <div className="text-[11px] text-slate-500">Create from pre-built OBE blueprint</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100"></div>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Analytics & Quality
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenHeaderMenu(null);
                        setAnalyticsCourseId(undefined);
                        setDashboardView(dashboardView === 'analytics' ? 'courses' : 'analytics');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {dashboardView === 'analytics' ? 'Course Catalog' : 'Alignment Analytics'}
                        </div>
                        <div className="text-[11px] text-slate-500">Cross-course outcome coverage metrics</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenHeaderMenu(null);
                        setDashboardView('resources');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <Folder className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Resource Library ({resourceCount})</div>
                        <div className="text-[11px] text-slate-500">Documents, rubrics & reference links</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenHeaderMenu(null);
                        handleOpenVersionHistory();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <History className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Version History (Last 5 Saves)</div>
                        <div className="text-[11px] text-slate-500">View recent autosave restore checkpoints</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100"></div>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Integrations & Tour
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenHeaderMenu(null);
                        const targetCourse = courses[0];
                        if (targetCourse) {
                          setLmsModalCourse(targetCourse);
                          setLmsModalOpen(true);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">LMS Connectors Hub</div>
                        <div className="text-[11px] text-slate-500">Moodle, Blackboard, Canvas & Cartridge</div>
                      </div>
                    </button>
                    <div className="my-1 border-t border-slate-100"></div>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Developer Support
                    </div>
                    <button
                      type="button"
                      id="dashboard-tools-report-issue-btn"
                      onClick={() => {
                        setOpenHeaderMenu(null);
                        window.dispatchEvent(
                          new CustomEvent('open_feedback_modal', {
                            detail: {
                              category: 'bug',
                              subject: 'Dashboard / Workspace Issue Report',
                            },
                          })
                        );
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-xs text-slate-700 hover:text-rose-900 flex items-start space-x-2.5 transition cursor-pointer"
                    >
                      <LifeBuoy className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">Report Issue / Dev Feedback</div>
                        <div className="text-[11px] text-slate-500">Send bug or query with course telemetry</div>
                      </div>
                    </button>
                    {onNavigateMarketing && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenHeaderMenu(null);
                          onNavigateMarketing();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-xs text-purple-700 hover:text-purple-900 flex items-start space-x-2.5 transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-purple-900">Platform Tour</div>
                          <div className="text-[11px] text-purple-600">Accreditation standards & feature guide</div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Settings & Cloud Utility */}
              <button
                type="button"
                id="dashboard-header-settings-btn"
                onClick={() => {
                  setSettingsInitialTab('cloud');
                  setSettingsModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition cursor-pointer"
                title="Google Drive Cloud Storage & Workspace Settings"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Settings & Cloud</span>
                {driveEnabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Google Drive sync active" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Start Cards for Layman Simple Mode */}
          {experienceMode === 'simple' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onCreateCourse}
                className="text-left bg-gradient-to-br from-indigo-50/80 to-white hover:to-indigo-50/40 p-4 rounded-xl border border-indigo-200 shadow-2xs hover:shadow-xs transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition">
                  Create Course (4 Steps)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Start with a clean slate and build a complete syllabus in minutes.
                </p>
              </button>

              <button
                type="button"
                id="simple-mode-quick-template-gallery-btn"
                onClick={() => setTemplateGalleryOpen(true)}
                className="text-left bg-gradient-to-br from-emerald-50/80 to-white hover:to-emerald-50/40 p-4 rounded-xl border border-emerald-200 shadow-2xs hover:shadow-xs transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Fast Track
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  Browse Template Gallery
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Pick from ready-made visual blueprints for Science, Humanities, Technical & Business.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenHelpGuide) onOpenHelpGuide();
                  else window.dispatchEvent(new CustomEvent('open_layman_guide'));
                }}
                className="text-left bg-gradient-to-br from-amber-50/80 to-white hover:to-amber-50/40 p-4 rounded-xl border border-amber-200 shadow-2xs hover:shadow-xs transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    2 Min Read
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-800 transition">
                  Beginner's 4-Step Guide
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Learn how simple it is to outline goals, schedule weeks, and export.
                </p>
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                setDashboardView('courses');
                setActiveTab('all');
              }}
              className="text-left bg-slate-50 hover:bg-slate-100/80 transition rounded-lg p-3.5 border border-slate-200 cursor-pointer"
            >
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {experienceMode === 'simple' ? 'My Courses' : 'Total Courses'}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalCourses}</p>
            </button>
            <button
              onClick={() => {
                setAnalyticsCourseId(undefined);
                setDashboardView('analytics');
              }}
              className="text-left bg-slate-50 hover:bg-indigo-50/50 transition rounded-lg p-3.5 border border-slate-200 cursor-pointer group"
              title="View learning goals across courses"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-600 transition">
                  {experienceMode === 'simple' ? 'Learning Goals' : 'Formulated CLOs'}
                </p>
                <BarChart3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition" />
              </div>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{totalCLOs}</p>
            </button>
            <button
              onClick={() => {
                setAnalyticsCourseId(undefined);
                setDashboardView('analytics');
              }}
              className="text-left bg-slate-50 hover:bg-indigo-50/50 transition rounded-lg p-3.5 border border-slate-200 cursor-pointer group"
              title="View assignments and quizzes"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-600 transition">
                  {experienceMode === 'simple' ? 'Assignments' : 'Aligned Assessments'}
                </p>
                <BarChart3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition" />
              </div>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{totalAssessments}</p>
            </button>
            <button
              onClick={() => {
                setAnalyticsCourseId(undefined);
                setDashboardView('analytics');
              }}
              className="text-left bg-slate-50 hover:bg-emerald-50/50 transition rounded-lg p-3.5 border border-slate-200 cursor-pointer group"
              title="Inspect syllabus completeness"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-emerald-600 transition">
                  {experienceMode === 'simple' ? 'Syllabus Health' : 'Average OBE Health'}
                </p>
                <ShieldCheck className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{averageHealth}%</p>
            </button>
            <button
              onClick={() => {
                setDashboardView('resources');
              }}
              className={`text-left bg-slate-50 hover:bg-indigo-50/50 transition rounded-lg p-3.5 border border-slate-200 cursor-pointer group ${
                dashboardView === 'resources' ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''
              }`}
              title="Manage course resources, documents and links"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-600 transition">
                  {experienceMode === 'simple' ? 'Course Files' : 'Resource Library'}
                </p>
                <Folder className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition" />
              </div>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{resourceCount}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Recent Activity: Quick Resume Widget */}
        {recentCourses.length > 0 && dashboardView === 'courses' && (
          <div
            id="dashboard-recent-activity-widget"
            className="mb-6 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    Recent Activity
                  </h3>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Quickly resume your last edited courses
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                Last 3 edited courses
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentCourses.map((rc) => {
                const statusBadge = getCourseStatusBadge(rc.status);
                const editedTime = formatRelativeTime(rc.updatedAt || rc.createdAt);
                const exactTime = formatExactTimestamp(rc.updatedAt || rc.createdAt);

                return (
                  <div
                    key={`recent-${rc.id}`}
                    id={`recent-course-card-${rc.id}`}
                    onClick={() => onSelectCourse(rc.id)}
                    className="bg-white rounded-xl border border-slate-200 p-3 hover:border-indigo-400 hover:shadow-xs transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[110px]">
                          {rc.code || 'NO-CODE'}
                        </span>
                        <span
                          className={`inline-flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBadge.dotClass}`} />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>

                      <h4
                        className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1"
                        title={rc.title}
                      >
                        {rc.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-slate-100 text-slate-500">
                      <span
                        className="flex items-center space-x-1 text-slate-500 text-[10px]"
                        title={`Last modified: ${exactTime}`}
                      >
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Edited {editedTime}</span>
                      </span>

                      <span className="text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center space-x-1">
                        <span>Resume</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Courses', count: courses.length, type: 'courses' },
              { id: 'draft', label: 'Draft', count: courses.filter((c) => (c.status || 'draft') === 'draft').length, type: 'courses' },
              { id: 'submitted', label: 'In Review', count: courses.filter((c) => c.status === 'submitted' || c.status === 'ready_for_review').length, type: 'courses' },
              { id: 'approved', label: 'Published', count: courses.filter((c) => c.status === 'approved' || (c.status as string) === 'published').length, type: 'courses' },
              { id: 'templates', label: 'Templates', count: courses.filter((c) => c.isTemplate).length, type: 'courses' },
              { id: 'reviews', label: 'Approval Queue', count: pendingReviewsCount, icon: <ShieldCheck className="w-3.5 h-3.5" />, type: 'view' },
              { id: 'analytics', label: 'CLO Analytics', count: 'Visuals', icon: <BarChart3 className="w-3.5 h-3.5" />, type: 'view' },
              { id: 'frameworks', label: 'Frameworks', count: 'Accords', icon: <Award className="w-3.5 h-3.5" />, type: 'view' },
              { id: 'institution', label: 'Institution', count: 'Model', icon: <Building2 className="w-3.5 h-3.5" />, type: 'view' },
              { id: 'users', label: 'Personnel & Roles', count: 'RBAC', icon: <Users className="w-3.5 h-3.5" />, type: 'view' },
              { id: 'resources', label: 'Resource Library', count: resourceCount, icon: <Folder className="w-3.5 h-3.5" />, type: 'view' },
            ].map((tab) => {
              const isSelected =
                (tab.type === 'view' && dashboardView === tab.id) ||
                (dashboardView === 'courses' && activeTab === tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.type === 'view') {
                      if (tab.id === 'analytics') setAnalyticsCourseId(undefined);
                      setDashboardView(tab.id as any);
                    } else {
                      setDashboardView('courses');
                      setActiveTab(tab.id as any);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {filteredCourses.length > 0 && (
              <>
                <button
                  type="button"
                  id="dashboard-bulk-select-all-btn"
                  onClick={() => {
                    const allFilteredSelected =
                      filteredCourses.length > 0 &&
                      filteredCourses.every((c) => selectedCourseIds.has(c.id));
                    if (allFilteredSelected) {
                      setSelectedCourseIds(new Set());
                    } else {
                      setSelectedCourseIds(new Set(filteredCourses.map((c) => c.id)));
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  title="Select all currently filtered courses"
                >
                  {filteredCourses.length > 0 &&
                  filteredCourses.every((c) => selectedCourseIds.has(c.id)) ? (
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>
                    {filteredCourses.length > 0 &&
                    filteredCourses.every((c) => selectedCourseIds.has(c.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </span>
                </button>

                <button
                  type="button"
                  id="dashboard-export-catalog-csv-btn"
                  onClick={handleExportFilteredCSV}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  title={`Export ${filteredCourses.length} ${
                    filteredCourses.length === 1 ? 'course' : 'courses'
                  } to CSV spreadsheet`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </>
            )}

            {selectedCourseIds.size > 0 && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                {selectedCourseIds.size} selected
              </span>
            )}

            {autoSaveStatus && (
              <AutoSaveIndicator
                status={autoSaveStatus}
                lastSaved={autoSaveLastSaved ?? null}
                errorMessage={autoSaveError}
                onSaveNow={onSaveNow}
                idPrefix="dashboard-filter-autosave"
              />
            )}
            <div className="relative w-full sm:w-80 md:w-96">
              <label htmlFor="dashboard-course-search-input" className="sr-only">
                Search courses by title, code, or description
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="dashboard-course-search-input"
                type="text"
                placeholder="Search by title, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                  }
                }}
                aria-label="Search courses by title, code, or description"
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="dashboard-course-search-clear"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Framework Documentation Status Banner */}
        {dashboardView === 'courses' && coursesWithFrameworkIssues.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/90 border border-amber-200 rounded-xl px-4 py-2.5 my-3 text-xs shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-950">
                  Accreditation Framework Alert:
                </span>{' '}
                <span className="text-amber-900">
                  {coursesWithFrameworkIssues.length}{' '}
                  {coursesWithFrameworkIssues.length === 1 ? 'course requires' : 'courses require'}{' '}
                  framework documentation updates (missing docs or deprecated standards).
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                id="dashboard-filter-framework-issues-btn"
                onClick={() => setFrameworkDocFilter(frameworkDocFilter === 'issues' ? 'all' : 'issues')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                  frameworkDocFilter === 'issues'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <span>{frameworkDocFilter === 'issues' ? 'Show All Courses' : 'Review Framework Issues'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-950">
                  {coursesWithFrameworkIssues.length}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Active Search Filter Banner */}
        {dashboardView === 'courses' && searchQuery.trim() && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 border border-indigo-100 rounded-xl px-4 py-2.5 my-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">
                {filteredCourses.length === 0 ? (
                  <span className="text-amber-700 font-bold">No courses match</span>
                ) : (
                  <span>
                    Showing <strong className="text-indigo-700">{filteredCourses.length}</strong> of{' '}
                    {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                  </span>
                )}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Filtering by title, code, or description:</span>
              <span className="inline-flex items-center space-x-1 font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                <span>"{searchQuery.trim()}"</span>
              </span>
            </div>
            <button
              id="dashboard-clear-search-filter-btn"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear search</span>
            </button>
          </div>
        )}

        {dashboardView === 'reviews' ? (
          <div className="pt-4">
            <ReviewsView
              courses={courses}
              onSelectCourse={onSelectCourse}
              onUpdateCourse={onUpdateCourse || (() => {})}
            />
          </div>
        ) : dashboardView === 'users' ? (
          <div className="pt-4">
            <UsersView
              currentRole={currentRole}
              onRoleChange={(r) => {
                setCurrentRole(r);
                setActiveUserRole(r);
              }}
              onBack={() => setDashboardView('courses')}
            />
          </div>
        ) : dashboardView === 'institution' ? (
          <div className="pt-4">
            <InstitutionSettingsView
              onBack={() => setDashboardView('courses')}
            />
          </div>
        ) : dashboardView === 'frameworks' ? (
          <div className="pt-4">
            <FrameworksView
              onBack={() => setDashboardView('courses')}
            />
          </div>
        ) : dashboardView === 'resources' ? (
          <div className="pt-6">
            <ResourceLibraryView
              courses={courses}
              onNavigateCourses={() => setDashboardView('courses')}
              onSelectCourse={onSelectCourse}
            />
          </div>
        ) : dashboardView === 'analytics' ? (
          <div className="pt-6">
            <DashboardAnalyticsView
              courses={courses}
              onSelectCourse={onSelectCourse}
              onBackToCourses={() => setDashboardView('courses')}
              initialSelectedCourseId={analyticsCourseId}
            />
          </div>
        ) : (
          <>
            {/* Quick Template Starters if empty or on templates tab */}
            {(activeTab === 'templates' || (filteredCourses.length === 0 && !searchQuery.trim())) && (
          <div className="my-6 p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Standard OBE Course Blueprints & Curricular Templates</span>
            </div>
            <p className="text-xs text-indigo-800 mb-4 max-w-3xl">
              Jumpstart your instructional design with fully populated outcome-aligned course blueprints compliant with international OBE accreditation frameworks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onLoadTemplate('law')}
                className="p-4 bg-white rounded-xl border border-indigo-200/80 hover:border-indigo-400 hover:shadow-sm text-left transition flex items-start space-x-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                  LAW
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition">
                    Constitutional Law & Federal Governance (Pakistan)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    4 CLOs, 7 MLOs, Article 143 Repugnancy analysis, Council of Common Interests moot simulation, multi-tier rubrics & MCQs.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onLoadTemplate('cs')}
                className="p-4 bg-white rounded-xl border border-indigo-200/80 hover:border-indigo-400 hover:shadow-sm text-left transition flex items-start space-x-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                  CS
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition">
                    Data Structures & Algorithmic Problem Solving
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    Asymptotic analysis (Big-O), balanced AVL trees, graph traversals, unit-tested coding benchmarks, dynamic programming.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Longitudinal Bloom's Tracker */}
        {dashboardView === 'courses' && activeTab === 'all' && (
          <LongitudinalBloomTracker courses={courses} className="mt-6" />
        )}

        {/* Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCourses.map((course) => {
              const audit = calculateCourseAudit(course);
              const fwValidation = frameworkValidationMap.get(course.id) || CourseService.validateCourseFramework(course);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header: Code, Selection & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.has(course.id)}
                          onChange={(e) => handleToggleSelectCourse(course.id, e as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          title="Select course for bulk action"
                        />
                        <span
                          className={`text-[11px] font-bold tracking-wider px-2 py-0.5 rounded border ${
                            searchQuery.trim() &&
                            (course.code || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
                              ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <HighlightMatch text={course.code || 'NO-CODE'} query={searchQuery} />
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-wrap justify-end gap-y-1">
                        {/* Framework Validation Indicator */}
                        {fwValidation.status === 'deprecated' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuidebookModalCourse(course);
                              setGuidebookModalOpen(true);
                            }}
                            title={`Framework Deprecated: ${fwValidation.message}. Click to view Guidebook.`}
                            className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs hover:bg-rose-100 transition cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Deprecated ({fwValidation.frameworkCode})</span>
                          </button>
                        ) : fwValidation.status === 'missing_docs' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuidebookModalCourse(course);
                              setGuidebookModalOpen(true);
                            }}
                            title={`Missing Framework Documentation: ${fwValidation.message}. Click to view Guidebook.`}
                            className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs hover:bg-amber-100 transition cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Docs Missing</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuidebookModalCourse(course);
                              setGuidebookModalOpen(true);
                            }}
                            title={`Accreditation Framework: ${fwValidation.frameworkCode} (${fwValidation.frameworkName}). Click to view official PDF Guidebook.`}
                            className="inline-flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{fwValidation.frameworkCode}</span>
                          </button>
                        )}

                        {course.language && course.language !== 'English' && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              course.textDirection === 'rtl'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                            title={`Language: ${course.language} (${(course.textDirection || 'ltr').toUpperCase()})`}
                          >
                            {course.language} ({(course.textDirection || 'ltr').toUpperCase()})
                          </span>
                        )}
                        {course.isTemplate && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Template
                          </span>
                        )}
                        {(() => {
                          const statusBadge = getCourseStatusBadge(course.status);
                          return (
                            <span
                              id={`course-card-status-badge-${course.id}`}
                              className={`inline-flex items-center space-x-1.5 text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full border transition ${statusBadge.badgeClass}`}
                              title={`Workflow Status: ${statusBadge.label}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBadge.dotClass}`} />
                              <span>{statusBadge.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3
                      id={`course-card-title-${course.id}`}
                      onClick={() => onSelectCourse(course.id)}
                      className="text-base font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer line-clamp-2 transition"
                    >
                      <HighlightMatch text={course.title} query={searchQuery} />
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      <HighlightMatch
                        text={course.description || course.overview || 'No description provided.'}
                        query={searchQuery}
                      />
                    </p>

                    {/* Visual Indicator Banner for Missing or Deprecated Framework Documentation */}
                    {fwValidation.status === 'deprecated' && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setGuidebookModalCourse(course);
                          setGuidebookModalOpen(true);
                        }}
                        className="mt-3 px-2.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-1.5 cursor-pointer hover:bg-rose-100 transition shadow-2xs"
                        title={fwValidation.message}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-[11px] block leading-tight">
                              Framework Deprecated: {fwValidation.frameworkCode}
                            </span>
                            <span className="text-[10px] text-rose-700 block truncate">
                              {fwValidation.deprecationReason || `Superseded by ${fwValidation.supersededBy || 'standard'}`}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300 shrink-0 hover:bg-rose-50">
                          Guidebook &rarr;
                        </span>
                      </div>
                    )}
                    {fwValidation.status === 'missing_docs' && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setGuidebookModalCourse(course);
                          setGuidebookModalOpen(true);
                        }}
                        className="mt-3 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-1.5 cursor-pointer hover:bg-amber-100 transition shadow-2xs"
                        title={fwValidation.message}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-[11px] block leading-tight">
                              Framework Documentation Missing
                            </span>
                            <span className="text-[10px] text-amber-800 block truncate">
                              No recognized OBE standards criteria linked
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300 shrink-0 hover:bg-amber-50">
                          Assign &rarr;
                        </span>
                      </div>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {course.programme || 'General Degree'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {course.creditHours} Credits
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {course.modulesCount || course.modules.length} Modules
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {course.deliveryMode}
                      </span>
                    </div>

                    {/* Metrics Section: Simple vs Pro */}
                    {experienceMode === 'simple' ? (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100">
                          <span className="text-[10px] text-emerald-700 block font-bold uppercase">Goals</span>
                          <span className="text-xs font-bold text-slate-800">{course.clos?.length || 0} Goals</span>
                        </div>
                        <div className="bg-indigo-50/70 p-1.5 rounded-lg border border-indigo-100">
                          <span className="text-[10px] text-indigo-700 block font-bold uppercase">Duration</span>
                          <span className="text-xs font-bold text-slate-800">{course.durationWeeks || 12} Weeks</span>
                        </div>
                        <div className="bg-purple-50/70 p-1.5 rounded-lg border border-purple-100">
                          <span className="text-[10px] text-purple-700 block font-bold uppercase">Tasks</span>
                          <span className="text-xs font-bold text-slate-800">{course.assessments?.length || 0} Graded</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">CLOs</span>
                          <span className="text-xs font-bold text-slate-800">{course.clos.length}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">MLOs</span>
                          <span className="text-xs font-bold text-slate-800">{course.mlos.length}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">OBE Health</span>
                          <span
                            className={`text-xs font-bold ${
                              audit.healthScore >= 90
                                ? 'text-emerald-600'
                                : audit.healthScore >= 75
                                ? 'text-indigo-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {audit.healthScore}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    {experienceMode === 'simple' ? (
                      <button
                        onClick={() => onSelectCourse(course.id)}
                        className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
                      >
                        <span>Edit Course</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectCourse(course.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 group/btn cursor-pointer"
                      >
                        <span>Open Course Creator</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    )}

                    <div className="flex items-center space-x-2">
                      {/* Direct 1-Click PDF Download in Simple Mode */}
                      {experienceMode === 'simple' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerWithLeadGate(
                              () => downloadCoursePDF(course),
                              {
                                featureTitle: 'Accreditation Dossier Export',
                                featureDescription: `Verify your academic affiliation to download the formatted PDF specification for ${course.title}.`,
                                source: 'dashboard_card_pdf_simple',
                                framework: course.accreditationFramework,
                              }
                            );
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                          title="Direct PDF download of course syllabus"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden sm:inline">Syllabus PDF</span>
                        </button>
                      )}

                      <span
                        className="text-[10px] text-slate-400 hidden xl:inline-flex items-center gap-1 font-medium"
                        title={formatExactTimestamp(course.updatedAt)}
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatRelativeTime(course.updatedAt)}</span>
                      </span>

                      {/* Quick Duplicate Button */}
                      <button
                        type="button"
                        id={`course-card-quick-duplicate-${course.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateCourse(course.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="Quick Duplicate Course"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        id={`course-card-quick-share-${course.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenShareCourseModal(course, e);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                        title="Share Course Blueprint (Firestore ABAC)"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Standardized Actions Dropdown */}
                      <div className="relative dashboard-dropdown-container">
                        <button
                          type="button"
                          id={`course-card-actions-menu-btn-${course.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenCardMenuId(openCardMenuId === course.id ? null : course.id);
                          }}
                          className={`px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                            openCardMenuId === course.id
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
                              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                          }`}
                          title="Course Actions & Export Menu"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                          <ChevronDown className={`w-3 h-3 transition-transform ${openCardMenuId === course.id ? 'rotate-180' : ''}`} />
                        </button>

                        {openCardMenuId === course.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 bottom-full mb-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 max-h-80 overflow-y-auto"
                          >
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Documents & Export
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setGuidebookModalCourse(course);
                                setGuidebookModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <BookOpen className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 flex items-center justify-between">
                                  <span>Framework Guidebook</span>
                                  {fwValidation.status !== 'valid' && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                      fwValidation.status === 'deprecated'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {fwValidation.status === 'deprecated' ? 'Deprecated' : 'Missing Docs'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {fwValidation.frameworkCode} accreditation standards &amp; PDF
                                </div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setSyllabusModalCourse(course);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <GraduationCap className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Course Syllabus Document</div>
                                <div className="text-[11px] text-slate-500">Generate formatted PDF / docx</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              id={`course-card-settings-btn-${course.id}`}
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setCourseSettingsTarget(course);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Settings className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                                  <span>Course Settings &amp; Logo</span>
                                  {course.institutionLogo && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Logo configured" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">Upload institutional logo, department &amp; PDF options</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                triggerWithLeadGate(
                                  () => downloadCoursePDF(course),
                                  {
                                    featureTitle: 'Accreditation Dossier Export',
                                    featureDescription: `Verify your academic affiliation to download the formatted PDF specification for ${course.title}.`,
                                    source: 'dashboard_card_pdf',
                                    framework: course.accreditationFramework,
                                  }
                                );
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Download className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900 flex items-center justify-between">
                                  <span>Download PDF Dossier (.pdf)</span>
                                  {!isLeadGateUnlocked() && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-0.5">
                                      <Lock className="w-2 h-2" />
                                      <span>Gate</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">Fully formatted accreditation dossier</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                triggerWithLeadGate(
                                  async () => {
                                    await downloadCourseDocx(course);
                                  },
                                  {
                                    featureTitle: `${course.code} Word Specification (.docx)`,
                                    featureDescription: `Verify your academic affiliation to download the editable Word document specification for ${course.title}.`,
                                    source: 'dashboard_card_docx',
                                    framework: course.accreditationFramework,
                                  }
                                );
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900 flex items-center justify-between">
                                  <span>Export Word (.docx)</span>
                                  {!isLeadGateUnlocked() && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-0.5">
                                      <Lock className="w-2 h-2" />
                                      <span>Gate</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">Fully formatted editable specification</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setPreviewPdfCourse(course);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Preview PDF Dossier</div>
                                <div className="text-[11px] text-slate-500">In-browser print preview</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setPrintFriendlyCourse(course);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Printer className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Print-Friendly View</div>
                                <div className="text-[11px] text-slate-500">Clean view for physical printing</div>
                              </div>
                            </button>

                            <div className="my-1 border-t border-slate-100"></div>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Integrations & Cloud
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setLmsModalCourse(course);
                                setLmsModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <GraduationCap className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">LMS Integration (.imscc)</div>
                                <div className="text-[11px] text-slate-500">Deploy to Canvas / Moodle / Cartridge</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                setOpenCardMenuId(null);
                                handleOpenSingleDriveSync(course, e);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <UploadCloud className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Google Drive Sync</div>
                                <div className="text-[11px] text-slate-500">Backup dossier to Google Drive</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              id={`course-card-share-btn-${course.id}`}
                              onClick={(e) => {
                                setOpenCardMenuId(null);
                                handleOpenShareCourseModal(course, e);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Share2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                                  <span>Share Blueprint</span>
                                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                                    Firestore
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">Unique read-only link for reviewers &amp; colleagues</div>
                              </div>
                            </button>

                            <div className="my-1 border-t border-slate-100"></div>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Analysis & Quality
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setAlignmentCourse(course);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Scale className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Audit CLO Alignment</div>
                                <div className="text-[11px] text-slate-500">Cognitive depth & assessment audit</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setAnalyticsCourseId(course.id);
                                setDashboardView('analytics');
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <BarChart3 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Alignment Analytics</div>
                                <div className="text-[11px] text-slate-500">Coverage charts & distributions</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                setOpenCardMenuId(null);
                                handleOpenVersionHistory(course.id, e);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <History className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Version History (5 Saves)</div>
                                <div className="text-[11px] text-slate-500">Restore previous checkpoints</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setTranslationCourse(course);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-700 hover:text-indigo-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Languages className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-semibold text-slate-900">Translate Course</span>
                                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                                    Arabic / French
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">Localize outcomes, syllabus &amp; RTL support</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                setSelectedCourseForTemplate(course);
                                setTemplateModalMode('save');
                                setTemplateModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Bookmark className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Save as Template</div>
                                <div className="text-[11px] text-slate-500">Store as reusable blueprint</div>
                              </div>
                            </button>

                            <div className="my-1 border-t border-slate-100"></div>
                            {onUpdateCourse && (
                              <>
                                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                  <span>Update Workflow Status</span>
                                  <span className="text-[9px] text-slate-400 font-normal">
                                    Current: {getCourseStatusBadge(course.status).label}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 px-2 pb-2">
                                  <button
                                    type="button"
                                    id={`set-status-draft-${course.id}`}
                                    onClick={() => {
                                      setOpenCardMenuId(null);
                                      onUpdateCourse({
                                        ...course,
                                        status: 'draft',
                                        updatedAt: new Date().toISOString(),
                                      });
                                    }}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md text-center transition cursor-pointer border flex items-center justify-center space-x-1 ${
                                      (course.status || 'draft') === 'draft'
                                        ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                    <span>Draft</span>
                                  </button>
                                  <button
                                    type="button"
                                    id={`set-status-review-${course.id}`}
                                    onClick={() => {
                                      setOpenCardMenuId(null);
                                      onUpdateCourse({
                                        ...course,
                                        status: 'submitted',
                                        updatedAt: new Date().toISOString(),
                                      });
                                    }}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md text-center transition cursor-pointer border flex items-center justify-center space-x-1 ${
                                      course.status === 'submitted' || course.status === 'ready_for_review'
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                    <span>Review</span>
                                  </button>
                                  <button
                                    type="button"
                                    id={`set-status-published-${course.id}`}
                                    onClick={() => {
                                      setOpenCardMenuId(null);
                                      onUpdateCourse({
                                        ...course,
                                        status: 'approved',
                                        updatedAt: new Date().toISOString(),
                                      });
                                    }}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md text-center transition cursor-pointer border flex items-center justify-center space-x-1 ${
                                      course.status === 'approved' || (course.status as string) === 'published'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <span>Published</span>
                                  </button>
                                </div>
                                <div className="my-1 border-t border-slate-100"></div>
                              </>
                            )}
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Management
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                onDuplicateCourse(course.id);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-start space-x-2.5 transition cursor-pointer"
                            >
                              <Copy className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-900">Duplicate Course</div>
                                <div className="text-[11px] text-slate-500">Create a cloned copy</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCardMenuId(null);
                                onDeleteCourse(course.id);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-xs text-rose-600 hover:text-rose-700 flex items-start space-x-2.5 transition cursor-pointer group"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500 group-hover:text-rose-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-rose-700">Delete Course</div>
                                <div className="text-[11px] text-rose-500">Permanently delete course</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-6 p-6">
            {searchQuery.trim() ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No courses found matching "{searchQuery.trim()}"
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
                  We couldn't find any course with title, code, or description matching <strong className="text-slate-700 font-semibold">"{searchQuery.trim()}"</strong>. Try checking your spelling or clear the search query.
                </p>
                <div className="mt-5 flex items-center justify-center space-x-3">
                  <button
                    id="empty-state-clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search Filter</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-3">
                  <LogoMark size={44} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No courses match your criteria</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create a new course from scratch or start from one of the OBE curriculum templates.
                </p>
                <div className="mt-4 flex items-center justify-center space-x-3">
                  <button
                    onClick={onCreateCourse}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Create New Course
                  </button>
                  <button
                    id="empty-state-browse-templates-btn"
                    onClick={() => setTemplateGalleryOpen(true)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Explore Template Gallery</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedCourseIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center space-x-2 pr-3 border-r border-slate-700 text-xs">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
              {selectedCourseIds.size}
            </span>
            <span className="font-semibold text-slate-200">Courses Selected</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Standardized Bulk Export & Sync Dropdown */}
            <div className="relative dashboard-dropdown-container">
              <button
                type="button"
                id="bulk-action-export-menu-btn"
                onClick={() => setOpenBulkExportMenu(!openBulkExportMenu)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export & Sync</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openBulkExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {openBulkExportMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 text-slate-200">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Bulk Export Formats
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenBulkExportMenu(false);
                      handleBulkExportCSV();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 hover:text-white flex items-center space-x-2 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Export CSV Spreadsheet</div>
                      <div className="text-[11px] text-slate-400">Accreditation matrix export</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenBulkExportMenu(false);
                      handleBulkExportJSON();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 hover:text-white flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Export JSON Archive</div>
                      <div className="text-[11px] text-slate-400">Full structured course data</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-800"></div>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cloud Storage
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenBulkExportMenu(false);
                      handleOpenBulkDriveSync();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 hover:text-white flex items-center space-x-2 transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Sync to Google Drive</div>
                      <div className="text-[11px] text-slate-400">Cloud backup & shared folder</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
              title="Delete selected courses"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedCourseIds.size})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Bulk Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the following{' '}
              <strong>{selectedCourseIds.size} selected course(s)</strong>?
            </p>

            <div className="max-h-40 overflow-y-auto bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
              {selectedCoursesList.map((c) => (
                <div key={c.id} className="text-xs text-slate-800 flex items-center justify-between">
                  <span className="font-semibold truncate max-w-[240px]">{c.title}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{c.code || 'NO-CODE'}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition"
              >
                Permanently Delete ({selectedCourseIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard & Cloud Storage Settings Modal */}
      <DashboardSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        courses={courses}
        initialCourseId={settingsCourseId}
        initialTab={settingsInitialTab}
        totalCoursesCount={courses.length}
        onRestoreCourse={onUpdateCourse}
        onExportAllCoursesJSON={handleExportAllCoursesJSON}
        onSettingsChanged={() => setDriveEnabled(isGoogleDriveSyncEnabled())}
      />

      {/* Individual Course Settings & Logo Modal */}
      {courseSettingsTarget && (
        <CourseSettingsModal
          isOpen={!!courseSettingsTarget}
          onClose={() => setCourseSettingsTarget(null)}
          course={courseSettingsTarget}
          onSave={(updated) => {
            onUpdateCourse(updated);
            setCourseSettingsTarget(null);
          }}
          onOpenDossierPreview={() => {
            const target = courseSettingsTarget;
            setCourseSettingsTarget(null);
            setPreviewPdfCourse(target);
          }}
        />
      )}

      {/* Google Drive Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        course={driveModalCourse}
        courses={driveModalBulkCourses}
        initialFormat="pdf"
        initialShareable={driveModalShareable}
        mode={driveModalMode}
      />

      {/* Preview PDF Modal (Temporary Blob URL) */}
      {previewPdfCourse && (
        <PDFPreviewModal
          isOpen={!!previewPdfCourse}
          onClose={() => setPreviewPdfCourse(null)}
          course={previewPdfCourse}
          onProceedToDriveSync={() => {
            const target = previewPdfCourse;
            setPreviewPdfCourse(null);
            setDriveModalCourse(target);
            setDriveModalBulkCourses(undefined);
            setDriveModalOpen(true);
          }}
        />
      )}

      {/* Template Management Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        mode={templateModalMode}
        currentCourse={selectedCourseForTemplate}
        onTemplateLoaded={(loadedCourse) => {
          if (onCourseCreatedFromTemplate) {
            onCourseCreatedFromTemplate(loadedCourse);
          } else {
            onSelectCourse(loadedCourse.id);
          }
        }}
      />

      {/* Visual Course Template Gallery Modal (Science, Humanities, Technical, Business) */}
      <CourseTemplateGalleryModal
        isOpen={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
        onSelectTemplate={(newCourse) => {
          if (onCourseCreatedFromTemplate) {
            onCourseCreatedFromTemplate(newCourse);
          } else {
            onSelectCourse(newCourse.id);
          }
        }}
      />

      {/* Alignment Analysis Modal */}
      {alignmentCourse && (
        <AlignmentAnalysisModal
          isOpen={!!alignmentCourse}
          onClose={() => setAlignmentCourse(null)}
          course={alignmentCourse}
          onChange={(updated) => {
            if (onUpdateCourse) {
              onUpdateCourse(updated);
            }
            setAlignmentCourse(updated);
          }}
          onJumpToStep={(step) => {
            setAlignmentCourse(null);
            onSelectCourse(alignmentCourse.id);
          }}
        />
      )}

      {/* Print-Friendly View (simplified reading & physical printing) */}
      {printFriendlyCourse && (
        <PrintFriendlyView
          course={printFriendlyCourse}
          onClose={() => setPrintFriendlyCourse(null)}
        />
      )}

      {/* LMS Integration Modal */}
      {lmsModalOpen && (lmsModalCourse || courses[0]) && (
        <LMSIntegrationModal
          course={lmsModalCourse || courses[0]}
          isOpen={lmsModalOpen}
          onClose={() => {
            setLmsModalOpen(false);
            setLmsModalCourse(null);
          }}
        />
      )}

      {/* Syllabus Generator Modal */}
      {syllabusModalCourse && (
        <SyllabusGeneratorModal
          isOpen={!!syllabusModalCourse}
          onClose={() => setSyllabusModalCourse(null)}
          course={syllabusModalCourse}
        />
      )}

      {/* Multilingual Course Translation Modal */}
      {translationCourse && (
        <CourseTranslationModal
          isOpen={!!translationCourse}
          onClose={() => setTranslationCourse(null)}
          course={translationCourse}
          onCourseUpdated={(updated) => {
            if (onUpdateCourse) onUpdateCourse(updated);
            setTranslationCourse(null);
          }}
          onCourseCreated={(newCourse) => {
            if (onCourseCreatedFromTemplate) onCourseCreatedFromTemplate(newCourse);
            else if (onUpdateCourse) onUpdateCourse(newCourse);
            setTranslationCourse(null);
          }}
        />
      )}

      {/* Firebase Firestore Course Share Modal */}
      {shareModalCourse && (
        <ShareCourseModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setShareModalCourse(null);
          }}
          course={shareModalCourse}
        />
      )}

      {/* OBE Framework Guidebook & Documentation Modal */}
      {guidebookModalOpen && (
        <FrameworkGuidebookModal
          isOpen={guidebookModalOpen}
          onClose={() => {
            setGuidebookModalOpen(false);
            setGuidebookModalCourse(null);
          }}
          course={guidebookModalCourse || undefined}
          frameworkId={guidebookModalCourse?.frameworkId || guidebookModalCourse?.accreditationFramework}
          onAdoptFramework={(adoptedId) => {
            if (guidebookModalCourse && onUpdateCourse) {
              onUpdateCourse({
                ...guidebookModalCourse,
                frameworkId: adoptedId,
                accreditationFramework: adoptedId,
              });
            }
          }}
        />
      )}
    </div>
  );
};
