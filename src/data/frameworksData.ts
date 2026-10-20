import { Framework, FrameworkVersion, FrameworkOutcome, FrameworkTerminology } from '../types';

export const INITIAL_FRAMEWORKS: Framework[] = [
  // 1. INTERNATIONAL ACCORDS (IEA & Seoul Accords)
  {
    id: 'fw-washington-accord',
    name: 'Washington Accord-aligned Engineering OBE',
    code: 'WA-ENG',
    type: 'International Accord',
    badge: 'International Recognition Framework',
    discipline: 'Engineering & Applied Sciences (4-Year Professional Degree)',
    jurisdiction: 'International (IEA Signatories: ABET, ECUK, Engineers Australia, PEC, BEM, etc.)',
    description: 'International agreement between bodies responsible for accrediting professional engineering degree programmes, specifying 12 Graduate Attributes (WA1-WA12) covering Complex Engineering Problems (CEP).',
    outcomeModel: 'Graduate Attributes (GAs) / Program Learning Outcomes (PLOs)',
    recommendedMappingApproach: 'CLO → Program Outcome (GA/PLO) on 3-tier cognitive intensity scale',
    applicableTerminology: 'Graduate Attributes, Complex Engineering Problems (CEP), Knowledge Profile (WK)',
    notes: 'Requires solving complex engineering problems and demonstrating higher-order cognitive competencies.',
    active: true,
  },
  {
    id: 'fw-sydney-accord',
    name: 'Sydney Accord-aligned Engineering Technology OBE',
    code: 'SA-ET',
    type: 'International Accord',
    badge: 'International Recognition Framework',
    discipline: 'Engineering Technology (3-Year / 4-Year B.Tech / Technologist Programs)',
    jurisdiction: 'International (IEA Signatories)',
    description: 'International agreement establishing equivalence of accredited engineering technologist education programmes based on Broadly-Defined Engineering Problems (BDP) and 12 Graduate Attributes (SA1-SA12).',
    outcomeModel: 'Graduate Attributes (GAs)',
    recommendedMappingApproach: 'CLO → Engineering Technology Graduate Attribute (SA1-SA12)',
    applicableTerminology: 'Graduate Attributes, Broadly-Defined Problems (BDP), Technology Profile (SK)',
    notes: 'Focuses on application of established techniques to broadly-defined engineering technology tasks.',
    active: true,
  },
  {
    id: 'fw-dublin-accord',
    name: 'Dublin Accord-aligned Engineering Technician OBE',
    code: 'DA-ENGTECH',
    type: 'International Accord',
    badge: 'International Recognition Framework',
    discipline: 'Engineering Technician & Applied Technology (2-Year Associate / Diploma)',
    jurisdiction: 'International (IEA Signatories: ECUK, ABET, Engineers Canada, Engineers Ireland, etc.)',
    description: 'International agreement establishing mutual recognition of engineering technician programmes, specifying 12 Technician Graduate Attributes (DA1–DA12) covering Well-Defined Engineering Problems (WDP).',
    outcomeModel: 'Technician Graduate Attributes (DA1 to DA12)',
    recommendedMappingApproach: 'CLO → Dublin Accord Technician Attribute (DA1-DA12)',
    applicableTerminology: 'Technician Graduate Attributes, Well-Defined Problems (WDP), Technician Knowledge Profile (DK)',
    notes: 'Emphasizes practical execution, diagnostic maintenance, technical instrumentation, and procedural problem solving.',
    active: true,
  },
  {
    id: 'fw-seoul-accord',
    name: 'Seoul Accord-aligned Computing OBE',
    code: 'SA-COMP',
    type: 'International Accord',
    badge: 'International Recognition Framework',
    discipline: 'Computing, Computer Science, Software Engineering & IT',
    jurisdiction: 'International (Seoul Accord Signatories: ABET, BCS, ACS, JABEE, etc.)',
    description: 'International mutual recognition agreement for tertiary-level computing and information technology programs covering 10 Computing Graduate Attributes (CGA1-CGA10).',
    outcomeModel: 'Computing Graduate Attributes / Student Outcomes',
    recommendedMappingApproach: 'CLO → Computing Graduate Attribute (CGA1-CGA10)',
    applicableTerminology: 'Computing Graduate Attributes, Complex Computing Problems',
    notes: 'Emphasizes algorithmic complexity, software engineering rigor, systems architecture, and ethical data stewardship.',
    active: true,
  },

  // 2. ABET COMMISSIONS
  {
    id: 'fw-abet-eac',
    name: 'ABET EAC (Engineering Accreditation Commission)',
    code: 'ABET-EAC',
    type: 'Accreditation Standard',
    badge: 'Accreditation Commission',
    discipline: 'Engineering Disciplines',
    jurisdiction: 'United States & Global Accredited Programs',
    description: 'Criteria for Accrediting Engineering Programs under Criterion 3: Student Outcomes 1 through 7.',
    outcomeModel: 'Student Outcomes (SO 1 to 7)',
    recommendedMappingApproach: 'CLO → ABET SO (1-7) Direct Performance Assessment',
    applicableTerminology: 'Student Outcomes, Performance Indicators, Continuous Improvement',
    notes: 'Standard 1-7 criteria covering complex engineering problem solving, design, communication, ethics, teamwork, experimentation, and modern learning.',
    active: true,
  },
  {
    id: 'fw-abet-cac',
    name: 'ABET CAC (Computing Accreditation Commission)',
    code: 'ABET-CAC',
    type: 'Accreditation Standard',
    badge: 'Accreditation Commission',
    discipline: 'Computer Science, Cybersecurity, Information Systems & Data Science',
    jurisdiction: 'United States & Global Accredited Programs',
    description: 'Criteria for Accrediting Computing Programs under Criterion 3: Student Outcomes 1 through 6 (plus program-specific criteria).',
    outcomeModel: 'Student Outcomes (SO 1 to 6)',
    recommendedMappingApproach: 'CLO → ABET CAC SO (1-6) Direct Performance Assessment',
    applicableTerminology: 'Student Outcomes, Program Criteria, Attainment Metric',
    notes: 'Core outcomes addressing algorithmic solutions, software implementation, communication, professional ethics, teamwork, and domain theory.',
    active: true,
  },
  {
    id: 'fw-abet-etac',
    name: 'ABET ETAC (Engineering Technology Accreditation Commission)',
    code: 'ABET-ETAC',
    type: 'Accreditation Standard',
    badge: 'Accreditation Commission',
    discipline: 'Engineering Technology',
    jurisdiction: 'United States & Global Accredited Programs',
    description: 'Criteria for Accrediting Engineering Technology Programs under Criterion 3: Student Outcomes 1 through 5.',
    outcomeModel: 'Student Outcomes (SO 1 to 5)',
    recommendedMappingApproach: 'CLO → ABET ETAC SO (1-5)',
    applicableTerminology: 'Student Outcomes, Applied Technical Skills, Laboratory Evidence',
    notes: 'Emphasizes hands-on technical proficiency, applied design, experimentation, and project execution.',
    active: true,
  },

  // 3. BUSINESS & MANAGEMENT ACCREDITATIONS
  {
    id: 'fw-aacsb',
    name: 'AACSB International Business Accreditation',
    code: 'AACSB',
    type: 'Business Accreditation Standard',
    badge: 'Business Accreditation',
    discipline: 'Business Administration, Management, Finance & Accounting',
    jurisdiction: 'Global Collegiate Schools of Business (950+ Accredited Institutions)',
    description: 'Premier global business school accreditation standard governing Assurance of Learning (AoL) through competency goals, direct programmatic rubrics, and continuous quality improvement under Standards 4 & 5.',
    outcomeModel: 'Competency Goals & Learning Objectives (Assurance of Learning)',
    recommendedMappingApproach: 'CLO → AACSB Competency Goal Matrix with Evaluative Rubrics',
    applicableTerminology: 'Competency Goals (CG), Learning Objectives (LO), Assurance of Learning (AoL), Faculty Sufficiency',
    notes: 'Requires direct assessment of programmatic learning goals across business acumen, ethical reasoning, analytics, global perspective, and executive communication.',
    active: true,
  },
  {
    id: 'fw-acbsp',
    name: 'ACBSP Global Business Accreditation',
    code: 'ACBSP',
    type: 'Business Accreditation Standard',
    badge: 'Business Accreditation',
    discipline: 'Business, Management, Leadership & Economics',
    jurisdiction: 'United States & Global Accredited Business Programs (1,200+ Campuses)',
    description: 'Teaching-focused global business accreditation standard assessing student learning outcomes across the Common Professional Component (CPC) under Criterion 4 (Student Learning Results).',
    outcomeModel: 'Common Professional Component (CPC) Outcomes & Leadership Competencies',
    recommendedMappingApproach: 'CLO → ACBSP CPC Disciplinary Competency Matrix',
    applicableTerminology: 'Student Learning Results (Criterion 4), Common Professional Component (CPC), Formative Assessment',
    notes: 'Emphasizes applied business knowledge, accounting/finance decision-making, marketing dynamics, business law, ethics, and experiential enterprise projects.',
    active: true,
  },

  // 4. TEACHER & EDUCATOR PREPARATION ACCREDITATIONS
  {
    id: 'fw-caep',
    name: 'CAEP (Council for the Accreditation of Educator Preparation)',
    code: 'CAEP',
    type: 'Educator Preparation Standard',
    badge: 'Teacher Education Accreditation',
    discipline: 'Education, Teacher Preparation, Curriculum & Pedagogy',
    jurisdiction: 'United States & International Educator Programs',
    description: 'Evidence-based accreditation standard for educator preparation providers (EPPs) focusing on candidate content/pedagogical knowledge, clinical partnerships, candidate selectivity, and program impact on P-12 student learning.',
    outcomeModel: 'InTASC / CAEP Candidate Competencies (Standards 1 to 5)',
    recommendedMappingApproach: 'CLO → CAEP Candidate Performance Standard Matrix with Clinical Fieldwork Evidence',
    applicableTerminology: 'Candidate Performance Standards, Clinical Fieldwork Evidence, Impact on P-12 Learning, InTASC Standards',
    notes: 'Requires demonstrated candidate mastery of differentiated instruction, formative assessment cycles, clinical co-teaching, and ethical educator responsibilities.',
    active: true,
  },
  {
    id: 'fw-cctc',
    name: 'CCTC (California Commission on Teacher Credentialing)',
    code: 'CCTC',
    type: 'State Credentialing Commission Standard',
    badge: 'Teacher Education Accreditation',
    discipline: 'Teacher Credentialing & Educator Licensure',
    jurisdiction: 'California, United States',
    description: 'Official California educator preparation standards based on the California Teaching Performance Expectations (TPEs 1 to 6) and California Standards for the Teaching Profession (CSTP).',
    outcomeModel: 'Teaching Performance Expectations (TPEs 1 to 6)',
    recommendedMappingApproach: 'CLO → CCTC Teaching Performance Expectation (TPE 1-6) Matrix',
    applicableTerminology: 'Teaching Performance Expectations (TPE), CalTPA Performance Assessment, English Learner Scaffolding',
    notes: 'Rigorous rubric alignment for inclusive classroom culture, subject-specific pedagogical delivery, multi-tiered student support, and professional ethics.',
    active: true,
  },
  {
    id: 'fw-cctp',
    name: 'CCTP (Consortium for Clinical Teacher Preparation)',
    code: 'CCTP',
    type: 'Clinical Teacher Education Standard',
    badge: 'Teacher Education Accreditation',
    discipline: 'Clinical Residency, Student Teaching & Teacher Leadership',
    jurisdiction: 'North America & Partnering Teacher Residencies',
    description: 'Standards governing intensive clinical residency and teacher candidate preparation, emphasizing high-leverage instructional practices, mentored clinical co-teaching, and data-driven student impact.',
    outcomeModel: 'Clinical Teaching Competencies (CCTP 1 to 5)',
    recommendedMappingApproach: 'CLO → Clinical Educator Competency Framework with Video & Observation Evidence',
    applicableTerminology: 'High-Leverage Practices (HLPs), Clinical Residency, Video Reflection Rubric, Formative Mentorship',
    notes: 'Focuses on observational clinical evaluations, culturally sustaining pedagogies, and continuous formative feedback loops.',
    active: true,
  },

  // 5. US REGIONAL INSTITUTIONAL ACCREDITATIONS
  {
    id: 'fw-hlc',
    name: 'Higher Learning Commission (HLC Criteria for Accreditation)',
    code: 'HLC',
    type: 'US Regional Institutional Standard',
    badge: 'US Regional Accreditation',
    discipline: 'Institutional Higher Education (19 US States in Central Region)',
    jurisdiction: 'United States (Central Region: IL, IN, IA, KS, MI, MN, MO, NE, ND, OH, OK, SD, WI, WV, WY, etc.)',
    description: 'Comprehensive US regional institutional accreditation criteria, specifically Criterion 3 (Teaching and Learning: Quality, Resources, and Support) and Criterion 4 (Teaching and Learning: Evaluation and Improvement).',
    outcomeModel: 'HLC Institutional & Programmatic Assessment Criteria (Criteria 1-5)',
    recommendedMappingApproach: 'CLO → Program Outcome & HLC Assessment Criteria 3 & 4 Matrix',
    applicableTerminology: 'Assessment of Student Learning, Retention & Completion, Faculty Qualifications, Quality Assurance Loops',
    notes: 'Mandates direct assessment of student learning, clearly stated learning goals, documented continuous quality improvement, and disaggregated achievement metrics.',
    active: true,
  },
  {
    id: 'fw-msche',
    name: 'Middle States Commission on Higher Education (MSCHE Standards)',
    code: 'MSCHE',
    type: 'US Regional Institutional Standard',
    badge: 'US Regional Accreditation',
    discipline: 'Institutional Higher Education (Mid-Atlantic, PR, VI & Global)',
    jurisdiction: 'United States (Mid-Atlantic Region: NY, NJ, PA, DE, MD, DC, PR, USVI & International)',
    description: 'MSCHE Standards for Accreditation, centering on Standard III (Design and Delivery of the Student Learning Experience) and Standard V (Educational Effectiveness Assessment).',
    outcomeModel: 'MSCHE Standards III & V Educational Effectiveness Outcomes',
    recommendedMappingApproach: 'CLO → Program Outcome & MSCHE Standard V Direct Evidence Matrix',
    applicableTerminology: 'Educational Effectiveness Assessment (Std V), Student Learning Goals, Continuous Curricular Improvement',
    notes: 'Requires an organized, sustained, and institutionalized assessment process demonstrating that students have accomplished intended learning goals.',
    active: true,
  },
  {
    id: 'fw-neche',
    name: 'New England Commission of Higher Education (NECHE Standards)',
    code: 'NECHE',
    type: 'US Regional Institutional Standard',
    badge: 'US Regional Accreditation',
    discipline: 'Institutional Higher Education (New England States & International)',
    jurisdiction: 'United States (New England: CT, ME, MA, NH, RI, VT & Global)',
    description: 'NECHE Standards for Accreditation, focusing on Standard 4 (The Academic Program: Undergraduate & Graduate Studies) and Standard 8 (Educational Effectiveness).',
    outcomeModel: 'NECHE Standard 4 & 8 Academic Program Learning Outcomes',
    recommendedMappingApproach: 'CLO → Program Outcome & NECHE Standard 8 Evidence Matrix',
    applicableTerminology: 'Educational Effectiveness (Std 8), Academic Program Coherence (Std 4), Direct Measures of Learning',
    notes: 'Enforces systematic appraisal of student learning outcomes, graduate competencies, and continuous curricular enhancement based on assessment findings.',
    active: true,
  },
  {
    id: 'fw-nwccu',
    name: 'Northwest Commission on Colleges and Universities (NWCCU Standards)',
    code: 'NWCCU',
    type: 'US Regional Institutional Standard',
    badge: 'US Regional Accreditation',
    discipline: 'Institutional Higher Education (Northwest States & Canada)',
    jurisdiction: 'United States (Northwest: AK, ID, MT, NV, OR, UT, WA & British Columbia)',
    description: 'NWCCU Standards for Accreditation, focusing on Standard 1.C (Student Learning) and Standard 1.D (Student Achievement: Retention, Completion, and Disaggregated Outcomes).',
    outcomeModel: 'NWCCU Standard 1.C Student Learning Outcomes',
    recommendedMappingApproach: 'CLO → Program Learning Outcome & NWCCU 1.C Direct Assessment Matrix',
    applicableTerminology: 'Student Learning Outcomes (1.C), Disaggregated Achievement Data, Closing the Loop, Meaningful Metrics',
    notes: 'Demands articulated outcomes at course, program, and general education levels with documented evidence of student work and intentional interventions.',
    active: true,
  },
  {
    id: 'fw-sacscoc',
    name: 'Southern Association of Colleges and Schools Commission on Colleges (SACSCOC)',
    code: 'SACSCOC',
    type: 'US Regional Institutional Standard',
    badge: 'US Regional Accreditation',
    discipline: 'Institutional Higher Education (Southern US States & Latin America)',
    jurisdiction: 'United States (Southern Region: AL, FL, GA, KY, LA, MS, NC, SC, TN, TX, VA & International)',
    description: 'SACSCOC Principles of Accreditation, governing Section 8.2.a (Student Outcomes: Educational Programs) and Section 8.2.b (General Education Competencies).',
    outcomeModel: 'SACSCOC Section 8.2 Student Educational Outcomes',
    recommendedMappingApproach: 'CLO → SACSCOC 8.2.a Program Student Learning Outcome Matrix',
    applicableTerminology: 'Student Learning Outcomes (8.2.a), General Education Competencies (8.2.b), Direct Assessment Evidence',
    notes: 'Requires identification of expected outcomes for each program, direct assessment of achievement, and demonstrable use of assessment results for continuous improvement.',
    active: true,
  },
  {
    id: 'fw-wscuc',
    name: 'WASC Senior College and University Commission (WSCUC Standards)',
    code: 'WSCUC',
    type: 'US Regional Institutional Standard',
    badge: 'US Regional Accreditation',
    discipline: 'Institutional Higher Education (California, Hawaii, Pacific & Global)',
    jurisdiction: 'United States (Western Region: CA, HI, Guam, American Samoa & Global)',
    description: 'WSCUC 2023 Standards of Accreditation under Standard 2 (Core Functions: Teaching and Learning), assessing 5 Core Competencies across all baccalaureate programs.',
    outcomeModel: 'WSCUC Standard 2 & 5 Core Competencies (Written, Oral, QR, Critical Thinking, Info Literacy)',
    recommendedMappingApproach: 'CLO → WSCUC Core Competency & Program Outcome Matrix',
    applicableTerminology: '5 Core Competencies, Curricular Coherence (Std 2.2), Capstone Integration, Educational Effectiveness',
    notes: 'Requires direct graduation-level evaluation of written communication, oral communication, quantitative reasoning, critical thinking, and information literacy.',
    active: true,
  },

  // 6. EUROPEAN HIGHER EDUCATION AREA (EHEA) & AGENCIES
  {
    id: 'fw-ehea',
    name: 'European Higher Education Area Standards (EHEA / ESG 2015)',
    code: 'EHEA-ESG',
    type: 'Bologna Process European Standard',
    badge: 'European Quality Assurance',
    discipline: 'European Higher Education (49 Bologna Signatory Countries)',
    jurisdiction: 'Europe (European Higher Education Area / Bologna Process)',
    description: 'Standards and Guidelines for Quality Assurance in the EHEA (ESG 2015) based on the Bologna Process, ECTS modular credits, student-centred learning, and the Dublin Descriptors across Qualifications Frameworks (QF-EHEA).',
    outcomeModel: 'ESG Standards (1.2 & 1.3) & EHEA Dublin Descriptors (Bachelor, Master, Doctoral Cycles)',
    recommendedMappingApproach: 'CLO → EHEA Competency Cycle & ESG 1.2 Program Outcome Matrix with ECTS Allocation',
    applicableTerminology: 'ECTS Credits, Student-Centred Learning (ESG 1.3), Dublin Descriptors, Diploma Supplement',
    notes: 'Mandates explicit, verifiable learning outcomes corresponding to ECTS credit workloads, criterion-referenced assessment, and student-centered modular scaffolding.',
    active: true,
  },
  {
    id: 'fw-fibaa',
    name: 'FIBAA (Foundation for International Business Administration Accreditation)',
    code: 'FIBAA',
    type: 'International Business & Social Sciences Accreditation',
    badge: 'European Quality Assurance',
    discipline: 'Management, Business, Economics, Law & Social Sciences',
    jurisdiction: 'Europe (Germany, Switzerland, Austria & Global)',
    description: 'FIBAA Program Quality Criteria evaluating internationality, practical relevance, competency-based curriculum design, and ECTS credit feasibility in business and social sciences.',
    outcomeModel: 'FIBAA Program Quality Criteria (Criteria 1 to 5)',
    recommendedMappingApproach: 'CLO → FIBAA Competency & Practical Relevance Matrix',
    applicableTerminology: 'Qualification Objectives, Employability & Practical Relevance, ECTS Feasibility, Quality Seal',
    notes: 'Demands corporate and practical integration, case-method evaluation, international perspectives, and student workload feasibility.',
    active: true,
  },
  {
    id: 'fw-acquin',
    name: 'ACQUIN (Accreditation, Certification & Quality Assurance Institute)',
    code: 'ACQUIN',
    type: 'European Peer-Review Accreditation Standard',
    badge: 'European Quality Assurance',
    discipline: 'Multidisciplinary Higher Education (Humanities, Sciences, Engineering, Arts)',
    jurisdiction: 'Europe (Germany, EU, Eastern Europe & Global)',
    description: 'ACQUIN accreditation standard registered with EQAR, ensuring competence-oriented degree curricula, transparent assessment systems, and ECTS modularization in higher education.',
    outcomeModel: 'ACQUIN Qualification Objectives & Curricular Criteria',
    recommendedMappingApproach: 'CLO → ACQUIN Qualification Objective Matrix',
    applicableTerminology: 'Competence Orientation, Modularization & Study Feasibility, Examination System, EQAR Registration',
    notes: 'Strict auditing of course modularity, student workload validation, examination diversity, and continuous stakeholder feedback.',
    active: true,
  },
  {
    id: 'fw-eqaa',
    name: 'EQAA (European Quality Assurance Agency)',
    code: 'EQAA',
    type: 'European Agency Standards for Higher Education',
    badge: 'European Quality Assurance',
    discipline: 'Comprehensive Academic Disciplines',
    jurisdiction: 'Europe & International Higher Education Providers',
    description: 'Institutional and program quality standards governed by EQAA in full compliance with ESG 2015, focusing on outcome-based instruction, academic rigor, and student empowerment.',
    outcomeModel: 'EQAA Programme Quality Standards (Standards 1 to 5)',
    recommendedMappingApproach: 'CLO → EQAA Learning Outcome & Quality Standards Matrix',
    applicableTerminology: 'ESG Compliance, Quality Culture, Transparent Assessment Criteria, Learning Environment',
    notes: 'Evaluates alignment of program objectives with societal needs, transparent criterion-referenced grading, and robust internal QA loops.',
    active: true,
  },
  {
    id: 'fw-eua',
    name: 'EUA (European University Association - Institutional Evaluation Programme)',
    code: 'EUA-IEP',
    type: 'Pan-European University Evaluation Framework',
    badge: 'European Quality Assurance',
    discipline: 'University-Wide Quality Governance & Academic Programs',
    jurisdiction: 'Europe (850+ Universities across 48 Countries)',
    description: 'EUA Institutional Evaluation Programme (IEP) guidelines supporting universities in developing comprehensive quality cultures, student-centered learning, and research-infused curricula.',
    outcomeModel: 'EUA-IEP Strategic Teaching & Learning Guidelines',
    recommendedMappingApproach: 'CLO → EUA Quality Culture & Student-Centered Pedagogy Matrix',
    applicableTerminology: 'Quality Culture, Research-Teaching Nexus, Student-Centered Learning, Institutional Governance',
    notes: 'Promotes research-informed learning outcomes, institutional autonomy, academic integrity, and societal responsiveness.',
    active: true,
  },
  {
    id: 'fw-eca',
    name: 'ECA (European Consortium for Accreditation in Higher Education)',
    code: 'ECA',
    type: 'European Quality Consortium Framework',
    badge: 'European Quality Assurance',
    discipline: 'International Degrees, Joint Programs & Transnational Education',
    jurisdiction: 'Europe (Mutual Recognition Consortium: NVAO, ANECA, HCERES, ZEvA, etc.)',
    description: 'ECA standards and CeQuInt (Certificate for Quality in Internationalisation) methodology, ensuring mutual recognition of degree accreditation, joint programmes, and verified graduate competencies.',
    outcomeModel: 'ECA Internationalisation & Learning Outcome Verification Standards',
    recommendedMappingApproach: 'CLO → ECA International Competency & Mutual Recognition Matrix',
    applicableTerminology: 'CeQuInt Quality Certificate, Joint Programme Verification, Mutual Recognition, International Competences',
    notes: 'Special focus on cross-border program portability, internationalized learning outcomes, and shared assessment criteria.',
    active: true,
  },

  // 7. NATIONAL COUNCILS & FRAMEWORKS
  {
    id: 'fw-ncaaa-saudi',
    name: 'NCAAA Saudi Arabia (ETEC Accreditation Standards)',
    code: 'NCAAA-KSA',
    type: 'National Center for Academic Accreditation Standard',
    badge: 'National Higher Education Framework',
    discipline: 'Multidisciplinary Higher Education in the Kingdom of Saudi Arabia',
    jurisdiction: 'Kingdom of Saudi Arabia (Education & Training Evaluation Commission - ETEC / NCAAA)',
    description: 'Saudi Arabia National Center for Academic Accreditation and Evaluation criteria aligned with the Saudi National Qualifications Framework (SAQF / NQF-KSA) across Knowledge & Understanding, Skills, and Values.',
    outcomeModel: 'NCAAA Program Learning Outcomes (Knowledge, Skills, Values)',
    recommendedMappingApproach: 'CLO → NCAAA PLO Matrix with Defined KPI Target Attainment Benchmarks',
    applicableTerminology: 'Course Specifications (CS), Knowledge & Understanding (K), Skills (S), Values & Responsibility (V), KPIs',
    notes: 'Mandates official Course Specifications, direct assessment matrices, and documented Continuous Quality Improvement (CQI) reports.',
    active: true,
  },
  {
    id: 'fw-hec-pakistan',
    name: 'Higher Education Commission (HEC) Pakistan',
    code: 'HEC-PK',
    type: 'National Council Standard',
    badge: 'National Higher Education Framework',
    discipline: 'Multidisciplinary Higher Education',
    jurisdiction: 'Pakistan',
    description: 'National Qualifications Framework (NQF) Pakistan and HEC Undergraduate Education Policy OBE guidelines across all disciplinary disciplines.',
    outcomeModel: 'Program Learning Outcomes (PLOs) & Graduate Qualities',
    recommendedMappingApproach: 'CLO → HEC PLO Matrix with Defined Attainment Thresholds (≥60%)',
    applicableTerminology: 'Program Learning Outcomes (PLOs), Course Learning Outcomes (CLOs), Bloom Domains',
    notes: 'Enforces alignment between course goals, modular weekly plans, direct assessment evidence, and Continuous Quality Improvement (CQI).',
    active: true,
  },
  {
    id: 'fw-nba-india',
    name: 'National Board of Accreditation (NBA) India',
    code: 'NBA-IN',
    type: 'National Board Standard',
    badge: 'National Higher Education Framework',
    discipline: 'Technical & Professional Education',
    jurisdiction: 'India (Tier-I / Tier-II Institutions)',
    description: 'NBA Outcome-Based Accreditation criteria governing 12 Program Outcomes (PO1-PO12) aligned with Washington Accord benchmarks.',
    outcomeModel: 'Program Outcomes (POs) & Program Specific Outcomes (PSOs)',
    recommendedMappingApproach: 'CO-PO / CO-PSO Articulation Matrix with correlation levels 1 (Slight), 2 (Moderate), 3 (Substantial)',
    applicableTerminology: 'Course Outcomes (COs), Program Outcomes (POs), Program Specific Outcomes (PSOs)',
    notes: 'Requires detailed CO-PO articulation matrices, target attainment levels, and documented corrective actions for course revisions.',
    active: true,
  },

  // 8. GENERAL & CUSTOM INSTITUTIONAL
  {
    id: 'fw-general-obe',
    name: 'General Outcome-Based Education',
    code: 'GEN-OBE',
    type: 'Educational Framework',
    badge: 'Educational Framework',
    discipline: 'Universal (Arts, Humanities, Business, Sciences)',
    jurisdiction: 'Universal',
    description: 'Universal OBE methodology based on Spady (1994) principles: Clarity of Focus, Designing Down, High Expectations, and Expanded Opportunities.',
    outcomeModel: 'Program Learning Outcomes (PLOs) / Intended Learning Outcomes (ILOs)',
    recommendedMappingApproach: 'CLO → PLO Constructive Alignment Matrix',
    applicableTerminology: 'Intended Learning Outcomes, Learning Evidence, Constructive Alignment',
    notes: 'Flexible structure ideal for non-engineering disciplines including Business, Social Sciences, Design, and Interdisciplinary programs.',
    active: true,
  },
  {
    id: 'fw-custom-institutional',
    name: 'Custom Institutional Framework',
    code: 'CUSTOM-INST',
    type: 'Institutional Model',
    badge: 'Institutional Framework',
    discipline: 'Institution-Defined',
    jurisdiction: 'University / Departmental Governance',
    description: 'Institutionally customized outcome structure allowing the university senate or curriculum committee to define bespoke institutional graduate profiles.',
    outcomeModel: 'Institutional Graduate Competencies / Custom Outcomes',
    recommendedMappingApproach: 'CLO → Institutional Competency Matrix',
    applicableTerminology: 'Institutional Outcomes, Departmental Competencies, Custom Rubrics',
    notes: 'Allows faculty and administrators to add custom outcome codes, titles, and descriptions tailored to university charters.',
    active: true,
  },
];

