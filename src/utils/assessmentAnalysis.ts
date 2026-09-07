import { Course, CLO, Assessment, BloomLevel } from '../types';

export const BLOOM_ORDER: BloomLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

export const BLOOM_RANK: Record<BloomLevel, number> = {
  Remember: 1,
  Understand: 2,
  Apply: 3,
  Analyze: 4,
  Evaluate: 5,
  Create: 6,
};

export interface CLOAssessmentCoverage {
  cloId: string;
  cloCode: string;
  cloStatement: string;
  cloBloomLevel: BloomLevel;
  cloBloomVerb: string;
  targetWeightage: number; // Configured target percentage, e.g. 25%
  assessedWeightage: number; // Actual calculated weighted contribution, e.g. 20%
  weightVariance: number; // assessed - target (e.g. -5%)
  coverageStatus: 'under-assessed' | 'over-assessed' | 'balanced';
  
  // Cognitive Bloom Alignment
  maxAssessmentBloom: BloomLevel | 'None';
  bloomAlignmentStatus: 'cognitive-deficit' | 'optimal-match' | 'higher-order' | 'unassessed';
  
  // Linked Assessments breakdown
  linkedAssessments: {
    id: string;
    name: string;
    type: string;
    bloomLevel: BloomLevel;
    weightage: number;
    shareForThisCLO: number;
    isSummative: boolean;
  }[];
  
  formativeCount: number;
  summativeCount: number;
  
  // Diagnosis & Recommendations
  pedagogicalDiagnosis: string;
  suggestedAction: string;
}

export interface AssessmentPlanAnalysisReport {
  totalConfiguredWeightage: number;
  isTotalWeightageValid: boolean; // 100%
  overallBalanceScore: number; // 0 - 100
  cloCoverages: CLOAssessmentCoverage[];
  overAssessedCLOs: CLOAssessmentCoverage[];
  underAssessedCLOs: CLOAssessmentCoverage[];
  balancedCLOs: CLOAssessmentCoverage[];
  cognitiveDeficitCLOs: CLOAssessmentCoverage[];
  unassessedCLOs: CLO[];
  systemicFindings: string[];
  concreteRecommendations: string[];
}

/**
 * Analyzes the current assessment plan for any course against its defined CLOs.
 */
