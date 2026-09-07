export type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export type LearningDomain = 'Cognitive' | 'Psychomotor' | 'Affective';

export type DeliveryMode = 'Face-to-Face' | 'Online' | 'Blended' | 'Self-Paced';

export type CourseLevel = 'School' | 'Undergraduate' | 'Graduate' | 'Professional' | 'Training' | 'Certification';

export type PLOMappingLevel = 'Introduced' | 'Reinforced' | 'Mastered';

export type ActivityType =
  | 'Discussion'
  | 'Reflection'
  | 'Case Study'
  | 'Problem Solving'
  | 'Simulation'
  | 'Presentation'
  | 'Project'
  | 'Research Task'
  | 'Collaborative Task'
  | 'Interactive Video'
  | 'Quiz'
  | 'Matching'
  | 'Drag and Drop'
  | 'Scenario'
  | 'Practical Demonstration';

export type AssessmentType =
  | 'Quiz'
  | 'Assignment'
  | 'Project'
  | 'Presentation'
  | 'Case Study'
  | 'Portfolio'
  | 'Practical'
  | 'Discussion'
  | 'Midterm'
  | 'Midterm Assessment'
  | 'Final Assessment';

export type RubricLevelName = 'Not Achieved' | 'Developing' | 'Achieved' | 'Proficient' | 'Exemplary';

export type CLOStatus = 'Draft' | 'Validated' | 'Flagged';
export type MappingLevel = PLOMappingLevel;

export type CompletionRequirement =
  | 'read_content'
  | 'watch_video'
  | 'complete_activity'
  | 'pass_quiz'
  | 'submit_assignment'
  | 'participate_discussion'
  | 'demonstrate_skill';

export interface PLO {
  id: string;
  code: string;
  title: string;
  description: string;
}

export interface CLOQualityCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface CLOMappedPLO {
  ploId: string;
  level: PLOMappingLevel;
  rationale?: string;
}

export interface CLO {
  id: string;
  code: string; // e.g. "CLO 1"
  statement: string;
  bloomVerb: string;
  bloomLevel: BloomLevel;
  learningDomain: LearningDomain;
  competency: string;
  skills: string;
  assessmentMethod: string;
  achievementThreshold: number; // percentage, e.g. 60
  weightage: number; // percentage of overall course, e.g. 25
  status: 'Draft' | 'Validated' | 'Flagged';
  qualityScore: number; // 0 to 100
  qualityChecks: CLOQualityCheck[];
  aiSuggestion?: string;
  mappedPLOs: CLOMappedPLO[];
}

export interface MLO {
  id: string;
  code: string; // e.g. "MLO 1.1.1" or "MLO 4.2.1"
  moduleId: string;
  linkedCLOId: string;
  statement: string;
  bloomVerb: string;
  bloomLevel: BloomLevel;
  learningDomain?: LearningDomain;
  requiredActivity: string;
  assessment: string;
  evidence: string;
  studyTimeHours: number;
}

export interface LessonContent {
  text?: string;
  videoUrl?: string;
  reading?: string;
  slidesUrl?: string;
  caseStudy?: string;
  workedExample?: string;
  simulationUrl?: string;
  externalResources?: string[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  linkedMLOId: string;
  title: string;
  learningObjective: string;
  durationMins: number;
  teachingMode: string;
  content: LessonContent;
  requiredActivity: string;
  evidenceOfLearning: string;
  completionRequirements: CompletionRequirement[];
}

export interface Activity {
  id: string;
  moduleId: string;
  lessonId?: string;
  outcomeType: 'CLO' | 'MLO';
  outcomeId: string;
  title: string;
  activityType: ActivityType;
  studentActionPrompt: string;
  evidenceProduced: string;
  estimatedMins: number;
}

export interface MCQQuestion {
  id: string;
  assessmentId: string;
  questionStatement: string;
  options: [string, string, string, string];
  correctAnswerIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
  cloId: string;
  mloId: string;
  bloomLevel: BloomLevel;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  alignmentVerification?: string;
}

export interface RubricLevel {
  level: RubricLevelName;
  descriptor: string;
  pointsRange: string;
}

export interface RubricCriterion {
  id: string;
  criterionName: string;
  cloId: string;
  weight: number; // percentage
  levels: RubricLevel[];
}

export interface Rubric {
  id: string;
  title: string;
  assessmentId?: string;
  criteria: RubricCriterion[];
}

export interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  linkedCLOIds: string[];
  linkedMLOIds: string[];
  bloomLevel: BloomLevel;
  evidenceType: 'Direct' | 'Indirect';
  marks: number;
  weightage: number; // percentage of total course marks
  achievementThreshold: number; // percentage
  isSummative: boolean; // true for summative, false for formative
  directOrIndirect: 'Direct' | 'Indirect';
  questions: MCQQuestion[];
  rubricId?: string;
}

export interface EvidenceSource {
  assessmentId: string;
  componentName: string;
  weightInOutcome: number; // percentage
}

export interface EvidenceRule {
  id: string;
  outcomeId: string; // CLO id
  outcomeCode: string;
  evidenceSources: EvidenceSource[];
  minimumThresholdPct: number; // e.g. 60
  achievementRuleText: string;
  explanation: string; // Why has learner achieved this outcome?
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  description: string;
  durationWeeks: number;
  expectedStudyHours: number;
  relatedCLOIds: string[];
  resources: string[];
}

export type Module = CourseModule;
export type QuestionItem = MCQQuestion;

export interface ReviewChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export type StakeholderRole =
  | 'Faculty / Instructor'
  | 'Program Chair'
  | 'Accreditation Reviewer'
  | 'Industry Advisory'
  | 'External Examiner'
  | 'Instructional Designer'
  | 'Student Representative';

