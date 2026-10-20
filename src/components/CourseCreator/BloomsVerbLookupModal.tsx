import React from 'react';
import { X } from 'lucide-react';
import { BloomsVerbLookup } from './BloomsVerbLookup';
import { BloomLevel } from '../../types';

interface BloomsVerbLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLevel?: BloomLevel;
  onSelectVerb?: (verb: string, level: BloomLevel) => void;
}

export const BloomsVerbLookupModal: React.FC<BloomsVerbLookupModalProps> = ({ 
  isOpen, 
  onClose, 
  initialLevel, 
  onSelectVerb 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Bloom's Taxonomy Verb Lookup</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <BloomsVerbLookup initialLevel={initialLevel} onSelectVerb={onSelectVerb} />
        </div>
      </div>
    </div>
  );
};
