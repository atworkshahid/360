import { Request, Response, Router } from 'express';
import crypto from 'crypto';

export interface AuditLogEntry {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  stage: string;
  previousStatus?: string;
  newStatus?: string;
  decisionNote?: string;
  targetSection?: string;
  readinessScoreSnapshot?: number;
  digitalSignOff?: {
    signatoryName: string;
    signatoryRole: string;
    signatoryEmail: string;
    institution: string;
    timestamp: string;
    stage: string;
    verificationHash: string;
    accreditationStandard?: string;
    officialStatement: string;
  };
}

export interface ApprovalQueueItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  department: string;
  creditHours: number;
  framework: string;
  leadInstructor: string;
  submittedAt: string;
  currentStage: 'department_review' | 'board_of_studies' | 'dean_approval' | 'accreditation_review' | 'endorsed';
  targetStage: 'department_review' | 'board_of_studies' | 'dean_approval' | 'accreditation_review' | 'endorsed';
  readinessScore: number;
  criticalGaps: number;
  unresolvedCommentsCount: number;
  assignedReviewers: Array<{
    name: string;
    role: string;
    avatarColor: string;
    hasSignedOff: boolean;
  }>;
  lastActivityAt: string;
  daysInQueue: number;
  priority: 'normal' | 'urgent' | 'expedited';
  auditLogCount: number;
}

export interface ReviewerPresence {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  currentSection?: string;
  courseId: string;
  lastActiveAt: string;
}

