import { Course, CourseValidationRuleResult, BloomLevel } from '../types';

export interface AlignmentTriangleStatus {
  cloId: string;
  cloCode: string;
  statement: string;
  bloomLevel: BloomLevel;
  hasTeachingActivity: boolean;
  teachingActivities: string[];
  hasAssessment: boolean;
  assessments: string[];
  isFullyAligned: boolean;
  alignmentRating: 'Strong' | 'Partial' | 'Broken';
  recommendation?: string;
}

export interface CourseValidationCategoryScores {
  courseInfo: number;
  cloQuality: number;
  cloPloMapping: number;
  mloAlignment: number;
  lessonAlignment: number;
  assessmentCoverage: number;
  rubricAlignment: number;
  evidenceCoverage: number;
}

export interface CourseValidationSummary {
  readinessScore: number;
  healthScore: number;
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
  passedCount: number;
  totalChecks: number;
  issueCount: number;
  categoryScores: CourseValidationCategoryScores;
  results: CourseValidationRuleResult[];
  alignmentTriangle: AlignmentTriangleStatus[];
  bloomDistribution: Record<BloomLevel, number>;
  totalAssessmentWeight: number;
  isCompliant: boolean;
}

const WEAK_VERBS = [
  'understand',
  'understands',
  'know',
  'knows',
  'learn',
  'learns',
  'appreciate',
  'appreciates',
  'familiarize',
  'familiarizes',
  'comprehend',
  'comprehends',
  'be aware of',
  'become aware',
  'study',
  'studies',
  'grasp',
  'grasps',
];

export class CourseValidationService {
  public static validateCourse(course: Course): CourseValidationSummary {
    const results: CourseValidationRuleResult[] = [];

    // 1. RULE: COURSE_REQUIRED_FIELDS
    this.checkRequiredFields(course, results);

    // 2. RULE: CLO_MEASURABLE_VERB & CLO_BLOOM_VALID
    this.checkCLOs(course, results);

    // 3. RULE: CLO_FRAMEWORK_MAPPING
    this.checkFrameworkMapping(course, results);

    // 4. RULE: CLO_WEEKLY_COVERAGE / INSTRUCTIONAL_SCAFFOLDING
    this.checkInstructionalScaffolding(course, results);

    // 5. RULE: CLO_ASSESSMENT_COVERAGE & ASSESSMENT_WEIGHT_TOTAL
    const totalWeight = this.checkAssessmentPlan(course, results);

    // 6. RULE: RUBRIC_ALIGNMENT (Analytic scoring rubrics for subjective tasks)
    this.checkRubricAlignment(course, results);

    // 7. RULE: EVIDENCE_RULES (Formulated direct achievement thresholds)
    this.checkEvidenceRules(course, results);

    // 8. RULE: ASSESSMENT_BLOOM_ALIGNMENT & TEACHING_BLOOM_ALIGNMENT
    const triangle = this.computeAlignmentTriangle(course, results);

    // 9. RULE: COURSE_COMPLETENESS
    this.checkCompleteness(course, results);

    // 10. RULE: ACCESSIBILITY_AUDIT
    this.checkAccessibility(course, results);

    // Bloom Distribution
    const bloomDistribution: Record<BloomLevel, number> = {
      Remember: 0,
      Understand: 0,
      Apply: 0,
      Analyze: 0,
      Evaluate: 0,
      Create: 0,
    };
    (course.clos || []).forEach((c) => {
      if (c.bloomLevel && bloomDistribution[c.bloomLevel] !== undefined) {
        bloomDistribution[c.bloomLevel]++;
      }
    });

    const criticalCount = results.filter((r) => r.severity === 'Error').length;
    const warningCount = results.filter((r) => r.severity === 'Warning').length;
    const suggestionCount = results.filter((r) => r.severity === 'Suggestion').length;
    const passedCount = results.filter((r) => r.severity === 'Passed').length;
    const totalChecks = results.length;
    const issueCount = criticalCount + warningCount;

    // Calculate standardized accreditation category scores
    const categoryScores = this.calculateCategoryScores(course);

    // Harmonized OBE Accreditation Readiness Score (0 - 100)
    const weightedAccreditationScore = Math.round(
      categoryScores.courseInfo * 0.10 +
      categoryScores.cloQuality * 0.20 +
      categoryScores.cloPloMapping * 0.15 +
      categoryScores.mloAlignment * 0.15 +
      categoryScores.lessonAlignment * 0.10 +
      categoryScores.assessmentCoverage * 0.15 +
      categoryScores.rubricAlignment * 0.075 +
      categoryScores.evidenceCoverage * 0.075
    );

    // Strict accreditation gate: critical compliance errors prevent high certification readiness
    let readinessScore = weightedAccreditationScore;
    if (criticalCount > 0) {
      readinessScore = Math.min(readinessScore, Math.max(10, 100 - criticalCount * 12));
    }
    readinessScore = Math.max(0, Math.min(100, Math.round(readinessScore)));

    const isCompliant = criticalCount === 0 && readinessScore >= 75;

    return {
      readinessScore,
      healthScore: readinessScore,
      criticalCount,
      warningCount,
      suggestionCount,
      passedCount,
      totalChecks,
      issueCount,
      categoryScores,
      results,
      alignmentTriangle: triangle,
      bloomDistribution,
      totalAssessmentWeight: totalWeight,
      isCompliant,
    };
  }

