import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileText,
  FileSpreadsheet,
  Tag,
  Plus,
  Trash2,
  FolderPlus,
  Check,
  AlertCircle,
  Sparkles,
  Eye,
  Loader2,
  FileCode,
} from 'lucide-react';
import { ResourceItem, ResourceTagCategory, Course, ResourcePreviewType, ModuleFolder } from '../../types';
import { getCategoryTagStyle } from '../../services/resourceLibraryService';
import {
  detectPreviewType,
  generatePreviewForFile,
  generatePreviewForLink,
} from '../../utils/filePreviewGenerator';
import { getPreviewTypeIcon } from './ResourcePreview';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceData: Omit<ResourceItem, 'id' | 'uploadedAt'> & { id?: string }) => void;
  editingResource?: ResourceItem | null;
  courses: Course[];
  initialCategory?: ResourceTagCategory;
  initialModuleId?: string;
  moduleFolders?: ModuleFolder[];
}

const CATEGORY_OPTIONS: { id: ResourceTagCategory; label: string; desc: string }[] = [
  { id: 'Module', label: 'Module', desc: 'Syllabus units, weekly topics, slides, and readings' },
  { id: 'Assessment', label: 'Assessment', desc: 'Exams, rubrics, quizzes, assignments, and test specs' },
  { id: 'Project', label: 'Project', desc: 'Capstone guides, term papers, lab manuals, and blueprints' },
  { id: 'Reference', label: 'Reference', desc: 'Pedagogical guides, bibliographies, and textbooks' },
  { id: 'Accreditation', label: 'Accreditation', desc: 'ABET, Washington Accord, and HEC documentation' },
];

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingResource,
  courses,
  initialCategory,
  initialModuleId,
  moduleFolders = [],
}) => {
  const [resourceType, setResourceType] = useState<'file' | 'link'>('file');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string>('');
  const [previewType, setPreviewType] = useState<ResourcePreviewType>('generic');
  const [textContentSnippet, setTextContentSnippet] = useState<string | undefined>(undefined);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<ResourceTagCategory[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [courseId, setCourseId] = useState<string>('global');
  const [moduleId, setModuleId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingResource) {
      setResourceType(editingResource.type);
      setTitle(editingResource.title);
      setDescription(editingResource.description || '');
      setUrl(editingResource.url || '');
      if (editingResource.fileName) {
        setSelectedFile({
          name: editingResource.fileName,
          size: editingResource.fileSize || 0,
          type: editingResource.fileType || '',
          dataUrl: editingResource.url,
        });
      } else {
        setSelectedFile(null);
      }
      setPreviewThumbnail(editingResource.previewThumbnail || '');
      setPreviewType(
        editingResource.previewType ||
          detectPreviewType(
            editingResource.type,
            editingResource.fileName,
            editingResource.fileType,
            editingResource.url
          )
      );
      setTextContentSnippet(editingResource.textContentSnippet);
      setSelectedCategories(editingResource.categoryTags || ['Project']);
      setCustomTags(editingResource.customTags || []);
      setCourseId(editingResource.courseId || 'global');
      setModuleId(editingResource.moduleId || '');
      setNotes(editingResource.notes || '');
    } else {
      setResourceType('file');
      setTitle('');
      setDescription('');
      setUrl('');
      setSelectedFile(null);
      setPreviewThumbnail('');
      setPreviewType('generic');
      setTextContentSnippet(undefined);
      setSelectedCategories(initialCategory ? [initialCategory] : ['Module']);
      setCustomTags([]);
      setTagInput('');
      setCourseId('global');
      setModuleId(initialModuleId || '');
      setNotes('');
    }
    setValidationError(null);
  }, [editingResource, isOpen, initialCategory, initialModuleId]);

  // Live link thumbnail generator
  useEffect(() => {
    if (resourceType === 'link' && url.trim()) {
      const timer = setTimeout(() => {
        try {
          const res = generatePreviewForLink(url.trim(), title.trim() || 'External Web Resource');
          setPreviewThumbnail(res.previewThumbnail);
          setPreviewType('link');
        } catch (err) {
          console.error('Link preview generation error:', err);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [resourceType, url, title]);

  if (!isOpen) return null;

  const handleToggleCategory = (category: ResourceTagCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        if (prev.length === 1) return prev; // keep at least one category tag
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleAddCustomTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveCustomTag = (tagToRemove: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsGeneratingPreview(true);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const displayTitle = title || cleanName;
    if (!title) {
      setTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
      });

      try {
        // Automatically generate file preview thumbnail and text snippet
        const preview = await generatePreviewForFile(file, displayTitle);
        setPreviewThumbnail(preview.previewThumbnail);
        setPreviewType(preview.previewType);
        setTextContentSnippet(preview.textContentSnippet);
      } catch (err) {
        console.error('Failed to generate file preview:', err);
        setPreviewType(detectPreviewType('file', file.name, file.type));
      } finally {
        setIsGeneratingPreview(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setResourceType('file');
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Please enter a descriptive title for this resource.');
      return;
    }

    if (resourceType === 'link') {
      if (!url.trim()) {
        setValidationError('Please enter a valid web URL.');
        return;
      }
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch {
        setValidationError('Please enter a valid web address (e.g., https://example.com).');
        return;
      }
    } else {
      if (!selectedFile && !editingResource?.fileName) {
        setValidationError('Please select or upload a document file.');
        return;
      }
    }

    if (selectedCategories.length === 0) {
      setValidationError('Please select at least one category tag (Module, Assessment, or Project).');
      return;
    }

    const selectedCourseObj = courses.find((c) => c.id === courseId);
    const courseName = courseId === 'global' ? 'Shared Across All Projects' : selectedCourseObj?.name || 'Selected Project';

    const selectedModObj = moduleFolders.find((f) => f.id === moduleId);
    const moduleName = selectedModObj ? selectedModObj.name : undefined;

    const finalCategories = [...selectedCategories];
    if (moduleId && !finalCategories.includes('Module')) {
      finalCategories.push('Module');
    }

    const cleanUrl = resourceType === 'link' && !url.startsWith('http') ? `https://${url}` : url;

    onSave({
      id: editingResource?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      type: resourceType,
      url: resourceType === 'link' ? cleanUrl : (selectedFile?.dataUrl || editingResource?.url),
      fileName: resourceType === 'file' ? (selectedFile?.name || editingResource?.fileName) : undefined,
      fileSize: resourceType === 'file' ? (selectedFile?.size ?? editingResource?.fileSize) : undefined,
      fileType: resourceType === 'file' ? (selectedFile?.type || editingResource?.fileType) : undefined,
      previewThumbnail: previewThumbnail || editingResource?.previewThumbnail,
      previewType: previewType || editingResource?.previewType,
      textContentSnippet: textContentSnippet ?? editingResource?.textContentSnippet,
      categoryTags: finalCategories,
      customTags,
      courseId,
      courseName,
      moduleId: moduleId || undefined,
      moduleName,
      notes: notes.trim() || undefined,
      starred: editingResource?.starred ?? false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" />
              <span>{editingResource ? 'Edit Resource' : 'Add Course Design Resource'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tag external documents and links by Module, Assessment, or Project
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Resource Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Resource Format
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setResourceType('file')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                  resourceType === 'file'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document File</span>
              </button>
              <button
                type="button"
                onClick={() => setResourceType('link')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                  resourceType === 'link'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>External Reference Link</span>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          {resourceType === 'file' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                File Attachment (PDF, Word, Excel, Images, PPTX)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('resource-file-input')?.click()}
              >
                <input
                  id="resource-file-input"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.png,.jpg,.jpeg,.svg"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop new file to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Click to choose file or drag and drop here
                    </p>
                    <p className="text-[11px] text-slate-400">
                      PDF, DOCX, XLSX, PPTX, or text files up to 25MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL Input */}
          {resourceType === 'link' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Web Link URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.edu/accreditation/outcome-guide"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Automatic Live File Preview & Document Thumbnail Generation */}
          {(selectedFile || (resourceType === 'link' && url.trim()) || editingResource) && (
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50/50 via-slate-50/50 to-blue-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-950">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Automatic File Preview & Generated Cover</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Auto-Generated Preview</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                {/* Thumbnail Display */}
                <div className="w-16 h-20 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center relative shadow-xs">
                  {isGeneratingPreview ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-1">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600 mb-1" />
                      <span className="text-[9px] font-medium">Generating</span>
                    </div>
                  ) : previewThumbnail ? (
                    <img
                      src={previewThumbnail}
                      alt={title || 'Resource preview'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 flex items-center justify-center">
                      {getPreviewTypeIcon(previewType, 'w-7 h-7')}
                    </div>
                  )}
                </div>

                {/* Preview Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {previewType}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {resourceType === 'file' ? (selectedFile?.name || editingResource?.fileName) : url}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {title || (selectedFile?.name ?? 'Resource Title')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Standardized high-resolution preview & document badge generated for instant library inspection.
                  </p>
                </div>
              </div>

              {/* Monospace Code / Text Snippet Preview */}
              {textContentSnippet && (
                <div className="p-2.5 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-200 max-h-28 overflow-y-auto border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase tracking-wider mb-1 pb-1 border-b border-slate-800">
                    <span className="flex items-center space-x-1">
                      <FileCode className="w-3 h-3 text-indigo-400" />
                      <span>Extracted Content Snippet</span>
                    </span>
                    <span>{textContentSnippet.split('\n').length} lines sampled</span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">{textContentSnippet}</pre>
                </div>
              )}
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resource Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 4 Linear Regress Lab Guide / ABET Criterion 3 Checklist"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Short Description / Purpose
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Scaffolding notes for outcome-aligned continuous evaluation"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Tags: Module, Assessment, Project, Reference, Accreditation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Primary Category Tags <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Select all that apply</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((opt) => {
                const isSelected = selectedCategories.includes(opt.id);
                const style = getCategoryTagStyle(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleCategory(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start space-x-2 ${
                      isSelected
                        ? `${style.bg} ${style.border} ring-2 ring-indigo-400/40`
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center text-white text-[10px] shrink-0 ${
                        isSelected ? 'bg-indigo-600' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Tags Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Custom Tags
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="e.g. Midterm, Week 4, Rubric, Lab, ABET (Press Enter)"
                  className="w-full pl-8 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {customTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomTag(tag)}
                      className="text-slate-400 hover:text-rose-600 transition ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Project / Course Association and Module Folder selection in responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project / Course Association
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="global">🌐 Shared Across All Projects (Global Workspace)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    📚 {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Module Folder Location</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="">📂 None (Root Library / Unassigned)</option>
                {moduleFolders.map((mf) => (
                  <option key={mf.id} value={mf.id}>
                    📁 {mf.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes / Instructional Context */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Faculty Notes & Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add instructional pointers, rubric application tips, or accreditation mapping details..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-xs shadow-indigo-200 cursor-pointer"
            >
              {editingResource ? 'Save Changes' : 'Add to Resource Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