export type CommentCategory =
  | 'General'
  | 'Alignment & Rigor'
  | 'Cognitive Level'
  | 'Clarity & Wording'
  | 'Workload & Feasibility'
  | 'Accreditation Standards'
  | 'Commendation';

export type CommentStatus = 'open' | 'in_review' | 'resolved';

export interface CommentReply {
  id: string;
  authorName: string;
  authorRole: StakeholderRole;
  authorAvatarColor?: string;
  content: string;
  createdAt: string;
}

export type CommentTargetType =
  | 'CLO'
  | 'Assessment'
  | 'Rubric'
  | 'Module'
  | 'Lesson'
  | 'Activity'
  | 'PLO'
  | 'Philosophy'
  | 'Question'
  | 'Evidence'
  | 'General'
  | 'Section';

export interface CourseElementComment {
  id: string;
  targetType: CommentTargetType;
  targetId: string; // e.g. CLO id, Assessment id, or sectionKey
  targetTitle: string; // e.g. "CLO 1: Analyze..." or "Course Philosophy Statement"
  sectionKey?: string; // e.g. "step-1-overview", "step-2-philosophy", "step-3-clos"
  stepNumber?: number; // Step number 1-15
  priority?: 'low' | 'medium' | 'high' | 'critical';
  authorName: string;
  authorRole: StakeholderRole;
  authorAvatarColor?: string;
  category: CommentCategory;
  content: string;
  status: CommentStatus;
  suggestedChange?: string;
  appliedSuggestion?: boolean;
  replies: CommentReply[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AcademicReview {
  status: 'Pending' | 'Approved' | 'Revision Required';
  reviewerName: string;
  reviewerRole: string;
  reviewDate: string;
  feedback: string;
  checklistItems: ReviewChecklistItem[];
  institution?: string;
  outcomeAlignmentScore?: number;
  comments?: string;
  recommendation?: 'Approved' | 'Revision Required' | 'Conditional Approval';
}

export interface CQIActionPlan {
  cohortTerm: string;
  attainmentReflection: string;
  identifiedDeficiencies: string;
  plannedInterventions: string;
  targetMetric: string;
  cyclePeriod?: string;
  identifiedGaps?: string[];
  interventionStrategy?: string;
  responsibleLead?: string;
  timelineWeeks?: number;
  targetMetricGoal?: string;
}

export interface CourseBlueprint {
  purpose: string;
  learnerNeed: string;
  targetCompetencies: string[];
  requiredSkills: string[];
  assessmentStrategy: string;
}

export interface Course {
  id: string;
  // Step 1: Course Setup
  title: string;
  code: string;
  slug: string;
  category: string;
  programme: string;
  department?: string;
  instructorName?: string;
  passingBenchmark?: number;
  creditHours: number;
  durationWeeks: number;
  modulesCount: number;
  deliveryMode: DeliveryMode;
  courseLevel: CourseLevel;
  targetLearners: string;
  prerequisites: string;
  description: string;
  overview: string;
  learningPromise: string;
  expectedStudyTimeHours: number;
  capstoneGoal: string; // "What should the learner be capable of doing after completing this course?"

  // Step 2: Course Blueprint
  blueprint: CourseBlueprint;

  // Step 3 & 4: Outcomes & Mappings
  plos: PLO[];
  clos: CLO[];

  // Step 5 & 6: Modules & MLOs
  modules: CourseModule[];
  mlos: MLO[];

  // Step 7: Lessons
  lessons: Lesson[];

  // Step 8: Activities
  activities: Activity[];

  // Step 9 & 10: Assessments & Questions
  assessments: Assessment[];

  // Step 11: Rubrics
  rubrics: Rubric[];

  // Step 12: Evidence Rules
  evidenceRules: EvidenceRule[];

  // Step 15: Review & CQI
  academicReview?: AcademicReview;
  cqiPlan?: CQIActionPlan;

  // Stakeholder Feedback & Element Discussions
  comments?: CourseElementComment[];

  // Metadata
  status: 'draft' | 'submitted' | 'approved';
  isTemplate?: boolean;
  completedStages?: number[];
  updatedAt: string;
  createdAt: string;
}

export interface AuditGap {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  title: string;
  message: string;
  description?: string;
  recommendation: string;
  targetStep: number;
  stageNumber?: number;
}

export type GapIssue = AuditGap;

export interface CourseAuditReport {
  healthScore: number; // 0 to 100
  completionPercentage: number; // 0 to 100
  categoryScores: {
    courseInfo: number;
    cloQuality: number;
    cloPloMapping: number;
    mloAlignment: number;
    lessonAlignment: number;
    assessmentCoverage: number;
    rubricAlignment: number;
    evidenceCoverage: number;
  };
  subscores?: {
    courseInfo: number;
    cloQuality: number;
    cloPloMapping: number;
    mloAlignment: number;
    lessonAlignment: number;
    assessmentCoverage: number;
    rubricAlignment: number;
    evidenceCoverage: number;
  };
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  gaps: AuditGap[];
  issues?: AuditGap[];
  recommendations: string[];
}

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  isSystem?: boolean;
  courseData: Course;
}

export type VersionSaveType = 'autosave' | 'manual' | 'restore';

export interface CourseVersion {
  id: string;
  courseId: string;
  versionNumber: number;
  timestamp: string;
  saveType: VersionSaveType;
  label?: string;
  summary: {
    title: string;
    code: string;
    closCount: number;
    modulesCount: number;
    lessonsCount: number;
    assessmentsCount: number;
    rubricsCount: number;
    healthScore?: number;
    status: string;
  };
  course: Course;
  changesSummary?: string[];
}

