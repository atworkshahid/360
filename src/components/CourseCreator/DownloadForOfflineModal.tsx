import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Copy,
  Check,
  HardDriveDownload,
  Layers,
  Sparkles,
  BookOpen,
  Scale,
  Brain,
  FileCheck,
  Info,
} from 'lucide-react';
import { Course } from '../../types';
import {
  OfflineProjectService,
  OBECourseIntegrityManifest,
  OfflineProjectValidationResult,
} from '../../utils/offlineProjectService';

interface DownloadForOfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onImportCourse?: (importedCourse: Course) => void;
}

export const DownloadForOfflineModal: React.FC<DownloadForOfflineModalProps> = ({
  isOpen,
  onClose,
  course,
  onImportCourse,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<OfflineProjectValidationResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Compute live integrity manifest
  const manifest: OBECourseIntegrityManifest = useMemo(() => {
    return OfflineProjectService.buildIntegrityManifest(course);
  }, [course]);

  if (!isOpen) return null;

  const defaultFilename = `${(course.code || 'OBE_COURSE')
    .replace(/[^a-zA-Z0-9_-]/g, '_')}_${(course.title || 'project')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30)}_obe_project.json`;

  const handleDownload = () => {
    const filenameToUse = customFilename.trim() || defaultFilename;
    OfflineProjectService.downloadOfflineProject(course, filenameToUse);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyJSON = () => {
    const project = OfflineProjectService.generateOfflineProject(course);
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsProcessingFile(true);
    setImportSuccessMessage(null);

    const result = await OfflineProjectService.readProjectFromFile(file);
    setImportResult(result);
    setIsProcessingFile(false);
  };

  const handleApplyImport = () => {
    if (importResult?.isValid && importResult.course && onImportCourse) {
      onImportCourse(importResult.course);
      setImportSuccessMessage(
        `Successfully restored course "${importResult.course.title || importResult.course.code}" with full OBE alignment.`
      );
      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-serif text-white">
                  Local Course Project &amp; Offline Workspace
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  .obe.json
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Export and import complete OBE course files for offline drafting, git backups, and peer exchanges.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download for Offline Work</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Restore / Import Project</span>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'export' && (
            <>
              {/* OBE Integrity Guarantee Card */}
              <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Full OBE Constructive Alignment Verification
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Checksum: <strong className="text-indigo-700">{manifest.checksum}</strong>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        manifest.isCompliant
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {manifest.isCompliant ? 'Accreditation Ready' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="text-base font-extrabold text-indigo-900 font-mono">
                      {manifest.metrics.totalCLOs}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Learning Outcomes
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="text-base font-extrabold text-indigo-900 font-mono">
                      {manifest.metrics.totalPLOMappings}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      PLO Alignments
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="text-base font-extrabold text-indigo-900 font-mono">
                      {manifest.metrics.totalAssessments} ({manifest.metrics.totalAssessmentWeight}%)
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Assessments (Weight)
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="text-base font-extrabold text-indigo-900 font-mono">
                      {manifest.readinessScore}%
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Readiness Score
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-indigo-100">
                  <span className="flex items-center space-x-1">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>Framework: <strong>{manifest.frameworkName}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      Alignment Status: <strong>{manifest.alignmentTriangle.alignedCount}/{manifest.metrics.totalCLOs} Outcomes Aligned</strong>
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Competencies &amp; Skills: <strong>{manifest.metrics.totalCompetencies} Comps / {manifest.metrics.totalSkills} Skills</strong></span>
                  </span>
                </div>
              </div>

              {/* Offline Work Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lossless Round-Trip</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Maintains full fidelity of all IDs, Bloom taxonomy levels, teaching activities, and rubric matrices.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Standard JSON Format</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Readable by any text editor, IDE, or script. Perfect for Git commits and offline curriculum archiving.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Zero Internet Needed</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Work on flights, remote campuses, or air-gapped workstations and re-import anytime without loss.
                  </p>
                </div>
              </div>

              {/* Filename Customization */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Target Filename (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder={defaultFilename}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomFilename(defaultFilename)}
                    className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Exporting: {course.code} — {course.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Includes all 15 stages, alignment triangles, rubrics, and accreditation flags
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    title="Copy full JSON payload to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>

                  <button
                    type="button"
                    id="download-offline-project-btn"
                    onClick={handleDownload}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/40 cursor-pointer"
                  >
                    {downloadSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{downloadSuccess ? 'Downloaded!' : 'Download Local Project (.obe.json)'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start space-x-3">
                <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold">Restore an Offline OBE Project</span>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Upload an <code>.obe.json</code> or standard course JSON project exported previously. The system will verify the integrity checksum, check constructive alignment, and load it into your current wizard session.
                  </p>
                </div>
              </div>

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".json,.obe.json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {importFile ? importFile.name : 'Choose an .obe.json or course JSON file'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag &amp; drop or click to browse from local disk
                    </p>
                  </div>
                </div>
              </div>

              {isProcessingFile && (
                <div className="p-4 rounded-xl bg-slate-100 text-center text-xs text-slate-600">
                  Verifying project structure and OBE integrity...
                </div>
              )}

              {/* Validation Feedback */}
              {importResult && !isProcessingFile && (
                <div className="space-y-3">
                  {importResult.isValid ? (
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Valid OBE Course Project Verified</span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <div>
                          <strong>Title:</strong> {importResult.course?.title || 'Untitled'} (
                          <span className="font-mono">{importResult.course?.code || 'N/A'}</span>)
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                          <span>CLOs: <strong>{importResult.course?.clos?.length || 0}</strong></span>
                          <span>Assessments: <strong>{importResult.course?.assessments?.length || 0}</strong></span>
                          <span>Modules: <strong>{importResult.course?.modules?.length || 0}</strong></span>
                          {importResult.project?.integrity && (
                            <span>Checksum: <strong className="font-mono text-indigo-700">{importResult.project.integrity.checksum}</strong></span>
                          )}
                        </div>
                      </div>

                      {importResult.warnings.length > 0 && (
                        <div className="pt-2 border-t border-emerald-200/60">
                          <span className="text-[11px] font-bold text-amber-800 block mb-1">Notices:</span>
                          <ul className="list-disc list-inside text-[10px] text-amber-700 space-y-0.5">
                            {importResult.warnings.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 space-y-1.5 text-xs">
                      <div className="flex items-center space-x-2 text-rose-800 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Invalid Project File</span>
                      </div>
                      <ul className="list-disc list-inside text-rose-700 text-[11px] space-y-0.5">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importSuccessMessage && (
                    <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{importSuccessMessage}</span>
                    </div>
                  )}

                  {importResult.isValid && onImportCourse && (
                    <button
                      type="button"
                      onClick={handleApplyImport}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/30"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Apply &amp; Load into Course Wizard</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Format: Mentisera OBE Project JSON v2.0</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
