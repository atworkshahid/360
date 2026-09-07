import React, { useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  Table as TableIcon,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Package,
  Sliders,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Course } from '../types';
import {
  LMSExportSchemaOptions,
  generateMoodleCompetencyCSV,
  generateMoodleCourseUploadCSV,
  generateMoodleCourseJSON,
  generateMoodleQuestionsGIFT,
  generateBlackboardGoalsCSV,
  generateBlackboardCourseBatchCSV,
  generateBlackboardUltraCourseJSON,
  generateBlackboardRubricsCSV,
  generateLMSExportBundleZip,
  downloadFile,
  parseCsvToRows,
} from '../services/lmsSchemaExportService';

interface LMSFormatExportModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: 'moodle' | 'blackboard';
}

type MoodleSchemaKey = 'competency_csv' | 'course_csv' | 'blueprint_json' | 'questions_gift';
type BlackboardSchemaKey = 'goals_csv' | 'batch_csv' | 'ultra_json' | 'rubrics_csv';

export const LMSFormatExportModal: React.FC<LMSFormatExportModalProps> = ({
  course,
  isOpen,
  onClose,
  initialPlatform = 'moodle',
}) => {
  const [platform, setPlatform] = useState<'moodle' | 'blackboard'>(initialPlatform);
  const [moodleSchema, setMoodleSchema] = useState<MoodleSchemaKey>('competency_csv');
  const [blackboardSchema, setBlackboardSchema] = useState<BlackboardSchemaKey>('goals_csv');

  // Preview & Options state
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Customization Options
  const [options, setOptions] = useState<LMSExportSchemaOptions>({
    includeCLOs: true,
    includeMLOs: true,
    includeAssessments: true,
    includeRubrics: true,
    includeModules: true,
    prefix: course.code || 'COURSE',
  });

  // Calculate generated export content dynamically
  const exportPayload = useMemo(() => {
    const code = course.code || 'COURSE';
    if (platform === 'moodle') {
      switch (moodleSchema) {
        case 'competency_csv':
          return {
            filename: `${code}_moodle_competency_framework.csv`,
            mimeType: 'text/csv;charset=utf-8',
            format: 'csv',
            title: 'Moodle Competency Framework (CSV)',
            badge: 'Site Administration > Competencies',
            description:
              'Directly importable into Moodle Competencies. Maps all Course Learning Outcomes, Bloom Cognitive Levels, and Program Outcome (PLO) crosswalks.',
            guide: [
              '1. Log in to your Moodle instance as an Administrator.',
              '2. Navigate to: Site Administration > Competencies > Import competency framework.',
              '3. Upload this CSV file (Encoding: UTF-8, Delimiter: Comma).',
              '4. Confirm the preview columns and click "Import framework".',
              '5. Assign the imported competency framework to your course under Course Administration > Competencies.',
            ],
            content: generateMoodleCompetencyCSV(course, options),
          };
        case 'course_csv':
          return {
            filename: `${code}_moodle_course_upload.csv`,
            mimeType: 'text/csv;charset=utf-8',
            format: 'csv',
            title: 'Moodle Bulk Course Upload (CSV)',
            badge: 'Site Administration > Courses > Upload',
            description:
              'Standard Moodle batch CSV for automated course instantiation with topics format, credits, metadata, and default section counts.',
            guide: [
              '1. Navigate to: Site Administration > Courses > Upload courses.',
              '2. Drag and drop this CSV file into the file upload area.',
              '3. Under Upload settings, verify "Create new courses, or update existing ones".',
              '4. Click "Preview" to inspect course fields, then click "Upload courses" to execute.',
            ],
            content: generateMoodleCourseUploadCSV(course, options),
          };
        case 'blueprint_json':
          return {
            filename: `${code}_moodle_course_blueprint.json`,
            mimeType: 'application/json;charset=utf-8',
            format: 'json',
            title: 'Moodle Web Services Course Blueprint (JSON)',
            badge: 'REST API & Web Services',
            description:
              'Full JSON specification compatible with Moodle Core Web Services API (core_course_create_courses, mod_assign, mod_quiz, and gradebook setup).',
            guide: [
              '1. Use your Moodle Web Service token with REST endpoint: /webservice/rest/server.php?wsfunction=core_course_create_courses',
              '2. Send the JSON payload to programmatically scaffold modules, pages, lessons, and assignments in seconds.',
              '3. Can also be used with Python or CI/CD pipelines to automatically sync course revisions.',
            ],
            content: generateMoodleCourseJSON(course, options),
          };
        case 'questions_gift':
          return {
            filename: `${code}_moodle_questions.gift`,
            mimeType: 'text/plain;charset=utf-8',
            format: 'gift',
            title: 'Moodle Question Bank GIFT Schema (.gift)',
            badge: 'Course Administration > Question Bank',
            description:
              'Standard Moodle GIFT question format pre-tagged with CLO competency identifiers and Bloom taxonomy achievement rubrics.',
            guide: [
              '1. In your Moodle course, click the gear icon (or "More") and choose "Question bank > Import".',
              '2. Select "GIFT format" as File format.',
              '3. Upload this file and click "Import".',
              '4. The assessment items will appear populated in your course question categories.',
            ],
            content: generateMoodleQuestionsGIFT(course),
          };
      }
    } else {
      // Blackboard
      switch (blackboardSchema) {
        case 'goals_csv':
          return {
            filename: `${code}_blackboard_goals_outcomes.csv`,
            mimeType: 'text/csv;charset=utf-8',
            format: 'csv',
            title: 'Blackboard Goals / Outcomes Assessment (CSV)',
            badge: 'Goals & Outcomes Assessment',
            description:
              'Conforms to Blackboard Learn and Ultra Goals Manager schema. Directly creates outcome categories, Bloom levels, and accreditation standard alignments.',
            guide: [
              '1. In Blackboard Learn / Ultra, navigate to System Admin > Goals / Outcomes Assessment > Goal Sets.',
              '2. Click "Import Goals" or "Batch Feed".',
              '3. Select this CSV file and specify comma delimiter.',
              '4. Review the outcome hierarchy and click "Submit". All CLOs will be immediately available for assignment alignment.',
            ],
            content: generateBlackboardGoalsCSV(course, options),
          };
        case 'batch_csv':
          return {
            filename: `${code}_blackboard_course_batch.csv`,
            mimeType: 'text/csv;charset=utf-8',
            format: 'csv',
            title: 'Blackboard SIS Batch Course Creation (CSV)',
            badge: 'System Admin > Courses > Batch Create',
            description:
              'Standard Blackboard Flat File / Snapshot format for bulk course shell creation with external keys and course identifiers.',
            guide: [
              '1. Go to Blackboard System Admin > Courses.',
              '2. Click "Batch Create / Update".',
              '3. Upload this CSV file using standard flat-file snapshot format.',
              '4. Click "Submit" to instantiate the course container.',
            ],
            content: generateBlackboardCourseBatchCSV(course, options),
          };
        case 'ultra_json':
          return {
            filename: `${code}_blackboard_ultra_course.json`,
            mimeType: 'application/json;charset=utf-8',
            format: 'json',
            title: 'Blackboard Ultra REST API Blueprint (JSON)',
            badge: 'Blackboard Learn SaaS / Ultra API',
            description:
              'Conforms to Blackboard Learn Public REST API v3 (/learn/api/public/v3/courses) with structured learning modules, assessments, and rubrics.',
            guide: [
              '1. Ingest via Blackboard Learn SaaS REST API: POST /learn/api/public/v3/courses',
              '2. Authorize using your OAuth 2.0 Bearer token.',
              '3. Creates the course shell, Ultra Learning Modules, outcome alignments, and Grade Center column formulas.',
            ],
            content: generateBlackboardUltraCourseJSON(course, options),
          };
        case 'rubrics_csv':
          return {
            filename: `${code}_blackboard_rubrics.csv`,
            mimeType: 'text/csv;charset=utf-8',
            format: 'csv',
            title: 'Blackboard Rubrics Matrix (CSV)',
            badge: 'Course Tools > Rubrics > Import',
            description:
              'Complete rubric criteria with weighted performance levels (Exemplary, Proficient, Developing, Unsatisfactory) for the Blackboard Grade Center.',
            guide: [
              '1. Inside your Blackboard Course, navigate to Course Tools > Rubrics.',
              '2. Click "Import Rubric".',
              '3. Upload this CSV file and click "Submit".',
              '4. Attach the imported rubric to any assignment or discussion board.',
            ],
            content: generateBlackboardRubricsCSV(course),
          };
      }
    }
  }, [platform, moodleSchema, blackboardSchema, course, options]);

  // Parsed rows for CSV table view
  const tableRows = useMemo(() => {
    if (exportPayload.format !== 'csv') return [];
    return parseCsvToRows(exportPayload.content);
  }, [exportPayload.content, exportPayload.format]);

  // Action handlers
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(exportPayload.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadCurrentFile = () => {
    downloadFile(exportPayload.content, exportPayload.filename, exportPayload.mimeType);
  };

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await generateLMSExportBundleZip(course, options);
      const code = course.code || 'COURSE';
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${code}_LMS_Standard_Schemas_Bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate bundle zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  LMS Schema Export Engine
                </h2>
                <p className="text-xs text-slate-300">
                  Standard CSV &amp; JSON schemas formatted for seamless one-click imports into Moodle &amp; Blackboard
                </p>
              </div>
            </div>
          </div>

          {/* Platform Toggle Tabs */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setPlatform('moodle');
                  if (moodleSchema === 'blueprint_json') setViewMode('raw');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  platform === 'moodle'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Moodle</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/20">
                  v3.9 - 4.4+
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlatform('blackboard');
                  if (blackboardSchema === 'ultra_json') setViewMode('raw');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  platform === 'blackboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Blackboard</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                  Learn &amp; Ultra
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer text-sm"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Schema Format Subnav Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {platform === 'moodle' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMoodleSchema('competency_csv');
                    setViewMode('table');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    moodleSchema === 'competency_csv'
                      ? 'bg-white border border-amber-300 text-amber-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>Competencies Framework (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoodleSchema('course_csv');
                    setViewMode('table');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    moodleSchema === 'course_csv'
                      ? 'bg-white border border-amber-300 text-amber-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>Course Upload (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoodleSchema('blueprint_json');
                    setViewMode('raw');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    moodleSchema === 'blueprint_json'
                      ? 'bg-white border border-amber-300 text-amber-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>Course Blueprint (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoodleSchema('questions_gift');
                    setViewMode('raw');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    moodleSchema === 'questions_gift'
                      ? 'bg-white border border-amber-300 text-amber-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>Questions Bank (GIFT)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setBlackboardSchema('goals_csv');
                    setViewMode('table');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    blackboardSchema === 'goals_csv'
                      ? 'bg-white border border-blue-300 text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Goals / Outcomes (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBlackboardSchema('batch_csv');
                    setViewMode('table');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    blackboardSchema === 'batch_csv'
                      ? 'bg-white border border-blue-300 text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Course Batch Feed (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBlackboardSchema('ultra_json');
                    setViewMode('raw');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    blackboardSchema === 'ultra_json'
                      ? 'bg-white border border-blue-300 text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ultra Course Package (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBlackboardSchema('rubrics_csv');
                    setViewMode('table');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    blackboardSchema === 'rubrics_csv'
                      ? 'bg-white border border-blue-300 text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rubrics Matrix (CSV)</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle (for CSV formats) */}
            {exportPayload.format === 'csv' && (
              <div className="bg-slate-200/70 p-0.5 rounded-lg flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3 h-3" />
                  <span>Table View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer ${
                    viewMode === 'raw'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  <span>Raw Text</span>
                </button>
              </div>
            )}

            {/* Options Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center space-x-1 transition cursor-pointer ${
                showOptions
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Options</span>
            </button>
          </div>
        </div>

        {/* Optional Customization Bar */}
        {showOptions && (
          <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100 flex flex-wrap items-center gap-4 text-xs animate-in slide-in-from-top-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-700">Include:</span>
            </div>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeCLOs}
                onChange={(e) => setOptions({ ...options, includeCLOs: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Course Learning Outcomes (CLOs)</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeMLOs}
                onChange={(e) => setOptions({ ...options, includeMLOs: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Module Outcomes (MLOs)</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeAssessments}
                onChange={(e) => setOptions({ ...options, includeAssessments: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Assessments &amp; Weights</span>
            </label>

            <div className="flex items-center space-x-2 ml-auto">
              <label className="font-bold text-slate-700">Identifier Prefix:</label>
              <input
                type="text"
                value={options.prefix}
                onChange={(e) => setOptions({ ...options, prefix: e.target.value.toUpperCase() })}
                className="w-24 px-2 py-0.5 border border-slate-300 rounded text-xs uppercase bg-white font-mono"
                placeholder="COURSE"
              />
            </div>
          </div>
        )}

        {/* Schema Header Information Banner */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                platform === 'moodle' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {exportPayload.format === 'csv' ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : (
                <FileCode className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">{exportPayload.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {exportPayload.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500">{exportPayload.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {exportPayload.filename}
            </span>
          </div>
        </div>

        {/* Main Body: Preview & Interactive Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {/* View Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">Interactive Output Preview</span>
                {exportPayload.format === 'csv' && tableRows.length > 0 && (
                  <span className="text-slate-400">
                    ({tableRows.length - 1} records, {tableRows[0]?.length || 0} fields)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyContent}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Schema</span>
                  </>
                )}
              </button>
            </div>

            {/* Table or Monospace Code Area */}
            {viewMode === 'table' && exportPayload.format === 'csv' && tableRows.length > 0 ? (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                      {tableRows[0].map((header, hIdx) => (
                        <th key={hIdx} className="py-2.5 px-3 whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tableRows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-indigo-50/40 transition">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="py-2 px-3 text-slate-700 max-w-xs truncate"
                            title={cell}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
                <pre>{exportPayload.content}</pre>
              </div>
            )}
          </div>

          {/* One-Click Import Step-by-Step Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                One-Click Import Guide: How to Ingest into {platform === 'moodle' ? 'Moodle' : 'Blackboard'}
              </h4>
            </div>

            <ol className="space-y-1.5 text-xs text-slate-700">
              {exportPayload.guide.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              RFC 4180 CSV &amp; UTF-8 JSON validated for seamless LMS import without manual formatting.
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              id="lms-export-download-single-btn"
              onClick={handleDownloadCurrentFile}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-bold shadow-xs flex items-center space-x-2 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download {exportPayload.format.toUpperCase()}</span>
            </button>

            <button
              type="button"
              id="lms-export-download-all-zip-btn"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition cursor-pointer"
            >
              {isZipping ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Packaging Zip...</span>
                </>
              ) : (
                <>
                  <Package className="w-3.5 h-3.5" />
                  <span>Download All-in-One Bundle (.ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
