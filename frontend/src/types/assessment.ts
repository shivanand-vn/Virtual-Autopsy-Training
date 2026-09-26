export type QuestionType = 'single' | 'multiple' | 'true_false' | 'image';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: QuestionOption[];
  image?: string;
  imageCaption?: string;
  correctAnswers: string[];
  explanation?: string;
}

export interface ModuleAssessment {
  id: string;
  moduleId: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScorePercent: number;
  questions: Question[];
}

export interface AssessmentResult {
  moduleId: string;
  moduleTitle: string;
  moduleNumber: number;
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercent: number;
  passed: boolean;
  completedAt: string;
  userAnswers: Record<string, string[]>;
}
