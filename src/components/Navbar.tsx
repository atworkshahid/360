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
  Phone,
  Lock,
} from 'lucide-react';
import { Course, CourseAuditReport } from '../types';
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
  onNewCourse: () => void;
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
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
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
            className="flex items-center gap-3 text-left group focus:outline-none"
            title="Return to MENTISERA OBE360 Dashboard"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-indigo-200">
              360
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">MENTISERA OBE360™</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium leading-none">Outcome-Based Course Creator</span>
            </div>
          </button>

          {currentView === 'creator' && (
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-200">
              <button
                onClick={onNavigateDashboard}
                className="text-xs flex items-center space-x-1 text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition"
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

        {/* Center / Stats (Active during Creator mode) - Recharts Ring, <70% Alert & Context Tooltip */}
        {currentView === 'creator' && auditReport && (
          <NavbarAuditWidget
            auditReport={auditReport}
            course={currentCourse}
            onJumpToAudit={onJumpToAudit || (() => {})}
            onAskCopilot={onAskCopilot}
          />
        )}

        {/* Right: Actions & Copilot */}
        <div className="flex items-center space-x-3">
          {/* Autosave status indicator in dashboard view or on mobile in creator view */}
          {autoSaveStatus && (
            <div className={currentView === 'creator' ? 'md:hidden' : 'hidden sm:block'}>
              <AutoSaveIndicator
                status={autoSaveStatus}
                lastSaved={autoSaveLastSaved ?? null}
                errorMessage={autoSaveError}
                onSaveNow={onSaveNow}
                compact={currentView === 'creator'}
                idPrefix="navbar-right-autosave"
              />
            </div>
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
                <span className="hidden md:inline">Download</span>
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
                </div>
              )}
            </div>
          )}

          {/* Institutional Sales / Request Demo CTA */}
          <button
            type="button"
            onClick={() => {
              if (onOpenLeadModal) {
                onOpenLeadModal();
              } else {
                window.dispatchEvent(new CustomEvent('open_lead_modal'));
              }
            }}
            className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 transition cursor-pointer shadow-2xs"
            title="Request institutional sales demo or campus license quote"
          >
            <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Campus Demo &amp; Sales</span>
          </button>

          {/* Feedback & Report Issue Direct Dev Button */}
          {onOpenFeedback && (
            <button
              id="navbar-feedback-btn"
              onClick={onOpenFeedback}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 transition cursor-pointer"
              title="Report an issue or send direct feedback to the engineering team"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">Feedback</span>
            </button>
          )}

          {/* Product Overview / Marketing Tour Button */}
          {onNavigateMarketing && (
            <button
              onClick={currentView === 'marketing' ? onNavigateDashboard : onNavigateMarketing}
              className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                currentView === 'marketing'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-indigo-50/70 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              title="View Product Features, Accreditation Matrix & Pricing"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentView === 'marketing' ? 'Back to App' : 'Product Tour'}</span>
            </button>
          )}

          {/* User Profile / Institutional Sign In Dropdown */}
          <div className="relative" ref={userMenuRef}>
            {currentUser ? (
              <button
                type="button"
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
              <button
                type="button"
                onClick={() => {
                  if (onOpenSignIn) onOpenSignIn();
                  else window.dispatchEvent(new CustomEvent('open_signin_modal'));
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sign In</span>
              </button>
            )}

            {userMenuOpen && currentUser && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn text-xs">
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

                <div className="py-1 border-b border-slate-100">
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

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onOpenLeadManagement) onOpenLeadManagement();
                      else window.dispatchEvent(new CustomEvent('open_lead_management_modal'));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Sales Inquiries / Leads</span>
                  </button>
                </div>

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
              </div>
            )}
          </div>

          {currentView === 'dashboard' ? (
            <button
              onClick={onNewCourse}
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
