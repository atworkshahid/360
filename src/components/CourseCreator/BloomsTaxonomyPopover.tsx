import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Search,
  Check,
  Maximize2,
  X,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { BloomLevel } from '../../types';
import { BLOOM_TAXONOMY_DATA } from './BloomsTaxonomyHelperModal';

interface BloomsTaxonomyPopoverProps {
  currentLevel: BloomLevel;
  currentVerb?: string;
  onSelectVerb: (verb: string, level: BloomLevel) => void;
  onOpenFullModal: () => void;
}

export const BloomsTaxonomyPopover: React.FC<BloomsTaxonomyPopoverProps> = ({
  currentLevel,
  currentVerb,
  onSelectVerb,
  onOpenFullModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<BloomLevel>(currentLevel || 'Analyze');
  const [filterQuery, setFilterQuery] = useState('');
  const [appliedVerb, setAppliedVerb] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync active level when currentLevel changes
  useEffect(() => {
    if (currentLevel) {
      setActiveLevel(currentLevel);
    }
  }, [currentLevel]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const levelData = BLOOM_TAXONOMY_DATA[activeLevel] || BLOOM_TAXONOMY_DATA.Analyze;

  const levels: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  // All verbs for active level
  const allVerbsForLevel = React.useMemo(() => {
    const list: string[] = [];
    levelData.categories.forEach((cat) => {
      cat.verbs.forEach((v) => {
        if (!list.includes(v)) list.push(v);
      });
    });
    return list;
  }, [levelData]);

  // Filtered verbs
  const displayedVerbs = React.useMemo(() => {
    if (!filterQuery.trim()) return allVerbsForLevel;
    const q = filterQuery.toLowerCase();
    return allVerbsForLevel.filter((v) => v.toLowerCase().includes(q));
  }, [allVerbsForLevel, filterQuery]);

  const handleVerbClick = (verb: string) => {
    onSelectVerb(verb, activeLevel);
    setAppliedVerb(verb);
    setTimeout(() => {
      setAppliedVerb(null);
    }, 1600);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Popover Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 hover:border-indigo-300'
        }`}
        title="Open Bloom's Taxonomy Helper to suggest action verbs based on cognitive level"
      >
        <Brain className={`w-3.5 h-3.5 ${isOpen ? 'text-white' : 'text-indigo-600'}`} />
        <span>Bloom's Helper</span>
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">
                Action Verbs for {activeLevel} (L{levelData.number})
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullModal();
                }}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-200/60 transition cursor-pointer"
                title="Expand Full Bloom's Taxonomy Guide & Templates"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/60 transition cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Level Switcher Pills */}
          <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 overflow-x-auto flex items-center space-x-1 scrollbar-none">
            {levels.map((lvl) => {
              const info = BLOOM_TAXONOMY_DATA[lvl];
              const isActive = activeLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setActiveLevel(lvl);
                    setFilterQuery('');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span>L{info.number} {lvl}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={`Search ${activeLevel} verbs...`}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Verb List */}
          <div className="p-3 max-h-56 overflow-y-auto space-y-2">
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Click a verb to apply directly:</span>
              <span className="font-semibold text-indigo-700">
                {levelData.order === 'HOTS' ? 'Higher-Order (HOTS)' : 'Foundational (LOTS)'}
              </span>
            </div>

            {appliedVerb && (
              <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold flex items-center space-x-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Applied "{appliedVerb}" to outcome!</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {displayedVerbs.map((verb) => {
                const isCurrent = currentVerb?.toLowerCase() === verb.toLowerCase();
                return (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => handleVerbClick(verb)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                        : 'bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-800 border-slate-200'
                    }`}
                  >
                    {verb}
                  </button>
                );
              })}
              {displayedVerbs.length === 0 && (
                <div className="w-full py-4 text-center text-xs text-slate-400">
                  No matching verbs in {activeLevel}.
                </div>
              )}
            </div>
          </div>

          {/* Popover Footer */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenFullModal();
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Lightbulb className="w-3 h-3 text-indigo-500" />
              <span>Full Guide & Outcome Stems →</span>
            </button>

            <span className="text-slate-400">
              Bloom Level {levelData.number}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
