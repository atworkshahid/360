import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileDown,
  FileText,
  FileCode,
  Share2,
  ShieldCheck,
  TrendingUp,
  Award,
  Copy,
  Check,
  Printer,
  Sliders,
  GraduationCap,
  FileSpreadsheet,
} from 'lucide-react';
import { Course, AcademicReview, CQIActionPlan } from '../../../types';
import { downloadCoursePDF, exportCourseBlueprintWithGate } from '../../../utils/pdfExport';
import { downloadCourseDocx } from '../../../utils/docxExport';
import { downloadCommonCartridge } from '../../../utils/lmsExport';
import { CoursePDFExportModal } from '../../CoursePDFExportModal';
import { LMSIntegrationModal } from '../../LMSIntegrationModal';
import { PrintFriendlyView } from '../PrintFriendlyView';
import { LMSFormatExportModal } from '../../LMSFormatExportModal';
import { triggerWithLeadGate } from '../../../services/leadService';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step15ReviewExport: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [copied, setCopied] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [printFriendlyOpen, setPrintFriendlyOpen] = useState(false);
  const [isQuickDownloading, setIsQuickDownloading] = useState(false);
  const [isDocxDownloading, setIsDocxDownloading] = useState(false);
  const [lmsModalOpen, setLmsModalOpen] = useState(false);
  const [isLmsExporting, setIsLmsExporting] = useState(false);
  const [lmsFormatExportModalOpen, setLmsFormatExportModalOpen] = useState(false);
  const [lmsFormatPlatform, setLmsFormatPlatform] = useState<'moodle' | 'blackboard'>('moodle');

  const handleQuickDownloadLMS = () => {
    triggerWithLeadGate(
      async () => {
        try {
          setIsLmsExporting(true);
          await downloadCommonCartridge(course);
        } catch (e) {
          console.error('Failed to export Common Cartridge', e);
        } finally {
          setIsLmsExporting(false);
        }
      },
      {
        featureTitle: `${course.code} IMS Common Cartridge (.imscc)`,
        featureDescription: `Verify your institutional affiliation to download the complete LMS package for ${course.title}.`,
        source: 'step15_imscc_export',
        framework: course.accreditationFramework,
      }
    );
  };

  const review: AcademicReview = course.academicReview || {
    status: 'Pending',
    reviewerName: '',
    reviewerRole: 'Curriculum & Accreditation Chair',
    reviewDate: new Date().toISOString().split('T')[0],
    feedback: 'Curriculum exhibits solid alignment across outcomes and direct assessments.',
    checklistItems: [
      { id: 'c1', label: 'All CLOs begin with active Bloom verbs and observable performance metrics', checked: true },
      { id: 'c2', label: 'Every CLO maps to at least one accredited Program Learning Outcome (PLO)', checked: true },
      { id: 'c3', label: 'Every Module Learning Outcome connects strictly to a parent CLO', checked: true },
      { id: 'c4', label: 'Assessment weightages sum to exactly 100% with no unassessed outcomes', checked: true },
      { id: 'c5', label: 'Direct assessment evidence rules and passing benchmarks are defined', checked: true },
    ],
  };

  const cqi: CQIActionPlan = course.cqiPlan || {
    cohortTerm: 'Fall 2025 (Previous Offering)',
    attainmentReflection: 'Learners attained 78% average in direct problem-solving briefs, but scored lower (54%) on comparative federalism questions in midterm.',
    identifiedDeficiencies: 'Insufficient scaffolding between doctrinal lectures and authentic statutory interpretation exercises.',
    plannedInterventions: 'Introduce guided moot bench discussions in Module 2 and increase formative problem-solving quizzes.',
    targetMetric: 'Attain ≥ 70% threshold across all cohort learners on comparative federalism outcomes.',
  };

  const handleUpdateReview = (updates: Partial<AcademicReview>) => {
    onChange({ ...course, academicReview: { ...review, ...updates } });
  };

  const handleToggleChecklist = (id: string) => {
    const updated = review.checklistItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    handleUpdateReview({ checklistItems: updated });
  };

  const handleUpdateCQI = (updates: Partial<CQIActionPlan>) => {
    onChange({ ...course, cqiPlan: { ...cqi, ...updates } });
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(course, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${course.code || 'course'}-obe-specification.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${course.title} (${course.code})
**Institution:** MENTISERA Institute of Learning and Development  
**Discipline:** ${course.category || course.programme} | **Credit Hours:** ${course.creditHours} | **Level:** ${course.courseLevel}  

## Description
${course.description}

## Course Learning Outcomes (CLOs)
${course.clos.map((c) => `- **${c.code}**: ${c.statement} (*${c.bloomLevel}* | Weight: ${c.weightage}% | Pass Threshold: ${c.achievementThreshold}%)`).join('\n')}

## Modules & Outline
${course.modules.map((m) => `### Module ${m.number}: ${m.title} (${m.durationWeeks} Weeks)
${m.description}
`).join('\n')}

## Assessment Plan
${course.assessments.map((a) => `- **${a.name}** (${a.type}): ${a.marks} Marks, ${a.weightage}% Course Weight (${a.bloomLevel})`).join('\n')}

## Academic Review Status: ${review.status}
- Reviewer: ${review.reviewerName || 'Unassigned'} (${review.reviewerRole})
- Feedback: ${review.feedback}
`;

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${course.code || 'course'}-syllabus.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(course, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickDownloadPDF = () => {
    setIsQuickDownloading(true);
    try {
      exportCourseBlueprintWithGate(course, {}, () => {
        setIsQuickDownloading(false);
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setTimeout(() => setIsQuickDownloading(false), 800);
    }
  };

  const handleExportDocx = () => {
    triggerWithLeadGate(
      async () => {
        setIsDocxDownloading(true);
        try {
          await downloadCourseDocx(course);
        } catch (err) {
          console.error('Failed to export Word document:', err);
        } finally {
          setIsDocxDownloading(false);
        }
      },
      {
        featureTitle: `${course.code} Word Specification (.docx)`,
        featureDescription: `Verify your faculty or institutional affiliation to download the editable Word syllabus specification for ${course.title}.`,
        source: 'step15_export_docx',
        framework: course.accreditationFramework,
      }
    );
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 15</span>
          <span>•</span>
          <span>Accreditation Approval & Continuous Improvement</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Academic Review, CQI & Export</h2>
            <p className="text-xs text-slate-500 mt-1">
              Finalize peer quality review, record continuous improvement (CQI) interventions, and export accreditation-compliant specifications.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setPdfModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Preview, configure, and export course audit & specification as a PDF document"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF Dossier</span>
            </button>
            <button
              type="button"
              id="step15-export-docx-btn"
              onClick={handleExportDocx}
              disabled={isDocxDownloading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Download formatted Microsoft Word document (.docx)"
            >
              <FileText className="w-4 h-4" />
              <span>{isDocxDownloading ? 'Exporting Word...' : 'Word (.docx)'}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>JSON Package</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Syllabus MD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Academic Peer Review Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Departmental Quality Assurance Review</h3>
              <p className="text-[11px] text-slate-500">Board of Studies / Academic Council accreditation checklist</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={review.status}
              onChange={(e) => handleUpdateReview({ status: e.target.value as any })}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                review.status === 'Approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : review.status === 'Revision Required'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved (Board Certified)</option>
              <option value="Revision Required">Revision Required</option>
            </select>
          </div>
        </div>

        {/* Sign-off Checklist */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Accreditation Standards Verification Checklist
          </span>
          {review.checklistItems.map((item) => (
            <label
              key={item.id}
              className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                item.checked ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggleChecklist(item.id)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className={`text-xs ${item.checked ? 'text-emerald-950 font-medium' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>

        {/* Reviewer Sign-off Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reviewer Name</label>
            <input
              type="text"
              value={review.reviewerName}
              onChange={(e) => handleUpdateReview({ reviewerName: e.target.value })}
              placeholder="e.g. Prof. Dr. Tariq Hassan"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reviewer Role</label>
            <input
              type="text"
              value={review.reviewerRole}
              onChange={(e) => handleUpdateReview({ reviewerRole: e.target.value })}
              placeholder="e.g. Curriculum Committee Chair"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Review Date</label>
            <input
              type="date"
              value={review.reviewDate}
              onChange={(e) => handleUpdateReview({ reviewDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Academic Committee Recommendations / Feedback
          </label>
          <textarea
            rows={2}
            value={review.feedback}
            onChange={(e) => handleUpdateReview({ feedback: e.target.value })}
            placeholder="Official comments from the Board of Studies..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CQI Action Plan Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Continuous Quality Improvement (CQI) Loop</h3>
            <p className="text-[11px] text-slate-500">
              Closing the outcome loop: How prior cohort attainment data directly shapes current course refinements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Previous Cohort Attainment Data & Reflection
            </label>
            <textarea
              rows={3}
              value={cqi.attainmentReflection}
              onChange={(e) => handleUpdateCQI({ attainmentReflection: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Targeted Pedagogical Interventions for this Offering
            </label>
            <textarea
              rows={3}
              value={cqi.plannedInterventions}
              onChange={(e) => handleUpdateCQI({ plannedInterventions: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Expected CQI Target Metric / Benchmark
          </label>
          <input
            type="text"
            value={cqi.targetMetric}
            onChange={(e) => handleUpdateCQI({ targetMetric: e.target.value })}
            placeholder="e.g. Attain ≥ 75% student achievement on analytical CLOs"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
          />
        </div>
      </div>

      {/* LMS Integration Hub (Moodle, Blackboard, Canvas) Showcase Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-400/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
              <span>LMS Interoperability &amp; Direct Deployment</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Deploy to Moodle, Blackboard Learn &amp; Canvas
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export an <strong>IMS Common Cartridge 1.2 package (.imscc)</strong> containing all modules, syllabus, rubrics, and Bloom's outcomes, or sync directly via REST API and embed using LTI 1.3 Advantage.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-300">
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>IMS Common Cartridge 1.2/1.3 (.imscc)</span>
              </span>
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Moodle Competency Framework CSV</span>
              </span>
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Blackboard Learn Rubrics XML</span>
              </span>
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>LTI 1.3 Advantage Deep Linking</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              id="step15-card-download-imscc-btn"
              onClick={handleQuickDownloadLMS}
              disabled={isLmsExporting}
              className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/40 transition cursor-pointer"
            >
              {isLmsExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Packaging .imscc...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Common Cartridge (.imscc)</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="step15-card-open-lms-schema-export-btn"
              onClick={() => {
                setLmsFormatPlatform('moodle');
                setLmsFormatExportModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
              title="Export course data into standard CSV and JSON schemas formatted for Moodle and Blackboard one-click imports"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Moodle &amp; Blackboard Schemas (CSV/JSON)</span>
            </button>

            <button
              type="button"
              id="step15-card-open-lms-hub-btn"
              onClick={() => setLmsModalOpen(true)}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Configure LMS Connectors &amp; LTI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accreditation Dossier & PDF Export Showcase Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accreditation Ready Documentation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Official Course Audit & Specification Dossier
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export a publication-grade PDF containing the complete pedagogical blueprint, outcome alignment matrix, modular scaffolding, assessment blueprint, constructive alignment audit findings, and Board of Studies sign-off.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-300">
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Washington Accord / ABET Aligned</span>
              </span>
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Printable High-DPI Output</span>
              </span>
              <span className="flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Audit & Gap Analysis</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              id="step15-card-export-pdf-btn"
              onClick={handleQuickDownloadPDF}
              disabled={isQuickDownloading}
              className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/40 transition cursor-pointer"
              title="Export printable PDF of current course audit and structure"
            >
              {isQuickDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exporting PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Export to PDF</span>
                </>
              )}
            </button>

            <button
              id="step15-card-export-docx-btn"
              onClick={handleExportDocx}
              disabled={isDocxDownloading}
              className="py-3 px-5 rounded-2xl bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-700/40 transition cursor-pointer"
              title="Download formatted Microsoft Word document (.docx)"
            >
              {isDocxDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Compiling Word...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Download Word (.docx)</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="step15-card-print-friendly-btn"
              onClick={() => setPrintFriendlyOpen(true)}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              title="Open clean, single-page print-friendly layout stripped of UI for physical printing or simplified reading"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print-Friendly View</span>
            </button>

            <button
              onClick={() => setPdfModalOpen(true)}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize & Preview Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-900">Course Creation Complete</span>
            <p className="text-[11px] text-slate-500">
              {course.title} is fully aligned, verified, and saved to your workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            id="step15-footer-print-friendly-btn"
            onClick={() => setPrintFriendlyOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Open clean, single-page print-friendly layout stripped of UI for physical printing or simplified reading"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print-Friendly View</span>
          </button>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Dossier</span>
          </button>

          <button
            id="step15-footer-export-docx-btn"
            onClick={handleExportDocx}
            disabled={isDocxDownloading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Download formatted Microsoft Word document (.docx)"
          >
            <FileText className="w-4 h-4" />
            <span>{isDocxDownloading ? 'Exporting...' : 'Export Word (.docx)'}</span>
          </button>

          <button
            type="button"
            id="step15-footer-lms-schema-export-btn"
            onClick={() => {
              setLmsFormatPlatform('moodle');
              setLmsFormatExportModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Export course data formatted into standard CSV and JSON schemas for Moodle and Blackboard"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <span>Moodle / Blackboard (CSV &amp; JSON)</span>
          </button>

          <button
            type="button"
            id="step15-footer-lms-hub-btn"
            onClick={() => setLmsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Export Common Cartridge or sync to Moodle, Blackboard, and Canvas"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>LMS Deploy (.imscc)</span>
          </button>

          <button
            onClick={handleCopyJSON}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      <div className="flex justify-start pt-2">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Preview</span>
        </button>
      </div>

      {/* PDF Export & Documentation Modal */}
      <CoursePDFExportModal
        course={course}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />

      {/* LMS Integration Hub Modal */}
      <LMSIntegrationModal
        course={course}
        isOpen={lmsModalOpen}
        onClose={() => setLmsModalOpen(false)}
        onAskCopilot={onAskCopilot}
      />

      {/* LMS Format Export Modal (Standard Moodle & Blackboard CSV & JSON) */}
      <LMSFormatExportModal
        course={course}
        isOpen={lmsFormatExportModalOpen}
        onClose={() => setLmsFormatExportModalOpen(false)}
        initialPlatform={lmsFormatPlatform}
      />

      {/* Print-Friendly View */}
      {printFriendlyOpen && (
        <PrintFriendlyView
          course={course}
          onClose={() => setPrintFriendlyOpen(false)}
        />
      )}
    </div>
  );
};
