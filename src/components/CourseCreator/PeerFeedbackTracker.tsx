import React, { useState } from 'react';
import { Plus, Check, MessageSquare, Trash2 } from 'lucide-react';
import { Course, PeerFeedback } from '../../types';

interface PeerFeedbackTrackerProps {
  course: Course;
  onChange: (updated: Course) => void;
}

export const PeerFeedbackTracker: React.FC<PeerFeedbackTrackerProps> = ({ course, onChange }) => {
  const [newFeedback, setNewFeedback] = useState({ reviewerName: '', reviewerRole: '', feedbackContent: '' });

  const handleAddFeedback = () => {
    if (!newFeedback.reviewerName || !newFeedback.feedbackContent) return;
    
    const feedbackItem: PeerFeedback = {
      id: `fb-${Date.now()}`,
      ...newFeedback,
      dateLogged: new Date().toISOString(),
      status: 'pending',
    };

    onChange({ ...course, peerFeedback: [...(course.peerFeedback || []), feedbackItem] });
    setNewFeedback({ reviewerName: '', reviewerRole: '', feedbackContent: '' });
  };

  const handleDeleteFeedback = (id: string) => {
    onChange({ ...course, peerFeedback: (course.peerFeedback || []).filter(f => f.id !== id) });
  };

  const updateStatus = (id: string, status: 'pending' | 'addressed' | 'resolved') => {
    onChange({ ...course, peerFeedback: (course.peerFeedback || []).map(f => f.id === id ? { ...f, status } : f) });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-600" /> Peer Feedback Tracker
      </h3>

      {/* Add Feedback Form */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <input 
          placeholder="Reviewer Name"
          value={newFeedback.reviewerName}
          onChange={e => setNewFeedback({...newFeedback, reviewerName: e.target.value})}
          className="w-full text-xs p-2 rounded-lg border border-slate-300"
        />
        <input 
          placeholder="Role (e.g., Dept Reviewer)"
          value={newFeedback.reviewerRole}
          onChange={e => setNewFeedback({...newFeedback, reviewerRole: e.target.value})}
          className="w-full text-xs p-2 rounded-lg border border-slate-300"
        />
        <textarea 
          placeholder="Feedback Content"
          value={newFeedback.feedbackContent}
          onChange={e => setNewFeedback({...newFeedback, feedbackContent: e.target.value})}
          className="w-full text-xs p-2 rounded-lg border border-slate-300"
        />
        <button 
          onClick={handleAddFeedback}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500"
        >
          <Plus className="w-4 h-4" /> Log Feedback
        </button>
      </div>

      {/* List Feedback */}
      <div className="space-y-3">
        {(course.peerFeedback || []).map(fb => (
          <div key={fb.id} className="p-4 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-bold text-xs">{fb.reviewerName} ({fb.reviewerRole})</span>
              <div className="flex gap-1">
                <button onClick={() => updateStatus(fb.id, 'resolved')} className="text-emerald-600 hover:text-emerald-800"><Check className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteFeedback(fb.id)} className="text-rose-600 hover:text-rose-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-xs text-slate-700">{fb.feedbackContent}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${fb.status === 'resolved' ? 'bg-emerald-100' : 'bg-amber-100'}`}>{fb.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
