import {
  Course,
  CourseElementComment,
  CommentReply,
  StakeholderRole,
  CommentCategory,
  CommentStatus,
  CommentTargetType,
} from '../types';

export interface CourseSectionMeta {
  key: string;
  stepNumber: number;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
}

export const COURSE_SECTIONS_META: CourseSectionMeta[] = [
  {
    key: 'step-1-overview',
    stepNumber: 1,
    title: 'Course Setup & Basic Information',
    shortTitle: 'Course Setup',
    category: 'Overview',
    description: 'Course title, catalog code, level, credits, delivery mode, and catalog summary',
  },
  {
    key: 'step-2-philosophy',
    stepNumber: 2,
    title: 'Pedagogical Framework & Vision',
    shortTitle: 'Pedagogy & Philosophy',
    category: 'Framework',
    description: 'Constructivist design, instructional philosophies, and OBE foundational vision',
  },
  {
    key: 'step-3-clos',
    stepNumber: 3,
    title: 'Course Learning Outcomes (CLOs)',
    shortTitle: 'Course Outcomes',
    category: 'Outcomes',
    description: 'Measurable statements, active Bloom verbs, and pass thresholds',
  },
  {
    key: 'step-4-plos',
    stepNumber: 4,
    title: 'Program Learning Outcomes (PLOs) Mapping',
    shortTitle: 'PLO Mapping',
    category: 'Outcomes',
    description: 'Accreditation matrix, competency coverage, and graduation attributes',
  },
  {
    key: 'step-5-modules',
    stepNumber: 5,
    title: 'Content Modules & Syllabus Breakdown',
    shortTitle: 'Modules & Units',
    category: 'Curriculum',
    description: 'Course units, topics, thematic modules, and contact hours allocation',
  },
  {
    key: 'step-6-mlos',
    stepNumber: 6,
    title: 'Module Learning Outcomes (MLOs)',
    shortTitle: 'Module Outcomes',
    category: 'Curriculum',
    description: 'Granular unit-level learning objectives nested under CLOs',
  },
  {
    key: 'step-7-schedule',
    stepNumber: 7,
    title: 'Weekly Schedule & Teaching Activities (TLAs)',
    shortTitle: 'Weekly Schedule',
    category: 'Instruction',
    description: 'Week-by-week lesson sequence, active learning sessions, and pedagogy',
  },
  {
    key: 'step-8-activities',
    stepNumber: 8,
    title: 'Active Learning & Formative Design',
    shortTitle: 'Formative Activities',
    category: 'Instruction',
    description: 'Interactive classroom exercises, diagnostic checks, and peer learning',
  },
  {
    key: 'step-9-assessments',
    stepNumber: 9,
    title: 'Summative Assessment Blueprint',
    shortTitle: 'Assessment Plan',
    category: 'Assessment',
    description: 'Graded assignments, exams, projects, CLO mappings, and 100% weightage check',
  },
  {
    key: 'step-10-questions',
    stepNumber: 10,
    title: 'Question Bank & Item Specifications',
    shortTitle: 'Question Blueprints',
    category: 'Assessment',
    description: 'Question items, cognitive level distribution, and marking guides',
  },
  {
    key: 'step-11-rubrics',
    stepNumber: 11,
    title: 'Grading Rubrics & Evaluative Descriptors',
    shortTitle: 'Rubrics',
    category: 'Assessment',
    description: 'Analytic & holistic rubrics, performance criteria, and scoring bands',
  },
  {
    key: 'step-12-evidence',
    stepNumber: 12,
    title: 'Direct Evidence Rules & Passing Benchmarks',
    shortTitle: 'Evidence Rules',
    category: 'Assessment',
    description: 'Direct measurement criteria, cohort benchmarks, and attainment thresholds',
  },
  {
    key: 'step-13-alignment',
    stepNumber: 13,
    title: 'Constructive Alignment & Course Audit',
    shortTitle: 'Alignment Auditor',
    category: 'Quality',
    description: 'Biggs tripartite outcome-activity-assessment validation and gap detection',
  },
  {
    key: 'step-14-preview',
    stepNumber: 14,
    title: 'Syllabus Preview & Structure',
    shortTitle: 'Course Syllabus',
    category: 'Quality',
    description: 'Comprehensive course overview, syllabus layout, and student-facing view',
  },
  {
    key: 'step-15-review',
    stepNumber: 15,
    title: 'CQI Action Plan & Committee Signoff',
    shortTitle: 'CQI & Signoff',
    category: 'Quality',
    description: 'Continuous quality improvement interventions, academic review, and exports',
  },
];

