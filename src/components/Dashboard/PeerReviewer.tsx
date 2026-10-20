import React, { useState } from 'react';
import { Users, Loader2, Sparkles, AlertTriangle, BookOpen, Target } from 'lucide-react';
import { Course } from '../../types';

interface PeerReviewerProps {
  course: Course;
}

export const PeerReviewer: React.FC<PeerReviewerProps> = ({ course }) => {
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runPeerReview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/peer-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course }),
      });
      if (!response.ok) throw new Error('Peer review generation failed');
      const data = await response.json();
      setReview(data);
    } catch (err) {
      console.error('Error running peer review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            AI Student Peer-Reviewer
        </h3>
        <button
          onClick={runPeerReview}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{loading ? 'Analyzing...' : 'Run Peer Review'}</span>
        </button>
      </div>

      {review && (
        <div className="space-y-4 animate-in fade-in">
          <p className="text-xs text-slate-700 italic border-l-2 border-indigo-200 pl-3">"{review.summary}"</p>
          {review.personas.map((p: any, i: number) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-indigo-900">{p.persona}</div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="text-slate-600"><span className="font-bold text-slate-800">Clarity:</span> {p.feedback.clarity}</div>
                <div className="text-slate-600"><span className="font-bold text-slate-800">Engage:</span> {p.feedback.engagement}</div>
                <div className="text-slate-600"><span className="font-bold text-slate-800">Workload:</span> {p.feedback.workload}</div>
              </div>
              {p.bottlenecks.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>Bottleneck: {p.bottlenecks[0]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
