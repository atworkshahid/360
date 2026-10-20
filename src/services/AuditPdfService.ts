import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CourseAuditReport } from '../types';

export class AuditPdfService {
  public static generateAuditPDF(report: CourseAuditReport, courseTitle: string): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    doc.setFontSize(18);
    doc.text(`Accessibility & Alignment Audit Report: ${courseTitle}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Health Score: ${report.healthScore}%`, 14, 30);

    const gapRows = report.gaps.map(gap => [
      gap.title,
      gap.severity,
      gap.category,
      gap.recommendation
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Title', 'Severity', 'Category', 'Recommendation']],
      body: gapRows,
    });

    return doc;
  }

  public static downloadAuditPDF(report: CourseAuditReport, courseTitle: string): void {
    const doc = this.generateAuditPDF(report, courseTitle);
    doc.save(`AuditReport_${courseTitle.replace(/\s+/g, '_')}.pdf`);
  }
}
