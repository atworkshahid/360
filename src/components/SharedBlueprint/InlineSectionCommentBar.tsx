import React, { useState } from 'react';
import {
  MessageSquare,
  Building2,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  CornerDownRight,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { CourseElementComment, CommentReply, StakeholderRole } from '../../types';
import { getRoleBadgeColor, getCategoryBadgeColor } from '../../utils/commentUtils';

export interface InlineSectionCommentBarProps {
  sectionKey: string;
  sectionTitle: string;
  stepNumber?: number;
  comments: CourseElementComment[];
  onOpenCommentDrawer: (targetId: string, targetType: any, targetTitle: string) => void;
  onAddReply: (commentId: string, replyData: { authorName: string; authorRole: StakeholderRole; authorAffiliation?: string; content: string }) => Promise<void> | void;
  allowComments?: boolean;
  className?: string;
}

export const InlineSectionCommentBar: React.FC<InlineSectionCommentBarProps> = ({
  sectionKey,
  sectionTitle,
  stepNumber,
  comments,
  onOpenCommentDrawer,
  onAddReply,
  allowComments = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyAuthorName, setReplyAuthorName] = useState<string>(() => {
    try {
      return localStorage.getItem('mentisera_stakeholder_name') || 'Sarah Chen';
    } catch {
      return 'Sarah Chen';
    }
  });
  const [replyAuthorAffiliation, setReplyAuthorAffiliation] = useState<string>(() => {
    try {
      return localStorage.getItem('mentisera_stakeholder_affiliation') || 'Tech Advisory Council';
    } catch {
      return 'Tech Advisory Council';
    }
  });
  const [replyAuthorRole, setReplyAuthorRole] = useState<StakeholderRole>(() => {
    try {
      return (localStorage.getItem('mentisera_stakeholder_role') as StakeholderRole) || 'Industry Advisory';
    } catch {
      return 'Industry Advisory';
    }
  });
  const [replyContent, setReplyContent] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  // Filter comments belonging to this section or step
  const sectionComments = comments.filter(
    (c) =>
      c.sectionKey === sectionKey ||
      c.targetId === sectionKey ||
      (stepNumber !== undefined && c.stepNumber === stepNumber)
  );

  const unresolvedCount = sectionComments.filter((c) => c.status !== 'resolved').length;
  const industryCommentsCount = sectionComments.filter((c) => c.authorRole === 'Industry Advisory').length;
  const peerCommentsCount = sectionComments.filter(
    (c) => c.authorRole === 'External Examiner' || c.authorRole === 'Accreditation Reviewer'
  ).length;

  const handleReplySubmit = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyAuthorName.trim()) return;

    setIsSubmittingReply(true);
    try {
      await onAddReply(commentId, {
        authorName: replyAuthorName.trim(),
        authorRole: replyAuthorRole,
        authorAffiliation: replyAuthorAffiliation.trim() || undefined,
        content: replyContent.trim(),
      });
      setReplyContent('');
      setActiveReplyId(null);
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getRoleIcon = (role: StakeholderRole) => {
    switch (role) {
      case 'Industry Advisory':
        return <Building2 className="w-3 h-3 text-amber-600" />;
      case 'External Examiner':
        return <GraduationCap className="w-3 h-3 text-emerald-600" />;
      case 'Accreditation Reviewer':
        return <ShieldCheck className="w-3 h-3 text-purple-600" />;
      case 'Instructional Designer':
        return <Briefcase className="w-3 h-3 text-pink-600" />;
      default:
        return <UserCheck className="w-3 h-3 text-indigo-600" />;
    }
  };

  return (
    <div
      className={`mt-4 rounded-xl border transition-all ${
        sectionComments.length > 0
          ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-white to-indigo-50/40 shadow-xs'
          : 'border-slate-200 bg-slate-50/50'
      } ${className}`}
    >
      {/* Bar Header */}
      <div className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              sectionComments.length > 0
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                Stakeholder Comments ({sectionComments.length})
              </span>
              {unresolvedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {unresolvedCount} Open
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              {industryCommentsCount > 0 && (
                <span className="flex items-center gap-1 text-amber-800 font-medium">
                  <Building2 className="w-3 h-3" />
                  {industryCommentsCount} Industry Advisory
                </span>
              )}
              {industryCommentsCount > 0 && peerCommentsCount > 0 && <span>&bull;</span>}
              {peerCommentsCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <GraduationCap className="w-3 h-3" />
                  {peerCommentsCount} Peer / Accreditation
                </span>
              )}
              {sectionComments.length === 0 && (
                <span>No stakeholder remarks posted on this section yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {allowComments && (
            <button
              type="button"
              onClick={() => onOpenCommentDrawer(sectionKey, 'Section', sectionTitle)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Comment on this Section</span>
            </button>
          )}

          {sectionComments.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Discussion' : `View Remarks (${sectionComments.length})`}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Thread View */}
      {isExpanded && sectionComments.length > 0 && (
        <div className="border-t border-indigo-100 p-4 space-y-4 bg-white/70">
          <div className="space-y-3">
            {sectionComments.map((comment) => {
              const isIndustry = comment.authorRole === 'Industry Advisory';
              const isReplyOpen = activeReplyId === comment.id;

              return (
                <div
                  key={comment.id}
                  className={`p-4 rounded-xl border text-xs transition-all space-y-3 ${
                    isIndustry
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Comment Author Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          comment.authorAvatarColor || 'bg-indigo-600 text-white'
                        }`}
                      >
                        {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{comment.authorName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getRoleBadgeColor(
                              comment.authorRole
                            )}`}
                          >
                            {getRoleIcon(comment.authorRole)}
                            {comment.authorRole}
                          </span>
                        </div>
                        {comment.authorAffiliation && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {comment.authorAffiliation}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.priority && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                            comment.priority === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : comment.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {comment.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback Category Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeColor(
                        comment.category
                      )}`}
                    >
                      {comment.category}
                    </span>
                    {comment.tags?.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Comment Body */}
                  <div className="p-3 rounded-lg bg-white border border-slate-150 text-slate-800 leading-relaxed text-xs">
                    {comment.content}
                  </div>

                  {/* Suggested Concrete Change */}
                  {comment.suggestedChange && (
                    <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Suggested Concrete Revision / Industry Benchmark
                      </div>
                      <p className="text-xs font-mono text-emerald-900 bg-white/70 p-2 rounded border border-emerald-200/60 leading-relaxed">
                        {comment.suggestedChange}
                      </p>
                    </div>
                  )}

                  {/* Replies Stream */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-indigo-200 mt-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span>{reply.authorName}</span>
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 font-normal">
                                {reply.authorRole}
                              </span>
                              {reply.authorAffiliation && (
                                <span className="text-[10px] text-slate-500 font-normal">
                                  ({reply.authorAffiliation})
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Button or Reply Form */}
                  <div className="pt-1">
                    {!isReplyOpen ? (
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(comment.id)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        Reply to thread
                      </button>
                    ) : (
                      <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">Add Reply to Thread</span>
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(null)}
                            className="text-[10px] text-slate-400 hover:text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <input
                            type="text"
                            required
                            placeholder="Your Name"
                            value={replyAuthorName}
                            onChange={(e) => setReplyAuthorName(e.target.value)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Your Organization / Title"
                            value={replyAuthorAffiliation}
                            onChange={(e) => setReplyAuthorAffiliation(e.target.value)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs"
                          />
                        </div>

                        <textarea
                          rows={2}
                          required
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your response, clarification, or endorsement..."
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(null)}
                            className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 text-[11px]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingReply || !replyContent.trim()}
                            className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            Post Reply
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
