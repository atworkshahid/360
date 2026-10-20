import { Course, CLO, BloomLevel, PLO, LearningDomain } from '../types';
import { BLOOM_ORDER, BLOOM_RANK } from '../utils/assessmentAnalysis';
import { INITIAL_FRAMEWORKS, getFrameworkOutcomes, getFrameworkById } from '../data/frameworksData';

export interface CognitiveGapSuggestion {
  id: string;
  type: 'add_clo' | 'elevate_bloom' | 'add_competency' | 'align_assessment';
  severity: 'critical' | 'high' | 'medium' | 'advisory';
  targetFrameworkOutcome: string; // e.g. "WA2: Complex Problem Analysis"
  title: string;
  description: string;
  deficiencyReason: string;
  currentCognitiveLevel?: BloomLevel;
  suggestedCognitiveLevel?: BloomLevel;
  suggestedBloomVerb?: string;
  suggestedCLOStatement?: string;
  suggestedCompetency?: string;
  suggestedSkills?: string;
  suggestedAssessmentMethod?: string;
  targetCLOId?: string; // If elevating an existing CLO
  suggestedWeight?: number;
  rationale: string;
  applied?: boolean;
}

export interface FrameworkBenchmarkCoverage {
  outcomeCode: string;
  outcomeTitle: string;
  outcomeDescription: string;
  requiredTier: 'HOTS' | 'MOTS' | 'LOTS';
  status: 'satisfied' | 'partial' | 'missing';
  mappedCLOCount: number;
  mappedCLOs: Array<{ cloCode: string; bloomLevel: BloomLevel; weight: number }>;
  gapNotes?: string;
}

export interface AccreditationGapAnalysisResult {
  courseTitle: string;
  courseCode: string;
  frameworkId: string;
  frameworkName: string;
  frameworkCode: string;
  complianceScore: number; // 0 to 100
  cognitiveDepthScore: number; // 0 to 100
  frameworkCoverageScore: number; // 0 to 100
  evidenceIntegrityScore: number; // 0 to 100
  executiveSummary: string;
  cognitiveTiers: {
    hots: { count: number; percentage: number; targetPercentage: number };
    mots: { count: number; percentage: number; targetPercentage: number };
    lots: { count: number; percentage: number; targetPercentage: number };
  };
  benchmarkCoverage: FrameworkBenchmarkCoverage[];
  gaps: CognitiveGapSuggestion[];
  analyzedAt: string;
  engine: 'gemini-3.8-flash' | 'algorithmic_hybrid';
}

// Standard International & National Accreditation Framework Definitions
export const STANDARD_FRAMEWORK_REQUIREMENTS: Record<
  string,
  {
    name: string;
    code: string;
    minHotsRatio: number; // Target HOTS percentage (e.g. 50%)
    outcomes: Array<{
      code: string;
      title: string;
      description: string;
      requiredTier: 'HOTS' | 'MOTS' | 'LOTS';
      coreKeywords: string[];
      sampleGapCLO: {
        verb: string;
        level: BloomLevel;
        statementTemplate: string;
        competency: string;
        assessment: string;
      };
    }>;
  }
