import React, { useState, useEffect } from 'react';
import { Course, CourseLanguage } from './types';
import { FLAGSHIP_COURSE, CS_TEMPLATE_COURSE, createBlankCourse } from './data/initialCourses';
import { calculateCourseAudit } from './utils/obeCalculator';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CourseWizard } from './components/CourseCreator/CourseWizard';
import { CopilotPanel } from './components/CourseCreator/CopilotPanel';
import { MarketingLandingPage } from './components/MarketingLandingPage';
import { FeedbackModal } from './components/FeedbackModal';
import { SignInModal } from './components/SignInModal';
import { LeadGenerationModal } from './components/LeadGenerationModal';
import { LeadManagementModal } from './components/LeadManagementModal';
import { AuthUserState, getStoredAuthUser, signOutUser } from './services/authService';
import { LeadGateActionOptions } from './services/leadService';
import { FeedbackCategory } from './types/feedback';
import { useAutosave } from './hooks/useAutosave';
import { getCourseVersions, saveCourseVersion } from './services/versionHistoryService';
import { AutoSaveToast } from './components/AutoSaveToast';
import { CourseTranslationModal } from './components/CourseCreator/CourseTranslationModal';
import { translateCourse } from './services/courseTranslationService';
import { LaymanGuideModal } from './components/LaymanGuideModal';
import { CourseService } from './services/courseService';
import { SharedBlueprintView } from './components/SharedBlueprintView';
import { FrameworkGuidebookModal } from './components/FrameworkGuidebookModal';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { offlineSyncService } from './services/offlineSyncService';
import { Sparkles, Languages, RefreshCw, X } from 'lucide-react';

const STORAGE_KEY = 'mentisera_obe360_courses_v1';

