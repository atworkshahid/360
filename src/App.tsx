import React, { useState, useEffect } from 'react';
import { Course } from './types';
import { FLAGSHIP_COURSE, CS_TEMPLATE_COURSE, createBlankCourse } from './data/initialCourses';
import { calculateCourseAudit } from './utils/obeCalculator';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CourseWizard } from './components/CourseCreator/CourseWizard';
import { CopilotPanel } from './components/CourseCreator/CopilotPanel';
import { MarketingLandingPage } from './components/MarketingLandingPage';
import { useAutosave } from './hooks/useAutosave';
import { getCourseVersions, saveCourseVersion } from './services/versionHistoryService';

const STORAGE_KEY = 'mentisera_obe360_courses_v1';

export default function App() {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load courses from localStorage:', e);
    }
    return [FLAGSHIP_COURSE, CS_TEMPLATE_COURSE];
  });

  const [currentCourseId, setCurrentCourseId] = useState<string>(FLAGSHIP_COURSE.id);
  const [currentView, setCurrentView] = useState<'dashboard' | 'creator' | 'marketing'>('creator');
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [externalCopilotPrompt, setExternalCopilotPrompt] = useState<string | undefined>(undefined);

  // Seed baseline version history for existing courses if empty
  useEffect(() => {
    courses.forEach((c) => {
      const existing = getCourseVersions(c.id);
      if (existing.length === 0) {
        saveCourseVersion(c, 'manual', 'Initial Baseline Snapshot');
      }
    });
  }, []);

  // Debounced autosave effect that periodically persists course state to localStorage with a timestamp
  const {
    status: autoSaveStatus,
    lastSaved: autoSaveLastSaved,
    errorMessage: autoSaveError,
    saveNow: handleSaveNow,
  } = useAutosave<Course[]>({
    storageKey: STORAGE_KEY,
    data: courses,
    debounceMs: 800,
    periodicIntervalMs: 30000,
    activeCourseId: currentCourseId,
    onBeforeSave: (coursesToSave, timestamp) => {
      return coursesToSave.map((c) =>
        c.id === currentCourseId ? { ...c, updatedAt: timestamp } : c
      );
    },
    onAfterSave: (savedCourses) => {
      const active = savedCourses.find((c) => c.id === currentCourseId);
      if (active) {
        saveCourseVersion(active, 'autosave');
      }
    },
  });

  const currentCourse = courses.find((c) => c.id === currentCourseId) || courses[0] || FLAGSHIP_COURSE;
  const auditReport = currentCourse ? calculateCourseAudit(currentCourse) : null;

  const handleSaveNowWithVersion = () => {
    handleSaveNow();
    if (currentCourse) {
      saveCourseVersion(currentCourse, 'manual', 'Manual Save Snapshot');
    }
  };

  const handleUpdateCurrentCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleSelectCourse = (courseId: string) => {
    setCurrentCourseId(courseId);
    setCurrentView('creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNewCourse = () => {
    const blank = createBlankCourse();
    setCourses((prev) => [blank, ...prev]);
    setCurrentCourseId(blank.id);
    setCurrentView('creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateCourse = (courseId: string) => {
    const original = courses.find((c) => c.id === courseId);
    if (!original) return;

    const duplicated: Course = {
      ...original,
      id: `course-${Date.now()}`,
      title: `${original.title} (Copy)`,
      code: `${original.code}-COPY`,
      isTemplate: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCourses((prev) => [duplicated, ...prev]);
    setCurrentCourseId(duplicated.id);
    setCurrentView('creator');
  };

  const handleDeleteCourse = (courseId: string) => {
    if (courses.length <= 1) {
      alert('You must have at least one course in your workspace.');
      return;
    }
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const remaining = courses.filter((c) => c.id !== courseId);
      setCourses(remaining);
      if (currentCourseId === courseId) {
        setCurrentCourseId(remaining[0].id);
      }
    }
  };

  const handleBulkDeleteCourses = (courseIds: string[]) => {
    if (courseIds.length === 0) return;
    if (courses.length - courseIds.length < 1) {
      alert('You must retain at least one course in your workspace.');
      return;
    }
    const remaining = courses.filter((c) => !courseIds.includes(c.id));
    setCourses(remaining);
    if (courseIds.includes(currentCourseId)) {
      setCurrentCourseId(remaining[0].id);
    }
  };

  const handleLoadTemplate = (templateType: 'law' | 'cs') => {
    if (templateType === 'law') {
      const cloned = { ...FLAGSHIP_COURSE, id: `course-law-${Date.now()}`, isTemplate: false };
      setCourses((prev) => [cloned, ...prev]);
      setCurrentCourseId(cloned.id);
      setCurrentView('creator');
    } else {
      const cloned = { ...CS_TEMPLATE_COURSE, id: `course-cs-${Date.now()}`, isTemplate: false };
      setCourses((prev) => [cloned, ...prev]);
      setCurrentCourseId(cloned.id);
      setCurrentView('creator');
    }
  };

  const handleCourseCreatedFromTemplate = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setCurrentCourseId(newCourse.id);
    setCurrentView('creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskCopilot = (prompt: string) => {
    setExternalCopilotPrompt(prompt);
    setCopilotOpen(true);
  };

  const handleJumpToAudit = () => {
    setCurrentView('creator');
    // Dispatch jump to Stage 13 (Alignment Audit)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('wizard_jump_step', { detail: { stepNumber: 13 } }));
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        currentCourse={currentCourse}
        auditReport={auditReport}
        copilotOpen={copilotOpen}
        onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
        onNavigateDashboard={() => setCurrentView('dashboard')}
        onNavigateMarketing={() => setCurrentView('marketing')}
        onNewCourse={handleCreateNewCourse}
        onJumpToAudit={handleJumpToAudit}
        onAskCopilot={handleAskCopilot}
        autoSaveStatus={autoSaveStatus}
        autoSaveLastSaved={autoSaveLastSaved}
        autoSaveError={autoSaveError}
        onSaveNow={handleSaveNowWithVersion}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col">
        {currentView === 'marketing' ? (
          <MarketingLandingPage
            onLaunchApp={() => {
              setCurrentView('creator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCourse={(cId) => {
              if (cId) setCurrentCourseId(cId);
              setCurrentView('creator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentView === 'dashboard' ? (
          <Dashboard
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onCreateCourse={handleCreateNewCourse}
            onDuplicateCourse={handleDuplicateCourse}
            onDeleteCourse={handleDeleteCourse}
            onBulkDeleteCourses={handleBulkDeleteCourses}
            onLoadTemplate={handleLoadTemplate}
            onCourseCreatedFromTemplate={handleCourseCreatedFromTemplate}
            onUpdateCourse={handleUpdateCurrentCourse}
            onNavigateMarketing={() => setCurrentView('marketing')}
            autoSaveStatus={autoSaveStatus}
            autoSaveLastSaved={autoSaveLastSaved}
            autoSaveError={autoSaveError}
            onSaveNow={handleSaveNowWithVersion}
          />
        ) : (
          <CourseWizard
            course={currentCourse}
            onChange={handleUpdateCurrentCourse}
            onNavigateDashboard={() => setCurrentView('dashboard')}
            onAskCopilot={handleAskCopilot}
            onLoadCourse={handleCourseCreatedFromTemplate}
            autoSaveStatus={autoSaveStatus}
            autoSaveLastSaved={autoSaveLastSaved}
            autoSaveError={autoSaveError}
            onSaveNow={handleSaveNowWithVersion}
          />
        )}
      </div>

      {/* Persistent AI Copilot Panel */}
      <CopilotPanel
        course={currentCourse}
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        externalPrompt={externalCopilotPrompt}
        onClearExternalPrompt={() => setExternalCopilotPrompt(undefined)}
      />
    </div>
  );
}