export interface CourseElementComment {
  id: string;
  targetType: string;
  targetId: string;
  targetTitle: string;
  sectionKey?: string;
  stepNumber?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  authorName: string;
  authorRole: string;
  authorAvatarColor?: string;
  category: string;
  content: string;
  status: 'open' | 'in_review' | 'resolved';
  suggestedChange?: string;
  appliedSuggestion?: boolean;
  replies: Array<{
    id: string;
    authorName: string;
    authorRole: string;
    authorAvatarColor?: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// In-Memory Database Stores
const queueStore = new Map<string, ApprovalQueueItem>();
const auditTrailStore = new Map<string, AuditLogEntry[]>();
const commentsStore = new Map<string, CourseElementComment[]>();
const presenceStore = new Map<string, Map<string, ReviewerPresence>>();
const sseClientsStore = new Map<string, Set<Response>>();

// Helper to generate deterministic digital verification seals
function generateVerificationHash(courseCode: string, stage: string, timestamp: string, signer: string): string {
  const secretData = `${courseCode}:${stage}:${timestamp}:${signer}:MENTISERA-OBE360-ACADEMIC-SEAL`;
  return crypto.createHash('sha256').update(secretData).digest('hex').substring(0, 32).toUpperCase();
}

// Seed initial realistic courses into the approval queue
function initializeSeedData() {
  const now = Date.now();
  const oneDay = 86400000;
  const twoDays = oneDay * 2;
  const threeDays = oneDay * 3;

  // Sample Course 1: CS301 (In Board of Studies Queue)
  const cs301Id = 'course-cs301-swe';
  queueStore.set(cs301Id, {
    id: `queue-${cs301Id}`,
    courseId: cs301Id,
    courseCode: 'CS301',
    courseTitle: 'Software Engineering & Agile Architecture',
    department: 'Computer Science & Software Engineering',
    creditHours: 3,
    framework: 'Washington Accord (ABET EAC)',
    leadInstructor: 'Dr. Sarah Jenkins, Associate Professor',
    submittedAt: new Date(now - threeDays).toISOString(),
    currentStage: 'board_of_studies',
    targetStage: 'dean_approval',
    readinessScore: 94,
    criticalGaps: 0,
    unresolvedCommentsCount: 2,
    assignedReviewers: [
      { name: 'Prof. Elena Rostova', role: 'Program Chair', avatarColor: 'bg-blue-600 text-white', hasSignedOff: true },
      { name: 'Dr. Marcus Vance', role: 'Accreditation Reviewer', avatarColor: 'bg-purple-600 text-white', hasSignedOff: false },
      { name: 'Dr. Arthur Vance', role: 'Dean / Academic Head', avatarColor: 'bg-amber-600 text-white', hasSignedOff: false },
    ],
    lastActivityAt: new Date(now - 3600000 * 4).toISOString(),
    daysInQueue: 3,
    priority: 'urgent',
    auditLogCount: 4,
  });

  auditTrailStore.set(cs301Id, [
    {
      id: `audit-${now}-1`,
      courseId: cs301Id,
      courseCode: 'CS301',
      courseTitle: 'Software Engineering & Agile Architecture',
      timestamp: new Date(now - threeDays).toISOString(),
      actorName: 'Dr. Sarah Jenkins',
      actorRole: 'Faculty / Instructor',
      actorEmail: 'sjenkins@engineering.edu',
      action: 'SUBMITTED_FOR_REVIEW',
      stage: 'department_review',
      previousStatus: 'draft',
      newStatus: 'submitted',
      decisionNote: 'Initial OBE curriculum syllabus submission with 5 CLOs aligned to Washington Accord Graduate Attributes WA1-WA5.',
      readinessScoreSnapshot: 88,
    },
    {
      id: `audit-${now}-2`,
      courseId: cs301Id,
      courseCode: 'CS301',
      courseTitle: 'Software Engineering & Agile Architecture',
      timestamp: new Date(now - twoDays).toISOString(),
      actorName: 'Prof. Elena Rostova',
      actorRole: 'Program Chair',
      actorEmail: 'erostova@engineering.edu',
      action: 'DEPARTMENT_APPROVED',
      stage: 'department_review',
      previousStatus: 'submitted',
      newStatus: 'ready_for_review',
      decisionNote: 'Department Curriculum Committee confirmed constructive alignment of weekly teaching activities with Assessment 2 and 3.',
      readinessScoreSnapshot: 92,
      digitalSignOff: {
        signatoryName: 'Prof. Elena Rostova',
        signatoryRole: 'Program Chair, Department of Computer Science',
        signatoryEmail: 'erostova@engineering.edu',
        institution: 'Faculty of Engineering & Applied Sciences',
        timestamp: new Date(now - twoDays).toISOString(),
        stage: 'department_review',
        verificationHash: generateVerificationHash('CS301', 'department_review', new Date(now - twoDays).toISOString(), 'Prof. Elena Rostova'),
        accreditationStandard: 'ABET Criterion 3 (1-7) & Washington Accord WA1-WA5',
        officialStatement: 'Certified that course prerequisites and credit hours meet statutory degree requirements.',
      },
    },
    {
      id: `audit-${now}-3`,
      courseId: cs301Id,
      courseCode: 'CS301',
      courseTitle: 'Software Engineering & Agile Architecture',
      timestamp: new Date(now - oneDay).toISOString(),
      actorName: 'Dr. Marcus Vance',
      actorRole: 'Accreditation Reviewer',
      actorEmail: 'mvance@accreditation-board.org',
      action: 'COMMENT_POSTED',
      stage: 'board_of_studies',
      targetSection: 'step-3-clos',
      decisionNote: 'Recommended calibrating CLO 4 evaluative rubric criteria to explicitly evaluate complex engineering problem requirements.',
      readinessScoreSnapshot: 94,
    },
    {
      id: `audit-${now}-4`,
      courseId: cs301Id,
      courseCode: 'CS301',
      courseTitle: 'Software Engineering & Agile Architecture',
      timestamp: new Date(now - 3600000 * 4).toISOString(),
      actorName: 'Prof. Elena Rostova',
      actorRole: 'Program Chair',
      actorEmail: 'erostova@engineering.edu',
      action: 'BOS_APPROVED',
      stage: 'board_of_studies',
      previousStatus: 'ready_for_review',
      newStatus: 'under_review',
      decisionNote: 'Board of Studies approved outcome alignment. Advanced to Dean Executive Approval Queue for final seal.',
      readinessScoreSnapshot: 94,
      digitalSignOff: {
        signatoryName: 'Prof. Elena Rostova',
        signatoryRole: 'Chair, Board of Studies in Computing',
        signatoryEmail: 'erostova@engineering.edu',
        institution: 'Faculty of Engineering & Applied Sciences',
        timestamp: new Date(now - 3600000 * 4).toISOString(),
        stage: 'board_of_studies',
        verificationHash: generateVerificationHash('CS301', 'board_of_studies', new Date(now - 3600000 * 4).toISOString(), 'Prof. Elena Rostova'),
        accreditationStandard: 'Washington Accord WA1-WA5',
        officialStatement: 'Verified Board of Studies minutes resolution BoS-2026-03 item 4.',
      },
    },
  ]);

  commentsStore.set(cs301Id, [
    {
      id: `comm-${now}-1`,
      targetType: 'CLO',
      targetId: 'clo-cs301-4',
      targetTitle: 'CLO 4: Synthesize cloud-native microservices architecture',
      sectionKey: 'step-3-clos',
      stepNumber: 3,
      priority: 'high',
      authorName: 'Dr. Marcus Vance',
      authorRole: 'Accreditation Reviewer',
      authorAvatarColor: 'bg-purple-600 text-white',
      category: 'Alignment & Rigor',
      content: 'Under Washington Accord WP1-WP7 guidelines, please verify that student deliverables demonstrate synthesis under real-world performance constraints (latency, high availability, telemetry).',
      status: 'open',
      suggestedChange: 'Add explicit fault-tolerance constraint to Criterion 2 of Rubric 2.',
      replies: [
        {
          id: `rep-${now}-1`,
          authorName: 'Dr. Sarah Jenkins',
          authorRole: 'Faculty / Instructor',
          authorAvatarColor: 'bg-slate-700 text-white',
          content: 'Updated Criterion 2 in Stage 11 to require resilience testing with simulated network partitions.',
          createdAt: new Date(now - 3600000 * 2).toISOString(),
        },
      ],
      createdAt: new Date(now - oneDay).toISOString(),
    },
    {
      id: `comm-${now}-2`,
      targetType: 'Assessment',
      targetId: 'asmt-cs301-capstone',
      targetTitle: 'Capstone Team Architecture Defense (30%)',
      sectionKey: 'step-9-assessments',
      stepNumber: 9,
      priority: 'medium',
      authorName: 'Sarah Chen',
      authorRole: 'Industry Advisory',
      authorAvatarColor: 'bg-amber-600 text-white',
      category: 'Workload & Feasibility',
      content: 'Industry advisory board recommends scheduling the mock oral defense 1 week before finals to permit iterative revision of project documentation.',
      status: 'open',
      suggestedChange: 'Schedule mock defense in Week 13 instead of Week 14.',
      replies: [],
      createdAt: new Date(now - 3600000 * 8).toISOString(),
    },
  ]);

  // Sample Course 2: AI402 (In Dean Approval Queue)
  const ai402Id = 'course-ai402-deep';
  queueStore.set(ai402Id, {
    id: `queue-${ai402Id}`,
    courseId: ai402Id,
    courseCode: 'AI402',
    courseTitle: 'Applied Deep Learning & Generative Models',
    department: 'Artificial Intelligence & Data Science',
    creditHours: 4,
    framework: 'Washington Accord (ABET EAC)',
    leadInstructor: 'Prof. Tariq Al-Mansoor, Chair of AI',
    submittedAt: new Date(now - 86400000 * 5).toISOString(),
    currentStage: 'dean_approval',
    targetStage: 'accreditation_review',
    readinessScore: 98,
    criticalGaps: 0,
    unresolvedCommentsCount: 0,
    assignedReviewers: [
      { name: 'Dr. Arthur Vance', role: 'Dean / Academic Head', avatarColor: 'bg-amber-600 text-white', hasSignedOff: false },
      { name: 'Dr. Marcus Vance', role: 'Accreditation Reviewer', avatarColor: 'bg-purple-600 text-white', hasSignedOff: true },
    ],
    lastActivityAt: new Date(now - 3600000 * 1).toISOString(),
    daysInQueue: 5,
    priority: 'expedited',
    auditLogCount: 5,
  });

  auditTrailStore.set(ai402Id, [
    {
      id: `audit-${now}-ai1`,
      courseId: ai402Id,
      courseCode: 'AI402',
      courseTitle: 'Applied Deep Learning & Generative Models',
      timestamp: new Date(now - 86400000 * 5).toISOString(),
      actorName: 'Prof. Tariq Al-Mansoor',
      actorRole: 'Faculty / Instructor',
      action: 'SUBMITTED_FOR_REVIEW',
      stage: 'department_review',
      decisionNote: 'Submitted complete 4-credit graduate level curriculum syllabus.',
      readinessScoreSnapshot: 95,
    },
    {
      id: `audit-${now}-ai2`,
      courseId: ai402Id,
      courseCode: 'AI402',
      courseTitle: 'Applied Deep Learning & Generative Models',
      timestamp: new Date(now - 86400000 * 3).toISOString(),
      actorName: 'Prof. Elena Rostova',
      actorRole: 'Program Chair',
      action: 'DEPARTMENT_APPROVED',
      stage: 'department_review',
      decisionNote: 'Approved curriculum alignment and compute laboratory requirements.',
      readinessScoreSnapshot: 96,
    },
    {
      id: `audit-${now}-ai3`,
      courseId: ai402Id,
      courseCode: 'AI402',
      courseTitle: 'Applied Deep Learning & Generative Models',
      timestamp: new Date(now - 86400000 * 1).toISOString(),
      actorName: 'Curriculum Committee',
      actorRole: 'Program Chair',
      action: 'BOS_APPROVED',
      stage: 'board_of_studies',
      decisionNote: 'Passed unanimously by Board of Studies. Sent to Dean for formal executive authorization.',
      readinessScoreSnapshot: 98,
    },
  ]);
}

// Run initial seed
initializeSeedData();

// Broadcast SSE event to connected clients for a course
function broadcastToCourse(courseId: string, event: string, data: any) {
  const clients = sseClientsStore.get(courseId);
  if (clients && clients.size > 0) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      try {
        res.write(message);
      } catch (err) {
        console.error('Error writing to SSE stream:', err);
      }
    }
  }
}

