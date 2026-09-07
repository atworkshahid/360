import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  VerticalAlign,
  PageBreak,
} from 'docx';
import { Course, CLO, PLO, CourseModule, Assessment } from '../types';

export interface SyllabusConfig {
  institutionName: string;
  departmentName: string;
  facultyName: string;
  academicTerm: string;
  academicYear: string;
  instructorName: string;
  instructorTitle: string;
  instructorEmail: string;
  instructorOffice: string;
  officeHours: string;
  classSchedule: string;
  classroomLocation: string;
  teachingAssistants: string;
  requiredTextbooks: string;
  recommendedReadings: string;
  technicalRequirements: string;
  gradingScale: string;
  attendancePolicy: string;
  academicIntegrityPolicy: string;
  lateSubmissionPolicy: string;
  aiUsagePolicy: string;
  accommodationsPolicy: string;
  cqiStatement: string;
  // Section inclusion flags
  includeCourseOverview: boolean;
  includeBlueprintCompetencies: boolean;
  includeCLOs: boolean;
  includePLOMatrix: boolean;
  includeTextbooks: boolean;
  includeWeeklySchedule: boolean;
  includeAssessments: boolean;
  includeGradingScale: boolean;
  includeRubrics: boolean;
  includePolicies: boolean;
  includeCQIStatement: boolean;
}

export function getDefaultSyllabusConfig(course: Course): SyllabusConfig {
  const extractedResources = course.modules
    ? Array.from(new Set(course.modules.flatMap((m) => m.resources || []).filter(Boolean)))
    : [];

  return {
    institutionName: 'University Department of Higher Education',
    facultyName: course.category ? `Faculty of ${course.category}` : 'Faculty of Academic Sciences',
    departmentName: course.department || (course.programme ? `Department of ${course.programme}` : 'Department of Engineering & Computing'),
    academicTerm: 'Fall Semester',
    academicYear: '2026 - 2027',
    instructorName: course.instructorName || 'Prof. Course Coordinator, Ph.D.',
    instructorTitle: 'Course Director & Subject Matter Specialist',
    instructorEmail: 'coordinator@university.edu',
    instructorOffice: 'Academic Complex, Room 412',
    officeHours: 'Tuesdays & Thursdays: 2:00 PM – 4:00 PM (or by appointment)',
    classSchedule: `${course.creditHours} Credit Hours • ${course.durationWeeks} Weeks (${course.deliveryMode} Mode)`,
    classroomLocation:
      course.deliveryMode === 'Online'
        ? 'Digital Learning Management System (LMS / Live Virtual Sessions)'
        : 'Lecture Hall 3B / Virtual Collaborative Lab',
    teachingAssistants: 'Graduate Teaching Assistant: ta-support@university.edu (Office Hours: Mon 3-5 PM)',
    requiredTextbooks:
      extractedResources.length > 0
        ? extractedResources.slice(0, 3).join('\n')
        : `1. Standard Reference Textbook in ${course.category || course.title} (Latest Edition).\n2. Courseware Reader and Practical Laboratory Manual (Available on LMS).`,
    recommendedReadings:
      extractedResources.length > 3
        ? extractedResources.slice(3, 6).join('\n')
        : 'Peer-reviewed research journals, ACM/IEEE digital libraries, and supplementary industry whitepapers distributed in class.',
    technicalRequirements:
      'Laptop computer with reliable broadband internet, access to course LMS, Python 3.x / IDE environment, and PDF reader.',
    gradingScale:
      'A: 90–100% (4.00)  |  A-: 85–89% (3.67)\nB+: 80–84% (3.33)  |  B: 75–79% (3.00)  |  B-: 70–74% (2.67)\nC+: 65–69% (2.33)  |  C: 60–64% (2.00)  |  F: Below 60% (0.00)',
    attendancePolicy:
      'Regular class participation is expected. Minimum attendance of 80% is required to qualify for the final summative evaluation in accordance with academic board regulations.',
    academicIntegrityPolicy:
      'Plagiarism, unauthorized collaboration, and cheating are strictly prohibited under the Academic Honor Code. All submitted work must be original or appropriately cited with standard bibliographic attribution.',
    lateSubmissionPolicy:
      'Assignments submitted after the specified deadline will incur a 10% penalty per 24 hours. Submissions delayed by more than 72 hours will not be graded without prior authorized medical concession.',
    aiUsagePolicy:
      'Generative AI tools (e.g., LLMs) may be utilized for conceptual exploration, syntax reference, and iterative drafting. Students must disclose tool utilization and provide proper attribution for AI-generated code or text.',
    accommodationsPolicy:
      'Students with documented physical, psychological, or learning disabilities requiring specific instructional accommodations are encouraged to contact Student Accessibility Services within the first two weeks of class.',
    cqiStatement:
      `This course operates under Outcome-Based Education (OBE360) framework guidelines. Attainment of Course Learning Outcomes (CLOs) is systematically measured against an established threshold (typically 60-70%) to inform Continuous Quality Improvement (CQI) and curriculum enhancement.`,
    includeCourseOverview: true,
    includeBlueprintCompetencies: true,
    includeCLOs: true,
    includePLOMatrix: true,
    includeTextbooks: true,
    includeWeeklySchedule: true,
    includeAssessments: true,
    includeGradingScale: true,
    includeRubrics: true,
    includePolicies: true,
    includeCQIStatement: true,
  };
}

