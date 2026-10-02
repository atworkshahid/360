import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Layers,
  HelpCircle,
  BookOpen,
  RotateCcw,
  Wand2,
  BarChart3,
  MessageSquare,
  Info,
} from 'lucide-react';
import { Course, PLO, PLOMappingLevel, OutcomeMappingScale } from '../../../types';
import { getFrameworkById, getOutcomeTerminology } from '../../../data/frameworksData';
import { evaluateStage } from '../../../utils/stageProgress';
import {
  CourseService,
  FrameworkDeviationWarning,
  FrameworkContentValidationReport,
} from '../../../services/courseService';
import { FrameworkFieldWarning } from '../FrameworkFieldWarning';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot?: (prompt: string) => void;
  onOpenComments?: (
    targetId: string,
    targetType: 'CLO' | 'Assessment' | 'Rubric' | 'Module' | 'General',
    targetTitle: string
  ) => void;
  onOpenFrameworkGuidance?: (stageKey?: string) => void;
  frameworkValidationReport?: FrameworkContentValidationReport;
  onApplyFrameworkFix?: (warning: FrameworkDeviationWarning) => void;
}

export const Step05OutcomeMapping: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onPrev,
  onAskCopilot,
  onOpenComments,
  onOpenFrameworkGuidance,
  frameworkValidationReport,
  onApplyFrameworkFix,
}) => {
  const clos = course.clos || [];
  const plos = course.plos || [];
  const [scaleMode, setScaleMode] = useState<OutcomeMappingScale>('numeric_1_3');
  const [newPloCode, setNewPloCode] = useState('');
  const [newPloTitle, setNewPloTitle] = useState('');
  const [newPloDesc, setNewPloDesc] = useState('');
  const [showAddPlo, setShowAddPlo] = useState(false);

  const validationReport = React.useMemo(() => {
    return frameworkValidationReport || CourseService.validateCourseContentAgainstFramework(course);
  }, [course, frameworkValidationReport]);

  const framework = getFrameworkById(course.frameworkId);
  const ploTerm = getOutcomeTerminology(course.frameworkId, 'program_outcome');

  // Live Accreditation Evaluation for Stage 05 (OBE10)
  const stageEval = evaluateStage(course, 5, 'obe10');

  // Convert level between IRM and 1-3
  const getDisplayValue = (mappedLevel?: PLOMappingLevel): string => {
    if (!mappedLevel) return '-';
    if (scaleMode === 'numeric_1_3') {
      if (mappedLevel === 'Introduced') return '1';
      if (mappedLevel === 'Reinforced') return '2';
      if (mappedLevel === 'Mastered') return '3';
    }
    return mappedLevel[0]; // I, R, M
  };

  const handleToggleCell = (cloId: string, ploId: string) => {
    const clo = clos.find((c) => c.id === cloId);
    if (!clo) return;

    const currentMapping = clo.mappedPLOs?.find((m) => m.ploId === ploId);
    let nextLevel: PLOMappingLevel | null = null;

    if (!currentMapping) {
      nextLevel = 'Introduced';
    } else if (currentMapping.level === 'Introduced') {
      nextLevel = 'Reinforced';
    } else if (currentMapping.level === 'Reinforced') {
      nextLevel = 'Mastered';
    } else {
      nextLevel = null; // Unmap
    }

    const updatedMappedPLOs = (clo.mappedPLOs || []).filter((m) => m.ploId !== ploId);
    if (nextLevel) {
      updatedMappedPLOs.push({
        ploId,
        level: nextLevel,
        rationale: `Mapped to ${nextLevel} level based on Bloom depth.`,
      });
    }

    const updatedCLOs = clos.map((c) => (c.id === cloId ? { ...c, mappedPLOs: updatedMappedPLOs } : c));
    onChange({ ...course, clos: updatedCLOs });
  };

  const handleApplyPresetPLOs = (type: 'abet' | 'wa' | 'cs' | 'aacsb') => {
    let preset: PLO[] = [];
    if (type === 'abet') {
      preset = [
        { id: 'plo-abet-1', code: 'PLO 1', title: 'Complex Problem Solving', description: 'Identify, formulate, and solve complex engineering problems by applying engineering, science, and mathematics.' },
        { id: 'plo-abet-2', code: 'PLO 2', title: 'Engineering Design', description: 'Apply engineering design to produce solutions that meet specified needs considering public health, safety, and welfare.' },
        { id: 'plo-abet-3', code: 'PLO 3', title: 'Effective Communication', description: 'Communicate effectively with a range of audiences in both technical and non-technical settings.' },
        { id: 'plo-abet-4', code: 'PLO 4', title: 'Ethical & Professional Responsibility', description: 'Recognize ethical and professional responsibilities in engineering situations and make informed judgments.' },
        { id: 'plo-abet-5', code: 'PLO 5', title: 'Collaborative Teamwork', description: 'Function effectively on a team whose members together provide leadership, create a collaborative environment, and establish goals.' },
        { id: 'plo-abet-6', code: 'PLO 6', title: 'Experimentation & Analysis', description: 'Develop and conduct appropriate experimentation, analyze and interpret data, and use engineering judgment to draw conclusions.' },
        { id: 'plo-abet-7', code: 'PLO 7', title: 'Continuous Knowledge Acquisition', description: 'Acquire and apply new knowledge as needed, using appropriate learning strategies.' },
      ];
    } else if (type === 'cs') {
      preset = [
        { id: 'plo-cs-1', code: 'PLO 1', title: 'Algorithmic Problem Solving', description: 'Analyze complex computing problems and apply principles of computing and other relevant disciplines to identify solutions.' },
        { id: 'plo-cs-2', code: 'PLO 2', title: 'Software Architecture & Implementation', description: 'Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements.' },
        { id: 'plo-cs-3', code: 'PLO 3', title: 'Communication in Computing', description: 'Communicate effectively in a variety of professional contexts.' },
        { id: 'plo-cs-4', code: 'PLO 4', title: 'Professional & Legal Ethics', description: 'Recognize professional responsibilities and make informed judgments in computing practice based on legal and ethical principles.' },
        { id: 'plo-cs-5', code: 'PLO 5', title: 'Team Collaboration', description: 'Function effectively as a member or leader of a team engaged in activities appropriate to the program discipline.' },
        { id: 'plo-cs-6', code: 'PLO 6', title: 'Computer Science Theory & Fundamentals', description: 'Apply computer science theory and software development fundamentals to produce computing-based solutions.' },
      ];
    } else if (type === 'aacsb') {
      preset = [
        { id: 'plo-aacsb-1', code: 'PLO 1', title: 'Strategic Business Decision Making', description: 'Integrate multi-functional business concepts to formulate strategic organizational decisions.' },
        { id: 'plo-aacsb-2', code: 'PLO 2', title: 'Quantitative & Financial Analysis', description: 'Apply statistical and analytical models to interpret financial and operational datasets.' },
        { id: 'plo-aacsb-3', code: 'PLO 3', title: 'Ethical Leadership & Governance', description: 'Evaluate ethical dilemmas and promote corporate social responsibility in global contexts.' },
        { id: 'plo-aacsb-4', code: 'PLO 4', title: 'Executive Communication', description: 'Deliver persuasive, data-backed presentations to diverse stakeholder groups.' },
        { id: 'plo-aacsb-5', code: 'PLO 5', title: 'Innovation & Agility', description: 'Design innovative business models adapted to rapid technological disruption.' },
      ];
    } else {
      preset = [
        { id: 'plo-wa-1', code: 'WA 1', title: 'Engineering Knowledge', description: 'Apply knowledge of mathematics, natural science, engineering fundamentals and an engineering specialization.' },
        { id: 'plo-wa-2', code: 'WA 2', title: 'Problem Analysis', description: 'Identify, formulate, research literature and analyze complex engineering problems reaching substantiated conclusions.' },
        { id: 'plo-wa-3', code: 'WA 3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems and design systems, components or processes.' },
        { id: 'plo-wa-4', code: 'WA 4', title: 'Investigation', description: 'Conduct investigations of complex problems using research-based knowledge and methods.' },
        { id: 'plo-wa-5', code: 'WA 5', title: 'Modern Tool Usage', description: 'Create, select and apply appropriate techniques, resources, and modern engineering and IT tools.' },
        { id: 'plo-wa-6', code: 'WA 6', title: 'The Engineer and Society', description: 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal and cultural issues.' },
        { id: 'plo-wa-7', code: 'WA 7', title: 'Environment and Sustainability', description: 'Understand the impact of professional engineering solutions in societal and environmental contexts.' },
        { id: 'plo-wa-8', code: 'WA 8', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice.' },
      ];
    }
    onChange({ ...course, plos: preset });
  };

  // Auto-Align CLOs to PLOs grounded in Bloom Taxonomy
  const handleAutoAlignBloom = () => {
    if (plos.length === 0 || clos.length === 0) return;

    const updatedCLOs = clos.map((clo, idx) => {
      // Determine default level based on Bloom taxonomy
      let defaultLevel: PLOMappingLevel = 'Reinforced';
      if (clo.bloomLevel === 'Remember' || clo.bloomLevel === 'Understand') {
        defaultLevel = 'Introduced';
      } else if (clo.bloomLevel === 'Apply' || clo.bloomLevel === 'Analyze') {
        defaultLevel = 'Reinforced';
      } else if (clo.bloomLevel === 'Evaluate' || clo.bloomLevel === 'Create') {
        defaultLevel = 'Mastered';
      }

      // Map to 1-2 distributed PLOs to ensure balanced constructive coverage
      const targetPloIdx1 = idx % plos.length;
      const targetPloIdx2 = (idx + 1) % plos.length;

      const mappings = [
        {
          ploId: plos[targetPloIdx1].id,
          level: defaultLevel,
          rationale: `Primary constructive alignment at ${defaultLevel} level based on ${clo.bloomLevel} Bloom verb.`,
        },
      ];

      // If more than 2 PLOs available, add secondary mapping
      if (plos.length > 2 && targetPloIdx1 !== targetPloIdx2) {
        const secondaryLevel: PLOMappingLevel = defaultLevel === 'Mastered' ? 'Reinforced' : 'Introduced';
        mappings.push({
          ploId: plos[targetPloIdx2].id,
          level: secondaryLevel,
          rationale: `Secondary reinforcement alignment supporting ${plos[targetPloIdx2].code}.`,
        });
      }

      return {
        ...clo,
        mappedPLOs: mappings,
      };
    });

    onChange({ ...course, clos: updatedCLOs });
  };

  const handleClearAllMappings = () => {
    if (!window.confirm('Are you sure you want to clear all outcome mappings?')) return;
    const cleared = clos.map((c) => ({ ...c, mappedPLOs: [] }));
    onChange({ ...course, clos: cleared });
  };

  const handleAddCustomPLO = () => {
    if (!newPloCode.trim() || !newPloTitle.trim()) return;
    const newPLO: PLO = {
      id: `custom-plo-${Date.now()}`,
      code: newPloCode.trim(),
      title: newPloTitle.trim(),
      description: newPloDesc.trim() || newPloTitle.trim(),
    };
    onChange({
      ...course,
      plos: [...plos, newPLO],
    });
    setNewPloCode('');
    setNewPloTitle('');
    setNewPloDesc('');
    setShowAddPlo(false);
  };

  const handleRemoveCustomPLO = (ploId: string) => {
    onChange({
      ...course,
      plos: plos.filter((p) => p.id !== ploId),
      clos: clos.map((c) => ({
        ...c,
        mappedPLOs: (c.mappedPLOs || []).filter((m) => m.ploId !== ploId),
      })),
    });
  };

  // Alignment checks
  const unmappedCLOs = clos.filter((c) => !c.mappedPLOs || c.mappedPLOs.length === 0);
  const unmappedPLOs = plos.filter((p) => !clos.some((c) => (c.mappedPLOs || []).some((m) => m.ploId === p.id)));

  // Matrix analytics
  const totalPossibleCells = clos.length * plos.length;
  const mappedCellsCount = clos.reduce((acc, c) => acc + (c.mappedPLOs || []).length, 0);
  const matrixDensity = totalPossibleCells > 0 ? Math.round((mappedCellsCount / totalPossibleCells) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Step 05 of 10</span>
            <span>•</span>
            <span>Constructive Alignment Matrix</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Outcome Mapping Matrix (CLO → {ploTerm})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Map each Course Learning Outcome to governing framework outcomes. Click any cell to cycle through alignment intensity (Introduced → Reinforced → Mastered).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="step05-framework-guidelines-btn"
            onClick={() => {
              if (onOpenFrameworkGuidance) {
                onOpenFrameworkGuidance('step_plo_mapping');
              } else {
                window.dispatchEvent(
                  new CustomEvent('open_framework_guidance', { detail: { stageKey: 'step_plo_mapping' } })
                );
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
            title={`View ${framework.code} Articulation Rules, Correlation Scales & Evidence Requirements`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{framework.code} Mapping Rules</span>
          </button>

          {onOpenComments && (
            <button
              type="button"
              onClick={() =>
                onOpenComments(
                  'clo-plo-mapping-matrix',
                  'General',
                  'CLO to PLO Outcome Alignment Matrix'
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Review Feedback</span>
            </button>
          )}

          {onAskCopilot && (
            <button
              type="button"
              onClick={() =>
                onAskCopilot(
                  `Evaluate the CLO to PLO mapping matrix for course "${course.title}". Suggest optimal mappings and rationales for accreditation standards.`
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Mapping Advisor</span>
            </button>
          )}

          {/* Scale Toggle (1-3 vs I-R-M) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setScaleMode('numeric_1_3')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                scaleMode === 'numeric_1_3'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 - 2 - 3 (Numeric)
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('irm')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                scaleMode === 'irm'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I - R - M (Taxonomic)
            </button>
          </div>
        </div>
      </div>

      {/* Live Accreditation Readiness Audit Card */}
      <div
        id="step05-obe-accreditation-card"
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
          stageEval.isCompleted
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start space-x-2.5">
          {stageEval.isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          )}
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>{stageEval.isCompleted ? 'Constructive Alignment Validated' : 'Curricular Mapping Incomplete'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Step 05 • Accreditation Audit
              </span>
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {stageEval.isCompleted
                ? stageEval.summary
                : `Action required: ${stageEval.missingRequirements.join(', ')}`}
            </div>
          </div>
        </div>

        {/* Matrix Density Pill */}
        <div className="flex items-center space-x-2 text-[11px] bg-white/80 px-3 py-1.5 rounded-lg border border-current/20 shrink-0 self-start sm:self-auto">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>
            Density: <strong>{matrixDensity}%</strong> ({mappedCellsCount} of {totalPossibleCells} cells)
          </span>
        </div>
      </div>

      {/* PLO Presets Bar if empty */}
      {plos.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="font-semibold text-slate-800">No PLOs configured yet. Quick-load standard framework:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPresetPLOs('abet')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
            >
              ABET 1-7 (Engineering)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetPLOs('wa')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
            >
              Washington Accord (WA 1-8)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetPLOs('cs')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
            >
              Computing / CS (1-6)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetPLOs('aacsb')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
            >
              AACSB (Business)
            </button>
          </div>
        </div>
      )}

      {/* Legend, Auto-Align & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700">Mapping Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
              {scaleMode === 'numeric_1_3' ? '1' : 'I'}
            </span>
            <span className="text-slate-600 text-[11px]">
              {scaleMode === 'numeric_1_3' ? 'Slight / Low (1)' : 'Introduced (I)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
              {scaleMode === 'numeric_1_3' ? '2' : 'R'}
            </span>
            <span className="text-slate-600 text-[11px]">
              {scaleMode === 'numeric_1_3' ? 'Moderate / Medium (2)' : 'Reinforced (R)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
              {scaleMode === 'numeric_1_3' ? '3' : 'M'}
            </span>
            <span className="text-slate-600 text-[11px]">
              {scaleMode === 'numeric_1_3' ? 'Substantial / High (3)' : 'Mastered (M)'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {clos.length > 0 && plos.length > 0 && (
            <button
              type="button"
              onClick={handleAutoAlignBloom}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="Automatically align CLOs to PLOs based on Bloom taxonomy depth"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Smart Align (Bloom-Grounded)</span>
            </button>
          )}

          {mappedCellsCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllMappings}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Matrix</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddPlo(!showAddPlo)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom {ploTerm}</span>
          </button>
        </div>
      </div>

      {/* Custom PLO Creator Form */}
      {showAddPlo && (
        <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-indigo-950">Add Custom Program Outcome</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Outcome Code</label>
              <input
                type="text"
                value={newPloCode}
                onChange={(e) => setNewPloCode(e.target.value)}
                placeholder="e.g. PLO 6 or PSO 1"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Outcome Title</label>
              <input
                type="text"
                value={newPloTitle}
                onChange={(e) => setNewPloTitle(e.target.value)}
                placeholder="e.g. Domain-Specific Cloud & Distributed Systems"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddPlo(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCustomPLO}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
            >
              Save Custom Outcome
            </button>
          </div>
        </div>
      )}

      {/* Alignment Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3.5 font-bold text-slate-700 w-56 sticky left-0 bg-slate-50 z-10">
                Course Outcomes (CLOs)
              </th>
              {plos.map((plo) => {
                const mappedCount = clos.filter((c) =>
                  (c.mappedPLOs || []).some((m) => m.ploId === plo.id)
                ).length;

                return (
                  <th
                    key={plo.id}
                    className="p-3 font-bold text-slate-700 text-center min-w-[95px] max-w-[130px] border-l border-slate-100"
                    title={`${plo.code}: ${plo.title} - ${plo.description}`}
                  >
                    <div className="font-mono text-indigo-700 font-bold">{plo.code}</div>
                    <div className="text-[10px] font-normal text-slate-500 truncate mt-0.5">
                      {plo.title}
                    </div>
                    <div className="mt-1">
                      {mappedCount > 0 ? (
                        <span className="inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                          {mappedCount} CLO{mappedCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="inline-block text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
                          0 (Gap)
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="p-3 font-bold text-slate-700 text-center w-28 border-l border-slate-100">
                Coverage
              </th>
            </tr>
          </thead>
          <tbody>
            {clos.map((clo) => {
              const mappedPLOsCount = (clo.mappedPLOs || []).length;
              const hasMappings = mappedPLOsCount > 0;

              return (
                <tr
                  key={clo.id}
                  className="border-b border-slate-100 hover:bg-slate-50/60 transition"
                >
                  <td className="p-3.5 font-medium text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-900 font-mono px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                        {clo.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        ({clo.bloomLevel})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                      {clo.statement || 'No statement defined yet'}
                    </p>

                    {/* Framework Field Warning for Outcome Mapping Deviations */}
                    <FrameworkFieldWarning
                      field={`ploMapping[${clo.id}]`}
                      report={validationReport}
                      onApplyFix={onApplyFrameworkFix}
                      compact
                    />
                  </td>

                  {plos.map((plo) => {
                    const mapping = clo.mappedPLOs?.find((m) => m.ploId === plo.id);
                    const val = getDisplayValue(mapping?.level);
                    const isMapped = !!mapping;

                    return (
                      <td key={plo.id} className="p-2 text-center border-l border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleToggleCell(clo.id, plo.id)}
                          className={`w-9 h-9 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center mx-auto border ${
                            !isMapped
                              ? 'bg-slate-50 text-slate-300 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                              : mapping.level === 'Introduced'
                              ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-2xs'
                              : mapping.level === 'Reinforced'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                              : 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs'
                          }`}
                          title={`Click to cycle mapping for ${clo.code} ➔ ${plo.code} (Current: ${
                            mapping?.level || 'Unmapped'
                          })`}
                        >
                          {val}
                        </button>
                      </td>
                    );
                  })}

                  <td className="p-3 text-center border-l border-slate-100">
                    {hasMappings ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Mapped ({mappedPLOsCount})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Unmapped
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-700">
              <td className="p-3 sticky left-0 bg-slate-50/80 z-10 border-r border-slate-100">
                PLO Alignment Summary
              </td>
              {plos.map((plo) => {
                const count = clos.filter((c) =>
                  (c.mappedPLOs || []).some((m) => m.ploId === plo.id)
                ).length;
                return (
                  <td key={plo.id} className="p-2 text-center text-[11px] border-l border-slate-100">
                    <span className={count > 0 ? 'text-slate-900 font-bold' : 'text-amber-600'}>
                      {count} / {clos.length}
                    </span>
                  </td>
                );
              })}
              <td className="p-2 text-center text-[11px] border-l border-slate-100">
                {matrixDensity}% Density
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Warnings Banner if any unmapped */}
      {(unmappedCLOs.length > 0 || unmappedPLOs.length > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
          <div className="flex items-center space-x-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Curricular Alignment Advisory</span>
          </div>
          {unmappedCLOs.length > 0 && (
            <p className="text-[11px] text-amber-800">
              • <strong>{unmappedCLOs.length} Unmapped CLO(s):</strong> {unmappedCLOs.map((u) => u.code).join(', ')} currently lack programmatic mapping. Every course outcome must trace to at least one PLO for accreditation.
            </p>
          )}
          {unmappedPLOs.length > 0 && (
            <p className="text-[11px] text-amber-800">
              • <strong>{unmappedPLOs.length} Unaddressed PLO(s):</strong> {unmappedPLOs.map((p) => p.code).join(', ')} have no course outcomes mapped. While not all PLOs must be fulfilled by a single course, ensure core program competencies are met.
            </p>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CLOs</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Weekly Course Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
