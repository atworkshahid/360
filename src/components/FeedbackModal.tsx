import React, { useState, useEffect } from 'react';
import {
  X,
  LifeBuoy,
  Bug,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Copy,
  Check,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Info,
  Laptop,
  GraduationCap,
} from 'lucide-react';
import { Course } from '../types';
import {
  FeedbackCategory,
  FeedbackSeverity,
  FeedbackDiagnostics,
  FeedbackSubmission,
} from '../types/feedback';
import {
  buildDiagnostics,
  submitFeedback,
  getFeedbackHistory,
  deleteFeedbackFromHistory,
  clearAllFeedbackHistory,
  getSavedUserInfo,
  generateMailtoLink,
  downloadDiagnosticsFile,
} from '../services/feedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourse: Course | null;
  currentView?: 'dashboard' | 'creator' | 'marketing';
  activeWizardStep?: number;
  activeWorkflowMode?: 'obe10' | 'granular15';
  initialCategory?: FeedbackCategory;
  initialSubject?: string;
}

type TabType = 'form' | 'diagnostics' | 'history';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentCourse,
  currentView = 'creator' as 'dashboard' | 'creator' | 'marketing',
  activeWizardStep,
  activeWorkflowMode = 'obe10' as 'obe10' | 'granular15',
  initialCategory = 'bug',
  initialSubject = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [severity, setSeverity] = useState<FeedbackSeverity>('medium');

  // Contact Info
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // Form Content
  const [subject, setSubject] = useState<string>(initialSubject);
  const [description, setDescription] = useState<string>('');
  const [stepsToReproduce, setStepsToReproduce] = useState<string>('');
  const [expectedBehavior, setExpectedBehavior] = useState<string>('');
  const [actualBehavior, setActualBehavior] = useState<string>('');
  const [showDetailedBugFields, setShowDetailedBugFields] = useState<boolean>(initialCategory === 'bug');

  // Attachment controls
  const [includeCourseSnapshot, setIncludeCourseSnapshot] = useState<boolean>(true);
  const [includeSystemTelemetry, setIncludeSystemTelemetry] = useState<boolean>(true);

  // States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<FeedbackSubmission | null>(null);
  const [apiResponseSla, setApiResponseSla] = useState<string | null>(null);

  // UI helpers
  const [copiedDiagnostics, setCopiedDiagnostics] = useState<boolean>(false);
  const [copiedTicketId, setCopiedTicketId] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<FeedbackSubmission[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Load saved user info & history on open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedUserInfo();
      if (saved.name) setUserName(saved.name);
      if (saved.email) setUserEmail(saved.email);
      setHistoryItems(getFeedbackHistory());
      setValidationError(null);
      setSubmittedTicket(null);
      if (initialSubject) setSubject(initialSubject);
      if (initialCategory) {
        setCategory(initialCategory);
        setShowDetailedBugFields(initialCategory === 'bug');
      }
    }
  }, [isOpen, initialCategory, initialSubject]);

  // Update bug fields toggle when category changes
  const handleCategorySelect = (newCategory: FeedbackCategory) => {
    setCategory(newCategory);
    if (newCategory === 'bug') {
      setShowDetailedBugFields(true);
      if (severity === 'low') setSeverity('medium');
    }
  };

  // Build live diagnostics preview
  const currentDiagnostics = buildDiagnostics(currentCourse, {
    includeCourseSnapshot,
    includeSystemTelemetry,
    currentView,
    activeWizardStep,
    activeWorkflowMode,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!subject.trim()) {
      setValidationError('Please enter a brief subject summary.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setValidationError('Please provide a detailed description (minimum 10 characters).');
      return;
    }

    if (userEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      setValidationError('Please provide a valid email address so the team can reply.');
      return;
    }

    setIsSubmitting(true);

    try {
      const diagnostics = buildDiagnostics(currentCourse, {
        includeCourseSnapshot,
        includeSystemTelemetry,
        currentView,
        activeWizardStep,
        activeWorkflowMode,
      });

      const result = await submitFeedback({
        category,
        severity,
        userName: userName.trim() || 'Faculty User',
        userEmail: userEmail.trim() || 'no-email@mentisera.org',
        subject: subject.trim(),
        description: description.trim(),
        stepsToReproduce: stepsToReproduce.trim() || undefined,
        expectedBehavior: expectedBehavior.trim() || undefined,
        actualBehavior: actualBehavior.trim() || undefined,
        includeCourseSnapshot,
        includeSystemTelemetry,
        diagnostics,
      });

      setSubmittedTicket(result.submission);
      setApiResponseSla(result.apiResponse?.slaMessage || null);
      setHistoryItems(getFeedbackHistory());
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setValidationError('Failed to submit feedback. You can use the "Email Dev Team" option instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyDiagnostics = () => {
    try {
      const str = JSON.stringify(currentDiagnostics, null, 2);
      navigator.clipboard.writeText(str);
      setCopiedDiagnostics(true);
      setTimeout(() => setCopiedDiagnostics(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleCopyTicket = (ticketNum: string) => {
    try {
      navigator.clipboard.writeText(ticketNum);
      setCopiedTicketId(true);
      setTimeout(() => setCopiedTicketId(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setSubject('');
    setDescription('');
    setStepsToReproduce('');
    setExpectedBehavior('');
    setActualBehavior('');
    setValidationError(null);
    setActiveTab('form');
  };

  const subjectSuggestions = [
    'Audit score discrepancy in Step 9',
    'Active learning engagement meter issue',
    'IMS Common Cartridge import in Canvas',
    'CLO Bloom verb measurability check',
    'Course syllabus PDF layout format',
  ];

  return (
    <div
      id="feedback-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-400/30">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="feedback-modal-title" className="text-base font-bold text-white tracking-tight">
                  Developer Support & Issue Reporting
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Direct Line
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Communicate directly with the MENTISERA engineering team with live course state capture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'form'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Report Issue / Feedback</span>
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Course State & Telemetry</span>
              {currentCourse && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My Submissions</span>
              {historyItems.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  {historyItems.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[11px] text-slate-500 space-x-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>dev-team@mentisera.org</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {/* SUCCESS SCREEN */}
          {submittedTicket ? (
            <div className="py-6 text-center max-w-lg mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Feedback Logged Successfully</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your issue report and course state snapshot have been transmitted to the development team.
                </p>
              </div>

              {/* Ticket Reference Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tracking Reference ID
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-base font-mono font-bold text-indigo-700">
                        {submittedTicket.ticketNumber}
                      </span>
                      <button
                        onClick={() => handleCopyTicket(submittedTicket.ticketNumber)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition text-xs flex items-center space-x-1"
                        title="Copy ticket reference ID"
                      >
                        {copiedTicketId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        submittedTicket.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : submittedTicket.severity === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {submittedTicket.severity.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium">Subject:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[260px]">
                      {submittedTicket.subject}
                    </span>
                  </div>
                  {submittedTicket.diagnostics.courseSummary && (
                    <div className="flex justify-between text-slate-600">
                      <span className="font-medium">Attached Course:</span>
                      <span className="font-semibold text-slate-800">
                        {submittedTicket.diagnostics.courseSummary.code} -{' '}
                        {submittedTicket.diagnostics.courseSummary.title}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span className="font-medium">Direct Reply To:</span>
                    <span className="font-semibold text-slate-800">{submittedTicket.userEmail}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                  <p className="text-emerald-800 font-medium">
                    {apiResponseSla ||
                      'Standard SLA: The development & pedagogical team will inspect the course state and respond within 4 business hours.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => downloadDiagnosticsFile(submittedTicket.diagnostics, currentCourse?.code)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Diagnostics JSON</span>
                </button>
                <a
                  href={generateMailtoLink(submittedTicket)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open in Mail Client</span>
                </a>
                <button
                  onClick={handleResetForm}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition cursor-pointer"
                >
                  <span>Submit Another Report</span>
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <span>Close Window</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'form' ? (
            /* TAB 1: FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Active Course Snapshot Banner */}
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700">
                        Course Context Captured
                      </span>
                      {currentCourse?.status && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white text-indigo-800 border border-indigo-200 uppercase">
                          {currentCourse.status}
                        </span>
                      )}
                    </div>
                    {currentCourse ? (
                      <p className="text-xs font-semibold text-slate-800 truncate" title={currentCourse.title}>
                        {currentCourse.code || 'CODE'}: {currentCourse.title}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600 italic">No specific course active (General workspace mode)</p>
                    )}
                  </div>
                </div>

                {currentCourse && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="hidden sm:flex flex-col text-right text-[11px] text-slate-600">
                      <span>Audit: <strong>{currentDiagnostics.courseSummary?.auditScore ?? 100}%</strong></span>
                      <span className="text-slate-400 text-[10px]">
                        {currentCourse.clos?.length || 0} CLOs • {currentCourse.modules?.length || 0} Modules
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('diagnostics')}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition cursor-pointer"
                    >
                      Inspect JSON
                    </button>
                  </div>
                )}
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Feedback Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'bug', label: 'Bug / Technical Issue', icon: Bug, color: 'text-rose-600' },
                    { id: 'curriculum_obe', label: 'OBE / Alignment Logic', icon: ShieldCheck, color: 'text-indigo-600' },
                    { id: 'feature_request', label: 'Feature Request', icon: Sparkles, color: 'text-amber-600' },
                    { id: 'export_import', label: 'LMS / Export Failure', icon: FileText, color: 'text-blue-600' },
                    { id: 'ui_usability', label: 'UI / Workflow Polish', icon: Laptop, color: 'text-emerald-600' },
                    { id: 'general', label: 'General Feedback', icon: LifeBuoy, color: 'text-slate-600' },
                  ].map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id as FeedbackCategory)}
                        className={`flex items-center space-x-2 p-2.5 rounded-lg border text-left text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : cat.color}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity & Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as FeedbackSeverity)}
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low (Cosmetic / Inquiry)</option>
                    <option value="medium">Medium (Normal Issue)</option>
                    <option value="high">High (Feature Malfunction)</option>
                    <option value="critical">Critical Blocker (Cannot Proceed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email for Dev Reply
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@university.edu"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subject / Issue Summary <span className="text-rose-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of the issue or suggestion..."
                  className="w-full text-xs rounded-lg border border-slate-200 px-3.5 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />

                {/* Quick Subject Chips */}
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Suggestions:</span>
                  {subjectSuggestions.map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSubject(sugg)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    category === 'bug'
                      ? 'What were you doing when the issue occurred? What did you observe?'
                      : category === 'curriculum_obe'
                      ? 'Describe your question or recommendation regarding Bloom’s verbs, CLO-PLO matrix, or accreditation standards...'
                      : 'Please describe your suggestions or ideas in detail...'
                  }
                  className="w-full text-xs rounded-lg border border-slate-200 p-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                  <span>Minimum 10 characters</span>
                  <span>{description.length} characters</span>
                </div>
              </div>

              {/* Optional Detailed Bug Reproduction Fields */}
              {category === 'bug' && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDetailedBugFields(!showDetailedBugFields)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Bug className="w-3.5 h-3.5 text-slate-500" />
                      <span>Steps to Reproduce & Expected Behavior (Optional but Recommended)</span>
                    </span>
                    {showDetailedBugFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showDetailedBugFields && (
                    <div className="p-3.5 bg-white space-y-3 border-t border-slate-200 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Steps to Reproduce:
                        </label>
                        <input
                          type="text"
                          value={stepsToReproduce}
                          onChange={(e) => setStepsToReproduce(e.target.value)}
                          placeholder="e.g. 1. Go to Step 7 -> 2. Click Add TLA -> 3. Select Hands-on Lab"
                          className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Expected Behavior:
                          </label>
                          <input
                            type="text"
                            value={expectedBehavior}
                            onChange={(e) => setExpectedBehavior(e.target.value)}
                            placeholder="e.g. Active learning meter should increase to 55%"
                            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Actual Behavior:
                          </label>
                          <input
                            type="text"
                            value={actualBehavior}
                            onChange={(e) => setActualBehavior(e.target.value)}
                            placeholder="e.g. Percentage stayed at 42% or threw an alert"
                            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attachment / Privacy Toggles */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeCourseSnapshot}
                      onChange={(e) => setIncludeCourseSnapshot(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">
                        Capture current course state & alignment data
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Attaches CLOs, weekly modules, assessment plans & audit results for debugging
                      </p>
                    </div>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                    Recommended
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeSystemTelemetry}
                      onChange={(e) => setIncludeSystemTelemetry(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Include browser & system metadata</span>
                      <p className="text-[11px] text-slate-500">
                        Browser version, screen resolution, and current wizard step ({activeWizardStep || 'N/A'})
                      </p>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('diagnostics')}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    View payload
                  </button>
                </div>
              </div>

              {/* Validation Warning */}
              {validationError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Form Footer Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => downloadDiagnosticsFile(currentDiagnostics, currentCourse?.code)}
                    className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    title="Download diagnostics JSON to your machine"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <a
                    href={generateMailtoLink({
                      subject,
                      description,
                      stepsToReproduce,
                      expectedBehavior,
                      actualBehavior,
                      category,
                      severity,
                      userName,
                      userEmail,
                      diagnostics: currentDiagnostics,
                    })}
                    className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 transition cursor-pointer"
                    title="Send via your desktop email client"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Dev Team</span>
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-200 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending to Dev Team...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit to Development Team</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : activeTab === 'diagnostics' ? (
            /* TAB 2: DIAGNOSTICS PREVIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Captured Course State & Diagnostics</h3>
                  <p className="text-xs text-slate-500">
                    Exact telemetry payload that will accompany your report to reproduce issues
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyDiagnostics}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    {copiedDiagnostics ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => downloadDiagnosticsFile(currentDiagnostics, currentCourse?.code)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              {/* Course State Summary Grid */}
              {currentDiagnostics.courseSummary ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Course Identifier</span>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentDiagnostics.courseSummary.code || 'N/A'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{currentDiagnostics.courseSummary.title}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Audit Compliance</span>
                    <p className="text-xs font-bold text-indigo-700">
                      {currentDiagnostics.courseSummary.auditScore ?? 100}% Score
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {currentDiagnostics.courseSummary.auditCriticalGaps} Critical Gaps
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Curriculum Scope</span>
                    <p className="text-xs font-bold text-slate-900">
                      {currentDiagnostics.courseSummary.closCount} CLOs • {currentDiagnostics.courseSummary.modulesCount} Modules
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {currentDiagnostics.courseSummary.lessonsCount} Total Lessons
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Assessments</span>
                    <p className="text-xs font-bold text-slate-900">
                      {currentDiagnostics.courseSummary.assessmentsCount} Tasks ({currentDiagnostics.courseSummary.totalAssessmentWeightage}%)
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Active Learning: {currentDiagnostics.courseSummary.activeLearningPercentage ?? 50}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  No active course loaded. System environment and workspace storage telemetry are captured.
                </div>
              )}

              {/* JSON Code Viewer */}
              <div className="relative rounded-lg bg-slate-900 text-slate-200 p-4 font-mono text-[11px] overflow-x-auto max-h-[380px] border border-slate-800">
                <pre>{JSON.stringify(currentDiagnostics, null, 2)}</pre>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Environment: {currentDiagnostics.browserLanguage} • Viewport: {currentDiagnostics.viewportSize}
                </span>
                <button
                  onClick={() => setActiveTab('form')}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  ← Back to Report Form
                </button>
              </div>
            </div>
          ) : (
            /* TAB 3: SUBMISSION HISTORY */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Your Submitted Tickets</h3>
                  <p className="text-xs text-slate-500">
                    Recent issue reports and feedback sent from this browser session
                  </p>
                </div>
                {historyItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all feedback history stored on this computer?')) {
                        clearAllFeedbackHistory();
                        setHistoryItems([]);
                      }
                    }}
                    className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {historyItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <LifeBuoy className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No previous reports found in this browser.</p>
                  <button
                    onClick={() => setActiveTab('form')}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Submit a new issue or feature request →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((item) => {
                    const isExpanded = expandedHistoryId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs hover:border-slate-300 transition"
                      >
                        <div
                          onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
                        >
                          <div className="space-y-1 min-w-0 pr-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold text-indigo-700">
                                {item.ticketNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  item.severity === 'critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : item.severity === 'high'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {item.severity}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-900 truncate">{item.subject}</h4>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Received
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-slate-50/60 border-t border-slate-200 text-xs space-y-3">
                            <div>
                              <span className="text-[11px] font-bold text-slate-600 block mb-0.5">Description:</span>
                              <p className="text-slate-800 whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200">
                                {item.description}
                              </p>
                            </div>

                            {item.diagnostics.courseSummary && (
                              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <span className="font-bold text-slate-700">Course Snapshot at Time of Report:</span>
                                <p>
                                  {item.diagnostics.courseSummary.code} - {item.diagnostics.courseSummary.title} (
                                  {item.diagnostics.courseSummary.closCount} CLOs, Audit Score:{' '}
                                  {item.diagnostics.courseSummary.auditScore ?? 'N/A'}%)
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => downloadDiagnosticsFile(item.diagnostics, item.diagnostics.courseSummary?.code)}
                                className="inline-flex items-center space-x-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>Export Captured Diagnostics</span>
                              </button>

                              <button
                                onClick={() => {
                                  deleteFeedbackFromHistory(item.id);
                                  setHistoryItems(getFeedbackHistory());
                                }}
                                className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                              >
                                Remove record
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
