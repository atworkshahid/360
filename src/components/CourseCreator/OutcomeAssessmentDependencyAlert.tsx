import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  Zap,
  Check,
  RotateCw,
  Clock,
  Layers,
  BarChart2,
  Target,
  FileText,
  X,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { Course, BloomLevel } from '../../types';
import {
  detectDependencyConflicts,
  resolveDependencyIssue,
  DependencyIssue,
  DependencyAuditReport,
} from '../../utils/dependencyConflictDetector';

interface OutcomeAssessmentDependencyAlertProps {
  course: Course;
  onChange: (updatedCourse: Course) => void;
  mode?: 'banner' | 'card' | 'compact';
  onNavigateToStep?: (stepIndex: number) => void;
  className?: string;
  initialExpanded?: boolean;
}

export const OutcomeAssessmentDependencyAlert: React.FC<OutcomeAssessmentDependencyAlertProps> = ({
  course,
  onChange,
  mode = 'card',
  onNavigateToStep,
  className = '',
  initialExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);
  const [activeFilter, setActiveFilter] = useState<'all' | 'circular' | 'conflict' | 'critical'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [fixedNotice, setFixedNotice] = useState<string | null>(null);

  // Compute dependency report live
  const report: DependencyAuditReport = useMemo(() => {
    return detectDependencyConflicts(course);
  }, [course]);

  const filteredIssues = useMemo(() => {
    switch (activeFilter) {
      case 'circular':
        return report.circularIssues;
      case 'conflict':
        return report.conflictIssues;
      case 'critical':
        return report.issues.filter((i) => i.severity === 'critical');
      default:
        return report.issues;
    }
  }, [report, activeFilter]);

  const handleAutoFix = (issue: DependencyIssue) => {
    const updated = resolveDependencyIssue(course, issue);
    onChange(updated);
    setFixedNotice(`Successfully applied: ${issue.autoFixLabel || 'Resolution'}`);
    setTimeout(() => setFixedNotice(null), 3500);
  };

  // If clean and mode is compact, render subtle green status chip
  if (report.summaryStatus === 'clean') {
    if (mode === 'compact') {
      return (
        <div
          id="dep-alert-clean-compact"
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Outcome &amp; Assessment Dependencies: Validated (0 Cycles / 0 Conflicts)</span>
        </div>
      );
    }

    if (mode === 'banner') {
      return (
        <div
          id="dep-alert-clean-banner"
          className={`p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-900 ${className}`}
        >
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Constructive Dependency Check:</strong> No circular or conflicting dependencies detected between outcomes and assessments.
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
            Health: 100%
          </span>
        </div>
      );
    }
  }

  // BANNER MODE (High visibility alert at top of steps)
  if (mode === 'banner') {
    const isCritical = report.hasCircularDependency || report.criticalCount > 0;

    return (
      <div
        id="outcome-assessment-dependency-banner"
        className={`rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
          isCritical
            ? 'bg-rose-50/90 border-rose-300 text-rose-950'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        } ${className}`}
      >
        {/* Banner Bar */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {report.hasCircularDependency ? (
                <RotateCw className="w-5 h-5 animate-spin" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {report.hasCircularDependency
                    ? 'Critical Circular Dependency Warning'
                    : 'Conflicting Dependency Warning'}
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isCritical ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {report.totalIssuesCount} Issue{report.totalIssuesCount > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {report.hasCircularDependency
                  ? `${report.circularIssues.length} circular outcome-assessment loop(s) detected causing pedagogical deadlocks.`
                  : `${report.totalIssuesCount} conflicting dependency relationship(s) between learning outcomes and assessment instruments.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              id="btn-toggle-dep-details"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                isCritical
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <span>{isExpanded ? 'Hide Trace' : 'Inspect Issues'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Breakdown in Banner */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-rose-200/60 bg-white/60 space-y-3">
            {/* Quick resolution toast */}
            {fixedNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                <span>{fixedNotice}</span>
                <Check className="w-4 h-4 text-emerald-700" />
              </div>
            )}

            <div className="space-y-2.5">
              {report.issues.slice(0, 3).map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.type === 'circular-dependency' ? 'Circular Cycle' : 'Conflict'}
                      </span>
                      <h4 className="font-bold text-slate-900">{issue.title}</h4>
                    </div>

                    {issue.autoFixAvailable && (
                      <button
                        type="button"
                        onClick={() => handleAutoFix(issue)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{issue.autoFixLabel || 'Auto-Fix'}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-slate-600 leading-relaxed">{issue.description}</p>

                  {/* Circular Trace Path Visualizer */}
                  {issue.cyclePath && issue.cyclePath.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-rose-900 shrink-0">Deadlock Loop:</span>
                      {issue.cyclePath.map((node, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-rose-300 font-semibold text-slate-800 shadow-2xs">
                            {node}
                          </span>
                          {i < issue.cyclePath!.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {report.issues.length > 3 && (
              <p className="text-center text-[11px] text-slate-500 font-medium">
                Showing 3 of {report.issues.length} issues. Switch to Audit view to inspect all.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // CARD / FULL AUDIT MODE
  return (
    <div
      id="outcome-assessment-dependency-card"
      className={`rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Dependency Integrity &amp; Cycle Auditor</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            Outcome ➔ Assessment Dependency Diagnostics
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Verifies that relationships between Course Learning Outcomes (CLOs) and Assessment Instruments
            are pedagogically aligned, chronologically valid, and free of circular prerequisite deadlocks.
          </p>
        </div>

        {/* Live Integrity Score Pill */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Dependency Score
            </span>
            <span
              className={`text-2xl font-bold font-serif ${
                report.healthScore >= 90
                  ? 'text-emerald-600'
                  : report.healthScore >= 70
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {report.healthScore}%
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white ${
              report.healthScore >= 90
                ? 'bg-emerald-600'
                : report.healthScore >= 70
                ? 'bg-amber-600'
                : 'bg-rose-600'
            }`}
          >
            {report.healthScore >= 90 ? (
              <Check className="w-6 h-6" />
            ) : report.hasCircularDependency ? (
              <RotateCw className="w-6 h-6 animate-spin" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100 bg-slate-50/50 text-center">
        <div className="p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Issues</span>
          <span className="text-base font-bold text-slate-900">{report.totalIssuesCount}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-bold text-rose-600 uppercase block">Circular Loops</span>
          <span className="text-base font-bold text-rose-700">{report.circularIssues.length}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">Conflicts</span>
          <span className="text-base font-bold text-amber-700">{report.conflictIssues.length}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Critical Errors</span>
          <span className="text-base font-bold text-rose-700">{report.criticalCount}</span>
        </div>
      </div>

      {/* Filter Tabs & Notice */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Findings ({report.issues.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('circular')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'circular'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>Circular Loops ({report.circularIssues.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('conflict')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'conflict'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Conflicts ({report.conflictIssues.length})</span>
          </button>
        </div>

        {fixedNotice && (
          <div className="px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            <span>{fixedNotice}</span>
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="p-5 space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-slate-800">No issues found in this category.</p>
            <p className="text-xs text-slate-400">All outcome and assessment dependency constraints are satisfied.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isSelected = selectedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                className={`p-4 rounded-xl border transition-all duration-150 ${
                  issue.severity === 'critical'
                    ? 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
                    : 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          issue.severity === 'critical'
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200">
                        {issue.type.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{issue.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {issue.autoFixAvailable && (
                      <button
                        type="button"
                        onClick={() => handleAutoFix(issue)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                        title={issue.autoFixLabel}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>{issue.autoFixLabel || 'Apply Auto-Fix'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedIssueId(isSelected ? null : issue.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      {isSelected ? 'Less Info' : 'Inspect Trace'}
                    </button>
                  </div>
                </div>

                {/* Circular Path Diagram / Visual Trace */}
                {issue.cyclePath && issue.cyclePath.length > 0 && (
                  <div className="mt-3.5 p-3 rounded-xl bg-white border border-rose-200 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-900">
                      <RotateCw className="w-3.5 h-3.5 text-rose-600" />
                      <span>Circular Dependency Flow Diagram:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {issue.cyclePath.map((nodeLabel, idx) => {
                        const isLast = idx === issue.cyclePath!.length - 1;
                        const isCLO = nodeLabel.toLowerCase().includes('clo') || nodeLabel.toLowerCase().includes('outcome');

                        return (
                          <React.Fragment key={idx}>
                            <div
                              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 shadow-2xs ${
                                isLast
                                  ? 'bg-rose-100 border-rose-300 text-rose-900 ring-2 ring-rose-400'
                                  : isCLO
                                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                              }`}
                            >
                              {isCLO ? (
                                <Target className="w-3 h-3 text-blue-600 shrink-0" />
                              ) : (
                                <FileText className="w-3 h-3 text-indigo-600 shrink-0" />
                              )}
                              <span>{nodeLabel}</span>
                              {isLast && (
                                <span className="text-[9px] uppercase px-1 rounded bg-rose-600 text-white font-black">
                                  Loop
                                </span>
                              )}
                            </div>

                            {!isLast && (
                              <ArrowRight className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expanded Pedagogical Diagnosis & Recommendation */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Pedagogical &amp; Accreditation Impact:
                      </span>
                      <p className="text-slate-600 leading-relaxed">{issue.pedagogicalImpact}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Accreditation Action Plan:
                      </span>
                      <p className="text-slate-600 leading-relaxed">{issue.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Guidance */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>OBE360™ Constructive Scaffolding:</strong> Continuous verification runs automatically whenever learning outcomes or assessments are modified.
          </span>
        </div>
        {onNavigateToStep && (
          <button
            type="button"
            onClick={() => onNavigateToStep(7)} // Step 08 Assessment Plan
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Go to Assessment Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
