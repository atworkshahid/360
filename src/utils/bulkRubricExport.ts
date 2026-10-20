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
  VerticalAlign,
} from 'docx';
import { Course } from '../types';

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
};

export async function downloadBulkRubricsDocx(courses: Course[]): Promise<void> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun('Aggregated Rubric Dossier')],
          }),
          ...courses.flatMap((course) => [
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun(`Course: ${course.title}`)],
            }),
            ...course.rubrics.flatMap((rubric) => [
              new Paragraph({
                heading: HeadingLevel.HEADING_3,
                children: [new TextRun(`Rubric: ${rubric.title}`)],
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph('Criterion')] }),
                      new TableCell({ children: [new Paragraph('Exemplary')] }),
                      new TableCell({ children: [new Paragraph('Proficient')] }),
                    ],
                  }),
                  ...rubric.criteria.map((crit) => new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(crit.criterionName)] }),
                      new TableCell({ children: [new Paragraph(crit.levels.find(l => l.level === 'Exemplary')?.descriptor || '')] }),
                      new TableCell({ children: [new Paragraph(crit.levels.find(l => l.level === 'Proficient')?.descriptor || '')] }),
                    ],
                  })),
                ],
              }),
              new Paragraph({ spacing: { after: 200 } }),
            ]),
          ]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Aggregated_Rubrics.docx';
  link.click();
  URL.revokeObjectURL(url);
}
