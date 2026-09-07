import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, CheckCircle2, BookOpen, Layers, Plus, ArrowLeft } from 'lucide-react';
import { Course, CourseAuditReport } from '../types';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { AutoSaveStatus } from '../hooks/useAutosave';
import { NavbarAuditWidget } from './NavbarAuditWidget';

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
  autoSaveStatus?: AutoSaveStatus;
  autoSaveLastSaved?: Date | null;
  autoSaveError?: string | null;
  onSaveNow?: () => void;
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
  autoSaveStatus,
  autoSaveLastSaved,
  autoSaveError,
  onSaveNow,
}) => {
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
