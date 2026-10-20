import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Building2,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tag,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  Course,
  CourseElementComment,
  StakeholderRole,
  CommentCategory,
  CommentTag,
  CommentTargetType,
} from '../../types';
import {
  COURSE_SECTIONS_META,
  COMMENT_CATEGORIES,
  STAKEHOLDER_PERSONAS,
  getRoleBadgeColor,
  getCategoryBadgeColor,
} from '../../utils/commentUtils';

export interface SectionCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  targetId: string;
  targetType: CommentTargetType;
  targetTitle: string;
  sectionKey?: string;
  stepNumber?: number;
  moduleId?: string;
  defaultRole?: StakeholderRole;
  defaultName?: string;
  defaultAffiliation?: string;
  onSubmitComment: (commentData: {
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
    category: CommentCategory;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags?: CommentTag[];
    content: string;
    suggestedChange?: string;
  }) => Promise<void> | void;
}

const STAKEHOLDER_ROLES: {
  role: StakeholderRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}[] = [
  {
    role: 'Industry Advisory',
    label: 'Industry Advisory Board',
    icon: Building2,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Corporate partners, industry practitioners, and employer liaisons',
  },
  {
    role: 'External Examiner',
    label: 'External Peer Reviewer',
    icon: GraduationCap,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Peer faculty and external academic curriculum auditors',
  },
  {
    role: 'Accreditation Reviewer',
    label: 'Accreditation Evaluator',
    icon: ShieldCheck,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'ABET, Washington Accord, and statutory quality assessors',
  },
  {
    role: 'Instructional Designer',
    label: 'Instructional Designer',
    icon: Briefcase,
    color: 'bg-pink-100 text-pink-800 border-pink-300',
    description: 'Pedagogical specialists and learning architects',
  },
  {
    role: 'Student Representative',
    label: 'Alumni / Student Representative',
    icon: UserCheck,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    description: 'Recent graduates, employers of alumni, and student council',
  },
];

