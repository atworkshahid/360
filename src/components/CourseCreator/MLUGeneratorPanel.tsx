import React, { useState } from 'react';

import { Course } from '../../types';
import { validateCognitiveMismatch } from '../../utils/assessmentAnalysis';

interface MLUGeneratorPanelProps {
  course: Course;
  onGenerate: (config: { modality: string; hours: number }) => Promise<void>;
  onClose: () => void;
  isGenerating: boolean;
}

export const MLUGeneratorPanel: React.FC<MLUGeneratorPanelProps> = ({ course, onGenerate, onClose, isGenerating }) => {
  const [modality, setModality] = useState('Interactive Lecture');
  const [hours, setHours] = useState(3);
  const [loading, setLoading] = useState(false);

  const mloProgress = React.useMemo(() => {
    const mlos = course.mlos || [];
    if (mlos.length === 0) return 0;
    const approvedWithEvidence = mlos.filter(
      (mlo) => mlo.status === 'Approved' && mlo.evidence && mlo.evidence.trim() !== ''
    ).length;
    return Math.round((approvedWithEvidence / mlos.length) * 100);
  }, [course.mlos]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onGenerate({ modality, hours });
    } catch (error) {
      console.error('Failed to generate MLUs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">AI MLU Generator</h2>
      
      <div className="mb-6">
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
          <span>Alignment Progress</span>
          <span>{mloProgress}% Approved & Evidenced</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${mloProgress}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Teaching Modality
          </label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Interactive Lecture">Interactive Lecture</option>
            <option value="Hands-on Lab">Hands-on Lab</option>
            <option value="Self-Paced Practice">Self-Paced Practice</option>
            <option value="Case Study">Case Study</option>
            <option value="Discussion & Quiz">Discussion & Quiz</option>
            <option value="Problem-Solving Studio">Problem-Solving Studio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Weekly Contact Hours
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Validation Checker
          </label>
          <button
            onClick={() => {
              const mismatches = validateCognitiveMismatch(course);
              const count = mismatches.filter(m => m.mismatched).length;
              alert(`${count} cognitive level mismatches found.`);
            }}
            className="w-full py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
          >
            Check Cognitive Mismatches
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Filter by MLO Status
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={(e) => {
              // Handle filter change here
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Weekly MLUs'}
        </button>
      </div>
    </div>
  );
};
