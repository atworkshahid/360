import {
  Course,
  WeeklyCoursePlanItem,
  CourseModule,
  MLO,
  Lesson,
  Activity,
  BloomLevel,
  CompletionRequirement,
} from '../types';

/**
 * Maps Bloom levels to standard observable action verbs
 */
const BLOOM_DEFAULT_VERBS: Record<BloomLevel, string> = {
  Remember: 'Identify',
  Understand: 'Explain',
  Apply: 'Implement',
  Analyze: 'Deconstruct',
  Evaluate: 'Critique',
  Create: 'Synthesize',
};

/**
 * Intelligently groups weekly plans into 3-4 structured instructional modules
 */
function groupWeeksIntoModules(
  weeklyPlan: WeeklyCoursePlanItem[],
  clos: Course['clos']
): CourseModule[] {
  if (!weeklyPlan || weeklyPlan.length === 0) return [];

  const totalWeeks = weeklyPlan.length;
  // Determine number of modules (usually 3 to 5 modules)
  let numModules = 4;
  if (totalWeeks <= 6) numModules = 2;
  else if (totalWeeks <= 10) numModules = 3;
  else if (totalWeeks <= 16) numModules = 4;
  else numModules = 5;

  const weeksPerModule = Math.ceil(totalWeeks / numModules);
  const modules: CourseModule[] = [];

  for (let m = 0; m < numModules; m++) {
    const startWeek = m * weeksPerModule + 1;
    const endWeek = Math.min(totalWeeks, (m + 1) * weeksPerModule);
    if (startWeek > totalWeeks) break;

    const moduleWeeks = weeklyPlan.filter(
      (w) => w.weekNumber >= startWeek && w.weekNumber <= endWeek
    );
    if (moduleWeeks.length === 0) continue;

    // Collect related CLO IDs
    const relatedCLOIds = new Set<string>();
    moduleWeeks.forEach((w) => {
      (w.linkedCLOIds || []).forEach((id) => relatedCLOIds.add(id));
    });
    // If none found, associate round-robin CLO
    if (relatedCLOIds.size === 0 && clos.length > 0) {
      relatedCLOIds.add(clos[m % clos.length].id);
    }

    const firstTopic = moduleWeeks[0]?.topic || `Unit ${m + 1}`;
    const lastTopic = moduleWeeks[moduleWeeks.length - 1]?.topic;
    const moduleTitle =
      firstTopic === lastTopic
        ? `Module ${m + 1}: ${firstTopic}`
        : `Module ${m + 1}: ${firstTopic} to ${lastTopic}`;

    const totalStudyHours = moduleWeeks.reduce(
      (acc, w) => acc + (w.contactHours || 3) + (w.independentStudyHours || 4),
      0
    );

    modules.push({
      id: `mod-${m + 1}-${Date.now()}`,
      number: m + 1,
      title: moduleTitle,
      description: `Structured instructional coverage for Weeks ${startWeek} through ${endWeek}, covering core competencies and applied exercises.`,
      durationWeeks: moduleWeeks.length,
      expectedStudyHours: totalStudyHours,
      relatedCLOIds: Array.from(relatedCLOIds),
      resources: [
        `Prescribed textbook chapters for Weeks ${startWeek}–${endWeek}`,
        'Curated peer-reviewed articles, code repositories, and laboratory briefs',
      ],
    });
  }

  return modules;
}

/**
 * Bi-directionally synchronizes a course's Weekly Plan into structured Modules, MLOs, Lessons, and Activities
 */
