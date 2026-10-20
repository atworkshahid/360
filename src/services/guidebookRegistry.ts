import { jsPDF } from 'jspdf';
import {
  generateFrameworkGuidebookBlob,
  downloadFrameworkGuidebookPDF,
  GuidebookPdfOptions,
} from '../utils/frameworkGuidebookPdf';
import { getFrameworkGuideline } from '../data/frameworkGuidelines';
import { INITIAL_FRAMEWORKS } from '../data/frameworksData';
import { ACCREDITATION_GUIDEBOOKS } from '../data/accreditationGuidebooksData';

export type GuidebookCategory = 'international' | 'accreditation' | 'national' | 'institutional';

export interface GuidebookChapter {
  id: string;
  number: string;
  title: string;
  stageKey?: string;
  stageLabel?: string;
  summary: string;
  requirements: string[];
  alignmentRules: string[];
  exemplars: Array<{
    title: string;
    text: string;
    rationale: string;
  }>;
  pitfalls: string[];
}

export interface GuidebookOutcomeItem {
  code: string;
  title: string;
  description: string;
  bloomsLevel?: string;
}

export interface FrameworkGuidebookEntry {
  id: string;
  code: string;
  name: string;
  title: string;
  governingBody: string;
  jurisdiction: string;
  category: GuidebookCategory;
  categoryLabel: string;
  edition: string;
  documentRef: string;
  publishedYear: string;
  pageCount: number;
  description: string;
  outcomeModel: string;
  accreditationScope: string;
  principles: string[];
  keyOutcomes: GuidebookOutcomeItem[];
  chapters: GuidebookChapter[];
  externalDocUrl?: string;
  getPdfBlob: (options?: GuidebookPdfOptions) => {
    doc: jsPDF;
    blob: Blob;
    blobUrl: string;
    fileName: string;
  };
  downloadPdf: (options?: GuidebookPdfOptions) => void;
}

// ---------------------------------------------------------------------------
// Registry Data Definitions - Sourced comprehensively from ACCREDITATION_GUIDEBOOKS
// ---------------------------------------------------------------------------

const BASE_REGISTRY_ENTRIES: Omit<FrameworkGuidebookEntry, 'getPdfBlob' | 'downloadPdf'>[] = ACCREDITATION_GUIDEBOOKS;

// ---------------------------------------------------------------------------
// Registry Service Implementation
// ---------------------------------------------------------------------------

class FrameworkGuidebookRegistry {
  private registry: Map<string, FrameworkGuidebookEntry> = new Map();

  constructor() {
    this.initDefaultRegistry();
  }

  private initDefaultRegistry() {
    BASE_REGISTRY_ENTRIES.forEach((base) => {
      const entry: FrameworkGuidebookEntry = {
        ...base,
        getPdfBlob: (options?: GuidebookPdfOptions) => {
          return generateFrameworkGuidebookBlob({
            frameworkId: base.id,
            frameworkName: base.name,
            ...options,
          });
        },
        downloadPdf: (options?: GuidebookPdfOptions) => {
          downloadFrameworkGuidebookPDF({
            frameworkId: base.id,
            frameworkName: base.name,
            ...options,
          });
        },
      };
      this.registry.set(base.id, entry);
    });

    // Also populate guidebook entries for all frameworks in INITIAL_FRAMEWORKS
    INITIAL_FRAMEWORKS.forEach((fw) => {
      if (!this.registry.has(fw.id)) {
        this.getById(fw.id);
      }
    });
  }

