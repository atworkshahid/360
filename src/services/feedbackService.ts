import { Course } from '../types';
import { calculateCourseAudit } from '../utils/obeCalculator';
import {
  FeedbackCategory,
  FeedbackSeverity,
  FeedbackDiagnostics,
  FeedbackSubmission,
  CourseStateSummary,
  FeedbackApiResponse,
} from '../types/feedback';

const FEEDBACK_STORAGE_KEY = 'mentisera_obe360_feedback_submissions';
const USER_NAME_KEY = 'mentisera_feedback_user_name';
const USER_EMAIL_KEY = 'mentisera_feedback_user_email';

// Capture recent console errors in memory
const capturedErrors: string[] = [];
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    try {
      const msg = args
        .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
        .join(' ');
      capturedErrors.push(`[${new Date().toISOString()}] ${msg}`);
      if (capturedErrors.length > 20) {
        capturedErrors.shift();
      }
    } catch {
      // ignore
    }
    originalConsoleError.apply(console, args);
  };
}

/**
 * Extracts a concise, structured CourseStateSummary from a Course object
 */
export function extractCourseSummary(course: Course): CourseStateSummary {
  const audit = calculateCourseAudit(course);

  // Compute total assessment weightage
  const totalAssessmentWeightage = (course.assessments || []).reduce(
    (sum, a) => sum + (Number(a.weightage) || 0),
    0
  );

  // Compute active learning percentage if lessons present
  let activeLearningPercentage: number | undefined = undefined;
  const lessons = course.lessons || [];
  if (lessons.length > 0) {
    const activeLessons = lessons.filter(
      (l) =>
        l.teachingMode === 'Interactive Seminar' ||
        l.teachingMode === 'Hands-on Lab' ||
        l.teachingMode === 'Flipped Classroom' ||
        /active|pbl|lab|socratic|project|presentation|case study/i.test(l.title || '')
    );
    activeLearningPercentage = Math.round((activeLessons.length / lessons.length) * 100);
  }

  // Summarize CLOs
  const closSummary = (course.clos || []).map((clo) => ({
    code: clo.code || 'CLO',
    bloomVerb: clo.bloomVerb || 'Analyze',
    bloomLevel: clo.bloomLevel || 'Analyze',
    weightage: clo.weightage || 0,
    statementSnippet: (clo.statement || '').slice(0, 100) + (clo.statement && clo.statement.length > 100 ? '...' : ''),
  }));

  // Count total mapped PLOs
  const ploMappingsCount = (course.clos || []).reduce(
    (acc, clo) => acc + (clo.mappedPLOs ? clo.mappedPLOs.length : 0),
    0
  );

  // Top gaps from audit
  const gaps = audit.gaps || audit.issues || [];
  const auditTopGaps = gaps.slice(0, 5).map((g) => `[${g.severity ? g.severity.toUpperCase() : 'GAP'}] ${g.title}: ${g.message || g.description || g.recommendation}`);

  return {
    id: course.id,
    code: course.code,
    title: course.title,
    level: course.courseLevel || 'Undergraduate',
    framework: course.frameworkId || 'Standard OBE',
    credits: course.creditHours,
    status: course.status || 'draft',
    closCount: (course.clos || []).length,
    closSummary,
    plosCount: (course.plos || []).length,
    ploMappingsCount,
    modulesCount: (course.modules || []).length,
    lessonsCount: lessons.length,
    activeLearningPercentage,
    assessmentsCount: (course.assessments || []).length,
    totalAssessmentWeightage,
    rubricsCount: (course.rubrics || []).length,
    auditScore: audit.healthScore,
    auditPassedCount: audit.passedCount,
    auditTotalChecks: audit.totalChecks,
    auditCriticalGaps: audit.criticalCount,
    auditWarningGaps: audit.highCount + audit.mediumCount,
    auditTopGaps,
  };
}

/**
 * Builds complete diagnostics payload including client environment,
 * course state, and storage metrics.
 */
