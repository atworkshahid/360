import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  Check,
  Copy,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  Layers,
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  UploadCloud,
  Eye,
} from 'lucide-react';
import { Course, CourseAuditReport } from '../types';
import { calculateCourseAudit } from '../utils/obeCalculator';
import { analyzeAssessmentPlan } from '../utils/assessmentAnalysis';
import { downloadCoursePDF, PDFExportOptions } from '../utils/pdfExport';
import { downloadCourseDocx } from '../utils/docxExport';
import { GoogleDriveSyncModal } from './GoogleDriveSyncModal';
import { PDFPreviewModal } from './PDFPreviewModal';
import { triggerWithLeadGate } from '../services/leadService';

interface CoursePDFExportModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const CoursePDFExportModal: React.FC<CoursePDFExportModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [driveSyncModalOpen, setDriveSyncModalOpen] = useState(false);
  const [driveSyncModalMode, setDriveSyncModalMode] = useState<'sync' | 'share'>('sync');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Section inclusion options
  const [options, setOptions] = useState<PDFExportOptions>({
    includeCourseInfo: true,
    includeCLOs: true,
    includePLOMapping: true,
    includeModules: true,
    includeAssessments: true,
    includeRubrics: true,
    includeEvidenceRules: true,
    includeAuditReport: true,
    includeCQIPlan: true,
  });

  if (!isOpen) return null;

  const auditReport: CourseAuditReport = calculateCourseAudit(course);
  const assessmentAnalysis = analyzeAssessmentPlan(course);

  const handleDownloadPDF = () => {
    triggerWithLeadGate(
      () => {
        setIsGenerating(true);
        try {
          downloadCoursePDF(course, options);
        } catch (err) {
          console.error('Failed to generate PDF:', err);
        } finally {
          setTimeout(() => setIsGenerating(false), 800);
        }
      },
      {
        featureTitle: `${course.code} PDF Accreditation Dossier`,
        featureDescription: `Verify your academic affiliation to download the formatted PDF specification for ${course.title}.`,
        source: 'pdf_export_modal',
        framework: course.accreditationFramework,
      }
    );
  };

  const handleDownloadDocx = () => {
    triggerWithLeadGate(
      async () => {
        setIsGeneratingDocx(true);
        try {
          await downloadCourseDocx(course, options);
        } catch (err) {
          console.error('Failed to generate Word (.docx) document:', err);
        } finally {
          setTimeout(() => setIsGeneratingDocx(false), 500);
        }
      },
      {
        featureTitle: `${course.code} Word Specification (.docx)`,
        featureDescription: `Verify your academic affiliation to download the editable Word document specification for ${course.title}.`,
        source: 'docx_export_modal',
        framework: course.accreditationFramework,
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `ACCREDITATION AUDIT & COURSE SPECIFICATION DOSSIER
Course: ${course.title} (${course.code})
Level: ${course.courseLevel} | Credits: ${course.creditHours} CH | Mode: ${course.deliveryMode}
Discipline: ${course.programme || course.category}

OVERALL ALIGNMENT HEALTH: ${auditReport.healthScore}%
- Course Info: ${auditReport.categoryScores?.courseInfo || 0}%
- CLO Quality: ${auditReport.categoryScores?.cloQuality || 0}%
- PLO Mapping: ${auditReport.categoryScores?.cloPloMapping || 0}%
- Modular Alignment: ${auditReport.categoryScores?.mloAlignment || 0}%
- Assessment Coverage: ${auditReport.categoryScores?.assessmentCoverage || 0}%
- Evidence Rules: ${auditReport.categoryScores?.evidenceCoverage || 0}%

STATUS: ${(course.status || 'draft').toUpperCase()}
CLOs Defined: ${course.clos.length} | Modules: ${course.modules.length} | Assessments: ${course.assessments.length}
Gaps Identified: ${auditReport.gaps.length}

CQI Action Plan:
- Prior Offering Reflection: ${course.cqiPlan?.attainmentReflection || 'Baseline offering'}
- Planned Interventions: ${course.cqiPlan?.plannedInterventions || 'Constructive alignment scaffolding'}
- Target Metric: ${course.cqiPlan?.targetMetric || '≥ 70% threshold across cohort'}

Generated via MENTISERA OBE360™ on ${new Date().toLocaleDateString()}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(course, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2200);
  };

  const toggleOption = (key: keyof PDFExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-serif text-white">
                  Export Course Audit & Specification Dossier
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  PDF / Printable
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Generate an accreditation-compliant, publication-ready PDF report for institutional quality review.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Settings & Options + Right Live Dossier Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Configuration Controls (4 cols on lg) */}
          <div className="lg:col-span-4 p-5 bg-slate-50 border-r border-slate-200 overflow-y-auto space-y-5">
            {/* Quick Actions Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Primary Document Exports
              </span>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm shadow-indigo-200 transition cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Compiling PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Formatted PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="export-modal-sidebar-download-docx-btn"
                onClick={handleDownloadDocx}
                disabled={isGeneratingDocx}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm shadow-blue-200 transition cursor-pointer"
                title="Download formatted Microsoft Word document (.docx) with headings, tables, rubrics, and CQI plan"
              >
                {isGeneratingDocx ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Compiling Word (.docx)...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Download Formatted Word (.docx)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                title="Preview the exact rendered PDF layout using a temporary blob URL"
              >
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Preview PDF Document</span>
              </button>

              <button
                type="button"
                onClick={() => setDriveSyncModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm shadow-slate-300 transition cursor-pointer"
                title="Directly export and sync PDF dossier to Google Drive folder"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Sync Directly to Google Drive</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  title="Open system print dialog to print or save with browser high-res PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print View</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  title="Copy executive audit summary to clipboard"
                >
                  {copiedSummary ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>

            {/* Section Toggles */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Included Dossier Sections
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = Object.values(options).every(Boolean);
                    const newSetting = !allSelected;
                    setOptions({
                      includeCourseInfo: newSetting,
                      includeCLOs: newSetting,
                      includePLOMapping: newSetting,
                      includeModules: newSetting,
                      includeAssessments: newSetting,
                      includeRubrics: newSetting,
                      includeEvidenceRules: newSetting,
                      includeAuditReport: newSetting,
                      includeCQIPlan: newSetting,
                    });
                  }}
                  className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  {Object.values(options).every(Boolean) ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includeCourseInfo}
                    onChange={() => toggleOption('includeCourseInfo')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">1. Course Specification & Blueprint</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includeCLOs}
                    onChange={() => toggleOption('includeCLOs')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">2. CLOs & Bloom Taxonomy</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includePLOMapping}
                    onChange={() => toggleOption('includePLOMapping')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">3. Outcome Alignment Matrix (CLO ➔ PLO)</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includeModules}
                    onChange={() => toggleOption('includeModules')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">4. Modules, MLOs & Instructional Units</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includeAssessments}
                    onChange={() => toggleOption('includeAssessments')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">5. Assessment Blueprint & Weightages (100%)</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includeEvidenceRules}
                    onChange={() => toggleOption('includeEvidenceRules')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">6. Direct Evidence & Benchmark Rules</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includeAuditReport}
                    onChange={() => toggleOption('includeAuditReport')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">7. Constructive Alignment Audit Report</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.includeCQIPlan}
                    onChange={() => toggleOption('includeCQIPlan')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">8. Academic Sign-off & CQI Action Plan</span>
                </label>
              </div>
            </div>

            {/* Share / Export Formats */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Additional Share Formats
              </span>
              <button
                type="button"
                onClick={handleCopyJSON}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <span>Full JSON Specification</span>
                <span className="text-indigo-600 font-bold text-[11px]">
                  {copiedJSON ? 'Copied to Clipboard!' : 'Copy JSON'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Dossier Document Preview (8 cols on lg) */}
          <div className="lg:col-span-8 p-6 bg-slate-100/70 overflow-y-auto">
            {/* Sheet-like Paper Representation */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200/90 p-6 sm:p-8 space-y-6 max-w-3xl mx-auto font-sans">
              {/* Institutional Header & Stamp */}
              <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    MENTISERA OBE360™ • ACCREDITATION QUALITY DOSSIER
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif mt-1">
                    {course.title || 'Untitled Outcome-Based Course'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Course Code: <span className="font-bold text-slate-800">{course.code || 'N/A'}</span> •{' '}
                    Credits: <span className="font-bold text-slate-800">{course.creditHours || 3} CH</span> •{' '}
                    Level: <span className="font-bold text-slate-800">{course.courseLevel}</span> •{' '}
                    Mode: <span className="font-bold text-slate-800">{course.deliveryMode}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${
                      course.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : course.status === 'submitted'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    Status: {course.status || 'Draft'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Report Date: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Health Score & Audit Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-sm shrink-0 ${
                      auditReport.healthScore >= 90
                        ? 'bg-emerald-600'
                        : auditReport.healthScore >= 75
                        ? 'bg-indigo-600'
                        : 'bg-amber-500'
                    }`}
                  >
                    <span className="text-xl leading-none">{auditReport.healthScore}%</span>
                    <span className="text-[8px] font-semibold tracking-wider mt-0.5">HEALTH</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {auditReport.healthScore >= 90
                        ? 'Exemplary Alignment (Accreditation Ready)'
                        : auditReport.healthScore >= 75
                        ? 'Substantial Constructive Alignment'
                        : 'Alignment Deficiencies Detected'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Washington Accord / ABET outcome-based constructive alignment standards.
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                  <div className="text-slate-600">
                    CLOs: <span className="font-bold text-slate-900">{course.clos?.length || 0}</span>
                  </div>
                  <div className="text-slate-600">
                    Modules: <span className="font-bold text-slate-900">{course.modules?.length || 0}</span>
                  </div>
                  <div className="text-slate-600">
                    Assessments: <span className="font-bold text-slate-900">{course.assessments?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Preview Section 1: Course Blueprint */}
              {options.includeCourseInfo && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5 border-b border-slate-100 pb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>1. Course Specification & Blueprint</span>
                  </h3>
                  <div className="text-xs text-slate-700 space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900">Educational Purpose: </span>
                      <span>{course.blueprint?.purpose || course.description || 'Not provided'}</span>
                    </div>
                    {course.learningPromise && (
                      <div>
                        <span className="font-bold text-slate-900">Learning Promise: </span>
                        <span>{course.learningPromise}</span>
                      </div>
                    )}
                    {course.blueprint?.targetCompetencies && course.blueprint.targetCompetencies.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-900">Target Competencies: </span>
                        <span>{course.blueprint.targetCompetencies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Section 2: Course Learning Outcomes */}
              {options.includeCLOs && course.clos?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5 border-b border-slate-100 pb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>2. Course Learning Outcomes ({course.clos.length} CLOs)</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <tr>
                          <th className="p-2 border-b border-slate-200">CLO</th>
                          <th className="p-2 border-b border-slate-200">Outcome Statement</th>
                          <th className="p-2 border-b border-slate-200">Bloom</th>
                          <th className="p-2 border-b border-slate-200">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {course.clos.map((clo) => (
                          <tr key={clo.id}>
                            <td className="p-2 font-bold text-indigo-700 whitespace-nowrap">{clo.code}</td>
                            <td className="p-2 text-slate-800">{clo.statement}</td>
                            <td className="p-2 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                                {clo.bloomLevel}
                              </span>
                            </td>
                            <td className="p-2 font-semibold whitespace-nowrap">{clo.weightage || 0}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Preview Section 3: Assessment Blueprint */}
              {options.includeAssessments && course.assessments?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5 border-b border-slate-100 pb-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>3. Assessment Blueprint (Total: {course.assessments.reduce((acc, a) => acc + (a.weightage || 0), 0)}%)</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <tr>
                          <th className="p-2 border-b border-slate-200">Assessment Task</th>
                          <th className="p-2 border-b border-slate-200">Type</th>
                          <th className="p-2 border-b border-slate-200">Weight</th>
                          <th className="p-2 border-b border-slate-200">Bloom Level</th>
                          <th className="p-2 border-b border-slate-200">Evaluated CLOs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {course.assessments.map((a) => (
                          <tr key={a.id}>
                            <td className="p-2 font-bold text-slate-900">{a.name}</td>
                            <td className="p-2 text-slate-600">{a.type}</td>
                            <td className="p-2 font-bold text-indigo-600">{a.weightage || 0}%</td>
                            <td className="p-2 text-slate-700">{a.bloomLevel}</td>
                            <td className="p-2 text-slate-600">{a.linkedCLOIds?.join(', ') || 'All'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Preview Section 4: Audit & Remediation Gaps */}
              {options.includeAuditReport && auditReport.gaps?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center space-x-1.5 border-b border-slate-100 pb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>4. Identified Quality Alignment Gaps ({auditReport.gaps.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {auditReport.gaps.map((gap) => (
                      <div
                        key={gap.id}
                        className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 text-xs flex items-start space-x-2"
                      >
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-200 text-rose-800 shrink-0 mt-0.5">
                          {gap.severity}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900">{gap.title}: </span>
                          <span className="text-slate-700">{gap.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>MENTISERA OBE360™ Accreditation Suite</span>
                <span>Confidential Academic Dossier • Validated Specification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for Board of Studies, Academic Council, and Accreditation Submissions.</span>
          </div>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Preview rendered PDF document layout using a temporary blob URL"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Preview PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDriveSyncModalMode('sync');
                setDriveSyncModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-blue-200 transition cursor-pointer"
              title="Sync this course dossier to your Google Drive"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Sync to Drive</span>
            </button>
            <button
              type="button"
              id="export-modal-shareable-link-btn"
              onClick={() => {
                setDriveSyncModalMode('share');
                setDriveSyncModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-emerald-200 transition cursor-pointer"
              title="Export read-only course snapshot to Google Drive with shareable link (anyone with the link)"
            >
              <Share2 className="w-4 h-4" />
              <span>Shareable Link</span>
            </button>
            <button
              type="button"
              id="export-modal-footer-download-docx-btn"
              onClick={handleDownloadDocx}
              disabled={isGeneratingDocx}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-blue-200 transition cursor-pointer"
              title="Download formatted Microsoft Word document (.docx)"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingDocx ? 'Generating...' : 'Download Word (.docx)'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-200 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Download PDF Dossier'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview PDF Modal (Temporary Blob URL) */}
      <PDFPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        course={course}
        initialOptions={options}
        onProceedToDriveSync={() => {
          setPreviewModalOpen(false);
          setDriveSyncModalMode('sync');
          setDriveSyncModalOpen(true);
        }}
      />

      {/* Google Drive Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={driveSyncModalOpen}
        onClose={() => setDriveSyncModalOpen(false)}
        course={course}
        initialFormat="pdf"
        initialShareable={driveSyncModalMode === 'share'}
        mode={driveSyncModalMode}
      />
    </div>
  );
};
