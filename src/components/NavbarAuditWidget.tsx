import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { Course, CourseAuditReport } from '../types';

interface NavbarAuditWidgetProps {
  auditReport: CourseAuditReport;
  course?: Course | null;
  onJumpToAudit: () => void;
  onAskCopilot?: (prompt: string) => void;
}

export const NavbarAuditWidget: React.FC<NavbarAuditWidgetProps> = ({
  auditReport,
  course,
  onJumpToAudit,
  onAskCopilot,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'issues'>('explanation');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  // Calculate outcome alignment percentage within the course structure
  const alignmentScore = useMemo(() => {
    if (!auditReport) return 0;
    const cat = auditReport.categoryScores;
    if (cat && (cat.cloPloMapping !== undefined || cat.assessmentCoverage !== undefined)) {
      const cloPlo = cat.cloPloMapping ?? 0;
      const assess = cat.assessmentCoverage ?? 0;
      const mlo = cat.mloAlignment ?? 0;
      const rubrics = cat.rubricAlignment ?? 0;
      return Math.round(cloPlo * 0.35 + assess * 0.35 + mlo * 0.15 + rubrics * 0.15);
    }
    return auditReport.healthScore || 0;
  }, [auditReport]);

  const isBelowThreshold = alignmentScore < 70 || auditReport.healthScore < 70;
  const isCritical = alignmentScore < 50 || auditReport.criticalCount > 0;

  // Recharts donut ring data
  const pieData = useMemo(() => {
    const clampedScore = Math.max(0, Math.min(100, alignmentScore));
    return [
      { name: 'Aligned', value: clampedScore },
      { name: 'Unmapped', value: 100 - clampedScore },
    ];
  }, [alignmentScore]);

  // Color mapping based on score
  const ringColor = useMemo(() => {
    if (alignmentScore >= 85) return '#10b981'; // Emerald
    if (alignmentScore >= 70) return '#6366f1'; // Indigo
    if (alignmentScore >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Rose
  }, [alignmentScore]);

  // Extract specific missing elements from gaps
  const missingElements = useMemo(() => {
    if (!auditReport.gaps || auditReport.gaps.length === 0) {
      return [];
    }
    return auditReport.gaps.slice(0, 4);
  }, [auditReport.gaps]);

  const handleFixWithCopilot = () => {
    setPopoverOpen(false);
    if (onAskCopilot) {
      onAskCopilot(
        `Help me resolve the mapping gaps in this course. We currently have ${auditReport.criticalCount} critical gaps and an outcome alignment score of ${alignmentScore}%. Suggest how to align unmapped CLOs with assessments and modules according to OBE best practices.`
      );
    }
  };

  return (
    <div className="relative hidden lg:flex items-center gap-5" ref={popoverRef}>
      {/* Course Completion Progress */}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Progress
          </span>
          <span className="text-xs font-bold text-indigo-600">
            {auditReport.completionPercentage}%
          </span>
        </div>
        <div className="w-28 sm:w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${auditReport.completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="h-7 w-[1px] bg-slate-200" />

      {/* Outcome Alignment Ring Chart (Recharts) */}
      <div className="flex items-center gap-2">
        <div
          onClick={() => setPopoverOpen((prev) => !prev)}
          className="relative flex items-center justify-center cursor-pointer group"
          title={`Outcome Alignment: ${alignmentScore}% - Click for OBE gap analysis`}
        >
          <PieChart width={38} height={38}>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={12}
              outerRadius={18}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={ringColor} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
          <span className="absolute text-[10px] font-extrabold text-slate-800 tracking-tighter">
            {alignmentScore}%
          </span>
        </div>

        {/* Alignment Label + Context Tooltip Button */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Alignment
            </span>
            <button
              type="button"
              id="navbar-audit-tooltip-trigger"
              onClick={() => setPopoverOpen((prev) => !prev)}
              className="text-slate-400 hover:text-indigo-600 transition cursor-pointer p-0.5"
              aria-label="What are mapping gaps and how to resolve them"
              title="Explain mapping gaps and OBE resolution guidelines"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <span
            className="text-xs font-bold cursor-pointer hover:underline"
            style={{ color: ringColor }}
            onClick={onJumpToAudit}
            title="Click to jump to Stage 13 Alignment Audit"
          >
            {alignmentScore >= 85 ? 'Optimized' : alignmentScore >= 70 ? 'Aligned' : 'Action Needed'}
          </span>
        </div>
      </div>

      {/* Visual Alert / Highlight Indicator when Alignment Score drops below 70% */}
      {isBelowThreshold && (
        <button
          type="button"
          id="navbar-audit-low-alignment-alert"
          onClick={() => {
            setActiveTab('issues');
            setPopoverOpen(true);
          }}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shadow-2xs transition cursor-pointer ${
            isCritical
              ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100/90 animate-pulse'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100/90'
          }`}
          title="Alignment score below 70% threshold. Click to view specific missing elements and resolution steps."
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCritical ? 'bg-rose-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isCritical ? 'bg-rose-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-bold">
            {isCritical ? 'Critical Gaps' : '< 70% Alert'}
          </span>
        </button>
      )}

      {/* Gaps Count Badge */}
      <button
        onClick={onJumpToAudit}
        className={`flex flex-col items-center transition cursor-pointer text-center px-1.5 py-0.5 rounded-lg hover:bg-slate-100 ${
          auditReport.criticalCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'
        }`}
        title="View all detected curriculum gaps in Stage 13 Audit"
      >
        <span className="text-[10px] text-slate-400 font-bold uppercase">Gaps</span>
        <span className="text-sm font-bold flex items-center gap-0.5">
          {auditReport.criticalCount > 0 && <AlertCircle className="w-3 h-3 text-rose-500" />}
          {auditReport.criticalCount}
        </span>
      </button>

      {/* Context-Aware Tooltip & Popover Guide */}
      {popoverOpen && (
        <div
          id="navbar-audit-context-popover"
          className="absolute right-0 top-12 z-50 w-96 max-w-[90vw] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Popover Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: ringColor }}
                >
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  OBE Alignment & Mapping Gaps
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Current Alignment: <strong className="text-slate-800">{alignmentScore}%</strong> • Health Score:{' '}
                <strong className="text-slate-800">{auditReport.healthScore}/100</strong>
              </p>
            </div>
            <button
              onClick={() => setPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-100 mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('explanation')}
              className={`flex-1 py-1.5 text-xs font-semibold border-b-2 text-center transition ${
                activeTab === 'explanation'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              What are Mapping Gaps?
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('issues')}
              className={`flex-1 py-1.5 text-xs font-semibold border-b-2 text-center transition flex items-center justify-center space-x-1 ${
                activeTab === 'issues'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Current Issues</span>
              {auditReport.criticalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {auditReport.criticalCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Context-Aware Explanation & Best Practice Guidelines */}
          {activeTab === 'explanation' && (
            <div className="py-3 space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
                <p className="font-semibold text-indigo-950 mb-1">
                  Definition in Outcome-Based Education (OBE):
                </p>
                <p className="text-indigo-900 leading-relaxed text-[11px]">
                  A <strong>mapping gap</strong> occurs when a Course Learning Outcome (CLO) lacks direct assessment evidence or corresponding modular instruction. In John Biggs' <em>Constructive Alignment</em>, learning objectives, instructional delivery, and evaluation must form an unbroken chain.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">
                  How to Resolve Based on OBE Best Practices:
                </p>
                <ul className="space-y-2 text-slate-600 text-[11px]">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>1. Assessment Triangulation:</strong> Map each CLO to at least one formative and one summative assessment in <em>Stage 9 (Assessment Designer)</em>.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>2. Cognitive Level Harmony:</strong> Ensure assessment tasks mirror the Bloom's cognitive verb (e.g., an 'Evaluate' outcome requires rubric criteria, not just recall tests).
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>3. Modular Linking:</strong> Every instructional module in <em>Stage 5</em> should explicitly target at least one active CLO.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>4. Evidence Rules (Stage 12):</strong> Specify minimum benchmark thresholds (e.g., 60%) to prove student competency.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Specific Missing Elements */}
          {activeTab === 'issues' && (
            <div className="py-3 space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {missingElements.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-800 text-xs">No Critical Gaps Found!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your course maintains robust constructive alignment across all outcomes and assessments.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Focus on these elements to raise alignment above 70%:
                  </p>
                  <div className="space-y-2">
                    {missingElements.map((gap, idx) => (
                      <div
                        key={gap.id || idx}
                        className={`p-2.5 rounded-xl border text-[11px] ${
                          gap.severity === 'Critical'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                            : 'bg-amber-50/70 border-amber-200 text-amber-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>{gap.title}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                              gap.severity === 'Critical'
                                ? 'bg-rose-200 text-rose-800'
                                : 'bg-amber-200 text-amber-800'
                            }`}
                          >
                            {gap.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-snug">{gap.message}</p>
                        {gap.recommendation && (
                          <div className="mt-1 pt-1 border-t border-slate-200/60 text-slate-700 font-medium">
                            <span className="text-slate-500">Fix:</span> {gap.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleFixWithCopilot}
              className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask Copilot to Fix</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPopoverOpen(false);
                onJumpToAudit();
              }}
              className="flex-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
            >
              <span>View Audit (Stage 13)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
