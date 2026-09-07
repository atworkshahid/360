import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  Search,
  Check,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Layers,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { BloomLevel, CLO, Course } from '../../types';
import {
  BLOOM_TAXONOMY_DATA,
  VERBS_TO_AVOID,
  BloomLevelDetail,
} from './BloomsTaxonomyHelperModal';

export interface BloomsInteractiveReferenceProps {
  selectedCLO?: CLO | null;
  course?: Course;
  onSelectVerb: (verb: string, level: BloomLevel) => void;
  onApplyStem?: (stem: string, level: BloomLevel) => void;
  onOpenFullModal?: () => void;
  compact?: boolean;
}

export const BloomsInteractiveReference: React.FC<BloomsInteractiveReferenceProps> = ({
  selectedCLO,
  course,
  onSelectVerb,
  onApplyStem,
  onOpenFullModal,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'verbs' | 'stems' | 'avoid' | 'distribution'>('verbs');
  const [activeLevel, setActiveLevel] = useState<BloomLevel>(selectedCLO?.bloomLevel || 'Analyze');
  const [searchQuery, setSearchQuery] = useState('');
  const [justAppliedVerb, setJustAppliedVerb] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Sync active level if selected CLO changes
  React.useEffect(() => {
    if (selectedCLO?.bloomLevel) {
      setActiveLevel(selectedCLO.bloomLevel);
    }
  }, [selectedCLO?.id, selectedCLO?.bloomLevel]);

  const levelDetails = BLOOM_TAXONOMY_DATA[activeLevel] || BLOOM_TAXONOMY_DATA.Analyze;
  const levels: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  // Calculate course-wide Bloom level distribution
  const distribution = useMemo(() => {
    const counts: Record<BloomLevel, number> = {
      Remember: 0,
      Understand: 0,
      Apply: 0,
      Analyze: 0,
      Evaluate: 0,
      Create: 0,
    };
    (course?.clos || []).forEach((clo) => {
      if (counts[clo.bloomLevel] !== undefined) {
        counts[clo.bloomLevel]++;
      }
    });

    const total = (course?.clos || []).length;
    const hotsCount = counts.Apply + counts.Analyze + counts.Evaluate + counts.Create;
    const hotsPercent = total > 0 ? Math.round((hotsCount / total) * 100) : 0;

    return { counts, total, hotsCount, hotsPercent };
  }, [course?.clos]);

  // Filter verbs
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

  // Global search match across ALL levels if searching
  const globalSearchMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || q.length < 2) return null;

    const matches: Array<{ level: BloomLevel; verb: string; category: string }> = [];
    levels.forEach((lvl) => {
      const data = BLOOM_TAXONOMY_DATA[lvl];
      data.categories.forEach((cat) => {
        cat.verbs.forEach((v) => {
          if (v.toLowerCase().includes(q)) {
            matches.push({ level: lvl, verb: v, category: cat.name });
          }
        });
      });
    });
    return matches;
  }, [searchQuery, levels]);

  const handleVerbClick = (verb: string, level: BloomLevel) => {
    onSelectVerb(verb, level);
    setActiveLevel(level);
    setJustAppliedVerb(verb);
    setTimeout(() => setJustAppliedVerb(null), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden transition-all">
      {/* Header Bar with Toggle & Fullscreen Modal Link */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/60 border-b border-indigo-100 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">
                Bloom's Taxonomy Interactive Reference
              </span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
                Active: {activeLevel} (L{levelDetails.number})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Select verified action verbs to ensure observable, accreditation-compliant learning outcomes.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
              title="Open full taxonomy guide with extensive definitions"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Guide</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
            title={isExpanded ? 'Collapse reference panel' : 'Expand reference panel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-3.5">
          {/* Internal Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('verbs')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'verbs'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Action Verbs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stems')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'stems'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Sentence Stems</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('avoid')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'avoid'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Verbs to Avoid</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('distribution')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'distribution'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>HOTS Balance ({distribution.hotsPercent}%)</span>
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative min-w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verbs (e.g., analyze, design)..."
                className="w-full pl-8 pr-7 py-1 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Level Switcher (6 Cognitive Tiers) */}
          {activeTab !== 'distribution' && activeTab !== 'avoid' && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {levels.map((lvl) => {
                  const data = BLOOM_TAXONOMY_DATA[lvl];
                  const isSelected = activeLevel === lvl;
                  const isCurrentCLOLevel = selectedCLO?.bloomLevel === lvl;
                  const cloCountAtLevel = distribution.counts[lvl] || 0;

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setActiveLevel(lvl);
                        if (selectedCLO && isSelected) {
                          // Already on this level
                        }
                      }}
                      className={`p-2 rounded-xl text-left border transition relative cursor-pointer ${
                        isSelected
                          ? `${data.bgLight} ${data.borderColor} ring-2 ring-indigo-500 shadow-2xs`
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400">L{data.number}</span>
                        <span
                          className={`text-[9px] font-bold px-1 rounded uppercase ${
                            data.order === 'HOTS'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {data.order}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                        {lvl}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span>{cloCountAtLevel} CLO{cloCountAtLevel === 1 ? '' : 's'}</span>
                        {isCurrentCLOLevel && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" title="Target for this CLO"></span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Guiding Question & Action Summary for Active Level */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">
                    {levelDetails.title} ({levelDetails.order === 'HOTS' ? 'Higher-Order Thinking' : 'Lower-Order Thinking'})
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Click any verb below to auto-insert into CLO statement
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "{levelDetails.guidingQuestion}"
                </p>
              </div>
            </div>
          )}

          {/* Feedback banner after applying verb */}
          {justAppliedVerb && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                Applied <strong>"{justAppliedVerb}"</strong> to {selectedCLO?.code || 'CLO'} statement and synchronized Bloom level to <strong>{activeLevel}</strong>!
              </span>
            </div>
          )}

          {/* TAB 1: ACTION VERBS */}
          {activeTab === 'verbs' && (
            <div className="space-y-3">
              {/* Global search results if multi-level query matches */}
              {globalSearchMatches && globalSearchMatches.length > 0 && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                    <span>Search matches across all Bloom levels ({globalSearchMatches.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {globalSearchMatches.map((m, idx) => (
                      <button
                        key={`${m.level}-${m.verb}-${idx}`}
                        type="button"
                        onClick={() => handleVerbClick(m.verb, m.level)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-indigo-200 hover:bg-indigo-600 hover:text-white text-indigo-900 transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title={`Apply "${m.verb}" (${m.level} - ${m.category})`}
                      >
                        <span className="font-bold">{m.verb}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 uppercase font-black">
                          {m.level.slice(0, 3)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized Verb Pills for Active Level */}
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.name}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          {category.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {category.verbs.length} verbs
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {category.verbs.map((verb) => {
                          const isSelected = selectedCLO?.bloomVerb?.toLowerCase() === verb.toLowerCase();
                          return (
                            <button
                              key={verb}
                              type="button"
                              onClick={() => handleVerbClick(verb, activeLevel)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs font-bold'
                                  : 'bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 border-slate-200'
                              }`}
                              title={`Click to set Bloom verb to "${verb}" and inject into CLO statement`}
                            >
                              <span>{verb}</span>
                              {isSelected && <Check className="w-3 h-3 ml-1 inline text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No verbs found matching "{searchQuery}" in {activeLevel}. Try clearing the search or selecting another Bloom level above.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SENTENCE STEMS */}
          {activeTab === 'stems' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-600">
                Ready-made accreditation sentence templates formulated for <strong>{activeLevel} (Level {levelDetails.number})</strong>. Click to replace or populate statement.
              </div>

              <div className="space-y-2">
                {levelDetails.sentenceStems.map((stemObj, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          {stemObj.context}
                        </span>
                        <span className="text-[10px] text-slate-400">Bloom {activeLevel}</span>
                      </div>
                      <p className="text-slate-800 font-medium italic">
                        "{stemObj.stem}"
                      </p>
                    </div>

                    {onApplyStem && (
                      <button
                        type="button"
                        onClick={() => onApplyStem(stemObj.stem, activeLevel)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Adopt this stem into the current outcome statement"
                      >
                        <span>Adopt Stem</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VERBS TO AVOID */}
          {activeTab === 'avoid' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Why do accreditation boards reject subjective verbs?</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Words like "understand" or "know" describe internal mental processes rather than demonstrable behaviors. Outcome-Based Education requires observable performance criteria that can be assessed and proven.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {VERBS_TO_AVOID.map((item) => (
                  <div
                    key={item.vagueVerb}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-300 transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-600 line-through">
                        {item.vagueVerb}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                        Avoid
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-tight">
                      {item.problem}
                    </p>

                    <div className="pt-1.5 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        Measurable Substitutes:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.recommendedSubstitutes.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              // Find level for substitute
                              let subLevel: BloomLevel = 'Analyze';
                              levels.forEach((lvl) => {
                                if (BLOOM_TAXONOMY_DATA[lvl].categories.some((c) => c.verbs.includes(sub))) {
                                  subLevel = lvl;
                                }
                              });
                              handleVerbClick(sub, subLevel);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-semibold border border-slate-200 hover:border-indigo-300 transition cursor-pointer"
                            title={`Replace with observable verb "${sub}"`}
                          >
                            + {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DISTRIBUTION & HOTS BALANCE */}
          {activeTab === 'distribution' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900">
                      Course Bloom Taxonomy Progression & HOTS Ratio
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Distribution of the {distribution.total} enrolled CLOs across cognitive difficulty levels.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-indigo-600">
                      {distribution.hotsPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      HOTS Balance
                    </span>
                  </div>
                </div>

                {/* Progress bar of Bloom levels */}
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                  {levels.map((lvl) => {
                    const count = distribution.counts[lvl];
                    const pct = distribution.total > 0 ? (count / distribution.total) * 100 : 0;
                    if (pct === 0) return null;

                    const colorMap: Record<BloomLevel, string> = {
                      Remember: 'bg-slate-400',
                      Understand: 'bg-sky-500',
                      Apply: 'bg-emerald-500',
                      Analyze: 'bg-amber-500',
                      Evaluate: 'bg-rose-500',
                      Create: 'bg-purple-500',
                    };

                    return (
                      <div
                        key={lvl}
                        style={{ width: `${pct}%` }}
                        className={`${colorMap[lvl]} h-full transition-all`}
                        title={`${lvl} (L${BLOOM_TAXONOMY_DATA[lvl].number}): ${count} CLOs (${Math.round(pct)}%)`}
                      />
                    );
                  })}
                </div>

                {/* Breakdown Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                  {levels.map((lvl) => {
                    const count = distribution.counts[lvl];
                    const data = BLOOM_TAXONOMY_DATA[lvl];
                    return (
                      <div key={lvl} className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block">
                          L{data.number} {lvl}
                        </span>
                        <span className="text-sm font-black text-slate-800">
                          {count}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          {data.order}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-start space-x-2">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Accreditation Best Practice:</strong> Undergraduate upper-division and graduate courses should target at least <strong>60% to 75% HOTS</strong> (Apply, Analyze, Evaluate, Create) to ensure sufficient rigor and alignment with professional competencies.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