export const collaborationRouter = Router();

/**
 * GET /api/collaboration/queue
 * Returns all courses currently in the collaborative approval pipeline
 */
collaborationRouter.get('/queue', (_req: Request, res: Response) => {
  const items = Array.from(queueStore.values());
  const stats = {
    total: items.length,
    departmentReview: items.filter((i) => i.currentStage === 'department_review').length,
    boardOfStudies: items.filter((i) => i.currentStage === 'board_of_studies').length,
    deanApproval: items.filter((i) => i.currentStage === 'dean_approval').length,
    accreditationReview: items.filter((i) => i.currentStage === 'accreditation_review').length,
    endorsed: items.filter((i) => i.currentStage === 'endorsed').length,
    urgentCount: items.filter((i) => i.priority === 'urgent' || i.priority === 'expedited').length,
  };

  return res.json({
    status: 'ok',
    stats,
    queue: items.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()),
  });
});

/**
 * GET /api/collaboration/courses/:courseId
 * Retrieves collaborative state (stage, audit trail, comments, presence, sign-offs)
 */
collaborationRouter.get('/courses/:courseId', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const queueItem = queueStore.get(courseId);
  const auditTrail = auditTrailStore.get(courseId) || [];
  const comments = commentsStore.get(courseId) || [];
  const presencesMap = presenceStore.get(courseId) || new Map();
  const now = Date.now();

  // Prune expired presence heartbeats (> 45s)
  const activeReviewers: ReviewerPresence[] = [];
  for (const [key, presence] of presencesMap.entries()) {
    if (now - new Date(presence.lastActiveAt).getTime() < 45000) {
      activeReviewers.push(presence);
    } else {
      presencesMap.delete(key);
    }
  }

  // Extract all formal digital signoffs
  const digitalSignOffs = auditTrail
    .filter((entry) => !!entry.digitalSignOff)
    .map((entry) => entry.digitalSignOff!);

  return res.json({
    status: 'ok',
    courseId,
    currentStage: queueItem?.currentStage || 'department_review',
    queueItem: queueItem || null,
    comments,
    auditTrail: auditTrail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    activeReviewers,
    digitalSignOffs,
  });
});

