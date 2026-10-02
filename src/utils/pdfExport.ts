import { jsPDF } from 'jspdf';
import { Course } from '../types';
import {
  DossierPdfService,
  AccreditationDossierOptions,
} from '../services/dossierPdfService';
import { triggerWithLeadGate } from '../services/leadService';

export type PDFExportOptions = AccreditationDossierOptions;

/**
 * Generates a branded, publication-grade accreditation dossier PDF document
 * containing executive cover page, course specification, outcome matrices, and compliance audit.
 */
export function generateCoursePDF(course: Course, options: PDFExportOptions = {}): jsPDF {
  return DossierPdfService.createAccreditationDossierPDF(course, options);
}

/**
 * Convenience helper to generate and trigger instant browser download of the accreditation dossier.
 */
export function downloadCoursePDF(course: Course, options: PDFExportOptions = {}): void {
  DossierPdfService.downloadDossierPDF(course, options);
}

/**
 * PDF export function for the current course blueprint that triggers the 'Accreditation Dossier Export' gate,
 * generates a printable document using the current audit report data, and triggers a browser download.
 */
export function exportCourseBlueprintWithGate(
  course: Course,
  options: PDFExportOptions = {},
  onComplete?: () => void
): boolean {
  return triggerWithLeadGate(
    () => {
      downloadCoursePDF(course, options);
      if (onComplete) onComplete();
    },
    {
      featureTitle: 'Accreditation Dossier Export',
      featureDescription: `Verify your academic affiliation to download the official printable PDF accreditation dossier specification for ${course.title || course.code || 'Course Blueprint'} compiled with current alignment audit data.`,
      source: 'course_blueprint_export',
      framework: course.accreditationFramework,
    }
  );
}

export { DossierPdfService };
export type { AccreditationDossierOptions };
export default generateCoursePDF;
