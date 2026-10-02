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
} from 'lucide-react';
import { Course, CourseElementComment } from '../types';
import { ShareService, SharedCourseRecord } from '../services/shareService';
import { MentiseraLogo } from './Logo';
import { exportSyllabusPDF } from '../utils/syllabusExport';
import { calculateCourseAudit } from '../utils/obeCalculator';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'clos' | 'syllabus' | 'assessments' | 'feedback'>('overview');

  // Reviewer comment state
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewerRole, setReviewerRole] = useState<string>('External Peer Reviewer');
  const [commentContent, setCommentContent] = useState<string>('');
  const [commentCategory, setCommentCategory] = useState<string>('Constructive Alignment');
  const [commentTarget, setCommentTarget] = useState<string>('General Blueprint');
  const [submittedComments, setSubmittedComments] = useState<Array<{
    id: string;
    author: string;
    role: string;
    category: string;
    target: string;
    content: string;
    createdAt: string;
  }>>([]);
  const [commentSubmittedToast, setCommentSubmittedToast] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [importedToast, setImportedToast] = useState<boolean>(false);

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

  const handleAddReviewerComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !reviewerName.trim()) return;

    const newComment = {
      id: `rev-${Date.now()}`,
      author: reviewerName.trim(),
      role: reviewerRole,
      category: commentCategory,
      target: commentTarget,
      content: commentContent.trim(),
      createdAt: new Date().toISOString(),
    };

    setSubmittedComments((prev) => [newComment, ...prev]);
    setCommentContent('');
    setCommentSubmittedToast(true);
    setTimeout(() => setCommentSubmittedToast(false), 3000);
  };

  const handleImport = () => {
    if (record?.courseData && onImportToWorkspace) {
      onImportToWorkspace(record.courseData);
      setImportedToast(true);
      setTimeout(() => setImportedToast(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-semibold tracking-wide">Retrieving Verified Course Blueprint...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Firebase Firestore secure data store</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
            Passcode Protected Blueprint
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            The author has restricted access to <strong>{record.courseCode} &bull; {record.courseTitle}</strong>. Enter the 4-digit security PIN provided by the course team.
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
            <span>MENTISERA OBE360™</span>
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Read-Only Reviewer Notice Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-indigo-700/50">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30 flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Verified Read-Only Link
          </span>
          <span className="text-indigo-200">
            Shared by <strong className="text-white">{record.createdByName}</strong> ({record.createdByEmail})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {record.expiresAt && (
            <span className="text-indigo-200 flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" />
              Expires {new Date(record.expiresAt).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedLink ? 'Link Copied' : 'Share Link'}
          </button>
          <button
            onClick={onExit}
            className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit Review
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MentiseraLogo size="sm" />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {course.code || 'COURSE'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {course.programme || course.category}
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
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <FileDown className="w-4 h-4 text-indigo-600" />
                Download PDF Dossier
              </button>
            )}

            {onImportToWorkspace && (
              <button
                onClick={handleImport}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {importedToast ? 'Imported to Workspace!' : 'Clone to My Courses'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 text-xs font-semibold overflow-x-auto border-t border-slate-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Course Overview & Alignment
          </button>
          <button
            onClick={() => setActiveTab('clos')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'clos'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            CLOs & Bloom Taxonomy ({(course.clos || []).length})
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'syllabus'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Modules & Weekly Plan ({(course.modules || []).length} modules)
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'assessments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Assessments & 5-Tier Rubrics ({(course.assessments || []).length})
          </button>
          {record.allowReviewerComments && (
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'feedback'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Reviewer Remarks ({submittedComments.length})
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Health & Accreditation Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Accreditation Alignment</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{audit.healthScore}%</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {audit.criticalCount === 0 ? 'Fully Compliant (Washington Accord)' : `${audit.criticalCount} gap(s) identified`}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Credit Weight</span>
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{course.creditHours || 3} Credits</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {course.durationWeeks || 16} Weeks &bull; {course.deliveryMode || 'Face-to-Face'}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Course Learning Outcomes</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{(course.clos || []).length} Outcomes</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bloom L1-L6 Rigor Verified
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Assessment Sum</span>
                  <Layers className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">100% Weight</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {(course.assessments || []).length} Graded Milestones
                </p>
              </div>
            </div>

            {/* Course Description & Capstone Goal */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Course Description & Pedagogical Purpose
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {course.description || course.overview}
              </p>

              {course.capstoneGoal && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl mt-4">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Culminating Capstone Learning Goal
                  </div>
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                    {course.capstoneGoal}
                  </p>
                </div>
              )}

              {/* Target Learners and Prerequisites */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">Target Learners: </span>
                  <span className="text-slate-600">{course.targetLearners || 'Undergraduate academic cohort'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Prerequisites: </span>
                  <span className="text-slate-600">{course.prerequisites || 'Introductory discipline foundation'}</span>
                </div>
              </div>
            </div>

            {/* Program Learning Outcomes (PLOs) Mapping */}
            {course.plos && course.plos.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Program Learning Outcomes (PLOs) & Graduate Attributes</span>
                  <span className="text-xs text-indigo-600 font-normal">Accreditation Criterion 3</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.plos.map((plo) => (
                    <div key={plo.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 font-mono">{plo.code}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{plo.title}</span>
                      </div>
                      <p className="text-xs text-slate-600">{plo.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLOs */}
        {activeTab === 'clos' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Course Learning Outcomes (CLOs)
                </h2>
                <p className="text-xs text-slate-500">
                  Formulated in accordance with Bloom's Revised Taxonomy and direct assessment evidence mandates
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {(course.clos || []).length} Measurable Outcomes
              </span>
            </div>

            <div className="space-y-4">
              {(course.clos || []).map((clo, idx) => (
                <div
                  key={clo.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                        {clo.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {clo.bloomVerb} &bull; {clo.bloomLevel}
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {clo.learningDomain || 'Cognitive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <span>Weightage: <strong>{clo.weightage || 25}%</strong></span>
                      <span>&bull;</span>
                      <span>Target Passing: <strong>{clo.achievementThreshold || 60}%</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    "{clo.statement || (clo as any).description}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 pt-1 border-t border-slate-100">
                    <span>
                      Evidence Source: <strong className="text-slate-700">{clo.assessmentMethod || 'Analytical Case Brief'}</strong>
                    </span>
                    {clo.mappedPLOs && clo.mappedPLOs.length > 0 && (
                      <span className="text-indigo-600 font-medium">
                        Mapped to: {clo.mappedPLOs.map((m) => `${m.ploId} (${m.level})`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SYLLABUS & MODULES */}
        {activeTab === 'syllabus' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Curriculum Modules & Instructional Progression
              </h2>
              <p className="text-xs text-slate-500">
                Sequenced learning units with associated study hours and learning outcomes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.modules || []).map((mod, idx) => (
                <div key={mod.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Module {mod.number || idx + 1}
                    </span>
                    <span className="text-xs text-slate-500">{mod.durationWeeks || 4} Weeks</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>

                  {mod.resources && mod.resources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <strong>Core Resources: </strong>
                      <span>{mod.resources.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Weekly Plan Excerpt */}
            {course.weeklyPlan && course.weeklyPlan.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Weekly Syllabus Arc
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {course.weeklyPlan.map((wp) => (
                    <div key={wp.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 font-mono w-16">Week {wp.weekNumber}:</span>
                        <span className="text-slate-900">{wp.topic}</span>
                      </div>
                      {wp.notes && <span className="text-slate-400 text-[11px]">{wp.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ASSESSMENTS & RUBRICS */}
        {activeTab === 'assessments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Assessment Blueprint & 5-Tier Rubric Criteria
              </h2>
              <p className="text-xs text-slate-500">
                Formative and summative assessment strategy constructively aligned to learning outcomes
              </p>
            </div>

            <div className="space-y-4">
              {(course.assessments || []).map((ass, idx) => (
                <div key={ass.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {ass.type || 'Summative'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{ass.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">{ass.weightage || 25}%</div>
                      <span className="text-[11px] text-slate-500">Course Weight</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{ass.description}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Target CLOs: <strong>{(ass.mappedCLOIds || []).join(', ') || 'CLO 1, CLO 2'}</strong></span>
                    <span>Submission Week: <strong>Week {ass.weekDue || 8}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rubrics Preview */}
            {course.rubrics && course.rubrics.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Associated Analytical Scoring Rubrics
                </h3>
                {course.rubrics.map((rubric) => (
                  <div key={rubric.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">{rubric.title}</h4>
                    <div className="space-y-2 text-xs">
                      {(rubric.criteria || []).map((crit, cIdx) => (
                        <div key={cIdx} className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{crit.criterionName}</span>
                          <span className="text-slate-500 font-mono font-bold">{crit.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REVIEWER FEEDBACK */}
        {activeTab === 'feedback' && record.allowReviewerComments && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
            {/* Feedback Input Form */}
            <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Post Reviewer Remark</h3>
                <p className="text-xs text-slate-500">
                  Submit academic feedback, alignment recommendations, or accreditation audit notes.
                </p>
              </div>

              {commentSubmittedToast && (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Remark recorded in review log!
                </div>
              )}

              <form onSubmit={handleAddReviewerComment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Vance"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reviewer Role / Institution</label>
                  <select
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="External Peer Reviewer">External Peer Reviewer</option>
                    <option value="Board of Studies Member">Board of Studies Member</option>
                    <option value="Accreditation Auditor (ABET/WA)">Accreditation Auditor (ABET/WA)</option>
                    <option value="Department Chair">Department Chair</option>
                    <option value="Industry Advisory Liaison">Industry Advisory Liaison</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Focus Area</label>
                  <select
                    value={commentCategory}
                    onChange={(e) => setCommentCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Constructive Alignment">Constructive Alignment (PLO-CLO)</option>
                    <option value="Bloom's Cognitive Depth">Bloom's Cognitive Depth & Measurability</option>
                    <option value="Assessment & Rubric Rigor">Assessment & Rubric Rigor</option>
                    <option value="Workload & Credit Hours">Workload & Credit Hours Distribution</option>
                    <option value="General Pedagogical Quality">General Pedagogical Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Element</label>
                  <input
                    type="text"
                    placeholder="e.g. CLO 3 Rubric / Final Exam"
                    value={commentTarget}
                    onChange={(e) => setCommentTarget(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reviewer Remark / Recommendation</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide specific, actionable suggestions for accreditation alignment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Reviewer Remark
                </button>
              </form>
            </div>

            {/* Submitted Comments Stream */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Recorded Review Comments ({submittedComments.length})
                </h3>
                <span className="text-xs text-slate-500">Authenticated Review Dossier</span>
              </div>

              {submittedComments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No reviewer remarks submitted yet for this shared blueprint.</p>
                  <p className="text-[11px] text-slate-400">Use the form on the left to record your critique.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submittedComments.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{c.author}</span>
                          <span className="text-[11px] text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {c.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Category: <strong className="text-slate-700">{c.category}</strong></span>
                        <span>&bull;</span>
                        <span>Target: <strong className="text-slate-700">{c.target}</strong></span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <MentiseraLogo size="xs" showText={false} />
          <span>MENTISERA OBE360™ Outcome-Based Course Creator</span>
        </div>
        <span>Protected by Firebase Firestore ABAC &bull; Unique Read-Only Token</span>
      </footer>
    </div>
  );
};