export default function App() {
  const [activeShareId, setActiveShareId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('shareId') || params.get('share') || null;
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState<AuthUserState | null>(() => getStoredAuthUser());
  const [signInModalOpen, setSignInModalOpen] = useState<boolean>(false);
  const [leadModalOpen, setLeadModalOpen] = useState<boolean>(false);
  const [leadManagementModalOpen, setLeadManagementModalOpen] = useState<boolean>(false);

  // Layman / Pro Experience Mode State (Defaults to 'simple' for user friendliness)
  const [experienceMode, setExperienceMode] = useState<'simple' | 'pro'>(() => {
    try {
      const saved = localStorage.getItem('mentisera_experience_mode');
      return saved === 'pro' ? 'pro' : 'simple';
    } catch {
      return 'simple';
    }
  });
  const [laymanGuideOpen, setLaymanGuideOpen] = useState<boolean>(false);

  const handleToggleExperienceMode = () => {
    setExperienceMode((prev) => {
      const next = prev === 'simple' ? 'pro' : 'simple';
      try {
        localStorage.setItem('mentisera_experience_mode', next);
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleOpenGuide = () => setLaymanGuideOpen(true);
    window.addEventListener('open_layman_guide', handleOpenGuide);
    return () => window.removeEventListener('open_layman_guide', handleOpenGuide);
  }, []);

  // Overlay Gate for High-Value Advanced Features & Downloads
  const [gateModalOpen, setGateModalOpen] = useState<boolean>(false);
  const [gateFeatureTitle, setGateFeatureTitle] = useState<string>('Accreditation Dossier Export');
  const [gateFeatureDescription, setGateFeatureDescription] = useState<string | undefined>(undefined);
  const [gatePendingAction, setGatePendingAction] = useState<(() => void | Promise<void>) | null>(null);
  const [gateSource, setGateSource] = useState<string>('export_overlay_gate');
  const [gateFramework, setGateFramework] = useState<string | undefined>(undefined);

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
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('bug');
  const [feedbackSubject, setFeedbackSubject] = useState<string>('');

  // Course Translation States
  const [translationModalOpen, setTranslationModalOpen] = useState<boolean>(false);
  const [translationTargetLang, setTranslationTargetLang] = useState<CourseLanguage | undefined>(undefined);
  const [isTranslatingInPlace, setIsTranslatingInPlace] = useState<boolean>(false);
  const [languageSwitchPrompt, setLanguageSwitchPrompt] = useState<{
    targetLanguage: CourseLanguage;
    dir: 'ltr' | 'rtl';
  } | null>(null);

  // Framework Guidebook Modal State
  const [frameworkGuidebookModalOpen, setFrameworkGuidebookModalOpen] = useState<boolean>(false);
  const [frameworkGuidebookId, setFrameworkGuidebookId] = useState<string | undefined>(undefined);

  // Global event listener to allow any component to open modals
  useEffect(() => {
    const handleOpenFeedbackEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ category?: FeedbackCategory; subject?: string }>;
      if (customEv.detail?.category) setFeedbackCategory(customEv.detail.category);
      if (customEv.detail?.subject) setFeedbackSubject(customEv.detail.subject);
      setFeedbackModalOpen(true);
    };

    const handleOpenSignIn = () => setSignInModalOpen(true);
    const handleOpenLead = () => setLeadModalOpen(true);
    const handleOpenLeadManagement = () => setLeadManagementModalOpen(true);
    const handleOpenGuidebookEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ frameworkId?: string }>;
      if (customEv.detail?.frameworkId) {
        setFrameworkGuidebookId(customEv.detail.frameworkId);
      } else if (currentCourse?.frameworkId) {
        setFrameworkGuidebookId(currentCourse.frameworkId);
      }
      setFrameworkGuidebookModalOpen(true);
    };
    const handleOpenLeadGate = (e: Event) => {
      const customEv = e as CustomEvent<{
        action?: () => void | Promise<void>;
        options?: LeadGateActionOptions;
      }>;
      if (customEv.detail?.action) {
        setGatePendingAction(() => customEv.detail.action);
      } else {
        setGatePendingAction(null);
      }
      setGateFeatureTitle(customEv.detail?.options?.featureTitle || 'Accreditation Dossier Export');
      setGateFeatureDescription(customEv.detail?.options?.featureDescription);
      setGateSource(customEv.detail?.options?.source || 'export_overlay_gate');
      setGateFramework(customEv.detail?.options?.framework);
      setGateModalOpen(true);
    };
    const handleAuthStateChanged = (e: Event) => {
      const customEv = e as CustomEvent<{ user: AuthUserState | null }>;
      setCurrentUser(customEv.detail?.user ?? null);
    };

    const handleOpenTranslationModal = (e: Event) => {
      const customEv = e as CustomEvent<{ targetLanguage?: CourseLanguage }>;
      if (customEv.detail?.targetLanguage) {
        setTranslationTargetLang(customEv.detail.targetLanguage);
      }
      setTranslationModalOpen(true);
    };

    const handleOpenSharedBlueprint = (e: Event) => {
      const customEv = e as CustomEvent<{ shareId?: string }>;
      if (customEv.detail?.shareId) {
        setActiveShareId(customEv.detail.shareId);
        if (typeof window !== 'undefined' && window.history.pushState) {
          const url = new URL(window.location.href);
          url.searchParams.set('shareId', customEv.detail.shareId);
          window.history.pushState({}, '', url.pathname + url.search);
        }
      }
    };

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const sId = params.get('shareId') || params.get('share');
      setActiveShareId(sId || null);
    };

    window.addEventListener('open_feedback_modal', handleOpenFeedbackEvent);
    window.addEventListener('open_signin_modal', handleOpenSignIn);
    window.addEventListener('open_lead_modal', handleOpenLead);
    window.addEventListener('open_lead_management_modal', handleOpenLeadManagement);
    window.addEventListener('open_framework_guidebook_modal', handleOpenGuidebookEvent);
    window.addEventListener('open_framework_guidebook', handleOpenGuidebookEvent);
    window.addEventListener('open_lead_gate', handleOpenLeadGate);
    window.addEventListener('auth_state_changed', handleAuthStateChanged);
    window.addEventListener('open_translation_modal', handleOpenTranslationModal);
    window.addEventListener('open_shared_blueprint', handleOpenSharedBlueprint);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('open_feedback_modal', handleOpenFeedbackEvent);
      window.removeEventListener('open_signin_modal', handleOpenSignIn);
      window.removeEventListener('open_lead_modal', handleOpenLead);
      window.removeEventListener('open_lead_management_modal', handleOpenLeadManagement);
      window.removeEventListener('open_framework_guidebook_modal', handleOpenGuidebookEvent);
      window.removeEventListener('open_framework_guidebook', handleOpenGuidebookEvent);
      window.removeEventListener('open_lead_gate', handleOpenLeadGate);
      window.removeEventListener('auth_state_changed', handleAuthStateChanged);
      window.removeEventListener('open_translation_modal', handleOpenTranslationModal);
      window.removeEventListener('open_shared_blueprint', handleOpenSharedBlueprint);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Seed baseline version history for existing courses if empty, and sync with backend
  useEffect(() => {
    courses.forEach((c) => {
      const existing = getCourseVersions(c.id);
      if (existing.length === 0) {
        saveCourseVersion(c, 'manual', 'Initial Baseline Snapshot');
      }
    });

    // Check server for any remote updates or sync local courses to server
    CourseService.getAllCourses().then((serverCourses) => {
      if (serverCourses && serverCourses.length > 0) {
        setCourses((prev) => {
          const merged = [...prev];
          serverCourses.forEach((sc) => {
            const idx = merged.findIndex((c) => c.id === sc.id);
            if (idx !== -1) {
              const localTime = new Date(merged[idx].updatedAt || 0).getTime();
              const serverTime = new Date(sc.updatedAt || 0).getTime();
              if (serverTime > localTime) {
                merged[idx] = sc;
              }
            } else {
              merged.push(sc);
            }
          });
          return merged;
        });
      } else {
        CourseService.syncCourses(courses);
      }
    });
  }, []);

  // Debounced autosave effect that periodically persists course state to localStorage with a timestamp
  const {
    status: autoSaveStatus,
    lastSaved: autoSaveLastSaved,
    errorMessage: autoSaveError,
    saveNow: handleSaveNow,
    savedToastVisible,
    dismissToast,
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
        offlineSyncService.saveCourseBlueprintOffline(active).catch(() => {});
      }
      // Sync with server in background
      CourseService.syncCourses(savedCourses);
    },
  });

  const currentCourse = courses.find((c) => c.id === currentCourseId) || courses[0] || FLAGSHIP_COURSE;
  const auditReport = currentCourse ? calculateCourseAudit(currentCourse) : null;

  // Automatically apply Right-to-Left (RTL) text direction via the 'dir' attribute on document root
  useEffect(() => {
    const isRTL = currentCourse?.textDirection === 'rtl' || currentCourse?.language === 'Arabic';
    const direction = isRTL ? 'rtl' : 'ltr';
    const langCode =
      currentCourse?.language === 'Arabic'
        ? 'ar'
        : currentCourse?.language === 'French'
        ? 'fr'
        : currentCourse?.language === 'German'
        ? 'de'
        : currentCourse?.language === 'Spanish'
        ? 'es'
        : 'en';

    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', langCode);

    if (direction === 'rtl') {
      document.documentElement.classList.add('rtl-mode');
    } else {
      document.documentElement.classList.remove('rtl-mode');
    }
  }, [currentCourse?.textDirection, currentCourse?.language]);

  const handleSaveNowWithVersion = () => {
    handleSaveNow();
    if (currentCourse) {
      saveCourseVersion(currentCourse, 'manual', 'Manual Save Snapshot');
    }
  };

  const handleUpdateCurrentCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleConfirmTranslateInPlace = async (targetLang: CourseLanguage) => {
    if (!currentCourse) return;
    setIsTranslatingInPlace(true);
    try {
      const res = await translateCourse(currentCourse, targetLang, {
        scope: 'full',
        createNewCourseCopy: false,
      });
      handleUpdateCurrentCourse(res.translatedCourse);
      setLanguageSwitchPrompt(null);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslatingInPlace(false);
    }
  };

  const handleLanguageChange = (language: CourseLanguage, dir: 'ltr' | 'rtl') => {
    // 1. Notify i18n context so next-intl messages immediately switch
    window.dispatchEvent(
      new CustomEvent('language_changed', { detail: { language, dir } })
    );

    // 2. Update current course language metadata
    if (currentCourse) {
      const isLanguageDifferent = currentCourse.language !== language;
      const updated: Course = {
        ...currentCourse,
        language,
        textDirection: dir,
        updatedAt: new Date().toISOString(),
      };
      handleUpdateCurrentCourse(updated);

      // 3. If the course's content was in a different language, prompt user to translate the entire course content
      if (isLanguageDifferent) {
        setLanguageSwitchPrompt({ targetLanguage: language, dir });
      }
    }
    // Update document root attributes immediately
    document.documentElement.setAttribute('dir', dir);
    const langCode =
      language === 'Arabic'
        ? 'ar'
        : language === 'Urdu'
        ? 'ur'
        : language === 'French'
        ? 'fr'
        : language === 'German'
        ? 'de'
        : language === 'Spanish'
        ? 'es'
        : 'en';
    document.documentElement.setAttribute('lang', langCode);
  };

  const handleSelectCourse = (courseId: string) => {
    setCurrentCourseId(courseId);
    setCurrentView('creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNewCourse = (language?: CourseLanguage) => {
    const blank = createBlankCourse(language);
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

  if (activeShareId) {
    return (
      <SharedBlueprintView
        shareId={activeShareId}
        onExit={() => {
          setActiveShareId(null);
          if (typeof window !== 'undefined' && window.history.pushState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('share');
            url.searchParams.delete('shareId');
            window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
          }
        }}
        onImportToWorkspace={(course) => {
          setCourses((prev) => {
            const exists = prev.find((c) => c.id === course.id);
            if (exists) return prev;
            return [course, ...prev];
          });
          setCurrentCourseId(course.id);
          setCurrentView('creator');
          setActiveShareId(null);
          if (typeof window !== 'undefined' && window.history.pushState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('share');
            url.searchParams.delete('shareId');
            window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
          }
        }}
      />
    );
  }

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
        onOpenFeedback={() => {
          setFeedbackCategory('bug');
          setFeedbackSubject('');
          setFeedbackModalOpen(true);
        }}
        autoSaveStatus={autoSaveStatus}
        autoSaveLastSaved={autoSaveLastSaved}
        autoSaveError={autoSaveError}
        onSaveNow={handleSaveNowWithVersion}
        currentUser={currentUser}
        onOpenSignIn={() => setSignInModalOpen(true)}
        onOpenLeadModal={() => setLeadModalOpen(true)}
        onOpenLeadManagement={() => setLeadManagementModalOpen(true)}
        onSignOut={() => {
          signOutUser();
          setCurrentUser(null);
        }}
        currentLanguage={(currentCourse?.language as CourseLanguage) || 'English'}
        onLanguageChange={handleLanguageChange}
        experienceMode={experienceMode}
        onToggleExperienceMode={handleToggleExperienceMode}
        onOpenHelpGuide={() => setLaymanGuideOpen(true)}
      />

      {/* Offline Storage & Auto-Sync Alert Banner */}
      <OfflineSyncBanner />

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
            experienceMode={experienceMode}
            onToggleExperienceMode={handleToggleExperienceMode}
            onOpenHelpGuide={() => setLaymanGuideOpen(true)}
          />
        ) : (
          <CourseWizard
            course={currentCourse}
            onChange={handleUpdateCurrentCourse}
            onNavigateDashboard={() => setCurrentView('dashboard')}
            onAskCopilot={handleAskCopilot}
            onLoadCourse={handleCourseCreatedFromTemplate}
            onDuplicateCourse={handleDuplicateCourse}
            onDeleteCourse={handleDeleteCourse}
            autoSaveStatus={autoSaveStatus}
            autoSaveLastSaved={autoSaveLastSaved}
            autoSaveError={autoSaveError}
            onSaveNow={handleSaveNowWithVersion}
            experienceMode={experienceMode}
            onToggleExperienceMode={handleToggleExperienceMode}
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

      {/* Developer Feedback & Report Issue Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        currentCourse={currentCourse}
        currentView={currentView}
        initialCategory={feedbackCategory}
        initialSubject={feedbackSubject}
      />

      {/* Institutional Sign-In / User Switcher Modal */}
      <SignInModal
        isOpen={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(user) => setCurrentUser(user)}
      />

      {/* Lead Generation Modal (Campus Demo & Institutional Sales) */}
      <LeadGenerationModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialSource="app_navbar_lead_cta"
        currentUser={currentUser}
      />

      {/* High-Value Advanced Features & Downloads Overlay Gate */}
      <LeadGenerationModal
        isOpen={gateModalOpen}
        onClose={() => {
          setGateModalOpen(false);
          setGatePendingAction(null);
        }}
        isGateMode={true}
        gateFeatureTitle={gateFeatureTitle}
        gateFeatureDescription={gateFeatureDescription}
        initialSource={gateSource}
        initialFramework={gateFramework || currentCourse?.accreditationFramework}
        currentUser={currentUser}
        onGateUnlocked={() => {
          if (gatePendingAction) {
            try {
              gatePendingAction();
            } catch (err) {
              console.error('Failed executing gated action after unlock:', err);
            }
          }
        }}
      />

      {/* Institutional Sales Inquiries Management Drawer */}
      <LeadManagementModal
        isOpen={leadManagementModalOpen}
        onClose={() => setLeadManagementModalOpen(false)}
        onOpenNewLeadModal={() => {
          setLeadManagementModalOpen(false);
          setLeadModalOpen(true);
        }}
      />

      {/* Beginner / Layman 4-Step Quick Guide Modal */}
      <LaymanGuideModal
        isOpen={laymanGuideOpen}
        onClose={() => setLaymanGuideOpen(false)}
        onStartCreating={() => {
          setLaymanGuideOpen(false);
          handleCreateNewCourse();
        }}
      />

      {/* Subtle Auto-Save 'Saved' Confirmation Toast */}
      <AutoSaveToast
        visible={savedToastVisible}
        lastSaved={autoSaveLastSaved}
        onDismiss={dismissToast}
        courseTitle={currentCourse?.title}
      />

      {/* Global Course Translation & Localization Modal */}
      {currentCourse && (
        <CourseTranslationModal
          isOpen={translationModalOpen}
          onClose={() => setTranslationModalOpen(false)}
          course={currentCourse}
          initialTargetLanguage={translationTargetLang}
          onCourseUpdated={(updated) => {
            handleUpdateCurrentCourse(updated);
            setTranslationModalOpen(false);
          }}
          onCourseCreated={(newCourse) => {
            setCourses((prev) => [newCourse, ...prev]);
            setCurrentCourseId(newCourse.id);
            setTranslationModalOpen(false);
          }}
        />
      )}

      {/* Language Switch Course Translation Prompt */}
      {languageSwitchPrompt && currentCourse && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white rounded-2xl shadow-2xl border border-indigo-200 p-5 animate-slideUp text-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Switch to {languageSwitchPrompt.targetLanguage}?
                </h4>
                <p className="text-[11px] text-slate-500">
                  Interface localized. Translate entire course blueprint?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLanguageSwitchPrompt(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            Would you like to translate <span className="font-semibold text-slate-900">"{currentCourse.title}"</span> and all its CLOs, PLOs, modules, and assessments into <span className="font-semibold text-indigo-700">{languageSwitchPrompt.targetLanguage}</span>?
          </p>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isTranslatingInPlace}
              onClick={() => handleConfirmTranslateInPlace(languageSwitchPrompt.targetLanguage)}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isTranslatingInPlace ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating Course...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Translate Entire Course</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTranslationTargetLang(languageSwitchPrompt.targetLanguage);
                setTranslationModalOpen(true);
                setLanguageSwitchPrompt(null);
              }}
              className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Options
            </button>

            <button
              type="button"
              onClick={() => setLanguageSwitchPrompt(null)}
              className="py-2 px-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
              title="Keep course content in original language"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Global OBE Framework Guidebook & PDF Viewer Modal */}
      <FrameworkGuidebookModal
        isOpen={frameworkGuidebookModalOpen}
        onClose={() => setFrameworkGuidebookModalOpen(false)}
        frameworkId={frameworkGuidebookId}
        course={currentCourse || undefined}
        onAdoptFramework={(fwId) => {
          if (currentCourse) {
            handleUpdateCurrentCourse({
              ...currentCourse,
              frameworkId: fwId,
            });
          }
        }}
      />
    </div>
  );
}
