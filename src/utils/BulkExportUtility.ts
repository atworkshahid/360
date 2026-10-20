import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DossierPdfService } from '../services/dossierPdfService';

export const bulkExportCourses = async (courses: any[]) => {
  const zip = new JSZip();

  for (const course of courses) {
    // 1. Create JSON Backup
    const jsonBackup = JSON.stringify(course, null, 2);
    zip.file(`${course.title || 'Course'}_backup.json`, jsonBackup);

    // 2. Create PDF Syllabus
    try {
      const pdfDoc = DossierPdfService.createAccreditationDossierPDF(course, {
        includeCoverPage: true,
        includeTableOfContents: true,
        includeExecutiveSummary: true,
        includeCourseInfo: true,
        includeCLOs: true,
        includePLOMapping: true,
        includeModules: true,
        includeWeeklyPlan: true,
        includeAssessments: true,
      });
      const pdfBlob = pdfDoc.output('blob');
      zip.file(`${course.title || 'Course'}_Syllabus.pdf`, pdfBlob);
    } catch (error) {
      console.error(`Failed to generate PDF for ${course.title}:`, error);
    }
  }

  // 3. Generate Zip and Trigger Download
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'CourseWizard_BulkExport.zip');
};