export interface StakeholderPersona {
  name: string;
  role: StakeholderRole;
  avatarColor: string;
  affiliation: string;
}

export const STAKEHOLDER_PERSONAS: StakeholderPersona[] = [
  {
    name: 'Dr. Marcus Vance',
    role: 'Accreditation Reviewer',
    avatarColor: 'bg-purple-600 text-white',
    affiliation: 'National Accreditation Board',
  },
  {
    name: 'Prof. Elena Rostova',
    role: 'Program Chair',
    avatarColor: 'bg-blue-600 text-white',
    affiliation: 'Academic Curriculum Committee',
  },
  {
    name: 'Sarah Chen',
    role: 'Industry Advisory',
    avatarColor: 'bg-amber-600 text-white',
    affiliation: 'Industry Advisory Council',
  },
  {
    name: 'Dr. Tariq Al-Mansoor',
    role: 'External Examiner',
    avatarColor: 'bg-emerald-600 text-white',
    affiliation: 'External Peer Review Panel',
  },
  {
    name: 'Liam Patel',
    role: 'Instructional Designer',
    avatarColor: 'bg-pink-600 text-white',
    affiliation: 'Centre for Teaching & Learning',
  },
  {
    name: 'Ayesha Khan',
    role: 'Student Representative',
    avatarColor: 'bg-cyan-600 text-white',
    affiliation: 'Student Academic Council',
  },
];

export const COMMENT_CATEGORIES: { category: CommentCategory; color: string; description: string }[] = [
  {
    category: 'Alignment & Rigor',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Alignment with program outcomes, cognitive depth, and outcome parity',
  },
  {
    category: 'Cognitive Level',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    description: "Bloom's taxonomy verb suitability and cognitive expectation",
  },
  {
    category: 'Clarity & Wording',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Measurability, active voice, and student-facing transparency',
  },
  {
    category: 'Workload & Feasibility',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Credit hours, student study time, and assessment grading burden',
  },
  {
    category: 'Accreditation Standards',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'ABET / HEC / professional statutory compliance requirements',
  },
  {
    category: 'Commendation',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Exemplary constructive alignment or pedagogical innovation',
  },
  {
    category: 'General',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    description: 'General stakeholder observation or discussion question',
  },
];

