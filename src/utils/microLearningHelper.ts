import { WeeklyCoursePlanItem, MicroLearningUnit, BloomLevel, Course } from '../types';

/**
 * Standard pedagogical sub-topic archetypes for structuring 4 Micro-learning Units per week
 */
/**
 * Pedagogical sub-topic archetypes for structuring 4 Micro-learning Units per week
 */
export type MicroLearningArchetype =
  | 'standard'
  | 'flipped'
  | 'lab'
  | 'inquiry'
  | 'milestone';

export const MICRO_LEARNING_PRESETS: {
  id: MicroLearningArchetype;
  name: string;
  description: string;
  units: { prefix: string; format: MicroLearningUnit['deliveryFormat']; duration: number; bloomOffset: number }[];
}[] = [
  {
    id: 'standard',
    name: 'Standard Scaffolding (Lecture → Studio → Lab → Synthesis)',
    description: 'Balanced progression from conceptual recall to practical lab and critical case analysis.',
    units: [
      { prefix: 'Foundational Principles & Concepts', format: 'Interactive Lecture', duration: 45, bloomOffset: -1 },
      { prefix: 'Methods, Algorithms & Structural Models', format: 'Problem-Solving Studio', duration: 50, bloomOffset: 0 },
      { prefix: 'Hands-on Implementation & Lab Practicum', format: 'Hands-on Lab', duration: 60, bloomOffset: 0 },
      { prefix: 'Critical Analysis, Case Study & Self-Assessment', format: 'Case Study', duration: 45, bloomOffset: 1 },
    ],
  },
  {
    id: 'flipped',
    name: 'Flipped Classroom (Pre-class → Studio → Peer Workshop → Mastery Check)',
    description: 'Emphasizes pre-session self-pacing, active peer solving, and formative mastery checkpoints.',
    units: [
      { prefix: 'Pre-Class Core Video & Concept Exploration', format: 'Self-Paced Practice', duration: 30, bloomOffset: -1 },
      { prefix: 'In-Class Collaborative Problem Studio', format: 'Problem-Solving Studio', duration: 60, bloomOffset: 0 },
      { prefix: 'Peer Review & Socratic Discussion', format: 'Discussion & Quiz', duration: 45, bloomOffset: 1 },
      { prefix: 'Formative Exit Ticket & Competency Verification', format: 'Discussion & Quiz', duration: 25, bloomOffset: 0 },
    ],
  },
  {
    id: 'lab',
    name: 'Lab & Practicum Heavy (Theory → Guided Lab → Project Sprint → Debrief)',
    description: 'Designed for STEM and engineering disciplines requiring intensive laboratory experimentation.',
    units: [
      { prefix: 'Experimental Protocols & Safety Briefing', format: 'Interactive Lecture', duration: 30, bloomOffset: -1 },
      { prefix: 'Guided Laboratory Experimentation & Benchmark Run', format: 'Hands-on Lab', duration: 60, bloomOffset: 0 },
      { prefix: 'Applied Troubleshooting & Code/Apparatus Practicum', format: 'Hands-on Lab', duration: 60, bloomOffset: 0 },
      { prefix: 'Results Analysis, Synthesis & Lab Report Prep', format: 'Problem-Solving Studio', duration: 40, bloomOffset: 1 },
    ],
  },
  {
    id: 'inquiry',
    name: 'Inquiry-Based / Problem-Based Learning (PBL)',
    description: 'Explores authentic messy problems through guided discovery, hypothesis testing, and artifact defense.',
    units: [
      { prefix: 'Authentic Problem Framing & Scenario Orientation', format: 'Interactive Lecture', duration: 40, bloomOffset: 0 },
      { prefix: 'Guided Inquiry, Data Mining & Investigation', format: 'Problem-Solving Studio', duration: 50, bloomOffset: 0 },
      { prefix: 'Collaborative Solution Prototyping & Peer Defense', format: 'Discussion & Quiz', duration: 50, bloomOffset: 1 },
      { prefix: 'Evidence Reflection & Artifact Evaluation', format: 'Case Study', duration: 40, bloomOffset: 1 },
    ],
  },
  {
    id: 'milestone',
    name: 'Milestone / Examination & CQI Synthesis',
    description: 'Ideal for Midterm (Week 8) or Final Exam (Week 16) evaluation and continuous improvement.',
    units: [
      { prefix: 'Comprehensive Knowledge Synthesis & Exam Blueprint Review', format: 'Interactive Lecture', duration: 45, bloomOffset: 0 },
      { prefix: 'Diagnostic Practice Workout & Rubric Calibration', format: 'Problem-Solving Studio', duration: 50, bloomOffset: 0 },
      { prefix: 'Formal Assessment / Examination Administration', format: 'Discussion & Quiz', duration: 60, bloomOffset: 1 },
      { prefix: 'Performance Diagnostics & Formative Feedback Debrief', format: 'Discussion & Quiz', duration: 35, bloomOffset: 0 },
    ],
  },
];

