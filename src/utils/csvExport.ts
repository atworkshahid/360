import { Course } from '../types';
import { calculateCourseAudit } from './obeCalculator';

/**
 * Escapes a cell value for safe RFC 4180 CSV generation.
 * Handles commas, double-quotes, newlines, and formula injection safeguards.
 */
function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value).trim();
  // Prevent CSV formula injection in spreadsheet software (Excel, LibreOffice)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes by doubling them
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates an audit-ready, standardized CSV report of courses
 * structured specifically for institutional reporting, accreditation dossiers,
 * and curriculum committee reviews.
 */
export function generateCoursesCSV(courses: Course[]): string {
  const headers = [
    'Course Code',
    'Course Title',
    'Category',
    'Programme',
    'Department',
    'Academic Level',
    'Delivery Mode',
    'Credit Hours',
    'Duration (Weeks)',
    'Modules Count',
    'CLOs Count',
    'MLOs Count',
    'Lessons Count',
    'Activities Count',
    'Assessments Count',
    'Rubrics Count',
    'Evidence Rules Count',
    'Passing Benchmark (%)',
    'Expected Study Hours',
    'OBE Health Score (%)',
    'Curriculum Completion (%)',
    'Course Status',
    'Assessment Weightage Sum (%)',
    'Bloom Levels Covered',
    'Assessment Types Utilized',
    'Total Identified OBE Gaps',
    'Critical OBE Gaps',
    'Is Template',
    'Created Date',
    'Last Updated',
  ];

  const rows = courses.map((course) => {
    const audit = calculateCourseAudit(course);
    const clos = course.clos || [];
    const mlos = course.mlos || [];
    const modules = course.modules || [];
    const lessons = course.lessons || [];
    const activities = course.activities || [];
    const assessments = course.assessments || [];
    const rubrics = course.rubrics || [];
    const evidenceRules = course.evidenceRules || [];

    // Distinct Bloom levels across CLOs
    const bloomLevels = Array.from(
      new Set(clos.map((c) => c.bloomLevel).filter(Boolean))
    ).join('; ');

    // Distinct Assessment types
    const assessmentTypes = Array.from(
      new Set(assessments.map((a) => a.type).filter(Boolean))
    ).join('; ');

    // Total assessment weightage
    const totalWeightage = assessments.reduce((sum, a) => sum + (a.weightage || 0), 0);

    // Critical gaps
    const criticalGapsCount = audit.gaps.filter((g) => g.severity === 'Critical').length;

    return [
      escapeCSVCell(course.code || 'NO-CODE'),
      escapeCSVCell(course.title || 'Untitled Course'),
      escapeCSVCell(course.category || 'General'),
      escapeCSVCell(course.programme || 'General'),
      escapeCSVCell(course.department || 'N/A'),
      escapeCSVCell(course.courseLevel || 'Undergraduate'),
      escapeCSVCell(course.deliveryMode || 'Face-to-Face'),
      escapeCSVCell(course.creditHours ?? 3),
      escapeCSVCell(course.durationWeeks ?? 16),
      escapeCSVCell(modules.length),
      escapeCSVCell(clos.length),
      escapeCSVCell(mlos.length),
      escapeCSVCell(lessons.length),
      escapeCSVCell(activities.length),
      escapeCSVCell(assessments.length),
      escapeCSVCell(rubrics.length),
      escapeCSVCell(evidenceRules.length),
      escapeCSVCell(course.passingBenchmark ?? 50),
      escapeCSVCell(course.expectedStudyTimeHours ?? 0),
      escapeCSVCell(audit.healthScore),
      escapeCSVCell(audit.completionPercentage),
      escapeCSVCell((course.status || 'draft').toUpperCase()),
      escapeCSVCell(totalWeightage),
      escapeCSVCell(bloomLevels || 'None specified'),
      escapeCSVCell(assessmentTypes || 'None specified'),
      escapeCSVCell(audit.gaps.length),
      escapeCSVCell(criticalGapsCount),
      escapeCSVCell(course.isTemplate ? 'Yes' : 'No'),
      escapeCSVCell(course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'),
      escapeCSVCell(course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'),
    ].join(',');
  });

  // Prepend UTF-8 BOM so Excel and spreadsheet applications display characters cleanly
  return `\uFEFF${headers.join(',')}\n${rows.join('\n')}`;
}

/**
 * Triggers a browser download of the course catalog in CSV format.
 */
export function downloadCoursesCSV(courses: Course[], customFilename?: string): void {
  if (!courses || courses.length === 0) return;

  const csvContent = generateCoursesCSV(courses);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const defaultFilename = `OBE360_Course_Catalog_Report_${courses.length}_Courses_${
    new Date().toISOString().split('T')[0]
  }.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', customFilename || defaultFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