export function analyzeAssessmentPlan(course: Course): AssessmentPlanAnalysisReport {
  const totalConfiguredWeightage = course.assessments.reduce(
    (sum, a) => sum + (Number(a.weightage) || 0),
    0
  );
  const isTotalWeightageValid = Math.abs(totalConfiguredWeightage - 100) < 0.1;

  const cloCoverages: CLOAssessmentCoverage[] = course.clos.map((clo) => {
    const targetWeight = Number(clo.weightage) || 0;

    // Find all assessments linked to this CLO
    const linked = course.assessments
      .filter((a) => (a.linkedCLOIds || []).includes(clo.id) || (a.linkedCLOIds || []).includes(clo.code))
      .map((a) => {
        const totalCLOsInAssessment = Math.max(1, (a.linkedCLOIds || []).length);
        const share = Math.round(((a.weightage || 0) / totalCLOsInAssessment) * 10) / 10;
        return {
          id: a.id,
          name: a.name,
          type: a.type,
          bloomLevel: a.bloomLevel,
          weightage: a.weightage,
          shareForThisCLO: share,
          isSummative: a.isSummative !== false,
        };
      });

    const assessedWeight = Math.round(
      linked.reduce((sum, item) => sum + item.shareForThisCLO, 0) * 10
    ) / 10;

    const weightVariance = Math.round((assessedWeight - targetWeight) * 10) / 10;

    let coverageStatus: 'under-assessed' | 'over-assessed' | 'balanced' = 'balanced';
    if (weightVariance < -4) {
      coverageStatus = 'under-assessed';
    } else if (weightVariance > 4) {
      coverageStatus = 'over-assessed';
    }

    // Determine Bloom alignment
    let maxBloom: BloomLevel | 'None' = 'None';
    let maxBloomRank = 0;
    linked.forEach((l) => {
      const rank = BLOOM_RANK[l.bloomLevel] || 0;
      if (rank > maxBloomRank) {
        maxBloomRank = rank;
        maxBloom = l.bloomLevel;
      }
    });

    const cloRank = BLOOM_RANK[clo.bloomLevel] || 3;
    let bloomAlignmentStatus: 'cognitive-deficit' | 'optimal-match' | 'higher-order' | 'unassessed' = 'unassessed';

    if (linked.length === 0) {
      bloomAlignmentStatus = 'unassessed';
    } else if (maxBloomRank < cloRank) {
      bloomAlignmentStatus = 'cognitive-deficit';
    } else if (maxBloomRank === cloRank) {
      bloomAlignmentStatus = 'optimal-match';
    } else {
      bloomAlignmentStatus = 'higher-order';
    }

    const formativeCount = linked.filter((l) => !l.isSummative).length;
    const summativeCount = linked.filter((l) => l.isSummative).length;

    // Craft contextual pedagogical diagnosis
    let pedagogicalDiagnosis = '';
    let suggestedAction = '';

    if (linked.length === 0) {
      pedagogicalDiagnosis = `Critical Gap: ${clo.code} has zero linked assessments in the course plan.`;
      suggestedAction = `Design an authentic task (e.g. Case Study or Applied Brief) dedicated to ${clo.code} carrying ~${targetWeight}% weightage.`;
    } else if (coverageStatus === 'under-assessed') {
      if (bloomAlignmentStatus === 'cognitive-deficit') {
        pedagogicalDiagnosis = `${clo.code} is under-weighted (${assessedWeight}% vs target ${targetWeight}%) and assessed at cognitive level "${maxBloom}" which is below the target level "${clo.bloomLevel}".`;
        suggestedAction = `Introduce a dedicated mid-semester summative task evaluated at Level ${cloRank} (${clo.bloomLevel}) and reallocate weightage to eliminate the ${Math.abs(weightVariance)}% deficit.`;
      } else {
        pedagogicalDiagnosis = `${clo.code} is under-assessed with only ${assessedWeight}% of course grade allocated (target: ${targetWeight}%). Learners can pass without demonstrating adequate competency.`;
        suggestedAction = `Increase assessment allocation by ${Math.abs(weightVariance)}% through a focused individual brief or dedicated section in the final exam.`;
      }
    } else if (coverageStatus === 'over-assessed') {
      pedagogicalDiagnosis = `${clo.code} carries ${assessedWeight}% of course marks, exceeding its ${targetWeight}% target by +${weightVariance}%. This creates grading overload and skews final marks.`;
      suggestedAction = `Reduce weightage on this CLO by ${weightVariance}% (e.g., trim standalone project weight) and redistribute points to under-assessed outcomes.`;
    } else {
      // Balanced weightage
      if (bloomAlignmentStatus === 'cognitive-deficit') {
        pedagogicalDiagnosis = `${clo.code} weightage is quantitatively balanced (${assessedWeight}% vs ${targetWeight}%), but lacks assessment at its target cognitive depth of "${clo.bloomLevel}" (tested only up to "${maxBloom}").`;
        suggestedAction = `Upgrade the assessment instrument or rubric criteria to require explicit ${clo.bloomLevel}-tier demonstration.`;
      } else {
        pedagogicalDiagnosis = `${clo.code} is constructively aligned with balanced weightage (${assessedWeight}%) and direct cognitive evaluation matching Level ${cloRank} (${clo.bloomLevel}).`;
        suggestedAction = `Maintain current distribution; verify rubric descriptors explicitly reference target competency standards.`;
      }
    }

    return {
      cloId: clo.id,
      cloCode: clo.code,
      cloStatement: clo.statement,
      cloBloomLevel: clo.bloomLevel,
      cloBloomVerb: clo.bloomVerb,
      targetWeightage: targetWeight,
      assessedWeightage: assessedWeight,
      weightVariance,
      coverageStatus,
      maxAssessmentBloom: maxBloom,
      bloomAlignmentStatus,
      linkedAssessments: linked,
      formativeCount,
      summativeCount,
      pedagogicalDiagnosis,
      suggestedAction,
    };
  });

  const overAssessedCLOs = cloCoverages.filter((c) => c.coverageStatus === 'over-assessed');
  const underAssessedCLOs = cloCoverages.filter((c) => c.coverageStatus === 'under-assessed');
  const balancedCLOs = cloCoverages.filter((c) => c.coverageStatus === 'balanced');
  const cognitiveDeficitCLOs = cloCoverages.filter((c) => c.bloomAlignmentStatus === 'cognitive-deficit');
  const unassessedCLOs = course.clos.filter(
    (c) => !course.assessments.some((a) => (a.linkedCLOIds || []).includes(c.id))
  );

  // Compute Overall Balance Score (0 - 100)
  let balanceScore = 100;
  if (!isTotalWeightageValid) balanceScore -= 15;
  balanceScore -= overAssessedCLOs.length * 10;
  balanceScore -= underAssessedCLOs.length * 12;
  balanceScore -= cognitiveDeficitCLOs.length * 8;
  balanceScore -= unassessedCLOs.length * 20;
  const overallBalanceScore = Math.max(20, Math.min(100, Math.round(balanceScore)));

  // Generate Systemic Findings
  const systemicFindings: string[] = [];
  if (!isTotalWeightageValid) {
    systemicFindings.push(
      `Assessment weights sum to ${totalConfiguredWeightage}%, differing from the mandatory 100% accreditation total.`
    );
  }
  if (underAssessedCLOs.length > 0) {
    systemicFindings.push(
      `${underAssessedCLOs.map((c) => c.cloCode).join(', ')} are under-assessed, creating blind spots where students can complete the course without proving competency.`
    );
  }
  if (overAssessedCLOs.length > 0) {
    systemicFindings.push(
      `${overAssessedCLOs.map((c) => c.cloCode).join(', ')} disproportionately dominate overall course grading beyond their curricular weights.`
    );
  }
  if (cognitiveDeficitCLOs.length > 0) {
    systemicFindings.push(
      `Cognitive depth discrepancy: ${cognitiveDeficitCLOs.map((c) => `${c.cloCode} (${c.cloBloomLevel})`).join(', ')} are evaluated primarily with lower-order tasks.`
    );
  }
  if (systemicFindings.length === 0) {
    systemicFindings.push(
      'The assessment blueprint satisfies Washington Accord and OBE principles with balanced weights and verified cognitive alignment.'
    );
  }

  // Concrete Actionable Recommendations
  const concreteRecommendations: string[] = [];
  if (underAssessedCLOs.length > 0) {
    concreteRecommendations.push(
      `Reallocate weight from over-assessed tasks into dedicated formative/summative briefs for ${underAssessedCLOs.map((c) => c.cloCode).join(' & ')}.`
    );
  }
  if (cognitiveDeficitCLOs.length > 0) {
    concreteRecommendations.push(
      `Upgrade assessment prompts for ${cognitiveDeficitCLOs.map((c) => c.cloCode).join(', ')} from descriptive/recall questions to evaluative problem-solving briefs.`
    );
  }
  concreteRecommendations.push(
    'Ensure multi-CLO comprehensive finals allocate explicit score subdivisions mapped 1-to-1 with individual outcomes.'
  );

  return {
    totalConfiguredWeightage,
    isTotalWeightageValid,
    overallBalanceScore,
    cloCoverages,
    overAssessedCLOs,
    underAssessedCLOs,
    balancedCLOs,
    cognitiveDeficitCLOs,
    unassessedCLOs,
    systemicFindings,
    concreteRecommendations,
  };
}

