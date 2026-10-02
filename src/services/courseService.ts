import { Course } from '../types';
import {
  OBEFrameworkRegistry,
  FrameworkValidationResult,
  OBEFrameworkDefinition,
} from '../utils/OBEFrameworkRegistry';
import {
  DossierPdfService,
  AccreditationDossierOptions,
  DossierGenerationResult,
} from './dossierPdfService';

const API_BASE = '/api/courses';
const LOCAL_STORAGE_KEY = 'mentisera_obe360_courses_v1';

/**
 * Representation of a specific content deviation from the selected OBE framework's standards.
 */
export interface FrameworkDeviationWarning {
  id: string;
  /**
   * The targeted form field path (e.g. 'clos[0].description', 'clos[0].bloomLevel', 'clos.count', 'ploMapping[clo-1]', 'passingBenchmark', 'assessments')
   */
  field: string;
  cloIndex?: number;
  cloId?: string;
  stepNumber: number;
  stepKey: string;
  severity: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  guidebookReference: string;
  suggestion: string;
  suggestedAction?: {
    type: 'replace_verb' | 'elevate_bloom' | 'add_assessment' | 'map_outcome' | 'adjust_benchmark';
    label: string;
    targetValue?: any;
    cloId?: string;
  };
}

/**
 * Complete validation report comparing course content against the chosen framework's criteria.
 */
export interface FrameworkContentValidationReport {
  frameworkId: string;
  frameworkCode: string;
  frameworkName: string;
  isValid: boolean;
  score: number;
  warningsCount: number;
  errorsCount: number;
  warnings: FrameworkDeviationWarning[];
  byField: Record<string, FrameworkDeviationWarning[]>;
}

// Common non-observable / non-measurable verbs flagged by international accreditation standards (ABET, Washington Accord)
const FORBIDDEN_OBSERVATION_VERBS = [
  { verb: 'understand', replacement: 'Analyze', bloomLevel: 'Analyze' },
  { verb: 'understands', replacement: 'Analyzes', bloomLevel: 'Analyze' },
  { verb: 'understanding', replacement: 'Analysis of', bloomLevel: 'Analyze' },
  { verb: 'know', replacement: 'Identify and describe', bloomLevel: 'Understand' },
  { verb: 'knows', replacement: 'Identifies', bloomLevel: 'Understand' },
  { verb: 'learn', replacement: 'Evaluate and apply', bloomLevel: 'Evaluate' },
  { verb: 'learns', replacement: 'Evaluates', bloomLevel: 'Evaluate' },
  { verb: 'be familiar with', replacement: 'Explain and distinguish', bloomLevel: 'Understand' },
  { verb: 'familiarize', replacement: 'Examine', bloomLevel: 'Analyze' },
  { verb: 'appreciate', replacement: 'Critique and evaluate', bloomLevel: 'Evaluate' },
  { verb: 'comprehend', replacement: 'Interpret', bloomLevel: 'Understand' },
  { verb: 'study', replacement: 'Investigate', bloomLevel: 'Analyze' },
  { verb: 'explore', replacement: 'Investigate and synthesize', bloomLevel: 'Create' },
  { verb: 'gain knowledge', replacement: 'Demonstrate application of', bloomLevel: 'Apply' },
];

/**
 * Validates and annotates an individual course with its framework documentation status
 */
function annotateCourseWithFrameworkValidation(course: Course): Course {
  const validation = OBEFrameworkRegistry.validateFramework(
    course.frameworkId || course.accreditationFramework
  );

  return {
    ...course,
    frameworkValidationStatus: validation.status,
    frameworkValidationMessage: validation.message,
  };
}