> = {
  'fw-abet-cac': {
    name: 'ABET CAC (Computing Accreditation Commission)',
    code: 'ABET-CAC',
    minHotsRatio: 50,
    outcomes: [
      {
        code: 'SO 1',
        title: 'Complex Computing Problem Analysis',
        description: 'Analyze a complex computing problem and apply principles of computing and other relevant disciplines to identify solutions.',
        requiredTier: 'HOTS',
        coreKeywords: ['analyze', 'solve', 'problem', 'algorithm', 'evaluate', 'complexity'],
        sampleGapCLO: {
          verb: 'Analyze',
          level: 'Analyze',
          statementTemplate: 'Analyze complex algorithmic and computational problems to formulate mathematically sound, scalable solutions.',
          competency: 'Complex Computing Problem Solving',
          assessment: 'Algorithmic Complexity & Solution Architecture Milestone',
        },
      },
      {
        code: 'SO 2',
        title: 'Design, Implementation & Evaluation',
        description: 'Design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program’s discipline.',
        requiredTier: 'HOTS',
        coreKeywords: ['design', 'implement', 'evaluate', 'system', 'architecture', 'develop'],
        sampleGapCLO: {
          verb: 'Design',
          level: 'Create',
          statementTemplate: 'Design, construct, and empirically evaluate a computing system meeting rigorous performance and reliability constraints.',
          competency: 'System Architecture & Software Engineering',
          assessment: 'Capstone Production-Ready Software Project & Peer Code Review',
        },
      },
      {
        code: 'SO 3',
        title: 'Professional Communication',
        description: 'Communicate effectively in a variety of professional contexts.',
        requiredTier: 'MOTS',
        coreKeywords: ['communicate', 'present', 'write', 'document', 'report', 'articulate'],
        sampleGapCLO: {
          verb: 'Articulate',
          level: 'Apply',
          statementTemplate: 'Articulate technical system specifications, design decisions, and empirical findings through professional oral and written briefs.',
          competency: 'Technical Communication & Dissemination',
          assessment: 'Design Specification Defense & Technical Documentation Rubric',
        },
      },
      {
        code: 'SO 4',
        title: 'Ethics, Law & Professional Responsibility',
        description: 'Recognize professional responsibilities and make informed judgments in computing practice based on legal, ethical, and societal principles.',
        requiredTier: 'HOTS',
        coreKeywords: ['ethics', 'ethical', 'legal', 'responsibility', 'privacy', 'security', 'impact'],
        sampleGapCLO: {
          verb: 'Evaluate',
          level: 'Evaluate',
          statementTemplate: 'Evaluate the ethical, privacy, cybersecurity, and societal implications of computing solutions adhering to professional codes of conduct.',
          competency: 'Ethical & Legal Technological Stewardship',
          assessment: 'Ethical Impact Case Study & Responsible AI/Security Audit',
        },
      },
      {
        code: 'SO 5',
        title: 'Multidisciplinary Team Collaboration',
        description: 'Function effectively as a member or leader of a team engaged in activities appropriate to the program’s discipline.',
        requiredTier: 'MOTS',
        coreKeywords: ['team', 'collaborate', 'lead', 'coordinate', 'multidisciplinary', 'group'],
        sampleGapCLO: {
          verb: 'Collaborate',
          level: 'Apply',
          statementTemplate: 'Collaborate within multidisciplinary engineering squads utilizing agile workflows, continuous integration, and version-controlled review.',
          competency: 'Collaborative Agile Teamwork',
          assessment: 'Sprint Retrospective & Team Contribution Rubric',
        },
      },
      {
        code: 'SO 6',
        title: 'Domain Theory & Algorithmic Foundations',
        description: 'Apply computer science theory and software development fundamentals to produce computing-based solutions.',
        requiredTier: 'HOTS',
        coreKeywords: ['theory', 'formal', 'discrete', 'mathematics', 'models', 'algorithms'],
        sampleGapCLO: {
          verb: 'Apply',
          level: 'Apply',
          statementTemplate: 'Apply foundational computing theories, discrete structures, and algorithmic models to prove system correctness and optimize throughput.',
          competency: 'Theoretical Computer Science Foundations',
          assessment: 'Formal Proofs & Empirical Performance Benchmarking Exam',
        },
      },
    ],
  },
  'fw-washington-accord': {
    name: 'Washington Accord (IEA Graduate Attributes)',
    code: 'WA-ENG',
    minHotsRatio: 55,
    outcomes: [
      {
        code: 'WA 1',
        title: 'Engineering Knowledge',
        description: 'Apply knowledge of mathematics, natural science, computing, and engineering fundamentals to complex engineering problems.',
        requiredTier: 'MOTS',
        coreKeywords: ['knowledge', 'fundamentals', 'math', 'science', 'principles'],
        sampleGapCLO: {
          verb: 'Apply',
          level: 'Apply',
          statementTemplate: 'Apply core scientific principles and quantitative models to investigate fundamental engineering phenomena.',
          competency: 'Engineering Sciences & Mathematical Foundations',
          assessment: 'Analytical Problem-Solving Exam',
        },
      },
      {
        code: 'WA 2',
        title: 'Complex Problem Analysis (CEP)',
        description: 'Identify, formulate, research literature, and analyze complex engineering problems reaching substantiated conclusions.',
        requiredTier: 'HOTS',
        coreKeywords: ['analyze', 'complex', 'formulate', 'investigate', 'research'],
        sampleGapCLO: {
          verb: 'Analyze',
          level: 'Analyze',
          statementTemplate: 'Formulate and analyze complex ill-defined engineering problems by synthesizing multidisciplinary technical literature.',
          competency: 'Complex Problem Solving & Analysis',
          assessment: 'Diagnostic Investigation & Research Dossier',
        },
      },
      {
        code: 'WA 3',
        title: 'Design/Development of Solutions',
        description: 'Design solutions for complex engineering problems and design systems, components or processes that meet specified needs.',
        requiredTier: 'HOTS',
        coreKeywords: ['design', 'develop', 'create', 'prototype', 'synthesize', 'optimize'],
        sampleGapCLO: {
          verb: 'Synthesize',
          level: 'Create',
          statementTemplate: 'Design and synthesize comprehensive engineering architectures that satisfy functional, economic, and safety constraints.',
          competency: 'Engineering Design & Synthesis',
          assessment: 'Comprehensive Design Portfolio & Prototype Demo',
        },
      },
      {
        code: 'WA 5',
        title: 'Modern Tool Usage',
        description: 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools.',
        requiredTier: 'MOTS',
        coreKeywords: ['tool', 'simulation', 'cad', 'software', 'modeling', 'modern'],
        sampleGapCLO: {
          verb: 'Employ',
          level: 'Apply',
          statementTemplate: 'Employ industry-standard simulation and automated testing frameworks to model and validate system behaviors under stress.',
          competency: 'Modern Tool Competence',
          assessment: 'Laboratory Practical Tool Examination',
        },
      },
      {
        code: 'WA 7',
        title: 'Environment & Sustainability',
        description: 'Understand and evaluate the sustainability and environmental impact of professional engineering work.',
        requiredTier: 'HOTS',
        coreKeywords: ['sustainability', 'environment', 'green', 'carbon', 'lifecycle', 'ecological'],
        sampleGapCLO: {
          verb: 'Evaluate',
          level: 'Evaluate',
          statementTemplate: 'Evaluate the environmental lifecycle impact and energy sustainability of engineering systems using quantitative green metrics.',
          competency: 'Sustainable Engineering & Environmental Stewardship',
          assessment: 'Sustainability Audit & Lifecycle Assessment (LCA) Report',
        },
      },
      {
        code: 'WA 8',
        title: 'Ethics & Professionalism',
        description: 'Apply ethical principles and commit to professional ethics, responsibilities, and norms of engineering practice.',
        requiredTier: 'HOTS',
        coreKeywords: ['ethics', 'ethical', 'integrity', 'responsibility', 'professionalism'],
        sampleGapCLO: {
          verb: 'Assess',
          level: 'Evaluate',
          statementTemplate: 'Assess professional dilemmas and apply statutory ethics frameworks to ensure safety, integrity, and regulatory compliance.',
          competency: 'Professional Ethics & Governance',
          assessment: 'Professional Practice Ethical Simulation',
        },
      },
      {
        code: 'WA 12',
        title: 'Life-long Learning',
        description: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in emerging technologies.',
        requiredTier: 'HOTS',
        coreKeywords: ['lifelong', 'autonomous', 'independent', 'emerging', 'self-directed'],
        sampleGapCLO: {
          verb: 'Investigate',
          level: 'Analyze',
          statementTemplate: 'Independently investigate, assimilate, and evaluate emerging technologies and technical literature to solve novel challenges.',
          competency: 'Autonomous Lifelong Inquiry',
          assessment: 'Independent Technical Monograph & Literature Synthesis',
        },
      },
    ],
  },
  'fw-abet-eac': {
    name: 'ABET EAC (Engineering Accreditation Commission)',
    code: 'ABET-EAC',
    minHotsRatio: 55,
    outcomes: [
      {
        code: 'SO 1',
        title: 'Engineering Problem Solving',
        description: 'An ability to identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics.',
        requiredTier: 'HOTS',
        coreKeywords: ['solve', 'formulate', 'analyze', 'complex', 'math', 'science'],
        sampleGapCLO: {
          verb: 'Formulate',
          level: 'Analyze',
          statementTemplate: 'Formulate and solve complex engineering problems through mathematical modeling and first-principles scientific inquiry.',
          competency: 'Complex Engineering Analysis',
          assessment: 'Summative Problem-Solving Diagnostic Examination',
        },
      },
      {
        code: 'SO 2',
        title: 'Engineering Design',
        description: 'An ability to apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare.',
        requiredTier: 'HOTS',
        coreKeywords: ['design', 'safety', 'welfare', 'public health', 'create'],
        sampleGapCLO: {
          verb: 'Create',
          level: 'Create',
          statementTemplate: 'Create validated engineering designs that strictly prioritize public health, safety, and operational resilience.',
          competency: 'Public Safety & Engineering Design',
          assessment: 'Design Review & Formal Verification Defense',
        },
      },
      {
        code: 'SO 4',
        title: 'Ethical & Professional Responsibility',
        description: 'An ability to recognize ethical and professional responsibilities in engineering situations and make informed judgments.',
        requiredTier: 'HOTS',
        coreKeywords: ['ethics', 'ethical', 'responsibility', 'global', 'societal'],
        sampleGapCLO: {
          verb: 'Evaluate',
          level: 'Evaluate',
          statementTemplate: 'Evaluate engineering decisions against ethical, statutory, and societal impacts in real-world professional contexts.',
          competency: 'Ethical & Societal Judgment',
          assessment: 'Ethical Dilemma Case Study & Decision Defense',
        },
      },
      {
        code: 'SO 6',
        title: 'Experimentation & Data Analysis',
        description: 'An ability to develop and conduct appropriate experimentation, analyze and interpret data, and use engineering judgment to draw conclusions.',
        requiredTier: 'HOTS',
        coreKeywords: ['experiment', 'data', 'laboratory', 'interpret', 'empirical'],
        sampleGapCLO: {
          verb: 'Interpret',
          level: 'Analyze',
          statementTemplate: 'Design rigorous empirical experiments, analyze multivariate measurement datasets, and draw validated conclusions.',
          competency: 'Empirical Data Analysis & Experimentation',
          assessment: 'Laboratory Experimental Monograph & Statistical Report',
        },
      },
    ],
  },
  'fw-hec-pakistan': {
    name: 'Higher Education Commission (HEC) National OBE Framework',
    code: 'HEC-PK',
    minHotsRatio: 45,
    outcomes: [
      {
        code: 'PLO 1',
        title: 'Academic & Disciplinary Knowledge',
        description: 'Comprehensive understanding of core concepts, mathematical principles, and theoretical frameworks.',
        requiredTier: 'MOTS',
        coreKeywords: ['knowledge', 'concepts', 'principles', 'theory'],
        sampleGapCLO: {
          verb: 'Apply',
          level: 'Apply',
          statementTemplate: 'Apply foundational concepts and disciplinary theories to analyze structured technical scenarios.',
          competency: 'Core Disciplinary Knowledge',
          assessment: 'Midterm Examination',
        },
      },
      {
        code: 'PLO 2',
        title: 'Cognitive Problem Analysis',
        description: 'Ability to critically analyze ill-structured problems and design validated solutions.',
        requiredTier: 'HOTS',
        coreKeywords: ['analyze', 'critical', 'investigate', 'solve'],
        sampleGapCLO: {
          verb: 'Analyze',
          level: 'Analyze',
          statementTemplate: 'Analyze ill-structured computing challenges to synthesize validated, reproducible solutions.',
          competency: 'Critical Problem Solving',
          assessment: 'Analytical Problem Set',
        },
      },
      {
        code: 'PLO 4',
        title: 'Ethical & Societal Consciousness',
        description: 'Commitment to professional integrity, ethical conduct, safety, and sustainable societal development.',
        requiredTier: 'HOTS',
        coreKeywords: ['ethical', 'society', 'integrity', 'sustainable', 'values'],
        sampleGapCLO: {
          verb: 'Evaluate',
          level: 'Evaluate',
          statementTemplate: 'Evaluate the ethical, societal, and environmental consequences of technological solutions in professional practice.',
          competency: 'Ethical Conduct & Social Responsibility',
          assessment: 'Societal & Ethical Assessment Report',
        },
      },
    ],
  },
};

