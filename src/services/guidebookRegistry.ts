import { jsPDF } from 'jspdf';
import {
  generateFrameworkGuidebookBlob,
  downloadFrameworkGuidebookPDF,
  GuidebookPdfOptions,
} from '../utils/frameworkGuidebookPdf';
import { getFrameworkGuideline } from '../data/frameworkGuidelines';
import { INITIAL_FRAMEWORKS } from '../data/frameworksData';

export type GuidebookCategory = 'international' | 'accreditation' | 'national' | 'institutional';

export interface GuidebookChapter {
  id: string;
  number: string;
  title: string;
  stageKey?: string;
  stageLabel?: string;
  summary: string;
  requirements: string[];
  alignmentRules: string[];
  exemplars: Array<{
    title: string;
    text: string;
    rationale: string;
  }>;
  pitfalls: string[];
}

export interface GuidebookOutcomeItem {
  code: string;
  title: string;
  description: string;
  bloomsLevel?: string;
}

export interface FrameworkGuidebookEntry {
  id: string;
  code: string;
  name: string;
  title: string;
  governingBody: string;
  jurisdiction: string;
  category: GuidebookCategory;
  categoryLabel: string;
  edition: string;
  documentRef: string;
  publishedYear: string;
  pageCount: number;
  description: string;
  outcomeModel: string;
  accreditationScope: string;
  principles: string[];
  keyOutcomes: GuidebookOutcomeItem[];
  chapters: GuidebookChapter[];
  externalDocUrl?: string;
  getPdfBlob: (options?: GuidebookPdfOptions) => {
    doc: jsPDF;
    blob: Blob;
    blobUrl: string;
    fileName: string;
  };
  downloadPdf: (options?: GuidebookPdfOptions) => void;
}

// ---------------------------------------------------------------------------
// Registry Data Definitions
// ---------------------------------------------------------------------------