export const INITIAL_FRAMEWORK_VERSIONS: FrameworkVersion[] = [
  // International Accords
  { id: 'fwv-wa-2021', frameworkId: 'fw-washington-accord', versionName: 'IEA Graduate Attributes & Professional Competencies v4 (2021)', effectiveDate: '2021-06-21', status: 'Active' },
  { id: 'fwv-sa-2021', frameworkId: 'fw-sydney-accord', versionName: 'IEA Engineering Technologist Attributes v4 (2021)', effectiveDate: '2021-06-21', status: 'Active' },
  { id: 'fwv-da-2021', frameworkId: 'fw-dublin-accord', versionName: 'IEA Engineering Technician Attributes v4 (2021)', effectiveDate: '2021-06-21', status: 'Active' },
  { id: 'fwv-seoul-2022', frameworkId: 'fw-seoul-accord', versionName: 'Seoul Accord Computing Graduate Attributes (2022)', effectiveDate: '2022-01-01', status: 'Active' },

  // ABET
  { id: 'fwv-abet-eac-2024', frameworkId: 'fw-abet-eac', versionName: 'ABET EAC Criterion 3 Standards (2024-2025)', effectiveDate: '2024-07-01', status: 'Active' },
  { id: 'fwv-abet-cac-2024', frameworkId: 'fw-abet-cac', versionName: 'ABET CAC Criterion 3 Standards (2024-2025)', effectiveDate: '2024-07-01', status: 'Active' },
  { id: 'fwv-abet-etac-2024', frameworkId: 'fw-abet-etac', versionName: 'ABET ETAC Criterion 3 Standards (2024-2025)', effectiveDate: '2024-07-01', status: 'Active' },

  // Business
  { id: 'fwv-aacsb-2020', frameworkId: 'fw-aacsb', versionName: 'AACSB 2020 Guiding Principles & Standards (2024 Revision)', effectiveDate: '2024-01-01', status: 'Active' },
  { id: 'fwv-acbsp-2022', frameworkId: 'fw-acbsp', versionName: 'ACBSP Unified Standards & Criterion 4 (2022)', effectiveDate: '2022-06-01', status: 'Active' },

  // Teacher Prep
  { id: 'fwv-caep-2022', frameworkId: 'fw-caep', versionName: 'CAEP Revised 2022 Standards for Educator Preparation', effectiveDate: '2022-07-01', status: 'Active' },
  { id: 'fwv-cctc-2020', frameworkId: 'fw-cctc', versionName: 'California Teaching Performance Expectations (TPE Standards)', effectiveDate: '2020-09-01', status: 'Active' },
  { id: 'fwv-cctp-2023', frameworkId: 'fw-cctp', versionName: 'Clinical Educator Preparation Standards v2 (2023)', effectiveDate: '2023-01-01', status: 'Active' },

  // US Regional
  { id: 'fwv-hlc-2020', frameworkId: 'fw-hlc', versionName: 'HLC Revised Criteria for Accreditation (2020/2025)', effectiveDate: '2020-09-01', status: 'Active' },
  { id: 'fwv-msche-2023', frameworkId: 'fw-msche', versionName: 'MSCHE Standards for Accreditation 14th Edition (2023)', effectiveDate: '2023-07-01', status: 'Active' },
  { id: 'fwv-neche-2021', frameworkId: 'fw-neche', versionName: 'NECHE Standards for Accreditation (2021 Edition)', effectiveDate: '2021-01-01', status: 'Active' },
  { id: 'fwv-nwccu-2020', frameworkId: 'fw-nwccu', versionName: 'NWCCU Standards for Accreditation (2020 Revision)', effectiveDate: '2020-01-01', status: 'Active' },
  { id: 'fwv-sacscoc-2024', frameworkId: 'fw-sacscoc', versionName: 'SACSCOC Principles of Accreditation (2024 Edition)', effectiveDate: '2024-01-01', status: 'Active' },
  { id: 'fwv-wscuc-2023', frameworkId: 'fw-wscuc', versionName: 'WSCUC 2023 Standards of Accreditation', effectiveDate: '2023-06-01', status: 'Active' },

  // European Quality Assurance
  { id: 'fwv-ehea-2015', frameworkId: 'fw-ehea', versionName: 'Standards and Guidelines for Quality Assurance in the EHEA (ESG 2015)', effectiveDate: '2015-05-15', status: 'Active' },
  { id: 'fwv-fibaa-2023', frameworkId: 'fw-fibaa', versionName: 'FIBAA Quality Seal Criteria for Bachelor/Master Programmes (2023)', effectiveDate: '2023-01-01', status: 'Active' },
  { id: 'fwv-acquin-2022', frameworkId: 'fw-acquin', versionName: 'ACQUIN Criteria for Program Accreditation (2022)', effectiveDate: '2022-01-01', status: 'Active' },
  { id: 'fwv-eqaa-2021', frameworkId: 'fw-eqaa', versionName: 'EQAA Institutional and Programme Standards (2021)', effectiveDate: '2021-01-01', status: 'Active' },
  { id: 'fwv-eua-2022', frameworkId: 'fw-eua', versionName: 'EUA Institutional Evaluation Programme Guidelines (2022)', effectiveDate: '2022-01-01', status: 'Active' },
  { id: 'fwv-eca-2021', frameworkId: 'fw-eca', versionName: 'ECA CeQuInt & Mutual Recognition Framework (2021)', effectiveDate: '2021-01-01', status: 'Active' },

  // National Councils & Universal
  { id: 'fwv-ncaaa-2022', frameworkId: 'fw-ncaaa-saudi', versionName: 'ETEC / NCAAA Program Accreditation Standards & SAQF (2022)', effectiveDate: '2022-09-01', status: 'Active' },
  { id: 'fwv-hec-2023', frameworkId: 'fw-hec-pakistan', versionName: 'HEC Pakistan Undergraduate Policy v1.1 (2023)', effectiveDate: '2023-09-01', status: 'Active' },
  { id: 'fwv-nba-tier1', frameworkId: 'fw-nba-india', versionName: 'NBA Tier-I Outcome Criteria manual (2022)', effectiveDate: '2022-04-01', status: 'Active' },
  { id: 'fwv-gen-obe-v1', frameworkId: 'fw-general-obe', versionName: 'Universal OBE Constructive Alignment Standard (2024)', effectiveDate: '2024-01-01', status: 'Active' },
  { id: 'fwv-custom-v1', frameworkId: 'fw-custom-institutional', versionName: 'University Standard Outcome Model (Current)', effectiveDate: '2025-01-01', status: 'Active' },
];