function resolveFrameworkRequirements(fId: string) {
  if (STANDARD_FRAMEWORK_REQUIREMENTS[fId]) {
    return STANDARD_FRAMEWORK_REQUIREMENTS[fId];
  }
  const fw = getFrameworkById(fId);
  const outcomes = getFrameworkOutcomes(fId);
  return {
    name: fw.name,
    code: fw.code,
    minHotsRatio: 45,
    outcomes: outcomes.map((o, idx) => {
      const keywords = [
        o.code.toLowerCase(),
        ...o.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
      ];
      const isHots =
        idx < 2 ||
        o.title.toLowerCase().includes('analy') ||
        o.title.toLowerCase().includes('design') ||
        o.title.toLowerCase().includes('evaluat') ||
        o.title.toLowerCase().includes('strateg') ||
        o.title.toLowerCase().includes('research');
      return {
        code: o.code,
        title: o.title,
        description: o.description,
        requiredTier: (isHots ? 'HOTS' : 'MOTS') as 'HOTS' | 'MOTS' | 'LOTS',
        coreKeywords: keywords,
        sampleGapCLO: {
          verb: isHots ? 'Analyze' : 'Demonstrate',
          level: (isHots ? 'Analyze' : 'Apply') as BloomLevel,
          statementTemplate: `${isHots ? 'Analyze and formulate solutions for' : 'Demonstrate structured mastery in'} ${o.title.toLowerCase()} aligned with ${fw.code} criteria.`,
          competency: o.title,
          assessment: `${o.title} Direct Evidence Assessment`,
        },
      };
    }),
  };
}

