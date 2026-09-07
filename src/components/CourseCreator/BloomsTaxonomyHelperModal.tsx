import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Copy,
  Brain,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Layers,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { BloomLevel, CLO } from '../../types';

export interface BloomLevelDetail {
  level: BloomLevel;
  number: number;
  order: 'LOTS' | 'HOTS'; // Lower-Order or Higher-Order Thinking Skills
  title: string;
  actionSummary: string;
  guidingQuestion: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  bgLight: string;
  accentBg: string;
  categories: {
    name: string;
    verbs: string[];
  }[];
  sentenceStems: {
    stem: string;
    context: string;
  }[];
}

export const BLOOM_TAXONOMY_DATA: Record<BloomLevel, BloomLevelDetail> = {
  Remember: {
    level: 'Remember',
    number: 1,
    order: 'LOTS',
    title: 'Knowledge & Recall',
    actionSummary: 'Retrieve, recognize, and recall relevant knowledge, facts, and definitions from memory.',
    guidingQuestion: 'Can the learner recall, identify, or reproduce foundational concepts and terminology?',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    borderColor: 'border-slate-300',
    bgLight: 'bg-slate-50',
    accentBg: 'bg-slate-700',
    categories: [
      {
        name: 'Recall & Recognition',
        verbs: ['Define', 'Identify', 'List', 'Name', 'Recall', 'Recognize', 'Reproduce', 'State', 'Record', 'Repeat', 'Retrieve'],
      },
      {
        name: 'Locating & Specification',
        verbs: ['Cite', 'Describe', 'Label', 'Locate', 'Match', 'Outline', 'Recite', 'Select', 'Tabulate', 'Enumerate', 'Quote'],
      },
    ],
    sentenceStems: [
      { stem: 'Recall and state standard principles and operational definitions of...', context: 'Foundational Knowledge' },
      { stem: 'Identify and list critical statutory parameters and specifications for...', context: 'Technical Standards' },
      { stem: 'Define key terminology and reproduce baseline frameworks used in...', context: 'Conceptual Basics' },
    ],
  },
  Understand: {
    level: 'Understand',
    number: 2,
    order: 'LOTS',
    title: 'Comprehension & Interpretation',
    actionSummary: 'Construct meaning from instructional messages; explain concepts, classify data, and summarize findings.',
    guidingQuestion: 'Can the learner explain ideas, restate mechanisms in their own words, or compare patterns?',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    borderColor: 'border-sky-300',
    bgLight: 'bg-sky-50/60',
    accentBg: 'bg-sky-600',
    categories: [
      {
        name: 'Explanation & Interpretation',
        verbs: ['Explain', 'Interpret', 'Summarize', 'Paraphrase', 'Clarify', 'Translate', 'Illustrate', 'Express', 'Restate', 'Elucidate'],
      },
      {
        name: 'Classification & Comparison',
        verbs: ['Classify', 'Categorize', 'Compare', 'Contrast', 'Exemplify', 'Predict', 'Infer', 'Discuss', 'Distinguish', 'Indicate'],
      },
    ],
    sentenceStems: [
      { stem: 'Explain the theoretical mechanisms and systemic interactions governing...', context: 'System Understanding' },
      { stem: 'Compare and contrast distinct methodological approaches to...', context: 'Comparative Analysis' },
      { stem: 'Interpret quantitative representations and graphical data showing...', context: 'Data Interpretation' },
    ],
  },
  Apply: {
    level: 'Apply',
    number: 3,
    order: 'HOTS',
    title: 'Application & Execution',
    actionSummary: 'Carry out or use a procedure in a given situation; execute calculations, models, and workflows.',
    guidingQuestion: 'Can the learner utilize methods, formulas, or standard procedures to solve a concrete problem?',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    bgLight: 'bg-emerald-50/60',
    accentBg: 'bg-emerald-600',
    categories: [
      {
        name: 'Computation & Execution',
        verbs: ['Apply', 'Calculate', 'Compute', 'Demonstrate', 'Execute', 'Implement', 'Solve', 'Operate', 'Manipulate', 'Administer'],
      },
      {
        name: 'Practical Utilization',
        verbs: ['Employ', 'Modify', 'Practice', 'Prepare', 'Utilize', 'Show', 'Produce', 'Simulate', 'Program', 'Adapt', 'Deploy'],
      },
    ],
    sentenceStems: [
      { stem: 'Apply standard computational algorithms and mathematical proofs to solve...', context: 'Quantitative Execution' },
      { stem: 'Implement and execute functional workflows or prototypes addressing...', context: 'Hands-on Implementation' },
      { stem: 'Demonstrate the safe and compliant operation of specialized tools in...', context: 'Procedural Rigor' },
    ],
  },
  Analyze: {
    level: 'Analyze',
    number: 4,
    order: 'HOTS',
    title: 'Analysis & Deconstruction',
    actionSummary: 'Break material into constituent parts and determine how parts relate to one another and the overall purpose.',
    guidingQuestion: 'Can the learner distinguish causes, dissect complexities, detect patterns, or isolate root factors?',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50/60',
    accentBg: 'bg-amber-600',
    categories: [
      {
        name: 'Deconstruction & Diagnostics',
        verbs: ['Analyze', 'Differentiate', 'Discriminate', 'Distinguish', 'Deconstruct', 'Dissect', 'Examine', 'Scrutinize', 'Troubleshoot'],
      },
      {
        name: 'Structuring & Investigation',
        verbs: ['Correlate', 'Diagram', 'Integrate', 'Organize', 'Test', 'Investigate', 'Breakdown', 'Trace', 'Audit', 'Inspect', 'Isolate'],
      },
    ],
    sentenceStems: [
      { stem: 'Analyze empirical performance logs to diagnose systemic failure modes in...', context: 'Root Cause Diagnostics' },
      { stem: 'Differentiate between conflicting stakeholder requirements and technical trade-offs in...', context: 'Requirements Analysis' },
      { stem: 'Investigate the sensitivity and boundary limitations of models under...', context: 'Experimental Analysis' },
    ],
  },
  Evaluate: {
    level: 'Evaluate',
    number: 5,
    order: 'HOTS',
    title: 'Evaluation & Appraisal',
    actionSummary: 'Make judgments based on criteria and standards; critique, defend, appraise, and verify validity.',
    guidingQuestion: 'Can the learner assess credibility, justify trade-offs, critique solutions, or defend a strategic decision?',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    borderColor: 'border-rose-300',
    bgLight: 'bg-rose-50/60',
    accentBg: 'bg-rose-600',
    categories: [
      {
        name: 'Appraisal & Verification',
        verbs: ['Evaluate', 'Assess', 'Critique', 'Judge', 'Appraise', 'Defend', 'Justify', 'Validate', 'Verify', 'Measure', 'Rate'],
      },
      {
        name: 'Benchmarking & Recommendation',
        verbs: ['Argue', 'Conclude', 'Benchmark', 'Dispute', 'Prioritize', 'Rank', 'Recommend', 'Decide', 'Audit', 'Referee'],
      },
    ],
    sentenceStems: [
      { stem: 'Evaluate competing architectural proposals against rigorous sustainability and cost benchmarks to justify...', context: 'Comparative Evaluation' },
      { stem: 'Critique and defend ethical, statutory, and safety compliance considerations during...', context: 'Compliance Defense' },
      { stem: 'Assess the statistical validity and confidence intervals of experimental findings in...', context: 'Verification & Audit' },
    ],
  },
  Create: {
    level: 'Create',
    number: 6,
    order: 'HOTS',
    title: 'Synthesis & Creation',
    actionSummary: 'Put elements together to form a coherent whole; reorganize elements into a new pattern, design, or architecture.',
    guidingQuestion: 'Can the learner design, synthesize, formulate, or originate novel solutions for open-ended problems?',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    borderColor: 'border-purple-300',
    bgLight: 'bg-purple-50/60',
    accentBg: 'bg-purple-600',
    categories: [
      {
        name: 'Design & Engineering',
        verbs: ['Design', 'Create', 'Construct', 'Formulate', 'Develop', 'Engineer', 'Compose', 'Invent', 'Originate', 'Architect', 'Program'],
      },
      {
        name: 'Synthesis & Innovation',
        verbs: ['Synthesize', 'Propose', 'Assemble', 'Build', 'Conceptualize', 'Generate', 'Hypothesize', 'Plan', 'Integrate', 'Author'],
      },
    ],
    sentenceStems: [
      { stem: 'Design and synthesize a fault-tolerant system architecture satisfying specified constraints including...', context: 'Engineering Capstone' },
      { stem: 'Formulate an integrated strategic policy framework addressing multifaceted challenges in...', context: 'Strategic Synthesis' },
      { stem: 'Develop an original empirical model or simulation framework capable of predicting...', context: 'Novel Development' },
    ],
  },
};

