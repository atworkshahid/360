import { Rubric } from '../types';

/**
 * Generates CSV content from a Rubric.
 */
export function generateRubricCSV(rubric: Rubric): string {
  const headers = [
    'Criterion',
    'Weight (%)',
    'Not Achieved (0-49%)',
    'Developing (50-64%)',
    'Achieved (65-74%)',
    'Proficient (75-84%)',
    'Exemplary (85-100%)',
  ];

  const rows = rubric.criteria.map((c) => {
    const levels = c.levels;
    return [
      `"${c.criterionName.replace(/"/g, '""')}"`,
      c.weight,
      `"${(levels.find(l => l.level === 'Not Achieved')?.descriptor || '').replace(/"/g, '""')}"`,
      `"${(levels.find(l => l.level === 'Developing')?.descriptor || '').replace(/"/g, '""')}"`,
      `"${(levels.find(l => l.level === 'Achieved')?.descriptor || '').replace(/"/g, '""')}"`,
      `"${(levels.find(l => l.level === 'Proficient')?.descriptor || '').replace(/"/g, '""')}"`,
      `"${(levels.find(l => l.level === 'Exemplary')?.descriptor || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return `\uFEFF${headers.join(',')}\n${rows.join('\n')}`;
}

/**
 * Downloads a rubric as a CSV file.
 */
export function downloadRubricCSV(rubric: Rubric): void {
  const csvContent = generateRubricCSV(rubric);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename = `${rubric.title.replace(/[^a-z0-9]/gi, '_')}_Rubric.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
