import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2,
  Bookmark,
  ExternalLink,
  BookOpen,
  Calendar,
  FileCheck,
  Plus,
} from 'lucide-react';
import { Course, CourseTemplate } from '../types';
import {
  getSavedTemplates,
  saveCourseAsTemplate,
  deleteUserTemplate,
  createCourseFromTemplate,
} from '../utils/templateStorage';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  currentCourse?: Course;
  onTemplateLoaded: (newCourse: Course) => void;
  onTemplateSaved?: (savedTemplate: CourseTemplate) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentCourse,
  onTemplateLoaded,
  onTemplateSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>(mode);
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Save form fields
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<string>('');
  const [templateTags, setTemplateTags] = useState<string>('');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string>('');

  // Load form fields
  const [newCourseTitle, setNewCourseTitle] = useState<string>('');
  const [newCourseCode, setNewCourseCode] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(mode);
      const loaded = getSavedTemplates();
      setTemplates(loaded);
      if (loaded.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(loaded[0].id);
      }
      if (currentCourse) {
        setTemplateName(`${currentCourse.title} (Template)`);
        setTemplateDescription(currentCourse.description || '');
        setTemplateCategory(currentCourse.category || 'Academic');
        setTemplateTags(currentCourse.department || 'Curriculum');
      }
      setSavedSuccessMessage('');
    }
  }, [isOpen, mode, currentCourse]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  useEffect(() => {
    if (selectedTemplate) {
      setNewCourseTitle(`${selectedTemplate.courseData.title} (Cohort 2026)`);
      setNewCourseCode(`${selectedTemplate.courseData.code || 'OBE'}-26`);
    }
  }, [selectedTemplateId]);

  if (!isOpen) return null;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse) return;

    const tagsArray = templateTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = saveCourseAsTemplate(
      currentCourse,
      templateName,
      templateDescription,
      templateCategory,
      tagsArray
    );

    setSavedSuccessMessage(`"${created.name}" has been saved with all outcomes, lessons, assessments, and rubrics!`);
    const refreshed = getSavedTemplates();
    setTemplates(refreshed);
    if (onTemplateSaved) onTemplateSaved(created);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleLoadSubmit = () => {
    if (!selectedTemplate) return;
    const newCourse = createCourseFromTemplate(
      selectedTemplate,
      newCourseTitle,
      newCourseCode
    );
    onTemplateLoaded(newCourse);
    onClose();
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove the template "${name}"?`)) {
      deleteUserTemplate(id);
      const refreshed = getSavedTemplates();
      setTemplates(refreshed);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(refreshed[0]?.id || '');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">OBE360™ Course Template Hub</h3>
              <p className="text-[11px] text-slate-500">
                Save blueprints or load proven constructive alignment structures
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('load')}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  activeTab === 'load'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Load Template
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('save')}
                disabled={!currentCourse}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer disabled:opacity-40 ${
                  activeTab === 'save'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Save Current as Template
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700">
          {savedSuccessMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{savedSuccessMessage}</span>
            </div>
          )}

          {activeTab === 'save' ? (
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-indigo-900">
                <span className="font-bold block text-xs">What will be captured in this template:</span>
                <p className="mt-1 text-[11px] text-indigo-800">
                  All <strong>{currentCourse?.clos.length || 0} CLOs</strong>,{' '}
                  <strong>{currentCourse?.mlos.length || 0} MLOs</strong>,{' '}
                  <strong>{currentCourse?.modules.length || 0} Modules</strong>,{' '}
                  <strong>{currentCourse?.lessons.length || 0} Lessons</strong>,{' '}
                  <strong>{currentCourse?.assessments.length || 0} Assessments</strong>, and{' '}
                  <strong>{currentCourse?.rubrics.length || 0} Authentic Rubrics</strong> will be saved as a reusable standard.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Constitutional Law & Federalism Curriculum Template"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category / Discipline</label>
                <input
                  type="text"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  placeholder="e.g., Law, Engineering, Business, Computer Science"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe the learning trajectory and intended audience..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keywords / Tags (Comma separated)</label>
                <input
                  type="text"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  placeholder="e.g., Undergraduate, Bloom L4-L6, Capstone, Direct Evidence"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
                >
                  Save Complete Template
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-500 text-xs">
                Select a verified OBE template to initialize a complete, constructively aligned course workspace:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {templates.map((tmpl) => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  const data = tmpl.courseData;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-left relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                tmpl.isSystem
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {tmpl.isSystem ? 'System Blueprint' : 'User Template'}
                            </span>
                            {data.language && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  data.textDirection === 'rtl'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {data.language} {data.textDirection === 'rtl' ? '(RTL)' : ''}
                              </span>
                            )}
                          </div>
                          {!tmpl.isSystem && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(tmpl.id, tmpl.name);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="Delete template"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{tmpl.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{data.clos.length} CLOs • {data.modules.length} Modules</span>
                        <span>{data.assessments.length} Assessments</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Template Details Preview */}
              {selectedTemplate && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        Template Specification Preview
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedTemplate.name}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.2 bg-white border border-slate-200 rounded font-semibold text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] block font-bold">CLOs Defined</span>
                      <span className="font-bold text-slate-900">{selectedTemplate.courseData.clos.length} Outcomes</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] block font-bold">Instructional Modules</span>
                      <span className="font-bold text-slate-900">{selectedTemplate.courseData.modules.length} Modules</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] block font-bold">Assessments</span>
                      <span className="font-bold text-slate-900">{selectedTemplate.courseData.assessments.length} Tasks</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] block font-bold">Authentic Rubrics</span>
                      <span className="font-bold text-slate-900">{selectedTemplate.courseData.rubrics.length} Rubrics</span>
                    </div>
                  </div>

                  {/* New Course Config */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        New Course Title
                      </label>
                      <input
                        type="text"
                        value={newCourseTitle}
                        onChange={(e) => setNewCourseTitle(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        New Course Code
                      </label>
                      <input
                        type="text"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSubmit}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-sm shadow-indigo-200 transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Course From This Template</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
