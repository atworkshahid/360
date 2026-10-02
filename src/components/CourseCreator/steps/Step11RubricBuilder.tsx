import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Table,
  CheckCircle2,
  Award,
  Layers,
  Brain,
  SlidersHorizontal,
  FileSpreadsheet,
  Check,
  Target,
  FolderOpen,
} from 'lucide-react';
import { Course, Rubric, RubricCriterion } from '../../../types';
import { generateRubricCriteria } from '../../../services/api';
import { RubricGeneratorModal } from '../RubricGeneratorModal';
import { StructuredRubricGenerator } from '../StructuredRubricGenerator';
import { CourseResourceLibrary } from '../../ResourceLibrary/CourseResourceLibrary';
import { InlineSectionFeedback } from '../comments/InlineSectionFeedback';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step11RubricBuilder: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [selectedRubricId, setSelectedRubricId] = useState<string>(course.rubrics[0]?.id || '');
  const [activeView, setActiveView] = useState<'generator' | 'editor' | 'overview'>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorModalOpen, setGeneratorModalOpen] = useState<boolean>(false);
  const [generatorCLOId, setGeneratorCLOId] = useState<string | undefined>(course.clos[0]?.id);
  const [resourceLibraryOpen, setResourceLibraryOpen] = useState<boolean>(false);

  const selectedRubric = course.rubrics.find((r) => r.id === selectedRubricId) || course.rubrics[0];

  const handleUpdateRubrics = (updatedRubrics: Rubric[]) => {
    onChange({ ...course, rubrics: updatedRubrics });
  };

  const handleUpdateRubric = (id: string, updates: Partial<Rubric>) => {
    const updated = course.rubrics.map((r) => (r.id === id ? { ...r, ...updates } : r));
    handleUpdateRubrics(updated);
  };

  const handleAddRubric = () => {
    const asmt = course.assessments.find((a) => a.type !== 'Quiz') || course.assessments[0];
    const newRubric: Rubric = {
      id: `rubric-${Date.now()}`,
      title: `${asmt?.name || 'Performance'} Evaluation Rubric`,
      assessmentId: asmt?.id || '',
      criteria: [
        {
          id: `crit-${Date.now()}-1`,
          criterionName: 'Doctrinal Accuracy & Statutory Interpretation',
          cloId: course.clos[0]?.id || '',
          weight: 50,
          levels: [
            { level: 'Not Achieved', descriptor: 'Fundamental conceptual lapses and inability to apply statutory rules.', pointsRange: '0-49%' },
            { level: 'Developing', descriptor: 'Identifies basic principles but exhibits noticeable conceptual confusion.', pointsRange: '50-64%' },
            { level: 'Achieved', descriptor: 'Accurately interprets and applies relevant statutory provisions.', pointsRange: '65-74%' },
            { level: 'Proficient', descriptor: 'Nuanced doctrinal application with authoritative statutory citations.', pointsRange: '75-84%' },
            { level: 'Exemplary', descriptor: 'Masterful, publication-caliber jurisprudential synthesis.', pointsRange: '85-100%' },
          ],
        },
        {
          id: `crit-${Date.now()}-2`,
          criterionName: 'Analytical Rigor & Scenario Argumentation',
          cloId: course.clos[1]?.id || course.clos[0]?.id || '',
          weight: 50,
          levels: [
            { level: 'Not Achieved', descriptor: 'Descriptive claims with no legal analysis or defensible reasoning.', pointsRange: '0-49%' },
            { level: 'Developing', descriptor: 'Simplistic deductions with unexamined assumptions.', pointsRange: '50-64%' },
            { level: 'Achieved', descriptor: 'Systematic legal analysis directly addressing the factual dispute.', pointsRange: '65-74%' },
            { level: 'Proficient', descriptor: 'Sophisticated argumentation evaluating counterarguments and edge cases.', pointsRange: '75-84%' },
            { level: 'Exemplary', descriptor: 'Airtight, visionary legal reasoning resolving complex conflicts.', pointsRange: '85-100%' },
          ],
        },
      ],
    };

    const updated = [...course.rubrics, newRubric];
    handleUpdateRubrics(updated);
    setSelectedRubricId(newRubric.id);
  };

  const handleDeleteRubric = (id: string) => {
    const filtered = course.rubrics.filter((r) => r.id !== id);
    handleUpdateRubrics(filtered);
    if (selectedRubricId === id) {
      setSelectedRubricId(filtered[0]?.id || '');
    }
  };

  const handleUpdateCriterion = (critId: string, updates: Partial<RubricCriterion>) => {
    if (!selectedRubric) return;
    const updatedCriteria = selectedRubric.criteria.map((c) => (c.id === critId ? { ...c, ...updates } : c));
    handleUpdateRubric(selectedRubric.id, { criteria: updatedCriteria });
  };

  const handleAddCriterion = () => {
    if (!selectedRubric) return;
    const newCrit: RubricCriterion = {
      id: `crit-${Date.now()}`,
      criterionName: 'Scholarly Writing & Citation Discipline',
      cloId: course.clos[0]?.id || '',
      weight: 25,
      levels: [
        { level: 'Not Achieved', descriptor: 'Disorganized structure with frequent citation errors.', pointsRange: '0-49%' },
        { level: 'Developing', descriptor: 'Basic organization but inconsistent academic formatting.', pointsRange: '50-64%' },
        { level: 'Achieved', descriptor: 'Clear structure adhering to legal citation conventions.', pointsRange: '65-74%' },
        { level: 'Proficient', descriptor: 'Polished rhetoric with precise citations throughout.', pointsRange: '75-84%' },
        { level: 'Exemplary', descriptor: 'Exceptional appellate-quality prose and impeccable citations.', pointsRange: '85-100%' },
      ],
    };
    handleUpdateRubric(selectedRubric.id, { criteria: [...selectedRubric.criteria, newCrit] });
  };

  const handleDeleteCriterion = (critId: string) => {
    if (!selectedRubric) return;
    handleUpdateRubric(selectedRubric.id, {
      criteria: selectedRubric.criteria.filter((c) => c.id !== critId),
    });
  };

  const handleAiGenerateRubric = async () => {
    if (!selectedRubric) return;
    const asmt = course.assessments.find((a) => a.id === selectedRubric.assessmentId) || course.assessments[0];
    const cloNames = course.clos.map((c) => `${c.code}: ${c.statement}`);
    const primaryCLO = course.clos.find((c) => c.id === selectedRubric.criteria[0]?.cloId) || course.clos[0];

    setIsGenerating(true);
    const criteria = await generateRubricCriteria(
      asmt?.name || selectedRubric.title,
      asmt?.type || 'Assignment',
      cloNames,
      primaryCLO?.bloomLevel,
      primaryCLO?.statement
    );
    setIsGenerating(false);

    if (criteria && criteria.length > 0) {
      const mapped = criteria.map((crit, idx) => ({
        ...crit,
        cloId: course.clos[idx % course.clos.length]?.id || course.clos[0]?.id || '',
      }));
      handleUpdateRubric(selectedRubric.id, { criteria: mapped });
    }
  };

  const totalCriteriaWeight = selectedRubric?.criteria.reduce((acc, c) => acc + (c.weight || 0), 0) || 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 11</span>
          <span>•</span>
          <span>Qualitative Standards</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Assessment Rubrics & Standards</h2>
            <p className="text-xs text-slate-500 mt-1">
              Construct structured, criteria-based evaluation rubrics (criteria vs. performance levels) aligned directly with Course Learning Outcomes and Bloom's cognitive tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setGeneratorCLOId(course.clos[0]?.id);
                setActiveView('generator');
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Open Structured Rubric Matrix Generator"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Structured Matrix Generator</span>
            </button>
            <button
              type="button"
              id="step11-open-resource-library-btn"
              onClick={() => setResourceLibraryOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Browse and attach rubrics and scoring guides from Course Resource Library"
            >
              <FolderOpen className="w-4 h-4 text-teal-600" />
              <span>Resource Library (Rubrics)</span>
            </button>
            <button
              onClick={handleAddRubric}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Rubric</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="step11-tab-generator"
            onClick={() => setActiveView('generator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeView === 'generator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Rubric Generator</span>
          </button>

          <button
            type="button"
            id="step11-tab-editor"
            onClick={() => setActiveView('editor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeView === 'editor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Detailed Criteria Editor</span>
            {selectedRubric && (
              <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${activeView === 'editor' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {selectedRubric.criteria.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="step11-tab-overview"
            onClick={() => setActiveView('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeView === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Course Rubrics Overview</span>
            <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${activeView === 'overview' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {course.rubrics.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          Stage 11: {course.rubrics.length} rubrics configured
        </span>
      </div>

      {/* VIEW 1: DEDICATED STRUCTURED RUBRIC GENERATOR SUB-COMPONENT */}
      {activeView === 'generator' && (
        <StructuredRubricGenerator
          course={course}
          onChange={onChange}
          activeRubricId={selectedRubricId}
          onSelectRubricId={(id) => {
            setSelectedRubricId(id);
          }}
          initialCLOId={generatorCLOId}
          onAskCopilot={onAskCopilot}
        />
      )}

      {/* VIEW 2: MANUAL CRITERIA EDITOR */}
      {activeView === 'editor' && (
        <div className="space-y-6">
          {/* Rubric Selector Pills */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none flex-1">
              {course.rubrics.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRubricId(r.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 border cursor-pointer ${
                    (selectedRubric?.id || '') === r.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Table className="w-3.5 h-3.5 text-slate-400" />
                  <span className="max-w-[140px] truncate">{r.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({r.criteria.length} crit.)</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setGeneratorCLOId(course.clos[0]?.id);
                setActiveView('generator');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 flex items-center space-x-1.5 shrink-0 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Switch to Matrix Generator</span>
            </button>
          </div>

          {/* Selected Rubric Form */}
          {selectedRubric ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-800">Rubric Blueprint</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span
                    className={`text-xs font-bold ${
                      totalCriteriaWeight === 100 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    Weight Sum: {totalCriteriaWeight}% {totalCriteriaWeight === 100 ? '(Balanced)' : '(Must sum to 100%)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteRubric(selectedRubric.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                  title="Delete Rubric"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rubric Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedRubric.title}
                    onChange={(e) => handleUpdateRubric(selectedRubric.id, { title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Associated Assessment</label>
                  <select
                    value={selectedRubric.assessmentId}
                    onChange={(e) => handleUpdateRubric(selectedRubric.id, { assessmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {course.assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Criteria Cards */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Evaluation Criteria ({selectedRubric.criteria.length})
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratorCLOId(selectedRubric.criteria[0]?.cloId || course.clos[0]?.id);
                        setActiveView('generator');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Matrix Generator</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Criterion</span>
                    </button>
                  </div>
                </div>

                {selectedRubric.criteria.map((crit, idx) => {
                  const mappedCLO = course.clos.find((c) => c.id === crit.cloId);
                  return (
                    <div key={crit.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200/80">
                        <div className="flex-1 flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-500 shrink-0">#{idx + 1}</span>
                          <input
                            type="text"
                            value={crit.criterionName}
                            onChange={(e) => handleUpdateCriterion(crit.id, { criterionName: e.target.value })}
                            placeholder="Criterion Name"
                            className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-[11px] text-slate-500">CLO:</span>
                            <select
                              value={crit.cloId}
                              onChange={(e) => handleUpdateCriterion(crit.id, { cloId: e.target.value })}
                              className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                            >
                              {course.clos.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.code}
                                </option>
                              ))}
                            </select>
                            {mappedCLO && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0"
                                title={`Cognitive Level: ${mappedCLO.bloomLevel || 'Analyze'}`}
                              >
                                {mappedCLO.bloomLevel || 'Analyze'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setGeneratorCLOId(crit.cloId);
                                setActiveView('generator');
                              }}
                              className="p-1 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition cursor-pointer"
                              title={`Generate criteria aligned to ${mappedCLO?.code || 'CLO'}`}
                            >
                              <Brain className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="text-[11px] text-slate-500">Weight:</span>
                            <input
                              type="number"
                              min={5}
                              max={100}
                              value={crit.weight}
                              onChange={(e) => handleUpdateCriterion(crit.id, { weight: Number(e.target.value) })}
                              className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white text-center font-bold"
                            />
                            <span className="text-xs text-slate-500">%</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCriterion(crit.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            title="Delete criterion"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Descriptors Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-1">
                        {(crit.levels || []).map((lvl, lIdx) => (
                          <div key={lIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex flex-col justify-between space-y-1.5">
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
                              className="w-full text-[11px] p-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Table className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Rubrics Defined Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate structured assessment rubrics mapped to course outcomes with our dedicated CLO generator.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('generator')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Launch Structured Generator
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: ALL RUBRICS OVERVIEW TABLE */}
      {activeView === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Course Assessment Rubrics Dossier</h3>
              <p className="text-xs text-slate-500">
                Summary of all qualitative assessment rubrics, their linked assessments, and mapped outcomes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('generator')}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Generate New Rubric</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Rubric Title</th>
                  <th className="p-3">Associated Assessment</th>
                  <th className="p-3">Criteria Count</th>
                  <th className="p-3">Mapped CLOs</th>
                  <th className="p-3">Weight Total</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {course.rubrics.map((rubric) => {
                  const asmt = course.assessments.find((a) => a.id === rubric.assessmentId);
                  const mappedCLOIds = Array.from(new Set(rubric.criteria.map((c) => c.cloId).filter(Boolean)));
                  const mappedCLOs = course.clos.filter((c) => mappedCLOIds.includes(c.id));
                  const sumWeight = rubric.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

                  return (
                    <tr key={rubric.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-slate-900">{rubric.title}</td>
                      <td className="p-3 text-slate-600">
                        {asmt ? `${asmt.name} (${asmt.type})` : <span className="text-slate-400 italic">Unlinked</span>}
                      </td>
                      <td className="p-3 text-slate-600">{rubric.criteria.length} criteria</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {mappedCLOs.map((clo) => (
                            <span
                              key={clo.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                            >
                              {clo.code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            sumWeight === 100
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sumWeight}%
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRubricId(rubric.id);
                            setActiveView('editor');
                          }}
                          className="px-2 py-1 text-slate-600 hover:text-indigo-600 font-semibold hover:bg-indigo-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRubricId(rubric.id);
                            if (mappedCLOs[0]) setGeneratorCLOId(mappedCLOs[0].id);
                            setActiveView('generator');
                          }}
                          className="px-2 py-1 text-indigo-600 font-bold hover:bg-indigo-50 rounded"
                        >
                          Open Matrix
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rubric Section Collaborative Comments Thread */}
      <div className="pt-2">
        <InlineSectionFeedback
          course={course}
          onChangeCourse={onChange}
          sectionKey="step-11-rubrics"
          sectionTitle="Step 11: Grading Rubrics & Evaluative Descriptors"
          stepNumber={11}
          targetType="Rubric"
        />
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Builder</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to Evidence Rules</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Legacy/Extended Modal */}
      <RubricGeneratorModal
        isOpen={generatorModalOpen}
        onClose={() => setGeneratorModalOpen(false)}
        course={course}
        onChange={onChange}
        initialCLOId={generatorCLOId}
        targetRubricId={selectedRubric?.id}
      />

      {/* Centralized Course Resource Library (Rubrics View) */}
      <CourseResourceLibrary
        course={course}
        isOpen={resourceLibraryOpen}
        onClose={() => setResourceLibraryOpen(false)}
        onUpdateCourse={onChange}
        initialCategory="Rubric"
        mode="modal"
      />
    </div>
  );
};