const DEFAULT_UNIT_ARCHETYPES = MICRO_LEARNING_PRESETS[0].units;

const BLOOM_HIERARCHY: BloomLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

/**
 * Adjusts bloom level based on offset within the 6-level taxonomy
 */
function adjustBloom(baseBloom: BloomLevel = 'Understand', offset: number): BloomLevel {
  const idx = BLOOM_HIERARCHY.indexOf(baseBloom);
  const safeIdx = idx === -1 ? 1 : idx;
  const targetIdx = Math.max(0, Math.min(BLOOM_HIERARCHY.length - 1, safeIdx + offset));
  return BLOOM_HIERARCHY[targetIdx];
}

/**
 * Generates 4 clean, context-tailored Micro-learning Units for a given week
 */
export function synthesize4MicroUnits(
  weekNumber: number,
  topic: string,
  baseBloom: BloomLevel = 'Understand',
  archetypeId: MicroLearningArchetype = 'standard'
): MicroLearningUnit[] {
  const safeTopic = topic || '';
  const cleanTopic = safeTopic.replace(/^Core Instructional Topic \d+:\s*/i, '').trim();
  const lowerTopic = cleanTopic.toLowerCase();

  const isMidterm = lowerTopic.includes('midterm') || lowerTopic.includes('mid-term');
  const isFinal = lowerTopic.includes('final') || lowerTopic.includes('summative') || lowerTopic.includes('capstone');

  const selectedPreset =
    isMidterm || isFinal
      ? MICRO_LEARNING_PRESETS.find((p) => p.id === 'milestone')!
      : MICRO_LEARNING_PRESETS.find((p) => p.id === archetypeId) || MICRO_LEARNING_PRESETS[0];

  return selectedPreset.units.map((arch, index) => {
    const unitNum = index + 1;
    let unitTitle = `${cleanTopic || `Week ${weekNumber}`}: ${arch.prefix}`;

    // Special handling for Milestone Weeks (e.g. Midterm / Final)
    if (isMidterm) {
      const midtermTitles = [
        'Curriculum Synthesis & Diagnostic Review (Weeks 1-7)',
        'Exam Blueprint & Key Competency Review',
        'Formal Midterm Evaluation Administration',
        'Performance Diagnostics & Formative Feedback Debrief',
      ];
      unitTitle = midtermTitles[index];
    } else if (isFinal) {
      const finalTitles = [
        'Comprehensive Term Synthesis & Knowledge Integration',
        'Capstone / Project Defense & Portfolio Presentation',
        'Terminal Summative Examination Administration',
        'Course Evaluation, Competency Attainment & CQI Reflection',
      ];
      unitTitle = finalTitles[index];
    }

    return {
      id: `mlu-w${weekNumber}-${unitNum}-${Date.now().toString(36).slice(-4)}`,
      unitNumber: unitNum,
      title: unitTitle,
      description: `Structured micro-learning module focusing on ${(arch.prefix || '').toLowerCase()} for Week ${weekNumber}.`,
      durationMinutes: arch.duration,
      bloomLevel: adjustBloom(baseBloom, arch.bloomOffset),
      deliveryFormat: arch.format,
      isCompleted: true,
    };
  });
}

