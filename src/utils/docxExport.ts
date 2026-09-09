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
import { Course, CourseAuditReport } from '../types';
import { calculateCourseAudit } from './obeCalculator';
import { analyzeAssessmentPlan } from './assessmentAnalysis';

export interface DocxExportOptions {
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

// Brand color palette constants for Word Document styling
const COLOR_PRIMARY = '1E293B'; // Slate 800
const COLOR_ACCENT = '4338CA'; // Indigo 700
const COLOR_ACCENT_LIGHT = 'EEF2FF'; // Indigo 50
const COLOR_BG_HEADER = '0F172A'; // Slate 900
const COLOR_BG_SUBHEADER = '334155'; // Slate 700
const COLOR_BG_ALT = 'F8FAFC'; // Slate 50
const COLOR_BORDER = 'CBD5E1'; // Slate 300
const COLOR_SUCCESS = '047857'; // Emerald 700
const COLOR_WARNING = 'B45309'; // Amber 700
const COLOR_CRITICAL = 'B91C1C'; // Rose 700
const COLOR_MUTED = '64748B'; // Slate 500

const standardBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: COLOR_BORDER,
};

const cellBorders = {
  top: standardBorder,
  bottom: standardBorder,
  left: standardBorder,
  right: standardBorder,
};

function createHeaderCell(
  text: string,
  widthPct: number,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  bgColor: string = COLOR_BG_HEADER
): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: bgColor },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 140, bottom: 140, left: 140, right: 140 },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text,
            bold: true,
            color: 'FFFFFF',
            size: 19, // 9.5pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createDataCell(
  text: string,
  widthPct: number,
  options?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    bgColor?: string;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    fontSize?: number;
  }
): TableCell {
  const alignment = options?.alignment ?? AlignmentType.LEFT;
  const fontSize = options?.fontSize ?? 19; // 9.5pt default
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: options?.bgColor ? { fill: options.bgColor } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: text || '—',
            bold: options?.bold ?? false,
            italics: options?.italic ?? false,
            color: options?.color ?? COLOR_PRIMARY,
            size: fontSize,
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createSectionHeading(title: string, subtitle?: string): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 120 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 12,
          color: COLOR_ACCENT,
        },
      },
      children: [
        new TextRun({
          text: title,
          bold: true,
          color: COLOR_ACCENT,
          size: 26, // 13pt
          font: 'Arial',
        }),
      ],
    }),
  ];

  if (subtitle) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            color: COLOR_MUTED,
            size: 19, // 9.5pt
            font: 'Arial',
          }),
        ],
      })
    );
  }

  return paragraphs;
}

function createSubHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        color: COLOR_PRIMARY,
        size: 22, // 11pt
        font: 'Arial',
      }),
    ],
  });
}

function createBodyParagraph(text: string, options?: { bold?: boolean; italic?: boolean; color?: string }): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({
        text,
        bold: options?.bold ?? false,
        italics: options?.italic ?? false,
        color: options?.color ?? COLOR_PRIMARY,
        size: 20, // 10pt
        font: 'Arial',
      }),
    ],
  });
}

/**
 * Generates a publication-grade, styled Microsoft Word (.docx) document
 * containing the full course specification, OBE constructive alignment matrices,
 * rubrics, and accreditation audit dossier.
 */
