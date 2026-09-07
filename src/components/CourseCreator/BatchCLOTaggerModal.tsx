import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  TrendingUp,
  Layers,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Course, CLO, BloomLevel } from '../../types';
import { batchTagCourseCLOs } from '../../utils/bloomsTagger';
import { batchTagCLOsWithAI } from '../../services/api';
import { BLOOM_TAXONOMY_DATA } from './BloomsTaxonomyHelperModal';

interface BatchCLOTaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onUpdateCourse: (updates: Partial<Course>) => void;
}

export const BatchCLOTaggerModal: React.FC<BatchCLOTaggerModalProps> = ({
  isOpen,
  onClose,
  course,
  onUpdateCourse,
}) => {
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [selectedCLOIds, setSelectedCLOIds] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute batch tags locally
  const batchSummary = React.useMemo(() => {
    return batchTagCourseCLOs(course.clos, course.level);
  }, [course.clos, course.level]);

  // Pre-select all items that have a tag mismatch or unmeasurable verb
  useEffect(() => {
    if (isOpen) {
      const initialSelected = new Set<string>();
      batchSummary.taggedItems.forEach((item) => {
        if (item.shouldUpdate) {
          initialSelected.add(item.clo.id);
        }
      });
      setSelectedCLOIds(initialSelected);
      setSuccessMessage(null);
    }
  }, [isOpen, batchSummary]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedCLOIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCLOIds(next);
  };

  const handleSelectAll = () => {
    if (selectedCLOIds.size === course.clos.length) {
      setSelectedCLOIds(new Set());
    } else {
      setSelectedCLOIds(new Set(course.clos.map((c) => c.id)));
    }
  };

  const handleApplySelectedTags = () => {
    const updatedCLOs = course.clos.map((clo) => {
      if (!selectedCLOIds.has(clo.id)) return clo;

      const item = batchSummary.taggedItems.find((t) => t.clo.id === clo.id);
      if (!item) return clo;

      const tag = item.tag;
      let newStatement = clo.statement;
      if (!tag.isMeasurable && tag.suggestedRephrasedStatement) {
        newStatement = tag.suggestedRephrasedStatement;
      }

      return {
        ...clo,
        statement: newStatement,
        bloomVerb: tag.detectedVerb,
        bloomLevel: tag.suggestedLevel,
        qualityScore: Math.max(clo.qualityScore || 70, tag.measurabilityScore),
        status: tag.isMeasurable ? ('Validated' as const) : clo.status,
      };
    });

    onUpdateCourse({ clos: updatedCLOs });
    setSuccessMessage(`Successfully updated Bloom tags for ${selectedCLOIds.size} CLO(s)!`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-700/80 border border-indigo-500 shadow-inner">
              <Brain className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">AI Bloom's Taxonomy Batch Tagger</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/50 text-indigo-100 border border-indigo-400/30">
                  OBE Cognitive Depth Auditor
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Automatically scans action verbs across all course outcomes, aligns cognitive levels, and alerts on non-measurable phrasing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cognitive Balance Summary Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* LOTS vs HOTS breakdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cognitive Depth Rigor</span>
              </span>
              <span className="text-indigo-900 font-bold">
                {batchSummary.hotsPercentage}% HOTS / {batchSummary.lotsPercentage}% LOTS
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="bg-indigo-600 h-full transition-all"
                style={{ width: `${batchSummary.hotsPercentage}%` }}
                title={`HOTS (Analyze, Evaluate, Create): ${batchSummary.hotsPercentage}%`}
              />
              <div
                className="bg-sky-400 h-full transition-all"
                style={{ width: `${batchSummary.lotsPercentage}%` }}
                title={`LOTS (Remember, Understand, Apply): ${batchSummary.lotsPercentage}%`}
              />
            </div>
            <p className="text-[11px] text-slate-500">{batchSummary.balanceVerdict}</p>
          </div>

          {/* Cognitive Levels Mini Distribution */}
          <div className="space-y-1">
            <span className="font-semibold text-slate-700">Level Breakdown:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(batchSummary.distribution) as BloomLevel[]).map((lvl) => {
                const count = batchSummary.distribution[lvl];
                const detail = BLOOM_TAXONOMY_DATA[lvl];
                return (
                  <span
                    key={lvl}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                      count > 0
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    L{detail.number} {lvl}: <span className="text-indigo-600">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Accreditation Measurability Status */}
          <div className="space-y-1">
            <span className="font-semibold text-slate-700">Accreditation Audit:</span>
            <div className="flex items-center space-x-2">
              {batchSummary.unmeasurableCount > 0 ? (
                <div className="flex items-center space-x-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{batchSummary.unmeasurableCount} outcome(s) have vague verbs</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>All verbs 100% measurable</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate">{batchSummary.balanceAdvice}</p>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Table of Outcomes with Detected Tags */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="flex items-center justify-between text-xs pb-1">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              {selectedCLOIds.size === course.clos.length ? 'Deselect All' : 'Select All Mismatches & Outliers'}
            </button>
            <span className="text-slate-500">
              {selectedCLOIds.size} of {course.clos.length} outcome(s) selected for tagging
            </span>
          </div>

          <div className="space-y-2.5">
            {batchSummary.taggedItems.map(({ clo, tag, isTagMismatch, shouldUpdate }) => {
              const isSelected = selectedCLOIds.has(clo.id);

              return (
                <div
                  key={clo.id}
                  onClick={() => handleToggleSelect(clo.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left: Checkbox, Code & Statement */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(clo.id)}
                      className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {clo.code}
                        </span>
                        {!tag.isMeasurable && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Vague: "{tag.detectedVerb}"</span>
                          </span>
                        )}
                        {isTagMismatch && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Tag Mismatch
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-snug line-clamp-2">{clo.statement}</p>
                    </div>
                  </div>

                  {/* Right: Current vs Suggested Tag */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    {/* Current Tag */}
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Current</div>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {clo.bloomLevel}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                    {/* Suggested AI Tag */}
                    <div className="text-left">
                      <div className="text-[10px] text-indigo-600 uppercase font-bold">Suggested</div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center space-x-1 ${
                          tag.order === 'HOTS'
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                            : 'bg-sky-50 text-sky-900 border-sky-200'
                        }`}
                      >
                        <span>{tag.suggestedLevel}</span>
                        <span className="text-[10px] opacity-75">("{tag.detectedVerb}")</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplySelectedTags}
            disabled={selectedCLOIds.size === 0}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Apply Suggested Bloom Tags to {selectedCLOIds.size} CLO(s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
