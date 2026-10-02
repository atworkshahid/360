import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Layers,
  Plus,
  ArrowLeft,
  LifeBuoy,
  Download,
  FileText,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  Building,
  Building2,
  Award,
  Users,
  Phone,
  Lock,
  Languages,
  Check,
  MoreHorizontal,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { Course, CourseAuditReport, SUPPORTED_LANGUAGES, CourseLanguage } from '../types';
import { MentiseraLogo } from './Logo';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { AutoSaveStatus } from '../hooks/useAutosave';
import { NavbarAuditWidget } from './NavbarAuditWidget';
import { AuthUserState } from '../services/authService';
import { downloadCoursePDF } from '../utils/pdfExport';
import { downloadCourseDocx } from '../utils/docxExport';
import { triggerWithLeadGate, isLeadGateUnlocked } from '../services/leadService';

interface NavbarProps {
  currentView: 'dashboard' | 'creator' | 'marketing';
  currentCourse: Course | null;
  auditReport: CourseAuditReport | null;
  copilotOpen: boolean;
  onToggleCopilot: () => void;
  onNavigateDashboard: () => void;
  onNavigateMarketing?: () => void;
  onNewCourse: (language?: CourseLanguage) => void;
  onJumpToAudit?: () => void;
  onAskCopilot?: (prompt: string) => void;
  onOpenFeedback?: () => void;
  autoSaveStatus?: AutoSaveStatus;
  autoSaveLastSaved?: Date | null;
  autoSaveError?: string | null;
  onSaveNow?: () => void;
  currentUser?: AuthUserState | null;
  onOpenSignIn?: () => void;
  onOpenLeadModal?: () => void;
  onOpenLeadManagement?: () => void;
  onSignOut?: () => void;
  currentLanguage?: CourseLanguage;
  onLanguageChange?: (language: CourseLanguage, dir: 'ltr' | 'rtl') => void;
  experienceMode?: 'simple' | 'pro';
  onToggleExperienceMode?: () => void;
  onOpenHelpGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentCourse,
  auditReport,
  copilotOpen,
  onToggleCopilot,
  onNavigateDashboard,
  onNavigateMarketing,
  onNewCourse,
  onJumpToAudit,
  onAskCopilot,
  onOpenFeedback,
  autoSaveStatus,
  autoSaveLastSaved,
  autoSaveError,
  onSaveNow,
  currentUser,
  onOpenSignIn,
  onOpenLeadModal,
  onOpenLeadManagement,
  onSignOut,
  currentLanguage,
  onLanguageChange,
  experienceMode = 'simple',
  onToggleExperienceMode,
  onOpenHelpGuide,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const activeLangName: CourseLanguage =
    (currentCourse?.language as CourseLanguage) || currentLanguage || 'English';
  const activeLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.name === activeLangName) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-2xs h-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Brand & Course context */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onNavigateDashboard}
            className="flex items-center text-left group focus:outline-none cursor-pointer"
            title="Return to MENTISERA OBE360 Dashboard"
          >
            <MentiseraLogo
              size="sm"
              showText={true}
              showTagline={true}
              taglineText={experienceMode === 'simple' ? 'Easy Course Creator' : 'Outcome-Based Course Creator'}
            />
          </button>

          {currentView === 'creator' && (
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-200">
              <button
                onClick={onNavigateDashboard}
                className="text-xs flex items-center space-x-1 text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>My Courses</span>
              </button>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs font-semibold text-slate-800 max-w-xs truncate" title={currentCourse?.title}>
                {currentCourse?.title || 'Untitled Course'}
              </span>
              {currentCourse?.status && (
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    currentCourse.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : currentCourse.status === 'submitted'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {currentCourse.status}
                </span>
              )}

              {/* Visual Auto-saved indicator with timestamp & popover */}
              {autoSaveStatus && (
                <div className="pl-1">
                  <AutoSaveIndicator
                    status={autoSaveStatus}
                    lastSaved={autoSaveLastSaved ?? null}
                    errorMessage={autoSaveError}
                    onSaveNow={onSaveNow}
                    idPrefix="navbar-autosave"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center / Stats (Active during Creator mode) */}
        {currentView === 'creator' && (
          experienceMode === 'simple' ? (
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-800">{currentCourse?.clos?.length || 0} Goals</span>
              <span className="text-slate-300">•</span>
              <span>{currentCourse?.durationWeeks || 12} Weeks</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">Ready</span>
            </div>
          ) : auditReport ? (
            <NavbarAuditWidget
              auditReport={auditReport}
              course={currentCourse}
              onJumpToAudit={onJumpToAudit || (() => {})}
              onAskCopilot={onAskCopilot}
            />
          ) : null
        )}

        {/* Right: Actions & Copilot */}
        <div className="flex items-center space-x-2.5">
          {/* Layman Guide Button */}
          {onOpenHelpGuide && (
            <button
              type="button"
              id="navbar-layman-guide-btn"
              onClick={onOpenHelpGuide}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              title="Open beginner-friendly course creation guide"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Guide</span>
            </button>
          )}

          {/* Simple vs Pro Mode Switcher */}
          {onToggleExperienceMode && (
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                id="navbar-mode-simple-btn"
                onClick={onToggleExperienceMode}
                className={`px-2 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                  experienceMode === 'simple'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Simple Layman Mode: Easy 4-step wizard, no confusing academic jargon"
              >
                <span>🌿 Simple</span>
              </button>
              <button
                type="button"
                id="navbar-mode-pro-btn"
                onClick={onToggleExperienceMode}
                className={`px-2 py-1 rounded-md text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                  experienceMode === 'pro'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Pro Mode: Full Outcome-Based Education (OBE) accreditation matrices & taxonomies"
              >
                <span>🎓 Pro</span>
              </button>
            </div>
          )}
          {/* Guidebook Button (Available when course selected) */}
          {currentCourse && (
            <button
              type="button"
              id="navbar-guidebook-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open_framework_guidebook_modal', {
                    detail: { frameworkId: currentCourse.frameworkId },
                  })
                );
              }}
              className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
              title="Open OBE Accreditation Guidebook & PDF Viewer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Guidebook (PDF)</span>
            </button>
          )}

          {/* Export Dropdown (Available in Creator & Dashboard when course selected) */}
          {currentCourse && (
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setExportMenuOpen((prev) => !prev)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                title="Download formatted course specification or accreditation dossier"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn text-xs">
                  <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Export Formatted Dossier</span>
                    {!isLeadGateUnlocked() && (
                      <span className="flex items-center space-x-1 text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-normal">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Gate</span>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExportMenuOpen(false);
                      triggerWithLeadGate(
                        () => downloadCoursePDF(currentCourse),
                        {
                          featureTitle: `${currentCourse.code} PDF Accreditation Dossier`,
                          featureDescription: `Verify your academic affiliation to download the formatted PDF specification for ${currentCourse.title}.`,
                          source: 'navbar_export_pdf',
                          framework: currentCourse.accreditationFramework,
                        }
                      );
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start space-x-2.5 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 flex items-center justify-between">
                        <span>Download PDF Dossier (.pdf)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Accreditation-grade formatted print</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExportMenuOpen(false);
                      triggerWithLeadGate(
                        async () => {
                          await downloadCourseDocx(currentCourse);
                        },
                        {
                          featureTitle: `${currentCourse.code} Word Specification (.docx)`,
                          featureDescription: `Verify your academic affiliation to download the editable Word document specification for ${currentCourse.title}.`,
                          source: 'navbar_export_docx',
                          framework: currentCourse.accreditationFramework,
                        }
                      );
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start space-x-2.5 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Export Word Document (.docx)</div>
                      <div className="text-[10px] text-slate-400">Fully formatted editable specification</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setExportMenuOpen(false);
                      window.dispatchEvent(
                        new CustomEvent('open_framework_guidebook_modal', {
                          detail: { frameworkId: currentCourse.frameworkId },
                        })
                      );
                    }}
                    className="w-full text-left px-3 py-2 bg-indigo-50/50 hover:bg-indigo-50 flex items-start space-x-2.5 text-indigo-950 transition cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 flex items-center justify-between">
                        <span>Accreditation Guidebook</span>
                        <span className="px-1.5 py-0.2 rounded-xs bg-indigo-600 text-white text-[9px] font-bold">PDF</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Official framework standards &amp; criteria manual</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Language Selector Dropdown (English, Arabic RTL, French, German, Spanish) */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              id="navbar-language-selector-btn"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                activeLangOption.dir === 'rtl'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title={`Active Language: ${activeLangOption.name} (${activeLangOption.dir.toUpperCase()}). Click to switch language & text direction.`}
              aria-label={`Language selector. Current: ${activeLangOption.name}`}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-medium hidden sm:inline">{activeLangOption.flag}</span>
              <span className="hidden md:inline font-semibold">{activeLangOption.nativeName}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  activeLangOption.dir === 'rtl'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {activeLangOption.dir.toUpperCase()}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  langMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {langMenuOpen && (
              <div
                id="navbar-language-dropdown-menu"
                className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn text-xs"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Course & Interface Language</span>
                  <span className="text-indigo-600 font-mono">OBE360</span>
                </div>

                <div className="py-1">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = lang.name === activeLangName;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLangMenuOpen(false);
                          if (onLanguageChange) {
                            onLanguageChange(lang.name, lang.dir);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/70 text-indigo-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-base leading-none">{lang.flag}</span>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-slate-900">{lang.nativeName}</span>
                              <span className="text-[11px] text-slate-400 font-normal">({lang.name})</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Layout: {lang.dir === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              lang.dir === 'rtl'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {lang.dir.toUpperCase()}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-1.5 border-t border-slate-100 bg-slate-50/70 rounded-b-xl space-y-1">
                  {currentCourse && (
                    <button
                      type="button"
                      onClick={() => {
                        setLangMenuOpen(false);
                        window.dispatchEvent(new CustomEvent('open_translation_modal'));
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 font-semibold text-[11px] flex items-center space-x-2 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Translate Current Course with AI...</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setLangMenuOpen(false);
                      onNewCourse(activeLangName);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 font-medium text-[11px] flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>New Course in {activeLangOption.nativeName} ({activeLangName})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Institutional Sign In & Resources Dropdown */}
          <div className="relative" ref={userMenuRef}>
            {currentUser ? (
              <button
                type="button"
                id="navbar-user-profile-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-tr ${
                    currentUser.avatarColor || 'from-indigo-600 to-purple-600'
                  } text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="text-[11px] font-bold text-slate-800 max-w-[110px] truncate">
                    {currentUser.name.split(' ')[0]} {currentUser.name.split(' ').slice(-1)[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 capitalize">{currentUser.role}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  id="navbar-signin-btn"
                  onClick={() => {
                    if (onOpenSignIn) onOpenSignIn();
                    else window.dispatchEvent(new CustomEvent('open_signin_modal'));
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  id="navbar-more-options-btn"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  title="More resources, tour, and help"
                  aria-label="More options and resources"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn text-xs">
                {currentUser && (
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="text-[10px] text-indigo-600 font-semibold mt-0.5 truncate">
                      {currentUser.title || currentUser.role}
                    </div>
                    {currentUser.institution && (
                      <div className="text-[10px] text-slate-400 truncate">{currentUser.institution}</div>
                    )}
                  </div>
                )}

                <div className="py-1 border-b border-slate-100">
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenSignIn) onOpenSignIn();
                        else window.dispatchEvent(new CustomEvent('open_signin_modal'));
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Switch Academic Persona</span>
                    </button>
                  )}

                  {/* Direct Institutional & Governance Shortlinks */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigateDashboard();
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open_dashboard_tab', { detail: { tab: 'reviews' } }));
                      }, 50);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Accreditation Review Queue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigateDashboard();
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open_dashboard_tab', { detail: { tab: 'frameworks' } }));
                      }, 50);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Accreditation Frameworks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('download_framework_guidebook_pdf'));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900 flex items-center justify-between transition cursor-pointer"
                    title="Download complete Accreditation & OBE Frameworks Guidebook (PDF)"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Accreditation Guidebook (PDF)</span>
                    </div>
                    <Download className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigateDashboard();
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open_dashboard_tab', { detail: { tab: 'institution' } }));
                      }, 50);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Institutional Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigateDashboard();
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open_dashboard_tab', { detail: { tab: 'users' } }));
                      }, 50);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Personnel &amp; Roles</span>
                  </button>

                  {onNavigateMarketing && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (currentView === 'marketing') onNavigateDashboard();
                        else onNavigateMarketing();
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{currentView === 'marketing' ? 'Back to Dashboard' : 'Product Tour & Features'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onOpenLeadModal) onOpenLeadModal();
                      else window.dispatchEvent(new CustomEvent('open_lead_modal'));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Campus Demo &amp; Quotes</span>
                  </button>

                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenLeadManagement) onOpenLeadManagement();
                        else window.dispatchEvent(new CustomEvent('open_lead_management_modal'));
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <Building className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sales Inquiries / Leads</span>
                    </button>
                  )}

                  {onOpenFeedback && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenFeedback();
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
                      <span>Report Issue / Feedback</span>
                    </button>
                  )}
                </div>

                {currentUser ? (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenSignIn) onOpenSignIn();
                        else window.dispatchEvent(new CustomEvent('open_signin_modal'));
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-indigo-700 flex items-center space-x-2 transition cursor-pointer font-semibold"
                    >
                      <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sign In with Institutional ID</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {currentView === 'dashboard' ? (
            <button
              onClick={() => onNewCourse(activeLangName)}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          ) : currentView === 'marketing' ? (
            <button
              onClick={onNavigateDashboard}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Courses</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleCopilot}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  copilotOpen
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${copilotOpen ? 'text-white' : 'text-indigo-600'}`} />
                <span>OBE360 Copilot</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
