import React from 'react';
import { BloomLevel, CLO, Course } from '../../types';
import { BloomsTaxonomyWheel } from './BloomsTaxonomyWheel';

export interface BloomsWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCLO?: CLO | null;
  course?: Course;
  onSelectVerb: (verb: string, level: BloomLevel) => void;
  onApplyStem?: (stem: string, level: BloomLevel) => void;
}

export const BloomsWheelModal: React.FC<BloomsWheelModalProps> = ({
  isOpen,
  onClose,
  selectedCLO,
  course,
  onSelectVerb,
  onApplyStem,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="blooms-wheel-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="blooms-wheel-modal-content"
        className="w-full max-w-5xl max-h-[95vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <BloomsTaxonomyWheel
          selectedCLO={selectedCLO}
          course={course}
          onSelectVerb={onSelectVerb}
          onApplyStem={onApplyStem}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};
