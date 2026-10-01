export type FinalExamQuestionType = 'single-choice' | 'multiple-response' | 'true-false-combination';

export interface FinalExamQuestionOption {
  id: string;
  text: string;
}

export interface FinalExamQuestion {
  id: string;
  examId: string;
  type: FinalExamQuestionType;
  text: string;
  image?: string;
  options?: FinalExamQuestionOption[];
  statements?: {
    statement1: string;
    statement2: string;
  };
  correctAnswer?: string;
  correctAnswers?: string[];
  marks: number;
  explanation?: string;
  order: number;
}

export interface ExamQuestionSets {
  set1: FinalExamQuestion[];
  set2: FinalExamQuestion[];
  set3: FinalExamQuestion[];
}

export interface FinalExam {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  duration?: number;
  totalMarks: number;
  passPercentage?: number;
  status: 'draft' | 'published';
  questions: FinalExamQuestion[]; // backward compatibility
  questionSets?: ExamQuestionSets; // Multi-set for Attempts 1, 2, 3
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamAttemptRecord {
  attemptNumber: 1 | 2 | 3;
  setUsed: 1 | 2 | 3;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timestamp: string;
  tabSwitchCount: number;
  answers: Record<string, string[]>;
}

export interface StudentExamHistory {
  examId: string;
  status: 'not_started' | 'in_progress' | 'passed' | 'failed_attempts_exhausted';
  attemptsUsed: number; // 0, 1, 2, or 3
  bestPercentage: number;
  passed: boolean;
  attempts: ExamAttemptRecord[];
  locked: boolean;
}

// Runtime marker to ensure Vite generates a non-empty module export
export const FINAL_EXAM_TYPES_VERSION = '2.0.0';

