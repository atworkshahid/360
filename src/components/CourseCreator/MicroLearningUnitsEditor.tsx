import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Bot,
  Sliders,
  Check,
  RotateCcw,
  Info,
} from 'lucide-react';
import { WeeklyCoursePlanItem, MicroLearningUnit, BloomLevel } from '../../types';
import {
  ensureWeeklyMicroUnits,
  updateMicroUnitInWeek,
  synthesize4MicroUnits,
  setWeeklyMicroUnits,
  MICRO_LEARNING_PRESETS,
  MicroLearningArchetype,
  buildCopilotMicroUnitsPrompt,
} from '../../utils/microLearningHelper';

interface MicroLearningUnitsEditorProps {
  week: WeeklyCoursePlanItem;
  onChange: (updatedWeek: WeeklyCoursePlanItem) => void;
  defaultExpanded?: boolean;
  onAskCopilot?: (prompt: string) => void;
  courseTitle?: string;
  courseLevel?: string;
  linkedCLOCodes?: string[];
}

const BLOOM_LEVELS: BloomLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

const DELIVERY_FORMATS = [
  'Interactive Lecture',
  'Hands-on Lab',
  'Self-Paced Practice',
  'Case Study',
  'Discussion & Quiz',
  'Problem-Solving Studio',
] as const;