export const CourseService = {
  /**
   * Validates a course's framework against the OBEFrameworkRegistry.
   */
  validateCourseFramework(course: Course | null | undefined): FrameworkValidationResult {
    if (!course) {
      return OBEFrameworkRegistry.validateFramework(null);
    }
    return OBEFrameworkRegistry.validateFramework(
      course.frameworkId || course.accreditationFramework
    );
  },

  /**
   * Validates a raw framework ID string against the OBEFrameworkRegistry.
   */
  validateFrameworkId(frameworkId?: string | null): FrameworkValidationResult {
    return OBEFrameworkRegistry.validateFramework(frameworkId);
  },

  /**
   * Validates course content in the CourseWizard against the selected
   * OBE framework's accreditation criteria and returns field-level deviation warnings.
   */
  validateCourseContentAgainstFramework(course: Course): FrameworkContentValidationReport {
    const guidebook: OBEFrameworkDefinition = OBEFrameworkRegistry.getGuidebook(
      course.frameworkId || course.accreditationFramework
    );

    const warnings: FrameworkDeviationWarning[] = [];
    const isEngineeringOrComputing =
      guidebook.category === 'accreditation' ||
      guidebook.category === 'international' ||
      guidebook.id.includes('abet') ||
      guidebook.id.includes('accord') ||
      guidebook.id.includes('nba') ||
      guidebook.id.includes('hec');

    // -------------------------------------------------------------------------
    // 1. CLO Count Validation (Step 04)
    // -------------------------------------------------------------------------
    const cloCount = course.clos ? course.clos.length : 0;
    if (cloCount === 0) {
      warnings.push({
        id: 'clo-count-zero',
        field: 'clos',
        stepNumber: 4,
        stepKey: 'step_clos',
        severity: 'error',
        title: 'Missing Course Learning Outcomes',
        message: `${guidebook.code} mandates explicitly documented Course Learning Outcomes (CLOs).`,
        guidebookReference: `${guidebook.code} Criterion 3 / Outcome Model`,
        suggestion: 'Formulate at least 3 observable and measurable CLOs.',
        suggestedAction: {
          type: 'elevate_bloom',
          label: 'Generate Standard CLOs',
        },
      });
    } else if (cloCount < 3) {
      warnings.push({
        id: 'clo-count-low',
        field: 'clos',
        stepNumber: 4,
        stepKey: 'step_clos',
        severity: 'warning',
        title: 'Insufficient CLO Count',
        message: `${guidebook.code} recommends a minimum of 3 to 6 Course Learning Outcomes for comprehensive competency coverage.`,
        guidebookReference: `${guidebook.code} Accreditation Handbook (Section 4)`,
        suggestion: 'Add 1-2 additional measurable outcomes targeting problem analysis, engineering design, or modern tool application.',
      });
    } else if (cloCount > 7) {
      warnings.push({
        id: 'clo-count-excessive',
        field: 'clos',
        stepNumber: 4,
        stepKey: 'step_clos',
        severity: 'info',
        title: 'High CLO Count (Assessment Fatigue Risk)',
        message: `${guidebook.code} guidelines recommend limiting outcomes to 3-6 to avoid shallow assessment and evidence dilution.`,
        guidebookReference: `${guidebook.code} Criterion 4 Continuous Improvement Protocol`,
        suggestion: 'Synthesize related micro-outcomes into cohesive, overarching course outcomes.',
      });
    }

    // -------------------------------------------------------------------------
    // 2. Individual CLO Action Verbs & Cognitive Rigor (Step 04)
    // -------------------------------------------------------------------------
    let hasHigherOrderCognitive = false; // C4, C5, C6
    let hasComplexProblemSolving = false;

    if (course.clos && course.clos.length > 0) {
      course.clos.forEach((clo, idx) => {
        const text = (clo.statement || (clo as any).description || '').trim();
        const lowerText = text.toLowerCase();

        // 2a. Length check
        if (text.length > 0 && text.length < 25) {
          warnings.push({
            id: `clo-${idx}-too-short`,
            field: `clos[${idx}].statement`,
            cloIndex: idx,
            cloId: clo.id,
            stepNumber: 4,
            stepKey: 'step_clos',
            severity: 'warning',
            title: `CLO ${idx + 1} Lacks Sufficient Specificity`,
            message: `Outcome description is too concise to define observable performance standards required by ${guidebook.code}.`,
            guidebookReference: `${guidebook.code} Constructive Alignment Guidelines`,
            suggestion: 'Expand the outcome to state the technical task, context/condition, and standard of achievement.',
          });
        }

        // 2b. Forbidden / non-observable action verbs check
        for (const item of FORBIDDEN_OBSERVATION_VERBS) {
          const regex = new RegExp(`\\b${item.verb}\\b`, 'i');
          if (regex.test(lowerText)) {
            warnings.push({
              id: `clo-${idx}-forbidden-verb-${item.verb}`,
              field: `clos[${idx}].statement`,
              cloIndex: idx,
              cloId: clo.id,
              stepNumber: 4,
              stepKey: 'step_clos',
              severity: 'error',
              title: `Non-Observable Verb '${item.verb}' in CLO ${idx + 1}`,
              message: `Outcome uses '${item.verb}', which is non-observable and violates ${guidebook.code} direct assessment standards.`,
              guidebookReference: `${guidebook.code} Bloom's Taxonomy & Action Verbs Guide`,
              suggestion: `Replace '${item.verb}' with an observable action verb such as '${item.replacement}' or '${item.bloomLevel}'.`,
              suggestedAction: {
                type: 'replace_verb',
                label: `Replace with '${item.replacement}'`,
                targetValue: item.replacement,
                cloId: clo.id,
              },
            });
            break; // Report the primary forbidden verb per CLO
          }
        }

        // 2c. Higher-order cognitive rigor tracking
        const bLevel = (clo.bloomLevel || '').toLowerCase();
        if (
          bLevel.includes('analyze') ||
          bLevel.includes('evaluate') ||
          bLevel.includes('create') ||
          bLevel.includes('c4') ||
          bLevel.includes('c5') ||
          bLevel.includes('c6')
        ) {
          hasHigherOrderCognitive = true;
        }

        // 2d. Complex Engineering Problem (CEP) / Complex Computing Activity (CCA)
        if (
          lowerText.includes('design') ||
          lowerText.includes('formulate') ||
          lowerText.includes('synthesize') ||
          lowerText.includes('evaluate') ||
          lowerText.includes('optimize') ||
          lowerText.includes('complex') ||
          lowerText.includes('investigate') ||
          lowerText.includes('simulate')
        ) {
          hasComplexProblemSolving = true;
        }
      });

      // 2e. Higher-order cognitive verification for professional frameworks
      if (isEngineeringOrComputing && !hasHigherOrderCognitive) {
        warnings.push({
          id: 'clos-no-higher-order',
          field: 'clos',
          stepNumber: 4,
          stepKey: 'step_clos',
          severity: 'warning',
          title: `Cognitive Rigor Deficit for ${guidebook.code}`,
          message: `${guidebook.code} mandates that undergraduate courses incorporate higher-order cognitive competencies (Analyzing C4, Evaluating C5, or Creating C6). All current CLOs are lower-order recall/comprehension.`,
          guidebookReference: `${guidebook.code} Knowledge Profile & Attribute Standard`,
          suggestion: 'Elevate at least one CLO to Bloom Level C4 (Analyze) or C6 (Design/Synthesize).',
        });
      }

      // 2f. Complex Problem Solving (CEP) verification
      if (
        (guidebook.id === 'fw-washington-accord' ||
          guidebook.id === 'fw-abet-eac' ||
          guidebook.id === 'fw-hec-pakistan') &&
        !hasComplexProblemSolving
      ) {
        warnings.push({
          id: 'clos-no-cep',
          field: 'clos',
          stepNumber: 4,
          stepKey: 'step_clos',
          severity: 'warning',
          title: 'Complex Engineering Problem (CEP) Requirement Missing',
          message: `The Washington Accord (WP1-WP7) and ABET Criterion 3 mandate that upper-level engineering courses feature Complex Engineering Problem (CEP) solving.`,
          guidebookReference: `IEA GAPC Complex Engineering Problems (WP1-WP7)`,
          suggestion: 'Ensure at least one CLO targets open-ended problem formulation, engineering design under realistic constraints, or multi-disciplinary evaluation.',
        });
      }
    }

    // -------------------------------------------------------------------------
    // 3. Outcome / PLO Mapping Matrix Validation (Step 05)
    // -------------------------------------------------------------------------
    if (course.clos && course.clos.length > 0) {
      const mapping = course.ploMapping || {};

      course.clos.forEach((clo, idx) => {
        const cloMappings = mapping[clo.id] || {};
        const mappedOutcomeKeys = Object.keys(cloMappings).filter(
          (k) => cloMappings[k] && cloMappings[k] > 0
        );
        const cloMappedPlos = clo.mappedPLOs || [];
        const totalMapped = mappedOutcomeKeys.length + cloMappedPlos.length;

        if (totalMapped === 0) {
          warnings.push({
            id: `clo-${idx}-unmapped-plo`,
            field: `ploMapping[${clo.id}]`,
            cloIndex: idx,
            cloId: clo.id,
            stepNumber: 5,
            stepKey: 'step_plo_mapping',
            severity: 'error',
            title: `CLO ${idx + 1} Unmapped to ${guidebook.code} Outcomes`,
            message: `Every Course Learning Outcome must correlate to at least one Program Learning Outcome (${guidebook.outcomeModel}).`,
            guidebookReference: `${guidebook.code} Course Articulation Matrix (CAM) Standard`,
            suggestion: `Map CLO ${idx + 1} to a primary Student Outcome (e.g. ${guidebook.keyOutcomes[0]?.code || 'Outcome 1'}) with intensity weight 2 (Moderate) or 3 (Substantial).`,
            suggestedAction: {
              type: 'map_outcome',
              label: `Map to ${guidebook.keyOutcomes[0]?.code || 'Primary SO'}`,
              cloId: clo.id,
            },
          });
        } else if (mappedOutcomeKeys.length > 4) {
          warnings.push({
            id: `clo-${idx}-over-mapped`,
            field: `ploMapping[${clo.id}]`,
            cloIndex: idx,
            cloId: clo.id,
            stepNumber: 5,
            stepKey: 'step_plo_mapping',
            severity: 'info',
            title: `CLO ${idx + 1} Over-Mapped (Scattered Alignment)`,
            message: `CLO ${idx + 1} is mapped to ${mappedOutcomeKeys.length} outcomes. Accreditation audit panels caution against over-mapping ("spray-and-pray") as it diminishes direct assessment validity.`,
            guidebookReference: `${guidebook.code} Evidence Mapping Protocol`,
            suggestion: 'Focus mapping on 1 to 3 primary Student Outcomes with authentic assessment coverage.',
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 4. Assessment Strategy & Direct Evidence (Step 08)
    // -------------------------------------------------------------------------
    if (course.clos && course.clos.length > 0) {
      const assessments = course.assessments || [];
      if (assessments.length === 0) {
        warnings.push({
          id: 'assessments-empty',
          field: 'assessments',
          stepNumber: 8,
          stepKey: 'step_assessments',
          severity: 'error',
          title: 'Missing Direct Assessment Tasks',
          message: `${guidebook.code} mandates direct student work assessment (quizzes, midterms, lab reports, capstone rubrics) to measure outcome attainment.`,
          guidebookReference: `${guidebook.code} Criterion 4 Direct Evidence Assessment`,
          suggestion: 'Create assessment tasks directly linked to your Course Learning Outcomes.',
        });
      } else {
        // Verify CLOs are linked to at least one assessment
        const mappedAssessmentCloIds = new Set<string>();
        assessments.forEach((a) => {
          if (Array.isArray(a.cloIds)) {
            a.cloIds.forEach((id) => mappedAssessmentCloIds.add(id));
          }
          if (Array.isArray((a as any).linkedCLOIds)) {
            (a as any).linkedCLOIds.forEach((id: string) => mappedAssessmentCloIds.add(id));
          }
        });

        course.clos.forEach((clo, idx) => {
          if (!mappedAssessmentCloIds.has(clo.id)) {
            warnings.push({
              id: `clo-${idx}-missing-assessment-evidence`,
              field: `assessments.clo[${clo.id}]`,
              cloIndex: idx,
              cloId: clo.id,
              stepNumber: 8,
              stepKey: 'step_assessments',
              severity: 'warning',
              title: `CLO ${idx + 1} Has No Linked Direct Assessment`,
              message: `No graded assessment task measures attainment for CLO ${idx + 1}. Unmeasured outcomes trigger accreditation audit citations.`,
              guidebookReference: `${guidebook.code} Direct Measurement Compliance`,
              suggestion: `Assign CLO ${idx + 1} to an exam problem, lab rubric, or project milestone in Step 8.`,
            });
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // 5. Passing Benchmark Validation (Step 02 / Course Info)
    // -------------------------------------------------------------------------
    const benchmark = course.passingBenchmark ?? 60;
    if (benchmark < 40 || benchmark > 85) {
      warnings.push({
        id: 'benchmark-unrealistic',
        field: 'passingBenchmark',
        stepNumber: 2,
        stepKey: 'step_course_info',
        severity: 'warning',
        title: 'Atypical Passing Benchmark Threshold',
        message: `${guidebook.code} programs typically operate with passing achievement benchmarks between 50% and 75% (currently ${benchmark}%).`,
        guidebookReference: `${guidebook.code} Cohort Attainment Threshold Criteria`,
        suggestion: 'Adjust passing benchmark to standard 60% or 70% threshold.',
        suggestedAction: {
          type: 'adjust_benchmark',
          label: 'Set Standard 60% Threshold',
          targetValue: 60,
        },
      });
    }

    // -------------------------------------------------------------------------
    // Construct Index by Field for Fast Lookups
    // -------------------------------------------------------------------------
    const byField: Record<string, FrameworkDeviationWarning[]> = {};
    warnings.forEach((w) => {
      // Primary field path
      if (!byField[w.field]) {
        byField[w.field] = [];
      }
      byField[w.field].push(w);

      // Support alternative field aliases (e.g. statement vs description)
      if (w.field.includes('.statement')) {
        const alt = w.field.replace('.statement', '.description');
        if (!byField[alt]) byField[alt] = [];
        byField[alt].push(w);
      } else if (w.field.includes('.description')) {
        const alt = w.field.replace('.description', '.statement');
        if (!byField[alt]) byField[alt] = [];
        byField[alt].push(w);
      }

      // Index by CLO ID if available
      if (w.cloId) {
        const cloIdKey = `clo-${w.cloId}`;
        if (!byField[cloIdKey]) byField[cloIdKey] = [];
        byField[cloIdKey].push(w);
      }

      // Index by CLO index if available
      if (w.cloIndex !== undefined) {
        const cloIdxKey = `clos[${w.cloIndex}]`;
        if (!byField[cloIdxKey]) byField[cloIdxKey] = [];
        byField[cloIdxKey].push(w);
      }
    });

    const errorsCount = warnings.filter((w) => w.severity === 'error').length;
    const warningsCount = warnings.filter((w) => w.severity === 'warning').length;

    // Calculate alignment score (0 - 100)
    let score = 100 - errorsCount * 18 - warningsCount * 8;
    score = Math.max(10, Math.min(100, score));

    return {
      frameworkId: guidebook.id,
      frameworkCode: guidebook.code,
      frameworkName: guidebook.name,
      isValid: errorsCount === 0,
      score,
      warningsCount,
      errorsCount,
      warnings,
      byField,
    };
  },

  /**
   * Fetch all courses from backend API or local storage,
   * validating framework documentation status on every load.
   */
  async getAllCourses(): Promise<Course[]> {
    let courses: Course[] = [];

    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          courses = data.courses;
        }
      }
    } catch (err) {
      console.warn('Backend courses API unavailable, using local storage:', err);
    }

    // Fallback to local storage
    if (courses.length === 0) {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            courses = parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    // Validate accreditation framework ID against OBEFrameworkRegistry on every load
    const validatedCourses = courses.map((c) =>
      annotateCourseWithFrameworkValidation(c)
    );

    // Keep cache synced
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validatedCourses));
    } catch {
      // ignore
    }

    return validatedCourses;
  },

  /**
   * Get single course by ID with validated framework documentation.
   */
  async getCourseById(id: string): Promise<Course | null> {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.course) {
          return annotateCourseWithFrameworkValidation(data.course);
        }
      }
    } catch (err) {
      console.warn(`Could not fetch course ${id} from server:`, err);
    }

    const localList = await this.getAllCourses();
    const found = localList.find((c) => c.id === id);
    return found ? annotateCourseWithFrameworkValidation(found) : null;
  },

  /**
   * Persist or update a course blueprint on the server, validating framework on save.
   */
  async saveCourse(course: Course): Promise<Course> {
    const validatedCourse = annotateCourseWithFrameworkValidation(course);

    try {
      const res = await fetch(`${API_BASE}/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedCourse),
      });

      if (res.ok) {
        const data = await res.json();
        return annotateCourseWithFrameworkValidation(data.course || validatedCourse);
      }
    } catch (err) {
      console.warn('Server save failed, relying on client storage:', err);
    }

    return validatedCourse;
  },

  /**
   * Batch sync courses with the backend.
   */
  async syncCourses(courses: Course[]): Promise<boolean> {
    const validatedCourses = courses.map((c) =>
      annotateCourseWithFrameworkValidation(c)
    );

    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: validatedCourses }),
      });

      return res.ok;
    } catch (err) {
      console.warn('Background course sync to backend failed:', err);
      return false;
    }
  },

  /**
   * Delete a course from the server.
   */
  async deleteCourse(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn(`Failed to delete course ${id} from server:`, err);
      return false;
    }
  },

  // =========================================================================
  // Accreditation Dossier PDF Generation & Export Services
  // =========================================================================

  /**
   * Creates a branded, publication-grade accreditation curriculum dossier PDF.
   */
  generateDossierPDF(course: Course, options: AccreditationDossierOptions = {}) {
    return DossierPdfService.createAccreditationDossierPDF(course, options);
  },

  /**
   * Compiles the course dossier and immediately initiates a browser file download.
   */
  downloadCourseDossierPDF(course: Course, options: AccreditationDossierOptions = {}, customFilename?: string) {
    DossierPdfService.downloadDossierPDF(course, options, customFilename);
  },

  /**
   * Generates a temporary Blob URL for embedding PDF previews or opening in viewer tabs.
   */
  generateDossierBlobUrl(course: Course, options: AccreditationDossierOptions = {}): string {
    return DossierPdfService.generateDossierBlobUrl(course, options);
  },

  /**
   * Generates a binary Blob of the compiled accreditation dossier PDF.
   */
  generateDossierBlob(course: Course, options: AccreditationDossierOptions = {}): Blob {
    return DossierPdfService.generateDossierBlob(course, options);
  },

  /**
   * Safely opens a preview of the dossier in a new browser tab.
   */
  previewDossierInNewTab(course: Course, options: AccreditationDossierOptions = {}): void {
    DossierPdfService.previewDossierInNewTab(course, options);
  },
};

export { DossierPdfService };
export type { AccreditationDossierOptions, DossierGenerationResult };
export default CourseService;