export const SectionCommentDrawer: React.FC<SectionCommentDrawerProps> = ({
  isOpen,
  onClose,
  course,
  targetId,
  targetType,
  targetTitle,
  sectionKey,
  stepNumber,
  moduleId,
  defaultRole = 'Industry Advisory',
  defaultName = '',
  defaultAffiliation = '',
  onSubmitComment,
}) => {
  // Local form state
  const [authorName, setAuthorName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mentisera_stakeholder_name');
      return saved || defaultName || 'Sarah Chen';
    } catch {
      return defaultName || 'Sarah Chen';
    }
  });

  const [authorAffiliation, setAuthorAffiliation] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mentisera_stakeholder_affiliation');
      return saved || defaultAffiliation || 'Tech Advisory Council & Enterprise Cloud Lead';
    } catch {
      return defaultAffiliation || 'Tech Advisory Council';
    }
  });

  const [authorRole, setAuthorRole] = useState<StakeholderRole>(() => {
    try {
      const saved = localStorage.getItem('mentisera_stakeholder_role') as StakeholderRole;
      return saved || defaultRole || 'Industry Advisory';
    } catch {
      return defaultRole || 'Industry Advisory';
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<CommentCategory>('Industry Relevance');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [content, setContent] = useState<string>('');
  const [suggestedChange, setSuggestedChange] = useState<string>('');
  const [showSuggestedChange, setShowSuggestedChange] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<CommentTag[]>(['Suggestion']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Target element selection state (in case stakeholder wants to re-target)
  const [currentTargetId, setCurrentTargetId] = useState<string>(targetId);
  const [currentTargetTitle, setCurrentTargetTitle] = useState<string>(targetTitle);
  const [currentTargetType, setCurrentTargetType] = useState<CommentTargetType>(targetType);

  useEffect(() => {
    if (isOpen) {
      setCurrentTargetId(targetId);
      setCurrentTargetTitle(targetTitle);
      setCurrentTargetType(targetType);
      setSubmitSuccess(false);
      setContent('');
      setSuggestedChange('');
    }
  }, [isOpen, targetId, targetTitle, targetType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;

    setIsSubmitting(true);
    try {
      // Save identity for next time
      try {
        localStorage.setItem('mentisera_stakeholder_name', authorName.trim());
        localStorage.setItem('mentisera_stakeholder_affiliation', authorAffiliation.trim());
        localStorage.setItem('mentisera_stakeholder_role', authorRole);
      } catch {}

      const roleObj = STAKEHOLDER_ROLES.find((r) => r.role === authorRole);
      const avatarColor =
        authorRole === 'Industry Advisory'
          ? 'bg-amber-600 text-white'
          : authorRole === 'External Examiner'
          ? 'bg-emerald-600 text-white'
          : authorRole === 'Accreditation Reviewer'
          ? 'bg-purple-600 text-white'
          : 'bg-indigo-600 text-white';

      await onSubmitComment({
        targetType: currentTargetType,
        targetId: currentTargetId,
        targetTitle: currentTargetTitle,
        sectionKey,
        stepNumber,
        moduleId,
        authorName: authorName.trim(),
        authorRole,
        authorAffiliation: authorAffiliation.trim() || undefined,
        authorAvatarColor: avatarColor,
        category: selectedCategory,
        priority,
        tags: selectedTags,
        content: content.trim(),
        suggestedChange: suggestedChange.trim() ? suggestedChange.trim() : undefined,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to submit stakeholder comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: CommentTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/60 relative">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-300" />
                External Stakeholder Feedback
              </span>
              <span className="text-[11px] text-indigo-200/80">Read-Only Review Mode</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Comment on Specific Section
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Section Information Pill */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3 flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
              Targeted Curriculum Section
            </div>
            <div className="text-xs font-semibold text-slate-900 truncate">
              {currentTargetTitle}
            </div>
            <div className="text-[11px] text-slate-500">
              Type: <span className="font-medium text-slate-700">{currentTargetType}</span>
              {stepNumber && <span> &bull; Step {stepNumber}</span>}
              {course.code && <span> &bull; {course.code}</span>}
            </div>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {submitSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Stakeholder Feedback Recorded!</p>
                <p className="text-[11px] text-emerald-700">
                  Your comment has been attached to this section and shared with the faculty team.
                </p>
              </div>
            </div>
          )}

          {/* 1. Reviewer Identity Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                Your Stakeholder Profile
              </label>
              <span className="text-[10px] text-slate-400">Authenticated via shared link</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Chen or Dr. Tariq Al-Mansoor"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Company / Organization / Affiliation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google Cloud / Siemens / State University"
                  value={authorAffiliation}
                  onChange={(e) => setAuthorAffiliation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Stakeholder Role Radio Buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Stakeholder Capacity / Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STAKEHOLDER_ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = authorRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setAuthorRole(r.role)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-600/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-md ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-[11px] leading-tight">
                          {r.label}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                          {r.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Feedback Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Feedback Focus Area
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CommentCategory)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Industry Relevance">🏢 Industry Relevance & Job Skills</option>
                <option value="Workplace Readiness">⚡ Workplace Readiness & Practical Tools</option>
                <option value="Alignment & Rigor">🎯 Constructive Alignment & Rigor</option>
                <option value="Cognitive Level">🧠 Bloom's Taxonomy Cognitive Depth</option>
                <option value="Clarity & Wording">📝 Clarity & Outcome Measurability</option>
                <option value="Workload & Feasibility">⏱️ Workload, Credit Hours & Feasibility</option>
                <option value="Accreditation Standards">🏛️ Accreditation Compliance (ABET/WA)</option>
                <option value="Commendation">⭐ Commendation & Best Practice</option>
                <option value="General">💡 General Comment</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Priority / Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'critical'] as const).map((p) => {
                  const isSelected = priority === p;
                  const color =
                    p === 'critical'
                      ? isSelected
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'border-slate-200 text-slate-700 hover:bg-rose-50'
                      : p === 'high'
                      ? isSelected
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-slate-200 text-slate-700 hover:bg-amber-50'
                      : p === 'medium'
                      ? isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-700 hover:bg-indigo-50'
                      : isSelected
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100';

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 px-2 rounded-md border text-[10px] font-bold capitalize transition-colors ${color}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Feedback Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-800">
                Stakeholder Observation & Critique <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Actionable advice for faculty</span>
            </div>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide specific feedback from an industry advisor or academic peer perspective. For example: In Module 3, incorporate modern cloud observability tools (e.g. OpenTelemetry) to align with enterprise expectations..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 4. Suggested Concrete Revision */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Proposed Specific Revision (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowSuggestedChange(!showSuggestedChange)}
                className="text-[10px] text-indigo-600 hover:underline font-medium"
              >
                {showSuggestedChange ? 'Collapse' : 'Add Concrete Suggestion'}
              </button>
            </div>

            {showSuggestedChange && (
              <>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Write the exact wording change or topic addition you recommend the instructor adopt.
                </p>
                <textarea
                  rows={2}
                  value={suggestedChange}
                  onChange={(e) => setSuggestedChange(e.target.value)}
                  placeholder="e.g. 'Deploy and monitor microservices using cloud-native container tooling and distributed tracing.'"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </>
            )}
          </div>

          {/* 5. Stakeholder Recommendation Tags */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-slate-400" />
              Review Classification Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'Suggestion',
                  'Clarification Needed',
                  'Approval',
                ] as CommentTag[]
              ).map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || !authorName.trim()}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Comment on this Section</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Drawer Footer Notice */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Target: {currentTargetTitle}</span>
          <span>Read-Only Stakeholder Channel</span>
        </div>
      </div>
    </div>
  );
};
