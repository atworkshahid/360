import React from 'react';
import { CourseTemplateGalleryItem } from '../data/courseTemplatesData';

interface TemplatePreviewModalProps {
  template: CourseTemplateGalleryItem;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CourseTemplateGalleryItem) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">{template.title}</h2>
        <p className="text-slate-600 mb-6">{template.fullDescription}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-sm">Discipline</h4>
            <p className="text-sm">{template.disciplineLabel}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-sm">Level</h4>
            <p className="text-sm">{template.level}</p>
          </div>
        </div>

        <h3 className="font-bold mb-2">Learning Outcomes</h3>
        <ul className="list-disc pl-5 mb-6">
          {template.clos.map((clo) => (
            <li key={clo.code} className="text-sm mb-1">{clo.statement}</li>
          ))}
        </ul>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">Close</button>
          <button 
            onClick={() => onSelectTemplate(template)} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Load Template
          </button>
        </div>
      </div>
    </div>
  );
};