// ---------------------------------------------------------------------------
// PDF SYLLABUS GENERATOR
// ---------------------------------------------------------------------------

export function generateSyllabusPDF(course: Course, config: SyllabusConfig): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 16;

  // Colors
  const colorPrimary = [30, 41, 59]; // Slate 800
  const colorAccent = [67, 56, 202]; // Indigo 700
  const colorSecondary = [71, 85, 105]; // Slate 600
  const colorBorder = [203, 213, 225]; // Slate 300
  const colorLightBg = [248, 250, 252]; // Slate 50
  const colorAccentBg = [238, 242, 255]; // Indigo 50

  const checkAddPage = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - 18) {
      doc.addPage();
      currentY = 16;
      renderPageHeader();
    }
  };

  const renderPageHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${config.institutionName} • ${course.code} ${course.title} — Official Course Syllabus`, margin, 10);
    doc.text(`OBE-360 Aligned`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // 1. Institutional Banner & Syllabus Title
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(199, 210, 254);
  doc.text(config.institutionName.toUpperCase(), margin + 5, currentY + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`${config.facultyName} • ${config.departmentName}`, margin + 5, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(`${course.code}: ${course.title}`, margin + 5, currentY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(
    `Official Course Syllabus • ${config.academicTerm} (${config.academicYear}) • ${course.creditHours} Credits • Level: ${course.courseLevel}`,
    margin + 5,
    currentY + 27
  );

  currentY += 36;

  // 2. Course & Instructor Metadata Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [
      [
        { content: 'COURSE PARAMETERS', colSpan: 2, styles: { fillColor: colorAccent, textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'INSTRUCTOR & CONTACT', colSpan: 2, styles: { fillColor: colorAccent, textColor: [255, 255, 255], fontStyle: 'bold' } },
      ],
    ],
    body: [
      [
        { content: 'Course Code / Title', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        `${course.code} — ${course.title}`,
        { content: 'Instructor', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.instructorName,
      ],
      [
        { content: 'Credit Hours', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        `${course.creditHours} Credits (Est. ${course.expectedStudyTimeHours || course.creditHours * 3} Study Hrs)`,
        { content: 'Title / Role', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.instructorTitle,
      ],
      [
        { content: 'Delivery Format', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        `${course.deliveryMode} (${course.durationWeeks} Weeks)`,
        { content: 'Email', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.instructorEmail,
      ],
      [
        { content: 'Prerequisites', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        course.prerequisites || 'None specified',
        { content: 'Office Location', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.instructorOffice,
      ],
      [
        { content: 'Meeting Schedule', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.classSchedule,
        { content: 'Office Hours', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.officeHours,
      ],
      [
        { content: 'Classroom / Platform', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.classroomLocation,
        { content: 'Support / TA', styles: { fontStyle: 'bold', fillColor: colorLightBg, textColor: colorPrimary } },
        config.teachingAssistants || 'N/A',
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [51, 65, 85],
      lineColor: colorBorder,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 59 },
      2: { cellWidth: 32 },
      3: { cellWidth: 59 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 3. Course Description & Objectives
  if (config.includeCourseOverview) {
    checkAddPage(28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('1. Course Description & Overview', margin, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(secondaryTextColor(colorPrimary));
    const descText = course.description || course.overview || 'Comprehensive course providing theoretical foundations and practical competencies in the subject area.';
    const splitDesc = doc.splitTextToSize(descText, contentWidth);
    doc.text(splitDesc, margin, currentY);
    currentY += splitDesc.length * 3.8 + 3;

    if (course.capstoneGoal || course.learningPromise) {
      checkAddPage(18);
      doc.setFillColor(colorAccentBg[0], colorAccentBg[1], colorAccentBg[2]);
      doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
      doc.text('Course Capstone Promise & Target Capability:', margin + 4, currentY + 5);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const promiseText = course.capstoneGoal || course.learningPromise || '';
      const splitPromise = doc.splitTextToSize(promiseText, contentWidth - 8);
      doc.text(splitPromise.slice(0, 2), margin + 4, currentY + 10);
      currentY += 18;
    }
  }

  // 4. Course Learning Outcomes (CLOs)
  if (config.includeCLOs && course.clos && course.clos.length > 0) {
    checkAddPage(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('2. Course Learning Outcomes (CLOs) & Bloom’s Taxonomy Alignment', margin, currentY);
    currentY += 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Upon successful completion of this course, learners will demonstrate measurable achievement in the following outcomes:',
      margin,
      currentY + 2
    );
    currentY += 5;

    const cloRows = course.clos.map((c) => [
      c.code || 'CLO',
      c.statement || '',
      c.bloomLevel || 'Apply',
      c.bloomVerb || '',
      c.learningDomain || 'Cognitive',
      `${c.weightage || 0}%`,
      `${c.achievementThreshold || 60}%`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      head: [['Code', 'Measurable Learning Outcome Statement', "Bloom's Level", 'Verb', 'Domain', 'Weight', 'Threshold']],
      body: cloRows,
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        lineColor: colorBorder,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: colorPrimary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 84 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 12, halign: 'center' },
        6: { cellWidth: 12, halign: 'center' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // 5. PLO Mapping Matrix
  if (config.includePLOMatrix && course.plos && course.plos.length > 0 && course.clos && course.clos.length > 0) {
    checkAddPage(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('3. Program Learning Outcomes (PLO) Mapping Matrix', margin, currentY);
    currentY += 4;

    const ploHead = ['CLO / PLO', ...course.plos.map((p) => p.code || 'PLO')];
    const ploBody = course.clos.map((c) => {
      const row = [c.code];
      course.plos.forEach((p) => {
        const mapping = c.mappedPLOs?.find((m) => m.ploId === p.id);
        if (mapping) {
          const letter = mapping.level === 'Introduced' ? 'I' : mapping.level === 'Reinforced' ? 'R' : 'M';
          row.push(`${letter}`);
        } else {
          row.push('—');
        }
      });
      return row;
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [ploHead],
      body: ploBody,
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        halign: 'center',
        lineColor: colorBorder,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: colorAccent,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 3;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Legend:  I = Introduced (Foundational)   •   R = Reinforced (Deepening)   •   M = Mastered (Competent / Synthesis)', margin, currentY + 1);
    currentY += 6;
  }

  // 6. Textbooks and Required Materials
  if (config.includeTextbooks) {
    checkAddPage(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('4. Textbooks, References & Technical Requirements', margin, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Category', 'Details & Specifications']],
      body: [
        ['Required Textbooks', config.requiredTextbooks || 'Provided on LMS course portal.'],
        ['Recommended References', config.recommendedReadings || 'Supplemental journal articles and library guides.'],
        ['Technical & Software Tools', config.technicalRequirements || 'Computer with active internet and course software.'],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        lineColor: colorBorder,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: colorPrimary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold', fillColor: colorLightBg },
        1: { cellWidth: contentWidth - 42 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // 7. Weekly / Modular Schedule
  if (config.includeWeeklySchedule && course.modules && course.modules.length > 0) {
    checkAddPage(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('5. Modular & Weekly Course Instructional Schedule', margin, currentY);
    currentY += 4;

    const moduleRows = course.modules.map((m, idx) => {
      const linkedCLOs = m.relatedCLOIds
        ? m.relatedCLOIds
            .map((id) => course.clos.find((c) => c.id === id)?.code)
            .filter(Boolean)
            .join(', ')
        : 'General';

      return [
        `Module ${m.number || idx + 1}`,
        m.title || `Unit ${idx + 1}`,
        m.description || 'Core thematic instructional content and active learning activities.',
        `${m.durationWeeks || 1} Wk`,
        linkedCLOs || 'All CLOs',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      head: [['Module #', 'Module / Topic Title', 'Content & Core Activities', 'Duration', 'Mapped CLOs']],
      body: moduleRows,
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        lineColor: colorBorder,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: colorPrimary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 44, fontStyle: 'bold' },
        2: { cellWidth: 78 },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 24, halign: 'center' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // 8. Assessment Scheme & Grading Breakdown
  if (config.includeAssessments && course.assessments && course.assessments.length > 0) {
    checkAddPage(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('6. Assessment Scheme, Weightage & Evaluation Plan', margin, currentY);
    currentY += 4;

    const assessmentRows = course.assessments.map((a) => {
      const mappedCLOs = a.linkedCLOIds
        ? a.linkedCLOIds
            .map((id) => course.clos.find((c) => c.id === id)?.code)
            .filter(Boolean)
            .join(', ')
        : 'All';

      return [
        a.name,
        a.type || 'Assessment',
        a.isSummative ? 'Summative' : 'Formative',
        `${a.marks || 100} pts`,
        `${a.weightage || 0}%`,
        a.bloomLevel || 'Apply',
        mappedCLOs || 'Course',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      head: [['Assessment Instrument', 'Type', 'Nature', 'Max Marks', 'Course Weight', "Bloom's Level", 'Evaluated CLOs']],
      body: assessmentRows,
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        lineColor: colorBorder,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: colorAccent,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 28 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // 9. Grading Scale & Conversion
  if (config.includeGradingScale) {
    checkAddPage(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('7. Institutional Grading Scale', margin, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Grade', 'Percentage Range', 'Grade Points', 'Performance Level Descriptor']],
      body: [
        ['A / A-', '85% – 100%', '3.70 – 4.00', 'Exemplary Mastery of Course Outcomes and Higher-Order Thinking Skills'],
        ['B+ / B / B-', '70% – 84%', '2.70 – 3.30', 'Proficient Achievement of Cognitive and Practical Competencies'],
        ['C+ / C', '60% – 69%', '2.00 – 2.30', 'Satisfactory / Baseline Minimum Passing Attainment'],
        ['D', '50% – 59%', '1.00 – 1.70', 'Marginal Progress; Remedial Action Required'],
        ['F', 'Below 50%', '0.00', 'Unsatisfactory; Learning Outcomes Not Demonstrated'],
      ],
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        lineColor: colorBorder,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: colorPrimary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 32, halign: 'center' },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: contentWidth - 84 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // 10. Academic Policies & Code of Conduct
  if (config.includePolicies) {
    checkAddPage(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('8. Course & Academic Policies', margin, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Policy Area', 'Requirements & Guidelines']],
      body: [
        ['Academic Integrity & Plagiarism', config.academicIntegrityPolicy],
        ['Attendance & Participation', config.attendancePolicy],
        ['Late Submission Policy', config.lateSubmissionPolicy],
        ['Generative AI Usage Guidelines', config.aiUsagePolicy],
        ['Accessibility & Accommodations', config.accommodationsPolicy],
      ],
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        lineColor: colorBorder,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: colorPrimary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold', fillColor: colorLightBg },
        1: { cellWidth: contentWidth - 45 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // 11. OBE360 & Continuous Quality Improvement (CQI) Statement
  if (config.includeCQIStatement) {
    checkAddPage(22);

    doc.setFillColor(colorAccentBg[0], colorAccentBg[1], colorAccentBg[2]);
    doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('9. Outcome-Based Education (OBE) & Continuous Quality Improvement (CQI)', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitCQI = doc.splitTextToSize(config.cqiStatement, contentWidth - 8);
    doc.text(splitCQI, margin + 4, currentY + 10);
    currentY += 22;
  }

  // Footer for all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`${course.code} ${course.title} • Course Syllabus`, margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  return doc;
}

export function downloadSyllabusPDF(course: Course, config: SyllabusConfig): void {
  const doc = generateSyllabusPDF(course, config);
  const cleanCode = (course.code || 'COURSE').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanCode}_Course_Syllabus.pdf`);
}

