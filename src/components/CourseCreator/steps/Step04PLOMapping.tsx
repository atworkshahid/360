import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Layers,
  Table as TableIcon,
  LayoutGrid,
  BookOpen,
} from 'lucide-react';
import { Course, PLO, CLO, MappingLevel } from '../../../types';
import { OutcomeDependencyGraph } from '../OutcomeDependencyGraph';
import { MasteryPathTimeline } from '../MasteryPathTimeline';
import { MasteryTree } from '../MasteryTree';
import { CognitiveIntensityRadar } from '../CognitiveIntensityRadar';
import { evaluateStage } from '../../../utils/stageProgress';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step04PLOMapping: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'combined' | 'competencies'>('graph');
  const [selectedMapping, setSelectedMapping] = useState<{ cloId: string; ploId: string } | null>(null);
  const [newPLOCode, setNewPLOCode] = useState('');
  const [newPLOTitle, setNewPLOTitle] = useState('');

  const plos = course.plos || [];
  const clos = course.clos || [];

  // Competency/Skill handlers
  const handleUpdateCLOCompetencies = (cloId: string, competency: string, skills: string) => {
    const updatedCLOs = clos.map((c) => (c.id === cloId ? { ...c, competency, skills } : c));
    onChange({ ...course, clos: updatedCLOs });
  };

  const handleSetMapping = (cloId: string, ploId: string, level: MappingLevel | 'None') => {
    const clo = clos.find((c) => c.id === cloId);
    if (!clo) return;

    let updatedMappings = [...(clo.mappedPLOs || [])];
    if (level === 'None') {
      updatedMappings = updatedMappings.filter((m) => m.ploId !== ploId);
    } else {
      const existingIdx = updatedMappings.findIndex((m) => m.ploId !== ploId);
      const current = updatedMappings.find((m) => m.ploId === ploId);
      const defaultRationale = `Supports ${plos.find((p) => p.id === ploId)?.code || 'PLO'} through observable demonstration in ${clo.code}.`;

      if (current) {
        current.level = level;
      } else {
        updatedMappings.push({
          ploId,
          level,
          rationale: defaultRationale,
        });
      }
    }

    const updatedCLOs = clos.map((c) => (c.id === cloId ? { ...c, mappedPLOs: updatedMappings } : c));
    onChange({ ...course, clos: updatedCLOs });
  };

  const handleUpdateRationale = (cloId: string, ploId: string, rationale: string) => {
    const updatedCLOs = clos.map((c) => {
      if (c.id === cloId) {
        const mappings = (c.mappedPLOs || []).map((m) => (m.ploId === ploId ? { ...m, rationale } : m));
        return { ...c, mappedPLOs: mappings };
      }
      return c;
    });
    onChange({ ...course, clos: updatedCLOs });
  };

  const handleAddPLO = () => {
    if (!newPLOCode.trim() || !newPLOTitle.trim()) return;
    const newPLO: PLO = {
      id: `plo-${Date.now()}`,
      code: newPLOCode.trim(),
      title: newPLOTitle.trim(),
      description: 'Program Learning Outcome defined for ' + (course.programme || 'Degree Programme'),
    };
    onChange({ ...course, plos: [...plos, newPLO] });
    setNewPLOCode('');
    setNewPLOTitle('');
  };

  const handleDeletePLO = (id: string) => {
    const filteredPLOs = plos.filter((p) => p.id !== id);
    const updatedCLOs = clos.map((c) => ({
      ...c,
      mappedPLOs: (c.mappedPLOs || []).filter((m) => m.ploId !== id),
    }));
    onChange({ ...course, plos: filteredPLOs, clos: updatedCLOs });
  };

  // Alignment checks
  const unmappedCLOs = clos.filter((c) => !c.mappedPLOs || c.mappedPLOs.length === 0);
  const unmappedPLOs = plos.filter((p) => !clos.some((c) => (c.mappedPLOs || []).some((m) => m.ploId === p.id)));

  // Mastery Progress Calculation
  const proficientOrExpertCount = clos.filter(c => c.proficiencyLevel === 'Proficient' || c.proficiencyLevel === 'Expert').length;
  const masteryPercentage = clos.length > 0 ? Math.round((proficientOrExpertCount / clos.length) * 100) : 0;

  // Live Accreditation Evaluation for Stage 04
  const stageEval = evaluateStage(course, 4, 'granular15');

  const handleApplyPresetPLOs = (type: 'abet' | 'wa' | 'cs') => {
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

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Stage 04</span>
          <span>•</span>
          <span>Curricular Alignment</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">CLO → PLO Mapping Matrix</h2>
            <p className="text-xs text-slate-500 mt-1">
              Demonstrate constructive programmatic alignment. Every CLO must connect to at least one Programme Learning Outcome with an explicit academic rationale.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onAskCopilot(
                `Suggest optimal CLO to PLO mappings with accreditation rationales for course "${course.title}".`
              )
            }
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mapping Advisor</span>
          </button>
        </div>
      </div>

      {/* Live Accreditation Readiness Card */}
      <div
        id="step04-granular-accreditation-card"
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
              <span>{stageEval.isCompleted ? 'CLO-PLO Alignment Validated' : 'Curricular Mapping Pending'}</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-white/70 border border-current">
                Stage 04 • Curricular Audit
              </span>
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">
              {stageEval.isCompleted
                ? stageEval.summary
                : `Action required: ${stageEval.missingRequirements.join(', ')}`}
            </div>
          </div>
        </div>
        
        {/* Mastery Progress Bar */}
        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-600">
            <span>Skill Mastery</span>
            <span>{masteryPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${masteryPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* PLO Framework Quick-Presets Bar */}
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
          </div>
        </div>
      )}

      {/* Warning banner if gaps */}
      {(unmappedCLOs.length > 0 || unmappedPLOs.length > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Accreditation Mapping Gaps Detected:</span>
            {unmappedCLOs.length > 0 && (
              <p>• {unmappedCLOs.length} CLO(s) have zero mapped PLOs ({unmappedCLOs.map((c) => c.code).join(', ')}).</p>
            )}
            {unmappedPLOs.length > 0 && (
              <p>• {unmappedPLOs.length} PLO(s) are not addressed by any CLO in this course.</p>
            )}
          </div>
        </div>
      )}

      {/* View Switcher Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'graph'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Visual Dependency Graph</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold">
              ReactFlow
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Alignment Matrix Table</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'combined'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span>Combined View</span>
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('competencies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'competencies'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Competencies & Skills Mapping</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 px-2">
          <span>
            {viewMode === 'graph'
              ? 'Interactive graph with drag connections, path isolation, and live level editors'
              : viewMode === 'matrix'
              ? 'Tabular spreadsheet view with quick I/R/M dropdowns'
              : 'Both visual dependency flow and tabular matrix active'}
          </span>
        </div>
      </div>

      {/* Competency & Skill Mapping Table */}
      {viewMode === 'competencies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-800">Competency & Skill Mapping</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Map each Course Learning Outcome to specific competencies and skills.</p>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold w-1/4">CLO</th>
                  <th className="p-3 font-bold">Competency</th>
                  <th className="p-3 font-bold">Skills</th>
                  <th className="p-3 font-bold">Proficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clos.map((clo) => (
                  <tr key={clo.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-bold text-blue-900">{clo.code}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={clo.competency || ''}
                        onChange={(e) => handleUpdateCLOCompetencies(clo.id, e.target.value, clo.skills || '')}
                        placeholder="e.g., Analytical Thinking"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={clo.skills || ''}
                        onChange={(e) => handleUpdateCLOCompetencies(clo.id, clo.competency || '', e.target.value)}
                        placeholder="e.g., Data Visualization, Python"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={clo.proficiencyLevel || 'Novice'}
                          onChange={(e) => {
                              const updatedCLOs = clos.map((c) => (c.id === clo.id ? { ...c, proficiencyLevel: e.target.value as any } : c));
                              onChange({ ...course, clos: updatedCLOs });
                          }}
                          className="px-2 py-1 text-xs rounded border border-slate-300"
                        >
                          <option value="Novice">Novice</option>
                          <option value="Proficient">Proficient</option>
                          <option value="Expert">Expert</option>
                        </select>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          (clo.proficiencyLevel || 'Novice') === 'Expert' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          (clo.proficiencyLevel || 'Novice') === 'Proficient' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {clo.proficiencyLevel || 'Novice'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MasteryPathTimeline course={course} />
          <MasteryTree course={course} />
          <CognitiveIntensityRadar course={course} />
        </div>
      )}

      {/* Visual Dependency Graph (ReactFlow) */}
      {(viewMode === 'graph' || viewMode === 'combined') && (
        <div className="space-y-2">
          {viewMode === 'combined' && (
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-1">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Interactive Graph View</span>
            </div>
          )}
          <OutcomeDependencyGraph
            course={course}
            onUpdateCourse={onChange}
            onAskCopilot={onAskCopilot}
            height={viewMode === 'combined' ? '540px' : '650px'}
          />
        </div>
      )}

      {/* Matrix Table */}
      {(viewMode === 'matrix' || viewMode === 'combined') && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Alignment Matrix Table</span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  <span className="text-slate-600">I = Introduced</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                  <span className="text-slate-600">R = Reinforced</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span className="text-slate-600">M = Mastered</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                    <th className="p-3 font-bold w-1/3">Course Learning Outcome (CLO)</th>
                    {plos.map((plo) => (
                      <th key={plo.id} className="p-3 font-bold text-center border-l border-slate-200 min-w-[120px]">
                        <div className="flex items-center justify-center space-x-1">
                          <span>{plo.code}</span>
                          <button
                            onClick={() => handleDeletePLO(plo.id)}
                            className="text-slate-400 hover:text-rose-500"
                            title="Delete PLO"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] font-normal text-slate-500 block truncate" title={plo.title}>
                          {plo.title}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clos.map((clo) => (
                    <tr key={clo.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{clo.code}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-2">{clo.statement}</span>
                      </td>
                      {plos.map((plo) => {
                        const currentMap = (clo.mappedPLOs || []).find((m) => m.ploId === plo.id);
                        const level = currentMap?.level || 'None';
                        return (
                          <td key={plo.id} className="p-3 text-center border-l border-slate-100 align-middle">
                            <select
                              value={level}
                              onChange={(e) => handleSetMapping(clo.id, plo.id, e.target.value as any)}
                              className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none transition cursor-pointer ${
                                level === 'Mastered'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : level === 'Reinforced'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                                  : level === 'Introduced'
                                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : 'bg-white text-slate-400 border-slate-200'
                              }`}
                            >
                              <option value="None">- None -</option>
                              <option value="Introduced">Introduced (I)</option>
                              <option value="Reinforced">Reinforced (R)</option>
                              <option value="Mastered">Mastered (M)</option>
                            </select>

                            {currentMap && (
                              <button
                                type="button"
                                onClick={() => setSelectedMapping({ cloId: clo.id, ploId: plo.id })}
                                className="block text-[10px] text-blue-600 hover:underline mx-auto mt-1"
                              >
                                Edit Rationale
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rationale Editor Modal/Drawer if mapping clicked */}
          {selectedMapping && (() => {
            const clo = clos.find((c) => c.id === selectedMapping.cloId);
            const plo = plos.find((p) => p.id === selectedMapping.ploId);
            const mapItem = (clo?.mappedPLOs || []).find((m) => m.ploId === selectedMapping.ploId);

            return (
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-blue-900">
                    Accreditation Mapping Rationale: {clo?.code} ➔ {plo?.code}
                  </div>
                  <button
                    onClick={() => setSelectedMapping(null)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Close
                  </button>
                </div>
                <p className="text-[11px] text-blue-800">
                  Accreditation reviewers (e.g., ABET, HEC, AACSB) require explicit justifications explaining why this CLO delivers on the specified programme learning outcome.
                </p>
                <textarea
                  rows={2}
                  value={mapItem?.rationale || ''}
                  onChange={(e) => handleUpdateRationale(selectedMapping.cloId, selectedMapping.ploId, e.target.value)}
                  placeholder="Explain how the student's mastery in this CLO directly contributes to the programme outcome..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            );
          })()}
        </>
      )}

      {/* Add New Programme Learning Outcome Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-slate-800 block">Add Programme Learning Outcome (PLO)</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              placeholder="Code (e.g. PLO 5)"
              value={newPLOCode}
              onChange={(e) => setNewPLOCode(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Title (e.g. Constitutional & Environmental Ethics)"
              value={newPLOTitle}
              onChange={(e) => setNewPLOTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div>
            <button
              onClick={handleAddPLO}
              disabled={!newPLOCode.trim() || !newPLOTitle.trim()}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              Add PLO
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CLO Creator</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Save & Proceed to Module Creator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
