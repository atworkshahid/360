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

export type CourseLanguage = 'English' | 'Arabic' | 'French' | 'German' | 'Spanish' | 'Urdu';

export interface LanguageOption {
  code: string;
  name: CourseLanguage;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
];

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
  prerequisiteCLOIds?: string[];
  dependentAssessmentIds?: string[];
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
  cloIds?: string[];
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
  prerequisiteAssessmentIds?: string[];
  prerequisiteCLOIds?: string[];
  scheduledWeek?: number;
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
  moduleId?: string; // Associated course module ID when leaving feedback on a specific module
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

export type CourseStatus = 'draft' | 'ready_for_review' | 'submitted' | 'changes_requested' | 'approved' | 'archived';

export type UserRole = 'admin' | 'faculty' | 'reviewer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  title?: string;
  avatar?: string;
}

export type OutcomeMappingScale = 'numeric_1_3' | 'irm';

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
  defaultDossierColorTheme?: string;
  defaultDossierPrimaryColor?: string;
  defaultDossierAccentColor?: string;
  facultySchool: string;
  department: string;
  country: string;
  academicCalendar: 'Semester' | 'Quarter' | 'Trimester' | 'Annual';
  semesterSystem: 'Fall-Spring-Summer' | 'Spring-Fall' | 'Custom';
  defaultCourseDurationWeeks: number;
  defaultLanguage: string;
  defaultMappingScale: OutcomeMappingScale;
  defaultFrameworkId: string;
  defaultBloomTaxonomyVersion: string;
}

export type FrameworkTypeBadge =
  | 'International Recognition Framework'
  | 'Accreditation Commission'
  | 'National Higher Education Framework'
  | 'Educational Framework'
  | 'Institutional Framework';

export interface Framework {
  id: string;
  name: string;
  code: string;
  type: string;
  badge: FrameworkTypeBadge;
  discipline: string;
  jurisdiction: string;
  description: string;
  outcomeModel: string;
  recommendedMappingApproach: string;
  applicableTerminology: string;
  notes: string;
  active: boolean;
}

export interface FrameworkVersion {
  id: string;
  frameworkId: string;
  versionName: string;
  effectiveDate: string;
  status: 'Active' | 'Deprecated' | 'Draft';
}

export interface FrameworkOutcome {
  id: string;
  frameworkVersionId: string;
  code: string;
  title: string;
  description: string;
  outcomeType: 'Graduate Attribute' | 'Student Outcome' | 'Program Learning Outcome' | 'General Outcome';
  sequence: number;
}

export interface FrameworkTerminology {
  id: string;
  frameworkVersionId: string;
  conceptKey: 'program_outcome' | 'student_outcome' | 'graduate_attribute' | 'course_learning_outcome';
  displayName: string;
}

export type CourseType =
  | 'Core'
  | 'Elective'
  | 'General Education'
  | 'Major'
  | 'Supporting'
  | 'Lab'
  | 'Capstone'
  | 'Other';

export interface MicroLearningUnit {
  id: string;
  unitNumber: number; // 1, 2, 3, or 4 (each week has 4 sub-topics / micro-learning units)
  title: string;
  description?: string;
  durationMinutes?: number; // e.g. 45 - 60 minutes
  bloomLevel?: BloomLevel;
  deliveryFormat?:
    | 'Interactive Lecture'
    | 'Hands-on Lab'
    | 'Self-Paced Practice'
    | 'Case Study'
    | 'Discussion & Quiz'
    | 'Problem-Solving Studio';
  isCompleted?: boolean;
}

export interface WeeklyCoursePlanItem {
  weekNumber: number;
  topic: string;
  subtopics?: string;
  /**
   * Exactly 4 sub-topics (Micro-learning Units) per instructional week
   */
  microLearningUnits?: MicroLearningUnit[];
  linkedCLOIds: string[];
  bloomLevel?: BloomLevel;
  learningActivity?: string;
  contactHours?: number;
  independentStudyHours?: number;
  requiredReading?: string;
  notes?: string;
}

export interface CourseReviewComment {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  section: string;
  comment: string;
  suggestedChanges?: string;
  decision?: 'Approve' | 'Request Changes';
  createdAt: string;
  status: 'open' | 'addressed' | 'resolved';
}

