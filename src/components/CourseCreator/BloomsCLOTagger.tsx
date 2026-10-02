import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Brain,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  BookOpen,
  Sliders,
  Check,
  Info,
  Compass,
} from 'lucide-react';
import { CLO, BloomLevel, CourseLevel, Course } from '../../types';
import { tagCLOBlooms, CLOTaggerResult } from '../../utils/bloomsTagger';
import { BLOOM_TAXONOMY_DATA } from './BloomsTaxonomyHelperModal';
import { tagCLOBloomsWithAI, AIBloomsTagResult } from '../../services/api';

interface BloomsCLOTaggerProps {
  clo: CLO;
  course: Course;
  onUpdateCLO: (id: string, updates: Partial<CLO>) => void;
  onOpenFullTaxonomy?: () => void;
  onOpenWheel?: () => void;
}

const LEVEL_COLORS: Record<
  BloomLevel,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    light: string;
  }
> = {
  Remember: {
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-800',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    accent: 'bg-slate-600',
    light: 'bg-slate-100/70',
  },
  Understand: {
    bg: 'bg-sky-50/70',
    border: 'border-sky-300',
    text: 'text-sky-900',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    accent: 'bg-sky-600',
    light: 'bg-sky-100/70',
  },
  Apply: {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    accent: 'bg-emerald-600',
    light: 'bg-emerald-100/70',
  },
  Analyze: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-300',
    text: 'text-amber-900',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    accent: 'bg-amber-600',
    light: 'bg-amber-100/70',
  },
  Evaluate: {
    bg: 'bg-rose-50/70',
    border: 'border-rose-300',
    text: 'text-rose-900',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    accent: 'bg-rose-600',
    light: 'bg-rose-100/70',
  },
  Create: {
    bg: 'bg-purple-50/70',
    border: 'border-purple-300',
    text: 'text-purple-900',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    accent: 'bg-purple-600',
    light: 'bg-purple-100/70',
  },
};

