import { Course, BloomLevel } from '../types';
import { CourseValidationService } from '../services/courseValidationService';
import { OBEFrameworkRegistry } from './OBEFrameworkRegistry';

export interface OBECourseIntegrityManifest {
  checksum: string;
  courseCode: string;
  courseTitle: string;
  frameworkId: string;
  frameworkName: string;
  schemaVersion: string;
  exportedAt: string;
  readinessScore: number;
  healthScore: number;
  isCompliant: boolean;
  metrics: {
    totalCLOs: number;
    totalPLOMappings: number;
    totalModules: number;
    totalLessons: number;
    totalAssessments: number;
    totalAssessmentWeight: number;
    totalRubrics: number;
    totalCompetencies: number;
    totalSkills: number;
    bloomDistribution: Record<BloomLevel, number>;
  };
  alignmentTriangle: {
    totalOutcomes: number;
    alignedCount: number;
    partiallyAlignedCount: number;
    unalignedCount: number;
    rating: 'Strong' | 'Partial' | 'Needs Attention';
  };
}

export interface OBEOfflineProjectFile {
  fileFormat: 'MENTISERA_OBE_PROJECT';
  schemaVersion: '2.0.0';
  generator: 'Mentisera OBE Curriculum Studio';
  exportedAt: string;
  integrity: OBECourseIntegrityManifest;
  course: Course;
  offlineWorkInstructions: {
    description: string;
    guidelines: string[];
    reimportSupported: boolean;
  };
}

export interface OfflineProjectValidationResult {
  isValid: boolean;
  course?: Course;
  project?: OBEOfflineProjectFile;
  errors: string[];
  warnings: string[];
}

/**
 * Generates a deterministic hash code for verifying integrity of the exported OBE course
 */
function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `OBE-${hex}`;
}