/**
 * POST /api/collaboration/courses/:courseId/submit
 * Submits or refreshes a course inside the approval queue
 */
collaborationRouter.post('/courses/:courseId/submit', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const {
    courseCode,
    courseTitle,
    department,
    creditHours,
    framework,
    leadInstructor,
    actorName,
    actorEmail,
    readinessScore,
    criticalGaps,
    notes,
  } = req.body;

  const now = new Date().toISOString();
  const existing = queueStore.get(courseId);

  const updatedQueueItem: ApprovalQueueItem = {
    id: existing?.id || `queue-${courseId}`,
    courseId,
    courseCode: courseCode || existing?.courseCode || 'OBE-CRS',
    courseTitle: courseTitle || existing?.courseTitle || 'Untitled Course',
    department: department || existing?.department || 'Faculty of Engineering & Computing',
    creditHours: Number(creditHours) || existing?.creditHours || 3,
    framework: framework || existing?.framework || 'Washington Accord (ABET EAC)',
    leadInstructor: leadInstructor || actorName || existing?.leadInstructor || 'Faculty Instructor',
    submittedAt: existing?.submittedAt || now,
    currentStage: 'department_review',
    targetStage: 'board_of_studies',
    readinessScore: Number(readinessScore) || 85,
    criticalGaps: Number(criticalGaps) || 0,
    unresolvedCommentsCount: existing?.unresolvedCommentsCount || 0,
    assignedReviewers: existing?.assignedReviewers || [
      { name: 'Prof. Elena Rostova', role: 'Program Chair', avatarColor: 'bg-blue-600 text-white', hasSignedOff: false },
      { name: 'Dr. Marcus Vance', role: 'Accreditation Reviewer', avatarColor: 'bg-purple-600 text-white', hasSignedOff: false },
      { name: 'Dr. Arthur Vance', role: 'Dean / Academic Head', avatarColor: 'bg-amber-600 text-white', hasSignedOff: false },
    ],
    lastActivityAt: now,
    daysInQueue: 1,
    priority: 'normal',
    auditLogCount: (existing?.auditLogCount || 0) + 1,
  };

  queueStore.set(courseId, updatedQueueItem);

  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courseId,
    courseCode: updatedQueueItem.courseCode,
    courseTitle: updatedQueueItem.courseTitle,
    timestamp: now,
    actorName: actorName || 'Course Author',
    actorRole: 'Faculty / Instructor',
    actorEmail,
    action: 'SUBMITTED_FOR_REVIEW',
    stage: 'department_review',
    previousStatus: 'draft',
    newStatus: 'submitted',
    decisionNote: notes || 'Course submitted for Department Curriculum Committee review.',
    readinessScoreSnapshot: updatedQueueItem.readinessScore,
  };

  const trail = auditTrailStore.get(courseId) || [];
  trail.unshift(auditEntry);
  auditTrailStore.set(courseId, trail);

  broadcastToCourse(courseId, 'queue_updated', { queueItem: updatedQueueItem, auditEntry });

  return res.status(201).json({
    status: 'success',
    message: 'Course submitted to Academic Governance Queue.',
    queueItem: updatedQueueItem,
    auditEntry,
  });
});

