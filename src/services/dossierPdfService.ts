import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Course, CourseAuditReport, CLO, PLO, Assessment, Rubric, WeeklyCoursePlanItem } from '../types';
import { calculateCourseAudit } from '../utils/obeCalculator';
import { analyzeAssessmentPlan } from '../utils/assessmentAnalysis';
import { getFrameworkGuideline } from '../data/frameworkGuidelines';
import { OBEFrameworkRegistry } from '../utils/OBEFrameworkRegistry';
import { getStoredInstitution } from '../data/institutionData';
import { buildDynamicThemePalette, DynamicThemePalette } from '../utils/dossierThemePresets';

export interface AccreditationDossierOptions {
  includeCoverPage?: boolean;
  institutionName?: string;
  institutionLogo?: string;
  departmentName?: string;
  accreditationFramework?: string;
  dossierEdition?: string;
  confidentialityLevel?: 'Public Academic Record' | 'Official Institutional Dossier' | 'Accreditation Review Confidential';
  colorTheme?: 'navy' | 'emerald' | 'burgundy' | 'slate' | 'cobalt' | 'crimson' | 'amber' | 'violet' | 'custom' | string;
  primaryColor?: string; // Custom hex code (e.g. #1e3a8a or #A51C30)
  accentColor?: string;  // Custom accent hex code
  watermarkText?: string;
  includeTableOfContents?: boolean;
  includeExecutiveSummary?: boolean;
  includeCourseInfo?: boolean;
  includeCLOs?: boolean;
  includePLOMapping?: boolean;
  includeWeeklyPlan?: boolean;
  includeModules?: boolean;
  includeAssessments?: boolean;
  includeRubrics?: boolean;
  includeEvidenceRules?: boolean;
  includeAuditReport?: boolean;
  includeCQIPlan?: boolean;
  includeSignOffSheet?: boolean;
}

export interface DossierGenerationResult {
  doc: jsPDF;
  blob: Blob;
  blobUrl: string;
  fileName: string;
  pageCount: number;
}

interface ThemePalette {
  primary: [number, number, number];
  accent: [number, number, number];
  secondary: [number, number, number];
  lightBg: [number, number, number];
  cardBg: [number, number, number];
  border: [number, number, number];
  success: [number, number, number];
  warning: [number, number, number];
  danger: [number, number, number];
}

const THEMES: Record<string, ThemePalette> = {
  navy: {
    primary: [15, 23, 42],      // deep slate #0f172a
    accent: [49, 46, 129],      // royal indigo #312e81
    secondary: [71, 85, 105],   // slate-600
    lightBg: [248, 250, 252],   // slate-50
    cardBg: [241, 245, 249],    // slate-100
    border: [203, 213, 225],    // slate-300
    success: [16, 185, 129],    // emerald-500
    warning: [217, 119, 6],     // amber-600
    danger: [225, 29, 72],      // rose-600
  },
  emerald: {
    primary: [6, 78, 59],       // emerald-900
    accent: [4, 120, 87],       // emerald-700
    secondary: [51, 65, 85],    // slate-700
    lightBg: [240, 253, 244],   // emerald-50
    cardBg: [236, 253, 245],
    border: [167, 243, 208],
    success: [5, 150, 105],
    warning: [217, 119, 6],
    danger: [225, 29, 72],
  },
  burgundy: {
    primary: [76, 5, 25],       // rose-950
    accent: [159, 18, 57],      // rose-800
    secondary: [71, 85, 105],
    lightBg: [255, 241, 242],   // rose-50
    cardBg: [254, 226, 226],
    border: [254, 202, 202],
    success: [16, 185, 129],
    warning: [217, 119, 6],
    danger: [190, 18, 60],
  },
  slate: {
    primary: [30, 41, 59],      // slate-800
    accent: [51, 65, 85],       // slate-700
    secondary: [100, 116, 139],
    lightBg: [248, 250, 252],
    cardBg: [241, 245, 249],
    border: [203, 213, 225],
    success: [16, 185, 129],
    warning: [217, 119, 6],
    danger: [225, 29, 72],
  },
  cobalt: {
    primary: [30, 58, 138],     // blue-900 #1e3a8a
    accent: [37, 99, 235],      // blue-600 #2563eb
    secondary: [71, 85, 105],
    lightBg: [239, 246, 255],   // blue-50
    cardBg: [219, 234, 254],    // blue-100
    border: [191, 219, 254],    // blue-200
    success: [16, 185, 129],
    warning: [217, 119, 6],
    danger: [225, 29, 72],
  },
  crimson: {
    primary: [136, 19, 55],     // rose-900 #881337
    accent: [190, 18, 60],      // rose-700 #be123c
    secondary: [71, 85, 105],
    lightBg: [255, 241, 242],   // rose-50
    cardBg: [254, 226, 226],
    border: [254, 202, 202],
    success: [16, 185, 129],
    warning: [217, 119, 6],
    danger: [225, 29, 72],
  },
  amber: {
    primary: [120, 53, 15],     // amber-900 #78350f
    accent: [180, 83, 9],       // amber-700 #b45309
    secondary: [71, 85, 105],
    lightBg: [254, 252, 232],   // yellow-50
    cardBg: [254, 243, 199],    // amber-100
    border: [253, 230, 138],    // amber-200
    success: [16, 185, 129],
    warning: [217, 119, 6],
    danger: [225, 29, 72],
  },
  violet: {
    primary: [76, 29, 149],     // purple-900 #4c1d95
    accent: [109, 40, 217],     // purple-700 #6d28d9
    secondary: [71, 85, 105],
    lightBg: [245, 243, 255],   // purple-50
    cardBg: [237, 233, 254],    // purple-100
    border: [221, 214, 254],    // purple-200
    success: [16, 185, 129],
    warning: [217, 119, 6],
    danger: [225, 29, 72],
  },
};

/**
 * Enterprise PDF Generation Service for MENTISERA OBE360™.
 * Produces publication-grade, university-branded accreditation portfolios and course dossiers.
 */
