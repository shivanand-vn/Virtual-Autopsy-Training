export type QuestionType = 'single' | 'multiple' | 'true_false';

export interface QuestionOption {
  id: string;
  label: string; // A, B, C, D, E, F...
  text: string;
}

export interface BankQuestion {
  id: string;
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  type: QuestionType;
  text: string;
  image?: string;
  imageName?: string;
  options?: QuestionOption[];
  correctAnswer?: string; // option id for single, or 'A'/'B'/'C'/'D' for true_false
  correctAnswers?: string[]; // array of option ids for multiple
  statements?: [string, string]; // 2 statements for true_false combination
  marks: number;
  explanation?: string;
  status: 'active' | 'draft';
  createdAt: string;
}

// INITIAL STATE STARTS COMPLETELY EMPTY
export const MOCK_COURSES: Array<{ id: string; name: string }> = [];

export const MOCK_MODULES_BY_COURSE: Record<string, Array<{ id: string; name: string }>> = {};

export const INITIAL_MOCK_QUESTIONS: BankQuestion[] = [];
