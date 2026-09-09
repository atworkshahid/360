import {
  ApprovalQueueItem,
  AuditLogEntry,
  CourseCollaborationState,
  DigitalSignOff,
  ReviewerPresence,
} from '../types/collaboration';
import { CourseElementComment, StakeholderRole } from '../types';

const API_BASE = '/api/collaboration';
const LOCAL_STORAGE_QUEUE_KEY = 'mentisera_approval_queue_v1';
const LOCAL_STORAGE_AUDIT_PREFIX = 'mentisera_audit_trail_';
const LOCAL_STORAGE_COMMENTS_PREFIX = 'mentisera_collab_comments_';

export interface DecisionPayload {
  decision: 'approve_stage' | 'request_revisions' | 'formal_seal';
  actorName: string;
  actorRole: string;
  actorEmail?: string;
  decisionNote?: string;
  targetSection?: string;
  officialStatement?: string;
  institution?: string;
  courseCode?: string;
  courseTitle?: string;
}

export interface NewCommentPayload {
  targetType?: string;
  targetId?: string;
  targetTitle?: string;
  sectionKey?: string;
  stepNumber?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  authorName: string;
  authorRole: StakeholderRole | string;
  authorAvatarColor?: string;
  category?: string;
  content: string;
  suggestedChange?: string;
}

export const CollaborationService = {
  /**
   * Fetch full approval queue across all academic stages
   */
  async getApprovalQueue(): Promise<{
    stats: {
      total: number;
      departmentReview: number;
      boardOfStudies: number;
      deanApproval: number;
      accreditationReview: number;
      endorsed: number;
      urgentCount: number;
    };
    queue: ApprovalQueueItem[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/queue`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.queue) {
        localStorage.setItem(LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(data.queue));
      }
      return data;
    } catch (err) {
      console.warn('Falling back to cached local approval queue:', err);
      const cached = localStorage.getItem(LOCAL_STORAGE_QUEUE_KEY);
      const queue: ApprovalQueueItem[] = cached ? JSON.parse(cached) : [];
      return {
        stats: {
          total: queue.length,
          departmentReview: queue.filter((q) => q.currentStage === 'department_review').length,
          boardOfStudies: queue.filter((q) => q.currentStage === 'board_of_studies').length,
          deanApproval: queue.filter((q) => q.currentStage === 'dean_approval').length,
          accreditationReview: queue.filter((q) => q.currentStage === 'accreditation_review').length,
          endorsed: queue.filter((q) => q.currentStage === 'endorsed').length,
          urgentCount: queue.filter((q) => q.priority === 'urgent' || q.priority === 'expedited').length,
        },
        queue,
      };
    }
  },

  /**
   * Get collaborative state for a specific course (stage, audit trail, comments, presence, sign-offs)
   */
  async getCourseCollaboration(courseId: string): Promise<CourseCollaborationState> {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Cache locally
      if (data.auditTrail) {
        localStorage.setItem(`${LOCAL_STORAGE_AUDIT_PREFIX}${courseId}`, JSON.stringify(data.auditTrail));
      }
      if (data.comments) {
        localStorage.setItem(`${LOCAL_STORAGE_COMMENTS_PREFIX}${courseId}`, JSON.stringify(data.comments));
      }

      return {
        courseId,
        currentStage: data.currentStage || 'department_review',
        queueItem: data.queueItem,
        comments: data.comments || [],
        auditTrail: data.auditTrail || [],
        activeReviewers: data.activeReviewers || [],
        digitalSignOffs: data.digitalSignOffs || [],
      };
    } catch (err) {
      console.warn(`Falling back to local collaboration state for course ${courseId}:`, err);
      const cachedAudit = localStorage.getItem(`${LOCAL_STORAGE_AUDIT_PREFIX}${courseId}`);
      const cachedComments = localStorage.getItem(`${LOCAL_STORAGE_COMMENTS_PREFIX}${courseId}`);

      return {
        courseId,
        currentStage: 'department_review',
        comments: cachedComments ? JSON.parse(cachedComments) : [],
        auditTrail: cachedAudit ? JSON.parse(cachedAudit) : [],
        activeReviewers: [],
        digitalSignOffs: [],
      };
    }
  },

  /**
   * Submit course into academic governance queue
   */
  async submitCourse(courseId: string, payload: {
    courseCode: string;
    courseTitle: string;
    department?: string;
    creditHours?: number;
    framework?: string;
    leadInstructor?: string;
    actorName: string;
    actorEmail?: string;
    readinessScore?: number;
    criticalGaps?: number;
    notes?: string;
  }): Promise<{ queueItem: ApprovalQueueItem; auditEntry: AuditLogEntry }> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to submit course: HTTP ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Record formal review decision (Approve Stage, Request Revisions, or Formal Seal)
   */
  async recordDecision(courseId: string, payload: DecisionPayload): Promise<{
    queueItem: ApprovalQueueItem;
    auditEntry: AuditLogEntry;
    digitalSignOff?: DigitalSignOff;
    nextStage: string;
    newCourseStatus: string;
  }> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to record decision: HTTP ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Add a real-time peer reviewer comment on a section or outcome
   */
  async addComment(courseId: string, payload: NewCommentPayload): Promise<CourseElementComment> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to post comment: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.comment;
  },

  /**
   * Add thread reply to existing comment
   */
  async addCommentReply(
    courseId: string,
    commentId: string,
    payload: { authorName: string; authorRole: string; authorAvatarColor?: string; content: string }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to reply to comment: HTTP ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Update comment status (resolve or reopen)
   */
  async updateCommentStatus(
    courseId: string,
    commentId: string,
    status: 'open' | 'in_review' | 'resolved',
    resolverName?: string
  ): Promise<CourseElementComment> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/comments/${commentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolverName }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update comment status: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.comment;
  },

  /**
   * Heartbeat for live presence
   */
  async sendPresence(courseId: string, presence: {
    id: string;
    name: string;
    role: string;
    avatarColor?: string;
    currentSection?: string;
  }): Promise<void> {
    try {
      await fetch(`${API_BASE}/courses/${courseId}/presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presence),
      });
    } catch {
      // presence heartbeat is non-blocking
    }
  },

  /**
   * Subscribe to real-time updates for a course via Server-Sent Events (SSE)
   */
  subscribeToCourse(courseId: string, onUpdate: (event: string, data: any) => void): () => void {
    if (typeof EventSource === 'undefined') {
      return () => {};
    }

    const eventSource = new EventSource(`${API_BASE}/courses/${courseId}/stream`);

    const handleEvent = (eventName: string) => (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onUpdate(eventName, parsed);
      } catch (err) {
        console.error(`Failed to parse SSE event [${eventName}]:`, err);
      }
    };

    const events = [
      'queue_updated',
      'decision_recorded',
      'comment_added',
      'reply_added',
      'comment_status_updated',
    ];

    events.forEach((evt) => {
      eventSource.addEventListener(evt, handleEvent(evt));
    });

    return () => {
      eventSource.close();
    };
  },
};
