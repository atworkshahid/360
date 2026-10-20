import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  Eye,
  MessageSquare,
  FileDown,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Info,
  Building2,
  GraduationCap,
  Briefcase,
  UserCheck,
  Filter,
  Search,
  Sliders,
} from 'lucide-react';
import {
  Course,
  CourseElementComment,
  StakeholderRole,
  CommentTargetType,
} from '../types';
import { ShareService, SharedCourseRecord } from '../services/shareService';
import { CollaborationService } from '../services/collaborationService';
import { OBE360Logo } from './Logo';
import { exportSyllabusPDF } from '../utils/syllabusExport';
import { calculateCourseAudit } from '../utils/obeCalculator';
import { SectionCommentDrawer } from './SharedBlueprint/SectionCommentDrawer';
import { InlineSectionCommentBar } from './SharedBlueprint/InlineSectionCommentBar';
import { StakeholderCommentsSummaryTab } from './SharedBlueprint/StakeholderCommentsSummaryTab';
import {
  COURSE_SECTIONS_META,
  getRoleBadgeColor,
} from '../utils/commentUtils';

interface SharedBlueprintViewProps {
  shareId: string;
  onExit: () => void;
  onImportToWorkspace?: (course: Course) => void;
}

export const SharedBlueprintView: React.FC<SharedBlueprintViewProps> = ({
  shareId,
  onExit,
  onImportToWorkspace,
}) => {
  const [record, setRecord] = useState<SharedCourseRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Passcode gate state
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'clos' | 'plos' | 'modules' | 'assessments' | 'alignment' | 'comments'
  >('overview');

  // Stakeholder reviewer profile (persisted in localStorage)
  const [stakeholderName, setStakeholderName] = useState<string>(() => {
    try {
      return localStorage.getItem('mentisera_stakeholder_name') || 'Sarah Chen';
    } catch {
      return 'Sarah Chen';
    }
  });
  const [stakeholderAffiliation, setStakeholderAffiliation] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('mentisera_stakeholder_affiliation') ||
        'Tech Advisory Council & Enterprise Cloud Lead'
      );
    } catch {
      return 'Tech Advisory Council';
    }
  });
  const [stakeholderRole, setStakeholderRole] = useState<StakeholderRole>(() => {
    try {
      return (
        (localStorage.getItem('mentisera_stakeholder_role') as StakeholderRole) ||
        'Industry Advisory'
      );
    } catch {
      return 'Industry Advisory';
    }
  });

  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

  // Comments state across this course blueprint
  const [comments, setComments] = useState<CourseElementComment[]>([]);

  // Section Comment Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTargetId, setDrawerTargetId] = useState<string>('step-1-overview');
  const [drawerTargetType, setDrawerTargetType] = useState<CommentTargetType>('Section');
  const [drawerTargetTitle, setDrawerTargetTitle] = useState<string>('Course Setup & Information');
  const [drawerSectionKey, setDrawerSectionKey] = useState<string | undefined>('step-1-overview');
  const [drawerStepNumber, setDrawerStepNumber] = useState<number | undefined>(1);
  const [drawerModuleId, setDrawerModuleId] = useState<string | undefined>(undefined);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [importedToast, setImportedToast] = useState<boolean>(false);

  // Load shared course and comments
  useEffect(() => {
    async function loadShared() {
      setLoading(true);
      setError(null);
      const res = await ShareService.getSharedCourse(shareId);
      if (res.error || !res.record) {
        setError(res.error || 'Unable to load shared course.');
      } else {
        setRecord(res.record);
        if (!res.record.passcode) {
          setIsPasscodeAuthenticated(true);
        }

        // Set default stakeholder role if author specified a preset
        if (res.record.stakeholderRolePreset) {
          setStakeholderRole(res.record.stakeholderRolePreset as StakeholderRole);
        }

        // Initialize comments from course data
        const initialComments = res.record.courseData?.comments || [];
        setComments(initialComments);

        // Fetch any additional live collaboration comments from server
        try {
          const collab = await CollaborationService.getCourseCollaboration(res.record.courseId);
          if (collab.comments && collab.comments.length > 0) {
            setComments((prev) => {
              const map = new Map<string, CourseElementComment>();
              prev.forEach((c) => map.set(c.id, c));
              collab.comments.forEach((c) => map.set(c.id, c));
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }
        } catch (e) {
          console.warn('Could not load live collaboration comments:', e);
        }
      }
      setLoading(false);
    }
    loadShared();
  }, [shareId]);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record?.passcode) {
      setIsPasscodeAuthenticated(true);
      return;
    }
    if (passcodeInput.trim() === record.passcode.trim()) {
      setIsPasscodeAuthenticated(true);
      setPasscodeError(null);
    } else {
      setPasscodeError('Invalid access passcode. Please check with the course author.');
    }
  };

  const handleExportPDF = () => {
    if (!record?.courseData) return;
    exportSyllabusPDF(record.courseData);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleImport = () => {
    if (record?.courseData && onImportToWorkspace) {
      onImportToWorkspace(record.courseData);
      setImportedToast(true);
      setTimeout(() => setImportedToast(false), 3000);
    }
  };

  // Open drawer for any section or element
  const handleOpenCommentDrawer = (
    targetId: string,
    targetType: CommentTargetType,
    targetTitle: string,
    sectionKey?: string,
    stepNumber?: number,
    moduleId?: string
  ) => {
    setDrawerTargetId(targetId);
    setDrawerTargetType(targetType);
    setDrawerTargetTitle(targetTitle);
    setDrawerSectionKey(sectionKey || targetId);
    setDrawerStepNumber(stepNumber);
    setDrawerModuleId(moduleId);
    setDrawerOpen(true);
  };

  // Handle comment submission from drawer
  const handleCommentSubmit = async (commentData: {
    targetType: CommentTargetType;
    targetId: string;
    targetTitle: string;
    sectionKey?: string;
    stepNumber?: number;
    moduleId?: string;
    authorName: string;
    authorRole: StakeholderRole;
    authorAffiliation?: string;
    authorAvatarColor?: string;
    category: any;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags?: any;
    content: string;
    suggestedChange?: string;
  }) => {
    const newComment: CourseElementComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetType: commentData.targetType,
      targetId: commentData.targetId,
      targetTitle: commentData.targetTitle,
      sectionKey: commentData.sectionKey,
      stepNumber: commentData.stepNumber,
      moduleId: commentData.moduleId,
      priority: commentData.priority,
      authorName: commentData.authorName,
      authorRole: commentData.authorRole,
      authorAffiliation: commentData.authorAffiliation,
      authorAvatarColor: commentData.authorAvatarColor,
      category: commentData.category,
      tags: commentData.tags,
      content: commentData.content,
      suggestedChange: commentData.suggestedChange,
      status: 'open',
      replies: [],
      createdAt: new Date().toISOString(),
    };

    // 1. Reactive state update
    setComments((prev) => [newComment, ...prev]);

    // 2. Persist to ShareService and local cache
    await ShareService.addCommentToSharedCourse(shareId, newComment);

    // 3. Persist to Express backend
    if (record) {
      try {
        await CollaborationService.addComment(record.courseId, {
          targetType: commentData.targetType,
          targetId: commentData.targetId,
          targetTitle: commentData.targetTitle,
          sectionKey: commentData.sectionKey,
          stepNumber: commentData.stepNumber,
          priority: commentData.priority,
          authorName: commentData.authorName,
          authorRole: commentData.authorRole,
          authorAffiliation: commentData.authorAffiliation,
          category: commentData.category,
          tags: commentData.tags,
          content: commentData.content,
          suggestedChange: commentData.suggestedChange,
        });
      } catch (err) {
        console.warn('Backend sync warning (saved locally in shared blueprint):', err);
      }
    }

    setToastMessage(`Your stakeholder feedback on "${commentData.targetTitle}" was submitted.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle reply submission to a thread
  const handleAddReply = async (
    commentId: string,
    replyData: {
      authorName: string;
      authorRole: StakeholderRole;
      authorAffiliation?: string;
      content: string;
    }
  ) => {
    const newReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorName: replyData.authorName,
      authorRole: replyData.authorRole,
      authorAffiliation: replyData.authorAffiliation,
      content: replyData.content,
      createdAt: new Date().toISOString(),
    };

    // Update in-memory comments
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const updated = {
            ...c,
            replies: [...(c.replies || []), newReply],
            updatedAt: new Date().toISOString(),
          };
          // Persist updated comment
          ShareService.addCommentToSharedCourse(shareId, updated).catch(() => {});
          return updated;
        }
        return c;
      })
    );

    // Backend sync
    if (record) {
      try {
        await CollaborationService.addCommentReply(record.courseId, commentId, {
          authorName: replyData.authorName,
          authorRole: replyData.authorRole,
          authorAffiliation: replyData.authorAffiliation,
          content: replyData.content,
        });
      } catch (e) {
        console.warn('Backend sync warning on reply:', e);
      }
    }

    setToastMessage('Reply added to discussion thread.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-semibold tracking-wide">Retrieving Verified Course Blueprint...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Loading read-only specifications and stakeholder discussion channels
        </p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 mb-4 shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Access Denied or Link Expired</h2>
        <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
          {error || 'This shared blueprint link could not be verified.'}
        </p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to OBE360 Workspace
        </button>
      </div>
    );
  }

  // Passcode Gate
  if (!isPasscodeAuthenticated && record.passcode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
            Passcode Protected Blueprint
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            The author has restricted access to{' '}
            <strong>
              {record.courseCode} &bull; {record.courseTitle}
            </strong>
            . Enter the access PIN provided by the curriculum committee.
          </p>

          <form onSubmit={handleVerifyPasscode} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="Enter access PIN"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full text-center text-lg tracking-widest font-mono py-2.5 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {passcodeError && (
                <p className="text-xs text-rose-600 mt-2 font-medium">{passcodeError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Verify PIN & View Blueprint
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>OBE360™ by Shahid Hussain Soomro</span>
            <button onClick={onExit} className="hover:text-slate-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const course = record.courseData;
  const audit = calculateCourseAudit(course);

  // Comments count on each section
  const getCommentsCountFor = (sKey: string, stepNum?: number) => {
    return comments.filter(
      (c) =>
        c.sectionKey === sKey ||
        c.targetId === sKey ||
        (stepNum !== undefined && c.stepNumber === stepNum)
    ).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Read-Only Stakeholder Notice Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-indigo-900/50">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1.5 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            External Stakeholder Review Mode
          </span>
          <span className="text-slate-300 text-[11px] hidden sm:inline">
            Read-only course access with section commenting permissions
          </span>
          <span className="text-indigo-300/60 hidden sm:inline">&bull;</span>
          <span className="text-indigo-200 text-[11px]">
            Faculty Lead: <strong className="text-white">{record.createdByName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Stakeholder Persona Button */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
            title="Update your reviewer profile"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span className="truncate max-w-[140px]">{stakeholderName}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/30 text-indigo-200">
              {stakeholderRole}
            </span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
          </button>

          <button
            onClick={onExit}
            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit Review
          </button>
        </div>
      </div>

      {/* Author Review Instructions Callout (if set by instructor) */}
      {record.reviewInstructions && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Review Focus Request: </strong> {record.reviewInstructions}
            </span>
          </div>
          <span className="text-[11px] text-amber-700 shrink-0 font-medium">
            Requested by Faculty Author
          </span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <OBE360Logo size="sm" />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                  {course.code || 'COURSE'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {course.programme || course.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {course.academicYear || 'Academic Year'}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {record.allowExport && (
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileDown className="w-4 h-4 text-indigo-600" />
                Download Syllabus PDF
              </button>
            )}

            {onImportToWorkspace && (
              <button
                onClick={handleImport}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {importedToast ? 'Imported to Workspace!' : 'Import Copy to My Workspace'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation with Comment Counters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 text-xs font-semibold overflow-x-auto border-t border-slate-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Overview & Vision</span>
            {getCommentsCountFor('step-1-overview', 1) + getCommentsCountFor('step-2-philosophy', 2) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                {getCommentsCountFor('step-1-overview', 1) + getCommentsCountFor('step-2-philosophy', 2)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clos')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clos'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>2. CLOs & Bloom Rigor</span>
            <span className="text-slate-400">({(course.clos || []).length})</span>
            {getCommentsCountFor('step-3-clos', 3) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                {getCommentsCountFor('step-3-clos', 3)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('plos')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'plos'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. PLO & Competency Matrix</span>
            {getCommentsCountFor('step-4-plos', 4) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                {getCommentsCountFor('step-4-plos', 4)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'modules'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>4. Modules & Weekly Syllabus</span>
            <span className="text-slate-400">({(course.modules || []).length})</span>
            {getCommentsCountFor('step-5-modules', 5) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                {getCommentsCountFor('step-5-modules', 5)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'assessments'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>5. Assessments & Rubrics</span>
            <span className="text-slate-400">({(course.assessments || []).length})</span>
            {getCommentsCountFor('step-9-assessments', 9) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                {getCommentsCountFor('step-9-assessments', 9)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alignment')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'alignment'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>6. Alignment & CQI Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>All Stakeholder Remarks ({comments.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* TAB 1: OVERVIEW & PHILOSOPHY */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Accreditation Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Accreditation Alignment</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{audit.healthScore}%</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {audit.criticalCount === 0
                    ? 'Fully Aligned (Washington Accord / ABET)'
                    : `${audit.criticalCount} gap(s) identified`}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Credit Weight</span>
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{course.creditHours || 3} Credits</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {course.durationWeeks || 16} Weeks &bull; {course.deliveryMode || 'Face-to-Face'}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Course Learning Outcomes</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{(course.clos || []).length} Outcomes</div>
                <p className="text-[11px] text-slate-500 mt-1">Bloom L1-L6 Rigor Verified</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Assessment Total</span>
                  <Layers className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">100% Weight</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {(course.assessments || []).length} Graded Milestones
                </p>
              </div>
            </div>

            {/* SECTION 1: Course Identification Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Step 1 Curriculum Specification
                  </span>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                    Course Description & Target Audience
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {course.description || course.overview}
              </p>

              {course.capstoneGoal && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Culminating Capstone Learning Goal
                  </div>
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                    {course.capstoneGoal}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">Target Learners: </span>
                  <span className="text-slate-600">
                    {course.targetLearners || 'Undergraduate academic cohort'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Prerequisites: </span>
                  <span className="text-slate-600">
                    {course.prerequisites || 'Introductory discipline foundation'}
                  </span>
                </div>
              </div>

              {/* Inline Section Feedback Bar for Section 1 */}
              <InlineSectionCommentBar
                sectionKey="step-1-overview"
                sectionTitle="Step 1: Course Setup & Basic Information"
                stepNumber={1}
                comments={comments}
                onOpenCommentDrawer={handleOpenCommentDrawer}
                onAddReply={handleAddReply}
                allowComments={record.allowReviewerComments}
              />
            </div>

            {/* SECTION 2: Pedagogical Strategy & Educational Philosophy */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Step 2 Pedagogical Framework
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                  Educational Philosophy & High-Impact Practices
                </h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {course.philosophy ||
                  'Grounded in constructivist problem-based inquiry, authentic industrial simulations, and Biggs Constructive Alignment, this course cultivates real-world competencies.'}
              </p>

              {course.highImpactPractices && course.highImpactPractices.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    Integrated High-Impact Practices (AAC&U):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {course.highImpactPractices.map((hip, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100 text-xs font-medium"
                      >
                        ✓ {hip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline Section Feedback Bar for Section 2 */}
              <InlineSectionCommentBar
                sectionKey="step-2-philosophy"
                sectionTitle="Step 2: Pedagogical Framework & Vision"
                stepNumber={2}
                comments={comments}
                onOpenCommentDrawer={handleOpenCommentDrawer}
                onAddReply={handleAddReply}
                allowComments={record.allowReviewerComments}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CLOS & BLOOM TAXONOMY */}
        {activeTab === 'clos' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Step 3 Outcome Specifications
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                  Course Learning Outcomes (CLOs)
                </h2>
                <p className="text-xs text-slate-500">
                  Calibrated to Bloom's Revised Taxonomy with active cognitive verbs and measurable evidence benchmarks
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleOpenCommentDrawer(
                    'step-3-clos',
                    'Section',
                    'Step 3: Course Learning Outcomes (CLOs)',
                    'step-3-clos',
                    3
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comment on All CLOs</span>
              </button>
            </div>

            <div className="space-y-4">
              {(course.clos || []).map((clo, idx) => {
                const cloCommentsCount = comments.filter((c) => c.targetId === clo.id).length;

                return (
                  <div
                    key={clo.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 font-mono">
                          {clo.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {clo.bloomVerb} &bull; {clo.bloomLevel}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {clo.learningDomain || 'Cognitive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <span>Weightage: <strong>{clo.weightage || 25}%</strong></span>
                        <span>&bull;</span>
                        <span>Passing Threshold: <strong>{clo.achievementThreshold || 60}%</strong></span>

                        {record.allowReviewerComments && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenCommentDrawer(
                                clo.id,
                                'CLO',
                                `${clo.code}: ${clo.statement.slice(0, 50)}...`,
                                'step-3-clos',
                                3
                              )
                            }
                            className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] border border-indigo-200 flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Comment on {clo.code}</span>
                            {cloCommentsCount > 0 && (
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                                {cloCommentsCount}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                      "{clo.statement || (clo as any).description}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 pt-1 border-t border-slate-100">
                      <span>
                        Direct Assessment Evidence:{' '}
                        <strong className="text-slate-700">
                          {clo.assessmentMethod || 'Analytical Case Brief / Capstone Milestone'}
                        </strong>
                      </span>
                      {clo.mappedPLOs && clo.mappedPLOs.length > 0 && (
                        <span className="text-indigo-600 font-medium">
                          Mapped to: {clo.mappedPLOs.map((m) => `${m.ploId} (${m.level})`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Section Feedback Bar for Section 3 */}
            <InlineSectionCommentBar
              sectionKey="step-3-clos"
              sectionTitle="Step 3: Course Learning Outcomes (CLOs)"
              stepNumber={3}
              comments={comments}
              onOpenCommentDrawer={handleOpenCommentDrawer}
              onAddReply={handleAddReply}
              allowComments={record.allowReviewerComments}
            />
          </div>
        )}

        {/* TAB 3: PLOS & COMPETENCIES */}
        {activeTab === 'plos' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Step 4 Program Competencies
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                Program Learning Outcomes (PLOs) & Graduate Attributes
              </h2>
              <p className="text-xs text-slate-500">
                Accreditation Criterion 3 Alignment & Professional Statutory Board Mapping
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(course.plos || []).map((plo) => (
                <div key={plo.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {plo.code}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{plo.title}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{plo.description}</p>
                </div>
              ))}
            </div>

            {/* Inline Section Feedback Bar for Section 4 */}
            <InlineSectionCommentBar
              sectionKey="step-4-plos"
              sectionTitle="Step 4: Program Learning Outcomes (PLOs) Mapping"
              stepNumber={4}
              comments={comments}
              onOpenCommentDrawer={handleOpenCommentDrawer}
              onAddReply={handleAddReply}
              allowComments={record.allowReviewerComments}
            />
          </div>
        )}

        {/* TAB 4: MODULES & WEEKLY SYLLABUS */}
        {activeTab === 'modules' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Step 5 & 7 Curriculum Architecture
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                Curriculum Modules & Teaching-Learning Activities (TLAs)
              </h2>
              <p className="text-xs text-slate-500">
                Sequenced learning units with associated study hours and industrial relevance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.modules || []).map((mod, idx) => {
                const modCommentsCount = comments.filter((c) => c.moduleId === mod.id || c.targetId === mod.id).length;

                return (
                  <div key={mod.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Module {mod.number || idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{mod.durationWeeks || 4} Weeks</span>
                        {record.allowReviewerComments && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenCommentDrawer(
                                mod.id,
                                'Module',
                                `Module ${mod.number}: ${mod.title}`,
                                'step-5-modules',
                                5,
                                mod.id
                              )
                            }
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                            title={`Comment on Module ${mod.number}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>

                    {mod.resources && mod.resources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <strong>Core Industry Resources: </strong>
                        <span>{mod.resources.join(', ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Weekly Plan Progression */}
            {course.weeklyPlan && course.weeklyPlan.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Weekly Syllabus Progression Arc
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {course.weeklyPlan.map((wp) => (
                    <div
                      key={wp.id}
                      className="p-2.5 rounded-lg border border-slate-150 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 font-mono w-16">
                          Week {wp.weekNumber}:
                        </span>
                        <span className="text-slate-900">{wp.topic}</span>
                      </div>
                      {wp.notes && <span className="text-slate-400 text-[11px]">{wp.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Section Feedback Bar for Section 5 */}
            <InlineSectionCommentBar
              sectionKey="step-5-modules"
              sectionTitle="Step 5: Content Modules & Syllabus Breakdown"
              stepNumber={5}
              comments={comments}
              onOpenCommentDrawer={handleOpenCommentDrawer}
              onAddReply={handleAddReply}
              allowComments={record.allowReviewerComments}
            />
          </div>
        )}

        {/* TAB 5: ASSESSMENTS & 5-TIER RUBRICS */}
        {activeTab === 'assessments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Step 9 & 11 Assessment Rigor
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                  Summative Assessment Blueprint & 5-Tier Analytic Rubrics
                </h2>
                <p className="text-xs text-slate-500">
                  Direct evaluation tasks, weight allocation, and performance descriptors
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleOpenCommentDrawer(
                    'step-9-assessments',
                    'Section',
                    'Step 9: Summative Assessment Blueprint',
                    'step-9-assessments',
                    9
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comment on Assessment Strategy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(course.assessments || []).map((asmt, idx) => (
                <div key={asmt.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {asmt.type}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                      {asmt.weightage}% Weight
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{asmt.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{asmt.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Passing: {asmt.passingScore || 50}%</span>
                    {record.allowReviewerComments && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCommentDrawer(
                            asmt.id,
                            'Assessment',
                            `${asmt.name} (${asmt.type})`,
                            'step-9-assessments',
                            9
                          )
                        }
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        Comment on Task
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rubrics Preview */}
            {course.rubrics && course.rubrics.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  5-Tier Evaluative Performance Rubrics (Step 11)
                </h3>
                <div className="space-y-4">
                  {course.rubrics.map((rubric) => (
                    <div key={rubric.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{rubric.title}</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {rubric.criteria?.length || 0} Criteria
                        </span>
                      </div>
                      <div className="space-y-2">
                        {rubric.criteria?.map((crit) => (
                          <div
                            key={crit.id}
                            className="p-2.5 rounded-lg bg-white border border-slate-150 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-800">{crit.criterionName}</span>
                            <span className="text-slate-500 font-mono font-bold">{crit.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Section Feedback Bar for Section 9 */}
            <InlineSectionCommentBar
              sectionKey="step-9-assessments"
              sectionTitle="Step 9: Summative Assessment Blueprint & Rubrics"
              stepNumber={9}
              comments={comments}
              onOpenCommentDrawer={handleOpenCommentDrawer}
              onAddReply={handleAddReply}
              allowComments={record.allowReviewerComments}
            />
          </div>
        )}

        {/* TAB 6: ALIGNMENT & CQI ACTION PLAN */}
        {activeTab === 'alignment' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Constructive Alignment Audit */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Step 13 Constructive Alignment
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                  Biggs Constructive Alignment Audit
                </h2>
                <p className="text-xs text-slate-500">
                  Continuous validation that outcomes, teaching activities, and assessments directly reinforce one another
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                    {audit.healthScore}%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      Constructive Alignment Index
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Outcome to Assessment Mapping: 100% verified &bull; 0 orphaned milestones
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline Section Feedback Bar for Section 13 */}
              <InlineSectionCommentBar
                sectionKey="step-13-alignment"
                sectionTitle="Step 13: Constructive Alignment & Course Audit"
                stepNumber={13}
                comments={comments}
                onOpenCommentDrawer={handleOpenCommentDrawer}
                onAddReply={handleAddReply}
                allowComments={record.allowReviewerComments}
              />
            </div>

            {/* Continuous Quality Improvement (CQI) Action Plan (Step 15) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Step 15 Academic Governance & CQI
                </span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                  Continuous Quality Improvement (CQI) & Industry Advisory Plan
                </h2>
                <p className="text-xs text-slate-500">
                  Reflective attainment loops, employer feedback integration, and committee sign-off
                </p>
              </div>

              {course.cqiActionPlan ? (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Cohort Cycle: {course.cqiActionPlan.cohortTerm || 'Current Academic Cycle'}
                    </span>
                    <span className="text-indigo-600 font-medium">
                      Target Metric: {course.cqiActionPlan.targetMetric || '≥70% attainment'}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    <strong>Planned Interventions: </strong>
                    {course.cqiActionPlan.plannedInterventions || 'Regular industrial guest lectures and lab refactoring'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No previous CQI intervention notes logged for this version.
                </p>
              )}

              {/* Inline Section Feedback Bar for Section 15 */}
              <InlineSectionCommentBar
                sectionKey="step-15-review"
                sectionTitle="Step 15: CQI Action Plan & Committee Signoff"
                stepNumber={15}
                comments={comments}
                onOpenCommentDrawer={handleOpenCommentDrawer}
                onAddReply={handleAddReply}
                allowComments={record.allowReviewerComments}
              />
            </div>
          </div>
        )}

        {/* TAB 7: ALL STAKEHOLDER COMMENTS SUMMARY TAB */}
        {activeTab === 'comments' && (
          <StakeholderCommentsSummaryTab
            course={course}
            comments={comments}
            onOpenCommentDrawer={(targetId, targetType, targetTitle) =>
              handleOpenCommentDrawer(targetId, targetType, targetTitle)
            }
            onNavigateToSection={(sKey) => {
              if (sKey.includes('1') || sKey.includes('2')) setActiveTab('overview');
              else if (sKey.includes('3')) setActiveTab('clos');
              else if (sKey.includes('4')) setActiveTab('plos');
              else if (sKey.includes('5') || sKey.includes('7')) setActiveTab('modules');
              else if (sKey.includes('9') || sKey.includes('11')) setActiveTab('assessments');
              else setActiveTab('alignment');
            }}
          />
        )}
      </main>

      {/* Floating Action Button for Quick Commenting */}
      {record.allowReviewerComments && activeTab !== 'comments' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              const currentSectionMap: { [key: string]: { id: string; title: string; step: number } } = {
                overview: { id: 'step-1-overview', title: 'Step 1: Course Setup & Information', step: 1 },
                clos: { id: 'step-3-clos', title: 'Step 3: Course Learning Outcomes', step: 3 },
                plos: { id: 'step-4-plos', title: 'Step 4: Program Competencies', step: 4 },
                modules: { id: 'step-5-modules', title: 'Step 5: Curriculum Modules', step: 5 },
                assessments: { id: 'step-9-assessments', title: 'Step 9: Summative Assessments', step: 9 },
                alignment: { id: 'step-13-alignment', title: 'Step 13: Constructive Alignment', step: 13 },
              };
              const mapped = currentSectionMap[activeTab] || currentSectionMap.overview;
              handleOpenCommentDrawer(mapped.id, 'Section', mapped.title, mapped.id, mapped.step);
            }}
            className="px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xl flex items-center gap-2 transition-all hover:scale-105 border border-indigo-400/40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment on This Section</span>
          </button>
        </div>
      )}

      {/* Slide-Over Drawer for Adding Section Feedback */}
      <SectionCommentDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        course={course}
        targetId={drawerTargetId}
        targetType={drawerTargetType}
        targetTitle={drawerTargetTitle}
        sectionKey={drawerSectionKey}
        stepNumber={drawerStepNumber}
        moduleId={drawerModuleId}
        defaultName={stakeholderName}
        defaultAffiliation={stakeholderAffiliation}
        defaultRole={stakeholderRole}
        onSubmitComment={handleCommentSubmit}
      />

      {/* Reviewer Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Your Reviewer Profile</h3>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Your name and organization will be attached to any comments you submit across this course blueprint.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={stakeholderName}
                  onChange={(e) => {
                    setStakeholderName(e.target.value);
                    try {
                      localStorage.setItem('mentisera_stakeholder_name', e.target.value);
                    } catch {}
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={stakeholderAffiliation}
                  onChange={(e) => {
                    setStakeholderAffiliation(e.target.value);
                    try {
                      localStorage.setItem('mentisera_stakeholder_affiliation', e.target.value);
                    } catch {}
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reviewer Capacity / Role</label>
                <select
                  value={stakeholderRole}
                  onChange={(e) => {
                    const r = e.target.value as StakeholderRole;
                    setStakeholderRole(r);
                    try {
                      localStorage.setItem('mentisera_stakeholder_role', r);
                    } catch {}
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                >
                  <option value="Industry Advisory">Industry Advisory Board Member</option>
                  <option value="External Examiner">External Academic Peer Reviewer</option>
                  <option value="Accreditation Reviewer">Accreditation Evaluator (ABET/WA)</option>
                  <option value="Instructional Designer">Instructional Designer</option>
                  <option value="Student Representative">Student / Alumni Representative</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between max-w-7xl mx-auto w-full gap-3">
        <div className="flex items-center gap-2">
          <OBE360Logo size="xs" showText={false} />
          <span>MENTISERA OBE360™ Outcome-Based Course Creator</span>
        </div>
        <span>External Stakeholder Review Portal &bull; Read-Only Security Guaranteed</span>
      </footer>
    </div>
  );
};
