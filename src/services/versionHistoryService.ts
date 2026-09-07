import { Course, CourseVersion, VersionSaveType } from '../types';
import { calculateCourseAudit } from '../utils/obeCalculator';

const VERSIONS_STORAGE_KEY = 'mentisera_obe360_course_versions_v1';
export const MAX_VERSIONS_PER_COURSE = 5;

// Read all version registries from localStorage
function readAllVersions(): Record<string, CourseVersion[]> {
  try {
    const raw = localStorage.getItem(VERSIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse course version history from localStorage:', err);
  }
  return {};
}

// Write all version registries to localStorage
function writeAllVersions(all: Record<string, CourseVersion[]>): void {
  try {
    localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to write course version history to localStorage:', err);
  }
}

/**
 * Get all stored versions for a course, sorted newest to oldest.
 */
export function getCourseVersions(courseId: string): CourseVersion[] {
  const all = readAllVersions();
  const versions = all[courseId] || [];
  return [...versions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Detect high-level changes between two course objects.
 */
export function computeCourseDiff(oldCourse: Course, newCourse: Course): string[] {
  const changes: string[] = [];

  if (oldCourse.title !== newCourse.title) {
    changes.push(`Title: "${oldCourse.title}" → "${newCourse.title}"`);
  }
  if (oldCourse.code !== newCourse.code) {
    changes.push(`Code: ${oldCourse.code} → ${newCourse.code}`);
  }
  if (oldCourse.creditHours !== newCourse.creditHours) {
    changes.push(`Credits: ${oldCourse.creditHours} → ${newCourse.creditHours}`);
  }
  if (oldCourse.status !== newCourse.status) {
    changes.push(`Status: ${oldCourse.status} → ${newCourse.status}`);
  }

  // CLOs
  const cloDiff = (newCourse.clos?.length || 0) - (oldCourse.clos?.length || 0);
  if (cloDiff > 0) {
    changes.push(`+${cloDiff} CLO${cloDiff > 1 ? 's' : ''}`);
  } else if (cloDiff < 0) {
    changes.push(`${cloDiff} CLO${Math.abs(cloDiff) > 1 ? 's' : ''}`);
  } else if (JSON.stringify(oldCourse.clos) !== JSON.stringify(newCourse.clos)) {
    changes.push('Modified CLO statements/mappings');
  }

  // Modules
  const moduleDiff = (newCourse.modules?.length || 0) - (oldCourse.modules?.length || 0);
  if (moduleDiff > 0) {
    changes.push(`+${moduleDiff} Module${moduleDiff > 1 ? 's' : ''}`);
  } else if (moduleDiff < 0) {
    changes.push(`${moduleDiff} Module${Math.abs(moduleDiff) > 1 ? 's' : ''}`);
  } else if (JSON.stringify(oldCourse.modules) !== JSON.stringify(newCourse.modules)) {
    changes.push('Updated module structures');
  }

  // Lessons
  const lessonDiff = (newCourse.lessons?.length || 0) - (oldCourse.lessons?.length || 0);
  if (lessonDiff !== 0) {
    changes.push(`${lessonDiff > 0 ? '+' : ''}${lessonDiff} Lessons`);
  }

  // Assessments
  const assessDiff = (newCourse.assessments?.length || 0) - (oldCourse.assessments?.length || 0);
  if (assessDiff !== 0) {
    changes.push(`${assessDiff > 0 ? '+' : ''}${assessDiff} Assessments`);
  } else if (JSON.stringify(oldCourse.assessments) !== JSON.stringify(newCourse.assessments)) {
    changes.push('Modified assessment tasks/weights');
  }

  // Rubrics
  const rubricDiff = (newCourse.rubrics?.length || 0) - (oldCourse.rubrics?.length || 0);
  if (rubricDiff !== 0) {
    changes.push(`${rubricDiff > 0 ? '+' : ''}${rubricDiff} Rubrics`);
  }

  // Evidence Rules
  const evidenceDiff = (newCourse.evidenceRules?.length || 0) - (oldCourse.evidenceRules?.length || 0);
  if (evidenceDiff !== 0) {
    changes.push(`${evidenceDiff > 0 ? '+' : ''}${evidenceDiff} Evidence Rules`);
  }

  if (changes.length === 0) {
    changes.push('Minor attribute adjustments');
  }

  return changes;
}

/**
 * Save a new version snapshot for a course.
 * Automatically keeps only the latest 5 saves.
 */
export function saveCourseVersion(
  course: Course,
  saveType: VersionSaveType = 'autosave',
  customLabel?: string
): CourseVersion | null {
  if (!course || !course.id) return null;

  const all = readAllVersions();
  const currentVersions = all[course.id] || [];

  // Deep clone course to prevent references mutating snapshot
  const courseSnapshot: Course = JSON.parse(JSON.stringify(course));

  // If there is an existing latest version, check if identical
  if (currentVersions.length > 0) {
    const latest = currentVersions[currentVersions.length - 1];
    const latestSerialized = JSON.stringify(latest.course);
    const newSerialized = JSON.stringify(courseSnapshot);

    // If identical, don't spam duplicate snapshot unless it's a manual save or restore
    if (latestSerialized === newSerialized && saveType === 'autosave') {
      return latest;
    }
  }

  const prevVersion = currentVersions.length > 0 ? currentVersions[currentVersions.length - 1].course : null;
  const changesSummary = prevVersion ? computeCourseDiff(prevVersion, courseSnapshot) : ['Initial baseline snapshot'];

  let healthScore: number | undefined;
  try {
    const audit = calculateCourseAudit(courseSnapshot);
    healthScore = audit.healthScore;
  } catch {
    // ignore audit calculation error if any
  }

  const nextVersionNumber = currentVersions.length > 0
    ? (currentVersions[currentVersions.length - 1].versionNumber || 0) + 1
    : 1;

  const newVersion: CourseVersion = {
    id: `ver-${course.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courseId: course.id,
    versionNumber: nextVersionNumber,
    timestamp: new Date().toISOString(),
    saveType,
    label: customLabel || (saveType === 'manual' ? 'Manual Save' : saveType === 'restore' ? 'Restored Snapshot' : 'Autosave'),
    summary: {
      title: course.title || 'Untitled Course',
      code: course.code || 'NO-CODE',
      closCount: course.clos?.length || 0,
      modulesCount: course.modules?.length || 0,
      lessonsCount: course.lessons?.length || 0,
      assessmentsCount: course.assessments?.length || 0,
      rubricsCount: course.rubrics?.length || 0,
      healthScore,
      status: course.status || 'draft',
    },
    course: courseSnapshot,
    changesSummary,
  };

  // Add new version
  const updatedList = [...currentVersions, newVersion];

  // Strictly enforce the last 5 saves constraint!
  if (updatedList.length > MAX_VERSIONS_PER_COURSE) {
    updatedList.splice(0, updatedList.length - MAX_VERSIONS_PER_COURSE);
  }

  all[course.id] = updatedList;
  writeAllVersions(all);

  // Notify active components via browser event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('course_version_saved', { detail: { courseId: course.id, version: newVersion } }));
  }

  return newVersion;
}

/**
 * Restore a course to a previous version state.
 * Returns the restored Course object and also saves a pre-restore backup.
 */
export function restoreCourseVersion(
  courseId: string,
  versionId: string,
  currentLiveCourse?: Course
): { restoredCourse: Course; backupVersion?: CourseVersion } | null {
  const versions = getCourseVersions(courseId);
  const targetVersion = versions.find((v) => v.id === versionId);
  if (!targetVersion) return null;

  // 1. Create a pre-restore backup of the current live course if available
  let backupVersion: CourseVersion | undefined;
  if (currentLiveCourse && currentLiveCourse.id === courseId) {
    backupVersion = saveCourseVersion(
      currentLiveCourse,
      'manual',
      `Backup before restoring v${targetVersion.versionNumber}`
    ) || undefined;
  }

  // 2. Deep clone target version course
  const restoredCourse: Course = JSON.parse(JSON.stringify(targetVersion.course));
  restoredCourse.updatedAt = new Date().toISOString();

  // 3. Save a new version entry indicating the restoration event
  saveCourseVersion(
    restoredCourse,
    'restore',
    `Restored from v${targetVersion.versionNumber} (${new Date(targetVersion.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
  );

  return { restoredCourse, backupVersion };
}

/**
 * Delete a specific version entry
 */
export function deleteCourseVersion(courseId: string, versionId: string): void {
  const all = readAllVersions();
  if (!all[courseId]) return;
  all[courseId] = all[courseId].filter((v) => v.id !== versionId);
  writeAllVersions(all);
}

/**
 * Clear all version history for a course
 */
export function clearCourseVersions(courseId: string): void {
  const all = readAllVersions();
  delete all[courseId];
  writeAllVersions(all);
}
