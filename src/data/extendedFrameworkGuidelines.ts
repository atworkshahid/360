import { FrameworkDetailedGuideline } from './frameworkGuidelines';

export const EXTENDED_FRAMEWORK_GUIDELINES: Record<string, FrameworkDetailedGuideline> = {
  // 1. DUBLIN ACCORD
  'fw-dublin-accord': {
    frameworkId: 'fw-dublin-accord',
    frameworkName: 'Dublin Accord-aligned Engineering Technician OBE',
    frameworkCode: 'DA-ENGTECH',
    accordOrStandard: 'International Engineering Alliance (IEA) Level I Accord',
    jurisdiction: 'International (ECUK, ABET, Engineers Canada, Engineers Ireland, etc.)',
    governingBody: 'International Engineering Alliance (IEA)',
    outcomeModel: '12 Technician Graduate Attributes (DA1–DA12) & Well-Defined Engineering Problems (WDP)',
    description:
      'The international benchmark for 2-year associate degrees and diploma engineering technician programmes, specifying practical problem solving across Well-Defined Engineering Problems.',
    corePhilosophy:
      'Technicians apply established engineering procedures, codebooks, technical diagnostics, and hands-on craftsmanship to construct, maintain, and troubleshoot well-defined operational systems.',
    cognitiveRequirements:
      'Emphasis on Bloom’s Taxonomy L2 (Understand), L3 (Apply), and Psychomotor execution (P3–P5). Minimum 40% practical laboratory, workshop, and technical testing evidence.',
    attainmentThreshold:
      'Minimum individual passing benchmark at 50%, with cohort attainment target of ≥65% achieving benchmark competency.',
    graduateAttributes: [
      { code: 'DA1', title: 'Engineering Technician Knowledge', description: 'Apply knowledge of underlying engineering fundamentals and technical principles to solve well-defined problems.', keywords: ['Technical Fundamentals', 'Codified Knowledge', 'Applied Math', 'Workshop Principles'] },
      { code: 'DA2', title: 'Problem Analysis (Well-Defined)', description: 'Identify, clarify and analyze well-defined engineering problems using standard procedures.', keywords: ['Troubleshooting', 'Root Cause', 'Technical Diagnostics', 'Codified Procedures'] },
      { code: 'DA3', title: 'Design/Implementation of Solutions', description: 'Contribute to the design and implementation of technical solutions according to standard specifications.', keywords: ['Component Assembly', 'Standard Specifications', 'CAD Draughting', 'System Build'] },
      { code: 'DA4', title: 'Investigation & Technical Testing', description: 'Conduct tests and measurements, calibrate instruments, and interpret experimental data on technical systems.', keywords: ['Instrumentation', 'Oscilloscope/Multimeter', 'Calibration', 'Measurement Accuracy'] },
      { code: 'DA5', title: 'Modern Technical Tool Usage', description: 'Operate and apply appropriate modern workshop tools, diagnostic equipment, and software.', keywords: ['Workshop Tooling', 'PLC Programming', 'Diagnostic Scanners', 'Safety Protocols'] },
      { code: 'DA6', title: 'The Technician in Society', description: 'Demonstrate awareness of health, safety, and legal requirements pertinent to technical practice.', keywords: ['OSHA/HSE Compliance', 'Industrial Safety', 'Standard Codes', 'Public Protection'] },
      { code: 'DA7', title: 'Environment & Sustainability', description: 'Understand and apply sustainable practices in operational tasks and waste minimization.', keywords: ['Resource Efficiency', 'Hazardous Waste', 'Recycling', 'Energy Conservation'] },
      { code: 'DA8', title: 'Technician Ethics', description: 'Understand and commit to ethical professional practice, craftsmanship, and safety obligations.', keywords: ['Integrity', 'Craftsmanship', 'Whistleblowing', 'Ethical Standards'] },
      { code: 'DA9', title: 'Individual and Team Work', description: 'Function effectively as an individual, and as a collaborative technical team member.', keywords: ['Shop Floor Collaboration', 'Shift Handover', 'Punctuality', 'Interpersonal Skills'] },
      { code: 'DA10', title: 'Technical Communication', description: 'Communicate effectively through engineering drawings, technical reports, operational logs, and clear briefings.', keywords: ['Schematic Drawings', 'Maintenance Logs', 'Work Orders', 'Technical Reports'] },
      { code: 'DA11', title: 'Operational Project Practice', description: 'Demonstrate awareness of project task scheduling, workshop budgeting, and resource utilization.', keywords: ['Job Card Estimation', 'Bill of Materials', 'Preventative Maintenance', 'Time Tracking'] },
      { code: 'DA12', title: 'Continuing Technical Development', description: 'Recognize the necessity of maintaining personal technical skills and adapting to evolving industrial equipment.', keywords: ['Lifelong Learning', 'Vendor Certifications', 'Continuous Upskilling', 'Modern Tool Mastery'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'Dublin Accord Technician Alignment',
        stageNumber: 1,
        whatIsRequired: ['Verify course belongs to 2-year technician diploma or associate degree curriculum.', 'Map against DA1–DA12 technician attributes.'],
        howToAlign: ['Select Dublin Accord in framework step and ensure technician nomenclature.'],
        compliantExamples: [{ title: 'Electrical Maintenance Diploma', description: 'Aligned to DA1, DA4, and DA5 with emphasis on PLC troubleshooting and safety regulations.' }],
        practicalRecommendations: ['Ensure course learning outcomes emphasize observable technical skills rather than abstract derivations.'],
        antiPatterns: ['Treating technician courses like theoretical 4-year engineering research courses without shop-floor activities.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Observable Technical Learning Outcomes',
        stageNumber: 4,
        whatIsRequired: ['Formulate 3 to 5 measurable outcomes starting with active technical Bloom verbs (Troubleshoot, Calibrate, Assemble, Test, Inspect).'],
        howToAlign: ['Begin CLO statements with observable diagnostic and execution verbs.'],
        compliantExamples: [{ title: 'Mechatronics CLO', description: 'Calibrate pneumatic pressure sensors and diagnose PLC input/output bus faults using digital multimeters.' }],
        practicalRecommendations: ['Include practical assessment criteria in outcome statement.'],
        antiPatterns: ['Using passive non-observable verbs such as "understand schematics".'],
      },
    },
  },

  // ABET ETAC (Engineering Technology Accreditation Commission)
  'fw-abet-etac': {
    frameworkId: 'fw-abet-etac',
    frameworkName: 'ABET ETAC (Engineering Technology Accreditation Commission)',
    frameworkCode: 'ABET-ETAC',
    accordOrStandard: 'ABET Criteria for Accrediting Engineering Technology Programs (Criterion 3)',
    jurisdiction: 'United States & Global Accredited Programs',
    governingBody: 'ABET Engineering Technology Accreditation Commission',
    outcomeModel: 'Student Outcomes (SO 1 to 5)',
    description:
      'Criteria for Accrediting Engineering Technology Programs under Criterion 3: Student Outcomes 1 through 5, emphasizing applied engineering design, laboratory experimentation, modern technical tools, and project teamwork.',
    corePhilosophy:
      'Engineering technology graduates apply engineering principles, modern diagnostic equipment, and hands-on laboratory experimentation to solve applied technical problems under realistic constraints.',
    cognitiveRequirements:
      'Emphasis on Bloom C3 (Apply) and C4 (Analyze) coupled with practical laboratory execution (P3-P5). Minimum 35% assessment weighting on direct lab deliverables.',
    attainmentThreshold:
      'Program benchmark typically set at 70% of students scoring >= 65% on direct assessment rubrics.',
    graduateAttributes: [
      { code: 'SO 1', title: 'Problem Solving in Engineering Technology', description: 'Apply knowledge, techniques, skills and modern tools of mathematics, science, engineering, and technology to solve broadly-defined engineering problems.', keywords: ['Applied Problem Solving', 'Modern Tools', 'Technical Math', 'Engineering Technology'] },
      { code: 'SO 2', title: 'Applied Engineering Design', description: 'Design systems, components, or processes meeting specified needs for broadly-defined engineering problems appropriate to the discipline.', keywords: ['Applied Design', 'CAD Detailing', 'Component Sizing', 'Realistic Constraints'] },
      { code: 'SO 3', title: 'Technical Communication', description: 'Apply written, oral, and graphical communication in broadly-defined technical and non-technical environments.', keywords: ['Technical Reports', 'Drafting', 'Oral Defenses', 'Shop Drawings'] },
      { code: 'SO 4', title: 'Experimentation & Testing', description: 'Conduct standard tests, measurements, and experiments and to analyze and interpret the results to improve processes.', keywords: ['Standard Testing', 'ASTM/ISO Standards', 'Instrumentation', 'Data Interpretation'] },
      { code: 'SO 5', title: 'Technical Teamwork', description: 'Function effectively as a member as well as a leader on technical teams.', keywords: ['Multidisciplinary Teams', 'Project Milestones', 'Peer Accountability'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'ABET ETAC Scope & Applied Technology Principles',
        stageNumber: 1,
        whatIsRequired: ['Verify program alignment with ABET ETAC Criterion 3 Student Outcomes (SO 1 to 5).', 'Maintain substantial hands-on laboratory component.'],
        howToAlign: ['Select ABET ETAC and align course outcomes with applied engineering technology competencies.'],
        compliantExamples: [{ title: 'Applied Fluid Power Scope', description: 'MET-340 aligned with ETAC SO 1 (Problem Solving) and SO 4 (Experimentation & Testing).' }],
        practicalRecommendations: ['Ensure lab test benches reflect contemporary industrial diagnostic equipment.'],
        antiPatterns: ['Omitting physical laboratory testing evidence from ETAC course files.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'Applied Engineering Technology Outcomes',
        stageNumber: 4,
        whatIsRequired: ['Formulate 3 to 5 outcomes starting with active technical Bloom verbs (Design, Fabricate, Calibrate, Test, Troubleshoot).'],
        howToAlign: ['Specify explicit industry standards and tolerances (ISO, ASTM, NFPA).'],
        compliantExamples: [{ title: 'Fluid Power CLO', description: 'Design and test an electro-pneumatic sequencing circuit meeting NFPA 79 safety interlock standards.' }],
        practicalRecommendations: ['Balance cognitive calculations with hands-on workbench testing.'],
        antiPatterns: ['Purely theoretical derivations without demonstrable application.'],
      },
    },
  },

  // 2. AACSB BUSINESS
  'fw-aacsb': {
    frameworkId: 'fw-aacsb',
    frameworkName: 'AACSB International Business Accreditation',
    frameworkCode: 'AACSB',
    accordOrStandard: 'AACSB 2020 Guiding Principles & Standards (Standards 4 & 5)',
    jurisdiction: 'Global Collegiate Schools of Business (950+ Universities)',
    governingBody: 'AACSB International (Association to Advance Collegiate Schools of Business)',
    outcomeModel: 'Assurance of Learning (AoL) Competency Goals & Direct Programmatic Rubrics',
    description:
      'The preeminent worldwide business accreditation standard requiring rigorous Assurance of Learning (AoL) systems, continuous curriculum improvement, and multi-trait evaluative rubrics.',
    corePhilosophy:
      'Business education must cultivate strategic acumen, ethical leadership, quantitative data analytics, and inclusive communication through systematic evidence of student competency achievement.',
    cognitiveRequirements:
      'High emphasis on Bloom’s Taxonomy L4 (Analyze), L5 (Evaluate), and L6 (Create). AoL requires direct assessment via embedded rubric traits across multiple performance levels.',
    attainmentThreshold:
      'Departmental benchmark typically requires ≥75% of assessed students achieving "Meets Expectations" (Proficient) or "Exceeds Expectations" on multi-trait programmatic rubrics.',
    graduateAttributes: [
      { code: 'CG1', title: 'Strategic Business Acumen', description: 'Synthesize core disciplinary business concepts across finance, marketing, operations, and management to solve complex corporate challenges.', keywords: ['Strategic Management', 'Market Competitiveness', 'Financial Acumen', 'Executive Decision-Making'] },
      { code: 'CG2', title: 'Data Analytics & Digital Technology', description: 'Apply quantitative reasoning, business intelligence tools, and data analytics to optimize managerial decision making.', keywords: ['Predictive Analytics', 'Business Intelligence', 'Data Visualization', 'Digital Transformation'] },
      { code: 'CG3', title: 'Ethical Reasoning & Corporate Social Responsibility', description: 'Identify ethical dilemmas in business environments, formulate principles-based solutions, and evaluate societal and ESG impacts.', keywords: ['ESG Principles', 'Stakeholder Ethics', 'Whistleblowing', 'Sustainable Enterprise'] },
      { code: 'CG4', title: 'Executive & Strategic Communication', description: 'Deliver persuasive, data-supported executive presentations and professional business reports to diverse stakeholder groups.', keywords: ['Executive Pitch', 'Data Storytelling', 'Boardroom Presentations', 'Business Reporting'] },
      { code: 'CG5', title: 'Collaborative Leadership & Cross-Functional Teamwork', description: 'Demonstrate inclusive leadership, negotiation skills, and high-performance team collaboration in multicultural corporate environments.', keywords: ['Inclusive Leadership', 'Conflict Resolution', 'Cross-Functional Teams', 'Negotiation'] },
      { code: 'CG6', title: 'Global Business Perspectives', description: 'Analyze international market opportunities, cross-border macroeconomic risks, and cultural dynamics in global enterprise operations.', keywords: ['Global Strategy', 'Cross-Border Supply Chain', 'Emerging Markets', 'Cultural Intelligence'] },
      { code: 'CG7', title: 'Critical Thinking & Innovative Entrepreneurship', description: 'Formulate viable business models, evaluate commercial risk, and design innovative solutions for market disruptions.', keywords: ['Business Model Canvas', 'Venture Feasibility', 'Disruptive Innovation', 'Commercial Risk'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'AACSB Assurance of Learning (AoL) Binding',
        stageNumber: 1,
        whatIsRequired: ['Identify program competency goals (CG) and course-level learning objectives (LO).', 'Establish direct embedded assessment mechanisms.'],
        howToAlign: ['Select AACSB framework and verify programmatic competency goals reflect AoL criteria.'],
        compliantExamples: [{ title: 'MBA Strategic Management AoL', description: 'Aligned to CG1, CG3, and CG4 with direct evaluation through capstone corporate consulting defense.' }],
        practicalRecommendations: ['Ensure multi-trait rubrics distinguish between Developing, Proficient, and Exemplary.'],
        antiPatterns: ['Relying solely on course grades or multiple choice averages instead of multi-trait rubrics for AoL.'],
      },
      step_clos: {
        stageId: 'step_clos',
        stageTitle: 'AACSB Measurable Learning Objectives (LOs)',
        stageNumber: 4,
        whatIsRequired: ['Formulate CLOs assessing analytical evaluation, ethical reasoning, and strategic formulation.'],
        howToAlign: ['Use action verbs like Formulate, Evaluate, Synthesize, Analyze, and Recommend.'],
        compliantExamples: [{ title: 'Corporate Finance LO', description: 'Evaluate enterprise capital structure and formulate risk-adjusted hurdle rates for international capital expansion projects.' }],
        practicalRecommendations: ['Directly tie each CLO to an AoL competency goal.'],
        antiPatterns: ['Vague outcomes such as "appreciate business ethics" that cannot be graded on an AoL rubric.'],
      },
    },
  },

  // 3. ACBSP BUSINESS
  'fw-acbsp': {
    frameworkId: 'fw-acbsp',
    frameworkName: 'ACBSP Global Business Accreditation',
    frameworkCode: 'ACBSP',
    accordOrStandard: 'ACBSP Unified Standards & Criterion 4 (Student Learning Results)',
    jurisdiction: 'United States & Global Accredited Business Programs (1,200+ Campuses)',
    governingBody: 'Accreditation Council for Business Schools and Programs (ACBSP)',
    outcomeModel: 'Common Professional Component (CPC) & Criterion 4 Student Learning Results',
    description:
      'Teaching-focused global business accreditation standard evaluating student learning outcomes across the Common Professional Component (CPC) under Criterion 4.',
    corePhilosophy:
      'Excellence in business education centers on teaching quality, applied leadership, experiential enterprise simulations, and systematic longitudinal tracking of student learning results.',
    cognitiveRequirements:
      'Balanced distribution spanning Bloom’s L3 (Apply), L4 (Analyze), and L5 (Evaluate). Minimum 50% direct assessment evidence mapped to CPC disciplinary areas.',
    attainmentThreshold:
      'Criterion 4 demands established benchmarks (typically ≥70% pass threshold) with documented longitudinal tracking across at least 3 consecutive cohort cycles.',
    graduateAttributes: [
      { code: 'CPC1', title: 'Accounting & Financial Resource Allocation', description: 'Interpret financial statements, perform managerial cost accounting, and allocate capital to maximize organizational sustainability.', keywords: ['Financial Statements', 'Managerial Accounting', 'Capital Allocation', 'Cash Flow Analysis'] },
      { code: 'CPC2', title: 'Organizational Leadership & Strategic Management', description: 'Apply management theories, human resource principles, and strategic planning models to guide enterprise performance.', keywords: ['Strategic Management', 'Organizational Behavior', 'Human Capital', 'Performance KPI'] },
      { code: 'CPC3', title: 'Marketing Management & Consumer Analytics', description: 'Design customer-centric marketing campaigns, analyze competitive positioning, and evaluate consumer decision behaviors.', keywords: ['Target Marketing', 'Competitive Positioning', 'Consumer Journey', 'Brand Equity'] },
      { code: 'CPC4', title: 'Business Law, Regulation & Commercial Ethics', description: 'Evaluate legal contracts, intellectual property rights, regulatory compliance, and professional business ethics.', keywords: ['Commercial Law', 'Contract Law', 'Regulatory Compliance', 'Business Ethics'] },
      { code: 'CPC5', title: 'Global Economics & International Business', description: 'Assess macroeconomic policy, foreign exchange mechanisms, and comparative economic systems governing trade.', keywords: ['Macroeconomics', 'International Trade', 'Foreign Exchange', 'Fiscal Policy'] },
      { code: 'CPC6', title: 'Operations Management & Information Systems', description: 'Model supply chain workflows, apply quantitative operations research, and leverage enterprise information systems.', keywords: ['Supply Chain', 'Operations Optimization', 'ERP Systems', 'Process Engineering'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'ACBSP Criterion 4 & CPC Alignment',
        stageNumber: 1,
        whatIsRequired: ['Identify applicable CPC topical areas.', 'Establish direct performance measures for Criterion 4 reporting.'],
        howToAlign: ['Select ACBSP and map course to core Common Professional Component subjects.'],
        compliantExamples: [{ title: 'Operations & Supply Chain', description: 'Mapped to CPC6 and CPC1 with direct simulation performance tracking.' }],
        practicalRecommendations: ['Maintain comparative tracking across multiple terms for accreditation tables.'],
        antiPatterns: ['Omitting direct comparative benchmark data when evaluating student performance.'],
      },
    },
  },

  // 4. NCAAA SAUDI ARABIA
  'fw-ncaaa-saudi': {
    frameworkId: 'fw-ncaaa-saudi',
    frameworkName: 'NCAAA Saudi Arabia (ETEC Accreditation Standards)',
    frameworkCode: 'NCAAA-KSA',
    accordOrStandard: 'ETEC / NCAAA Program Accreditation Standards & Saudi National Qualifications Framework (SAQF)',
    jurisdiction: 'Kingdom of Saudi Arabia (Education & Training Evaluation Commission - ETEC)',
    governingBody: 'National Center for Academic Accreditation and Evaluation (NCAAA / ETEC)',
    outcomeModel: '3 Learning Domains: Knowledge & Understanding (K), Skills (S), and Values (V)',
    description:
      'The mandatory accreditation and quality assurance framework for higher education in Saudi Arabia, governed by ETEC under the National Qualifications Framework (NQF-KSA / SAQF).',
    corePhilosophy:
      'Curricula must align with Saudi Vision 2030 strategic objectives, embedding deep disciplinary knowledge, analytical and practical skills, and ethical national values in official Course Specifications.',
    cognitiveRequirements:
      'Constructive alignment requires distinct Course Learning Outcomes across all 3 domains: Knowledge (K1-K2), Cognitive & Practical Skills (S1-S3), and Values & Autonomy (V1-V3).',
    attainmentThreshold:
      'Course target benchmark typically set at 65%–70% of students achieving minimum acceptable grade, with documented Course Report (CR) continuous quality improvement action plans.',
    graduateAttributes: [
      { code: 'K1', title: 'Knowledge: Concepts & Theories', description: 'Demonstrate deep conceptual mastery of fundamental and specialized principles within the disciplinary field.', keywords: ['Theoretical Foundations', 'Disciplinary Principles', 'Core Terminology', 'Scholarly Concepts'] },
      { code: 'K2', title: 'Knowledge: Contemporary & National Vision Context', description: 'Analyze cutting-edge research, contemporary methodologies, and their strategic application to Saudi Vision 2030 priorities.', keywords: ['Saudi Vision 2030', 'Emerging Technologies', 'Applied Research', 'Industrial Context'] },
      { code: 'S1', title: 'Skills: Cognitive Analysis & Problem Solving', description: 'Investigate complex, unstructured problems and formulate evidence-based solutions using creative and analytical reasoning.', keywords: ['Critical Analysis', 'Complex Problem Solving', 'Analytical Reasoning', 'Solution Design'] },
      { code: 'S2', title: 'Skills: Practical, Professional & Technological Application', description: 'Utilize specialized laboratory, clinical, computational, and digital tools with high technical proficiency and safety compliance.', keywords: ['Hands-on Application', 'Specialized Software', 'Laboratory Technique', 'Digital Proficiency'] },
      { code: 'S3', title: 'Skills: Communication & Digital Literacy', description: 'Communicate academic and professional discourse fluently in written and oral formats using advanced digital media.', keywords: ['Bilingual Presentation', 'Technical Writing', 'Digital Media', 'Scholarly Discourse'] },
      { code: 'V1', title: 'Values: Professional Ethics & Academic Integrity', description: 'Commit to highest standards of academic integrity, Islamic and professional ethical codes, and societal stewardship.', keywords: ['Islamic Ethics', 'Academic Integrity', 'Professional Accountability', 'Code of Conduct'] },
      { code: 'V2', title: 'Values: Autonomy, Leadership & Collaborative Teamwork', description: 'Lead diverse task teams effectively, take initiative in professional contexts, and manage collaborative deliverables.', keywords: ['Autonomous Initiative', 'Team Leadership', 'Collaborative Work', 'Project Responsibility'] },
      { code: 'V3', title: 'Values: Civic Responsibility & Lifelong Learning', description: 'Demonstrate active civic engagement, sustainable environmental awareness, and dedication to lifelong personal learning.', keywords: ['Civic Engagement', 'Environmental Sustainability', 'Self-Directed Learning', 'Community Service'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'NCAAA Course Specification (CS) Setup',
        stageNumber: 1,
        whatIsRequired: ['Classify course under SAQF level descriptor.', 'Organize outcomes into Knowledge (K), Skills (S), and Values (V) domains.'],
        howToAlign: ['Select NCAAA-KSA and ensure CLO numbering follows K1, S1, V1 formatting required for official Course Specifications.'],
        compliantExamples: [{ title: 'Information Systems Course Specification', description: 'CLO 1 (K1 Concepts), CLO 2 (S1 Algorithm Design), CLO 3 (S2 Database Implementation), CLO 4 (V1 Data Privacy & Islamic Ethics).' }],
        practicalRecommendations: ['Ensure every domain (K, S, V) is assessed with direct assessment instruments.'],
        antiPatterns: ['Omitting the Values (V) domain entirely or relying only on Knowledge memorization.'],
      },
    },
  },

  // 5. CAEP TEACHER EDUCATION
  'fw-caep': {
    frameworkId: 'fw-caep',
    frameworkName: 'CAEP (Council for the Accreditation of Educator Preparation)',
    frameworkCode: 'CAEP',
    accordOrStandard: 'CAEP 2022 Standards for Educator Preparation Providers',
    jurisdiction: 'United States & International Educator Preparation Providers',
    governingBody: 'Council for the Accreditation of Educator Preparation (CAEP)',
    outcomeModel: '5 Educator Standards & InTASC Model Core Teaching Competencies',
    description:
      'The premier evidence-based accreditation body for teacher and educator preparation providers, ensuring high pedagogical quality and verifiable impact on P-12 student learning.',
    corePhilosophy:
      'Educator candidates must demonstrate deep content mastery, culturally responsive teaching, continuous clinical assessment, and documented positive impact on P-12 student academic growth.',
    cognitiveRequirements:
      'Candidate performance requires Bloom’s L3 (Apply), L4 (Analyze), and L5 (Evaluate) through authentic classroom instructional delivery, unit plans, and clinical observations.',
    attainmentThreshold:
      'Candidate licensure benchmark requires ≥80% of candidates meeting or exceeding proficient levels on state/national edTPA/PPAT performance assessments.',
    graduateAttributes: [
      { code: 'CAEP1', title: 'Content & Pedagogical Knowledge', description: 'Demonstrate deep disciplinary content understanding and pedagogical methods ensuring meaningful P-12 student learning.', keywords: ['Disciplinary Mastery', 'InTASC Standards', 'Pedagogical Content Knowledge', 'Curriculum Mapping'] },
      { code: 'CAEP2', title: 'Clinical Partnerships & Practice', description: 'Collaborate effectively in school-based clinical partnerships, co-teaching, and mentoring in real classroom settings.', keywords: ['Clinical Fieldwork', 'Mentor Co-Teaching', 'Classroom Observation', 'School Partnerships'] },
      { code: 'CAEP3', title: 'Candidate Quality & Selectivity', description: 'Exhibit professional dispositions, academic rigor, and ethical commitments required of highly qualified educators.', keywords: ['Educator Dispositions', 'Academic Rigor', 'Equity Commitment', 'Professionalism'] },
      { code: 'CAEP4', title: 'Program Impact on P-12 Student Learning', description: 'Demonstrate positive, documented impact on P-12 student learning growth through data-informed instructional interventions.', keywords: ['P-12 Impact', 'Student Growth Measures', 'Pre/Post Assessment', 'Data-Informed Pedagogy'] },
      { code: 'CAEP5', title: 'Quality Assurance & Continuous Improvement', description: 'Engage in continuous quality improvement cycles by analyzing learner assessment data to refine pedagogical delivery.', keywords: ['Reflective Practice', 'Continuous Improvement', 'Assessment Literacy', 'Action Research'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'CAEP EPP Alignment',
        stageNumber: 1,
        whatIsRequired: ['Align course outcomes with InTASC Model Core Standards and CAEP Standards 1-5.'],
        howToAlign: ['Select CAEP framework and verify teacher candidate clinical observation rubrics.'],
        compliantExamples: [{ title: 'Methods of Secondary Mathematics', description: 'Mapped to CAEP 1 and CAEP 4 with pre/post P-12 student assessment project.' }],
        practicalRecommendations: ['Include direct evidence of P-12 student work samples in assessment plan.'],
        antiPatterns: ['Assessing candidates purely on theoretical essays without classroom teaching demonstrations.'],
      },
    },
  },

  // 6. CCTC CALIFORNIA
  'fw-cctc': {
    frameworkId: 'fw-cctc',
    frameworkName: 'CCTC (California Commission on Teacher Credentialing)',
    frameworkCode: 'CCTC',
    accordOrStandard: 'California Teaching Performance Expectations (TPE Standards)',
    jurisdiction: 'California, United States',
    governingBody: 'California Commission on Teacher Credentialing (CCTC)',
    outcomeModel: '6 Teaching Performance Expectations (TPEs 1 to 6) & CalTPA Rubrics',
    description:
      'California state credentialing standards mandating candidate performance across 6 Teaching Performance Expectations (TPEs) evaluated through clinical practice and the CalTPA.',
    corePhilosophy:
      'California educators must deliver asset-based, inclusive, universal-design instruction accommodating English learners, students with disabilities, and diverse cultural communities.',
    cognitiveRequirements:
      'High practical demonstration across Bloom’s L3 (Apply) through L5 (Evaluate). Rubrics must reflect CalTPA performance cycles (Plan, Teach, Assess, Reflect).',
    attainmentThreshold:
      'Passing benchmark requires meeting state CalTPA passing scores (rubric score of 3 or higher on 5-point performance scale).',
    graduateAttributes: [
      { code: 'TPE1', title: 'Engaging & Supporting All Students in Learning', description: 'Connect student prior knowledge, cultural background, and language proficiencies to rigorous instructional learning goals.', keywords: ['Asset-Based Pedagogy', 'Funds of Knowledge', 'Student Engagement', 'Higher-Order Questions'] },
      { code: 'TPE2', title: 'Creating & Maintaining Effective Learning Environments', description: 'Establish an inclusive, caring, and intellectually safe classroom environment that fosters social-emotional well-being.', keywords: ['Social-Emotional Learning', 'Inclusive Climate', 'Restorative Practices', 'Classroom Culture'] },
      { code: 'TPE3', title: 'Understanding & Organizing Subject Matter', description: 'Organize curriculum to facilitate student mastery of California academic standards and disciplinary content structures.', keywords: ['CA State Standards', 'Curriculum Organization', 'Academic Language', 'Disciplinary Literacy'] },
      { code: 'TPE4', title: 'Planning Instruction & Designing Learning Experiences', description: 'Design differentiated lesson sequences incorporating universal design for learning (UDL) and English learner scaffolds.', keywords: ['Universal Design for Learning (UDL)', 'ELD Scaffolding', 'Differentiated Instruction', 'Lesson Planning'] },
      { code: 'TPE5', title: 'Assessing Student Learning', description: 'Design and implement diagnostic, formative, and summative assessments to monitor student progress and guide instruction.', keywords: ['Formative Assessment', 'Rubric Feedback', 'Diagnostic Testing', 'Student Self-Assessment'] },
      { code: 'TPE6', title: 'Developing as a Professional Educator', description: 'Reflect upon personal teaching practices, engage in professional learning communities, and uphold ethical educator codes.', keywords: ['Professional Ethics', 'Reflective Practitioner', 'Legal Responsibilities', 'Mandated Reporting'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'California TPE Credential Alignment',
        stageNumber: 1,
        whatIsRequired: ['Map outcomes to TPE 1 through 6.', 'Integrate CalTPA performance task cycles.'],
        howToAlign: ['Select CCTC and ensure outcomes address UDL and English Learner scaffolding.'],
        compliantExamples: [{ title: 'Curriculum & Instruction in Literacy', description: 'Mapped to TPE 1, TPE 3, and TPE 4 with designated ELD lesson plan submissions.' }],
        practicalRecommendations: ['Incorporate video self-reflection tasks matching CalTPA Cycle 2.'],
        antiPatterns: ['Neglecting English learner language development adaptations in lesson plans.'],
      },
    },
  },

  // 7. CCTP CLINICAL TEACHER PREPARATION
  'fw-cctp': {
    frameworkId: 'fw-cctp',
    frameworkName: 'CCTP (Consortium for Clinical Teacher Preparation)',
    frameworkCode: 'CCTP',
    accordOrStandard: 'Clinical Practice & Teacher Residency Standards',
    jurisdiction: 'North America & Partnering Teacher Residencies',
    governingBody: 'National Center for Clinical Practice & Educator Residencies',
    outcomeModel: '5 Clinical Educator Competencies & High-Leverage Practices (HLPs)',
    description:
      'Standards governing intensive clinical residency and teacher candidate preparation, emphasizing high-leverage instructional practices, mentored co-teaching, and equity.',
    corePhilosophy:
      'Clinical educator preparation requires continuous immersion in real school communities with dedicated clinical mentor co-teaching and video-based reflective coaching.',
    cognitiveRequirements:
      'Observable classroom teaching performance and video reflection across Bloom’s L3–L5.',
    attainmentThreshold:
      'Resident benchmark requires proficient rating on clinical observation rubrics across minimum 3 clinical triad conferences.',
    graduateAttributes: [
      { code: 'CCTP1', title: 'High-Leverage Instructional Practices', description: 'Execute foundational high-leverage teaching practices including eliciting student thinking, facilitating discourse, and modeling.', keywords: ['High-Leverage Practices', 'Classroom Discourse', 'Cognitive Modeling', 'Think-Alouds'] },
      { code: 'CCTP2', title: 'Mentored Clinical Co-Teaching', description: 'Engage productively in shared instructional planning, co-teaching models, and responsive clinical feedback cycles.', keywords: ['Co-Teaching Models', 'Clinical Coaching', 'Triad Conferences', 'Mentorship Feedback'] },
      { code: 'CCTP3', title: 'Culturally Sustaining & Equitable Pedagogy', description: 'Enact culturally responsive pedagogy that honors diverse student assets and dismantles structural learning barriers.', keywords: ['Culturally Sustaining Pedagogy', 'Educational Equity', 'Anti-Bias Practices', 'Affirming Learning'] },
      { code: 'CCTP4', title: 'Data-Informed Clinical Intervention', description: 'Analyze student classroom artifacts and real-time assessment data to adapt instructional pacing and targeted support.', keywords: ['Real-Time Formative Checks', 'Data-Informed Adaptation', 'Targeted Re-Teaching', 'Student Artifact Analysis'] },
      { code: 'CCTP5', title: 'Family & Community Engagement', description: 'Build reciprocal, respectful partnerships with student families and community stakeholders to support whole-child development.', keywords: ['Family Partnerships', 'Community Wealth', 'Empathetic Communication', 'Whole-Child Development'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'Clinical Residency Alignment',
        stageNumber: 1,
        whatIsRequired: ['Verify course is part of clinical residency coursework or student teaching seminar.'],
        howToAlign: ['Select CCTP framework and structure outcomes around clinical video reflections.'],
        compliantExamples: [{ title: 'Residency Seminar III', description: 'Aligned to CCTP 1, CCTP 2, and CCTP 4 with weekly video coaching logs.' }],
        practicalRecommendations: ['Embed co-teaching planning templates directly in module plans.'],
        antiPatterns: ['Assessing residency courses purely by reading quizzes without clinical artifacts.'],
      },
    },
  },

  // 8. HLC CRITERIA
  'fw-hlc': {
    frameworkId: 'fw-hlc',
    frameworkName: 'Higher Learning Commission (HLC Criteria for Accreditation)',
    frameworkCode: 'HLC',
    accordOrStandard: 'HLC Criteria for Accreditation (Criteria 1–5)',
    jurisdiction: 'United States (Central Region: 19 US States)',
    governingBody: 'Higher Learning Commission (HLC)',
    outcomeModel: 'Institutional & Programmatic Assessment Criteria (Criteria 3 & 4)',
    description:
      'Comprehensive regional institutional accreditation criteria governing higher learning institutions, emphasizing teaching quality, student retention, and systematic learning assessment.',
    corePhilosophy:
      'Accredited institutions demonstrate continuous institutional quality by articulating clear learning outcomes, gathering systematic direct evidence, and closing the feedback loop.',
    cognitiveRequirements:
      'Higher-order cognitive outcomes aligned with collegiate degree level (Associate, Baccalaureate, Graduate). Direct assessment required in Criteria 4.B.',
    attainmentThreshold:
      'Departmental benchmark requires defined student achievement thresholds with documented annual assessment reports showing curricular improvements.',
    graduateAttributes: [
      { code: 'HLC1', title: 'Mission & Public Good', description: 'Operate with integrity to fulfill the educational mission for the public interest.', keywords: ['Institutional Mission', 'Public Interest', 'Civic Purpose', 'Educational Integrity'] },
      { code: 'HLC2', title: 'Integrity, Ethical Conduct & Governance', description: 'Act ethically and responsibly in academic governance, administrative policies, and financial management.', keywords: ['Ethical Governance', 'Academic Freedom', 'Fair Policies', 'Financial Integrity'] },
      { code: 'HLC3', title: 'Teaching & Learning: Quality, Resources & Support', description: 'Provide high-quality academic degree programs with appropriate curriculum design, qualified faculty, and support resources.', keywords: ['Curricular Rigor', 'Faculty Qualifications', 'Student Support', 'Learning Resources'] },
      { code: 'HLC4', title: 'Teaching & Learning: Evaluation & Improvement', description: 'Demonstrate systematic assessment of student learning outcomes at program and course levels to drive continuous improvement.', keywords: ['Systematic Assessment', 'Learning Outcomes', 'Closing the Loop', 'Curricular Revisions'] },
      { code: 'HLC5', title: 'Institutional Effectiveness & Resource Allocation', description: 'Allocate institutional resources systematically to sustain academic quality and student completion goals.', keywords: ['Resource Planning', 'Student Completion', 'Institutional Vitality', 'Fiscal Sustainability'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'HLC Criterion 3 & 4 Alignment',
        stageNumber: 1,
        whatIsRequired: ['Identify program learning outcomes aligned to HLC Criterion 4.B assessment expectations.'],
        howToAlign: ['Select HLC framework and link course assessments to direct student achievement metrics.'],
        compliantExamples: [{ title: 'Interdisciplinary Capstone', description: 'Directly assessed via senior thesis evaluation submitted for HLC Criterion 4 assurance argument.' }],
        practicalRecommendations: ['Document explicit changes made to the course based on past cohort assessment data.'],
        antiPatterns: ['Collecting assessment data without documenting how results influenced teaching or curriculum.'],
      },
    },
  },

  // 9. MSCHE STANDARDS
  'fw-msche': {
    frameworkId: 'fw-msche',
    frameworkName: 'Middle States Commission on Higher Education (MSCHE Standards)',
    frameworkCode: 'MSCHE',
    accordOrStandard: 'MSCHE Standards for Accreditation 14th Edition',
    jurisdiction: 'United States (Mid-Atlantic: NY, NJ, PA, DE, MD, DC, PR & Global)',
    governingBody: 'Middle States Commission on Higher Education (MSCHE)',
    outcomeModel: 'Standard III (Student Learning Experience) & Standard V (Educational Effectiveness)',
    description:
      'Institutional accreditation standards requiring demonstrated educational effectiveness through direct assessment of student learning goals across institutional, program, and course levels.',
    corePhilosophy:
      'An institution of higher education is judged on the effectiveness of its educational programs in ensuring student attainment of stated competencies through systematic, sustainable assessment.',
    cognitiveRequirements:
      'Clear progression of learning outcomes evaluated through direct measures (rubrics, capstones, exams) rather than indirect satisfaction surveys.',
    attainmentThreshold:
      'Established target attainment benchmarks across all degrees with systematic reporting in institutional Self-Study evaluations.',
    graduateAttributes: [
      { code: 'Std I', title: 'Mission and Goals', description: 'Institutional mission clearly defines purpose, student demographics, and educational values.', keywords: ['Institutional Mission', 'Strategic Goals', 'Academic Purpose'] },
      { code: 'Std II', title: 'Ethics and Integrity', description: 'Faithful adherence to academic freedom, ethical conduct, diversity, and student rights.', keywords: ['Academic Freedom', 'Ethical Standards', 'Equity & Diversity', 'Fair Practices'] },
      { code: 'Std III', title: 'Design & Delivery of Student Learning Experience', description: 'Curricula are coherent, rigorous, characterized by collegiate level learning, and delivered by qualified faculty.', keywords: ['Curricular Coherence', 'Academic Rigor', 'Faculty Sufficiency', 'General Education'] },
      { code: 'Std IV', title: 'Support of the Student Experience', description: 'Systematic support services from orientation to graduation foster learner success and retention.', keywords: ['Student Advising', 'Academic Support', 'Retention Services', 'Career Readiness'] },
      { code: 'Std V', title: 'Educational Effectiveness Assessment', description: 'Systematic direct assessment of student learning outcomes across all degree offerings with evidence-based curricular revisions.', keywords: ['Direct Assessment', 'Student Learning Goals', 'Closing the Loop', 'Evidence-Based Improvement'] },
      { code: 'Std VI', title: 'Planning, Resources & Improvement', description: 'Comprehensive planning and budget allocation support educational goals and institutional vitality.', keywords: ['Strategic Budgeting', 'Resource Planning', 'Institutional Renewal'] },
      { code: 'Std VII', title: 'Governance, Leadership & Administration', description: 'Effective governance structures support collegiate academic integrity and leadership transparency.', keywords: ['Shared Governance', 'Board Oversight', 'Administrative Leadership'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'MSCHE Standard V Alignment',
        stageNumber: 1,
        whatIsRequired: ['Identify learning outcomes for MSCHE Standard V educational effectiveness reporting.'],
        howToAlign: ['Select MSCHE and configure CLO-PLO assessment matrices.'],
        compliantExamples: [{ title: 'Baccalaureate Core Biology', description: 'Mapped to MSCHE Standard III and V with rubric-based lab report assessments.' }],
        practicalRecommendations: ['Ensure assessment plan produces aggregated and disaggregated student achievement data.'],
        antiPatterns: ['Claiming educational effectiveness solely based on course pass rates without rubric evidence.'],
      },
    },
  },

  // 10. NECHE STANDARDS
  'fw-neche': {
    frameworkId: 'fw-neche',
    frameworkName: 'New England Commission of Higher Education (NECHE Standards)',
    frameworkCode: 'NECHE',
    accordOrStandard: 'NECHE Standards for Accreditation (Standard 4 & Standard 8)',
    jurisdiction: 'United States (New England: CT, ME, MA, NH, RI, VT & Global)',
    governingBody: 'New England Commission of Higher Education (NECHE)',
    outcomeModel: 'Standard 4 (The Academic Program) & Standard 8 (Educational Effectiveness)',
    description:
      'Accreditation standards ensuring academic program coherence, collegiate depth, and verifiable educational effectiveness through systematic appraisal of student learning.',
    corePhilosophy:
      'Higher education institutions must demonstrate that their students achieve declared learning outcomes and graduate with durable intellectual capabilities.',
    cognitiveRequirements:
      'Collegiate depth across critical inquiry, quantitative reasoning, written composition, and disciplinary synthesis.',
    attainmentThreshold:
      'Annual departmental assessment audits demonstrating clear thresholds and systematic curricular enhancements.',
    graduateAttributes: [
      { code: 'Std 4', title: 'The Academic Program: Coherence & Rigor', description: 'Academic degree programs demonstrate curricular coherence, appropriate collegiate level progression, and intellectual depth.', keywords: ['Academic Program', 'Undergraduate Coherence', 'Curricular Scaffolding', 'General Education'] },
      { code: 'Std 8', title: 'Educational Effectiveness & Student Learning', description: 'Systematic assessment of student learning outcomes demonstrates that graduates achieve declared competencies.', keywords: ['Educational Effectiveness', 'Student Learning Appraisal', 'Retention & Completion', 'Assessment Findings'] },
      { code: 'Std 2', title: 'Planning & Evaluation', description: 'Systematic planning and evaluation inform institutional resource allocation and curriculum revision.', keywords: ['Institutional Evaluation', 'Continuous Quality', 'Resource Alignment'] },
      { code: 'Std 6', title: 'Teaching, Learning & Scholarship', description: 'Faculty exhibit scholarly competence and utilize active teaching methodologies fostering student engagement.', keywords: ['Teaching Excellence', 'Faculty Scholarship', 'Pedagogical Innovation'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'NECHE Standard 4 & 8 Alignment',
        stageNumber: 1,
        whatIsRequired: ['Articulate learning goals consistent with NECHE Standard 4 academic depth.'],
        howToAlign: ['Select NECHE framework and link outcomes to departmental E-series reporting tables.'],
        compliantExamples: [{ title: 'Senior Economics Seminar', description: 'Empirical research paper directly evaluated for NECHE Standard 8 portfolio.' }],
        practicalRecommendations: ['Document faculty dialogue and actions resulting from assessment evidence.'],
        antiPatterns: ['Treating syllabus creation as administrative paperwork disconnected from program assessment.'],
      },
    },
  },

  // 11. NWCCU STANDARDS
  'fw-nwccu': {
    frameworkId: 'fw-nwccu',
    frameworkName: 'Northwest Commission on Colleges and Universities (NWCCU Standards)',
    frameworkCode: 'NWCCU',
    accordOrStandard: 'NWCCU Standards for Accreditation (Standard 1.C & 1.D)',
    jurisdiction: 'United States (Northwest: AK, ID, MT, NV, OR, UT, WA & Canada)',
    governingBody: 'Northwest Commission on Colleges and Universities (NWCCU)',
    outcomeModel: 'Standard 1.C (Student Learning Outcomes) & Standard 1.D (Student Achievement)',
    description:
      'Accreditation standards focusing on student learning outcome coherence, disaggregated achievement data, and systematic evidence-based institutional improvement.',
    corePhilosophy:
      'Colleges and universities must define meaningful learning outcomes at all levels and use disaggregated performance data to eliminate equity achievement gaps.',
    cognitiveRequirements:
      'Outcome articulation spanning foundational mastery to complex application, backed by direct student work artifacts.',
    attainmentThreshold:
      'Institutional benchmarks require published threshold metrics and demonstrated progress closing achievement gaps.',
    graduateAttributes: [
      { code: '1.C.1', title: 'Articulated Learning Outcomes', description: 'All programs clearly define student learning outcomes that are consistent with mission and disciplinary standards.', keywords: ['Clear Outcomes', 'Program Alignment', 'Disciplinary Rigor'] },
      { code: '1.C.5', title: 'Direct Assessment of Student Achievement', description: 'Engage in ongoing, systematic collection and analysis of direct student learning evidence.', keywords: ['Direct Evidence', 'Student Artifacts', 'Authentic Assessment'] },
      { code: '1.C.7', title: 'Continuous Quality Improvement (Closing the Loop)', description: 'Use assessment results to effect improvements in academic programs, pedagogy, and student learning environments.', keywords: ['Closing the Loop', 'Curricular Action Plans', 'Pedagogical Adaptation'] },
      { code: '1.D.2', title: 'Disaggregated Student Success & Equity', description: 'Analyze student retention, progression, and completion metrics disaggregated by demographic indicators.', keywords: ['Equity Data', 'Disaggregated Metrics', 'Achievement Gaps', 'Student Success'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'NWCCU Standard 1.C Setup',
        stageNumber: 1,
        whatIsRequired: ['Identify course outcomes aligned with program outcomes for NWCCU annual audits.'],
        howToAlign: ['Select NWCCU and configure direct rubrics.'],
        compliantExamples: [{ title: 'Sociology Research Methods', description: 'Directly assessed using common departmental inquiry rubric.' }],
        practicalRecommendations: ['Ensure direct assessment artifacts can be sampled for institutional accreditation visits.'],
        antiPatterns: ['Relying solely on course grades as measures of learning outcomes.'],
      },
    },
  },

  // 12. SACSCOC PRINCIPLES
  'fw-sacscoc': {
    frameworkId: 'fw-sacscoc',
    frameworkName: 'Southern Association of Colleges and Schools Commission on Colleges (SACSCOC)',
    frameworkCode: 'SACSCOC',
    accordOrStandard: 'SACSCOC Principles of Accreditation (Standard 8.2 & Standard 9)',
    jurisdiction: 'United States (Southern Region: AL, FL, GA, KY, LA, MS, NC, SC, TN, TX, VA & Latin America)',
    governingBody: 'Southern Association of Colleges and Schools Commission on Colleges (SACSCOC)',
    outcomeModel: 'Standard 8.2.a (Student Outcomes: Educational Programs) & General Education Competencies',
    description:
      'Institutional accreditation standards requiring expected student learning outcomes for every educational program, direct assessment of achievement, and documented continuous improvement.',
    corePhilosophy:
      'Every degree program must articulate student learning outcomes, evaluate achievement using direct measures, and provide documented evidence of improvement based on analysis of the results.',
    cognitiveRequirements:
      'Demonstrated student mastery through authentic direct instruments (rubrics, comprehensive exams, portfolios, capstone evaluations).',
    attainmentThreshold:
      'Established targets (e.g., ≥75% meeting benchmark) with mandatory biennial Quality Enhancement Plan (QEP) and SACSCOC compliance narratives.',
    graduateAttributes: [
      { code: '8.2.a', title: 'Student Outcomes: Educational Programs', description: 'The institution identifies expected outcomes for each of its educational programs, assesses whether it achieves them, and provides evidence of improvement.', keywords: ['Program Outcomes', 'Direct Assessment', 'Evidence of Improvement', 'Annual Assessment Report'] },
      { code: '8.2.b', title: 'General Education Competencies', description: 'The institution identifies and assesses general education competencies in college-level programs.', keywords: ['General Education', 'Core Curriculum', 'Critical Thinking', 'Written Communication'] },
      { code: '8.1', title: 'Student Achievement Benchmarks', description: 'The institution evaluates student success metrics, setting and publishing explicit threshold targets.', keywords: ['Student Achievement', 'Thresholds of Acceptability', 'Retention & Graduation'] },
      { code: '9.1', title: 'Program Quality & Curricular Structure', description: 'Educational programs embody coherent curricular sequencing and adequate credit hour workloads.', keywords: ['Curricular Coherence', 'Credit Hour Compliance', 'Prerequisite Chains'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'SACSCOC Standard 8.2.a Alignment',
        stageNumber: 1,
        whatIsRequired: ['Identify educational program student learning outcomes (SLOs).', 'Establish direct assessment instruments and performance criteria.'],
        howToAlign: ['Select SACSCOC and configure course assessment plan with clear performance benchmarks.'],
        compliantExamples: [{ title: 'Nursing Clinical Synthesis', description: 'Directly evaluated with clinical simulation rubric for SACSCOC 8.2.a compliance documentation.' }],
        practicalRecommendations: ['Ensure assessment plan includes an explicit "Use of Results" section documenting actions taken.'],
        antiPatterns: ['Submitting assessment reports that show 100% perfection without any documented areas for quality enhancement.'],
      },
    },
  },

  // 13. WSCUC STANDARDS
  'fw-wscuc': {
    frameworkId: 'fw-wscuc',
    frameworkName: 'WASC Senior College and University Commission (WSCUC Standards)',
    frameworkCode: 'WSCUC',
    accordOrStandard: 'WSCUC 2023 Standards of Accreditation (Standard 2 & 5 Core Competencies)',
    jurisdiction: 'United States (Western Region: CA, HI, Pacific & Global)',
    governingBody: 'WASC Senior College and University Commission (WSCUC)',
    outcomeModel: 'Standard 2 (Teaching & Learning) & 5 Baccalaureate Core Competencies',
    description:
      'Accreditation standards evaluating core teaching and learning functions and requiring direct graduation-level evaluation of 5 Core Competencies across all baccalaureate degrees.',
    corePhilosophy:
      'High-quality higher education ensures that every student masters five essential core competencies and achieves advanced disciplinary depth in an inclusive learning environment.',
    cognitiveRequirements:
      'Graduation-level mastery across written and oral communication, quantitative reasoning, critical thinking, and information literacy evaluated via analytic rubrics.',
    attainmentThreshold:
      'Graduation-level benchmarks verified through capstone portfolio sampling and disaggregated cohort completion tracking.',
    graduateAttributes: [
      { code: 'CC1', title: 'Written Communication', description: 'Demonstrate clear, rhetorically effective, and evidence-grounded written composition across diverse genres.', keywords: ['Written Fluency', 'Rhetorical Purpose', 'Disciplinary Style', 'Evidence Synthesis'] },
      { code: 'CC2', title: 'Oral Communication', description: 'Deliver persuasive, organized, and interactive verbal presentations tailored to disciplinary and public audiences.', keywords: ['Oral Presentation', 'Verbal Delivery', 'Audience Engagement', 'Q&A Discourse'] },
      { code: 'CC3', title: 'Quantitative Reasoning', description: 'Interpret empirical data, perform mathematical computations, and draw valid inferences from quantitative models.', keywords: ['Quantitative Models', 'Empirical Data', 'Statistical Inference', 'Mathematical Computation'] },
      { code: 'CC4', title: 'Critical Thinking', description: 'Deconstruct complex arguments, evaluate underlying assumptions, and synthesize novel analytical conclusions.', keywords: ['Critical Deconstruction', 'Assumption Analysis', 'Logical Synthesis', 'Substantiated Argument'] },
      { code: 'CC5', title: 'Information Literacy', description: 'Locate, critically appraise, ethically utilize, and legally attribute scholarship and digital information sources.', keywords: ['Information Evaluation', 'Scholarly Research', 'Ethical Attribution', 'Digital Literacy'] },
      { code: 'Std 2.2', title: 'Program Coherence & Curricular Scaffolding', description: 'Baccalaureate degree programs offer clear, integrated pathways connecting lower-division foundations to capstone mastery.', keywords: ['Curricular Scaffolding', 'Capstone Integration', 'Program Coherence'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'WSCUC 5 Core Competencies Binding',
        stageNumber: 1,
        whatIsRequired: ['Identify which of the 5 Core Competencies (Written, Oral, QR, Critical Thinking, Info Lit) this course develops or assesses.'],
        howToAlign: ['Select WSCUC framework and tag CLOs with matching Core Competency descriptors.'],
        compliantExamples: [{ title: 'Senior Capstone Colloquium', description: 'Assesses CC1 (Written), CC2 (Oral), and CC4 (Critical Thinking) via capstone defense.' }],
        practicalRecommendations: ['Utilize VALUE rubric descriptors for WSCUC core competency alignment.'],
        antiPatterns: ['Assessing core competencies only in introductory courses without verifying capstone graduation mastery.'],
      },
    },
  },

  // 14. EHEA / ESG 2015 STANDARDS
  'fw-ehea': {
    frameworkId: 'fw-ehea',
    frameworkName: 'European Higher Education Area Standards (EHEA / ESG 2015)',
    frameworkCode: 'EHEA-ESG',
    accordOrStandard: 'Bologna Process & Standards and Guidelines for Quality Assurance in the EHEA (ESG 2015)',
    jurisdiction: 'Europe (49 Bologna Signatory Countries)',
    governingBody: 'European Higher Education Area (EHEA / Bologna Follow-Up Group)',
    outcomeModel: 'ESG Standards 1.2 & 1.3 & EHEA Dublin Descriptors (Bachelor, Master, Doctorate)',
    description:
      'The foundational European framework governing student-centered learning, ECTS credit modularization, transparent learning outcomes, and quality assurance under ESG 2015.',
    corePhilosophy:
      'Education in the EHEA centers on student-centred learning, verifiable learning outcomes corresponding to ECTS credit workloads, and international qualification mobility.',
    cognitiveRequirements:
      'Outcomes structured according to the Dublin Descriptors: Knowledge & Understanding, Applying Knowledge, Making Judgements, Communication Skills, and Learning Skills.',
    attainmentThreshold:
      'ECTS workload feasibility (25–30 student workload hours per 1 ECTS credit) and criterion-referenced assessment criteria.',
    graduateAttributes: [
      { code: 'ESG 1.2', title: 'Design & Approval of Programmes', description: 'Programmes are designed to meet target objectives, including explicit intended learning outcomes and ECTS credit allocations.', keywords: ['Intended Learning Outcomes', 'ECTS Allocation', 'Qualification Frameworks', 'Module Handbook'] },
      { code: 'ESG 1.3', title: 'Student-Centred Learning, Teaching & Assessment', description: 'Instruction encourages student autonomy, active pedagogical engagement, and criterion-referenced assessment aligned with outcomes.', keywords: ['Student-Centred Learning', 'Criterion-Referenced Assessment', 'Active Pedagogy', 'Flexible Pathways'] },
      { code: 'DD C1', title: 'Dublin Descriptors: Cycle 1 (Knowledge & Application)', description: 'Demonstrate knowledge and understanding that builds upon secondary education, supported by advanced textbooks and research.', keywords: ['Dublin Descriptors', 'First Cycle (Bachelor)', 'Foundational Research', 'Applied Competency'] },
      { code: 'DD C2', title: 'Dublin Descriptors: Problem Solving & Judgement', description: 'Gather and interpret relevant data to make informed judgements that include reflection on relevant social, scientific, or ethical issues.', keywords: ['Critical Judgement', 'Ethical Reflection', 'Data Interpretation', 'Complex Problem Solving'] },
      { code: 'ESG 1.9', title: 'Periodic Programme Monitoring & Review', description: 'Regularly monitor and periodically review programs to ensure they achieve intended objectives and meet stakeholder needs.', keywords: ['Periodic Review', 'Stakeholder Feedback', 'Continuous Monitoring', 'Diploma Supplement'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'EHEA Bologna ECTS Modular Alignment',
        stageNumber: 1,
        whatIsRequired: ['Define learning outcomes reflecting the Dublin Descriptors.', 'Allocate realistic ECTS credits based on total student workload.'],
        howToAlign: ['Select EHEA-ESG and specify ECTS credits and expected study hours.'],
        compliantExamples: [{ title: 'European Economics Module (6 ECTS)', description: '150-180 hours total student workload, 5 structured learning outcomes aligned with Dublin Descriptors Cycle 1.' }],
        practicalRecommendations: ['Ensure contact hours and independent self-study hours sum up to total ECTS workload.'],
        antiPatterns: ['Listing learning outcomes without corresponding ECTS workload calculation.'],
      },
    },
  },

  // 15. FIBAA
  'fw-fibaa': {
    frameworkId: 'fw-fibaa',
    frameworkName: 'FIBAA (Foundation for International Business Administration Accreditation)',
    frameworkCode: 'FIBAA',
    accordOrStandard: 'FIBAA Program Quality Criteria for Bachelor and Master Programmes',
    jurisdiction: 'Europe (Germany, Switzerland, Austria & Global Business Providers)',
    governingBody: 'Foundation for International Business Administration Accreditation (FIBAA)',
    outcomeModel: '5 FIBAA Quality Criteria & Employability Qualification Objectives',
    description:
      'International quality seal evaluating academic quality, internationality, and practical relevance in business, management, economics, law, and social sciences programs.',
    corePhilosophy:
      'High-quality management and social science education connects rigorous academic theories with international corporate practice, case-method analysis, and verified graduate employability.',
    cognitiveRequirements:
      'Strong analytical and evaluative competencies (Bloom’s L4–L6) demonstrated in practical problem-solving business simulations and applied research papers.',
    attainmentThreshold:
      'Accreditation criteria require transparent grading rubrics, balanced exam workloads, and documented graduate career success tracking.',
    graduateAttributes: [
      { code: 'FIBAA 1', title: 'Strategic Objectives & International Profile', description: 'Degree program establishes clear academic positioning, international orientation, and graduate employability profiles.', keywords: ['International Positioning', 'Employability', 'Strategic Objectives', 'Global Orientation'] },
      { code: 'FIBAA 2', title: 'Curricular Structure & ECTS Feasibility', description: 'Competence-oriented modularization ensures realistic student workload calculations and verified ECTS credit feasibility.', keywords: ['ECTS Feasibility', 'Modularization', 'Competence-Oriented', 'Workload Calculation'] },
      { code: 'FIBAA 3', title: 'Practical Relevance & Corporate Integration', description: 'Integrates real-world business case studies, practical problem-solving projects, and executive guest lectures into curriculum.', keywords: ['Corporate Relevance', 'Practical Case Method', 'Business Integration', 'Executive Practice'] },
      { code: 'FIBAA 4', title: 'Examination Diversity & Outcome Alignment', description: 'Evaluation mechanisms assess defined competency objectives through multimodal formative and summative assessments.', keywords: ['Examination Diversity', 'Assessment Alignment', 'Continuous Testing', 'Fair Grading'] },
      { code: 'FIBAA 5', title: 'Continuous Quality Assurance Loops', description: 'Systematic student and stakeholder evaluations inform ongoing curricular revisions and programmatic quality assurance.', keywords: ['Quality Assurance', 'Stakeholder Review', 'Course Evaluation', 'Continuous Enhancement'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'FIBAA International Practice Alignment',
        stageNumber: 1,
        whatIsRequired: ['Demonstrate international perspective and corporate practical relevance in curriculum design.'],
        howToAlign: ['Select FIBAA framework and include real-world case studies and executive presentations in assessment plan.'],
        compliantExamples: [{ title: 'International Brand Strategy', description: 'Evaluated through live corporate client marketing project with executive jury feedback.' }],
        practicalRecommendations: ['Document the practical corporate experience of instructors in the module overview.'],
        antiPatterns: ['Purely theoretical business instruction without applied case analyses or industry relevance.'],
      },
    },
  },

  // 16. ACQUIN
  'fw-acquin': {
    frameworkId: 'fw-acquin',
    frameworkName: 'ACQUIN (Accreditation, Certification & Quality Assurance Institute)',
    frameworkCode: 'ACQUIN',
    accordOrStandard: 'ACQUIN Criteria for Program Accreditation (EQAR Registered)',
    jurisdiction: 'Europe (Germany, European Union, Central & Eastern Europe, Global)',
    governingBody: 'Accreditation, Certification and Quality Assurance Institute (ACQUIN)',
    outcomeModel: '5 ACQUIN Program Accreditation Standards & Competence-Oriented Curricula',
    description:
      'European peer-review accreditation agency registered with EQAR, certifying competence-oriented curricula, transparent examination systems, and modular study feasibility.',
    corePhilosophy:
      'Curricula must embody didactically sound modular structures, clear qualification objectives, student workload feasibility, and active quality culture.',
    cognitiveRequirements:
      'Competence-oriented descriptors aligning cognitive, practical, and personal competencies with European Qualification Framework (EQF) levels.',
    attainmentThreshold:
      'ECTS modular validity and documented student workload evaluation audits.',
    graduateAttributes: [
      { code: 'ACQUIN 1', title: 'Qualification Objectives & Competence Orientation', description: 'Degree qualification objectives reflect academic, professional, and personal competencies aligned with European standards.', keywords: ['Qualification Objectives', 'EQF Alignment', 'Competence Profiles', 'Academic Depth'] },
      { code: 'ACQUIN 2', title: 'Curricular Concept & Modular Scaffolding', description: 'Curriculum exhibits didactic sequencing, transparent module handbooks, and verified study feasibility for enrolled cohorts.', keywords: ['Modular Scaffolding', 'Study Feasibility', 'Module Description', 'Didactic Sequencing'] },
      { code: 'ACQUIN 3', title: 'Student Workload & Examination System', description: 'Assessments evaluate stated learning outcomes while maintaining balanced student workloads throughout the semester.', keywords: ['Workload Balance', 'Examination System', 'Outcome Assessment', 'Fair Examination'] },
      { code: 'ACQUIN 4', title: 'Faculty Sufficiency & Learning Resources', description: 'Adequate instructional staffing and modern digital/physical facilities support active student learning.', keywords: ['Staffing Qualifications', 'Digital Infrastructure', 'Laboratory Resources', 'Student Support'] },
      { code: 'ACQUIN 5', title: 'Internal Quality Management', description: 'Robust internal quality assurance system integrates student feedback and external academic peer reviews.', keywords: ['Internal QA', 'Peer Review', 'Continuous Quality', 'Evaluation Loops'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'ACQUIN Competence Modularization',
        stageNumber: 1,
        whatIsRequired: ['Publish detailed module specifications including prerequisites, learning outcomes, and assessment modes.'],
        howToAlign: ['Select ACQUIN and verify module descriptions include explicit qualification objectives.'],
        compliantExamples: [{ title: 'Advanced Algorithms Module', description: 'Complete ACQUIN-compliant module handbook specification with workload allocation.' }],
        practicalRecommendations: ['Ensure assessment formats reflect modern competence-oriented examination types.'],
        antiPatterns: ['Vague module descriptions lacking workload breakdowns.'],
      },
    },
  },

  // 17. EQAA
  'fw-eqaa': {
    frameworkId: 'fw-eqaa',
    frameworkName: 'EQAA (European Quality Assurance Agency)',
    frameworkCode: 'EQAA',
    accordOrStandard: 'EQAA Institutional and Programme Standards (ESG Compliant)',
    jurisdiction: 'Europe & International Higher Education Providers',
    governingBody: 'European Quality Assurance Agency (EQAA)',
    outcomeModel: '5 EQAA Quality Standards & Learning Environment Benchmarks',
    description:
      'International quality agency evaluating academic programs against European Standards and Guidelines (ESG 2015), emphasizing student empowerment and objective assessment.',
    corePhilosophy:
      'Quality higher education fosters critical thinking, intellectual diversity, transparent criterion-referenced evaluation, and civic engagement.',
    cognitiveRequirements:
      'Rigorous outcomes verified through transparent rubrics published to students prior to assessment.',
    attainmentThreshold:
      'Program quality metrics and systematic stakeholder surveys driving continuous enhancement.',
    graduateAttributes: [
      { code: 'EQAA 1', title: 'Intended Learning Outcomes & Curriculum Coherence', description: 'Clearly articulated learning outcomes align with academic benchmarks and societal employment requirements.', keywords: ['Outcome Clarity', 'Curriculum Coherence', 'Academic Benchmarks', 'Societal Relevance'] },
      { code: 'EQAA 2', title: 'Student-Centered Teaching Methodologies', description: 'Faculty employ interactive pedagogical methods that foster autonomous critical thinking and intellectual inquiry.', keywords: ['Interactive Pedagogy', 'Critical Inquiry', 'Student Autonomy', 'Intellectual Rigor'] },
      { code: 'EQAA 3', title: 'Fair, Objective & Transparent Assessment', description: 'Grading criteria and assessment rubrics are published in advance and consistently applied to evaluate student work.', keywords: ['Objective Grading', 'Published Rubrics', 'Transparent Assessment', 'Grading Integrity'] },
      { code: 'EQAA 4', title: 'Learning Support Services & Inclusivity', description: 'Holistic academic advising, library resources, and digital platforms empower all learners to achieve success.', keywords: ['Advising Support', 'Inclusivity', 'Digital Platforms', 'Learner Empowerment'] },
      { code: 'EQAA 5', title: 'Public Transparency & Quality Reporting', description: 'Regular publication of accurate, impartial program outcomes, student retention metrics, and quality review reports.', keywords: ['Public Reporting', 'Transparency', 'QA Auditing', 'Continuous Enhancement'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'EQAA Quality Standards Setup',
        stageNumber: 1,
        whatIsRequired: ['Establish transparent learning outcomes and publish grading criteria in advance.'],
        howToAlign: ['Select EQAA framework and attach analytic rubrics to each assessment.'],
        compliantExamples: [{ title: 'Environmental Law Course', description: 'Assessment plan with advance publication of mock trial evaluation rubrics.' }],
        practicalRecommendations: ['Provide formative feedback opportunities before high-stakes summative exams.'],
        antiPatterns: ['Surprise grading criteria not shared with students beforehand.'],
      },
    },
  },

  // 18. EUA
  'fw-eua': {
    frameworkId: 'fw-eua',
    frameworkName: 'EUA (European University Association - Institutional Evaluation Programme)',
    frameworkCode: 'EUA-IEP',
    accordOrStandard: 'EUA Institutional Evaluation Programme (IEP) Guidelines',
    jurisdiction: 'Europe (850+ Universities across 48 Countries)',
    governingBody: 'European University Association (EUA)',
    outcomeModel: 'EUA Strategic Learning Guidelines & Pervasive Quality Culture',
    description:
      'Pan-European university framework supporting institutional autonomy, student-centered learning, research-infused curricula, and robust quality governance.',
    corePhilosophy:
      'Universities thrive through academic freedom, research-informed teaching, institutional quality cultures, and active engagement with society.',
    cognitiveRequirements:
      'Integration of research inquiry and independent problem formulation into undergraduate and postgraduate learning outcomes.',
    attainmentThreshold:
      'Institutional Self-Evaluation Report (SER) audits and peer review consensus findings.',
    graduateAttributes: [
      { code: 'EUA 1', title: 'Strategic Academic Vision & Leadership', description: 'Institutional governance fosters a distinct academic vision, shared collegial leadership, and long-term vitality.', keywords: ['Academic Vision', 'Shared Governance', 'Strategic Leadership', 'Institutional Vitality'] },
      { code: 'EUA 2', title: 'Institutional Quality Culture', description: 'Cultivates a pervasive quality culture where all faculty and staff actively participate in evaluating and improving education.', keywords: ['Quality Culture', 'Faculty Engagement', 'Continuous Improvement', 'Collegiate Review'] },
      { code: 'EUA 3', title: 'Research-Informed Teaching & Learning', description: 'Curricula integrate active inquiry and recent scientific discoveries, empowering students as emerging researchers.', keywords: ['Research-Led Teaching', 'Inquiry-Based Learning', 'Scientific Discovery', 'Emerging Researchers'] },
      { code: 'EUA 4', title: 'Societal Engagement & Regional Innovation', description: 'Academic programs actively engage external civil society, industrial partners, and regional development initiatives.', keywords: ['Civil Society', 'Regional Innovation', 'Social Responsibility', 'External Partnerships'] },
      { code: 'EUA 5', title: 'Internationalisation & Student Mobility', description: 'Comprehensive strategy supports cross-border academic mobility, joint curricula, and international student integration.', keywords: ['Academic Mobility', 'Global Partnerships', 'Internationalisation', 'Cross-Border Exchange'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'EUA Quality Culture Alignment',
        stageNumber: 1,
        whatIsRequired: ['Infuse recent scientific research and inquiry-based pedagogy into course syllabus.'],
        howToAlign: ['Select EUA-IEP and ensure research publications and scientific literature reviews are integrated.'],
        compliantExamples: [{ title: 'Biomedical Innovation Seminar', description: 'Undergraduate students participate in faculty lab investigations as part of weekly learning plan.' }],
        practicalRecommendations: ['Encourage student co-authorship and conference presentations in course activities.'],
        antiPatterns: ['Teaching from outdated textbook notes without referencing current scientific scholarship.'],
      },
    },
  },

  // 19. ECA
  'fw-eca': {
    frameworkId: 'fw-eca',
    frameworkName: 'ECA (European Consortium for Accreditation in Higher Education)',
    frameworkCode: 'ECA',
    accordOrStandard: 'ECA CeQuInt & Mutual Recognition Framework for Joint Programmes',
    jurisdiction: 'Europe (Mutual Recognition Consortium: NVAO, ANECA, HCERES, ZEvA, etc.)',
    governingBody: 'European Consortium for Accreditation in Higher Education (ECA)',
    outcomeModel: '5 ECA Internationalisation Standards & CeQuInt Quality Verification',
    description:
      'European consortium enabling mutual recognition of accreditation decisions, joint degrees, cross-border educational quality, and internationalized graduate competences.',
    corePhilosophy:
      'Internationalization in higher education must be demonstrated through verified international learning outcomes, cross-border credit mobility, and shared international assessment standards.',
    cognitiveRequirements:
      'Demonstrated intercultural fluency, multilingual communication, and comparative international analysis.',
    attainmentThreshold:
      'CeQuInt international quality certificate criteria and bilateral mutual recognition protocols.',
    graduateAttributes: [
      { code: 'ECA 1', title: 'Internationalised Learning Outcomes', description: 'Intended learning outcomes explicitly reflect international and intercultural graduate competencies.', keywords: ['International Outcomes', 'Intercultural Competency', 'Global Perspectives', 'Transnational Learning'] },
      { code: 'ECA 2', title: 'Curricular Integration & Mutual Recognition', description: 'Joint curricula and exchange modules ensure seamless credit portability and mutual recognition across European borders.', keywords: ['Mutual Recognition', 'Joint Curricula', 'Credit Portability', 'Bilateral Alignment'] },
      { code: 'ECA 3', title: 'International Teaching & Learning Environment', description: 'Classroom experience features internationalized didactic materials, comparative perspectives, and cross-cultural discourse.', keywords: ['Internationalised Classroom', 'Cross-Cultural Teams', 'Comparative Didactics', 'Global Case Studies'] },
      { code: 'ECA 4', title: 'Staff & Student International Competencies', description: 'Faculty possess intercultural communication skills and support diverse international learner cohorts.', keywords: ['Intercultural Staff', 'Multilingual Didactics', 'International Student Support', 'Global Faculty'] },
      { code: 'ECA 5', title: 'CeQuInt Quality Verification & Impact', description: 'Demonstrated programmatic impact on graduate international employability, cross-border research, and global citizenship.', keywords: ['CeQuInt Certificate', 'Global Employability', 'International Impact', 'Graduate Mobility'] },
    ],
    stages: {
      step_framework: {
        stageId: 'step_framework',
        stageTitle: 'ECA Internationalised Learning Setup',
        stageNumber: 1,
        whatIsRequired: ['Define explicit international and intercultural learning outcomes for joint or transnational delivery.'],
        howToAlign: ['Select ECA framework and ensure cross-cultural comparative assessments.'],
        compliantExamples: [{ title: 'European Public Policy Joint Master', description: 'Jointly delivered and mutually recognized across 3 European partner universities.' }],
        practicalRecommendations: ['Include collaborative international online learning (COIL) components in weekly plan.'],
        antiPatterns: ['Declaring a course international without any intercultural or comparative learning outcomes.'],
      },
    },
  },
};
