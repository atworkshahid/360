import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Brain, Zap, BookOpen } from 'lucide-react';
import { BloomLevel } from '../../types';
import { BLOOM_TAXONOMY_DATA } from './BloomsTaxonomyHelperModal';

// Define passive vs active verbs (simplified classification for this tool)
const PASSIVE_VERBS = new Set(['Define', 'List', 'Recognize', 'Recall', 'Name', 'State', 'Repeat', 'Cite', 'Label', 'Match']);
const ACTIVE_VERBS = new Set(['Analyze', 'Create', 'Design', 'Evaluate', 'Formulate', 'Construct', 'Apply', 'Implement', 'Develop', 'Solve', 'Debate', 'Hypothesize']);

interface BloomsVerbLookupProps {
  initialLevel?: BloomLevel;
  onSelectVerb?: (verb: string, level: BloomLevel) => void;
}

export const BloomsVerbLookup: React.FC<BloomsVerbLookupProps> = ({ initialLevel = 'Remember', onSelectVerb }) => {
  const [selectedLevel, setSelectedLevel] = useState<BloomLevel>(initialLevel);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [learningStyle, setLearningStyle] = useState<'active' | 'all'>('all');

  const levelData = BLOOM_TAXONOMY_DATA[selectedLevel];

  const filteredVerbs = useMemo(() => {
    let verbs = levelData.categories.flatMap((cat) => cat.verbs);
    
    if (learningStyle === 'active') {
      verbs = verbs.filter(v => ACTIVE_VERBS.has(v) || !PASSIVE_VERBS.has(v));
    }
    
    if (searchQuery.trim()) {
      verbs = verbs.filter((verb) => verb.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return verbs;
  }, [levelData, searchQuery, learningStyle]);

  const copyToClipboard = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-600" />
          Bloom's Verb Lookup
        </h3>
        <button
          onClick={() => setLearningStyle(prev => prev === 'active' ? 'all' : 'active')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition ${
            learningStyle === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {learningStyle === 'active' ? <Zap className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
          {learningStyle === 'active' ? 'Active Only' : 'All Styles'}
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
        {Object.keys(BLOOM_TAXONOMY_DATA).map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level as BloomLevel)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedLevel === level
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search verbs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto">
        {filteredVerbs.map((verb) => (
          <button
            key={verb}
            onClick={() => {
              copyToClipboard(verb);
              if (onSelectVerb) onSelectVerb(verb, selectedLevel);
            }}
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-xs text-slate-700 transition"
          >
            {verb}
            {copiedVerb === verb ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
