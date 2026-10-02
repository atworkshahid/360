import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Minimize2,
  Layers,
  FileText,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  guidebookRegistry,
  FrameworkGuidebookEntry,
  GuidebookChapter,
  GuidebookCategory,
} from '../../services/guidebookRegistry';
import { getFrameworkGuideline } from '../../data/frameworkGuidelines';

export interface GuidebookProps {
  isOpen: boolean;
  onClose: () => void;
  initialFrameworkId?: string;
  courseTitle?: string;
  courseCode?: string;
  institutionName?: string;
  initialStageKey?: string;
  onSelectActionVerb?: (verb: string) => void;
  onNavigateToStep?: (stageKey: string) => void;
  onApplyFrameworkToCourse?: (frameworkId: string) => void;
}

export const Guidebook: React.FC<GuidebookProps> = ({
  isOpen,
  onClose,
  initialFrameworkId,
  courseTitle = 'Engineering Curriculum & Design',
  courseCode = 'ENG-301',
  institutionName = 'Apex Institute of Science & Technology',
  initialStageKey,
  onSelectActionVerb,
  onNavigateToStep,
  onApplyFrameworkToCourse,
}) => {
  // Registry frameworks
  const allFrameworks = useMemo(() => guidebookRegistry.getAll(), []);

  // Currently selected framework in the guidebook viewer
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>(() => {
    return initialFrameworkId || 'fw-washington-accord';
  });

  // Current active guidebook entry
  const activeEntry: FrameworkGuidebookEntry = useMemo(() => {
    return guidebookRegistry.getById(selectedFrameworkId);
  }, [selectedFrameworkId]);

  // Synchronize when initialFrameworkId changes externally
  useEffect(() => {
    if (initialFrameworkId) {
      setSelectedFrameworkId(initialFrameworkId);
    }
  }, [initialFrameworkId]);

  // View mode: 'pdf' (Live PDF iframe) vs 'reader' (Interactive Chapters) vs 'outcomes' (Attribute Matrix)
  const [viewMode, setViewMode] = useState<'pdf' | 'reader' | 'outcomes'>('pdf');

  // PDF blob state
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Reader state
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Detailed guidelines data fallback for chapters if entry chapters are brief
  const frameworkGuideline = useMemo(() => {
    return getFrameworkGuideline(activeEntry.id);
  }, [activeEntry.id]);

  // Generate / regenerate PDF blob when framework or course props change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsPdfGenerating(true);
    setPdfError(null);

    // Revoke previous blob url if any
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }

    try {
      const result = activeEntry.getPdfBlob({
        courseTitle,
        courseCode,
        institutionName,
      });

      if (isMounted) {
        setPdfBlobUrl(result.blobUrl);
        setIsPdfGenerating(false);
      }
    } catch (err) {
      console.error('Failed generating guidebook PDF blob:', err);
      if (isMounted) {
        setPdfError('Could not render in-browser PDF preview. You can still download the complete PDF below.');
        setIsPdfGenerating(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedFrameworkId, courseTitle, courseCode, institutionName]);

  // Select initial chapter based on initialStageKey
  useEffect(() => {
    if (!activeEntry) return;

    if (initialStageKey && activeEntry.chapters.length > 0) {
      const matchingChapter = activeEntry.chapters.find((ch) => ch.stageKey === initialStageKey);
      if (matchingChapter) {
        setSelectedChapterId(matchingChapter.id);
        return;
      }
    }

    if (activeEntry.chapters.length > 0) {
      setSelectedChapterId(activeEntry.chapters[0].id);
    }
  }, [activeEntry, initialStageKey]);

  // Cleanup blob URL on modal close
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtered chapters for reader search
  const filteredChapters = activeEntry.chapters.filter((ch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      ch.summary.toLowerCase().includes(q) ||
      ch.requirements.some((r) => r.toLowerCase().includes(q)) ||
      ch.exemplars.some((ex) => ex.text.toLowerCase().includes(q) || ex.title.toLowerCase().includes(q))
    );
  });

  const currentChapter = activeEntry.chapters.find((ch) => ch.id === selectedChapterId) || activeEntry.chapters[0];

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      activeEntry.downloadPdf({
        courseTitle,
        courseCode,
        institutionName,
      });
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl);
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    } else {
      activeEntry.downloadPdf({ courseTitle, courseCode, institutionName });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isCurrentCourseFramework = initialFrameworkId === activeEntry.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guidebook-title"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col w-full border border-slate-200 overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-2 h-[calc(100vh-16px)]' : 'max-w-6xl h-[92vh] max-h-[950px]'
        }`}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <span className="font-semibold tracking-wide uppercase text-indigo-400">
                  OBE Accreditation Guidebook
                </span>
                <span>·</span>
                <span className="truncate">{activeEntry.documentRef}</span>
                {isCurrentCourseFramework && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Course Framework
                    </span>
                  </>
                )}
              </div>
              <h1 id="guidebook-title" className="text-lg font-bold text-white truncate font-serif">
                {activeEntry.title}
              </h1>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-2">
            {/* View Mode Segmented Control */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'pdf'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="View generated publication PDF directly in viewer"
              >
                <FileText className="w-3.5 h-3.5" />
                PDF Document
              </button>
              <button
                type="button"
                onClick={() => setViewMode('reader')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'reader'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Interactive chapter-by-chapter reading mode"
              >
                <Compass className="w-3.5 h-3.5" />
                Chapter Reader
              </button>
              <button
                type="button"
                onClick={() => setViewMode('outcomes')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'outcomes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Graduate Attributes & Student Outcomes Matrix"
              >
                <Layers className="w-3.5 h-3.5" />
                Outcomes Taxonomy
              </button>
            </div>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={!pdfBlobUrl}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
              title="Print Guidebook"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-60 space-x-1.5"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PDF</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Framework Selector & Metadata Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-semibold text-slate-700">Select Framework Standard:</span>
            <select
              value={selectedFrameworkId}
              onChange={(e) => setSelectedFrameworkId(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            >
              <optgroup label="International Recognition Accords">
                <option value="fw-washington-accord">Washington Accord (IEA WA-ENG)</option>
                <option value="fw-sydney-accord">Sydney Accord (IEA SA-ET)</option>
                <option value="fw-seoul-accord">Seoul Accord (SA-COMP)</option>
              </optgroup>
              <optgroup label="ABET Accreditation Commissions">
                <option value="fw-abet-eac">ABET EAC (Engineering Accreditation)</option>
                <option value="fw-abet-cac">ABET CAC (Computing Accreditation)</option>
              </optgroup>
              <optgroup label="National Statutory Frameworks">
                <option value="fw-nba-tier1">NBA India (Tier-I SAR Manual)</option>
                <option value="fw-hec-pakistan">HEC Pakistan & NCEAC OBE Framework</option>
              </optgroup>
              <optgroup label="Institutional & General Frameworks">
                <option value="fw-custom-institutional">Custom Institutional Quality Blueprint</option>
                <option value="fw-general-obe">General Spady OBE Standard</option>
              </optgroup>
            </select>

            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-500 hidden sm:inline">{activeEntry.governingBody}</span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-500 hidden sm:inline">{activeEntry.edition}</span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-500 hidden sm:inline">~{activeEntry.pageCount} Pages</span>
          </div>

          {/* Right link action: Apply this framework to course if different */}
          {!isCurrentCourseFramework && onApplyFrameworkToCourse && (
            <button
              type="button"
              onClick={() => onApplyFrameworkToCourse(activeEntry.id)}
              className="inline-flex items-center space-x-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Adopt {activeEntry.code} for this Course</span>
            </button>
          )}

          {isCurrentCourseFramework && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bound to Course: {courseCode} ({courseTitle})</span>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* VIEW MODE 1: PDF Viewer */}
          {viewMode === 'pdf' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-100 p-2 sm:p-4">
              {isPdfGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-white rounded-lg border border-slate-200 p-8 shadow-inner">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-800">
                    Compiling Official {activeEntry.code} PDF Guidebook...
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md text-center">
                    Generating publication-grade layout with running headers, accreditation outcome tables,
                    constructive alignment stages, and rubric rubrics.
                  </p>
                </div>
              ) : pdfBlobUrl ? (
                <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-300 shadow-inner overflow-hidden">
                  <div className="bg-slate-800 text-slate-200 px-3 py-1.5 flex items-center justify-between text-xs border-b border-slate-700">
                    <span className="font-mono text-slate-300">
                      {activeEntry.code}_Accreditation_OBE_Guidebook.pdf
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400">Rendered in-browser</span>
                      <a
                        href={pdfBlobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:text-indigo-100 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in New Window
                      </a>
                    </div>
                  </div>
                  <iframe
                    src={pdfBlobUrl}
                    title={`${activeEntry.title} PDF Document`}
                    className="w-full flex-1 border-0"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200 p-8 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <h3 className="text-sm font-semibold text-slate-800">PDF Preview Unavailable</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    {pdfError || 'Direct browser PDF rendering is not supported in this frame.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-500 transition-colors shadow-sm"
                  >
                    Download PDF File Directly
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: Chapter Reader */}
          {viewMode === 'reader' && (
            <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white">
              {/* Left Chapter Navigation Sidebar */}
              <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/70 flex flex-col min-h-0">
                {/* Search */}
                <div className="p-3 border-b border-slate-200 bg-white">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search guidelines, exemplars..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Chapter List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredChapters.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No chapters match your search query.
                    </div>
                  ) : (
                    filteredChapters.map((ch) => {
                      const isSelected = ch.id === currentChapter?.id;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setSelectedChapterId(ch.id)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start space-x-2.5 ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-900 font-medium border border-indigo-200 shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {ch.number}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{ch.title}</p>
                            {ch.stageLabel && (
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {ch.stageLabel}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}

                  {/* Fallback stage links from frameworkGuideline if chapters are empty */}
                  {activeEntry.chapters.length === 0 && frameworkGuideline?.stages && (
                    <div className="p-2 space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                        Accreditation Stages
                      </p>
                      {Object.entries(frameworkGuideline.stages).map(([stageKey, rawStg]) => {
                        const stg = rawStg as { stageName?: string; guidelineSummary?: string };
                        return (
                          <div
                            key={stageKey}
                            className="p-2 rounded bg-white border border-slate-200 text-xs"
                          >
                            <p className="font-semibold text-slate-800">{stg.stageName || stageKey}</p>
                            <p className="text-slate-500 text-[11px] line-clamp-2 mt-1">{stg.guidelineSummary || ''}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Chapter Content Pane */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {currentChapter ? (
                  <>
                    {/* Chapter Header */}
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                          <span>Chapter {currentChapter.number}</span>
                          {currentChapter.stageLabel && (
                            <>
                              <span>•</span>
                              <span>{currentChapter.stageLabel}</span>
                            </>
                          )}
                        </div>

                        {currentChapter.stageKey && onNavigateToStep && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToStep(currentChapter.stageKey!);
                              onClose();
                            }}
                            className="inline-flex items-center space-x-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded font-medium transition-colors"
                          >
                            <span>Jump to this Step in Wizard</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 font-serif">
                        {currentChapter.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {currentChapter.summary}
                      </p>
                    </div>

                    {/* Requirements Section */}
                    {currentChapter.requirements && currentChapter.requirements.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Mandatory Accreditation Criteria & Evidence
                        </h3>
                        <ul className="space-y-2">
                          {currentChapter.requirements.map((req, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start space-x-2.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Alignment Rules */}
                    {currentChapter.alignmentRules && currentChapter.alignmentRules.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-indigo-600" />
                          Constructive Alignment Guidelines
                        </h3>
                        <ul className="space-y-2">
                          {currentChapter.alignmentRules.map((rule, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-700 bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 flex items-start space-x-2.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Compliant Exemplars */}
                    {currentChapter.exemplars && currentChapter.exemplars.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          Accreditation-Compliant Exemplars (1-Click Copy)
                        </h3>
                        <div className="space-y-3">
                          {currentChapter.exemplars.map((ex, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-slate-300 rounded-lg p-3.5 shadow-sm space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-slate-900">{ex.title}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(ex.text, `ex-${idx}`)}
                                  className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded font-medium transition-colors"
                                >
                                  {copiedText === `ex-${idx}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Exemplar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-xs font-mono text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                                {ex.text}
                              </p>
                              <p className="text-[11px] text-slate-500 italic">
                                <strong className="font-medium text-slate-700 not-italic">Rationale: </strong>
                                {ex.rationale}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pitfalls & Anti-Patterns */}
                    {currentChapter.pitfalls && currentChapter.pitfalls.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Accreditation Pitfalls & Audit Flags
                        </h3>
                        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 space-y-2">
                          {currentChapter.pitfalls.map((pit, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-xs text-amber-900">
                              <span className="font-bold text-amber-700 shrink-0">✕</span>
                              <span>{pit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Select a chapter from the left sidebar to view detailed guidelines and exemplars.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Outcomes Taxonomy */}
          {viewMode === 'outcomes' && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-serif">
                        {activeEntry.outcomeModel}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Authoritative competency outcomes established by {activeEntry.governingBody}.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      {activeEntry.keyOutcomes.length} Defined Outcomes
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeEntry.keyOutcomes.map((out) => (
                    <div
                      key={out.code}
                      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {out.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{out.title}</span>
                        </div>
                        {out.bloomsLevel && (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                            Bloom Domain: {out.bloomsLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{out.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Accreditation Scope:</span>
            <span>{activeEntry.accreditationScope}</span>
            <span>·</span>
            <span>Jurisdiction: {activeEntry.jurisdiction}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownload}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download Guidebook PDF
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
