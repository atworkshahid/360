import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  ExternalLink,
  Search,
  Filter,
  MessageSquare,
  Clock,
  ChevronRight,
  User,
  ArrowRight,
  Send,
  X,
  Stamp,
  Award,
  Layers,
  Sparkles,
  Users,
  Eye,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { Course, CourseStatus, CourseReviewComment } from '../types';
import { CourseValidationService } from '../services/courseValidationService';
import { getFrameworkById } from '../data/frameworksData';
import { DEFAULT_INSTITUTION } from '../data/institutionData';
import { exportSyllabusPDF } from '../utils/syllabusExport';
import {
  ApprovalQueueItem,
  ApprovalStage,
  AuditLogEntry,
  DigitalSignOff,
} from '../types/collaboration';
import { CollaborationService } from '../services/collaborationService';
import { AuditTrailModal } from './Collaboration/AuditTrailModal';

interface ReviewsViewProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onUpdateCourse: (course: Course) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  courses,
  onSelectCourse,
  onUpdateCourse,
}) => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [selectedQueueItem, setSelectedQueueItem] = useState<ApprovalQueueItem | null>(null);
  const [decisionType, setDecisionType] = useState<'approve_stage' | 'request_revisions' | 'formal_seal'>('approve_stage');
  const [actorRole, setActorRole] = useState<string>('Dean / Academic Head');
  const [actorName, setActorName] = useState<string>('Dr. Arthur Vance');
  const [decisionNote, setDecisionNote] = useState<string>('');
  const [officialStatement, setOfficialStatement] = useState<string>('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);

  // Audit Trail Modal state
  const [auditModalCourse, setAuditModalCourse] = useState<Course | null>(null);
  const [auditModalEntries, setAuditModalEntries] = useState<AuditLogEntry[]>([]);
  const [auditModalSignOffs, setAuditModalSignOffs] = useState<DigitalSignOff[]>([]);

  // Queue state from server
  const [queueItems, setQueueItems] = useState<ApprovalQueueItem[]>([]);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    departmentReview: 0,
    boardOfStudies: 0,
    deanApproval: 0,
    accreditationReview: 0,
    endorsed: 0,
    urgentCount: 0,
  });
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(true);

  // Load live queue from server
  const loadQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const data = await CollaborationService.getApprovalQueue();
      setQueueItems(data.queue);
      setQueueStats(data.stats);
    } catch (err) {
      console.error('Error fetching approval queue:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Map courses with queue metadata
  const enrichedCourses = courses.map((course) => {
    const queueMatch = queueItems.find((q) => q.courseId === course.id || q.courseCode === course.code);
    return {
      course,
      queue: queueMatch || null,
      stage: queueMatch?.currentStage || (course.status === 'approved' ? 'endorsed' : 'board_of_studies'),
    };
  });

  const filteredItems = enrichedCourses.filter(({ course, stage }) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.department && course.department.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStage === 'all') return true;
    if (filterStage === 'dean_approval') return stage === 'dean_approval';
    if (filterStage === 'board_of_studies') return stage === 'board_of_studies';
    if (filterStage === 'department_review') return stage === 'department_review';
    if (filterStage === 'accreditation_review') return stage === 'accreditation_review';
    if (filterStage === 'endorsed') return stage === 'endorsed' || course.status === 'approved';
    return true;
  });

  const handleOpenDecisionModal = (course: Course, queueItem: ApprovalQueueItem | null) => {
    setSelectedCourseForModal(course);
    setSelectedQueueItem(queueItem);
    const stage = queueItem?.currentStage || 'board_of_studies';

    if (stage === 'dean_approval') {
      setActorRole('Dean / Academic Head');
      setActorName('Dr. Arthur Vance');
      setDecisionType('formal_seal');
      setDecisionNote('Course exhibits comprehensive constructive alignment and meets ABET / Washington Accord specifications.');
      setOfficialStatement('Executive authorization granted by the Office of the Dean. Syllabus ratified for statutory accreditation.');
    } else if (stage === 'accreditation_review') {
      setActorRole('Accreditation Reviewer');
      setActorName('Dr. Marcus Vance');
      setDecisionType('approve_stage');
      setDecisionNote('Accreditation evaluation confirms all CLO cognitive verbs are directly evaluated in summative milestones.');
      setOfficialStatement('External review verified compliant with Washington Accord Graduate Attributes.');
    } else {
      setActorRole('Program Chair');
      setActorName('Prof. Elena Rostova');
      setDecisionType('approve_stage');
      setDecisionNote('Curriculum committee reviewed prerequisites and laboratory contact hours allocation.');
      setOfficialStatement('Certified Board of Studies compliance for subsequent executive approval.');
    }
  };

  const handleExecuteDecision = async () => {
    if (!selectedCourseForModal) return;
    setIsSubmittingDecision(true);

    try {
      const res = await CollaborationService.recordDecision(selectedCourseForModal.id, {
        decision: decisionType,
        actorName,
        actorRole,
        decisionNote,
        officialStatement,
        courseCode: selectedCourseForModal.code,
        courseTitle: selectedCourseForModal.title,
      });

      // Update course status locally
      let newStatus: CourseStatus = 'ready_for_review';
      if (decisionType === 'formal_seal' || res.newCourseStatus === 'approved') {
        newStatus = 'approved';
      } else if (decisionType === 'request_revisions') {
        newStatus = 'changes_requested';
      } else if (res.nextStage === 'dean_approval') {
        newStatus = 'ready_for_review';
      }

      const newComment: CourseReviewComment = {
        id: `rev-${Date.now()}`,
        reviewerId: 'reviewer-gov',
        reviewerName: actorName,
        reviewerRole: actorRole,
        section: `${actorRole} Governance Decision`,
        comment: decisionNote || `Decision recorded: ${decisionType}`,
        createdAt: new Date().toISOString(),
        status: 'resolved',
      };

      const updatedCourse: Course = {
        ...selectedCourseForModal,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        reviewerComments: [newComment, ...(selectedCourseForModal.reviewerComments || [])],
      };

      onUpdateCourse(updatedCourse);
      await loadQueue();
      setSelectedCourseForModal(null);
    } catch (err) {
      console.error('Failed to record collaboration decision:', err);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleOpenAuditModal = async (course: Course) => {
    setAuditModalCourse(course);
    try {
      const data = await CollaborationService.getCourseCollaboration(course.id);
      setAuditModalEntries(data.auditTrail);
      setAuditModalSignOffs(data.digitalSignOffs);
    } catch {
      setAuditModalEntries([]);
      setAuditModalSignOffs([]);
    }
  };

  const getStageBadge = (stage?: string) => {
    switch (stage) {
      case 'dean_approval':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      case 'board_of_studies':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
      case 'department_review':
        return 'bg-sky-50 text-sky-800 border-sky-200 font-medium';
      case 'accreditation_review':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
      case 'endorsed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatStageLabel = (stage?: string) => {
    switch (stage) {
      case 'dean_approval':
        return 'Dean Executive Queue';
      case 'board_of_studies':
        return 'Board of Studies Review';
      case 'department_review':
        return 'Department Review';
      case 'accreditation_review':
        return 'Accreditation Review';
      case 'endorsed':
        return 'Endorsed & Sealed';
      default:
        return 'Review Queue';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Multi-Reviewer Academic Governance</span>
            <span>•</span>
            <span>Dean & Board of Studies Workflow</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            Curriculum Approval Queue & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Real-time collaborative governance pipeline coordinating Department Chairs, Boards of Studies, Deans, and Visiting Accreditation Evaluators with cryptographic timestamped audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadQueue}
            disabled={isLoadingQueue}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Governance Pipeline Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div
          onClick={() => setFilterStage('department_review')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filterStage === 'department_review'
              ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xl font-black text-sky-900">{queueStats.departmentReview}</div>
          <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider mt-0.5">
            1. Dept Review
          </div>
          <div className="text-[10px] text-slate-400">Program Chairs</div>
        </div>

        <div
          onClick={() => setFilterStage('board_of_studies')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filterStage === 'board_of_studies'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xl font-black text-indigo-900">{queueStats.boardOfStudies}</div>
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mt-0.5">
            2. Board of Studies
          </div>
          <div className="text-[10px] text-slate-400">Curriculum Committee</div>
        </div>

        <div
          onClick={() => setFilterStage('dean_approval')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filterStage === 'dean_approval'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xl font-black text-amber-900">{queueStats.deanApproval}</div>
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
            <span>3. Dean Sign-Off</span>
            {queueStats.deanApproval > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div className="text-[10px] text-slate-400">Executive Queue</div>
        </div>

        <div
          onClick={() => setFilterStage('accreditation_review')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filterStage === 'accreditation_review'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xl font-black text-purple-900">{queueStats.accreditationReview}</div>
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mt-0.5">
            4. Accreditation
          </div>
          <div className="text-[10px] text-slate-400">External Evaluator</div>
        </div>

        <div
          onClick={() => setFilterStage('endorsed')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            filterStage === 'endorsed'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xl font-black text-emerald-900">{queueStats.endorsed}</div>
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
            5. Sealed & Ratified
          </div>
          <div className="text-[10px] text-slate-400">Statutory Certified</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: 'all', label: `All In Pipeline (${enrichedCourses.length})` },
            { id: 'dean_approval', label: `Dean Approval Queue (${queueStats.deanApproval})` },
            { id: 'board_of_studies', label: `Board of Studies (${queueStats.boardOfStudies})` },
            { id: 'accreditation_review', label: `Accreditation Review (${queueStats.accreditationReview})` },
            { id: 'endorsed', label: `Sealed (${queueStats.endorsed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStage(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                filterStage === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, title, department..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Courses Queue List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No courses found matching the selected governance filter.
          </div>
        ) : (
          filteredItems.map(({ course: c, queue, stage }) => {
            const summary = CourseValidationService.validateCourse(c);
            const framework = getFrameworkById(c.frameworkId);

            return (
              <div
                key={c.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                        {c.code}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${getStageBadge(
                          stage
                        )}`}
                      >
                        {formatStageLabel(stage)}
                      </span>
                      {queue?.priority === 'urgent' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Priority Action
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">
                        {framework.name}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {c.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      <span>Department: <strong className="text-slate-700">{c.department || 'Computing & Engineering'}</strong></span>
                      <span>•</span>
                      <span>Credits: <strong>{c.creditHours}</strong></span>
                      <span>•</span>
                      <span>Instructor: {c.instructorName || queue?.leadInstructor || 'Faculty Assigned'}</span>
                    </div>

                    {/* Reviewers Assigned & Presence */}
                    {queue?.assignedReviewers && queue.assignedReviewers.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Reviewers:
                        </span>
                        <div className="flex items-center -space-x-1.5">
                          {queue.assignedReviewers.map((rev, rIdx) => (
                            <div
                              key={rIdx}
                              title={`${rev.name} (${rev.role}) - ${rev.hasSignedOff ? 'Signed Off' : 'Pending'}`}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-2xs ${rev.avatarColor}`}
                            >
                              {rev.name[0]}
                            </div>
                          ))}
                        </div>
                        {queue.daysInQueue > 0 && (
                          <span className="text-[11px] text-slate-400">
                            • {queue.daysInQueue} days in stage
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Readiness Score & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Alignment Audit
                      </div>
                      <div
                        className={`text-xl font-black ${
                          summary.readinessScore >= 80
                            ? 'text-emerald-700'
                            : summary.readinessScore >= 60
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {summary.readinessScore}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onSelectCourse(c.id)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>Inspect & Audit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDecisionModal(c, queue)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>Sign-Off / Decision</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAuditModal(c)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        title="View complete tamper-evident audit trail"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Audit Log</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportSyllabusPDF(c, DEFAULT_INSTITUTION)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
                        title="Download Syllabus PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit summary breakdown */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>
                      Outcomes: <strong className="text-slate-700">{c.clos.length}</strong>
                    </span>
                    <span>
                      Assessments: <strong className="text-slate-700">{c.assessments?.length || 0}</strong>
                    </span>
                    <span>
                      Schedule: <strong className="text-slate-700">{c.weeklyPlan?.length || 0} Weeks</strong>
                    </span>
                    {queue?.unresolvedCommentsCount !== undefined && queue.unresolvedCommentsCount > 0 && (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {queue.unresolvedCommentsCount} Unresolved Remarks
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    {summary.criticalCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {summary.criticalCount} Critical Gaps
                      </span>
                    )}
                    {summary.warningCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {summary.warningCount} Warnings
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {summary.passedCount} Accreditation Checks Passed
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reviewer & Dean Governance Decision Modal */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Stamp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Curriculum Sign-Off & Governance Decision
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedCourseForModal.code}: {selectedCourseForModal.title}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourseForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage indicator */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Pipeline Stage
                </span>
                <span className="font-bold text-slate-900">
                  {formatStageLabel(selectedQueueItem?.currentStage || 'board_of_studies')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Target Next Milestone
                </span>
                <span className="font-bold text-indigo-700">
                  {selectedQueueItem?.currentStage === 'dean_approval'
                    ? 'Official Accreditation Seal'
                    : 'Dean Executive Review'}
                </span>
              </div>
            </div>

            {/* Signatory Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Academic Governance Role
                </label>
                <select
                  value={actorRole}
                  onChange={(e) => setActorRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Dean / Academic Head">Dean / Academic Head</option>
                  <option value="Program Chair">Program Chair</option>
                  <option value="Board of Studies Member">Board of Studies Member</option>
                  <option value="Accreditation Reviewer">Accreditation Reviewer</option>
                  <option value="External Examiner">External Examiner</option>
                </select>
              </div>
            </div>

            {/* Decision Type Tabs */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Official Action to Execute
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionType('approve_stage')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                    decisionType === 'approve_stage'
                      ? 'bg-indigo-50 text-indigo-900 border-indigo-400 ring-1 ring-indigo-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-600" />
                  <span>Pass to Next Stage</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('request_revisions')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                    decisionType === 'request_revisions'
                      ? 'bg-amber-50 text-amber-900 border-amber-400 ring-1 ring-amber-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mx-auto mb-1 text-amber-600" />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('formal_seal')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                    decisionType === 'formal_seal'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-1 ring-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600" />
                  <span>Issue Dean Seal</span>
                </button>
              </div>
            </div>

            {/* Feedback / Evaluation Notes */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Formal Committee / Reviewer Remarks
              </label>
              <textarea
                rows={3}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Enter evaluation justification or required modifications for faculty..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Official Endorsement Statement (when approving or sealing) */}
            {decisionType !== 'request_revisions' && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Statutory Endorsement Statement (Appears on Certificate)
                </label>
                <input
                  type="text"
                  value={officialStatement}
                  onChange={(e) => setOfficialStatement(e.target.value)}
                  placeholder="Official endorsement statement..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCourseForModal(null)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDecision}
                disabled={isSubmittingDecision}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmittingDecision ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Recording in Audit Log...</span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Authorize & Record in Audit Trail</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {auditModalCourse && (
        <AuditTrailModal
          isOpen={!!auditModalCourse}
          onClose={() => setAuditModalCourse(null)}
          course={auditModalCourse}
          auditTrail={auditModalEntries}
          digitalSignOffs={auditModalSignOffs}
        />
      )}
    </div>
  );
};
