import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Course } from '../../types';
import {
  AccreditationGapAnalyzerService,
  AccreditationGapAnalysisResult,
} from '../../services/accreditationGapAnalyzerService';

interface GapAnalysisViewProps {
  course: Course;
  onChange: (updatedCourse: Course) => void;
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({ course, onChange }) => {
  const [selectedFrameworkId] = useState<string>(course.frameworkId || 'fw-abet-cac');
  const [analysisResult, setAnalysisResult] = useState<AccreditationGapAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await AccreditationGapAnalyzerService.analyzeWithAI(course, selectedFrameworkId);
      setAnalysisResult(result);
    } catch (e) {
      console.error('Analysis execution error:', e);
      const fallback = AccreditationGapAnalyzerService.analyzeLocally(course, selectedFrameworkId);
      setAnalysisResult(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [course, selectedFrameworkId]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Gap Analysis View</h2>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-run Analysis'}</span>
          </button>
        </div>

        {analysisResult ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Compliance Score</p>
                <p className="text-2xl font-black text-slate-900">{analysisResult.complianceScore}%</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">HOTS Coverage</p>
                <p className="text-2xl font-black text-slate-900">{analysisResult.cognitiveTiers.hots.percentage}%</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Gaps</p>
                <p className="text-2xl font-black text-slate-900">{analysisResult.gaps.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {analysisResult.gaps.map((gap) => (
                <div key={gap.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${gap.severity === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{gap.title}</h4>
                    <p className="text-sm text-slate-600">{gap.deficiencyReason}</p>
                    <p className="text-sm font-semibold text-indigo-600 mt-2">Recommendation: {gap.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            {isAnalyzing ? 'Analyzing your course...' : 'Run analysis to see results'}
          </div>
        )}
      </div>
    </div>
  );
};