export class AccreditationGapAnalyzerService {
  /**
   * Deterministic local analysis engine that compares course data against target framework requirements.
   */
  public static analyzeLocally(
    course: Course,
    targetFrameworkId?: string
  ): AccreditationGapAnalysisResult {
    const fId = targetFrameworkId || course.frameworkId || 'fw-abet-cac';
    const frameworkMeta = resolveFrameworkRequirements(fId);

    const clos = course.clos || [];
    const assessments = course.assessments || [];
    const targetCompetencies = course.blueprint?.targetCompetencies || [];

    // 1. Calculate Bloom cognitive tiers distribution
    let hotsCount = 0;
    let motsCount = 0;
    let lotsCount = 0;

    clos.forEach((c) => {
      const rank = BLOOM_RANK[c.bloomLevel] || 3;
      if (rank >= 5) {
        hotsCount++;
      } else if (rank >= 3) {
        motsCount++;
      } else {
        lotsCount++;
      }
    });

    const totalCLOs = Math.max(clos.length, 1);
    const hotsPct = Math.round((hotsCount / totalCLOs) * 100);
    const motsPct = Math.round((motsCount / totalCLOs) * 100);
    const lotsPct = Math.round((lotsCount / totalCLOs) * 100);

    // 2. Evaluate framework outcome coverage
    const benchmarkCoverage: FrameworkBenchmarkCoverage[] = [];
    const gaps: CognitiveGapSuggestion[] = [];

    let satisfiedOutcomeCount = 0;

    frameworkMeta.outcomes.forEach((stdOut) => {
      // Find matching CLOs by keywords, mapped PLOs, or competency text
      const matchedCLOs: Array<{ cloCode: string; bloomLevel: BloomLevel; weight: number }> = [];

      clos.forEach((c) => {
        const textToSearch = `${c.statement} ${c.competency || ''} ${c.skills || ''} ${c.bloomVerb || ''}`.toLowerCase();
        const hasKeywordMatch = stdOut.coreKeywords.some((kw) => textToSearch.includes(kw));
        const hasDirectPLOMatch = (c.mappedPLOs || []).some(
          (m) =>
            m.ploId.toLowerCase().includes(stdOut.code.toLowerCase()) ||
            m.ploId.toLowerCase().includes(stdOut.title.toLowerCase())
        );

        if (hasKeywordMatch || hasDirectPLOMatch) {
          matchedCLOs.push({
            cloCode: c.code,
            bloomLevel: c.bloomLevel,
            weight: c.weightage || 20,
          });
        }
      });

      // Assess status
      let status: 'satisfied' | 'partial' | 'missing' = 'missing';
      let gapNotes: string | undefined = undefined;

      if (matchedCLOs.length > 0) {
        // Check if cognitive level satisfies required tier
        const maxRank = Math.max(...matchedCLOs.map((m) => BLOOM_RANK[m.bloomLevel] || 1));
        const satisfiesTier =
          stdOut.requiredTier === 'HOTS' ? maxRank >= 5 : stdOut.requiredTier === 'MOTS' ? maxRank >= 3 : true;

        if (satisfiesTier) {
          status = 'satisfied';
          satisfiedOutcomeCount++;
        } else {
          status = 'partial';
          gapNotes = `Outcomes touch this area but fail the ${stdOut.requiredTier} cognitive requirement (highest reached: L${maxRank}).`;
          satisfiedOutcomeCount += 0.5;

          // Generate Bloom Elevation suggestion
          const targetCLO = clos.find((c) => matchedCLOs.some((m) => m.cloCode === c.code));
          if (targetCLO) {
            gaps.push({
              id: `gap-elevate-${stdOut.code.toLowerCase().replace(/\s+/g, '-')}`,
              type: 'elevate_bloom',
              severity: 'high',
              targetFrameworkOutcome: `${stdOut.code}: ${stdOut.title}`,
              title: `Elevate ${targetCLO.code} to Higher-Order Cognitive Level (${stdOut.requiredTier})`,
              description: `Upgrade cognitive intensity from L${BLOOM_RANK[targetCLO.bloomLevel]} ${targetCLO.bloomLevel} to ${stdOut.sampleGapCLO.level} to satisfy ${stdOut.code}.`,
              deficiencyReason: `${frameworkMeta.name} mandates that students demonstrate ${stdOut.requiredTier} competency in ${stdOut.title}, but ${targetCLO.code} currently stops at ${targetCLO.bloomLevel}.`,
              currentCognitiveLevel: targetCLO.bloomLevel,
              suggestedCognitiveLevel: stdOut.sampleGapCLO.level,
              suggestedBloomVerb: stdOut.sampleGapCLO.verb,
              suggestedCLOStatement: `${stdOut.sampleGapCLO.verb} ${targetCLO.statement.replace(/^(Understand|Describe|Recall|Identify|Know)\s+/i, '')}`,
              targetCLOId: targetCLO.id,
              rationale: `Elevates student demonstration from passive comprehension to accredited performance evidence.`,
            });
          }
        }
      } else {
        status = 'missing';
        gapNotes = `No Course Learning Outcome maps to this required graduate attribute.`;

        // Generate Add CLO suggestion
        const nextCLONum = clos.length + gaps.filter((g) => g.type === 'add_clo').length + 1;
        gaps.push({
          id: `gap-add-${stdOut.code.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'add_clo',
          severity: stdOut.requiredTier === 'HOTS' ? 'critical' : 'high',
          targetFrameworkOutcome: `${stdOut.code}: ${stdOut.title}`,
          title: `Add Gap-Filling Outcome for ${stdOut.code} (${stdOut.title})`,
          description: `Introduce a new Course Learning Outcome specifically addressing ${stdOut.title}.`,
          deficiencyReason: `Complete omission of ${stdOut.code} will trigger an accreditation audit deficiency under Criterion 3.`,
          suggestedCognitiveLevel: stdOut.sampleGapCLO.level,
          suggestedBloomVerb: stdOut.sampleGapCLO.verb,
          suggestedCLOStatement: stdOut.sampleGapCLO.statementTemplate,
          suggestedCompetency: stdOut.sampleGapCLO.competency,
          suggestedAssessmentMethod: stdOut.sampleGapCLO.assessment,
          suggestedWeight: 15,
          rationale: `Provides direct constructive alignment evidence for accreditation reviewers.`,
        });
      }

      benchmarkCoverage.push({
        outcomeCode: stdOut.code,
        outcomeTitle: stdOut.title,
        outcomeDescription: stdOut.description,
        requiredTier: stdOut.requiredTier,
        status,
        mappedCLOCount: matchedCLOs.length,
        mappedCLOs: matchedCLOs,
        gapNotes,
      });
    });

    // 3. Cognitive Balance Check
    if (hotsPct < frameworkMeta.minHotsRatio) {
      gaps.push({
        id: 'gap-hots-deficit',
        type: 'elevate_bloom',
        severity: 'critical',
        targetFrameworkOutcome: 'Curriculum Cognitive Balance',
        title: `HOTS Cognitive Deficit: Current ${hotsPct}% vs Recommended ≥${frameworkMeta.minHotsRatio}%`,
        description: `Higher-Order Thinking Skills (Analyze, Evaluate, Create) represent only ${hotsPct}% of course outcomes.`,
        deficiencyReason: `${frameworkMeta.name} programs must demonstrate rigorous problem formulation and critical synthesis.`,
        rationale: `Ensure at least half of course outcomes require demonstrable synthesis or critique.`,
      });
    }

    // 4. Assessment Evidence Coverage Check
    const unassessedCLOs = clos.filter(
      (c) =>
        !assessments.some((a) => (a.linkedCLOIds || []).includes(c.id) || (a.cloIds || []).includes(c.id))
    );

    if (unassessedCLOs.length > 0) {
      gaps.push({
        id: 'gap-unassessed-evidence',
        type: 'align_assessment',
        severity: 'high',
        targetFrameworkOutcome: 'Direct Assessment Evidence',
        title: `${unassessedCLOs.length} Outcome(s) Lack Direct Summative Assessment Evidence`,
        description: `Outcomes [${unassessedCLOs.map((c) => c.code).join(', ')}] are not linked to any rubric or summative instrument.`,
        deficiencyReason: `Accreditation auditors require verified direct student work samples for every published course outcome.`,
        rationale: `Link each unassessed outcome to an authentic midterm, project, or lab exam milestone.`,
      });
    }

    // 5. Calculate scores
    const frameworkCoverageScore = Math.min(
      100,
      Math.round((satisfiedOutcomeCount / frameworkMeta.outcomes.length) * 100)
    );

    const cognitiveDepthScore = Math.min(
      100,
      Math.round((hotsPct / frameworkMeta.minHotsRatio) * 100)
    );

    const evidenceIntegrityScore = Math.round(
      ((totalCLOs - unassessedCLOs.length) / totalCLOs) * 100
    );

    const complianceScore = Math.round(
      frameworkCoverageScore * 0.45 + cognitiveDepthScore * 0.35 + evidenceIntegrityScore * 0.2
    );

    // 6. Generate Executive Summary
    const executiveSummary =
      complianceScore >= 85
        ? `The course demonstrates exemplary constructive alignment with ${frameworkMeta.name} requirements. Cognitive progression is well scaffolded across ${totalCLOs} outcomes, with ${hotsPct}% dedicated to Higher-Order Thinking Skills.`
        : complianceScore >= 65
        ? `The course partially satisfies ${frameworkMeta.name} standards (${complianceScore}% compliance). ${gaps.length} actionable cognitive gaps were identified, primarily regarding missing coverage for ${gaps
            .slice(0, 2)
            .map((g) => g.targetFrameworkOutcome)
            .join(', ')}.`
        : `Critical accreditation gaps detected (${complianceScore}% compliance against ${frameworkMeta.name}). The course exhibits substantial cognitive deficits (only ${hotsPct}% HOTS vs ≥${frameworkMeta.minHotsRatio}% required) and lacks coverage across several core graduate attributes. Immediate remediation recommended.`;

    return {
      courseTitle: course.title,
      courseCode: course.code,
      frameworkId: fId,
      frameworkName: frameworkMeta.name,
      frameworkCode: frameworkMeta.code,
      complianceScore,
      cognitiveDepthScore,
      frameworkCoverageScore,
      evidenceIntegrityScore,
      executiveSummary,
      cognitiveTiers: {
        hots: { count: hotsCount, percentage: hotsPct, targetPercentage: frameworkMeta.minHotsRatio },
        mots: { count: motsCount, percentage: motsPct, targetPercentage: 35 },
        lots: { count: lotsCount, percentage: lotsPct, targetPercentage: 15 },
      },
      benchmarkCoverage,
      gaps,
      analyzedAt: new Date().toISOString(),
      engine: 'algorithmic_hybrid',
    };
  }

  /**
   * AI-Enhanced Analysis using backend Gemini API with deterministic fallback.
   */
  public static async analyzeWithAI(
    course: Course,
    targetFrameworkId?: string
  ): Promise<AccreditationGapAnalysisResult> {
    const localResult = this.analyzeLocally(course, targetFrameworkId);

    try {
      const response = await fetch('/api/ai/accreditation-gap-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course,
          targetFrameworkId: targetFrameworkId || course.frameworkId || 'fw-abet-cac',
          localAnalysis: localResult,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.gaps && Array.isArray(data.gaps)) {
          return {
            ...localResult,
            complianceScore: data.complianceScore ?? localResult.complianceScore,
            cognitiveDepthScore: data.cognitiveDepthScore ?? localResult.cognitiveDepthScore,
            frameworkCoverageScore: data.frameworkCoverageScore ?? localResult.frameworkCoverageScore,
            executiveSummary: data.executiveSummary || localResult.executiveSummary,
            gaps: data.gaps.length > 0 ? data.gaps : localResult.gaps,
            engine: 'gemini-3.8-flash',
          };
        }
      }
    } catch (err) {
      console.warn('AI Gap Analyzer backend call bypassed, using high-fidelity local engine:', err);
    }

    return localResult;
  }

  /**
   * Applies an individual actionable suggestion directly to the course state.
   */
  public static applyGapSuggestion(
    course: Course,
    suggestion: CognitiveGapSuggestion
  ): Course {
    let updatedCLOs = [...(course.clos || [])];
    let updatedBlueprint = { ...course.blueprint };

    if (suggestion.type === 'add_clo') {
      const newCLO: CLO = {
        id: `clo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code: `CLO ${updatedCLOs.length + 1}`,
        statement:
          suggestion.suggestedCLOStatement ||
          `${suggestion.suggestedBloomVerb || 'Analyze'} core principles aligned with ${suggestion.targetFrameworkOutcome}.`,
        bloomVerb: suggestion.suggestedBloomVerb || 'Analyze',
        bloomLevel: suggestion.suggestedCognitiveLevel || 'Analyze',
        learningDomain: 'Cognitive',
        competency: suggestion.suggestedCompetency || suggestion.targetFrameworkOutcome,
        skills: suggestion.suggestedSkills || 'Analytical Problem Solving, Systems Evaluation',
        assessmentMethod:
          suggestion.suggestedAssessmentMethod || 'Authentic Direct Project & Rubric Assessment',
        achievementThreshold: 65,
        weightage: suggestion.suggestedWeight || 15,
        status: 'Validated',
        qualityScore: 92,
        qualityChecks: [
          { label: 'Accreditation Gap Remediation', passed: true, detail: 'AI generated to fill framework compliance gap' },
        ],
        mappedPLOs: [],
      };

      updatedCLOs.push(newCLO);

      // Add target competency if not present
      if (
        suggestion.suggestedCompetency &&
        !updatedBlueprint.targetCompetencies?.includes(suggestion.suggestedCompetency)
      ) {
        updatedBlueprint.targetCompetencies = [
          ...(updatedBlueprint.targetCompetencies || []),
          suggestion.suggestedCompetency,
        ];
      }
    } else if (suggestion.type === 'elevate_bloom' && suggestion.targetCLOId) {
      updatedCLOs = updatedCLOs.map((c) => {
        if (c.id !== suggestion.targetCLOId) return c;
        return {
          ...c,
          bloomLevel: suggestion.suggestedCognitiveLevel || 'Analyze',
          bloomVerb: suggestion.suggestedBloomVerb || c.bloomVerb,
          statement: suggestion.suggestedCLOStatement || c.statement,
        };
      });
    } else if (suggestion.type === 'add_competency' && suggestion.suggestedCompetency) {
      if (!updatedBlueprint.targetCompetencies?.includes(suggestion.suggestedCompetency)) {
        updatedBlueprint.targetCompetencies = [
          ...(updatedBlueprint.targetCompetencies || []),
          suggestion.suggestedCompetency,
        ];
      }
    }

    return {
      ...course,
      clos: updatedCLOs,
      blueprint: updatedBlueprint,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Applies all actionable suggestions to rapidly remediate all gaps.
   */
  public static applyAllGapSuggestions(
    course: Course,
    suggestions: CognitiveGapSuggestion[]
  ): Course {
    let currentCourse = course;
    suggestions.forEach((sug) => {
      currentCourse = this.applyGapSuggestion(currentCourse, sug);
    });
    return currentCourse;
  }
}
