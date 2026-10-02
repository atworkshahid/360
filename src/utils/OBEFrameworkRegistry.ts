import { jsPDF } from 'jspdf';
import {
  generateFrameworkGuidebookBlob,
  downloadFrameworkGuidebookPDF,
  GuidebookPdfOptions,
} from './frameworkGuidebookPdf';
import { getFrameworkGuideline } from '../data/frameworkGuidelines';

export type FrameworkCategory = 'international' | 'accreditation' | 'national' | 'institutional';

export type FrameworkValidationStatus = 'valid' | 'missing_docs' | 'deprecated' | 'unrecognized';

export interface FrameworkValidationResult {
  isValid: boolean;
  status: FrameworkValidationStatus;
  frameworkId?: string;
  canonicalFrameworkId: string;
  frameworkCode: string;
  frameworkName: string;
  hasDocumentation: boolean;
  pdfPath?: string;
  isDeprecated: boolean;
  deprecationReason?: string;
  supersededBy?: string;
  message: string;
  guidebook: OBEFrameworkDefinition;
}

export const DEPRECATED_FRAMEWORKS: Record<
  string,
  {
    code: string;
    name: string;
    supersededBy: string;
    reason: string;
    deprecationYear: string;
  }
> = {
  'fw-abet-ec2000': {
    code: 'ABET-EC2000',
    name: 'ABET EC2000 Legacy Engineering Standard',
    supersededBy: 'fw-abet-eac',
    reason: 'ABET EC2000 criteria (a-k) have been superseded by modern Criterion 3 Student Outcomes (1-7).',
    deprecationYear: '2019',
  },
  'fw-nba-tier2': {
    code: 'NBA-T2',
    name: 'NBA India Tier-II (Non-Autonomous Legacy SAR)',
    supersededBy: 'fw-nba-tier1',
    reason: 'NBA Tier-II SAR manual is superseded by Washington Accord recognized Tier-I SAR standards.',
    deprecationYear: '2023',
  },
  'fw-hec-2015': {
    code: 'HEC-2015',
    name: 'HEC Pakistan 2015 OBE Guidelines',
    supersededBy: 'fw-hec-pakistan',
    reason: 'HEC 2015 guidelines are superseded by the National OBE Policy Manual (NCEAC/PEC GAPC).',
    deprecationYear: '2022',
  },
  'fw-legacy-spady': {
    code: 'LEGACY-OBE',
    name: 'Legacy Unstructured OBE',
    supersededBy: 'fw-general-obe',
    reason: 'Legacy unstructured outcome model replaced by standard Spady Constructive Alignment.',
    deprecationYear: '2024',
  },
};

export interface FrameworkKeyOutcome {
  code: string;
  title: string;
  description: string;
  bloomsLevel?: string;
}

export interface FrameworkGuidebookChapter {
  number: string;
  title: string;
  stageKey?: string;
  stageLabel?: string;
  summary: string;
  requirements?: string[];
  alignmentRules?: string[];
}

/**
 * Structural definition for an OBE framework within the registry,
 * including accreditation metadata and associated PDF documentation paths.
 */
export interface OBEFrameworkDefinition {
  id: string;
  code: string;
  name: string;
  title: string;
  governingBody: string;
  jurisdiction: string;
  category: FrameworkCategory;
  categoryLabel: string;
  standardEdition: string;
  documentRef: string;
  publishedYear: string;
  estimatedPages: number;

  /**
   * Associated documentation PDF file path (e.g. static asset or virtual path)
   */
  pdfPath: string;

  /**
   * Clean downloadable filename for the PDF document
   */
  pdfFileName: string;

  /**
   * External reference or official documentation URL
   */
  officialUrl?: string;

  description: string;
  accreditationScope: string;
  outcomeModel: string;
  totalOutcomes: number;
  corePrinciples: string[];
  keyOutcomes: FrameworkKeyOutcome[];
  chapters: FrameworkGuidebookChapter[];

  /**
   * Generates a live in-browser Blob and object URL for PDF viewing
   */
  generatePdfBlob: (options?: GuidebookPdfOptions) => {
    doc: jsPDF;
    blob: Blob;
    blobUrl: string;
    fileName: string;
  };

  /**
   * Triggers direct browser download of the complete PDF Guidebook
   */
  downloadPdf: (options?: GuidebookPdfOptions) => void;
}

/**
 * Course metadata representation containing the framework selection
 */