export const INITIAL_FRAMEWORK_OUTCOMES: FrameworkOutcome[] = [
  // 1. ABET CAC (SO 1 to 6)
  { id: 'fwo-abet-cac-1', frameworkVersionId: 'fwv-abet-cac-2024', code: 'SO 1', title: 'Complex Problem Analysis', description: 'Analyze a complex computing problem and apply principles of computing and other relevant disciplines to identify solutions.', outcomeType: 'Student Outcome', sequence: 1 },
  { id: 'fwo-abet-cac-2', frameworkVersionId: 'fwv-abet-cac-2024', code: 'SO 2', title: 'Design & Evaluation', description: 'Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program’s discipline.', outcomeType: 'Student Outcome', sequence: 2 },
  { id: 'fwo-abet-cac-3', frameworkVersionId: 'fwv-abet-cac-2024', code: 'SO 3', title: 'Professional Communication', description: 'Communicate effectively in a variety of professional contexts.', outcomeType: 'Student Outcome', sequence: 3 },
  { id: 'fwo-abet-cac-4', frameworkVersionId: 'fwv-abet-cac-2024', code: 'SO 4', title: 'Legal & Ethical Responsibilities', description: 'Recognize professional responsibilities and make informed judgments in computing practice based on legal and ethical principles.', outcomeType: 'Student Outcome', sequence: 4 },
  { id: 'fwo-abet-cac-5', frameworkVersionId: 'fwv-abet-cac-2024', code: 'SO 5', title: 'Collaborative Teamwork', description: 'Function effectively as a member or leader of a team engaged in activities appropriate to the program’s discipline.', outcomeType: 'Student Outcome', sequence: 5 },
  { id: 'fwo-abet-cac-6', frameworkVersionId: 'fwv-abet-cac-2024', code: 'SO 6', title: 'Theory & Systems Integration', description: 'Apply computer science theory and software development fundamentals to produce computing-based solutions.', outcomeType: 'Student Outcome', sequence: 6 },

  // 2. ABET EAC (SO 1 to 7)
  { id: 'fwo-abet-eac-1', frameworkVersionId: 'fwv-abet-eac-2024', code: 'SO 1', title: 'Engineering Problem Solving', description: 'Identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics.', outcomeType: 'Student Outcome', sequence: 1 },
  { id: 'fwo-abet-eac-2', frameworkVersionId: 'fwv-abet-eac-2024', code: 'SO 2', title: 'Engineering Design', description: 'Apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors.', outcomeType: 'Student Outcome', sequence: 2 },
  { id: 'fwo-abet-eac-3', frameworkVersionId: 'fwv-abet-eac-2024', code: 'SO 3', title: 'Effective Communication', description: 'Communicate effectively with a range of audiences.', outcomeType: 'Student Outcome', sequence: 3 },
  { id: 'fwo-abet-eac-4', frameworkVersionId: 'fwv-abet-eac-2024', code: 'SO 4', title: 'Ethical & Professional Responsibility', description: 'Recognize ethical and professional responsibilities in engineering situations and make informed judgments considering global, economic, environmental, and societal contexts.', outcomeType: 'Student Outcome', sequence: 4 },
  { id: 'fwo-abet-eac-5', frameworkVersionId: 'fwv-abet-eac-2024', code: 'SO 5', title: 'Collaborative Team Leadership', description: 'Function effectively on a team whose members together provide leadership, create a collaborative and inclusive environment, establish goals, plan tasks, and meet objectives.', outcomeType: 'Student Outcome', sequence: 5 },
  { id: 'fwo-abet-eac-6', frameworkVersionId: 'fwv-abet-eac-2024', code: 'SO 6', title: 'Experimentation & Data Analysis', description: 'Develop and conduct appropriate experimentation, analyze and interpret data, and use engineering judgment to draw conclusions.', outcomeType: 'Student Outcome', sequence: 6 },
  { id: 'fwo-abet-eac-7', frameworkVersionId: 'fwv-abet-eac-2024', code: 'SO 7', title: 'Autonomous Learning & Knowledge Acquisition', description: 'Acquire and apply new knowledge as needed, using appropriate learning strategies.', outcomeType: 'Student Outcome', sequence: 7 },

  // 3. WASHINGTON ACCORD (WA 1 to 12)
  { id: 'fwo-wa-1', frameworkVersionId: 'fwv-wa-2021', code: 'WA 1', title: 'Engineering Knowledge', description: 'Apply knowledge of mathematics, natural science, computing, and engineering fundamentals to the solution of complex engineering problems.', outcomeType: 'Graduate Attribute', sequence: 1 },
  { id: 'fwo-wa-2', frameworkVersionId: 'fwv-wa-2021', code: 'WA 2', title: 'Problem Analysis', description: 'Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions using first principles.', outcomeType: 'Graduate Attribute', sequence: 2 },
  { id: 'fwo-wa-3', frameworkVersionId: 'fwv-wa-2021', code: 'WA 3', title: 'Design/Development of Solutions', description: 'Design creative solutions for complex engineering problems and design systems, components or processes meeting specified needs with safety, cultural, and environmental considerations.', outcomeType: 'Graduate Attribute', sequence: 3 },
  { id: 'fwo-wa-4', frameworkVersionId: 'fwv-wa-2021', code: 'WA 4', title: 'Investigation', description: 'Conduct investigations of complex engineering problems using research-based knowledge and research methods including design of experiments and synthesis of data.', outcomeType: 'Graduate Attribute', sequence: 4 },
  { id: 'fwo-wa-5', frameworkVersionId: 'fwv-wa-2021', code: 'WA 5', title: 'Modern Tool Usage', description: 'Create, select and apply appropriate techniques, resources, and modern engineering and IT tools, including prediction and modelling, to complex engineering problems.', outcomeType: 'Graduate Attribute', sequence: 5 },
  { id: 'fwo-wa-6', frameworkVersionId: 'fwv-wa-2021', code: 'WA 6', title: 'The Engineer and the World', description: 'Analyze and evaluate sustainable development impacts to solve complex engineering problems, considering economic, social, environmental, and cultural impacts.', outcomeType: 'Graduate Attribute', sequence: 6 },
  { id: 'fwo-wa-7', frameworkVersionId: 'fwv-wa-2021', code: 'WA 7', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics, responsibilities, and norms of engineering practice.', outcomeType: 'Graduate Attribute', sequence: 7 },
  { id: 'fwo-wa-8', frameworkVersionId: 'fwv-wa-2021', code: 'WA 8', title: 'Individual and Collaborative Teamwork', description: 'Function effectively as an individual, and as a member or leader in diverse and inclusive teams and in multidisciplinary settings.', outcomeType: 'Graduate Attribute', sequence: 8 },
  { id: 'fwo-wa-9', frameworkVersionId: 'fwv-wa-2021', code: 'WA 9', title: 'Communication', description: 'Communicate effectively and inclusively on complex engineering activities with the engineering community and with society at large.', outcomeType: 'Graduate Attribute', sequence: 9 },
  { id: 'fwo-wa-10', frameworkVersionId: 'fwv-wa-2021', code: 'WA 10', title: 'Project Management & Finance', description: 'Apply engineering management principles and economic decision-making to one’s own work, as a member and leader in a team.', outcomeType: 'Graduate Attribute', sequence: 10 },
  { id: 'fwo-wa-11', frameworkVersionId: 'fwv-wa-2021', code: 'WA 11', title: 'Lifelong Learning', description: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.', outcomeType: 'Graduate Attribute', sequence: 11 },
  { id: 'fwo-wa-12', frameworkVersionId: 'fwv-wa-2021', code: 'WA 12', title: 'Judgement in Practice', description: 'Exercise judgement in practice in relation to professional engineering activities considering societal and regulatory standards.', outcomeType: 'Graduate Attribute', sequence: 12 },

  // 4. DUBLIN ACCORD (DA 1 to 12)
  { id: 'fwo-da-1', frameworkVersionId: 'fwv-da-2021', code: 'DA 1', title: 'Engineering Technician Knowledge', description: 'Apply knowledge of underlying engineering fundamentals and technical principles to solve well-defined engineering problems.', outcomeType: 'Graduate Attribute', sequence: 1 },
  { id: 'fwo-da-2', frameworkVersionId: 'fwv-da-2021', code: 'DA 2', title: 'Problem Analysis (Well-Defined)', description: 'Identify, clarify and analyze well-defined engineering problems using codified methods and practical procedures.', outcomeType: 'Graduate Attribute', sequence: 2 },
  { id: 'fwo-da-3', frameworkVersionId: 'fwv-da-2021', code: 'DA 3', title: 'Design/Implementation of Solutions', description: 'Contribute to the design and implementation of technical solutions for well-defined engineering problems according to standard specifications.', outcomeType: 'Graduate Attribute', sequence: 3 },
  { id: 'fwo-da-4', frameworkVersionId: 'fwv-da-2021', code: 'DA 4', title: 'Investigation & Technical Testing', description: 'Conduct tests and measurements, calibrate instruments, and interpret experimental data on well-defined technical systems.', outcomeType: 'Graduate Attribute', sequence: 4 },
  { id: 'fwo-da-5', frameworkVersionId: 'fwv-da-2021', code: 'DA 5', title: 'Modern Technical Tool Usage', description: 'Operate and apply appropriate modern workshop tools, diagnostic equipment, and computer software with an awareness of constraints.', outcomeType: 'Graduate Attribute', sequence: 5 },
  { id: 'fwo-da-6', frameworkVersionId: 'fwv-da-2021', code: 'DA 6', title: 'The Technician in Society', description: 'Demonstrate awareness of health, safety, and legal requirements pertinent to technical engineering practice.', outcomeType: 'Graduate Attribute', sequence: 6 },
  { id: 'fwo-da-7', frameworkVersionId: 'fwv-da-2021', code: 'DA 7', title: 'Environment & Sustainability', description: 'Understand and apply sustainable practices in operational tasks and waste reduction.', outcomeType: 'Graduate Attribute', sequence: 7 },
  { id: 'fwo-da-8', frameworkVersionId: 'fwv-da-2021', code: 'DA 8', title: 'Technician Ethics', description: 'Understand and commit to ethical professional practice, craftsmanship, and safety obligations.', outcomeType: 'Graduate Attribute', sequence: 8 },
  { id: 'fwo-da-9', frameworkVersionId: 'fwv-da-2021', code: 'DA 9', title: 'Individual and Team Work', description: 'Function effectively as an individual, and as a collaborative technical team member.', outcomeType: 'Graduate Attribute', sequence: 9 },
  { id: 'fwo-da-10', frameworkVersionId: 'fwv-da-2021', code: 'DA 10', title: 'Technical Communication', description: 'Communicate effectively through engineering drawings, technical reports, operational logs, and clear verbal briefings.', outcomeType: 'Graduate Attribute', sequence: 10 },
  { id: 'fwo-da-11', frameworkVersionId: 'fwv-da-2021', code: 'DA 11', title: 'Operational Project Practice', description: 'Demonstrate awareness of project task scheduling, workshop budgeting, and resource utilization.', outcomeType: 'Graduate Attribute', sequence: 11 },
  { id: 'fwo-da-12', frameworkVersionId: 'fwv-da-2021', code: 'DA 12', title: 'Continuing Technical Development', description: 'Recognize the necessity of maintaining personal technical skills and adapting to evolving industrial equipment.', outcomeType: 'Graduate Attribute', sequence: 12 },

  // 5. AACSB BUSINESS COMPETENCY GOALS (CG 1 to 7)
  { id: 'fwo-aacsb-1', frameworkVersionId: 'fwv-aacsb-2020', code: 'CG 1', title: 'Strategic Business Acumen', description: 'Synthesize core disciplinary business concepts across finance, marketing, operations, and management to solve complex corporate challenges.', outcomeType: 'Learning Goal', sequence: 1 },
  { id: 'fwo-aacsb-2', frameworkVersionId: 'fwv-aacsb-2020', code: 'CG 2', title: 'Data Analytics & Digital Technology', description: 'Apply quantitative reasoning, business intelligence tools, and data analytics to optimize managerial decision making.', outcomeType: 'Learning Goal', sequence: 2 },
  { id: 'fwo-aacsb-3', frameworkVersionId: 'fwv-aacsb-2020', code: 'CG 3', title: 'Ethical Reasoning & Corporate Social Responsibility', description: 'Identify ethical dilemmas in business environments, formulate principles-based solutions, and evaluate societal and ESG impacts.', outcomeType: 'Learning Goal', sequence: 3 },
  { id: 'fwo-aacsb-4', frameworkVersionId: 'fwv-aacsb-2020', code: 'CG 4', title: 'Executive & Strategic Communication', description: 'Deliver persuasive, data-supported executive presentations and professional business reports to diverse stakeholder groups.', outcomeType: 'Learning Goal', sequence: 4 },
  { id: 'fwo-aacsb-5', frameworkVersionId: 'fwv-aacsb-2020', code: 'CG 5', title: 'Collaborative Leadership & Cross-Functional Teamwork', description: 'Demonstrate inclusive leadership, negotiation skills, and high-performance team collaboration in multicultural corporate environments.', outcomeType: 'Learning Goal', sequence: 5 },
  { id: 'fwo-aacsb-6', frameworkVersionId: 'fwv-aacsb-2020', code: 'CG 6', title: 'Global Business Perspectives', description: 'Analyze international market opportunities, cross-border macroeconomic risks, and cultural dynamics in global enterprise operations.', outcomeType: 'Learning Goal', sequence: 6 },
  { id: 'fwo-aacsb-7', frameworkVersionId: 'fwv-aacsb-2020', code: 'CG 7', title: 'Critical Thinking & Innovative Entrepreneurship', description: 'Formulate viable business models, evaluate commercial risk, and design innovative solutions for market disruptions.', outcomeType: 'Learning Goal', sequence: 7 },

  // 6. ACBSP BUSINESS (CPC 1 to 6)
  { id: 'fwo-acbsp-1', frameworkVersionId: 'fwv-acbsp-2022', code: 'CPC 1', title: 'Accounting & Financial Resource Allocation', description: 'Interpret financial statements, perform managerial cost accounting, and allocate capital to maximize organizational sustainability.', outcomeType: 'Program Learning Outcome', sequence: 1 },
  { id: 'fwo-acbsp-2', frameworkVersionId: 'fwv-acbsp-2022', code: 'CPC 2', title: 'Organizational Leadership & Strategic Management', description: 'Apply management theories, human resource principles, and strategic planning models to guide enterprise performance.', outcomeType: 'Program Learning Outcome', sequence: 2 },
  { id: 'fwo-acbsp-3', frameworkVersionId: 'fwv-acbsp-2022', code: 'CPC 3', title: 'Marketing Management & Consumer Analytics', description: 'Design customer-centric marketing campaigns, analyze competitive positioning, and evaluate consumer decision behaviors.', outcomeType: 'Program Learning Outcome', sequence: 3 },
  { id: 'fwo-acbsp-4', frameworkVersionId: 'fwv-acbsp-2022', code: 'CPC 4', title: 'Business Law, Regulation & Commercial Ethics', description: 'Evaluate legal contracts, intellectual property rights, regulatory compliance, and professional business ethics.', outcomeType: 'Program Learning Outcome', sequence: 4 },
  { id: 'fwo-acbsp-5', frameworkVersionId: 'fwv-acbsp-2022', code: 'CPC 5', title: 'Global Economics & International Business', description: 'Assess macroeconomic policy, foreign exchange mechanisms, and comparative economic systems governing trade.', outcomeType: 'Program Learning Outcome', sequence: 5 },
  { id: 'fwo-acbsp-6', frameworkVersionId: 'fwv-acbsp-2022', code: 'CPC 6', title: 'Operations Management & Information Systems', description: 'Model supply chain workflows, apply quantitative operations research, and leverage enterprise information systems.', outcomeType: 'Program Learning Outcome', sequence: 6 },

  // 7. NCAAA SAUDI ARABIA (K1-K2, S1-S3, V1-V3)
  { id: 'fwo-ncaaa-1', frameworkVersionId: 'fwv-ncaaa-2022', code: 'K 1', title: 'Knowledge: Disciplinary Concepts & Theories', description: 'Demonstrate deep conceptual mastery of fundamental and specialized principles within the disciplinary field.', outcomeType: 'Program Learning Outcome', sequence: 1 },
  { id: 'fwo-ncaaa-2', frameworkVersionId: 'fwv-ncaaa-2022', code: 'K 2', title: 'Knowledge: Contemporary Developments & National Context', description: 'Analyze cutting-edge research, contemporary methodologies, and their strategic application to Saudi Vision 2030 priorities.', outcomeType: 'Program Learning Outcome', sequence: 2 },
  { id: 'fwo-ncaaa-3', frameworkVersionId: 'fwv-ncaaa-2022', code: 'S 1', title: 'Skills: Cognitive Analysis & Critical Problem Solving', description: 'Investigate complex, unstructured problems and formulate evidence-based solutions using creative and analytical reasoning.', outcomeType: 'Program Learning Outcome', sequence: 3 },
  { id: 'fwo-ncaaa-4', frameworkVersionId: 'fwv-ncaaa-2022', code: 'S 2', title: 'Skills: Practical, Professional & Technological Application', description: 'Utilize specialized laboratory, clinical, computational, and digital tools with high technical proficiency and safety compliance.', outcomeType: 'Program Learning Outcome', sequence: 4 },
  { id: 'fwo-ncaaa-5', frameworkVersionId: 'fwv-ncaaa-2022', code: 'S 3', title: 'Skills: Communication & Digital Literacy', description: 'Communicate academic and professional discourse fluently in written and oral formats using advanced digital media.', outcomeType: 'Program Learning Outcome', sequence: 5 },
  { id: 'fwo-ncaaa-6', frameworkVersionId: 'fwv-ncaaa-2022', code: 'V 1', title: 'Values: Professional Ethics & Academic Integrity', description: 'Commit to highest standards of academic integrity, Islamic and professional ethical codes, and societal stewardship.', outcomeType: 'Program Learning Outcome', sequence: 6 },
  { id: 'fwo-ncaaa-7', frameworkVersionId: 'fwv-ncaaa-2022', code: 'V 2', title: 'Values: Autonomy, Leadership & Collaborative Teamwork', description: 'Lead diverse task teams effectively, take initiative in professional contexts, and manage collaborative deliverables.', outcomeType: 'Program Learning Outcome', sequence: 7 },
  { id: 'fwo-ncaaa-8', frameworkVersionId: 'fwv-ncaaa-2022', code: 'V 3', title: 'Values: Civic Responsibility & Continuous Self-Development', description: 'Demonstrate active civic engagement, sustainable environmental awareness, and dedication to lifelong personal learning.', outcomeType: 'Program Learning Outcome', sequence: 8 },

  // 8. CAEP TEACHER EDUCATION (CAEP 1 to 5)
  { id: 'fwo-caep-1', frameworkVersionId: 'fwv-caep-2022', code: 'CAEP 1', title: 'Content & Pedagogical Knowledge', description: 'Demonstrate deep disciplinary content understanding and pedagogical methods ensuring meaningful P-12 student learning.', outcomeType: 'Teaching Standard', sequence: 1 },
  { id: 'fwo-caep-2', frameworkVersionId: 'fwv-caep-2022', code: 'CAEP 2', title: 'Clinical Partnerships & Practice', description: 'Collaborate effectively in school-based clinical partnerships, co-teaching, and mentoring in real classroom settings.', outcomeType: 'Teaching Standard', sequence: 2 },
  { id: 'fwo-caep-3', frameworkVersionId: 'fwv-caep-2022', code: 'CAEP 3', title: 'Candidate Quality & Selectivity', description: 'Exhibit professional dispositions, academic rigor, and ethical commitments required of highly qualified educators.', outcomeType: 'Teaching Standard', sequence: 3 },
  { id: 'fwo-caep-4', frameworkVersionId: 'fwv-caep-2022', code: 'CAEP 4', title: 'Program Impact on P-12 Student Learning', description: 'Demonstrate positive, documented impact on P-12 student learning growth through data-informed instructional interventions.', outcomeType: 'Teaching Standard', sequence: 4 },
  { id: 'fwo-caep-5', frameworkVersionId: 'fwv-caep-2022', code: 'CAEP 5', title: 'Quality Assurance & Continuous Improvement', description: 'Engage in continuous quality improvement cycles by analyzing learner assessment data to refine pedagogical delivery.', outcomeType: 'Teaching Standard', sequence: 5 },

  // 9. CCTC CALIFORNIA TEACHING PERFORMANCE EXPECTATIONS (TPE 1 to 6)
  { id: 'fwo-cctc-1', frameworkVersionId: 'fwv-cctc-2020', code: 'TPE 1', title: 'Engaging & Supporting All Students in Learning', description: 'Connect student prior knowledge, cultural background, and language proficiencies to rigorous instructional learning goals.', outcomeType: 'Teaching Standard', sequence: 1 },
  { id: 'fwo-cctc-2', frameworkVersionId: 'fwv-cctc-2020', code: 'TPE 2', title: 'Creating & Maintaining Effective Learning Environments', description: 'Establish an inclusive, caring, and intellectually safe classroom environment that fosters social-emotional well-being.', outcomeType: 'Teaching Standard', sequence: 2 },
  { id: 'fwo-cctc-3', frameworkVersionId: 'fwv-cctc-2020', code: 'TPE 3', title: 'Understanding & Organizing Subject Matter', description: 'Organize curriculum to facilitate student mastery of California academic standards and disciplinary content structures.', outcomeType: 'Teaching Standard', sequence: 3 },
  { id: 'fwo-cctc-4', frameworkVersionId: 'fwv-cctc-2020', code: 'TPE 4', title: 'Planning Instruction & Designing Learning Experiences', description: 'Design differentiated lesson sequences incorporating universal design for learning (UDL) and English learner scaffolds.', outcomeType: 'Teaching Standard', sequence: 4 },
  { id: 'fwo-cctc-5', frameworkVersionId: 'fwv-cctc-2020', code: 'TPE 5', title: 'Assessing Student Learning', description: 'Design and implement diagnostic, formative, and summative assessments to monitor student progress and guide instruction.', outcomeType: 'Teaching Standard', sequence: 5 },
  { id: 'fwo-cctc-6', frameworkVersionId: 'fwv-cctc-2020', code: 'TPE 6', title: 'Developing as a Professional Educator', description: 'Reflect upon personal teaching practices, engage in professional learning communities, and uphold ethical educator codes.', outcomeType: 'Teaching Standard', sequence: 6 },

  // 10. CCTP CLINICAL TEACHER PREPARATION (CCTP 1 to 5)
  { id: 'fwo-cctp-1', frameworkVersionId: 'fwv-cctp-2023', code: 'CCTP 1', title: 'High-Leverage Instructional Practices', description: 'Execute foundational high-leverage teaching practices including eliciting student thinking, facilitating discourse, and modeling.', outcomeType: 'Teaching Standard', sequence: 1 },
  { id: 'fwo-cctp-2', frameworkVersionId: 'fwv-cctp-2023', code: 'CCTP 2', title: 'Mentored Clinical Co-Teaching', description: 'Engage productively in shared instructional planning, co-teaching models, and responsive clinical feedback cycles.', outcomeType: 'Teaching Standard', sequence: 2 },
  { id: 'fwo-cctp-3', frameworkVersionId: 'fwv-cctp-2023', code: 'CCTP 3', title: 'Culturally Sustaining & Equitable Pedagogy', description: 'Enact culturally responsive pedagogy that honors diverse student assets and dismantles structural learning barriers.', outcomeType: 'Teaching Standard', sequence: 3 },
  { id: 'fwo-cctp-4', frameworkVersionId: 'fwv-cctp-2023', code: 'CCTP 4', title: 'Data-Informed Clinical Intervention', description: 'Analyze student classroom artifacts and real-time assessment data to adapt instructional pacing and targeted support.', outcomeType: 'Teaching Standard', sequence: 4 },
  { id: 'fwo-cctp-5', frameworkVersionId: 'fwv-cctp-2023', code: 'CCTP 5', title: 'Family & Community Engagement', description: 'Build reciprocal, respectful partnerships with student families and community stakeholders to support whole-child development.', outcomeType: 'Teaching Standard', sequence: 5 },

  // 11. HLC CRITERIA FOR ACCREDITATION (HLC 1 to 5)
  { id: 'fwo-hlc-1', frameworkVersionId: 'fwv-hlc-2020', code: 'HLC 1', title: 'Mission & Public Good', description: 'Operate with integrity to fulfill the educational mission for the public interest.', outcomeType: 'Accreditation Criterion', sequence: 1 },
  { id: 'fwo-hlc-2', frameworkVersionId: 'fwv-hlc-2020', code: 'HLC 2', title: 'Integrity, Ethical Conduct & Governance', description: 'Act ethically and responsibly in academic governance, administrative policies, and financial management.', outcomeType: 'Accreditation Criterion', sequence: 2 },
  { id: 'fwo-hlc-3', frameworkVersionId: 'fwv-hlc-2020', code: 'HLC 3', title: 'Teaching & Learning: Quality, Resources & Support', description: 'Provide high-quality academic degree programs with appropriate curriculum design, qualified faculty, and support resources.', outcomeType: 'Accreditation Criterion', sequence: 3 },
  { id: 'fwo-hlc-4', frameworkVersionId: 'fwv-hlc-2020', code: 'HLC 4', title: 'Teaching & Learning: Evaluation & Improvement', description: 'Demonstrate systematic assessment of student learning outcomes at program and course levels to drive continuous improvement.', outcomeType: 'Accreditation Criterion', sequence: 4 },
  { id: 'fwo-hlc-5', frameworkVersionId: 'fwv-hlc-2020', code: 'HLC 5', title: 'Institutional Effectiveness & Resource Allocation', description: 'Allocate institutional resources systematically to sustain academic quality and student completion goals.', outcomeType: 'Accreditation Criterion', sequence: 5 },

  // 12. MSCHE STANDARDS (MSCHE Std 1 to 7)
  { id: 'fwo-msche-1', frameworkVersionId: 'fwv-msche-2023', code: 'Std I', title: 'Mission and Goals', description: 'Institutional mission clearly defines purpose and student demographics.', outcomeType: 'Institutional Standard', sequence: 1 },
  { id: 'fwo-msche-2', frameworkVersionId: 'fwv-msche-2023', code: 'Std II', title: 'Ethics and Integrity', description: 'Faithful adherence to academic freedom, ethical conduct, and student rights.', outcomeType: 'Institutional Standard', sequence: 2 },
  { id: 'fwo-msche-3', frameworkVersionId: 'fwv-msche-2023', code: 'Std III', title: 'Design & Delivery of Student Learning Experience', description: 'Curricula are coherent, rigorous, characterized by collegiate level learning, and delivered by qualified faculty.', outcomeType: 'Institutional Standard', sequence: 3 },
  { id: 'fwo-msche-4', frameworkVersionId: 'fwv-msche-2023', code: 'Std IV', title: 'Support of the Student Experience', description: 'Systematic support services from orientation to graduation foster learner success.', outcomeType: 'Institutional Standard', sequence: 4 },
  { id: 'fwo-msche-5', frameworkVersionId: 'fwv-msche-2023', code: 'Std V', title: 'Educational Effectiveness Assessment', description: 'Systematic direct assessment of student learning outcomes across all degree offerings with evidence-based curricular revisions.', outcomeType: 'Institutional Standard', sequence: 5 },
  { id: 'fwo-msche-6', frameworkVersionId: 'fwv-msche-2023', code: 'Std VI', title: 'Planning, Resources & Improvement', description: 'Comprehensive planning and budget allocation support educational goals.', outcomeType: 'Institutional Standard', sequence: 6 },
  { id: 'fwo-msche-7', frameworkVersionId: 'fwv-msche-2023', code: 'Std VII', title: 'Governance, Leadership & Administration', description: 'Effective governance structures support collegiate academic integrity.', outcomeType: 'Institutional Standard', sequence: 7 },

  // 13. NECHE STANDARDS (NECHE Std 1 to 8)
  { id: 'fwo-neche-4', frameworkVersionId: 'fwv-neche-2021', code: 'Std 4', title: 'The Academic Program: Coherence & Rigor', description: 'Academic degree programs demonstrate curricular coherence, appropriate collegiate level progression, and intellectual depth.', outcomeType: 'Institutional Standard', sequence: 1 },
  { id: 'fwo-neche-8', frameworkVersionId: 'fwv-neche-2021', code: 'Std 8', title: 'Educational Effectiveness & Student Learning', description: 'Systematic assessment of student learning outcomes demonstrates that graduates achieve declared competencies.', outcomeType: 'Institutional Standard', sequence: 2 },
  { id: 'fwo-neche-2', frameworkVersionId: 'fwv-neche-2021', code: 'Std 2', title: 'Planning & Evaluation', description: 'Systematic planning and evaluation inform institutional resource allocation and curriculum revision.', outcomeType: 'Institutional Standard', sequence: 3 },
  { id: 'fwo-neche-6', frameworkVersionId: 'fwv-neche-2021', code: 'Std 6', title: 'Teaching, Learning & Scholarship', description: 'Faculty exhibit scholarly competence and utilize active teaching methodologies fostering student engagement.', outcomeType: 'Institutional Standard', sequence: 4 },

  // 14. NWCCU STANDARDS (NWCCU 1.C.1 to 1.C.7)
  { id: 'fwo-nwccu-1', frameworkVersionId: 'fwv-nwccu-2020', code: '1.C.1', title: 'Articulated Learning Outcomes', description: 'All programs clearly define student learning outcomes that are consistent with mission and disciplinary standards.', outcomeType: 'Accreditation Criterion', sequence: 1 },
  { id: 'fwo-nwccu-2', frameworkVersionId: 'fwv-nwccu-2020', code: '1.C.5', title: 'Direct Assessment of Student Achievement', description: 'Engage in ongoing, systematic collection and analysis of direct student learning evidence.', outcomeType: 'Accreditation Criterion', sequence: 2 },
  { id: 'fwo-nwccu-3', frameworkVersionId: 'fwv-nwccu-2020', code: '1.C.7', title: 'Continuous Quality Improvement (Closing the Loop)', description: 'Use assessment results to effect improvements in academic programs, pedagogy, and student learning environments.', outcomeType: 'Accreditation Criterion', sequence: 3 },
  { id: 'fwo-nwccu-4', frameworkVersionId: 'fwv-nwccu-2020', code: '1.D.2', title: 'Disaggregated Student Success & Equity', description: 'Analyze student retention, progression, and completion metrics disaggregated by demographic indicators.', outcomeType: 'Accreditation Criterion', sequence: 4 },

  // 15. SACSCOC PRINCIPLES (SACSCOC 8.1 to 9.7)
  { id: 'fwo-sacscoc-1', frameworkVersionId: 'fwv-sacscoc-2024', code: '8.2.a', title: 'Student Outcomes: Educational Programs', description: 'The institution identifies expected outcomes for each of its educational programs, assesses whether it achieves them, and provides evidence of improvement.', outcomeType: 'Institutional Standard', sequence: 1 },
  { id: 'fwo-sacscoc-2', frameworkVersionId: 'fwv-sacscoc-2024', code: '8.2.b', title: 'General Education Competencies', description: 'The institution identifies and assesses general education competencies in college-level programs.', outcomeType: 'Institutional Standard', sequence: 2 },
  { id: 'fwo-sacscoc-3', frameworkVersionId: 'fwv-sacscoc-2024', code: '8.1', title: 'Student Achievement Benchmarks', description: 'The institution evaluates student success metrics, setting and publishing explicit threshold targets.', outcomeType: 'Institutional Standard', sequence: 3 },
  { id: 'fwo-sacscoc-4', frameworkVersionId: 'fwv-sacscoc-2024', code: '9.1', title: 'Program Quality & Curricular Structure', description: 'Educational programs embody coherent curricular sequencing and adequate credit hour workloads.', outcomeType: 'Institutional Standard', sequence: 4 },

  // 16. WSCUC CORE COMPETENCIES & STANDARDS (WSCUC CC 1 to 5)
  { id: 'fwo-wscuc-1', frameworkVersionId: 'fwv-wscuc-2023', code: 'CC 1', title: 'Written Communication', description: 'Demonstrate clear, rhetorically effective, and evidence-grounded written composition across diverse genres.', outcomeType: 'Core Competency', sequence: 1 },
  { id: 'fwo-wscuc-2', frameworkVersionId: 'fwv-wscuc-2023', code: 'CC 2', title: 'Oral Communication', description: 'Deliver persuasive, organized, and interactive verbal presentations tailored to disciplinary and public audiences.', outcomeType: 'Core Competency', sequence: 2 },
  { id: 'fwo-wscuc-3', frameworkVersionId: 'fwv-wscuc-2023', code: 'CC 3', title: 'Quantitative Reasoning', description: 'Interpret empirical data, perform mathematical computations, and draw valid inferences from quantitative models.', outcomeType: 'Core Competency', sequence: 3 },
  { id: 'fwo-wscuc-4', frameworkVersionId: 'fwv-wscuc-2023', code: 'CC 4', title: 'Critical Thinking', description: 'Deconstruct complex arguments, evaluate underlying assumptions, and synthesize novel analytical conclusions.', outcomeType: 'Core Competency', sequence: 4 },
  { id: 'fwo-wscuc-5', frameworkVersionId: 'fwv-wscuc-2023', code: 'CC 5', title: 'Information Literacy', description: 'Locate, critically appraise, ethically utilize, and legally attribute scholarship and digital information sources.', outcomeType: 'Core Competency', sequence: 5 },
  { id: 'fwo-wscuc-6', frameworkVersionId: 'fwv-wscuc-2023', code: 'Std 2.2', title: 'Program Coherence & Curricular Scaffolding', description: 'Baccalaureate degree programs offer clear, integrated pathways connecting lower-division foundations to capstone mastery.', outcomeType: 'Institutional Standard', sequence: 6 },

  // 17. EHEA STANDARDS & DUBLIN DESCRIPTORS (ESG 1.2 to 1.9)
  { id: 'fwo-ehea-1', frameworkVersionId: 'fwv-ehea-2015', code: 'ESG 1.2', title: 'Design & Approval of Programmes', description: 'Programmes are designed to meet target objectives, including explicit intended learning outcomes and ECTS credit allocations.', outcomeType: 'Quality Standard', sequence: 1 },
  { id: 'fwo-ehea-2', frameworkVersionId: 'fwv-ehea-2015', code: 'ESG 1.3', title: 'Student-Centred Learning, Teaching & Assessment', description: 'Instruction encourages student autonomy, active pedagogical engagement, and criterion-referenced assessment aligned with outcomes.', outcomeType: 'Quality Standard', sequence: 2 },
  { id: 'fwo-ehea-3', frameworkVersionId: 'fwv-ehea-2015', code: 'DD C1', title: 'Dublin Descriptors: Cycle 1 (Knowledge & Application)', description: 'Demonstrate knowledge and understanding that builds upon secondary education, supported by advanced textbooks and research.', outcomeType: 'Quality Standard', sequence: 3 },
  { id: 'fwo-ehea-4', frameworkVersionId: 'fwv-ehea-2015', code: 'DD C2', title: 'Dublin Descriptors: Problem Solving & Judgement', description: 'Gather and interpret relevant data to make informed judgements that include reflection on relevant social, scientific, or ethical issues.', outcomeType: 'Quality Standard', sequence: 4 },
  { id: 'fwo-ehea-5', frameworkVersionId: 'fwv-ehea-2015', code: 'ESG 1.9', title: 'Periodic Programme Monitoring & Review', description: 'Regularly monitor and periodically review programs to ensure they achieve intended objectives and meet stakeholder needs.', outcomeType: 'Quality Standard', sequence: 5 },

  // 18. FIBAA QUALITY CRITERIA (FIBAA 1 to 5)
  { id: 'fwo-fibaa-1', frameworkVersionId: 'fwv-fibaa-2023', code: 'FIBAA 1', title: 'Strategic Objectives & International Profile', description: 'Degree program establishes clear academic positioning, international orientation, and graduate employability profiles.', outcomeType: 'Accreditation Criterion', sequence: 1 },
  { id: 'fwo-fibaa-2', frameworkVersionId: 'fwv-fibaa-2023', code: 'FIBAA 2', title: 'Curricular Structure & ECTS Feasibility', description: 'Competence-oriented modularization ensures realistic student workload calculations and verified ECTS credit feasibility.', outcomeType: 'Accreditation Criterion', sequence: 2 },
  { id: 'fwo-fibaa-3', frameworkVersionId: 'fwv-fibaa-2023', code: 'FIBAA 3', title: 'Practical Relevance & Corporate Integration', description: 'Integrates real-world business case studies, practical problem-solving projects, and executive guest lectures into curriculum.', outcomeType: 'Accreditation Criterion', sequence: 3 },
  { id: 'fwo-fibaa-4', frameworkVersionId: 'fwv-fibaa-2023', code: 'FIBAA 4', title: 'Examination Diversity & Outcome Alignment', description: 'Evaluation mechanisms assess defined competency objectives through multimodal formative and summative assessments.', outcomeType: 'Accreditation Criterion', sequence: 4 },
  { id: 'fwo-fibaa-5', frameworkVersionId: 'fwv-fibaa-2023', code: 'FIBAA 5', title: 'Continuous Quality Assurance Loops', description: 'Systematic student and stakeholder evaluations inform ongoing curricular revisions and programmatic quality assurance.', outcomeType: 'Accreditation Criterion', sequence: 5 },

  // 19. ACQUIN STANDARDS (ACQUIN 1 to 5)
  { id: 'fwo-acquin-1', frameworkVersionId: 'fwv-acquin-2022', code: 'ACQUIN 1', title: 'Qualification Objectives & Competence Orientation', description: 'Degree qualification objectives reflect academic, professional, and personal competencies aligned with European standards.', outcomeType: 'Quality Standard', sequence: 1 },
  { id: 'fwo-acquin-2', frameworkVersionId: 'fwv-acquin-2022', code: 'ACQUIN 2', title: 'Curricular Concept & Modular Scaffolding', description: 'Curriculum exhibits didactic sequencing, transparent module handbooks, and verified study feasibility for enrolled cohorts.', outcomeType: 'Quality Standard', sequence: 2 },
  { id: 'fwo-acquin-3', frameworkVersionId: 'fwv-acquin-2022', code: 'ACQUIN 3', title: 'Student Workload & Examination System', description: 'Assessments evaluate stated learning outcomes while maintaining balanced student workloads throughout the semester.', outcomeType: 'Quality Standard', sequence: 3 },
  { id: 'fwo-acquin-4', frameworkVersionId: 'fwv-acquin-2022', code: 'ACQUIN 4', title: 'Faculty Sufficiency & Learning Resources', description: 'Adequate instructional staffing and modern digital/physical facilities support active student learning.', outcomeType: 'Quality Standard', sequence: 4 },
  { id: 'fwo-acquin-5', frameworkVersionId: 'fwv-acquin-2022', code: 'ACQUIN 5', title: 'Internal Quality Management', description: 'Robust internal quality assurance system integrates student feedback and external academic peer reviews.', outcomeType: 'Quality Standard', sequence: 5 },

  // 20. EQAA STANDARDS (EQAA 1 to 5)
  { id: 'fwo-eqaa-1', frameworkVersionId: 'fwv-eqaa-2021', code: 'EQAA 1', title: 'Intended Learning Outcomes & Curriculum Coherence', description: 'Clearly articulated learning outcomes align with academic benchmarks and societal employment requirements.', outcomeType: 'Quality Standard', sequence: 1 },
  { id: 'fwo-eqaa-2', frameworkVersionId: 'fwv-eqaa-2021', code: 'EQAA 2', title: 'Student-Centered Teaching Methodologies', description: 'Faculty employ interactive pedagogical methods that foster autonomous critical thinking and intellectual inquiry.', outcomeType: 'Quality Standard', sequence: 2 },
  { id: 'fwo-eqaa-3', frameworkVersionId: 'fwv-eqaa-2021', code: 'EQAA 3', title: 'Fair, Objective & Transparent Assessment', description: 'Grading criteria and assessment rubrics are published in advance and consistently applied to evaluate student work.', outcomeType: 'Quality Standard', sequence: 3 },
  { id: 'fwo-eqaa-4', frameworkVersionId: 'fwv-eqaa-2021', code: 'EQAA 4', title: 'Learning Support Services & Inclusivity', description: 'Holistic academic advising, library resources, and digital platforms empower all learners to achieve success.', outcomeType: 'Quality Standard', sequence: 4 },
  { id: 'fwo-eqaa-5', frameworkVersionId: 'fwv-eqaa-2021', code: 'EQAA 5', title: 'Public Transparency & Quality Reporting', description: 'Regular publication of accurate, impartial program outcomes, student retention metrics, and quality review reports.', outcomeType: 'Quality Standard', sequence: 5 },

  // 21. EUA GUIDELINES (EUA 1 to 5)
  { id: 'fwo-eua-1', frameworkVersionId: 'fwv-eua-2022', code: 'EUA 1', title: 'Strategic Academic Vision & Leadership', description: 'Institutional governance fosters a distinct academic vision, shared collegial leadership, and long-term vitality.', outcomeType: 'Institutional Standard', sequence: 1 },
  { id: 'fwo-eua-2', frameworkVersionId: 'fwv-eua-2022', code: 'EUA 2', title: 'Institutional Quality Culture', description: 'Cultivates a pervasive quality culture where all faculty and staff actively participate in evaluating and improving education.', outcomeType: 'Institutional Standard', sequence: 2 },
  { id: 'fwo-eua-3', frameworkVersionId: 'fwv-eua-2022', code: 'EUA 3', title: 'Research-Informed Teaching & Learning', description: 'Curricula integrate active inquiry and recent scientific discoveries, empowering students as emerging researchers.', outcomeType: 'Institutional Standard', sequence: 3 },
  { id: 'fwo-eua-4', frameworkVersionId: 'fwv-eua-2022', code: 'EUA 4', title: 'Societal Engagement & Regional Innovation', description: 'Academic programs actively engage external civil society, industrial partners, and regional development initiatives.', outcomeType: 'Institutional Standard', sequence: 4 },
  { id: 'fwo-eua-5', frameworkVersionId: 'fwv-eua-2022', code: 'EUA 5', title: 'Internationalisation & Student Mobility', description: 'Comprehensive strategy supports cross-border academic mobility, joint curricula, and international student integration.', outcomeType: 'Institutional Standard', sequence: 5 },

  // 22. ECA STANDARDS (ECA 1 to 5)
  { id: 'fwo-eca-1', frameworkVersionId: 'fwv-eca-2021', code: 'ECA 1', title: 'Internationalised Learning Outcomes', description: 'Intended learning outcomes explicitly reflect international and intercultural graduate competencies.', outcomeType: 'Quality Standard', sequence: 1 },
  { id: 'fwo-eca-2', frameworkVersionId: 'fwv-eca-2021', code: 'ECA 2', title: 'Curricular Integration & Mutual Recognition', description: 'Joint curricula and exchange modules ensure seamless credit portability and mutual recognition across European borders.', outcomeType: 'Quality Standard', sequence: 2 },
  { id: 'fwo-eca-3', frameworkVersionId: 'fwv-eca-2021', code: 'ECA 3', title: 'International Teaching & Learning Environment', description: 'Classroom experience features internationalized didactic materials, comparative perspectives, and cross-cultural discourse.', outcomeType: 'Quality Standard', sequence: 3 },
  { id: 'fwo-eca-4', frameworkVersionId: 'fwv-eca-2021', code: 'ECA 4', title: 'Staff & Student International Competencies', description: 'Faculty possess intercultural communication skills and support diverse international learner cohorts.', outcomeType: 'Quality Standard', sequence: 4 },
  { id: 'fwo-eca-5', frameworkVersionId: 'fwv-eca-2021', code: 'ECA 5', title: 'CeQuInt Quality Verification & Impact', description: 'Demonstrated programmatic impact on graduate international employability, cross-border research, and global citizenship.', outcomeType: 'Quality Standard', sequence: 5 },

  // 23. GENERAL OBE (PLO 1 to 5)
  { id: 'fwo-gen-1', frameworkVersionId: 'fwv-gen-obe-v1', code: 'PLO 1', title: 'Disciplinary Knowledge & Mastery', description: 'Demonstrate comprehensive theoretical understanding and conceptual command of core disciplinary principles.', outcomeType: 'Program Learning Outcome', sequence: 1 },
  { id: 'fwo-gen-2', frameworkVersionId: 'fwv-gen-obe-v1', code: 'PLO 2', title: 'Critical Thinking & Problem Solving', description: 'Identify, critically deconstruct, and formulate innovative solutions for structured and unstructured challenges.', outcomeType: 'Program Learning Outcome', sequence: 2 },
  { id: 'fwo-gen-3', frameworkVersionId: 'fwv-gen-obe-v1', code: 'PLO 3', title: 'Effective & Scholarly Communication', description: 'Articulate complex concepts, research evidence, and professional recommendations clearly in written and oral formats.', outcomeType: 'Program Learning Outcome', sequence: 3 },
  { id: 'fwo-gen-4', frameworkVersionId: 'fwv-gen-obe-v1', code: 'PLO 4', title: 'Ethics, Society & Sustainability', description: 'Apply professional ethics, equity principles, civic responsibility, and environmental sustainability in decision making.', outcomeType: 'Program Learning Outcome', sequence: 4 },
  { id: 'fwo-gen-5', frameworkVersionId: 'fwv-gen-obe-v1', code: 'PLO 5', title: 'Independent Inquiry & Lifelong Learning', description: 'Demonstrate self-directed learning, digital literacy, and the capacity to adapt to emerging technologies and methodologies.', outcomeType: 'Program Learning Outcome', sequence: 5 },
];

// Alias for backwards compatibility
export const FRAMEWORK_OUTCOMES = INITIAL_FRAMEWORK_OUTCOMES;

export const INITIAL_FRAMEWORK_TERMINOLOGIES: FrameworkTerminology[] = [
  // ABET
  { id: 'term-abet-1', frameworkVersionId: 'fwv-abet-cac-2024', conceptKey: 'program_outcome', displayName: 'Student Outcome (SO)' },
  { id: 'term-abet-2', frameworkVersionId: 'fwv-abet-cac-2024', conceptKey: 'course_learning_outcome', displayName: 'Course Learning Outcome (CLO)' },
  { id: 'term-abet-eac-1', frameworkVersionId: 'fwv-abet-eac-2024', conceptKey: 'program_outcome', displayName: 'Student Outcome (SO)' },
  { id: 'term-abet-eac-2', frameworkVersionId: 'fwv-abet-eac-2024', conceptKey: 'course_learning_outcome', displayName: 'Course Learning Outcome (CLO)' },

  // International Accords
  { id: 'term-wa-1', frameworkVersionId: 'fwv-wa-2021', conceptKey: 'program_outcome', displayName: 'Graduate Attribute (GA)' },
  { id: 'term-sa-1', frameworkVersionId: 'fwv-sa-2021', conceptKey: 'program_outcome', displayName: 'Technologist Graduate Attribute (GA)' },
  { id: 'term-da-1', frameworkVersionId: 'fwv-da-2021', conceptKey: 'program_outcome', displayName: 'Technician Graduate Attribute (DA)' },
  { id: 'term-seoul-1', frameworkVersionId: 'fwv-seoul-2022', conceptKey: 'program_outcome', displayName: 'Computing Graduate Attribute (CGA)' },

  // Business
  { id: 'term-aacsb-1', frameworkVersionId: 'fwv-aacsb-2020', conceptKey: 'program_outcome', displayName: 'Competency Goal (CG / AoL)' },
  { id: 'term-aacsb-2', frameworkVersionId: 'fwv-aacsb-2020', conceptKey: 'course_learning_outcome', displayName: 'Learning Objective (LO)' },
  { id: 'term-acbsp-1', frameworkVersionId: 'fwv-acbsp-2022', conceptKey: 'program_outcome', displayName: 'Common Professional Component (CPC)' },

  // Teacher Prep
  { id: 'term-caep-1', frameworkVersionId: 'fwv-caep-2022', conceptKey: 'program_outcome', displayName: 'Candidate Performance Standard' },
  { id: 'term-cctc-1', frameworkVersionId: 'fwv-cctc-2020', conceptKey: 'program_outcome', displayName: 'Teaching Performance Expectation (TPE)' },
  { id: 'term-cctp-1', frameworkVersionId: 'fwv-cctp-2023', conceptKey: 'program_outcome', displayName: 'Clinical Teaching Competency' },

  // US Regional
  { id: 'term-hlc-1', frameworkVersionId: 'fwv-hlc-2020', conceptKey: 'program_outcome', displayName: 'Criterion 3 & 4 Student Learning Outcome' },
  { id: 'term-msche-1', frameworkVersionId: 'fwv-msche-2023', conceptKey: 'program_outcome', displayName: 'Standard V Educational Effectiveness Outcome' },
  { id: 'term-neche-1', frameworkVersionId: 'fwv-neche-2021', conceptKey: 'program_outcome', displayName: 'Standard 8 Educational Effectiveness Outcome' },
  { id: 'term-nwccu-1', frameworkVersionId: 'fwv-nwccu-2020', conceptKey: 'program_outcome', displayName: 'Standard 1.C Student Learning Outcome' },
  { id: 'term-sacscoc-1', frameworkVersionId: 'fwv-sacscoc-2024', conceptKey: 'program_outcome', displayName: 'Standard 8.2.a Student Outcome' },
  { id: 'term-wscuc-1', frameworkVersionId: 'fwv-wscuc-2023', conceptKey: 'program_outcome', displayName: 'Core Competency / Program Outcome' },

  // European QA
  { id: 'term-ehea-1', frameworkVersionId: 'fwv-ehea-2015', conceptKey: 'program_outcome', displayName: 'ESG 1.2 Program Learning Outcome (ECTS)' },
  { id: 'term-fibaa-1', frameworkVersionId: 'fwv-fibaa-2023', conceptKey: 'program_outcome', displayName: 'Qualification Objective' },
  { id: 'term-acquin-1', frameworkVersionId: 'fwv-acquin-2022', conceptKey: 'program_outcome', displayName: 'Qualification Objective' },
  { id: 'term-eqaa-1', frameworkVersionId: 'fwv-eqaa-2021', conceptKey: 'program_outcome', displayName: 'Programme Quality Standard' },
  { id: 'term-eua-1', frameworkVersionId: 'fwv-eua-2022', conceptKey: 'program_outcome', displayName: 'Strategic Learning Outcome' },
  { id: 'term-eca-1', frameworkVersionId: 'fwv-eca-2021', conceptKey: 'program_outcome', displayName: 'International Graduate Competency' },

  // National Councils
  { id: 'term-ncaaa-1', frameworkVersionId: 'fwv-ncaaa-2022', conceptKey: 'program_outcome', displayName: 'NCAAA Program Learning Outcome (PLO)' },
  { id: 'term-ncaaa-2', frameworkVersionId: 'fwv-ncaaa-2022', conceptKey: 'course_learning_outcome', displayName: 'Course Learning Outcome (CLO)' },
  { id: 'term-hec-1', frameworkVersionId: 'fwv-hec-2023', conceptKey: 'program_outcome', displayName: 'Program Learning Outcome (PLO)' },
  { id: 'term-nba-1', frameworkVersionId: 'fwv-nba-tier1', conceptKey: 'program_outcome', displayName: 'Program Outcome (PO)' },
  { id: 'term-nba-2', frameworkVersionId: 'fwv-nba-tier1', conceptKey: 'course_learning_outcome', displayName: 'Course Outcome (CO)' },

  // General
  { id: 'term-gen-1', frameworkVersionId: 'fwv-gen-obe-v1', conceptKey: 'program_outcome', displayName: 'Program Learning Outcome (PLO)' },
  { id: 'term-gen-2', frameworkVersionId: 'fwv-gen-obe-v1', conceptKey: 'course_learning_outcome', displayName: 'Course Learning Outcome (CLO)' },
];

export function getFrameworkById(id?: string): Framework {
  return INITIAL_FRAMEWORKS.find((f) => f.id === id) || INITIAL_FRAMEWORKS[0]; // Default: Washington Accord or first
}

export function getFrameworkOutcomes(frameworkId?: string): FrameworkOutcome[] {
  const fw = getFrameworkById(frameworkId);
  const version = INITIAL_FRAMEWORK_VERSIONS.find((v) => v.frameworkId === fw.id) || INITIAL_FRAMEWORK_VERSIONS[0];
  const outcomes = INITIAL_FRAMEWORK_OUTCOMES.filter((o) => o.frameworkVersionId === version.id);
  if (outcomes.length > 0) {
    return outcomes;
  }
  // Fallback to general outcomes
  return INITIAL_FRAMEWORK_OUTCOMES.filter((o) => o.frameworkVersionId === 'fwv-gen-obe-v1');
}

export function getOutcomeTerminology(
  frameworkId?: string,
  conceptKey: 'program_outcome' | 'student_outcome' | 'graduate_attribute' | 'course_learning_outcome' | 'learning_goal' | 'competency_standard' = 'program_outcome'
): string {
  const fw = getFrameworkById(frameworkId);
  const version = INITIAL_FRAMEWORK_VERSIONS.find((v) => v.frameworkId === fw.id);
  if (version) {
    const term = INITIAL_FRAMEWORK_TERMINOLOGIES.find(
      (t) => t.frameworkVersionId === version.id && t.conceptKey === (conceptKey as any)
    );
    if (term) return term.displayName;
  }
  return conceptKey === 'program_outcome' ? 'Program Outcome' : 'Course Learning Outcome';
}
