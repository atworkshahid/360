import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Search,
  Check,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { BloomLevel } from '../../types';
import {
  BLOOM_TAXONOMY_DATA,
  VERBS_TO_AVOID,
  BloomLevelDetail,
} from './BloomsTaxonomyHelperModal';
import { BLOOM_ORDER, BLOOM_RANK } from '../../utils/assessmentAnalysis';

export interface BloomsTaxonomyInteractiveSelectorProps {
  targetType: 'CLO' | 'MLO';
  targetCode: string; // e.g. "CLO 1" or "MLO 2.1"
  statement: string;
  currentLevel: BloomLevel;
  currentVerb?: string;
  parentCLOLevel?: BloomLevel; // For MLO ceiling check
  parentCLOCode?: string;
  onSelectVerbAndLevel: (verb: string, level: BloomLevel, updatedStatement: string) => void;
  onSelectLevelOnly?: (level: BloomLevel) => void;
  onOpenFullModal?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const BloomsTaxonomyInteractiveSelector: React.FC<BloomsTaxonomyInteractiveSelectorProps> = ({
  targetType,
  targetCode,
  statement,
  currentLevel,
  currentVerb,
  parentCLOLevel,
  parentCLOCode,
  onSelectVerbAndLevel,
  onSelectLevelOnly,
  onOpenFullModal,
  className = '',
  defaultExpanded = true,
}) => {
  const [activeLevel, setActiveLevel] = useState<BloomLevel>(currentLevel || 'Apply');
  const [activeTab, setActiveTab] = useState<'verbs' | 'stems' | 'avoid'>('verbs');
  const [searchQuery, setSearchQuery] = useState('');
  const [justAppliedVerb, setJustAppliedVerb] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  // Synchronize internal level when prop changes
  useEffect(() => {
    if (currentLevel) {
      setActiveLevel(currentLevel);
    }
  }, [currentLevel]);

  const levelDetails: BloomLevelDetail =
    BLOOM_TAXONOMY_DATA[activeLevel] || BLOOM_TAXONOMY_DATA.Apply;

  // Cognitive ceiling check for MLO
  const activeRank = BLOOM_RANK[activeLevel] || 3;
  const parentRank = parentCLOLevel ? BLOOM_RANK[parentCLOLevel] || 3 : null;
  const isCeilingExceeded = parentRank !== null && activeRank > parentRank;

  // Detect if statement contains weak/vague verbs
  const detectedWeakVerb = useMemo(() => {
    if (!statement) return null;
    const lower = statement.toLowerCase().trim();
    return VERBS_TO_AVOID.find((item) => {
      const firstWord = (item.vagueVerb?.split(' ')[0] || '').toLowerCase();
      const regex = new RegExp(`^${firstWord}\\b|\\b${firstWord}\\b`, 'i');
      return regex.test(lower);
    });
  }, [statement]);

  // Filter verbs by search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return levelDetails.categories;
    }