  /**
   * Returns all registered framework guidebook entries
   */
  public getAll(): FrameworkGuidebookEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Retrieves a guidebook by framework ID, code, or alias
   */
  public getById(idOrCode?: string): FrameworkGuidebookEntry {
    if (!idOrCode) {
      return this.registry.get('fw-washington-accord') || Array.from(this.registry.values())[0];
    }

    const direct = this.registry.get(idOrCode);
    if (direct) return direct;

    const norm = idOrCode.toLowerCase().trim();

    // Match by code
    for (const entry of this.registry.values()) {
      if (entry.code.toLowerCase() === norm) {
        return entry;
      }
    }

    // Match by keywords
    if (norm.includes('eac') || norm.includes('abet-eac')) {
      return this.registry.get('fw-abet-eac') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('cac') || norm.includes('computing')) {
      return this.registry.get('fw-abet-cac') || this.registry.get('fw-abet-eac')!;
    }
    if (norm.includes('seoul') || norm.includes('sa-comp')) {
      return this.registry.get('fw-seoul-accord') || this.registry.get('fw-abet-cac')!;
    }
    if (norm.includes('sydney') || norm.includes('sa-et') || norm.includes('technology')) {
      return this.registry.get('fw-sydney-accord') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('nba') || norm.includes('india')) {
      return this.registry.get('fw-nba-tier1') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('hec') || norm.includes('pakistan')) {
      return this.registry.get('fw-hec-pakistan') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('local') || norm.includes('institutional') || norm.includes('custom')) {
      return this.registry.get('fw-custom-institutional') || this.registry.get('fw-general-obe')!;
    }
    if (norm.includes('spady') || norm.includes('general')) {
      return this.registry.get('fw-general-obe') || this.registry.get('fw-washington-accord')!;
    }

    // Match against any framework in INITIAL_FRAMEWORKS and construct dynamic entry
    const fw = INITIAL_FRAMEWORKS.find(
      (f) =>
        f.id === idOrCode ||
        f.code.toLowerCase() === norm ||
        f.name.toLowerCase().includes(norm) ||
        norm.includes(f.code.toLowerCase())
    );
    if (fw) {
      const guideline = getFrameworkGuideline(fw.id);
      const dynamicEntry: FrameworkGuidebookEntry = {
        id: fw.id,
        code: fw.code,
        name: fw.name,
        title: `${fw.name} Compliance & Accreditation Guidebook`,
        governingBody: guideline.governingBody || fw.jurisdiction,
        jurisdiction: fw.jurisdiction,
        category: 'international',
        categoryLabel: fw.badge,
        edition: 'Official Accreditation Standard Specification (2024)',
        documentRef: `${fw.code}-ACCREDITATION-GUIDEBOOK`,
        publishedYear: '2024',
        pageCount: 16,
        description: fw.description,
        outcomeModel: fw.outcomeModel,
        accreditationScope: fw.discipline,
        principles: [
          `Aligned to ${fw.name} governance and criteria`,
          `Explicit constructive alignment from CLO to ${fw.outcomeModel}`,
          `Direct assessment evidence and authentic evaluation rubrics`,
          `Continuous Quality Improvement (CQI) and systematic review`,
        ],
        keyOutcomes: (guideline.graduateAttributes || []).map((ga) => ({
          code: ga.code,
          title: ga.title,
          description: ga.description,
          bloomsLevel: 'C3-C5',
        })),
        chapters: [],
        getPdfBlob: (options?: GuidebookPdfOptions) =>
          generateFrameworkGuidebookBlob({
            frameworkId: fw.id,
            frameworkName: fw.name,
            ...options,
          }),
        downloadPdf: (options?: GuidebookPdfOptions) =>
          downloadFrameworkGuidebookPDF({
            frameworkId: fw.id,
            frameworkName: fw.name,
            ...options,
          }),
      };
      this.registry.set(fw.id, dynamicEntry);
      return dynamicEntry;
    }

    return this.registry.get('fw-washington-accord') || Array.from(this.registry.values())[0];
  }

  /**
   * Intelligently links and resolves a guidebook for a course object
   */
  public resolveForCourse(course?: {
    frameworkId?: string;
    accreditationFramework?: string;
    title?: string;
    code?: string;
  }): FrameworkGuidebookEntry {
    if (!course) {
      return this.getById('fw-washington-accord');
    }
    if (course.frameworkId) {
      return this.getById(course.frameworkId);
    }
    if (course.accreditationFramework) {
      return this.getById(course.accreditationFramework);
    }
    return this.getById('fw-washington-accord');
  }

  /**
   * Registers or updates a custom framework entry in the registry
   */
  public registerCustom(entry: Partial<FrameworkGuidebookEntry> & { id: string; name: string }): FrameworkGuidebookEntry {
    const fullEntry: FrameworkGuidebookEntry = {
      id: entry.id,
      code: entry.code || 'CUSTOM-OBE',
      name: entry.name,
      title: entry.title || `${entry.name} Guidebook`,
      governingBody: entry.governingBody || 'Institutional Academic Committee',
      jurisdiction: entry.jurisdiction || 'Local Jurisdiction',
      category: entry.category || 'institutional',
      categoryLabel: entry.categoryLabel || 'Institutional Standard',
      edition: entry.edition || 'Current Edition',
      documentRef: entry.documentRef || 'DOC-REF-CUSTOM',
      publishedYear: entry.publishedYear || new Date().getFullYear().toString(),
      pageCount: entry.pageCount || 12,
      description: entry.description || 'Custom framework guidelines.',
      outcomeModel: entry.outcomeModel || 'Institutional Outcomes',
      accreditationScope: entry.accreditationScope || 'Academic Degree Programs',
      principles: entry.principles || ['Outcome-based constructive alignment'],
      keyOutcomes: entry.keyOutcomes || [],
      chapters: entry.chapters || [],
      getPdfBlob: (options?: GuidebookPdfOptions) => {
        return generateFrameworkGuidebookBlob({
          frameworkId: entry.id,
          frameworkName: entry.name,
          ...options,
        });
      },
      downloadPdf: (options?: GuidebookPdfOptions) => {
        downloadFrameworkGuidebookPDF({
          frameworkId: entry.id,
          frameworkName: entry.name,
          ...options,
        });
      },
    };

    this.registry.set(entry.id, fullEntry);
    return fullEntry;
  }
}

export const guidebookRegistry = new FrameworkGuidebookRegistry();

export function getGuidebookRegistry(): FrameworkGuidebookEntry[] {
  return guidebookRegistry.getAll();
}

export function getGuidebookEntry(idOrCode?: string): FrameworkGuidebookEntry {
  return guidebookRegistry.getById(idOrCode);
}

export function resolveCourseGuidebook(course?: {
  frameworkId?: string;
  accreditationFramework?: string;
}): FrameworkGuidebookEntry {
  return guidebookRegistry.resolveForCourse(course);
}

export {
  OBEFrameworkRegistry,
  getGuidebookByFrameworkId,
  getGuidebookForCourse,
  getFrameworkPdfPath,
  getAllFrameworkGuidebooks,
} from '../utils/OBEFrameworkRegistry';
export type {
  OBEFrameworkDefinition,
  CourseMetadataInput,
} from '../utils/OBEFrameworkRegistry';