  private static checkRequiredFields(course: Course, results: CourseValidationRuleResult[]) {
    const missing: string[] = [];
    if (!course.title || course.title.trim() === '') missing.push('Course Title');
    if (!course.code || course.code.trim() === '') missing.push('Course Code');
    if (!course.category || course.category.trim() === '') missing.push('Category / Discipline');
    if (!course.programme || course.programme.trim() === '') missing.push('Program');
    if (!course.creditHours || course.creditHours <= 0) missing.push('Credit Hours');
    if (!course.deliveryMode) missing.push('Delivery Mode');

    if (missing.length > 0) {
      results.push({
        rule: 'COURSE_REQUIRED_FIELDS',
        ruleTitle: 'Mandatory Course Metadata Missing',
        severity: 'Error',
        message: `The course is missing required administrative parameters: ${missing.join(', ')}.`,
        affectedEntity: 'Course',
        recommendation: 'Complete all mandatory administrative fields in Step 2 (Course Information).',
        targetStep: 2,
      });
    } else {
      results.push({
        rule: 'COURSE_REQUIRED_FIELDS',
        ruleTitle: 'Core Administrative Identifiers Defined',
        severity: 'Passed',
        message: `Course metadata (${course.code} - ${course.title}, ${course.creditHours} Credits) is fully established.`,
        affectedEntity: 'Course',
        recommendation: 'Administrative foundation is sound.',
        targetStep: 2,
      });
    }

    if (!course.frameworkId) {
      results.push({
        rule: 'COURSE_REQUIRED_FIELDS',
        ruleTitle: 'No Target Accreditation Framework Selected',
        severity: 'Warning',
        message: 'No specific accreditation or OBE framework is linked to this course.',
        affectedEntity: 'Course',
        recommendation: 'Select your target accreditation standard (e.g., ABET, Washington Accord, HEC, NBA) in Step 1.',
        targetStep: 1,
      });
    } else {
      results.push({
        rule: 'COURSE_REQUIRED_FIELDS',
        ruleTitle: 'Accreditation Framework Selected',
        severity: 'Passed',
        message: 'Course is aligned to an active OBE / Accreditation Framework.',
        affectedEntity: 'Course',
        recommendation: 'Framework parameters active.',
        targetStep: 1,
      });
    }
  }