    return levelDetails.categories
      .map((cat) => ({
        ...cat,
        verbs: cat.verbs.filter((v) => v.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.verbs.length > 0);
  }, [levelDetails, searchQuery]);

  // Function to apply a verb into the statement
  const handleApplyVerb = (verb: string) => {
    let newStatement = statement || '';
    const trimmed = newStatement.trim();

    if (trimmed.length > 0) {
      const parts = trimmed.split(/\s+/);
      // Replace the first word with the selected verb (capitalized)
      parts[0] = verb.charAt(0).toUpperCase() + verb.slice(1);
      newStatement = parts.join(' ');
    } else {
      // Empty statement: insert verb + space
      newStatement = `${verb} `;
    }

    onSelectVerbAndLevel(verb, activeLevel, newStatement);
    setJustAppliedVerb(verb);
    setTimeout(() => {
      setJustAppliedVerb(null);
    }, 2500);
  };

  // Function to switch level
  const handleLevelClick = (lvl: BloomLevel) => {
    setActiveLevel(lvl);
    if (onSelectLevelOnly) {
      onSelectLevelOnly(lvl);
    }
  };

  // Function to apply a sentence stem
  const handleApplyStem = (stemText: string) => {
    const parts = stemText.trim().split(/\s+/);
    const firstVerb = parts[0] || 'Analyze';
    onSelectVerbAndLevel(firstVerb, activeLevel, stemText);
    setJustAppliedVerb(firstVerb);
    setTimeout(() => {
      setJustAppliedVerb(null);
    }, 2500);
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-indigo-200/90 shadow-sm overflow-hidden transition-all ${className}`}
      id={`blooms-interactive-selector-${targetCode.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/70 border-b border-indigo-100 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">
                Bloom's Taxonomy Cognitive Selector &amp; Action Verbs
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  levelDetails.order === 'HOTS'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Level {levelDetails.number}: {activeLevel} ({levelDetails.order})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Select cognitive tier to automatically filter and inject measurable action verbs into the {targetType} statement.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
              title="Open full taxonomy handbook"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Taxonomy Guide</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title={isExpanded ? 'Collapse selector' : 'Expand selector'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Cognitive Ceiling Alert for MLO */}
          {targetType === 'MLO' && isCeilingExceeded && parentCLOCode && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Cognitive Ceiling Advisory:</span> MLO level is set to{' '}
                <strong>{activeLevel}</strong> (Rank {activeRank}), which exceeds parent outcome{' '}
                <strong>{parentCLOCode}</strong> at <strong>{parentCLOLevel}</strong> (Rank {parentRank}).
                In constructive alignment, modular outcomes typically scaffold up to the course outcome rather than surpassing it.
              </div>
            </div>
          )}

          {/* Vague Verb Warning in Statement */}
          {detectedWeakVerb && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Unmeasurable Verb Detected:</span> "{detectedWeakVerb.vagueVerb}" is non-observable and difficult to assess under accreditation audits.
                  <div className="text-[11px] text-rose-800 mt-0.5">
                    Suggested replacements for {activeLevel}:{' '}
                    <span className="font-semibold underline">
                      {detectedWeakVerb.suggestedMeasurableVerbs.slice(0, 4).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleApplyVerb(detectedWeakVerb.suggestedMeasurableVerbs[0] || 'Explain')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] shrink-0 transition cursor-pointer"
              >
                Auto-Fix to "{detectedWeakVerb.suggestedMeasurableVerbs[0] || 'Explain'}"
              </button>
            </div>
          )}

          {/* 1. Cognitive Levels Selector Tabs (L1 - L6) */}
          <div>
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Select Target Cognitive Level:
              </span>
              <span className="text-[10px] text-slate-500">
                Click a level to view aligned verbs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {BLOOM_ORDER.map((lvl) => {
                const data = BLOOM_TAXONOMY_DATA[lvl];
                const isSelected = activeLevel === lvl;
                const isCurrentCLO = parentCLOLevel === lvl;

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleLevelClick(lvl)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? `${data.bgLight} ${data.borderColor} ring-2 ring-indigo-600 shadow-sm font-bold`
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-slate-500">L{data.number}</span>
                      <span
                        className={`px-1 py-0.2 rounded font-extrabold uppercase text-[9px] ${
                          data.order === 'HOTS'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {data.order}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 mt-1 truncate">
                      {lvl}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span className="text-[10px] truncate">{data.categories[0]?.name.split(' ')[0] || ''}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      )}
                      {targetType === 'MLO' && isCurrentCLO && (
                        <span className="text-[9px] font-bold text-indigo-700" title="Parent CLO Level">
                          (CLO)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Level Guiding Rationale Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-bold text-slate-800">
                  {levelDetails.title} ({levelDetails.order === 'HOTS' ? 'Higher-Order Thinking Skill' : 'Lower-Order Thinking Skill'})
                </span>
              </div>
              <span className="text-slate-500 text-[10px]">
                Click any action verb below to automatically set statement prefix
              </span>
            </div>
            <p className="text-[11px] text-slate-600 italic">
              "{levelDetails.guidingQuestion}"
            </p>
          </div>

          {/* Quick Auto-Suggested Action Verbs for Selected Cognitive Level */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/80 border border-indigo-200/90 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <div className="flex items-center space-x-1.5 text-indigo-950 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Suggested {activeLevel} Action Verbs for {targetType} Statement:</span>
              </div>
              <span className="text-[10px] text-indigo-700 font-medium">
                1-click auto-inject into statement
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {levelDetails.categories.flatMap((c) => c.verbs).slice(0, 8).map((verb) => {
                const isCurrentActive = currentVerb?.toLowerCase() === verb.toLowerCase();
                return (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => handleApplyVerb(verb)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center space-x-1 shadow-2xs ${
                      isCurrentActive
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border-indigo-200 hover:border-indigo-600'
                    }`}
                    title={`Click to set ${targetCode} statement to start with active Bloom verb "${verb}"`}
                  >
                    <span>{verb}</span>
                    {isCurrentActive && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback banner after applying verb */}
          {justAppliedVerb && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Applied verb <strong>"{justAppliedVerb}"</strong> to {targetCode} statement! Synchronized cognitive level to <strong>{activeLevel}</strong>.
              </span>
            </div>
          )}

          {/* Sub-Tabs: Action Verbs vs Sentence Stems */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('verbs')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                    activeTab === 'verbs'
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Action Verbs ({levelDetails.categories.flatMap((c) => c.verbs).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('stems')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 ${
                    activeTab === 'stems'
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lightbulb className="w-3 h-3 text-amber-600" />
                  <span>Sentence Stems</span>
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative min-w-48">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeLevel} verbs...`}
                  className="w-full pl-7 pr-6 py-1 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* TAB: ACTION VERBS */}
            {activeTab === 'verbs' && (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {filteredCategories.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      {cat.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.verbs.map((verb) => {
                        const isCurrentActive =
                          currentVerb?.toLowerCase() === verb.toLowerCase();
                        return (
                          <button
                            key={verb}
                            type="button"
                            onClick={() => handleApplyVerb(verb)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer flex items-center space-x-1 ${
                              isCurrentActive
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                : 'bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 border-slate-200'
                            }`}
                            title={`Click to set ${targetCode} statement to begin with "${verb}"`}
                          >
                            <span>{verb}</span>
                            {isCurrentActive && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: SENTENCE STEMS */}
            {activeTab === 'stems' && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {levelDetails.sentenceStems.map((stemItem, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-200 transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">
                        {stemItem.context}
                      </span>
                      <p className="font-serif italic text-slate-800 text-xs">
                        "{stemItem.stem}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyStem(stemItem.stem)}
                      className="px-3 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 text-slate-700 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer flex items-center space-x-1"
                    >
                      <span>Insert Stem</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
