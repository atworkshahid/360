import React, { useState } from 'react';
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  CornerDownRight,
  Sparkles,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Users,
  Clock,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import {
  Course,
  CourseElementComment,
  CommentReply,
  CommentCategory,
  CommentStatus,
  CommentTargetType,
} from '../../../types';
import {
  STAKEHOLDER_PERSONAS,
  COMMENT_CATEGORIES,
  StakeholderPersona,
  getRoleBadgeColor,
  getCategoryBadgeColor,
  getCommentsForSection,
} from '../../../utils/commentUtils';

export interface InlineSectionFeedbackProps {
  course: Course;
  onChangeCourse: (updated: Course) => void;
  sectionKey: string;
  sectionTitle: string;
  stepNumber?: number;
  moduleId?: string;
  targetType?: CommentTargetType;
  onOpenFullReview?: (targetId: string, targetType: CommentTargetType, targetTitle: string) => void;
  compact?: boolean;
  className?: string;
}

export const InlineSectionFeedback: React.FC<InlineSectionFeedbackProps> = ({
  course,
  onChangeCourse,
  sectionKey,
  sectionTitle,
  stepNumber,
  moduleId,
  targetType = 'Section',
  onOpenFullReview,
  compact = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePersona, setActivePersona] = useState<StakeholderPersona>(STAKEHOLDER_PERSONAS[4]); // Defaults to Liam Patel (Instructional Designer)
  const [customAuthorName, setCustomAuthorName] = useState('');
  const [isCustomAuthor, setIsCustomAuthor] = useState(false);

  // New Comment Form
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CommentCategory>('Alignment & Rigor');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [suggestedChange, setSuggestedChange] = useState('');
  const [showSuggestionInput, setShowSuggestionInput] = useState(false);

  // Thread replies
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allComments = course.comments || [];
  const sectionComments = getCommentsForSection(allComments, sectionKey, stepNumber);
  const unresolvedCount = sectionComments.filter((c) => c.status !== 'resolved').length;
  const totalCount = sectionComments.length;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const authorName = isCustomAuthor && customAuthorName.trim() ? customAuthorName.trim() : activePersona.name;
    const authorRole = isCustomAuthor ? 'Faculty / Instructor' : activePersona.role;
    const authorAvatarColor = isCustomAuthor ? 'bg-indigo-600 text-white' : activePersona.avatarColor;

    const newComment: CourseElementComment = {
      id: `comment-${Date.now()}`,
      targetType: (targetType || (moduleId ? 'Module' : 'Section')) as CommentTargetType,
      targetId: moduleId || sectionKey,
      targetTitle: sectionTitle,
      sectionKey,
      stepNumber,
      moduleId,
      priority: newPriority,
      authorName,
      authorRole,
      authorAvatarColor,
      category: newCategory,
      content: newContent.trim(),
      status: 'open',
      suggestedChange: suggestedChange.trim() ? suggestedChange.trim() : undefined,
      replies: [],
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [newComment, ...allComments];
    onChangeCourse({
      ...course,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });

    setNewContent('');
    setSuggestedChange('');
    setShowSuggestionInput(false);
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const authorName = isCustomAuthor && customAuthorName.trim() ? customAuthorName.trim() : activePersona.name;
    const authorRole = isCustomAuthor ? 'Faculty / Instructor' : activePersona.role;
    const authorAvatarColor = isCustomAuthor ? 'bg-indigo-600 text-white' : activePersona.avatarColor;

    const newReply: CommentReply = {
      id: `reply-${Date.now()}`,
      authorName,
      authorRole,
      authorAvatarColor,
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedComments = allComments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...c.replies, newReply],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    onChangeCourse({
      ...course,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });

    setReplyText('');
    setActiveReplyId(null);
  };

  const handleSetStatus = (commentId: string, newStatus: CommentStatus) => {
    const authorName = isCustomAuthor && customAuthorName.trim() ? customAuthorName.trim() : activePersona.name;
    const updatedComments = allComments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          status: newStatus,
          resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : undefined,
          resolvedBy: newStatus === 'resolved' ? authorName : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    onChangeCourse({
      ...course,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Delete this stakeholder comment?')) {
      const updatedComments = allComments.filter((c) => c.id !== commentId);
      onChangeCourse({
        ...course,
        comments: updatedComments,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleCopySuggestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${
        isExpanded
          ? 'bg-slate-50/95 border border-indigo-200 shadow-sm p-3.5 space-y-3'
          : 'inline-block'
      } ${className}`}
    >
      {/* Trigger button / header pill */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
            unresolvedCount > 0
              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-2xs'
              : totalCount > 0
              ? 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
          }`}
          title={`Collaborative team review on ${sectionTitle}`}
        >
          <MessageSquare className={`w-3.5 h-3.5 ${unresolvedCount > 0 ? 'text-amber-600' : 'text-indigo-600'}`} />
          <span>{totalCount > 0 ? `Section Feedback (${totalCount})` : 'Add Section Feedback'}</span>

          {unresolvedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center space-x-0.5">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>{unresolvedCount}</span>
            </span>
          )}

          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {isExpanded && onOpenFullReview && (
          <button
            type="button"
            onClick={() => onOpenFullReview(sectionKey, targetType, sectionTitle)}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
            title="Open comprehensive review drawer"
          >
            <span>All Sections</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Expanded Inline Feedback Panel */}
      {isExpanded && (
        <div className="space-y-3.5 pt-1">
          {/* Reviewer Persona Switcher */}
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 flex items-center space-x-1">
                <Users className="w-3 h-3 text-indigo-600" />
                <span>Reviewing As:</span>
              </span>
              <span className="text-slate-500 text-[10px]">
                {isCustomAuthor && customAuthorName ? customAuthorName : `${activePersona.name} (${activePersona.role})`}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {STAKEHOLDER_PERSONAS.map((p) => {
                const isSelected = !isCustomAuthor && activePersona.name === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setActivePersona(p);
                      setIsCustomAuthor(false);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition flex items-center space-x-1 border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white text-indigo-600' : p.avatarColor
                      }`}
                    >
                      {p.name.charAt(0)}
                    </span>
                    <span>{p.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-75">({p.role.split('/')[0].trim()})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Feedback Form */}
          <form onSubmit={handleAddComment} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">New Section Comment</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-slate-500">Priority:</span>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-slate-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap gap-1">
              {COMMENT_CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setNewCategory(cat.category)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer border ${
                    newCategory === cat.category
                      ? `${cat.color} font-bold ring-1 ring-indigo-400`
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={`Add instructional design feedback or questions for ${sectionTitle}...`}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
            />

            {/* Collapsible suggested revision */}
            {!showSuggestionInput ? (
              <button
                type="button"
                onClick={() => setShowSuggestionInput(true)}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                <span>+ Propose specific revision phrasing</span>
              </button>
            ) : (
              <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-indigo-900 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Proposed Phrasing</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggestionInput(false);
                      setSuggestedChange('');
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={suggestedChange}
                  onChange={(e) => setSuggestedChange(e.target.value)}
                  placeholder="e.g. Recommended rewording: '...'"
                  className="w-full p-1.5 text-xs rounded border border-indigo-200 bg-white"
                />
              </div>
            )}

            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                disabled={!newContent.trim()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>

          {/* Existing Comments on this section */}
          {sectionComments.length === 0 ? (
            <p className="text-center text-[11px] text-slate-400 py-1">
              No comments on this section yet. Share your team feedback above.
            </p>
          ) : (
            <div className="space-y-2.5">
              {sectionComments.map((comment) => {
                const isResolved = comment.status === 'resolved';

                return (
                  <div
                    key={comment.id}
                    className={`bg-white rounded-xl border p-3 space-y-2 transition ${
                      isResolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            comment.authorAvatarColor || 'bg-indigo-600 text-white'
                          }`}
                        >
                          {comment.authorName.charAt(0)}
                        </span>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-800">{comment.authorName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                                comment.authorRole
                              )}`}
                            >
                              {comment.authorRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatTime(comment.createdAt)}</span>
                            <span>•</span>
                            <span
                              className={`text-[9px] font-semibold px-1 rounded ${getCategoryBadgeColor(
                                comment.category
                              )}`}
                            >
                              {comment.category}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {isResolved ? (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(comment.id, 'open')}
                            className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1 hover:bg-emerald-100 cursor-pointer"
                            title="Click to reopen"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Resolved</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(comment.id, 'resolved')}
                            className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center space-x-1 hover:bg-amber-100 cursor-pointer"
                            title="Mark as resolved"
                          >
                            <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                            <span>Open</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-8 whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    {/* Proposed revision banner */}
                    {comment.suggestedChange && (
                      <div className="ml-8 p-2 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-indigo-900 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>Suggested Revision</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySuggestion(comment.suggestedChange!, comment.id)}
                            className="text-indigo-700 hover:text-indigo-900 font-semibold flex items-center space-x-0.5 cursor-pointer"
                          >
                            {copiedId === comment.id ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-mono text-indigo-950 bg-white/80 p-1.5 rounded border border-indigo-100 select-all">
                          {comment.suggestedChange}
                        </p>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-8 pl-3 border-l-2 border-indigo-100 space-y-1.5 pt-1">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-800">{reply.authorName}</span>
                              <span className="text-slate-400">{formatTime(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs text-slate-700 mt-0.5">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input trigger & form */}
                    <div className="ml-8 pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                        className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Reply ({comment.replies.length})</span>
                      </button>
                    </div>

                    {activeReplyId === comment.id && (
                      <div className="ml-8 pt-1 flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write reply..."
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddReply(comment.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                        >
                          Send
                        </button>
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
  );
};