  private static checkCLOs(course: Course, results: CourseValidationRuleResult[]) {
    const clos = course.clos || [];

    if (clos.length === 0) {
      results.push({
        rule: 'CLO_MEASURABLE_VERB',
        ruleTitle: 'Zero Course Learning Outcomes Formulated',
        severity: 'Error',
        message: 'An outcome-based course requires at least 3 to 6 measurable Course Learning Outcomes (CLOs).',
        affectedEntity: 'CLO',
        recommendation: 'Formulate observable, action-oriented CLOs using Bloom cognitive taxonomy in Step 4.',
        targetStep: 4,
      });
      return;
    }

    if (clos.length < 3) {
      results.push({
        rule: 'CLO_MEASURABLE_VERB',
        ruleTitle: 'Insufficient CLO Count (< 3 CLOs)',
        severity: 'Warning',
        message: `Course only defines ${clos.length} outcome(s). Quality OBE standards mandate 3 to 6 comprehensive outcomes.`,
        affectedEntity: 'CLO',
        recommendation: 'Add outcomes spanning conceptual understanding, applied problem solving, and complex synthesis.',
        targetStep: 4,
      });
    } else if (clos.length > 8) {
      results.push({
        rule: 'CLO_MEASURABLE_VERB',
        ruleTitle: 'Excessive CLO Count (> 8 CLOs)',
        severity: 'Suggestion',
        message: `Course defines ${clos.length} CLOs. Having more than 8 outcomes risks fragmented assessment and excessive audit overhead.`,
        affectedEntity: 'CLO',
        recommendation: 'Consolidate granular sub-skills into higher-order thematic outcomes.',
        targetStep: 4,
      });
    } else {
      results.push({
        rule: 'CLO_MEASURABLE_VERB',
        ruleTitle: `Optimal Outcome Volume (${clos.length} CLOs)`,
        severity: 'Passed',
        message: `Outcome count (${clos.length}) adheres to accreditation standards.`,
        affectedEntity: 'CLO',
        recommendation: 'Outcome volume is well-calibrated.',
        targetStep: 4,
      });
    }

    // Check action verbs and weak verbs
    let weakCount = 0;
    clos.forEach((c) => {
      const statementLower = (c.statement || '').toLowerCase();
      const verbLower = (c.bloomVerb || '').toLowerCase();

      const isWeak = WEAK_VERBS.some((w) => verbLower === w || statementLower.startsWith(w) || statementLower.includes(` ${w} `));

      if (isWeak) {
        weakCount++;
        results.push({
          rule: 'CLO_MEASURABLE_VERB',
          ruleTitle: `Unobservable Action Verb in ${c.code}`,
          severity: 'Error',
          message: `${c.code} uses vague or unobservable verb ("${c.bloomVerb || 'understand/know'}"). These verbs cannot be directly graded with empirical evidence.`,
          affectedEntity: 'CLO',
          affectedEntityId: c.id,
          recommendation: `Refactor ${c.code} with observable Bloom verbs like "Explain", "Analyze", "Demonstrate", or "Design".`,
          targetStep: 4,
        });
      }

      // Check Bloom level validity
      const validLevels: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
      if (!c.bloomLevel || !validLevels.includes(c.bloomLevel)) {
        results.push({
          rule: 'CLO_BLOOM_VALID',
          ruleTitle: `Invalid Cognitive Domain Level for ${c.code}`,
          severity: 'Warning',
          message: `${c.code} does not have an explicit cognitive domain level assigned.`,
          affectedEntity: 'CLO',
          affectedEntityId: c.id,
          recommendation: 'Assign a cognitive level (e.g., Apply, Analyze, Create) in Step 4.',
          targetStep: 4,
        });
      }
    });

    if (weakCount === 0 && clos.length > 0) {
      results.push({
        rule: 'CLO_MEASURABLE_VERB',
        ruleTitle: 'All CLO Action Verbs are Observable & Measurable',
        severity: 'Passed',
        message: 'No vague verbs (understand, know, learn) detected across course outcomes.',
        affectedEntity: 'CLO',
        recommendation: 'Measurable outcome statements validated.',
        targetStep: 4,
      });
    }
  }

  private static checkFrameworkMapping(course: Course, results: CourseValidationRuleResult[]) {
    const clos = course.clos || [];
    if (clos.length === 0) return;

    const unmapped = clos.filter((c) => !c.mappedPLOs || c.mappedPLOs.length === 0);

    if (unmapped.length > 0) {
      results.push({
        rule: 'CLO_FRAMEWORK_MAPPING',
        ruleTitle: `${unmapped.length} Outcome(s) Disconnected from Framework Outcomes / PLOs`,
        severity: 'Error',
        message: `Outcomes ${unmapped.map((u) => u.code).join(', ')} do not contribute to any program outcome or graduate attribute.`,
        affectedEntity: 'Mapping',
        recommendation: 'Map each CLO to at least one program outcome with an Introduced, Reinforced, or Mastered scale in Step 5.',
        targetStep: 5,
      });
    } else {
      results.push({
        rule: 'CLO_FRAMEWORK_MAPPING',
        ruleTitle: 'All CLOs Mapped to Framework Outcomes',
        severity: 'Passed',
        message: `All ${clos.length} course outcomes contribute directly to the accreditation outcome matrix.`,
        affectedEntity: 'Mapping',
        recommendation: 'Constructive programmatic alignment verified.',
        targetStep: 5,
      });
    }
  }

