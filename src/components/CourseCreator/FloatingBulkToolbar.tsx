import React, { useState } from 'react';
import { Tag, Edit2, Zap } from 'lucide-react';

interface FloatingBulkToolbarProps {
  selectedCount: number;
  onClose: () => void;
  onApplyBloom: (level: string) => void;
  onUpdateNotes: (notes: string) => void;
}

export const FloatingBulkToolbar: React.FC<FloatingBulkToolbarProps> = ({ 
  selectedCount, 
  onClose, 
  onApplyBloom,
  onUpdateNotes
}) => {
  const [notes, setNotes] = useState('');
  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-4 rounded-lg shadow-2xl flex items-center space-x-4 z-50">
      <span className="font-bold">{selectedCount} MLOs Selected</span>
      
      <div className="flex items-center space-x-2">
        <select 
          onChange={(e) => onApplyBloom(e.target.value)}
          className="bg-slate-700 text-white text-xs p-2 rounded border border-slate-600"
        >
          <option value="">Set Bloom's Level</option>
          {bloomLevels.map(level => <option key={level} value={level}>{level}</option>)}
        </select>
        
        <input 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bulk Instructor Notes..."
            className="bg-slate-700 text-white text-xs p-2 rounded border border-slate-600 w-48"
        />
        <button onClick={() => onUpdateNotes(notes)} className="bg-blue-600 px-3 py-2 rounded text-xs font-bold hover:bg-blue-700">Apply</button>
      </div>
      
      <button onClick={onClose} className="text-slate-400 hover:text-white">Cancel</button>
    </div>
  );
};
