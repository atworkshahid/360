import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Eye,
  Download,
  UploadCloud,
  ExternalLink,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { Course } from '../types';
import { generateCoursePDF, PDFExportOptions } from '../utils/pdfExport';
import { calculateCourseAudit } from '../utils/obeCalculator';
import { triggerWithLeadGate } from '../services/leadService';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onProceedToDriveSync?: (options?: PDFExportOptions) => void;
  initialOptions?: PDFExportOptions;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  course,
  onProceedToDriveSync,
  initialOptions,
}) => {
  // Configurable export options
  const [options, setOptions] = useState<PDFExportOptions>({
    includeCourseInfo: initialOptions?.includeCourseInfo ?? true,
    includeCLOs: initialOptions?.includeCLOs ?? true,
    includePLOMapping: initialOptions?.includePLOMapping ?? true,
    includeModules: initialOptions?.includeModules ?? true,
    includeAssessments: initialOptions?.includeAssessments ?? true,
    includeRubrics: initialOptions?.includeRubrics ?? true,
    includeEvidenceRules: initialOptions?.includeEvidenceRules ?? true,
    includeAuditReport: initialOptions?.includeAuditReport ?? true,
    includeCQIPlan: initialOptions?.includeCQIPlan ?? true,
  });

  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  // Keep a ref to the active blob URL for cleanup
  const activeBlobUrlRef = useRef<string | null>(null);

  // Clean up blob URL safely
  const revokeActiveBlob = useCallback(() => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
  }, []);

  // Generate temporary PDF blob
  const generatePreviewBlob = useCallback(() => {
    if (!course) return;

    setIsGenerating(true);
    setGenerationError(null);

    // Yield to main thread briefly so the spinner displays cleanly
    setTimeout(() => {
      try {
        const doc = generateCoursePDF(course, options);
        const pages = doc.getNumberOfPages();
        const blob = doc.output('blob');

        // Revoke previous blob URL to prevent memory leaks
        revokeActiveBlob();

        const newUrl = URL.createObjectURL(blob);
        activeBlobUrlRef.current = newUrl;

        setBlobUrl(newUrl);
        setPageCount(pages);
        setFileSizeBytes(blob.size);
        setGeneratedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setIsGenerating(false);
      } catch (err: any) {
        console.error('Failed to generate PDF preview blob:', err);
        setGenerationError(err?.message || 'Failed to render PDF preview from course data.');
        setIsGenerating(false);
      }
    }, 50);
  }, [course, options, revokeActiveBlob]);

  // Trigger preview generation when modal opens or options change
  useEffect(() => {
    if (isOpen && course) {
      generatePreviewBlob();
    } else {
      revokeActiveBlob();
      setBlobUrl(null);
    }

    return () => {
      revokeActiveBlob();
    };
  }, [isOpen, course, generatePreviewBlob, revokeActiveBlob]);

  if (!isOpen || !course) return null;

  const audit = calculateCourseAudit(course);
  const cleanCode = (course.code || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanTitle = course.title.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${cleanCode}_${cleanTitle}_Dossier.pdf`;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (!blobUrl) return;
    triggerWithLeadGate(
      () => {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      {
        featureTitle: `${course.code} PDF Accreditation Dossier`,
        featureDescription: `Verify your academic affiliation to download the formatted PDF specification for ${course.title}.`,
        source: 'pdf_preview_modal',
        framework: course.accreditationFramework,
      }
    );
  };

  const handleOpenInNewTab = () => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProceedSync = () => {
    if (onProceedToDriveSync) {
      onProceedToDriveSync(options);
    }
  };

  const toggleOption = (key: keyof PDFExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {course.code || 'NO-CODE'}
                </span>
                <h2 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md md:max-w-lg">
                  {course.title}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                <span>PDF Document Preview (Temporary Blob URL)</span>
                {blobUrl && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">
                      {pageCount} Page{pageCount === 1 ? '' : 's'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{formatFileSize(fileSizeBytes)}</span>
                    {generatedAt && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400">Generated {generatedAt}</span>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Customize Sections Toggle */}
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                showOptions
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Customize included PDF sections"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sections</span>
            </button>

            {/* Refresh / Recompile Preview */}
            <button
              type="button"
              onClick={generatePreviewBlob}
              disabled={isGenerating}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Regenerate PDF preview"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>

            {/* Open in New Window/Tab */}
            {blobUrl && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                title="Open PDF blob in new browser tab for full native controls & printing"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Open Full</span>
              </button>
            )}

            {/* Download PDF */}
            {blobUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                title="Download PDF copy to local disk"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Proceed to Google Drive Sync */}
            {onProceedToDriveSync && (
              <button
                type="button"
                onClick={handleProceedSync}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-900 transition cursor-pointer"
                title="Proceed to sync this reviewed PDF to Google Drive"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Sync to Drive</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Inclusion Options Drawer (Collapsible) */}
        {showOptions && (
          <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">
                  Select Dossier Sections to Include in PDF
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Changes re-compile the preview automatically
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeCourseInfo}
                  onChange={() => toggleOption('includeCourseInfo')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">Course Blueprint</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeCLOs}
                  onChange={() => toggleOption('includeCLOs')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">CLOs ({course.clos?.length || 0})</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includePLOMapping}
                  onChange={() => toggleOption('includePLOMapping')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">CLO-PLO Matrix</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeModules}
                  onChange={() => toggleOption('includeModules')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">Modules ({course.modules?.length || 0})</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeAssessments}
                  onChange={() => toggleOption('includeAssessments')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">Assessments ({course.assessments?.length || 0})</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeRubrics}
                  onChange={() => toggleOption('includeRubrics')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">Rubrics & Criteria</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeEvidenceRules}
                  onChange={() => toggleOption('includeEvidenceRules')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">Evidence Rules</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeAuditReport}
                  onChange={() => toggleOption('includeAuditReport')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">OBE Compliance Audit</span>
              </label>

              <label className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={options.includeCQIPlan}
                  onChange={() => toggleOption('includeCQIPlan')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-800 truncate">CQI Action Plan</span>
              </label>
            </div>
          </div>
        )}

        {/* Main PDF Viewport */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden flex flex-col">
          {isGenerating && (
            <div className="absolute inset-0 z-20 bg-slate-100/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-700">Compiling PDF Document & Generating Blob URL...</p>
              <p className="text-[11px] text-slate-500">Calculating OBE metrics, CLO matrices, and audit tables</p>
            </div>
          )}

          {generationError ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm max-w-md text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Failed to Generate PDF Preview</h3>
                <p className="text-xs text-rose-700">{generationError}</p>
                <button
                  type="button"
                  onClick={generatePreviewBlob}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Retry PDF Generation
                </button>
              </div>
            </div>
          ) : blobUrl ? (
            <div className="flex-1 w-full h-full relative">
              <iframe
                src={`${blobUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full border-0 bg-slate-100"
                title={`${course.code || 'Course'} PDF Document Preview`}
              />
            </div>
          ) : null}
        </div>

        {/* Bottom Context & Drive Sync Bar */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span className="flex items-center space-x-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Accreditation Ready ({audit.healthScore}% Score)</span>
            </span>
            <span>•</span>
            <span className="text-slate-500 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Rendered directly from course specification state</span>
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              Close
            </button>

            {blobUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Save PDF</span>
              </button>
            )}

            {onProceedToDriveSync && (
              <button
                type="button"
                onClick={handleProceedSync}
                className="inline-flex items-center space-x-2 px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-200 transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Sync Reviewed PDF to Google Drive</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