  private static checkInstructionalScaffolding(course: Course, results: CourseValidationRuleResult[]) {
    const weeklyPlan = course.weeklyPlan || [];
    const modules = course.modules || [];
    const clos = course.clos || [];

    // Mode A: Macro Weekly Syllabus Plan
    if (weeklyPlan.length > 0) {
      const taughtCLOIds = new Set<string>();
      weeklyPlan.forEach((w) => {
        (w.linkedCLOIds || []).forEach((id) => taughtCLOIds.add(id));
      });

      const uncoveredCLOs = clos.filter((c) => !taughtCLOIds.has(c.id) && !taughtCLOIds.has(c.code));

      if (uncoveredCLOs.length > 0) {
        results.push({
          rule: 'CLO_WEEKLY_COVERAGE',
          ruleTitle: `${uncoveredCLOs.length} CLO(s) Omitted from Weekly Syllabus Plan`,
          severity: 'Error',
          message: `CLO(s) ${uncoveredCLOs.map((c) => c.code).join(', ')} are not scheduled in any weekly instructional sessions.`,
          affectedEntity: 'WeeklyPlan',
          recommendation: 'Assign these outcomes to designated weekly topics and learning activities in Step 6.',
          targetStep: 6,
        });
      } else {
        results.push({
          rule: 'CLO_WEEKLY_COVERAGE',
          ruleTitle: 'Complete Weekly Syllabus Coverage',
          severity: 'Passed',
          message: `All ${clos.length} course outcomes are scheduled and taught across the ${weeklyPlan.length}-week curriculum.`,
          affectedEntity: 'WeeklyPlan',
          recommendation: 'Instructional coverage confirmed.',
          targetStep: 6,
        });
      }
      return;
    }

    // Mode B: Modular Curriculum Structure (Modules / MLOs / Lessons)
    if (modules.length > 0) {
      const mlos = course.mlos || [];
      const coveredCLOIds = new Set<string>();
      mlos.forEach((m) => {
        if (m.linkedCLOId) coveredCLOIds.add(m.linkedCLOId);
      });

      const uncoveredCLOs = clos.filter((c) => !coveredCLOIds.has(c.id) && !coveredCLOIds.has(c.code));

      if (mlos.length === 0) {
        results.push({
          rule: 'CLO_WEEKLY_COVERAGE',
          ruleTitle: 'Curriculum Modules Lack Module Learning Outcomes (MLOs)',
          severity: 'Warning',
          message: `${modules.length} modules exist, but no granular MLOs have been formulated to scaffold student progression.`,
          affectedEntity: 'WeeklyPlan',
          recommendation: 'Draft Module Learning Outcomes linked to parent CLOs in Step 6.',
          targetStep: 6,
        });
      } else if (uncoveredCLOs.length > 0) {
        results.push({
          rule: 'CLO_WEEKLY_COVERAGE',
          ruleTitle: `${uncoveredCLOs.length} CLO(s) Not Covered by Module Learning Outcomes`,
          severity: 'Warning',
          message: `CLO(s) ${uncoveredCLOs.map((c) => c.code).join(', ')} lack child MLOs across the modular curriculum.`,
          affectedEntity: 'WeeklyPlan',
          recommendation: 'Link MLOs to all course learning outcomes.',
          targetStep: 6,
        });
      } else {
        results.push({
          rule: 'CLO_WEEKLY_COVERAGE',
          ruleTitle: 'Modular Instructional Scaffolding Complete',
          severity: 'Passed',
          message: `All ${clos.length} course outcomes are covered through ${modules.length} modules and ${mlos.length} MLOs.`,
          affectedEntity: 'WeeklyPlan',
          recommendation: 'Modular scaffolding aligned.',
          targetStep: 6,
        });
      }
      return;
    }

    // Neither defined
    results.push({
      rule: 'CLO_WEEKLY_COVERAGE',
      ruleTitle: 'Instructional Plan / Syllabus is Empty',
      severity: 'Error',
      message: 'The course has neither a weekly pedagogical schedule nor modular instructional breakdowns.',
      affectedEntity: 'WeeklyPlan',
      recommendation: 'Configure your weekly syllabus plan or modular curriculum in Step 6.',
      targetStep: 6,
    });
  }

  private static checkAssessmentPlan(course: Course, results: CourseValidationRuleResult[]): number {
    const assessments = course.assessments || [];
    const clos = course.clos || [];

    const totalWeight = assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);

    if (assessments.length === 0) {
      results.push({
        rule: 'ASSESSMENT_WEIGHT_TOTAL',
        ruleTitle: 'No Assessment Tasks Configured',
        severity: 'Error',
        message: 'The course requires direct assessment instruments (quizzes, assignments, exams, projects) to evaluate student achievement.',
        affectedEntity: 'Assessment',
        recommendation: 'Add assessment instruments in Step 8.',
        targetStep: 8,
      });
      return 0;
    }