export const VERBS_TO_AVOID: Array<{
  vagueVerb: string;
  problem: string;
  recommendedSubstitutes: string[];
}> = [
  {
    vagueVerb: 'Understand',
    problem: 'Internal mental state that cannot be directly observed, measured, or audited with empirical proof.',
    recommendedSubstitutes: ['Explain', 'Analyze', 'Interpret', 'Demonstrate', 'Classify'],
  },
  {
    vagueVerb: 'Know / Have knowledge of',
    problem: 'Subjective and passive; lacks demonstrable criteria for grading or assessment rubrics.',
    recommendedSubstitutes: ['Identify', 'Recall', 'Define', 'List', 'State'],
  },
  {
    vagueVerb: 'Learn / Study',
    problem: 'Refers to the process of studying rather than the resulting demonstrable competency.',
    recommendedSubstitutes: ['Apply', 'Execute', 'Solve', 'Implement', 'Formulate'],
  },
  {
    vagueVerb: 'Appreciate',
    problem: 'Affective disposition; cannot be scored on a standardized objective scale.',
    recommendedSubstitutes: ['Evaluate', 'Critique', 'Assess', 'Justify', 'Appraise'],
  },
  {
    vagueVerb: 'Be familiar with',
    problem: 'Ambiguous threshold; provides no guidance on required mastery depth.',
    recommendedSubstitutes: ['Describe', 'Outline', 'Summarize', 'Differentiate'],
  },
  {
    vagueVerb: 'Comprehend',
    problem: 'Synonym for understand; non-actionable in an OBE assessment setting.',
    recommendedSubstitutes: ['Paraphrase', 'Illustrate', 'Compare', 'Explain'],
  },
  {
    vagueVerb: 'Gain insight into',
    problem: 'Metaphorical; accreditation boards require concrete student performance outputs.',
    recommendedSubstitutes: ['Investigate', 'Examine', 'Scrutinize', 'Diagnose'],
  },
];