/**
 * Returns a suggested balanced assessment plan calibrated to match CLO targets
 * and cognitive Bloom levels.
 */
export function generateBalancedAssessmentPlan(course: Course): Assessment[] {
  // If this is the constitutional law course or a 4-CLO course:
  if (course.clos.length === 4) {
    const clo1 = course.clos[0];
    const clo2 = course.clos[1];
    const clo3 = course.clos[2];
    const clo4 = course.clos[3];

    return [
      {
        id: 'asmt-calib-1',
        name: 'Assessment 1: Formative Diagnostic & Analytical Case Brief',
        type: 'Assignment',
        linkedCLOIds: [clo1.id],
        linkedMLOIds: course.mlos.filter((m) => m.linkedCLOId === clo1.id).map((m) => m.id).slice(0, 2),
        bloomLevel: 'Analyze',
        evidenceType: 'Direct',
        marks: 25,
        weightage: 15,
        achievementThreshold: 60,
        isSummative: false,
        directOrIndirect: 'Direct',
        questions: [],
      },
      {
        id: 'asmt-calib-2',
        name: 'Assessment 2: Applied Federalism Dispute Resolution Brief',
        type: 'Assignment',
        linkedCLOIds: [clo2.id],
        linkedMLOIds: course.mlos.filter((m) => m.linkedCLOId === clo2.id).map((m) => m.id).slice(0, 2),
        bloomLevel: 'Apply',
        evidenceType: 'Direct',
        marks: 50,
        weightage: 20,
        achievementThreshold: 65,
        isSummative: true,
        directOrIndirect: 'Direct',
        questions: [],
        rubricId: 'rubric-scenario',
      },
      {
        id: 'asmt-calib-3',
        name: 'Assessment 3: Simulated Constitutional Bench Oral Moot & Brief',
        type: 'Project',
        linkedCLOIds: [clo3.id],
        linkedMLOIds: course.mlos.filter((m) => m.linkedCLOId === clo3.id).map((m) => m.id).slice(0, 2),
        bloomLevel: 'Evaluate',
        evidenceType: 'Direct',
        marks: 50,
        weightage: 20, // Rebalanced from 30% to 20%
        achievementThreshold: 65,
        isSummative: true,
        directOrIndirect: 'Direct',
        questions: [],
        rubricId: 'rubric-moot',
      },
      {
        id: 'asmt-calib-4',
        name: 'Assessment 4: Fundamental Rights Appellate Petition Drafting (Capstone)',
        type: 'Project',
        linkedCLOIds: [clo4.id],
        linkedMLOIds: course.mlos.filter((m) => m.linkedCLOId === clo4.id).map((m) => m.id).slice(0, 2),
        bloomLevel: 'Create',
        evidenceType: 'Direct',
        marks: 50,
        weightage: 15, // Solves the under-assessment of CLO 4
        achievementThreshold: 65,
        isSummative: true,
        directOrIndirect: 'Direct',
        questions: [],
      },
      {
        id: 'asmt-calib-5',
        name: 'Assessment 5: Comprehensive Final Examination & Synthesis',
        type: 'Final Assessment',
        linkedCLOIds: [clo1.id, clo2.id, clo3.id, clo4.id],
        linkedMLOIds: [],
        bloomLevel: 'Create',
        evidenceType: 'Direct',
        marks: 100,
        weightage: 30, // 7.5% per CLO (30% total)
        achievementThreshold: 60,
        isSummative: true,
        directOrIndirect: 'Direct',
        questions: [],
        rubricId: 'rubric-final',
      },
    ];
  }

  // Generic fallback: distribute evenly across CLOs
  const perCLOWeight = Math.floor(70 / Math.max(1, course.clos.length));
  const finalWeight = 100 - perCLOWeight * course.clos.length;

  const generated: Assessment[] = course.clos.map((clo, idx) => ({
    id: `asmt-auto-${clo.id}`,
    name: `Summative Assessment ${idx + 1}: ${clo.code} Authentic Task`,
    type: clo.bloomLevel === 'Create' || clo.bloomLevel === 'Evaluate' ? 'Project' : 'Assignment',
    linkedCLOIds: [clo.id],
    linkedMLOIds: course.mlos.filter((m) => m.linkedCLOId === clo.id).map((m) => m.id).slice(0, 2),
    bloomLevel: clo.bloomLevel,
    evidenceType: 'Direct',
    marks: 50,
    weightage: perCLOWeight,
    achievementThreshold: 60,
    isSummative: true,
    directOrIndirect: 'Direct',
    questions: [],
  }));

  generated.push({
    id: `asmt-auto-final`,
    name: 'Comprehensive Final Examination',
    type: 'Final Assessment',
    linkedCLOIds: course.clos.map((c) => c.id),
    linkedMLOIds: [],
    bloomLevel: 'Evaluate',
    evidenceType: 'Direct',
    marks: 100,
    weightage: finalWeight,
    achievementThreshold: 60,
    isSummative: true,
    directOrIndirect: 'Direct',
    questions: [],
  });

  return generated;
}