export function buildDiagnostics(
  course: Course | null,
  options: {
    includeCourseSnapshot?: boolean;
    includeSystemTelemetry?: boolean;
    currentView?: 'dashboard' | 'creator' | 'marketing';
    activeWizardStep?: number;
    activeWorkflowMode?: 'obe10' | 'granular15';
  } = {}
): FeedbackDiagnostics {
  const isBrowser = typeof window !== 'undefined';
  const includeSnapshot = options.includeCourseSnapshot !== false;
  const includeTelemetry = options.includeSystemTelemetry !== false;

  let storageEstimateKb: number | undefined;
  let coursesInWorkspaceCount: number | undefined;

  if (isBrowser) {
    try {
      const stored = localStorage.getItem('mentisera_obe360_courses_v1');
      if (stored) {
        storageEstimateKb = Math.round(new Blob([stored]).size / 1024);
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          coursesInWorkspaceCount = parsed.length;
        }
      }
    } catch {
      // ignore
    }
  }

  const courseSummary = course ? extractCourseSummary(course) : undefined;
  let courseSnapshotJson: string | undefined = undefined;

  if (course && includeSnapshot) {
    try {
      courseSnapshotJson = JSON.stringify(course, null, 2);
    } catch {
      courseSnapshotJson = '{"error": "Failed to serialize course data"}';
    }
  }

  return {
    appVersion: 'v2.8.0 (OBE360 Enterprise)',
    timestamp: new Date().toISOString(),
    url: isBrowser ? window.location.href : 'server',
    userAgent: includeTelemetry && isBrowser ? navigator.userAgent : 'Anonymized',
    screenResolution:
      includeTelemetry && isBrowser
        ? `${window.screen.width}x${window.screen.height} (Color: ${window.screen.colorDepth}-bit)`
        : 'Anonymized',
    viewportSize:
      includeTelemetry && isBrowser
        ? `${window.innerWidth}x${window.innerHeight}`
        : 'Anonymized',
    devicePixelRatio: isBrowser ? window.devicePixelRatio || 1 : 1,
    currentView: options.currentView || 'creator',
    activeWizardStep: options.activeWizardStep,
    activeWorkflowMode: options.activeWorkflowMode || 'obe10',
    browserLanguage: isBrowser ? navigator.language : 'en-US',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    storageEstimateKb,
    coursesInWorkspaceCount,
    courseSummary,
    courseSnapshotJson,
    consoleErrors: capturedErrors.length > 0 ? [...capturedErrors] : undefined,
  };
}

/**
 * Submits feedback directly to development team API and saves in localStorage
 */
