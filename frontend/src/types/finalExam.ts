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

export interface FinalExam {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  duration?: number;
  totalMarks: number;
  passPercentage?: number;
  status: 'draft' | 'published';
  questions: FinalExamQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

// Runtime marker to ensure Vite generates a non-empty module export
export const FINAL_EXAM_TYPES_VERSION = '1.0.0';
