import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Building2,
  GraduationCap,
  ShieldCheck,
  Search,
  Filter,
  FileDown,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Tag,
  Briefcase,
  Layers,
  ChevronRight,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { Course, CourseElementComment, StakeholderRole } from '../../types';
import {
  COURSE_SECTIONS_META,
  getRoleBadgeColor,
  getCategoryBadgeColor,
} from '../../utils/commentUtils';

export interface StakeholderCommentsSummaryTabProps {
  course: Course;
  comments: CourseElementComment[];
  onOpenCommentDrawer: (targetId: string, targetType: any, targetTitle: string) => void;
  onNavigateToSection: (sectionKey: string) => void;
}

interface SectionGroup {
  meta?: (typeof COURSE_SECTIONS_META)[0];
  title: string;
  comments: CourseElementComment[];
}

export const StakeholderCommentsSummaryTab: React.FC<StakeholderCommentsSummaryTabProps> = ({
  course,
  comments,
  onOpenCommentDrawer,
  onNavigateToSection,
}) => {
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Filtered comments list
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      if (filterRole !== 'all' && c.authorRole !== filterRole) return false;
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterSection !== 'all') {
        const matchesSec =
          c.sectionKey === filterSection ||
          c.targetId === filterSection ||
          c.moduleId === filterSection;
        if (!matchesSec) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ =
          c.content.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q) ||
          (c.authorAffiliation && c.authorAffiliation.toLowerCase().includes(q)) ||
          c.targetTitle.toLowerCase().includes(q) ||
          (c.suggestedChange && c.suggestedChange.toLowerCase().includes(q));
        if (!matchesQ) return false;
      }
      return true;
    });
  }, [comments, filterRole, filterSection, filterStatus, searchQuery]);

  // Statistics
  const totalCount = comments.length;
  const unresolvedCount = comments.filter((c) => c.status !== 'resolved').length;
  const industryCount = comments.filter((c) => c.authorRole === 'Industry Advisory').length;
  const peerCount = comments.filter(
    (c) => c.authorRole === 'External Examiner' || c.authorRole === 'Accreditation Reviewer'
  ).length;

  // Group comments by section
  const groupedBySection = useMemo<Record<string, SectionGroup>>(() => {
    const groups: Record<string, SectionGroup> = {};

    filteredComments.forEach((c) => {
      const sKey = c.sectionKey || c.targetId || 'general';
      if (!groups[sKey]) {
        const meta = COURSE_SECTIONS_META.find((m) => m.key === sKey);
        groups[sKey] = {
          meta,
          title: meta ? meta.title : c.targetTitle || 'General Course Section',
          comments: [],
        };
      }
      groups[sKey].comments.push(c);
    });

    return groups;
  }, [filteredComments]);

  // Generate and download export dossier
  const handleExportSummaryMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# EXTERNAL STAKEHOLDER REVIEW DOSSIER`);
    lines.push(`**Course:** ${course.code} - ${course.title}`);
    lines.push(`**Department / Academic Framework:** ${course.department || 'Curriculum'} | ${course.frameworkId || 'OBE'}`);
    lines.push(`**Generated On:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
    lines.push(`**Review Summary:** ${comments.length} total comments (${industryCount} Industry Advisory, ${peerCount} Peer Review, ${unresolvedCount} open items)`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    (Object.entries(groupedBySection) as [string, SectionGroup][]).forEach(([secKey, group]) => {
      lines.push(`## Section: ${group.title}`);
      lines.push(``);

      group.comments.forEach((c, idx) => {
        lines.push(`### Remark ${idx + 1}: ${c.authorName} (${c.authorRole})`);
        if (c.authorAffiliation) lines.push(`**Affiliation:** ${c.authorAffiliation}`);
        lines.push(`**Focus Area:** ${c.category} | **Priority:** ${(c.priority || 'medium').toUpperCase()} | **Status:** ${c.status}`);
        lines.push(`**Target Item:** ${c.targetTitle}`);
        lines.push(``);
        lines.push(`**Critique & Observation:**`);
        lines.push(`> ${c.content.replace(/\n/g, '\n> ')}`);
        lines.push(``);
        if (c.suggestedChange) {
          lines.push(`**Concrete Proposed Revision:**`);
          lines.push(`\`\`\`\n${c.suggestedChange}\n\`\`\``);
          lines.push(``);
        }
        if (c.replies && c.replies.length > 0) {
          lines.push(`**Discussion Replies (${c.replies.length}):**`);
          c.replies.forEach((rep) => {
            lines.push(`- **${rep.authorName} (${rep.authorRole}):** ${rep.content}`);
          });
          lines.push(``);
        }
        lines.push(`---`);
        lines.push(``);
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stakeholder_Review_Dossier_${course.code || 'Course'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# External Stakeholder Feedback: ${course.code} - ${course.title}`);
    lines.push(`Total Comments: ${comments.length}`);
    lines.push(``);
    comments.forEach((c) => {
      lines.push(`- [${c.authorRole}] ${c.authorName} on "${c.targetTitle}": ${c.content}`);
      if (c.suggestedChange) lines.push(`  Suggested: ${c.suggestedChange}`);
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Stakeholder Remarks</span>
            <MessageSquare className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {Object.keys(groupedBySection).length} course sections
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Industry Advisory Board</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{industryCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Workplace relevance & skill insights
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Academic Peer & Accreditation</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{peerCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Bloom rigor & syllabus audit
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Open Items Awaiting Faculty</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{unresolvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCount - unresolvedCount} resolved or incorporated
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search feedback remarks, reviewer names, suggestions, or section names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDossier ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleExportSummaryMarkdown}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Review Dossier (.md)</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Reviewer Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs text-slate-800"
            >
              <option value="all">All Stakeholder Roles ({comments.length})</option>
              <option value="Industry Advisory">Industry Advisory Board</option>
              <option value="External Examiner">External Peer Reviewers</option>
              <option value="Accreditation Reviewer">Accreditation Evaluators</option>
              <option value="Instructional Designer">Instructional Designers</option>
              <option value="Student Representative">Student / Alumni Representatives</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Course Section
            </label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs text-slate-800"
            >
              <option value="all">All Course Sections</option>
              {COURSE_SECTIONS_META.map((sec) => (
                <option key={sec.key} value={sec.key}>
                  Step {sec.stepNumber}: {sec.shortTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open / Under Evaluation</option>
              <option value="resolved">Resolved / Incorporated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Feedback List */}
      {filteredComments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">No Stakeholder Remarks Match Filters</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            There are no feedback comments matching your current query. Try resetting filters or post a new comment on a specific section.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedBySection) as [string, SectionGroup][]).map(([sectionKey, group]) => (
            <div key={sectionKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Section Header */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {group.meta?.stepNumber || '§'}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{group.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {group.comments.length} stakeholder remark{group.comments.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToSection(sectionKey)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    <span>View Section Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenCommentDrawer(sectionKey, 'Section', group.title)}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                  >
                    + Add Remark
                  </button>
                </div>
              </div>

              {/* Comments in this section */}
              <div className="p-5 space-y-4">
                {group.comments.map((comment) => {
                  const isIndustry = comment.authorRole === 'Industry Advisory';

                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl border text-xs space-y-3 ${
                        isIndustry
                          ? 'border-amber-200 bg-amber-50/30'
                          : 'border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{comment.authorName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(
                              comment.authorRole
                            )}`}
                          >
                            {comment.authorRole}
                          </span>
                          {comment.authorAffiliation && (
                            <span className="text-[11px] text-slate-500">
                              &bull; {comment.authorAffiliation}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                              comment.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {comment.status}
                          </span>
                        </div>
                      </div>

                      {/* Focus Area Pill */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeColor(
                            comment.category
                          )}`}
                        >
                          {comment.category}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Target: <strong className="text-slate-700">{comment.targetTitle}</strong>
                        </span>
                      </div>

                      {/* Comment Content */}
                      <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-150">
                        {comment.content}
                      </p>

                      {/* Suggested Concrete Change */}
                      {comment.suggestedChange && (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            Suggested Concrete Modification
                          </div>
                          <p className="text-xs font-mono text-emerald-900 bg-white/70 p-2 rounded border border-emerald-200/60 leading-relaxed">
                            {comment.suggestedChange}
                          </p>
                        </div>
                      )}

                      {/* Discussion Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-indigo-200 pt-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Replies ({comment.replies.length})
                          </div>
                          {comment.replies.map((rep) => (
                            <div key={rep.id} className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-100">
                              <span className="font-semibold text-slate-900">{rep.authorName}</span>
                              <span className="text-slate-400"> ({rep.authorRole}): </span>
                              <span>{rep.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
