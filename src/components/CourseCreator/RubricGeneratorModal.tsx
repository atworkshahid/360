import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Brain,
  Table,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  Target,
  FileText,
} from 'lucide-react';
import { Course, CLO, Assessment, Rubric, RubricCriterion, BloomLevel } from '../../types';
import {
  BLOOM_RUBRIC_TEMPLATES,
  getBloomCriteriaSuggestions,
  generateRubricForCLO,
  generateRubricsForEachCLO,
  balanceCriteriaWeights,
} from '../../utils/rubricGenerator';
import { generateRubricCriteria } from '../../services/api';
import { StructuredRubricGenerator } from './StructuredRubricGenerator';

interface RubricGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onChange: (updatedCourse: Course) => void;
  initialCLOId?: string;
  targetRubricId?: string;
}

const BLOOM_LEVELS: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

const BLOOM_STYLES: Record<BloomLevel, { bg: string; text: string; border: string; badgeBg: string }> = {
  Remember: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-300', badgeBg: 'bg-slate-100 text-slate-800' },
  Understand: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300', badgeBg: 'bg-sky-100 text-sky-800' },
  Apply: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', badgeBg: 'bg-emerald-100 text-emerald-800' },
  Analyze: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', badgeBg: 'bg-amber-100 text-amber-800' },
  Evaluate: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300', badgeBg: 'bg-rose-100 text-rose-800' },
  Create: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', badgeBg: 'bg-purple-100 text-purple-800' },
};

