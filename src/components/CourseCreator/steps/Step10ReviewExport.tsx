import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  History,
  GitBranch,
  BookOpen,
} from 'lucide-react';
import { Course, CourseStatus, CourseReviewComment } from '../../../types';
import { getFrameworkById } from '../../../data/frameworksData';
import { DEFAULT_INSTITUTION } from '../../../data/institutionData';
import { exportSyllabusPDF, exportSyllabusDOCX } from '../../../utils/syllabusExport';
import { downloadCoursePDF, exportCourseBlueprintWithGate } from '../../../utils/pdfExport';
import { downloadCourseDocx } from '../../../utils/docxExport';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onPrev: () => void;
  onOpenSyllabusModal?: () => void;
  onAskCopilot?: (prompt: string) => void;
}

const STATUS_FLOW: {
  status: CourseStatus;
  label: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    status: 'draft',
    label: 'Draft (Author Editing)',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
  },
  {
    status: 'ready_for_review',
    label: 'Ready for Review (Audit Passed)',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
  },
  {
    status: 'submitted',
    label: 'Submitted to Board of Studies',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
  },
  {
    status: 'changes_requested',
    label: 'Changes Requested by Reviewer',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
  },
  {
    status: 'approved',
    label: 'Accreditation Ready & Approved',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
  },
  {
    status: 'archived',
    label: 'Archived Historical Course',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-600',
  },
];

