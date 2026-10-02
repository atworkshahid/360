import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Link2,
} from 'lucide-react';
import {
  OBEFrameworkRegistry,
  OBEFrameworkDefinition,
  CourseMetadataInput,
  getGuidebookByFrameworkId,
} from '../utils/OBEFrameworkRegistry';
import { Course } from '../types';

export interface FrameworkGuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameworkId?: string;
  course?: Course | CourseMetadataInput;
  initialStageKey?: string;
  onAdoptFramework?: (frameworkId: string) => void;
  onNavigateToStep?: (stageKey: string) => void;
}

export const FrameworkGuidebookModal: React.FC<FrameworkGuidebookModalProps> = ({
  isOpen,
  onClose,
  frameworkId,
  course,
  initialStageKey,
  onAdoptFramework,
  onNavigateToStep,
}) => {
  // Retrieve all registered frameworks from OBEFrameworkRegistry
  const allFrameworks: OBEFrameworkDefinition[] = useMemo(() => {
    return OBEFrameworkRegistry.getAll();
  }, []);

  // Compute initial target framework from prop or course metadata
  const resolvedInitialId = useMemo(() => {
    if (frameworkId) return frameworkId;
    if (course?.frameworkId) return course.frameworkId;
    if (course?.accreditationFramework) return course.accreditationFramework;
    return 'fw-washington-accord';
  }, [frameworkId, course]);

  // Current active framework in the viewer
  const [selectedFwId, setSelectedFwId] = useState<string>(resolvedInitialId);

  // Active framework definition retrieved dynamically from OBEFrameworkRegistry
  const activeGuidebook: OBEFrameworkDefinition = useMemo(() => {
    return OBEFrameworkRegistry.getGuidebook(selectedFwId);
  }, [selectedFwId]);

  // Synchronize when initial props change
  useEffect(() => {
    if (frameworkId) {
      setSelectedFwId(frameworkId);
    } else if (course?.frameworkId) {
      setSelectedFwId(course.frameworkId);
    }
  }, [frameworkId, course?.frameworkId]);

  // View mode: 'pdf' (Live PDF iframe) vs 'reader' (Interactive Chapters) vs 'outcomes' (Attribute Matrix)
  const [viewMode, setViewMode] = useState<'pdf' | 'reader' | 'outcomes'>('pdf');

  // PDF blob state
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Reader state
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Course metadata values for dynamic publication headers
  const courseTitle = course?.title || 'Engineering Curriculum & Design';
  const courseCode = course?.code || 'ENG-301';
  const institutionName = course?.institutionName || 'Apex Institute of Science & Technology';

  // Dynamically load / compile PDF blob whenever active framework or course changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsPdfGenerating(true);
    setPdfError(null);

    // Revoke previous blob url
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }

    try {
      const result = activeGuidebook.generatePdfBlob({
        courseTitle,
        courseCode,
        institutionName,
      });

      if (isMounted) {
        setPdfBlobUrl(result.blobUrl);
        setIsPdfGenerating(false);
      }
    } catch (err) {
      console.error('Failed generating framework guidebook PDF blob:', err);
      if (isMounted) {
        setPdfError('Could not render in-browser PDF preview. You can still download the complete PDF documentation below.');
        setIsPdfGenerating(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedFwId, courseTitle, courseCode, institutionName, activeGuidebook]);

  // Set initial chapter based on initialStageKey
  useEffect(() => {
    if (!activeGuidebook || !activeGuidebook.chapters.length) return;

    if (initialStageKey) {
      const matchingChapter = activeGuidebook.chapters.find(
        (ch) => ch.stageKey === initialStageKey
      );
      if (matchingChapter) {
        setSelectedChapterNumber(matchingChapter.number);
        return;
      }
    }

    setSelectedChapterNumber(activeGuidebook.chapters[0].number);
  }, [activeGuidebook, initialStageKey]);

  // Cleanup object URL on unmount or close
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Keyboard escape listener
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

  // Filtered chapters for search
  const filteredChapters = activeGuidebook.chapters.filter((ch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      ch.summary.toLowerCase().includes(q) ||
      (ch.requirements && ch.requirements.some((r) => r.toLowerCase().includes(q)))
    );
  });

  const currentChapter =
    activeGuidebook.chapters.find((ch) => ch.number === selectedChapterNumber) ||
    activeGuidebook.chapters[0];

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      activeGuidebook.downloadPdf({
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
      activeGuidebook.downloadPdf({ courseTitle, courseCode, institutionName });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isCurrentCourseFramework =
    (course?.frameworkId && course.frameworkId === activeGuidebook.id) ||
    (frameworkId && frameworkId === activeGuidebook.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="framework-guidebook-title"
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col w-full border border-slate-200 overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-2 h-[calc(100vh-16px)]' : 'max-w-6xl h-[92vh] max-h-[940px]'
        }`}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <span className="font-semibold tracking-wide uppercase text-indigo-400">
                  OBE Framework Documentation
                </span>
                <span>·</span>
                <span className="truncate">{activeGuidebook.documentRef}</span>
                {isCurrentCourseFramework && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Course Standard
                    </span>
                  </>
                )}
              </div>
              <h1 id="framework-guidebook-title" className="text-base sm:text-lg font-bold text-white truncate font-serif">
                {activeGuidebook.title}
              </h1>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center space-x-2 flex-wrap">
            {/* View Mode Segmented Controls */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'pdf'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Direct PDF publication preview"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('reader')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'reader'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Interactive chapter-by-chapter reader"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Chapter Reader</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('outcomes')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'outcomes'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Graduate Attributes & Student Outcomes Matrix"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Outcomes ({activeGuidebook.totalOutcomes})</span>
              </button>
            </div>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={!pdfBlobUrl}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              title="Print Documentation"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60 space-x-1.5 cursor-pointer"
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
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close Guidebook Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Framework Selector & Associated Documentation Path Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-semibold text-slate-700">Framework Standard:</span>
            <select
              value={selectedFwId}
              onChange={(e) => setSelectedFwId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <optgroup label="International Recognition Accords">
                <option value="fw-washington-accord">Washington Accord (IEA WA-ENG)</option>
                <option value="fw-sydney-accord">Sydney Accord (IEA SA-ET)</option>
                <option value="fw-seoul-accord">Seoul Accord (SA-COMP)</option>
              </optgroup>
              <optgroup label="ABET Accreditation Commissions">
                <option value="fw-abet-eac">ABET EAC (Engineering Accreditation)</option>
                <option value="fw-abet-cac">ABET CAC (Computing Accreditation)</option>
                <option value="fw-abet-etac">ABET ETAC (Engineering Technology)</option>
              </optgroup>
              <optgroup label="National Statutory Standards">
                <option value="fw-nba-tier1">NBA India Tier-I (Washington Accord Recognized)</option>
                <option value="fw-hec-pakistan">HEC Pakistan &amp; NCEAC / PEC OBE Framework</option>
              </optgroup>
              <optgroup label="Institutional & Classical OBE">
                <option value="fw-custom-institutional">Custom Institutional Quality Blueprint</option>
                <option value="fw-general-obe">Spady Classical Outcome-Based Education</option>
              </optgroup>
            </select>

            <span className="text-slate-400 hidden sm:inline">|</span>
            {/* Documentation Path Badge */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-200/80 px-2 py-0.5 rounded text-[11px] text-slate-700 font-mono">
              <Link2 className="w-3 h-3 text-slate-500" />
              <span>{activeGuidebook.pdfPath}</span>
              <button
                type="button"
                onClick={() => handleCopy(activeGuidebook.pdfPath, 'path')}
                className="text-indigo-600 hover:text-indigo-800 ml-1 cursor-pointer"
                title="Copy PDF documentation path"
              >
                {copiedId === 'path' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <span className="text-slate-400 hidden lg:inline">·</span>
            <span className="text-slate-500 hidden lg:inline">{activeGuidebook.standardEdition}</span>
            <span className="text-slate-400 hidden lg:inline">·</span>
            <span className="text-slate-500 hidden lg:inline">~{activeGuidebook.estimatedPages} Pages</span>
          </div>

          {/* Action button if currently viewing a framework not bound to the course */}
          {!isCurrentCourseFramework && onAdoptFramework && (
            <button
              type="button"
              onClick={() => onAdoptFramework(activeGuidebook.id)}
              className="inline-flex items-center space-x-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Apply {activeGuidebook.code} to Course</span>
            </button>
          )}

          {isCurrentCourseFramework && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bound to {courseCode}</span>
            </div>
          )}
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* VIEW MODE 1: Direct Live PDF Viewer */}
          {viewMode === 'pdf' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-100 p-2 sm:p-4">
              {isPdfGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-white rounded-xl border border-slate-200 p-8 shadow-inner">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                  <p className="text-sm font-bold text-slate-800">
                    Compiling Official {activeGuidebook.code} PDF Documentation...
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md text-center">
                    Constructing publication-grade layout with running accreditation headers, outcome matrices,
                    constructive alignment guidelines, and direct evaluation rubrics.
                  </p>
                </div>
              ) : pdfBlobUrl ? (
                <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-300 shadow-inner overflow-hidden">
                  <div className="bg-slate-800 text-slate-200 px-3 py-1.5 flex items-center justify-between text-xs border-b border-slate-700">
                    <span className="font-mono text-slate-300">
                      {activeGuidebook.pdfFileName}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400">Live Browser Render</span>
                      <a
                        href={pdfBlobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:text-indigo-100 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in New Tab</span>
                      </a>
                    </div>
                  </div>
                  <iframe
                    src={pdfBlobUrl}
                    title={`${activeGuidebook.title} PDF Document`}
                    className="w-full flex-1 border-0"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <h3 className="text-sm font-bold text-slate-800">In-Browser PDF View Unavailable</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    {pdfError || 'Direct browser PDF rendering is not supported in this frame.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
                  >
                    Download {activeGuidebook.pdfFileName}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: Chapter Reader */}
          {viewMode === 'reader' && (
            <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white">
              {/* Left Sidebar */}
              <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/70 flex flex-col min-h-0">
                <div className="p-3 border-b border-slate-200 bg-white">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search chapters and rules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredChapters.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No chapters match your search query.
                    </div>
                  ) : (
                    filteredChapters.map((ch) => {
                      const isSelected = ch.number === currentChapter?.number;
                      return (
                        <button
                          key={ch.number}
                          type="button"
                          onClick={() => setSelectedChapterNumber(ch.number)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start space-x-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200 shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {ch.number}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{ch.title}</p>
                            {ch.stageKey && (
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate uppercase tracking-wider font-mono">
                                {ch.stageKey.replace('step_', '')}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Main Chapter Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {currentChapter ? (
                  <>
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          <span>Chapter {currentChapter.number}</span>
                          {currentChapter.stageKey && (
                            <>
                              <span>•</span>
                              <span>Stage: {currentChapter.stageKey}</span>
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
                            className="inline-flex items-center space-x-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            <span>Jump to Wizard Step</span>
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

                    {/* Requirements */}
                    {currentChapter.requirements && currentChapter.requirements.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Mandatory Accreditation Criteria
                        </h3>
                        <ul className="space-y-2">
                          {currentChapter.requirements.map((req, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-2.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Principles */}
                    {activeGuidebook.corePrinciples && activeGuidebook.corePrinciples.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-indigo-600" />
                          Core Pedagogical Principles
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeGuidebook.corePrinciples.map((p, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs text-slate-700"
                            >
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Select a chapter from the left to view requirements.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Outcomes Taxonomy Matrix */}
          {viewMode === 'outcomes' && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">
                      {activeGuidebook.outcomeModel}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Established by {activeGuidebook.governingBody} for {activeGuidebook.accreditationScope}.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {activeGuidebook.totalOutcomes} Defined Outcomes
                  </span>
                </div>

                <div className="space-y-3">
                  {activeGuidebook.keyOutcomes.map((out) => (
                    <div
                      key={out.code}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                            {out.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{out.title}</span>
                        </div>
                        {out.bloomsLevel && (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                            Bloom Level: {out.bloomsLevel}
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
            <span className="font-semibold text-slate-700">Governance:</span>
            <span>{activeGuidebook.governingBody}</span>
            <span>·</span>
            <span>Jurisdiction: {activeGuidebook.jurisdiction}</span>
          </div>

          <div className="flex items-center space-x-3">
            {activeGuidebook.officialUrl && (
              <a
                href={activeGuidebook.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Official Criteria Portal</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkGuidebookModal;
