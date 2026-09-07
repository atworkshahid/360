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
} from 'lucide-react';
import { Course } from '../types';
import { calculateCourseAudit } from '../utils/obeCalculator';
import { downloadCoursesCSV } from '../utils/csvExport';
import { downloadCourseDocx } from '../utils/docxExport';
import { TemplateModal } from './TemplateModal';
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
import { isGoogleDriveSyncEnabled } from '../services/googleDriveService';

const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !query.trim() || !text) return <>{text}</>;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
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

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onCreateCourse: () => void;
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
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'templates'>('all');
  const [dashboardView, setDashboardView] = useState<'courses' | 'analytics'>('courses');
  const [analyticsCourseId, setAnalyticsCourseId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [templateModalMode, setTemplateModalMode] = useState<'save' | 'load'>('load');
  const [selectedCourseForTemplate, setSelectedCourseForTemplate] = useState<Course | undefined>(undefined);
  const [alignmentCourse, setAlignmentCourse] = useState<Course | null>(null);

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
  const [previewPdfCourse, setPreviewPdfCourse] = useState<Course | null>(null);
  const [printFriendlyCourse, setPrintFriendlyCourse] = useState<Course | null>(null);
  const [lmsModalOpen, setLmsModalOpen] = useState<boolean>(false);
  const [lmsModalCourse, setLmsModalCourse] = useState<Course | null>(null);

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
    if (activeTab === 'submitted' && c.status !== 'submitted') return false;
    if (activeTab === 'approved' && c.status !== 'approved') return false;
    if (activeTab === 'templates' && !c.isTemplate) return false;

    // Search filter - keyword search on title, code, category, programme
    if (searchQuery.trim()) {
      const rawQ = searchQuery.trim().toLowerCase();
      const normalizedQ = rawQ.replace(/[\s-_]+/g, '');
      const tokens = rawQ.split(/\s+/).filter(Boolean);

      const title = (c.title || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      const normalizedCode = code.replace(/[\s-_]+/g, '');
      const category = (c.category || '').toLowerCase();
      const programme = (c.programme || '').toLowerCase();

      // Direct exact or substring match on title or code
      const directMatch =
        title.includes(rawQ) ||
        code.includes(rawQ) ||
        (normalizedQ.length >= 2 && normalizedCode.includes(normalizedQ)) ||
        category.includes(rawQ) ||
        programme.includes(rawQ);

      if (directMatch) return true;

      // Multi-keyword token match (every token matches title, code, category, or programme)
      const allTokensMatch = tokens.every((token) => {
        const normToken = token.replace(/[\s-_]+/g, '');
        return (
          title.includes(token) ||
          code.includes(token) ||
          (normToken.length >= 2 && normalizedCode.includes(normToken)) ||
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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f8fafc] text-slate-900 pb-16">
      {/* Sleek Hero / Banner */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Single-Purpose Outcome-Based Course Creator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
                MENTISERA OBE360™
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 max-w-2xl font-normal">
                Design complete, measurable, constructively aligned courses from Learning Outcomes (CLOs & MLOs) to assessment evidence and rubrics within one guided workspace.
              </p>
              <div className="mt-2.5 flex items-center space-x-2 text-xs text-indigo-600 font-medium">
                <span className="font-semibold text-slate-900">The Core Chain:</span>
                <span>PLO → CLO → MLO → Lesson → Activity → Assessment → Rubric → Evidence → Achievement</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setAnalyticsCourseId(undefined);
                  setDashboardView(dashboardView === 'analytics' ? 'courses' : 'analytics');
                }}
                className={`inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border font-bold text-xs shadow-xs transition cursor-pointer ${
                  dashboardView === 'analytics'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="Outcome Alignment Analytics across all active courses"
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>{dashboardView === 'analytics' ? 'Course Catalog' : 'Alignment Analytics'}</span>
              </button>

              <button
                onClick={() => handleOpenVersionHistory()}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition cursor-pointer"
                title="View course save history & restore checkpoints (last 5 saves)"
              >
                <History className="w-4 h-4 text-indigo-600" />
                <span>Version History (Last 5 Saves)</span>
              </button>

              <button
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

              {onNavigateMarketing && (
                <button
                  type="button"
                  onClick={onNavigateMarketing}
                  className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-700 font-bold text-xs shadow-xs transition cursor-pointer"
                  title="View MENTISERA OBE360 Platform Tour, Accreditation Standards & ROI"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Platform Tour</span>
                </button>
              )}

              <button
                type="button"
                id="dashboard-header-lms-hub-btn"
                onClick={() => {
                  const targetCourse = courses[0];
                  if (targetCourse) {
                    setLmsModalCourse(targetCourse);
                    setLmsModalOpen(true);
                  }
                }}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shadow-xs transition cursor-pointer"
                title="LMS Connectors: Deploy courses to Moodle, Blackboard, Canvas or export IMS Common Cartridge"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>LMS Connectors</span>
              </button>

              <button
                onClick={() => {
                  setTemplateModalMode('load');
                  setSelectedCourseForTemplate(undefined);
                  setTemplateModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>Load Saved Template</span>
              </button>

              <button
                onClick={onCreateCourse}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm shadow-indigo-200 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                setDashboardView('courses');
                setActiveTab('all');
              }}
              className="text-left bg-slate-50 hover:bg-slate-100/80 transition rounded-lg p-3.5 border border-slate-200 cursor-pointer"
            >
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Courses</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalCourses}</p>
            </button>
            <button
              onClick={() => {
                setAnalyticsCourseId(undefined);
                setDashboardView('analytics');
              }}
              className="text-left bg-slate-50 hover:bg-indigo-50/50 transition rounded-lg p-3.5 border border-slate-200 cursor-pointer group"
              title="View CLO alignment analytics across all courses"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-600 transition">Formulated CLOs</p>
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
              title="View assessment alignment distribution"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-600 transition">Aligned Assessments</p>
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
              title="Inspect cross-course outcome health"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-emerald-600 transition">Average OBE Health</p>
                <ShieldCheck className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{averageHealth}%</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'My Courses', count: courses.length },
              { id: 'draft', label: 'Draft Courses', count: courses.filter((c) => c.status === 'draft').length },
              { id: 'submitted', label: 'Submitted Courses', count: courses.filter((c) => c.status === 'submitted').length },
              { id: 'approved', label: 'Approved Courses', count: courses.filter((c) => c.status === 'approved').length },
              { id: 'templates', label: 'Templates', count: courses.filter((c) => c.isTemplate).length },
              { id: 'analytics', label: 'CLO Analytics', count: 'Visuals', isAnalytics: true },
            ].map((tab) => {
              const isSelected =
                (dashboardView === 'analytics' && tab.id === 'analytics') ||
                (dashboardView === 'courses' && activeTab === tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'analytics') {
                      setAnalyticsCourseId(undefined);
                      setDashboardView('analytics');
                    } else {
                      setDashboardView('courses');
                      setActiveTab(tab.id as any);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.id === 'analytics' && <BarChart3 className="w-3.5 h-3.5" />}
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
            <div className="relative w-full sm:w-72">
              <label htmlFor="dashboard-course-search-input" className="sr-only">
                Search courses by title or code
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="dashboard-course-search-input"
                type="text"
                placeholder="Search by title or code (e.g. CS-301, AI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                  }
                }}
                aria-label="Search courses by title or code"
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
              <span className="text-slate-600">Keyword filter:</span>
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

        {dashboardView === 'analytics' ? (
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

        {/* Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCourses.map((course) => {
              const audit = calculateCourseAudit(course);
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
                      <div className="flex items-center space-x-1.5">
                        {course.isTemplate && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Template
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                            course.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : course.status === 'submitted'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {course.status}
                        </span>
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
                      {course.description || course.overview || 'No description provided.'}
                    </p>

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

                    {/* OBE Alignment Metrics */}
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
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onSelectCourse(course.id)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 group/btn cursor-pointer"
                    >
                      <span>Open Course Creator</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="flex items-center space-x-2">
                      <span
                        className="text-[10px] text-slate-400 hidden xl:inline-flex items-center gap-1 font-medium"
                        title={formatExactTimestamp(course.updatedAt)}
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatRelativeTime(course.updatedAt)}</span>
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => handleOpenVersionHistory(course.id, e)}
                          className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                          title="View version history & restore checkpoints (last 5 saves)"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPdfCourse(course);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Preview PDF dossier using temporary blob URL"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`course-card-print-friendly-btn-${course.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrintFriendlyCourse(course);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Open Print-Friendly View (stripped of UI for physical printing or simplified reading)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`course-card-export-docx-btn-${course.id}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await downloadCourseDocx(course);
                            } catch (err) {
                              console.error('Failed to export Word document:', err);
                            }
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                          title="Download course as formatted Microsoft Word document (.docx)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenSingleDriveSync(course, e)}
                          className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Sync course dossier to Google Drive"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`course-card-share-btn-${course.id}`}
                          onClick={(e) => handleOpenShareModal(course, e)}
                          className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          title="Export read-only course snapshot to Google Drive & generate shareable link (anyone with the link)"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`course-card-lms-btn-${course.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLmsModalCourse(course);
                            setLmsModalOpen(true);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 transition cursor-pointer"
                          title="Deploy course to LMS (Moodle, Blackboard, Canvas) or export Common Cartridge (.imscc)"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                        </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnalyticsCourseId(course.id);
                          setDashboardView('analytics');
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="View CLO & Assessment Alignment Analytics for this course"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setAlignmentCourse(course)}
                        className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="Audit CLO vs. Assessment Plan Alignment"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourseForTemplate(course);
                          setTemplateModalMode('save');
                          setTemplateModalOpen(true);
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="Save as reusable template"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicateCourse(course.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        title="Duplicate course"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                  We couldn't find any course with title or code matching <strong className="text-slate-700 font-semibold">"{searchQuery.trim()}"</strong>. Try checking your spelling or clear the search query.
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
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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
                    onClick={() => onLoadTemplate('law')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    Load Constitutional Law Template
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
            <button
              type="button"
              id="bulk-action-export-csv-btn"
              onClick={handleBulkExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-xs cursor-pointer"
              title="Export selected courses into a CSV spreadsheet for external reporting & accreditation"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleBulkExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              title="Export selected courses as JSON archive"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleOpenBulkDriveSync}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-sm cursor-pointer"
              title="Sync selected courses to Google Drive"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Sync to Google Drive</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-xs font-semibold text-white transition cursor-pointer"
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
    </div>
  );
};
