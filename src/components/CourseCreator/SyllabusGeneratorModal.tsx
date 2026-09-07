import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Settings,
  Eye,
  BookOpen,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Scale,
  Award,
  Clock,
  Sliders,
  FileCheck,
} from 'lucide-react';
import { Course } from '../../types';
import {
  SyllabusConfig,
  getDefaultSyllabusConfig,
  downloadSyllabusPDF,
  downloadSyllabusDocx,
  generateSyllabusMarkdown,
} from '../../utils/syllabusExport';

interface SyllabusGeneratorModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const SyllabusGeneratorModal: React.FC<SyllabusGeneratorModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<SyllabusConfig>(() => getDefaultSyllabusConfig(course));
  const [activeTab, setActiveTab] = useState<'preview' | 'customize' | 'sections'>('preview');
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [isDocxExporting, setIsDocxExporting] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsPdfExporting(true);
    try {
      downloadSyllabusPDF(course, config);
      setCopiedSuccess('Syllabus PDF downloaded successfully!');
      setTimeout(() => setCopiedSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to generate Syllabus PDF:', err);
    } finally {
      setTimeout(() => setIsPdfExporting(false), 600);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDocxExporting(true);
    try {
      await downloadSyllabusDocx(course, config);
      setCopiedSuccess('Syllabus Word document (.docx) downloaded successfully!');
      setTimeout(() => setCopiedSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to generate Syllabus Docx:', err);
    } finally {
      setIsDocxExporting(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = generateSyllabusMarkdown(course, config);
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setCopiedSuccess('Syllabus markdown copied to clipboard (ready for Canvas/Moodle)!');
    setTimeout(() => {
      setCopiedMarkdown(false);
      setTimeout(() => setCopiedSuccess(null), 2500);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAssessmentWeight = (course.assessments || []).reduce((acc, a) => acc + (a.weightage || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/90 border border-indigo-400/30 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Course Syllabus Generator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                  OBE-360 Document
                </span>
                <span className="hidden md:inline px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PDF & Word Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {course.code ? `${course.code}: ` : ''}{course.title} • {course.creditHours} Credits • {course.clos?.length || 0} CLOs • {course.modules?.length || 0} Modules
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {copiedSuccess && (
              <span className="hidden sm:inline text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg animate-in fade-in">
                ✓ {copiedSuccess}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Actions */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Document Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'customize'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Instructor & Institution</span>
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Section Toggles</span>
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
              title="Copy Syllabus text in Markdown format for LMS pasting"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden sm:inline">{copiedMarkdown ? 'Copied' : 'Copy Text / MD'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
              title="Print formatted syllabus directly"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isDocxExporting}
              className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Download editable Microsoft Word Syllabus (.docx)"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{isDocxExporting ? 'Generating Doc...' : 'Export Word (.docx)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isPdfExporting}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs shadow-indigo-200 disabled:opacity-50"
              title="Download publication-grade PDF Syllabus"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>{isPdfExporting ? 'Generating PDF...' : 'Download PDF Syllabus'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-slate-100/60 p-4 sm:p-6">
          {/* TAB 1: DOCUMENT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-10 text-slate-800 text-xs sm:text-sm font-sans">
              {/* Document Header */}
              <div className="border-b-2 border-slate-800 pb-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-700">
                      {config.institutionName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {config.facultyName} • {config.departmentName}
                    </p>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
                      {course.code ? `${course.code}: ` : ''}{course.title}
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      Official Course Syllabus • {config.academicTerm} ({config.academicYear})
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      OBE-360 Accredited
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {course.creditHours} Credit Hours
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {course.durationWeeks} Weeks • {course.deliveryMode}
                    </p>
                  </div>
                </div>

                {/* Course & Instructor Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">Course Logistics</p>
                    <p><span className="text-slate-500 font-medium">Schedule:</span> {config.classSchedule}</p>
                    <p><span className="text-slate-500 font-medium">Location:</span> {config.classroomLocation}</p>
                    <p><span className="text-slate-500 font-medium">Prerequisites:</span> {course.prerequisites || 'None'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">Instructor & Office</p>
                    <p><span className="text-slate-500 font-medium">Instructor:</span> {config.instructorName} ({config.instructorTitle})</p>
                    <p><span className="text-slate-500 font-medium">Email:</span> {config.instructorEmail}</p>
                    <p><span className="text-slate-500 font-medium">Office & Hours:</span> {config.instructorOffice} • {config.officeHours}</p>
                  </div>
                </div>
              </div>

              {/* 1. Course Description */}
              {config.includeCourseOverview && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    1. Course Description & Objectives
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-700 mb-3">
                    {course.description || course.overview || 'This course provides learners with foundational and advanced principles, methodologies, and practical proficiencies.'}
                  </p>
                  {course.capstoneGoal && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs">
                      <span className="font-bold text-indigo-900">Capstone Learning Promise: </span>
                      <span className="text-indigo-800">{course.capstoneGoal}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Course Learning Outcomes */}
              {config.includeCLOs && course.clos && course.clos.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    2. Course Learning Outcomes (CLOs) & Bloom's Taxonomy
                  </h2>
                  <p className="text-xs text-slate-600 mb-2.5">
                    Upon successful completion of this course, students will be able to demonstrate measurable achievement in:
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="p-2 w-16 text-center">Code</th>
                          <th className="p-2">Learning Outcome Statement</th>
                          <th className="p-2 w-28 text-center">Bloom Level</th>
                          <th className="p-2 w-20 text-center">Domain</th>
                          <th className="p-2 w-16 text-center">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {course.clos.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900 text-center bg-slate-50">{c.code}</td>
                            <td className="p-2 text-slate-800">{c.statement}</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {c.bloomLevel} ({c.bloomVerb})
                              </span>
                            </td>
                            <td className="p-2 text-center text-slate-600">{c.learningDomain || 'Cognitive'}</td>
                            <td className="p-2 text-center font-bold text-slate-800">{c.weightage || 0}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. PLO Mapping Matrix */}
              {config.includePLOMatrix && course.plos && course.plos.length > 0 && course.clos && course.clos.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    3. Program Learning Outcomes (PLO) Mapping Matrix
                  </h2>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead className="bg-slate-800 text-white">
                        <tr>
                          <th className="p-2 text-left w-24">CLO \ PLO</th>
                          {course.plos.map((p) => (
                            <th key={p.id} className="p-2" title={p.title}>
                              {p.code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {course.clos.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-left text-slate-900 bg-slate-50">{c.code}</td>
                            {course.plos.map((p) => {
                              const m = c.mappedPLOs?.find((item) => item.ploId === p.id);
                              const letter = m ? (m.level === 'Introduced' ? 'I' : m.level === 'Reinforced' ? 'R' : 'M') : '—';
                              const colorClass =
                                letter === 'I'
                                  ? 'text-blue-700 font-bold bg-blue-50/50'
                                  : letter === 'R'
                                  ? 'text-indigo-700 font-bold bg-indigo-50/50'
                                  : letter === 'M'
                                  ? 'text-emerald-700 font-bold bg-emerald-50/50'
                                  : 'text-slate-300';
                              return (
                                <td key={p.id} className={`p-2 ${colorClass}`}>
                                  {letter}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-1.5">
                    Legend: I = Introduced (Foundation) • R = Reinforced (Application & Deepening) • M = Mastered (Synthesis & Professional Competence)
                  </p>
                </div>
              )}

              {/* 4. Textbooks & Required Resources */}
              {config.includeTextbooks && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    4. Textbooks & Learning Resources
                  </h2>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900">Required Textbook(s):</p>
                      <p className="text-slate-700 whitespace-pre-line mt-1">{config.requiredTextbooks}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900">Recommended References & Readings:</p>
                      <p className="text-slate-700 whitespace-pre-line mt-1">{config.recommendedReadings}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Weekly Schedule */}
              {config.includeWeeklySchedule && course.modules && course.modules.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    5. Modular Course Schedule & Topic Timeline
                  </h2>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="p-2 w-20 text-center">Module #</th>
                          <th className="p-2 w-48">Topic Title</th>
                          <th className="p-2">Content & Activities</th>
                          <th className="p-2 w-20 text-center">Duration</th>
                          <th className="p-2 w-24 text-center">CLOs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {course.modules.map((m, idx) => {
                          const linked = m.relatedCLOIds
                            ? m.relatedCLOIds
                                .map((id) => course.clos.find((c) => c.id === id)?.code)
                                .filter(Boolean)
                                .join(', ')
                            : 'All';
                          return (
                            <tr key={m.id || idx} className="hover:bg-slate-50">
                              <td className="p-2 text-center font-bold text-slate-900 bg-slate-50">
                                Mod {m.number || idx + 1}
                              </td>
                              <td className="p-2 font-bold text-slate-800">{m.title}</td>
                              <td className="p-2 text-slate-700">{m.description}</td>
                              <td className="p-2 text-center text-slate-600">{m.durationWeeks || 1} Wk</td>
                              <td className="p-2 text-center font-semibold text-indigo-700">{linked || 'General'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. Assessment Plan */}
              {config.includeAssessments && course.assessments && course.assessments.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      6. Assessment Plan & Weightage Breakdown
                    </h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      totalAssessmentWeight === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      Total Weight: {totalAssessmentWeight}% {totalAssessmentWeight === 100 ? '✓' : '(Target: 100%)'}
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-indigo-900 text-white">
                        <tr>
                          <th className="p-2">Assessment Instrument</th>
                          <th className="p-2 w-28">Type</th>
                          <th className="p-2 w-24 text-center">Nature</th>
                          <th className="p-2 w-20 text-center">Max Marks</th>
                          <th className="p-2 w-20 text-center">Weight</th>
                          <th className="p-2 w-24 text-center">Bloom Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {course.assessments.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900">{a.name}</td>
                            <td className="p-2 text-slate-600">{a.type}</td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.isSummative
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {a.isSummative ? 'Summative' : 'Formative'}
                              </span>
                            </td>
                            <td className="p-2 text-center font-medium text-slate-700">{a.marks || 100} pts</td>
                            <td className="p-2 text-center font-bold text-indigo-700 bg-indigo-50/50">{a.weightage || 0}%</td>
                            <td className="p-2 text-center text-slate-600">{a.bloomLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. Institutional Grading Scale */}
              {config.includeGradingScale && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    7. Institutional Grading Scale
                  </h2>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-line font-mono">
                    {config.gradingScale}
                  </div>
                </div>
              )}

              {/* 8. Policies */}
              {config.includePolicies && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    8. Academic Regulations & Course Policies
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Academic Integrity & Honor Code</span>
                      </p>
                      <p className="text-slate-700 mt-1">{config.academicIntegrityPolicy}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Generative AI Usage Policy</span>
                      </p>
                      <p className="text-slate-700 mt-1">{config.aiUsagePolicy}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Attendance & Late Submissions</span>
                      </p>
                      <p className="text-slate-700 mt-1">{config.lateSubmissionPolicy}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <Scale className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Disability & Accommodations</span>
                      </p>
                      <p className="text-slate-700 mt-1">{config.accommodationsPolicy}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. OBE & CQI Note */}
              {config.includeCQIStatement && (
                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950">
                  <p className="font-bold text-indigo-900 flex items-center space-x-2 mb-1">
                    <Award className="w-4 h-4 text-indigo-700" />
                    <span>Outcome-Based Education (OBE360) Attainment & Continuous Improvement</span>
                  </p>
                  <p className="text-slate-700 leading-relaxed">{config.cqiStatement}</p>
                </div>
              )}

              {/* Document Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>{course.code} Course Syllabus • Generated with OBE360</span>
                <span>Page 1 of 1 • Official Academic Record</span>
              </div>
            </div>
          )}

          {/* TAB 2: INSTRUCTOR & INSTITUTION CUSTOMIZATION */}
          {activeTab === 'customize' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Institutional Details & Academic Term</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={config.institutionName}
                      onChange={(e) => setConfig({ ...config, institutionName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Faculty / School</label>
                    <input
                      type="text"
                      value={config.facultyName}
                      onChange={(e) => setConfig({ ...config, facultyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={config.departmentName}
                      onChange={(e) => setConfig({ ...config, departmentName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Academic Term</label>
                      <input
                        type="text"
                        value={config.academicTerm}
                        onChange={(e) => setConfig({ ...config, academicTerm: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={config.academicYear}
                        onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>Instructor & Contact Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Instructor Name</label>
                    <input
                      type="text"
                      value={config.instructorName}
                      onChange={(e) => setConfig({ ...config, instructorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Instructor Title / Role</label>
                    <input
                      type="text"
                      value={config.instructorTitle}
                      onChange={(e) => setConfig({ ...config, instructorTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Instructor Email</label>
                    <input
                      type="email"
                      value={config.instructorEmail}
                      onChange={(e) => setConfig({ ...config, instructorEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
                    <input
                      type="text"
                      value={config.instructorOffice}
                      onChange={(e) => setConfig({ ...config, instructorOffice: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Office Hours</label>
                    <input
                      type="text"
                      value={config.officeHours}
                      onChange={(e) => setConfig({ ...config, officeHours: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Class Schedule & Times</label>
                    <input
                      type="text"
                      value={config.classSchedule}
                      onChange={(e) => setConfig({ ...config, classSchedule: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Classroom / Learning Platform Location</label>
                    <input
                      type="text"
                      value={config.classroomLocation}
                      onChange={(e) => setConfig({ ...config, classroomLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Textbooks, References & Policies</span>
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Required Textbooks & Courseware</label>
                    <textarea
                      rows={2}
                      value={config.requiredTextbooks}
                      onChange={(e) => setConfig({ ...config, requiredTextbooks: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Academic Integrity Policy</label>
                    <textarea
                      rows={2}
                      value={config.academicIntegrityPolicy}
                      onChange={(e) => setConfig({ ...config, academicIntegrityPolicy: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Generative AI Usage Guidelines</label>
                    <textarea
                      rows={2}
                      value={config.aiUsagePolicy}
                      onChange={(e) => setConfig({ ...config, aiUsagePolicy: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTION TOGGLES */}
          {activeTab === 'sections' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Configure Included Syllabus Sections</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which OBE360 sections appear in the generated PDF and Word documents.
                </p>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 text-xs">
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">1. Course Description & Overview</span>
                  <input
                    type="checkbox"
                    checked={config.includeCourseOverview}
                    onChange={(e) => setConfig({ ...config, includeCourseOverview: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">2. Course Learning Outcomes (CLOs) Table</span>
                  <input
                    type="checkbox"
                    checked={config.includeCLOs}
                    onChange={(e) => setConfig({ ...config, includeCLOs: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">3. PLO Mapping Matrix</span>
                  <input
                    type="checkbox"
                    checked={config.includePLOMatrix}
                    onChange={(e) => setConfig({ ...config, includePLOMatrix: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">4. Textbooks & Required Materials</span>
                  <input
                    type="checkbox"
                    checked={config.includeTextbooks}
                    onChange={(e) => setConfig({ ...config, includeTextbooks: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">5. Modular Course Schedule</span>
                  <input
                    type="checkbox"
                    checked={config.includeWeeklySchedule}
                    onChange={(e) => setConfig({ ...config, includeWeeklySchedule: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">6. Assessment Scheme & Weightage</span>
                  <input
                    type="checkbox"
                    checked={config.includeAssessments}
                    onChange={(e) => setConfig({ ...config, includeAssessments: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">7. Institutional Grading Scale</span>
                  <input
                    type="checkbox"
                    checked={config.includeGradingScale}
                    onChange={(e) => setConfig({ ...config, includeGradingScale: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">8. Academic Regulations & Policies</span>
                  <input
                    type="checkbox"
                    checked={config.includePolicies}
                    onChange={(e) => setConfig({ ...config, includePolicies: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
                <label className="flex items-center justify-between pt-2 cursor-pointer">
                  <span className="font-semibold text-slate-800">9. OBE360 & CQI Compliance Statement</span>
                  <input
                    type="checkbox"
                    checked={config.includeCQIStatement}
                    onChange={(e) => setConfig({ ...config, includeCQIStatement: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition"
                >
                  Apply & View Updated Syllabus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