export async function submitFeedback(payload: {
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  includeCourseSnapshot: boolean;
  includeSystemTelemetry: boolean;
  diagnostics: FeedbackDiagnostics;
}): Promise<{ submission: FeedbackSubmission; apiResponse?: FeedbackApiResponse }> {
  // Save user name & email for next time
  if (typeof window !== 'undefined') {
    if (payload.userName) localStorage.setItem(USER_NAME_KEY, payload.userName);
    if (payload.userEmail) localStorage.setItem(USER_EMAIL_KEY, payload.userEmail);
  }

  const fallbackTicketNumber = `OBE-TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  let ticketNumber = fallbackTicketNumber;
  let apiResponse: FeedbackApiResponse | undefined = undefined;

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      apiResponse = await res.json();
      if (apiResponse && apiResponse.ticketNumber) {
        ticketNumber = apiResponse.ticketNumber;
      }
    }
  } catch (err) {
    console.warn('Direct feedback API dispatch failed, using offline record:', err);
  }

  const submission: FeedbackSubmission = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ticketNumber,
    category: payload.category,
    severity: payload.severity,
    userName: payload.userName || 'Anonymous Faculty Member',
    userEmail: payload.userEmail || 'no-reply@mentisera.org',
    subject: payload.subject,
    description: payload.description,
    stepsToReproduce: payload.stepsToReproduce,
    expectedBehavior: payload.expectedBehavior,
    actualBehavior: payload.actualBehavior,
    includeCourseSnapshot: payload.includeCourseSnapshot,
    includeSystemTelemetry: payload.includeSystemTelemetry,
    diagnostics: payload.diagnostics,
    createdAt: new Date().toISOString(),
    status: 'received',
  };

  // Save to localStorage history
  saveFeedbackToHistory(submission);

  return { submission, apiResponse };
}

/**
 * Retrieve saved feedback history from localStorage
 */
export function getFeedbackHistory(): FeedbackSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save feedback submission to localStorage history
 */
function saveFeedbackToHistory(submission: FeedbackSubmission): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getFeedbackHistory();
    const updated = [submission, ...current.slice(0, 49)]; // keep latest 50
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save feedback history:', err);
  }
}

/**
 * Delete a submission from history
 */
export function deleteFeedbackFromHistory(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getFeedbackHistory();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Clear all feedback history
 */
export function clearAllFeedbackHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Retrieve saved user info
 */
export function getSavedUserInfo(): { name: string; email: string } {
  if (typeof window === 'undefined') return { name: '', email: '' };
  return {
    name: localStorage.getItem(USER_NAME_KEY) || '',
    email: localStorage.getItem(USER_EMAIL_KEY) || '',
  };
}

/**
 * Formats a mailto link with prefilled subject and body
 */
export function generateMailtoLink(submission: Partial<FeedbackSubmission>): string {
  const to = 'dev-team@mentisera.org';
  const subject = encodeURIComponent(
    `[OBE360 ${submission.category ? submission.category.toUpperCase() : 'FEEDBACK'}] ${submission.subject || 'Course Issue Report'} (${submission.ticketNumber || 'New'})`
  );

  const courseInfo = submission.diagnostics?.courseSummary
    ? `\n--- ACTIVE COURSE CONTEXT ---
Course: ${submission.diagnostics.courseSummary.code} - ${submission.diagnostics.courseSummary.title}
Framework: ${submission.diagnostics.courseSummary.framework} | Credits: ${submission.diagnostics.courseSummary.credits}
Audit Score: ${submission.diagnostics.courseSummary.auditScore ?? 'N/A'}%
CLOs: ${submission.diagnostics.courseSummary.closCount} | Modules: ${submission.diagnostics.courseSummary.modulesCount}`
    : '';

  const body = encodeURIComponent(`Hello MENTISERA Engineering Team,

Ticket Number: ${submission.ticketNumber || 'Pending'}
Severity: ${submission.severity || 'medium'}
Category: ${submission.category || 'general'}
Reported by: ${submission.userName || 'Faculty'} <${submission.userEmail || ''}>

DESCRIPTION:
${submission.description || ''}

${submission.stepsToReproduce ? `STEPS TO REPRODUCE:\n${submission.stepsToReproduce}\n` : ''}
${submission.expectedBehavior ? `EXPECTED BEHAVIOR:\n${submission.expectedBehavior}\n` : ''}
${submission.actualBehavior ? `ACTUAL BEHAVIOR:\n${submission.actualBehavior}\n` : ''}
${courseInfo}

--- ENVIRONMENT TELEMETRY ---
App Version: ${submission.diagnostics?.appVersion || 'v2.8.0'}
URL: ${submission.diagnostics?.url || ''}
Timestamp: ${submission.diagnostics?.timestamp || new Date().toISOString()}
Screen: ${submission.diagnostics?.screenResolution || 'N/A'}

Thank you!`);

  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/**
 * Triggers a file download of the diagnostics JSON
 */
export function downloadDiagnosticsFile(diagnostics: FeedbackDiagnostics, courseCode?: string): void {
  try {
    const jsonStr = JSON.stringify(diagnostics, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const cleanCode = (courseCode || 'workspace').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `obe360-diagnostics-${cleanCode}-${timestamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download diagnostics JSON:', err);
  }
}
