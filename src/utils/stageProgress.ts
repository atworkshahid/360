import { Course } from '../types';
import { calculateCourseAudit } from './obeCalculator';

export interface StageStatus {
  stepNumber: number;
  title: string;
  category: string;
  isCompleted: boolean;
  summary: string;
  missingRequirements: string[];
}

export interface CategoryProgress {
  id: string;
  name: string;
  steps: number[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  isFullyCompleted: boolean;
}

export interface CourseProgressSummary {
  completedCount: number;
  totalStages: number;
  percentage: number;
  stageStatuses: StageStatus[];
  categoryProgress: CategoryProgress[];
  nextIncompleteStage: number | null;
}

export interface StageTimeEstimate {
  stepNumber: number;
  title: string;
  category: string;
  baselineMinutes: number;
  remainingMinutes: number;
  isCompleted: boolean;
  partialPercentage: number;
  summary: string;
}

export interface CategoryTimeEstimate {
  id: string;
  name: string;
  remainingMinutes: number;
  baselineMinutes: number;
  completedCount: number;
  totalCount: number;
  isFullyCompleted: boolean;
}

export interface MotivationalMilestone {
  badge: string;
  title: string;
  message: string;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'mastery';
  color: 'slate' | 'amber' | 'blue' | 'indigo' | 'emerald';
  encouragement: string;
  velocityLabel: string;
}

export interface AlignmentTimeProgress {
  totalBaselineMinutes: number;
  totalRemainingMinutes: number;
  formattedRemainingTime: string;
  completedMinutes: number;
  stageEstimates: StageTimeEstimate[];
  categoryEstimates: CategoryTimeEstimate[];
  motivationalMilestone: MotivationalMilestone;
  alignmentHealthScore: number;
  unresolvedGapsCount: number;
  completedStagesCount: number;
  totalStagesCount: number;
  progressPercentage: number;
  isFullyAligned: boolean;
}

export const OBE10_STAGE_DEFINITIONS: {
  number: number;
  title: string;
  category: string;
  badge?: string;
  estimatedMinutes: number;
}[] = [
  { number: 1, title: 'Framework Selection', category: 'Foundation', badge: 'OBE', estimatedMinutes: 3 },
  { number: 2, title: 'Course Information', category: 'Foundation', estimatedMinutes: 4 },
  { number: 3, title: 'Purpose & Description', category: 'Foundation', estimatedMinutes: 5 },
  { number: 4, title: 'Learning Outcomes (CLOs)', category: 'Outcomes & Mapping', badge: 'Core', estimatedMinutes: 8 },
  { number: 5, title: 'Outcome Mapping', category: 'Outcomes & Mapping', badge: 'Matrix', estimatedMinutes: 5 },
  { number: 6, title: 'Weekly Course Plan', category: 'Instructional Design', estimatedMinutes: 10 },
  { number: 7, title: 'Teaching Activities (TLAs)', category: 'Instructional Design', estimatedMinutes: 6 },
  { number: 8, title: 'Assessment Plan', category: 'Performance Measurement', badge: '100%', estimatedMinutes: 8 },
  { number: 9, title: 'Alignment & Audit', category: 'Accreditation Quality', badge: 'Audit', estimatedMinutes: 5 },
  { number: 10, title: 'Review & Export', category: 'Accreditation Quality', badge: 'Syllabus', estimatedMinutes: 4 },
];

export const OBE10_CATEGORY_DEFINITIONS = [
  { id: 'foundation', name: 'Foundation', steps: [1, 2, 3] },
  { id: 'outcomes', name: 'Outcomes & Mapping', steps: [4, 5] },
  { id: 'instructional', name: 'Instructional Design', steps: [6, 7] },
  { id: 'measurement', name: 'Performance Measurement', steps: [8] },
  { id: 'quality', name: 'Accreditation Quality', steps: [9, 10] },
];

export const STAGE_DEFINITIONS: {
  number: number;
  title: string;
  category: string;
  badge?: string;
  estimatedMinutes: number;
}[] = [
  { number: 1, title: 'Course Setup', category: 'Foundation', badge: undefined, estimatedMinutes: 3 },
  { number: 2, title: 'Course Blueprint', category: 'Foundation', badge: undefined, estimatedMinutes: 5 },
  { number: 3, title: 'CLO Creator', category: 'Outcomes & Mapping', badge: 'Core', estimatedMinutes: 8 },
  { number: 4, title: 'CLO-PLO Mapping', category: 'Outcomes & Mapping', badge: undefined, estimatedMinutes: 5 },
  { number: 5, title: 'Module Creator', category: 'Modular Architecture', badge: undefined, estimatedMinutes: 6 },
  { number: 6, title: 'MLO Creator', category: 'Modular Architecture', badge: 'Granular', estimatedMinutes: 7 },
  { number: 7, title: 'Lesson Creator', category: 'Instructional Delivery', badge: undefined, estimatedMinutes: 8 },
  { number: 8, title: 'Activity Designer', category: 'Instructional Delivery', badge: undefined, estimatedMinutes: 6 },
  { number: 9, title: 'Assessment Designer', category: 'Performance Measurement', badge: 'Blueprint', estimatedMinutes: 8 },
  { number: 10, title: 'Question Builder', category: 'Performance Measurement', badge: undefined, estimatedMinutes: 7 },
  { number: 11, title: 'Rubric Builder', category: 'Performance Measurement', badge: undefined, estimatedMinutes: 7 },
  { number: 12, title: 'Evidence Rules', category: 'Accreditation Quality', badge: 'Evidence', estimatedMinutes: 5 },
  { number: 13, title: 'Alignment Audit', category: 'Accreditation Quality', badge: 'Audit', estimatedMinutes: 4 },
  { number: 14, title: 'Course Preview', category: 'Accreditation Quality', badge: undefined, estimatedMinutes: 3 },
  { number: 15, title: 'Review & Export', category: 'Accreditation Quality', badge: 'Final', estimatedMinutes: 3 },
];

export const CATEGORY_DEFINITIONS = [
  { id: 'foundation', name: 'Foundation', steps: [1, 2] },
  { id: 'outcomes', name: 'Outcomes & Mapping', steps: [3, 4] },
  { id: 'modular', name: 'Modular Architecture', steps: [5, 6] },
  { id: 'delivery', name: 'Instructional Delivery', steps: [7, 8] },
  { id: 'measurement', name: 'Performance Measurement', steps: [9, 10, 11] },
  { id: 'quality', name: 'Accreditation Quality', steps: [12, 13, 14, 15] },
];

/**
 * Checks if a specific course design stage meets completion criteria
 */
export function evaluateStage(
  course: Course,
  stepNumber: number,
  mode: 'obe10' | 'granular15' = 'obe10'
): {
  isCompleted: boolean;
  summary: string;
  missingRequirements: string[];
} {
  const manualCompleted = course.completedStages?.includes(stepNumber) ?? false;
  const missingRequirements: string[] = [];

  if (mode === 'obe10') {
    switch (stepNumber) {
      case 1: {
        if (!course.frameworkId || course.frameworkId.trim().length === 0) {
          missingRequirements.push('Accreditation Framework');
        }
        const isCompleted = missingRequirements.length === 0 || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `Accreditation framework aligned (${course.frameworkId || 'OBE Standard'})`
            : 'Select an accreditation and qualification framework',
          missingRequirements,
        };
      }
      case 2: {
        if (!course.title?.trim()) missingRequirements.push('Course Title');
        if (!course.code?.trim()) missingRequirements.push('Course Code');
        if (!course.creditHours || course.creditHours <= 0) missingRequirements.push('Credit Hours');
        if (!course.deliveryMode) missingRequirements.push('Delivery Mode');
        if (!course.courseLevel && !course.degreeLevel) missingRequirements.push('Course / Degree Level');
        const isCompleted = missingRequirements.length === 0 || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `${course.code} - ${course.title} (${course.creditHours} Credits)`
            : `Requires ${missingRequirements.join(', ')}`,
          missingRequirements,
        };
      }
      case 3: {
        const hasPurpose = Boolean(course.blueprint?.purpose?.trim() || course.learningPromise?.trim() || course.description?.trim());
        if (!hasPurpose) missingRequirements.push('Course Purpose or Description');
        const isCompleted = hasPurpose || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? 'Pedagogical purpose, target audience, and course narrative defined'
            : 'Formulate course purpose statement and description',
          missingRequirements,
        };
      }
      case 4: {
        const cloCount = course.clos?.length ?? 0;
        if (cloCount === 0) missingRequirements.push('At least one Course Learning Outcome (CLO)');
        const isCompleted = (cloCount >= 1 && missingRequirements.length === 0) || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `${cloCount} Course Learning Outcome(s) configured with Bloom taxonomy`
            : 'Define measurable CLOs with observable action verbs',
          missingRequirements,
        };
      }
      case 5: {
        const hasPLOs = (course.plos?.length ?? 0) > 0;
        const mappedCLOs = course.clos?.filter((c) => c.mappedPLOs && c.mappedPLOs.length > 0).length ?? 0;
        if (!hasPLOs) missingRequirements.push('Programme Learning Outcomes (PLOs)');
        if (mappedCLOs === 0 && (course.clos?.length ?? 0) > 0) missingRequirements.push('Map CLOs to PLOs');
        const isCompleted = (hasPLOs && mappedCLOs > 0) || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `${mappedCLOs} of ${course.clos?.length ?? 0} CLOs mapped to Programme Learning Outcomes`
            : 'Construct CLO-to-PLO constructive alignment matrix',
          missingRequirements,
        };
      }
      case 6: {
        const weekCount = course.weeklyPlan?.length ?? 0;
        const modCount = course.modules?.length ?? 0;
        if (weekCount === 0 && modCount === 0) missingRequirements.push('Weekly instructional syllabus or modules');
        const isCompleted = weekCount >= 4 || modCount >= 1 || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `${weekCount > 0 ? `${weekCount} weeks` : `${modCount} modules`} scaffolded with contact hours and topics`
            : 'Establish weekly pedagogical sequence and topics',
          missingRequirements,
        };
      }
      case 7: {
        const actCount = course.activities?.length ?? 0;
        const weekActs = (course.weeklyPlan || []).filter((w) => w.learningActivity?.trim()).length;
        if (actCount === 0 && weekActs === 0) missingRequirements.push('Active teaching and learning activities');
        const isCompleted = actCount >= 1 || weekActs >= 2 || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `${actCount > 0 ? `${actCount} active learning activity/activities` : `${weekActs} weekly active learning sessions`} designed`
            : 'Select and design active student-centered learning activities',
          missingRequirements,
        };
      }
      case 8: {
        const assessCount = course.assessments?.length ?? 0;
        const totalWeight = course.assessments?.reduce((acc, a) => acc + (a.weightage || 0), 0) ?? 0;
        if (assessCount === 0) missingRequirements.push('Formative and summative assessments');
        if (Math.abs(totalWeight - 100) > 5 && assessCount > 0) {
          missingRequirements.push(`Assessment weights must total 100% (currently ${totalWeight}%)`);
        }
        const isCompleted = (assessCount >= 1 && Math.abs(totalWeight - 100) <= 5) || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `${assessCount} assessment task(s) configured totaling ${totalWeight}%`
            : 'Design assessment blueprint with balanced 100% weight distribution',
          missingRequirements,
        };
      }
      case 9: {
        const auditReport = calculateCourseAudit(course);
        const isCompleted = auditReport.healthScore >= 75 || manualCompleted;
        if (auditReport.healthScore < 75) {
          missingRequirements.push(`Course Health Score (${auditReport.healthScore}%) below threshold (75%)`);
        }
        return {
          isCompleted,
          summary: isCompleted
            ? `Accreditation audit verified (Health Score: ${auditReport.healthScore}%)`
            : `Course Health Score is ${auditReport.healthScore}% - address alignment gaps`,
          missingRequirements,
        };
      }
      case 10: {
        const isCompleted = course.status !== 'draft' || Boolean(course.academicReview) || manualCompleted;
        return {
          isCompleted,
          summary: isCompleted
            ? `Syllabus finalized (Status: ${course.status.toUpperCase()}) and ready for export`
            : 'Review OBE curriculum report and export syllabus package',
          missingRequirements: isCompleted ? [] : ['Verify final curriculum and generate course pack'],
        };
      }
      default:
        return {
          isCompleted: manualCompleted,
          summary: manualCompleted ? 'Stage completed' : 'Pending',
          missingRequirements: [],
        };
    }
  }

  // Granular 15 Mode
  switch (stepNumber) {
    case 1: {
      // Course Setup
      if (!course.title || course.title.trim().length === 0) missingRequirements.push('Course Title');
      if (!course.code || course.code.trim().length === 0) missingRequirements.push('Course Code');
      if (!course.creditHours || course.creditHours <= 0) missingRequirements.push('Credit Hours');
      if (!course.deliveryMode) missingRequirements.push('Delivery Mode');
      if (!course.courseLevel && !course.degreeLevel) missingRequirements.push('Course / Degree Level');

      const isCompleted = missingRequirements.length === 0 || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? 'Course basic identity, credits, and delivery structure defined'
          : `Requires ${missingRequirements.join(', ')}`,
        missingRequirements,
      };
    }

    case 2: {
      // Course Blueprint
      const hasPurpose = Boolean(course.blueprint?.purpose?.trim());
      const hasCompetencies = (course.blueprint?.targetCompetencies?.length ?? 0) > 0;
      const hasPromise = Boolean(course.learningPromise?.trim());

      if (!hasPurpose) missingRequirements.push('Course Purpose Statement');
      if (!hasCompetencies) missingRequirements.push('Target Competencies');

      const isCompleted = (hasPurpose && hasCompetencies) || hasPromise || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? 'Course rationale, target competencies, and pedagogical blueprint configured'
          : 'Requires educational purpose and competencies',
        missingRequirements,
      };
    }

    case 3: {
      // CLO Creator
      const cloCount = course.clos?.length ?? 0;
      if (cloCount === 0) missingRequirements.push('At least one Course Learning Outcome (CLO)');
      else {
        const invalidCLOs = course.clos.filter((c) => !c.statement?.trim());
        if (invalidCLOs.length > 0) missingRequirements.push('Valid observable statements for all CLOs');
      }

      const isCompleted = (cloCount >= 1 && missingRequirements.length === 0) || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${cloCount} Course Learning Outcome(s) defined with Bloom taxonomy verbs`
          : 'Define measurable CLOs with Bloom action verbs',
        missingRequirements,
      };
    }

    case 4: {
      // CLO-PLO Mapping
      const hasPLOs = (course.plos?.length ?? 0) > 0;
      const mappedCLOs = course.clos?.filter((c) => c.mappedPLOs && c.mappedPLOs.length > 0).length ?? 0;

      if (!hasPLOs) missingRequirements.push('Programme Learning Outcomes (PLOs)');
      if (mappedCLOs === 0 && (course.clos?.length ?? 0) > 0) missingRequirements.push('Map CLOs to PLOs');

      const isCompleted = (hasPLOs && mappedCLOs > 0) || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${mappedCLOs} of ${course.clos?.length ?? 0} CLOs mapped to Programme Learning Outcomes`
          : 'Link course outcomes to programme outcomes',
        missingRequirements,
      };
    }

    case 5: {
      // Module Creator
      const modCount = course.modules?.length ?? 0;
      const weekCount = course.weeklyPlan?.length ?? 0;
      if (modCount === 0 && weekCount < 4) missingRequirements.push('At least one Curriculum Module or Weekly Plan');

      const isCompleted = modCount >= 1 || weekCount >= 4 || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${modCount > 0 ? `${modCount} module(s)` : `${weekCount} weekly units`} established with duration and pacing`
          : 'Organize course into instructional modules',
        missingRequirements,
      };
    }

    case 6: {
      // MLO Creator
      const mloCount = course.mlos?.length ?? 0;
      const hasWeeklyCLOs = (course.weeklyPlan || []).filter((w) => (w.linkedCLOIds || []).length > 0).length >= 2;
      if (mloCount === 0 && !hasWeeklyCLOs) missingRequirements.push('At least one Module Learning Outcome (MLO)');

      const isCompleted = mloCount >= 1 || hasWeeklyCLOs || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${mloCount > 0 ? `${mloCount} granular MLO(s)` : 'Weekly plan units'} scaffolded and linked to parent CLOs`
          : 'Generate or write module learning outcomes',
        missingRequirements,
      };
    }

    case 7: {
      // Lesson Creator
      const lessonCount = course.lessons?.length ?? 0;
      const weekCount = course.weeklyPlan?.length ?? 0;
      if (lessonCount === 0 && weekCount < 4) missingRequirements.push('At least one structured lesson or weekly plan');

      const isCompleted = lessonCount >= 1 || weekCount >= 4 || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${lessonCount > 0 ? `${lessonCount} lesson(s)` : `${weekCount} weekly sessions`} designed with objectives and learning evidence`
          : 'Add structured lessons to deliver module content',
        missingRequirements,
      };
    }

    case 8: {
      // Activity Designer
      const actCount = course.activities?.length ?? 0;
      const weekActs = (course.weeklyPlan || []).filter((w) => w.learningActivity?.trim()).length;
      if (actCount === 0 && weekActs < 2) missingRequirements.push('At least one active learning activity');

      const isCompleted = actCount >= 1 || weekActs >= 2 || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${actCount > 0 ? `${actCount} learning activity/tasks` : `${weekActs} weekly active learning sessions`} designed with student prompts`
          : 'Design engaging student activities with demonstrable outputs',
        missingRequirements,
      };
    }

    case 9: {
      // Assessment Designer
      const assessCount = course.assessments?.length ?? 0;
      const totalWeight = course.assessments?.reduce((acc, a) => acc + (a.weightage || 0), 0) ?? 0;

      if (assessCount === 0) missingRequirements.push('At least one assessment task');
      if (Math.abs(totalWeight - 100) > 5 && assessCount > 0) {
        missingRequirements.push(`Recalibrate total assessment weight (currently ${totalWeight}%, target 100%)`);
      }

      const isCompleted = (assessCount >= 1 && Math.abs(totalWeight - 100) <= 5) || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${assessCount} assessment task(s) mapped to CLOs totaling ${totalWeight}%`
          : 'Define formative & summative assessments totaling 100%',
        missingRequirements,
      };
    }

    case 10: {
      // Question Builder
      const questionsTotal = course.assessments?.reduce((acc, a) => acc + (a.questions?.length ?? 0), 0) ?? 0;
      if (questionsTotal === 0) missingRequirements.push('At least one assessment item / MCQ question');

      const isCompleted = questionsTotal >= 1 || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${questionsTotal} direct assessment item(s) mapped to cognitive Bloom levels`
          : 'Generate or write assessment questions & items',
        missingRequirements,
      };
    }

    case 11: {
      // Rubric Builder
      const rubricCount = course.rubrics?.length ?? 0;
      const linkedRubrics = course.assessments?.filter((a) => a.rubricId).length ?? 0;

      if (rubricCount === 0 && linkedRubrics === 0) missingRequirements.push('At least one grading rubric');

      const isCompleted = rubricCount >= 1 || linkedRubrics >= 1 || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${rubricCount} performance rubric(s) configured with multidimensional criteria`
          : 'Build criteria-based rubrics for subjective/project evaluations',
        missingRequirements,
      };
    }

    case 12: {
      // Evidence Rules
      const ruleCount = course.evidenceRules?.length ?? 0;
      if (ruleCount === 0) missingRequirements.push('At least one outcome attainment evidence rule');

      const isCompleted = ruleCount >= 1 || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `${ruleCount} direct evidence threshold rule(s) configured for accreditation`
          : 'Specify mastery thresholds and direct evidence sources',
        missingRequirements,
      };
    }

    case 13: {
      // Alignment Audit
      const hasCLOs = (course.clos?.length ?? 0) > 0;
      const hasAssessments = (course.assessments?.length ?? 0) > 0;
      if (!hasCLOs || !hasAssessments) missingRequirements.push('Requires CLOs and Assessments for audit verification');

      const isCompleted = (hasCLOs && hasAssessments) || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? 'Constructive alignment and accreditation compliance evaluated'
          : 'Verify alignment health between outcomes, teaching, and assessments',
        missingRequirements,
      };
    }

    case 14: {
      // Course Preview
      const isCompleted =
        (Boolean(course.title) && (course.clos?.length ?? 0) > 0 && (course.modules?.length ?? 0) > 0) ||
        manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? 'Comprehensive learner syllabus and auditor dossier previewed'
          : 'Preview finalized course structure and materials',
        missingRequirements: isCompleted ? [] : ['Review integrated course overview'],
      };
    }

    case 15: {
      // Review & Export
      const hasReview = Boolean(course.academicReview) || course.status === 'submitted' || course.status === 'approved';
      const isCompleted = hasReview || manualCompleted;
      return {
        isCompleted,
        summary: isCompleted
          ? `Course formalized (Status: ${course.status.toUpperCase()}) & exportable`
          : 'Complete academic peer review checklist or export syllabus',
        missingRequirements: isCompleted ? [] : ['Complete peer review or export course pack'],
      };
    }

    default:
      return {
        isCompleted: manualCompleted,
        summary: manualCompleted ? 'Stage completed' : 'Pending',
        missingRequirements: [],
      };
  }
}

/**
 * Aggregates complete progress calculation for the CourseWizard
 */
export function calculateCourseProgress(
  course: Course,
  mode: 'obe10' | 'granular15' = 'obe10'
): CourseProgressSummary {
  const stageDefs = mode === 'obe10' ? OBE10_STAGE_DEFINITIONS : STAGE_DEFINITIONS;
  const catDefs = mode === 'obe10' ? OBE10_CATEGORY_DEFINITIONS : CATEGORY_DEFINITIONS;

  const stageStatuses: StageStatus[] = stageDefs.map((def) => {
    const evaluation = evaluateStage(course, def.number, mode);
    return {
      stepNumber: def.number,
      title: def.title,
      category: def.category,
      isCompleted: evaluation.isCompleted,
      summary: evaluation.summary,
      missingRequirements: evaluation.missingRequirements,
    };
  });

  const completedCount = stageStatuses.filter((s) => s.isCompleted).length;
  const totalStages = stageDefs.length;
  const percentage = Math.round((completedCount / totalStages) * 100);

  const categoryProgress: CategoryProgress[] = catDefs.map((cat) => {
    const catSteps = stageStatuses.filter((s) => cat.steps.includes(s.stepNumber));
    const catCompleted = catSteps.filter((s) => s.isCompleted).length;
    const catTotal = catSteps.length;
    return {
      id: cat.id,
      name: cat.name,
      steps: cat.steps,
      completedCount: catCompleted,
      totalCount: catTotal,
      percentage: catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0,
      isFullyCompleted: catCompleted === catTotal,
    };
  });

  // Find next incomplete stage
  const firstIncomplete = stageStatuses.find((s) => !s.isCompleted);
  const nextIncompleteStage = firstIncomplete ? firstIncomplete.stepNumber : null;

  return {
    completedCount,
    totalStages,
    percentage,
    stageStatuses,
    categoryProgress,
    nextIncompleteStage,
  };
}

/**
 * Calculates partial progress percentage for incomplete stages
 */
function calculatePartialStageProgress(
  course: Course,
  stepNumber: number,
  mode: 'obe10' | 'granular15' = 'obe10'
): number {
  if (mode === 'obe10') {
    switch (stepNumber) {
      case 1:
        return course.frameworkId ? 100 : 0;
      case 2: {
        let score = 0;
        if (course.title?.trim()) score += 20;
        if (course.code?.trim()) score += 20;
        if (course.creditHours && course.creditHours > 0) score += 20;
        if (course.deliveryMode) score += 20;
        if (course.courseLevel || course.degreeLevel) score += 20;
        return score;
      }
      case 3:
        return (course.blueprint?.purpose?.trim() || course.learningPromise?.trim() || course.description?.trim()) ? 90 : 0;
      case 4: {
        const count = course.clos?.length ?? 0;
        if (count >= 3) return 90;
        if (count >= 1) return 50;
        return 0;
      }
      case 5: {
        const cloCount = course.clos?.length ?? 0;
        if (cloCount === 0) return 0;
        const mapped = course.clos?.filter((c) => c.mappedPLOs && c.mappedPLOs.length > 0).length ?? 0;
        return Math.round((mapped / cloCount) * 100);
      }
      case 6: {
        const weekCount = course.weeklyPlan?.length ?? 0;
        const modCount = course.modules?.length ?? 0;
        if (weekCount >= 8 || modCount >= 3) return 90;
        if (weekCount >= 2 || modCount >= 1) return 60;
        return 0;
      }
      case 7: {
        const actCount = course.activities?.length ?? 0;
        const weekActs = (course.weeklyPlan || []).filter((w) => w.learningActivity?.trim()).length;
        if (actCount >= 3 || weekActs >= 4) return 90;
        if (actCount >= 1 || weekActs >= 1) return 50;
        return 0;
      }
      case 8: {
        const asmtCount = course.assessments?.length ?? 0;
        if (asmtCount === 0) return 0;
        const totalWeight = course.assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);
        if (Math.abs(totalWeight - 100) < 0.1) return 90;
        return 60;
      }
      case 9: {
        const audit = calculateCourseAudit(course);
        return Math.min(100, audit.healthScore);
      }
      case 10: {
        if (course.status === 'submitted' || course.status === 'approved') return 95;
        if (course.academicReview) return 70;
        return 0;
      }
      default:
        return 0;
    }
  }

  // Granular 15 Mode
  switch (stepNumber) {
    case 1: {
      let score = 0;
      if (course.title?.trim()) score += 20;
      if (course.code?.trim()) score += 20;
      if (course.creditHours && course.creditHours > 0) score += 20;
      if (course.deliveryMode) score += 20;
      if (course.courseLevel || course.degreeLevel) score += 20;
      return score;
    }
    case 2: {
      let score = 0;
      if (course.blueprint?.purpose?.trim()) score += 50;
      if ((course.blueprint?.targetCompetencies?.length ?? 0) > 0) score += 50;
      return score;
    }
    case 3: {
      const count = course.clos?.length ?? 0;
      if (count >= 3) return 90;
      if (count === 2) return 65;
      if (count === 1) return 35;
      return 0;
    }
    case 4: {
      const cloCount = course.clos?.length ?? 0;
      if (cloCount === 0) return 0;
      const mapped = course.clos?.filter((c) => c.mappedPLOs && c.mappedPLOs.length > 0).length ?? 0;
      return Math.round((mapped / cloCount) * 100);
    }
    case 5: {
      const modCount = course.modules?.length ?? 0;
      if (modCount >= 3) return 90;
      if (modCount >= 1) return 50;
      return 0;
    }
    case 6: {
      const mloCount = course.mlos?.length ?? 0;
      if (mloCount >= 4) return 90;
      if (mloCount >= 1) return 50;
      return 0;
    }
    case 7: {
      const lessonCount = course.lessons?.length ?? 0;
      if (lessonCount >= 4) return 85;
      if (lessonCount >= 1) return 40;
      return 0;
    }
    case 8: {
      const activitiesCount = course.activities?.length ?? 0;
      if (activitiesCount >= 3) return 90;
      if (activitiesCount >= 1) return 50;
      return 0;
    }
    case 9: {
      const asmtCount = course.assessments?.length ?? 0;
      if (asmtCount === 0) return 0;
      const totalWeight = course.assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);
      if (Math.abs(totalWeight - 100) < 0.1) return 90;
      return 60;
    }
    case 10: {
      let qCount = 0;
      course.assessments?.forEach((a) => {
        qCount += a.questions?.length ?? 0;
      });
      if (qCount >= 5) return 90;
      if (qCount >= 1) return 50;
      return 0;
    }
    case 11: {
      const rubricsCount = course.rubrics?.length ?? 0;
      if (rubricsCount >= 2) return 90;
      if (rubricsCount === 1) return 50;
      return 0;
    }
    case 12: {
      const rulesCount = course.evidenceRules?.length ?? 0;
      if (rulesCount >= 3) return 90;
      if (rulesCount >= 1) return 50;
      return 0;
    }
    case 13: {
      return 40;
    }
    case 14: {
      return 40;
    }
    case 15: {
      if (course.status === 'submitted' || course.status === 'approved') return 95;
      if (course.academicReview) return 70;
      return 0;
    }
    default:
      return 0;
  }
}

/**
 * Calculates remaining time estimates and motivational metrics to achieve full constructive alignment
 */
export function calculateAlignmentTimeEstimate(
  course: Course,
  mode: 'obe10' | 'granular15' = 'obe10'
): AlignmentTimeProgress {
  const stageDefs = mode === 'obe10' ? OBE10_STAGE_DEFINITIONS : STAGE_DEFINITIONS;
  const catDefs = mode === 'obe10' ? OBE10_CATEGORY_DEFINITIONS : CATEGORY_DEFINITIONS;

  const auditReport = calculateCourseAudit(course);
  const healthScore = auditReport.healthScore;
  const criticalAndHighGaps = auditReport.gaps.filter(
    (g) => g.severity === 'Critical' || g.severity === 'High'
  );

  let totalBaselineMinutes = 0;
  let totalRemainingMinutes = 0;

  const stageEstimates: StageTimeEstimate[] = stageDefs.map((def) => {
    totalBaselineMinutes += def.estimatedMinutes;
    const stageEval = evaluateStage(course, def.number, mode);
    const isCompleted = stageEval.isCompleted;
    const partialPercentage = isCompleted ? 100 : calculatePartialStageProgress(course, def.number, mode);

    let remainingMinutes = 0;
    if (!isCompleted) {
      // Calculate remaining minutes based on unfulfilled progress
      const remainingFactor = Math.max(0.15, (100 - partialPercentage) / 100);
      remainingMinutes = Math.max(1, Math.round(def.estimatedMinutes * remainingFactor));
      totalRemainingMinutes += remainingMinutes;
    }

    return {
      stepNumber: def.number,
      title: def.title,
      category: def.category,
      baselineMinutes: def.estimatedMinutes,
      remainingMinutes,
      isCompleted,
      partialPercentage,
      summary: stageEval.summary,
    };
  });

  const completedStagesCount = stageEstimates.filter((s) => s.isCompleted).length;
  const totalStagesCount = stageDefs.length;
  const progressPercentage = Math.round((completedStagesCount / totalStagesCount) * 100);

  // If there are lingering critical/high audit gaps even if stages were toggled complete,
  // add a small calibration time (e.g. 1-2 mins per gap)
  if (criticalAndHighGaps.length > 0 && healthScore < 95) {
    const gapBuffer = Math.min(15, Math.ceil(criticalAndHighGaps.length * 1.5));
    totalRemainingMinutes += gapBuffer;
  }

  const isFullyAligned = completedStagesCount === totalStagesCount && healthScore >= 95;
  if (isFullyAligned) {
    totalRemainingMinutes = 0;
  }

  // Calculate remaining minutes by category
  const categoryEstimates: CategoryTimeEstimate[] = catDefs.map((cat) => {
    const catStages = stageEstimates.filter((s) => cat.steps.includes(s.stepNumber));
    const catRemaining = catStages.reduce((acc, s) => acc + s.remainingMinutes, 0);
    const catBaseline = catStages.reduce((acc, s) => acc + s.baselineMinutes, 0);
    const catCompleted = catStages.filter((s) => s.isCompleted).length;
    return {
      id: cat.id,
      name: cat.name,
      remainingMinutes: catRemaining,
      baselineMinutes: catBaseline,
      completedCount: catCompleted,
      totalCount: catStages.length,
      isFullyCompleted: catCompleted === catStages.length,
    };
  });

  const completedMinutes = Math.max(0, totalBaselineMinutes - totalRemainingMinutes);

  // Format remaining time nicely
  let formattedRemainingTime = '0m (100% Aligned)';
  if (totalRemainingMinutes > 0) {
    if (totalRemainingMinutes < 60) {
      formattedRemainingTime = `~${totalRemainingMinutes} min`;
    } else {
      const hours = Math.floor(totalRemainingMinutes / 60);
      const mins = totalRemainingMinutes % 60;
      formattedRemainingTime = mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
    }
  }

  // Motivational milestone messaging
  let motivationalMilestone: MotivationalMilestone;
  if (isFullyAligned) {
    motivationalMilestone = {
      badge: '🌟 Certified OBE Curriculum',
      title: 'Full Constructive Alignment Achieved! 🎉',
      message: 'All 15 design stages and quality standards are complete. Your syllabus is accreditation-ready!',
      tier: 'mastery',
      color: 'emerald',
      encouragement: 'Outstanding work! Your course meets high academic rigor and constructive alignment.',
      velocityLabel: '100% Alignment Reached',
    };
  } else if (completedStagesCount >= 12 || healthScore >= 85) {
    const left = totalStagesCount - completedStagesCount;
    motivationalMilestone = {
      badge: '🛡️ Quality & Accreditation Ready',
      title: 'Final Quality Verification in Sight',
      message: `Only ${left} stage${left === 1 ? '' : 's'} remaining (${formattedRemainingTime}). Quality audit and formal sign-offs are close.`,
      tier: 'advanced',
      color: 'indigo',
      encouragement: 'You are in the top tier of design completion. Complete the final checks to lock in alignment.',
      velocityLabel: `${progressPercentage}% Done • High Design Velocity`,
    };
  } else if (completedStagesCount >= 8 || healthScore >= 65) {
    motivationalMilestone = {
      badge: '⚡ High Instructional Velocity',
      title: 'Assessment & Alignment Phase',
      message: `${completedStagesCount} stages complete! Assessments and rubrics are connecting to your learning outcomes.`,
      tier: 'intermediate',
      color: 'blue',
      encouragement: 'Superb momentum! Formative and summative assessments will complete the constructive alignment chain.',
      velocityLabel: `${progressPercentage}% Done • Steady Pacing`,
    };
  } else if (completedStagesCount >= 4 || healthScore >= 40) {
    motivationalMilestone = {
      badge: '🎯 Outcomes & Architecture Locked',
      title: 'Scaffolding Modules & Lessons',
      message: 'Your foundation and CLO-PLO mappings are solid. Now expanding into modular instructional delivery.',
      tier: 'intermediate',
      color: 'amber',
      encouragement: 'Great progress! Linking learning activities to outcomes ensures strong student engagement.',
      velocityLabel: `${progressPercentage}% Done • Constructing Architecture`,
    };
  } else {
    motivationalMilestone = {
      badge: '🌱 Foundation Architecture',
      title: 'Building Your Curriculum Foundation',
      message: 'Establishing course identity, blueprint competencies, and measurable learning outcomes.',
      tier: 'beginner',
      color: 'slate',
      encouragement: 'Every accredited course begins with a strong foundation. Take it one stage at a time!',
      velocityLabel: `${progressPercentage}% Done • Laying Foundation`,
    };
  }

  return {
    totalBaselineMinutes,
    totalRemainingMinutes,
    formattedRemainingTime,
    completedMinutes,
    stageEstimates,
    categoryEstimates,
    motivationalMilestone,
    alignmentHealthScore: healthScore,
    unresolvedGapsCount: criticalAndHighGaps.length,
    completedStagesCount,
    totalStagesCount,
    progressPercentage,
    isFullyAligned,
  };
}