export interface CourseValidationRuleResult {
  rule: string;
  ruleTitle: string;
  severity: 'Error' | 'Warning' | 'Suggestion' | 'Passed';
  message: string;
  affectedEntity: 'Course' | 'CLO' | 'WeeklyPlan' | 'Assessment' | 'Activity' | 'Mapping';
  affectedEntityId?: string;
  recommendation: string;
  targetStep: number;
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
  // Step 1: Framework & Setup
  frameworkId?: string;
  frameworkVersionId?: string;
  accreditationFramework?: string;
  institutionName?: string;
  institutionLogo?: string; // Institutional emblem/logo (base64 data URL or web image URL)
  dossierColorTheme?: string; // e.g. 'navy' | 'emerald' | 'burgundy' | 'slate' | 'cobalt' | 'crimson' | 'amber' | 'violet' | 'custom'
  dossierPrimaryColor?: string; // Custom hex code (e.g. #1e3a8a)
  dossierAccentColor?: string; // Custom accent hex code (e.g. #3b82f6)
  frameworkValidationStatus?: 'valid' | 'missing_docs' | 'deprecated' | 'unrecognized';
  frameworkValidationMessage?: string;

  // Step 2: Course Information
  title: string;
  code: string;
  slug: string;
  language?: CourseLanguage | string;
  textDirection?: 'ltr' | 'rtl';
  category: string;
  programme: string;
  department?: string;
  instructorName?: string;
  courseCoordinator?: string;
  degreeLevel?: string;
  semester?: string;
  courseType?: CourseType;
  academicYear?: string;
  passingBenchmark?: number;
  creditHours: number;
  theoryHours?: number;
  labHours?: number;
  contactHours?: number;
  durationWeeks: number;
  modulesCount: number;
  deliveryMode: DeliveryMode;
  courseLevel: CourseLevel;
  targetLearners: string;
  prerequisites: string;
  corequisites?: string;

  // Step 3: Course Description & Purpose
  description: string;
  courseRationale?: string;
  courseAim?: string;
  courseObjectives?: string[];
  prerequisiteKnowledge?: string;
  expectedStudentProfile?: string;
  overview: string;
  learningPromise: string;
  expectedStudyTimeHours: number;
  capstoneGoal: string; // "What should the learner be capable of doing after completing this course?"

  // Course Blueprint
  blueprint: CourseBlueprint;

  // Step 4 & 5: Outcomes & Mappings
  plos: PLO[];
  clos: CLO[];
  ploMapping?: Record<string, Record<string, number>>;

  // Step 6: Weekly Course Plan
  weeklyPlan?: WeeklyCoursePlanItem[];

  // Step 7: Modules, MLOs & Activities
  modules: CourseModule[];
  mlos: MLO[];
  lessons: Lesson[];
  activities: Activity[];
  resources?: ResourceItem[]; // Associated supporting documents (syllabi, rubrics, lecture notes, lab guides)

  // Step 8: Assessments & Questions
  assessments: Assessment[];
  rubrics: Rubric[];
  evidenceRules: EvidenceRule[];

  // Step 9 & 10: Review, CQI & Versioning
  academicReview?: AcademicReview;
  cqiPlan?: CQIActionPlan;
  reviewerComments?: CourseReviewComment[];
  versionNumber?: string;
  versionChangeNote?: string;

  // Stakeholder Feedback & Element Discussions
  comments?: CourseElementComment[];

  // Metadata & Workflow Status
  status: CourseStatus;
  isTemplate?: boolean;
  completedStages?: number[];
  completionPercentage?: number;
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
  readinessScore?: number;
  passedCount?: number;
  totalChecks?: number;
  isCompliant?: boolean;
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

export type ResourceTagCategory =
  | 'Module'
  | 'Assessment'
  | 'Project'
  | 'Reference'
  | 'Accreditation'
  | 'Syllabus'
  | 'Rubric'
  | 'LabManual'
  | 'LectureNotes';

export type ResourcePreviewType =
  | 'image'
  | 'pdf'
  | 'doc'
  | 'sheet'
  | 'slides'
  | 'code'
  | 'text'
  | 'archive'
  | 'audio'
  | 'video'
  | 'link'
  | 'generic';

export interface ModuleFolder {
  id: string;
  name: string;
  moduleNumber?: number;
  description?: string;
  courseId?: string;
  courseName?: string;
  colorTheme?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description?: string;
  type: 'file' | 'link';
  url?: string; // external URL or data URL
  fileName?: string;
  fileSize?: number; // size in bytes
  fileType?: string; // mime type or extension
  previewThumbnail?: string; // Data URL or canvas/SVG thumbnail
  previewType?: ResourcePreviewType; // Formatted category of file for specialized previews
  textContentSnippet?: string; // Preview text content for text/code/csv/markdown files
  categoryTags: ResourceTagCategory[]; // 'Module' | 'Assessment' | 'Project' etc.
  customTags?: string[]; // user defined custom tags e.g. "Week 4", "Midterm Rubric"
  courseId?: string; // optional linked course/project ID, or "global"
  courseName?: string;
  moduleId?: string; // ID of the specific Module folder or undefined if root/unassigned
  moduleName?: string; // Display name of the specific Module folder
  orderIndex?: number; // Custom drag-and-drop sort order position
  uploadedAt: string; // ISO timestamp
  updatedAt?: string;
  notes?: string;
  starred?: boolean;
}