    if (Math.abs(totalWeight - 100) > 0.05) {
      results.push({
        rule: 'ASSESSMENT_WEIGHT_TOTAL',
        ruleTitle: `Assessment Weightage Totals ${totalWeight}% (Must Be Exactly 100%)`,
        severity: 'Error',
        message: `The sum of assessment weightages equals ${totalWeight}%. Discrepancies invalidate student transcript marks and grade calculations.`,
        affectedEntity: 'Assessment',
        recommendation: 'Adjust component weights so their cumulative sum is exactly 100% in Step 8.',
        targetStep: 8,
      });
    } else {
      results.push({
        rule: 'ASSESSMENT_WEIGHT_TOTAL',
        ruleTitle: 'Assessment Weight Sum Equals Exactly 100%',
        severity: 'Passed',
        message: 'Assessment weighting is balanced and mathematically compliant.',
        affectedEntity: 'Assessment',
        recommendation: 'Weightage validation satisfied.',
        targetStep: 8,
      });
    }

    // Check which CLOs are assessed
    const assessedCLOIds = new Set<string>();
    assessments.forEach((a) => {
      (a.linkedCLOIds || []).forEach((id) => assessedCLOIds.add(id));
    });

    const unassessedCLOs = clos.filter((c) => !assessedCLOIds.has(c.id) && !assessedCLOIds.has(c.code));

    if (unassessedCLOs.length > 0) {
      results.push({
        rule: 'CLO_ASSESSMENT_COVERAGE',
        ruleTitle: `${unassessedCLOs.length} CLO(s) Have No Linked Assessment Instruments`,
        severity: 'Error',
        message: `Outcome(s) ${unassessedCLOs.map((u) => u.code).join(', ')} cannot be evidenced because no assessment evaluates them.`,
        affectedEntity: 'Assessment',
        recommendation: 'Link these outcomes to specific quizzes, assignments, projects, or exams in Step 8.',
        targetStep: 8,
      });
    } else if (clos.length > 0) {
      results.push({
        rule: 'CLO_ASSESSMENT_COVERAGE',
        ruleTitle: '100% Outcome Assessment Coverage',
        severity: 'Passed',
        message: `Every course learning outcome is directly measured by at least one assessment tool.`,
        affectedEntity: 'Assessment',
        recommendation: 'Direct evidence collection validated.',
        targetStep: 8,
      });
    }