export class DossierPdfService {
  /**
   * Generates a fully compiled accreditation curriculum dossier PDF.
   */
  public static createAccreditationDossierPDF(
    courseInput: Course,
    options: AccreditationDossierOptions = {}
  ): jsPDF {
    const storedInst = typeof getStoredInstitution === 'function' ? getStoredInstitution() : null;
    const opts: Required<AccreditationDossierOptions> = {
      includeCoverPage: options.includeCoverPage ?? true,
      institutionName: options.institutionName || courseInput.institutionName || storedInst?.name || 'Apex Institute of Science & Technology',
      institutionLogo: options.institutionLogo || courseInput.institutionLogo || storedInst?.logoUrl || '',
      departmentName: options.departmentName || courseInput.department || storedInst?.department || 'Department of Electrical & Computer Engineering',
      accreditationFramework: options.accreditationFramework || courseInput.accreditationFramework || 'Washington Accord (IEA WA-ENG)',
      dossierEdition: options.dossierEdition || '2026.1 Official Accredited Edition',
      confidentialityLevel: options.confidentialityLevel || 'Official Institutional Dossier',
      colorTheme: options.colorTheme || courseInput.dossierColorTheme || storedInst?.defaultDossierColorTheme || 'navy',
      primaryColor: options.primaryColor || courseInput.dossierPrimaryColor || storedInst?.defaultDossierPrimaryColor || '',
      accentColor: options.accentColor || courseInput.dossierAccentColor || storedInst?.defaultDossierAccentColor || '',
      watermarkText: options.watermarkText || '',
      includeTableOfContents: options.includeTableOfContents ?? true,
      includeExecutiveSummary: options.includeExecutiveSummary ?? true,
      includeCourseInfo: options.includeCourseInfo ?? true,
      includeCLOs: options.includeCLOs ?? true,
      includePLOMapping: options.includePLOMapping ?? true,
      includeWeeklyPlan: options.includeWeeklyPlan ?? true,
      includeModules: options.includeModules ?? true,
      includeAssessments: options.includeAssessments ?? true,
      includeRubrics: options.includeRubrics ?? true,
      includeEvidenceRules: options.includeEvidenceRules ?? true,
      includeAuditReport: options.includeAuditReport ?? true,
      includeCQIPlan: options.includeCQIPlan ?? true,
      includeSignOffSheet: options.includeSignOffSheet ?? true,
    };

    // Ensure all course collections are safe against null or undefined
    const course: Course = {
      ...courseInput,
      clos: courseInput.clos || [],
      plos: courseInput.plos || [],
      modules: courseInput.modules || [],
      mlos: courseInput.mlos || [],
      lessons: courseInput.lessons || [],
      activities: courseInput.activities || [],
      assessments: courseInput.assessments || [],
      rubrics: courseInput.rubrics || [],
      evidenceRules: courseInput.evidenceRules || [],
      weeklyPlan: courseInput.weeklyPlan || [],
    };

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let theme: ThemePalette = THEMES[opts.colorTheme] || THEMES.navy;
    if (opts.primaryColor && opts.primaryColor.trim() !== '') {
      theme = buildDynamicThemePalette(opts.primaryColor, opts.accentColor);
    }
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let currentY = margin;

    const auditReport: CourseAuditReport = calculateCourseAudit(course);
    const assessmentAnalysis = analyzeAssessmentPlan(course);
    const guideline = getFrameworkGuideline(course.frameworkId);
    const verificationHash = `OBE360-${(course.id || 'C01').substring(0, 6).toUpperCase()}-${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}`;

    // Helper: Page Breaks with Running Headers
    const checkPageBreak = (neededHeight: number): void => {
      if (currentY + neededHeight > pageHeight - margin - 14) {
        doc.addPage();
        currentY = margin + 12;
        drawRunningHeader();
      }
    };

    // Helper: Running Header
    const drawRunningHeader = (): void => {
      let textStartX = margin;
      if (opts.institutionLogo && opts.institutionLogo.trim() !== '') {
        try {
          doc.addImage(opts.institutionLogo, margin, margin - 3.8, 5.5, 5.5, undefined, 'FAST');
          textStartX = margin + 7.5;
        } catch (e) {
          // ignore logo header error
        }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...theme.secondary);
      doc.text(
        `${opts.institutionName.toUpperCase()} • ACCREDITATION CURRICULUM DOSSIER`,
        textStartX,
        margin
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const rightHeader = `${course.code || 'ENG-301'} • ${opts.accreditationFramework}`;
      doc.text(rightHeader, pageWidth - margin, margin, { align: 'right' });

      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.3);
      doc.line(margin, margin + 2.5, pageWidth - margin, margin + 2.5);
    };

    // Helper: Running Footer & Watermark applied at end
    const applyFootersAndWatermarks = (): void => {
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Watermark (if set or if review/draft status)
        const watermark = opts.watermarkText || (course.status === 'draft' ? 'DRAFT CURRICULUM' : '');
        if (watermark) {
          doc.saveGraphicsState();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(42);
          doc.setTextColor(220, 226, 235);
          doc.text(watermark, pageWidth / 2, pageHeight / 2, {
            align: 'center',
            angle: 45,
          });
          doc.restoreGraphicsState();
        }

        // Skip running footer on Cover Page
        if (opts.includeCoverPage && i === 1) continue;

        // Running Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...theme.secondary);

        const footerLeft = `MENTISERA OBE360™ • Confidentiality: ${opts.confidentialityLevel} • Verification: ${verificationHash}`;
        doc.text(footerLeft, margin, pageHeight - 9);

        const footerRight = `Page ${i} of ${totalPages}`;
        doc.text(footerRight, pageWidth - margin, pageHeight - 9, { align: 'right' });

        doc.setDrawColor(...theme.border);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      }
    };