export function generateCourseDocx(course: Course, options: DocxExportOptions = {}): Document {
  const opts: Required<DocxExportOptions> = {
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

  // Ensure all course collections are safe against null or undefined
  course = {
    ...course,
    clos: course.clos || [],
    plos: course.plos || [],
    modules: course.modules || [],
    lessons: course.lessons || [],
    activities: course.activities || [],
    assessments: course.assessments || [],
    rubrics: course.rubrics || [],
    evidenceRules: course.evidenceRules || [],
    weeklyPlan: course.weeklyPlan || [],
  };

  const auditReport: CourseAuditReport = calculateCourseAudit(course);
  const assessmentAnalysis = analyzeAssessmentPlan(course);

  const sectionsContent: (Paragraph | Table)[] = [];

  // 1. TITLE & DOCUMENT BANNER
  sectionsContent.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [
        new TextRun({
          text: 'MENTISERA OBE360™',
          bold: true,
          color: COLOR_ACCENT,
          size: 22, // 11pt
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: 'OUTCOME-BASED COURSE SPECIFICATION & ACCREDITATION DOSSIER',
          bold: true,
          color: COLOR_MUTED,
          size: 18, // 9pt
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 140 },
      children: [
        new TextRun({
          text: course.title || 'Untitled Course',
          bold: true,
          color: COLOR_PRIMARY,
          size: 36, // 18pt
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 280 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: COLOR_BORDER,
        },
      },
      children: [
        new TextRun({
          text: `Course Code: ${course.code || 'NO-CODE'}  •  Credits: ${course.creditHours ?? 3} CH  •  Level: ${course.courseLevel || 'Undergraduate'}  •  Discipline: ${course.programme || course.category || 'General'}`,
          bold: true,
          color: COLOR_MUTED,
          size: 19, // 9.5pt
          font: 'Arial',
        }),
      ],
    })
  );

  // 2. AUDIT SUMMARY CARD (TABLE)
  if (opts.includeAuditReport) {
    const healthScore = auditReport.healthScore;
    const healthStatus =
      healthScore >= 90
        ? 'Exemplary Alignment (Ready for Accreditation)'
        : healthScore >= 75
        ? 'Substantial Alignment (Minor Revisions Recommended)'
        : 'Action Required (Critical Gaps Identified)';

    const healthBg = healthScore >= 90 ? 'DCFCE7' : healthScore >= 75 ? 'E0E7FF' : 'FEF3C7';
    const healthTextColor = healthScore >= 90 ? COLOR_SUCCESS : healthScore >= 75 ? COLOR_ACCENT : COLOR_WARNING;

    const auditSummaryTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: healthBg },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 160, bottom: 160, left: 160, right: 160 },
              borders: cellBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({
                      text: `${healthScore}%`,
                      bold: true,
                      color: healthTextColor,
                      size: 40, // 20pt
                      font: 'Arial',
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: 'OBE HEALTH INDEX',
                      bold: true,
                      color: healthTextColor,
                      size: 16, // 8pt
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              shading: { fill: COLOR_BG_ALT },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 160, bottom: 160, left: 160, right: 160 },
              borders: cellBorders,
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 60 },
                  children: [
                    new TextRun({
                      text: `Accreditation Status: ${healthStatus}`,
                      bold: true,
                      color: COLOR_PRIMARY,
                      size: 20, // 10pt
                      font: 'Arial',
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({
                      text: `• Course Status: ${(course.status || 'draft').toUpperCase()}  |  Total CLOs: ${course.clos.length}  |  Assessments: ${course.assessments.length}  |  Modules: ${course.modules.length}`,
                      size: 18,
                      color: COLOR_MUTED,
                      font: 'Arial',
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: `• Gaps Identified: ${auditReport.gaps.length}  |  Critical: ${auditReport.gaps.filter((g) => g.severity === 'Critical').length}  |  High/Med: ${auditReport.gaps.filter((g) => g.severity === 'High' || g.severity === 'Medium').length}`,
                      size: 18,
                      color: auditReport.gaps.some((g) => g.severity === 'Critical') ? COLOR_CRITICAL : COLOR_MUTED,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    sectionsContent.push(auditSummaryTable);
    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 3. SECTION: COURSE IDENTIFICATION & METADATA
  if (opts.includeCourseInfo) {
    sectionsContent.push(
      ...createSectionHeading('1. Course Identification & Academic Governance', 'Basic institutional profile, curriculum placement, and academic governance details')
    );

    const metadataRows: TableRow[] = [
      new TableRow({
        children: [
          createHeaderCell('Field', 30, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
          createHeaderCell('Specification Details', 70, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Course Code & Title', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(`${course.code || 'N/A'} — ${course.title || 'Untitled'}`, 70, { bold: true }),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Department / Division', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.department || 'Academic Department', 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Programme / Major', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.programme || course.category || 'General Curriculum', 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Academic Level', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.courseLevel || 'Undergraduate', 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Credit Hours (CH)', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(`${course.creditHours ?? 3} Credit Hours`, 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Duration & Expected Study Time', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(`${course.durationWeeks ?? 16} Weeks  |  ${course.expectedStudyTimeHours || (course.creditHours ?? 3) * 45} Total Student Effort Hours`, 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Delivery Mode', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.deliveryMode || 'Face-to-Face', 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Minimum Passing Benchmark', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(`${course.passingBenchmark ?? 60}% Overall Course Benchmark`, 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Prerequisites & Prior Knowledge', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.prerequisites || 'None specified / Direct admission requirement', 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Target Audience / Cohort', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.targetLearners || 'Students enrolled in the accredited degree programme', 70),
        ],
      }),
    ];

    sectionsContent.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: metadataRows,
      })
    );

    // Course Description & Pedagogical Framework
    sectionsContent.push(createSubHeading('Course Description & Purpose'));
    sectionsContent.push(
      createBodyParagraph(
        course.description ||
          course.overview ||
          'This course provides comprehensive conceptual grounding and hands-on skill development adhering to outcome-based education benchmarks.'
      )
    );

    if (course.capstoneGoal) {
      sectionsContent.push(createSubHeading('Capstone Competency Promise'));
      sectionsContent.push(createBodyParagraph(course.capstoneGoal, { italic: true, bold: true }));
    }

    if (course.blueprint?.targetCompetencies && course.blueprint.targetCompetencies.length > 0) {
      sectionsContent.push(createSubHeading('Target Competencies'));
      course.blueprint.targetCompetencies.forEach((comp, idx) => {
        sectionsContent.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: comp,
                size: 20,
                font: 'Arial',
              }),
            ],
          })
        );
      });
    }

    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 4. SECTION: COURSE LEARNING OUTCOMES (CLOs)
  if (opts.includeCLOs) {
    sectionsContent.push(
      ...createSectionHeading('2. Course Learning Outcomes (CLOs)', 'Explicit statements of what learners are expected to know, understand, and demonstrate upon completion')
    );

    if (course.clos.length === 0) {
      sectionsContent.push(createBodyParagraph('No Course Learning Outcomes currently configured.', { italic: true, color: COLOR_MUTED }));
    } else {
      const cloTableRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            createHeaderCell('Code', 12, AlignmentType.CENTER),
            createHeaderCell('Outcome Statement', 42, AlignmentType.LEFT),
            createHeaderCell('Bloom Level', 16, AlignmentType.CENTER),
            createHeaderCell('Domain', 12, AlignmentType.CENTER),
            createHeaderCell('Weight', 9, AlignmentType.CENTER),
            createHeaderCell('Target', 9, AlignmentType.CENTER),
          ],
        }),
      ];

      course.clos.forEach((clo, idx) => {
        const rowBg = idx % 2 === 1 ? COLOR_BG_ALT : undefined;
        cloTableRows.push(
          new TableRow({
            children: [
              createDataCell(clo.code || `CLO ${idx + 1}`, 12, { bold: true, alignment: AlignmentType.CENTER, bgColor: rowBg }),
              createDataCell(clo.statement || 'Outcome statement pending', 42, { bgColor: rowBg }),
              createDataCell(`${clo.bloomLevel || 'Apply'}\n(${clo.bloomVerb || 'Demonstrate'})`, 16, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
              createDataCell(clo.learningDomain || 'Cognitive', 12, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
              createDataCell(`${clo.weightage || 0}%`, 9, { alignment: AlignmentType.CENTER, bold: true, bgColor: rowBg }),
              createDataCell(`${clo.achievementThreshold || course.passingBenchmark || 60}%`, 9, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
            ],
          })
        );
      });

      sectionsContent.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: cloTableRows,
        })
      );
    }

    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 5. SECTION: CLO-PLO MAPPING MATRIX
  if (opts.includePLOMapping) {
    sectionsContent.push(
      ...createSectionHeading('3. CLO to PLO / Graduate Attributes Alignment Matrix', 'Direct correlation matrix mapping Course Learning Outcomes to Program Learning Outcomes')
    );

    if (course.plos.length === 0 || course.clos.length === 0) {
      sectionsContent.push(
        createBodyParagraph('Programme Learning Outcomes (PLOs) or CLOs not yet populated for this matrix.', {
          italic: true,
          color: COLOR_MUTED,
        })
      );
    } else {
      // First, PLO reference definitions
      sectionsContent.push(createSubHeading('Programme Learning Outcomes (PLOs) Reference'));
      course.plos.forEach((plo) => {
        sectionsContent.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: `${plo.code}: `, bold: true, color: COLOR_ACCENT, size: 19, font: 'Arial' }),
              new TextRun({ text: `${plo.title} — ${plo.description}`, size: 19, font: 'Arial' }),
            ],
          })
        );
      });

      sectionsContent.push(new Paragraph({ spacing: { before: 80, after: 80 } }));

      // Mapping cross-tabulation table
      // Columns: CLO Code | Statement | PLO1 | PLO2 | ... | PLOn
      const cloColWidth = 16;
      const statementColWidth = 32;
      const remainingWidth = 100 - (cloColWidth + statementColWidth);
      const ploColWidth = Math.max(8, Math.floor(remainingWidth / course.plos.length));

      const matrixHeaderCells: TableCell[] = [
        createHeaderCell('CLO Code', cloColWidth, AlignmentType.CENTER),
        createHeaderCell('Outcome Summary', statementColWidth, AlignmentType.LEFT),
      ];

      course.plos.forEach((plo) => {
        matrixHeaderCells.push(createHeaderCell(plo.code, ploColWidth, AlignmentType.CENTER));
      });

      const matrixRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: matrixHeaderCells,
        }),
      ];

      course.clos.forEach((clo, rIdx) => {
        const rowBg = rIdx % 2 === 1 ? COLOR_BG_ALT : undefined;
        const rowCells: TableCell[] = [
          createDataCell(clo.code, cloColWidth, { bold: true, alignment: AlignmentType.CENTER, bgColor: rowBg }),
          createDataCell(clo.statement.substring(0, 75) + (clo.statement.length > 75 ? '...' : ''), statementColWidth, { bgColor: rowBg }),
        ];

        course.plos.forEach((plo) => {
          const mapping = clo.mappedPLOs?.find((m) => m.ploId === plo.id);
          const levelCode = mapping ? (mapping.level === 'Mastered' ? 'M' : mapping.level === 'Reinforced' ? 'R' : 'I') : '—';
          const levelColor =
            mapping?.level === 'Mastered'
              ? COLOR_SUCCESS
              : mapping?.level === 'Reinforced'
              ? COLOR_ACCENT
              : mapping
              ? COLOR_WARNING
              : COLOR_MUTED;

          rowCells.push(
            createDataCell(levelCode, ploColWidth, {
              bold: Boolean(mapping),
              color: levelColor,
              alignment: AlignmentType.CENTER,
              bgColor: rowBg,
            })
          );
        });

        matrixRows.push(new TableRow({ children: rowCells }));
      });

      sectionsContent.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: matrixRows,
        })
      );

      sectionsContent.push(
        new Paragraph({
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({
              text: 'Matrix Legend:  I = Introduced (Basic Exposure)  |  R = Reinforced (Intermediate Practice)  |  M = Mastered (Demonstrated Competence)  |  — = Not Mapped',
              italics: true,
              color: COLOR_MUTED,
              size: 17,
              font: 'Arial',
            }),
          ],
        })
      );
    }

    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 6. SECTION: MODULAR CURRICULUM & LESSONS
  if (opts.includeModules) {
    sectionsContent.push(
      ...createSectionHeading('4. Modular Curriculum & Instructional Structure', 'Unit-by-unit syllabus breakdown with module learning outcomes, activities, and contact hours')
    );

    if (course.modules.length === 0) {
      sectionsContent.push(createBodyParagraph('No modules currently defined.', { italic: true, color: COLOR_MUTED }));
    } else {
      course.modules.forEach((mod, idx) => {
        sectionsContent.push(
          createSubHeading(`Module ${mod.number || idx + 1}: ${mod.title || 'Untitled Module'}`)
        );

        sectionsContent.push(
          createBodyParagraph(
            `Duration: ${mod.durationWeeks || 1} Week(s)  •  Expected Study Hours: ${mod.expectedStudyHours || 10} Hours` +
              (mod.description ? `\nOverview: ${mod.description}` : ''),
            { color: COLOR_MUTED }
          )
        );

        // MLOs in this module
        const moduleMlos = course.mlos.filter((m) => m.moduleId === mod.id);
        if (moduleMlos.length > 0) {
          const mloTableRows: TableRow[] = [
            new TableRow({
              tableHeader: true,
              children: [
                createHeaderCell('MLO Code', 15, AlignmentType.CENTER, COLOR_BG_SUBHEADER),
                createHeaderCell('Learning Outcome Statement', 45, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
                createHeaderCell('Bloom Level', 15, AlignmentType.CENTER, COLOR_BG_SUBHEADER),
                createHeaderCell('Linked CLO', 12, AlignmentType.CENTER, COLOR_BG_SUBHEADER),
                createHeaderCell('Study Hrs', 13, AlignmentType.CENTER, COLOR_BG_SUBHEADER),
              ],
            }),
          ];

          moduleMlos.forEach((mlo, mIdx) => {
            const rowBg = mIdx % 2 === 1 ? COLOR_BG_ALT : undefined;
            const linkedClo = course.clos.find((c) => c.id === mlo.linkedCLOId);
            mloTableRows.push(
              new TableRow({
                children: [
                  createDataCell(mlo.code, 15, { bold: true, alignment: AlignmentType.CENTER, bgColor: rowBg }),
                  createDataCell(mlo.statement, 45, { bgColor: rowBg }),
                  createDataCell(mlo.bloomLevel || 'Apply', 15, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
                  createDataCell(linkedClo?.code || '—', 12, { alignment: AlignmentType.CENTER, bold: true, bgColor: rowBg }),
                  createDataCell(`${mlo.studyTimeHours || 2}h`, 13, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
                ],
              })
            );
          });

          sectionsContent.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: mloTableRows,
            })
          );
        }

        // Lessons in this module
        const moduleLessons = course.lessons.filter((l) => l.moduleId === mod.id);
        if (moduleLessons.length > 0) {
          sectionsContent.push(new Paragraph({ spacing: { before: 80, after: 40 } }));
          const lessonRows: TableRow[] = [
            new TableRow({
              tableHeader: true,
              children: [
                createHeaderCell('Lesson / Topic', 35, AlignmentType.LEFT, '475569'),
                createHeaderCell('Learning Objective', 35, AlignmentType.LEFT, '475569'),
                createHeaderCell('Duration', 15, AlignmentType.CENTER, '475569'),
                createHeaderCell('Mode', 15, AlignmentType.CENTER, '475569'),
              ],
            }),
          ];

          moduleLessons.forEach((l, lIdx) => {
            const rowBg = lIdx % 2 === 1 ? COLOR_BG_ALT : undefined;
            lessonRows.push(
              new TableRow({
                children: [
                  createDataCell(l.title, 35, { bold: true, bgColor: rowBg }),
                  createDataCell(l.learningObjective || 'Detailed topic study and practice', 35, { bgColor: rowBg }),
                  createDataCell(`${l.durationMins || 60} mins`, 15, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
                  createDataCell(l.teachingMode || course.deliveryMode, 15, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
                ],
              })
            );
          });

          sectionsContent.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: lessonRows,
            })
          );
        }

        sectionsContent.push(new Paragraph({ spacing: { before: 120, after: 120 } }));
      });
    }

    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 7. SECTION: ASSESSMENT ARCHITECTURE & GRADING PLAN
  if (opts.includeAssessments) {
    sectionsContent.push(
      ...createSectionHeading('5. Assessment Architecture & Grading Plan', 'Constructive alignment of summative and formative instruments, marks distribution, and CLO mapping')
    );

    const totalWeight = course.assessments.reduce((sum, a) => sum + (a.weightage || 0), 0);
    const summativeWeight = course.assessments.filter((a) => a.isSummative).reduce((sum, a) => sum + (a.weightage || 0), 0);
    const formativeWeight = course.assessments.filter((a) => !a.isSummative).reduce((sum, a) => sum + (a.weightage || 0), 0);

    sectionsContent.push(
      createBodyParagraph(
        `Total Configured Assessment Weightage: ${totalWeight}%  (Summative: ${summativeWeight}%  |  Formative: ${formativeWeight}%)` +
          (Math.abs(totalWeight - 100) > 0.1 ? ` [Note: Course assessment weightage totals ${totalWeight}%, recommended: 100%]` : ''),
        {
          bold: true,
          color: Math.abs(totalWeight - 100) > 0.1 ? COLOR_CRITICAL : COLOR_SUCCESS,
        }
      )
    );

    if (course.assessments.length === 0) {
      sectionsContent.push(createBodyParagraph('No assessments configured yet.', { italic: true, color: COLOR_MUTED }));
    } else {
      const assessmentTableRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            createHeaderCell('Assessment Title', 25, AlignmentType.LEFT),
            createHeaderCell('Category / Type', 18, AlignmentType.CENTER),
            createHeaderCell('Nature', 13, AlignmentType.CENTER),
            createHeaderCell('Weight', 11, AlignmentType.CENTER),
            createHeaderCell('Marks', 11, AlignmentType.CENTER),
            createHeaderCell('Mapped CLOs', 22, AlignmentType.LEFT),
          ],
        }),
      ];

      course.assessments.forEach((ass, aIdx) => {
        const rowBg = aIdx % 2 === 1 ? COLOR_BG_ALT : undefined;
        const linkedClos = course.clos
          .filter((c) => ass.linkedCLOIds?.includes(c.id))
          .map((c) => c.code)
          .join(', ');

        assessmentTableRows.push(
          new TableRow({
            children: [
              createDataCell(ass.name, 25, { bold: true, bgColor: rowBg }),
              createDataCell(ass.type || 'Assignment', 18, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
              createDataCell(ass.isSummative ? 'Summative' : 'Formative', 13, {
                alignment: AlignmentType.CENTER,
                bold: true,
                color: ass.isSummative ? COLOR_PRIMARY : COLOR_ACCENT,
                bgColor: rowBg,
              }),
              createDataCell(`${ass.weightage || 0}%`, 11, { alignment: AlignmentType.CENTER, bold: true, bgColor: rowBg }),
              createDataCell(`${ass.marks || 100}`, 11, { alignment: AlignmentType.CENTER, bgColor: rowBg }),
              createDataCell(linkedClos || 'Unassigned', 22, { bgColor: rowBg }),
            ],
          })
        );
      });

      sectionsContent.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: assessmentTableRows,
        })
      );
    }

    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 8. SECTION: EVALUATION RUBRICS & PERFORMANCE DESCRIPTORS
  if (opts.includeRubrics && course.rubrics.length > 0) {
    sectionsContent.push(
      ...createSectionHeading('6. Evaluation Rubrics & Scoring Criteria', 'Detailed multidimensional rubrics specifying performance descriptors across developmental levels')
    );

    course.rubrics.forEach((rubric, rIdx) => {
      const linkedAss = course.assessments.find((a) => a.id === rubric.assessmentId);
      sectionsContent.push(
        createSubHeading(`Rubric ${rIdx + 1}: ${rubric.title} ${linkedAss ? `(Associated with ${linkedAss.name})` : ''}`)
      );

      if (rubric.criteria.length === 0) {
        sectionsContent.push(createBodyParagraph('No criteria defined for this rubric.', { italic: true, color: COLOR_MUTED }));
      } else {
        const rubricTableRows: TableRow[] = [
          new TableRow({
            tableHeader: true,
            children: [
              createHeaderCell('Criterion', 22, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
              createHeaderCell('Exemplary (4)', 20, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
              createHeaderCell('Proficient (3)', 20, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
              createHeaderCell('Developing (2)', 19, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
              createHeaderCell('Beginning (1)', 19, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
            ],
          }),
        ];

        rubric.criteria.forEach((crit, cIdx) => {
          const rowBg = cIdx % 2 === 1 ? COLOR_BG_ALT : undefined;
          const getLevelText = (lvlName: string) => {
            const found = crit.levels.find((l) => l.level === lvlName);
            return found ? found.descriptor : '—';
          };

          rubricTableRows.push(
            new TableRow({
              children: [
                createDataCell(
                  `${crit.criterionName}\n(Weight: ${crit.weight || 0}%)`,
                  22,
                  { bold: true, bgColor: rowBg }
                ),
                createDataCell(getLevelText('Exemplary'), 20, { bgColor: rowBg, fontSize: 17 }),
                createDataCell(getLevelText('Proficient'), 20, { bgColor: rowBg, fontSize: 17 }),
                createDataCell(getLevelText('Developing'), 19, { bgColor: rowBg, fontSize: 17 }),
                createDataCell(getLevelText('Not Achieved'), 19, { bgColor: rowBg, fontSize: 17 }),
              ],
            })
          );
        });

        sectionsContent.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rubricTableRows,
          })
        );
      }

      sectionsContent.push(new Paragraph({ spacing: { before: 120, after: 120 } }));
    });

    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 9. SECTION: EVIDENCE RULES
  if (opts.includeEvidenceRules && course.evidenceRules.length > 0) {
    sectionsContent.push(
      ...createSectionHeading('7. Evidence Rules & Direct Assessment Criteria', 'Specification of direct assessment evidence instruments and competency attainment thresholds')
    );

    const evidenceRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell('Outcome', 15, AlignmentType.CENTER),
          createHeaderCell('Evidence Sources & Weights', 35, AlignmentType.LEFT),
          createHeaderCell('Threshold', 15, AlignmentType.CENTER),
          createHeaderCell('Achievement Rule & Rationale', 35, AlignmentType.LEFT),
        ],
      }),
    ];

    course.evidenceRules.forEach((rule, idx) => {
      const rowBg = idx % 2 === 1 ? COLOR_BG_ALT : undefined;
      const sourcesText = rule.evidenceSources
        .map((s) => {
          const ass = course.assessments.find((a) => a.id === s.assessmentId);
          return `${ass?.name || 'Assessment'} (${s.weightInOutcome || 0}%)`;
        })
        .join('; ');

      evidenceRows.push(
        new TableRow({
          children: [
            createDataCell(rule.outcomeCode || 'CLO', 15, { bold: true, alignment: AlignmentType.CENTER, bgColor: rowBg }),
            createDataCell(sourcesText || 'Standard assessment submission', 35, { bgColor: rowBg }),
            createDataCell(`${rule.minimumThresholdPct || course.passingBenchmark || 60}%`, 15, {
              bold: true,
              alignment: AlignmentType.CENTER,
              bgColor: rowBg,
            }),
            createDataCell(rule.achievementRuleText || rule.explanation || 'Learner meets minimum scoring benchmark.', 35, { bgColor: rowBg }),
          ],
        })
      );
    });

    sectionsContent.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: evidenceRows,
      })
    );

    sectionsContent.push(new Paragraph({ spacing: { before: 180, after: 180 } }));
  }

  // 10. SECTION: CONTINUOUS QUALITY IMPROVEMENT (CQI) PLAN
  if (opts.includeCQIPlan && course.cqiPlan) {
    sectionsContent.push(
      ...createSectionHeading('8. Continuous Quality Improvement (CQI) Action Plan', 'Systematic loop-closing reflection, attainment targets, and instructional interventions')
    );

    const cqiRows: TableRow[] = [
      new TableRow({
        children: [
          createHeaderCell('CQI Component', 30, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
          createHeaderCell('Reviewer Reflection & Action Plan', 70, AlignmentType.LEFT, COLOR_BG_SUBHEADER),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Prior Attainment Reflection', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.cqiPlan.attainmentReflection || 'Baseline offering; historical benchmarking pending first cohort assessment.', 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Planned Interventions', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.cqiPlan.plannedInterventions || 'Maintain constructive alignment with regular formative quizzes and rubric feedback.', 70),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Target Metric & Success Goal', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.cqiPlan.targetMetric || '≥ 75% of enrolled cohort achieves passing benchmark across all primary CLOs.', 70, { bold: true }),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Review Cycle Period', 30, { bold: true, bgColor: COLOR_BG_ALT }),
          createDataCell(course.cqiPlan.cyclePeriod || 'Annual Academic Review Cycle (Semester End)', 70),
        ],
      }),
    ];

    sectionsContent.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: cqiRows,
      })
    );

    // Sign-off signature section
    sectionsContent.push(createSubHeading('Institutional Governance Sign-Off & Approvals'));

    const signatureRows: TableRow[] = [
      new TableRow({
        children: [
          createHeaderCell('Role', 35, AlignmentType.LEFT, '475569'),
          createHeaderCell('Signature', 40, AlignmentType.LEFT, '475569'),
          createHeaderCell('Date', 25, AlignmentType.LEFT, '475569'),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Course Lead / Instructor', 35, { bold: true }),
          createDataCell('___________________________', 40),
          createDataCell('_____ / _____ / 202___', 25),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Programme Director / Chair', 35, { bold: true }),
          createDataCell('___________________________', 40),
          createDataCell('_____ / _____ / 202___', 25),
        ],
      }),
      new TableRow({
        children: [
          createDataCell('Accreditation / Curriculum Dean', 35, { bold: true }),
          createDataCell('___________________________', 40),
          createDataCell('_____ / _____ / 202___', 25),
        ],
      }),
    ];

    sectionsContent.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: signatureRows,
      })
    );
  }

  // Create the complete Document
  const doc = new Document({
    creator: 'MENTISERA OBE360™',
    title: `${course.code || 'Course'} - Outcome-Based Course Specification`,
    description: `Formal accreditation dossier and outcome-based curriculum specification for ${course.title}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080, // 0.75 in
              right: 1080,
              bottom: 1080,
              left: 1080,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 120 },
                border: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: COLOR_BORDER,
                  },
                },
                children: [
                  new TextRun({
                    text: 'MENTISERA OBE360™  •  ',
                    bold: true,
                    size: 16,
                    color: COLOR_ACCENT,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: `${course.code || 'COURSE'} — Course Specification & Audit Dossier`,
                    size: 16,
                    color: COLOR_MUTED,
                    font: 'Arial',
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
                spacing: { before: 120, after: 0 },
                border: {
                  top: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: COLOR_BORDER,
                  },
                },
                children: [
                  new TextRun({
                    text: 'Accreditation Dossier  •  Page ',
                    size: 16,
                    color: COLOR_MUTED,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    bold: true,
                    color: COLOR_PRIMARY,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: COLOR_MUTED,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    bold: true,
                    color: COLOR_PRIMARY,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        children: sectionsContent,
      },
    ],
  });

  return doc;
}

/**
 * Downloads the course specification as a formatted Microsoft Word document (.docx).
 */
export async function downloadCourseDocx(course: Course, options: DocxExportOptions = {}): Promise<void> {
  const doc = generateCourseDocx(course, options);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanCode = (course.code || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanTitle = (course.title || 'Specification').substring(0, 32).replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${cleanCode}_${cleanTitle}_OBE_Dossier_${new Date().toISOString().split('T')[0]}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