function secondaryTextColor(rgb: number[]): number {
  return 71;
}

// ---------------------------------------------------------------------------
// WORD (.DOCX) SYLLABUS GENERATOR
// ---------------------------------------------------------------------------

export async function generateSyllabusDocx(course: Course, config: SyllabusConfig): Promise<Blob> {
  const COLOR_PRIMARY = '1E293B'; // Slate 800
  const COLOR_ACCENT = '4338CA'; // Indigo 700
  const COLOR_ACCENT_BG = 'EEF2FF'; // Indigo 50
  const COLOR_BG_HEADER = '0F172A'; // Slate 900
  const COLOR_BG_ALT = 'F8FAFC'; // Slate 50
  const COLOR_BORDER = 'CBD5E1'; // Slate 300

  const cellBorderDef = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: COLOR_BORDER,
  };
  const tableBorders = {
    top: cellBorderDef,
    bottom: cellBorderDef,
    left: cellBorderDef,
    right: cellBorderDef,
  };

  const createHeadCell = (text: string, widthPct: number, bg: string = COLOR_PRIMARY): TableCell => {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: { fill: bg },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 120, bottom: 120, left: 120, right: 120 },
      borders: tableBorders,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: true,
              color: 'FFFFFF',
              size: 18, // 9pt
              font: 'Calibri',
            }),
          ],
        }),
      ],
    });
  };

  const createCell = (
    text: string,
    widthPct: number,
    opts?: { bold?: boolean; italic?: boolean; bg?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType] }
  ): TableCell => {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: opts?.bg ? { fill: opts.bg } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      borders: tableBorders,
      children: [
        new Paragraph({
          alignment: opts?.align || AlignmentType.LEFT,
          children: [
            new TextRun({
              text,
              bold: opts?.bold,
              italics: opts?.italic,
              color: '1E293B',
              size: 18, // 9pt
              font: 'Calibri',
            }),
          ],
        }),
      ],
    });
  };

  const docChildren: any[] = [];

  // Title Banner
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: config.institutionName.toUpperCase(),
          bold: true,
          size: 20,
          color: COLOR_ACCENT,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: `${config.facultyName} • ${config.departmentName}`,
          size: 18,
          color: '64748B',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: `${course.code}: ${course.title}`,
          bold: true,
          size: 32, // 16pt
          color: COLOR_PRIMARY,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: `Official Course Syllabus  |  ${config.academicTerm} (${config.academicYear})  |  ${course.creditHours} Credits  |  Level: ${course.courseLevel}`,
          italics: true,
          size: 18,
          color: '475569',
          font: 'Calibri',
        }),
      ],
    })
  );

  // Metadata Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createHeadCell('Course Information', 50, COLOR_ACCENT),
            createHeadCell('Instructor & Office Hours', 50, COLOR_ACCENT),
          ],
        }),
        new TableRow({
          children: [
            createCell(`Course Code: ${course.code}\nTitle: ${course.title}\nCredits: ${course.creditHours}\nMode: ${course.deliveryMode} (${course.durationWeeks} Wks)`, 50, { bg: COLOR_BG_ALT }),
            createCell(`Instructor: ${config.instructorName}\nTitle: ${config.instructorTitle}\nEmail: ${config.instructorEmail}\nOffice: ${config.instructorOffice}`, 50),
          ],
        }),
        new TableRow({
          children: [
            createCell(`Prerequisites: ${course.prerequisites || 'None specified'}\nClass Schedule: ${config.classSchedule}\nLocation: ${config.classroomLocation}`, 50, { bg: COLOR_BG_ALT }),
            createCell(`Office Hours: ${config.officeHours}\nSupport / TA: ${config.teachingAssistants || 'N/A'}`, 50),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 200, after: 100 } })
  );

  // Course Overview
  if (config.includeCourseOverview) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: '1. Course Description & Overview', bold: true, size: 24, color: COLOR_PRIMARY, font: 'Calibri' })],
      }),
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: course.description || course.overview || 'Comprehensive course syllabus.', size: 20, font: 'Calibri' })],
      })
    );

    if (course.capstoneGoal || course.learningPromise) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 140 },
          children: [
            new TextRun({ text: 'Capstone Learning Promise: ', bold: true, size: 20, color: COLOR_ACCENT, font: 'Calibri' }),
            new TextRun({ text: course.capstoneGoal || course.learningPromise || '', italics: true, size: 20, font: 'Calibri' }),
          ],
        })
      );
    }
  }

  // Course Learning Outcomes
  if (config.includeCLOs && course.clos && course.clos.length > 0) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({ text: '2. Course Learning Outcomes (CLOs) & Cognitive Alignment', bold: true, size: 24, color: COLOR_PRIMARY, font: 'Calibri' }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createHeadCell('Code', 12),
              createHeadCell('Measurable Learning Outcome Statement', 52),
              createHeadCell("Bloom's Level", 16),
              createHeadCell('Weight', 10),
              createHeadCell('Target', 10),
            ],
          }),
          ...course.clos.map((c) =>
            new TableRow({
              children: [
                createCell(c.code, 12, { bold: true, align: AlignmentType.CENTER }),
                createCell(c.statement, 52),
                createCell(`${c.bloomLevel} (${c.bloomVerb})`, 16, { align: AlignmentType.CENTER }),
                createCell(`${c.weightage || 0}%`, 10, { align: AlignmentType.CENTER }),
                createCell(`${c.achievementThreshold || 60}%`, 10, { align: AlignmentType.CENTER }),
              ],
            })
          ),
        ],
      }),
      new Paragraph({ spacing: { before: 160, after: 80 } })
    );
  }

  // PLO Mapping Matrix
  if (config.includePLOMatrix && course.plos && course.plos.length > 0 && course.clos && course.clos.length > 0) {
    const colWidth = Math.floor(82 / course.plos.length);
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: '3. Program Learning Outcomes (PLO) Mapping Matrix', bold: true, size: 24, color: COLOR_PRIMARY, font: 'Calibri' })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createHeadCell('CLO \\ PLO', 18, COLOR_ACCENT),
              ...course.plos.map((p) => createHeadCell(p.code, colWidth, COLOR_ACCENT)),
            ],
          }),
          ...course.clos.map((c) =>
            new TableRow({
              children: [
                createCell(c.code, 18, { bold: true }),
                ...course.plos.map((p) => {
                  const m = c.mappedPLOs?.find((item) => item.ploId === p.id);
                  const txt = m ? (m.level === 'Introduced' ? 'I' : m.level === 'Reinforced' ? 'R' : 'M') : '—';
                  return createCell(txt, colWidth, { align: AlignmentType.CENTER, bold: Boolean(m) });
                }),
              ],
            })
          ),
        ],
      }),
      new Paragraph({
        spacing: { before: 60, after: 120 },
        children: [
          new TextRun({
            text: 'Mapping Scale:  I = Introduced (Foundational)   •   R = Reinforced (Deepening)   •   M = Mastered (Competent/Synthesizing)',
            italics: true,
            size: 16,
            color: '64748B',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // Textbooks
  if (config.includeTextbooks) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: '4. Textbooks & Required Instructional Materials', bold: true, size: 24, color: COLOR_PRIMARY, font: 'Calibri' })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [createHeadCell('Category', 30), createHeadCell('Description & Citation', 70)],
          }),
          new TableRow({
            children: [createCell('Required Textbooks', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.requiredTextbooks, 70)],
          }),
          new TableRow({
            children: [createCell('Recommended References', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.recommendedReadings, 70)],
          }),
          new TableRow({
            children: [createCell('Technical & Software Tools', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.technicalRequirements, 70)],
          }),
        ],
      }),
      new Paragraph({ spacing: { before: 160, after: 80 } })
    );
  }

  // Weekly Schedule
  if (config.includeWeeklySchedule && course.modules && course.modules.length > 0) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: '5. Modular & Weekly Course Schedule', bold: true, size: 24, color: COLOR_PRIMARY, font: 'Calibri' })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createHeadCell('Module #', 14),
              createHeadCell('Topic Title', 30),
              createHeadCell('Instructional Content & Core Tasks', 44),
              createHeadCell('CLOs', 12),
            ],
          }),
          ...course.modules.map((m, idx) => {
            const cloLabels = m.relatedCLOIds
              ? m.relatedCLOIds
                  .map((id) => course.clos.find((c) => c.id === id)?.code)
                  .filter(Boolean)
                  .join(', ')
              : 'All';
            return new TableRow({
              children: [
                createCell(`Module ${m.number || idx + 1}`, 14, { bold: true, align: AlignmentType.CENTER }),
                createCell(m.title, 30, { bold: true }),
                createCell(m.description || 'Lecture presentations, collaborative tasks, and laboratory modules.', 44),
                createCell(cloLabels || 'General', 12, { align: AlignmentType.CENTER }),
              ],
            });
          }),
        ],
      }),
      new Paragraph({ spacing: { before: 160, after: 80 } })
    );
  }

  // Assessment Scheme
  if (config.includeAssessments && course.assessments && course.assessments.length > 0) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: '6. Assessment Plan & Weightage Breakdown', bold: true, size: 24, color: COLOR_PRIMARY, font: 'Calibri' })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createHeadCell('Assessment Instrument', 34, COLOR_ACCENT),
              createHeadCell('Type', 18, COLOR_ACCENT),
              createHeadCell('Nature', 16, COLOR_ACCENT),
              createHeadCell('Max Marks', 16, COLOR_ACCENT),
              createHeadCell('Course Weight', 16, COLOR_ACCENT),
            ],
          }),
          ...course.assessments.map((a) =>
            new TableRow({
              children: [
                createCell(a.name, 34, { bold: true }),
                createCell(a.type, 18),
                createCell(a.isSummative ? 'Summative' : 'Formative', 16, { align: AlignmentType.CENTER }),
                createCell(`${a.marks || 100} pts`, 16, { align: AlignmentType.CENTER }),
                createCell(`${a.weightage || 0}%`, 16, { bold: true, align: AlignmentType.CENTER }),
              ],
            })
          ),
        ],
      }),
      new Paragraph({ spacing: { before: 160, after: 80 } })
    );
  }

  // Academic Policies
  if (config.includePolicies) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: '7. Course Policies & Academic Regulations', bold: true, size: 24, color: COLOR_PRIMARY, font: 'Calibri' })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [createHeadCell('Policy Area', 30), createHeadCell('Institutional Requirements', 70)],
          }),
          new TableRow({
            children: [createCell('Academic Integrity', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.academicIntegrityPolicy, 70)],
          }),
          new TableRow({
            children: [createCell('Attendance & Participation', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.attendancePolicy, 70)],
          }),
          new TableRow({
            children: [createCell('Late Submissions', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.lateSubmissionPolicy, 70)],
          }),
          new TableRow({
            children: [createCell('AI Usage in Coursework', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.aiUsagePolicy, 70)],
          }),
          new TableRow({
            children: [createCell('Disability Accommodations', 30, { bold: true, bg: COLOR_BG_ALT }), createCell(config.accommodationsPolicy, 70)],
          }),
        ],
      }),
      new Paragraph({ spacing: { before: 160, after: 80 } })
    );
  }

  // CQI Statement
  if (config.includeCQIStatement) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 80 },
        children: [
          new TextRun({
            text: '8. Continuous Quality Improvement (CQI) & OBE Compliance',
            bold: true,
            size: 24,
            color: COLOR_ACCENT,
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: config.cqiStatement,
            italics: true,
            size: 19,
            color: '334155',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${course.code} ${course.title} — Official Course Syllabus`,
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function downloadSyllabusDocx(course: Course, config: SyllabusConfig): Promise<void> {
  const blob = await generateSyllabusDocx(course, config);
  const cleanCode = (course.code || 'COURSE').replace(/[^a-zA-Z0-9_-]/g, '_');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanCode}_Course_Syllabus.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateSyllabusMarkdown(course: Course, config: SyllabusConfig): string {
  let md = `# ${config.institutionName}\n`;
  md += `## ${config.facultyName} • ${config.departmentName}\n\n`;
  md += `# ${course.code}: ${course.title}\n`;
  md += `**Term:** ${config.academicTerm} (${config.academicYear}) | **Credits:** ${course.creditHours} | **Delivery:** ${course.deliveryMode}\n\n`;

  md += `### Instructor Information\n`;
  md += `- **Instructor:** ${config.instructorName} (${config.instructorTitle})\n`;
  md += `- **Email:** ${config.instructorEmail}\n`;
  md += `- **Office:** ${config.instructorOffice}\n`;
  md += `- **Office Hours:** ${config.officeHours}\n`;
  md += `- **Meeting Schedule:** ${config.classSchedule}\n`;
  md += `- **Location:** ${config.classroomLocation}\n\n`;

  if (config.includeCourseOverview) {
    md += `### Course Description\n${course.description || course.overview || ''}\n\n`;
    if (course.capstoneGoal) {
      md += `> **Course Capstone Goal:** ${course.capstoneGoal}\n\n`;
    }
  }

  if (config.includeCLOs && course.clos.length > 0) {
    md += `### Course Learning Outcomes (CLOs)\n`;
    md += `| Code | Outcome Statement | Bloom's Level | Verb | Weight |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: |\n`;
    course.clos.forEach((c) => {
      md += `| **${c.code}** | ${c.statement} | ${c.bloomLevel} | ${c.bloomVerb} | ${c.weightage}% |\n`;
    });
    md += `\n`;
  }

  if (config.includeAssessments && course.assessments.length > 0) {
    md += `### Assessment & Evaluation Scheme\n`;
    md += `| Assessment Instrument | Type | Nature | Weight |\n`;
    md += `| :--- | :--- | :---: | :---: |\n`;
    course.assessments.forEach((a) => {
      md += `| **${a.name}** | ${a.type} | ${a.isSummative ? 'Summative' : 'Formative'} | ${a.weightage}% |\n`;
    });
    md += `\n`;
  }

  if (config.includeTextbooks) {
    md += `### Textbooks & Resources\n`;
    md += `- **Required:** ${config.requiredTextbooks.replace(/\n/g, '; ')}\n`;
    md += `- **Recommended:** ${config.recommendedReadings.replace(/\n/g, '; ')}\n\n`;
  }

  if (config.includePolicies) {
    md += `### Academic Policies\n`;
    md += `- **Academic Integrity:** ${config.academicIntegrityPolicy}\n`;
    md += `- **Attendance:** ${config.attendancePolicy}\n`;
    md += `- **Late Work:** ${config.lateSubmissionPolicy}\n`;
    md += `- **AI Policy:** ${config.aiUsagePolicy}\n`;
    md += `- **Accommodations:** ${config.accommodationsPolicy}\n\n`;
  }

  md += `---\n*Generated automatically with OBE360 Curriculum System.*`;
  return md;
}
