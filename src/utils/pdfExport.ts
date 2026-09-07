import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Course, CourseAuditReport } from '../types';
import { calculateCourseAudit } from './obeCalculator';
import { analyzeAssessmentPlan } from './assessmentAnalysis';

export interface PDFExportOptions {
  includeCourseInfo?: boolean;
  includeCLOs?: boolean;
  includePLOMapping?: boolean;
  includeModules?: boolean;
  includeAssessments?: boolean;
  includeRubrics?: boolean;
  includeEvidenceRules?: boolean;
  includeAuditReport?: boolean;
  includeCQIPlan?: boolean;
}

/**
 * Generates a formatted, publication-grade PDF document
 * containing the full course design configuration and accreditation audit report.
 */
export function generateCoursePDF(course: Course, options: PDFExportOptions = {}): jsPDF {
  const opts: Required<PDFExportOptions> = {
    includeCourseInfo: options.includeCourseInfo ?? true,
    includeCLOs: options.includeCLOs ?? true,
    includePLOMapping: options.includePLOMapping ?? true,
    includeModules: options.includeModules ?? true,
    includeAssessments: options.includeAssessments ?? true,
    includeRubrics: options.includeRubrics ?? true,
    includeEvidenceRules: options.includeEvidenceRules ?? true,
    includeAuditReport: options.includeAuditReport ?? true,
    includeCQIPlan: options.includeCQIPlan ?? true,
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const auditReport: CourseAuditReport = calculateCourseAudit(course);
  const assessmentAnalysis = analyzeAssessmentPlan(course);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 14;

  // Primary Palette
  const colorPrimary = [30, 41, 59]; // slate-800
  const colorAccent = [79, 70, 229]; // indigo-600
  const colorSuccess = [16, 185, 129]; // emerald-500
  const colorWarning = [245, 158, 11]; // amber-500
  const colorCritical = [239, 68, 68]; // rose-500
  const colorMuted = [100, 116, 139]; // slate-500
  const colorBgLight = [248, 250, 252]; // slate-50

  const checkAddPage = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - 18) {
      doc.addPage();
      currentY = 16;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text('MENTISERA OBE360™ • OUTCOME-BASED COURSE SPECIFICATION & AUDIT DOSSIER', margin, 10);

    doc.setFont('helvetica', 'normal');
    const rightText = `${course.code || 'COURSE'} • ${course.programme || 'Curriculum'} • Status: ${(course.status || 'draft').toUpperCase()}`;
    doc.text(rightText, pageWidth - margin, 10, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // Draw Header for Page 1
  drawHeader();

  // Top Institutional / Course Banner
  doc.setFillColor(colorAccent[0], colorAccent[1], colorAccent[2]);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const truncatedTitle = (course.title || 'Untitled Outcome-Based Course').substring(0, 56);
  doc.text(truncatedTitle, margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const subtitle = `Code: ${course.code || 'N/A'}  |  Credits: ${course.creditHours || 3} CH  |  Level: ${course.courseLevel || 'Undergraduate'}  |  Discipline: ${course.category || course.programme || 'General'}`;
  doc.text(subtitle, margin + 6, currentY + 16);

  currentY += 28;

  // Accreditation Status & Overall Health Card
  const healthScore = auditReport.healthScore;
  const statusColor = healthScore >= 90 ? colorSuccess : healthScore >= 75 ? colorAccent : colorWarning;

  doc.setFillColor(colorBgLight[0], colorBgLight[1], colorBgLight[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  // Health Score Box
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin + 4, currentY + 4, 38, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${healthScore}%`, margin + 23, currentY + 12, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('AUDIT HEALTH SCORE', margin + 23, currentY + 16.5, { align: 'center' });

  // Quick stats next to health score
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const healthLabel =
    healthScore >= 90
      ? 'Exemplary Alignment (Accreditation Ready)'
      : healthScore >= 75
      ? 'Substantial Alignment (Minor Revisions Advised)'
      : 'Needs Attention (Significant Gaps Detected)';
  doc.text(healthLabel, margin + 46, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  const statsLine = `CLOs: ${course.clos?.length || 0}  •  PLOs: ${course.plos?.length || 0}  •  Modules: ${course.modules?.length || 0}  •  Assessments: ${course.assessments?.length || 0}  •  Status: ${(course.status || 'draft').toUpperCase()}`;
  doc.text(statsLine, margin + 46, currentY + 15);

  const reviewStatus = course.academicReview?.status || 'Draft';
  const genDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  doc.text(`Quality Review: ${reviewStatus}  •  Instructor: ${course.instructorName || 'Lead Faculty'}  •  Report Date: ${genDate}`, margin + 46, currentY + 19.5);

  currentY += 28;

  // SECTION 1: COURSE SPECIFICATION & BLUEPRINT
  if (opts.includeCourseInfo) {
    checkAddPage(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('1. COURSE SPECIFICATION & PEDAGOGICAL BLUEPRINT', margin, currentY);
    currentY += 4;

    const blueprintRows = [
      ['Course Code & Title', `${course.code || 'N/A'} - ${course.title || 'N/A'}`],
      ['Credit & Delivery Mode', `${course.creditHours || 3} Credit Hours  •  ${course.deliveryMode || 'Face to Face'}  •  ${course.durationWeeks || 14} Weeks`],
      ['Academic Discipline', `${course.programme || course.category || 'N/A'} (${course.courseLevel || 'Undergraduate'})`],
      ['Department / Faculty', `${course.department || 'Academic Department'}  •  Instructor: ${course.instructorName || 'Lead Faculty'}`],
      ['Prerequisites & Benchmarks', `Prerequisites: ${course.prerequisites || 'None'}  |  Passing Benchmark: ${course.passingBenchmark || 60}%`],
      ['Learning Promise', course.learningPromise || 'Core transformative capability mastered upon completion.'],
      ['Educational Purpose', course.blueprint?.purpose || course.description || 'Not specified'],
      ['Target Competencies', course.blueprint?.targetCompetencies?.join(', ') || 'Domain mastery, critical reasoning, professional practice'],
      ['Pedagogical Strategy', course.blueprint?.assessmentStrategy || 'Constructive alignment with active learning and authentic performance assessments'],
      ['Capstone Performance Goal', course.capstoneGoal || 'Demonstrate end-to-end outcome attainment via direct evidentiary assessment.'],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Specification Dimension', 'Curriculum Design Details']],
      body: blueprintRows,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: 'bold', textColor: [51, 65, 85], fontSize: 7 },
        1: { cellWidth: contentWidth - 46, fontSize: 7 },
      },
      styles: { cellPadding: 2, overflow: 'linebreak' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SECTION 2: COURSE LEARNING OUTCOMES (CLOs)
  if (opts.includeCLOs && course.clos?.length > 0) {
    checkAddPage(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('2. COURSE LEARNING OUTCOMES (CLOs) & BLOOM TAXONOMY', margin, currentY);
    currentY += 4;

    const cloRows = course.clos.map((clo) => {
      const ploLabels = clo.mappedPLOs?.map((m) => {
        const found = course.plos?.find((p) => p.id === m.ploId);
        return found ? `${found.code} (${m.level[0]})` : m.ploId;
      }).join(', ') || 'None';

      return [
        clo.code,
        clo.statement,
        clo.bloomLevel,
        `${clo.weightage || 0}%`,
        `${clo.achievementThreshold || 60}%`,
        ploLabels,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['CLO', 'Observable Outcome Statement', 'Bloom Level', 'Weight', 'Benchmark', 'Mapped PLOs']],
      body: cloRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold', fontSize: 7 },
        1: { cellWidth: 78, fontSize: 7 },
        2: { cellWidth: 22, fontSize: 7 },
        3: { cellWidth: 16, fontSize: 7 },
        4: { cellWidth: 20, fontSize: 7 },
        5: { cellWidth: 30, fontSize: 7 },
      },
      styles: { cellPadding: 2, overflow: 'linebreak' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SECTION 3: CLO-PLO CONSTRUCTIVE MAPPING MATRIX
  if (opts.includePLOMapping && course.plos?.length > 0) {
    checkAddPage(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('3. PROGRAMME ALIGNMENT MATRIX (CLO ➔ PLO)', margin, currentY);
    currentY += 4;

    const ploCodes = course.plos.map((p) => p.code);
    const matrixHead = ['CLO Code', ...ploCodes];
    const matrixBody = course.clos.map((clo) => {
      const row: string[] = [clo.code];
      course.plos.forEach((plo) => {
        const mapping = clo.mappedPLOs?.find((m) => m.ploId === plo.id);
        if (mapping) {
          row.push(mapping.level ? mapping.level[0].toUpperCase() : 'X');
        } else {
          row.push('-');
        }
      });
      return row;
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [matrixHead],
      body: matrixBody,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold', halign: 'left', fontSize: 7 },
      },
      styles: { cellPadding: 2, halign: 'center', fontSize: 7 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text('Correlation: I = Introduced, R = Reinforced, M = Mastered, "-" = No direct alignment', margin, currentY);
    currentY += 6;
  }

  // SECTION 4: MODULAR ARCHITECTURE & INSTRUCTIONAL DESIGN
  if (opts.includeModules && course.modules?.length > 0) {
    checkAddPage(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('4. MODULAR ARCHITECTURE & INSTRUCTIONAL PACING', margin, currentY);
    currentY += 4;

    const moduleRows = course.modules.map((mod) => {
      const linkedMLOs = course.mlos?.filter((m) => m.moduleId === mod.id) || [];
      const mloSummary =
        linkedMLOs.length > 0
          ? linkedMLOs.map((m) => `${m.code}: ${m.statement.substring(0, 50)}...`).join('\n')
          : 'Scaffolded modular outcomes';

      const lessonCount = course.lessons?.filter((l) => l.moduleId === mod.id).length || 0;
      const activityCount = course.activities?.filter((a) => a.moduleId === mod.id).length || 0;

      return [
        `Module ${mod.number}`,
        mod.title,
        `${mod.durationWeeks || 2} Wks (${mod.expectedStudyHours || 12} hrs)`,
        mloSummary,
        `${lessonCount} Lessons / ${activityCount} Activities`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Module', 'Title', 'Pacing & Hours', 'Module Learning Outcomes (MLOs)', 'Instructional Units']],
      body: moduleRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold', fontSize: 7 },
        1: { cellWidth: 42, fontSize: 7 },
        2: { cellWidth: 22, fontSize: 7 },
        3: { cellWidth: 60, fontSize: 6.5 },
        4: { cellWidth: 38, fontSize: 6.5 },
      },
      styles: { cellPadding: 2, overflow: 'linebreak' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SECTION 5: ASSESSMENT BLUEPRINT & COGNITIVE MAPPING
  if (opts.includeAssessments && course.assessments?.length > 0) {
    checkAddPage(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('5. ASSESSMENT BLUEPRINT & PERFORMANCE MEASUREMENT', margin, currentY);
    currentY += 4;

    const totalWeight = course.assessments.reduce((acc, a) => acc + (a.weightage || 0), 0);

    const asmtRows = course.assessments.map((a) => [
      a.name,
      a.type,
      a.isSummative ? 'Summative' : 'Formative',
      `${a.weightage || 0}%`,
      `${a.marks || 100}`,
      a.bloomLevel,
      a.linkedCLOIds?.join(', ') || 'All CLOs',
      a.rubricId ? 'Standard Rubric' : 'Objective/MCQ',
    ]);

    asmtRows.push([
      'TOTAL WEIGHT',
      '-',
      '-',
      `${totalWeight}%`,
      '-',
      '-',
      '-',
      totalWeight === 100 ? 'Balanced' : 'Flagged',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Assessment Task', 'Format', 'Category', 'Weight', 'Marks', 'Target Bloom', 'Evaluated CLOs', 'Evaluation Mode']],
      body: asmtRows,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', fontSize: 7 },
        1: { cellWidth: 20, fontSize: 7 },
        2: { cellWidth: 20, fontSize: 7 },
        3: { cellWidth: 16, fontStyle: 'bold', fontSize: 7 },
        4: { cellWidth: 16, fontSize: 7 },
        5: { cellWidth: 22, fontSize: 7 },
        6: { cellWidth: 26, fontSize: 7 },
        7: { cellWidth: 22, fontSize: 7 },
      },
      styles: { cellPadding: 2, overflow: 'linebreak' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SECTION 6: EVIDENCE & DIRECT ATTAINMENT RULES
  if (opts.includeEvidenceRules && course.evidenceRules?.length > 0) {
    checkAddPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('6. DIRECT OUTCOME EVIDENCE & ATTAINMENT RULES', margin, currentY);
    currentY += 4;

    const evidenceRows = course.evidenceRules.map((rule) => {
      const sourceSummary =
        rule.evidenceSources?.map((s) => `${s.componentName} (${s.weightInOutcome}%)`).join(', ') ||
        'Direct Assessment';

      return [
        rule.outcomeCode,
        sourceSummary,
        `${rule.minimumThresholdPct || 60}%`,
        rule.achievementRuleText || 'Score ≥ minimum passing benchmark',
        rule.explanation || 'Satisfies measurable learning capability',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Outcome', 'Direct Evidence Components', 'Pass Threshold', 'Achievement Criteria', 'Audit Rationale']],
      body: evidenceRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold', fontSize: 7 },
        1: { cellWidth: 46, fontSize: 7 },
        2: { cellWidth: 20, fontSize: 7 },
        3: { cellWidth: 50, fontSize: 6.5 },
        4: { cellWidth: 46, fontSize: 6.5 },
      },
      styles: { cellPadding: 2, overflow: 'linebreak' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // SECTION 7: ACCREDITATION CONSTRUCTIVE ALIGNMENT AUDIT
  if (opts.includeAuditReport) {
    checkAddPage(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('7. ACCREDITATION CONSTRUCTIVE ALIGNMENT AUDIT REPORT', margin, currentY);
    currentY += 4;

    // Dimension breakdown table
    const categoryRows = [
      ['Course Information & Identity', `${auditReport.categoryScores?.courseInfo || 0}%`, '10%', 'Core course identity, metadata, and educational rationale'],
      ['CLO Quality & Verbs', `${auditReport.categoryScores?.cloQuality || 0}%`, '15%', 'Observable active Bloom verbs and observable rigor'],
      ['CLO-to-PLO Program Mapping', `${auditReport.categoryScores?.cloPloMapping || 0}%`, '10%', 'Accreditation contribution to graduate attributes'],
      ['MLO Scaffolding & Alignment', `${auditReport.categoryScores?.mloAlignment || 0}%`, '15%', 'Modular outcomes linked directly to parent CLOs'],
      ['Lesson & Instructional Delivery', `${auditReport.categoryScores?.lessonAlignment || 0}%`, '10%', 'Direct evidence and active student engagement'],
      ['Assessment Coverage & Balance', `${auditReport.categoryScores?.assessmentCoverage || 0}%`, '20%', '100% weight calibration and formative/summative balance'],
      ['Rubric Scoring Alignment', `${auditReport.categoryScores?.rubricAlignment || 0}%`, '10%', 'Objective multi-level criteria for qualitative tasks'],
      ['Evidence Rules & Benchmark', `${auditReport.categoryScores?.evidenceCoverage || 0}%`, '10%', 'Direct attainment thresholds for accreditation audits'],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Pedagogical Dimension', 'Score', 'Weight', 'Audited Standards & Evaluation']],
      body: categoryRows,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', fontSize: 7 },
        1: { cellWidth: 18, fontStyle: 'bold', halign: 'center', fontSize: 7 },
        2: { cellWidth: 16, halign: 'center', fontSize: 7 },
        3: { cellWidth: contentWidth - 89, fontSize: 7 },
      },
      styles: { cellPadding: 2, overflow: 'linebreak' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Assessment Analysis Summary
    checkAddPage(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('Assessment Alignment Findings (Bloom Depth & Distribution)', margin, currentY);
    currentY += 4;

    const analysisRows = [
      ['Assessment Balance Score', `${assessmentAnalysis.overallBalanceScore || 0}%`],
      ['Total Assessment Weight', `${assessmentAnalysis.totalConfiguredWeightage}% (Target: 100%)`],
      ['Over-Assessed CLOs', assessmentAnalysis.overAssessedCLOs.length > 0 ? assessmentAnalysis.overAssessedCLOs.map((c) => c.cloCode).join(', ') : 'None'],
      ['Under-Assessed CLOs', assessmentAnalysis.underAssessedCLOs.length > 0 ? assessmentAnalysis.underAssessedCLOs.map((c) => c.cloCode).join(', ') : 'None'],
      ['Cognitive Deficit CLOs', assessmentAnalysis.cognitiveDeficitCLOs.length > 0 ? assessmentAnalysis.cognitiveDeficitCLOs.map((c) => c.cloCode).join(', ') : 'None detected (Proper Bloom Depth)'],
      ['Unassessed CLOs', assessmentAnalysis.unassessedCLOs.length > 0 ? assessmentAnalysis.unassessedCLOs.map((c) => c.code).join(', ') : 'None (Full Coverage)'],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Alignment Indicator', 'Assessment Audit Result']],
      body: analysisRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', fontSize: 7 },
        1: { cellWidth: contentWidth - 55, fontSize: 7 },
      },
      styles: { cellPadding: 2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Gap Issues List
    if (auditReport.gaps && auditReport.gaps.length > 0) {
      checkAddPage(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(colorCritical[0], colorCritical[1], colorCritical[2]);
      doc.text(`Identified Quality Gaps & Remediation Items (${auditReport.gaps.length} Flagged)`, margin, currentY);
      currentY += 4;

      const gapRows = auditReport.gaps.map((gap) => [
        gap.severity.toUpperCase(),
        gap.title,
        gap.message,
        gap.recommendation,
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Severity', 'Alignment Gap', 'Audit Finding Details', 'Corrective Recommendation']],
        body: gapRows,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
        },
        columnStyles: {
          0: { cellWidth: 20, fontStyle: 'bold', fontSize: 6.5 },
          1: { cellWidth: 44, fontStyle: 'bold', fontSize: 6.5 },
          2: { cellWidth: 58, fontSize: 6.5 },
          3: { cellWidth: contentWidth - 122, fontSize: 6.5 },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // SECTION 8: ACADEMIC REVIEW & CQI ACTION PLAN
  if (opts.includeCQIPlan) {
    checkAddPage(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('8. ACADEMIC REVIEW SIGN-OFF & CONTINUOUS QUALITY IMPROVEMENT (CQI)', margin, currentY);
    currentY += 4;

    const review = course.academicReview || {
      status: 'Pending',
      reviewerName: 'Academic Quality Assurance Committee',
      reviewerRole: 'Curriculum & Accreditation Chair',
      reviewDate: new Date().toISOString().split('T')[0],
      feedback: 'Course exhibits formal alignment ready for institutional delivery.',
      checklistItems: [],
    };

    const cqi = course.cqiPlan || {
      cohortTerm: 'Previous Offering',
      attainmentReflection: 'Attainment analysis evaluated for targeted intervention.',
      identifiedDeficiencies: 'Scaffolding between theory and practice continuously monitored.',
      plannedInterventions: 'Introduce guided active learning sessions and scaffolded rubrics.',
      targetMetric: 'Target ≥ 70% student achievement across all direct evidence outcomes.',
    };

    const reviewRows = [
      ['Accreditation Sign-off Status', review.status.toUpperCase()],
      ['Reviewer & Committee', `${review.reviewerName || 'Unassigned'} (${review.reviewerRole || 'Quality Chair'})`],
      ['Sign-off Date', review.reviewDate || new Date().toISOString().split('T')[0]],
      ['Board of Studies Feedback', review.feedback || 'None provided'],
      ['CQI Cohort Reflection', cqi.attainmentReflection || 'Baseline offering'],
      ['Pedagogical Interventions', cqi.plannedInterventions || 'Standard continuous improvement cycle'],
      ['CQI Target Attainment Metric', cqi.targetMetric || '≥ 70% achievement benchmark across outcomes'],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Accreditation Verification & CQI Standard', 'Institutional Record & Action Plan']],
      body: reviewRows,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', fontSize: 7 },
        1: { cellWidth: contentWidth - 55, fontSize: 7 },
      },
      styles: { cellPadding: 2, overflow: 'linebreak' },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Add Page Numbers & Footer to All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text(
      'MENTISERA OBE360™ • Confidential Course Design & Accreditation Dossier',
      margin,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  return doc;
}

/**
 * Convenience helper to generate and trigger instant browser download
 */
export function downloadCoursePDF(course: Course, options: PDFExportOptions = {}): void {
  const doc = generateCoursePDF(course, options);
  const cleanCode = (course.code || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanCode}_OBE_Audit_Report.pdf`;
  doc.save(filename);
}
