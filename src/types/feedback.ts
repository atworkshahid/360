export type FeedbackCategory =
  | 'bug'
  | 'curriculum_obe'
  | 'feature_request'
  | 'ui_usability'
  | 'export_import'
  | 'general';

export type FeedbackSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface CourseStateSummary {
  id: string;
  code: string;
  title: string;
  level: string;
  framework: string;
  credits: number;
  status: string;
  closCount: number;
  closSummary: Array<{
    code: string;
    bloomVerb: string;
    bloomLevel: string;
    weightage: number;
    statementSnippet: string;
  }>;
  plosCount: number;
  ploMappingsCount: number;
  modulesCount: number;
  lessonsCount: number;
  activeLearningPercentage?: number;
  assessmentsCount: number;
  totalAssessmentWeightage: number;
  rubricsCount: number;
  auditScore?: number;
  auditPassedCount?: number;
  auditTotalChecks?: number;
  auditCriticalGaps: number;
  auditWarningGaps: number;
  auditTopGaps: string[];
}

export interface FeedbackDiagnostics {
  appVersion: string;
  timestamp: string;
  url: string;
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  currentView: 'dashboard' | 'creator' | 'marketing';
  activeWizardStep?: number;
  activeWorkflowMode?: 'obe10' | 'granular15';
  browserLanguage: string;
  timeZone: string;
  storageEstimateKb?: number;
  coursesInWorkspaceCount?: number;
  courseSummary?: CourseStateSummary;
  courseSnapshotJson?: string;
  consoleErrors?: string[];
}

export interface FeedbackSubmission {
  id: string;
  ticketNumber: string;
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
  createdAt: string;
  status: 'received' | 'investigating' | 'resolved';
  devNotes?: string;
}

export interface FeedbackApiResponse {
  success: boolean;
  ticketNumber: string;
  receivedAt: string;
  slaMessage: string;
  message: string;
  directEmail: string;
}