/**
 * Builds prompt string for triggering the AI Copilot to generate 4 micro-learning units
 */
export function buildCopilotMicroUnitsPrompt(
  weekNumber: number,
  topic: string,
  cloInfo?: string,
  courseTitle?: string
): string {
  const safeTopic = topic || `Week ${weekNumber} Topic`;
  return `Generate 4 structured, pedagogical Micro-learning Units (sub-topics) for Week ${weekNumber} (${safeTopic})${
    courseTitle ? ` in the course "${courseTitle}"` : ''
  }${cloInfo ? `, aligned with ${cloInfo}` : ''}. 
For each of the 4 units, provide:
1. Specific sub-topic title (measurable, student-centered)
2. Delivery format (Interactive Lecture, Hands-on Lab, Self-Paced Practice, Case Study, Discussion & Quiz, or Problem-Solving Studio)
3. Duration in minutes (totaling 180-240 minutes per week)
4. Targeted cognitive Bloom level (Remember, Understand, Apply, Analyze, Evaluate, Create)
Ensure a coherent scaffold from foundation to active application and formative review.`;
}

/**
 * Parses existing subtopics string into 4 distinct Micro-learning Units
 */
export function parseSubtopicsToMicroUnits(
  weekNumber: number,
  topic: string,
  subtopicsStr?: string,
  baseBloom: BloomLevel = 'Understand'
): MicroLearningUnit[] {
  const cleanSubtopics = (subtopicsStr || '')
    .split(/[,;\n•\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // If we already have at least 1 parsed item, use them and pad up to 4
  const units: MicroLearningUnit[] = [];

  for (let i = 0; i < 4; i++) {
    const unitNum = i + 1;
    const arch = DEFAULT_UNIT_ARCHETYPES[i];
    let title = cleanSubtopics[i];

    if (!title) {
      title = `${topic || `Week ${weekNumber}`}: ${arch.prefix}`;
    }

    units.push({
      id: `mlu-w${weekNumber}-${unitNum}`,
      unitNumber: unitNum,
      title,
      description: `Micro-learning Unit ${unitNum} for Week ${weekNumber}`,
      durationMinutes: arch.duration,
      bloomLevel: adjustBloom(baseBloom, arch.bloomOffset),
      deliveryFormat: arch.format,
      isCompleted: Boolean(title && title.trim().length > 0),
    });
  }

  return units;
}

/**
 * Ensures a weekly plan item has exactly 4 micro-learning units
 */
export function ensureWeeklyMicroUnits(week: WeeklyCoursePlanItem): MicroLearningUnit[] {
  if (week.microLearningUnits && Array.isArray(week.microLearningUnits) && week.microLearningUnits.length === 4) {
    // Validate unitNumber sequencing
    return week.microLearningUnits.map((u, idx) => ({
      ...u,
      unitNumber: idx + 1,
      id: u.id || `mlu-w${week.weekNumber}-${idx + 1}`,
      bloomLevel: u.bloomLevel || week.bloomLevel || 'Understand',
      durationMinutes: u.durationMinutes || 45,
      deliveryFormat: u.deliveryFormat || DEFAULT_UNIT_ARCHETYPES[idx].format,
    }));
  }

  // If week has existing subtopics text, parse into 4 units
  return parseSubtopicsToMicroUnits(
    week.weekNumber,
    week.topic,
    week.subtopics,
    week.bloomLevel || 'Understand'
  );
}

/**
 * Serializes 4 Micro-learning Units into a comma-separated subtopics string
 * for backward compatibility with export engines and legacy viewers
 */
export function serializeMicroUnitsToSubtopics(units: MicroLearningUnit[]): string {
  if (!units || units.length === 0) return '';
  return units
    .map((u) => u.title.trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * Updates a specific micro-learning unit inside a week and keeps `subtopics` synchronized
 */
export function updateMicroUnitInWeek(
  week: WeeklyCoursePlanItem,
  unitIndex: number,
  updates: Partial<MicroLearningUnit>
): WeeklyCoursePlanItem {
  const currentUnits = [...ensureWeeklyMicroUnits(week)];
  if (unitIndex < 0 || unitIndex >= 4) return week;

  currentUnits[unitIndex] = {
    ...currentUnits[unitIndex],
    ...updates,
    isCompleted: Boolean(
      (updates.title !== undefined ? updates.title : currentUnits[unitIndex].title)?.trim()
    ),
  };

  const synchronizedSubtopics = serializeMicroUnitsToSubtopics(currentUnits);

  return {
    ...week,
    microLearningUnits: currentUnits,
    subtopics: synchronizedSubtopics,
  };
}

/**
 * Updates all 4 micro-learning units for a week at once
 */
export function setWeeklyMicroUnits(
  week: WeeklyCoursePlanItem,
  units: MicroLearningUnit[]
): WeeklyCoursePlanItem {
  // Ensure exactly 4
  const normalizedUnits: MicroLearningUnit[] = [];
  for (let i = 0; i < 4; i++) {
    const existing = units[i];
    normalizedUnits.push(
      existing || {
        id: `mlu-w${week.weekNumber}-${i + 1}`,
        unitNumber: i + 1,
        title: `Sub-topic ${i + 1}`,
        durationMinutes: 45,
        bloomLevel: week.bloomLevel || 'Understand',
        deliveryFormat: DEFAULT_UNIT_ARCHETYPES[i].format,
      }
    );
  }

  return {
    ...week,
    microLearningUnits: normalizedUnits,
    subtopics: serializeMicroUnitsToSubtopics(normalizedUnits),
  };
}

/**
 * Enriches all weeks in a course with exactly 4 Micro-learning Units
 */
export function enrichCourseWithMicroUnits(course: Course): Course {
  if (!course.weeklyPlan || course.weeklyPlan.length === 0) {
    return course;
  }

  const updatedWeeklyPlan = course.weeklyPlan.map((week) => {
    const units = ensureWeeklyMicroUnits(week);
    return {
      ...week,
      microLearningUnits: units,
      subtopics: week.subtopics || serializeMicroUnitsToSubtopics(units),
    };
  });

  return {
    ...course,
    weeklyPlan: updatedWeeklyPlan,
  };
}

/**
 * Calculates statistics on Micro-learning Unit completion across the course
 */
export function calculateMicroUnitsStats(weeklyPlan?: WeeklyCoursePlanItem[]): {
  totalWeeks: number;
  totalExpectedUnits: number;
  totalConfiguredUnits: number;
  fullyConfiguredWeeks: number;
  percentComplete: number;
  averageDurationMinutes: number;
} {
  const plan = weeklyPlan || [];
  const totalWeeks = plan.length;
  const totalExpectedUnits = totalWeeks * 4;

  if (totalWeeks === 0) {
    return {
      totalWeeks: 0,
      totalExpectedUnits: 0,
      totalConfiguredUnits: 0,
      fullyConfiguredWeeks: 0,
      percentComplete: 0,
      averageDurationMinutes: 0,
    };
  }

  let totalConfiguredUnits = 0;
  let fullyConfiguredWeeks = 0;
  let totalDurationMinutes = 0;

  plan.forEach((week) => {
    const units = ensureWeeklyMicroUnits(week);
    let configuredInWeek = 0;

    units.forEach((u) => {
      if (u.title && u.title.trim().length > 2) {
        configuredInWeek++;
        totalConfiguredUnits++;
      }
      totalDurationMinutes += u.durationMinutes || 45;
    });

    if (configuredInWeek === 4) {
      fullyConfiguredWeeks++;
    }
  });

  const percentComplete =
    totalExpectedUnits > 0
      ? Math.round((totalConfiguredUnits / totalExpectedUnits) * 100)
      : 0;

  const averageDurationMinutes =
    totalConfiguredUnits > 0
      ? Math.round(totalDurationMinutes / (totalWeeks * 4))
      : 45;

  return {
    totalWeeks,
    totalExpectedUnits,
    totalConfiguredUnits,
    fullyConfiguredWeeks,
    percentComplete,
    averageDurationMinutes,
  };
}
