import { Framework } from '../types';

export interface FrameworkStageGuideline {
  stageId: string;
  stageTitle: string;
  stageNumber: number;
  whatIsRequired: string[];
  howToAlign: string[];
  compliantExamples: {
    title: string;
    description: string;
    items?: string[];
  }[];
  practicalRecommendations: string[];
  antiPatterns: string[];
}

export interface FrameworkDetailedGuideline {
  frameworkId: string;
  frameworkName: string;
  frameworkCode: string;
  accordOrStandard: string;
  jurisdiction: string;
  governingBody: string;
  outcomeModel: string;
  description: string;
  corePhilosophy: string;
  cognitiveRequirements: string;
  attainmentThreshold: string;
  graduateAttributes: {
    code: string;
    title: string;
    description: string;
    keywords: string[];
  }[];
  stages: Record<string, FrameworkStageGuideline>;
}

export const FRAMEWORK_GUIDELINES: Record<string, FrameworkDetailedGuideline> = {
  'fw-washington-accord': {
    frameworkId: 'fw-washington-accord',
    frameworkName: 'Washington Accord-aligned Engineering OBE',
    frameworkCode: 'WA-ENG',
    accordOrStandard: 'International Engineering Alliance (IEA) Level II Accord',
    jurisdiction: 'International (PEC, ABET, Engineers Australia, ECUK, BEM, etc.)',
    governingBody: 'International Engineering Alliance (IEA)',
    outcomeModel: '12 Graduate Attributes (WA1–WA12) & Complex Engineering Problems (CEP)',
    description:
      'The premier international benchmark for professional 4-year engineering programmes, mandating that graduates demonstrate competence in solving Complex Engineering Problems (WP1–WP7).',
    corePhilosophy:
      'Engineers must not merely apply standard cookbook procedures. They must demonstrate higher-order cognitive analysis, synthesis, sustainability, ethical reasoning, and modern computational tool usage when tackling ill-defined, wide-ranging engineering problems.',
    cognitiveRequirements:
      'Heavy emphasis on Bloom’s Taxonomy C4 (Analyzing), C5 (Evaluating), and C6 (Creating). At least 40% of assessment weighting must directly evaluate higher-order cognitive or psychomotor performance on Complex Engineering Problems.',
    attainmentThreshold:
      'Minimum passing benchmark typically set at 50%, with departmental cohort attainment threshold target at ≥60% of students reaching benchmark.',
    graduateAttributes: [
      {
        code: 'WA1',
        title: 'Engineering Knowledge',
        description: 'Apply knowledge of mathematics, natural science, computing, and engineering fundamentals to the solution of complex engineering problems.',
        keywords: ['First Principles', 'Differential Equations', 'Thermodynamics', 'Computing Fundamentals'],
      },
      {
        code: 'WA2',
        title: 'Problem Analysis',
        description: 'Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles.',
        keywords: ['Root Cause Analysis', 'Literature Review', 'Mathematical Modelling', 'Substantiated Conclusions'],
      },
      {
        code: 'WA3',
        title: 'Design/Development of Solutions',
        description: 'Design creative solutions for complex engineering problems and design systems, components, or processes that meet specified needs with appropriate consideration for public health and safety, cultural, societal, and environmental considerations.',
        keywords: ['System Architecture', 'Safety Constraints', 'Codes & Standards', 'Lifecycle Impact'],
      },
      {
        code: 'WA4',
        title: 'Investigation',
        description: 'Conduct investigations of complex engineering problems using research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of information to provide valid conclusions.',
        keywords: ['Design of Experiments (DoE)', 'Error Analysis', 'Statistical Inference', 'Scientific Method'],
      },
      {
        code: 'WA5',
        title: 'Modern Tool Usage',
        description: 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools, including prediction and modelling, to complex engineering problems with an understanding of limitations.',
        keywords: ['CAD/FEA/CFD Simulation', 'IDEs', 'Diagnostic Equipment', 'Tool Limitations'],
      },
      {
        code: 'WA6',
        title: 'The Engineer and the World',
        description: 'Analyze and evaluate sustainable development impacts to solve complex engineering problems, considering economic, social, environmental, and cultural impacts.',
        keywords: ['UN SDGs', 'Environmental Impact Assessment', 'Societal Resilience', 'Circular Economy'],
      },
      {
        code: 'WA7',
        title: 'Ethics',
        description: 'Apply ethical principles and commit to professional ethics, responsibilities, and norms of engineering practice; recognize diversity and equity.',
        keywords: ['Code of Ethics', 'Whistleblowing', 'Conflict of Interest', 'Public Welfare'],
      },
      {
        code: 'WA8',
        title: 'Individual and Collaborative Teamwork',
        description: 'Function effectively as an individual, and as a member or leader in diverse and multidisciplinary teams.',
        keywords: ['Conflict Resolution', 'Peer Evaluation', 'Agile/Scrum', 'Leadership Roles'],
      },
      {
        code: 'WA9',
        title: 'Communication',
        description: 'Communicate effectively on complex engineering activities with the engineering community and with society at large, through writing, reports, and presentations.',
        keywords: ['Technical Dossiers', 'Oral Defenses', 'Visual Schematics', 'Layperson Executive Summaries'],
      },
      {
        code: 'WA10',
        title: 'Project Management and Finance',
        description: 'Apply knowledge of engineering management principles, economic decision-making, and risk management to one’s own work and to projects in multidisciplinary environments.',
        keywords: ['Cost-Benefit Analysis', 'Gantt Scheduling', 'Risk Matrix', 'Earned Value Management'],
      },
      {
        code: 'WA11',
        title: 'Lifelong Learning',
        description: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.',
        keywords: ['Self-Directed Research', 'Patent Analysis', 'Continuous Professional Development (CPD)'],
      },
      {
        code: 'WA12',
        title: 'Cybersecurity and Digital Systems',
        description: 'Recognize security vulnerabilities and implement secure engineering practices in cyber-physical, embedded, or networked environments.',
        keywords: ['Vulnerability Mitigation', 'Industrial IoT Security', 'Data Integrity', 'System Resilience'],
      },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'Framework Selection & Accreditation Alignment',
        stageNumber: 1,
        whatIsRequired: [
          'Affirm that the course belongs to a Bachelor of Engineering (B.E./B.S./B.Tech) program recognized under the Washington Accord.',
          'Verify that course PLOs map directly to the 12 Washington Accord Graduate Attributes (WA1–WA12).',
          'Document whether this course features a Complex Engineering Problem (CEP) component.',
        ],
        howToAlign: [
          'Confirm your university is an authorized signatory (e.g. PEC Pakistan, ABET EAC USA, Engineers Canada, ECUK).',
          'Ensure the course scope connects prerequisite foundational math/science to advanced disciplinary synthesis.',
        ],
        compliantExamples: [
          {
            title: 'Engineering Program Accreditation Charter',
            description: 'Course Code: EE-301 (Signals & Systems) anchored to Washington Accord WA1 (Engineering Knowledge) and WA5 (Modern Tool Usage via MATLAB & Simulink FFT simulations).',
          },
        ],
        practicalRecommendations: [
          'Do not select the Washington Accord for 3-year technician diplomas (use Sydney Accord instead).',
          'Keep the Accord version locked to prevent mid-journey PLO definition drift.',
        ],
        antiPatterns: [
          'Selecting Washington Accord for non-calculus based vocational training.',
          'Ignoring the requirement for Complex Engineering Activities.',
        ],
      },
      step_course_info: {
        stageId: 'step_course_info',
        stageTitle: 'Course Setup & Administrative Parameters',
        stageNumber: 2,
        whatIsRequired: [
          'Credit hours calculated using the standard 1 Theory Credit = 1 Hour Lecture/week, 1 Lab Credit = 3 Hours Laboratory/week.',
          'Course code conforming to departmental catalogue taxonomy (e.g. CE-312, ME-405).',
          'Target learners specified with prerequisite competencies clearly stated.',
        ],
        howToAlign: [
          'Align total contact hours with the 16-week academic calendar.',
          'Indicate clearly whether the course is a Core Disciplinary Requirement, Breadth Elective, or Capstone Design.',
        ],
        compliantExamples: [
          {
            title: 'Undergraduate Engineering Syllabus Metadata',
            description: 'ME-401 Heat & Mass Transfer, 3+1 Credit Hours (3 hours theory lecture, 3 hours laboratory contact per week, 16 weeks duration). Prerequisites: ME-205 Thermodynamics II and MATH-201 Differential Equations.',
          },
        ],
        practicalRecommendations: [
          'State laboratory contact hours explicitly; accreditation teams audit lab equipment time per student.',
          'Specify required software tools in the prerequisites (e.g. AutoCAD, Python, SPICE).',
        ],
        antiPatterns: [
          'Understating student workload or omitting lab contact hour ratios.',
          'Listing prerequisites that are scheduled in the same semester as corequisites.',
        ],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Course Learning Outcomes (CLO) Formulation',
        stageNumber: 4,
        whatIsRequired: [
          'Each CLO must begin with a measurable, active verb derived from Bloom’s Revised Taxonomy (Anderson & Krathwohl 2001).',
          'Must explicitly state the performance condition, technical context, and evaluation standard.',
          'Include at least one CLO at cognitive level C4 (Analyzing), C5 (Evaluating), or C6 (Designing/Creating) to address Complex Engineering Problems.',
        ],
        howToAlign: [
          'Never use unmeasurable verbs such as "understand", "learn", "know", "appreciate", or "be familiar with".',
          'Ensure the CLO statement clearly connects to its designated Washington Accord Graduate Attribute.',
        ],
        compliantExamples: [
          {
            title: 'Compliant Engineering CLO Formulations',
            description: 'Approved Washington Accord CLOs:',
            items: [
              'CLO 1 (C3 - Applying): Apply Navier-Stokes equations and boundary layer theory to compute shear stress in laminar and turbulent pipe flows under isothermal conditions.',
              'CLO 2 (C4 - Analyzing): Analyze dynamic stress concentrations in multi-span truss bridges using finite element simulations under cyclic aerodynamic wind loads.',
              'CLO 3 (C5 - Evaluating): Evaluate alternative renewable energy integration architectures against IEEE 1547 grid interconnection standards and harmonic distortion limits.',
              'CLO 4 (C6 - Creating): Design a closed-loop PID controller for an inverted pendulum balancing robot satisfying settling time < 1.5s and percent overshoot < 10%.',
            ],
          },
        ],
        practicalRecommendations: [
          'Formulate between 3 and 5 CLOs per course. More than 6 CLOs fragments the assessment matrix.',
          'Clearly label the Bloom’s domain: Cognitive (C1–C6), Affective (A1–A5), or Psychomotor (P1–P7).',
        ],
        antiPatterns: [
          'Using "Students will understand the principles of thermodynamics" (unmeasurable).',
          'Having all CLOs clustered at low cognitive levels C1 (Remembering) and C2 (Understanding).',
        ],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'CLO-to-PLO / Graduate Attribute Articulation Matrix',
        stageNumber: 5,
        whatIsRequired: [
          'Every CLO must articulate with at least one Washington Accord Graduate Attribute (WA1–WA12).',
          'Each articulation must be assigned a correlation intensity: 1 (Slight/Low), 2 (Moderate/Medium), or 3 (Substantial/High).',
          'Each high correlation (Level 3) must be backed by direct, measurable assessment evidence.',
        ],
        howToAlign: [
          'Avoid "matrix stuffing" where every CLO is mapped to 8 different PLOs.',
          'A standard course typically addresses 2 to 4 primary Graduate Attributes strongly.',
        ],
        compliantExamples: [
          {
            title: 'High-Correlation Matrix Mapping Example',
            description: 'CLO 2 (Analyze dynamic stress) -> WA2 (Problem Analysis) [Weight 3 - Substantial]\nCLO 4 (Design closed-loop PID) -> WA3 (Design of Solutions) [Weight 3 - Substantial]\nCLO 4 -> WA5 (Modern Tool Usage - MATLAB/Simulink) [Weight 2 - Moderate]',
          },
        ],
        practicalRecommendations: [
          'Ensure that capstone or design courses map strongly to WA3 (Design), WA7 (Ethics), and WA10 (Project Management).',
          'Document the justification statement for each Level 3 correlation for the accreditation dossier.',
        ],
        antiPatterns: [
          'Mapping a single theory course to all 12 Graduate Attributes with no direct evidence.',
          'Having an attribute mapped with Weight 3 but never assessed in any exam, project, or assignment.',
        ],
      },
      step_weekly_plan: {
        stageId: 'step_weekly_plan',
        stageTitle: '16-Week Modular Syllabus Schedule',
        stageNumber: 6,
        whatIsRequired: [
          'Chronological week-by-week instructional outline spanning the full 16 weeks.',
          'Direct mapping from each weekly module to corresponding Modular Learning Outcomes (MLOs) and CLOs.',
          'Explicit identification of instructional delivery methods, laboratory sessions, and milestone assessment dates.',
        ],
        howToAlign: [
          'Reserve Week 8 or 9 for Midterm Evaluation, and Week 16 for Final Project / Comprehensive Examination.',
          'Incorporate interactive, active learning pedagogies (e.g. flipped classroom, problem-based learning, simulation labs).',
        ],
        compliantExamples: [
          {
            title: 'Week 07 Modular Breakdown (Control Systems)',
            description: 'Topics: Root Locus Techniques, Angle and Magnitude Criteria. MLO: Sketch and interpret root loci for 3rd order open-loop transfer functions. Activity: Interactive MATLAB rltool session. Formative check: 15-minute concept quiz.',
          },
        ],
        practicalRecommendations: [
          'Include assigned textbook chapter readings and DOI research paper references per week.',
          'Note statutory holidays and makeup session policies in the schedule.',
        ],
        antiPatterns: [
          'Vague topics like "Chapter 3 continuation" without specific outcomes.',
          'Scheduling all major assessments in the final two weeks of the semester.',
        ],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'Direct Assessment Strategy & 100% Weighting Plan',
        stageNumber: 8,
        whatIsRequired: [
          'Total assessment plan must total exactly 100%.',
          'Balance between Formative Assessments (quizzes, assignments, lab work: 30–50%) and Summative Assessments (midterms, final examinations, capstone demos: 50–70%).',
          'Every CLO must have at least one dedicated, direct assessment instrument.',
        ],
        howToAlign: [
          'Complex Engineering Problems must be evaluated via open-ended design tasks, term projects, or complex case studies.',
          'Lab performance must include continuous psychomotor rubric evaluation and an individual viva voce / practical exam.',
        ],
        compliantExamples: [
          {
            title: 'Standard Washington Accord Assessment Breakdown',
            description: '1. Midterm Examination (20% - Evaluates CLO 1 & 2)\n2. Complex Engineering Problem (CEP) Project (20% - Evaluates CLO 2, 3, & 4)\n3. Quizzes & Problem Sets (10% - Evaluates CLO 1)\n4. Lab Work & Practical Exam (10% - Evaluates CLO 2 & WA5)\n5. Comprehensive Final Examination (40% - Evaluates CLO 1, 2, 3, & 4)',
          },
        ],
        practicalRecommendations: [
          'Tag each exam question with its target CLO and Bloom’s cognitive level directly on the question paper.',
          'Provide rubrics to students at the time the assignment or project is distributed.',
        ],
        antiPatterns: [
          'Assessing complex engineering attributes purely through 100% multiple-choice memory questions.',
          'Omitting direct assessment evidence for soft attributes like WA7 (Ethics) or WA9 (Communication).',
        ],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'Scoring Rubrics & Performance Indicators',
        stageNumber: 9,
        whatIsRequired: [
          'Analytic rubrics featuring 4 performance tiers: Exemplary (85–100%), Proficient (70–84%), Developing (50–69%), Unsatisfactory (<50%).',
          'Explicit quantitative and qualitative descriptors for each criterion.',
          'Direct mapping from rubric criteria to specific CLO and Washington Accord Graduate Attributes.',
        ],
        howToAlign: [
          'Descriptors must differentiate between superficial textbook recall and deep engineering analysis.',
          'Use clear criteria: Problem Formulation, Methodological Rigor, Engineering Standards Compliance, Error Discussion.',
        ],
        compliantExamples: [
          {
            title: 'Complex Engineering Problem (CEP) Evaluation Rubric',
            description: 'Criterion: Application of Modern Engineering Tools (WA5)\n• Exemplary (4 pts): Skillfully utilizes industry-standard FEA software, rigorously justifies mesh refinement, and validates numerical results against analytical first principles.\n• Proficient (3 pts): Uses simulation tool correctly with minor mesh errors; compares results to standard literature.\n• Developing (2 pts): Uses tool with assistance; unable to explain boundary condition setup.\n• Unsatisfactory (1 pt): Fails to implement tool or relies on invalid assumptions.',
          },
        ],
        practicalRecommendations: [
          'Share rubrics with external peer reviewers to ensure grading consistency across sections.',
          'Calibrate rubrics so the cut-off for "Developing" reflects the institutional passing benchmark.',
        ],
        antiPatterns: [
          'Vague descriptors like "Good work", "Average effort", "Poor presentation".',
          'Rubrics that only grade formatting or spelling without technical engineering substance.',
        ],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'Continuous Quality Improvement (CQI) Remediation Loop',
        stageNumber: 10,
        whatIsRequired: [
          'Target attainment threshold benchmark (e.g. ≥65% of enrolled students must attain ≥50% in CLO assessments).',
          'Root cause analysis for any CLO where student attainment fell below the institutional threshold in the previous offering.',
          'Actionable pedagogical, curricular, or assessment remediation intervention for the upcoming cycle.',
        ],
        howToAlign: [
          'Close the loop by re-evaluating the remediated CLO in the subsequent academic term.',
          'Document evidence in the Course Dossier for accreditation visiting team inspection.',
        ],
        compliantExamples: [
          {
            title: 'Documented CQI Action Plan',
            description: 'Observation: In Fall 2025, CLO 3 (Design of Heat Exchangers) attainment was 52% (Threshold 65%).\nRoot Cause: Students struggled with ASME Section VIII pressure vessel sizing equations.\nRemediation Plan: Add a mandatory 2-hour interactive design tutorial in Week 10 and introduce a scaffolded sizing worksheet before the final design submission.\nTarget: Increase attainment to ≥70% in Fall 2026.',
          },
        ],
        practicalRecommendations: [
          'Distinguish between student attendance issues and fundamental pedagogical delivery challenges.',
          'Have CQI action plans endorsed by the departmental Board of Studies (BoS).',
        ],
        antiPatterns: [
          'Stating "Students need to study harder" as a CQI corrective action.',
          'Repeating identical CQI action plans semester after semester without tracking improvement data.',
        ],
      },
    },
  },

  'fw-abet-cac': {
    frameworkId: 'fw-abet-cac',
    frameworkName: 'ABET CAC (Computing Accreditation Commission)',
    frameworkCode: 'ABET-CAC',
    accordOrStandard: 'ABET Computing Accreditation Commission Criterion 3',
    jurisdiction: 'United States & Internationally Accredited Computing Programs',
    governingBody: 'ABET (Accreditation Board for Engineering and Technology)',
    outcomeModel: 'Student Outcomes 1 through 6 (SO 1 to SO 6)',
    description:
      'The globally recognized standard for Computer Science, Cybersecurity, Information Systems, and Software Engineering programs, focusing on algorithmic complexity, software design, and ethical stewardship.',
    corePhilosophy:
      'Computing graduates must be equipped with strong foundational algorithmic thinking, software engineering discipline, professional ethics, security considerations, and the ability to design computing-based solutions to real-world problems.',
    cognitiveRequirements:
      'Demands rigorous problem analysis (SO 1) and full-lifecycle solution implementation and evaluation (SO 2). Emphasizes both individual algorithmic competence and multi-person software teamwork (SO 5).',
    attainmentThreshold:
      'Typically requires 70% or 75% of students to meet or exceed the performance indicator threshold on direct assessment rubrics.',
    graduateAttributes: [
      {
        code: 'SO 1',
        title: 'Analyze Complex Computing Problems',
        description: 'Analyze a complex computing problem and apply principles of computing and other relevant disciplines to identify solutions.',
        keywords: ['Asymptotic Complexity', 'Graph Theory', 'Data Structures', 'Formal Verification'],
      },
      {
        code: 'SO 2',
        title: 'Design, Implement, and Evaluate Solutions',
        description: 'Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program’s discipline.',
        keywords: ['Full-Stack Architecture', 'Unit Testing', 'Refactoring', 'System Integration'],
      },
      {
        code: 'SO 3',
        title: 'Professional Communication',
        description: 'Communicate effectively in a variety of professional contexts with technical and non-technical stakeholders.',
        keywords: ['API Documentation', 'Technical Specs', 'Executive Briefings', 'Code Walkthroughs'],
      },
      {
        code: 'SO 4',
        title: 'Legal, Ethical, and Professional Responsibilities',
        description: 'Recognize professional responsibilities and make informed judgments in computing practice based on legal and ethical principles.',
        keywords: ['GDPR/Privacy', 'AI Bias', 'Intellectual Property', 'ACM/IEEE Code of Conduct'],
      },
      {
        code: 'SO 5',
        title: 'Collaborative Teamwork',
        description: 'Function effectively as a member or leader of a team engaged in activities appropriate to the program’s discipline.',
        keywords: ['Version Control (Git)', 'Code Reviews', 'Sprint Planning', 'Interpersonal Dynamics'],
      },
      {
        code: 'SO 6',
        title: 'Computer Science Theory & Development',
        description: 'Apply computer science theory and software development fundamentals to produce computing-based solutions.',
        keywords: ['Automata', 'Operating Systems', 'Concurrency', 'Compiler Design'],
      },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'Framework Selection: ABET CAC',
        stageNumber: 1,
        whatIsRequired: [
          'Verify program alignment with ABET CAC Criterion 3 Student Outcomes (SO 1 to 6).',
          'Confirm that computing theory, algorithmic efficiency, and professional ethics are embedded across the curriculum.',
        ],
        howToAlign: [
          'Select this framework for Computer Science, Software Engineering, and AI degree programs aiming for international accreditation.',
        ],
        compliantExamples: [
          {
            title: 'ABET CAC Course Blueprint Foundation',
            description: 'CS-301 Data Structures & Algorithms mapped to ABET CAC SO 1 (Complexity Analysis) and SO 2 (Algorithm Implementation & Benchmarking).',
          },
        ],
        practicalRecommendations: ['Ensure every course outcome directly maps to at least one ABET SO.'],
        antiPatterns: ['Omitting security and data privacy considerations in modern computing curricula.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Formulating ABET CAC Measurable Outcomes',
        stageNumber: 4,
        whatIsRequired: [
          'CLOs must specify concrete computing deliverables (e.g. data structure implementation, asymptotic proof, security audit).',
          'Include Big-O asymptotic analysis and empirical performance benchmarking standards.',
        ],
        howToAlign: [
          'Use Bloom verbs: Analyze (C4), Design (C6), Implement (C3), Validate (C5).',
        ],
        compliantExamples: [
          {
            title: 'Compliant ABET CAC CLOs',
            description: 'Sample outcomes for Algorithms & Systems courses:',
            items: [
              'CLO 1: Formulate mathematical recurrence relations and derive tight asymptotic runtime bounds (Big-O, Big-Omega, Big-Theta) for divide-and-conquer algorithms.',
              'CLO 2: Design and implement balanced search tree structures (AVL, Red-Black) adhering to object-oriented principles and memory leak constraints.',
              'CLO 3: Evaluate graph shortest-path and maximum flow algorithms against realistic sparse network topologies.',
            ],
          },
        ],
        practicalRecommendations: [
          'Include unit test coverage expectations in programming CLOs (e.g. ≥85% branch coverage).',
        ],
        antiPatterns: ['Vague CLOs like "Understand how hash tables work".'],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'ABET CAC Student Outcome Mapping',
        stageNumber: 5,
        whatIsRequired: [
          'Map CLOs to SO 1 through SO 6 with defined performance indicators (PIs).',
        ],
        howToAlign: [
          'Anchor core algorithms to SO 1 and SO 6; software engineering projects to SO 2, SO 3, and SO 5.',
        ],
        compliantExamples: [
          {
            title: 'Mapping Sample',
            description: 'CLO 1 -> SO 1 (Analyze Complex Problems) [Level 3]\nCLO 2 -> SO 2 (Design & Implement Solutions) [Level 3]\nCLO 2 -> SO 6 (Apply CS Theory) [Level 3]',
          },
        ],
        practicalRecommendations: ['Document explicit direct evidence artifacts for each mapped SO.'],
        antiPatterns: ['Mapping non-team courses to SO 5 (Teamwork).'],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'Direct Computing Evidence & Assessment',
        stageNumber: 8,
        whatIsRequired: [
          'Include automated programming test suites, code reviews, and proctored technical exams.',
          '100% total assessment distribution.',
        ],
        howToAlign: [
          'Pair automated judge grading (e.g. LeetCode/HackerRank style unit tests) with human code quality rubrics.',
        ],
        compliantExamples: [
          {
            title: 'ABET Assessment Distribution',
            description: 'Programming Projects (30%), Midterm Exam (25%), Final Algorithmic Exam (35%), Lab Practicals & Code Reviews (10%).',
          },
        ],
        practicalRecommendations: ['Retain representative samples (High, Medium, Low) for ABET program evaluators (PEVs).'],
        antiPatterns: ['Grading software projects purely on whether they compile, without inspecting code architecture or test suites.'],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'Code Quality & Algorithmic Rubrics',
        stageNumber: 9,
        whatIsRequired: [
          'Rubrics assessing Algorithmic Correctness, Computational Efficiency (Time/Space), Code Maintainability, and Test Coverage.',
        ],
        howToAlign: [
          'Four distinct achievement levels: Exceeds Expectations, Meets Expectations, Approaching Expectations, Unsatisfactory.',
        ],
        compliantExamples: [
          {
            title: 'Software Development Rubric',
            description: 'Criteria: Correctness, Time Complexity, Clean Code (SOLID principles), Automated Unit Tests.',
          },
        ],
        practicalRecommendations: ['Publish rubrics with automated grading pipelines in GitHub Actions/GitLab CI.'],
        antiPatterns: ['Subjective grading without defined rubric dimensions.'],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'ABET Continuous Improvement Protocol',
        stageNumber: 10,
        whatIsRequired: [
          'Track SO attainment over 3-year cycles and record documented curriculum refinements.',
        ],
        howToAlign: [
          'Formulate action plans addressing specific performance indicator weaknesses identified during course delivery.',
        ],
        compliantExamples: [
          {
            title: 'ABET CQI Action Entry',
            description: 'SO 1 performance on dynamic programming dropped to 62%. Action: Implement interactive visualizer labs and weekly practice cohorts before midterm.',
          },
        ],
        practicalRecommendations: ['Include student feedback and industry advisory board input in CQI reviews.'],
        antiPatterns: ['No documented follow-up on previously identified student outcome gaps.'],
      },
    },
  },

  'fw-hec-pakistan': {
    frameworkId: 'fw-hec-pakistan',
    frameworkName: 'Higher Education Commission (HEC) Pakistan',
    frameworkCode: 'HEC-PK',
    accordOrStandard: 'National Qualifications Framework (NQF) & HEC Undergraduate Policy',
    jurisdiction: 'Pakistan (All Universities recognized by HEC)',
    governingBody: 'Higher Education Commission of Pakistan (HEC)',
    outcomeModel: 'Program Learning Outcomes (PLOs) & Knowledge/Skills/Attitude Domains',
    description:
      'National Outcome-Based Education standard enforced across Pakistani universities, governing semester system rules, credit-hour contact ratios, and standardized course dossiers.',
    corePhilosophy:
      'Ensure transparency, student-centered learning, constructive alignment, and clear attainment benchmarking (≥50% passing, ≥65% cohort attainment) aligned with national qualification descriptors.',
    cognitiveRequirements:
      'Requires balanced distribution across Bloom’s Cognitive, Affective, and Psychomotor domains, adhering to the 16-week semester schedule.',
    attainmentThreshold:
      'Individual student passing benchmark set at 50% (Grade C/D depending on university). Course cohort attainment target at ≥60% or ≥65%.',
    graduateAttributes: [
      { code: 'PLO 1', title: 'Academic & Disciplinary Knowledge', description: 'Demonstrate in-depth conceptual understanding of core principles.', keywords: ['Concepts', 'Theory'] },
      { code: 'PLO 2', title: 'Problem Solving & Critical Analysis', description: 'Formulate reasoned solutions to complex and novel challenges.', keywords: ['Analysis', 'Reasoning'] },
      { code: 'PLO 3', title: 'Communication Skills', description: 'Present technical arguments persuasively in English and national languages.', keywords: ['Reports', 'Presentations'] },
      { code: 'PLO 4', title: 'Digital & Practical Literacy', description: 'Utilize contemporary software and laboratory equipment safely.', keywords: ['Lab Skills', 'Computing'] },
      { code: 'PLO 5', title: 'Ethics & Civic Responsibility', description: 'Uphold academic integrity, Islamic and constitutional ethics, and public welfare.', keywords: ['Integrity', 'Social Responsibility'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'HEC Pakistan Policy Alignment',
        stageNumber: 1,
        whatIsRequired: [
          'Verify credit hours conform to HEC Undergraduate Policy: 3 credit hours = 48 lecture hours across 16 teaching weeks.',
          'Confirm semester passing rules and continuous internal assessment distribution.',
        ],
        howToAlign: ['Align with departmental curriculum approved by Academic Council and Board of Studies.'],
        compliantExamples: [{ title: 'HEC Course Blueprint', description: 'Approved HEC 3-credit curriculum with 16 weeks and continuous evaluation.' }],
        practicalRecommendations: ['Ensure course code matches university registration registrar system.'],
        antiPatterns: ['Scheduling courses with less than 16 active teaching weeks.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'HEC CLO Formulation',
        stageNumber: 4,
        whatIsRequired: [
          'State 3 to 5 CLOs with active Bloom verbs.',
          'Specify the target cognitive domain (C1 to C6).',
        ],
        howToAlign: ['Use clear, active English verbs compliant with Bloom’s Revised Taxonomy.'],
        compliantExamples: [{ title: 'HEC Exemplar CLO', description: 'CLO 2 (C4): Deconstruct the constitutional separation of powers under Articles 90-100 of the 1973 Constitution of Pakistan.' }],
        practicalRecommendations: ['Provide Urdu terminology translation where beneficial for bilingual cohorts.'],
        antiPatterns: ['Writing course outlines without explicit CLO statements.'],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'HEC PLO Articulation',
        stageNumber: 5,
        whatIsRequired: ['Articulate each CLO to HEC program outcomes with 1–3 correlation.'],
        howToAlign: ['Ensure matrix totals reflect core departmental mission.'],
        compliantExamples: [{ title: 'HEC Mapping Table', description: 'CLO 1 -> PLO 1 (High 3), CLO 2 -> PLO 2 (High 3).' }],
        practicalRecommendations: ['Review mapping in departmental Curriculum Review Committee.'],
        antiPatterns: ['Unjustified Level 3 mappings with no assessment evidence.'],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'HEC Semester Assessment Structure',
        stageNumber: 8,
        whatIsRequired: [
          'Sessional Work (Assignments, Quizzes, Presentations): 20–30%',
          'Midterm Examination: 20–30%',
          'Terminal / Final Examination: 40–50%',
          'Total = 100%',
        ],
        howToAlign: ['Ensure transparency by sharing graded sessional scripts with students within one week of evaluation.'],
        compliantExamples: [{ title: 'HEC Assessment Scheme', description: 'Quizzes (10%), Assignments (10%), Midterm (30%), Final Exam (50%). Total: 100%.' }],
        practicalRecommendations: ['Map every question in Midterm and Final exams to a specific CLO on the paper header.'],
        antiPatterns: ['Holding 100% final exam with zero continuous sessional evaluation.'],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'HEC Scoring Rubrics',
        stageNumber: 9,
        whatIsRequired: ['Standard 4-tier rubric for presentations, essays, and lab projects.'],
        howToAlign: ['Ensure criteria reflect both content mastery and academic communication.'],
        compliantExamples: [{ title: 'Presentation Rubric', description: 'Subject Mastery (40%), Critical Analysis (30%), Q&A Response (20%), Visual Aids (10%).' }],
        practicalRecommendations: ['Attach rubrics to project prompt handouts.'],
        antiPatterns: ['Awarding subjective lump-sum marks without criteria.'],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'HEC QEC CQI Protocol',
        stageNumber: 10,
        whatIsRequired: ['Submit Course Review Report (CRR) to Quality Enhancement Cell (QEC) at semester close.'],
        howToAlign: ['Document student teacher evaluation (TQE) and outcome attainment statistics.'],
        compliantExamples: [{ title: 'QEC Course Review Dossier', description: 'Comprehensive attainment graph and corrective action plan for upcoming semester.' }],
        practicalRecommendations: ['Maintain physical or digital course folders for HEC Institutional Performance Evaluation (IPE) audits.'],
        antiPatterns: ['Failing to archive examination question papers and graded student answer sheets.'],
      },
    },
  },

  'fw-nba-india': {
    frameworkId: 'fw-nba-india',
    frameworkName: 'National Board of Accreditation (NBA) India',
    frameworkCode: 'NBA-IN',
    accordOrStandard: 'NBA Tier-I & Tier-II Outcome-Based Accreditation Manual',
    jurisdiction: 'India (AICTE Approved Engineering & Technical Institutions)',
    governingBody: 'National Board of Accreditation (NBA)',
    outcomeModel: '12 Program Outcomes (PO1 to PO12) & Program Specific Outcomes (PSOs)',
    description:
      'The premier Indian outcome-based accreditation standard aligned with the Washington Accord, mandating comprehensive CO-PO and CO-PSO articulation matrices, direct/indirect attainment calculations, and CQI closing the loop.',
    corePhilosophy:
      'Demands strict mathematical tracking of Course Outcome (CO) attainment through continuous internal evaluation (CIE) and semester-end examinations (SEE), with documented corrective actions.',
    cognitiveRequirements:
      'Rigorous alignment with revised Bloom’s taxonomy levels (K1 to K6), demanding significant proportion of Higher Order Thinking Skills (HOTS: K4, K5, K6).',
    attainmentThreshold:
      'Typically set at 60% of students scoring above the target mark (e.g. 50% or 60% marks in the internal assessment).',
    graduateAttributes: [
      { code: 'PO1', title: 'Engineering Knowledge', description: 'Apply mathematics, science, engineering fundamentals, and specialization to solve engineering problems.', keywords: ['Math', 'Science', 'First Principles'] },
      { code: 'PO2', title: 'Problem Analysis', description: 'Identify, formulate, review research literature, and analyze complex engineering problems.', keywords: ['Literature Survey', 'Formulation'] },
      { code: 'PO3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems and design system components or processes.', keywords: ['System Design', 'Safety Constraints'] },
      { code: 'PO4', title: 'Conduct Investigations', description: 'Use research-based knowledge and research methods to provide valid conclusions.', keywords: ['Design of Experiments', 'Data Analysis'] },
      { code: 'PO5', title: 'Modern Tool Usage', description: 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools.', keywords: ['Simulation Tools', 'CAD/EDA'] },
      { code: 'PO6', title: 'The Engineer and Society', description: 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, and legal issues.', keywords: ['Societal Impact', 'Public Safety'] },
      { code: 'PO7', title: 'Environment and Sustainability', description: 'Understand the impact of professional engineering solutions in environmental contexts and demonstrate knowledge of sustainable development.', keywords: ['Sustainability', 'Ecology'] },
      { code: 'PO8', title: 'Ethics', description: 'Commit to professional ethics and responsibilities and norms of engineering practice.', keywords: ['Integrity', 'Professional Norms'] },
      { code: 'PO9', title: 'Individual and Team Work', description: 'Function effectively as an individual, and as a member or leader in diverse teams.', keywords: ['Team Dynamics', 'Collaboration'] },
      { code: 'PO10', title: 'Communication', description: 'Communicate effectively on complex engineering activities with the engineering community and society.', keywords: ['Technical Reports', 'Presentations'] },
      { code: 'PO11', title: 'Project Management and Finance', description: 'Demonstrate knowledge and understanding of engineering and management principles.', keywords: ['Cost Estimation', 'Project Scheduling'] },
      { code: 'PO12', title: 'Life-long Learning', description: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning.', keywords: ['Self-Learning', 'Emerging Tech'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'NBA Framework Alignment',
        stageNumber: 1,
        whatIsRequired: ['Confirm program affiliation under NBA Tier-I (autonomous/university) or Tier-II (affiliated college).', 'Verify PO1–PO12 and PSO definitions.'],
        howToAlign: ['Select NBA framework to automatically populate 12 standard POs and 2 PSOs.'],
        compliantExamples: [{ title: 'NBA Program Alignment', description: 'B.Tech Electrical & Electronics Engineering mapped to NBA Criteria 2 and 3.' }],
        practicalRecommendations: ['Ensure syllabus reflects AICTE model curriculum contact hours.'],
        antiPatterns: ['Renaming standard POs PO1 to PO12.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Course Outcomes (CO) Formulation',
        stageNumber: 4,
        whatIsRequired: ['Formulate 4 to 6 Course Outcomes (COs) designated as CO1, CO2, etc.', 'Specify Bloom’s cognitive level (K1 to K6).'],
        howToAlign: ['Ensure COs cover the full syllabus and span both foundation and advanced synthesis.'],
        compliantExamples: [{ title: 'NBA Exemplar COs', description: 'CO1 (K3): Apply Laplace transform techniques to solve linear differential equations of transient circuits.\nCO2 (K4): Analyze frequency response characteristics of active Butterworth and Chebyshev filters.' }],
        practicalRecommendations: ['State target attainment percentage (e.g. 60% of students scoring ≥50% marks).'],
        antiPatterns: ['Writing more than 6 COs per course.'],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'CO-PO and CO-PSO Articulation Matrix',
        stageNumber: 5,
        whatIsRequired: ['Construct the 2D CO-PO matrix using 1 (Slight), 2 (Moderate), 3 (Substantial) correlations.', 'Calculate average PO attainment contribution.'],
        howToAlign: ['Document justification for every correlation level 2 or 3.'],
        compliantExamples: [{ title: 'CO-PO Matrix Table', description: 'CO1: PO1 (3), PO2 (2), PO5 (1)\nCO2: PO1 (3), PO2 (3), PO3 (2), PO5 (2)' }],
        practicalRecommendations: ['Keep correlation justifications in the Course File for the NBA Peer Review Team.'],
        antiPatterns: ['Arbitrary numbers in the matrix without assessment correlation.'],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'Continuous Internal Evaluation (CIE) & Semester End Exam (SEE)',
        stageNumber: 8,
        whatIsRequired: ['CIE (Internal Tests, Assignments, Quizzes): 40–50%', 'SEE (University Exam): 50–60%', 'Total = 100%.'],
        howToAlign: ['Every question in Internal Assessment (IA) tests must explicitly state the CO and Bloom level.'],
        compliantExamples: [{ title: 'NBA Assessment Split', description: 'Internal Assessment Tests 1 & 2 (30%), Course Assignments & Quizzes (10%), Semester End Exam (60%). Total: 100%.' }],
        practicalRecommendations: ['Calculate direct attainment using 80% weightage for SEE and 20% for CIE as per NBA guidelines.'],
        antiPatterns: ['Unmapped internal test questions.'],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'NBA Laboratory & Project Rubrics',
        stageNumber: 9,
        whatIsRequired: ['Rubrics for mini-projects, lab performance, and seminar presentations.'],
        howToAlign: ['Ensure evaluation sheets document individual student marks per criterion.'],
        compliantExamples: [{ title: 'Mini-Project Rubric', description: 'Problem Formulation (20%), Design Methodology (30%), Implementation & Results (30%), Report & Defense (20%).' }],
        practicalRecommendations: ['Keep signed rubric evaluation rubrics in the course binder.'],
        antiPatterns: ['Awarding uniform marks to all students in a group without individual evaluation.'],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'CO Attainment & Action Taken Report (ATR)',
        stageNumber: 10,
        whatIsRequired: ['Compute target vs actual CO attainment percentage.', 'Write Action Taken Report (ATR) for targets not achieved.'],
        howToAlign: ['Close the loop with specific pedagogical remedial sessions or revised problem sets.'],
        compliantExamples: [{ title: 'Action Taken Report (ATR)', description: 'CO3 attainment was 54% (Target: 60%). Action Taken: Conducted 3 remedial tutorial classes on root locus and distributed solved numerical problem bank.' }],
        practicalRecommendations: ['Present the ATR to the Program Assessment Committee (PAC).'],
        antiPatterns: ['Leaving the Action Taken column blank or stating "N/A".'],
      },
    },
  },

  'fw-general-obe': {
    frameworkId: 'fw-general-obe',
    frameworkName: 'General Outcome-Based Education',
    frameworkCode: 'GEN-OBE',
    accordOrStandard: 'Universal Spady Outcome-Based Education Standard',
    jurisdiction: 'Universal (Arts, Humanities, Business, Social Sciences, Sciences)',
    governingBody: 'Institutional Quality Directorate',
    outcomeModel: 'Intended Learning Outcomes (ILOs) & Program Learning Outcomes (PLOs)',
    description:
      'Universal OBE paradigm grounded in William Spady’s principles: Clarity of Focus, Designing Down, High Expectations, and Expanded Opportunities.',
    corePhilosophy:
      'Focus relentlessly on what learners can demonstrably do at the end of their learning experiences, designing backward from the intended exit outcomes to instructional activities and authentic assessment evidence.',
    cognitiveRequirements:
      'Adaptable across Cognitive, Affective, and Psychomotor domains depending on disciplinary focus (e.g. creative writing, empirical social research, financial modeling).',
    attainmentThreshold:
      'Minimum standard of competence defined by criteria-referenced grading rubrics.',
    graduateAttributes: [
      { code: 'PLO 1', title: 'Disciplinary Mastery', description: 'Mastery of foundational and advanced domain principles.', keywords: ['Foundations', 'Theory'] },
      { code: 'PLO 2', title: 'Critical Inquiry', description: 'Rigorous analysis and evidence-based problem solving.', keywords: ['Investigation', 'Critique'] },
      { code: 'PLO 3', title: 'Effective Communication', description: 'Articulate expression across diverse professional mediums.', keywords: ['Writing', 'Discourse'] },
      { code: 'PLO 4', title: 'Ethical & Social Awareness', description: 'Informed ethical judgment and civic responsibility.', keywords: ['Ethics', 'Civic Action'] },
      { code: 'PLO 5', title: 'Self-Directed Lifelong Learning', description: 'Autonomous inquiry and continuous adaptability.', keywords: ['Metacognition', 'Curiosity'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'Universal OBE Commitment',
        stageNumber: 1,
        whatIsRequired: ['Commit to backward design (designing down from exit outcomes).'],
        howToAlign: ['Define clear learner promises and capstone exit goals.'],
        compliantExamples: [{ title: 'Business Strategy Syllabus', description: 'BA-401 Strategic Management designed backward from executive case analysis exit competencies.' }],
        practicalRecommendations: ['Ensure all course assessments are criterion-referenced rather than norm-referenced (curved).'],
        antiPatterns: ['Curving grades instead of grading against fixed outcome benchmarks.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Measurable Intended Learning Outcomes',
        stageNumber: 4,
        whatIsRequired: ['Formulate 4–6 clear, student-centered outcome statements.'],
        howToAlign: ['State what the student will be able to do, under what conditions, and to what standard.'],
        compliantExamples: [{ title: 'Universal CLO', description: 'CLO 1: Formulate a comprehensive 5-year corporate financial model evaluating net present value (NPV) and sensitivity under high-inflation scenarios.' }],
        practicalRecommendations: ['Use verbs from Bloom’s cognitive or affective domains.'],
        antiPatterns: ['Stating instructor objectives like "To teach the history of economics".'],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'Constructive Alignment Matrix',
        stageNumber: 5,
        whatIsRequired: ['Map each course outcome to corresponding program-level outcomes.'],
        howToAlign: ['Verify that no program outcome is left unaddressed.'],
        compliantExamples: [{ title: 'Alignment Map', description: 'CLO 1 -> PLO 1 & PLO 2 [High correlation].' }],
        practicalRecommendations: ['Review mapping with cross-disciplinary peers.'],
        antiPatterns: ['Loose mappings with no tangible link.'],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'Authentic Assessment Plan',
        stageNumber: 8,
        whatIsRequired: ['100% total assessment weighting combining formative and summative tasks.'],
        howToAlign: ['Design authentic assessment tasks that mirror professional real-world challenges.'],
        compliantExamples: [{ title: 'Authentic Assessment', description: 'Case Studies (25%), Simulation Game (25%), Midterm (20%), Final Capstone Dossier (30%). Total: 100%.' }],
        practicalRecommendations: ['Provide multiple opportunities for students to demonstrate competence (expanded opportunities).'],
        antiPatterns: ['Relying solely on memory-based midterm and final exams.'],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'Criteria-Referenced Rubrics',
        stageNumber: 9,
        whatIsRequired: ['Transparent analytic rubrics with distinct performance levels.'],
        howToAlign: ['Focus on qualitative evidence of mastery.'],
        compliantExamples: [{ title: 'Case Analysis Rubric', description: 'Strategic Insight, Evidence-Based Reasoning, Implementation Feasibility, Synthesis.' }],
        practicalRecommendations: ['Involve students in discussing the rubric prior to submission.'],
        antiPatterns: ['Using generic grades without descriptive criteria.'],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'Continuous Course Improvement',
        stageNumber: 10,
        whatIsRequired: ['Reflect on student outcome attainment and adjust course pedagogy accordingly.'],
        howToAlign: ['Document modifications to readings, exercises, or assignment prompts.'],
        compliantExamples: [{ title: 'Course Reflection Entry', description: 'Students found financial modeling pacing too steep in Week 4; added scaffolded templates.' }],
        practicalRecommendations: ['Review student exit surveys and external employer feedback.'],
        antiPatterns: ['Teaching the identical syllabus year after year without reflection.'],
      },
    },
  },
  'fw-abet-eac': {
    frameworkId: 'fw-abet-eac',
    frameworkName: 'ABET EAC (Engineering Accreditation Commission)',
    frameworkCode: 'ABET-EAC',
    accordOrStandard: 'ABET Criteria for Accrediting Engineering Programs (Criterion 3)',
    jurisdiction: 'United States & Global ABET-Accredited Programs',
    governingBody: 'ABET Engineering Accreditation Commission (EAC)',
    outcomeModel: 'Student Outcomes (SO 1 to 7)',
    description:
      'The gold standard criteria governing baccalaureate-level engineering programs, focusing on complex engineering problem solving, integrated design, ethical responsibility, and direct performance evidence.',
    corePhilosophy:
      'Graduates must be prepared to enter the professional practice of engineering through demonstrated mastery of mathematical modeling, scientific inquiry, iterative design under realistic constraints, and ethical leadership.',
    cognitiveRequirements:
      'Rigorous emphasis on Bloom’s C4 (Analyze), C5 (Evaluate), and C6 (Create). Direct performance indicators required for Criterion 3 evaluation.',
    attainmentThreshold:
      'Program benchmark typically set at 70% of students achieving >=60% on direct assessment rubrics.',
    graduateAttributes: [
      {
        code: 'SO 1',
        title: 'Complex Problem Solving',
        description: 'An ability to identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics.',
        keywords: ['Differential Equations', 'Conservation Laws', 'First Principles', 'Formulation'],
      },
      {
        code: 'SO 2',
        title: 'Engineering Design',
        description: 'An ability to apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors.',
        keywords: ['Iterative Design', 'Trade-off Analysis', 'Codes & Standards', 'Constraints'],
      },
      {
        code: 'SO 3',
        title: 'Effective Communication',
        description: 'An ability to communicate effectively with a range of audiences, including technical and non-technical stakeholders.',
        keywords: ['Design Reports', 'Oral Presentations', 'Executive Briefings', 'Documentation'],
      },
      {
        code: 'SO 4',
        title: 'Ethical & Professional Responsibility',
        description: 'An ability to recognize ethical and professional responsibilities in engineering situations and make informed judgments, which must consider the impact of engineering solutions in global, economic, environmental, and societal contexts.',
        keywords: ['NSPE Code', 'Public Safety', 'Sustainability', 'Conflict of Interest'],
      },
      {
        code: 'SO 5',
        title: 'Collaborative Teamwork',
        description: 'An ability to function effectively on a team whose members together provide leadership, create a collaborative and inclusive environment, establish goals, plan tasks, and meet objectives.',
        keywords: ['Multidisciplinary Teams', 'Project Management', 'Peer Evaluation', 'Milestones'],
      },
      {
        code: 'SO 6',
        title: 'Experimentation & Data Analysis',
        description: 'An ability to develop and conduct appropriate experimentation, analyze and interpret data, and use engineering judgment to draw conclusions.',
        keywords: ['Design of Experiments', 'Uncertainty Analysis', 'Statistical Inference', 'Instrumentation'],
      },
      {
        code: 'SO 7',
        title: 'Self-Directed Learning',
        description: 'An ability to acquire and apply new knowledge as needed, using appropriate learning strategies.',
        keywords: ['Lifelong Learning', 'Literature Synthesis', 'Emerging Tech', 'Self-Direction'],
      },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'ABET EAC Criterion 3 Scope',
        stageNumber: 1,
        whatIsRequired: [
          'Verify that program is preparing for ABET EAC evaluation under Criterion 3.',
          'Identify whether course is designated as an assessment point for SO 1 through SO 7.',
        ],
        howToAlign: [
          'Map specific course assignments to designated ABET EAC performance indicators.',
        ],
        compliantExamples: [
          {
            title: 'Mechanical Engineering Senior Design Scope',
            description: 'ME-480 Senior Capstone designated for direct assessment of ABET EAC SO 2 (Design), SO 4 (Ethics), and SO 5 (Teamwork).',
          },
        ],
        practicalRecommendations: [
          'Do not assess all 7 outcomes in one introductory course; distribute assessment across the curriculum.',
        ],
        antiPatterns: ['Attempting to collect ABET audit evidence from every single lecture topic.'],
      },
      step_course_info: {
        stageId: 'step_course_info',
        stageTitle: 'Course Catalog & ABET EAC Credit Hours',
        stageNumber: 2,
        whatIsRequired: [
          'Catalog description specifying engineering science vs engineering design credit breakdown.',
          'Clear statement of prerequisite courses and prerequisite proficiencies.',
        ],
        howToAlign: [
          'Calculate student weekly effort (1 credit = 3 hours student workload/week).',
        ],
        compliantExamples: [
          {
            title: 'Syllabus Credit Accounting',
            description: 'EE-310 Microelectronics, 4 Credits (3 credits engineering science, 1 credit engineering design). Prerequisites: EE-201 Circuits II.',
          },
        ],
        practicalRecommendations: ['Document lab contact hours and computer tool availability.'],
        antiPatterns: ['Omitting engineering design content in upper-level engineering courses.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'ABET EAC-Compliant Learning Outcomes',
        stageNumber: 4,
        whatIsRequired: [
          'Active verbs from Bloom’s Taxonomy with observable student performance products.',
          'At least 50% of CLOs must evaluate Bloom C3 (Apply), C4 (Analyze), or C6 (Design).',
        ],
        howToAlign: [
          'Avoid unmeasurable verbs like understand or learn.',
          'Define explicit engineering criteria (e.g. constraints, standards, tolerances).',
        ],
        compliantExamples: [
          {
            title: 'Compliant ABET EAC CLO Statements',
            description: 'Approved ABET EAC Course Learning Outcomes:',
            items: [
              'CLO 1 (Apply): Calculate static and dynamic stress tensors in structural elements using equilibrium and compatibility equations.',
              'CLO 2 (Analyze): Analyze thermal conduction and convection dissipation profiles in multi-layered microelectronic packages using finite difference models.',
              'CLO 3 (Design): Design an automated wastewater filtration subsystem satisfying ASME Section VIII pressure vessel codes and EPA effluent standards.',
              'CLO 4 (Evaluate): Evaluate the lifecycle environmental impact and economic payback of industrial solar PV installations using RETScreen software.',
            ],
          },
        ],
        practicalRecommendations: ['Maintain 3-5 CLOs per course for focused ABET direct assessment.'],
        antiPatterns: ['CLOs that assess attendance, effort, or textbook completion instead of competency.'],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'ABET EAC SO Articulation Matrix',
        stageNumber: 5,
        whatIsRequired: [
          'Map each CLO to one primary ABET EAC Student Outcome (SO 1 to 7).',
          'Document correlation level: 1 (Introductory), 2 (Intermediate), 3 (Advanced/Demonstration).',
        ],
        howToAlign: ['Every Level 3 correlation must have an explicit assessment rubric and student work archived.'],
        compliantExamples: [
          {
            title: 'ABET EAC Assessment Matrix',
            description: 'CLO 1 -> SO 1 (Problem Solving) [Level 3]\nCLO 3 -> SO 2 (Engineering Design) [Level 3]\nCLO 4 -> SO 4 (Ethical & Contextual Judgment) [Level 2]',
          },
        ],
        practicalRecommendations: ['Keep primary mappings clean and verifiable with student work portfolios.'],
        antiPatterns: ['Mapping every CLO to all 7 Student Outcomes without assessment evidence.'],
      },
      step_weekly_plan: {
        stageId: 'step_weekly_plan',
        stageTitle: 'Modular Syllabus & Engineering Design Progression',
        stageNumber: 6,
        whatIsRequired: ['16-week progression linking theoretical principles to design synthesis and laboratory validation.'],
        howToAlign: ['Tag each weekly topic with its corresponding CLO and ABET SO.'],
        compliantExamples: [{ title: 'Control Systems Modular Schedule', description: 'Weeks 1-4: Mathematical Modeling (SO 1), Weeks 5-9: Time & Frequency Response (SO 1), Weeks 10-14: Controller Synthesis & Bode Design (SO 2), Weeks 15-16: Laboratory Validation & Report (SO 6).' }],
        practicalRecommendations: ['Schedule design project milestones throughout the term rather than cramming into finals week.'],
        antiPatterns: ['Teaching abstract math for 15 weeks with zero design application.'],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'Direct Assessment of ABET EAC Student Outcomes',
        stageNumber: 8,
        whatIsRequired: ['Direct evaluation instruments: exams, design dossiers, lab practicums, and design defenses totaling 100%.'],
        howToAlign: ['Separate questions targeting specific ABET outcomes so sub-scores can be extracted for accreditation.'],
        compliantExamples: [{ title: 'Direct Assessment Plan', description: 'Midterm Exam (SO 1): 25%, Laboratory Experiments (SO 6): 20%, Team Design Capstone Project (SO 2, SO 3, SO 5): 30%, Final Examination (SO 1, SO 4): 25%.' }],
        practicalRecommendations: ['Archive sample student work (High, Medium, Low) for ABET display binders.'],
        antiPatterns: ['Using course grade averages alone as ABET outcome attainment evidence.'],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'ABET Criterion 3 Analytic Rubrics',
        stageNumber: 9,
        whatIsRequired: ['4-level rubric: Exemplary (4), Proficient (3), Developing (2), Unsatisfactory (1) with performance indicators.'],
        howToAlign: ['Performance descriptors must directly measure ABET performance indicators.'],
        compliantExamples: [{ title: 'ABET EAC Engineering Design Rubric', description: 'Criteria: Problem Framing, Solution Alternatives, Design Execution under Constraints, Codes Compliance, Validation.' }],
        practicalRecommendations: ['Share rubrics with students at assignment launch.'],
        antiPatterns: ['Vague rubric categories such as "Effort" or "Neatness" without technical criteria.'],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'Continuous Quality Improvement (Criterion 4)',
        stageNumber: 10,
        whatIsRequired: ['Document outcome attainment percentage against target benchmark and formulate corrective actions.'],
        howToAlign: ['Document how prior semester feedback improved current course design.'],
        compliantExamples: [{ title: 'ABET CQI Closing-the-Loop Report', description: 'Target: 75% of students achieve >=70% on SO 2 design rubric. Result: 68% attained. Action: Introduced 2 intermediate CAD milestone reviews in Weeks 6 and 10.' }],
        practicalRecommendations: ['Present CQI findings to department curriculum committee annually.'],
        antiPatterns: ['Collecting assessment data without ever enacting curriculum adjustments.'],
      },
    },
  },
  'fw-seoul-accord': {
    frameworkId: 'fw-seoul-accord',
    frameworkName: 'Seoul Accord-aligned Computing OBE',
    frameworkCode: 'SA-COMP',
    accordOrStandard: 'International Computing Education Agreement',
    jurisdiction: 'International (ABET CAC, BCS, ACS, CIPS, JABEE, etc.)',
    governingBody: 'Seoul Accord Signatories',
    outcomeModel: 'Computing Graduate Attributes (CGA 1 to 10)',
    description:
      'The international agreement establishing mutual recognition of computing and IT degree programs, requiring graduates to demonstrate competence in solving Complex Computing Problems.',
    corePhilosophy:
      'Computing graduates must design, implement, and evaluate algorithmic and systemic software solutions that address ill-defined computing problems with formal complexity, security, and societal impact.',
    cognitiveRequirements:
      'Emphasis on algorithmic analysis, software architecture, data structures, formal verification, and secure software development lifecycles.',
    attainmentThreshold: 'Departmental benchmark >=65% of cohort reaching satisfactory threshold.',
    graduateAttributes: [
      { code: 'CGA 1', title: 'Computing Knowledge', description: 'Apply knowledge of computing fundamentals, mathematics, and science to complex computing problems.', keywords: ['Algorithms', 'Discrete Math', 'Data Structures'] },
      { code: 'CGA 2', title: 'Problem Analysis', description: 'Identify, formulate, research literature, and analyze complex computing problems reaching substantiated conclusions.', keywords: ['Computational Complexity', 'Big-O', 'Verification'] },
      { code: 'CGA 3', title: 'Design/Development of Solutions', description: 'Design computing solutions for complex problems meeting specified requirements with safety and ethical factors.', keywords: ['Architecture', 'API Design', 'Security by Design'] },
      { code: 'CGA 4', title: 'Modern Tool Usage', description: 'Create, select, and apply appropriate computing tools, frameworks, and cloud platforms.', keywords: ['IDEs', 'Git CI/CD', 'Docker', 'Profiling'] },
      { code: 'CGA 5', title: 'Individual and Team Work', description: 'Function effectively as an individual, and as a member or leader in diverse software teams.', keywords: ['Agile', 'Scrum', 'Code Reviews', 'Collaboration'] },
      { code: 'CGA 6', title: 'Communication', description: 'Communicate effectively on complex computing activities through documentation and presentations.', keywords: ['UML Specs', 'API Docs', 'Client Defenses'] },
      { code: 'CGA 7', title: 'Computing and Society', description: 'Analyze the societal and legal impacts of computing systems including privacy and access.', keywords: ['GDPR', 'AI Bias', 'Digital Accessibility'] },
      { code: 'CGA 8', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics and responsibilities of computing practice.', keywords: ['ACM Code', 'Security Vulnerabilities', 'Data Stewardship'] },
      { code: 'CGA 9', title: 'Life-long Learning', description: 'Recognize the need for and have the ability to engage in independent computing learning.', keywords: ['Open Source', 'Self-Directed Upskilling', 'Documentation'] },
      { code: 'CGA 10', title: 'Security', description: 'Incorporate security principles into system analysis, design, and software implementation.', keywords: ['Threat Modeling', 'OWASP Top 10', 'Encryption'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'Seoul Accord Computing Scope',
        stageNumber: 1,
        whatIsRequired: ['Affirm that program leads to a recognized 4-year degree in Computer Science, Software Engineering, or Information Systems.'],
        howToAlign: ['Align course scope with Complex Computing Problems definition.'],
        compliantExamples: [{ title: 'CS Core Alignment', description: 'CS-301 Algorithms & Complexity mapped to CGA 1 (Computing Knowledge) and CGA 2 (Problem Analysis).' }],
        practicalRecommendations: ['Ensure core programming and algorithm tracks follow Seoul Accord depth.'],
        antiPatterns: ['Treating programming as mere tool syntax rather than algorithmic problem solving.'],
      },
      step_course_info: {
        stageId: 'step_course_info',
        stageTitle: 'Computing Course Setup & Workload',
        stageNumber: 2,
        whatIsRequired: ['Theory vs laboratory programming workload specification.'],
        howToAlign: ['Allocate adequate hands-on coding time (at least 2 hours lab per theory credit).'],
        compliantExamples: [{ title: 'Software Engineering Course Setup', description: 'SE-320 Software Architecture, 3+1 Credits, 16 weeks duration.' }],
        practicalRecommendations: ['Specify required developer toolchains (e.g. Node.js, Python, Git, Docker).'],
        antiPatterns: ['Zero programming assignments in core computing theory courses.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Computing Course Learning Outcomes',
        stageNumber: 4,
        whatIsRequired: ['Measurable action verbs describing computational analysis, design, or secure implementation.'],
        howToAlign: ['At least 2 CLOs must involve designing software or analyzing algorithmic complexity.'],
        compliantExamples: [{
          title: 'Seoul Accord Compliant CLOs',
          description: 'Approved Computing CLOs:',
          items: [
            'CLO 1 (Analyze): Analyze the worst-case asymptotic time and space complexity of graph traversal algorithms using Big-O notation.',
            'CLO 2 (Design): Design a modular microservice architecture satisfying asynchronous message queuing and fault tolerance constraints.',
            'CLO 3 (Create): Implement a secure RESTful API incorporating OAuth 2.0 authentication and input sanitization to mitigate OWASP Top 10 vulnerabilities.',
            'CLO 4 (Evaluate): Evaluate competing relational and NoSQL database schemas for distributed transaction latency under concurrent write loads.',
          ],
        }],
        practicalRecommendations: ['Use action verbs like implement, design, analyze, benchmark rather than understand.'],
        antiPatterns: ['CLOs stating "Students will learn Java" without functional competency.'],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'Seoul Accord CGA Mapping Matrix',
        stageNumber: 5,
        whatIsRequired: ['Map each CLO to Seoul Accord Graduate Attributes (CGA 1 to 10) with correlation levels 1 to 3.'],
        howToAlign: ['Ensure software projects map to CGA 3 (Design), CGA 5 (Teamwork), and CGA 10 (Security).'],
        compliantExamples: [{ title: 'Computing Matrix', description: 'CLO 1 -> CGA 2 (Problem Analysis) [Level 3]\nCLO 3 -> CGA 10 (Security) [Level 3]' }],
        practicalRecommendations: ['Include security (CGA 10) across multiple core computing courses.'],
        antiPatterns: ['Omitting security and ethical considerations in computing curricula.'],
      },
      step_weekly_plan: {
        stageId: 'step_weekly_plan',
        stageTitle: 'Weekly Computing Syllabus & Lab Schedule',
        stageNumber: 6,
        whatIsRequired: ['16-week progression coordinating lectures with practical coding labs.'],
        howToAlign: ['Align weekly assignments with CLOs and GitHub repository submissions.'],
        compliantExamples: [{ title: 'Operating Systems Syllabus', description: 'Weeks 1-4: Process Management (CGA 1), Weeks 5-8: Concurrency & Synchronization (CGA 2), Weeks 9-12: Memory & Paging (CGA 1), Weeks 13-16: File Systems & Security (CGA 10).' }],
        practicalRecommendations: ['Use automated test suites for continuous grading in weekly labs.'],
        antiPatterns: ['Pure theory without practical coding deliverables.'],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'Computing Assessment Plan',
        stageNumber: 8,
        whatIsRequired: ['Programming assignments, midterm examinations, team term projects, and practical coding tests.'],
        howToAlign: ['Weight programming and design deliverables >= 40% of total course marks.'],
        compliantExamples: [{ title: 'Assessment Breakdown', description: 'Weekly Coding Assignments: 25%, Midterm Exam: 20%, Team Software Project: 30%, Final Practical Exam: 25%.' }],
        practicalRecommendations: ['Use plagiarism detection (e.g. MOSS) for coding assignments.'],
        antiPatterns: ['Assessing programming proficiency exclusively through pen-and-paper exams.'],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'Software & Code Quality Rubrics',
        stageNumber: 9,
        whatIsRequired: ['Criteria measuring algorithmic correctness, code clarity, unit test coverage, and documentation.'],
        howToAlign: ['Define explicit standards for passing test cases and clean code principles.'],
        compliantExamples: [{ title: 'Software Project Rubric', description: 'Criteria: Correctness (40%), Architecture & Modularity (20%), Automated Tests (20%), Security (10%), Documentation (10%).' }],
        practicalRecommendations: ['Include test coverage metrics in the rubric.'],
        antiPatterns: ['Grading code solely on whether it runs without inspecting architecture or tests.'],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'Continuous Computing Curriculum Evolution',
        stageNumber: 10,
        whatIsRequired: ['Annual review of modern toolchains and student coding attainment scores.'],
        howToAlign: ['Update software frameworks and libraries to reflect contemporary industry practices.'],
        compliantExamples: [{ title: 'Curriculum Update', description: 'Migrated web development course stack from monolithic MVC to modern TypeScript and cloud containerization based on industry advisory feedback.' }],
        practicalRecommendations: ['Consult industry advisory boards for tool relevance.'],
        antiPatterns: ['Retaining outdated compiler versions and legacy languages for decades.'],
      },
    },
  },
  'fw-sydney-accord': {
    frameworkId: 'fw-sydney-accord',
    frameworkName: 'Sydney Accord-aligned Engineering Technology OBE',
    frameworkCode: 'SA-ET',
    accordOrStandard: 'International Engineering Alliance (IEA) Level I Accord',
    jurisdiction: 'International (IEA Signatories)',
    governingBody: 'International Engineering Alliance (IEA)',
    outcomeModel: 'Engineering Technology Graduate Attributes (SA1 to SA12)',
    description:
      'The international agreement establishing mutual recognition of engineering technologist degree programmes, focusing on Broadly-Defined Engineering Technology Problems.',
    corePhilosophy:
      'Engineering technologists apply established engineering techniques, codes, and empirical methodologies to solve broadly-defined practical and operational technology challenges.',
    cognitiveRequirements:
      'Strong focus on Bloom C3 (Apply) and C4 (Analyze) coupled with hands-on laboratory psychomotor competencies (P3-P6).',
    attainmentThreshold: 'Cohort attainment threshold >=60% passing benchmark.',
    graduateAttributes: [
      { code: 'SA1', title: 'Engineering Technology Knowledge', description: 'Apply knowledge of applied mathematics, natural science, and technology fundamentals to broadly-defined engineering problems.', keywords: ['Applied Math', 'Codes & Standards', 'Empirical Methods'] },
      { code: 'SA2', title: 'Problem Analysis', description: 'Identify, formulate, review literature, and analyze broadly-defined engineering technology problems.', keywords: ['Technical Troubleshooting', 'Diagnostic Analysis', 'Root Cause'] },
      { code: 'SA3', title: 'Design/Development of Solutions', description: 'Design solutions for broadly-defined engineering technology problems and assist with system or process design.', keywords: ['Applied Design', 'CAD Detailing', 'Component Selection'] },
      { code: 'SA4', title: 'Investigation', description: 'Conduct investigations of broadly-defined problems using established test procedures and standard experimental methods.', keywords: ['Standard Testing', 'ASTM/ISO Protocols', 'Data Logging'] },
      { code: 'SA5', title: 'Modern Tool Usage', description: 'Apply appropriate techniques, resources, and modern engineering technology and IT tools with an awareness of limitations.', keywords: ['Diagnostic Tools', 'Simulators', 'Calibration Tools'] },
      { code: 'SA6', title: 'The Technologist and Society', description: 'Demonstrate understanding of societal, health, safety, and legal issues relevant to technology practice.', keywords: ['OSHA', 'Workplace Safety', 'Building Codes'] },
      { code: 'SA7', title: 'Environment and Sustainability', description: 'Understand and evaluate sustainability and environmental impacts of technology solutions.', keywords: ['Energy Efficiency', 'Waste Mitigation', 'Life Cycle'] },
      { code: 'SA8', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics and technological responsibilities.', keywords: ['Professional Conduct', 'Safety Whistleblowing'] },
      { code: 'SA9', title: 'Individual and Team Work', description: 'Function effectively as an individual, and as a member or leader in diverse technical teams.', keywords: ['Field Teams', 'Project Coordination', 'Supervision'] },
      { code: 'SA10', title: 'Communication', description: 'Communicate effectively on broadly-defined technical activities through diagrams, reports, and clear instructions.', keywords: ['Shop Drawings', 'Work Instructions', 'Technical Reports'] },
      { code: 'SA11', title: 'Project Management and Finance', description: 'Apply knowledge of engineering management principles and cost estimation to technology projects.', keywords: ['Bill of Materials (BOM)', 'Cost Estimation', 'Scheduling'] },
      { code: 'SA12', title: 'Lifelong Learning', description: 'Recognize the need for and have the ability to engage in independent lifelong technological learning.', keywords: ['Manufacturer Manuals', 'Vendor Certifications'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'Sydney Accord Framework Scope',
        stageNumber: 1,
        whatIsRequired: ['Confirm bachelor of technology program alignment with IEA Sydney Accord criteria.'],
        howToAlign: ['Target broadly-defined engineering technology problems rather than open-ended research problems.'],
        compliantExamples: [{ title: 'ET Program Scope', description: 'ET-302 Applied Hydraulics aligned with Sydney Accord SA1 and SA5.' }],
        practicalRecommendations: ['Ensure lab and field equipment meet modern industrial standards.'],
        antiPatterns: ['Confusing technology programs with 4-year theoretical engineering science programs.'],
      },
      step_course_info: {
        stageId: 'step_course_info',
        stageTitle: 'Applied Technology Course Setup',
        stageNumber: 2,
        whatIsRequired: ['Balanced theory and laboratory/field practicum contact hours (minimum 1:1 or 2:1 ratio).'],
        howToAlign: ['Document safety certifications and PPE requirements in course setup.'],
        compliantExamples: [{ title: 'Electrical Technology Course', description: 'ET-210 Industrial Motor Drives, 3 Credits (2 theory + 1 lab = 2 hrs lecture + 3 hrs shop lab/week).' }],
        practicalRecommendations: ['List industrial machinery and simulation software prerequisites.'],
        antiPatterns: ['Omitting laboratory hours in practical technology courses.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Technology Course Learning Outcomes',
        stageNumber: 4,
        whatIsRequired: ['Action verbs emphasizing implementation, troubleshooting, calibration, testing, and standard design.'],
        howToAlign: ['Include psychomotor domain verbs (calibrate, assemble, wire, inspect, test).'],
        compliantExamples: [{
          title: 'Sydney Accord Compliant CLOs',
          description: 'Approved Engineering Technology CLOs:',
          items: [
            'CLO 1 (Apply): Implement programmable logic controller (PLC) ladder logic to automate sequential pneumatic actuator cycles.',
            'CLO 2 (Analyze): Diagnose electrical harmonic faults in three-phase induction drives using digital power analyzers and oscilloscope waveforms.',
            'CLO 3 (Design): Draft complete electrical control schematics conforming to NFPA 79 industrial machinery standards using AutoCAD Electrical.',
            'CLO 4 (Evaluate): Inspect commercial HVAC piping installations against ASHRAE 90.1 energy conservation standards.',
          ],
        }],
        practicalRecommendations: ['Balance cognitive problem analysis with psychomotor technical skill.'],
        antiPatterns: ['Purely theoretical outcomes with no demonstrable application or testing.'],
      },
      step_plo_mapping: {
        stageId: 'step_plo_mapping',
        stageTitle: 'Sydney Accord Articulation Matrix',
        stageNumber: 5,
        whatIsRequired: ['Map CLOs to Graduate Attributes SA1 to SA12 with weights 1, 2, or 3.'],
        howToAlign: ['Link hands-on lab outcomes to SA4 (Investigation/Testing) and SA5 (Tool Usage).'],
        compliantExamples: [{ title: 'ET Matrix Example', description: 'CLO 1 -> SA3 (Applied Design) [Level 3]\nCLO 2 -> SA2 (Problem Analysis/Troubleshooting) [Level 3]' }],
        practicalRecommendations: ['Ensure workplace safety (SA6) is assessed in all laboratory courses.'],
        antiPatterns: ['Mapping to research attributes when students are doing standard technician tasks.'],
      },
      step_weekly_plan: {
        stageId: 'step_weekly_plan',
        stageTitle: 'Weekly Technology & Lab Progression',
        stageNumber: 6,
        whatIsRequired: ['16-week progression integrating classroom theory with weekly hands-on laboratory exercises.'],
        howToAlign: ['Ensure each week lists specific technical equipment and safety standards.'],
        compliantExamples: [{ title: 'Manufacturing Technology Schedule', description: 'Weeks 1-4: CNC Machining Fundamentals, Weeks 5-8: G-Code Programming & Toolpath Simulation, Weeks 9-12: Precision Metrology & CMM Inspection, Weeks 13-16: Part Fabrication & Quality Control.' }],
        practicalRecommendations: ['Enforce shop safety quizzes in Week 1 before equipment operation.'],
        antiPatterns: ['Leaving all lab experiments to the last 2 weeks.'],
      },
      step_assessments: {
        stageId: 'step_assessments',
        stageTitle: 'Technology Assessment Plan',
        stageNumber: 8,
        whatIsRequired: ['Practical laboratory exams, technical troubleshooting tests, and engineering documentation.'],
        howToAlign: ['At least 35% of total course marks must be derived from direct practical lab performance.'],
        compliantExamples: [{ title: 'Assessment Breakdown', description: 'Laboratory Practicums: 35%, Troubleshooting Practical Exam: 20%, Midterm Exam: 20%, Final Comprehensive Examination: 25%.' }],
        practicalRecommendations: ['Use timed practical exams where students troubleshoot real physical faults.'],
        antiPatterns: ['Evaluating lab performance through written attendance records alone.'],
      },
      step_rubrics: {
        stageId: 'step_rubrics',
        stageTitle: 'Hands-on Technical Performance Rubrics',
        stageNumber: 9,
        whatIsRequired: ['Rubrics assessing procedural safety, tool handling, measurement accuracy, and technical reporting.'],
        howToAlign: ['Define quantitative tolerance bands (e.g. within ±0.05mm, voltage within ±2%).'],
        compliantExamples: [{ title: 'Practical Lab Rubric', description: 'Criteria: Safety Adherence (25%), Wiring Accuracy (25%), Troubleshooting Methodology (25%), Equipment Housekeeping (25%).' }],
        practicalRecommendations: ['Grade safety violations immediately with required remediation.'],
        antiPatterns: ['Subjective grading without clear measurement thresholds.'],
      },
      step_cqi: {
        stageId: 'step_cqi',
        stageTitle: 'Continuous Technology Improvement',
        stageNumber: 10,
        whatIsRequired: ['Equipment maintenance logs, industrial advisory reviews, and student skill attainment tracking.'],
        howToAlign: ['Document tooling upgrades and curriculum modifications based on industrial partner feedback.'],
        compliantExamples: [{ title: 'Lab Improvement Plan', description: 'Replaced legacy analog oscilloscopes with digital storage oscilloscopes with automated bus decoding based on employer feedback.' }],
        practicalRecommendations: ['Involve industrial technicians in reviewing senior projects.'],
        antiPatterns: ['Using obsolete industrial equipment that no longer reflects modern shop floors.'],
      },
    },
  },
};

/**
 * Helper to retrieve guidelines for a specific framework or fall back to General OBE
 */
export function getFrameworkGuideline(frameworkId?: string): FrameworkDetailedGuideline {
  if (!frameworkId) return FRAMEWORK_GUIDELINES['fw-general-obe'];

  // Direct match
  if (FRAMEWORK_GUIDELINES[frameworkId]) {
    return FRAMEWORK_GUIDELINES[frameworkId];
  }

  // Name or code matching
  const norm = frameworkId.toLowerCase().trim();
  if (norm.includes('washington') || norm.includes('wa-eng') || norm === 'wa') {
    return FRAMEWORK_GUIDELINES['fw-washington-accord'];
  }
  if (norm.includes('eac') || norm.includes('abet-eac')) {
    return FRAMEWORK_GUIDELINES['fw-abet-eac'] || FRAMEWORK_GUIDELINES['fw-washington-accord'];
  }
  if (norm.includes('cac') || norm.includes('abet-cac') || norm.includes('computing')) {
    return FRAMEWORK_GUIDELINES['fw-abet-cac'];
  }
  if (norm.includes('seoul') || norm.includes('sa-comp')) {
    return FRAMEWORK_GUIDELINES['fw-seoul-accord'] || FRAMEWORK_GUIDELINES['fw-abet-cac'];
  }
  if (norm.includes('sydney') || norm.includes('sa-et') || norm.includes('technology')) {
    return FRAMEWORK_GUIDELINES['fw-sydney-accord'] || FRAMEWORK_GUIDELINES['fw-washington-accord'];
  }
  if (norm.includes('etac')) {
    return FRAMEWORK_GUIDELINES['fw-sydney-accord'] || FRAMEWORK_GUIDELINES['fw-washington-accord'];
  }
  if (norm.includes('hec') || norm.includes('pakistan')) {
    return FRAMEWORK_GUIDELINES['fw-hec-pakistan'];
  }
  if (norm.includes('nba') || norm.includes('india')) {
    return FRAMEWORK_GUIDELINES['fw-nba-india'];
  }

  return FRAMEWORK_GUIDELINES['fw-washington-accord'] || FRAMEWORK_GUIDELINES['fw-general-obe'];
}

/**
 * Retrieves guideline for a specific stage under the specified framework
 */
export function getStageGuideline(
  frameworkId?: string,
  stageKey?: string
): FrameworkStageGuideline | null {
  const fw = getFrameworkGuideline(frameworkId);
  if (!fw || !fw.stages) return null;

  if (stageKey && fw.stages[stageKey]) {
    return fw.stages[stageKey];
  }

  // Fallback to first available stage
  const keys = Object.keys(fw.stages);
  return keys.length > 0 ? fw.stages[keys[0]] : null;
}
