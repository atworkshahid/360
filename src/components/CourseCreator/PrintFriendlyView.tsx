import React, { useState, useEffect } from 'react';
import {
  Printer,
  ArrowLeft,
  Type,
  Check,
  FileText,
  BookOpen,
  Target,
  Layers,
  Award,
  Calendar,
  CheckCircle2,
  Filter,
  Eye,
  Download,
} from 'lucide-react';
import { Course, CLO, PLO, Module, Assessment, Rubric } from '../../types';

interface PrintFriendlyViewProps {
  course: Course;
  onClose: () => void;
}

export const PrintFriendlyView: React.FC<PrintFriendlyViewProps> = ({ course, onClose }) => {
  // Reading mode configuration
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('serif');
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'large'>('standard');
  const [insertPageBreaks, setInsertPageBreaks] = useState<boolean>(true);

  // Section visibility toggles
  const [sections, setSections] = useState({
    overview: true,
    clos: true,
    ploMapping: true,
    modules: true,
    assessments: true,
    rubrics: true,
    evidenceRules: true,
    cqiPlan: true,
    signoff: true,
  });

  const [showSectionFilter, setShowSectionFilter] = useState<boolean>(false);

  // Listen to Escape key to exit cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllSections = () => {
    setSections({
      overview: true,
      clos: true,
      ploMapping: true,
      modules: true,
      assessments: true,
      rubrics: true,
      evidenceRules: true,
      cqiPlan: true,
      signoff: true,
    });
  };

  const totalAssessmentWeight = (course.assessments || []).reduce(
    (acc, a) => acc + (Number(a.weightage) || 0),
    0
  );

  const totalMarks = (course.assessments || []).reduce(
    (acc, a) => acc + (Number(a.marks) || 0),
    0
  );

  const fontSizeClasses = {
    compact: 'text-xs leading-relaxed',
    standard: 'text-sm leading-relaxed',
    large: 'text-base leading-relaxed',
  }[fontSize];

  return (
    <div
      id="print-friendly-view-root"
      className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto print:static print:bg-white print:p-0 print:m-0 print:overflow-visible text-slate-900"
    >
      {/* Print-specific CSS stylesheet for paper formatting */}
      <style>{`
        @media print {
          @page {
            margin: 15mm 15mm 15mm 15mm;
            size: A4 portrait;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-friendly-view-root {
            position: static !important;
            background: #ffffff !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-page-break {
            break-before: page !important;
            page-break-before: always !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 8px !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700 !important;
          }
          h1, h2, h3, h4 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          /* Remove interactive borders and dropshadows */
          .paper-document {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Screen-Only Control Toolbar (Hidden when printing) */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center space-x-3">
            <button
              id="print-view-exit-btn"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Return to the full Course Editor (Press Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Editor</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-900">Print-Friendly & Simplified Reading View</span>
              <span className="text-[11px] text-slate-500 ml-2 font-mono">
                {course.code || 'OBE-CRS'}
              </span>
            </div>
          </div>

          {/* Reading & Print Customization Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Font Family Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
                  fontFamily === 'serif'
                    ? 'bg-white font-serif font-bold text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-serif'
                }`}
                title="Academic Serif typography (ideal for formal printing)"
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
                  fontFamily === 'sans'
                    ? 'bg-white font-sans font-bold text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-sans'
                }`}
                title="Clean Sans-serif typography (ideal for on-screen reading)"
              >
                Sans
              </button>
            </div>

            {/* Font Size Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs hidden md:flex">
              <button
                onClick={() => setFontSize('compact')}
                className={`px-2 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
                  fontSize === 'compact'
                    ? 'bg-white font-bold text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Compact text (saves paper pages)"
              >
                Compact
              </button>
              <button
                onClick={() => setFontSize('standard')}
                className={`px-2 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
                  fontSize === 'standard'
                    ? 'bg-white font-bold text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Standard 14px size"
              >
                Standard
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
                  fontSize === 'large'
                    ? 'bg-white font-bold text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Comfortable 16px reading size"
              >
                Large
              </button>
            </div>

            {/* Section Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSectionFilter(!showSectionFilter)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition cursor-pointer"
                title="Toggle sections included in the document"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">Sections</span>
              </button>

              {showSectionFilter && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Included Sections</span>
                    <button
                      onClick={selectAllSections}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {[
                      { key: 'overview', label: 'Course Overview & Specs' },
                      { key: 'clos', label: 'Course Learning Outcomes (CLOs)' },
                      { key: 'ploMapping', label: 'PLO Alignment Matrix' },
                      { key: 'modules', label: 'Modular Syllabus & Outlines' },
                      { key: 'assessments', label: 'Assessment & Evidence Strategy' },
                      { key: 'rubrics', label: 'Evaluation Rubrics' },
                      { key: 'evidenceRules', label: 'Direct Evidence Rules' },
                      { key: 'cqiPlan', label: 'CQI Improvement Plan' },
                      { key: 'signoff', label: 'Academic Sign-Off & Approvals' },
                    ].map((sec) => (
                      <label
                        key={sec.key}
                        className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={sections[sec.key as keyof typeof sections]}
                          onChange={() => toggleSection(sec.key as keyof typeof sections)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="text-slate-700 text-[11px]">{sec.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={insertPageBreaks}
                        onChange={(e) => setInsertPageBreaks(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Page breaks between sections</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Print Button */}
            <button
              id="print-friendly-trigger-btn"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              title="Print document or save as PDF via system dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
          </div>
        </div>
      </header>

      {/* Screen Helper Banner (Hidden in Print) */}
      <div className="no-print max-w-4xl mx-auto mt-4 px-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px]">
              READING MODE
            </span>
            <span>
              All navigation bars, editing panels, and UI chrome have been stripped away for distraction-free reading and crisp physical printing.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
            A4 / Letter Ready
          </span>
        </div>
      </div>

      {/* Main Print Document Body */}
      <main className="max-w-4xl mx-auto my-6 px-4 sm:px-8 pb-16 print:p-0 print:m-0 print:max-w-none">
        <div
          className={`paper-document bg-white border border-slate-200 rounded-2xl shadow-md p-8 sm:p-14 print:border-none print:shadow-none print:p-0 ${
            fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          } ${fontSizeClasses}`}
        >
          {/* Institutional Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-8 print-avoid-break">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase font-sans mb-1">
                  MENTISERA INSTITUTE OF LEARNING AND DEVELOPMENT
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {course.title || 'Untitled Course Specification'}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-1 font-sans">
                  Outcome-Based Education (OBE) Course Syllabus & Accreditation Dossier
                </p>
              </div>

              <div className="text-right shrink-0 pl-4 font-sans">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-900 font-mono font-bold text-xs border border-slate-300">
                  {course.code || 'COURSE CODE'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Version {course.version || '1.0'} • {course.status ? course.status.toUpperCase() : 'FINAL'}
                </p>
              </div>
            </div>

            {/* Quick Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-200 font-sans text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Programme / Discipline
                </span>
                <span className="font-semibold text-slate-900">{course.programme || course.category || 'General'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Academic Level
                </span>
                <span className="font-semibold text-slate-900">{course.courseLevel || 'Undergraduate'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Credit Hours / Units
                </span>
                <span className="font-semibold text-slate-900">
                  {course.creditHours} Credits ({course.durationWeeks} Weeks)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery Mode & Benchmark
                </span>
                <span className="font-semibold text-slate-900">
                  {course.deliveryMode || 'In-Person'} • Pass ≥ {course.passingBenchmark || 60}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Course Overview & Blueprint */}
          {sections.overview && (
            <section className="mb-8 print-avoid-break">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
                <span>1. Course Description & Learning Rationale</span>
                <span className="text-xs font-normal text-slate-400 font-sans">Catalog Specification</span>
              </h2>
              <div className="space-y-3 text-slate-700">
                <p className="leading-relaxed">
                  {course.description || course.overview || 'No descriptive overview recorded.'}
                </p>

                {course.learningPromise && (
                  <div className="p-3 bg-slate-50 border-l-4 border-indigo-600 rounded-r text-xs text-slate-800">
                    <span className="font-bold text-indigo-900 block uppercase tracking-wider text-[10px] font-sans mb-0.5">
                      Definitive Learning Promise (Transformation Guarantee)
                    </span>
                    <p className="italic">{course.learningPromise}</p>
                  </div>
                )}

                {course.capstoneGoal && (
                  <div className="text-xs text-slate-600 font-sans">
                    <strong>Target Graduate Capability / Capstone Goal: </strong>
                    <span>{course.capstoneGoal}</span>
                  </div>
                )}

                {course.blueprint && (course.blueprint.prerequisites || course.blueprint.targetCompetencies?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-sans text-slate-600">
                    {course.blueprint.prerequisites && (
                      <div>
                        <strong className="block text-slate-800">Prerequisites & Co-requisites:</strong>
                        <span>{course.blueprint.prerequisites}</span>
                      </div>
                    )}
                    {course.blueprint.targetCompetencies?.length > 0 && (
                      <div>
                        <strong className="block text-slate-800">Core Target Competencies:</strong>
                        <span>{course.blueprint.targetCompetencies.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Section 2: Course Learning Outcomes (CLOs) */}
          {sections.clos && (
            <section className={`mb-8 ${insertPageBreaks ? 'print-page-break' : 'print-avoid-break'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  2. Course Learning Outcomes (CLOs) & Cognitive Demand
                </h2>
                <span className="text-xs text-slate-500 font-sans">
                  {course.clos?.length || 0} Measurable Outcomes
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-sans">
                Upon successful completion of this course, learners demonstrate verifiable competence across the following outcomes, aligned with Bloom's Revised Taxonomy:
              </p>

              <table className="w-full border-collapse border border-slate-300 text-left font-sans print-table">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 text-xs">
                    <th className="border border-slate-300 p-2 w-16 text-center font-bold">Code</th>
                    <th className="border border-slate-300 p-2 font-bold">Observable Outcome Statement</th>
                    <th className="border border-slate-300 p-2 w-32 font-bold">Bloom's Level & Verb</th>
                    <th className="border border-slate-300 p-2 w-20 text-center font-bold">Weight</th>
                    <th className="border border-slate-300 p-2 w-24 text-center font-bold">Threshold</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-200">
                  {(course.clos || []).map((clo, idx) => (
                    <tr key={clo.id || idx} className="hover:bg-slate-50/50">
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold text-indigo-900 align-top">
                        {clo.code}
                      </td>
                      <td className="border border-slate-300 p-2 align-top">
                        <span className="font-serif text-slate-900 font-medium">{clo.statement}</span>
                        {clo.description && (
                          <p className="text-[11px] text-slate-500 mt-1 font-sans italic">{clo.description}</p>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2 align-top">
                        <span className="font-semibold text-slate-800">{clo.bloomLevel}</span>
                        {clo.bloomVerb && (
                          <span className="text-[10px] text-slate-500 block font-mono">({clo.bloomVerb})</span>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-slate-800 align-top">
                        {clo.weightage}%
                      </td>
                      <td className="border border-slate-300 p-2 text-center text-slate-600 align-top">
                        ≥ {clo.achievementThreshold || 60}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Section 3: PLO Alignment Matrix */}
          {sections.ploMapping && (course.plos || []).length > 0 && (
            <section className="mb-8 print-avoid-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  3. Program Learning Outcomes (PLOs) & Alignment Matrix
                </h2>
                <span className="text-xs text-slate-500 font-sans">Graduate Attributes (GA)</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-sans">
                Mapping scale: <strong>3 = Substantial (High)</strong>, <strong>2 = Moderate (Medium)</strong>, <strong>1 = Introductory (Slight)</strong>.
              </p>

              {/* Matrix Table */}
              <table className="w-full border-collapse border border-slate-300 text-center font-sans print-table mb-4">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 text-xs">
                    <th className="border border-slate-300 p-2 text-left font-bold w-24">CLO / PLO</th>
                    {(course.plos || []).map((plo) => (
                      <th key={plo.id} className="border border-slate-300 p-2 font-bold text-center" title={plo.statement}>
                        <div>{plo.code}</div>
                        <div className="text-[9px] font-normal text-slate-500">{plo.category || 'GA'}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-800 divide-y divide-slate-200">
                  {(course.clos || []).map((clo) => (
                    <tr key={clo.id}>
                      <td className="border border-slate-300 p-2 text-left font-bold font-mono text-indigo-900">
                        {clo.code}
                      </td>
                      {(course.plos || []).map((plo) => {
                        const mapping = (clo.mappedPLOs || []).find((m) => m.ploId === plo.id);
                        const level = mapping?.level || (course.ploMatrix?.[clo.id]?.[plo.id]);
                        return (
                          <td key={plo.id} className="border border-slate-300 p-2 font-mono">
                            {level ? (
                              <span
                                className={`font-bold inline-block px-1.5 py-0.5 rounded text-xs ${
                                  Number(level) === 3
                                    ? 'bg-slate-800 text-white'
                                    : Number(level) === 2
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'text-slate-600'
                                }`}
                              >
                                {level}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PLO Reference Statements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                {(course.plos || []).map((plo) => (
                  <div key={plo.id} className="leading-snug">
                    <strong className="text-slate-900 font-mono">{plo.code}: </strong>
                    <span>{plo.statement}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 4: Modular Syllabus & Weekly Schedule */}
          {sections.modules && (course.modules || []).length > 0 && (
            <section className={`mb-8 ${insertPageBreaks ? 'print-page-break' : 'print-avoid-break'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  4. Modular Syllabus & Topic Schedule
                </h2>
                <span className="text-xs text-slate-500 font-sans">
                  {course.modules.length} Instructional Modules
                </span>
              </div>

              <div className="space-y-6">
                {(course.modules || []).map((mod, idx) => {
                  const moduleCLOs = (course.clos || []).filter((c) => (mod.relatedCLOIds || []).includes(c.id));
                  const moduleMLOs = (course.mlos || []).filter((m) => m.moduleId === mod.id);
                  const moduleLessons = (course.lessons || []).filter((l) => l.moduleId === mod.id);
                  const moduleActivities = (course.activities || []).filter((a) => a.moduleId === mod.id);

                  return (
                    <div
                      key={mod.id || idx}
                      className="border border-slate-200 rounded-lg p-4 bg-white print-avoid-break"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                        <div>
                          <span className="font-mono text-xs font-bold text-indigo-900 mr-2">
                            Module {mod.number || idx + 1}:
                          </span>
                          <span className="font-bold text-slate-900 text-sm font-sans">{mod.title}</span>
                        </div>
                        <div className="text-xs font-sans text-slate-500">
                          <span>{mod.durationWeeks} Weeks</span>
                          {mod.expectedStudyHours && <span> • {mod.expectedStudyHours} Study Hours</span>}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 mb-3 leading-relaxed">{mod.description}</p>

                      {/* Associated CLOs */}
                      {moduleCLOs.length > 0 && (
                        <div className="mb-2 text-xs font-sans">
                          <span className="font-bold text-slate-700">Target CLOs: </span>
                          <span className="text-indigo-900 font-mono font-semibold">
                            {moduleCLOs.map((c) => c.code).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Module Learning Outcomes (MLOs) */}
                      {moduleMLOs.length > 0 && (
                        <div className="mb-2 text-xs font-sans">
                          <span className="font-bold text-slate-700 block mb-0.5">Enabling Learning Outcomes (MLOs):</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                            {moduleMLOs.map((mlo) => (
                              <li key={mlo.id}>
                                <span className="font-mono font-medium">{mlo.code}:</span> {mlo.statement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Lessons / Lecture Topics */}
                      {moduleLessons.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-sans">
                          <span className="font-bold text-slate-700 block mb-0.5">Lecture Topics & Units:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600">
                            {moduleLessons.map((les) => (
                              <div key={les.id} className="flex items-start space-x-1.5">
                                <span className="text-slate-400">•</span>
                                <div>
                                  <span className="font-medium text-slate-800">{les.title}</span>
                                  {les.durationMinutes && (
                                    <span className="text-[10px] text-slate-400 ml-1">({les.durationMinutes} min)</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activities & Lab Work */}
                      {moduleActivities.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-sans">
                          <span className="font-bold text-slate-700 block mb-0.5">Hands-on Tasks & Experiential Activities:</span>
                          <div className="flex flex-wrap gap-2 text-slate-600">
                            {moduleActivities.map((act) => (
                              <span key={act.id} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                                {act.title} ({act.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 5: Assessment Strategy & Direct Evidence Plan */}
          {sections.assessments && (course.assessments || []).length > 0 && (
            <section className={`mb-8 ${insertPageBreaks ? 'print-page-break' : 'print-avoid-break'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  5. Comprehensive Assessment Blueprint & Grading Plan
                </h2>
                <span className="text-xs text-slate-500 font-sans">
                  Total Course Weight: {totalAssessmentWeight}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-sans">
                Authentic outcome measurement plan combining formative milestones and summative evaluations:
              </p>

              <table className="w-full border-collapse border border-slate-300 text-left font-sans print-table">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 text-xs">
                    <th className="border border-slate-300 p-2 font-bold">Assessment Instrument</th>
                    <th className="border border-slate-300 p-2 w-24 font-bold">Category</th>
                    <th className="border border-slate-300 p-2 w-16 text-center font-bold">Marks</th>
                    <th className="border border-slate-300 p-2 w-16 text-center font-bold">Weight</th>
                    <th className="border border-slate-300 p-2 w-28 font-bold">Bloom's Level</th>
                    <th className="border border-slate-300 p-2 w-24 font-bold">Mapped CLOs</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-200">
                  {(course.assessments || []).map((asmt, idx) => {
                    const linkedCLOCodes = (course.clos || [])
                      .filter((c) => (asmt.linkedCLOIds || []).includes(c.id))
                      .map((c) => c.code);

                    return (
                      <tr key={asmt.id || idx} className="hover:bg-slate-50/50">
                        <td className="border border-slate-300 p-2 align-top">
                          <strong className="text-slate-900 block">{asmt.name}</strong>
                          {asmt.description && (
                            <p className="text-[11px] text-slate-500 font-normal">{asmt.description}</p>
                          )}
                        </td>
                        <td className="border border-slate-300 p-2 align-top font-medium">
                          {asmt.type}
                        </td>
                        <td className="border border-slate-300 p-2 text-center align-top font-mono">
                          {asmt.marks}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-slate-900 align-top">
                          {asmt.weightage}%
                        </td>
                        <td className="border border-slate-300 p-2 align-top">
                          {asmt.bloomLevel || 'N/A'}
                        </td>
                        <td className="border border-slate-300 p-2 align-top font-mono text-indigo-900 font-semibold">
                          {linkedCLOCodes.length > 0 ? linkedCLOCodes.join(', ') : 'All Outcomes'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-xs text-slate-900">
                    <td className="border border-slate-300 p-2">Total Programmatic Evaluation</td>
                    <td className="border border-slate-300 p-2">Formative & Summative</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{totalMarks}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{totalAssessmentWeight}%</td>
                    <td className="border border-slate-300 p-2" colSpan={2}>Passing Threshold: ≥ {course.passingBenchmark || 60}%</td>
                  </tr>
                </tfoot>
              </table>
            </section>
          )}

          {/* Section 6: Evaluation Rubrics */}
          {sections.rubrics && (course.rubrics || []).length > 0 && (
            <section className={`mb-8 ${insertPageBreaks ? 'print-page-break' : 'print-avoid-break'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  6. Criterion-Referenced Evaluation Rubrics
                </h2>
                <span className="text-xs text-slate-500 font-sans">
                  {course.rubrics.length} Defined Matrix Rubrics
                </span>
              </div>

              <div className="space-y-6">
                {(course.rubrics || []).map((rubric) => {
                  const targetCLO = (course.clos || []).find((c) => c.id === rubric.targetCLOId);

                  return (
                    <div key={rubric.id} className="border border-slate-200 rounded-lg p-4 bg-white print-avoid-break">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                        <h3 className="font-bold text-sm text-slate-900 font-sans">{rubric.title}</h3>
                        {targetCLO && (
                          <span className="text-xs font-mono font-bold text-indigo-900 bg-slate-100 px-2 py-0.5 rounded">
                            Target: {targetCLO.code} ({targetCLO.bloomLevel})
                          </span>
                        )}
                      </div>

                      {rubric.description && (
                        <p className="text-xs text-slate-600 mb-3 italic">{rubric.description}</p>
                      )}

                      <table className="w-full border-collapse border border-slate-300 text-left font-sans text-xs print-table">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900">
                            <th className="border border-slate-300 p-2 font-bold w-1/4">Criteria</th>
                            <th className="border border-slate-300 p-2 font-bold text-emerald-900">Exemplary (90-100%)</th>
                            <th className="border border-slate-300 p-2 font-bold text-blue-900">Proficient (75-89%)</th>
                            <th className="border border-slate-300 p-2 font-bold text-amber-900">Developing (60-74%)</th>
                            <th className="border border-slate-300 p-2 font-bold text-rose-900">Novice (&lt;60%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(rubric.criteria || []).map((crit) => {
                            const exemplary = crit.levels?.find((l) => l.name.toLowerCase().includes('exemplary') || l.scoreRange === '4');
                            const proficient = crit.levels?.find((l) => l.name.toLowerCase().includes('proficient') || l.scoreRange === '3');
                            const developing = crit.levels?.find((l) => l.name.toLowerCase().includes('developing') || l.scoreRange === '2');
                            const novice = crit.levels?.find((l) => l.name.toLowerCase().includes('novice') || l.name.toLowerCase().includes('unsatisfactory') || l.scoreRange === '1');

                            return (
                              <tr key={crit.id} className="align-top">
                                <td className="border border-slate-300 p-2">
                                  <strong className="text-slate-900 block">{crit.name}</strong>
                                  <span className="text-[10px] text-slate-500 font-mono">Weight: {crit.weight || 25}%</span>
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                                  {exemplary?.description || crit.levels?.[0]?.description || 'Exceeds standard with sophisticated execution.'}
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                                  {proficient?.description || crit.levels?.[1]?.description || 'Meets standard reliably with minor lapses.'}
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                                  {developing?.description || crit.levels?.[2]?.description || 'Partially demonstrates criteria with guidance needed.'}
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                                  {novice?.description || crit.levels?.[3]?.description || 'Fails to exhibit requisite baseline competence.'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 7: Direct Evidence & Attainment Verification Rules */}
          {sections.evidenceRules && (course.evidenceRules || []).length > 0 && (
            <section className="mb-8 print-avoid-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  7. Direct Evidence & Outcome Attainment Verification
                </h2>
                <span className="text-xs text-slate-500 font-sans">Quality Assurance Rules</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                {(course.evidenceRules || []).map((rule) => {
                  const targetCLO = (course.clos || []).find((c) => c.id === rule.cloId);

                  return (
                    <div key={rule.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>{targetCLO?.code || 'Outcome Evidence'}</span>
                        <span className="text-indigo-700 font-mono">Benchmark: {rule.threshold || 60}%</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mb-1">
                        <strong>Evidence Instrument: </strong>
                        {rule.method || 'Direct Rubric Evaluation'}
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        Target: Minimum {rule.minStudentsPassingRate || 70}% of cohort learners achieve threshold score.
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 8: Continuous Quality Improvement (CQI) Action Plan */}
          {sections.cqiPlan && (course.cqiPlan || course.academicReview) && (
            <section className="mb-8 print-avoid-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  8. Continuous Quality Improvement (CQI) Action Plan
                </h2>
                <span className="text-xs text-slate-500 font-sans">Pedagogical Loop Closing</span>
              </div>

              {course.cqiPlan ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs font-sans">
                  <div>
                    <strong className="text-slate-900 block">Identified Deficiency / Historical Attainment Gap:</strong>
                    <p className="text-slate-700 mt-0.5">{course.cqiPlan.identifiedDeficiencies || 'Prior cohort achieved baseline, with comparative synthesis requiring scaffolding.'}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <strong className="text-slate-900 block">Planned Remediation / Pedagogical Intervention:</strong>
                    <p className="text-slate-700 mt-0.5">{course.cqiPlan.plannedInterventions || 'Structured formative diagnostic quizzes and scaffolded problem sets.'}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-600 text-[11px]">
                    <span>Cohort Term: {course.cqiPlan.cohortTerm || 'Active Academic Year'}</span>
                    <span className="font-bold text-indigo-900">Target Metric: {course.cqiPlan.targetMetric || '≥ 70% threshold'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No historical CQI loop logged for this course version.</p>
              )}
            </section>
          )}

          {/* Section 9: Academic Review & Institutional Endorsement Sign-Off */}
          {sections.signoff && (
            <section className="mt-10 pt-6 border-t-2 border-slate-900 print-avoid-break font-sans">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    9. Institutional Review & Curriculum Endorsement
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official accreditation review and curriculum committee verification signatures.
                  </p>
                </div>
                {course.academicReview?.status && (
                  <span className="px-3 py-1 rounded bg-slate-100 font-bold text-xs text-slate-900 border border-slate-300">
                    STATUS: {course.academicReview.status.toUpperCase()}
                  </span>
                )}
              </div>

              {course.academicReview?.feedback && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 mb-8 italic">
                  <strong>Curriculum Committee Review Feedback: </strong>
                  "{course.academicReview.feedback}"
                </div>
              )}

              {/* Physical Signature Lines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 text-xs text-slate-800">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-2 h-10 flex items-end">
                    <span className="font-serif italic text-slate-700 font-bold">
                      {course.academicReview?.reviewerName || 'Course Coordinator'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">Lead Course Instructor</p>
                  <p className="text-[10px] text-slate-500">Date: {course.academicReview?.reviewDate ? new Date(course.academicReview.reviewDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 mb-2 h-10 flex items-end">
                    <span className="font-serif italic text-slate-700">
                      Curriculum Committee Sign-off
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">Department Chair / Head</p>
                  <p className="text-[10px] text-slate-500">Date: ________________________</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 mb-2 h-10 flex items-end">
                    <span className="font-serif italic text-slate-700">
                      Accreditation Quality Board
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">Dean of Academic Affairs</p>
                  <p className="text-[10px] text-slate-500">Institutional Seal / Stamp</p>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                <span>MENTISERA OBE360™ Unified Accreditation Management System</span>
                <span>Generated: {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</span>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