    return totalWeight;
  }

  private static computeAlignmentTriangle(course: Course, results: CourseValidationRuleResult[]): AlignmentTriangleStatus[] {
    const clos = course.clos || [];
    const weeklyPlan = course.weeklyPlan || [];
    const assessments = course.assessments || [];

    const triangle: AlignmentTriangleStatus[] = [];

    clos.forEach((c) => {
      // Find teaching activities from weekly plan or activities collection
      const weekActivities = weeklyPlan
        .filter((w) => (w.linkedCLOIds || []).includes(c.id) || (w.linkedCLOIds || []).includes(c.code))
        .map((w) => `Week ${w.weekNumber}: ${w.learningActivity || w.topic}`);

      const standaloneActivities = (course.activities || [])
        .filter((a) => a.outcomeId === c.id || a.outcomeId === c.code)
        .map((a) => a.title);

      const combinedActivities = Array.from(new Set([...weekActivities, ...standaloneActivities]));
      const hasTeaching = combinedActivities.length > 0;

      // Find assessments
      const matchedAssessments = assessments
        .filter((a) => (a.linkedCLOIds || []).includes(c.id) || (a.linkedCLOIds || []).includes(c.code))
        .map((a) => `${a.name} (${a.weightage}%)`);
      const hasAssessment = matchedAssessments.length > 0;

      const isFullyAligned = hasTeaching && hasAssessment;
      const alignmentRating: 'Strong' | 'Partial' | 'Broken' = isFullyAligned
        ? 'Strong'
        : hasTeaching || hasAssessment
        ? 'Partial'
        : 'Broken';

      let recommendation: string | undefined;
      if (!hasTeaching && !hasAssessment) {
        recommendation = 'Critical: Outcome is completely unaddressed in both instruction and assessment.';
      } else if (!hasTeaching) {
        recommendation = 'Add dedicated instructional activities in Weekly Plan or Teaching Plan.';
      } else if (!hasAssessment) {
        recommendation = 'Link a direct assessment component in Assessment Plan.';
      }

      // Check Bloom mismatch (e.g. CLO is Create/Evaluate, but only tested via Quiz or taught purely via lecture)
      if (hasAssessment && (c.bloomLevel === 'Create' || c.bloomLevel === 'Evaluate')) {
        const onlyQuiz = assessments
          .filter((a) => (a.linkedCLOIds || []).includes(c.id) || (a.linkedCLOIds || []).includes(c.code))
          .every((a) => a.type === 'Quiz');

        if (onlyQuiz) {
          results.push({
            rule: 'ASSESSMENT_BLOOM_ALIGNMENT',
            ruleTitle: `Cognitive Level Mismatch for ${c.code}`,
            severity: 'Warning',
            message: `${c.code} targets high-order "${c.bloomLevel}" cognitive domain, but is only assessed via multiple choice / Quizzes.`,
            affectedEntity: 'Assessment',
            affectedEntityId: c.id,
            recommendation: 'Incorporate authentic performance tasks such as capstone projects, lab designs, or case evaluations.',
            targetStep: 8,
          });
        }
      }

      triangle.push({
        cloId: c.id,
        cloCode: c.code,
        statement: c.statement,
        bloomLevel: c.bloomLevel,
        hasTeachingActivity: hasTeaching,
        teachingActivities: combinedActivities,
        hasAssessment,
        assessments: matchedAssessments,
        isFullyAligned,
        alignmentRating,
        recommendation,
      });
    });

    return triangle;
  }

  private static checkCompleteness(course: Course, results: CourseValidationRuleResult[]) {
    if (!course.courseRationale && !course.description) {
      results.push({
        rule: 'COURSE_COMPLETENESS',
        ruleTitle: 'Course Rationale & Description Incomplete',
        severity: 'Warning',
        message: 'A well-structured syllabus requires a comprehensive Course Rationale and Aim explaining why the course is taught.',
        affectedEntity: 'Course',
        recommendation: 'Complete pedagogical rationale in Step 3.',
        targetStep: 3,
      });
    }

    if (!course.prerequisites || course.prerequisites.trim() === '') {
      results.push({
        rule: 'COURSE_COMPLETENESS',
        ruleTitle: 'Prerequisites Not Declared',
        severity: 'Suggestion',
        message: 'Specifying formal prerequisite courses guides academic advising and student success.',
        affectedEntity: 'Course',
        recommendation: 'Declare prior coursework or required skills in Step 2.',
        targetStep: 2,
      });
    }
  }

  private static checkAccessibility(course: Course, results: CourseValidationRuleResult[]) {
    // Simulated Accessibility Audit Rules
    
    // 1. Check for missing images/resource alt text
    const resourcesWithNoNotes = (course.resources || []).filter(r => !r.notes || r.notes.trim() === '');
    if (resourcesWithNoNotes.length > 0) {
      results.push({
        rule: 'ACCESSIBILITY_AUDIT_NOTES',
        ruleTitle: 'Missing Accessibility Notes for Resources',
        severity: 'Warning',
        message: `${resourcesWithNoNotes.length} resources are missing alt text or accessibility descriptions.`,
        affectedEntity: 'Course',
        recommendation: 'Add descriptive notes (e.g., alt text for images, transcript for audio) to all resources in the Resource Library.',
        targetStep: 1, // Assumed location
      });
    }

    // 2. Check for short link text
    const shortLinks = (course.resources || []).filter(r => r.type === 'link' && r.title.length < 5);
    if (shortLinks.length > 0) {
      results.push({
        rule: 'ACCESSIBILITY_AUDIT_LINKS',
        ruleTitle: 'Non-Descriptive Link Text',
        severity: 'Suggestion',
        message: `${shortLinks.length} links have non-descriptive text (e.g., "link", "click here").`,
        affectedEntity: 'Course',
        recommendation: 'Use descriptive link text that indicates the destination or purpose.',
        targetStep: 1,
      });
    }
  }

  public static applyAccessibilityFix(course: Course, rule: CourseValidationRuleResult): Course {
    const updatedCourse = { ...course };
    if (rule.rule === 'ACCESSIBILITY_AUDIT_NOTES') {
      updatedCourse.resources = (updatedCourse.resources || []).map(r => 
        !r.notes || r.notes.trim() === '' ? { ...r, notes: `Accessibility description for ${r.title}` } : r
      );
    } else if (rule.rule === 'ACCESSIBILITY_AUDIT_LINKS') {
      updatedCourse.resources = (updatedCourse.resources || []).map(r => 
        r.type === 'link' && r.title.length < 5 ? { ...r, title: `${r.title} - ${r.url}` } : r
      );
    }
    return updatedCourse;
  }

  private static checkRubricAlignment(course: Course, results: CourseValidationRuleResult[]) {
    const assessments = course.assessments || [];
    const qualitativeAssessments = assessments.filter((a) =>
      ['Assignment', 'Project', 'Presentation', 'Case Study', 'Portfolio', 'Practical', 'Lab Exam', 'Capstone'].includes(a.type)
    );

    if (qualitativeAssessments.length === 0) {
      results.push({
        rule: 'RUBRIC_ALIGNMENT',
        ruleTitle: 'Rubric Criteria Configured',
        severity: 'Passed',
        message: 'No unrubricated qualitative assessment tasks detected.',
        affectedEntity: 'Assessment',
        recommendation: 'Objective evaluation plan maintained.',
        targetStep: 8,
      });
      return;
    }

    const unrubricated = qualitativeAssessments.filter(
      (a) => !a.rubricId && !(course.rubrics || []).some((r) => r.assessmentId === a.id)
    );

    if (unrubricated.length > 0) {
      results.push({
        rule: 'RUBRIC_ALIGNMENT',
        ruleTitle: `${unrubricated.length} Qualitative Assessment(s) Lack Analytic Rubrics`,
        severity: 'Warning',
        message: `Tasks like "${unrubricated[0]?.name}" require explicit multi-tiered rubrics for consistent grading and accreditation verification.`,
        affectedEntity: 'Assessment',
        recommendation: 'Construct analytic rubrics with achievement tiers in the Rubric Builder.',
        targetStep: 8,
      });
    } else {
      results.push({
        rule: 'RUBRIC_ALIGNMENT',
        ruleTitle: 'All Qualitative Tasks Have Analytic Scoring Rubrics',
        severity: 'Passed',
        message: `All ${qualitativeAssessments.length} qualitative tasks have associated multi-tier scoring rubrics.`,
        affectedEntity: 'Assessment',
        recommendation: 'Evaluation criteria validated for external audit.',
        targetStep: 8,
      });
    }
  }

  private static checkEvidenceRules(course: Course, results: CourseValidationRuleResult[]) {
    const clos = course.clos || [];
    if (clos.length === 0) return;

    const evidenceRules = course.evidenceRules || [];
    const closWithEvidence = new Set(evidenceRules.map((er) => er.outcomeId || er.outcomeCode));
    const missingEvidenceCLOs = clos.filter((c) => !closWithEvidence.has(c.id) && !closWithEvidence.has(c.code));

    if (missingEvidenceCLOs.length > 0) {
      results.push({
        rule: 'EVIDENCE_RULES',
        ruleTitle: `${missingEvidenceCLOs.length} CLO(s) Lack Formulated Threshold Evidence Rules`,
        severity: 'Warning',
        message: `Outcome(s) ${missingEvidenceCLOs.map((c) => c.code).join(', ')} do not have explicit achievement threshold rules (e.g., minimum score ≥ 60%).`,
        affectedEntity: 'CLO',
        recommendation: 'Configure outcome threshold rules and direct evidence metrics.',
        targetStep: 8,
      });
    } else {
      results.push({
        rule: 'EVIDENCE_RULES',
        ruleTitle: 'Accreditation Attainment Threshold Rules Established',
        severity: 'Passed',
        message: `All ${clos.length} course learning outcomes have explicit direct attainment rules.`,
        affectedEntity: 'CLO',
        recommendation: 'Outcome attainment verification criteria complete.',
        targetStep: 8,
      });
    }
  }

  private static calculateCategoryScores(course: Course): CourseValidationCategoryScores {
    // 1. Course Info (100 pts)
    let courseInfo = 0;
    if (course.title && course.title.trim()) courseInfo += 20;
    if (course.code && course.code.trim()) courseInfo += 20;
    if (course.category && course.programme) courseInfo += 20;
    if (course.creditHours && course.creditHours > 0 && course.deliveryMode) courseInfo += 20;
    if (course.frameworkId) courseInfo += 10;
    if (course.description || course.learningPromise || course.blueprint?.purpose) courseInfo += 10;
    courseInfo = Math.min(100, courseInfo);

    // 2. CLO Quality (100 pts)
    const clos = course.clos || [];
    let cloQuality = 0;
    if (clos.length > 0) {
      const isCountOptimal = clos.length >= 3 && clos.length <= 8;
      const countScore = isCountOptimal ? 30 : clos.length === 2 ? 15 : clos.length > 8 ? 20 : 10;

      let weakCount = 0;
      let validBloomCount = 0;
      const validLevels: BloomLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

      clos.forEach((c) => {
        const stmt = (c.statement || '').toLowerCase();
        const v = (c.bloomVerb || '').toLowerCase();
        const isWeak = WEAK_VERBS.some((w) => v === w || stmt.startsWith(w) || stmt.includes(` ${w} `));
        if (isWeak) weakCount++;
        if (c.bloomLevel && validLevels.includes(c.bloomLevel)) validBloomCount++;
      });

      const measurabilityRatio = (clos.length - weakCount) / clos.length;
      const measurabilityScore = Math.round(measurabilityRatio * 40);
      const bloomValidityScore = Math.round((validBloomCount / clos.length) * 15);
      const avgQualityScore = Math.round(
        (clos.reduce((acc, c) => acc + (c.qualityScore || (weakCount === 0 ? 85 : 55)), 0) / clos.length) * 0.15
      );

      cloQuality = Math.min(100, countScore + measurabilityScore + bloomValidityScore + avgQualityScore);
    }

    // 3. CLO-PLO Mapping (100 pts)
    let cloPloMapping = 0;
    if (clos.length > 0) {
      const mapped = clos.filter((c) => c.mappedPLOs && c.mappedPLOs.length > 0).length;
      cloPloMapping = Math.round((mapped / clos.length) * 100);
    }

    // 4. Instructional Scaffolding / MLO Alignment (100 pts)
    let mloAlignment = 0;
    if (clos.length > 0) {
      const weeklyPlan = course.weeklyPlan || [];
      if (weeklyPlan.length > 0) {
        const taughtIds = new Set<string>();
        weeklyPlan.forEach((w) => (w.linkedCLOIds || []).forEach((id) => taughtIds.add(id)));
        const covered = clos.filter((c) => taughtIds.has(c.id) || taughtIds.has(c.code)).length;
        mloAlignment = Math.round((covered / clos.length) * 100);
      } else if (course.modules && course.modules.length > 0) {
        if (course.mlos && course.mlos.length > 0) {
          const linkedMLOs = course.mlos.filter((m) => m.linkedCLOId).length;
          mloAlignment = Math.round((linkedMLOs / course.mlos.length) * 100);
        } else {
          mloAlignment = 40;
        }
      }
    }

    // 5. Lesson Alignment / Learning Activities (100 pts)
    let lessonAlignment = 0;
    const weeklyPlan = course.weeklyPlan || [];
    if (weeklyPlan.length > 0) {
      const weeksWithActivity = weeklyPlan.filter(
        (w) => (w.learningActivity && w.learningActivity.trim().length > 0) || (w.topic && w.topic.trim().length > 0)
      ).length;
      lessonAlignment = Math.round((weeksWithActivity / weeklyPlan.length) * 100);
    } else if (course.lessons && course.lessons.length > 0) {
      const lessonsWithEv = course.lessons.filter((l) => l.evidenceOfLearning && l.evidenceOfLearning.trim().length > 0).length;
      lessonAlignment = Math.round((lessonsWithEv / course.lessons.length) * 100);
    } else if (course.activities && course.activities.length > 0) {
      lessonAlignment = Math.min(100, course.activities.length * 20);
    } else {
      lessonAlignment = 10;
    }

    // 6. Assessment Coverage (100 pts)
    let assessmentCoverage = 0;
    const assessments = course.assessments || [];
    if (assessments.length > 0 && clos.length > 0) {
      const totalWeight = assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);
      const weightAccuracy = Math.abs(totalWeight - 100) < 0.1 ? 50 : Math.max(0, 50 - Math.abs(totalWeight - 100) * 2);

      const assessedCLOIds = new Set<string>();
      assessments.forEach((a) => (a.linkedCLOIds || []).forEach((id) => assessedCLOIds.add(id)));
      const assessedCLOs = clos.filter((c) => assessedCLOIds.has(c.id) || assessedCLOIds.has(c.code)).length;
      const cloRatioScore = Math.round((assessedCLOs / clos.length) * 50);

      assessmentCoverage = Math.min(100, Math.round(weightAccuracy + cloRatioScore));
    }

    // 7. Rubric Alignment (100 pts)
    let rubricAlignment = 100;
    const qualitative = assessments.filter((a) =>
      ['Assignment', 'Project', 'Presentation', 'Case Study', 'Portfolio', 'Practical', 'Lab Exam', 'Capstone'].includes(a.type)
    );
    if (qualitative.length > 0) {
      const rubrics = course.rubrics || [];
      const rubricated = qualitative.filter((a) => a.rubricId || rubrics.some((r) => r.assessmentId === a.id)).length;
      rubricAlignment = Math.round((rubricated / qualitative.length) * 100);
    }

    // 8. Evidence Coverage (100 pts)
    let evidenceCoverage = 0;
    if (clos.length > 0) {
      const rules = course.evidenceRules || [];
      const ruleCLOs = new Set(rules.map((r) => r.outcomeId || r.outcomeCode));
      const covered = clos.filter((c) => ruleCLOs.has(c.id) || ruleCLOs.has(c.code)).length;
      evidenceCoverage = Math.round((covered / clos.length) * 100);
    }

    return {
      courseInfo,
      cloQuality,
      cloPloMapping,
      mloAlignment,
      lessonAlignment,
      assessmentCoverage,
      rubricAlignment,
      evidenceCoverage,
    };
  }
}