/**
 * POST /api/collaboration/courses/:courseId/decision
 * Records an approval decision (Approve Stage, Request Revisions, or Formal Dean/Accreditation Seal)
 */
collaborationRouter.post('/courses/:courseId/decision', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const {
    decision, // 'approve_stage' | 'request_revisions' | 'formal_seal'
    actorName,
    actorRole,
    actorEmail,
    decisionNote,
    targetSection,
    officialStatement,
    institution,
  } = req.body;

  if (!decision || !actorName || !actorRole) {
    return res.status(400).json({ error: 'Missing decision, actorName, or actorRole.' });
  }

  const now = new Date().toISOString();
  let queueItem = queueStore.get(courseId);

  if (!queueItem) {
    queueItem = {
      id: `queue-${courseId}`,
      courseId,
      courseCode: req.body.courseCode || 'CRS-OBE',
      courseTitle: req.body.courseTitle || 'Course Curriculum',
      department: 'Academic Department',
      creditHours: 3,
      framework: 'Washington Accord',
      leadInstructor: 'Faculty Lead',
      submittedAt: now,
      currentStage: 'department_review',
      targetStage: 'board_of_studies',
      readinessScore: 90,
      criticalGaps: 0,
      unresolvedCommentsCount: 0,
      assignedReviewers: [],
      lastActivityAt: now,
      daysInQueue: 1,
      priority: 'normal',
      auditLogCount: 1,
    };
  }

  const prevStage = queueItem.currentStage;
  let nextStage = prevStage;
  let actionType = 'COMMENT_POSTED';
  let newCourseStatus = 'under_review';
  let digitalSignOff = undefined;

  if (decision === 'approve_stage') {
    if (prevStage === 'department_review') {
      nextStage = 'board_of_studies';
      actionType = 'DEPARTMENT_APPROVED';
      newCourseStatus = 'ready_for_review';
    } else if (prevStage === 'board_of_studies') {
      nextStage = 'dean_approval';
      actionType = 'BOS_APPROVED';
      newCourseStatus = 'under_review';
    } else if (prevStage === 'dean_approval') {
      nextStage = 'accreditation_review';
      actionType = 'DEAN_APPROVED';
      newCourseStatus = 'approved';
    } else if (prevStage === 'accreditation_review') {
      nextStage = 'endorsed';
      actionType = 'ACCREDITATION_ENDORSED';
      newCourseStatus = 'approved';
    }

    // Generate formal digital sign-off record
    const sealHash = generateVerificationHash(queueItem.courseCode, prevStage, now, actorName);
    digitalSignOff = {
      signatoryName: actorName,
      signatoryRole: actorRole,
      signatoryEmail: actorEmail || 'signatory@university.edu',
      institution: institution || 'Faculty Academic Council',
      timestamp: now,
      stage: prevStage,
      verificationHash: sealHash,
      accreditationStandard: queueItem.framework,
      officialStatement: officialStatement || `Formally endorsed and passed at ${prevStage} stage.`,
    };
  } else if (decision === 'formal_seal') {
    nextStage = 'endorsed';
    actionType = 'DIGITAL_SIGNOFF_SEALED';
    newCourseStatus = 'approved';

    const sealHash = generateVerificationHash(queueItem.courseCode, 'endorsed', now, actorName);
    digitalSignOff = {
      signatoryName: actorName,
      signatoryRole: actorRole,
      signatoryEmail: actorEmail || 'dean@university.edu',
      institution: institution || 'Office of the Dean & Academic Council',
      timestamp: now,
      stage: 'endorsed',
      verificationHash: sealHash,
      accreditationStandard: queueItem.framework,
      officialStatement: officialStatement || 'Certified compliance with all statutory accreditation mandates. Official curriculum status SEALED.',
    };
  } else if (decision === 'request_revisions') {
    actionType = 'REVISIONS_REQUESTED';
    newCourseStatus = 'changes_requested';
  }

  // Update queue item
  queueItem.currentStage = nextStage;
  queueItem.lastActivityAt = now;
  queueItem.auditLogCount += 1;
  queueStore.set(courseId, queueItem);

  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courseId,
    courseCode: queueItem.courseCode,
    courseTitle: queueItem.courseTitle,
    timestamp: now,
    actorName,
    actorRole,
    actorEmail,
    action: actionType,
    stage: prevStage,
    previousStatus: queueItem.currentStage,
    newStatus: newCourseStatus,
    decisionNote: decisionNote || `Decision: ${decision} executed by ${actorName}.`,
    targetSection,
    readinessScoreSnapshot: queueItem.readinessScore,
    digitalSignOff,
  };

  const trail = auditTrailStore.get(courseId) || [];
  trail.unshift(auditEntry);
  auditTrailStore.set(courseId, trail);

  broadcastToCourse(courseId, 'decision_recorded', {
    queueItem,
    auditEntry,
    digitalSignOff,
    nextStage,
    newCourseStatus,
  });

  return res.json({
    status: 'success',
    message: `Decision successfully recorded in formal audit trail.`,
    queueItem,
    auditEntry,
    digitalSignOff,
    nextStage,
    newCourseStatus,
  });
});