export const getRoleBadgeColor = (role: StakeholderRole): string => {
  switch (role) {
    case 'Accreditation Reviewer':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Program Chair':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Industry Advisory':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'External Examiner':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Instructional Designer':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'Student Representative':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'Faculty / Instructor':
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export const getCategoryBadgeColor = (category: CommentCategory): string => {
  const found = COMMENT_CATEGORIES.find((c) => c.category === category);
  return found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
};

/**
 * Returns comments specifically mapped to a target element ID (CLO, Assessment, or section key)
 */
export const getElementComments = (
  comments: CourseElementComment[] | undefined,
  targetId: string
): CourseElementComment[] => {
  if (!comments || !Array.isArray(comments)) return [];
  return comments.filter((c) => c.targetId === targetId || c.sectionKey === targetId);
};

/**
 * Returns comments specifically mapped to a sectionKey or stepNumber
 */
export const getCommentsForSection = (
  comments: CourseElementComment[] | undefined,
  sectionKey: string,
  stepNumber?: number
): CourseElementComment[] => {
  if (!comments || !Array.isArray(comments)) return [];
  return comments.filter(
    (c) =>
      c.sectionKey === sectionKey ||
      c.targetId === sectionKey ||
      (stepNumber !== undefined && c.stepNumber === stepNumber)
  );
};

/**
 * Count unresolved comments for a specific section
 */
export const getUnresolvedCountForSection = (
  comments: CourseElementComment[] | undefined,
  sectionKey: string,
  stepNumber?: number
): number => {
  if (!comments || !Array.isArray(comments)) return 0;
  return getCommentsForSection(comments, sectionKey, stepNumber).filter(
    (c) => c.status !== 'resolved'
  ).length;
};

/**
 * Count unresolved comments (optionally filtered by targetId)
 */
export const getUnresolvedCommentsCount = (
  comments: CourseElementComment[] | undefined,
  targetId?: string
): number => {
  if (!comments || !Array.isArray(comments)) return 0;
  return comments.filter((c) => {
    const matchesTarget = targetId ? c.targetId === targetId || c.sectionKey === targetId : true;
    return matchesTarget && c.status !== 'resolved';
  }).length;
};

/**
 * Total comment count (including replies)
 */
export const getTotalCommentsCount = (
  comments: CourseElementComment[] | undefined,
  targetId?: string
): number => {
  if (!comments || !Array.isArray(comments)) return 0;
  const filtered = targetId
    ? comments.filter((c) => c.targetId === targetId || c.sectionKey === targetId)
    : comments;
  return filtered.reduce((total, c) => total + 1 + (c.replies ? c.replies.length : 0), 0);
};

/**
 * Generates sample initial comments if none exist on a course
 */
export const generateSampleCommentsForCourse = (course: Course): CourseElementComment[] => {
  const clo1 = course.clos[0];
  const clo2 = course.clos[1];
  const asmt1 = course.assessments[0];
  const asmt2 = course.assessments[1];

  const now = Date.now();
  const oneDay = 86400000;
  const twoDays = oneDay * 2;

  const sampleComments: CourseElementComment[] = [
    {
      id: `comment-sample-${now}-overview`,
      targetType: 'Section',
      targetId: 'step-1-overview',
      targetTitle: 'Course Setup & Basic Information',
      sectionKey: 'step-1-overview',
      stepNumber: 1,
      priority: 'medium',
      authorName: 'Prof. Elena Rostova',
      authorRole: 'Program Chair',
      authorAvatarColor: 'bg-blue-600 text-white',
      category: 'Clarity & Wording',
      content: 'The course title and credit breakdown look solid for the 3-credit curriculum allotment. Please ensure the course catalog description highlights the experiential problem-solving component clearly for prospective learners.',
      status: 'open',
      suggestedChange: `Expand catalog summary to explicitly mention authentic problem briefs and statutory simulation exercises.`,
      replies: [
        {
          id: `reply-sample-${now}-ov1`,
          authorName: 'Liam Patel',
          authorRole: 'Instructional Designer',
          authorAvatarColor: 'bg-pink-600 text-white',
          content: 'Updated the catalog description in Section 1 to emphasize hands-on scenario analysis.',
          createdAt: new Date(now - 3600000 * 5).toISOString(),
        },
      ],
      createdAt: new Date(now - oneDay).toISOString(),
    },
    {
      id: `comment-sample-${now}-philosophy`,
      targetType: 'Philosophy',
      targetId: 'step-2-philosophy',
      targetTitle: 'Pedagogical Framework & Vision',
      sectionKey: 'step-2-philosophy',
      stepNumber: 2,
      priority: 'high',
      authorName: 'Liam Patel',
      authorRole: 'Instructional Designer',
      authorAvatarColor: 'bg-pink-600 text-white',
      category: 'Alignment & Rigor',
      content: 'We are adopting Biggs Constructive Alignment paired with active inquiry. Let us confirm that every lecture module incorporates at least 20 minutes of collaborative student peer work.',
      status: 'open',
      suggestedChange: 'Explicitly state the 60:40 instructional-to-active learning ratio in the pedagogical vision.',
      replies: [],
      createdAt: new Date(now - 3600000 * 12).toISOString(),
    },
  ];

  if (clo1) {
    sampleComments.push({
      id: `comment-sample-${now}-1`,
      targetType: 'CLO',
      targetId: clo1.id,
      targetTitle: `${clo1.code}: ${clo1.statement.slice(0, 60)}...`,
      sectionKey: 'step-3-clos',
      stepNumber: 3,
      priority: 'medium',
      authorName: 'Dr. Marcus Vance',
      authorRole: 'Accreditation Reviewer',
      authorAvatarColor: 'bg-purple-600 text-white',
      category: 'Alignment & Rigor',
      content: `The cognitive verb "${clo1.bloomVerb || 'Analyze'}" aligns well with ${course.courseLevel || 'Undergraduate'} expectations. Please ensure the rubric directly measures higher-order legal/analytical synthesis rather than passive recall.`,
      status: 'resolved',
      suggestedChange: `Clarify the evaluative standard in Criterion 1 of the associated assessment rubric.`,
      replies: [
        {
          id: `reply-sample-${now}-1`,
          authorName: 'Prof. Elena Rostova',
          authorRole: 'Program Chair',
          authorAvatarColor: 'bg-blue-600 text-white',
          content: 'Addressed in Stage 11 Rubric Builder. We calibrated the rubric criteria using the Bloom criteria suggestions.',
          createdAt: new Date(now - oneDay).toISOString(),
        },
      ],
      createdAt: new Date(now - twoDays).toISOString(),
      updatedAt: new Date(now - oneDay).toISOString(),
      resolvedAt: new Date(now - oneDay).toISOString(),
      resolvedBy: 'Prof. Elena Rostova',
    });
  }

  if (clo2) {
    sampleComments.push({
      id: `comment-sample-${now}-2`,
      targetType: 'CLO',
      targetId: clo2.id,
      targetTitle: `${clo2.code}: ${clo2.statement.slice(0, 60)}...`,
      sectionKey: 'step-3-clos',
      stepNumber: 3,
      priority: 'high',
      authorName: 'Sarah Chen',
      authorRole: 'Industry Advisory',
      authorAvatarColor: 'bg-amber-600 text-white',
      category: 'Workload & Feasibility',
      content: `From an industry practitioner perspective, students will benefit from hands-on scenario problem drafting rather than abstract theoretical essays. Consider making the assessment prompt an authentic workplace scenario.`,
      status: 'open',
      suggestedChange: `Emphasize authentic problem briefs and statutory application in the outcome statement.`,
      replies: [
        {
          id: `reply-sample-${now}-2`,
          authorName: 'Liam Patel',
          authorRole: 'Instructional Designer',
          authorAvatarColor: 'bg-pink-600 text-white',
          content: 'Good suggestion. We can link this to Assessment 2 which features authentic scenario brief drafting.',
          createdAt: new Date(now - 3600000 * 4).toISOString(),
        },
      ],
      createdAt: new Date(now - 3600000 * 18).toISOString(),
    });
  }

  // Schedule comment
  sampleComments.push({
    id: `comment-sample-${now}-schedule`,
    targetType: 'Section',
    targetId: 'step-7-schedule',
    targetTitle: 'Weekly Schedule & Teaching Activities',
    sectionKey: 'step-7-schedule',
    stepNumber: 7,
    priority: 'medium',
    authorName: 'Ayesha Khan',
    authorRole: 'Student Representative',
    authorAvatarColor: 'bg-cyan-600 text-white',
    category: 'Workload & Feasibility',
    content: 'Week 8 has both a major case brief draft due and a midterm review quiz. Could we space the formative review quiz to Week 7 so student study workload remains balanced?',
    status: 'in_review',
    suggestedChange: 'Shift formative mock quiz to Week 7 and reserve Week 8 for synthesis.',
    replies: [],
    createdAt: new Date(now - 3600000 * 6).toISOString(),
  });

  if (asmt1) {
    sampleComments.push({
      id: `comment-sample-${now}-3`,
      targetType: 'Assessment',
      targetId: asmt1.id,
      targetTitle: `${asmt1.name} (${asmt1.type})`,
      sectionKey: 'step-9-assessments',
      stepNumber: 9,
      priority: 'high',
      authorName: 'Dr. Tariq Al-Mansoor',
      authorRole: 'External Examiner',
      authorAvatarColor: 'bg-emerald-600 text-white',
      category: 'Accreditation Standards',
      content: `With ${asmt1.weightage}% weightage, this assessment plays a critical role in outcome attainment. Please confirm whether formative feedback will be provided before final submission.`,
      status: 'in_review',
      suggestedChange: 'Add an interim peer-review milestone 2 weeks prior to final submission.',
      replies: [],
      createdAt: new Date(now - 3600000 * 8).toISOString(),
    });
  }

  if (asmt2) {
    sampleComments.push({
      id: `comment-sample-${now}-4`,
      targetType: 'Assessment',
      targetId: asmt2.id,
      targetTitle: `${asmt2.name} (${asmt2.type})`,
      sectionKey: 'step-9-assessments',
      stepNumber: 9,
      priority: 'low',
      authorName: 'Prof. Elena Rostova',
      authorRole: 'Program Chair',
      authorAvatarColor: 'bg-blue-600 text-white',
      category: 'Commendation',
      content: `Excellent constructive alignment with ${asmt2.linkedCLOIds.length} mapped CLO(s). The rubric threshold provides transparent criteria for grading.`,
      status: 'open',
      replies: [],
      createdAt: new Date(now - 3600000 * 2).toISOString(),
    });
  }

  return sampleComments;
};
