import type { BloomLevel, LearningDomain } from '../types';
import { Quiz } from './quiz';

export interface ModularLearningOutcome {
  id: string;
  code: string; // e.g. "MLO X.Y.Z"
  statement: string;
  bloomVerb: string;
  bloomLevel: BloomLevel;
  learningDomain?: LearningDomain;
  moduleId: string;
  parentMLUId: string;
  
  // Alignment
  linkedCLOId: string;
  relatedCLOIds: string[];
  relatedPLOIds: string[];
  
  // Competencies and Skills
  relatedCompetencyIds: string[];
  supportingSkillIds: string[];
  
  // Assessment
  requiredActivity: string;
  learningActivities: string[];
  assessment: string;
  assessmentMethod: string;
  rubricCriteria: string[];
  performanceThreshold: string;
  competencyThreshold?: number;
  evidence: string;
  evidenceOfAchievement: string;
  
  // Metadata
  studyTimeHours: number;
  weightage?: number;
  weight?: number;
  status: 'Draft' | 'Approved' | 'Under Review';
  quiz?: Quiz;
}

export interface MicroLearningUnit {
  id: string;
  unitNumber: number; // 1, 2, 3, or 4
  weekNumber: number;
  title: string;
  description?: string;
  mloIds: string[]; // Modular Learning Outcomes within this MLU
  durationMinutes?: number;
  bloomLevel?: BloomLevel;
  deliveryFormat?:
    | 'Interactive Lecture'
    | 'Hands-on Lab'
    | 'Self-Paced Practice'
    | 'Case Study'
    | 'Discussion & Quiz'
    | 'Problem-Solving Studio';
  isCompleted?: boolean;
  instructorNotes?: string;
}
