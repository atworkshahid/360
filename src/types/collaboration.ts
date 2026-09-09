import { StakeholderRole, CourseElementComment } from '../types';

export type ApprovalStage =
  | 'department_review'
  | 'board_of_studies'
  | 'dean_approval'
  | 'accreditation_review'
  | 'endorsed';

export type ApprovalActionType =
  | 'SUBMITTED_FOR_REVIEW'
  | 'DEPARTMENT_APPROVED'
  | 'BOS_APPROVED'
  | 'DEAN_APPROVED'
  | 'ACCREDITATION_ENDORSED'
  | 'REVISIONS_REQUESTED'
  | 'COMMENT_POSTED'
  | 'COMMENT_RESOLVED'
  | 'REVISION_APPLIED'
  | 'DIGITAL_SIGNOFF_SEALED';

export interface DigitalSignOff {
  signatoryName: string;
  signatoryRole: string;
  signatoryEmail: string;
  institution: string;
  timestamp: string;
  stage: ApprovalStage;
  verificationHash: string;
  accreditationStandard?: string;
  officialStatement: string;
}

export interface AuditLogEntry {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  timestamp: string;
  actorName: string;
  actorRole: StakeholderRole | 'Dean / Academic Head' | 'System';
  actorEmail?: string;
  action: ApprovalActionType;
  stage: ApprovalStage;
  previousStatus?: string;
  newStatus?: string;
  decisionNote?: string;
  targetSection?: string;
  readinessScoreSnapshot?: number;
  digitalSignOff?: DigitalSignOff;
}

export interface ReviewerPresence {
  id: string;
  name: string;
  role: StakeholderRole | 'Dean / Academic Head';
  avatarColor: string;
  currentSection?: string;
  courseId: string;
  lastActiveAt: string;
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
  currentStage: ApprovalStage;
  targetStage: ApprovalStage;
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

export interface CourseCollaborationState {
  courseId: string;
  currentStage: ApprovalStage;
  queueItem?: ApprovalQueueItem;
  comments: CourseElementComment[];
  auditTrail: AuditLogEntry[];
  activeReviewers: ReviewerPresence[];
  digitalSignOffs: DigitalSignOff[];
}