/**
 * POST /api/collaboration/courses/:courseId/comments
 * Adds a new comment or reply to an element/section and broadcasts it
 */
collaborationRouter.post('/courses/:courseId/comments', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const {
    targetType,
    targetId,
    targetTitle,
    sectionKey,
    stepNumber,
    priority,
    authorName,
    authorRole,
    authorAvatarColor,
    category,
    content,
    suggestedChange,
  } = req.body;

  if (!authorName || !content) {
    return res.status(400).json({ error: 'Author name and content are required.' });
  }

  const now = new Date().toISOString();
  const commentList = commentsStore.get(courseId) || [];

  const newComment: CourseElementComment = {
    id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    targetType: targetType || 'Section',
    targetId: targetId || sectionKey || 'step-1-overview',
    targetTitle: targetTitle || 'Course Curriculum Section',
    sectionKey: sectionKey || 'step-1-overview',
    stepNumber: Number(stepNumber) || 1,
    priority: priority || 'medium',
    authorName,
    authorRole: authorRole || 'Accreditation Reviewer',
    authorAvatarColor: authorAvatarColor || 'bg-purple-600 text-white',
    category: category || 'Alignment & Rigor',
    content,
    status: 'open',
    suggestedChange,
    replies: [],
    createdAt: now,
  };

  commentList.unshift(newComment);
  commentsStore.set(courseId, commentList);

  // Update unresolved comments count in queue
  const queueItem = queueStore.get(courseId);
  if (queueItem) {
    queueItem.unresolvedCommentsCount = commentList.filter((c) => c.status !== 'resolved').length;
    queueItem.lastActivityAt = now;
    queueStore.set(courseId, queueItem);
  }

  // If high or critical priority, log into formal audit trail
  if (priority === 'high' || priority === 'critical') {
    const trail = auditTrailStore.get(courseId) || [];
    trail.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      courseId,
      courseCode: queueItem?.courseCode || 'CRS',
      courseTitle: queueItem?.courseTitle || 'Course Curriculum',
      timestamp: now,
      actorName: authorName,
      actorRole: authorRole || 'Accreditation Reviewer',
      action: 'COMMENT_POSTED',
      stage: queueItem?.currentStage || 'board_of_studies',
      targetSection: sectionKey,
      decisionNote: `[${priority?.toUpperCase()} PRIORITY REMARK] ${content.substring(0, 120)}...`,
    });
    auditTrailStore.set(courseId, trail);
  }

  broadcastToCourse(courseId, 'comment_added', { comment: newComment });

  return res.status(201).json({
    status: 'success',
    comment: newComment,
  });
});

