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
  GripVertical,
  Move,
  ArrowUpDown,
} from 'lucide-react';
import { ResourceItem, ResourceTagCategory, Course, ModuleFolder } from '../../types';
import {
  getStoredResources,
  addResource,
  updateStoredResource,
  deleteStoredResource,
  toggleResourceStarred,
  formatFileSize,
  getFileTypeBadge,
  getCategoryTagStyle,
  getStoredModuleFolders,
  addModuleFolder,
  updateModuleFolder,
  deleteModuleFolder,
  moveResourceToModule,
  reorderResourceItems,
} from '../../services/resourceLibraryService';
import { generatePreviewForFile } from '../../utils/filePreviewGenerator';
import { ResourceModal } from './ResourceModal';
import { ResourceThumbnail, FileContentPreviewInspector } from './ResourcePreview';
import { ModuleFoldersBar } from './ModuleFoldersBar';

interface ResourceLibraryViewProps {
  courses: Course[];
  onNavigateCourses: () => void;
  onSelectCourse?: (course: Course) => void;
}

export const ResourceLibraryView: React.FC<ResourceLibraryViewProps> = ({
  courses,
  onNavigateCourses,
  onSelectCourse,
}) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [folders, setFolders] = useState<ModuleFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceTagCategory | 'ALL'>('ALL');
  const [selectedCustomTag, setSelectedCustomTag] = useState<string | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'file' | 'link'>('ALL');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Drag & Drop State
  const [draggedResourceId, setDraggedResourceId] = useState<string | null>(null);
  const [dropTargetIndicator, setDropTargetIndicator] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);
  const quickUploadInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [modalInitialCategory, setModalInitialCategory] = useState<ResourceTagCategory | undefined>(undefined);
  const [modalInitialModuleId, setModalInitialModuleId] = useState<string | undefined>(undefined);
  const [detailModalItem, setDetailModalItem] = useState<ResourceItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Load resources from local storage
  const loadResources = () => {
    const items = getStoredResources();
    setResources(items);
  };

  // Load module folders from local storage
  const loadFolders = () => {
    const f = getStoredModuleFolders();
    setFolders(f);
  };

  useEffect(() => {
    loadResources();
    loadFolders();

    const handleResourceUpdate = () => loadResources();
    const handleFolderUpdate = () => loadFolders();

    window.addEventListener('obe_resources_updated', handleResourceUpdate);
    window.addEventListener('obe_module_folders_updated', handleFolderUpdate);

    return () => {
      window.removeEventListener('obe_resources_updated', handleResourceUpdate);
      window.removeEventListener('obe_module_folders_updated', handleFolderUpdate);
    };
  }, []);

  // Compute distinct custom tags for tag cloud
  const allCustomTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    resources.forEach((res) => {
      (res.customTags || []).forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) {
          tagMap.set(trimmed, (tagMap.get(trimmed) || 0) + 1);
        }
      });
    });
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [resources]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: resources.length,
      Module: 0,
      Assessment: 0,
      Project: 0,
      Reference: 0,
      Accreditation: 0,
    };
    resources.forEach((r) => {
      (r.categoryTags || []).forEach((cat) => {
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
    });
    return counts;
  }, [resources]);

  // Filtered list
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // Module folder filter
      if (selectedFolderId === 'unassigned') {
        if (item.moduleId) return false;
      } else if (selectedFolderId !== 'ALL') {
        if (item.moduleId !== selectedFolderId) return false;
      }

      // Category tag filter
      if (selectedCategory !== 'ALL') {
        if (!item.categoryTags || !item.categoryTags.includes(selectedCategory)) {
          return false;
        }
      }

      // Custom tag filter
      if (selectedCustomTag) {
        if (!item.customTags || !item.customTags.includes(selectedCustomTag)) {
          return false;
        }
      }

      // Type filter
      if (selectedTypeFilter !== 'ALL') {
        if (item.type !== selectedTypeFilter) return false;
      }

      // Project / Course filter
      if (selectedCourseFilter !== 'ALL') {
        if (item.courseId !== selectedCourseFilter) return false;
      }

      // Starred filter
      if (onlyStarred && !item.starred) {
        return false;
      }

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        const matchFile = (item.fileName || '').toLowerCase().includes(q);
        const matchUrl = (item.url || '').toLowerCase().includes(q);
        const matchCourse = (item.courseName || '').toLowerCase().includes(q);
        const matchModule = (item.moduleName || '').toLowerCase().includes(q);
        const matchTags = (item.customTags || []).some((t) => t.toLowerCase().includes(q));
        const matchCat = (item.categoryTags || []).some((c) => c.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchNotes && !matchFile && !matchUrl && !matchCourse && !matchModule && !matchTags && !matchCat) {
          return false;
        }
      }

      return true;
    });
  }, [
    resources,
    selectedFolderId,
    selectedCategory,
    selectedCustomTag,
    selectedTypeFilter,
    selectedCourseFilter,
    onlyStarred,
    searchQuery,
  ]);

  // Sort resources honoring explicit drag-and-drop orderIndex
  const sortedFilteredResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      const aOrder = a.orderIndex !== undefined ? a.orderIndex : 999999;
      const bOrder = b.orderIndex !== undefined ? b.orderIndex : 999999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [filteredResources]);

  const handleOpenAddModal = (category?: ResourceTagCategory, targetModuleId?: string) => {
    setEditingResource(null);
    setModalInitialCategory(category || (selectedFolderId !== 'ALL' && selectedFolderId !== 'unassigned' ? 'Module' : undefined));
    setModalInitialModuleId(targetModuleId || (selectedFolderId !== 'ALL' && selectedFolderId !== 'unassigned' ? selectedFolderId : undefined));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ResourceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingResource(item);
    setIsModalOpen(true);
  };

  const handleDeleteResource = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this resource from the library?')) {
      deleteStoredResource(id);
      loadResources();
      showToast('Resource removed');
    }
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleResourceStarred(id);
    loadResources();
  };

  const handleSaveResource = (resourceData: Omit<ResourceItem, 'id' | 'uploadedAt'> & { id?: string }) => {
    if (resourceData.id) {
      updateStoredResource(resourceData.id, resourceData);
      showToast('Resource updated');
    } else {
      addResource(resourceData);
      showToast('Resource added to library');
    }
    loadResources();
  };

  // ==========================================
  // MODULE FOLDER ACTIONS & DROP TARGETS
  // ==========================================

  const handleCreateFolder = (folderData: Omit<ModuleFolder, 'id'>) => {
    const newFolder = addModuleFolder(folderData);
    loadFolders();
    showToast(`Created module folder "${newFolder.name}"`);
  };

  const handleUpdateFolder = (folderId: string, updates: Partial<ModuleFolder>) => {
    const updated = updateModuleFolder(folderId, updates);
    if (updated) {
      loadFolders();
      loadResources();
      showToast(`Updated folder "${updated.name}"`);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteModuleFolder(folderId);
    loadFolders();
    loadResources();
    if (selectedFolderId === folderId) {
      setSelectedFolderId('ALL');
    }
    showToast('Folder deleted. Files moved to Root Library.');
  };

  const handleDropResourceToFolder = (resourceId: string, folderId?: string, folderName?: string) => {
    const updated = moveResourceToModule(resourceId, folderId, folderName);
    if (updated) {
      loadResources();
      showToast(
        folderId
          ? `Moved "${updated.title}" into ${folderName || 'Module Folder'}`
          : `Moved "${updated.title}" to Root Library (Unassigned)`
      );
    }
  };

  const handleDropFilesToFolder = async (files: FileList, folderId?: string, folderName?: string) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const preview = await generatePreviewForFile(file, file.name);
        addResource({
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: 'file',
          url: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          previewThumbnail: preview.previewThumbnail,
          previewType: preview.previewType,
          textContentSnippet: preview.textContentSnippet,
          categoryTags: folderId ? ['Module'] : ['Project'],
          moduleId: folderId,
          moduleName: folderName,
          courseId: 'global',
          courseName: 'Shared Across All Projects',
        });
        showToast(`Added "${file.name}" ${folderName ? `to ${folderName}` : 'to Resource Library'}`);
        loadResources();
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // DRAG & DROP REORDERING BETWEEN ITEMS
  // ==========================================

  const handleCardDragStart = (e: React.DragEvent, item: ResourceItem) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, title: item.title }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedResourceId(item.id);
  };

  const handleCardDragOver = (e: React.DragEvent, targetItem: ResourceItem) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedResourceId || draggedResourceId === targetItem.id) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const position = e.clientY < middleY ? 'before' : 'after';

    if (
      !dropTargetIndicator ||
      dropTargetIndicator.id !== targetItem.id ||
      dropTargetIndicator.position !== position
    ) {
      setDropTargetIndicator({ id: targetItem.id, position });
    }
  };

  const handleCardDragLeave = (e: React.DragEvent, targetItem: ResourceItem) => {
    const related = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(related)) {
      if (dropTargetIndicator?.id === targetItem.id) {
        setDropTargetIndicator(null);
      }
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetItem: ResourceItem) => {
    e.preventDefault();
    const sourceId = draggedResourceId || e.dataTransfer.getData('text/plain');
    const indicator = dropTargetIndicator;

    setDraggedResourceId(null);
    setDropTargetIndicator(null);

    if (!sourceId || sourceId === targetItem.id) return;

    const currentList = [...resources];
    const sourceIndex = currentList.findIndex((r) => r.id === sourceId);
    const targetIndex = currentList.findIndex((r) => r.id === targetItem.id);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [removed] = currentList.splice(sourceIndex, 1);
    let insertIndex = targetIndex;
    if (sourceIndex < targetIndex) {
      insertIndex = indicator?.position === 'before' ? targetIndex - 1 : targetIndex;
    } else {
      insertIndex = indicator?.position === 'before' ? targetIndex : targetIndex + 1;
    }
    if (insertIndex < 0) insertIndex = 0;
    if (insertIndex > currentList.length) insertIndex = currentList.length;

    currentList.splice(insertIndex, 0, removed);

    const updated = currentList.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));

    reorderResourceItems(updated);
    setResources(updated);
    showToast(`Reordered "${removed.title}"`);
  };

  const handleDragEnd = () => {
    setDraggedResourceId(null);
    setDropTargetIndicator(null);
  };

  const handleDownloadFile = (item: ResourceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.fileName || item.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a text file with notes and metadata
      const textContent = `RESOURCE: ${item.title}\nCATEGORY: ${(item.categoryTags || []).join(', ')}\nTAGS: ${(item.customTags || []).join(', ')}\nPROJECT: ${item.courseName || 'Global'}\nDESCRIPTION: ${item.description || ''}\nNOTES: ${item.notes || ''}\nDATE: ${item.uploadedAt}\n`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportAllJSON = () => {
    const data = {
      app: 'MENTISERA OBE360™ Resource Library',
      exportedAt: new Date().toISOString(),
      totalCount: resources.length,
      resources,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OBE360_Resource_Library_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearFilters = () => {
    setSelectedCategory('ALL');
    setSelectedCustomTag(null);
    setSelectedCourseFilter('ALL');
    setSelectedTypeFilter('ALL');
    setOnlyStarred(false);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedCustomTag !== null ||
    selectedCourseFilter !== 'ALL' ||
    selectedTypeFilter !== 'ALL' ||
    onlyStarred ||
    searchQuery.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Folder className="w-4 h-4 text-indigo-600" />
              <span>Institutional Course Repository</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Resource Library
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Centralized repository for syllabus documents, assessment rubrics, modular worksheets, and external accreditation links across your course projects. Categorize by <span className="font-semibold text-blue-700">Module</span>, <span className="font-semibold text-purple-700">Assessment</span>, or <span className="font-semibold text-emerald-700">Project</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportAllJSON}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
              title="Export all resource links and metadata as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Library</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('Module')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-xs shadow-indigo-200 cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Primary Tag Category Tabs: All, Module, Assessment, Project, Reference, Accreditation */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Resources', count: categoryCounts['ALL'] },
              { id: 'Module', label: 'Module', count: categoryCounts['Module'], color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { id: 'Assessment', label: 'Assessment', count: categoryCounts['Assessment'], color: 'text-purple-700 bg-purple-50 border-purple-200' },
              { id: 'Project', label: 'Project', count: categoryCounts['Project'], color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { id: 'Reference', label: 'Reference', count: categoryCounts['Reference'], color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { id: 'Accreditation', label: 'Accreditation', count: categoryCounts['Accreditation'], color: 'text-rose-700 bg-rose-50 border-rose-200' },
            ].map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isSelected ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title={viewMode === 'grid' ? 'Switch to list/table view' : 'Switch to card grid'}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Module Folders Management Bar (Drag & Drop Zone) */}
      <ModuleFoldersBar
        folders={folders}
        resources={resources}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
        onDropResourceToFolder={handleDropResourceToFolder}
        onDropFilesToFolder={handleDropFilesToFolder}
        isDraggingAnyItem={!!draggedResourceId}
      />

      {/* Filter Toolbar: Search, Course Filter, Type Filter, Starred, Custom Tags */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, tags (#rubric), or course..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project / Course Filter */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              <option value="ALL">All Projects / Courses</option>
              <option value="global">🌐 Shared / Global</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  📚 {c.code} - {c.name.substring(0, 24)}...
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              <option value="ALL">All Types</option>
              <option value="file">📁 Uploaded Files</option>
              <option value="link">🔗 Web Links</option>
            </select>

            {/* Starred Toggle */}
            <button
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border ${
                onlyStarred
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span>Starred</span>
            </button>
          </div>
        </div>

        {/* Custom Tag Cloud (Filter by Tag) */}
        {allCustomTags.length > 0 && (
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1 mr-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Filter by Tag:</span>
            </span>
            {allCustomTags.map(([tag, count]) => {
              const isSelected = selectedCustomTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedCustomTag(isSelected ? null : tag)}
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filters Summary Badge */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="text-[11px] text-slate-400">Active filters:</span>
              {selectedCategory !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedCustomTag && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                  Tag: #{selectedCustomTag}
                </span>
              )}
              {selectedCourseFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                  Project Filter
                </span>
              )}
              {selectedTypeFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                  Type: {selectedTypeFilter}
                </span>
              )}
              {onlyStarred && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                  Starred
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-bold">
                  "{searchQuery}"
                </span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Resource Count Banner & DnD Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 px-1">
        <div className="flex items-center space-x-2 flex-wrap">
          <span>
            Showing <span className="font-bold text-slate-900">{sortedFilteredResources.length}</span> of{' '}
            <span className="font-bold text-slate-900">{resources.length}</span> resources
          </span>
          {selectedFolderId !== 'ALL' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold">
              <Folder className="w-3 h-3 text-indigo-600" />
              <span>
                {selectedFolderId === 'unassigned'
                  ? 'Root / Unassigned'
                  : folders.find((f) => f.id === selectedFolderId)?.name || 'Module'}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <GripVertical className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Drag cards to reorder or move to folder</span>
          </span>
          {selectedFolderId !== 'ALL' && selectedFolderId !== 'unassigned' && (
            <button
              onClick={() => handleOpenAddModal('Module', selectedFolderId)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to this Module</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFilteredResources.map((item) => {
            const badge = getFileTypeBadge(item);
            const isDragging = draggedResourceId === item.id;
            const isTarget = dropTargetIndicator?.id === item.id;

            return (
              <div
                key={item.id}
                draggable={true}
                onDragStart={(e) => handleCardDragStart(e, item)}
                onDragOver={(e) => handleCardDragOver(e, item)}
                onDragLeave={(e) => handleCardDragLeave(e, item)}
                onDrop={(e) => handleCardDrop(e, item)}
                onDragEnd={handleDragEnd}
                onClick={() => setDetailModalItem(item)}
                className={`bg-white rounded-2xl border transition p-5 flex flex-col justify-between group cursor-pointer relative ${
                  isDragging
                    ? 'opacity-30 ring-2 ring-indigo-400 scale-[0.98]'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {/* Reordering Drop Indicator Line */}
                {isTarget && (
                  <div
                    className={`absolute left-0 right-0 h-1 bg-indigo-600 rounded-full shadow-md z-20 pointer-events-none ${
                      dropTargetIndicator.position === 'before' ? '-top-1.5' : '-bottom-1.5'
                    }`}
                  />
                )}

                <div>
                  {/* Top row: Drag Handle, Format Badge, Star, Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition shrink-0"
                        title="Drag to reorder or drag into a Module folder above"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                      {item.fileSize && (
                        <span className="text-[11px] text-slate-400">
                          {formatFileSize(item.fileSize)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(item.id, e)}
                        className={`p-1.5 rounded-lg transition ${
                          item.starred
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                        title={item.starred ? 'Starred' : 'Add to Starred'}
                      >
                        <Star className={`w-4 h-4 ${item.starred ? 'fill-amber-500' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(item, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteResource(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Automatic Visual Thumbnail / Document Cover */}
                  <div className="mb-3">
                    <ResourceThumbnail
                      item={item}
                      size="md"
                      onQuickPreview={(res) => setDetailModalItem(res)}
                    />
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 mb-1.5">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Module Folder Indicator Pill & Quick Relocate Dropdown */}
                  <div
                    className="flex items-center space-x-1.5 mb-2.5 text-[11px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Folder:</span>
                    <select
                      value={item.moduleId || ''}
                      onChange={(e) => {
                        const targetModId = e.target.value;
                        const targetMod = folders.find((f) => f.id === targetModId);
                        handleDropResourceToFolder(item.id, targetModId || undefined, targetMod?.name);
                      }}
                      className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/90 rounded-lg px-2 py-0.5 cursor-pointer max-w-[200px] truncate focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      title="Move to another module folder"
                    >
                      <option value="">📂 Root / Unassigned</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Tags: Module, Assessment, Project, etc. */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(item.categoryTags || []).map((cat) => {
                      const style = getCategoryTagStyle(cat);
                      return (
                        <span
                          key={cat}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {style.label}
                        </span>
                      );
                    })}

                    {(item.customTags || []).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Course association & Open/Download button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[150px]">
                    {item.courseName || 'Shared Project'}
                  </div>

                  {item.type === 'link' ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDownloadFile(item, e)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Download</span>
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="w-8 px-2 py-3"></th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Module Folder</th>
                  <th className="px-4 py-3">Category Tags</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFilteredResources.map((item) => {
                  const badge = getFileTypeBadge(item);
                  const isDragging = draggedResourceId === item.id;
                  const isTarget = dropTargetIndicator?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      draggable={true}
                      onDragStart={(e) => handleCardDragStart(e, item)}
                      onDragOver={(e) => handleCardDragOver(e, item)}
                      onDragLeave={(e) => handleCardDragLeave(e, item)}
                      onDrop={(e) => handleCardDrop(e, item)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setDetailModalItem(item)}
                      className={`transition cursor-pointer relative ${
                        isDragging ? 'opacity-30 bg-indigo-50/70' : 'hover:bg-indigo-50/40'
                      }`}
                    >
                      {/* Insertion Line for Table */}
                      {isTarget && (
                        <td
                          colSpan={8}
                          className={`absolute left-0 right-0 h-1 bg-indigo-600 z-20 pointer-events-none p-0 ${
                            dropTargetIndicator.position === 'before' ? 'top-0' : 'bottom-0'
                          }`}
                        />
                      )}

                      <td className="w-8 px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-indigo-600 rounded transition"
                          title="Drag to reorder or move to folder"
                        >
                          <GripVertical className="w-3.5 h-3.5 mx-auto" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2.5">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(item.id, e)}
                            className="text-slate-300 hover:text-amber-500 shrink-0"
                          >
                            <Star className={`w-3.5 h-3.5 ${item.starred ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                          <ResourceThumbnail
                            item={item}
                            size="sm"
                            onQuickPreview={(res) => setDetailModalItem(res)}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                            {item.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.moduleId || ''}
                          onChange={(e) => {
                            const targetModId = e.target.value;
                            const targetMod = folders.find((f) => f.id === targetModId);
                            handleDropResourceToFolder(item.id, targetModId || undefined, targetMod?.name);
                          }}
                          className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5 cursor-pointer max-w-[160px] truncate"
                        >
                          <option value="">📂 Unassigned</option>
                          {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                              📁 {f.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(item.categoryTags || []).map((cat) => {
                            const style = getCategoryTagStyle(cat);
                            return (
                              <span
                                key={cat}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
                              >
                                {style.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600 whitespace-nowrap">
                        {item.courseName || 'Shared'}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {item.type === 'link' ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded hover:bg-slate-100 text-indigo-600"
                              title="Open External Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleDownloadFile(item, e)}
                              className="p-1 rounded hover:bg-slate-100 text-indigo-600"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(item, e)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteResource(item.id, e)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600"
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
        </div>
      )}

      {/* Empty State */}
      {sortedFilteredResources.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 mb-1">No resources found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            {hasActiveFilters
              ? 'No resources match your active search filters or selected tags.'
              : selectedFolderId !== 'ALL'
              ? 'This module folder is currently empty. Drag resources into it or add a new file below.'
              : 'Your Resource Library is currently empty. Upload documents or save external links to share across your courses.'}
          </p>
          <div className="flex items-center justify-center space-x-2">
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 transition cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => handleOpenAddModal('Module', selectedFolderId !== 'ALL' && selectedFolderId !== 'unassigned' ? selectedFolderId : undefined)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-500 transition cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveResource}
        editingResource={editingResource}
        courses={courses}
        moduleFolders={folders}
        initialCategory={modalInitialCategory}
        initialModuleId={modalInitialModuleId}
      />

      {/* Detail & Preview Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                      getFileTypeBadge(detailModalItem).bg
                    } ${getFileTypeBadge(detailModalItem).text} ${
                      getFileTypeBadge(detailModalItem).border
                    }`}
                  >
                    {getFileTypeBadge(detailModalItem).label}
                  </span>
                  {detailModalItem.fileSize && (
                    <span className="text-xs text-slate-400">
                      {formatFileSize(detailModalItem.fileSize)}
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Auto-Generated Preview</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{detailModalItem.title}</h3>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Full Interactive Preview Inspector */}
              <FileContentPreviewInspector item={detailModalItem} />

              {detailModalItem.description && (
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                    Description & Learning Purpose
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {detailModalItem.description}
                  </p>
                </div>
              )}

              <div>
                <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5">
                  Category & Custom Tags
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(detailModalItem.categoryTags || []).map((cat) => {
                    const style = getCategoryTagStyle(cat);
                    return (
                      <span
                        key={cat}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {style.label}
                      </span>
                    );
                  })}
                  {(detailModalItem.customTags || []).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                  Module Folder Location
                </h5>
                <div className="flex items-center space-x-2">
                  <select
                    value={detailModalItem.moduleId || ''}
                    onChange={(e) => {
                      const targetModId = e.target.value;
                      const targetMod = folders.find((f) => f.id === targetModId);
                      const updated = moveResourceToModule(detailModalItem.id, targetModId || undefined, targetMod?.name);
                      if (updated) {
                        setDetailModalItem(updated);
                        loadResources();
                        showToast(targetModId ? `Moved to ${targetMod?.name}` : 'Moved to Root Library (Unassigned)');
                      }
                    }}
                    className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-1.5 cursor-pointer max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">📂 Root / Unassigned</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                  Associated Project
                </h5>
                <p className="text-slate-700 font-semibold">{detailModalItem.courseName || 'Shared Across All Projects'}</p>
              </div>

              {detailModalItem.notes && (
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                    Faculty Notes & Instructions
                  </h5>
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-amber-900 leading-relaxed whitespace-pre-wrap">
                    {detailModalItem.notes}
                  </div>
                </div>
              )}

              {detailModalItem.url && detailModalItem.type === 'link' && (
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                    Target Web Address
                  </h5>
                  <a
                    href={detailModalItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 underline break-all font-mono text-[11px]"
                  >
                    {detailModalItem.url}
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const item = detailModalItem;
                  setDetailModalItem(null);
                  handleOpenEditModal(item);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Metadata</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDetailModalItem(null)}
                  className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                {detailModalItem.type === 'link' ? (
                  <a
                    href={detailModalItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition flex items-center space-x-1"
                  >
                    <span>Visit Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(detailModalItem)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Download File</span>
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
