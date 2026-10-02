import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  Search,
  Plus,
  Upload,
  Link as LinkIcon,
  FileText,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Tag,
  Star,
  Trash2,
  Edit2,
  Filter,
  X,
  BookOpen,
  Layers,
  CheckCircle2,
  FileCode,
  LayoutGrid,
  List,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Info,
  Move,
  Eye,
  SlidersHorizontal,
  FolderOpen,
  Award,
  Check,
  AlertCircle,
  FileCheck,
  Copy,
  Paperclip,
  Share2,
} from 'lucide-react';
import { Course, CourseModule, ResourceItem, ResourceTagCategory, ResourcePreviewType } from '../../types';
import {
  getStoredResources,
  addResource,
  updateStoredResource,
  deleteStoredResource,
  toggleResourceStarred,
  formatFileSize,
  getFileTypeBadge,
  getCategoryTagStyle,
} from '../../services/resourceLibraryService';
import { detectPreviewType } from '../../utils/filePreviewGenerator';
import { FileContentPreviewInspector } from './ResourcePreview';

export interface CourseResourceLibraryProps {
  course: Course;
  isOpen?: boolean;
  onClose?: () => void;
  onUpdateCourse?: (updatedCourse: Course) => void;
  initialModuleId?: string;
  initialCategory?: ResourceTagCategory;
  mode?: 'modal' | 'drawer' | 'embedded';
  onSelectResource?: (resource: ResourceItem) => void;
  className?: string;
}

const CATEGORY_ITEMS: { id: ResourceTagCategory; label: string; desc: string; icon: string }[] = [
  { id: 'Syllabus', label: 'Syllabi', desc: 'Course syllabi, policies, and instructional frameworks', icon: 'FileText' },
  { id: 'Rubric', label: 'Rubrics', desc: 'Performance scoring guides, criteria, and grading scales', icon: 'FileCheck' },
  { id: 'Module', label: 'Module Units', desc: 'Weekly lectures, slides, problem sets, and readings', icon: 'Layers' },
  { id: 'Assessment', label: 'Assessments', desc: 'Exams, quizzes, assignments, and test blueprints', icon: 'Award' },
  { id: 'Project', label: 'Projects & Labs', desc: 'Lab protocols, capstone manuals, and case studies', icon: 'BookOpen' },
  { id: 'Accreditation', label: 'Accreditation', desc: 'ABET, Washington Accord, and institutional evidence', icon: 'Award' },
  { id: 'Reference', label: 'References', desc: 'Textbooks, research literature, and external resources', icon: 'Tag' },
];