/**
 * POST /api/collaboration/courses/:courseId/comments/:commentId/replies
 * Adds a reply to an existing comment
 */
collaborationRouter.post('/courses/:courseId/comments/:commentId/replies', (req: Request, res: Response) => {
  const { courseId, commentId } = req.params;
  const { authorName, authorRole, authorAvatarColor, content } = req.body;

  if (!authorName || !content) {
    return res.status(400).json({ error: 'Author name and content are required.' });
  }

  const commentList = commentsStore.get(courseId) || [];
  const comment = commentList.find((c) => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found.' });
  }

  const reply = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    authorName,
    authorRole: authorRole || 'Faculty / Instructor',
    authorAvatarColor: authorAvatarColor || 'bg-blue-600 text-white',
    content,
    createdAt: new Date().toISOString(),
  };

  comment.replies.push(reply);
  comment.updatedAt = new Date().toISOString();

  broadcastToCourse(courseId, 'reply_added', { commentId, reply });

  return res.status(201).json({
    status: 'success',
    reply,
    comment,
  });
});

/**
 * PATCH /api/collaboration/courses/:courseId/comments/:commentId/status
 * Updates comment status (e.g. resolve)
 */
collaborationRouter.patch('/courses/:courseId/comments/:commentId/status', (req: Request, res: Response) => {
  const { courseId, commentId } = req.params;
  const { status, resolverName } = req.body;

  const commentList = commentsStore.get(courseId) || [];
  const comment = commentList.find((c) => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found.' });
  }

  const now = new Date().toISOString();
  comment.status = status || 'resolved';
  comment.resolvedAt = status === 'resolved' ? now : undefined;
  comment.resolvedBy = status === 'resolved' ? (resolverName || 'Faculty Lead') : undefined;
  comment.updatedAt = now;

  // Update unresolved comments count in queue
  const queueItem = queueStore.get(courseId);
  if (queueItem) {
    queueItem.unresolvedCommentsCount = commentList.filter((c) => c.status !== 'resolved').length;
    queueItem.lastActivityAt = now;
    queueStore.set(courseId, queueItem);
  }

  broadcastToCourse(courseId, 'comment_status_updated', { commentId, status, resolverName });

  return res.json({
    status: 'success',
    comment,
  });
});