export const Step10ReviewExport: React.FC<StepProps> = ({
  course,
  onChange,
  onPrev,
  onOpenSyllabusModal,
  onAskCopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'export' | 'workflow' | 'comments'>(
    'preview'
  );
  const [commentText, setCommentText] = useState('');
  const [commentSection, setCommentSection] = useState('General');
  const [versionNote, setVersionNote] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const framework = getFrameworkById(course.frameworkId);
  const comments: CourseReviewComment[] = course.reviewerComments || [];

  const handleStatusChange = (newStatus: CourseStatus) => {
    onChange({
      ...course,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBumpVersion = (type: 'minor' | 'major') => {
    const currentVer = course.version || '1.0';
    const [major, minor] = currentVer.split('.').map(Number);
    const newVer =
      type === 'major'
        ? `${(major || 1) + 1}.0`
        : `${major || 1}.${(minor || 0) + 1}`;

    const newComment: CourseReviewComment = {
      id: `ver-${Date.now()}`,
      reviewerId: 'designer-1',
      reviewerName: 'Course Designer',
      reviewerRole: 'Course Designer',
      section: 'Versioning',
      comment: `Incremented version to v${newVer}: ${versionNote || 'Curricular refinement'}`,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    onChange({
      ...course,
      version: newVer,
      reviewerComments: [newComment, ...comments],
    });
    setVersionNote('');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: CourseReviewComment = {
      id: `cmt-${Date.now()}`,
      reviewerId: 'reviewer-1',
      reviewerName: 'Accreditation Reviewer',
      reviewerRole: 'Reviewer',
      section: commentSection,
      comment: commentText.trim(),
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    onChange({
      ...course,
      reviewerComments: [newComment, ...comments],
    });
    setCommentText('');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportSyllabusPDF(course, DEFAULT_INSTITUTION);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = () => {
    setIsExporting(true);
    try {
      exportSyllabusDOCX(course, DEFAULT_INSTITUTION);
    } catch (err) {
      console.error('DOCX export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 10 of 10</span>
            <span>•</span>
            <span>Final Dossier & Publication</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Review, Workflow Approval & Syllabus Export
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Publish an institutional-grade Course Syllabus, manage formal Board of Studies workflow status, and inspect accreditation readiness.
          </p>
        </div>

        {/* Primary Export Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Syllabus PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportDOCX}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Word (DOCX)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'preview', label: 'Academic Syllabus Preview' },
          { id: 'workflow', label: `Status & Governance (${course.status})` },
          { id: 'comments', label: `Review Comments (${comments.length})` },
          { id: 'export', label: 'Export & LMS Sync' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: 1. Academic Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-slate-800 font-sans">
          {/* Institution & Course Header */}
          <div className="border-b border-slate-200 pb-6 text-center space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {DEFAULT_INSTITUTION.name}
            </h4>
            <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
              {course.title || 'Untitled Course'}
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-600 pt-1 font-mono">
              <span className="font-bold text-indigo-700">{course.code}</span>
              <span>•</span>
              <span>Credit Hours: {course.creditHours} ({course.theoryHours ?? 2}-{course.labHours ?? 1})</span>
              <span>•</span>
              <span>{course.semester || 'Semester 5'}</span>
              <span>•</span>
              <span className="text-slate-500">Standard: {framework.name}</span>
            </div>
          </div>

          {/* Catalog Description & Rationale */}
          <div className="space-y-4 text-xs leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1">
                Course Description
              </h3>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {course.description || 'No description entered.'}
              </p>
            </div>

            {course.courseRationale && (
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1">
                  Course Rationale
                </h3>
                <p className="text-slate-700">{course.courseRationale}</p>
              </div>
            )}
          </div>

          {/* Course Learning Outcomes */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Course Learning Outcomes (CLOs)
            </h3>
            <div className="space-y-2">
              {(course.clos || []).map((clo) => (
                <div
                  key={clo.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3 text-xs"
                >
                  <span className="font-bold text-indigo-700 font-mono px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                    {clo.code}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">{clo.statement}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                      <span>Bloom Level: <strong className="text-slate-700">{clo.bloomLevel}</strong></span>
                      <span>Domain: {clo.learningDomain}</span>
                      <span>Target: {clo.achievementThreshold}% threshold</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Schedule Preview */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Instructional Schedule (16 Weeks)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-2.5 w-16 text-center">Week</th>
                    <th className="p-2.5">Topic & Subtopics</th>
                    <th className="p-2.5">Learning Activity</th>
                    <th className="p-2.5 w-24 text-center">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {(course.weeklyPlan || []).map((w) => (
                    <tr key={w.weekNumber} className="border-b border-slate-100">
                      <td className="p-2.5 text-center font-bold font-mono text-slate-700">
                        {w.weekNumber}
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{w.topic}</div>
                        <div className="text-[11px] text-slate-500">{w.subtopics}</div>
                      </td>
                      <td className="p-2.5 text-slate-700">{w.learningActivity}</td>
                      <td className="p-2.5 text-center text-slate-600">{w.contactHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assessment Plan Preview */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Grading & Assessment Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(course.assessments || []).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
                >
                  <div className="font-bold text-slate-900">{a.name}</div>
                  <div className="text-indigo-700 font-extrabold text-sm">{a.weightage}%</div>
                  <div className="text-[10px] text-slate-500">{a.type} • {a.bloomLevel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: 2. Status & Governance */}
      {activeTab === 'workflow' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Curriculum Governance & Approval Lifecycle
            </h3>
            <p className="text-xs text-slate-500">
              Manage the formal Board of Studies submission state and curricular versioning history.
            </p>
          </div>

          {/* Status Selection Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STATUS_FLOW.map((s) => {
              const isActive = course.status === s.status;
              return (
                <div
                  key={s.status}
                  onClick={() => handleStatusChange(s.status)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.badgeBg} ${s.badgeText}`}
                    >
                      {s.status}
                    </span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.label}</h4>
                </div>
              );
            })}
          </div>

          {/* Versioning Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Current Syllabus Revision: v{course.version || '1.0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Updated: {new Date(course.updatedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="Change notes for revision bump (e.g. Revised CLO 2 Bloom level)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
              <button
                type="button"
                onClick={() => handleBumpVersion('minor')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Bump Minor (1.x)
              </button>
              <button
                type="button"
                onClick={() => handleBumpVersion('major')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
              >
                Bump Major (2.0)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: 3. Review Comments */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Peer & Accreditation Reviewer Log
            </h3>
            <p className="text-xs text-slate-500">
              Departmental Quality Assurance feedback and Board of Studies audit notes.
            </p>
          </div>

          {/* Add Review Note Form */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <select
                value={commentSection}
                onChange={(e) => setCommentSection(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white"
              >
                <option value="General">General Course Comments</option>
                <option value="CLOs">Learning Outcomes (CLOs)</option>
                <option value="Mapping">Outcome Mapping Matrix</option>
                <option value="WeeklyPlan">Weekly Schedule</option>
                <option value="Assessments">Assessment & Grading</option>
              </select>
              <span className="text-xs text-slate-400">Select section being audited</span>
            </div>

            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter specific audit critique or suggestions (e.g. CLO 3 needs a more active verb to meet ABET EAC Criterion 3)..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddComment}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Review Note</span>
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No review comments posted yet.
              </div>
            ) : (
              comments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{cmt.reviewerName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {cmt.reviewerRole}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                        {cmt.section}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(cmt.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 pt-1 leading-relaxed">{cmt.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content: 4. Export & LMS Sync */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">
                Course Blueprint &amp; Document Exports
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Print-Optimized
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Download your complete course blueprint or institutional syllabus in publication-grade PDF and editable Microsoft Word formats.
            </p>
          </div>

          {/* Featured: Official Course Blueprint (Print-Optimized) */}
          <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Recommended
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Official OBE Course Blueprint (Print-Optimized)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Complete accredited blueprint featuring outcome mappings, bloom taxonomy distribution, weekly modules, assessment plans, rubrics, and references.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  id="step10-download-blueprint-pdf"
                  onClick={() => exportCourseBlueprintWithGate(course)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  title="Export printable PDF of current course audit and structure"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Export to PDF</span>
                </button>
                <button
                  type="button"
                  id="step10-download-blueprint-docx"
                  onClick={() => downloadCourseDocx(course)}
                  className="px-3.5 py-2 bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Word (.docx)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-2">
                  PDF
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Institutional Syllabus PDF
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Accredited syllabus document formatted with institutional header, outcome matrix, and weekly schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportPDF}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export to PDF</span>
              </button>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-2">
                  DOC
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Editable Syllabus (.doc)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Pre-formatted Microsoft Word syllabus document with HTML tables for manual faculty editing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportDOCX}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Download Syllabus (.doc)
              </button>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
                  JSON
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  OBE360 Course Manifest
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Standardized JSON representation of full course taxonomy, alignment tables, and assessment instruments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const dataStr =
                    'data:text/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify(course, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute(
                    'download',
                    `${course.code || 'course'}-manifest.json`
                  );
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Download JSON Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Alignment Check</span>
        </button>

        <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>10-Step Course Design Complete</span>
        </div>
      </div>
    </div>
  );
};