export const CourseResourceLibrary: React.FC<CourseResourceLibraryProps> = ({
  course,
  isOpen = true,
  onClose,
  onUpdateCourse,
  initialModuleId,
  initialCategory,
  mode = 'modal',
  onSelectResource,
  className = '',
}) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>(initialModuleId || 'ALL');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ResourceTagCategory | 'ALL'>(
    initialCategory || 'ALL'
  );
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [onlyStarred, setOnlyStarred] = useState(false);

  // Upload & Edit Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadSelectedFile, setUploadSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [uploadTextSnippet, setUploadTextSnippet] = useState<string | undefined>(undefined);
  const [uploadModuleId, setUploadModuleId] = useState<string>(initialModuleId || '');
  const [uploadCategories, setUploadCategories] = useState<ResourceTagCategory[]>(
    initialCategory ? [initialCategory] : ['Module']
  );
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [tagInputText, setTagInputText] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inspector Preview Modal
  const [previewInspectorItem, setPreviewInspectorItem] = useState<ResourceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 3000);
  };

  // Sync / Load resources
  const loadResources = () => {
    const all = getStoredResources();
    // Filter to resources belonging to this course or global
    const courseSpecific = all.filter(
      (r) => !r.courseId || r.courseId === 'global' || r.courseId === course.id
    );
    setResources(courseSpecific);
  };

  useEffect(() => {
    loadResources();

    const handleUpdate = () => loadResources();
    window.addEventListener('obe_resources_updated', handleUpdate);
    return () => window.removeEventListener('obe_resources_updated', handleUpdate);
  }, [course.id]);

  useEffect(() => {
    if (initialModuleId) {
      setActiveModuleFilter(initialModuleId);
      setUploadModuleId(initialModuleId);
    }
  }, [initialModuleId]);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategoryFilter(initialCategory);
      setUploadCategories([initialCategory]);
    }
  }, [initialCategory]);

  // Derived course modules list
  const modulesList: CourseModule[] = useMemo(() => {
    return course.modules || [];
  }, [course.modules]);

  // Quick module map
  const moduleMap = useMemo(() => {
    const map = new Map<string, CourseModule>();
    modulesList.forEach((m) => map.set(m.id, m));
    return map;
  }, [modulesList]);

  // Tag aggregations
  const allCustomTags = useMemo(() => {
    const tags = new Set<string>();
    resources.forEach((r) => {
      (r.customTags || []).forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // Module filter
      if (activeModuleFilter !== 'ALL') {
        if (activeModuleFilter === 'UNASSIGNED') {
          if (item.moduleId) return false;
        } else if (item.moduleId !== activeModuleFilter) {
          return false;
        }
      }

      // Category filter
      if (activeCategoryFilter !== 'ALL') {
        if (!item.categoryTags?.includes(activeCategoryFilter)) {
          return false;
        }
      }

      // Tag filter
      if (activeTagFilter) {
        if (!item.customTags?.includes(activeTagFilter)) {
          return false;
        }
      }

      // Starred filter
      if (onlyStarred && !item.starred) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesFile = (item.fileName || '').toLowerCase().includes(q);
        const matchesTags = (item.customTags || []).some((t) => t.toLowerCase().includes(q));
        const matchesCategory = (item.categoryTags || []).some((c) => c.toLowerCase().includes(q));
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesFile || matchesTags || matchesCategory || matchesNotes;
      }

      return true;
    });
  }, [resources, activeModuleFilter, activeCategoryFilter, activeTagFilter, onlyStarred, searchQuery]);

  // File drag & drop for upload modal
  const handleFileProcess = (file: File) => {
    const reader = new FileReader();

    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      const textReader = new FileReader();
      textReader.onload = () => {
        const text = textReader.result as string;
        setUploadTextSnippet(text.slice(0, 1000));
      };
      textReader.readAsText(file);
    } else {
      setUploadTextSnippet(undefined);
    }

    reader.onload = () => {
      setUploadSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string,
      });

      if (!uploadTitle.trim()) {
        // Strip extension
        const prettyName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(prettyName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenUpload = (modId?: string, cat?: ResourceTagCategory) => {
    setEditingItem(null);
    setUploadType('file');
    setUploadTitle('');
    setUploadDesc('');
    setUploadUrl('');
    setUploadSelectedFile(null);
    setUploadTextSnippet(undefined);
    setUploadModuleId(modId || (activeModuleFilter !== 'ALL' && activeModuleFilter !== 'UNASSIGNED' ? activeModuleFilter : ''));
    setUploadCategories(cat ? [cat] : activeCategoryFilter !== 'ALL' ? [activeCategoryFilter] : ['Module']);
    setUploadTags([]);
    setTagInputText('');
    setUploadNotes('');
    setFormError(null);
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (item: ResourceItem) => {
    setEditingItem(item);
    setUploadType(item.type);
    setUploadTitle(item.title);
    setUploadDesc(item.description || '');
    setUploadUrl(item.url || '');
    if (item.fileName) {
      setUploadSelectedFile({
        name: item.fileName,
        size: item.fileSize || 0,
        type: item.fileType || '',
        dataUrl: item.url,
      });
    } else {
      setUploadSelectedFile(null);
    }
    setUploadTextSnippet(item.textContentSnippet);
    setUploadModuleId(item.moduleId || '');
    setUploadCategories(item.categoryTags || ['Module']);
    setUploadTags(item.customTags || []);
    setTagInputText('');
    setUploadNotes(item.notes || '');
    setFormError(null);
    setIsUploadOpen(true);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setFormError('Please enter a descriptive document title.');
      return;
    }

    if (uploadType === 'file' && !uploadSelectedFile && !editingItem?.fileName) {
      setFormError('Please select or drop a supporting document file.');
      return;
    }

    if (uploadType === 'link' && !uploadUrl.trim()) {
      setFormError('Please provide a valid web URL or cloud document link.');
      return;
    }

    if (uploadCategories.length === 0) {
      setFormError('Please select at least one document category tag.');
      return;
    }

    const assignedModule = uploadModuleId ? moduleMap.get(uploadModuleId) : undefined;
    const previewType: ResourcePreviewType = detectPreviewType(
      uploadType,
      uploadSelectedFile?.name || editingItem?.fileName,
      uploadSelectedFile?.type || editingItem?.fileType,
      uploadUrl
    );

    if (editingItem) {
      updateStoredResource(editingItem.id, {
        title: uploadTitle.trim(),
        description: uploadDesc.trim(),
        type: uploadType,
        url: uploadType === 'link' ? uploadUrl.trim() : uploadSelectedFile?.dataUrl || editingItem.url,
        fileName: uploadType === 'file' ? uploadSelectedFile?.name || editingItem.fileName : undefined,
        fileSize: uploadType === 'file' ? uploadSelectedFile?.size || editingItem.fileSize : undefined,
        fileType: uploadType === 'file' ? uploadSelectedFile?.type || editingItem.fileType : undefined,
        previewType,
        textContentSnippet: uploadTextSnippet || editingItem.textContentSnippet,
        categoryTags: uploadCategories,
        customTags: uploadTags,
        courseId: course.id,
        courseName: course.title,
        moduleId: uploadModuleId || undefined,
        moduleName: assignedModule ? `Module ${assignedModule.number}: ${assignedModule.title}` : undefined,
        notes: uploadNotes.trim(),
      });
      showToast('Document updated successfully.');
    } else {
      addResource({
        title: uploadTitle.trim(),
        description: uploadDesc.trim(),
        type: uploadType,
        url: uploadType === 'link' ? uploadUrl.trim() : uploadSelectedFile?.dataUrl,
        fileName: uploadType === 'file' ? uploadSelectedFile?.name : undefined,
        fileSize: uploadType === 'file' ? uploadSelectedFile?.size : undefined,
        fileType: uploadType === 'file' ? uploadSelectedFile?.type : undefined,
        previewType,
        textContentSnippet: uploadTextSnippet,
        categoryTags: uploadCategories,
        customTags: uploadTags,
        courseId: course.id,
        courseName: course.title,
        moduleId: uploadModuleId || undefined,
        moduleName: assignedModule ? `Module ${assignedModule.number}: ${assignedModule.title}` : undefined,
        notes: uploadNotes.trim(),
        starred: false,
      });
      showToast('Document added to course library.');
    }

    loadResources();
    setIsUploadOpen(false);

    // Sync back to course if course updater is available
    if (onUpdateCourse) {
      const updatedCourseResources = getStoredResources().filter(
        (r) => r.courseId === course.id
      );
      onUpdateCourse({
        ...course,
        resources: updatedCourseResources,
      });
    }
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleResourceStarred(id);
    loadResources();
  };

  const handleDelete = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${title}" from the course resource library?`)) {
      deleteStoredResource(id);
      loadResources();
      showToast('Document removed.');
    }
  };

  const handleReassignModule = (resourceId: string, newModuleId: string, e?: React.ChangeEvent<HTMLSelectElement>) => {
    if (e) e.stopPropagation();
    const assignedModule = newModuleId ? moduleMap.get(newModuleId) : undefined;
    updateStoredResource(resourceId, {
      moduleId: newModuleId || undefined,
      moduleName: assignedModule ? `Module ${assignedModule.number}: ${assignedModule.title}` : undefined,
    });
    loadResources();
    showToast(
      assignedModule
        ? `Associated with Module ${assignedModule.number}`
        : 'Moved to Course-Wide / General'
    );
  };

  // Add exemplar syllabi & rubrics
  const handleLoadExemplars = () => {
    const timestamp = Date.now();
    const firstMod = modulesList[0];
    const secondMod = modulesList[1] || modulesList[0];

    const exemplars: (Omit<ResourceItem, 'id' | 'uploadedAt'> & { id?: string })[] = [
      {
        id: `res-ex-syl-${timestamp}`,
        title: `${course.code || 'OBE'} Official Course Syllabus & Policy Specification`,
        description: 'Comprehensive institutional syllabus detailing constructive alignment, CLO weightages, attendance policies, and academic integrity.',
        type: 'file',
        fileName: `${(course.code || 'Course').replace(/\s+/g, '_')}_Master_Syllabus.docx`,
        fileSize: 64200,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        categoryTags: ['Syllabus', 'Reference', 'Accreditation'],
        customTags: ['Master Syllabus', 'ABET Compliant', 'Course Policies', 'Grading Scheme'],
        courseId: course.id,
        courseName: course.title,
        moduleId: undefined, // Course-wide
        previewType: 'doc',
        notes: 'Master course policy document and syllabus template.',
        starred: true,
      },
      {
        id: `res-ex-rubric-${timestamp}`,
        title: '4-Tier Analytic Performance Rubric for Lab & Design Milestones',
        description: 'Standardized assessment rubric evaluating Exemplary (85-100%), Proficient (70-84%), Developing (50-69%), and Unsatisfactory (<50%) attainment.',
        type: 'file',
        fileName: 'Analytic_Assessment_Rubric_4Tier.xlsx',
        fileSize: 38400,
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        categoryTags: ['Rubric', 'Assessment'],
        customTags: ['Analytic Rubric', 'Performance Descriptors', 'Grading Matrix'],
        courseId: course.id,
        courseName: course.title,
        moduleId: firstMod ? firstMod.id : undefined,
        moduleName: firstMod ? `Module ${firstMod.number}: ${firstMod.title}` : undefined,
        previewType: 'sheet',
        notes: 'Scoring criteria for mid-term projects and practical labs.',
        starred: true,
      },
      {
        id: `res-ex-lab-${timestamp}`,
        title: 'Modular Lab Safety Protocols & Experimental Methodology Guide',
        description: 'Standard laboratory execution protocol with instrument calibration checklists and risk mitigation guidelines.',
        type: 'file',
        fileName: 'Laboratory_Protocol_and_Safety_Manual.pdf',
        fileSize: 112500,
        fileType: 'application/pdf',
        categoryTags: ['Project', 'Module'],
        customTags: ['Lab Manual', 'Safety Protocol', 'Practicum'],
        courseId: course.id,
        courseName: course.title,
        moduleId: secondMod ? secondMod.id : undefined,
        moduleName: secondMod ? `Module ${secondMod.number}: ${secondMod.title}` : undefined,
        previewType: 'pdf',
        notes: 'Essential lab manual for practical sessions.',
        starred: false,
      },
    ];

    exemplars.forEach((item) => addResource(item));
    loadResources();
    showToast('Loaded 3 exemplar supporting documents (Syllabus, Rubric, Lab Manual).');
  };

  const handleDownloadFile = (item: ResourceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.url && item.url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.fileName || `${item.title.replace(/\s+/g, '_')}.dat`;
      link.click();
    } else if (item.url) {
      window.open(item.url, '_blank');
    } else {
      // Generate synthetic downloadable text summary
      const blob = new Blob(
        [
          `COURSE RESOURCE SPECIFICATION\n` +
            `Title: ${item.title}\n` +
            `Course: ${item.courseName || course.title} (${course.code})\n` +
            `Category: ${(item.categoryTags || []).join(', ')}\n` +
            `Tags: ${(item.customTags || []).join(', ')}\n` +
            `Module: ${item.moduleName || 'General / Course-Wide'}\n\n` +
            `Description:\n${item.description || 'No description provided.'}\n\n` +
            `Notes:\n${item.notes || 'None'}\n`,
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_Spec.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const contentJSX = (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 font-serif">Course Resource Library</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  {resources.length} {resources.length === 1 ? 'Document' : 'Documents'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium font-mono">
                  {course.code || 'COURSE'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload, tag, and associate supporting documents (syllabi, rubrics, guides) with specific course modules.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              id="library-load-exemplars-btn"
              onClick={handleLoadExemplars}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer"
              title="Load pre-built exemplar syllabus, analytic rubric, and lab guide"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Exemplar Docs</span>
            </button>

            <button
              type="button"
              id="library-add-link-btn"
              onClick={() => {
                handleOpenUpload();
                setUploadType('link');
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Add Link</span>
            </button>

            <button
              type="button"
              id="library-upload-doc-btn"
              onClick={() => handleOpenUpload()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>

            {onClose && mode !== 'embedded' && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Close Resource Library"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Module Association Navigation Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1.5 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Modules:</span>
          </span>

          <button
            type="button"
            onClick={() => setActiveModuleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shrink-0 flex items-center space-x-1.5 ${
              activeModuleFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span>All Modules</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeModuleFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {resources.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleFilter('UNASSIGNED')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shrink-0 flex items-center space-x-1.5 ${
              activeModuleFilter === 'UNASSIGNED'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span>Course-Wide / General</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeModuleFilter === 'UNASSIGNED' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {resources.filter((r) => !r.moduleId).length}
            </span>
          </button>

          {modulesList.map((mod) => {
            const count = resources.filter((r) => r.moduleId === mod.id).length;
            const isSelected = activeModuleFilter === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveModuleFilter(mod.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
                title={mod.description || mod.title}
              >
                <span>Module {mod.number}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center space-x-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, filename, tags, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Starred Filter */}
          <button
            type="button"
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center space-x-1 ${
              onlyStarred
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Show only starred documents"
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Type:
          </span>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 text-xs ${
              activeCategoryFilter === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {CATEGORY_ITEMS.map((cat) => {
            const isSelected = activeCategoryFilter === cat.id;
            const style = getCategoryTagStyle(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(isSelected ? 'ALL' : cat.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 text-xs flex items-center space-x-1 border ${
                  isSelected
                    ? `${style.bg} ${style.text} ${style.border} ring-1 ring-indigo-500`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-md transition ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar (if custom tags or module is filtered) */}
      {(activeTagFilter || activeModuleFilter !== 'ALL' || activeCategoryFilter !== 'ALL' || onlyStarred) && (
        <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-bold text-indigo-900">Filtered by:</span>

          {activeModuleFilter !== 'ALL' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-800 font-medium">
              <span>
                {activeModuleFilter === 'UNASSIGNED'
                  ? 'Course-Wide / General'
                  : moduleMap.get(activeModuleFilter)
                  ? `Module ${moduleMap.get(activeModuleFilter)!.number}: ${moduleMap.get(activeModuleFilter)!.title}`
                  : 'Module'}
              </span>
              <button
                type="button"
                onClick={() => setActiveModuleFilter('ALL')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeCategoryFilter !== 'ALL' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-800 font-medium">
              <span>Category: {activeCategoryFilter}</span>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('ALL')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeTagFilter && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-800 font-medium">
              <span>Tag: #{activeTagFilter}</span>
              <button
                type="button"
                onClick={() => setActiveTagFilter(null)}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyStarred && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>Starred only</span>
              <button
                type="button"
                onClick={() => setOnlyStarred(false)}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveModuleFilter('ALL');
              setActiveCategoryFilter('ALL');
              setActiveTagFilter(null);
              setOnlyStarred(false);
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline ml-2"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Main Body: Resources List / Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredResources.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Supporting Documents Found</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-4 leading-relaxed">
              {searchQuery || activeModuleFilter !== 'ALL' || activeCategoryFilter !== 'ALL'
                ? 'No documents match your active search or module filter. Try resetting filters or upload a new file.'
                : 'The course library currently has no supporting documents. Upload syllabi, rubrics, lecture notes, or lab manuals to associate them with your instructional modules.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenUpload(activeModuleFilter !== 'ALL' ? activeModuleFilter : undefined)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
              <button
                type="button"
                onClick={handleLoadExemplars}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Load Exemplars
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResources.map((item) => {
              const fileBadge = getFileTypeBadge(item);
              const assignedModule = item.moduleId ? moduleMap.get(item.moduleId) : undefined;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Format Badge, Star, Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${fileBadge.bg} ${fileBadge.text} ${fileBadge.border}`}
                        >
                          {fileBadge.label}
                        </span>

                        {(item.categoryTags || []).map((cat) => {
                          const catStyle = getCategoryTagStyle(cat);
                          return (
                            <span
                              key={cat}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                            >
                              {cat}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(item.id, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition cursor-pointer"
                          title={item.starred ? 'Unstar document' : 'Star document'}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              item.starred ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Edit document details and tags"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, item.title, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h4
                      onClick={() => setPreviewInspectorItem(item)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer line-clamp-2 leading-snug"
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Custom Tags */}
                    {item.customTags && item.customTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.customTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setActiveTagFilter(tag === activeTagFilter ? null : tag)}
                            className="px-1.5 py-0.2 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer: Module Association Selector + Download/Inspect */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    {/* Module Link Dropdown */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>Module:</span>
                      </span>

                      <select
                        value={item.moduleId || ''}
                        onChange={(e) => handleReassignModule(item.id, e.target.value)}
                        className={`text-xs py-1 px-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium max-w-[190px] truncate ${
                          assignedModule
                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <option value="">Course-Wide / General</option>
                        {modulesList.map((m) => (
                          <option key={m.id} value={m.id}>
                            Module {m.number}: {m.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* File Meta & Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {item.fileSize ? formatFileSize(item.fileSize) : item.type === 'link' ? 'Web Link' : 'File'}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewInspectorItem(item)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                          title="Preview document content"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDownloadFile(item, e)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                          title={item.type === 'link' ? 'Open link in new tab' : 'Download file'}
                        >
                          {item.type === 'link' ? (
                            <>
                              <ExternalLink className="w-3 h-3" />
                              <span>Open</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">★</th>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Associated Module</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((item) => {
                  const fileBadge = getFileTypeBadge(item);
                  const assignedModule = item.moduleId ? moduleMap.get(item.moduleId) : undefined;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(item.id, e)}
                          className="text-slate-300 hover:text-amber-500 cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              item.starred ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${fileBadge.bg} ${fileBadge.text} ${fileBadge.border}`}
                          >
                            {fileBadge.label}
                          </span>
                          <div>
                            <span
                              onClick={() => setPreviewInspectorItem(item)}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer"
                            >
                              {item.title}
                            </span>
                            {item.fileName && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {item.fileName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(item.categoryTags || []).map((cat) => {
                            const catStyle = getCategoryTagStyle(cat);
                            return (
                              <span
                                key={cat}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                              >
                                {cat}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={item.moduleId || ''}
                          onChange={(e) => handleReassignModule(item.id, e.target.value)}
                          className={`text-xs py-1 px-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium max-w-[180px] truncate ${
                            assignedModule
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <option value="">Course-Wide / General</option>
                          {modulesList.map((m) => (
                            <option key={m.id} value={m.id}>
                              Module {m.number}: {m.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(item.customTags || []).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {item.fileSize ? formatFileSize(item.fileSize) : item.type === 'link' ? 'Link' : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewInspectorItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                            title="Preview document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDownloadFile(item, e)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Download file"
                          >
                            {item.type === 'link' ? (
                              <ExternalLink className="w-3.5 h-3.5" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, item.title, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload & Tagging Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Supporting Document' : 'Upload Supporting Document'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tag and associate syllabus units, rubrics, and guides with course modules.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                    uploadType === 'file'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload File (PDF, DOCX, XLSX, etc.)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('link')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                    uploadType === 'link'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Cloud Link / Web URL</span>
                </button>
              </div>

              {/* File Dropzone */}
              {uploadType === 'file' ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Document File:</label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileProcess(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-50/70'
                        : uploadSelectedFile || editingItem?.fileName
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileProcess(e.target.files[0]);
                        }
                      }}
                    />

                    {uploadSelectedFile || editingItem?.fileName ? (
                      <div className="flex items-center space-x-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {uploadSelectedFile?.name || editingItem?.fileName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {uploadSelectedFile?.size
                              ? formatFileSize(uploadSelectedFile.size)
                              : editingItem?.fileSize
                              ? formatFileSize(editingItem.fileSize)
                              : 'File loaded'}{' '}
                            • Click or drop to replace
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                        <div className="font-bold text-slate-700">
                          Drop file here, or <span className="text-indigo-600 underline">browse</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          PDF, DOCX, XLSX, PPTX, TXT, Markdown, Images
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Resource URL / Cloud Link:</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or https://..."
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required={uploadType === 'link'}
                  />
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document Title *:</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Course Syllabus, Module 2 Rubric..."
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description (Optional):</label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of document purpose and instructions..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Associated Course Module Dropdown */}
              <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-950 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Associate with Specific Course Module:</span>
                  </label>
                  <span className="text-[10px] text-indigo-700 font-semibold">
                    {uploadModuleId ? 'Specific Module Attached' : 'Course-Wide / General'}
                  </span>
                </div>

                <select
                  value={uploadModuleId}
                  onChange={(e) => setUploadModuleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
                >
                  <option value="">Course-Wide / General (All Modules)</option>
                  {modulesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      Module {m.number}: {m.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Associating this document with a module makes it instantly accessible when reviewing or designing that specific unit in the Course Blueprint.
                </p>
              </div>

              {/* Category Tag Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Document Category Tags (Select all that apply) *:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {CATEGORY_ITEMS.map((cat) => {
                    const isSelected = uploadCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (uploadCategories.length > 1) {
                              setUploadCategories(uploadCategories.filter((c) => c !== cat.id));
                            }
                          } else {
                            setUploadCategories([...uploadCategories, cat.id]);
                          }
                        }}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer flex items-center space-x-2 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Tags System */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custom Tags (Press Enter or comma to add):
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-300 bg-white min-h-[42px] items-center">
                  {uploadTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[11px] font-semibold border border-indigo-200"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => setUploadTags(uploadTags.filter((t) => t !== tag))}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={uploadTags.length === 0 ? 'e.g. Midterm, ABET-Crit3, Week 2...' : 'Add tag...'}
                    value={tagInputText}
                    onChange={(e) => setTagInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const cleaned = tagInputText.trim().replace(/^#/, '');
                        if (cleaned && !uploadTags.includes(cleaned)) {
                          setUploadTags([...uploadTags, cleaned]);
                          setTagInputText('');
                        }
                      }
                    }}
                    className="flex-1 min-w-[120px] text-xs outline-none bg-transparent"
                  />
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Suggestions:</span>
                  {['Syllabus 2026', 'Analytic Rubric', 'Midterm', 'Capstone', 'ABET Crit 3', 'Washington Accord', 'Week 4'].map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (!uploadTags.includes(s)) {
                            setUploadTags([...uploadTags, s]);
                          }
                        }}
                        className="hover:text-indigo-600 hover:underline cursor-pointer"
                      >
                        +{s}
                      </button>
                    )
                  )}
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Upload to Library'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Content Preview Inspector Modal */}
      {previewInspectorItem && (
        <FileContentPreviewInspector
          item={previewInspectorItem}
          onClose={() => setPreviewInspectorItem(null)}
          onDownload={() => handleDownloadFile(previewInspectorItem)}
          onToggleStarred={() => handleToggleStar(previewInspectorItem.id)}
          onEdit={() => {
            const item = previewInspectorItem;
            setPreviewInspectorItem(null);
            handleOpenEdit(item);
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );

  // Render according to requested display mode
  if (mode === 'embedded') {
    return <div className={`rounded-2xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>{contentJSX}</div>;
  }

  if (mode === 'drawer') {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-200">
        <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {contentJSX}
        </div>
      </div>
    );
  }

  // Default: modal
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[88vh] max-h-[850px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {contentJSX}
      </div>
    </div>
  );
};
