import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getFrameworkGuideline,
  FRAMEWORK_GUIDELINES,
  FrameworkDetailedGuideline,
} from '../data/frameworkGuidelines';
import { INITIAL_FRAMEWORKS } from '../data/frameworksData';

export interface GuidebookPdfOptions {
  frameworkId?: string;
  frameworkName?: string;
  courseTitle?: string;
  courseCode?: string;
  institutionName?: string;
  includeAllAccords?: boolean;
}

/**
 * Generates a comprehensive, publication-grade PDF Guidebook
 * for Outcome-Based Education & Accreditation Frameworks.
 */
export function generateFrameworkGuidebookPDF(options: GuidebookPdfOptions = {}): jsPDF {
  const guideline: FrameworkDetailedGuideline = getFrameworkGuideline(options.frameworkId);
  const institutionName = options.institutionName || 'Apex Institute of Science & Technology';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Primary color palette
  const primaryColor: [number, number, number] = [30, 41, 59]; // slate-800
  const accentIndigo: [number, number, number] = [79, 70, 229]; // indigo-600
  const secondaryColor: [number, number, number] = [71, 85, 105]; // slate-600
  const lightBg: [number, number, number] = [248, 250, 252]; // slate-50

  let currentY = margin;

  const checkPageBreak = (neededHeight: number): void => {
    if (currentY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin + 12;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = (): void => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('OBE360™ ACCREDITATION & OBE FRAMEWORKS GUIDEBOOK', margin, margin);
    doc.text(guideline.frameworkCode, pageWidth - margin, margin, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
  };

  const drawSectionHeader = (title: string, sub?: string): void => {
    checkPageBreak(25);
    currentY += 4;
    doc.setFillColor(...lightBg);
    doc.rect(margin, currentY, contentWidth, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...accentIndigo);
    doc.text(title.toUpperCase(), margin + 3, currentY + 7);

    doc.setDrawColor(...accentIndigo);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY + 10, margin + 45, currentY + 10);

    currentY += 15;

    if (sub) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text(sub, margin, currentY);
      currentY += 6;
    }
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  // Top decorative color band
  doc.setFillColor(...accentIndigo);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Background accent container
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, 25, contentWidth, 75, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...accentIndigo);
  doc.text('MENTISERA OBE360™ CURRICULAR GOVERNANCE SUITE', margin + 8, 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('Accreditation & OBE', margin + 8, 52);
  doc.text('Frameworks Guidebook', margin + 8, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text('Comprehensive Instructional Design & Constructive Alignment Manual', margin + 8, 72);
  doc.text(`Official Benchmark: ${guideline.frameworkName}`, margin + 8, 78);

  // Framework Highlight Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 6, 84, contentWidth - 12, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text(
    `COMMITTED ACCREDITATION ACCORD: ${guideline.frameworkCode} (${guideline.accordOrStandard})`,
    margin + 10,
    92
  );

  currentY = 110;

  // Metadata block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('PUBLICATION & GOVERNANCE METADATA', margin, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['Parameter', 'Institutional Specification']],
    body: [
      ['Target Framework', `${guideline.frameworkName} [${guideline.frameworkCode}]`],
      ['Accreditation Body', guideline.governingBody],
      ['Governing Jurisdiction', guideline.jurisdiction],
      ['Outcome Hierarchy', guideline.outcomeModel],
      ['Target Passing Benchmark', guideline.attainmentThreshold],
      ['Cognitive Expectation', guideline.cognitiveRequirements],
      ['Academic Institution', institutionName],
      [
        'Associated Course',
        options.courseTitle
          ? `${options.courseTitle} (${options.courseCode || 'N/A'})`
          : 'Institutional Master Standard',
      ],
      ['Publication Date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: accentIndigo,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: primaryColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Executive summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...accentIndigo);
  doc.text('EXECUTIVE PREFACE & PHILOSOPHY', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  const descLines = doc.splitTextToSize(guideline.description, contentWidth - 8);
  doc.text(descLines, margin + 4, currentY + 12);

  const philLines = doc.splitTextToSize(`Core Philosophy: ${guideline.corePhilosophy}`, contentWidth - 8);
  doc.text(philLines, margin + 4, currentY + 24);

  // Bottom Notice
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryColor);
  doc.text(
    'This guidebook is an authoritative reference for course creators, department chairs, and external peer reviewers.',
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );

  // ==========================================
  // PAGE 2: OBE FOUNDATIONS & FRAMEWORK STANDARDS
  // ==========================================
  doc.addPage();
  currentY = margin + 10;
  drawRunningHeader();

  drawSectionHeader(
    '1. Fundamentals of Outcome-Based Education (OBE)',
    'The Paradigm Shift from Input-Driven Teaching to Evidence-Based Demonstrable Outcomes'
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  const obeIntro =
    'Outcome-Based Education (OBE) is a pedagogical philosophy formalized by William Spady (1994) and John Biggs (1996) that organizes the entire educational system around what is essential for all learners to be capable of doing successfully at the end of their learning experiences. Rather than counting contact hours or textbook chapters, OBE measures direct, verifiable evidence of student competencies against predefined standards.';
  doc.text(doc.splitTextToSize(obeIntro, contentWidth), margin, currentY);
  currentY += 20;

  // The 4 Core Principles Table
  autoTable(doc, {
    startY: currentY,
    head: [['Spady Core Principle', 'Operational Meaning in Course Design', 'Verification Standard']],
    body: [
      [
        '1. Clarity of Focus',
        'Instructors and learners must have unambiguous awareness of the exact competencies expected from day one.',
        'CLOs formulated with active Bloom’s verbs and distributed in week 1.',
      ],
      [
        '2. Designing Down',
        'Curriculum unfolds backward: PEOs -> PLOs / Graduate Attributes -> CLOs -> Weekly Plan -> Assessment Tasks.',
        'Zero isolated topics; every lecture directly supports a measurable CLO.',
      ],
      [
        '3. High Expectations',
        'Establishing high, non-negotiable performance benchmarks for all students rather than sorting via curved grading.',
        'Criterion-referenced rubrics with clear thresholds (e.g. >=50% or >=60%).',
      ],
      [
        '4. Expanded Opportunities',
        'Recognizing that learners achieve mastery at different paces; providing formative feedback and remediation.',
        'CQI action plans, tutorial interventions, and scaffolded practice before high-stakes exams.',
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor, fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 80 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ==========================================
  // SECTION 2: GRADUATE ATTRIBUTES / STUDENT OUTCOMES
  // ==========================================
  drawSectionHeader(
    `2. ${guideline.frameworkName} — Outcome Specifications`,
    `Standard Graduate Attributes & Performance Criteria mandated by ${guideline.governingBody}`
  );

  const attributeRows = guideline.graduateAttributes.map((attr) => [
    attr.code,
    attr.title,
    attr.description,
    attr.keywords.join(', '),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Code', 'Competency Title', 'Official Accreditation Descriptor', 'Core Keywords']],
    body: attributeRows,
    theme: 'grid',
    headStyles: { fillColor: accentIndigo, fontSize: 8 },
    styles: { fontSize: 7.2, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 15 },
      1: { fontStyle: 'bold', cellWidth: 38 },
      2: { cellWidth: 85 },
      3: { cellWidth: 36, fontStyle: 'italic' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ==========================================
  // SECTION 3: STEP-BY-STEP CURRICULUM PROTOCOL
  // ==========================================
  checkPageBreak(50);
  drawSectionHeader(
    '3. Step-by-Step OBE Course Design Protocol',
    `Framework-Specific Rules for CLOs, Matrices, Assessments, and Rubrics`
  );

  const stageKeys = Object.keys(guideline.stages);

  stageKeys.forEach((key, index) => {
    const stage = guideline.stages[key];
    checkPageBreak(50);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...accentIndigo);
    doc.text(`${index + 1}. ${stage.stageTitle}`, margin, currentY);
    currentY += 4.5;

    // What is required
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('Key Requirements & Criteria:', margin, currentY);
    currentY += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    stage.whatIsRequired.forEach((req) => {
      checkPageBreak(6);
      doc.text(`• ${req}`, margin + 3, currentY);
      currentY += 3.5;
    });

    currentY += 1.5;

    // Compliant Examples Box
    if (stage.compliantExamples && stage.compliantExamples.length > 0) {
      checkPageBreak(25);
      const eg = stage.compliantExamples[0];
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);

      const splitDesc = doc.splitTextToSize(eg.description, contentWidth - 10);
      const boxHeight = 8 + splitDesc.length * 3.5;

      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(67, 56, 202);
      doc.text(`EXEMPLAR: ${eg.title}`, margin + 3, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...primaryColor);
      doc.text(splitDesc, margin + 3, currentY + 8);

      currentY += boxHeight + 4;
    }

    currentY += 4;
  });

  // ==========================================
  // SECTION 4: REVISED BLOOM'S TAXONOMY VERBS TABLE
  // ==========================================
  checkPageBreak(70);
  drawSectionHeader(
    '4. Revised Bloom’s Taxonomy Action Verbs Reference',
    'Anderson & Krathwohl (2001) Cognitive Domain Verbs for Measurable CLO Formulation'
  );

  autoTable(doc, {
    startY: currentY,
    head: [['Level', 'Cognitive Domain', 'Process Descriptor', 'Compliant Action Verbs', 'Prohibited Verbs']],
    body: [
      [
        'C1',
        'Remembering',
        'Retrieving relevant knowledge from memory',
        'Define, list, recall, identify, state, name, label, recognize',
        'Understand, know, be familiar with',
      ],
      [
        'C2',
        'Understanding',
        'Constructing meaning from instructional messages',
        'Explain, summarize, classify, describe, paraphrase, compare, illustrate',
        'Learn, grasp the idea of',
      ],
      [
        'C3',
        'Applying',
        'Carrying out or using a procedure in a given situation',
        'Calculate, implement, solve, compute, demonstrate, operate, execute',
        'Study, perceive',
      ],
      [
        'C4',
        'Analyzing',
        'Breaking material into parts and determining relations',
        'Deconstruct, differentiate, analyze, diagnose, test, investigate, correlate',
        'Appreciate, realize',
      ],
      [
        'C5',
        'Evaluating',
        'Making judgments based on criteria and standards',
        'Critique, appraise, justify, evaluate, assess, validate, verify, benchmark',
        'Believe, be conscious of',
      ],
      [
        'C6',
        'Creating',
        'Putting elements together to form a coherent whole or design',
        'Design, formulate, compose, synthesize, invent, develop, generate, construct',
        'See, feel',
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 12 },
      1: { fontStyle: 'bold', cellWidth: 25 },
      2: { cellWidth: 50 },
      3: { cellWidth: 50, textColor: [16, 185, 129], fontStyle: 'bold' },
      4: { cellWidth: 35, textColor: [225, 29, 72], fontStyle: 'italic' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ==========================================
  // SECTION 5: ACCREDITATION AUDIT CHECKLIST
  // ==========================================
  checkPageBreak(50);
  drawSectionHeader(
    '5. Accreditation Peer Review Readiness Checklist',
    'Mandatory Inspection Deliverables Required for Board of Studies and External Audits'
  );

  autoTable(doc, {
    startY: currentY,
    head: [['Dossier Component', 'Inspection Standard', 'Mandatory Evidence Required']],
    body: [
      [
        '1. CLO-to-PLO Mapping Matrix',
        'Every high correlation (Level 3) must have direct assessment linkage.',
        'Tagged exam questions, project rubrics, and attainment calculation sheet.',
      ],
      [
        '2. 100% Assessment Weighting',
        'Assessments total exactly 100% with no unassessed outcomes.',
        'Syllabus breakdown with formative/summative split documented.',
      ],
      [
        '3. 4-Tier Analytic Rubrics',
        'Explicit performance descriptors across Exemplary, Proficient, Developing, and Unsatisfactory.',
        'Distributed rubrics and graded student scoring sheets with examiner remarks.',
      ],
      [
        '4. Student Work Samples (High, Medium, Low)',
        '3 representative samples of student exam scripts and project reports per section.',
        'Preserved answer books with step-marking and score breakdowns matching rubrics.',
      ],
      [
        '5. CQI Remediation Dossier',
        'Closed-loop remediation plan based on prior cohort outcome attainment data.',
        'Board of Studies (BoS) minutes approving pedagogical interventions.',
      ],
      [
        '6. Digital Audit Trail & Institutional Seal',
        'Course blueprint endorsed with timestamped cryptographic verification hash.',
        'OBE360™ verified accreditation seal with Dean & BoS Chair sign-off.',
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: accentIndigo, fontSize: 8 },
    styles: { fontSize: 7.2, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 65 },
      2: { cellWidth: 64 },
    },
    margin: { left: margin, right: margin },
  });

  // Add Page Numbers to all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...secondaryColor);
    doc.text(
      `Page ${i} of ${totalPages}  •  OBE360™ Accreditation Guidebook  •  ${guideline.frameworkCode}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Generates and returns a live in-browser PDF Blob and object URL
 * suitable for embedding in iframe / PDF viewer or direct print/download.
 */
export function generateFrameworkGuidebookBlob(options: GuidebookPdfOptions = {}): {
  doc: jsPDF;
  blob: Blob;
  blobUrl: string;
  fileName: string;
} {
  const doc = generateFrameworkGuidebookPDF(options);
  const guideline = getFrameworkGuideline(options.frameworkId);
  const fileName = `${guideline.frameworkCode}_Accreditation_OBE_Guidebook.pdf`.replace(
    /[^a-zA-Z0-9_\-\.]/g,
    '_'
  );
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  return { doc, blob, blobUrl, fileName };
}

/**
 * Convenience helper to download the PDF Guidebook directly in the browser
 */
export function downloadFrameworkGuidebookPDF(options: GuidebookPdfOptions = {}): void {
  try {
    const doc = generateFrameworkGuidebookPDF(options);
    const guideline = getFrameworkGuideline(options.frameworkId);
    const fileName = `${guideline.frameworkCode}_Accreditation_OBE_Guidebook.pdf`.replace(
      /[^a-zA-Z0-9_\-\.]/g,
      '_'
    );
    doc.save(fileName);
  } catch (err) {
    console.error('Failed to generate or download OBE Guidebook PDF:', err);
  }
}
