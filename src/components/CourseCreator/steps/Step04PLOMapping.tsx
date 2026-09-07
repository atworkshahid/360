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
} from 'lucide-react';
import { Course, PLO, CLO, MappingLevel } from '../../../types';
import { OutcomeDependencyGraph } from '../OutcomeDependencyGraph';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onPrev: () => void;
  onAskCopilot: (prompt: string) => void;
}

export const Step04PLOMapping: React.FC<StepProps> = ({ course, onChange, onNext, onPrev, onAskCopilot }) => {
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'combined'>('graph');
  const [selectedMapping, setSelectedMapping] = useState<{ cloId: string; ploId: string } | null>(null);
  const [newPLOCode, setNewPLOCode] = useState('');
  const [newPLOTitle, setNewPLOTitle] = useState('');

  const plos = course.plos || [];
  const clos = course.clos || [];

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
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mapping Advisor</span>
          </button>
        </div>
      </div>

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
