import { Course, CourseTemplate } from '../types';
import { FLAGSHIP_COURSE, CS_TEMPLATE_COURSE, ARABIC_COURSE_TEMPLATE, FRENCH_COURSE_TEMPLATE } from '../data/initialCourses';

const TEMPLATES_STORAGE_KEY = 'mentisera_obe360_templates_v2';

export const SYSTEM_TEMPLATES: CourseTemplate[] = [
  {
    id: 'system-tmpl-law',
    name: 'Constitutional Law & Governance (English OBE Blueprint)',
    description: 'Complete 16-week outcome-based curriculum with 4 Bloom-aligned CLOs, 12 MLOs, simulated bench moot, and multi-tier authentic rubrics.',
    category: 'Law & Governance',
    tags: ['English', 'Law', 'Undergraduate', 'Bloom L3-L6', 'Moot Court', 'Accredited'],
    createdAt: '2026-01-15T00:00:00.000Z',
    isSystem: true,
    courseData: FLAGSHIP_COURSE,
  },
  {
    id: 'system-tmpl-cs',
    name: 'Artificial Intelligence & Neural Systems (OBE Blueprint)',
    description: 'Rigorous engineering curriculum featuring 4 high-order CLOs, lab practicals, PyTorch neural network projects, and direct code review rubrics.',
    category: 'Computer Science & Engineering',
    tags: ['English', 'Computer Science', 'AI', 'Deep Learning', 'ABET', 'Washington Accord'],
    createdAt: '2026-02-01T00:00:00.000Z',
    isSystem: true,
    courseData: CS_TEMPLATE_COURSE,
  },
  {
    id: 'system-tmpl-arabic-law',
    name: 'القانون الدستوري والحوكمة الرشيدة (العربية - RTL)',
    description: 'منهاج أكاديمي متكامل قائم على مخرجات التعلم (OBE) باللغة العربية، بدعم كامل لاتجاه النص من اليمين إلى اليسار (RTL).',
    category: 'القانون والعلوم السياسية',
    tags: ['العربية', 'Arabic', 'RTL', 'شريعة وقانون', 'اعتماد أكاديمي', 'OBE'],
    createdAt: '2026-02-15T00:00:00.000Z',
    isSystem: true,
    courseData: ARABIC_COURSE_TEMPLATE,
  },
  {
    id: 'system-tmpl-french-law',
    name: 'Droit Constitutionnel et Systèmes Comparés (Français)',
    description: 'Curriculum universitaire complet selon l\'approche par compétences (OBE), alignement constructif et évaluation authentique en français.',
    category: 'Droit & Sciences Politiques',
    tags: ['Français', 'French', 'Droit', 'LMD', 'Compétences', 'Accréditation'],
    createdAt: '2026-02-20T00:00:00.000Z',
    isSystem: true,
    courseData: FRENCH_COURSE_TEMPLATE,
  },
];

export function getSavedTemplates(): CourseTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (raw) {
      const userTemplates: CourseTemplate[] = JSON.parse(raw);
      if (Array.isArray(userTemplates)) {
        // Return system templates combined with user templates
        return [...SYSTEM_TEMPLATES, ...userTemplates];
      }
    }
  } catch (err) {
    console.warn('Could not parse user templates from localStorage:', err);
  }
  return [...SYSTEM_TEMPLATES];
}

export function saveCourseAsTemplate(
  course: Course,
  name: string,
  description: string,
  category: string = 'Custom Templates',
  tags: string[] = ['Custom', 'User-Created']
): CourseTemplate {
  // Deep clone the course structure
  const clonedCourse: Course = JSON.parse(JSON.stringify(course));
  clonedCourse.isTemplate = true;

  const newTemplate: CourseTemplate = {
    id: `tmpl-${Date.now()}`,
    name: name.trim() || `${course.title} Template`,
    description: description.trim() || course.description || 'Custom course blueprint with full outcome architecture.',
    category: category.trim() || course.category || 'General',
    tags: tags.length > 0 ? tags : [course.department || 'Curriculum', `${course.courseLevel || 'Undergraduate'}`],
    createdAt: new Date().toISOString(),
    isSystem: false,
    courseData: clonedCourse,
  };

  try {
    const existingRaw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const existing: CourseTemplate[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [newTemplate, ...existing];
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist user template to localStorage:', err);
  }

  return newTemplate;
}

export function deleteUserTemplate(templateId: string): boolean {
  try {
    const existingRaw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!existingRaw) return false;
    const existing: CourseTemplate[] = JSON.parse(existingRaw);
    const filtered = existing.filter((t) => t.id !== templateId);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.warn('Failed to delete template from localStorage:', err);
    return false;
  }
}

export function createCourseFromTemplate(
  template: CourseTemplate,
  customTitle?: string,
  customCode?: string
): Course {
  const baseCourse: Course = JSON.parse(JSON.stringify(template.courseData));
  const newId = `course-${Date.now()}`;
  const now = new Date().toISOString();

  return {
    ...baseCourse,
    id: newId,
    title: customTitle?.trim() || `${baseCourse.title} (New Cohort)`,
    code: customCode?.trim() || `${baseCourse.code || 'OBE'}-NEW`,
    isTemplate: false,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}
