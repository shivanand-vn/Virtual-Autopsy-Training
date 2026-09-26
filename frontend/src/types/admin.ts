export interface AdminProfile {
  id: string;
  name: string;
  title: string;
  role: string;
  email: string;
  avatar: string;
}

export interface ApplicantRecord {
  id: string;
  applicantName: string;
  avatar: string;
  email: string;
  qualification: string;
  organization: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PaymentRecord {
  id: string;
  studentName: string;
  avatar: string;
  courseName: string;
  amountFormatted: string; // e.g., £2,450
  amountValue: number;
  date: string;
  status: 'successful' | 'pending' | 'failed';
}

export interface AdminCourseOverview {
  id: string;
  title: string;
  enrolledStudents: number;
  completionPercent: number;
  status: 'published' | 'draft' | 'archived';
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'registration' | 'application' | 'payment' | 'assignment' | 'exam' | 'certificate';
}

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'applications' | 'payments' | 'grading' | 'certificates';
}

export const MOCK_ADMIN: AdminProfile = {
  id: 'ADM-001',
  name: 'System Administrator',
  title: 'LMS Administrator',
  role: 'Administrator',
  email: 'admin@virtualautopsy.edu',
  avatar: '',
};

export const MOCK_ADMIN_STATS = {
  totalStudents: 0,
  pendingApplications: 0,
  activeCourses: 0,
  totalPayments: '£0.00',
  completedCourses: 0,
  certificatesIssued: 0,
};

export const MOCK_APPLICANTS: ApplicantRecord[] = [];
export const MOCK_PAYMENTS: PaymentRecord[] = [];
export const MOCK_ADMIN_COURSES: AdminCourseOverview[] = [];
export const MOCK_ADMIN_ACTIVITIES: AdminActivityLog[] = [];
export const MOCK_ADMIN_NOTIFICATIONS: AdminNotification[] = [];
