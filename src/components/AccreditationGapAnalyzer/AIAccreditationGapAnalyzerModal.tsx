import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Sliders,
  Brain,
  Target,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Building2,
  Wand2,
} from 'lucide-react';
import { Course, CLO, BloomLevel } from '../../types';
import {
  AccreditationGapAnalyzerService,
  AccreditationGapAnalysisResult,
  CognitiveGapSuggestion,
  STANDARD_FRAMEWORK_REQUIREMENTS,
} from '../../services/accreditationGapAnalyzerService';
import { BLOOM_RANK } from '../../utils/assessmentAnalysis';

export interface AIAccreditationGapAnalyzerModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onChangeCourse?: (updatedCourse: Course) => void;
}

export const AIAccreditationGapAnalyzerModal: React.FC<AIAccreditationGapAnalyzerModalProps> = ({
  course,
  isOpen,
  onClose,
  onChangeCourse,
}) => {
  // Selected target framework for comparative analysis
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>(
    course.frameworkId || 'fw-abet-cac'
  );

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<AccreditationGapAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedGapIds, setAppliedGapIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'gaps' | 'checklist' | 'cognitive_balance'>('gaps');

  // Inline editing of suggested CLO statement
  const [editingGapId, setEditingGapId] = useState<string | null>(null);
  const [editedStatements, setEditedStatements] = useState<Record<string, string>>({});

  // Run analysis when modal opens or framework changes
  const runAnalysis = async (useAI: boolean = true) => {
    setIsAnalyzing(true);
    try {
      if (useAI) {
        const result = await AccreditationGapAnalyzerService.analyzeWithAI(
          course,
          selectedFrameworkId
        );
        setAnalysisResult(result);
      } else {
        const result = AccreditationGapAnalyzerService.analyzeLocally(course, selectedFrameworkId);
        setAnalysisResult(result);
      }
    } catch (e) {
      console.warn('Analysis execution error:', e);
      const fallback = AccreditationGapAnalyzerService.analyzeLocally(course, selectedFrameworkId);
      setAnalysisResult(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAnalysis(true);
    }
  }, [isOpen, selectedFrameworkId]);

  // Handle applying a single suggestion
  const handleApplySuggestion = (suggestion: CognitiveGapSuggestion) => {
    if (!onChangeCourse) return;

    // Apply edited statement if modified by user
    const finalSuggestion = {
      ...suggestion,
      suggestedCLOStatement: editedStatements[suggestion.id] || suggestion.suggestedCLOStatement,
    };

    const updated = AccreditationGapAnalyzerService.applyGapSuggestion(course, finalSuggestion);
    onChangeCourse(updated);

    // Track applied gap
    setAppliedGapIds((prev) => new Set(prev).add(suggestion.id));

    // Re-run local analysis immediately to update metrics in real-time
    const refreshed = AccreditationGapAnalyzerService.analyzeLocally(updated, selectedFrameworkId);
    setAnalysisResult((prev) =>
      prev
        ? {
            ...refreshed,
            engine: prev.engine,
            gaps: prev.gaps.map((g) => (g.id === suggestion.id ? { ...g, applied: true } : g)),
          }
        : refreshed
    );
  };

  // Handle applying all suggestions
  const handleApplyAll = () => {
    if (!onChangeCourse || !analysisResult) return;

    const unappliedGaps = analysisResult.gaps.filter((g) => !appliedGapIds.has(g.id) && !g.applied);
    if (unappliedGaps.length === 0) return;

    const updated = AccreditationGapAnalyzerService.applyAllGapSuggestions(course, unappliedGaps);
    onChangeCourse(updated);

    const newApplied = new Set(appliedGapIds);
    unappliedGaps.forEach((g) => newApplied.add(g.id));
    setAppliedGapIds(newApplied);

    const refreshed = AccreditationGapAnalyzerService.analyzeLocally(updated, selectedFrameworkId);
    setAnalysisResult({
      ...refreshed,
      engine: analysisResult.engine,
      gaps: refreshed.gaps.map((g) => ({ ...g, applied: true })),
    });
  };

  // Filtered gaps list
  const filteredGaps = useMemo(() => {
    if (!analysisResult) return [];
    if (severityFilter === 'all') return analysisResult.gaps;
    return analysisResult.gaps.filter((g) => g.severity === severityFilter);
  }, [analysisResult, severityFilter]);

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (!analysisResult) return;

    let md = `# AI ACCREDITATION GAP ANALYSIS REPORT\n`;
    md += `**Course:** ${course.code} - ${course.title}  \n`;
    md += `**Target Standard:** ${analysisResult.frameworkName}  \n`;
    md += `**Accreditation Compliance Score:** ${analysisResult.complianceScore}%  \n`;
    md += `**Cognitive Depth Score:** ${analysisResult.cognitiveDepthScore}% | **Framework Coverage:** ${analysisResult.frameworkCoverageScore}%  \n`;
    md += `**Audit Timestamp:** ${new Date(analysisResult.analyzedAt).toLocaleString()}  \n\n`;
    md += `## Executive Summary\n${analysisResult.executiveSummary}\n\n`;
    md += `## Actionable Cognitive Gap Remediation Plan\n\n`;

    analysisResult.gaps.forEach((g, idx) => {
      md += `### ${idx + 1}. [${g.severity.toUpperCase()}] ${g.title}\n`;
      md += `- **Target Attribute:** ${g.targetFrameworkOutcome}\n`;
      md += `- **Deficiency Reason:** ${g.deficiencyReason}\n`;
      if (g.suggestedCLOStatement) {
        md += `- **Suggested CLO (${g.suggestedCognitiveLevel || 'Analyze'}):** "${g.suggestedCLOStatement}"\n`;
      }
      if (g.suggestedAssessmentMethod) {
        md += `- **Recommended Assessment Evidence:** ${g.suggestedAssessmentMethod}\n`;
      }
      md += `- **Pedagogical Rationale:** ${g.rationale}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!analysisResult) return;

    const headers = [
      'Severity',
      'Gap Title',
      'Target Framework Attribute',
      'Deficiency Reason',
      'Suggested Cognitive Level',
      'Suggested Action Verb',
      'Suggested CLO Statement',
      'Recommended Evidence Instrument',
      'Target Competency',
      'Status',
    ];

    const rows = analysisResult.gaps.map((g) => [
      `"${g.severity.toUpperCase()}"`,
      `"${g.title.replace(/"/g, '""')}"`,
      `"${g.targetFrameworkOutcome.replace(/"/g, '""')}"`,
      `"${g.deficiencyReason.replace(/"/g, '""')}"`,
      `"${g.suggestedCognitiveLevel || 'Analyze'}"`,
      `"${g.suggestedBloomVerb || 'Analyze'}"`,
      `"${(g.suggestedCLOStatement || '').replace(/"/g, '""')}"`,
      `"${(g.suggestedAssessmentMethod || '').replace(/"/g, '""')}"`,
      `"${(g.suggestedCompetency || '').replace(/"/g, '""')}"`,
      `"${appliedGapIds.has(g.id) || g.applied ? 'APPLIED' : 'PENDING'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.code || 'Course'}_Accreditation_Gap_Analysis_${analysisResult.frameworkCode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* ========================================================= */}
        {/* MODAL HEADER: BRAND & CONTROLS                            */}
        {/* ========================================================= */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-indigo-900/40">
          <div className="flex items-center space-x-3.5">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>AI Accreditation Gap Analyzer</span>
                </span>
                <span className="text-xs text-indigo-300 font-bold">{course.code}</span>
                <span className="text-xs text-slate-400">• {course.title}</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                Automated Accreditation Audit &amp; Cognitive Gap Remediation
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end md:self-auto">
            {/* Target Standard Selector */}
            <div className="flex items-center bg-white/10 rounded-xl px-2.5 py-1 border border-white/15 text-xs">
              <span className="text-slate-400 mr-1.5 text-[10px] font-bold uppercase tracking-wider">
                Standard:
              </span>
              <select
                value={selectedFrameworkId}
                onChange={(e) => setSelectedFrameworkId(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="fw-abet-cac" className="bg-slate-900 text-white">
                  ABET CAC (Computing SO 1-6)
                </option>
                <option value="fw-washington-accord" className="bg-slate-900 text-white">
                  Washington Accord (WA 1-12)
                </option>
                <option value="fw-abet-eac" className="bg-slate-900 text-white">
                  ABET EAC (Engineering SO 1-7)
                </option>
                <option value="fw-hec-pakistan" className="bg-slate-900 text-white">
                  HEC National Framework (PK)
                </option>
              </select>
            </div>

            {/* Re-run AI Analysis Button */}
            <button
              type="button"
              id="gap-analyzer-refresh-btn"
              onClick={() => runAnalysis(true)}
              disabled={isAnalyzing}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              title="Re-run deep AI accreditation gap analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close analyzer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY                                                */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 space-y-6">
          {/* 1. TOP METRICS DASHBOARD */}
          {analysisResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Compliance Overall Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                    analysisResult.complianceScore >= 80
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : analysisResult.complianceScore >= 60
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span className="text-xl leading-none">{analysisResult.complianceScore}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Accredited</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Compliance Index
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                    {analysisResult.complianceScore >= 80
                      ? 'Accreditation Ready'
                      : analysisResult.complianceScore >= 60
                      ? 'Conditional Alignment'
                      : 'Action Required'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    vs. {analysisResult.frameworkCode} standard
                  </p>
                </div>
              </div>

              {/* Cognitive Depth (HOTS) Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex flex-col items-center justify-center font-black shrink-0">
                  <span className="text-xl leading-none">{analysisResult.cognitiveTiers.hots.percentage}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">HOTS</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cognitive Depth
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                    {analysisResult.cognitiveTiers.hots.count} of {course.clos?.length || 0} CLOs at L4-L6
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Benchmark: ≥ {analysisResult.cognitiveTiers.hots.targetPercentage}%
                  </p>
                </div>
              </div>

              {/* Framework Attribute Coverage */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex flex-col items-center justify-center font-black shrink-0">
                  <span className="text-xl leading-none">{analysisResult.frameworkCoverageScore}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Coverage</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Graduate Attributes
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                    {analysisResult.benchmarkCoverage.filter((b) => b.status === 'satisfied').length} of{' '}
                    {analysisResult.benchmarkCoverage.length} Satisfied
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {analysisResult.benchmarkCoverage.filter((b) => b.status === 'missing').length} missing criteria
                  </p>
                </div>
              </div>

              {/* Actionable Gaps Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex flex-col items-center justify-center font-black shrink-0">
                  <span className="text-xl leading-none">{analysisResult.gaps.length}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Gaps</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Identified Deficiencies
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                    {analysisResult.gaps.filter((g) => g.severity === 'critical').length} Critical •{' '}
                    {analysisResult.gaps.filter((g) => g.severity === 'high').length} High
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    AI generated remedies ready
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. EXECUTIVE SUMMARY BANNER */}
          {analysisResult && (
            <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-extrabold uppercase">
                    Auditor Summary • {analysisResult.engine}
                  </span>
                  <span className="text-slate-500 font-medium text-[11px]">
                    Evaluated against {analysisResult.frameworkName}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {analysisResult.executiveSummary}
                </p>
              </div>

              {/* Action Buttons: Apply All, Print, Export */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {analysisResult.gaps.some((g) => !appliedGapIds.has(g.id) && !g.applied) && (
                  <button
                    type="button"
                    id="gap-analyzer-apply-all-btn"
                    onClick={handleApplyAll}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Apply All AI Fixes</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  id="gap-analyzer-print-btn"
                  onClick={handlePrint}
                  className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. SUB-NAV TABS: Actionable Gaps vs Framework Checklist vs Cognitive Balance */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <button
                type="button"
                id="gap-tab-actionable"
                onClick={() => setActiveTab('gaps')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'gaps'
                    ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Actionable Cognitive Gaps ({analysisResult?.gaps.length || 0})</span>
              </button>

              <button
                type="button"
                id="gap-tab-checklist"
                onClick={() => setActiveTab('checklist')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'checklist'
                    ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Framework Outcomes Checklist</span>
              </button>

              <button
                type="button"
                id="gap-tab-balance"
                onClick={() => setActiveTab('cognitive_balance')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'cognitive_balance'
                    ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Cognitive Tiers &amp; Bloom Depth</span>
              </button>
            </div>

            {/* Severity Filter pills when on 'gaps' tab */}
            {activeTab === 'gaps' && (
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Severity:
                </span>
                {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-0.5 rounded-lg font-bold capitalize transition cursor-pointer text-[11px] ${
                      severityFilter === sev
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. TAB 1: ACTIONABLE COGNITIVE GAP REMEDIATION CARDS */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              {filteredGaps.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">
                    No {severityFilter !== 'all' ? severityFilter : ''} cognitive gaps detected!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    All evaluated criteria meet or exceed the requirements of {analysisResult?.frameworkName}.
                  </p>
                </div>
              ) : (
                filteredGaps.map((gap, index) => {
                  const isApplied = appliedGapIds.has(gap.id) || gap.applied;
                  const isEditing = editingGapId === gap.id;
                  const currentStatement =
                    editedStatements[gap.id] ?? gap.suggestedCLOStatement ?? '';

                  const sevBadge =
                    gap.severity === 'critical'
                      ? 'bg-rose-100 text-rose-900 border-rose-200'
                      : gap.severity === 'high'
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-blue-100 text-blue-900 border-blue-200';

                  return (
                    <div
                      key={gap.id}
                      className={`p-5 rounded-2xl bg-white border transition-all duration-200 space-y-3.5 shadow-xs ${
                        isApplied
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : gap.severity === 'critical'
                          ? 'border-rose-200'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Bar: Severity, Target Outcome & Action */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${sevBadge}`}
                          >
                            {gap.severity} Deficiency
                          </span>
                          <span className="font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
                            {gap.targetFrameworkOutcome}
                          </span>
                        </div>

                        {/* Apply Fix Button */}
                        <div className="flex items-center space-x-2">
                          {isApplied ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Remediation Applied</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              id={`gap-apply-btn-${index}`}
                              onClick={() => handleApplySuggestion(gap)}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                              <span>Apply AI Fix</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Gap Title & Explanation */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 leading-snug">{gap.title}</h4>
                        <p className="text-xs text-rose-700/90 font-medium leading-relaxed">
                          <strong>Accreditation Risk:</strong> {gap.deficiencyReason}
                        </p>
                      </div>

                      {/* Proposed Actionable Suggestion Container */}
                      <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 flex items-center space-x-1.5 text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Actionable AI Proposal:</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            {gap.suggestedCognitiveLevel && (
                              <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[10px]">
                                Target Level: L{BLOOM_RANK[gap.suggestedCognitiveLevel]} {gap.suggestedCognitiveLevel}
                              </span>
                            )}
                            {gap.suggestedBloomVerb && (
                              <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[10px]">
                                Verb: {gap.suggestedBloomVerb}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Statement Preview / Editor */}
                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              value={currentStatement}
                              onChange={(e) =>
                                setEditedStatements({
                                  ...editedStatements,
                                  [gap.id]: e.target.value,
                                })
                              }
                              rows={2}
                              className="w-full bg-white border border-indigo-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setEditingGapId(null)}
                                className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px]"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3 pt-0.5">
                            <p className="text-slate-900 font-medium leading-relaxed italic">
                              "{currentStatement}"
                            </p>
                            <button
                              type="button"
                              onClick={() => setEditingGapId(gap.id)}
                              className="text-slate-400 hover:text-indigo-600 p-1 shrink-0 transition"
                              title="Edit suggested statement before applying"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Assessment & Competency Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                          {gap.suggestedCompetency && (
                            <div>
                              <span className="font-bold text-slate-700">Targeted Competency: </span>
                              <span>{gap.suggestedCompetency}</span>
                            </div>
                          )}
                          {gap.suggestedAssessmentMethod && (
                            <div>
                              <span className="font-bold text-slate-700">Recommended Evidence: </span>
                              <span>{gap.suggestedAssessmentMethod}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/40">
                          <strong>Pedagogical Rationale:</strong> {gap.rationale}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 5. TAB 2: FRAMEWORK OUTCOMES CHECKLIST GRID */}
          {activeTab === 'checklist' && analysisResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {analysisResult.frameworkName} Criteria Checklist
                  </h4>
                  <p className="text-slate-500 text-xs">
                    Comprehensive outcome-by-outcome audit showing which attributes are satisfied vs deficient.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {analysisResult.benchmarkCoverage.filter((b) => b.status === 'satisfied').length} of{' '}
                  {analysisResult.benchmarkCoverage.length} Criteria Fully Satisfied
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold">
                      <th className="p-3 border-r border-slate-200 w-24">Outcome</th>
                      <th className="p-3 border-r border-slate-200 min-w-[200px]">Criteria Title &amp; Description</th>
                      <th className="p-3 border-r border-slate-200 w-28 text-center">Required Tier</th>
                      <th className="p-3 border-r border-slate-200 w-28 text-center">Status</th>
                      <th className="p-3 border-r border-slate-200 min-w-[150px]">Mapped Course CLOs</th>
                      <th className="p-3 min-w-[160px]">Accreditation Audit Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysisResult.benchmarkCoverage.map((bench) => {
                      const statusBadge =
                        bench.status === 'satisfied'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : bench.status === 'partial'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300';

                      return (
                        <tr key={bench.outcomeCode} className="hover:bg-slate-50/70">
                          <td className="p-3 border-r border-slate-200 font-mono font-bold text-slate-900 align-top">
                            {bench.outcomeCode}
                          </td>
                          <td className="p-3 border-r border-slate-200 align-top">
                            <div className="font-bold text-slate-900 text-xs">{bench.outcomeTitle}</div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {bench.outcomeDescription}
                            </p>
                          </td>
                          <td className="p-3 border-r border-slate-200 text-center align-top font-bold text-slate-700">
                            {bench.requiredTier}
                          </td>
                          <td className="p-3 border-r border-slate-200 text-center align-top">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-2xs ${statusBadge}`}
                            >
                              {bench.status}
                            </span>
                          </td>
                          <td className="p-3 border-r border-slate-200 align-top">
                            {bench.mappedCLOs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {bench.mappedCLOs.map((m) => (
                                  <span
                                    key={m.cloCode}
                                    className="font-mono text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-bold"
                                  >
                                    {m.cloCode} (L{BLOOM_RANK[m.bloomLevel]})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-rose-600 font-bold text-[11px] italic">
                                Missing CLO Coverage
                              </span>
                            )}
                          </td>
                          <td className="p-3 align-top text-[11px] text-slate-600">
                            {bench.gapNotes || (
                              <span className="text-emerald-700 font-medium">Fully Satisfied in Course Blueprint</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. TAB 3: COGNITIVE TIERS & BLOOM DEPTH VISUALIZER */}
          {activeTab === 'cognitive_balance' && analysisResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900">
                  Bloom's Taxonomy Cognitive Intensity Distribution
                </h4>
                <p className="text-xs text-slate-500">
                  Accreditation standards (ABET, Washington Accord, HEC) require progressive cognitive rigor.
                </p>
              </div>

              {/* Cognitive Distribution Comparison Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Current Course Distribution ({course.clos?.length || 0} CLOs)</span>
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="flex items-center space-x-1 text-purple-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-purple-600"></span>
                      <span>HOTS (L5-L6): {analysisResult.cognitiveTiers.hots.percentage}%</span>
                    </span>
                    <span className="flex items-center space-x-1 text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                      <span>MOTS (L3-L4): {analysisResult.cognitiveTiers.mots.percentage}%</span>
                    </span>
                    <span className="flex items-center space-x-1 text-sky-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
                      <span>LOTS (L1-L2): {analysisResult.cognitiveTiers.lots.percentage}%</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${analysisResult.cognitiveTiers.hots.percentage}%` }}
                    className="h-full bg-purple-600 transition-all duration-500"
                    title={`HOTS: ${analysisResult.cognitiveTiers.hots.percentage}%`}
                  />
                  <div
                    style={{ width: `${analysisResult.cognitiveTiers.mots.percentage}%` }}
                    className="h-full bg-amber-500 transition-all duration-500"
                    title={`MOTS: ${analysisResult.cognitiveTiers.mots.percentage}%`}
                  />
                  <div
                    style={{ width: `${analysisResult.cognitiveTiers.lots.percentage}%` }}
                    className="h-full bg-sky-500 transition-all duration-500"
                    title={`LOTS: ${analysisResult.cognitiveTiers.lots.percentage}%`}
                  />
                </div>

                {/* Target Benchmark Line */}
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span>
                      Target Framework Benchmark: Minimum {analysisResult.cognitiveTiers.hots.targetPercentage}% Higher-Order Cognitive Skills
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    {analysisResult.cognitiveTiers.hots.percentage >=
                    analysisResult.cognitiveTiers.hots.targetPercentage
                      ? `✓ Cognitive depth benchmark satisfied! Current HOTS level (${analysisResult.cognitiveTiers.hots.percentage}%) exceeds standard minimum.`
                      : `⚠ Cognitive deficit detected! Current HOTS level (${analysisResult.cognitiveTiers.hots.percentage}%) is below the accredited minimum (${analysisResult.cognitiveTiers.hots.targetPercentage}%). Apply suggested Bloom elevation fixes to satisfy auditor requirements.`}
                  </p>
                </div>
              </div>

              {/* CLO Breakdown Table */}
              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-slate-800 text-xs">Course Learning Outcomes Cognitive Tiers:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.clos?.map((c) => {
                    const rank = BLOOM_RANK[c.bloomLevel] || 3;
                    const tier = rank >= 5 ? 'HOTS' : rank >= 3 ? 'MOTS' : 'LOTS';
                    const tierColor =
                      tier === 'HOTS'
                        ? 'bg-purple-50 border-purple-200 text-purple-900'
                        : tier === 'MOTS'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-sky-50 border-sky-200 text-sky-900';

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${tierColor}`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black">{c.code}</span>
                            <span className="font-bold">
                              L{rank} {c.bloomLevel} ({c.bloomVerb})
                            </span>
                          </div>
                          <p className="text-[11px] mt-1 line-clamp-2">{c.statement}</p>
                        </div>
                        <span className="font-mono font-black uppercase text-[10px] px-1.5 py-0.5 bg-white/70 rounded">
                          {tier}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER                                              */}
        {/* ========================================================= */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Actionable AI suggestions directly update course learning outcomes, Bloom taxonomy verbs, and competency matrices.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer shadow-xs"
          >
            Done &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