export const RubricGeneratorModal: React.FC<RubricGeneratorModalProps> = ({
  isOpen,
  onClose,
  course,
  onChange,
  initialCLOId,
  targetRubricId,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'structured' | 'single' | 'batch'>('structured');

  // Single CLO state
  const [selectedCLOId, setSelectedCLOId] = useState<string>(
    initialCLOId || course.clos[0]?.id || ''
  );
  const selectedCLO = course.clos.find((c) => c.id === selectedCLOId) || course.clos[0];

  const [selectedBloomLevel, setSelectedBloomLevel] = useState<BloomLevel>(
    selectedCLO?.bloomLevel || 'Analyze'
  );

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(() => {
    if (selectedCLO) {
      const linked = course.assessments.find((a) => a.linkedCLOIds?.includes(selectedCLO.id));
      if (linked) return linked.id;
    }
    return course.assessments[0]?.id || '';
  });

  const [rubricTitle, setRubricTitle] = useState<string>(() => {
    const asmt = course.assessments.find((a) => a.id === selectedAssessmentId);
    return selectedCLO
      ? `${selectedCLO.code} (${selectedCLO.bloomLevel}) Evaluation Rubric${asmt ? ` - ${asmt.name}` : ''}`
      : 'Assessment Rubric';
  });

  // Criteria working list
  const [criteria, setCriteria] = useState<RubricCriterion[]>(() => {
    if (selectedCLO) {
      return getBloomCriteriaSuggestions(selectedCLO.bloomLevel || 'Analyze', selectedCLO.statement);
    }
    return getBloomCriteriaSuggestions('Analyze');
  });

  // Expanded criteria cards tracking
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [previewMatrixOpen, setPreviewMatrixOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Batch mode options
  const [batchReplaceExisting, setBatchReplaceExisting] = useState<boolean>(false);
  const [batchAssignAssessments, setBatchAssignAssessments] = useState<boolean>(true);

  // Sync title & criteria when CLO changes
  const handleCLOChange = (cloId: string) => {
    setSelectedCLOId(cloId);
    const target = course.clos.find((c) => c.id === cloId);
    if (target) {
      const bloom = target.bloomLevel || 'Analyze';
      setSelectedBloomLevel(bloom);
      const linkedAsmt = course.assessments.find((a) => a.linkedCLOIds?.includes(target.id)) || course.assessments[0];
      if (linkedAsmt) {
        setSelectedAssessmentId(linkedAsmt.id);
      }
      setRubricTitle(`${target.code} (${bloom}) Evaluation Rubric${linkedAsmt ? ` - ${linkedAsmt.name}` : ''}`);
      const freshCriteria = getBloomCriteriaSuggestions(bloom, target.statement, linkedAsmt?.name);
      setCriteria(freshCriteria);
    }
  };

  // Sync criteria when user overrides Bloom level manually
  const handleBloomLevelChange = (newLevel: BloomLevel) => {
    setSelectedBloomLevel(newLevel);
    const updated = getBloomCriteriaSuggestions(newLevel, selectedCLO?.statement);
    setCriteria(updated);
  };

  // Toggle expanded details for a criterion
  const toggleExpand = (id: string) => {
    setExpandedCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Total weight calculation
  const totalWeight = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  }, [criteria]);

  // Handle weight auto-balancing
  const handleAutoBalance = () => {
    const balanced = balanceCriteriaWeights(criteria);
    setCriteria(balanced);
  };

  // Update a single criterion
  const handleUpdateCriterion = (critId: string, updates: Partial<RubricCriterion>) => {
    setCriteria((prev) => prev.map((c) => (c.id === critId ? { ...c, ...updates } : c)));
  };

  // Delete criterion
  const handleDeleteCriterion = (critId: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== critId));
  };

  // Add custom criterion
  const handleAddCriterion = () => {
    const newCrit: RubricCriterion = {
      id: `crit-custom-${Date.now()}`,
      criterionName: 'Analytical Synthesis & Argumentation',
      cloId: selectedCLO?.id || '',
      weight: 20,
      levels: [
        { level: 'Not Achieved', descriptor: 'Fundamental conceptual gaps with no coherent analysis.', pointsRange: '0-49%' },
        { level: 'Developing', descriptor: 'Basic analysis with frequent unsupported assertions.', pointsRange: '50-64%' },
        { level: 'Achieved', descriptor: 'Clear, systematic analysis directly addressing requirements.', pointsRange: '65-74%' },
        { level: 'Proficient', descriptor: 'Nuanced argumentation evaluating counterarguments effectively.', pointsRange: '75-84%' },
        { level: 'Exemplary', descriptor: 'Authoritative, airtight reasoning with publication-grade insight.', pointsRange: '85-100%' },
      ],
    };
    setCriteria((prev) => [...prev, newCrit]);
    setExpandedCriteria((prev) => ({ ...prev, [newCrit.id]: true }));
  };

  // AI Generation
  const handleAiGenerate = async () => {
    if (!selectedCLO) return;
    setIsAiGenerating(true);
    const asmt = course.assessments.find((a) => a.id === selectedAssessmentId);

    const generated = await generateRubricCriteria(
      asmt?.name || rubricTitle,
      asmt?.type || 'Assignment',
      [`${selectedCLO.code}: ${selectedCLO.statement}`],
      selectedBloomLevel,
      selectedCLO.statement
    );

    setIsAiGenerating(false);
    if (generated && generated.length > 0) {
      setCriteria(generated.map((c) => ({ ...c, cloId: selectedCLO.id })));
    }
  };

  // Apply Single Rubric to Course
  const handleSaveSingleRubric = (mode: 'create' | 'append' | 'replace') => {
    if (!selectedCLO) return;

    // Ensure all criteria have cloId assigned
    const finalizedCriteria: RubricCriterion[] = criteria.map((c) => ({
      ...c,
      cloId: selectedCLO.id,
    }));

    if (mode === 'create') {
      const newRubric: Rubric = {
        id: `rubric-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: rubricTitle.trim() || `${selectedCLO.code} Assessment Rubric`,
        assessmentId: selectedAssessmentId || '',
        criteria: finalizedCriteria,
      };

      // Also link to the assessment if assessmentId is selected
      const updatedAssessments = course.assessments.map((a) =>
        a.id === selectedAssessmentId ? { ...a, rubricId: newRubric.id } : a
      );

      onChange({
        ...course,
        rubrics: [...course.rubrics, newRubric],
        assessments: updatedAssessments,
        updatedAt: new Date().toISOString(),
      });

      setSaveSuccessMessage(`Successfully created "${newRubric.title}" and linked to ${selectedCLO.code}!`);
    } else if (mode === 'append' && targetRubricId) {
      const updated = course.rubrics.map((r) =>
        r.id === targetRubricId ? { ...r, criteria: [...r.criteria, ...finalizedCriteria] } : r
      );
      onChange({ ...course, rubrics: updated, updatedAt: new Date().toISOString() });
      setSaveSuccessMessage(`Successfully added criteria to existing rubric!`);
    } else if (mode === 'replace' && targetRubricId) {
      const updated = course.rubrics.map((r) =>
        r.id === targetRubricId ? { ...r, criteria: finalizedCriteria } : r
      );
      onChange({ ...course, rubrics: updated, updatedAt: new Date().toISOString() });
      setSaveSuccessMessage(`Successfully updated rubric criteria!`);
    }

    setTimeout(() => {
      setSaveSuccessMessage(null);
      onClose();
    }, 1200);
  };

  // Batch Generation: Create custom rubrics for each CLO
  const handleBatchGenerate = () => {
    const result = generateRubricsForEachCLO(course, {
      replaceExisting: batchReplaceExisting,
      assignAssessments: batchAssignAssessments,
    });

    onChange({
      ...course,
      rubrics: result.updatedRubrics,
      assessments: result.updatedAssessments || course.assessments,
      updatedAt: new Date().toISOString(),
    });

    setSaveSuccessMessage(`Created ${result.generatedCount} Bloom-aligned rubrics for all course CLOs!`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
      onClose();
    }, 1400);
  };

  // Copy Rubric as Markdown
  const handleCopyMarkdown = () => {
    let md = `# ${rubricTitle}\n\n`;
    md += `**Target Outcome:** ${selectedCLO?.code || ''} (${selectedBloomLevel})\n`;
    md += `**Statement:** ${selectedCLO?.statement || ''}\n\n`;
    md += `| Criterion | Weight | Not Achieved (0-49%) | Developing (50-64%) | Achieved (65-74%) | Proficient (75-84%) | Exemplary (85-100%) |\n`;
    md += `| :--- | :---: | :--- | :--- | :--- | :--- | :--- |\n`;

    criteria.forEach((c) => {
      const l = c.levels;
      md += `| **${c.criterionName}** | ${c.weight}% | ${l[0]?.descriptor || ''} | ${l[1]?.descriptor || ''} | ${l[2]?.descriptor || ''} | ${l[3]?.descriptor || ''} | ${l[4]?.descriptor || ''} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const bloomDetails = BLOOM_RUBRIC_TEMPLATES[selectedBloomLevel] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                  Rubric Generator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Bloom's Taxonomy Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Design criteria-based analytic grading rubrics calibrated to learning outcome cognitive levels
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-0 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('structured')}
              className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                activeTab === 'structured'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Structured Matrix Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                activeTab === 'single'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Single CLO Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                activeTab === 'batch'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Generate for Each CLO ({course.clos.length})</span>
            </button>
          </div>

          {activeTab === 'single' && (
            <div className="flex items-center space-x-2 pb-2">
              <button
                onClick={() => setPreviewMatrixOpen(!previewMatrixOpen)}
                className={`px-2.5 py-1 text-xs rounded-lg border flex items-center space-x-1 transition cursor-pointer ${
                  previewMatrixOpen
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewMatrixOpen ? 'Exit Preview' : 'Matrix Preview'}</span>
              </button>
              <button
                onClick={handleCopyMarkdown}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center space-x-1 transition cursor-pointer"
                title="Copy rubric table as Markdown"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Success Banner */}
        {saveSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'structured' ? (
            <div className="space-y-4">
              <StructuredRubricGenerator
                course={course}
                onChange={onChange}
                initialCLOId={initialCLOId || selectedCLOId}
                activeRubricId={targetRubricId}
              />
            </div>
          ) : activeTab === 'single' ? (
            <>
              {/* Target CLO & Assessment Configuration Row */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CLO Select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Course Learning Outcome (CLO) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedCLOId}
                      onChange={(e) => handleCLOChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {course.clos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} ({c.bloomLevel}): {c.statement ? `${c.statement.slice(0, 50)}...` : 'Outcome'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bloom Level Calibrator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Cognitive Level (Bloom's)
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {['Analyze', 'Evaluate', 'Create'].includes(selectedBloomLevel) ? 'Higher-Order (HOTS)' : 'Lower-Order (LOTS)'}
                      </span>
                    </div>
                    <select
                      value={selectedBloomLevel}
                      onChange={(e) => handleBloomLevelChange(e.target.value as BloomLevel)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {BLOOM_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Level {BLOOM_LEVELS.indexOf(lvl) + 1}: {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Associated Assessment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Associated Assessment
                    </label>
                    <select
                      value={selectedAssessmentId}
                      onChange={(e) => {
                        setSelectedAssessmentId(e.target.value);
                        const asmt = course.assessments.find((a) => a.id === e.target.value);
                        if (asmt && selectedCLO) {
                          setRubricTitle(`${selectedCLO.code} (${selectedBloomLevel}) Rubric - ${asmt.name}`);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">-- No specific assessment --</option>
                      {course.assessments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type} • {a.weightage}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected CLO Statement Card */}
                {selectedCLO && (
                  <div className={`p-3 rounded-lg border ${BLOOM_STYLES[selectedBloomLevel].bg} ${BLOOM_STYLES[selectedBloomLevel].border}`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{selectedCLO.code}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${BLOOM_STYLES[selectedBloomLevel].badgeBg}`}>
                          {selectedBloomLevel}
                        </span>
                        {selectedCLO.bloomVerb && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Action Verb: <strong>{selectedCLO.bloomVerb}</strong>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Benchmark: <strong>{selectedCLO.passingBenchmark || 60}%</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{selectedCLO.statement || 'No statement entered for this outcome.'}"
                    </p>
                  </div>
                )}

                {/* Rubric Title Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rubric Title
                  </label>
                  <input
                    type="text"
                    value={rubricTitle}
                    onChange={(e) => setRubricTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. CLO 1 Analytical Evaluation Rubric"
                  />
                </div>
              </div>

              {/* Bloom's Guidance Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-bold text-indigo-900">
                    Bloom's Level {BLOOM_LEVELS.indexOf(selectedBloomLevel) + 1} ({selectedBloomLevel}):
                  </span>
                  <span className="text-slate-600 hidden md:inline">
                    {bloomDetails[0]?.cognitiveFocus || 'Authentic performance measurement criteria'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isAiGenerating ? 'animate-spin' : ''}`} />
                    <span>{isAiGenerating ? 'Synthesizing...' : 'AI Re-suggest'}</span>
                  </button>
                  <button
                    onClick={handleAutoBalance}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
                    title="Scale criteria weights so they sum to 100%"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Auto-Balance to 100%</span>
                  </button>
                </div>
              </div>

              {/* Interactive Matrix Preview Mode */}
              {previewMatrixOpen ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Table className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Rubric Scoring Matrix Preview</span>
                    </h3>
                    <span className={`text-xs font-bold ${totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      Total Weight: {totalWeight}% {totalWeight !== 100 && '(Needs 100%)'}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 font-bold w-48 border-r border-slate-800">Evaluation Criterion</th>
                          <th className="p-2.5 font-bold w-20 text-center border-r border-slate-800">Weight</th>
                          <th className="p-2.5 font-semibold bg-rose-950/80 border-r border-slate-800 w-44">
                            Not Achieved (0-49%)
                          </th>
                          <th className="p-2.5 font-semibold bg-amber-950/80 border-r border-slate-800 w-44">
                            Developing (50-64%)
                          </th>
                          <th className="p-2.5 font-semibold bg-indigo-950/80 border-r border-slate-800 w-44">
                            Achieved (65-74%)
                          </th>
                          <th className="p-2.5 font-semibold bg-blue-950/80 border-r border-slate-800 w-44">
                            Proficient (75-84%)
                          </th>
                          <th className="p-2.5 font-semibold bg-emerald-950/80 w-44">
                            Exemplary (85-100%)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {criteria.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-900 align-top border-r border-slate-200">
                              <div>{c.criterionName}</div>
                              <span className="text-[10px] text-slate-400 font-normal">{selectedCLO?.code}</span>
                            </td>
                            <td className="p-2.5 font-bold text-slate-800 text-center align-top border-r border-slate-200">
                              {c.weight}%
                            </td>
                            {c.levels.map((lvl, lIdx) => (
                              <td key={lIdx} className="p-2.5 text-slate-700 align-top border-r border-slate-200 text-[11px] leading-relaxed">
                                {lvl.descriptor}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Criteria Customizer Cards */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Criteria Suggestions ({criteria.length})
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span
                        className={`text-xs font-bold ${
                          totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        Total Weight: {totalWeight}% {totalWeight !== 100 && '(Adjust to 100%)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Criterion</span>
                    </button>
                  </div>

                  {criteria.map((crit, idx) => {
                    const isExpanded = expandedCriteria[crit.id] ?? true;
                    return (
                      <div
                        key={crit.id}
                        className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs transition"
                      >
                        {/* Criterion Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div className="flex-1 flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-400 shrink-0">#{idx + 1}</span>
                            <input
                              type="text"
                              value={crit.criterionName}
                              onChange={(e) => handleUpdateCriterion(crit.id, { criterionName: e.target.value })}
                              placeholder="Criterion Name"
                              className="w-full px-2.5 py-1 text-xs font-bold rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {/* Weight Input */}
                            <div className="flex items-center space-x-1">
                              <span className="text-[11px] text-slate-500 font-medium">Weight:</span>
                              <input
                                type="number"
                                min={5}
                                max={100}
                                value={crit.weight}
                                onChange={(e) => handleUpdateCriterion(crit.id, { weight: Number(e.target.value) })}
                                className="w-16 px-2 py-1 text-xs rounded-md border border-slate-300 bg-white text-center font-bold text-slate-800"
                              />
                              <span className="text-xs text-slate-500">%</span>
                            </div>

                            {/* Collapse/Expand Descriptors Button */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(crit.id)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                              title={isExpanded ? 'Collapse 5-level descriptors' : 'Expand 5-level descriptors'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {/* Delete Criterion */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCriterion(crit.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="Delete criterion"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* 5-Level Performance Descriptors Grid */}
                        {isExpanded && (
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-1 animate-in fade-in duration-100">
                            {crit.levels.map((lvl, lIdx) => (
                              <div
                                key={lIdx}
                                className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex flex-col justify-between space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${
                                      lvl.level === 'Exemplary'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : lvl.level === 'Proficient'
                                        ? 'bg-blue-100 text-blue-800'
                                        : lvl.level === 'Achieved'
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : lvl.level === 'Developing'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {lvl.level}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{lvl.pointsRange}</span>
                                </div>
                                <textarea
                                  rows={3}
                                  value={lvl.descriptor}
                                  onChange={(e) => {
                                    const newLevels = [...crit.levels];
                                    newLevels[lIdx] = { ...newLevels[lIdx], descriptor: e.target.value };
                                    handleUpdateCriterion(crit.id, { levels: newLevels });
                                  }}
                                  className="w-full text-[11px] p-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 leading-relaxed text-slate-700"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Batch Mode: Generate for Each CLO */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    One-Click Batch Rubric Generator for All Learning Outcomes
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatically generate custom 5-level grading rubrics for every CLO defined in this course. Each rubric is uniquely tailored to the outcome's Bloom's Taxonomy cognitive tier and automatically linked to relevant assessments.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={batchAssignAssessments}
                      onChange={(e) => setBatchAssignAssessments(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Link created rubrics to corresponding assessment components</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={batchReplaceExisting}
                      onChange={(e) => setBatchReplaceExisting(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Replace existing rubrics (unchecked = append to existing)</span>
                  </label>
                </div>
              </div>

              {/* CLO Breakdown List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Course Outcomes to be Rubricated ({course.clos.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.clos.map((clo, idx) => {
                    const bloom = clo.bloomLevel || 'Analyze';
                    const matchedAsmt = course.assessments.find((a) => a.linkedCLOIds?.includes(clo.id));
                    const existingRubric = course.rubrics.find((r) =>
                      r.criteria.some((c) => c.cloId === clo.id) || r.assessmentId === matchedAsmt?.id
                    );

                    return (
                      <div
                        key={clo.id}
                        className={`p-3 rounded-xl border ${BLOOM_STYLES[bloom].bg} ${BLOOM_STYLES[bloom].border} space-y-2`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{clo.code}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${BLOOM_STYLES[bloom].badgeBg}`}>
                              {bloom}
                            </span>
                          </div>
                          {existingRubric ? (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Rubric Exists</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-semibold">Ready to Generate</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 line-clamp-2 italic">
                          "{clo.statement || 'Outcome statement'}"
                        </p>

                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                          <span>
                            Assessment: <strong>{matchedAsmt ? matchedAsmt.name : `Assessment #${idx + 1}`}</strong>
                          </span>
                          <span>4 Criteria • 100% Weight</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === 'structured' ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Use the generator action bar above to apply or save rubrics
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : activeTab === 'single' ? (
            <div className="flex items-center space-x-2">
              {targetRubricId && (
                <button
                  onClick={() => handleSaveSingleRubric('replace')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                  title="Update currently selected rubric in Step 11"
                >
                  Update Current Rubric
                </button>
              )}

              <button
                onClick={() => handleSaveSingleRubric('create')}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Rubric for {selectedCLO?.code || 'CLO'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleBatchGenerate}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 flex items-center space-x-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Rubrics for All {course.clos.length} CLOs</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