interface BloomsTaxonomyHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLevel?: BloomLevel;
  targetCLO?: CLO | null;
  onSelectVerb?: (verb: string, level: BloomLevel) => void;
  onApplyStem?: (stem: string, level: BloomLevel) => void;
  onOpenWheel?: () => void;
}

export const BloomsTaxonomyHelperModal: React.FC<BloomsTaxonomyHelperModalProps> = ({
  isOpen,
  onClose,
  selectedLevel = 'Analyze',
  targetCLO,
  onSelectVerb,
  onApplyStem,
  onOpenWheel,
}) => {
  const [activeLevel, setActiveLevel] = useState<BloomLevel>(selectedLevel);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'verbs' | 'templates' | 'avoid'>('verbs');
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Sync activeLevel with selectedLevel prop when modal opens or prop changes
  React.useEffect(() => {
    if (selectedLevel) {
      setActiveLevel(selectedLevel);
    }
  }, [selectedLevel, isOpen]);

  const levelInfo = BLOOM_TAXONOMY_DATA[activeLevel] || BLOOM_TAXONOMY_DATA.Analyze;

  // Search across all verbs or filter current level
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const results: Array<{ verb: string; level: BloomLevel; category: string }> = [];
    (Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).forEach((lvl) => {
      const data = BLOOM_TAXONOMY_DATA[lvl];
      data.categories.forEach((cat) => {
        cat.verbs.forEach((v) => {
          if (v.toLowerCase().includes(query)) {
            results.push({ verb: v, level: lvl, category: cat.name });
          }
        });
      });
    });
    return results;
  }, [searchQuery]);

  const handleCopyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 1800);
  };

  const handleApplyVerb = (verb: string, level: BloomLevel) => {
    if (onSelectVerb) {
      onSelectVerb(verb, level);
      setAppliedFeedback(`Applied "${verb}" (${level})`);
      setTimeout(() => setAppliedFeedback(null), 2200);
    } else {
      handleCopyVerb(verb);
    }
  };

  const handleApplyStem = (stem: string, level: BloomLevel) => {
    if (onApplyStem) {
      onApplyStem(stem, level);
      setAppliedFeedback(`Template inserted!`);
      setTimeout(() => setAppliedFeedback(null), 2200);
    } else {
      navigator.clipboard.writeText(stem);
      setCopiedVerb(stem);
      setTimeout(() => setCopiedVerb(null), 1800);
    }
  };

  if (!isOpen) return null;

  const levelsList: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Bloom's Taxonomy Helper
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                  Accreditation Aligned
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Select a cognitive domain level to explore and apply measurable OBE action verbs to learning outcomes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {appliedFeedback && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                ✓ {appliedFeedback}
              </span>
            )}
            {onOpenWheel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWheel();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold shadow-2xs transition cursor-pointer"
                title="Switch to interactive Bloom's Taxonomy radial sunburst wheel"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>Interactive Wheel</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CLO Context Banner (if writing an active CLO) */}
        {targetCLO && (
          <div className="px-6 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-xs font-bold text-indigo-900 shrink-0">Writing Target:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 text-[11px] font-extrabold shrink-0">
                {targetCLO.code || 'CLO'}
              </span>
              <span className="text-xs text-indigo-800 truncate max-w-md italic">
                "{targetCLO.statement}"
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-indigo-700">
              <span>Current: <strong className="font-semibold">{targetCLO.bloomVerb || 'None'}</strong> ({targetCLO.bloomLevel})</span>
            </div>
          </div>
        )}

        {/* Navigation & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Sub-tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('verbs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'verbs'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Action Verbs</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Outcome Stems</span>
            </button>
            <button
              onClick={() => setActiveTab('avoid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'avoid'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Verbs to Avoid</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verbs (e.g. analyze, design)..."
              className="w-full pl-9 pr-7 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Cognitive Level Tabs (L1 to L6) */}
        {!searchQuery && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 flex items-center space-x-2 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Cognitive Level:
            </span>
            {levelsList.map((lvl) => {
              const info = BLOOM_TAXONOMY_DATA[lvl];
              const isActive = activeLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    L{info.number}
                  </span>
                  <span>{lvl}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-semibold uppercase ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : info.order === 'HOTS'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {info.order}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Global Search Results View */}
          {searchResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Search Results for "{searchQuery}" ({searchResults.length} matches)
                </h4>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Clear Search
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-semibold">No action verbs found matching "{searchQuery}".</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try searching for common root verbs like "solve", "design", "evaluate", or check the "Verbs to Avoid" guide.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                          {item.verb}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{item.category}</p>
                      <div className="flex items-center space-x-1 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleApplyVerb(item.verb, item.level)}
                          className="flex-1 py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Apply</span>
                        </button>
                        <button
                          onClick={() => handleCopyVerb(item.verb)}
                          className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                          title="Copy verb to clipboard"
                        >
                          {copiedVerb === item.verb ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'verbs' ? (
            /* TAB 1: Action Verbs by Category for active level */
            <div className="space-y-6">
              {/* Level Overview Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${levelInfo.borderColor} ${levelInfo.bgLight} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-900 text-white">
                      LEVEL {levelInfo.number}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {levelInfo.level}: {levelInfo.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelInfo.badgeBg} ${levelInfo.badgeText}`}>
                      {levelInfo.order === 'HOTS' ? 'Higher-Order Thinking (HOTS)' : 'Lower-Order Thinking (LOTS)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {levelInfo.actionSummary}
                  </p>
                  <p className="text-[11px] text-slate-600 italic pt-0.5">
                    <strong>Guiding Question:</strong> "{levelInfo.guidingQuestion}"
                  </p>
                </div>

                <div className="shrink-0 flex sm:flex-col gap-2">
                  <div className="text-[11px] text-slate-500 bg-white/80 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200">
                    <span className="font-semibold block text-slate-700">Accreditation Focus:</span>
                    {levelInfo.order === 'HOTS'
                      ? 'Ideal for Capstone & Advanced CLOs'
                      : 'Essential for Foundations & Introductory Units'}
                  </div>
                </div>
              </div>

              {/* Categorized Verb Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {levelInfo.categories.map((cat, catIdx) => (
                  <div
                    key={catIdx}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h5 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{cat.name}</span>
                      </h5>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {cat.verbs.length} action verbs
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cat.verbs.map((verb) => (
                        <div
                          key={verb}
                          className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition text-slate-800 text-xs font-semibold overflow-hidden group shadow-2xs"
                        >
                          <button
                            onClick={() => handleApplyVerb(verb, levelInfo.level)}
                            className="px-2.5 py-1.5 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
                            title={`Apply "${verb}" (${levelInfo.level}) to active CLO`}
                          >
                            <span>{verb}</span>
                          </button>
                          <button
                            onClick={() => handleCopyVerb(verb)}
                            className="px-1.5 py-1.5 border-l border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Copy verb"
                          >
                            {copiedVerb === verb ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Formula Reminder */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div className="text-xs text-indigo-950 space-y-0.5">
                  <span className="font-bold flex items-center space-x-1 text-indigo-900">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                    <span>The OBE Learning Outcome Formula:</span>
                  </span>
                  <p className="text-[11px] text-indigo-800">
                    <strong className="text-indigo-950">[Observable Bloom Verb]</strong> + [Disciplinary Subject / Concept] + [Professional Context / Standard] + [in order to / Purpose]
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center space-x-1 shrink-0 ml-3"
                >
                  <span>View Stems</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : activeTab === 'templates' ? (
            /* TAB 2: Outcome Stems & Templates */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Accreditation-Compliant Outcome Stems ({levelInfo.level} - Level {levelInfo.number})
                </h4>
                <p className="text-xs text-slate-600">
                  Click "Insert Template" to load an ABET & Washington Accord aligned sentence framework into your active outcome statement.
                </p>
              </div>

              <div className="space-y-3">
                {levelInfo.sentenceStems.map((stemObj, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {stemObj.context}
                        </span>
                        <span className="text-[10px] text-slate-400">Bloom {levelInfo.level}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 font-serif italic">
                        "{stemObj.stem}"
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleApplyStem(stemObj.stem, levelInfo.level)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Insert Template</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(stemObj.stem);
                          setCopiedVerb(stemObj.stem);
                          setTimeout(() => setCopiedVerb(null), 1800);
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                        title="Copy stem text"
                      >
                        {copiedVerb === stemObj.stem ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cross-level sample stems */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Other Cognitive Level Stems
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {levelsList
                    .filter((lvl) => lvl !== activeLevel)
                    .slice(0, 4)
                    .map((lvl) => {
                      const otherInfo = BLOOM_TAXONOMY_DATA[lvl];
                      const firstStem = otherInfo.sentenceStems[0];
                      return (
                        <div
                          key={lvl}
                          onClick={() => setActiveLevel(lvl)}
                          className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer text-left space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              Level {otherInfo.number}: {lvl}
                            </span>
                            <span className="text-[10px] text-indigo-600 font-semibold">Switch Level →</span>
                          </div>
                          <p className="text-[11px] text-slate-600 italic line-clamp-2">
                            "{firstStem.stem}"
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 3: Verbs to Avoid (Accreditation Non-Compliance) */
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Why Certain Verbs Fail Accreditation Audits</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  International outcome-based education bodies (Washington Accord, ABET, CDIO, NBA) require learning outcomes to be <strong>directly demonstrable</strong> through student artifacts. Verbs expressing passive, internal states (such as "understand" or "know") cannot be scored reliably on performance rubrics.
                </p>
              </div>

              <div className="space-y-3">
                {VERBS_TO_AVOID.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded line-through">
                          {item.vagueVerb}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Non-measurable</span>
                      </div>
                      <p className="text-xs text-slate-600">{item.problem}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Use Instead:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.recommendedSubstitutes.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              // Find level of sub
                              let foundLvl: BloomLevel = 'Analyze';
                              (Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).forEach((l) => {
                                if (BLOOM_TAXONOMY_DATA[l].categories.some((c) => c.verbs.includes(sub))) {
                                  foundLvl = l;
                                }
                              });
                              handleApplyVerb(sub, foundLvl);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                            title={`Adopt "${sub}"`}
                          >
                            <span>{sub}</span>
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Clicking any verb applies it directly to your CLO</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