export const MicroLearningUnitsEditor: React.FC<MicroLearningUnitsEditorProps> = ({
  week,
  onChange,
  defaultExpanded = true,
  onAskCopilot,
  courseTitle,
  courseLevel,
  linkedCLOCodes = [],
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState<boolean>(false);
  const [selectedArchetype, setSelectedArchetype] = useState<MicroLearningArchetype>('standard');
  const [justGeneratedMsg, setJustGeneratedMsg] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const units: MicroLearningUnit[] = ensureWeeklyMicroUnits(week);

  const filledUnitsCount = units.filter((u) => u.title && u.title.trim().length > 2).length;
  const isFullyConfigured = filledUnitsCount === 4;

  // Auto-close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowQuickAddMenu(false);
      }
    }
    if (showQuickAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickAddMenu]);

  const handleUnitChange = (unitIndex: number, field: keyof MicroLearningUnit, value: any) => {
    const updated = updateMicroUnitInWeek(week, unitIndex, { [field]: value });
    onChange(updated);
  };

  /**
   * Rapidly generates 4 micro-learning unit placeholders for this week
   */
  const handleQuickAddPlaceholders = (archetype: MicroLearningArchetype = selectedArchetype) => {
    const syntheticUnits = synthesize4MicroUnits(
      week.weekNumber,
      week.topic || `Instructional Topic ${week.weekNumber}`,
      week.bloomLevel || 'Understand',
      archetype
    );
    const updated = setWeeklyMicroUnits(week, syntheticUnits);
    onChange(updated);
    setIsExpanded(true);
    setShowQuickAddMenu(false);
    setJustGeneratedMsg('4 Micro-learning Unit Placeholders Generated!');
    setTimeout(() => setJustGeneratedMsg(null), 3000);
  };

  /**
   * Prompts the AI Copilot to generate 4 micro-learning units and populates placeholders immediately
   */
  const handleQuickAddWithAICopilot = () => {
    // 1. Instantly populate 4 high-quality scaffolded placeholders so user isn't stuck waiting
    const syntheticUnits = synthesize4MicroUnits(
      week.weekNumber,
      week.topic || `Instructional Topic ${week.weekNumber}`,
      week.bloomLevel || 'Understand',
      selectedArchetype
    );
    const updated = setWeeklyMicroUnits(week, syntheticUnits);
    onChange(updated);
    setIsExpanded(true);
    setShowQuickAddMenu(false);

    // 2. Invoke AI Copilot if available
    const cloInfoStr = linkedCLOCodes.length > 0 ? `outcomes ${linkedCLOCodes.join(', ')}` : undefined;
    const prompt = buildCopilotMicroUnitsPrompt(
      week.weekNumber,
      week.topic || `Week ${week.weekNumber}`,
      cloInfoStr,
      courseTitle
    );

    if (onAskCopilot) {
      onAskCopilot(prompt);
      setJustGeneratedMsg('4 Placeholders Created & AI Copilot Dispatched!');
    } else {
      setJustGeneratedMsg('4 Micro-learning Unit Placeholders Generated!');
    }
    setTimeout(() => setJustGeneratedMsg(null), 3500);
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-3 relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">
                4 Sub-topics / Micro-learning Units (MLUs)
              </span>
              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isFullyConfigured
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {isFullyConfigured ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                )}
                <span>{filledUnitsCount}/4 Units</span>
              </span>

              {justGeneratedMsg && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 animate-pulse border border-indigo-300">
                  <Check className="w-2.5 h-2.5 text-indigo-600" />
                  <span>{justGeneratedMsg}</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Each week has 4 bite-sized sub-topics (45–60 min) for targeted mastery & flipped delivery
            </p>
          </div>
        </div>

        {/* Quick-Add Controls */}
        <div className="flex items-center space-x-1.5" ref={menuRef}>
          {/* Quick-Add Dropdown Toggle */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-200 transition cursor-pointer"
              title="Quick-Add 4 Micro-learning Unit placeholders for this week"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Quick-Add 4 Units</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Quick-Add Popover Menu */}
            {showQuickAddMenu && (
              <div className="absolute right-0 mt-1.5 w-84 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Quick-Add 4 Micro-learning Units
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    Week {week.weekNumber}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  Rapidly populate 4 structured sub-topic placeholders for{' '}
                  <strong className="text-slate-700">
                    {week.topic || `Week ${week.weekNumber}`}
                  </strong>
                  .
                </p>

                {/* Primary Action 1: Instant Scaffolding */}
                <button
                  type="button"
                  onClick={() => handleQuickAddPlaceholders(selectedArchetype)}
                  className="w-full text-left p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>⚡ Instant 4-Unit Placeholders</span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      1-Click
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-700 mt-1 leading-normal">
                    Fills 4 coherent units (Foundations, Modeling, Lab Practicum, and Synthesis).
                  </p>
                </button>

                {/* Primary Action 2: AI Copilot Generation */}
                <button
                  type="button"
                  onClick={handleQuickAddWithAICopilot}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>✨ Generate with AI Copilot</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      AI Assist
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1 leading-normal">
                    Fills placeholders and asks AI Copilot to customize titles, formats, and Bloom progression.
                  </p>
                </button>

                {/* Archetype Selector */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Pedagogical Archetype
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      {MICRO_LEARNING_PRESETS.find((p) => p.id === selectedArchetype)?.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-1">
                    {MICRO_LEARNING_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedArchetype(preset.id);
                          handleQuickAddPlaceholders(preset.id);
                        }}
                        className={`text-left px-2 py-1.5 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                          selectedArchetype === preset.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-1">{preset.name}</span>
                        {selectedArchetype === preset.id && (
                          <Check className="w-3 h-3 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white/80 transition cursor-pointer"
            aria-label={isExpanded ? 'Collapse sub-topics' : 'Expand sub-topics'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* When 0 units configured, display an attractive Quick-Add Callout */}
      {isExpanded && filledUnitsCount === 0 && (
        <div className="p-4 bg-white rounded-xl border border-dashed border-indigo-300 text-center space-y-2.5">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">
              No Micro-learning Units Defined for Week {week.weekNumber}
            </h5>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5">
              Rapidly generate 4 bite-sized sub-topic placeholders with balanced time allocations (45–60 min) and Bloom scaffolding.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickAddPlaceholders(selectedArchetype)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>⚡ Quick-Add 4 Placeholders</span>
            </button>
            <button
              type="button"
              onClick={handleQuickAddWithAICopilot}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>✨ Use AI Copilot</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Micro-learning Units Grid/List */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {units.map((unit, index) => {
            const unitNumber = index + 1;
            const unitLabel = `Unit ${week.weekNumber}.${unitNumber}`;

            return (
              <div
                key={unit.id || `unit-${week.weekNumber}-${unitNumber}`}
                className="bg-white rounded-lg border border-slate-200/90 p-2.5 shadow-2xs space-y-2 hover:border-indigo-300 transition"
              >
                {/* Unit Header Badge & Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-extrabold tracking-wide uppercase font-mono">
                      {unitLabel}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Sub-topic {unitNumber}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Duration input */}
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      <input
                        type="number"
                        min={15}
                        max={180}
                        step={5}
                        value={unit.durationMinutes || 45}
                        onChange={(e) =>
                          handleUnitChange(index, 'durationMinutes', Number(e.target.value) || 45)
                        }
                        className="w-8 text-center text-[10px] font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0"
                        title="Duration in minutes"
                      />
                      <span>m</span>
                    </div>

                    {/* Bloom Selector */}
                    <select
                      value={unit.bloomLevel || week.bloomLevel || 'Understand'}
                      onChange={(e) =>
                        handleUnitChange(index, 'bloomLevel', e.target.value as BloomLevel)
                      }
                      className="text-[10px] font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-200/70 rounded px-1.5 py-0.5 cursor-pointer focus:ring-0"
                      title="Cognitive Bloom Level"
                    >
                      {BLOOM_LEVELS.map((bl) => (
                        <option key={bl} value={bl}>
                          {bl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-topic Title Input */}
                <div>
                  <input
                    type="text"
                    value={unit.title || ''}
                    onChange={(e) => handleUnitChange(index, 'title', e.target.value)}
                    placeholder={`Sub-topic ${unitNumber}: Enter micro-learning topic title...`}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-1.5 rounded-md border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition"
                  />
                </div>

                {/* Delivery format & description toggle */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-2.5 h-2.5 text-slate-400" />
                    <select
                      value={unit.deliveryFormat || 'Interactive Lecture'}
                      onChange={(e) => handleUnitChange(index, 'deliveryFormat', e.target.value)}
                      className="text-[10px] text-slate-600 bg-transparent border-none p-0 cursor-pointer font-medium hover:text-indigo-600"
                    >
                      {DELIVERY_FORMATS.map((fmt) => (
                        <option key={fmt} value={fmt}>
                          {fmt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-[9px] text-slate-400 font-mono">
                    {unit.title?.trim() ? 'Ready' : 'Empty'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collapsed quick summary */}
      {!isExpanded && (
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white rounded-lg p-2 border border-slate-200">
          <div className="flex items-center space-x-1.5 flex-1 overflow-hidden">
            {units.map((u, i) => (
              <span
                key={u.id || i}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 truncate max-w-[130px]"
                title={`Unit ${week.weekNumber}.${i + 1}: ${u.title || 'Untitled'}`}
              >
                <span className="font-bold text-indigo-600 mr-1">{i + 1}.</span>
                {u.title || 'Untitled'}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickAddPlaceholders()}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
              title="Quick-Add 4 Units"
            >
              ⚡ Quick-Add
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-[10px] font-bold text-slate-600 hover:text-slate-800 cursor-pointer px-1 py-0.5"
            >
              Edit 4 Units
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