const BASE_REGISTRY_ENTRIES: Omit<FrameworkGuidebookEntry, 'getPdfBlob' | 'downloadPdf'>[] = [
  {
    id: 'fw-abet-eac',
    code: 'ABET-EAC',
    name: 'ABET EAC (Engineering Accreditation Commission)',
    title: 'ABET EAC Criteria for Accrediting Engineering Programs Guidebook',
    governingBody: 'Accreditation Board for Engineering and Technology (ABET)',
    jurisdiction: 'United States & 35+ Partner Nations Globally',
    category: 'accreditation',
    categoryLabel: 'Accreditation Commission Standard',
    edition: '2024-2026 Criteria Cycle',
    documentRef: 'ABET Criterion 3 (SO 1-7) & Criterion 4 Manual',
    publishedYear: '2024',
    pageCount: 22,
    description:
      'The international gold standard for engineering degree accreditation. Centered around Criterion 3 (Student Outcomes 1 through 7) and Criterion 4 (Continuous Improvement), mandating rigorous direct evidence, complex engineering problem solving, and iterative quality feedback loops.',
    outcomeModel: 'Student Outcomes (SO 1 to 7)',
    accreditationScope: 'Baccalaureate Engineering Degree Programs',
    principles: [
      'Direct assessment using student work samples rather than course grades',
      'Complex Engineering Problem (CEP) solving required in Outcome 1 and Outcome 2',
      'Explicit ethical, professional, and societal impact evaluations (Outcome 4)',
      'Documented Continuous Improvement loop with measurable CQI actions (Criterion 4)',
    ],
    keyOutcomes: [
      { code: 'SO 1', title: 'Complex Problem Solving', description: 'Identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics.', bloomsLevel: 'C4-C5 Analyzing & Evaluating' },
      { code: 'SO 2', title: 'Engineering Design', description: 'Apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors.', bloomsLevel: 'C6 Creating' },
      { code: 'SO 3', title: 'Communication', description: 'Communicate effectively with a range of audiences in written, oral, and graphical formats.', bloomsLevel: 'A3-A4 Valuing' },
      { code: 'SO 4', title: 'Ethical & Professional Responsibility', description: 'Recognize ethical and professional responsibilities in engineering situations and make informed judgments.', bloomsLevel: 'A3-A5 Internalizing' },
      { code: 'SO 5', title: 'Teamwork & Collaborative Leadership', description: 'Function effectively on a team whose members together provide leadership, create a collaborative and inclusive environment, and establish goals.', bloomsLevel: 'A4 Organizing' },
      { code: 'SO 6', title: 'Experimentation & Data Analysis', description: 'Develop and conduct appropriate experimentation, analyze and interpret data, and use engineering judgment to draw conclusions.', bloomsLevel: 'C5 Evaluating' },
      { code: 'SO 7', title: 'Independent Learning', description: 'Acquire and apply new knowledge as needed, using appropriate learning strategies.', bloomsLevel: 'C4 Analyzing' },
    ],
    chapters: [
      {
        id: 'abet-ch1',
        number: '1',
        title: 'Executive Accreditation Philosophy & Criterion 3 Overview',
        stageKey: 'step_framework',
        stageLabel: 'Step 01: Framework Selection',
        summary: 'Foundational philosophy of ABET EAC accreditation, Criterion 3 definitions, and evidence expectations.',
        requirements: [
          'Design course with explicit alignment to Criterion 3 Student Outcomes (SO 1 through 7).',
          'Ensure the course documentation defines measurable performance indicators for each mapped SO.',
          'Maintain a transparent assessment rubric with 3 or 4 performance tiers.',
        ],
        alignmentRules: [
          'Every CLO mapped to an ABET SO must have a direct assessment artifact (exam question, project milestone, lab report).',
          'Course grades cannot be used as substitute evidence for SO attainment.',
        ],
        exemplars: [
          {
            title: 'Exemplar SO1-Aligned CLO',
            text: 'Formulate dynamic state-space equations for multi-degree-of-freedom mechanical systems using Lagrange principles and evaluate transient response stability.',
            rationale: 'Demonstrates deep complex problem solving (SO1) using higher-order Bloom level (C4/C5).',
          },
        ],
        pitfalls: [
          'Claiming SO1 coverage with simple plug-and-chug formula drills.',
          'Using aggregate course letter grades (e.g. 80% passing) instead of itemized rubric evidence.',
        ],
      },
      {
        id: 'abet-ch2',
        number: '2',
        title: 'CLO Formulation & Action Verb Rigor',
        stageKey: 'step_clos',
        stageLabel: 'Step 04: CLO Formulation',
        summary: 'Formulating observable, measurable Course Learning Outcomes aligned with ABET cognitive rigor.',
        requirements: [
          'Keep active CLO count between 3 and 5 to ensure meaningful assessment and evidence collection.',
          'Use active Bloom action verbs (Formulate, Design, Synthesize, Evaluate, Measure). Never use vague verbs like "Understand" or "Know".',
          'Explicitly specify the technical condition and performance standard in each CLO.',
        ],
        alignmentRules: [
          'Design-focused courses must address Outcome 2 with genuine constraints (budget, safety, sustainability).',
          'Laboratory courses must prioritize Outcome 6 with error analysis and empirical validation.',
        ],
        exemplars: [
          {
            title: 'Exemplar Design CLO (SO2)',
            text: 'Design a continuous-flow chemical reactor meeting EPA effluent emission thresholds and OSHA workplace safety limits within a $50,000 capital expenditure budget.',
            rationale: 'Includes explicit multi-faceted realistic constraints matching ABET Criterion 3 Outcome 2.',
          },
        ],
        pitfalls: [
          'Writing vague outcomes like "Student will learn about thermodynamics".',
          'Having more than 7 CLOs, causing assessment fatigue and shallow evidence collection.',
        ],
      },
      {
        id: 'abet-ch3',
        number: '3',
        title: 'SO Matrix Mapping & Weight Distribution',
        stageKey: 'step_plo_mapping',
        stageLabel: 'Step 05: Outcome Mapping Matrix',
        summary: 'Direct mapping of CLOs to ABET Student Outcomes with 3-tier cognitive intensity weighting.',
        requirements: [
          'Assign mapping weight (1 = Introductory/Low, 2 = Intermediate/Medium, 3 = Mastery/High).',
          'Provide clear alignment rationale for each assigned correlation weight.',
          'Verify that no mapped SO is left without at least one Medium or High correlation CLO.',
        ],
        alignmentRules: [
          'Every High (3) correlation requires both formative practice and summative assessment evidence.',
          'Do not over-map: a single CLO should not claim to map to more than 2 distinct Student Outcomes.',
        ],
        exemplars: [
          {
            title: 'Exemplar Mapping Rationale',
            text: 'CLO 2 maps to ABET SO 2 at High (Level 3) intensity because students spend 6 weeks executing the capstone prototype design against ASME Section VIII standards.',
            rationale: 'Connects curriculum time allocation directly to accreditation criteria.',
          },
        ],
        pitfalls: [
          'Mapping every CLO to all 7 outcomes (the "spray and pray" anti-pattern).',
        ],
      },
      {
        id: 'abet-ch4',
        number: '4',
        title: 'Assessment Evidence & Criterion 4 CQI Loop',
        stageKey: 'step_assessments',
        stageLabel: 'Step 08: Assessment Plan',
        summary: 'Designing rubric-graded direct assessments, calculating attainment percentages, and closing the quality loop.',
        requirements: [
          'Establish a minimum attainment benchmark (typically 70% of students scoring >= 70% on rubric).',
          'Design itemized assessment tasks that isolate individual outcomes from broader exam grades.',
          'Formulate actionable, curriculum-level CQI improvements based on attainment deficits.',
        ],
        alignmentRules: [
          'Rubrics must feature distinct criteria with 4 performance levels (Exemplary, Proficient, Developing, Unsatisfactory).',
          'CQI plans must identify root cause (e.g., prerequisite gaps) and state measurable intervention targets.',
        ],
        exemplars: [
          {
            title: 'Exemplar CQI Action Item',
            text: 'Fall 2025 attainment on SO 6 fell to 62% due to noise calibration errors in Lab 4. For Spring 2026, a mandatory 30-minute sensor calibration tutorial is instituted prior to Week 5 data collection.',
            rationale: 'Pinpoints specific root cause and introduces an actionable, verifiable instructional intervention.',
          },
        ],
        pitfalls: [
          'Submitting generic CQI statements such as "Will teach better next semester".',
          'Failing to keep actual student work samples (high, medium, low) for ABET program evaluators.',
        ],
      },
    ],
  },
  {
    id: 'fw-washington-accord',
    code: 'WA-ENG',
    name: 'Washington Accord-aligned Engineering OBE',
    title: 'Washington Accord Graduate Attributes & Professional Competencies Guidebook',
    governingBody: 'International Engineering Alliance (IEA)',
    jurisdiction: '24 Signatory Nations (US, UK, Canada, Australia, Japan, Pakistan, etc.)',
    category: 'international',
    categoryLabel: 'International Recognition Accord',
    edition: 'GAPC v4 Standard Edition',
    documentRef: 'IEA Reference GAPC-WA-2021/2026',
    publishedYear: '2021',
    pageCount: 20,
    description:
      'The multi-lateral international treaty establishing substantial equivalence of professional engineering qualifications worldwide. Governed by 12 Graduate Attributes (WA1-WA12), Complex Engineering Problems (CEP) criteria (WP1-WP7), and Knowledge Profiles (WK1-WK8).',
    outcomeModel: 'Graduate Attributes (WA1 to WA12) / Program Learning Outcomes',
    accreditationScope: '4-Year Professional Engineering (B.Eng / B.Sc / B.Tech) Degrees',
    principles: [
      'Substantial equivalence of engineering graduates across international borders',
      'Complex Engineering Problem (CEP) must be verified through at least 2 distinct CEP attributes',
      'Knowledge profile (WK1-WK8) must support deep mathematical and engineering science reasoning',
      'Demonstrated sustainability, United Nations SDGs, and life-cycle environmental impact consideration',
    ],
    keyOutcomes: [
      { code: 'WA1', title: 'Engineering Knowledge', description: 'Apply knowledge of mathematics, natural science, computing, engineering fundamentals and an engineering specialization as specified in WK1 to WK4 to develop solution to complex engineering problems.', bloomsLevel: 'C3-C4 Applying & Analyzing' },
      { code: 'WA2', title: 'Problem Analysis', description: 'Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions with research-based knowledge (WK1 to WK4).', bloomsLevel: 'C4-C5 Analyzing & Evaluating' },
      { code: 'WA3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems and design system components or processes that meet specified needs with appropriate consideration for public health and safety.', bloomsLevel: 'C6 Creating' },
      { code: 'WA4', title: 'Investigation', description: 'Conduct investigations of complex problems using research-based knowledge (WK8) and research methods including design of experiments, analysis and interpretation of data.', bloomsLevel: 'C5-C6 Evaluating' },
      { code: 'WA5', title: 'Modern Tool Usage', description: 'Create, select and apply appropriate techniques, resources, and modern engineering and IT tools, including prediction and modelling, to complex engineering problems with an understanding of the limitations (WK6).', bloomsLevel: 'C3-C4 Applying' },
      { code: 'WA6', title: 'The Engineer and the World', description: 'Analyze and evaluate sustainable development impacts to: society, the economy, sustainability, health and safety, legal frameworks, and the environment.', bloomsLevel: 'C5 Evaluating' },
      { code: 'WA7', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics, responsibilities, and norms of engineering practice; adhere to relevant national and international laws.', bloomsLevel: 'A3-A5 Internalizing' },
      { code: 'WA8', title: 'Individual and Collaborative Teamwork', description: 'Function effectively as an individual, and as a member or leader in diverse and multi-disciplinary teams.', bloomsLevel: 'A4 Organizing' },
      { code: 'WA9', title: 'Communication', description: 'Communicate effectively and inclusively on complex engineering activities with the engineering community and society at large.', bloomsLevel: 'A3 Valuing' },
      { code: 'WA10', title: 'Project Management and Finance', description: 'Apply knowledge and understanding of engineering management principles and economic decision-making and apply these to one’s own work.', bloomsLevel: 'C3 Applying' },
      { code: 'WA11', title: 'Life-Long Learning', description: 'Recognize the need for, and have the preparation and ability for independent and life-long learning in the broadest context of technological change.', bloomsLevel: 'A5 Characterizing' },
      { code: 'WA12', title: 'Engineering Specialization', description: 'Synthesize knowledge and apply advanced disciplinary principles to address emerging technological challenges.', bloomsLevel: 'C6 Creating' },
    ],
    chapters: [
      {
        id: 'wa-ch1',
        number: '1',
        title: 'Washington Accord Philosophy & Complex Engineering Problems (CEP)',
        stageKey: 'step_framework',
        stageLabel: 'Step 01: Framework Selection',
        summary: 'Understanding IEA GAPC graduate attributes and the mandatory CEP problem profile test.',
        requirements: [
          'Verify that at least one upper-division course learning outcome triggers Complex Engineering Problem (CEP) characteristics.',
          'CEP requires: no obvious solution, involves in-depth engineering fundamentals (WK1-WK4), and involves wide-ranging conflicting issues.',
        ],
        alignmentRules: [
          'Courses claiming WA2, WA3, or WA4 must incorporate an explicit CEP scenario in their assessment tasks.',
        ],
        exemplars: [
          {
            title: 'Exemplar CEP Scenario',
            text: 'Analyze thermal fatigue cracking in high-pressure steam turbines operating with intermittent solar-thermal steam injection, addressing conflicting thermodynamic efficiency versus blade creep life.',
            rationale: 'Meets WP1 (in-depth fundamentals), WP2 (conflicting issues), and WP3 (no obvious analytical solution).',
          },
        ],
        pitfalls: [
          'Assuming standard textbook homework problems qualify as Complex Engineering Problems.',
        ],
      },
      {
        id: 'wa-ch2',
        number: '2',
        title: 'Constructive Alignment: CLO Formulation with Knowledge Profiles (WK)',
        stageKey: 'step_clos',
        stageLabel: 'Step 04: CLO Formulation',
        summary: 'Binding CLOs to Washington Accord knowledge profiles and active Bloom cognitive levels.',
        requirements: [
          'State each CLO using verifiable performance terms.',
          'Ensure Bloom cognitive levels match Accord expectations (WA1-WA4 mandate minimum Level 4 Analyzing or higher).',
        ],
        alignmentRules: [
          'Introductory courses focus on C2-C3; capstone and advanced design courses must achieve C5-C6.',
        ],
        exemplars: [
          {
            title: 'Exemplar WA3 CLO',
            text: 'Synthesize a fault-tolerant microgrid distribution schema capable of islanding within 16 milliseconds during grid disturbances while maintaining power quality standards (IEEE 1547).',
            rationale: 'Targets WA3 Design with rigorous technical performance criteria.',
          },
        ],
        pitfalls: ['Writing low-level recall CLOs for senior-year engineering courses.'],
      },
    ],
  },
  {
    id: 'fw-abet-cac',
    code: 'ABET-CAC',
    name: 'ABET CAC (Computing Accreditation Commission)',
    title: 'ABET CAC Criteria for Accrediting Computing Programs Guidebook',
    governingBody: 'ABET Computing Accreditation Commission',
    jurisdiction: 'United States & Worldwide Computing Programs',
    category: 'accreditation',
    categoryLabel: 'Accreditation Commission Standard',
    edition: '2024-2026 Criteria Cycle',
    documentRef: 'ABET Criterion 3 (SO 1-6) Computing Manual',
    publishedYear: '2024',
    pageCount: 16,
    description:
      'Rigorous accreditation standard for Computer Science, Cybersecurity, Information Systems, and Software Engineering programs. Formulates Criterion 3 around algorithmic problem solving, software systems design, professional security ethics, and teamwork.',
    outcomeModel: 'Student Outcomes (SO 1 to 6)',
    accreditationScope: 'Computer Science, Software Engineering, IT & Cybersecurity Degrees',
    principles: [
      'Algorithmic complexity analysis and computational theory (SO 1)',
      'Full lifecycle computing systems design and implementation (SO 2)',
      'Security-first mindset and data stewardship (SO 4)',
      'Substantial programming evidence evaluated with automated and rubric rubrics',
    ],
    keyOutcomes: [
      { code: 'SO 1', title: 'Complex Computing Problems', description: 'Analyze a complex computing problem and to apply principles of computing and other relevant disciplines to identify solutions.', bloomsLevel: 'C4 Analyzing' },
      { code: 'SO 2', title: 'Design & Implementation', description: 'Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program’s discipline.', bloomsLevel: 'C6 Creating' },
      { code: 'SO 3', title: 'Communication', description: 'Communicate effectively in a variety of professional contexts.', bloomsLevel: 'A3 Valuing' },
      { code: 'SO 4', title: 'Professional & Legal Responsibilities', description: 'Recognize professional responsibilities and make informed judgments in computing practice based on legal and ethical principles.', bloomsLevel: 'A4 Organizing' },
      { code: 'SO 5', title: 'Teamwork', description: 'Function effectively as a member or leader of a team engaged in activities appropriate to the program’s discipline.', bloomsLevel: 'A4 Organizing' },
      { code: 'SO 6', title: 'Computer Science Theory', description: 'Apply computer science theory and software development fundamentals to produce computing-based solutions.', bloomsLevel: 'C4-C5 Evaluating' },
    ],
    chapters: [
      {
        id: 'cac-ch1',
        number: '1',
        title: 'Computing Outcomes & Rigorous Direct Evidence',
        stageKey: 'step_clos',
        stageLabel: 'Step 04: CLO Formulation',
        summary: 'Formulating computing-oriented CLOs with software architecture and algorithmic rigor.',
        requirements: [
          'CLOs must clearly state computational artifacts (e.g. REST APIs, data structures, unit test suites).',
          'Include explicit runtime/space complexity or security benchmarks.',
        ],
        alignmentRules: [
          'Ensure SO 2 assessments verify both functional correctness and non-functional requirements (performance, scalability, security).',
        ],
        exemplars: [
          {
            title: 'Exemplar SO1/SO2 Computing CLO',
            text: 'Architect and deploy a distributed key-value storage engine in Rust featuring Raft consensus, achieving O(log N) state replication with zero single points of failure.',
            rationale: 'Directly addresses complex computing problems (SO1) and complete software design/implementation (SO2).',
          },
        ],
        pitfalls: ['Accepting code submissions without automated testing or code review rubrics.'],
      },
    ],
  },
  {
    id: 'fw-nba-tier1',
    code: 'NBA-T1',
    name: 'NBA India Tier-I (Washington Accord Recognized)',
    title: 'NBA India Outcome Based Accreditation Manual (Tier-I SAR)',
    governingBody: 'National Board of Accreditation (NBA India)',
    jurisdiction: 'India (AICTE Recognized Autonomous / Tier-I Engineering Institutions)',
    category: 'national',
    categoryLabel: 'National Statutory Accreditation Standard',
    edition: 'Tier-I Self Assessment Report (SAR) Manual',
    documentRef: 'NBA-SAR-TIER1-2023/2026',
    publishedYear: '2023',
    pageCount: 24,
    description:
      'Statutory accreditation manual recognized under the Washington Accord. Specifies 12 Program Outcomes (PO1-PO12), 2 to 4 Program Specific Outcomes (PSOs), 70% threshold attainment calculations, Course Articulation Matrices (CAM), and Program Articulation Matrices (PAM).',
    outcomeModel: 'Program Outcomes (PO 1 to 12) + Program Specific Outcomes (PSO 1 to 2)',
    accreditationScope: 'Undergraduate Autonomous Engineering Institutions in India',
    principles: [
      'Mandatory Course Articulation Matrix (CAM) linking each CLO to PO1-PO12 and PSOs',
      'Correlation level scoring strictly defined: 1 (Slight/Low), 2 (Moderate/Medium), 3 (Substantial/High)',
      'Attainment calculation formula incorporating both Internal Assessments (CIE - 20-30%) and Semester End Exams (SEE - 70-80%)',
      'Closing the loop through Departmental Advisory Board (DAB) and Program Assessment Committee (PAC) reviews',
    ],
    keyOutcomes: [
      { code: 'PO1', title: 'Engineering Knowledge', description: 'Apply mathematics, science, engineering fundamentals to solve engineering problems.', bloomsLevel: 'C3' },
      { code: 'PO2', title: 'Problem Analysis', description: 'Identify, formulate, review literature and analyze complex engineering problems.', bloomsLevel: 'C4' },
      { code: 'PO3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems with public health and safety considerations.', bloomsLevel: 'C6' },
      { code: 'PO4', title: 'Conduct Investigations', description: 'Use research-based knowledge and research methods to provide valid conclusions.', bloomsLevel: 'C5' },
      { code: 'PO5', title: 'Modern Tool Usage', description: 'Select and apply appropriate IT and engineering tools with understanding of limitations.', bloomsLevel: 'C3' },
      { code: 'PO6', title: 'The Engineer and Society', description: 'Apply contextual knowledge to assess societal, health, legal and cultural issues.', bloomsLevel: 'C4' },
      { code: 'PO7', title: 'Environment and Sustainability', description: 'Understand the impact of engineering solutions in societal and environmental contexts.', bloomsLevel: 'C4' },
      { code: 'PO8', title: 'Ethics', description: 'Commit to professional ethics, responsibilities and norms of engineering practice.', bloomsLevel: 'A3' },
      { code: 'PO9', title: 'Individual and Team Work', description: 'Function effectively as an individual and member or leader in diverse teams.', bloomsLevel: 'A4' },
      { code: 'PO10', title: 'Communication', description: 'Communicate effectively with engineering community and society at large.', bloomsLevel: 'A3' },
      { code: 'PO11', title: 'Project Management & Finance', description: 'Demonstrate knowledge and apply engineering management principles to projects.', bloomsLevel: 'C3' },
      { code: 'PO12', title: 'Life-Long Learning', description: 'Recognize need for independent and life-long learning in technological change.', bloomsLevel: 'A5' },
    ],
    chapters: [
      {
        id: 'nba-ch1',
        number: '1',
        title: 'Course Articulation Matrix (CAM) & NBA Tier-I Attainment Model',
        stageKey: 'step_plo_mapping',
        stageLabel: 'Step 05: Outcome Mapping Matrix',
        summary: 'Formulating the Course Articulation Matrix and setting correlation levels per NBA SAR format.',
        requirements: [
          'Construct a rigorous matrix with CLOs as rows and PO1-PO12 + PSOs as columns.',
          'Define justification when assigning correlation weight 3 (Substantial).',
          'Calculate direct attainment target: 60% of students scoring > 65% in CIE and SEE.',
        ],
        alignmentRules: [
          'Average PO attainment across all courses must be tracked in the Program Articulation Matrix (PAM).',
        ],
        exemplars: [
          {
            title: 'Exemplar CAM Alignment',
            text: 'CLO 3 maps to PO 3 (Level 3) and PO 5 (Level 2). CIE Mid-Term Test Q3 and Semester Exam Q5b directly measure attainment.',
            rationale: 'Demonstrates transparent evidence mapping matching NBA Table B.3.1.2.',
          },
        ],
        pitfalls: ['Filling the entire CAM matrix with 3s without assessment evidence.'],
      },
    ],
  },
  {
    id: 'fw-hec-pakistan',
    code: 'HEC-OBE',
    name: 'HEC Pakistan / NCEAC & PEC National OBE Framework',
    title: 'HEC Pakistan National Outcome-Based Education (OBE) Policy Manual',
    governingBody: 'Higher Education Commission Pakistan (HEC) / PEC & NCEAC',
    jurisdiction: 'Pakistan (National Universities & Degree Awarding Institutes)',
    category: 'national',
    categoryLabel: 'National Statutory Higher Education Standard',
    edition: 'National OBE Policy Framework Cycle',
    documentRef: 'HEC-OBE-Guideline-Manual-2022/2026',
    publishedYear: '2022',
    pageCount: 20,
    description:
      'National Higher Education policy mandating Outcome-Based Education across all undergraduate engineering, computing, and professional programs in Pakistan. Fully aligned with Washington Accord (PEC) and Seoul Accord (NCEAC) graduate competencies.',
    outcomeModel: 'Program Learning Outcomes (PLO 1 to 12) + Taxonomy Domains (Cognitive, Affective, Psychomotor)',
    accreditationScope: 'HEC Recognized Universities across Pakistan',
    principles: [
      'Strict tripartite Bloom classification: Cognitive (C1-C6), Affective (A1-A5), Psychomotor (P1-P7)',
      'Minimum of 50% threshold for individual student CLO pass, and 65% cohort attainment benchmark',
      'Mandatory Complex Engineering Problems (CEP) or Complex Computing Activities (CCA) in upper semesters',
      'Formal Semester Continuous Quality Improvement (CQI) review prior to academic council approval',
    ],
    keyOutcomes: [
      { code: 'PLO 1', title: 'Academic / Engineering Knowledge', description: 'Demonstrate in-depth technical knowledge and mathematical foundations.', bloomsLevel: 'C3' },
      { code: 'PLO 2', title: 'Problem Analysis', description: 'Analyze complex problems reaching substantiated research conclusions.', bloomsLevel: 'C4' },
      { code: 'PLO 3', title: 'Design/Development of Solutions', description: 'Design system components or processes meeting designated societal needs.', bloomsLevel: 'C6' },
      { code: 'PLO 4', title: 'Investigation', description: 'Conduct experimental investigations and empirical research.', bloomsLevel: 'C5' },
      { code: 'PLO 5', title: 'Modern Tool Usage', description: 'Apply simulation software, IDEs, and modern laboratory equipment.', bloomsLevel: 'C3' },
      { code: 'PLO 6', title: 'The Professional and Society', description: 'Evaluate social, legal, and cultural responsibilities.', bloomsLevel: 'A3' },
      { code: 'PLO 7', title: 'Environment and Sustainability', description: 'Demonstrate knowledge of sustainable development and environmental stewardship.', bloomsLevel: 'C4' },
      { code: 'PLO 8', title: 'Ethics', description: 'Commit to professional ethics, Islamic values, and international research norms.', bloomsLevel: 'A3' },
      { code: 'PLO 9', title: 'Individual and Team Work', description: 'Function effectively in multi-disciplinary teams.', bloomsLevel: 'A4' },
      { code: 'PLO 10', title: 'Communication', description: 'Communicate technical concepts effectively in written and spoken forms.', bloomsLevel: 'A3' },
      { code: 'PLO 11', title: 'Project Management', description: 'Apply engineering management and financial accounting principles.', bloomsLevel: 'C3' },
      { code: 'PLO 12', title: 'Life-Long Learning', description: 'Engage in continuous independent self-directed learning.', bloomsLevel: 'A5' },
    ],
    chapters: [
      {
        id: 'hec-ch1',
        number: '1',
        title: 'HEC OBE Course Dossier Requirements & CQI Documentation',
        stageKey: 'step_cqi',
        stageLabel: 'Step 10: Continuous Quality Improvement',
        summary: 'Compiling the official HEC/PEC Course Folder and completing the closing-the-loop CQI cycle.',
        requirements: [
          'Course file must include: Course Learning Outcomes, CQI Form, Question Papers with Bloom mapping, and High/Medium/Low sample papers.',
          'Identify at least two pedagogical corrective actions for any CLO where cohort attainment is below 65%.',
        ],
        alignmentRules: [
          'Exams must display the mapped CLO and Bloom cognitive level beside every question.',
        ],
        exemplars: [
          {
            title: 'Exemplar Question Header',
            text: 'Question 2 (10 Marks) [CLO-3, Bloom Level: C4 - Analyzing]: Analyze the state transition diagram of the synchronous counter and verify timing hazards under 100MHz clock frequency.',
            rationale: 'Complies with mandatory HEC/PEC exam paper tagging guidelines.',
          },
        ],
        pitfalls: ['Failing to retain marked exam scripts for HEC/PEC accreditation inspection.'],
      },
    ],
  },
  {
    id: 'fw-seoul-accord',
    code: 'SA-COMP',
    name: 'Seoul Accord-aligned Computing OBE',
    title: 'Seoul Accord Graduate Attributes & Computing Competencies Guidebook',
    governingBody: 'Seoul Accord Signatories',
    jurisdiction: 'International (Computing Accords across 9+ Signatories)',
    category: 'international',
    categoryLabel: 'International Recognition Accord',
    edition: 'Seoul Accord Rev 4.1 Specification',
    documentRef: 'SA-COMP-GAPC-2021',
    publishedYear: '2021',
    pageCount: 17,
    description:
      'Multilateral international agreement establishing substantial equivalence of computing degree programs. Covers 10 Computing Graduate Attributes including complex computing activities, software architecture, algorithm design, and cybersecurity ethics.',
    outcomeModel: 'Computing Graduate Attributes (CGA 1 to 10)',
    accreditationScope: 'Computer Science, Software Engineering & IT Programs',
    principles: [
      'Substantial equivalence of computing and IT degrees internationally',
      'Focus on algorithmic efficiency, complexity bounds, and verified software quality',
      'Inclusion of data privacy, cyber-ethics, and international computing standards',
    ],
    keyOutcomes: [
      { code: 'CGA1', title: 'Academic Education', description: 'Apply knowledge of computing fundamentals, mathematics, and science to complex computing problems.', bloomsLevel: 'C4' },
      { code: 'CGA2', title: 'Knowledge for Solving Computing Problems', description: 'Identify and analyze complex computing problems reaching substantiated conclusions.', bloomsLevel: 'C4' },
      { code: 'CGA3', title: 'Problem Analysis', description: 'Synthesize algorithms and computational abstractions to solve multifaceted problems.', bloomsLevel: 'C5' },
      { code: 'CGA4', title: 'Design/Development of Solutions', description: 'Design solutions for complex computing problems meeting user requirements.', bloomsLevel: 'C6' },
      { code: 'CGA5', title: 'Modern Tool Usage', description: 'Select and apply appropriate techniques and modern computing tools.', bloomsLevel: 'C3' },
      { code: 'CGA6', title: 'Individual and Team Work', description: 'Collaborate effectively in diverse software engineering teams.', bloomsLevel: 'A4' },
      { code: 'CGA7', title: 'Communication', description: 'Communicate complex technical concepts to diverse stakeholders.', bloomsLevel: 'A3' },
      { code: 'CGA8', title: 'Computing Professionalism & Society', description: 'Evaluate social, legal, cybersecurity and ethical impact of computing systems.', bloomsLevel: 'A4' },
      { code: 'CGA9', title: 'Ethics', description: 'Adhere to ACM/IEEE codes of ethical conduct in software development.', bloomsLevel: 'A3' },
      { code: 'CGA10', title: 'Life-Long Learning', description: 'Engage in continuous adaptation to rapidly evolving computing technologies.', bloomsLevel: 'A5' },
    ],
    chapters: [],
  },
  {
    id: 'fw-sydney-accord',
    code: 'SA-ET',
    name: 'Sydney Accord-aligned Engineering Technology OBE',
    title: 'Sydney Accord Engineering Technologist Competency Guidebook',
    governingBody: 'International Engineering Alliance (IEA)',
    jurisdiction: 'International (11 Signatory Nations)',
    category: 'international',
    categoryLabel: 'International Recognition Accord',
    edition: 'GAPC Sydney Accord Edition',
    documentRef: 'IEA GAPC-SA-2021',
    publishedYear: '2021',
    pageCount: 16,
    description:
      'International benchmark for 3 to 4 year engineering technology programs. Focuses on Broadly-Defined Engineering Problems (BDP), application of established techniques, and technology profile competencies (SA1 to SA12).',
    outcomeModel: 'Graduate Attributes (SA1 to SA12)',
    accreditationScope: 'Bachelor of Engineering Technology Programs',
    principles: [
      'Focus on broadly-defined engineering technology problems',
      'Emphasis on practical implementation, field testing, and maintenance protocols',
      'Direct hands-on laboratory and fabrication competencies',
    ],
    keyOutcomes: [
      { code: 'SA1', title: 'Engineering Technology Knowledge', description: 'Apply technology fundamentals to solve broadly-defined engineering problems.', bloomsLevel: 'C3' },
      { code: 'SA2', title: 'Problem Analysis', description: 'Analyze broadly-defined problems using established diagnostic techniques.', bloomsLevel: 'C4' },
      { code: 'SA3', title: 'Design/Development of Solutions', description: 'Design components and systems for broadly-defined problems.', bloomsLevel: 'C5' },
    ],
    chapters: [],
  },
  {
    id: 'fw-custom-institutional',
    code: 'INST-LOCAL',
    name: 'Custom Institutional OBE Blueprint & Local Standards',
    title: 'Custom Institutional Quality Assurance & OBE Framework Guidebook',
    governingBody: 'Institutional Academic Quality Committee / University Senate',
    jurisdiction: 'Local Autonomous University / College / Ministry Guidelines',
    category: 'institutional',
    categoryLabel: 'Institutional & Local Statutory Blueprint',
    edition: 'Local University Quality Blueprint 2026',
    documentRef: 'INST-OBE-QA-2026',
    publishedYear: '2026',
    pageCount: 15,
    description:
      'Adaptable local framework designed for universities, polytechnics, and specialized colleges to define their own mission-aligned Graduate Attributes, local statutory compliance checklists, and multidisciplinary course learning outcomes.',
    outcomeModel: 'Institutional Graduate Competencies / Custom Program Outcomes',
    accreditationScope: 'Institution-Wide Autonomous Degree & Diploma Programs',
    principles: [
      'Alignment with unique institutional mission, vision, and regional industry needs',
      'Direct mapping between course learning outcomes and university-level graduate attributes',
      'Flexible rubric weights tailored to project-based, experiential, or clinical learning',
      'Integrated stakeholder feedback from regional employers and alumni',
    ],
    keyOutcomes: [
      { code: 'INST-1', title: 'Domain Knowledge & Applied Inquiry', description: 'Demonstrate rigorous comprehension of foundational disciplinary concepts and methods.', bloomsLevel: 'C3-C4' },
      { code: 'INST-2', title: 'Critical Thinking & Creative Synthesis', description: 'Evaluate complex issues and formulate novel, evidence-based solutions.', bloomsLevel: 'C5-C6' },
      { code: 'INST-3', title: 'Digital Fluency & Technological Agency', description: 'Leverage modern digital tools, computational models, and data analytics.', bloomsLevel: 'C3' },
      { code: 'INST-4', title: 'Global Citizenship & Cultural Empathy', description: 'Engage constructively with diverse cultural and socio-economic perspectives.', bloomsLevel: 'A3-A4' },
      { code: 'INST-5', title: 'Civic Responsibility & Ethical Stewardship', description: 'Practice ethical integrity and promote sustainable community wellbeing.', bloomsLevel: 'A5' },
      { code: 'INST-6', title: 'Collaborative Leadership & Communication', description: 'Lead diverse teams and articulate complex ideas effectively to multiple audiences.', bloomsLevel: 'A4' },
    ],
    chapters: [],
  },
  {
    id: 'fw-general-obe',
    code: 'GEN-OBE',
    name: 'Spady Outcome-Based Education (OBE) Master Guidebook',
    title: 'Foundational Outcome-Based Education (OBE) Principles & Guidelines',
    governingBody: 'General OBE Academic Consortium',
    jurisdiction: 'Global Higher Education & Vocational Training',
    category: 'institutional',
    categoryLabel: 'Foundational Educational Framework',
    edition: 'Spady Model Classical Edition',
    documentRef: 'GEN-OBE-SPADY-FOUNDATION',
    publishedYear: '2024',
    pageCount: 14,
    description:
      'The classic William Spady educational paradigm resting on four cardinal tenets: Clarity of Focus, High Expectations, Expanded Opportunities, and Designing Down from Exit Outcomes.',
    outcomeModel: 'Course Learning Outcomes (CLOs) to Program Educational Objectives (PEOs)',
    accreditationScope: 'All Higher Education Disciplines & Interdisciplinary Courses',
    principles: [
      'Clarity of Focus: Students know upfront exactly what they will be able to demonstrate',
      'Design Down: Begin curriculum planning with the exit outcomes and reverse-engineer learning units',
      'High Expectations: Challenge all learners to achieve authentic mastery',
      'Expanded Opportunities: Flexible pacing and iterative diagnostic assessments',
    ],
    keyOutcomes: [
      { code: 'CLO 1', title: 'Core Conceptual Foundations', description: 'Articulate and interpret foundational theoretical constructs.', bloomsLevel: 'C2-C3' },
      { code: 'CLO 2', title: 'Analytical & Methodological Proficiency', description: 'Apply standardized analytical methodologies to solve practical scenarios.', bloomsLevel: 'C4' },
      { code: 'CLO 3', title: 'Synthetic Creative Application', description: 'Synthesize multidisciplinary knowledge to produce original artifacts.', bloomsLevel: 'C6' },
      { code: 'CLO 4', title: 'Evaluative Reflection & Ethics', description: 'Assess outcomes critically against professional and ethical standards.', bloomsLevel: 'C5' },
    ],
    chapters: [],
  },
];

// ---------------------------------------------------------------------------
// Registry Service Implementation
// ---------------------------------------------------------------------------

class FrameworkGuidebookRegistry {
  private registry: Map<string, FrameworkGuidebookEntry> = new Map();

  constructor() {
    this.initDefaultRegistry();
  }

  private initDefaultRegistry() {
    BASE_REGISTRY_ENTRIES.forEach((base) => {
      const entry: FrameworkGuidebookEntry = {
        ...base,
        getPdfBlob: (options?: GuidebookPdfOptions) => {
          return generateFrameworkGuidebookBlob({
            frameworkId: base.id,
            frameworkName: base.name,
            ...options,
          });
        },
        downloadPdf: (options?: GuidebookPdfOptions) => {
          downloadFrameworkGuidebookPDF({
            frameworkId: base.id,
            frameworkName: base.name,
            ...options,
          });
        },
      };
      this.registry.set(base.id, entry);
    });
  }

  /**
   * Returns all registered framework guidebook entries
   */
  public getAll(): FrameworkGuidebookEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Retrieves a guidebook by framework ID, code, or alias
   */
  public getById(idOrCode?: string): FrameworkGuidebookEntry {
    if (!idOrCode) {
      return this.registry.get('fw-washington-accord') || Array.from(this.registry.values())[0];
    }

    const direct = this.registry.get(idOrCode);
    if (direct) return direct;

    const norm = idOrCode.toLowerCase().trim();

    // Match by code
    for (const entry of this.registry.values()) {
      if (entry.code.toLowerCase() === norm) {
        return entry;
      }
    }

    // Match by keywords
    if (norm.includes('eac') || norm.includes('abet-eac')) {
      return this.registry.get('fw-abet-eac') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('cac') || norm.includes('computing')) {
      return this.registry.get('fw-abet-cac') || this.registry.get('fw-abet-eac')!;
    }
    if (norm.includes('seoul') || norm.includes('sa-comp')) {
      return this.registry.get('fw-seoul-accord') || this.registry.get('fw-abet-cac')!;
    }
    if (norm.includes('sydney') || norm.includes('sa-et') || norm.includes('technology')) {
      return this.registry.get('fw-sydney-accord') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('nba') || norm.includes('india')) {
      return this.registry.get('fw-nba-tier1') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('hec') || norm.includes('pakistan')) {
      return this.registry.get('fw-hec-pakistan') || this.registry.get('fw-washington-accord')!;
    }
    if (norm.includes('local') || norm.includes('institutional') || norm.includes('custom')) {
      return this.registry.get('fw-custom-institutional') || this.registry.get('fw-general-obe')!;
    }
    if (norm.includes('spady') || norm.includes('general')) {
      return this.registry.get('fw-general-obe') || this.registry.get('fw-washington-accord')!;
    }

    return this.registry.get('fw-washington-accord') || Array.from(this.registry.values())[0];
  }

  /**
   * Intelligently links and resolves a guidebook for a course object
   */
  public resolveForCourse(course?: {
    frameworkId?: string;
    accreditationFramework?: string;
    title?: string;
    code?: string;
  }): FrameworkGuidebookEntry {
    if (!course) {
      return this.getById('fw-washington-accord');
    }
    if (course.frameworkId) {
      return this.getById(course.frameworkId);
    }
    if (course.accreditationFramework) {
      return this.getById(course.accreditationFramework);
    }
    return this.getById('fw-washington-accord');
  }

  /**
   * Registers or updates a custom framework entry in the registry
   */
  public registerCustom(entry: Partial<FrameworkGuidebookEntry> & { id: string; name: string }): FrameworkGuidebookEntry {
    const fullEntry: FrameworkGuidebookEntry = {
      id: entry.id,
      code: entry.code || 'CUSTOM-OBE',
      name: entry.name,
      title: entry.title || `${entry.name} Guidebook`,
      governingBody: entry.governingBody || 'Institutional Academic Committee',
      jurisdiction: entry.jurisdiction || 'Local Jurisdiction',
      category: entry.category || 'institutional',
      categoryLabel: entry.categoryLabel || 'Institutional Standard',
      edition: entry.edition || 'Current Edition',
      documentRef: entry.documentRef || 'DOC-REF-CUSTOM',
      publishedYear: entry.publishedYear || new Date().getFullYear().toString(),
      pageCount: entry.pageCount || 12,
      description: entry.description || 'Custom framework guidelines.',
      outcomeModel: entry.outcomeModel || 'Institutional Outcomes',
      accreditationScope: entry.accreditationScope || 'Academic Degree Programs',
      principles: entry.principles || ['Outcome-based constructive alignment'],
      keyOutcomes: entry.keyOutcomes || [],
      chapters: entry.chapters || [],
      getPdfBlob: (options?: GuidebookPdfOptions) => {
        return generateFrameworkGuidebookBlob({
          frameworkId: entry.id,
          frameworkName: entry.name,
          ...options,
        });
      },
      downloadPdf: (options?: GuidebookPdfOptions) => {
        downloadFrameworkGuidebookPDF({
          frameworkId: entry.id,
          frameworkName: entry.name,
          ...options,
        });
      },
    };

    this.registry.set(entry.id, fullEntry);
    return fullEntry;
  }
}

export const guidebookRegistry = new FrameworkGuidebookRegistry();

export function getGuidebookRegistry(): FrameworkGuidebookEntry[] {
  return guidebookRegistry.getAll();
}

export function getGuidebookEntry(idOrCode?: string): FrameworkGuidebookEntry {
  return guidebookRegistry.getById(idOrCode);
}

export function resolveCourseGuidebook(course?: {
  frameworkId?: string;
  accreditationFramework?: string;
}): FrameworkGuidebookEntry {
  return guidebookRegistry.resolveForCourse(course);
}

export {
  OBEFrameworkRegistry,
  getGuidebookByFrameworkId,
  getGuidebookForCourse,
  getFrameworkPdfPath,
  getAllFrameworkGuidebooks,
} from '../utils/OBEFrameworkRegistry';
export type {
  OBEFrameworkDefinition,
  CourseMetadataInput,
} from '../utils/OBEFrameworkRegistry';
