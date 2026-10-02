import { ResourceItem, ResourceTagCategory, ModuleFolder } from '../types';
import {
  detectPreviewType,
  generateDocumentCanvasThumbnail,
  generateLinkCanvasThumbnail,
} from '../utils/filePreviewGenerator';

const STORAGE_KEY = 'obe360_resource_library';
const MODULE_STORAGE_KEY = 'obe360_resource_module_folders';

export const DEFAULT_MODULE_FOLDERS: ModuleFolder[] = [
  {
    id: 'mod-folder-1',
    name: 'Module 1: Foundations & Scope',
    moduleNumber: 1,
    description: 'Foundational reading, taxonomy guides, and introductory lecture notes.',
    colorTheme: 'blue',
  },
  {
    id: 'mod-folder-2',
    name: 'Module 2: Core Analysis & Methods',
    moduleNumber: 2,
    description: 'Analytical frameworks, technical worksheets, and modeling criteria.',
    colorTheme: 'indigo',
  },
  {
    id: 'mod-folder-3',
    name: 'Module 3: Active Studio & Project Lab',
    moduleNumber: 3,
    description: 'Hands-on laboratory manuals, project milestones, and rubrics.',
    colorTheme: 'emerald',
  },
  {
    id: 'mod-folder-4',
    name: 'Module 4: Synthesis & Capstone CQI',
    moduleNumber: 4,
    description: 'Summative assessment guidelines, CQI reports, and accreditation packages.',
    colorTheme: 'purple',
  },
];

const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: 'res-default-1',
    title: "Bloom's Revised Taxonomy Action Verbs & Cognitive Domain Guide",
    description: 'Comprehensive pedagogical matrix linking 6 cognitive levels with suitable formative and summative assessment tasks.',
    type: 'link',
    url: 'https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/',
    categoryTags: ['Assessment', 'Module'],
    customTags: ['Bloom Level', 'CLO Design', 'Action Verbs'],
    courseId: 'global',
    courseName: 'Shared Across All Projects',
    moduleId: 'mod-folder-1',
    moduleName: 'Module 1: Foundations & Scope',
    orderIndex: 0,
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Reference table for choosing active verbs in Step 3 and Step 4.',
    starred: true,
    previewType: 'link',
  },
  {
    id: 'res-default-2',
    title: 'Washington Accord & ABET Criterion 3 Student Outcomes Framework',
    description: 'Official accreditation descriptors for WA1 through WA12 engineering and computing graduate attributes.',
    type: 'link',
    url: 'https://www.ieagreements.org/accords/washington/',
    categoryTags: ['Project', 'Accreditation'],
    customTags: ['Accreditation', 'ABET', 'Washington Accord', 'PLO Mapping'],
    courseId: 'global',
    courseName: 'Shared Across All Projects',
    orderIndex: 1,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Use when validating CLO-to-PLO alignment thresholds in Step 2.',
    starred: true,
    previewType: 'link',
  },
  {
    id: 'res-default-3',
    title: 'Analytic Rubrics Four-Tier Performance Descriptors Template',
    description: 'Standard institutional scoring guide template with Exemplary, Proficient, Developing, and Not Achieved metrics.',
    type: 'file',
    fileName: 'OBE_Analytic_Rubric_Standard_Template.docx',
    fileSize: 48200,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    categoryTags: ['Assessment', 'Module'],
    customTags: ['Rubrics', 'Scoring Guide', 'Analytic'],
    courseId: 'global',
    courseName: 'Shared Across All Projects',
    moduleId: 'mod-folder-3',
    moduleName: 'Module 3: Active Studio & Project Lab',
    orderIndex: 2,
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Standardized 4-tier rubric descriptors for project and lab evaluations.',
    starred: false,
    previewType: 'doc',
  },
  {
    id: 'res-default-4',
    title: 'Weekly Modular Scaffolding & Student Workload Matrix Worksheet',
    description: 'Contact hours, autonomous study, and practical studio allocation spreadsheet compliant with 3-credit lecture/lab structures.',
    type: 'file',
    fileName: 'Modular_Scaffolding_Workload_Worksheet.xlsx',
    fileSize: 85400,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    categoryTags: ['Module', 'Project'],
    customTags: ['Workload', 'Credit Hours', 'Module Breakdown'],
    courseId: 'global',
    courseName: 'Shared Across All Projects',
    moduleId: 'mod-folder-2',
    moduleName: 'Module 2: Core Analysis & Methods',
    orderIndex: 3,
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Helps balance the 16-week schedule across active learning modules.',
    starred: false,
    previewType: 'sheet',
  },
  {
    id: 'res-default-5',
    title: 'Constructive Alignment & Continuous Quality Improvement (CQI) Protocol',
    description: 'Institutional guidelines for closing the assessment loop between prior cohort attainment and course offering updates.',
    type: 'file',
    fileName: 'CQI_Loop_Closing_Guidelines_2026.pdf',
    fileSize: 312000,
    fileType: 'application/pdf',
    categoryTags: ['Project', 'Assessment', 'Accreditation', 'Module'],
    customTags: ['CQI Loop', 'Attainment', 'Board of Studies'],
    courseId: 'global',
    courseName: 'Shared Across All Projects',
    moduleId: 'mod-folder-4',
    moduleName: 'Module 4: Synthesis & Capstone CQI',
    orderIndex: 4,
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Institutional template for Step 15 CQI loop documentation.',
    starred: true,
    previewType: 'pdf',
  },
];

