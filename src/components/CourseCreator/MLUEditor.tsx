import React, { useState } from 'react';
import { Course } from '../../types';
import { MicroLearningUnit, ModularLearningOutcome } from '../../types/mlu';
import { Plus, Trash2, Zap, Loader2, Target, BookOpen, AlertTriangle, MessageSquare } from 'lucide-react';
import { generateMLOEvidence, suggestSemanticPLOAlignments } from '../../services/mluGeneratorService';
import { tagCLOBlooms } from '../../utils/bloomsTagger';
import { CommentPanel } from '../Collaboration/CommentPanel';
import { QuizGeneratorModal } from './QuizGeneratorModal';
import { suggestResources } from '../../services/resourceLinkerService';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { MLOSyncStatusIndicator } from './MLOSyncStatusIndicator';
import { FloatingBulkToolbar } from './FloatingBulkToolbar';

interface MLUEditorProps {
  unit: MicroLearningUnit;
  mlos: ModularLearningOutcome[];
  course: Course;
  onUpdateUnit: (updatedUnit: MicroLearningUnit) => void;
  onUpdateMLOs: (updatedMLOs: ModularLearningOutcome[]) => void;
}

export const MLUEditor: React.FC<MLUEditorProps> = ({ unit, mlos, course, onUpdateUnit, onUpdateMLOs }) => {
  const { queue } = useOfflineSync();
  const [localUnit, setLocalUnit] = useState(unit);
  const [localMLOs, setLocalMLOs] = useState(mlos);
  const [generatingEvidence, setGeneratingEvidence] = useState<Record<string, boolean>>({});
  const [selectedMLOIds, setSelectedMLOIds] = useState<string[]>([]);
  const [pendingEvidence, setPendingEvidence] = useState<Record<string, Partial<ModularLearningOutcome>>>({});
  const [aligningPLOs, setAligningPLOs] = useState(false);
  const [pendingAlignments, setPendingAlignments] = useState<Record<string, string[]>>({});
  const [activeCommentMLOId, setActiveCommentMLOId] = useState<string | null>(null);
  const [activeQuizMLO, setActiveQuizMLO] = useState<ModularLearningOutcome | null>(null);
  const [suggestedVerbs, setSuggestedVerbs] = useState<Record<string, string[]>>({});
  const [suggestedResources, setSuggestedResources] = useState<Record<string, any[]>>({});
  const [loadingResources, setLoadingResources] = useState<Record<string, boolean>>({});

  const handleGenerateEvidence = async (mlo: ModularLearningOutcome) => {
    setGeneratingEvidence((prev) => ({ ...prev, [mlo.id]: true }));
    try {
      const evidence = await generateMLOEvidence(mlo, course);
      setPendingEvidence((prev) => ({ ...prev, [mlo.id]: evidence }));
    } catch (err) {
      console.error("Failed to generate evidence", err);
    } finally {
      setGeneratingEvidence((prev) => ({ ...prev, [mlo.id]: false }));
    }
  };

  const acceptEvidence = (mloId: string) => {
    const evidence = pendingEvidence[mloId];
    if (evidence) {
        const updatedMLOs = localMLOs.map((m) =>
            m.id === mloId ? { ...m, ...evidence } : m
        );
        setLocalMLOs(updatedMLOs);
        onUpdateMLOs(updatedMLOs);
        setPendingEvidence(prev => {
            const next = {...prev};
            delete next[mloId];
            return next;
        });
    }
  }
  
  const discardEvidence = (mloId: string) => {
      setPendingEvidence(prev => {
          const next = {...prev};
          delete next[mloId];
          return next;
      });
  }

  const handleBulkAlignPLOs = async () => {
    const unmappedMLOs = localMLOs.filter(mlo => !mlo.relatedPLOIds || mlo.relatedPLOIds.length === 0);
    if (unmappedMLOs.length === 0) return;
    
    setAligningPLOs(true);
    try {
        const alignments = await suggestSemanticPLOAlignments(unmappedMLOs, course.plos || []);
        setPendingAlignments(alignments);
    } catch (err) {
        console.error("Failed to suggest alignments", err);
    } finally {
        setAligningPLOs(false);
    }
  }

  const commitAlignments = () => {
      const updatedMLOs = localMLOs.map(mlo => {
          if (pendingAlignments[mlo.id]) {
              return {...mlo, relatedPLOIds: pendingAlignments[mlo.id]}
          }
          return mlo;
      });
      setLocalMLOs(updatedMLOs);
      onUpdateMLOs(updatedMLOs);
      setPendingAlignments({});
  }

  const getSuggestedVerbs = (mlo: ModularLearningOutcome) => {
    const assessment = mlo.assessmentMethod || '';
    const result = tagCLOBlooms(mlo.statement);
    // Semantic heuristic based on assessment method
    if (assessment.toLowerCase().includes('quiz')) return ['Recall', 'Define', 'Identify'];
    if (assessment.toLowerCase().includes('project')) return ['Design', 'Create', 'Develop'];
    return result.recommendedBloomVerbs;
  };

  const applyVerb = (mloId: string, verb: string) => {
      const updatedMLOs = localMLOs.map(mlo => {
          if (mlo.id === mloId) {
              const parts = mlo.statement.split(' ');
              parts[0] = verb;
              return {...mlo, statement: parts.join(' ')};
          }
          return mlo;
      });
      setLocalMLOs(updatedMLOs);
      onUpdateMLOs(updatedMLOs);
      setSuggestedVerbs(prev => {
          const next = {...prev};
          delete next[mloId];
          return next;
      });
  }

  const handleRubricChange = (mloId: string, criteriaIndex: number, value: string) => {
    const updatedMLOs = localMLOs.map((mlo) => {
      if (mlo.id === mloId) {
        const newRubric = [...mlo.rubricCriteria];
        newRubric[criteriaIndex] = value;
        return { ...mlo, rubricCriteria: newRubric };
      }
      return mlo;
    });
    setLocalMLOs(updatedMLOs);
    onUpdateMLOs(updatedMLOs);
  };

  const addRubricCriteria = (mloId: string) => {
    const updatedMLOs = localMLOs.map((mlo) => {
      if (mlo.id === mloId) {
        return { ...mlo, rubricCriteria: [...mlo.rubricCriteria, 'New criteria'] };
      }
      return mlo;
    });
    setLocalMLOs(updatedMLOs);
    onUpdateMLOs(updatedMLOs);
  };

  const toggleSelection = (mloId: string) => {
    setSelectedMLOIds(prev => 
      prev.includes(mloId) ? prev.filter(id => id !== mloId) : [...prev, mloId]
    );
  };

  const handleBulkBloom = (level: string) => {
    const updatedMLOs = localMLOs.map(mlo => 
      selectedMLOIds.includes(mlo.id) ? {...mlo, bloomLevel: level as any} : mlo
    );
    setLocalMLOs(updatedMLOs);
    onUpdateMLOs(updatedMLOs);
  };

  const handleBulkNotes = (notes: string) => {
    const updatedMLOs = localMLOs.map(mlo => 
      selectedMLOIds.includes(mlo.id) ? {...mlo, instructorNotes: notes} : mlo
    );
    setLocalMLOs(updatedMLOs);
    onUpdateMLOs(updatedMLOs);
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Edit MLU: {localUnit.title}</h2>
        <div className="flex items-center gap-2">
            <button
                onClick={handleBulkAlignPLOs}
                disabled={aligningPLOs}
                className="flex items-center space-x-1 text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded hover:bg-slate-900"
            >
                {aligningPLOs ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                <span>{aligningPLOs ? 'Aligning...' : 'Bulk Align PLOs'}</span>
            </button>
        </div>
      </div>

      {Object.keys(pendingAlignments).length > 0 && (
          <div className="p-4 bg-slate-100 border border-slate-300 rounded-md text-xs space-y-2">
              <p className="font-bold">Proposed PLO Alignments:</p>
              {Object.entries(pendingAlignments).map(([mloId, ploIds]) => {
                  const mlo = localMLOs.find(m => m.id === mloId);
                  return <p key={mloId}>{mlo?.code}: {ploIds.join(', ')}</p>
              })}
              <div className="flex gap-2">
                  <button onClick={commitAlignments} className="px-2 py-1 bg-slate-800 text-white rounded hover:bg-slate-900">Commit Alignments</button>
                  <button onClick={() => setPendingAlignments({})} className="px-2 py-1 bg-slate-200 text-slate-800 rounded hover:bg-slate-300">Discard</button>
              </div>
          </div>
      )}
      
      {/* MLU Basic Info */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input
          value={localUnit.title}
          onChange={(e) => {
            const updated = { ...localUnit, title: e.target.value };
            setLocalUnit(updated);
            onUpdateUnit(updated);
          }}
          className="w-full p-2 border border-slate-300 rounded-md"
        />
        <label className="block text-sm font-medium text-slate-700 mt-4">Instructor Notes</label>
        <textarea
          value={localUnit.instructorNotes || ''}
          onChange={(e) => {
            const updated = { ...localUnit, instructorNotes: e.target.value };
            setLocalUnit(updated);
            onUpdateUnit(updated);
          }}
          className="w-full p-2 border border-slate-300 rounded-md"
          rows={3}
          placeholder="Pedagogical strategies or classroom activity suggestions..."
        />
      </div>

      {/* MLOs and Rubrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Modular Learning Outcomes</h3>
        {localMLOs.map((mlo) => (
          <div key={mlo.id} className="p-4 bg-slate-50 rounded-md space-y-2 border border-slate-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={selectedMLOIds.includes(mlo.id)} onChange={() => toggleSelection(mlo.id)} className="h-4 w-4" />
                    <p className="font-medium text-slate-900">{mlo.code}: {mlo.statement}</p>
                    <MLOSyncStatusIndicator 
                        status={
                          queue.some(q => q.courseId === course.id && q.status === 'failed') ? 'Conflict' : 
                          queue.some(q => q.courseId === course.id) ? 'Pending' : 'Synced'
                        } 
                        conflictDetails={queue.find(q => q.courseId === course.id && q.status === 'failed')?.errorMessage}
                    />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border 
                        ${mlo.bloomLevel === 'Remember' ? 'bg-slate-100 text-slate-700 border-slate-300' : 
                          mlo.bloomLevel === 'Understand' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          mlo.bloomLevel === 'Apply' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                          mlo.bloomLevel === 'Analyze' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                          mlo.bloomLevel === 'Evaluate' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                          mlo.bloomLevel === 'Create' ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                        {mlo.bloomLevel}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setSuggestedVerbs(prev => ({...prev, [mlo.id]: getSuggestedVerbs(mlo)}))}
                        className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                    >
                        <BookOpen className="w-3 h-3" />
                        <span>Suggest Verb</span>
                    </button>
                    <button
                        onClick={() => setActiveCommentMLOId(activeCommentMLOId === mlo.id ? null : mlo.id)}
                        className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded border ${activeCommentMLOId === mlo.id ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-100'}`}
                    >
                        <MessageSquare className="w-3 h-3" />
                        <span>Comment</span>
                    </button>
                    <button
                        onClick={() => setActiveQuizMLO(mlo)}
                        className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                    >
                        <Target className="w-3 h-3" />
                        <span>Quiz</span>
                    </button>
                    <button
                        onClick={async () => {
                            setLoadingResources(prev => ({...prev, [mlo.id]: true}));
                            const resources = await suggestResources(mlo.statement, course.title);
                            setSuggestedResources(prev => ({...prev, [mlo.id]: resources}));
                            setLoadingResources(prev => ({...prev, [mlo.id]: false}));
                        }}
                        className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                    >
                        {loadingResources[mlo.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
                        <span>Resources</span>
                    </button>

                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => {
                                const idx = localMLOs.findIndex(m => m.id === mlo.id);
                                if (idx > 0) {
                                    const newMLOs = [...localMLOs];
                                    [newMLOs[idx - 1], newMLOs[idx]] = [newMLOs[idx], newMLOs[idx - 1]];
                                    setLocalMLOs(newMLOs);
                                    onUpdateMLOs(newMLOs);
                                }
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                        >↑</button>
                        <button 
                            onClick={() => {
                                const idx = localMLOs.findIndex(m => m.id === mlo.id);
                                if (idx < localMLOs.length - 1) {
                                    const newMLOs = [...localMLOs];
                                    [newMLOs[idx + 1], newMLOs[idx]] = [newMLOs[idx], newMLOs[idx + 1]];
                                    setLocalMLOs(newMLOs);
                                    onUpdateMLOs(newMLOs);
                                }
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                        >↓</button>
                    </div>
                    <button
                        onClick={() => handleGenerateEvidence(mlo)}
                        disabled={generatingEvidence[mlo.id]}
                        className="flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded hover:bg-indigo-200"
                    >
                        {generatingEvidence[mlo.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        <span>{generatingEvidence[mlo.id] ? 'Generating...' : 'Generate Evidence'}</span>
                    </button>
                </div>
            {activeCommentMLOId === mlo.id && (
                <CommentPanel courseId={course.id} targetId={mlo.id} />
            )}
            </div>
            
            {/* Suggested Verbs Preview */}
            {suggestedVerbs[mlo.id] && (
                <div className="p-2 bg-slate-100 rounded text-xs space-x-2">
                    <span>Suggested Verbs:</span>
                    {suggestedVerbs[mlo.id].map(v => (
                        <button key={v} onClick={() => applyVerb(mlo.id, v)} className="text-indigo-600 hover:underline">{v}</button>
                    ))}
                </div>
            )}
            
            {/* Suggested Resources Preview */}
            {suggestedResources[mlo.id] && (
                <div className="p-2 bg-emerald-50 rounded text-xs space-y-1">
                    <p className="font-bold text-emerald-800">Suggested OER/Library Links:</p>
                    {suggestedResources[mlo.id].map((res, i) => (
                        <a key={i} href={res.url} target="_blank" rel="noreferrer" className="block text-emerald-600 hover:underline">
                            {res.title} ({res.type}) - {res.description}
                        </a>
                    ))}
                </div>
            )}
            
            {/* Pending Evidence Preview */}
            {pendingEvidence[mlo.id] && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md text-xs space-y-2">
                    <p className="font-bold">Generated Evidence Preview:</p>
                    <p>Activity: {pendingEvidence[mlo.id].requiredActivity}</p>
                    <p>Method: {pendingEvidence[mlo.id].assessmentMethod}</p>
                    <div className="flex gap-2">
                        <button onClick={() => acceptEvidence(mlo.id)} className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Accept</button>
                        <button onClick={() => discardEvidence(mlo.id)} className="px-2 py-1 bg-slate-200 text-slate-800 rounded hover:bg-slate-300">Discard</button>
                    </div>
                </div>
            )}

            {/* Accessibility Warning */}
            {(!mlo.evidence || mlo.evidence.length < 20) && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Accessibility Warning: Evidence description may be too short or non-descriptive.</span>
                </div>
            )}
            
            <label className="block text-sm font-medium text-slate-700">Rubric Criteria</label>
            {mlo.rubricCriteria.map((criterion, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  value={criterion}
                  onChange={(e) => handleRubricChange(mlo.id, idx, e.target.value)}
                  className="flex-1 p-2 border border-slate-300 rounded-md"
                />
                <button 
                    onClick={() => {
                        const updatedMLOs = localMLOs.map((m) => {
                            if (m.id === mlo.id) {
                                return {...m, rubricCriteria: m.rubricCriteria.filter((_, i) => i !== idx)}
                            }
                            return m
                        })
                        setLocalMLOs(updatedMLOs)
                        onUpdateMLOs(updatedMLOs)
                    }}
                    className="p-1 text-red-500 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => addRubricCriteria(mlo.id)}
              className="text-sm text-blue-600 flex items-center hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Criterion
            </button>
            <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-slate-700">Competency Threshold (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mlo.competencyThreshold ?? 0}
                  onChange={(e) => {
                     const val = parseInt(e.target.value);
                     const updatedMLOs = localMLOs.map((m) =>
                         m.id === mlo.id ? { ...m, competencyThreshold: isNaN(val) ? 0 : val } : m
                     );
                     setLocalMLOs(updatedMLOs);
                     onUpdateMLOs(updatedMLOs);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
            </div>
          </div>
        ))}
      </div>
      {activeQuizMLO && (
          <QuizGeneratorModal 
              isOpen={!!activeQuizMLO} 
              onClose={() => setActiveQuizMLO(null)} 
              mlo={activeQuizMLO}
              onQuizGenerated={(quiz) => {
                  const updatedMLOs = localMLOs.map(mlo => mlo.id === activeQuizMLO.id ? {...mlo, quiz} : mlo);
                  setLocalMLOs(updatedMLOs);
                  onUpdateMLOs(updatedMLOs);
              }}
          />
      )}
      {selectedMLOIds.length > 0 && (
          <FloatingBulkToolbar 
              selectedCount={selectedMLOIds.length}
              onClose={() => setSelectedMLOIds([])}
              onApplyBloom={handleBulkBloom}
              onUpdateNotes={handleBulkNotes}
          />
      )}
    </div>
  );
};