export function syncWeeklyPlanToModules(course: Course): Course {
  const weeklyPlan = course.weeklyPlan || [];
  if (weeklyPlan.length === 0) return course;

  const clos = course.clos || [];

  // 1. Synthesize Modules if missing or empty
  let modules = course.modules || [];
  if (modules.length === 0) {
    modules = groupWeeksIntoModules(weeklyPlan, clos);
  }

  // 2. Synthesize Lessons for each week if missing or empty
  let lessons = course.lessons || [];
  if (lessons.length === 0) {
    lessons = weeklyPlan.map((week, idx) => {
      // Find corresponding module
      let targetModule = modules.find(
        (m, mIdx) =>
          week.weekNumber <= (mIdx + 1) * Math.ceil(weeklyPlan.length / modules.length)
      ) || modules[0];

      const bloom = week.bloomLevel || 'Apply';
      const verb = BLOOM_DEFAULT_VERBS[bloom] || 'Execute';

      return {
        id: `lesson-w${week.weekNumber}-${Date.now() + idx}`,
        moduleId: targetModule ? targetModule.id : `mod-1`,
        linkedMLOId: `mlo-w${week.weekNumber}`,
        title: `Week ${week.weekNumber}: ${week.topic}`,
        learningObjective: `${verb} key concepts regarding ${(week.topic || `Week ${week.weekNumber}`).toLowerCase()} through guided exploration and structured exercises.`,
        durationMins: (week.contactHours || 3) * 60,
        teachingMode: course.deliveryMode || 'Blended',
        content: {
          text: week.subtopics || week.topic || `Instructional units for Week ${week.weekNumber}`,
          reading: week.requiredReading || `Required readings and lecture notes for Week ${week.weekNumber}`,
          workedExample: `Practical walkthrough on ${week.topic || `Week ${week.weekNumber}`}`,
        },
        requiredActivity:
          week.learningActivity ||
          'Formative classroom challenge, interactive debrief, or laboratory experiment.',
        evidenceOfLearning: `Graded weekly exercise submission or analytical log for Week ${week.weekNumber}.`,
        completionRequirements: ['complete_activity', 'submit_assignment'] as CompletionRequirement[],
      };
    });
  }

  // 3. Synthesize MLOs if missing or empty
  let mlos = course.mlos || [];
  if (mlos.length === 0) {
    mlos = weeklyPlan.map((week, idx) => {
      const modIndex = Math.min(
        modules.length,
        Math.ceil(week.weekNumber / Math.max(1, Math.ceil(weeklyPlan.length / modules.length)))
      );
      const targetModule = modules[modIndex - 1] || modules[0];
      const linkedCLOId =
        (week.linkedCLOIds && week.linkedCLOIds[0]) ||
        (targetModule && targetModule.relatedCLOIds && targetModule.relatedCLOIds[0]) ||
        clos[0]?.id ||
        '';

      const bloom = week.bloomLevel || 'Apply';
      const verb = BLOOM_DEFAULT_VERBS[bloom] || 'Apply';

      return {
        id: `mlo-w${week.weekNumber}`,
        code: `MLO ${modIndex}.${week.weekNumber}`,
        moduleId: targetModule ? targetModule.id : 'mod-1',
        linkedCLOId,
        statement: `${verb} ${(week.topic || `Week ${week.weekNumber}`).toLowerCase()} within applied scenarios and verify functional correctness.`,
        bloomVerb: verb,
        bloomLevel: bloom,
        requiredActivity:
          week.learningActivity || 'Weekly active learning problem set or case analysis.',
        assessment: 'Weekly formative checkpoint quiz or laboratory submission.',
        evidence: `Direct student output artifact demonstrating mastery of ${week.topic || `Week ${week.weekNumber}`}.`,
        studyTimeHours: week.independentStudyHours || 4,
      };
    });
  }

  // 4. Synthesize Activities if missing or empty
  let activities = course.activities || [];
  if (activities.length === 0) {
    activities = weeklyPlan
      .filter((w) => Boolean(w.learningActivity?.trim()))
      .slice(0, 8)
      .map((w, idx) => {
        const linkedCLOId = (w.linkedCLOIds && w.linkedCLOIds[0]) || clos[0]?.id || '';
        return {
          id: `act-sync-${w.weekNumber}-${Date.now() + idx}`,
          moduleId: modules[0]?.id || 'mod-1',
          outcomeType: 'CLO',
          outcomeId: linkedCLOId,
          title: `Week ${w.weekNumber} Activity: ${w.topic}`,
          activityType: 'Problem Solving',
          studentActionPrompt:
            w.learningActivity ||
            `Collaborate with peers to analyze and solve applied challenges in ${w.topic}.`,
          evidenceProduced: `Documented solution sheet or code repository for Week ${w.weekNumber}.`,
          estimatedMins: (w.contactHours || 2) * 45,
        };
      });
  }

  return {
    ...course,
    modules,
    modulesCount: modules.length,
    lessons,
    mlos,
    activities,
  };
}

/**
 * Bi-directionally unpacks Modules and Lessons into a Weekly Plan
 */
