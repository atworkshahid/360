import { Course, CLO, Assessment, Lesson } from '../types';

export interface DiffResult {
  addedClos: CLO[];
  removedClos: CLO[];
  modifiedClos: { old: CLO; new: CLO }[];
  addedAssessments: Assessment[];
  removedAssessments: Assessment[];
  modifiedAssessments: { old: Assessment; new: Assessment }[];
  addedLessons: Lesson[];
  removedLessons: Lesson[];
  modifiedLessons: { old: Lesson; new: Lesson }[];
}

export function computeDetailedCourseDiff(oldCourse: Course, newCourse: Course): DiffResult {
  const result: DiffResult = {
    addedClos: [],
    removedClos: [],
    modifiedClos: [],
    addedAssessments: [],
    removedAssessments: [],
    modifiedAssessments: [],
    addedLessons: [],
    removedLessons: [],
    modifiedLessons: [],
  };

  // Helper for ID-based diffing
  const diffArray = <T extends { id: string }>(
    oldArr: T[] = [],
    newArr: T[] = [],
    onAdd: (item: T) => void,
    onRemove: (item: T) => void,
    onModify: (oldItem: T, newItem: T) => void
  ) => {
    const oldMap = new Map(oldArr.map(item => [item.id, item]));
    const newMap = new Map(newArr.map(item => [item.id, item]));

    newArr.forEach(item => {
      if (!oldMap.has(item.id)) {
        onAdd(item);
      } else {
        const oldItem = oldMap.get(item.id)!;
        if (JSON.stringify(oldItem) !== JSON.stringify(item)) {
          onModify(oldItem, item);
        }
      }
    });

    oldArr.forEach(item => {
      if (!newMap.has(item.id)) {
        onRemove(item);
      }
    });
  };

  diffArray(
    oldCourse.clos,
    newCourse.clos,
    (item) => result.addedClos.push(item),
    (item) => result.removedClos.push(item),
    (oldItem, newItem) => result.modifiedClos.push({ old: oldItem, new: newItem })
  );

  diffArray(
    oldCourse.assessments,
    newCourse.assessments,
    (item) => result.addedAssessments.push(item),
    (item) => result.removedAssessments.push(item),
    (oldItem, newItem) => result.modifiedAssessments.push({ old: oldItem, new: newItem })
  );

  diffArray(
    oldCourse.lessons,
    newCourse.lessons,
    (item) => result.addedLessons.push(item),
    (item) => result.removedLessons.push(item),
    (oldItem, newItem) => result.modifiedLessons.push({ old: oldItem, new: newItem })
  );

  return result;
}
