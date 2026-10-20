import React, { useState } from 'react';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { Course } from '../../types';

interface MLUGeneratorProps {
  course: Course;
  moduleId: string;
  onMLUGenerated: (mlu: any) => void;
}

export const MLUGenerator: React.FC<MLUGeneratorProps> = ({ course, moduleId, onMLUGenerated }) => {
  const [selectedCLOId, setSelectedCLOId] = useState<string>('');
  const [bloomLevel, setBloomLevel] = useState<string>('Understand');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedCLOId) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-mlu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clo: course.clos.find(c => c.id === selectedCLOId), 
          bloomLevel,
          moduleTitle: course.modules.find(m => m.id === moduleId)?.title 
        }),
      });
      const data = await response.json();
      onMLUGenerated(data.mlu);
    } catch (error) {
      console.error('Failed to generate MLU:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-4">
      <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> AI MLU Generator
      </h3>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Target CLO</label>
        <select 
          value={selectedCLOId} 
          onChange={(e) => setSelectedCLOId(e.target.value)}
          className="w-full text-xs p-2 rounded-lg border border-slate-300"
        >
          <option value="">Select a CLO</option>
          {course.clos.map(clo => <option key={clo.id} value={clo.id}>{clo.code}: {clo.statement}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Bloom's Level</label>
        <select 
          value={bloomLevel}
          onChange={(e) => setBloomLevel(e.target.value)}
          className="w-full text-xs p-2 rounded-lg border border-slate-300"
        >
          {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !selectedCLOId}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 disabled:opacity-50"
      >
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
        Generate Micro-Learning Sequence
      </button>
    </div>
  );
};