export const BloomsCLOTagger: React.FC<BloomsCLOTaggerProps> = ({
  clo,
  course,
  onUpdateCLO,
  onOpenFullTaxonomy,
  onOpenWheel,
}) => {
  const [showDepthDetails, setShowDepthDetails] = useState<boolean>(false);
  const [isDeepAuditing, setIsDeepAuditing] = useState<boolean>(false);
  const [aiAuditResult, setAiAuditResult] = useState<AIBloomsTagResult | null>(null);
  const [tagAppliedNotice, setTagAppliedNotice] = useState<string | null>(null);

  // Local instant deterministic tagger based on current statement
  const localTag = useMemo<CLOTaggerResult>(() => {
    return tagCLOBlooms(clo.statement, course.level, clo.bloomLevel);
  }, [clo.statement, course.level, clo.bloomLevel]);

  // Use AI audit result if available, otherwise local tagger
  const activeTag = aiAuditResult || localTag;

  // Check if current CLO tag matches the detected verb and level
  const isLevelMismatch = clo.bloomLevel !== activeTag.suggestedLevel;
  const isVerbMismatch =
    Boolean(activeTag.detectedVerb) &&
    (!clo.bloomVerb || (clo.bloomVerb || '').toLowerCase() !== (activeTag.detectedVerb || '').toLowerCase());
  const needsTagging = isLevelMismatch || isVerbMismatch;

  // Clear AI result when statement changes significantly
  useEffect(() => {
    setAiAuditResult(null);
  }, [clo.id]);

  // Handle 1-click apply suggested Bloom's Taxonomy tag
  const handleApplySuggestedTag = () => {
    onUpdateCLO(clo.id, {
      bloomVerb: activeTag.detectedVerb,
      bloomLevel: activeTag.suggestedLevel,
      qualityScore: Math.max(clo.qualityScore || 70, activeTag.measurabilityScore),
      status: activeTag.isMeasurable ? 'Validated' : 'Draft',
    });
    setTagAppliedNotice(`Tagged as ${activeTag.suggestedLevel} (${activeTag.detectedVerb})`);
    setTimeout(() => setTagAppliedNotice(null), 3500);
  };

  // Handle replacing vague verb with measurable alternative
  const handleSubstituteVerb = (substituteVerb: string, targetLevel?: BloomLevel) => {
    const vagueWord = localTag.vagueVerbIssue?.vagueVerb || 'understand';
    const regex = new RegExp(`\\b${vagueWord}\\b`, 'gi');
    const newStatement = clo.statement.replace(regex, substituteVerb);

    let levelToUse = targetLevel || activeTag.suggestedLevel;
    if (!targetLevel) {
      // Find level of substitute verb
      (Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).forEach((lvl) => {
        if (BLOOM_TAXONOMY_DATA[lvl].categories.some((c) => c.verbs.includes(substituteVerb))) {
          levelToUse = lvl;
        }
      });
    }

    onUpdateCLO(clo.id, {
      statement: newStatement,
      bloomVerb: substituteVerb,
      bloomLevel: levelToUse,
      qualityScore: Math.max(clo.qualityScore || 70, 88),
      status: 'Validated',
    });

    setTagAppliedNotice(`Substituted with "${substituteVerb}" • Level: ${levelToUse}`);
    setTimeout(() => setTagAppliedNotice(null), 3500);
  };

  // Handle elevating cognitive depth to a target HOTS level
  const handleElevateLevel = (targetLevel: BloomLevel, targetVerb: string) => {
    // Replace the first verb in the statement with target verb
    const trimmed = clo.statement.trim();
    let newStatement = trimmed;
    const parts = trimmed.split(/\s+/);
    if (parts.length > 0) {
      parts[0] = targetVerb;
      newStatement = parts.join(' ');
    } else {
      newStatement = `${targetVerb} relevant course concepts`;
    }

    onUpdateCLO(clo.id, {
      statement: newStatement,
      bloomVerb: targetVerb,
      bloomLevel: targetLevel,
      qualityScore: Math.max(clo.qualityScore || 75, 92),
      status: 'Validated',
    });

    setTagAppliedNotice(`Elevated to ${targetLevel} (Level ${BLOOM_TAXONOMY_DATA[targetLevel].number})`);
    setTimeout(() => setTagAppliedNotice(null), 3500);
  };

  // Run deep AI audit using Gemini
  const handleRunAIAudit = async () => {
    setIsDeepAuditing(true);
    try {
      const result = await tagCLOBloomsWithAI({
        statement: clo.statement,
        currentLevel: clo.bloomLevel,
        currentVerb: clo.bloomVerb,
        courseTitle: course.title,
        courseLevel: course.level,
        courseCategory: course.category,
      });
      setAiAuditResult(result);
    } catch (err) {
      console.warn('AI audit failed, relying on local tagger:', err);
    } finally {
      setIsDeepAuditing(false);
    }
  };

  const levelColor = LEVEL_COLORS[activeTag.suggestedLevel] || LEVEL_COLORS.Understand;
  const currentTagColor = LEVEL_COLORS[clo.bloomLevel] || LEVEL_COLORS.Understand;

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-4 shadow-2xs space-y-3.5">
      {/* Top Bar: Action Verb Tag & Suggested Cognitive Level */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>AI Bloom's Tagger:</span>
          </div>

          {/* Detected Verb Pill */}
          <div
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
              activeTag.isMeasurable
                ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Verb:</span>
            <span className="font-mono underline decoration-indigo-300">"{activeTag.detectedVerb}"</span>
            {!activeTag.isMeasurable && (
              <AlertTriangle className="w-3 h-3 text-rose-600 inline ml-0.5" />
            )}
          </div>

          {/* Suggested Cognitive Level Pill */}
          <div
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${levelColor.badgeBg} ${levelColor.badgeText} ${levelColor.border}`}
          >
            <span>Level {activeTag.levelNumber}: {activeTag.suggestedLevel}</span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-white/70 shadow-2xs">
              {activeTag.order}
            </span>
          </div>

          {/* Measurability Status Badge */}
          <div
            className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              activeTag.measurabilityVerdict === 'Directly Measurable'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : activeTag.measurabilityVerdict === 'Partially Measurable'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {activeTag.isMeasurable ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-rose-600" />
            )}
            <span>{activeTag.measurabilityVerdict}</span>
            <span className="font-mono text-[10px] opacity-75">({activeTag.measurabilityScore}%)</span>
          </div>
        </div>

        {/* Quick Actions Right */}
        <div className="flex items-center space-x-2 shrink-0">
          {needsTagging && (
            <button
              type="button"
              onClick={handleApplySuggestedTag}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs hover:shadow-xs transition cursor-pointer animate-pulse"
              title={`Update CLO level to ${activeTag.suggestedLevel} and verb to ${activeTag.detectedVerb}`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Apply Tag ({activeTag.suggestedLevel})</span>
            </button>
          )}

          {onOpenWheel && (
            <button
              type="button"
              onClick={onOpenWheel}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
              title="Open interactive Bloom's Taxonomy radial sunburst wheel"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <span>Bloom's Wheel</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRunAIAudit}
            disabled={isDeepAuditing}
            className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer disabled:opacity-50"
            title="Perform deep contextual AI cognitive check using Gemini"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isDeepAuditing ? 'animate-spin' : ''}`} />
            <span>{isDeepAuditing ? 'Auditing...' : 'AI Depth Audit'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDepthDetails(!showDepthDetails)}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition"
            title={showDepthDetails ? 'Hide cognitive ladder' : 'View cognitive depth ladder'}
          >
            {showDepthDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tag Applied Feedback Notice */}
      {tagAppliedNotice && (
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-1.5 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{tagAppliedNotice}</span>
        </div>
      )}

      {/* Accreditation Alert Banner: Non-Measurable Verb Detected */}
      {!activeTag.isMeasurable && (
        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2 text-xs">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Accreditation Notice: Non-Observable Action Verb ("{activeTag.detectedVerb}")
              </p>
              <p className="text-amber-900 mt-0.5 leading-relaxed">
                {activeTag.measurabilityFeedback}
              </p>
            </div>
          </div>

          {/* Quick 1-Click Measurable Substitutes */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-200/80">
            <span className="font-bold text-amber-900 text-[11px]">1-Click Measurable Substitutes:</span>
            {activeTag.vagueVerbIssue?.recommendedSubstitutes?.slice(0, 4).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => handleSubstituteVerb(sub)}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-[11px] shadow-2xs transition cursor-pointer hover:scale-105"
                title={`Replace "${activeTag.detectedVerb}" with observable verb "${sub}"`}
              >
                + Use "{sub}"
              </button>
            ))}
            {activeTag.suggestedRephrasedStatement && (
              <button
                type="button"
                onClick={() =>
                  onUpdateCLO(clo.id, {
                    statement: activeTag.suggestedRephrasedStatement!,
                    bloomVerb: activeTag.suggestedRephrasedStatement!.split(' ')[0],
                    qualityScore: 90,
                    status: 'Validated',
                  })
                }
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer ml-auto"
                title="Apply fully rephrased measurable statement"
              >
                Apply Rephrased Statement
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mismatch Warning between saved tag and detected verb */}
      {needsTagging && activeTag.isMeasurable && (
        <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-blue-950">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              Current Tag is <strong>{clo.bloomLevel} ({clo.bloomVerb || 'None'})</strong>, but outcome verb indicates{' '}
              <strong className="text-indigo-700">{activeTag.suggestedLevel} ({activeTag.detectedVerb})</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplySuggestedTag}
            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shrink-0 cursor-pointer shadow-2xs"
          >
            Align to {activeTag.suggestedLevel}
          </button>
        </div>
      )}

      {/* Interactive 6-Level Cognitive Depth Ladder */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center space-x-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>Cognitive Depth Ladder (Bloom's Revised Taxonomy):</span>
          </span>
          <span className="font-semibold text-slate-700">
            Course Target: {course.level || 'Undergraduate'} Level
          </span>
        </div>

        {/* 6-Level Visual Stepped Gauge */}
        <div className="grid grid-cols-6 gap-1.5">
          {(Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).map((lvl) => {
            const detail = BLOOM_TAXONOMY_DATA[lvl];
            const isSuggested = activeTag.suggestedLevel === lvl;
            const isSaved = clo.bloomLevel === lvl;
            const num = detail.number;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  onUpdateCLO(clo.id, {
                    bloomLevel: lvl,
                    bloomVerb: detail.categories[0].verbs[0],
                    qualityScore: Math.max(clo.qualityScore || 70, 85),
                  });
                }}
                className={`relative p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  isSuggested
                    ? 'border-indigo-500 bg-indigo-50/90 shadow-xs ring-2 ring-indigo-200'
                    : isSaved
                    ? 'border-slate-400 bg-slate-100 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400">L{num}</span>
                  <span
                    className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                      detail.order === 'HOTS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {detail.order}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">{lvl}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {detail.categories[0].verbs[0]}
                </div>

                {isSuggested && (
                  <div className="absolute -top-1.5 -right-1 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded-full shadow-2xs">
                    Verb Match
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Cognitive Depth Details & Elevation Tools */}
      {showDepthDetails && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-in fade-in">
          {/* Depth Appropriateness Feedback */}
          <div className="flex items-start space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">
                Cognitive Rigor Assessment for {course.level || 'Undergraduate'} Level:
              </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {activeTag.depthAppropriateness?.analysis ||
                  'Evaluated against institutional OBE taxonomy standards.'}
              </p>
            </div>
          </div>

          {/* Depth Elevator Options (HOTS Recommendations) */}
          {activeTag.elevateSuggestions && activeTag.elevateSuggestions.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                <span>Elevate Cognitive Depth (Higher-Order Thinking):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeTag.elevateSuggestions.map((el) => (
                  <div
                    key={el.targetLevel}
                    className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">
                        Elevate to {el.targetLevel} (L{BLOOM_TAXONOMY_DATA[el.targetLevel]?.number || 4})
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                        HOTS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{el.rationale}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {el.verbs.map((verb) => (
                        <button
                          key={verb}
                          type="button"
                          onClick={() => handleElevateLevel(el.targetLevel, verb)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-700 font-semibold text-[10px] transition cursor-pointer"
                        >
                          + {verb}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links to Wheel & Full Taxonomy */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            {onOpenWheel && (
              <button
                type="button"
                onClick={onOpenWheel}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold inline-flex items-center space-x-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>Open Interactive Bloom's Wheel &rarr;</span>
              </button>
            )}
            {onOpenFullTaxonomy && (
              <button
                type="button"
                onClick={onOpenFullTaxonomy}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center space-x-1 cursor-pointer ml-auto"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explore Full Taxonomy Matrix & Sentence Stems &rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