/**
 * POST /api/collaboration/courses/:courseId/presence
 * Reviewer active heartbeat
 */
collaborationRouter.post('/courses/:courseId/presence', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { id, name, role, avatarColor, currentSection } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: 'ID and name required for presence heartbeat.' });
  }

  let presencesMap = presenceStore.get(courseId);
  if (!presencesMap) {
    presencesMap = new Map();
    presenceStore.set(courseId, presencesMap);
  }

  const presence: ReviewerPresence = {
    id,
    name,
    role: role || 'Accreditation Reviewer',
    avatarColor: avatarColor || 'bg-purple-600 text-white',
    currentSection,
    courseId,
    lastActiveAt: new Date().toISOString(),
  };

  presencesMap.set(id, presence);

  return res.json({
    status: 'ok',
    presence,
    activeCount: presencesMap.size,
  });
});

/**
 * GET /api/collaboration/courses/:courseId/stream
 * Server-Sent Events (SSE) real-time streaming endpoint for multi-user collaboration
 */
collaborationRouter.get('/courses/:courseId/stream', (req: Request, res: Response) => {
  const { courseId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let clients = sseClientsStore.get(courseId);
  if (!clients) {
    clients = new Set();
    sseClientsStore.set(courseId, clients);
  }
  clients.add(res);

  // Send initial handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ courseId, connectedAt: new Date().toISOString() })}\n\n`);

  // Heartbeat keep-alive every 20 seconds
  const interval = setInterval(() => {
    try {
      res.write(`: keep-alive\n\n`);
    } catch {
      clearInterval(interval);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(interval);
    clients?.delete(res);
  });
});