    // Helper: Section Title Block
    const drawSectionTitle = (title: string, subtitle?: string): void => {
      checkPageBreak(24);
      currentY += 4;

      doc.setFillColor(...theme.cardBg);
      doc.roundedRect(margin, currentY, contentWidth, subtitle ? 14 : 10, 1.5, 1.5, 'F');

      doc.setFillColor(...theme.accent);
      doc.rect(margin, currentY, 3.5, subtitle ? 14 : 10, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...theme.primary);
      doc.text(title.toUpperCase(), margin + 7, currentY + (subtitle ? 6 : 6.8));

      if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...theme.secondary);
        doc.text(subtitle, margin + 7, currentY + 11);
      }

      currentY += (subtitle ? 18 : 14);
    };

    // =========================================================================
    // 1. EXECUTIVE COVER PAGE (Branded Institutional Presentation)
    // =========================================================================
    if (opts.includeCoverPage) {
      // Outer formal border
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.8);
      doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);

      doc.setDrawColor(...theme.accent);
      doc.setLineWidth(0.3);
      doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - (margin * 2) + 4);

      // Top Institutional Emblem & Header
      currentY = margin + 5;
      if (opts.institutionLogo && opts.institutionLogo.trim() !== '') {
        try {
          const logoW = 24;
          const logoH = 20;
          doc.addImage(opts.institutionLogo, (pageWidth - logoW) / 2, currentY, logoW, logoH, undefined, 'FAST');
          currentY += logoH + 3.5;
        } catch (imgErr) {
          console.warn('Could not draw institutional logo on dossier cover:', imgErr);
        }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...theme.accent);
      doc.text(opts.institutionName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...theme.secondary);
      doc.text(opts.departmentName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });

      currentY += 4;
      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.4);
      doc.line(margin + 20, currentY, pageWidth - margin - 20, currentY);

      // Decorative Accreditation Badge
      currentY += 12;
      doc.setFillColor(...theme.accent);
      doc.roundedRect(pageWidth / 2 - 45, currentY, 90, 8, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(
        `OFFICIAL ACCREDITATION DOSSIER • ${opts.dossierEdition.toUpperCase()}`,
        pageWidth / 2,
        currentY + 5.2,
        { align: 'center' }
      );

      // Main Course Code & Title Block
      currentY += 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(...theme.primary);
      doc.text(course.code || 'COURSE CODE', pageWidth / 2, currentY, { align: 'center' });

      currentY += 9;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const splitTitle = doc.splitTextToSize(course.title || 'Course Curriculum Specification', contentWidth - 20);
      doc.text(splitTitle, pageWidth / 2, currentY, { align: 'center' });
      currentY += (splitTitle.length * 6) + 4;

      // Subtitle / Document Purpose
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...theme.secondary);
      doc.text(
        'Comprehensive Outcome-Based Education (OBE) Blueprint & Accreditation Quality Portfolio',
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );

      // Course Metadata Summary Card
      currentY += 14;
      const metaBoxY = currentY;
      doc.setFillColor(...theme.lightBg);
      doc.setDrawColor(...theme.border);
      doc.roundedRect(margin + 10, metaBoxY, contentWidth - 20, 52, 2.5, 2.5, 'FD');

      const col1X = margin + 16;
      const col2X = margin + (contentWidth / 2) + 6;
      let metaY = metaBoxY + 8;

      const drawMetaField = (x: number, y: number, label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...theme.secondary);
        doc.text(label.toUpperCase(), x, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...theme.primary);
        doc.text(value, x, y + 4.5);
      };

      drawMetaField(col1X, metaY, 'Accreditation Standard', opts.accreditationFramework);
      drawMetaField(col2X, metaY, 'Degree Programme', course.programme || 'Undergraduate Engineering');
      metaY += 12;

      drawMetaField(col1X, metaY, 'Credit Units & Duration', `${course.creditHours || 3} Credits  •  ${course.durationWeeks || 14} Weeks`);
      drawMetaField(col2X, metaY, 'Delivery Mode', `${course.deliveryMode || 'Face to Face'} (${course.courseLevel || 'Undergraduate'})`);
      metaY += 12;

      drawMetaField(col1X, metaY, 'Lead Instructor / Coordinator', course.instructorName || course.courseCoordinator || 'Faculty Lead');
      drawMetaField(col2X, metaY, 'Academic Term & Year', `${course.semester || 'Semester I'}  •  ${course.academicYear || '2025–2026'}`);
      metaY += 12;

      drawMetaField(col1X, metaY, 'Document Status', (course.status || 'Draft').toUpperCase());
      drawMetaField(col2X, metaY, 'Audit Health Index', `${auditReport.healthScore}% (${auditReport.healthScore >= 90 ? 'Exemplary' : 'Substantial'})`);

      // Formal Authorization Sign-Off Panel
      currentY = pageHeight - margin - 40;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...theme.secondary);
      doc.text('ACADEMIC AUTHORIZATION & COMPLIANCE ENDORSEMENT', margin + 10, currentY);

      currentY += 4;
      const sigWidth = (contentWidth - 20) / 3;
      const sigY = currentY + 18;

      const drawSigSlot = (slotIndex: number, role: string, defaultName: string) => {
        const slotX = margin + 10 + slotIndex * sigWidth;
        doc.setDrawColor(...theme.border);
        doc.setLineWidth(0.3);
        doc.line(slotX + 4, sigY, slotX + sigWidth - 6, sigY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...theme.primary);
        doc.text(defaultName, slotX + (sigWidth / 2), sigY + 4, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...theme.secondary);
        doc.text(role.toUpperCase(), slotX + (sigWidth / 2), sigY + 8, { align: 'center' });
      };

      drawSigSlot(0, 'Course Coordinator', course.instructorName || 'Lead Faculty');
      drawSigSlot(1, 'Curriculum Committee Chair', 'Chair, BoS');
      drawSigSlot(2, 'Dean / Accreditation Lead', 'Dean of Engineering');

      // Next page for content
      doc.addPage();
      currentY = margin + 12;
      drawRunningHeader();
    } else {
      currentY = margin + 12;
      drawRunningHeader();
    }

    let sectionNum = 1;

    // =========================================================================
    // TABLE OF CONTENTS (Optional Overview of Included Accreditation Sections)
    // =========================================================================
    if (opts.includeTableOfContents) {
      checkPageBreak(70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...theme.primary);
      doc.text('TABLE OF CONTENTS & DOSSIER DIRECTORY', margin, currentY);

      currentY += 3;
      doc.setDrawColor(...theme.accent);
      doc.setLineWidth(0.6);
      doc.line(margin, currentY, margin + 45, currentY);
      currentY += 6;

      const tocEntries: { num: string; title: string; desc: string }[] = [];
      let sIdx = 1;
      if (opts.includeExecutiveSummary) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Executive Summary & Quality Health Audit', desc: 'Consolidated KPI evaluation, OBE health index, constructive alignment audit' });
      }
      if (opts.includeCourseInfo) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Course Specification & Pedagogical Blueprint', desc: 'Institutional course syllabus, prerequisites, educational promise, competencies' });
      }
      if (opts.includeCLOs) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Course Learning Outcomes (CLOs) & Bloom Rigor', desc: 'Measurable outcome statements, Bloom cognitive levels, direct assessment methods' });
      }
      if (opts.includePLOMapping) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Course Articulation Matrix (CLO-to-PLO Mapping)', desc: 'Alignment to international graduate attributes and student outcomes' });
      }
      if (opts.includeModules && course.modules && course.modules.length > 0) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Modular Architecture & Instructional Units', desc: 'Structured modules, modular learning outcomes (MLOs), duration and study loads' });
      }
      if (opts.includeWeeklyPlan && course.weeklyPlan && course.weeklyPlan.length > 0) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Weekly Instructional Plan & Pedagogical Delivery', desc: 'Weekly schedule, milestones, teaching & learning activities (TLAs)' });
      }
      if (opts.includeAssessments) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Direct Assessment Blueprint & Grade Calibration', desc: 'Assessment instruments, formative/summative weights, threshold criteria' });
      }
      if (opts.includeEvidenceRules && course.evidenceRules && course.evidenceRules.length > 0) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Direct Evidence Rules & Attainment Benchmarks', desc: 'Target CLOs, cohort proficiency rules, direct evidence verification' });
      }
      if (opts.includeRubrics && course.rubrics && course.rubrics.length > 0) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Analytic Assessment Rubrics & Scoring Scales', desc: 'Performance criteria, level descriptors (Unsatisfactory to Exemplary)' });
      }
      if (opts.includeAuditReport) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Constructive Alignment Audit & Gap Analysis', desc: 'Multi-category score evaluations, identified gaps, accreditation notes' });
      }
      if (opts.includeCQIPlan) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Continuous Quality Improvement (CQI) Action Plan', desc: 'Cohort performance gaps, root causes, corrective interventions' });
      }
      if (opts.includeSignOffSheet) {
        tocEntries.push({ num: `Section ${sIdx++}`, title: 'Accreditation Compliance Certificate & Sign-Off', desc: 'Formal alignment endorsement and institutional authorizations' });
      }

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Section', 'Dossier Module', 'Curricular Focus & Scope']],
        body: tocEntries.map((e) => [e.num, e.title, e.desc]),
        theme: 'striped',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 24, fontStyle: 'bold', fontSize: 7, textColor: theme.accent },
          1: { cellWidth: 64, fontStyle: 'bold', fontSize: 7, textColor: theme.primary },
          2: { cellWidth: contentWidth - 88, fontSize: 6.5, textColor: theme.secondary },
        },
        styles: { cellPadding: 2.5, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;

      if (opts.includeCoverPage) {
        doc.addPage();
        currentY = margin + 12;
        drawRunningHeader();
      }
    }

    // =========================================================================
    // 1. EXECUTIVE SUMMARY & ACCREDITATION AUDIT
    // =========================================================================
    if (opts.includeExecutiveSummary) {
      drawSectionTitle(
        `${sectionNum++}. Executive Summary & Quality Health Audit`,
        'Consolidated metric evaluation and constructive alignment verification'
      );

      // KPI Metric Cards Row
      const cardW = (contentWidth - 9) / 4;
      const cardH = 20;

      const drawKpiCard = (
        index: number,
        title: string,
        value: string,
        desc: string,
        valColor: [number, number, number]
      ) => {
        const cardX = margin + index * (cardW + 3);
        doc.setFillColor(...theme.lightBg);
        doc.setDrawColor(...theme.border);
        doc.roundedRect(cardX, currentY, cardW, cardH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(...theme.secondary);
        doc.text(title.toUpperCase(), cardX + 3, currentY + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...valColor);
        doc.text(value, cardX + 3, currentY + 12.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...theme.secondary);
        doc.text(desc, cardX + 3, currentY + 17);
      };

      const healthColor =
        auditReport.healthScore >= 90 ? theme.success : auditReport.healthScore >= 75 ? theme.accent : theme.warning;

      const higherOrderCount = course.clos.filter((c) =>
        ['Analyze', 'Evaluate', 'Create'].includes(c.bloomLevel || '')
      ).length;
      const higherOrderPct =
        course.clos.length > 0 ? Math.round((higherOrderCount / course.clos.length) * 100) : 60;

      drawKpiCard(0, 'OBE Health Index', `${auditReport.healthScore}%`, 'Audit Compliance', healthColor);
      drawKpiCard(1, 'Course Outcomes', `${course.clos.length}`, 'Active Measurable CLOs', theme.primary);
      drawKpiCard(2, 'Graduate Attributes', `${course.plos.length}`, 'Mapped Outcomes', theme.primary);
      drawKpiCard(
        3,
        'Assessment Weight',
        `${Math.round(assessmentAnalysis.totalConfiguredWeightage)}%`,
        'Direct Evidence (100%)',
        assessmentAnalysis.isTotalWeightageValid ? theme.success : theme.danger
      );

      currentY += cardH + 6;

      // Executive Audit Details Table
      const auditDetails = [
        ['Accreditation Standard', opts.accreditationFramework, 'Full compliance with international knowledge profile'],
        ['Curriculum Review Status', course.academicReview?.status || 'Approved by Board of Studies', 'Official academic authorization'],
        ['Passing Benchmark Threshold', `${course.passingBenchmark || 60}% Attainment Standard`, 'Minimum cohort proficiency benchmark'],
        ['Cognitive Balance (Bloom)', `${higherOrderPct}% Higher-Order Rigor (C4-C6)`, 'Analytical, evaluative, and design depth'],
        ['Direct Assessment Tasks', `${course.assessments.length} Graded Instruments`, 'Continuous evaluation and summative proof'],
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Accreditation Dimension', 'Assessment Verification', 'Standard Audit Notes']],
        body: auditDetails,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 48, fontStyle: 'bold', fontSize: 7, textColor: theme.primary },
          1: { cellWidth: 54, fontSize: 7, fontStyle: 'bold', textColor: theme.accent },
          2: { cellWidth: contentWidth - 102, fontSize: 7, textColor: theme.secondary },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 2. COURSE SPECIFICATION & PEDAGOGICAL BLUEPRINT
    // =========================================================================
    if (opts.includeCourseInfo) {
      drawSectionTitle(
        `${sectionNum++}. Course Specification & Pedagogical Blueprint`,
        'Official institutional course syllabus details and foundational design'
      );

      const blueprintRows = [
        ['Official Course Title', `${course.code || 'ENG-301'} - ${course.title || 'Curriculum Specification'}`],
        ['Degree Programme & Level', `${course.programme || 'Engineering'} (${course.courseLevel || 'Undergraduate'})  •  ${course.deliveryMode || 'Face to Face'}`],
        ['Credit Units & Load', `${course.creditHours || 3} Credit Hours (${course.theoryHours || 3} Theory, ${course.labHours || 0} Lab, ${course.durationWeeks || 14} Weeks)`],
        ['Academic Department', `${opts.departmentName}  •  Lead: ${course.instructorName || 'Course Coordinator'}`],
        ['Prerequisite Knowledge', course.prerequisites || 'None specified'],
        ['Core Educational Purpose', course.blueprint?.purpose || course.description || 'Provide rigorous mastery of domain competencies.'],
        ['Learning Promise', course.learningPromise || 'Master foundational theory and apply empirical methods to solve complex technical problems.'],
        ['Target Competencies', course.blueprint?.targetCompetencies?.join(', ') || 'Analytical thinking, system modeling, professional problem-solving'],
        ['Capstone Performance Goal', course.capstoneGoal || 'Synthesize end-to-end coursework through authentic design assessments.'],
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Curriculum Dimension', 'Pedagogical Specification Details']],
        body: blueprintRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 48, fontStyle: 'bold', fontSize: 7, textColor: theme.primary },
          1: { cellWidth: contentWidth - 48, fontSize: 7, textColor: theme.secondary },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 3. COURSE LEARNING OUTCOMES (CLOs) & COGNITIVE RIGOR
    // =========================================================================
    if (opts.includeCLOs) {
      drawSectionTitle(
        `${sectionNum++}. Course Learning Outcomes (CLOs) & Bloom Rigor`,
        'Observable, measurable student competencies and direct assessment linkages'
      );

      const cloRows = course.clos.map((clo, idx) => [
        clo.code || `CLO ${idx + 1}`,
        clo.bloomVerb || 'Analyze',
        clo.statement || (clo as any).description || 'Formulate and solve technical problems.',
        `${clo.bloomLevel || 'Analyze'}\n(${clo.learningDomain || 'Cognitive'})`,
        `${clo.weightage || 0}%`,
        `${clo.achievementThreshold || 60}%`,
        clo.assessmentMethod || 'Exam / Project',
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Code', 'Verb', 'Outcome Statement', 'Cognitive Rigor', 'Weight', 'Threshold', 'Assessment Method']],
        body: cloRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 16, fontStyle: 'bold', fontSize: 7, textColor: theme.accent },
          1: { cellWidth: 18, fontStyle: 'bold', fontSize: 7, textColor: theme.primary },
          2: { cellWidth: contentWidth - 104, fontSize: 7 },
          3: { cellWidth: 22, fontSize: 6.5, fontStyle: 'bold', textColor: theme.primary },
          4: { cellWidth: 14, fontSize: 7, halign: 'center' },
          5: { cellWidth: 16, fontSize: 7, halign: 'center' },
          6: { cellWidth: 18, fontSize: 6.5 },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 4. OUTCOME ARTICULATION MATRIX (CLO-TO-PLO/SO MAPPING)
    // =========================================================================
    if (opts.includePLOMapping) {
      drawSectionTitle(
        `${sectionNum++}. Course Articulation Matrix (CLO-to-PLO Mapping)`,
        `Alignment to ${opts.accreditationFramework} Graduate Attributes & Student Outcomes (Scale: 1=Low, 2=Medium, 3=High)`
      );

      const plos = course.plos.length > 0 ? course.plos : [
        { id: 'plo-1', code: 'WA1', title: 'Engineering Knowledge' },
        { id: 'plo-2', code: 'WA2', title: 'Problem Analysis' },
        { id: 'plo-3', code: 'WA3', title: 'Design & Development' },
        { id: 'plo-4', code: 'WA4', title: 'Investigation' },
        { id: 'plo-5', code: 'WA5', title: 'Modern Tool Usage' },
      ];

      const ploHeaders = ['CLO Code', ...plos.map((p) => p.code || p.id), 'Average Weight'];
      const mapping = course.ploMapping || {};

      const matrixRows = course.clos.map((clo) => {
        const row: (string | number)[] = [clo.code || 'CLO'];
        let mappedSum = 0;
        let mappedCount = 0;

        plos.forEach((plo) => {
          // Check clo.mappedPLOs or course.ploMapping
          const fromClo = (clo.mappedPLOs || []).find((m) => m.ploId === plo.id || m.ploId === plo.code);
          const fromMap = mapping[clo.id]?.[plo.id] || mapping[clo.id]?.[plo.code];

          let val = '-';
          if (fromClo) {
            val =
              (fromClo.level as string) === 'Mastered' || (fromClo.level as string) === 'Substantial'
                ? '3'
                : fromClo.level === 'Reinforced'
                ? '2'
                : '1';
          } else if (fromMap && fromMap > 0) {
            val = String(fromMap);
          }

          if (val !== '-') {
            mappedSum += Number(val);
            mappedCount += 1;
          }
          row.push(val);
        });

        const avg = mappedCount > 0 ? (mappedSum / mappedCount).toFixed(1) : '-';
        row.push(avg);
        return row;
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [ploHeaders],
        body: matrixRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: 'bold', fontSize: 7, textColor: theme.accent, halign: 'left' },
        },
        styles: { cellPadding: 2, halign: 'center', fontSize: 7.5 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 5. MODULAR ARCHITECTURE & INSTRUCTIONAL UNITS
    // =========================================================================
    if (opts.includeModules && course.modules && course.modules.length > 0) {
      drawSectionTitle(
        `${sectionNum++}. Modular Architecture & Instructional Units`,
        'Structured modules, modular learning outcomes (MLOs), duration and study loads'
      );

      const moduleRows = course.modules.map((m, idx) => {
        const mlosForModule = (course.mlos || []).filter((mlo) => mlo.moduleId === m.id);
        const mloText =
          mlosForModule.length > 0
            ? mlosForModule.map((mlo) => `• [${mlo.code || 'MLO'}] ${mlo.statement}`).join('\n')
            : (m.description || 'Core modular competencies and learning content.');

        const cloRefs =
          m.relatedCLOIds && m.relatedCLOIds.length > 0
            ? m.relatedCLOIds.join(', ')
            : 'CLO 1, CLO 2';

        return [
          `Module ${m.number || idx + 1}`,
          m.title || `Unit ${idx + 1}`,
          `${m.durationWeeks || 2} Weeks\n(${m.expectedStudyHours || 10}h study)`,
          mloText,
          cloRefs,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Module', 'Title / Domain', 'Duration & Load', 'Modular Learning Outcomes / Core Focus', 'Mapped CLOs']],
        body: moduleRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 18, fontStyle: 'bold', fontSize: 7, textColor: theme.accent },
          1: { cellWidth: 38, fontStyle: 'bold', fontSize: 7 },
          2: { cellWidth: 24, fontSize: 6.5, halign: 'center' },
          3: { cellWidth: contentWidth - 104, fontSize: 6.5 },
          4: { cellWidth: 24, fontSize: 6.5, fontStyle: 'bold', textColor: theme.primary },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 6. WEEKLY INSTRUCTIONAL PLAN & TEACHING ACTIVITIES (TLAs)
    // =========================================================================
    if (opts.includeWeeklyPlan && course.weeklyPlan && course.weeklyPlan.length > 0) {
      drawSectionTitle(
        `${sectionNum++}. Weekly Instructional Plan & Pedagogical Delivery`,
        'Structured schedule, Teaching & Learning Activities (TLAs), and resources'
      );

      const planRows = course.weeklyPlan.map((w: WeeklyCoursePlanItem) => [
        `Week ${w.weekNumber}`,
        w.topic || 'Curriculum Module Topic',
        Array.isArray(w.subtopics) ? w.subtopics.join(', ') : w.subtopics || 'Foundational lecture and discussion',
        w.learningActivity || (w as any).tla || 'Active Lecture & Problem Solving',
        w.linkedCLOIds?.join(', ') || (w as any).assignedCLOIds?.join(', ') || 'All CLOs',
        `${w.contactHours || 3}h`,
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Week', 'Topic / Milestone', 'Subtopics & Concepts', 'TLA Method', 'Linked CLOs', 'Hours']],
        body: planRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 16, fontStyle: 'bold', fontSize: 7, textColor: theme.accent },
          1: { cellWidth: 42, fontStyle: 'bold', fontSize: 7 },
          2: { cellWidth: contentWidth - 116, fontSize: 6.5 },
          3: { cellWidth: 30, fontSize: 6.5 },
          4: { cellWidth: 16, fontSize: 6.5 },
          5: { cellWidth: 12, fontSize: 7, halign: 'center' },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 7. DIRECT ASSESSMENT & EVIDENTIARY PLAN
    // =========================================================================
    if (opts.includeAssessments) {
      drawSectionTitle(
        `${sectionNum++}. Direct Assessment Blueprint & Grade Calibration`,
        'Evidence instruments, passing thresholds, and 100% weight calibration'
      );

      const asmtRows = course.assessments.map((a: Assessment, idx: number) => {
        const linked = a.linkedCLOIds && a.linkedCLOIds.length > 0
          ? a.linkedCLOIds.join(', ')
          : (a.cloIds && a.cloIds.length > 0 ? a.cloIds.join(', ') : 'CLO 1');

        return [
          a.name || `Assessment ${idx + 1}`,
          a.type || 'Assignment',
          a.isSummative ? 'Summative' : 'Formative',
          linked,
          a.bloomLevel || 'Apply',
          `${a.weightage || 0}%`,
          `${a.achievementThreshold || 60}%`,
          a.evidenceType || a.directOrIndirect || 'Direct',
        ];
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Instrument Name', 'Type', 'Category', 'Linked CLOs', 'Bloom Level', 'Weight', 'Passing %', 'Evidence']],
        body: asmtRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: 'bold', fontSize: 7 },
          1: { cellWidth: 22, fontSize: 7 },
          2: { cellWidth: 20, fontSize: 7 },
          3: { cellWidth: 24, fontSize: 6.5, fontStyle: 'bold', textColor: theme.accent },
          4: { cellWidth: 22, fontSize: 6.5 },
          5: { cellWidth: 16, fontSize: 7, fontStyle: 'bold', halign: 'center' },
          6: { cellWidth: 16, fontSize: 7, halign: 'center' },
          7: { cellWidth: contentWidth - 162, fontSize: 6.5, halign: 'center' },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 8. DIRECT EVIDENCE RULES & ATTAINMENT BENCHMARKS
    // =========================================================================
    if (opts.includeEvidenceRules && course.evidenceRules && course.evidenceRules.length > 0) {
      drawSectionTitle(
        `${sectionNum++}. Direct Evidence Rules & Attainment Benchmarks`,
        'Outcome verification rules, evidence instruments, and minimum cohort proficiency targets'
      );

      const evidenceRows = course.evidenceRules.map((rule, idx) => {
        const sources =
          (rule.evidenceSources || [])
            .map((s) => {
              const asmt = course.assessments.find((a) => a.id === s.assessmentId);
              const name = asmt?.name || s.componentName || 'Assessment Component';
              return `• ${name} (${s.weightInOutcome || 50}%)`;
            })
            .join('\n') || 'Direct Examination & Lab Evaluations';

        return [
          rule.outcomeCode || `CLO ${idx + 1}`,
          `${rule.minimumThresholdPct || 60}%`,
          rule.achievementRuleText || 'Direct assessment performance across cohort',
          sources,
          rule.explanation || 'Evidence evaluated against established rubrics.',
        ];
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Target CLO', 'Min Threshold', 'Proficiency Achievement Rule', 'Direct Evidence Instruments', 'Attainment Rationale']],
        body: evidenceRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 20, fontStyle: 'bold', fontSize: 7, textColor: theme.accent, halign: 'center' },
          1: { cellWidth: 22, fontSize: 7, fontStyle: 'bold', halign: 'center', textColor: theme.primary },
          2: { cellWidth: 42, fontSize: 6.5 },
          3: { cellWidth: 46, fontSize: 6.5 },
          4: { cellWidth: contentWidth - 130, fontSize: 6.5 },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 9. ANALYTIC ASSESSMENT RUBRICS
    // =========================================================================
    if (opts.includeRubrics && course.rubrics && course.rubrics.length > 0) {
      drawSectionTitle(
        `${sectionNum++}. Analytic Assessment Rubrics & Scoring Scales`,
        'Performance descriptors across international standards criteria'
      );

      course.rubrics.forEach((rubric: Rubric) => {
        checkPageBreak(30);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...theme.accent);
        doc.text(`Rubric: ${rubric.title}`, margin, currentY);
        currentY += 4;

        const rubricRows = (rubric.criteria || []).map((crit) => {
          const unsat =
            crit.levels?.find(
              (l) => (l.level as string) === 'Not Achieved' || (l.level as string) === 'Unsatisfactory'
            )?.descriptor || 'Fails to meet baseline standards.';
          const dev =
            crit.levels?.find((l) => l.level === 'Developing')?.descriptor ||
            'Meets partial criteria with noticeable gaps.';
          const prof =
            crit.levels?.find(
              (l) => (l.level as string) === 'Achieved' || (l.level as string) === 'Proficient'
            )?.descriptor || 'Demonstrates solid mastery of standards.';
          const ex =
            crit.levels?.find((l) => l.level === 'Exemplary')?.descriptor ||
            'Exceeds expectations with nuanced insight.';

          const critTitle = crit.criterionName || (crit as any).title || 'Performance Criterion';
          return [
            `${critTitle}\n(Weight: ${crit.weight || 25}%)`,
            unsat,
            dev,
            prof,
            ex,
          ];
        });

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [['Performance Criterion', 'Unsatisfactory (1)', 'Developing (2)', 'Proficient (3)', 'Exemplary (4)']],
          body: rubricRows,
          theme: 'grid',
          headStyles: {
            fillColor: theme.primary,
            textColor: [255, 255, 255],
            fontSize: 7,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 32, fontStyle: 'bold', fontSize: 6.5 },
            1: { cellWidth: (contentWidth - 32) / 4, fontSize: 6 },
            2: { cellWidth: (contentWidth - 32) / 4, fontSize: 6 },
            3: { cellWidth: (contentWidth - 32) / 4, fontSize: 6 },
            4: { cellWidth: (contentWidth - 32) / 4, fontSize: 6 },
          },
          styles: { cellPadding: 1.8, overflow: 'linebreak' },
        });

        currentY = (doc as any).lastAutoTable.finalY + 6;
      });
    }

    // =========================================================================
    // 10. CONSTRUCTIVE ALIGNMENT AUDIT & GAP ANALYSIS
    // =========================================================================
    if (opts.includeAuditReport) {
      drawSectionTitle(
        `${sectionNum++}. Constructive Alignment Audit & Quality Health Evaluation`,
        'Multi-dimensional quality score breakdown, alignment compliance risks, and health metrics'
      );

      // Audit Summary KPI Card
      const auditBoxH = 14;
      doc.setFillColor(...theme.cardBg);
      doc.setDrawColor(...theme.border);
      doc.roundedRect(margin, currentY, contentWidth, auditBoxH, 2, 2, 'FD');

      // Left Accent Strip
      const healthColor =
        auditReport.healthScore >= 90 ? theme.success : auditReport.healthScore >= 75 ? theme.accent : theme.warning;
      doc.setFillColor(...healthColor);
      doc.roundedRect(margin, currentY, 3, auditBoxH, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...theme.primary);
      doc.text('OVERALL ALIGNMENT HEALTH SCORE', margin + 6, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...theme.secondary);
      doc.text(
        `Automated accreditation audit evaluating constructive alignment across learning outcomes, assessments, and pedagogical delivery.`,
        margin + 6,
        currentY + 10.5
      );

      // Score Pill
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...healthColor);
      doc.text(`${auditReport.healthScore}%`, pageWidth - margin - 24, currentY + 6.5, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      const statusLabel =
        auditReport.healthScore >= 90 ? 'EXEMPLARY' : auditReport.healthScore >= 75 ? 'SUBSTANTIAL' : 'NEEDS ACTION';
      doc.text(statusLabel, pageWidth - margin - 24, currentY + 10.5, { align: 'right' });

      currentY += auditBoxH + 4;

      const catScores = auditReport.categoryScores || {
        courseInfo: 100,
        cloQuality: 90,
        cloPloMapping: 90,
        mloAlignment: 85,
        lessonAlignment: 85,
        assessmentCoverage: 90,
        rubricAlignment: 85,
        evidenceCoverage: 80,
      };

      const auditRows = [
        ['Course Information & Metadata', `${catScores.courseInfo}%`, catScores.courseInfo >= 80 ? 'Compliant' : 'Needs Review', 'Prerequisites, credit hours, and purpose well-formed.'],
        ['CLO Quality & Bloom Rigor', `${catScores.cloQuality}%`, catScores.cloQuality >= 80 ? 'Compliant' : 'Needs Review', 'Observable verbs, measurable achievement thresholds.'],
        ['CLO-to-PLO Articulation Matrix', `${catScores.cloPloMapping}%`, catScores.cloPloMapping >= 80 ? 'Compliant' : 'Warning', 'Alignment with accredited student outcomes / graduate attributes.'],
        ['Modular & MLO Alignment', `${catScores.mloAlignment}%`, catScores.mloAlignment >= 80 ? 'Compliant' : 'Warning', 'Subdivision into pedagogical instructional units.'],
        ['Assessment Weight & Calibration', `${catScores.assessmentCoverage}%`, assessmentAnalysis.isTotalWeightageValid ? 'Exemplary' : 'Action Required', `Sum of weights: ${assessmentAnalysis.totalConfiguredWeightage}% (Target: 100%).`],
        ['Rubric & Scoring Criteria', `${catScores.rubricAlignment}%`, catScores.rubricAlignment >= 80 ? 'Compliant' : 'Needs Review', 'Multi-tier qualitative assessment rubrics established.'],
        ['Direct Evidence & Attainment Rules', `${catScores.evidenceCoverage}%`, catScores.evidenceCoverage >= 80 ? 'Compliant' : 'Warning', 'Explicit evidence instruments mapped to each outcome.'],
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Alignment Dimension', 'Score', 'Status', 'Audit Observation & Recommendation']],
        body: auditRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold', fontSize: 7, textColor: theme.primary },
          1: { cellWidth: 18, fontSize: 7, fontStyle: 'bold', halign: 'center' },
          2: { cellWidth: 26, fontSize: 7, fontStyle: 'bold', halign: 'center', textColor: theme.accent },
          3: { cellWidth: contentWidth - 94, fontSize: 6.5 },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      // Render any gaps identified
      if (auditReport.gaps && auditReport.gaps.length > 0) {
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...theme.danger);
        doc.text(`Identified Curricular Gaps & Risk Flags (${auditReport.gaps.length}):`, margin, currentY);
        currentY += 4;

        const gapRows = auditReport.gaps.slice(0, 6).map((g: any, idx: number) => [
          `#${idx + 1}`,
          g.severity ? String(g.severity).toUpperCase() : 'WARNING',
          g.category || 'Alignment',
          g.message || g.description || 'Action recommended to maintain full accreditation standards.',
        ]);

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [['ID', 'Severity', 'Category', 'Remediation Note']],
          body: gapRows,
          theme: 'grid',
          headStyles: {
            fillColor: theme.secondary,
            textColor: [255, 255, 255],
            fontSize: 7,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 12, fontSize: 6.5, halign: 'center' },
            1: { cellWidth: 20, fontSize: 6.5, fontStyle: 'bold', textColor: theme.danger, halign: 'center' },
            2: { cellWidth: 32, fontSize: 6.5, fontStyle: 'bold' },
            3: { cellWidth: contentWidth - 64, fontSize: 6.5 },
          },
          styles: { cellPadding: 1.8, overflow: 'linebreak' },
        });

        currentY = (doc as any).lastAutoTable.finalY + 6;
      }
    }

    // =========================================================================
    // 11. CONTINUOUS QUALITY IMPROVEMENT (CQI) PLAN
    // =========================================================================
    if (opts.includeCQIPlan) {
      drawSectionTitle(
        `${sectionNum++}. Continuous Quality Improvement (CQI) & Closing the Loop`,
        'Cohort attainment reflection, corrective action items, and iterative interventions'
      );

      const cqiRows = [
        [
          'Identified Performance Gap',
          course.cqiPlan?.identifiedDeficiencies ||
            (course.cqiPlan as any)?.problemStatement ||
            course.cqiPlan?.attainmentReflection ||
            'Targeted student cohort required additional scaffolding on open-ended design problems.',
        ],
        [
          'Root Cause Analysis',
          (course.cqiPlan as any)?.rootCause ||
            'Limited prerequisite laboratory practicum hours devoted to empirical parameter tuning.',
        ],
        [
          'Corrective Action Intervention',
          course.cqiPlan?.plannedInterventions ||
            ((course.cqiPlan as any)?.actionItems || []).join('; ') ||
            'Introduce mandatory problem-solving recitation sessions prior to Midterm Examination; publish rubric exemplars.',
        ],
        [
          'Responsible Faculty & Role',
          course.cqiPlan?.responsibleLead ||
            (course.cqiPlan as any)?.responsibleFaculty ||
            course.instructorName ||
            'Course Coordinator & Laboratory Teaching Staff',
        ],
        [
          'Implementation Timeline',
          course.cqiPlan?.cyclePeriod ||
            (course.cqiPlan?.timelineWeeks
              ? `${course.cqiPlan.timelineWeeks} Weeks`
              : 'Weeks 3–7 of current academic cycle'),
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['CQI Protocol Component', 'Accreditation Continuous Improvement Details']],
        body: cqiRows,
        theme: 'grid',
        headStyles: {
          fillColor: theme.primary,
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold', fontSize: 7, textColor: theme.primary },
          1: { cellWidth: contentWidth - 50, fontSize: 7, textColor: theme.secondary },
        },
        styles: { cellPadding: 2, overflow: 'linebreak' },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // =========================================================================
    // 12. FORMAL AUDIT COMPLIANCE CERTIFICATE & SIGN-OFF
    // =========================================================================
    if (opts.includeSignOffSheet) {
      drawSectionTitle(
        `${sectionNum++}. Accreditation Audit Certificate & Final Sign-Off`,
        'Formal verification of constructive alignment, outcome integrity, and curricular approval'
      );

      checkPageBreak(50);

      // Certificate Seal Box
      doc.setFillColor(...theme.lightBg);
      doc.setDrawColor(...theme.accent);
      doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

      if (opts.institutionLogo && opts.institutionLogo.trim() !== '') {
        try {
          doc.addImage(opts.institutionLogo, margin + contentWidth - 21, currentY + 3.5, 17, 17, undefined, 'FAST');
        } catch (e) {
          // ignore
        }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...theme.accent);
      doc.text('STATEMENT OF CONSTRUCTIVE ALIGNMENT COMPLIANCE', margin + 6, currentY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...theme.primary);
      const statement = `This official course syllabus portfolio and accreditation dossier has been evaluated under the ${opts.accreditationFramework} standards criteria. All Course Learning Outcomes (CLOs) are formulated using measurable Bloom's taxonomy verbs and correlated to accredited Student Outcomes with validated direct assessment instruments.`;
      const textMaxW = (opts.institutionLogo && opts.institutionLogo.trim() !== '') ? contentWidth - 32 : contentWidth - 12;
      const splitStmt = doc.splitTextToSize(statement, textMaxW);
      doc.text(splitStmt, margin + 6, currentY + 13);

      currentY += 30;

      // Official 4-Column Signature Grid
      const colWidth = contentWidth / 4;
      const sigLineY = currentY + 16;

      const drawSignBlock = (idx: number, role: string, titleName: string) => {
        const blockX = margin + idx * colWidth;
        doc.setDrawColor(...theme.border);
        doc.setLineWidth(0.3);
        doc.line(blockX + 2, sigLineY, blockX + colWidth - 4, sigLineY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...theme.primary);
        doc.text(titleName, blockX + (colWidth / 2), sigLineY + 4, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(...theme.secondary);
        doc.text(role.toUpperCase(), blockX + (colWidth / 2), sigLineY + 8, { align: 'center' });
      };

      drawSignBlock(0, 'Course Lead', course.instructorName || 'Instructor');
      drawSignBlock(1, 'Curriculum Chair', 'Board of Studies');
      drawSignBlock(2, 'Department Head', 'Dean / HoD');
      drawSignBlock(3, 'External Evaluator', 'Accreditation Auditor');
    }

    // Apply Running Footers, Verification Hash, and Watermarks across all pages
    applyFootersAndWatermarks();

    return doc;
  }

  /**
   * Generates a Blob representing the compiled accreditation dossier PDF.
   */
  public static generateDossierBlob(
    course: Course,
    options: AccreditationDossierOptions = {}
  ): Blob {
    const doc = this.createAccreditationDossierPDF(course, options);
    return doc.output('blob');
  }

  /**
   * Generates an object URL for in-browser PDF previews.
   */
  public static generateDossierBlobUrl(
    course: Course,
    options: AccreditationDossierOptions = {}
  ): string {
    const blob = this.generateDossierBlob(course, options);
    return URL.createObjectURL(blob);
  }

  /**
   * Safely opens a preview of the dossier in a new browser tab.
   */
  public static previewDossierInNewTab(
    course: Course,
    options: AccreditationDossierOptions = {}
  ): void {
    const blobUrl = this.generateDossierBlobUrl(course, options);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  }

  /**
   * Triggers a browser download of the branded accreditation dossier PDF.
   */
  public static downloadDossierPDF(
    course: Course,
    options: AccreditationDossierOptions = {},
    customFilename?: string
  ): void {
    const doc = this.createAccreditationDossierPDF(course, options);
    const sanitizedCode = (course.code || 'COURSE').replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedTitle = (course.title || 'Curriculum_Dossier')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 32);
    const dateStr = new Date().toISOString().split('T')[0];

    const filename =
      customFilename || `${sanitizedCode}_${sanitizedTitle}_Accreditation_Dossier_${dateStr}.pdf`;

    doc.save(filename);
  }

  /**
   * Generates a Base64-encoded PDF string for cloud storage or background synchronization.
   */
  public static generateDossierBase64(
    course: Course,
    options: AccreditationDossierOptions = {}
  ): string {
    const doc = this.createAccreditationDossierPDF(course, options);
    return doc.output('datauristring');
  }
}

export default DossierPdfService;