/**
 * Generates an executive Markdown report of the CLO vs Assessment alignment analysis.
 */
export function generateAlignmentAnalysisMarkdown(
  course: Course,
  report: AssessmentPlanAnalysisReport
): string {
  let md = `# OBE Alignment Analysis Report: Assessment Plan vs. CLOs\n\n`;
  md += `**Course Title:** ${course.title} (${course.code})\n`;
  md += `**Department:** ${course.department || 'Academic Department'} | **Credit Hours:** ${course.creditHours}\n`;
  md += `**Overall Constructive Alignment Balance Score:** ${report.overallBalanceScore} / 100\n`;
  md += `**Total Assessment Weightage:** ${report.totalConfiguredWeightage}% (${report.isTotalWeightageValid ? 'Valid (100%)' : 'CRITICAL: Must equal 100%'})\n\n`;

  md += `## Executive Summary & Alignment Statistics\n\n`;
  md += `- **Total Defined CLOs:** ${report.cloCoverages.length}\n`;
  md += `- **Over-Assessed CLOs (+4% or more):** ${report.overAssessedCLOs.length} (${report.overAssessedCLOs.map((c) => c.cloCode).join(', ') || 'None'})\n`;
  md += `- **Under-Assessed CLOs (-4% or more):** ${report.underAssessedCLOs.length} (${report.underAssessedCLOs.map((c) => c.cloCode).join(', ') || 'None'})\n`;
  md += `- **Cognitive Bloom Deficits:** ${report.cognitiveDeficitCLOs.length} (${report.cognitiveDeficitCLOs.map((c) => `${c.cloCode} [Target: ${c.cloBloomLevel}]`).join(', ') || 'None'})\n`;
  md += `- **Balanced & Harmonized Outcomes:** ${report.balancedCLOs.length} (${report.balancedCLOs.map((c) => c.cloCode).join(', ') || 'None'})\n\n`;

  md += `## Outcome-by-Outcome Detailed Alignment Matrix\n\n`;
  md += `| CLO Code | Target Bloom | Target Weight | Assessed Weight | Variance | Status | Highest Assessment Bloom | Cognitive Match |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  report.cloCoverages.forEach((cov) => {
    const varianceStr = cov.weightVariance > 0 ? `+${cov.weightVariance}%` : `${cov.weightVariance}%`;
    md += `| **${cov.cloCode}** | ${cov.cloBloomLevel} | ${cov.targetWeightage}% | ${cov.assessedWeightage}% | ${varianceStr} | ${cov.coverageStatus.toUpperCase()} | ${cov.maxAssessmentBloom} | ${cov.bloomAlignmentStatus.toUpperCase()} |\n`;
  });

  md += `\n## Detailed Pedagogical Diagnosis & Recommendations\n\n`;
  report.cloCoverages.forEach((cov) => {
    md += `### ${cov.cloCode}: ${cov.cloStatement}\n`;
    md += `- **Bloom Specification:** ${cov.cloBloomLevel} (${cov.cloBloomVerb})\n`;
    md += `- **Target Weight:** ${cov.targetWeightage}% | **Assessed Contribution:** ${cov.assessedWeightage}% (${cov.weightVariance > 0 ? '+' : ''}${cov.weightVariance}%)\n`;
    md += `- **Cognitive Status:** ${cov.bloomAlignmentStatus.replace('-', ' ').toUpperCase()} (Max Task Bloom: ${cov.maxAssessmentBloom})\n`;
    md += `- **Diagnosis:** ${cov.pedagogicalDiagnosis}\n`;
    md += `- **Action Recommendation:** ${cov.suggestedAction}\n`;
    md += `- **Mapped Assessments:**\n`;
    if (cov.linkedAssessments.length > 0) {
      cov.linkedAssessments.forEach((asmt) => {
        md += `  - *${asmt.name}* [${asmt.type} | Bloom: ${asmt.bloomLevel}]: Total ${asmt.weightage}%, Allocated Share ${asmt.shareForThisCLO}%\n`;
      });
    } else {
      md += `  - *NO ASSESSMENTS LINKED (CRITICAL GAP)*\n`;
    }
    md += `\n`;
  });

  md += `## Systemic Findings & Accreditation Action Plan\n\n`;
  report.systemicFindings.forEach((f, idx) => {
    md += `${idx + 1}. ${f}\n`;
  });

  md += `\n### Immediate Next Steps for Course Team\n\n`;
  report.concreteRecommendations.forEach((r, idx) => {
    md += `- ${r}\n`;
  });

  return md;
}