/**
 * Ensures an item has previewType and previewThumbnail
 */
const ensureResourcePreview = (item: ResourceItem): ResourceItem => {
  const previewType = item.previewType || detectPreviewType(item.type, item.fileName, item.fileType, item.url);
  let previewThumbnail = item.previewThumbnail;

  if (!previewThumbnail) {
    if (item.type === 'link' && item.url) {
      previewThumbnail = generateLinkCanvasThumbnail(item.title, item.url);
    } else {
      previewThumbnail = generateDocumentCanvasThumbnail(item.title, previewType, item.fileName);
    }
  }

  return {
    ...item,
    previewType,
    previewThumbnail,
  };
};

export const getStoredResources = (): ResourceItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items: ResourceItem[] = [];
    if (!raw) {
      items = DEFAULT_RESOURCES.map(ensureResourcePreview);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return items;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      items = parsed.map(ensureResourcePreview);
      return items;
    }
    items = DEFAULT_RESOURCES.map(ensureResourcePreview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  } catch (err) {
    console.error('Failed to load resources from storage:', err);
    return DEFAULT_RESOURCES.map(ensureResourcePreview);
  }
};

export const saveAllResources = (resources: ResourceItem[]): void => {
  try {
    const processed = resources.map(ensureResourcePreview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(processed));
    window.dispatchEvent(new CustomEvent('obe_resources_updated', { detail: { count: processed.length } }));
  } catch (err) {
    console.error('Failed to save resources to storage:', err);
  }
};

export const addResource = (item: Omit<ResourceItem, 'id' | 'uploadedAt'> & { id?: string }): ResourceItem => {
  const current = getStoredResources();
  const previewType = item.previewType || detectPreviewType(item.type, item.fileName, item.fileType, item.url);
  let previewThumbnail = item.previewThumbnail;

  if (!previewThumbnail) {
    if (item.type === 'link' && item.url) {
      previewThumbnail = generateLinkCanvasThumbnail(item.title, item.url);
    } else {
      previewThumbnail = generateDocumentCanvasThumbnail(item.title, previewType, item.fileName);
    }
  }

  const newResource: ResourceItem = {
    ...item,
    id: item.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    uploadedAt: new Date().toISOString(),
    starred: item.starred ?? false,
    categoryTags: item.categoryTags && item.categoryTags.length > 0 ? item.categoryTags : ['Project'],
    customTags: item.customTags || [],
    previewType,
    previewThumbnail,
  };
  const updated = [newResource, ...current];
  saveAllResources(updated);
  return newResource;
};

export const updateStoredResource = (id: string, updates: Partial<ResourceItem>): ResourceItem | null => {
  const current = getStoredResources();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedItem: ResourceItem = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedItem;
  saveAllResources(current);
  return updatedItem;
};

export const deleteStoredResource = (id: string): boolean => {
  const current = getStoredResources();
  const next = current.filter((r) => r.id !== id);
  if (next.length !== current.length) {
    saveAllResources(next);
    return true;
  }
  return false;
};

export const toggleResourceStarred = (id: string): boolean => {
  const current = getStoredResources();
  const item = current.find((r) => r.id === id);
  if (item) {
    item.starred = !item.starred;
    saveAllResources(current);
    return !!item.starred;
  }
  return false;
};

/**
 * Moves a resource into a specific Module folder or unassigns it to root.
 */
