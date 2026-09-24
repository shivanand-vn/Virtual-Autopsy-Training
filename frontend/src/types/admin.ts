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
  name: 'Dr. Julian Sterling',
  title: 'Director of PMCT Imaging',
  role: 'Administrator',
  email: 'j.sterling@virtualautopsy.edu',
  avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
};

export const MOCK_ADMIN_STATS = {
  totalStudents: 248,
  pendingApplications: 18,
  activeCourses: 3,
  totalPayments: '£247,752',
  completedCourses: 126,
  certificatesIssued: 118,
};

export const MOCK_APPLICANTS: ApplicantRecord[] = [
  {
    id: 'app-101',
    applicantName: 'Dr. Helena Vance',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    email: 'h.vance@stjude.org',
    qualification: 'MBBS / MD (Medical Doctor)',
    organization: 'St. Jude Forensic Imaging Hub',
    appliedDate: 'Oct 14, 2024',
    status: 'pending',
  },
  {
    id: 'app-102',
    applicantName: 'Dr. Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'm.thorne@berninquest.ch',
    qualification: 'FRCR (Royal College Radiologist)',
    organization: 'Bern Medico-Legal Center',
    appliedDate: 'Oct 12, 2024',
    status: 'pending',
  },
  {
    id: 'app-103',
    applicantName: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1594824813566-78a933f443e6?w=150&auto=format&fit=crop&q=80',
    email: 's.jenkins@melbourneforensic.au',
    qualification: 'Certified Forensic Pathologist',
    organization: 'Melbourne Forensic Institute',
    appliedDate: 'Oct 10, 2024',
    status: 'approved',
  },
  {
    id: 'app-104',
    applicantName: 'Dr. Aris Thorne',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'a.thorne@nordicforensic.se',
    qualification: 'Ph.D. Forensic Pathology',
    organization: 'Nordic Forensic Sciences',
    appliedDate: 'Oct 08, 2024',
    status: 'approved',
  },
  {
    id: 'app-105',
    applicantName: 'Dr. Kenji Sato',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'k.sato@tokyomed.jp',
    qualification: 'Senior CT/DICOM Radiographer',
    organization: 'Tokyo Metropolitan Mortuary',
    appliedDate: 'Oct 05, 2024',
    status: 'rejected',
  },
];

export const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-501',
    studentName: 'Dr. Alistair Vance',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    courseName: 'Basic Virtual Autopsy – An Online Introduction',
    amountFormatted: '£2,450',
    amountValue: 2450,
    date: 'Oct 15, 2024',
    status: 'successful',
  },
  {
    id: 'pay-502',
    studentName: 'Dr. Helena Vance',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    courseName: 'Fellowship in PMCT Diagnostic Interpretation',
    amountFormatted: '£4,800',
    amountValue: 4800,
    date: 'Oct 14, 2024',
    status: 'pending',
  },
  {
    id: 'pay-503',
    studentName: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1594824813566-78a933f443e6?w=150&auto=format&fit=crop&q=80',
    courseName: 'Basic Virtual Autopsy – An Online Introduction',
    amountFormatted: '£2,450',
    amountValue: 2450,
    date: 'Oct 10, 2024',
    status: 'successful',
  },
  {
    id: 'pay-504',
    studentName: 'Dr. Kenji Sato',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    courseName: 'Forensic PMCT Angiography Masterclass',
    amountFormatted: '£1,250',
    amountValue: 1250,
    date: 'Oct 05, 2024',
    status: 'failed',
  },
];

export const MOCK_ADMIN_COURSES: AdminCourseOverview[] = [
  {
    id: 'crs-01',
    title: 'Basic Virtual Autopsy – An Online Introduction',
    enrolledStudents: 184,
    completionPercent: 68,
    status: 'published',
  },
  {
    id: 'crs-02',
    title: 'Fellowship in PMCT Diagnostic Interpretation',
    enrolledStudents: 64,
    completionPercent: 42,
    status: 'published',
  },
  {
    id: 'crs-03',
    title: 'Forensic PMCT Angiography & Micro-CT Dissection',
    enrolledStudents: 32,
    completionPercent: 25,
    status: 'published',
  },
];

export const MOCK_ADMIN_ACTIVITIES: AdminActivityLog[] = [
  {
    id: 'act-adm-1',
    timestamp: '5 mins ago',
    title: 'New Student Application Received',
    description: 'Dr. Helena Vance submitted application for PMCT Fellowship.',
    type: 'registration',
  },
  {
    id: 'act-adm-2',
    timestamp: '25 mins ago',
    title: 'Application Approved',
    description: 'Admin approved Dr. Sarah Jenkins for Fall Term 2024.',
    type: 'application',
  },
  {
    id: 'act-adm-3',
    timestamp: '2 hours ago',
    title: 'Tuition Payment Received',
    description: 'Payment of £2,450 confirmed for Dr. Alistair Vance.',
    type: 'payment',
  },
  {
    id: 'act-adm-4',
    timestamp: '4 hours ago',
    title: 'Assignment Submitted',
    description: 'Dr. Alistair Vance submitted Case Practical #VA-9428.',
    type: 'assignment',
  },
  {
    id: 'act-adm-5',
    timestamp: 'Yesterday',
    title: 'Certificate Issued',
    description: 'RCPath Category 1 Certificate issued for Dr. M. Lindqvist.',
    type: 'certificate',
  },
];

export const MOCK_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    title: '18 Applications Waiting Approval',
    description: 'New clinical applications require faculty review.',
    timestamp: '10 mins ago',
    read: false,
    type: 'applications',
  },
  {
    id: 'notif-2',
    title: '5 New Payments Received Today',
    description: 'Total £12,400 cleared via Stripe PACS gateway.',
    timestamp: '1 hour ago',
    read: false,
    type: 'payments',
  },
  {
    id: 'notif-3',
    title: '3 Assignments Require Manual Grading',
    description: 'Module 03 clinical case practicals ready for evaluator.',
    timestamp: '3 hours ago',
    read: false,
    type: 'grading',
  },
  {
    id: 'notif-4',
    title: '2 Certificates Ready to Issue',
    description: 'Fellowship requirements verified for Dr. Vance.',
    timestamp: 'Yesterday',
    read: true,
    type: 'certificates',
  },
];