export const OfflineProjectService = {
  /**
   * Builds an integrity manifest for an OBE course
   */
  buildIntegrityManifest(course: Course): OBECourseIntegrityManifest {
    const validationSummary = CourseValidationService.validateCourse(course);
    const framework = OBEFrameworkRegistry.getGuidebook(
      course.frameworkId || course.accreditationFramework
    );

    const clos = course.clos || [];
    const assessments = course.assessments || [];
    const modules = course.modules || [];
    const totalLessons = (course.lessons || []).length;
    const totalPLOMappings = clos.reduce((sum, c) => sum + (c.mappedPLOs?.length || 0), 0);
    const totalRubrics = (course.rubrics || []).length;

    // Count target competencies and skills
    const compSet = new Set<string>();
    const skillSet = new Set<string>();
    (course.blueprint?.targetCompetencies || []).forEach(c => compSet.add(c));
    (course.blueprint?.requiredSkills || []).forEach(s => skillSet.add(s));
    clos.forEach(clo => {
      if (clo.competency) compSet.add(clo.competency);
      if (clo.skills) {
        clo.skills.split(',').map(s => s.trim()).filter(Boolean).forEach(s => skillSet.add(s));
      }
    });

    // Triangle analysis
    const triangle = validationSummary.alignmentTriangle || [];
    const alignedCount = triangle.filter(t => t.isFullyAligned).length;
    const partiallyAlignedCount = triangle.filter(t => !t.isFullyAligned && (t.hasAssessment || t.hasTeachingActivity)).length;
    const unalignedCount = triangle.filter(t => !t.hasAssessment && !t.hasTeachingActivity).length;
    
    let rating: 'Strong' | 'Partial' | 'Needs Attention' = 'Strong';
    if (unalignedCount > 0 || alignedCount < clos.length * 0.7) {
      rating = alignedCount > 0 ? 'Partial' : 'Needs Attention';
    }

    const payloadForHash = JSON.stringify({
      id: course.id,
      code: course.code,
      title: course.title,
      frameworkId: framework.id,
      clos: clos.map(c => ({ id: c.id, code: c.code, bloom: c.bloomLevel, plos: c.mappedPLOs })),
      assessments: assessments.map(a => ({ id: a.id, weight: a.weightage, cloIds: a.linkedCLOIds || a.cloIds })),
      totalWeight: validationSummary.totalAssessmentWeight,
    });

    const checksum = generateSimpleHash(payloadForHash);

    return {
      checksum,
      courseCode: course.code || 'OBE-COURSE',
      courseTitle: course.title || 'Untitled Course',
      frameworkId: framework.id,
      frameworkName: framework.name,
      schemaVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      readinessScore: validationSummary.readinessScore,
      healthScore: validationSummary.healthScore,
      isCompliant: validationSummary.isCompliant,
      metrics: {
        totalCLOs: clos.length,
        totalPLOMappings,
        totalModules: modules.length,
        totalLessons,
        totalAssessments: assessments.length,
        totalAssessmentWeight: validationSummary.totalAssessmentWeight,
        totalRubrics,
        totalCompetencies: compSet.size,
        totalSkills: skillSet.size,
        bloomDistribution: validationSummary.bloomDistribution,
      },
      alignmentTriangle: {
        totalOutcomes: clos.length,
        alignedCount,
        partiallyAlignedCount,
        unalignedCount,
        rating,
      },
    };
  },

  /**
   * Generates the complete JSON-based local project file maintaining full OBE integrity
   */
  generateOfflineProject(course: Course): OBEOfflineProjectFile {
    const integrity = this.buildIntegrityManifest(course);

    return {
      fileFormat: 'MENTISERA_OBE_PROJECT',
      schemaVersion: '2.0.0',
      generator: 'Mentisera OBE Curriculum Studio',
      exportedAt: new Date().toISOString(),
      integrity,
      course: JSON.parse(JSON.stringify(course)),
      offlineWorkInstructions: {
        description:
          'This local project file contains the complete constructive alignment matrix, course blueprint, learning outcomes (CLOs), program alignments (PLOs), assessments, rubrics, and modular syllabus. It is fully self-contained for offline work and version control.',
        guidelines: [
          'Preserve all "id" fields when modifying outcomes or assessments to maintain constructive alignment links.',
          'Assessment weight percentages across all assessments should total exactly 100% for full OBE accreditation.',
          'Each CLO should remain linked to measurable Bloom action verbs and mapped to corresponding PLO benchmarks.',
          'This file can be re-imported into the Mentisera OBE Studio anytime via the "Import Offline Project" button with zero data loss.',
        ],
        reimportSupported: true,
      },
    };
  },

  /**
   * Triggers a browser download of the course as an offline project file (.obe.json)
   */
  downloadOfflineProject(course: Course, customFilename?: string): void {
    const project = this.generateOfflineProject(course);
    const jsonString = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const safeCode = (course.code || 'course')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTitle = (course.title || 'project')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = customFilename || `${safeCode}_${safeTitle}_obe_project.json`;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },

  /**
   * Validates parsed JSON data to ensure it is a valid OBE course project file
   */
  validateOfflineProject(data: any): OfflineProjectValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid file content: Expected a valid JSON object.'], warnings };
    }

    let course: Course | null = null;
    let project: OBEOfflineProjectFile | undefined = undefined;

    // Check if it's the wrapped OBEOfflineProjectFile or a raw Course object
    if (data.fileFormat === 'MENTISERA_OBE_PROJECT' && data.course) {
      project = data as OBEOfflineProjectFile;
      course = data.course as Course;
    } else if (data.id && (data.title || data.code) && Array.isArray(data.clos)) {
      // Direct Course JSON export
      course = data as Course;
      warnings.push('File is a direct Course export rather than an official .obe.json project package.');
    } else {
      errors.push('File missing required OBE course structures (title, code, or CLO matrix).');
      return { isValid: false, errors, warnings };
    }

    if (!course.id) {
      errors.push('Course is missing a unique ID.');
    }
    if (!course.title) {
      warnings.push('Course title is empty.');
    }
    if (!course.code) {
      warnings.push('Course code is empty.');
    }
    if (!Array.isArray(course.clos) || course.clos.length === 0) {
      warnings.push('Course does not contain any Course Learning Outcomes (CLOs).');
    }
    if (!Array.isArray(course.assessments) || course.assessments.length === 0) {
      warnings.push('Course does not contain any Assessment components.');
    }

    // Check weight percentage
    if (Array.isArray(course.assessments)) {
      const totalWeight = course.assessments.reduce((sum, a) => sum + (Number(a.weightage) || 0), 0);
      if (totalWeight !== 100) {
        warnings.push(`Total assessment weight is ${totalWeight}% (recommended is 100%).`);
      }
    }

    return {
      isValid: errors.length === 0,
      course: course || undefined,
      project,
      errors,
      warnings,
    };
  },

  /**
   * Reads a File from an input, parses and validates it
   */
  async readProjectFromFile(file: File): Promise<OfflineProjectValidationResult> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      return this.validateOfflineProject(data);
    } catch (err: any) {
      return {
        isValid: false,
        errors: [`Failed to parse JSON file: ${err?.message || 'Syntax error'}`],
        warnings: [],
      };
    }
  },
};