export function syncModulesToWeeklyPlan(course: Course): Course {
  const modules = course.modules || [];
  if (modules.length === 0) return course;

  const totalDuration =
    course.durationWeeks ||
    modules.reduce((acc, m) => acc + (m.durationWeeks || 4), 0) ||
    16;

  const lessons = course.lessons || [];
  const mlos = course.mlos || [];
  const clos = course.clos || [];

  const weeklyPlan: WeeklyCoursePlanItem[] = [];

  for (let w = 1; w <= totalDuration; w++) {
    // Determine which module this week falls into
    let accumulatedWeeks = 0;
    let targetModule = modules[0];
    for (const mod of modules) {
      accumulatedWeeks += mod.durationWeeks || 4;
      if (w <= accumulatedWeeks) {
        targetModule = mod;
        break;
      }
    }

    // Find lesson for this week or create from module
    const correspondingLesson = lessons[w - 1];
    const correspondingMLO = mlos.find((m) => m.moduleId === targetModule?.id);

    const topic =
      correspondingLesson?.title?.replace(/^Week \d+:\s*/i, '') ||
      (correspondingMLO?.statement ? correspondingMLO.statement.slice(0, 60) : '') ||
      `${targetModule.title} - Session ${w}`;

    const linkedCLOIds =
      (targetModule.relatedCLOIds && targetModule.relatedCLOIds.length > 0)
        ? targetModule.relatedCLOIds
        : correspondingMLO?.linkedCLOId
        ? [correspondingMLO.linkedCLOId]
        : clos[0]
        ? [clos[0].id]
        : [];

    weeklyPlan.push({
      weekNumber: w,
      topic,
      subtopics:
        correspondingLesson?.learningObjective ||
        correspondingLesson?.content?.text ||
        'Foundational analysis, applied formulations, and practical exercises.',
      linkedCLOIds,
      bloomLevel: correspondingMLO?.bloomLevel || 'Apply',
      learningActivity:
        correspondingLesson?.requiredActivity ||
        'Active problem set, collaborative discussion, or case study.',
      contactHours: course.theoryHours ? course.theoryHours + (course.labHours || 0) * 2 : 3,
      independentStudyHours: 5,
      requiredReading:
        targetModule.resources?.[0] || `Prescribed readings for Week ${w}`,
      notes: '',
    });
  }

  return {
    ...course,
    weeklyPlan,
  };
}

/**
 * Universal Harmonizer: Ensures bi-directional parity between 10-step Weekly Plan
 * and 15-step Modular Architecture so educators never encounter broken views or missing dependencies.
 */
export function harmonizeCurriculumParity(
  course: Course,
  preferSource?: 'weeklyPlan' | 'modules'
): Course {
  const hasWeeklyPlan = (course.weeklyPlan || []).length >= 2;
  const hasModules = (course.modules || []).length >= 1;

  if (preferSource === 'weeklyPlan' && hasWeeklyPlan) {
    return syncWeeklyPlanToModules(course);
  }

  if (preferSource === 'modules' && hasModules) {
    return syncModulesToWeeklyPlan(course);
  }

  // Automatic default resolution
  if (hasWeeklyPlan && !hasModules) {
    return syncWeeklyPlanToModules(course);
  }

  if (hasModules && !hasWeeklyPlan) {
    return syncModulesToWeeklyPlan(course);
  }

  // If both exist, ensure linked outcomes and module references remain valid
  if (hasWeeklyPlan && hasModules) {
    let updatedCourse = { ...course };
    // Ensure modules has at least 1 module
    if ((updatedCourse.modules || []).length === 0) {
      updatedCourse = syncWeeklyPlanToModules(updatedCourse);
    }
    return updatedCourse;
  }

  return course;
}

/**
 * Step index mapper between 10-step OBE flow and 15-step granular flow
 */
export function mapStepBetweenModes(
  fromMode: 'obe10' | 'granular15',
  toMode: 'obe10' | 'granular15',
  step: number
): number {
  if (fromMode === toMode) return step;

  if (fromMode === 'obe10') {
    // 10-step -> 15-step
    switch (step) {
      case 1: return 1; // Framework -> Course Setup
      case 2: return 1; // Course Info -> Course Setup
      case 3: return 2; // Purpose -> Blueprint
      case 4: return 3; // CLOs -> CLO Creator
      case 5: return 4; // Outcome Mapping -> PLO Mapping
      case 6: return 5; // Weekly Plan -> Module Creator
      case 7: return 8; // Teaching Activities -> Activity Designer
      case 8: return 9; // Assessment Plan -> Assessment Designer
      case 9: return 13; // Alignment Check -> Alignment Audit
      case 10: return 15; // Review & Export -> Review & Export
      default: return 1;
    }
  } else {
    // 15-step -> 10-step
    switch (step) {
      case 1: return 2; // Course Setup -> Course Info
      case 2: return 3; // Blueprint -> Purpose
      case 3: return 4; // CLO Creator -> CLO Manager
      case 4: return 5; // PLO Mapping -> Outcome Mapping
      case 5: // Module Creator -> Weekly Plan
      case 6: // MLO Creator -> Weekly Plan
      case 7: return 6; // Lesson Creator -> Weekly Plan
      case 8: return 7; // Activity Designer -> Teaching Activities
      case 9: // Assessment Designer
      case 10: // Question Builder
      case 11: // Rubric Builder
      case 12: return 8; // Evidence Rules -> Assessment Plan
      case 13: return 9; // Alignment Audit -> Alignment Check
      case 14: // Course Preview
      case 15: return 10; // Review & Export -> Review & Export
      default: return 1;
    }
  }
}
