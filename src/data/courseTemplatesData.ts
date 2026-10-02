import { Course, CourseTemplate } from '../types';
import { FLAGSHIP_COURSE, CS_TEMPLATE_COURSE } from './initialCourses';

export type TemplateDiscipline = 'Technical' | 'Science' | 'Humanities' | 'Business';

export interface TemplateOutcome {
  code: string;
  statement: string;
  bloom: string;
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
  threshold: number;
  weight: number;
  assessment: string;
  competency: string;
}

export interface TemplateModuleInfo {
  number: number;
  title: string;
  weeks: string;
  description: string;
  topics: string[];
  cloCodes: string[];
}

export interface TemplateAssessmentInfo {
  name: string;
  type: string;
  weight: number;
  bloom: string;
  directOrIndirect: 'Direct' | 'Indirect';
}

export interface TemplateRubricCriterion {
  name: string;
  weight: number;
  cloCode: string;
  exemplaryDescriptor: string;
}

export interface CourseTemplateGalleryItem {
  id: string;
  title: string;
  code: string;
  discipline: TemplateDiscipline;
  disciplineLabel: string;
  programme: string;
  summary: string;
  fullDescription: string;
  durationWeeks: number;
  creditHours: number;
  level: 'Undergraduate' | 'Postgraduate';
  deliveryMode: 'Blended' | 'In-Person' | 'Online';
  accreditationBody: string;
  targetLearners: string;
  learningPromise: string;
  capstoneGoal: string;
  competencies: string[];
  skills: string[];
  bloomsDistribution: {
    level: string;
    label: string;
    percentage: number;
    color: string;
  }[];
  clos: TemplateOutcome[];
  modules: TemplateModuleInfo[];
  assessments: TemplateAssessmentInfo[];
  sampleRubric: {
    title: string;
    criteria: TemplateRubricCriterion[];
  };
  colorTheme: {
    primary: string;
    gradient: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    accentBg: string;
    iconColor: string;
    cardBorderHover: string;
  };
  tags: string[];
  buildCourse: (customTitle?: string, customCode?: string) => Course;
}