export interface CourseMetadataInput {
  frameworkId?: string;
  frameworkVersionId?: string;
  accreditationFramework?: string;
  title?: string;
  code?: string;
  institutionName?: string;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Framework Registry Definitions with Documentation PDF Paths
// ---------------------------------------------------------------------------

const FRAMEWORK_REGISTRY_CATALOG: Record<
  string,
  Omit<OBEFrameworkDefinition, 'generatePdfBlob' | 'downloadPdf'>
> = {
  'fw-abet-eac': {
    id: 'fw-abet-eac',
    code: 'ABET-EAC',
    name: 'ABET EAC (Engineering Accreditation Commission)',
    title: 'ABET EAC Criteria for Accrediting Engineering Programs Guidebook',
    governingBody: 'Accreditation Board for Engineering and Technology (ABET)',
    jurisdiction: 'United States & 35+ Partner Nations Globally',
    category: 'accreditation',
    categoryLabel: 'Accreditation Commission Standard',
    standardEdition: '2024-2026 Criteria Cycle',
    documentRef: 'ABET-CRIT-3-4-EAC-2024',
    publishedYear: '2024',
    estimatedPages: 22,
    pdfPath: '/docs/frameworks/abet-eac-accreditation-guidebook.pdf',
    pdfFileName: 'ABET_EAC_Accreditation_OBE_Guidebook.pdf',
    officialUrl: 'https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-programs/',
    description:
      'The premier international standard for engineering degrees. Centered on Criterion 3 (Student Outcomes 1-7) and Criterion 4 (Continuous Improvement), mandating direct student work evidence and complex engineering problem solving.',
    accreditationScope: 'Baccalaureate Engineering Degree Programs',
    outcomeModel: 'Student Outcomes (SO 1 to 7)',
    totalOutcomes: 7,
    corePrinciples: [
      'Direct assessment using student work artifacts instead of aggregate course grades',
      'Complex Engineering Problem (CEP) solving required in Outcome 1 and Outcome 2',
      'Explicit ethical, professional, and societal impact considerations (Outcome 4)',
      'Documented Continuous Improvement loop with measurable CQI actions (Criterion 4)',
    ],
    keyOutcomes: [
      { code: 'SO 1', title: 'Complex Problem Solving', description: 'Identify, formulate, and solve complex engineering problems applying math and science.', bloomsLevel: 'C4-C5 Analyzing & Evaluating' },
      { code: 'SO 2', title: 'Engineering Design', description: 'Apply engineering design to produce solutions meeting specified needs with realistic constraints.', bloomsLevel: 'C6 Creating' },
      { code: 'SO 3', title: 'Communication', description: 'Communicate effectively with a range of technical and non-technical audiences.', bloomsLevel: 'A3-A4 Valuing' },
      { code: 'SO 4', title: 'Ethical & Professional Responsibility', description: 'Recognize ethical and professional responsibilities in engineering situations.', bloomsLevel: 'A3-A5 Internalizing' },
      { code: 'SO 5', title: 'Teamwork & Collaborative Leadership', description: 'Function effectively on a team whose members establish goals and create inclusive environments.', bloomsLevel: 'A4 Organizing' },
      { code: 'SO 6', title: 'Experimentation & Data Analysis', description: 'Develop and conduct appropriate experimentation, analyze and interpret data, and draw conclusions.', bloomsLevel: 'C5 Evaluating' },
      { code: 'SO 7', title: 'Independent Learning', description: 'Acquire and apply new knowledge as needed, using appropriate learning strategies.', bloomsLevel: 'C4 Analyzing' },
    ],
    chapters: [
      { number: '1', title: 'Criterion 3 Philosophy & Student Outcomes Overview', stageKey: 'step_framework', summary: 'Core ABET EAC accreditation philosophy and Criterion 3 definitions.' },
      { number: '2', title: 'Formulating Actionable CLOs with Technical Conditions', stageKey: 'step_clos', summary: 'Writing measurable outcomes with Bloom taxonomy verbs matching ABET expectations.' },
      { number: '3', title: 'Student Outcome Correlation Matrix & Intensity Weighting', stageKey: 'step_plo_mapping', summary: 'Constructing 3-tier mapping matrices with direct evidence justifications.' },
      { number: '4', title: 'Direct Assessment Artifacts & Criterion 4 CQI Protocol', stageKey: 'step_assessments', summary: 'Designing rubric-graded assessments and closing the quality loop.' },
    ],
  },

  'fw-washington-accord': {
    id: 'fw-washington-accord',
    code: 'WA-ENG',
    name: 'Washington Accord-aligned Engineering OBE',
    title: 'Washington Accord Graduate Attributes & Professional Competencies Guidebook',
    governingBody: 'International Engineering Alliance (IEA)',
    jurisdiction: '24 Signatory Nations (US, UK, Canada, Australia, Japan, Pakistan, etc.)',
    category: 'international',
    categoryLabel: 'International Recognition Accord',
    standardEdition: 'IEA GAPC Standard v4',
    documentRef: 'IEA-GAPC-WA-2021/2026',
    publishedYear: '2021',
    estimatedPages: 20,
    pdfPath: '/docs/frameworks/washington-accord-gapc-guidebook.pdf',
    pdfFileName: 'Washington_Accord_OBE_Guidebook.pdf',
    officialUrl: 'https://www.ieagreements.org/accords/washington/',
    description:
      'The multi-lateral international treaty establishing substantial equivalence of professional engineering qualifications worldwide. Governed by 12 Graduate Attributes (WA1-WA12), Complex Engineering Problems (CEP) criteria (WP1-WP7), and Knowledge Profiles (WK1-WK8).',
    accreditationScope: '4-Year Professional Engineering (B.Eng / B.Sc / B.Tech) Degrees',
    outcomeModel: 'Graduate Attributes (WA1 to WA12)',
    totalOutcomes: 12,
    corePrinciples: [
      'Substantial equivalence of engineering graduates across international borders',
      'Complex Engineering Problem (CEP) must be verified through at least 2 distinct CEP attributes',
      'Knowledge profile (WK1-WK8) must support deep mathematical and engineering science reasoning',
      'Demonstrated sustainability, United Nations SDGs, and life-cycle environmental impact consideration',
    ],
    keyOutcomes: [
      { code: 'WA1', title: 'Engineering Knowledge', description: 'Apply mathematics, natural science, and engineering fundamentals (WK1-WK4).', bloomsLevel: 'C3-C4 Applying & Analyzing' },
      { code: 'WA2', title: 'Problem Analysis', description: 'Formulate and analyze complex engineering problems reaching substantiated conclusions.', bloomsLevel: 'C4-C5 Analyzing & Evaluating' },
      { code: 'WA3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems with public health and safety considerations.', bloomsLevel: 'C6 Creating' },
      { code: 'WA4', title: 'Investigation', description: 'Conduct investigations of complex problems using research methods and data interpretation.', bloomsLevel: 'C5-C6 Evaluating' },
      { code: 'WA5', title: 'Modern Tool Usage', description: 'Select and apply appropriate techniques, resources, and modern engineering tools (WK6).', bloomsLevel: 'C3-C4 Applying' },
      { code: 'WA6', title: 'The Engineer and the World', description: 'Evaluate sustainability impacts: societal, economic, health, legal, and environmental.', bloomsLevel: 'C5 Evaluating' },
      { code: 'WA7', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics and norms of practice.', bloomsLevel: 'A3-A5 Internalizing' },
      { code: 'WA8', title: 'Individual and Collaborative Teamwork', description: 'Function effectively as an individual and leader in diverse teams.', bloomsLevel: 'A4 Organizing' },
      { code: 'WA9', title: 'Communication', description: 'Communicate effectively and inclusively on complex engineering activities.', bloomsLevel: 'A3 Valuing' },
      { code: 'WA10', title: 'Project Management and Finance', description: 'Apply engineering management and economic decision-making principles.', bloomsLevel: 'C3 Applying' },
      { code: 'WA11', title: 'Life-Long Learning', description: 'Recognize the need for independent and life-long learning in technological change.', bloomsLevel: 'A5 Characterizing' },
      { code: 'WA12', title: 'Engineering Specialization', description: 'Synthesize knowledge and apply advanced disciplinary principles.', bloomsLevel: 'C6 Creating' },
    ],
    chapters: [
      { number: '1', title: 'Washington Accord Philosophy & CEP Problem Profiles', stageKey: 'step_framework', summary: 'Understanding Graduate Attributes, Knowledge Profiles (WK), and CEP criteria.' },
      { number: '2', title: 'Constructive Alignment: Binding CLOs to Knowledge Profiles', stageKey: 'step_clos', summary: 'Formulating CLOs with verified high cognitive levels (C4-C6).' },
      { number: '3', title: 'Program Learning Outcome (PLO) Mapping Matrix', stageKey: 'step_plo_mapping', summary: 'Mapping CLOs to WA1-WA12 with Bloom taxonomy domain verification.' },
      { number: '4', title: 'Authentic Assessment Design & Rubric Rubrics', stageKey: 'step_assessments', summary: 'Designing direct evidence collection for complex problem solving.' },
    ],
  },

  'fw-abet-cac': {
    id: 'fw-abet-cac',
    code: 'ABET-CAC',
    name: 'ABET CAC (Computing Accreditation Commission)',
    title: 'ABET CAC Criteria for Accrediting Computing Programs Guidebook',
    governingBody: 'ABET Computing Accreditation Commission',
    jurisdiction: 'United States & Worldwide Computing Programs',
    category: 'accreditation',
    categoryLabel: 'Accreditation Commission Standard',
    standardEdition: '2024-2026 Criteria Cycle',
    documentRef: 'ABET-CRIT-3-CAC-2024',
    publishedYear: '2024',
    estimatedPages: 18,
    pdfPath: '/docs/frameworks/abet-cac-computing-guidebook.pdf',
    pdfFileName: 'ABET_CAC_Computing_Guidebook.pdf',
    officialUrl: 'https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-computing-programs/',
    description:
      'Rigorous accreditation standard for Computer Science, Cybersecurity, Information Systems, and Software Engineering programs. Emphasizes algorithmic complexity, systems architecture, security ethics, and teamwork.',
    accreditationScope: 'Computer Science, Software Engineering, IT & Cybersecurity Degrees',
    outcomeModel: 'Student Outcomes (SO 1 to 6)',
    totalOutcomes: 6,
    corePrinciples: [
      'Algorithmic complexity analysis and computational theory (SO 1)',
      'Full lifecycle computing systems design and implementation (SO 2)',
      'Security-first mindset and data stewardship (SO 4)',
      'Automated unit testing and code review rubrics as direct evidence',
    ],
    keyOutcomes: [
      { code: 'SO 1', title: 'Complex Computing Problems', description: 'Analyze complex computing problems applying principles of computing disciplines.', bloomsLevel: 'C4 Analyzing' },
      { code: 'SO 2', title: 'Design & Implementation', description: 'Design, implement, and evaluate computing solutions meeting given requirements.', bloomsLevel: 'C6 Creating' },
      { code: 'SO 3', title: 'Communication', description: 'Communicate effectively in a variety of professional contexts.', bloomsLevel: 'A3 Valuing' },
      { code: 'SO 4', title: 'Professional & Legal Responsibilities', description: 'Make informed judgments based on legal and ethical principles in computing.', bloomsLevel: 'A4 Organizing' },
      { code: 'SO 5', title: 'Teamwork', description: 'Function effectively as a member or leader of a computing development team.', bloomsLevel: 'A4 Organizing' },
      { code: 'SO 6', title: 'Computer Science Theory', description: 'Apply CS theory and software development fundamentals to produce computing solutions.', bloomsLevel: 'C4-C5 Evaluating' },
    ],
    chapters: [
      { number: '1', title: 'Computing Outcomes & Algorithmic Rigor', stageKey: 'step_clos', summary: 'Formulating computing CLOs with concrete software architecture deliverables.' },
      { number: '2', title: 'Outcome Correlation & Evidence Portfolios', stageKey: 'step_plo_mapping', summary: 'Direct mapping to Computing Student Outcomes 1 through 6.' },
    ],
  },

  'fw-abet-etac': {
    id: 'fw-abet-etac',
    code: 'ABET-ETAC',
    name: 'ABET ETAC (Engineering Technology Accreditation Commission)',
    title: 'ABET ETAC Criteria for Accrediting Engineering Technology Programs Guidebook',
    governingBody: 'ABET Engineering Technology Accreditation Commission',
    jurisdiction: 'United States & International Technology Programs',
    category: 'accreditation',
    categoryLabel: 'Accreditation Commission Standard',
    standardEdition: '2024-2026 Criteria Cycle',
    documentRef: 'ABET-CRIT-3-ETAC-2024',
    publishedYear: '2024',
    estimatedPages: 18,
    pdfPath: '/docs/frameworks/abet-etac-technology-guidebook.pdf',
    pdfFileName: 'ABET_ETAC_Technology_Guidebook.pdf',
    officialUrl: 'https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-technology-programs/',
    description:
      'Accreditation criteria designed specifically for Bachelor and Associate degrees in Engineering Technology, emphasizing applied technical design, hands-on experimentation, and modern equipment deployment.',
    accreditationScope: 'Engineering Technology (B.E.T. / B.Tech / A.A.S.) Programs',
    outcomeModel: 'Student Outcomes (SO 1 to 5)',
    totalOutcomes: 5,
    corePrinciples: [
      'Application of established engineering principles and modern technology tools',
      'Emphasis on laboratory measurement, diagnostic testing, and system integration',
      'Direct fabrication, commissioning, and operational safety compliance',
    ],
    keyOutcomes: [
      { code: 'SO 1', title: 'Applied Knowledge', description: 'Apply principles of math, science, and engineering technology to solve broadly-defined problems.', bloomsLevel: 'C3-C4' },
      { code: 'SO 2', title: 'System Design', description: 'Design systems, components, or processes for broadly-defined engineering technology problems.', bloomsLevel: 'C5-C6' },
      { code: 'SO 3', title: 'Technical Communication', description: 'Apply written, oral, and graphical communication in technical environments.', bloomsLevel: 'A3' },
      { code: 'SO 4', title: 'Laboratory Testing', description: 'Conduct standard tests and measurements; conduct, analyze, and interpret experiments.', bloomsLevel: 'C4-C5' },
      { code: 'SO 5', title: 'Team Participation', description: 'Function effectively as a member or leader on a technical team.', bloomsLevel: 'A4' },
    ],
    chapters: [
      { number: '1', title: 'Engineering Technology Competencies & Lab Practice', stageKey: 'step_clos', summary: 'Designing hands-on measurable outcomes for applied engineering technology.' },
    ],
  },

  'fw-seoul-accord': {
    id: 'fw-seoul-accord',
    code: 'SA-COMP',
    name: 'Seoul Accord-aligned Computing OBE',
    title: 'Seoul Accord Graduate Attributes & Computing Competencies Guidebook',
    governingBody: 'Seoul Accord Signatories',
    jurisdiction: 'International (Computing Accords across 9+ Signatories)',
    category: 'international',
    categoryLabel: 'International Recognition Accord',
    standardEdition: 'Seoul Accord Specification Rev 4.1',
    documentRef: 'SA-COMP-GAPC-2021',
    publishedYear: '2021',
    estimatedPages: 17,
    pdfPath: '/docs/frameworks/seoul-accord-computing-guidebook.pdf',
    pdfFileName: 'Seoul_Accord_Computing_Guidebook.pdf',
    officialUrl: 'https://www.seoulaccord.org/',
    description:
      'Multilateral international agreement establishing substantial equivalence of computing degree programs. Covers 10 Computing Graduate Attributes including complex computing activities, software architecture, algorithm design, and cybersecurity ethics.',
    accreditationScope: 'Computer Science, Software Engineering & IT Programs',
    outcomeModel: 'Computing Graduate Attributes (CGA 1 to 10)',
    totalOutcomes: 10,
    corePrinciples: [
      'Substantial equivalence of computing and IT degrees internationally',
      'Focus on algorithmic efficiency, complexity bounds, and verified software quality',
      'Inclusion of data privacy, cyber-ethics, and international computing standards',
    ],
    keyOutcomes: [
      { code: 'CGA 1', title: 'Academic Education', description: 'Apply knowledge of computing fundamentals to complex computing problems.', bloomsLevel: 'C4' },
      { code: 'CGA 2', title: 'Problem Analysis', description: 'Identify and analyze complex computing problems reaching substantiated conclusions.', bloomsLevel: 'C4' },
      { code: 'CGA 3', title: 'Design/Development of Solutions', description: 'Design solutions for complex computing problems meeting user requirements.', bloomsLevel: 'C6' },
      { code: 'CGA 4', title: 'Modern Tool Usage', description: 'Select and apply appropriate techniques and modern computing tools.', bloomsLevel: 'C3' },
      { code: 'CGA 5', title: 'Teamwork', description: 'Collaborate effectively in diverse software engineering teams.', bloomsLevel: 'A4' },
      { code: 'CGA 6', title: 'Communication', description: 'Communicate complex technical concepts to diverse stakeholders.', bloomsLevel: 'A3' },
      { code: 'CGA 7', title: 'Ethics', description: 'Adhere to ACM/IEEE codes of ethical conduct in software development.', bloomsLevel: 'A3' },
      { code: 'CGA 8', title: 'Life-Long Learning', description: 'Engage in continuous adaptation to rapidly evolving computing technologies.', bloomsLevel: 'A5' },
    ],
    chapters: [],
  },

  'fw-sydney-accord': {
    id: 'fw-sydney-accord',
    code: 'SA-ET',
    name: 'Sydney Accord-aligned Engineering Technology OBE',
    title: 'Sydney Accord Engineering Technologist Competency Guidebook',
    governingBody: 'International Engineering Alliance (IEA)',
    jurisdiction: 'International (11 Signatory Nations)',
    category: 'international',
    categoryLabel: 'International Recognition Accord',
    standardEdition: 'IEA Sydney Accord Edition',
    documentRef: 'IEA-GAPC-SA-2021',
    publishedYear: '2021',
    estimatedPages: 16,
    pdfPath: '/docs/frameworks/sydney-accord-technology-guidebook.pdf',
    pdfFileName: 'Sydney_Accord_Technology_Guidebook.pdf',
    officialUrl: 'https://www.ieagreements.org/accords/sydney/',
    description:
      'International benchmark for 3 to 4 year engineering technology programs. Focuses on Broadly-Defined Engineering Problems (BDP), application of established techniques, and technology profile competencies (SA1 to SA12).',
    accreditationScope: 'Bachelor of Engineering Technology Programs',
    outcomeModel: 'Graduate Attributes (SA1 to SA12)',
    totalOutcomes: 12,
    corePrinciples: [
      'Focus on broadly-defined engineering technology problems',
      'Emphasis on practical implementation, field testing, and maintenance protocols',
      'Direct hands-on laboratory and fabrication competencies',
    ],
    keyOutcomes: [
      { code: 'SA 1', title: 'Engineering Technology Knowledge', description: 'Apply technology fundamentals to solve broadly-defined engineering problems.', bloomsLevel: 'C3' },
      { code: 'SA 2', title: 'Problem Analysis', description: 'Analyze broadly-defined problems using established diagnostic techniques.', bloomsLevel: 'C4' },
      { code: 'SA 3', title: 'Design/Development of Solutions', description: 'Design components and systems for broadly-defined problems.', bloomsLevel: 'C5' },
    ],
    chapters: [],
  },

  'fw-nba-tier1': {
    id: 'fw-nba-tier1',
    code: 'NBA-T1',
    name: 'NBA India Tier-I (Washington Accord Recognized)',
    title: 'NBA India Outcome Based Accreditation Manual (Tier-I SAR)',
    governingBody: 'National Board of Accreditation (NBA India)',
    jurisdiction: 'India (AICTE Recognized Autonomous / Tier-I Engineering Institutions)',
    category: 'national',
    categoryLabel: 'National Statutory Accreditation Standard',
    standardEdition: 'Tier-I Self Assessment Report (SAR) Manual',
    documentRef: 'NBA-SAR-TIER1-2023/2026',
    publishedYear: '2023',
    estimatedPages: 24,
    pdfPath: '/docs/frameworks/nba-india-tier1-guidebook.pdf',
    pdfFileName: 'NBA_India_Tier1_SAR_Guidebook.pdf',
    officialUrl: 'https://www.nbaind.org/',
    description:
      'Statutory accreditation manual recognized under the Washington Accord. Specifies 12 Program Outcomes (PO1-PO12), Program Specific Outcomes (PSOs), Course Articulation Matrices (CAM), and direct attainment calculations.',
    accreditationScope: 'Undergraduate Autonomous Engineering Institutions in India',
    outcomeModel: 'Program Outcomes (PO 1 to 12) + PSOs',
    totalOutcomes: 14,
    corePrinciples: [
      'Mandatory Course Articulation Matrix (CAM) linking each CLO to PO1-PO12 and PSOs',
      'Correlation level scoring strictly defined: 1 (Slight), 2 (Moderate), 3 (Substantial)',
      'Attainment calculation formula incorporating both Internal Assessments (CIE) and Semester End Exams (SEE)',
      'Closing the loop through Departmental Advisory Board (DAB) and Program Assessment Committee (PAC) reviews',
    ],
    keyOutcomes: [
      { code: 'PO 1', title: 'Engineering Knowledge', description: 'Apply mathematics, science, engineering fundamentals to solve engineering problems.', bloomsLevel: 'C3' },
      { code: 'PO 2', title: 'Problem Analysis', description: 'Identify, formulate, review literature and analyze complex engineering problems.', bloomsLevel: 'C4' },
      { code: 'PO 3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems with public health and safety considerations.', bloomsLevel: 'C6' },
      { code: 'PO 4', title: 'Conduct Investigations', description: 'Use research-based knowledge and research methods to provide valid conclusions.', bloomsLevel: 'C5' },
      { code: 'PO 5', title: 'Modern Tool Usage', description: 'Select and apply appropriate IT and engineering tools with understanding of limitations.', bloomsLevel: 'C3' },
      { code: 'PO 6', title: 'The Engineer and Society', description: 'Apply contextual knowledge to assess societal, health, legal and cultural issues.', bloomsLevel: 'C4' },
      { code: 'PO 7', title: 'Environment and Sustainability', description: 'Understand the impact of engineering solutions in societal and environmental contexts.', bloomsLevel: 'C4' },
      { code: 'PO 8', title: 'Ethics', description: 'Commit to professional ethics, responsibilities and norms of engineering practice.', bloomsLevel: 'A3' },
      { code: 'PO 9', title: 'Individual and Team Work', description: 'Function effectively as an individual and member or leader in diverse teams.', bloomsLevel: 'A4' },
      { code: 'PO 10', title: 'Communication', description: 'Communicate effectively with engineering community and society at large.', bloomsLevel: 'A3' },
      { code: 'PO 11', title: 'Project Management & Finance', description: 'Demonstrate knowledge and apply engineering management principles to projects.', bloomsLevel: 'C3' },
      { code: 'PO 12', title: 'Life-Long Learning', description: 'Recognize need for independent and life-long learning in technological change.', bloomsLevel: 'A5' },
    ],
    chapters: [
      { number: '1', title: 'Course Articulation Matrix (CAM) & NBA Tier-I Attainment Model', stageKey: 'step_plo_mapping', summary: 'Constructing CAM matrices with PO1-PO12 and CIE/SEE attainment formulas.' },
    ],
  },

  'fw-hec-pakistan': {
    id: 'fw-hec-pakistan',
    code: 'HEC-OBE',
    name: 'HEC Pakistan / NCEAC & PEC National OBE Framework',
    title: 'HEC Pakistan National Outcome-Based Education (OBE) Policy Manual',
    governingBody: 'Higher Education Commission Pakistan (HEC) / PEC & NCEAC',
    jurisdiction: 'Pakistan (National Universities & Degree Awarding Institutes)',
    category: 'national',
    categoryLabel: 'National Statutory Higher Education Standard',
    standardEdition: 'National OBE Policy Framework Cycle',
    documentRef: 'HEC-OBE-Guideline-Manual-2022/2026',
    publishedYear: '2022',
    estimatedPages: 20,
    pdfPath: '/docs/frameworks/hec-pakistan-obe-policy-guidebook.pdf',
    pdfFileName: 'HEC_Pakistan_OBE_Policy_Guidebook.pdf',
    officialUrl: 'https://www.hec.gov.pk/',
    description:
      'National Higher Education policy mandating Outcome-Based Education across all undergraduate engineering, computing, and professional programs in Pakistan. Fully aligned with Washington Accord (PEC) and Seoul Accord (NCEAC) graduate competencies.',
    accreditationScope: 'HEC Recognized Universities across Pakistan',
    outcomeModel: 'Program Learning Outcomes (PLO 1 to 12)',
    totalOutcomes: 12,
    corePrinciples: [
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
      { number: '1', title: 'HEC OBE Course Dossier Requirements & CQI Documentation', stageKey: 'step_cqi', summary: 'Compiling the official Course Dossier and CQI corrective action records.' },
    ],
  },

  'fw-custom-institutional': {
    id: 'fw-custom-institutional',
    code: 'INST-LOCAL',
    name: 'Custom Institutional OBE Blueprint & Local Standards',
    title: 'Custom Institutional Quality Assurance & OBE Framework Guidebook',
    governingBody: 'Institutional Academic Quality Committee / University Senate',
    jurisdiction: 'Local Autonomous University / College / Ministry Guidelines',
    category: 'institutional',
    categoryLabel: 'Institutional & Local Statutory Blueprint',
    standardEdition: 'Local University Quality Blueprint 2026',
    documentRef: 'INST-OBE-QA-2026',
    publishedYear: '2026',
    estimatedPages: 15,
    pdfPath: '/docs/frameworks/custom-institutional-obe-blueprint.pdf',
    pdfFileName: 'Custom_Institutional_OBE_Blueprint.pdf',
    description:
      'Adaptable local framework designed for universities, polytechnics, and specialized colleges to define their own mission-aligned Graduate Attributes, local statutory compliance checklists, and multidisciplinary course learning outcomes.',
    accreditationScope: 'Institution-Wide Autonomous Degree & Diploma Programs',
    outcomeModel: 'Institutional Graduate Competencies',
    totalOutcomes: 6,
    corePrinciples: [
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
      { code: 'INST-6', title: 'Collaborative Leadership & Communication', description: 'Lead diverse teams and articulate complex ideas effectively.', bloomsLevel: 'A4' },
    ],
    chapters: [],
  },

  'fw-general-obe': {
    id: 'fw-general-obe',
    code: 'GEN-OBE',
    name: 'Spady Outcome-Based Education (OBE) Master Guidebook',
    title: 'Foundational Outcome-Based Education (OBE) Principles & Guidelines',
    governingBody: 'General OBE Academic Consortium',
    jurisdiction: 'Global Higher Education & Vocational Training',
    category: 'institutional',
    categoryLabel: 'Foundational Educational Framework',
    standardEdition: 'Spady Model Classical Edition',
    documentRef: 'GEN-OBE-SPADY-FOUNDATION',
    publishedYear: '2024',
    estimatedPages: 14,
    pdfPath: '/docs/frameworks/general-spady-obe-guidebook.pdf',
    pdfFileName: 'General_Spady_OBE_Guidebook.pdf',
    description:
      'The classic William Spady educational paradigm resting on four cardinal tenets: Clarity of Focus, High Expectations, Expanded Opportunities, and Designing Down from Exit Outcomes.',
    accreditationScope: 'All Higher Education Disciplines & Interdisciplinary Courses',
    outcomeModel: 'Course Learning Outcomes (CLOs) to PEOs',
    totalOutcomes: 4,
    corePrinciples: [
      'Clarity of Focus: Students know upfront exactly what they will be able to demonstrate',
      'Design Down: Begin curriculum planning with exit outcomes and reverse-engineer learning units',
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
};

// ---------------------------------------------------------------------------
// OBEFrameworkRegistry Implementation
// ---------------------------------------------------------------------------

/**
 * Builds a complete OBEFrameworkDefinition by pairing catalog metadata
 * with dynamic PDF generation routines.
 */
function createFullDefinition(
  raw: Omit<OBEFrameworkDefinition, 'generatePdfBlob' | 'downloadPdf'>
): OBEFrameworkDefinition {
  return {
    ...raw,
    generatePdfBlob: (options?: GuidebookPdfOptions) => {
      return generateFrameworkGuidebookBlob({
        frameworkId: raw.id,
        frameworkName: raw.name,
        ...options,
      });
    },
    downloadPdf: (options?: GuidebookPdfOptions) => {
      downloadFrameworkGuidebookPDF({
        frameworkId: raw.id,
        frameworkName: raw.name,
        ...options,
      });
    },
  };
}

/**
 * Central registry holding OBE framework definitions and PDF documentation routes.
 */
export class OBEFrameworkRegistry {
  private static registryMap: Map<string, OBEFrameworkDefinition> = new Map();

  static {
    // Populate default registry
    Object.values(FRAMEWORK_REGISTRY_CATALOG).forEach((catalogEntry) => {
      OBEFrameworkRegistry.registryMap.set(
        catalogEntry.id,
        createFullDefinition(catalogEntry)
      );
    });
  }

  /**
   * Returns all registered framework guidebooks.
   */
  public static getAll(): OBEFrameworkDefinition[] {
    return Array.from(OBEFrameworkRegistry.registryMap.values());
  }

  /**
   * Retrieves the correct framework guidebook based on the framework ID
   * or a course metadata object.
   *
   * @param input Framework ID string (e.g. 'fw-abet-eac', 'fw-washington-accord')
   *              OR course metadata object containing `frameworkId`.
   * @returns The resolved OBEFrameworkDefinition.
   */
  public static getGuidebook(
    input?: string | CourseMetadataInput | null
  ): OBEFrameworkDefinition {
    // 1. Handle course metadata object input
    let frameworkId: string | undefined;

    if (input && typeof input === 'object') {
      frameworkId =
        input.frameworkId ||
        input.frameworkVersionId ||
        input.accreditationFramework;
    } else if (typeof input === 'string') {
      frameworkId = input;
    }

    // Default fallback if unspecified
    if (!frameworkId || typeof frameworkId !== 'string' || !frameworkId.trim()) {
      return (
        OBEFrameworkRegistry.registryMap.get('fw-washington-accord') ||
        Array.from(OBEFrameworkRegistry.registryMap.values())[0]
      );
    }

    const norm = frameworkId.trim().toLowerCase();

    // 2. Direct ID match
    const direct = OBEFrameworkRegistry.registryMap.get(norm);
    if (direct) return direct;

    // 3. Match by code or aliases
    for (const entry of OBEFrameworkRegistry.registryMap.values()) {
      if (
        entry.id.toLowerCase() === norm ||
        entry.code.toLowerCase() === norm
      ) {
        return entry;
      }
    }

    // 4. Fuzzy / keyword match for course metadata inputs
    if (norm.includes('eac') || norm.includes('abet-eac')) {
      return OBEFrameworkRegistry.registryMap.get('fw-abet-eac')!;
    }
    if (norm.includes('cac') || norm.includes('computing')) {
      return OBEFrameworkRegistry.registryMap.get('fw-abet-cac')!;
    }
    if (norm.includes('etac')) {
      return OBEFrameworkRegistry.registryMap.get('fw-abet-etac')!;
    }
    if (norm.includes('abet')) {
      return OBEFrameworkRegistry.registryMap.get('fw-abet-eac')!;
    }
    if (norm.includes('seoul') || norm.includes('sa-comp')) {
      return OBEFrameworkRegistry.registryMap.get('fw-seoul-accord')!;
    }
    if (norm.includes('sydney') || norm.includes('sa-et') || norm.includes('technology')) {
      return OBEFrameworkRegistry.registryMap.get('fw-sydney-accord')!;
    }
    if (norm.includes('washington') || norm.includes('accord') || norm.includes('wa-eng')) {
      return OBEFrameworkRegistry.registryMap.get('fw-washington-accord')!;
    }
    if (norm.includes('nba') || norm.includes('india') || norm.includes('tier1') || norm.includes('tier-1')) {
      return OBEFrameworkRegistry.registryMap.get('fw-nba-tier1')!;
    }
    if (norm.includes('hec') || norm.includes('pakistan') || norm.includes('pec') || norm.includes('nceac')) {
      return OBEFrameworkRegistry.registryMap.get('fw-hec-pakistan')!;
    }
    if (norm.includes('custom') || norm.includes('institutional') || norm.includes('local')) {
      return OBEFrameworkRegistry.registryMap.get('fw-custom-institutional')!;
    }
    if (norm.includes('spady') || norm.includes('general')) {
      return OBEFrameworkRegistry.registryMap.get('fw-general-obe')!;
    }

    // 5. Default fallback
    return (
      OBEFrameworkRegistry.registryMap.get('fw-washington-accord') ||
      Array.from(OBEFrameworkRegistry.registryMap.values())[0]
    );
  }

  /**
   * Validates a framework ID or course metadata object against the OBE registry.
   * Identifies whether the framework documentation exists, is deprecated,
   * is missing docs, or is unrecognized.
   */
  public static validateFramework(
    input?: string | CourseMetadataInput | null
  ): FrameworkValidationResult {
    let frameworkId: string | undefined;

    if (input && typeof input === 'object') {
      frameworkId =
        input.frameworkId ||
        input.frameworkVersionId ||
        input.accreditationFramework;
    } else if (typeof input === 'string') {
      frameworkId = input;
    }

    // 1. Missing framework ID entirely
    if (!frameworkId || typeof frameworkId !== 'string' || !frameworkId.trim()) {
      const defaultGuidebook = OBEFrameworkRegistry.getGuidebook('fw-washington-accord');
      return {
        isValid: false,
        status: 'missing_docs',
        frameworkId: undefined,
        canonicalFrameworkId: defaultGuidebook.id,
        frameworkCode: defaultGuidebook.code,
        frameworkName: defaultGuidebook.name,
        hasDocumentation: false,
        isDeprecated: false,
        message: 'No accreditation framework assigned to course. Framework documentation missing.',
        guidebook: defaultGuidebook,
      };
    }

    const norm = frameworkId.trim().toLowerCase();

    // 2. Check deprecated frameworks catalog
    const deprecated = DEPRECATED_FRAMEWORKS[norm];
    if (deprecated) {
      const canonicalGuidebook = OBEFrameworkRegistry.getGuidebook(deprecated.supersededBy);
      return {
        isValid: false,
        status: 'deprecated',
        frameworkId,
        canonicalFrameworkId: canonicalGuidebook.id,
        frameworkCode: deprecated.code,
        frameworkName: deprecated.name,
        hasDocumentation: true,
        pdfPath: canonicalGuidebook.pdfPath,
        isDeprecated: true,
        deprecationReason: deprecated.reason,
        supersededBy: canonicalGuidebook.name,
        message: `Framework '${deprecated.name}' is deprecated. ${deprecated.reason}`,
        guidebook: canonicalGuidebook,
      };
    }

    // 3. Exact registered match
    const exact = OBEFrameworkRegistry.registryMap.get(norm);
    if (exact) {
      const hasDocs = Boolean(exact.pdfPath && exact.pdfPath.trim().length > 0);
      return {
        isValid: hasDocs,
        status: hasDocs ? 'valid' : 'missing_docs',
        frameworkId: exact.id,
        canonicalFrameworkId: exact.id,
        frameworkCode: exact.code,
        frameworkName: exact.name,
        hasDocumentation: hasDocs,
        pdfPath: exact.pdfPath,
        isDeprecated: false,
        message: hasDocs
          ? `Accreditation framework '${exact.code}' is validated with complete documentation.`
          : `Framework '${exact.code}' is registered, but documentation PDF path is missing.`,
        guidebook: exact,
      };
    }

    // 4. Fuzzy / alias match
    const resolvedGuidebook = OBEFrameworkRegistry.getGuidebook(norm);
    if (resolvedGuidebook) {
      const hasDocs = Boolean(resolvedGuidebook.pdfPath && resolvedGuidebook.pdfPath.trim().length > 0);
      return {
        isValid: hasDocs,
        status: hasDocs ? 'valid' : 'missing_docs',
        frameworkId,
        canonicalFrameworkId: resolvedGuidebook.id,
        frameworkCode: resolvedGuidebook.code,
        frameworkName: resolvedGuidebook.name,
        hasDocumentation: hasDocs,
        pdfPath: resolvedGuidebook.pdfPath,
        isDeprecated: false,
        message: `Recognized framework aligned with canonical standard '${resolvedGuidebook.code}'.`,
        guidebook: resolvedGuidebook,
      };
    }

    // 5. Unrecognized framework
    const fallbackGuidebook = OBEFrameworkRegistry.getGuidebook('fw-washington-accord');
    return {
      isValid: false,
      status: 'unrecognized',
      frameworkId,
      canonicalFrameworkId: fallbackGuidebook.id,
      frameworkCode: 'UNKNOWN',
      frameworkName: 'Unrecognized Framework',
      hasDocumentation: false,
      isDeprecated: false,
      message: `Framework ID '${frameworkId}' is unrecognized in the OBE Framework Registry.`,
      guidebook: fallbackGuidebook,
    };
  }

  /**
   * Retrieves the associated PDF documentation path for a given framework ID
   * or course metadata object.
   */
  public static getPdfPath(input?: string | CourseMetadataInput): string {
    const guidebook = OBEFrameworkRegistry.getGuidebook(input);
    return guidebook.pdfPath;
  }

  /**
   * Allows registering or updating an institutional/custom framework
   * definition at runtime.
   */
  public static register(
    definition: Omit<OBEFrameworkDefinition, 'generatePdfBlob' | 'downloadPdf'>
  ): OBEFrameworkDefinition {
    const full = createFullDefinition(definition);
    OBEFrameworkRegistry.registryMap.set(definition.id, full);
    return full;
  }
}

// ---------------------------------------------------------------------------
// Convenience Helper Functions
// ---------------------------------------------------------------------------

/**
 * Retrieves the correct guidebook based on the framework ID selected
 * in the course metadata.
 *
 * @param frameworkIdOrCourse Either the framework ID string or the course metadata object.
 * @returns The resolved OBEFrameworkDefinition complete with documentation paths and PDF generators.
 */
export function getGuidebookByFrameworkId(
  frameworkIdOrCourse?: string | CourseMetadataInput | null
): OBEFrameworkDefinition {
  return OBEFrameworkRegistry.getGuidebook(frameworkIdOrCourse);
}

/**
 * Alias to retrieve the guidebook for a given course metadata object.
 */
export function getGuidebookForCourse(
  course?: CourseMetadataInput | null
): OBEFrameworkDefinition {
  return OBEFrameworkRegistry.getGuidebook(course);
}

/**
 * Retrieves the associated PDF documentation path for a framework ID or course metadata.
 */
export function getFrameworkPdfPath(
  frameworkIdOrCourse?: string | CourseMetadataInput | null
): string {
  return OBEFrameworkRegistry.getPdfPath(frameworkIdOrCourse);
}

/**
 * Validates a course's framework against the OBE Framework Registry.
 */
export function validateCourseFramework(
  frameworkIdOrCourse?: string | CourseMetadataInput | null
): FrameworkValidationResult {
  return OBEFrameworkRegistry.validateFramework(frameworkIdOrCourse);
}

/**
 * Returns the list of all registered OBE framework guidebooks.
 */
export function getAllFrameworkGuidebooks(): OBEFrameworkDefinition[] {
  return OBEFrameworkRegistry.getAll();
}

export default OBEFrameworkRegistry;
