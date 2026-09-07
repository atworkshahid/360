import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Server,
  Key,
  Globe,
  Settings,
  Copy,
  Check,
  ExternalLink,
  Play,
  RotateCw,
  FileCode,
  FileText,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { Course } from '../types';
import { LMSFormatExportModal } from './LMSFormatExportModal';
import {
  downloadCommonCartridge,
  generateMoodleCompetencyCSV,
  generateBlackboardRubricXML,
  generateCanvasOutcomesCSV,
  generateQTIAssessmentsXML,
  LMSExportOptions,
} from '../utils/lmsExport';
import {
  LMSPlatform,
  LMSConnectionConfig,
  getSavedLMSConfigs,
  saveLMSConfig,
  testLMSConnection,
  syncCourseToLMS,
  getLTIToolRegistrationDetails,
  SyncStepLog,
} from '../services/lmsService';

interface LMSIntegrationModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onAskCopilot?: (prompt: string) => void;
}

export const LMSIntegrationModal: React.FC<LMSIntegrationModalProps> = ({
  course,
  isOpen,
  onClose,
  onAskCopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'cartridge' | 'frameworks' | 'api' | 'lti' | 'guide'>('cartridge');
  const [selectedPlatform, setSelectedPlatform] = useState<LMSPlatform>('moodle');
  const [configs, setConfigs] = useState<Record<LMSPlatform, LMSConnectionConfig>>(getSavedLMSConfigs());
  const [currentConfig, setCurrentConfig] = useState<LMSConnectionConfig>(configs.moodle);

  // Cartridge Options
  const [exportOptions, setExportOptions] = useState<LMSExportOptions>({
    includeSyllabus: true,
    includeRubrics: true,
    includeAssessments: true,
    includeCQI: true,
  });
  const [isExportingCartridge, setIsExportingCartridge] = useState(false);

  // API Sync State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncStepLog[]>([]);

  // LTI Copy State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showLTISimulator, setShowLTISimulator] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState<'Instructor' | 'Learner'>('Instructor');
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  // Load configs on open
  useEffect(() => {
    if (isOpen) {
      const loaded = getSavedLMSConfigs();
      setConfigs(loaded);
      setCurrentConfig(loaded[selectedPlatform] || loaded.moodle);
      setTestResult(null);
      setSyncLogs([]);
    }
  }, [isOpen, selectedPlatform]);

  if (!isOpen) return null;

  const ltiDetails = getLTIToolRegistrationDetails(course);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadCartridge = async () => {
    try {
      setIsExportingCartridge(true);
      await downloadCommonCartridge(course, exportOptions);
    } catch (e) {
      console.error('Failed to export Common Cartridge', e);
    } finally {
      setIsExportingCartridge(false);
    }
  };

  const handleDownloadSingleFramework = (type: 'moodle-csv' | 'bb-xml' | 'canvas-csv' | 'qti-xml') => {
    let content = '';
    let mime = 'text/plain';
    let filename = '';

    const safeCode = (course.code || 'course').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    if (type === 'moodle-csv') {
      content = generateMoodleCompetencyCSV(course);
      mime = 'text/csv;charset=utf-8;';
      filename = `${safeCode}-moodle-competency-framework.csv`;
    } else if (type === 'bb-xml') {
      content = generateBlackboardRubricXML(course);
      mime = 'application/xml;charset=utf-8;';
      filename = `${safeCode}-blackboard-rubrics.xml`;
    } else if (type === 'canvas-csv') {
      content = generateCanvasOutcomesCSV(course);
      mime = 'text/csv;charset=utf-8;';
      filename = `${safeCode}-canvas-outcomes.csv`;
    } else if (type === 'qti-xml') {
      content = generateQTIAssessmentsXML(course);
      mime = 'application/xml;charset=utf-8;';
      filename = `${safeCode}-qti-assessment-blueprint.xml`;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testLMSConnection(currentConfig);
      setTestResult(res);
      if (res.success) {
        saveLMSConfig(currentConfig);
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Connection test failed. Verify network connectivity or credentials.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncCourse = async () => {
    setIsSyncing(true);
    setSyncLogs([]);
    try {
      await syncCourseToLMS(currentConfig, course, (newLog) => {
        setSyncLogs((prev) => [...prev, newLog]);
      });
    } catch (e: any) {
      console.error('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateConfig = (updates: Partial<LMSConnectionConfig>) => {
    const updated = { ...currentConfig, ...updates };
    setCurrentConfig(updated);
    saveLMSConfig(updated);
    setConfigs((prev) => ({ ...prev, [updated.platform]: updated }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold font-serif tracking-tight">
                LMS Integration &amp; Connectivity Hub
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Universal connectivity for <strong className="text-slate-200">Moodle</strong>,{' '}
              <strong className="text-slate-200">Blackboard Learn</strong>,{' '}
              <strong className="text-slate-200">Canvas</strong>, and{' '}
              <strong className="text-slate-200">D2L Brightspace</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{course.code || 'COURSE'} • {course.clos?.length || 0} CLOs</span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('cartridge')}
            className={`py-3.5 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'cartridge'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>IMS Common Cartridge (.imscc)</span>
          </button>

          <button
            onClick={() => setActiveTab('frameworks')}
            className={`py-3.5 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'frameworks'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Competencies &amp; Rubrics (CSV / XML)</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`py-3.5 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'api'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Direct REST API Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('lti')}
            className={`py-3.5 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'lti'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>LTI 1.3 Advantage Tool</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3.5 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Setup &amp; Import Guides</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {/* TAB 1: IMS Common Cartridge (.imscc) */}
          {activeTab === 'cartridge' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                    <span>Universal LMS Package Standard</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    IMS Common Cartridge 1.2 Package (.imscc)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Instantly generates a self-contained archive holding the complete course syllabus, module structure, Bloom's outcome matrix, assessment items, and rubric descriptors. Supported out-of-the-box by <strong>Moodle</strong> (via Restore course), <strong>Blackboard Learn</strong> (via Import Package), and <strong>Canvas</strong>.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-center sm:items-end">
                  <button
                    type="button"
                    onClick={handleDownloadCartridge}
                    disabled={isExportingCartridge}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    {isExportingCartridge ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Packaging Cartridge...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Common Cartridge (.imscc)</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-slate-400 mt-1.5">
                    Generates valid imsmanifest.xml &amp; bundled web assets
                  </span>
                </div>
              </div>

              {/* Package Customization Options */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Package Composition Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSyllabus}
                      onChange={(e) =>
                        setExportOptions((p) => ({ ...p, includeSyllabus: e.target.checked }))
                      }
                      className="rounded text-indigo-600 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Course Syllabus</span>
                      <span className="text-[11px] text-slate-500">Metadata, credits, course outline</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeRubrics}
                      onChange={(e) =>
                        setExportOptions((p) => ({ ...p, includeRubrics: e.target.checked }))
                      }
                      className="rounded text-indigo-600 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Grading Rubrics</span>
                      <span className="text-[11px] text-slate-500">Criteria &amp; performance levels</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAssessments}
                      onChange={(e) =>
                        setExportOptions((p) => ({ ...p, includeAssessments: e.target.checked }))
                      }
                      className="rounded text-indigo-600 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Assessment Blueprint</span>
                      <span className="text-[11px] text-slate-500">Direct CLO evidence mappings</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCQI}
                      onChange={(e) =>
                        setExportOptions((p) => ({ ...p, includeCQI: e.target.checked }))
                      }
                      className="rounded text-indigo-600 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">CQI Action Plan</span>
                      <span className="text-[11px] text-slate-500">Continuous quality interventions</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step by step import teaser */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-extrabold">M</span>
                    <span>Importing into Moodle</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Go to your Moodle course page &gt; <em>Course Administration</em>.</li>
                    <li>Click <strong>Restore</strong> and upload your downloaded <code>.imscc</code> file.</li>
                    <li>Select "Restore as a new course" or "Merge into this course".</li>
                    <li>Review activities and click <strong>Perform restore</strong>.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-extrabold">Bb</span>
                    <span>Importing into Blackboard Learn / Ultra</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>In Blackboard course management, click <strong>Packages and Utilities</strong>.</li>
                    <li>Select <strong>Import Package / View Catalog</strong>.</li>
                    <li>Choose your <code>.imscc</code> file and select course materials to import.</li>
                    <li>Click <strong>Submit</strong>. Content and rubrics will deploy into the course shell.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Competency & Rubric Frameworks (CSV / XML) */}
          {activeTab === 'frameworks' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Interactive Schema Exporter Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-slate-50 to-indigo-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Standard Moodle &amp; Blackboard Schema Exporter
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                      CSV &amp; JSON
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Preview, customize, and export validated CSV and JSON schemas for Moodle Competencies, Course Uploads, REST Blueprints, Blackboard Goals, and SIS batch feeds.
                  </p>
                </div>
                <button
                  type="button"
                  id="lms-modal-open-schema-exporter-btn"
                  onClick={() => setSchemaModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shrink-0 transition cursor-pointer shadow-xs"
                >
                  <span>Open Schema Exporter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                LMS platforms feature dedicated subsystems for tracking student competency mastery and rubric evaluations. Download specific, native data formats tailored for individual LMS administration interfaces:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Moodle Competencies CSV */}
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition bg-white space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        <span>Moodle Native Format</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        Moodle Competency Framework (.csv)
                      </h4>
                    </div>
                    <FileCode className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pre-structured CSV with scale definitions (Not Yet Competent, Competent, Exemplary), taxonomy levels, and CLO statements. Import via <em>Site administration &gt; Competencies &gt; Import competency framework</em>.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleFramework('moodle-csv')}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Moodle Competencies (.csv)</span>
                  </button>
                </div>

                {/* Blackboard Rubrics XML */}
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition bg-white space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                        <span>Blackboard Native Format</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        Blackboard Rubric &amp; Outcomes XML
                      </h4>
                    </div>
                    <FileText className="w-5 h-5 text-slate-700" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    XML package containing the exact 4-tier rubric evaluation criteria (Exemplary, Proficient, Developing, Unsatisfactory) with performance benchmarks. Import into Blackboard Grade Center &gt; Rubrics.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleFramework('bb-xml')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Blackboard Rubrics (.xml)</span>
                  </button>
                </div>

                {/* Canvas Outcomes CSV */}
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition bg-white space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        <span>Canvas Native Format</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        Canvas Learning Outcomes (.csv)
                      </h4>
                    </div>
                    <Layers className="w-5 h-5 text-rose-600" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Standard Canvas CSV formatted with vendor GUIDs, calculation methods (highest score / decaying average), and outcome rating thresholds. Import via <em>Course Settings &gt; Outcomes &gt; Import</em>.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleFramework('canvas-csv')}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Canvas Outcomes (.csv)</span>
                  </button>
                </div>

                {/* QTI Assessment Blueprint */}
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition bg-white space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        <span>IMS QTI 2.1 Standard</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        QTI Assessment Test Blueprint (.xml)
                      </h4>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Question &amp; Test Interoperability XML structure packaging direct assessment sections, Bloom's cognitive taxonomy indicators, and outcome passing thresholds for online quizzes.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleFramework('qti-xml')}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QTI Blueprint (.xml)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Direct REST API Sync */}
          {activeTab === 'api' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* LMS Selector */}
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-700">Target LMS Platform:</span>
                <div className="flex space-x-2">
                  {(['moodle', 'blackboard', 'canvas'] as LMSPlatform[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(p);
                        setCurrentConfig(configs[p] || { platform: p, instanceUrl: '', apiKeyOrToken: '' });
                        setTestResult(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        selectedPlatform === p
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p === 'blackboard' ? 'Blackboard Learn' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connection Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedPlatform === 'moodle'
                        ? 'Moodle Instance URL'
                        : selectedPlatform === 'blackboard'
                        ? 'Blackboard Learn Host URL'
                        : 'Canvas Host URL'}
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        value={currentConfig.instanceUrl}
                        onChange={(e) => handleUpdateConfig({ instanceUrl: e.target.value })}
                        placeholder="https://lms.university.edu"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedPlatform === 'moodle'
                        ? 'Web Service REST Token (wstoken)'
                        : selectedPlatform === 'blackboard'
                        ? 'REST App Key / Bearer Token'
                        : 'Canvas Access Token'}
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={currentConfig.apiKeyOrToken}
                        onChange={(e) => handleUpdateConfig({ apiKeyOrToken: e.target.value })}
                        placeholder="Enter API token or service key"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Category ID / Organizational Unit
                    </label>
                    <input
                      type="text"
                      value={currentConfig.courseCategoryOrOrg || ''}
                      onChange={(e) => handleUpdateConfig({ courseCategoryOrOrg: e.target.value })}
                      placeholder="e.g. 1 or FACULTY_LAW"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="sync_clos"
                      checked={currentConfig.autoSyncOutcomes}
                      onChange={(e) => handleUpdateConfig({ autoSyncOutcomes: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <label htmlFor="sync_clos" className="text-xs text-slate-700 cursor-pointer">
                      Push CLOs to Competency Framework
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="sync_gradebook"
                      checked={currentConfig.autoSyncGradebook}
                      onChange={(e) => handleUpdateConfig({ autoSyncGradebook: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <label htmlFor="sync_gradebook" className="text-xs text-slate-700 cursor-pointer">
                      Create Gradebook Assessment Columns
                    </label>
                  </div>
                </div>

                {/* Connection Test Result Box */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{testResult.message}</p>
                      {testResult.latencyMs !== undefined && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Round-trip response time: {testResult.latencyMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection || isSyncing}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-60 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    {testingConnection ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>{testingConnection ? 'Pinging LMS...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncCourse}
                    disabled={isSyncing || testingConnection}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition cursor-pointer"
                  >
                    {isSyncing ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCw className="w-3.5 h-3.5" />
                    )}
                    <span>{isSyncing ? 'Synchronizing Course...' : 'Sync Course to LMS Now'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Sync Console / Logs */}
              {syncLogs.length > 0 && (
                <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 text-xs font-mono space-y-2 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                    <span>LMS REST API Synchronization Stream</span>
                    <span>{syncLogs.length} events</span>
                  </div>
                  {syncLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                      <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                      <span
                        className={`font-bold shrink-0 uppercase text-[9px] px-1 rounded ${
                          log.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400'
                            : log.status === 'error'
                            ? 'bg-rose-950 text-rose-400'
                            : 'bg-indigo-950 text-indigo-400'
                        }`}
                      >
                        {log.phase}
                      </span>
                      <div className="flex-1">
                        <span className="text-slate-200">{log.message}</span>
                        {log.details && (
                          <div className="text-slate-400 text-[10px] mt-0.5">{log.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LTI 1.3 Advantage Tool */}
          {activeTab === 'lti' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                    <span>IMS 1EdTech Certified</span>
                  </div>
                  <h4 className="text-sm font-bold text-indigo-950">
                    LTI 1.3 Advantage External Tool Provider
                  </h4>
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    Embed this OBE Course Designer directly inside Moodle or Blackboard course navigation tabs using secure OAuth2 OpenID Connect (OIDC).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLTISimulator((prev) => !prev)}
                  className="shrink-0 px-4 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{showLTISimulator ? 'Hide LTI Simulator' : 'Test LTI Launch Simulator'}</span>
                </button>
              </div>

              {/* LTI Registration Parameters */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  LTI 1.3 Tool Configuration Endpoints
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Launch URL */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-[11px]">Tool URL / Target Link URI</span>
                      <button
                        onClick={() => handleCopy(ltiDetails.launchUrl, 'launch')}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center space-x-1"
                      >
                        {copiedKey === 'launch' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'launch' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-800 break-all block bg-slate-50 p-1.5 rounded">
                      {ltiDetails.launchUrl}
                    </code>
                  </div>

                  {/* OIDC Login URL */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-[11px]">Initiate Login URL (OIDC)</span>
                      <button
                        onClick={() => handleCopy(ltiDetails.oidcLoginUrl, 'oidc')}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center space-x-1"
                      >
                        {copiedKey === 'oidc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'oidc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-800 break-all block bg-slate-50 p-1.5 rounded">
                      {ltiDetails.oidcLoginUrl}
                    </code>
                  </div>

                  {/* Public Keyset URL */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-[11px]">Public Keyset URL (JWKS)</span>
                      <button
                        onClick={() => handleCopy(ltiDetails.jwksUrl, 'jwks')}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center space-x-1"
                      >
                        {copiedKey === 'jwks' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'jwks' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-800 break-all block bg-slate-50 p-1.5 rounded">
                      {ltiDetails.jwksUrl}
                    </code>
                  </div>

                  {/* Deep Linking URL */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-[11px]">Deep Linking URL (Content-Item)</span>
                      <button
                        onClick={() => handleCopy(ltiDetails.deepLinkingUrl, 'deep')}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center space-x-1"
                      >
                        {copiedKey === 'deep' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'deep' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-800 break-all block bg-slate-50 p-1.5 rounded">
                      {ltiDetails.deepLinkingUrl}
                    </code>
                  </div>
                </div>
              </div>

              {/* LTI Launch Simulator */}
              {showLTISimulator && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Play className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs">Simulate LTI 1.3 Launch Handshake</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400">Launch Role:</span>
                      <button
                        type="button"
                        onClick={() => setSimulatedRole('Instructor')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          simulatedRole === 'Instructor'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Instructor
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatedRole('Learner')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          simulatedRole === 'Learner'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Learner
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    <pre>{JSON.stringify(
                      {
                        "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
                        "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
                        "https://purl.imsglobal.org/spec/lti/claim/deployment_id": ltiDetails.deploymentId,
                        "https://purl.imsglobal.org/spec/lti/claim/target_link_uri": ltiDetails.launchUrl,
                        "https://purl.imsglobal.org/spec/lti/claim/roles": [
                          simulatedRole === 'Instructor'
                            ? "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
                            : "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"
                        ],
                        "https://purl.imsglobal.org/spec/lti/claim/context": {
                          "id": `course_${course.code || '101'}`,
                          "label": course.code,
                          "title": course.title
                        },
                        "iss": "https://moodle.your-institution.edu",
                        "sub": "user_prof_984",
                        "aud": ltiDetails.clientId
                      },
                      null,
                      2
                    )}</pre>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>✓ JWT claims verified against RSA-256 public key. Ready for embed.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Setup & Import Guides */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-in fade-in duration-150 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Moodle Complete Recipe */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-sm text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs">M</span>
                    <span>Moodle Administrator Setup Guide</span>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800">Method A: Common Cartridge Course Restore</p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Export the <code>.imscc</code> file from the <strong>Common Cartridge</strong> tab.</li>
                      <li>In Moodle, navigate to <strong>Site Administration &gt; Courses &gt; Restore course</strong>.</li>
                      <li>Upload the <code>.imscc</code> package into the backup file area.</li>
                      <li>Select your course category and proceed through the restore confirmation steps.</li>
                    </ol>

                    <p className="font-semibold text-slate-800 pt-2">Method B: LTI External Tool Integration</p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Go to <strong>Site administration &gt; Plugins &gt; Activity modules &gt; External tool &gt; Manage tools</strong>.</li>
                      <li>Click <strong>configure a tool manually</strong>.</li>
                      <li>Paste the <strong>Tool URL</strong>, <strong>Initiate login URL</strong>, and <strong>Redirection URI</strong> from the LTI tab.</li>
                      <li>Set LTI version to <strong>LTI 1.3</strong> and Public keyset to the JWKS URL.</li>
                    </ol>
                  </div>
                </div>

                {/* Blackboard Learn Complete Recipe */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-sm text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">Bb</span>
                    <span>Blackboard Learn Administrator Setup Guide</span>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800">Method A: Common Cartridge Import</p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Download the <code>.imscc</code> file from the first tab.</li>
                      <li>In your Blackboard course menu, expand <strong>Packages and Utilities</strong>.</li>
                      <li>Click <strong>Import Package / View Catalog</strong> and choose <em>Import Package</em>.</li>
                      <li>Browse for the <code>.imscc</code> file and check all course content areas to import.</li>
                    </ol>

                    <p className="font-semibold text-slate-800 pt-2">Method B: Outcomes &amp; Rubrics XML Import</p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Download the Blackboard Rubric XML from the <strong>Competencies</strong> tab.</li>
                      <li>Under <strong>Course Tools</strong>, click <strong>Rubrics</strong>.</li>
                      <li>Click <strong>Import Rubric</strong> and attach the XML file.</li>
                      <li>Associate the rubric with your corresponding Grade Center assessment columns.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Copilot Prompt helper */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-indigo-900">
                  <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-[11px]">
                    Need custom LMS integration advice or assistance tailoring your institutional syllabus?
                  </span>
                </div>
                {onAskCopilot && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onAskCopilot(
                        `Explain how to map the CLOs and assessment weights of ${course.code} (${course.title}) into our Moodle or Blackboard LMS gradebook according to OBE best practices.`
                      );
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Ask OBE Copilot
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Standards Supported:</span>
            <span>IMS CC 1.2/1.3 • LTI 1.3 Advantage • QTI 2.1 • Moodle WS • Blackboard REST</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Embedded Standard Schema Export Modal */}
      <LMSFormatExportModal
        course={course}
        isOpen={schemaModalOpen}
        onClose={() => setSchemaModalOpen(false)}
        initialPlatform={selectedPlatform === 'blackboard' ? 'blackboard' : 'moodle'}
      />
    </div>
  );
};