// -----------------------------------------------------------------------------------
// 1. TECHNICAL: Artificial Intelligence & Neural Systems (OBE Washington Accord / ABET)
// -----------------------------------------------------------------------------------
const TECHNICAL_AI_TEMPLATE: CourseTemplateGalleryItem = {
  id: 'template-technical-ai',
  title: 'Artificial Intelligence & Neural Systems',
  code: 'CSE-420',
  discipline: 'Technical',
  disciplineLabel: 'Computer Science & Engineering',
  programme: 'Bachelor of Science in Computer Science (B.Sc. CS)',
  summary:
    'Outcome-based engineering curriculum featuring automated PyTorch lab benchmarks, algorithmic complexity proofs, and an authentic neural network capstone.',
  fullDescription:
    'A rigorous, Washington Accord / ABET-aligned technical curriculum covering supervised learning, gradient descent mathematics, convolutional and transformer architectures, and empirical model evaluation. Designed with constructively aligned coding practicals and direct git code-review rubrics.',
  durationWeeks: 16,
  creditHours: 4,
  level: 'Undergraduate',
  deliveryMode: 'Blended',
  accreditationBody: 'ABET / Washington Accord & IEEE Curriculum Guidelines',
  targetLearners:
    'Junior and senior computer science majors, software engineers, and data science students with prerequisite foundations in linear algebra and data structures.',
  learningPromise:
    'Upon completion, learners will independently formulate, train, optimize, and benchmark deep learning architectures on real-world datasets with rigorous mathematical justification.',
  capstoneGoal:
    'Engineer and validate an end-to-end deep learning pipeline that solves an authentic computer vision or NLP classification problem under strict compute and accuracy constraints.',
  competencies: [
    'Algorithmic & Mathematical Modeling',
    'Deep Neural Network Engineering',
    'Empirical Performance Benchmarking & Error Analysis',
    'Ethical AI Deployment & Fairness Auditing',
  ],
  skills: [
    'PyTorch & Tensor Operations',
    'Backpropagation & Gradient Optimization',
    'Convolutional & Attention Architectures',
    'Unit Testing & CI/CD Model Evaluation',
  ],
  bloomsDistribution: [
    { level: 'L3', label: 'Apply', percentage: 25, color: 'bg-blue-500' },
    { level: 'L4', label: 'Analyze', percentage: 35, color: 'bg-indigo-500' },
    { level: 'L5', label: 'Evaluate', percentage: 20, color: 'bg-purple-500' },
    { level: 'L6', label: 'Create', percentage: 20, color: 'bg-emerald-500' },
  ],
  clos: [
    {
      code: 'CLO 1',
      statement:
        'Analyze mathematical foundations of convex optimization, loss functions, and backpropagation for feed-forward networks.',
      bloom: 'Analyze',
      bloomLevel: 'Analyze',
      threshold: 65,
      weight: 20,
      assessment: 'Mathematical Problem Sets & Diagnostic Quiz',
      competency: 'Mathematical Foundations',
    },
    {
      code: 'CLO 2',
      statement:
        'Implement convolutional neural networks (CNNs) and transformer self-attention blocks in PyTorch to classify multi-class image and textual corpora.',
      bloom: 'Apply',
      bloomLevel: 'Apply',
      threshold: 70,
      weight: 25,
      assessment: 'Laboratory Coding Practicals & Automated Test Suites',
      competency: 'Deep Learning Engineering',
    },
    {
      code: 'CLO 3',
      statement:
        'Evaluate regularization, learning rate scheduling, and batch normalization techniques to prevent model overfitting on sparse training data.',
      bloom: 'Evaluate',
      bloomLevel: 'Evaluate',
      threshold: 65,
      weight: 20,
      assessment: 'Ablation Study Empirical Lab Report',
      competency: 'Empirical Model Benchmarking',
    },
    {
      code: 'CLO 4',
      statement:
        'Design and deploy an end-to-end deep learning system incorporating data augmentation, inference optimization, and algorithmic bias auditing.',
      bloom: 'Create',
      bloomLevel: 'Create',
      threshold: 70,
      weight: 35,
      assessment: 'Capstone Neural System Project & Oral Code Defense',
      competency: 'Full-Stack AI Deployment',
    },
  ],
  modules: [
    {
      number: 1,
      title: 'Foundations of Machine Learning & Gradient Descent',
      weeks: 'Weeks 1–4',
      description:
        'Vectorized operations, loss surfaces, computational graphs, and manual backpropagation derivation.',
      topics: ['Linear & Logistic Regression', 'Gradient Descent Variants', 'Autograd Mechanics', 'Overfitting & L1/L2 Regularization'],
      cloCodes: ['CLO 1'],
    },
    {
      number: 2,
      title: 'Deep Feedforward & Convolutional Vision Architectures',
      weeks: 'Weeks 5–8',
      description:
        'Feature extraction layers, spatial pooling, residual connections (ResNet), and transfer learning.',
      topics: ['Receptive Fields & Stride Math', 'Modern ConvNets (ResNet, EfficientNet)', 'Transfer Learning Pipelines', 'Data Augmentation Strategies'],
      cloCodes: ['CLO 2', 'CLO 3'],
    },
    {
      number: 3,
      title: 'Sequence Modeling & Transformer Self-Attention',
      weeks: 'Weeks 9–12',
      description:
        'Recurrent networks, scaled dot-product attention, multi-head attention blocks, and BERT/GPT tokenization.',
      topics: ['Self-Attention Mechanics', 'Positional Encodings', 'Transformer Encoder/Decoder', 'Hugging Face Ecosystem'],
      cloCodes: ['CLO 2', 'CLO 3'],
    },
    {
      number: 4,
      title: 'Capstone Deployment, Model Auditing & Ethics',
      weeks: 'Weeks 13–16',
      description:
        'Quantization, ONNX runtime deployment, demographic parity evaluation, and public technical defense.',
      topics: ['Model Export & Latency Profiling', 'Algorithmic Fairness Metrics', 'Adversarial Vulnerabilities', 'Final Capstone Project Defense'],
      cloCodes: ['CLO 4'],
    },
  ],
  assessments: [
    { name: 'Diagnostic Math & Gradient Problem Set', type: 'Assignment', weight: 15, bloom: 'Analyze', directOrIndirect: 'Direct' },
    { name: 'Hands-on PyTorch Coding Lab Practicals (4 Labs)', type: 'Lab / Practical', weight: 25, bloom: 'Apply', directOrIndirect: 'Direct' },
    { name: 'Mid-Term Empirical Model Ablation Study', type: 'Midterm Exam', weight: 20, bloom: 'Evaluate', directOrIndirect: 'Direct' },
    { name: 'Capstone Deep Learning System & Code Defense', type: 'Capstone Project', weight: 40, bloom: 'Create', directOrIndirect: 'Direct' },
  ],
  sampleRubric: {
    title: 'Capstone Deep Learning Engineering Rubric',
    criteria: [
      {
        name: 'Architecture Design & Pipeline Completeness',
        weight: 35,
        cloCode: 'CLO 4',
        exemplaryDescriptor: 'Production-ready modular code adhering to PEP8, reproducible data loaders, and optimal neural architecture selection.',
      },
      {
        name: 'Empirical Benchmarking & Statistical Rigor',
        weight: 35,
        cloCode: 'CLO 3',
        exemplaryDescriptor: 'Includes thorough baseline comparison, ablation plots, statistical error bars, and convergence analysis across seeds.',
      },
      {
        name: 'Algorithmic Fairness & Bias Verification',
        weight: 30,
        cloCode: 'CLO 4',
        exemplaryDescriptor: 'Identifies subgroup performance disparities and implements effective mitigation techniques with transparent documentation.',
      },
    ],
  },
  colorTheme: {
    primary: 'indigo',
    gradient: 'from-indigo-600 via-indigo-700 to-slate-900',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    accentBg: 'bg-indigo-50/50',
    iconColor: 'text-indigo-600',
    cardBorderHover: 'hover:border-indigo-400',
  },
  tags: ['AI & Neural Nets', 'ABET Accredited', 'PyTorch Labs', 'Washington Accord', 'Undergraduate', 'Bloom L3-L6'],
  buildCourse: (customTitle?: string, customCode?: string) => {
    const base: Course = JSON.parse(JSON.stringify(CS_TEMPLATE_COURSE));
    const newId = `course-tech-${Date.now()}`;
    return {
      ...base,
      id: newId,
      title: customTitle?.trim() || 'Artificial Intelligence & Neural Systems (OBE Blueprint)',
      code: customCode?.trim() || 'CSE-420',
      category: 'Computer Science & Engineering',
      programme: 'Bachelor of Science in Computer Science (B.Sc. CS)',
      creditHours: 4,
      durationWeeks: 16,
      modulesCount: 4,
      isTemplate: false,
      status: 'draft',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  },
};

// -----------------------------------------------------------------------------------
// 2. SCIENCE: Biomedical Science & Molecular Diagnostics (Life Sciences & Health)
// -----------------------------------------------------------------------------------
const SCIENCE_BIOMEDICAL_TEMPLATE: CourseTemplateGalleryItem = {
  id: 'template-science-biomed',
  title: 'Biomedical Science & Molecular Diagnostics',
  code: 'BMS-302',
  discipline: 'Science',
  disciplineLabel: 'Natural & Applied Sciences',
  programme: 'Bachelor of Science in Biomedical Sciences (B.Sc. Hons)',
  summary:
    'Rigorous laboratory and data-driven curriculum integrating wet-lab experimental design, genomic sequence analysis, and clinical diagnostic validation.',
  fullDescription:
    'An accredited laboratory science blueprint bridging cellular pathology, polymerase chain reaction (PCR) kinetics, bioinformatics pipelines, and clinical quality assurance. Structured with constructive alignment for laboratory protocols, clinical case audits, and bioethical compliance.',
  durationWeeks: 16,
  creditHours: 4,
  level: 'Undergraduate',
  deliveryMode: 'Blended',
  accreditationBody: 'Institute of Biomedical Science (IBMS) & HEC National Science Standards',
  targetLearners:
    'Undergraduate biomedical, biotechnology, and pre-med students seeking advanced experimental competency in molecular diagnostics.',
  learningPromise:
    'Graduates will be proficient in designing valid molecular assays, executing bioinformatic genomic analyses, and troubleshooting clinical pathology diagnostic discrepancies.',
  capstoneGoal:
    'Formulate, execute, and clinically validate a molecular diagnostic protocol for detecting target genetic biomarkers adhering to ISO 15189 laboratory standards.',
  competencies: [
    'Molecular Assay Design & Quality Assurance',
    'Bioinformatics & Genomic Sequence Profiling',
    'Clinical Pathology Correlation & Data Interpretation',
    'Biosafety Level 2 (BSL-2) Protocol Adherence',
  ],
  skills: [
    'Quantitative PCR (qPCR) & Primer Design',
    'BLAST, Multiple Sequence Alignment & Phylogenetics',
    'Spectrophotometry & Electrophoresis Validation',
    'Clinical Diagnostic Sensitivity & Specificity Calculation',
  ],
  bloomsDistribution: [
    { level: 'L2', label: 'Understand', percentage: 20, color: 'bg-emerald-400' },
    { level: 'L3', label: 'Apply', percentage: 30, color: 'bg-teal-500' },
    { level: 'L4', label: 'Analyze', percentage: 30, color: 'bg-emerald-600' },
    { level: 'L5', label: 'Evaluate', percentage: 20, color: 'bg-teal-700' },
  ],
  clos: [
    {
      code: 'CLO 1',
      statement:
        'Explain cellular and molecular mechanisms of pathogen transmission, oncogenesis, and inherited genetic polymorphisms.',
      bloom: 'Understand',
      bloomLevel: 'Understand',
      threshold: 60,
      weight: 15,
      assessment: 'Diagnostic Cellular Pathology Examination',
      competency: 'Cellular & Molecular Principles',
    },
    {
      code: 'CLO 2',
      statement:
        'Execute standardized nucleic acid extraction, primer validation, and quantitative real-time PCR assays adhering to BSL-2 biosafety containment.',
      bloom: 'Apply',
      bloomLevel: 'Apply',
      threshold: 70,
      weight: 30,
      assessment: 'Direct Laboratory Practical Competency Examination',
      competency: 'Wet-Lab Molecular Assay Execution',
    },
    {
      code: 'CLO 3',
      statement:
        'Analyze high-throughput sequencing datasets using bioinformatics algorithms to identify clinically significant single nucleotide variants (SNVs).',
      bloom: 'Analyze',
      bloomLevel: 'Analyze',
      threshold: 65,
      weight: 25,
      assessment: 'Bioinformatics Genomic Variant Investigation Brief',
      competency: 'Bioinformatic Sequence Analysis',
    },
    {
      code: 'CLO 4',
      statement:
        'Evaluate diagnostic sensitivity, specificity, positive predictive value (PPV), and clinical utility of novel point-of-care biomarker assays.',
      bloom: 'Evaluate',
      bloomLevel: 'Evaluate',
      threshold: 70,
      weight: 30,
      assessment: 'Clinical Diagnostic Assay Validation Capstone Dossier',
      competency: 'Clinical Assay Validation & Audit',
    },
  ],
  modules: [
    {
      number: 1,
      title: 'Molecular Pathology & Cellular Foundations',
      weeks: 'Weeks 1–4',
      description:
        'Genomic organization, transcription regulation, oncogenic mutations, and clinical diagnostic target identification.',
      topics: ['DNA/RNA Architecture', 'Pathogen Genomics', 'Mendelian vs Complex Traits', 'Diagnostic Biomarker Selection'],
      cloCodes: ['CLO 1'],
    },
    {
      number: 2,
      title: 'Diagnostic Nucleic Acid Technologies & Lab Protocols',
      weeks: 'Weeks 5–8',
      description:
        'Hands-on laboratory isolation, gel electrophoresis, fluorometry, primer design, and real-time qPCR amplification kinetics.',
      topics: ['DNA/RNA Extraction Protocols', 'Primer & Probe Design Rules', 'Cycle Threshold (Ct) Quantification', 'Contamination Control in Molecular Labs'],
      cloCodes: ['CLO 2'],
    },
    {
      number: 3,
      title: 'Computational Genomics & Variant Annotation',
      weeks: 'Weeks 9–12',
      description:
        'NCBI/Ensembl querying, sequence alignment algorithms, variant classification (ACMG guidelines), and clinical databases.',
      topics: ['Pairwise & Multiple Alignment', 'Variant Call Format (VCF) Parsing', 'ClinVar & Pathogenicity Scoring', 'Phylogenetic Tree Construction'],
      cloCodes: ['CLO 3'],
    },
    {
      number: 4,
      title: 'Assay Validation, Clinical Trials & Quality Standards',
      weeks: 'Weeks 13–16',
      description:
        'ISO 15189 laboratory accreditation, analytical validation parameters, bioethical oversight, and capstone presentation.',
      topics: ['Limit of Detection (LoD) Determination', 'Analytical Sensitivity vs Clinical Utility', 'Regulatory Oversight (FDA/CE-IVD)', 'Capstone Assay Validation Report'],
      cloCodes: ['CLO 4'],
    },
  ],
  assessments: [
    { name: 'Midterm Diagnostic Pathology Knowledge Check', type: 'Quiz', weight: 15, bloom: 'Understand', directOrIndirect: 'Direct' },
    { name: 'Assessed Laboratory Practical Bench Exam (qPCR)', type: 'Lab / Practical', weight: 30, bloom: 'Apply', directOrIndirect: 'Direct' },
    { name: 'Genomic Variant Bioinformatic Case Study', type: 'Assignment', weight: 20, bloom: 'Analyze', directOrIndirect: 'Direct' },
    { name: 'Clinical Molecular Diagnostic Validation Dossier', type: 'Capstone Project', weight: 35, bloom: 'Evaluate', directOrIndirect: 'Direct' },
  ],
  sampleRubric: {
    title: 'Laboratory Assay Validation & Bioethics Rubric',
    criteria: [
      {
        name: 'Experimental Precision & Pipetting Technique',
        weight: 35,
        cloCode: 'CLO 2',
        exemplaryDescriptor: 'Calculations are error-free, negative/positive controls amplify strictly as expected, and sample duplicates exhibit coefficient of variation <2%.',
      },
      {
        name: 'Statistical Rigor & Sensitivity Modeling',
        weight: 35,
        cloCode: 'CLO 4',
        exemplaryDescriptor: 'Calculates 95% confidence intervals for sensitivity and specificity with clear ROC curve analysis and threshold justification.',
      },
      {
        name: 'Biosafety, Ethics & Waste Disposal Adherence',
        weight: 30,
        cloCode: 'CLO 2',
        exemplaryDescriptor: 'Exemplary decontamination, proper sharps/biohazard segregation, and proactive identification of potential containment risks.',
      },
    ],
  },
  colorTheme: {
    primary: 'emerald',
    gradient: 'from-emerald-600 via-teal-700 to-slate-900',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    accentBg: 'bg-emerald-50/50',
    iconColor: 'text-emerald-600',
    cardBorderHover: 'hover:border-emerald-400',
  },
  tags: ['Life Sciences', 'Lab Practicals', 'Bioinformatics', 'Biotechnology', 'IBMS Aligned', 'Undergraduate'],
  buildCourse: (customTitle?: string, customCode?: string) => {
    const courseId = `course-science-${Date.now()}`;
    const now = new Date().toISOString();
    return {
      id: courseId,
      title: customTitle?.trim() || 'Biomedical Science & Molecular Diagnostics',
      code: customCode?.trim() || 'BMS-302',
      slug: 'biomedical-science-molecular-diagnostics',
      language: 'English',
      textDirection: 'ltr',
      category: 'Natural & Applied Sciences',
      programme: 'Bachelor of Science in Biomedical Sciences (B.Sc. Hons)',
      creditHours: 4,
      durationWeeks: 16,
      modulesCount: 4,
      deliveryMode: 'Blended',
      courseLevel: 'Undergraduate',
      targetLearners:
        'Undergraduate biomedical, biotechnology, and pre-med students seeking advanced experimental competency in molecular diagnostics.',
      prerequisites: 'Foundations of Biochemistry (BMS-201) and Cell Biology (BMS-204)',
      description:
        'An outcome-based laboratory science course bridging cellular pathology, real-time PCR kinetics, bioinformatics genomic analysis, and clinical diagnostic validation.',
      overview:
        'This course equips future laboratory scientists with end-to-end competency in designing, executing, and benchmarking molecular diagnostic protocols. Students manipulate real patient-derived genetic data, validate amplification curves, and compose rigorous clinical dossiers.',
      learningPromise:
        'Graduates will be capable of independently developing, validating, and troubleshooting molecular diagnostic assays in accordance with ISO 15189 international clinical standards.',
      expectedStudyTimeHours: 140,
      capstoneGoal:
        'Design, clinically validate, and document a quantitative diagnostic assay protocol for infectious or oncogenic genetic markers.',
      blueprint: {
        purpose:
          'To cultivate analytically rigorous clinical scientists proficient in modern diagnostic molecular pathology and bioinformatics.',
        learnerNeed:
          'Bridging the gap between textbook molecular genetics and compliant, high-precision laboratory assay execution in clinical hospital settings.',
        targetCompetencies: [
          'Molecular Assay Design & Quality Assurance',
          'Bioinformatics & Genomic Sequence Profiling',
          'Clinical Pathology Correlation & Data Interpretation',
          'Biosafety Level 2 (BSL-2) Protocol Adherence',
        ],
        requiredSkills: [
          'Quantitative PCR (qPCR) & Primer Design',
          'BLAST, Multiple Sequence Alignment & Phylogenetics',
          'Spectrophotometry & Electrophoresis Validation',
          'Clinical Diagnostic Sensitivity & Specificity Calculation',
        ],
        assessmentStrategy:
          'Constructively aligned direct assessments including diagnostic knowledge checks, assessed laboratory bench examinations, bioinformatics problem briefs, and a capstone validation dossier.',
      },
      plos: [
        { id: 'plo-bms-1', code: 'PLO 1', title: 'Scientific Foundations & Biomedical Mechanisms', description: 'Demonstrate advanced mastery of biological, molecular, and cellular disease mechanisms.' },
        { id: 'plo-bms-2', code: 'PLO 2', title: 'Experimental Design & Technical Competency', description: 'Design and execute rigorous laboratory investigations adhering to standard operating procedures and biosafety.' },
        { id: 'plo-bms-3', code: 'PLO 3', title: 'Data Analysis & Critical Synthesis', description: 'Analyze quantitative biological datasets using computational tools to extract clinically valid diagnostic insights.' },
        { id: 'plo-bms-4', code: 'PLO 4', title: 'Ethical Practice & Regulatory Compliance', description: 'Adhere to bioethical principles, patient data privacy, and clinical laboratory accreditation standards.' },
      ],
      clos: [
        {
          id: 'clo-bms-1',
          code: 'CLO 1',
          statement: 'Explain cellular and molecular mechanisms of pathogen transmission, oncogenesis, and inherited genetic polymorphisms.',
          bloomVerb: 'Explain',
          bloomLevel: 'Understand',
          learningDomain: 'Cognitive',
          competency: 'Cellular & Molecular Principles',
          skills: 'Pathogen genomics, gene expression regulation, mutation profiling',
          assessmentMethod: 'Diagnostic Cellular Pathology Examination',
          achievementThreshold: 60,
          weightage: 15,
          status: 'Validated',
          qualityScore: 92,
          qualityChecks: [
            { label: 'Measurable verb', passed: true, detail: 'Uses "Explain"' },
            { label: 'Learner-focused', passed: true, detail: 'Specifies student outcome' },
            { label: 'Assessable', passed: true, detail: 'Evaluated via structured pathology exam' },
          ],
          mappedPLOs: [{ ploId: 'plo-bms-1', level: 'Mastered', rationale: 'Direct foundation in cellular disease.' }],
        },
        {
          id: 'clo-bms-2',
          code: 'CLO 2',
          statement: 'Execute standardized nucleic acid extraction, primer validation, and quantitative real-time PCR assays adhering to BSL-2 containment.',
          bloomVerb: 'Execute',
          bloomLevel: 'Apply',
          learningDomain: 'Psychomotor',
          competency: 'Wet-Lab Molecular Assay Execution',
          skills: 'Micropipetting, nucleic acid extraction, qPCR thermal cycler programming, BSL-2 protocol',
          assessmentMethod: 'Direct Laboratory Practical Bench Examination',
          achievementThreshold: 70,
          weightage: 30,
          status: 'Validated',
          qualityScore: 95,
          qualityChecks: [
            { label: 'Measurable verb', passed: true, detail: 'Uses "Execute"' },
            { label: 'Clear context', passed: true, detail: 'qPCR and BSL-2 containment' },
            { label: 'Standard defined', passed: true, detail: 'Standardized protocols' },
          ],
          mappedPLOs: [{ ploId: 'plo-bms-2', level: 'Mastered', rationale: 'Direct psychomotor laboratory competency.' }],
        },
        {
          id: 'clo-bms-3',
          code: 'CLO 3',
          statement: 'Analyze high-throughput sequencing datasets using bioinformatics algorithms to identify clinically significant single nucleotide variants.',
          bloomVerb: 'Analyze',
          bloomLevel: 'Analyze',
          learningDomain: 'Cognitive',
          competency: 'Bioinformatic Sequence Analysis',
          skills: 'Multiple sequence alignment, VCF file annotation, pathogenicity scoring',
          assessmentMethod: 'Bioinformatics Genomic Variant Investigation Brief',
          achievementThreshold: 65,
          weightage: 25,
          status: 'Validated',
          qualityScore: 94,
          qualityChecks: [
            { label: 'Measurable verb', passed: true, detail: 'Uses "Analyze"' },
            { label: 'One primary cognitive action', passed: true, detail: 'Focused on variant analysis' },
            { label: 'Appropriate Bloom level', passed: true, detail: 'Level 4 (Analyze)' },
          ],
          mappedPLOs: [{ ploId: 'plo-bms-3', level: 'Mastered', rationale: 'Direct data analytics outcome.' }],
        },
        {
          id: 'clo-bms-4',
          code: 'CLO 4',
          statement: 'Evaluate diagnostic sensitivity, specificity, positive predictive value, and clinical utility of novel point-of-care biomarker assays.',
          bloomVerb: 'Evaluate',
          bloomLevel: 'Evaluate',
          learningDomain: 'Cognitive',
          competency: 'Clinical Assay Validation & Audit',
          skills: 'ROC curve analysis, sensitivity/specificity statistical calculation, ISO 15189 compliance audit',
          assessmentMethod: 'Clinical Diagnostic Assay Validation Capstone Dossier',
          achievementThreshold: 70,
          weightage: 30,
          status: 'Validated',
          qualityScore: 96,
          qualityChecks: [
            { label: 'Measurable verb', passed: true, detail: 'Uses "Evaluate"' },
            { label: 'Standard defined', passed: true, detail: 'ISO 15189 clinical guidelines' },
            { label: 'Appropriate Bloom level', passed: true, detail: 'Level 5 (Evaluate)' },
          ],
          mappedPLOs: [{ ploId: 'plo-bms-4', level: 'Mastered', rationale: 'Capstones regulatory and ethical clinical practice.' }],
        },
      ],
      modules: [
        { id: 'mod-bms-1', number: 1, title: 'Molecular Pathology & Cellular Foundations', description: 'Genomic architecture, oncogenic mutations, and disease biomarkers.', durationWeeks: 4, expectedStudyHours: 35, relatedCLOIds: ['clo-bms-1'], resources: [] },
        { id: 'mod-bms-2', number: 2, title: 'Diagnostic Nucleic Acid Technologies & Lab Protocols', description: 'Hands-on nucleic acid isolation, primer design, and real-time qPCR kinetics.', durationWeeks: 4, expectedStudyHours: 40, relatedCLOIds: ['clo-bms-2'], resources: [] },
        { id: 'mod-bms-3', number: 3, title: 'Computational Genomics & Variant Annotation', description: 'Bioinformatic query algorithms, alignment protocols, and clinical variant evaluation.', durationWeeks: 4, expectedStudyHours: 35, relatedCLOIds: ['clo-bms-3'], resources: [] },
        { id: 'mod-bms-4', number: 4, title: 'Assay Validation, Clinical Trials & Quality Standards', description: 'ISO 15189 compliance, diagnostic metric calculations, and capstone presentation.', durationWeeks: 4, expectedStudyHours: 30, relatedCLOIds: ['clo-bms-4'], resources: [] },
      ],
      mlos: [],
      lessons: [],
      activities: [],
      assessments: [
        {
          id: 'asmt-bms-1',
          name: 'Midterm Cellular Pathology Knowledge Check',
          type: 'Quiz',
          linkedCLOIds: ['clo-bms-1'],
          linkedMLOIds: [],
          bloomLevel: 'Understand',
          evidenceType: 'Direct',
          marks: 25,
          weightage: 15,
          achievementThreshold: 60,
          isSummative: false,
          directOrIndirect: 'Direct',
          questions: [],
        },
        {
          id: 'asmt-bms-2',
          name: 'Direct Laboratory Practical Competency Exam',
          type: 'Practical',
          linkedCLOIds: ['clo-bms-2'],
          linkedMLOIds: [],
          bloomLevel: 'Apply',
          evidenceType: 'Direct',
          marks: 50,
          weightage: 30,
          achievementThreshold: 70,
          isSummative: true,
          directOrIndirect: 'Direct',
          questions: [],
          rubricId: 'rubric-bms-lab',
        },
        {
          id: 'asmt-bms-3',
          name: 'Bioinformatics Genomic Variant Investigation Brief',
          type: 'Assignment',
          linkedCLOIds: ['clo-bms-3'],
          linkedMLOIds: [],
          bloomLevel: 'Analyze',
          evidenceType: 'Direct',
          marks: 50,
          weightage: 25,
          achievementThreshold: 65,
          isSummative: true,
          directOrIndirect: 'Direct',
          questions: [],
        },
        {
          id: 'asmt-bms-4',
          name: 'Clinical Molecular Diagnostic Validation Dossier',
          type: 'Project',
          linkedCLOIds: ['clo-bms-4'],
          linkedMLOIds: [],
          bloomLevel: 'Evaluate',
          evidenceType: 'Direct',
          marks: 100,
          weightage: 30,
          achievementThreshold: 70,
          isSummative: true,
          directOrIndirect: 'Direct',
          questions: [],
          rubricId: 'rubric-bms-capstone',
        },
      ],
      rubrics: [
        {
          id: 'rubric-bms-lab',
          title: 'Laboratory Assay Execution & Precision Rubric',
          assessmentId: 'asmt-bms-2',
          criteria: [
            {
              id: 'cr-bms-1',
              criterionName: 'Assay Precision & Quality Control',
              cloId: 'clo-bms-2',
              weight: 50,
              levels: [
                { level: 'Not Achieved', descriptor: 'Severe pipetting inconsistency; failed negative controls or missing standard curves.', pointsRange: '0-49%' },
                { level: 'Developing', descriptor: 'Acceptable technique with occasional air bubbles; coefficient of variation between 5-10%.', pointsRange: '50-64%' },
                { level: 'Achieved', descriptor: 'Accurate pipetting, robust amplification curve, coefficient of variation < 4%.', pointsRange: '65-74%' },
                { level: 'Proficient', descriptor: 'High reproducibility, exemplary reaction setups, coefficient of variation < 2%.', pointsRange: '75-84%' },
                { level: 'Exemplary', descriptor: 'Flawless execution matching certified clinical reference standard performance.', pointsRange: '85-100%' },
              ],
            },
            {
              id: 'cr-bms-2',
              criterionName: 'Biosafety & Waste Segregation',
              cloId: 'clo-bms-2',
              weight: 50,
              levels: [
                { level: 'Not Achieved', descriptor: 'Breached containment or improper handling of biohazard waste.', pointsRange: '0-49%' },
                { level: 'Developing', descriptor: 'Follows protocol after instructor correction; minor decontamination oversights.', pointsRange: '50-64%' },
                { level: 'Achieved', descriptor: 'Consistently wears PPE and follows standard BSL-2 protocol correctly.', pointsRange: '65-74%' },
                { level: 'Proficient', descriptor: 'Proactive bench hygiene and meticulous disinfection before and after work.', pointsRange: '75-84%' },
                { level: 'Exemplary', descriptor: 'Acts as laboratory safety exemplar, assisting peers in protocol compliance.', pointsRange: '85-100%' },
              ],
            },
          ],
        },
      ],
      evidenceRules: [],
      comments: [],
      status: 'draft',
      updatedAt: now,
      createdAt: now,
    };
  },
};

// -----------------------------------------------------------------------------------
// 3. HUMANITIES: Constitutional Law & Public Governance (Jurisprudence & Society)
// -----------------------------------------------------------------------------------
const HUMANITIES_LAW_TEMPLATE: CourseTemplateGalleryItem = {
  id: 'template-humanities-law',
  title: 'Constitutional Law & Federal Governance',
  code: 'LAW-401',
  discipline: 'Humanities',
  disciplineLabel: 'Humanities & Legal Studies',
  programme: 'Bachelor of Laws (LL.B Honors)',
  summary:
    'Comprehensive legal and public policy curriculum with constructive alignment for judicial review, federal institutional balance, and appellate writ drafting.',
  fullDescription:
    'An accredited outcome-based study of constitutional evolution, centre-province legislative power distribution, separation of powers, and fundamental human rights adjudication. Features simulated appellate court bench moots and multi-issue jurisprudential problem briefs.',
  durationWeeks: 16,
  creditHours: 3,
  level: 'Undergraduate',
  deliveryMode: 'Blended',
  accreditationBody: 'National Judicial & Bar Council Accreditation / QAA Standards',
  targetLearners:
    'Senior undergraduate law students, judicial trainees, public policy practitioners, and civil rights advocates.',
  learningPromise:
    'Learners will gain the ability to analyze acute constitutional crises, draft persuasive appellate petitions, and construct defensible legal briefs on contested federal jurisdictions.',
  capstoneGoal:
    'Synthesize statutory articles, historical precedents, and human rights frameworks to draft and argue an authentic appellate constitutional writ before a simulated judicial bench.',
  competencies: [
    'Constitutional Interpretation & Statutory Construction',
    'Federal Jurisdictional Dispute Resolution',
    'Appellate Legal Advocacy & Moot Argumentation',
    'Fundamental Rights Adjudication & Judicial Review',
  ],
  skills: [
    'Doctrinal case law synthesis',
    'Comparative federalism & devolution analysis',
    'Formal writ petition drafting',
    'Oral appellate advocacy & response to judicial intervention',
  ],
  bloomsDistribution: [
    { level: 'L3', label: 'Apply', percentage: 20, color: 'bg-amber-500' },
    { level: 'L4', label: 'Analyze', percentage: 30, color: 'bg-rose-500' },
    { level: 'L5', label: 'Evaluate', percentage: 30, color: 'bg-purple-600' },
    { level: 'L6', label: 'Create', percentage: 20, color: 'bg-emerald-600' },
  ],
  clos: [
    {
      code: 'CLO 1',
      statement:
        'Analyze constitutional crises, military interventions, and landmark judicial doctrines to trace democratic rule-of-law evolution.',
      bloom: 'Analyze',
      bloomLevel: 'Analyze',
      threshold: 60,
      weight: 20,
      assessment: 'Constitutional Evolution Diagnostic Exam',
      competency: 'Historical & Doctrinal Analysis',
    },
    {
      code: 'CLO 2',
      statement:
        'Resolve centre-province legislative and fiscal jurisdictional conflicts by applying statutory preemption and repugnancy tests.',
      bloom: 'Apply',
      bloomLevel: 'Apply',
      threshold: 65,
      weight: 25,
      assessment: 'Federalism Dispute Problem Resolution Brief',
      competency: 'Federal Jurisdictional Conflict Resolution',
    },
    {
      code: 'CLO 3',
      statement:
        'Evaluate the judicial review doctrine, locus standi, and separation of powers through structured appellate oral advocacy.',
      bloom: 'Evaluate',
      bloomLevel: 'Evaluate',
      threshold: 65,
      weight: 30,
      assessment: 'Simulated Constitutional Bench Oral Moot & Memorial',
      competency: 'Appellate Advocacy & Judicial Review',
    },
    {
      code: 'CLO 4',
      statement:
        'Draft persuasive constitutional writ petitions challenging state actions on fundamental human rights violations.',
      bloom: 'Create',
      bloomLevel: 'Create',
      threshold: 70,
      weight: 25,
      assessment: 'Capstone Fundamental Rights Writ Petition',
      competency: 'Constitutional Drafting & Rights Defense',
    },
  ],
  modules: [
    {
      number: 1,
      title: 'Constitutional Evolution & Judicial Doctrines',
      weeks: 'Weeks 1–4',
      description:
        'Genesis of constitutional governance, landmark cases, the doctrine of state necessity, and democratic revival.',
      topics: ['Constitutional History', 'State v. Dosso & Asma Jilani Jurisprudence', 'PCO Judges Cases', 'Basic Structure Doctrine'],
      cloCodes: ['CLO 1'],
    },
    {
      number: 2,
      title: 'Federal Institutional Design & Legislative Distribution',
      weeks: 'Weeks 5–8',
      description:
        'Centre-province legislative powers, statutory repugnancy, fiscal federalism, and the Council of Common Interests.',
      topics: ['Federal & Provincial Legislative Lists', 'Statutory Preemption Tests', 'National Finance Commission (NFC)', 'Inter-Provincial Dispute Resolution'],
      cloCodes: ['CLO 2'],
    },
    {
      number: 3,
      title: 'Judicial Power, Separation of Powers & Public Interest Litigation',
      weeks: 'Weeks 9–12',
      description:
        'High Court writ jurisdictions (mandamus, certiorari, prohibition, habeas corpus) and Supreme Court original jurisdiction.',
      topics: ['Original & Appellate Jurisdiction', 'Locus Standi & Suo Motu Powers', 'Judicial Appointments & Independence', 'Moot Court Advocacy Skills'],
      cloCodes: ['CLO 3'],
    },
    {
      number: 4,
      title: 'Fundamental Rights Adjudication & Capstone Writ Drafting',
      weeks: 'Weeks 13–16',
      description:
        'Substantive human rights (fair trial, due process, freedom of expression) and crafting enforceable writ petitions.',
      topics: ['Right to Fair Trial & Due Process', 'Freedom of Assembly & Expression', 'Drafting Prayer & Grounds in Petitions', 'Capstone Oral Bench Examination'],
      cloCodes: ['CLO 4'],
    },
  ],
  assessments: [
    { name: 'Diagnostic Quiz & Case Law Check', type: 'Quiz', weight: 10, bloom: 'Understand', directOrIndirect: 'Direct' },
    { name: 'Centre-Province Dispute Scenario Brief', type: 'Assignment', weight: 20, bloom: 'Apply', directOrIndirect: 'Direct' },
    { name: 'Simulated Constitutional Bench Oral Moot', type: 'Project', weight: 30, bloom: 'Evaluate', directOrIndirect: 'Direct' },
    { name: 'Comprehensive Final Examination & Capstone Writ', type: 'Final Assessment', weight: 40, bloom: 'Create', directOrIndirect: 'Direct' },
  ],
  sampleRubric: {
    title: 'Constitutional Moot Advocacy & Legal Reasoning Rubric',
    criteria: [
      {
        name: 'Doctrinal Accuracy & Precedent Synthesis',
        weight: 40,
        cloCode: 'CLO 3',
        exemplaryDescriptor: 'Cites authoritative precedents accurately, distinguishing adverse rulings with subtle legal distinctions and zero distortion.',
      },
      {
        name: 'Oral Persuasion & Composure Under Questioning',
        weight: 35,
        cloCode: 'CLO 3',
        exemplaryDescriptor: 'Answers judge interruptions with crisp legal authority, immediately pivoting back to core statutory grounds without hesitation.',
      },
      {
        name: 'Appellate Memorial Structure & Format',
        weight: 25,
        cloCode: 'CLO 4',
        exemplaryDescriptor: 'Pristine legal prose conforming to court citation manuals with logically formulated grounds and tailored prayers.',
      },
    ],
  },
  colorTheme: {
    primary: 'amber',
    gradient: 'from-amber-600 via-rose-700 to-slate-900',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    accentBg: 'bg-amber-50/50',
    iconColor: 'text-amber-600',
    cardBorderHover: 'hover:border-amber-400',
  },
  tags: ['Law & Governance', 'Humanities', 'Appellate Advocacy', 'Moot Court', 'QAA Accredited', 'Undergraduate'],
  buildCourse: (customTitle?: string, customCode?: string) => {
    const base: Course = JSON.parse(JSON.stringify(FLAGSHIP_COURSE));
    const newId = `course-law-${Date.now()}`;
    return {
      ...base,
      id: newId,
      title: customTitle?.trim() || 'Constitutional Law & Federal Governance',
      code: customCode?.trim() || 'LAW-401',
      category: 'Law & Jurisprudence',
      isTemplate: false,
      status: 'draft',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  },
};

// -----------------------------------------------------------------------------------
// 4. BUSINESS: Strategic Management & Decision Analytics (Business & Economics)
// -----------------------------------------------------------------------------------
const BUSINESS_STRATEGY_TEMPLATE: CourseTemplateGalleryItem = {
  id: 'template-business-strategy',
  title: 'Strategic Management & Decision Analytics',
  code: 'MGT-450',
  discipline: 'Business',
  disciplineLabel: 'Business, Management & Economics',
  programme: 'Bachelor of Business Administration (BBA Hons)',
  summary:
    'Executive-grade outcome-based business curriculum combining qualitative industry analysis with quantitative scenario forecasting and boardroom case defense.',
  fullDescription:
    'An AACSB and EQUIS-aligned strategic management syllabus connecting competitive positioning, corporate portfolio matrices, financial scenario simulation, and ESG governance. Learners develop executive board presentations and authentic corporate turnaround strategies.',
  durationWeeks: 15,
  creditHours: 3,
  level: 'Undergraduate',
  deliveryMode: 'Blended',
  accreditationBody: 'AACSB International & National Business Education Accreditation',
  targetLearners:
    'Senior business administration, finance, and economics undergraduates preparing for corporate strategy or management consulting careers.',
  learningPromise:
    'Students will be capable of diagnosing enterprise competitive disadvantages, constructing quantitative valuation models, and delivering persuasive strategic board presentations.',
  capstoneGoal:
    'Formulate a 5-year corporate turnaround strategy complete with discounted cash flow (DCF) financial models, ESG risk audits, and executive board governance resolutions.',
  competencies: [
    'Industry Structure & Competitive Advantage Analysis',
    'Financial Modeling & Strategic Capital Allocation',
    'Enterprise Risk Management & ESG Governance',
    'Executive Communication & Boardroom Advocacy',
  ],
  skills: [
    'Porter’s Five Forces & VRIO Framework Analysis',
    'Discounted Cash Flow (DCF) & Sensitivity Modeling',
    'Scenario Planning & War Gaming Simulations',
    'Executive Slide Deck Storyboarding & Presentation',
  ],
  bloomsDistribution: [
    { level: 'L3', label: 'Apply', percentage: 20, color: 'bg-sky-500' },
    { level: 'L4', label: 'Analyze', percentage: 35, color: 'bg-blue-600' },
    { level: 'L5', label: 'Evaluate', percentage: 25, color: 'bg-indigo-600' },
    { level: 'L6', label: 'Create', percentage: 20, color: 'bg-emerald-600' },
  ],
  clos: [
    {
      code: 'CLO 1',
      statement:
        'Analyze external macroeconomic forces and internal core competencies using industry frameworks to identify sustainable competitive advantage.',
      bloom: 'Analyze',
      bloomLevel: 'Analyze',
      threshold: 65,
      weight: 20,
      assessment: 'Industry Structure & Competitor Positioning Report',
      competency: 'Strategic Positioning',
    },
    {
      code: 'CLO 2',
      statement:
        'Formulate quantitative financial projection models evaluating strategic M&A investments under varied interest rate and demand scenarios.',
      bloom: 'Apply',
      bloomLevel: 'Apply',
      threshold: 70,
      weight: 25,
      assessment: 'Financial Valuation & Capital Allocation Lab',
      competency: 'Strategic Decision Modeling',
    },
    {
      code: 'CLO 3',
      statement:
        'Evaluate corporate governance dilemmas, executive compensation structures, and ESG stakeholder trade-offs against international sustainability standards.',
      bloom: 'Evaluate',
      bloomLevel: 'Evaluate',
      threshold: 65,
      weight: 20,
      assessment: 'Corporate Governance & ESG Case Brief',
      competency: 'Corporate Ethics & Governance',
    },
    {
      code: 'CLO 4',
      statement:
        'Design a comprehensive 5-year corporate turnaround strategy and defend executive recommendations before a simulated board of directors.',
      bloom: 'Create',
      bloomLevel: 'Create',
      threshold: 70,
      weight: 35,
      assessment: 'Capstone Boardroom Turnaround Pitch & Strategy Deck',
      competency: 'Executive Strategy Synthesis',
    },
  ],
  modules: [
    {
      number: 1,
      title: 'Industry Structure & Competitive Moats',
      weeks: 'Weeks 1–4',
      description:
        'Analyzing competitive dynamics, disruptive innovation, resource-based view (RBV), and sustained value capture.',
      topics: ['Five Forces Framework', 'VRIO Internal Capability Audit', 'Disruptive Innovation Cycles', 'Platform vs Pipeline Business Models'],
      cloCodes: ['CLO 1'],
    },
    {
      number: 2,
      title: 'Corporate Strategy, M&A & Capital Allocation',
      weeks: 'Weeks 5–8',
      description:
        'Horizontal/vertical integration, diversification traps, joint ventures, and synergy valuation in acquisitions.',
      topics: ['Growth-Share Matrix (BCG)', 'Mergers & Acquisitions Due Diligence', 'Post-Merger Integration', 'DCF Valuation & Sensitivity Analysis'],
      cloCodes: ['CLO 2'],
    },
    {
      number: 3,
      title: 'ESG Governance, Ethics & Global Supply Networks',
      weeks: 'Weeks 9–11',
      description:
        'Stakeholder capitalism, carbon accounting, geopolitical supply chain resilience, and boardroom fiduciary duty.',
      topics: ['ESG Reporting Standards (GRI/SASB)', 'Supply Chain Nearshoring & Risk', 'Executive Fiduciary Duties', 'Ethical Crisis Management'],
      cloCodes: ['CLO 3'],
    },
    {
      number: 4,
      title: 'Turnaround Execution & Boardroom Capstone',
      weeks: 'Weeks 12–15',
      description:
        'Change management, organizational redesign, strategic metrics (OKRs), and live boardroom presentation.',
      topics: ['Balanced Scorecard Implementation', 'Turnaround Sequencing & Cash Conservation', 'Boardroom Defense Strategy', 'Executive Capstone Presentation'],
      cloCodes: ['CLO 4'],
    },
  ],
  assessments: [
    { name: 'Strategic Concepts & Frameworks Quiz', type: 'Quiz', weight: 15, bloom: 'Understand', directOrIndirect: 'Direct' },
    { name: 'Competitor & Value Chain Analysis Brief', type: 'Assignment', weight: 20, bloom: 'Analyze', directOrIndirect: 'Direct' },
    { name: 'Financial Valuation & Capital Model', type: 'Project', weight: 25, bloom: 'Apply', directOrIndirect: 'Direct' },
    { name: 'Capstone Corporate Strategy Boardroom Pitch', type: 'Capstone Project', weight: 40, bloom: 'Create', directOrIndirect: 'Direct' },
  ],
  sampleRubric: {
    title: 'Executive Strategic Turnaround Boardroom Rubric',
    criteria: [
      {
        name: 'Strategic Coherence & Market Realism',
        weight: 40,
        cloCode: 'CLO 4',
        exemplaryDescriptor: 'Identifies core competitive vulnerabilities accurately and proposes logically sequenced, empirically validated turnaround interventions.',
      },
      {
        name: 'Financial Modeling & Capital Feasibility',
        weight: 35,
        cloCode: 'CLO 2',
        exemplaryDescriptor: 'Flawless DCF model linking strategy directly to revenue drivers, cost-out synergies, and capital expenditure constraints.',
      },
      {
        name: 'Boardroom Presentation & Executive Q&A',
        weight: 25,
        cloCode: 'CLO 4',
        exemplaryDescriptor: 'Commands the room with professional poise, defending controversial recommendations with crisp data-backed rationales.',
      },
    ],
  },
  colorTheme: {
    primary: 'sky',
    gradient: 'from-sky-600 via-blue-700 to-slate-900',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    accentBg: 'bg-sky-50/50',
    iconColor: 'text-sky-600',
    cardBorderHover: 'hover:border-sky-400',
  },
  tags: ['Business & Strategy', 'AACSB Accredited', 'Financial Modeling', 'Boardroom Case', 'Undergraduate'],
  buildCourse: (customTitle?: string, customCode?: string) => {
    const courseId = `course-biz-${Date.now()}`;
    const now = new Date().toISOString();
    return {
      id: courseId,
      title: customTitle?.trim() || 'Strategic Management & Decision Analytics',
      code: customCode?.trim() || 'MGT-450',
      slug: 'strategic-management-decision-analytics',
      language: 'English',
      textDirection: 'ltr',
      category: 'Business & Management',
      programme: 'Bachelor of Business Administration (BBA Hons)',
      creditHours: 3,
      durationWeeks: 15,
      modulesCount: 4,
      deliveryMode: 'Blended',
      courseLevel: 'Undergraduate',
      targetLearners:
        'Senior business administration, finance, and economics undergraduates preparing for corporate strategy or management consulting careers.',
      prerequisites: 'Corporate Finance (FIN-301) and Organizational Behavior (MGT-201)',
      description:
        'An outcome-based strategic management syllabus connecting competitive positioning, corporate portfolio matrices, financial scenario simulation, and ESG governance.',
      overview:
        'This capstone course prepares students to think and decide as chief strategy officers. Through authentic corporate case studies, financial forecasting, and simulated board meetings, learners master value creation in contested markets.',
      learningPromise:
        'Students will be capable of diagnosing enterprise competitive disadvantages, constructing quantitative valuation models, and delivering persuasive strategic board presentations.',
      expectedStudyTimeHours: 120,
      capstoneGoal:
        'Formulate a 5-year corporate turnaround strategy complete with financial models, ESG risk audits, and executive board governance resolutions.',
      blueprint: {
        purpose: 'To cultivate strategic corporate leaders equipped with both qualitative insight and quantitative modeling mastery.',
        learnerNeed: 'Bridging abstract management theory with quantitative capital allocation and boardroom persuasion skills.',
        targetCompetencies: [
          'Industry Structure & Competitive Advantage Analysis',
          'Financial Modeling & Strategic Capital Allocation',
          'Enterprise Risk Management & ESG Governance',
          'Executive Communication & Boardroom Advocacy',
        ],
        requiredSkills: [
          'Porter’s Five Forces & VRIO Framework Analysis',
          'Discounted Cash Flow (DCF) & Sensitivity Modeling',
          'Scenario Planning & War Gaming Simulations',
          'Executive Slide Deck Storyboarding & Presentation',
        ],
        assessmentStrategy:
          'Constructively aligned direct assessments including case briefs, financial valuation labs, and a capstone executive board defense.',
      },
      plos: [
        { id: 'plo-biz-1', code: 'PLO 1', title: 'Strategic Vision & Conceptual Mastery', description: 'Analyze complex macroeconomic and market environments to formulate coherent business strategies.' },
        { id: 'plo-biz-2', code: 'PLO 2', title: 'Quantitative Decision Analytics & Financial Modeling', description: 'Apply financial and analytical tools to allocate capital and model enterprise risk.' },
        { id: 'plo-biz-3', code: 'PLO 3', title: 'Ethical Governance & Stakeholder Responsibility', description: 'Evaluate ethical dilemmas, corporate governance structures, and environmental/social impacts.' },
        { id: 'plo-biz-4', code: 'PLO 4', title: 'Executive Communication & Leadership', description: 'Deliver persuasive, data-driven strategic presentations to senior executive audiences.' },
      ],
      clos: [
        {
          id: 'clo-biz-1',
          code: 'CLO 1',
          statement: 'Analyze external macroeconomic forces and internal core competencies using industry frameworks to identify sustainable competitive advantage.',
          bloomVerb: 'Analyze',
          bloomLevel: 'Analyze',
          learningDomain: 'Cognitive',
          competency: 'Strategic Positioning',
          skills: 'Five Forces, VRIO, strategic group mapping',
          assessmentMethod: 'Industry Structure & Competitor Positioning Report',
          achievementThreshold: 65,
          weightage: 20,
          status: 'Validated',
          qualityScore: 93,
          qualityChecks: [{ label: 'Measurable verb', passed: true, detail: 'Uses "Analyze"' }],
          mappedPLOs: [{ ploId: 'plo-biz-1', level: 'Mastered', rationale: 'Direct strategic analysis outcome.' }],
        },
        {
          id: 'clo-biz-2',
          code: 'CLO 2',
          statement: 'Formulate quantitative financial projection models evaluating strategic M&A investments under varied interest rate and demand scenarios.',
          bloomVerb: 'Formulate',
          bloomLevel: 'Apply',
          learningDomain: 'Cognitive',
          competency: 'Strategic Decision Modeling',
          skills: 'DCF valuation, sensitivity matrices, capital budgeting',
          assessmentMethod: 'Financial Valuation & Capital Allocation Lab',
          achievementThreshold: 70,
          weightage: 25,
          status: 'Validated',
          qualityScore: 94,
          qualityChecks: [{ label: 'Measurable verb', passed: true, detail: 'Uses "Formulate"' }],
          mappedPLOs: [{ ploId: 'plo-biz-2', level: 'Mastered', rationale: 'Direct quantitative modeling.' }],
        },
        {
          id: 'clo-biz-3',
          code: 'CLO 3',
          statement: 'Evaluate corporate governance dilemmas, executive compensation structures, and ESG stakeholder trade-offs against international standards.',
          bloomVerb: 'Evaluate',
          bloomLevel: 'Evaluate',
          learningDomain: 'Cognitive',
          competency: 'Corporate Ethics & Governance',
          skills: 'ESG audit, fiduciary review, stakeholder matrix',
          assessmentMethod: 'Corporate Governance & ESG Case Brief',
          achievementThreshold: 65,
          weightage: 20,
          status: 'Validated',
          qualityScore: 92,
          qualityChecks: [{ label: 'Measurable verb', passed: true, detail: 'Uses "Evaluate"' }],
          mappedPLOs: [{ ploId: 'plo-biz-3', level: 'Mastered', rationale: 'Direct ethics and governance outcome.' }],
        },
        {
          id: 'clo-biz-4',
          code: 'CLO 4',
          statement: 'Design a comprehensive 5-year corporate turnaround strategy and defend executive recommendations before a simulated board of directors.',
          bloomVerb: 'Design',
          bloomLevel: 'Create',
          learningDomain: 'Cognitive',
          competency: 'Executive Strategy Synthesis',
          skills: 'Corporate turnaround sequencing, executive pitch, boardroom Q&A',
          assessmentMethod: 'Capstone Boardroom Turnaround Pitch & Strategy Deck',
          achievementThreshold: 70,
          weightage: 35,
          status: 'Validated',
          qualityScore: 96,
          qualityChecks: [{ label: 'Measurable verb', passed: true, detail: 'Uses "Design"' }],
          mappedPLOs: [{ ploId: 'plo-biz-4', level: 'Mastered', rationale: 'Capstone executive presentation outcome.' }],
        },
      ],
      modules: [
        { id: 'mod-biz-1', number: 1, title: 'Industry Structure & Competitive Moats', description: 'Competitive forces, internal capabilities, and disruptive innovation.', durationWeeks: 4, expectedStudyHours: 30, relatedCLOIds: ['clo-biz-1'], resources: [] },
        { id: 'mod-biz-2', number: 2, title: 'Corporate Strategy, M&A & Capital Allocation', description: 'M&A due diligence, valuation models, and portfolio synergies.', durationWeeks: 4, expectedStudyHours: 35, relatedCLOIds: ['clo-biz-2'], resources: [] },
        { id: 'mod-biz-3', number: 3, title: 'ESG Governance, Ethics & Global Supply Networks', description: 'Stakeholder capitalism, supply chain resilience, and ESG compliance.', durationWeeks: 3, expectedStudyHours: 25, relatedCLOIds: ['clo-biz-3'], resources: [] },
        { id: 'mod-biz-4', number: 4, title: 'Turnaround Execution & Boardroom Capstone', description: 'Implementation sequencing, change leadership, and executive defense.', durationWeeks: 4, expectedStudyHours: 30, relatedCLOIds: ['clo-biz-4'], resources: [] },
      ],
      mlos: [],
      lessons: [],
      activities: [],
      assessments: [
        { id: 'asmt-biz-1', name: 'Strategic Concepts & Frameworks Quiz', type: 'Quiz', linkedCLOIds: ['clo-biz-1'], linkedMLOIds: [], bloomLevel: 'Understand', evidenceType: 'Direct', marks: 20, weightage: 15, achievementThreshold: 65, isSummative: false, directOrIndirect: 'Direct', questions: [] },
        { id: 'asmt-biz-2', name: 'Competitor & Value Chain Analysis Brief', type: 'Assignment', linkedCLOIds: ['clo-biz-1'], linkedMLOIds: [], bloomLevel: 'Analyze', evidenceType: 'Direct', marks: 40, weightage: 20, achievementThreshold: 65, isSummative: true, directOrIndirect: 'Direct', questions: [] },
        { id: 'asmt-biz-3', name: 'Financial Valuation & Capital Model', type: 'Project', linkedCLOIds: ['clo-biz-2'], linkedMLOIds: [], bloomLevel: 'Apply', evidenceType: 'Direct', marks: 50, weightage: 25, achievementThreshold: 70, isSummative: true, directOrIndirect: 'Direct', questions: [] },
        { id: 'asmt-biz-4', name: 'Capstone Corporate Strategy Boardroom Pitch', type: 'Project', linkedCLOIds: ['clo-biz-4', 'clo-biz-3'], linkedMLOIds: [], bloomLevel: 'Create', evidenceType: 'Direct', marks: 100, weightage: 40, achievementThreshold: 70, isSummative: true, directOrIndirect: 'Direct', questions: [], rubricId: 'rubric-biz-capstone' },
      ],
      rubrics: [],
      evidenceRules: [],
      comments: [],
      status: 'draft',
      updatedAt: now,
      createdAt: now,
    };
  },
};

export const GALLERY_TEMPLATES: CourseTemplateGalleryItem[] = [
  TECHNICAL_AI_TEMPLATE,
  SCIENCE_BIOMEDICAL_TEMPLATE,
  HUMANITIES_LAW_TEMPLATE,
  BUSINESS_STRATEGY_TEMPLATE,
];