export const moveResourceToModule = (
  resourceId: string,
  moduleId?: string,
  moduleName?: string
): ResourceItem | null => {
  const current = getStoredResources();
  const index = current.findIndex((r) => r.id === resourceId);
  if (index === -1) return null;

  const target = current[index];
  const updatedCategories = [...(target.categoryTags || [])];
  if (moduleId && !updatedCategories.includes('Module')) {
    updatedCategories.push('Module');
  }

  const updated: ResourceItem = {
    ...target,
    moduleId: moduleId || undefined,
    moduleName: moduleId ? (moduleName || 'Module Folder') : undefined,
    categoryTags: updatedCategories,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updated;
  saveAllResources(current);
  return updated;
};

/**
 * Reorders resources according to an array of resource IDs
 */
export const reorderResources = (orderedIds: string[]): ResourceItem[] => {
  const current = getStoredResources();
  const itemMap = new Map<string, ResourceItem>();
  current.forEach((item) => itemMap.set(item.id, item));

  const reordered: ResourceItem[] = [];
  orderedIds.forEach((id, idx) => {
    const item = itemMap.get(id);
    if (item) {
      reordered.push({
        ...item,
        orderIndex: idx,
      });
      itemMap.delete(id);
    }
  });

  // Append any remaining items that were not explicitly in the orderedIds list
  itemMap.forEach((item) => {
    reordered.push({
      ...item,
      orderIndex: reordered.length,
    });
  });

  saveAllResources(reordered);
  return reordered;
};

/**
 * Saves explicit new item ordering
 */
export const reorderResourceItems = (newItems: ResourceItem[]): ResourceItem[] => {
  const withIndices = newItems.map((item, idx) => ({
    ...item,
    orderIndex: idx,
  }));
  saveAllResources(withIndices);
  return withIndices;
};

// ==========================================
// MODULE FOLDERS STORAGE AND MANAGEMENT
// ==========================================

export const getStoredModuleFolders = (): ModuleFolder[] => {
  try {
    const raw = localStorage.getItem(MODULE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(DEFAULT_MODULE_FOLDERS));
      return DEFAULT_MODULE_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(DEFAULT_MODULE_FOLDERS));
    return DEFAULT_MODULE_FOLDERS;
  } catch (err) {
    console.error('Failed to load module folders from storage:', err);
    return DEFAULT_MODULE_FOLDERS;
  }
};

export const saveModuleFolders = (folders: ModuleFolder[]): void => {
  try {
    localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(folders));
    window.dispatchEvent(new CustomEvent('obe_module_folders_updated', { detail: { count: folders.length } }));
  } catch (err) {
    console.error('Failed to save module folders to storage:', err);
  }
};

export const addModuleFolder = (folder: Omit<ModuleFolder, 'id'> & { id?: string }): ModuleFolder => {
  const current = getStoredModuleFolders();
  const newFolder: ModuleFolder = {
    ...folder,
    id: folder.id || `mod-folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  const updated = [...current, newFolder];
  saveModuleFolders(updated);
  return newFolder;
};

export const updateModuleFolder = (id: string, updates: Partial<ModuleFolder>): ModuleFolder | null => {
  const current = getStoredModuleFolders();
  const index = current.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const updatedFolder: ModuleFolder = {
    ...current[index],
    ...updates,
  };
  current[index] = updatedFolder;
  saveModuleFolders(current);

  // Also update moduleName on any existing resources assigned to this folder
  if (updates.name) {
    const resources = getStoredResources();
    let modified = false;
    const nextResources = resources.map((res) => {
      if (res.moduleId === id) {
        modified = true;
        return { ...res, moduleName: updates.name };
      }
      return res;
    });
    if (modified) {
      saveAllResources(nextResources);
    }
  }

  return updatedFolder;
};

export const deleteModuleFolder = (id: string): boolean => {
  const current = getStoredModuleFolders();
  const next = current.filter((f) => f.id !== id);
  if (next.length !== current.length) {
    saveModuleFolders(next);

    // Unassign resources in this folder
    const resources = getStoredResources();
    let modified = false;
    const nextResources = resources.map((res) => {
      if (res.moduleId === id) {
        modified = true;
        return { ...res, moduleId: undefined, moduleName: undefined };
      }
      return res;
    });
    if (modified) {
      saveAllResources(nextResources);
    }
    return true;
  }
  return false;
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileTypeBadge = (
  item: ResourceItem
): { label: string; bg: string; text: string; border: string } => {
  if (item.type === 'link') {
    return {
      label: 'LINK',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
    };
  }

  const name = (item.fileName || item.title || '').toLowerCase();
  const type = (item.fileType || '').toLowerCase();

  if (name.endsWith('.pdf') || type.includes('pdf')) {
    return { label: 'PDF', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  }
  if (name.endsWith('.docx') || name.endsWith('.doc') || type.includes('word')) {
    return { label: 'DOCX', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || type.includes('sheet') || type.includes('excel')) {
    return { label: 'XLSX', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  if (name.endsWith('.pptx') || name.endsWith('.ppt') || type.includes('presentation')) {
    return { label: 'PPTX', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  }
  if (type.includes('image/') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) {
    return { label: 'IMG', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
  }
  return { label: 'FILE', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
};

export const getCategoryTagStyle = (
  tag: ResourceTagCategory
): { bg: string; text: string; border: string; label: string } => {
  switch (tag) {
    case 'Module':
      return {
        label: 'Module',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'Assessment':
      return {
        label: 'Assessment',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
      };
    case 'Project':
      return {
        label: 'Project',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'Reference':
      return {
        label: 'Reference',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'Accreditation':
      return {
        label: 'Accreditation',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
      };
    case 'Syllabus':
      return {
        label: 'Syllabus',
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
      };
    case 'Rubric':
      return {
        label: 'Rubric',
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        border: 'border-teal-200',
      };
    case 'LabManual':
      return {
        label: 'Lab Manual',
        bg: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-200',
      };
    case 'LectureNotes':
      return {
        label: 'Lecture Notes',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
      };
    default:
      return {
        label: tag,
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
      };
  }
};
