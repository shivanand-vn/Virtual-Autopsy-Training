export interface StudentProfile {
  id: string;
  name: string;
  title: string;
  role: string;
  email: string;
  avatar: string;
  cohort: string;
  program: string;
  progressPercent: number;
  cmeCreditsEarned: number;
  cmeCreditsTotal: number;
  licenseNumber: string;
  institution: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'active' | 'locked';
  videoUrl?: string;
  summary?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  description: string;
  progressPercent: number;
  status: 'completed' | 'in_progress' | 'locked';
  duration: string;
  lessonsCount: number;
  completedLessons: number;
  lessons: Lesson[];
  cmeCredits: number;
}

export interface AssessmentItem {
  id: string;
  moduleNumber: number;
  title: string;
  type: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'locked';
  score?: number;
  maxScore: number;
  gradeLabel?: string;
  evaluator?: string;
  submissionDate?: string;
  dicomId?: string;
  weight: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'dicom' | 'quiz' | 'assignment' | 'exam' | 'system';
}

export interface CertificateRecord {
  certificateId: string;
  issueDate: string;
  recipientName: string;
  degree: string;
  programTitle: string;
  status: 'in_progress' | 'issued' | 'verified';
  qrCodeHash: string;
  verificationLink: string;
  signatories: Array<{ name: string; title: string }>;
}

export const MOCK_STUDENT: StudentProfile = {
  id: 'VA-STUDENT',
  name: 'Student',
  title: 'Enrolled Fellow',
  role: 'Fellow • Student',
  email: 'student@virtualautopsy.edu',
  avatar: '',
  cohort: 'Virtual Autopsy Training Program',
  program: 'PMCT Diagnostic Interpretation',
  progressPercent: 0,
  cmeCreditsEarned: 0,
  cmeCreditsTotal: 0,
  licenseNumber: '',
  institution: '',
};

export const MOCK_MODULES: CourseModule[] = [];
export const MOCK_ASSIGNMENTS: AssessmentItem[] = [];
export const MOCK_ACTIVITY: ActivityLog[] = [];
