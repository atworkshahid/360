import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Users,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Trash2,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Tag,
  Download,
} from 'lucide-react';
import {
  Course,
  CourseElementComment,
  CommentReply,
  StakeholderRole,
  CommentCategory,
  CommentStatus,
  CommentTargetType,
} from '../../../types';
import {
  STAKEHOLDER_PERSONAS,
  COMMENT_CATEGORIES,
  COURSE_SECTIONS_META,
  StakeholderPersona,
  getRoleBadgeColor,
  getCategoryBadgeColor,
  generateSampleCommentsForCourse,
  getCommentsForSection,
} from '../../../utils/commentUtils';
import { CollaborationService } from '../../../services/collaborationService';

interface ElementCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onChange: (updatedCourse: Course) => void;
  initialTargetId?: string;
  initialTargetType?: CommentTargetType;
  initialTargetTitle?: string;
  onNavigateToStep?: (stepNumber: number) => void;
}

export const ElementCommentDrawer: React.FC<ElementCommentDrawerProps> = ({
  isOpen,
  onClose,
  course,
  onChange,
  initialTargetId,
  initialTargetType,
  initialTargetTitle,
  onNavigateToStep,
}) => {
  // Active Persona for commenting
  const [activePersona, setActivePersona] = useState<StakeholderPersona>(STAKEHOLDER_PERSONAS[0]);
  const [customAuthorName, setCustomAuthorName] = useState('');
  const [isCustomAuthor, setIsCustomAuthor] = useState(false);

  // Filters
  const [selectedTargetFilter, setSelectedTargetFilter] = useState<string>(initialTargetId || 'all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'open' | 'in_review' | 'resolved'>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active View Tab: feed (Discussions Feed), matrix (15-Stage Section Review), report (Curriculum Review Report)
  const [activeTab, setActiveTab] = useState<'feed' | 'matrix' | 'report'>('feed');

  // New Comment Form State
  const [newCommentTargetId, setNewCommentTargetId] = useState<string>(initialTargetId || 'step-1-overview');
  const [newCommentCategory, setNewCommentCategory] = useState<CommentCategory>('Alignment & Rigor');
  const [newCommentPriority, setNewCommentPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newCommentSuggestedChange, setNewCommentSuggestedChange] = useState('');
  const [showSuggestedChangeInput, setShowSuggestedChangeInput] = useState(false);

  // Reply Form State: commentId -> replyText
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Copy indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reportCopied, setReportCopied] = useState(false);

  // Synchronize target filter when drawer opens with a specific target
  React.useEffect(() => {
    if (initialTargetId) {
      setSelectedTargetFilter(initialTargetId);
      setNewCommentTargetId(initialTargetId);
      setActiveTab('feed');
    }
  }, [initialTargetId, isOpen]);

  // Ensure comments list exists, or seed with initial realistic stakeholder reviews
  const allComments: CourseElementComment[] = useMemo(() => {
    if (course.comments && course.comments.length > 0) {
      return course.comments;
    }
    // If undefined or empty, lazily initialize with realistic sample discussions
    return generateSampleCommentsForCourse(course);
  }, [course]);

  // Handle saving comment changes back to course
  const handleUpdateComments = (updatedComments: CourseElementComment[]) => {
    onChange({
      ...course,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });
  };

  // Compile list of selectable elements (Sections 1-15, CLOs, Modules, and Assessments)
  const targetElements = useMemo(() => {
    const list: { id: string; type: CommentTargetType; title: string; step: number; sectionKey?: string; category?: string }[] = [];

    // 1. All 15 Course Stages/Sections
    COURSE_SECTIONS_META.forEach((sec) => {
      list.push({
        id: sec.key,
        type: 'Section',
        title: `Step ${sec.stepNumber}: ${sec.title}`,
        step: sec.stepNumber,
        sectionKey: sec.key,
        category: sec.category,
      });
    });

    // 2. Individual CLOs
    course.clos.forEach((clo) => {
      list.push({
        id: clo.id,
        type: 'CLO',
        title: `${clo.code}: ${clo.statement.slice(0, 50)}${clo.statement.length > 50 ? '...' : ''} (${clo.bloomVerb || clo.bloomLevel || 'Analyze'})`,
        step: 3,
        sectionKey: 'step-3-clos',
      });
    });

    // 3. Modules
    course.modules.forEach((mod) => {
      list.push({
        id: mod.id,
        type: 'Module',
        title: `Module ${mod.number}: ${mod.title}`,
        step: 5,
        sectionKey: 'step-5-modules',
      });
    });

    // 4. Assessments
    course.assessments.forEach((asmt) => {
      list.push({
        id: asmt.id,
        type: 'Assessment',
        title: `${asmt.name} (${asmt.type}, ${asmt.weightage}%)`,
        step: 9,
        sectionKey: 'step-9-assessments',
      });
    });

    return list;
  }, [course.clos, course.modules, course.assessments]);

  // Filtered comments
  const filteredComments = useMemo(() => {
    return allComments.filter((c) => {
      // Target Filter
      if (selectedTargetFilter !== 'all' && c.targetId !== selectedTargetFilter) {
        return false;
      }
      // Status Filter
      if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) {
        return false;
      }
      // Role Filter
      if (selectedRoleFilter !== 'all' && c.authorRole !== selectedRoleFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContent = c.content.toLowerCase().includes(q);
        const matchesAuthor = c.authorName.toLowerCase().includes(q);
        const matchesTitle = c.targetTitle.toLowerCase().includes(q);
        const matchesCategory = c.category.toLowerCase().includes(q);
        const matchesSuggestion = (c.suggestedChange || '').toLowerCase().includes(q);
        const matchesReplies = c.replies.some((r) => r.content.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q));
        if (!matchesContent && !matchesAuthor && !matchesTitle && !matchesCategory && !matchesSuggestion && !matchesReplies) {
          return false;
        }
      }
      return true;
    });
  }, [allComments, selectedTargetFilter, selectedStatusFilter, selectedRoleFilter, searchQuery]);

  // Stats
  const totalCount = allComments.length;
  const openCount = allComments.filter((c) => c.status === 'open').length;
  const inReviewCount = allComments.filter((c) => c.status === 'in_review').length;
  const resolvedCount = allComments.filter((c) => c.status === 'resolved').length;

  // Add a new comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    const target = targetElements.find((t) => t.id === newCommentTargetId) || {
      id: 'step-1-overview',
      type: 'Section' as const,
      title: 'Step 1: Course Setup & Basic Information',
      step: 1,
      sectionKey: 'step-1-overview',
    };

    const authorName = isCustomAuthor && customAuthorName.trim() ? customAuthorName.trim() : activePersona.name;
    const authorRole = isCustomAuthor ? 'Faculty / Instructor' : activePersona.role;
    const authorAvatarColor = isCustomAuthor ? 'bg-indigo-600 text-white' : activePersona.avatarColor;

    const newComment: CourseElementComment = {
      id: `comment-${Date.now()}`,
      targetType: target.type,
      targetId: target.id,
      targetTitle: target.title,
      sectionKey: target.sectionKey || (target.id.startsWith('step-') ? target.id : undefined),
      stepNumber: target.step,
      moduleId: target.type === 'Module' ? target.id : undefined,
      priority: newCommentPriority,
      authorName,
      authorRole,
      authorAvatarColor,
      category: newCommentCategory,
      content: newCommentContent.trim(),
      status: 'open',
      suggestedChange: newCommentSuggestedChange.trim() ? newCommentSuggestedChange.trim() : undefined,
      replies: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newComment, ...allComments];
    handleUpdateComments(updated);

    // Asynchronously synchronize comment to server for real-time collaborative reviewers
    CollaborationService.addComment(course.id, {
      targetType: newComment.targetType,
      targetId: newComment.targetId,
      targetTitle: newComment.targetTitle,
      sectionKey: newComment.sectionKey,
      stepNumber: newComment.stepNumber,
      priority: newComment.priority,
      authorName: newComment.authorName,
      authorRole: newComment.authorRole,
      authorAvatarColor: newComment.authorAvatarColor,
      category: newComment.category,
      content: newComment.content,
      suggestedChange: newComment.suggestedChange,
    }).catch((err) => console.warn('Real-time comment sync warning:', err));

    // Reset input
    setNewCommentContent('');
    setNewCommentSuggestedChange('');
    setShowSuggestedChangeInput(false);
  };

  // Generate complete Markdown review report for curriculum committee
  const generateMarkdownReport = () => {
    const lines: string[] = [];
    lines.push(`# Collaborative Curriculum Review Report`);
    lines.push(`**Course:** ${course.title || 'Untitled Course'} (${course.code || 'OBE-COURSE'})`);
    lines.push(`**Level:** ${course.courseLevel || 'Undergraduate'} | **Credits:** ${course.creditHours || 3} | **Date:** ${new Date().toLocaleDateString()}`);
    lines.push(``);
    lines.push(`## Executive Review Summary`);
    lines.push(`- **Total Feedback Threads:** ${totalCount}`);
    lines.push(`- **Open Action Items:** ${openCount}`);
    lines.push(`- **In Review:** ${inReviewCount}`);
    lines.push(`- **Resolved / Signoff:** ${resolvedCount}`);
    lines.push(``);
    lines.push(`## Section-by-Section Review Matrix`);

    COURSE_SECTIONS_META.forEach((sec) => {
      const secComments = allComments.filter(
        (c) => c.sectionKey === sec.key || c.targetId === sec.key || c.stepNumber === sec.stepNumber
      );
      lines.push(``);
      lines.push(`### Step ${sec.stepNumber}: ${sec.title}`);
      lines.push(`*Category:* ${sec.category} | *Total Comments:* ${secComments.length}`);
      if (secComments.length === 0) {
        lines.push(`> *No comments logged for this section.*`);
      } else {
        secComments.forEach((c) => {
          lines.push(`- **[${c.status.toUpperCase()}]** (${c.authorName} - ${c.authorRole} | *${c.category}*):`);
          lines.push(`  ${c.content}`);
          if (c.suggestedChange) {
            lines.push(`  - *Proposed Revision:* "${c.suggestedChange}"`);
          }
          if (c.replies.length > 0) {
            c.replies.forEach((r) => {
              lines.push(`    - Reply from ${r.authorName}: ${r.content}`);
            });
          }
          if (c.status === 'resolved' && c.resolvedBy) {
            lines.push(`    - *Resolved by:* ${c.resolvedBy}`);
          }
        });
      }
    });

    return lines.join('\n');
  };

  const handleCopyReport = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const md = generateMarkdownReport();
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${course.code || 'course'}-collaborative-review-report.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Add reply to comment
  const handleAddReply = (commentId: string) => {
    const text = (replyInputs[commentId] || '').trim();
    if (!text) return;

    const authorName = isCustomAuthor && customAuthorName.trim() ? customAuthorName.trim() : activePersona.name;
    const authorRole = isCustomAuthor ? 'Faculty / Instructor' : activePersona.role;
    const authorAvatarColor = isCustomAuthor ? 'bg-indigo-600 text-white' : activePersona.avatarColor;

    const newReply: CommentReply = {
      id: `reply-${Date.now()}`,
      authorName,
      authorRole,
      authorAvatarColor,
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updated = allComments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...c.replies, newReply],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    handleUpdateComments(updated);
    setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);

    // Asynchronously synchronize reply to server
    CollaborationService.addCommentReply(course.id, commentId, {
      authorName: newReply.authorName,
      authorRole: newReply.authorRole,
      authorAvatarColor: newReply.authorAvatarColor,
      content: newReply.content,
    }).catch((err) => console.warn('Reply sync warning:', err));
  };

  // Toggle status (open -> resolved, or resolved -> open)
  const handleSetStatus = (commentId: string, newStatus: CommentStatus) => {
    const resolver = isCustomAuthor && customAuthorName ? customAuthorName : activePersona.name;
    const updated = allComments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          status: newStatus,
          resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : undefined,
          resolvedBy: newStatus === 'resolved' ? resolver : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    handleUpdateComments(updated);

    // Asynchronously synchronize status change to server
    CollaborationService.updateCommentStatus(course.id, commentId, newStatus, resolver)
      .catch((err) => console.warn('Status sync warning:', err));
  };

  // Delete comment
  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Delete this stakeholder comment and its replies?')) {
      const updated = allComments.filter((c) => c.id !== commentId);
      handleUpdateComments(updated);
    }
  };

  // Copy suggested change text
  const handleCopySuggestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format relative date
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-serif">Stakeholder Feedback & Discussions</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
                  {totalCount} total
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Collaborative outcome review, cognitive alignment notes, and revision suggestions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="bg-slate-900 px-5 pt-0 pb-3 flex items-center space-x-2 border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussion Feed ({filteredComments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Section Matrix (15 Stages)</span>
            {openCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {openCount} open
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'report'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Curriculum Report</span>
          </button>
        </div>

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <>
            {/* Stakeholder Identity Switcher Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Reviewing As:</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Select your stakeholder role to attribute feedback
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {STAKEHOLDER_PERSONAS.map((p) => {
              const isSelected = !isCustomAuthor && activePersona.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    setActivePersona(p);
                    setIsCustomAuthor(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white text-indigo-600' : p.avatarColor
                    }`}
                  >
                    {p.name.charAt(0)}
                  </span>
                  <span>{p.name.split(' ')[0]}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    ({p.role.split('/')[0].trim()})
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setIsCustomAuthor(true)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 border cursor-pointer ${
                isCustomAuthor
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-dashed border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Custom Reviewer</span>
            </button>
          </div>

          {isCustomAuthor && (
            <div className="mt-2.5 flex items-center space-x-2">
              <input
                type="text"
                value={customAuthorName}
                onChange={(e) => setCustomAuthorName(e.target.value)}
                placeholder="Enter your name or committee title..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                autoFocus
              />
              <span className="text-xs font-bold text-slate-500">Role: Faculty / Reviewer</span>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Target Element Dropdown */}
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Course Element
              </label>
              <select
                value={selectedTargetFilter}
                onChange={(e) => {
                  setSelectedTargetFilter(e.target.value);
                  if (e.target.value !== 'all') {
                    setNewCommentTargetId(e.target.value);
                  }
                }}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">🌐 All Course Elements ({allComments.length} comments)</option>
                <optgroup label="Course Stages & Sections (1-15)">
                  {COURSE_SECTIONS_META.map((sec) => {
                    const count = allComments.filter(
                      (c) => c.sectionKey === sec.key || c.targetId === sec.key || c.stepNumber === sec.stepNumber
                    ).length;
                    return (
                      <option key={sec.key} value={sec.key}>
                        Step {sec.stepNumber}: {sec.shortTitle} ({count})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Course Learning Outcomes (CLOs)">
                  {course.clos.map((clo) => {
                    const count = allComments.filter((c) => c.targetId === clo.id).length;
                    return (
                      <option key={clo.id} value={clo.id}>
                        {clo.code}: {clo.statement.slice(0, 45)}... ({count})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Modules">
                  {course.modules.map((mod) => {
                    const count = allComments.filter((c) => c.targetId === mod.id).length;
                    return (
                      <option key={mod.id} value={mod.id}>
                        Module {mod.number}: {mod.title.slice(0, 40)}... ({count})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Assessments">
                  {course.assessments.map((asmt) => {
                    const count = allComments.filter((c) => c.targetId === asmt.id).length;
                    return (
                      <option key={asmt.id} value={asmt.id}>
                        {asmt.name} ({asmt.type}) ({count})
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            {/* Status Pills */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </label>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedStatusFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedStatusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('open')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedStatusFilter === 'open'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Open ({openCount})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('in_review')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedStatusFilter === 'in_review'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  In Review ({inReviewCount})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('resolved')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedStatusFilter === 'resolved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments, reviewers, suggestions, or outcome keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content: Add Form & Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Add Feedback Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {(isCustomAuthor && customAuthorName ? customAuthorName : activePersona.name).charAt(0)}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Leave Feedback as {isCustomAuthor && customAuthorName ? customAuthorName : activePersona.name}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1.5">
                    ({isCustomAuthor ? 'Faculty / Reviewer' : activePersona.role})
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                New Thread
              </span>
            </div>

            <form onSubmit={handleAddComment} className="space-y-3">
              {/* Element selector for new comment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Target Course Element <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newCommentTargetId}
                  onChange={(e) => setNewCommentTargetId(e.target.value)}
                  className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <optgroup label="Course Stages & Sections (1-15)">
                    {COURSE_SECTIONS_META.map((sec) => (
                      <option key={sec.key} value={sec.key}>
                        Step {sec.stepNumber}: {sec.shortTitle} — {sec.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Course Learning Outcomes (CLOs)">
                    {course.clos.map((clo) => (
                      <option key={clo.id} value={clo.id}>
                        {clo.code}: {clo.statement.slice(0, 50)}... ({clo.bloomLevel || 'Analyze'})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Modules">
                    {course.modules.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        Module {mod.number}: {mod.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Assessments">
                    {course.assessments.map((asmt) => (
                      <option key={asmt.id} value={asmt.id}>
                        {asmt.name} ({asmt.type})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Priority & Urgency */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Urgency / Priority Level
                </label>
                <div className="flex items-center space-x-1.5">
                  {(['low', 'medium', 'high', 'critical'] as const).map((p) => {
                    const isSelected = newCommentPriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewCommentPriority(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer border ${
                          isSelected
                            ? p === 'critical'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : p === 'high'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                              : p === 'medium'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Feedback Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMENT_CATEGORIES.map((cat) => {
                    const isSelected = newCommentCategory === cat.category;
                    return (
                      <button
                        key={cat.category}
                        type="button"
                        onClick={() => setNewCommentCategory(cat.category)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                          isSelected
                            ? `${cat.color} font-bold shadow-2xs ring-1 ring-indigo-400`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={cat.description}
                      >
                        {cat.category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Content */}
              <div>
                <textarea
                  rows={3}
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Provide constructive feedback, question cognitive depth, or highlight alignment strengths..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>

              {/* Collapsible Suggested Revision Input */}
              <div>
                {!showSuggestedChangeInput ? (
                  <button
                    type="button"
                    onClick={() => setShowSuggestedChangeInput(true)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>+ Propose specific phrasing or revision suggestion</span>
                  </button>
                ) : (
                  <div className="space-y-1 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Proposed Revision / Suggested Phrasing</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSuggestedChangeInput(false);
                          setNewCommentSuggestedChange('');
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={newCommentSuggestedChange}
                      onChange={(e) => setNewCommentSuggestedChange(e.target.value)}
                      placeholder="e.g. Recommended statement: 'Critically analyze constitutional writs and resolve jurisdictional conflicts...'"
                      className="w-full p-2 text-xs rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="submit"
                  disabled={!newCommentContent.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Stakeholder Feedback</span>
                </button>
              </div>
            </form>
          </div>

          {/* Comments List Header */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Discussions ({filteredComments.length})
            </span>
            <span className="text-[11px] text-slate-500">
              {openCount} need attention • {resolvedCount} resolved
            </span>
          </div>

          {/* Empty State */}
          {filteredComments.length === 0 && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No stakeholder discussions match your filters</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {searchQuery || selectedStatusFilter !== 'all' || selectedTargetFilter !== 'all'
                  ? 'Try clearing the search query or switching to "All Elements" to view discussions.'
                  : 'Be the first stakeholder to leave feedback on this course element.'}
              </p>
              {(searchQuery || selectedStatusFilter !== 'all' || selectedTargetFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedTargetFilter('all');
                    setSelectedStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer mt-2"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {/* List of Comment Cards */}
          <div className="space-y-4">
            {filteredComments.map((comment) => {
              const isResolved = comment.status === 'resolved';
              const isInReview = comment.status === 'in_review';
              const targetElem = targetElements.find((t) => t.id === comment.targetId);

              return (
                <div
                  key={comment.id}
                  className={`bg-white rounded-2xl border transition shadow-2xs space-y-3.5 p-4 ${
                    isResolved
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : isInReview
                      ? 'border-blue-200 bg-blue-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header: Author Info, Badges, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                          comment.authorAvatarColor || 'bg-indigo-600 text-white'
                        }`}
                      >
                        {comment.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{comment.authorName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${getRoleBadgeColor(
                              comment.authorRole
                            )}`}
                          >
                            {comment.authorRole}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatTime(comment.createdAt)}</span>
                          </span>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-md border ${getCategoryBadgeColor(
                              comment.category
                            )}`}
                          >
                            {comment.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Actions */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {isResolved ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Resolved</span>
                        </span>
                      ) : isInReview ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>In Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Open</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Target Element Reference Tag */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
                        {comment.targetType}:
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate" title={comment.targetTitle}>
                        {comment.targetTitle}
                      </span>
                    </div>

                    {targetElem && onNavigateToStep && (
                      <button
                        onClick={() => onNavigateToStep(targetElem.step)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 shrink-0 ml-2 transition cursor-pointer"
                        title={`Jump to Stage ${targetElem.step}`}
                      >
                        <span>Jump to Step</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Main Comment Text */}
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-1">
                    {comment.content}
                  </div>

                  {/* Proposed Revision Callout */}
                  {comment.suggestedChange && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>Proposed Revision</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySuggestion(comment.suggestedChange!, comment.id)}
                          className="text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedId === comment.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Suggestion</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-mono text-indigo-950 bg-white/80 p-2 rounded-lg border border-indigo-100 select-all">
                        {comment.suggestedChange}
                      </p>
                    </div>
                  )}

                  {/* Resolved Footer Audit Trail */}
                  {isResolved && comment.resolvedBy && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Marked as resolved by <strong className="font-bold">{comment.resolvedBy}</strong>
                        {comment.resolvedAt && ` • ${formatTime(comment.resolvedAt)}`}
                      </span>
                    </div>
                  )}

                  {/* Card Bottom Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      {isResolved ? (
                        <button
                          onClick={() => handleSetStatus(comment.id, 'open')}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <span>Reopen Discussion</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSetStatus(comment.id, 'resolved')}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark as Resolved</span>
                          </button>
                          {!isInReview && (
                            <button
                              onClick={() => handleSetStatus(comment.id, 'in_review')}
                              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center space-x-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                            >
                              <span>Mark In Review</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                      className={`text-xs font-semibold flex items-center space-x-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        activeReplyId === comment.id
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>{comment.replies.length > 0 ? `Replies (${comment.replies.length})` : 'Reply'}</span>
                    </button>
                  </div>

                  {/* Threaded Replies List */}
                  {comment.replies.length > 0 && (
                    <div className="space-y-2.5 pt-2 pl-4 border-l-2 border-indigo-100">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                  reply.authorAvatarColor || 'bg-slate-700 text-white'
                                }`}
                              >
                                {reply.authorName.charAt(0)}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{reply.authorName}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                                  reply.authorRole
                                )}`}
                              >
                                {reply.authorRole}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{formatTime(reply.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap pl-7">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Form */}
                  {activeReplyId === comment.id && (
                    <div className="pt-2 pl-4 border-l-2 border-indigo-300 space-y-2">
                      <div className="flex items-center space-x-2 text-[11px] text-slate-600 font-semibold">
                        <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          Replying as{' '}
                          <strong className="text-indigo-950">
                            {isCustomAuthor && customAuthorName ? customAuthorName : activePersona.name}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <textarea
                          rows={2}
                          value={replyInputs[comment.id] || ''}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({ ...prev, [comment.id]: e.target.value }))
                          }
                          placeholder="Write a reply or follow-up question..."
                          className="flex-1 p-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!(replyInputs[comment.id] || '').trim()}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition cursor-pointer shrink-0"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}

        {/* MATRIX TAB */}
        {activeTab === 'matrix' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Matrix Header Banner */}
            <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  15-Stage Section Review Matrix
                </h4>
                <p className="text-xs text-indigo-700 mt-1">
                  Track collaborative feedback coverage across all 15 course construction stages. Ensure every section has instructional designer and SME sign-off.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-indigo-900 block">
                  {COURSE_SECTIONS_META.filter((s) => {
                    const secComments = allComments.filter(
                      (c) => c.sectionKey === s.key || c.targetId === s.key || c.stepNumber === s.stepNumber
                    );
                    return secComments.length > 0 && secComments.every((c) => c.status === 'resolved');
                  }).length}{' '}
                  / 15 Stages Cleared
                </span>
                <span className="text-[10px] text-indigo-600">
                  {openCount} unresolved items
                </span>
              </div>
            </div>

            {/* List of 15 stages */}
            <div className="space-y-2.5">
              {COURSE_SECTIONS_META.map((sec) => {
                const secComments = allComments.filter(
                  (c) => c.sectionKey === sec.key || c.targetId === sec.key || c.stepNumber === sec.stepNumber
                );
                const secOpen = secComments.filter((c) => c.status === 'open').length;
                const secInReview = secComments.filter((c) => c.status === 'in_review').length;
                const secResolved = secComments.filter((c) => c.status === 'resolved').length;
                const isCleared = secComments.length > 0 && secOpen === 0 && secInReview === 0;

                return (
                  <div
                    key={sec.key}
                    className={`p-3.5 rounded-2xl border transition bg-white shadow-2xs ${
                      secOpen > 0
                        ? 'border-amber-200 bg-amber-50/10'
                        : isCleared
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isCleared
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : secOpen > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {sec.stepNumber}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">{sec.title}</span>
                            <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 rounded px-1.5 py-0.2">
                              {sec.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{sec.description}</p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {secComments.length === 0 ? (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                            No notes
                          </span>
                        ) : isCleared ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Signed Off ({secResolved})</span>
                          </span>
                        ) : (
                          <>
                            {secOpen > 0 && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                                {secOpen} open
                              </span>
                            )}
                            {secInReview > 0 && (
                              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                                {secInReview} in review
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer actions for this stage */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTargetFilter(sec.key);
                            setActiveTab('feed');
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>View Discussions ({secComments.length})</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => {
                            setNewCommentTargetId(sec.key);
                            setActiveTab('feed');
                          }}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          + Add Section Feedback
                        </button>
                      </div>

                      {onNavigateToStep && (
                        <button
                          onClick={() => {
                            onNavigateToStep(sec.stepNumber);
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Go to Step {sec.stepNumber}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Report Header */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
                    Accreditation & Curriculum Committee
                  </span>
                  <h4 className="text-base font-bold font-serif">Collaborative Review Report</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {course.title || 'Untitled Course'} • {course.code || 'OBE-COURSE'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyReport}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-slate-700"
                  >
                    {reportCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{reportCopied ? 'Copied!' : 'Copy Markdown'}</span>
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.md)</span>
                  </button>
                </div>
              </div>

              {/* Quick metrics grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="bg-slate-800/60 rounded-xl p-2">
                  <span className="block text-xs font-bold text-white">{totalCount}</span>
                  <span className="text-[10px] text-slate-400">Total Threads</span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-2">
                  <span className="block text-xs font-bold text-amber-400">{openCount}</span>
                  <span className="text-[10px] text-slate-400">Open Items</span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-2">
                  <span className="block text-xs font-bold text-blue-400">{inReviewCount}</span>
                  <span className="text-[10px] text-slate-400">In Review</span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-2">
                  <span className="block text-xs font-bold text-emerald-400">{resolvedCount}</span>
                  <span className="text-[10px] text-slate-400">Resolved</span>
                </div>
              </div>
            </div>

            {/* Markdown Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Document Preview
                </span>
                <span className="text-[11px] text-slate-400">Ready for committee distribution</span>
              </div>
              <pre className="text-xs font-mono text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-wrap max-h-[420px] overflow-y-auto leading-relaxed">
                {generateMarkdownReport()}
              </pre>
            </div>
          </div>
        )}

        {/* Footer Summary */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Comments persist with course data & export files</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
