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
  id: 'VA-8849-CLIN',
  name: 'Dr. Alistair Vance',
  title: 'Clinical Pathologist',
  role: 'Fellow • Student',
  email: 'a.vance@hospital.org',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  cohort: 'Cohort 2025 / Advanced Post-Mortem CT & Forensic Imaging',
  program: 'Fellowship in PMCT Diagnostic Interpretation',
  progressPercent: 60,
  cmeCreditsEarned: 18,
  cmeCreditsTotal: 24,
  licenseNumber: '7490218',
  institution: 'Royal Forensic Medical Institute',
};

export const MOCK_MODULES: CourseModule[] = [
  {
    id: 'mod-1',
    moduleNumber: 1,
    title: 'Introduction to PMCT & Hardware Specs',
    subtitle: 'Principles of Post-Mortem CT & PACS Workstation Setup',
    description: 'Foundational concepts of volumetric multi-slice post-mortem CT scanning, DICOM viewer calibration, and radiation physical parameters.',
    progressPercent: 100,
    status: 'completed',
    duration: '2h 15m',
    lessonsCount: 4,
    completedLessons: 4,
    cmeCredits: 4,
    lessons: [
      { id: 'm1-l1', title: '1. Basic Principles of PMCT Scanning', duration: '25 min', status: 'completed' },
      { id: 'm1-l2', title: '2. DICOM 3.0 Workstation Specs & Hardware', duration: '35 min', status: 'completed' },
      { id: 'm1-l3', title: '3. WebGL 2.0 PACS Viewer Configuration', duration: '40 min', status: 'completed' },
      { id: 'm1-l4', title: '4. Module 01 Self-Assessment Quiz', duration: '35 min', status: 'completed' },
    ]
  },
  {
    id: 'mod-2',
    moduleNumber: 2,
    title: 'Post-Mortem Decomposition Artifacts & HU Calibration',
    subtitle: 'Differentiating PM Lividity vs Traumatic Hemorrhage',
    description: 'Quantitative Hounsfield Unit (HU) mapping across subcutaneous hematomas, basilar skull fractures, and post-mortem hypostasis.',
    progressPercent: 100,
    status: 'completed',
    duration: '3h 10m',
    lessonsCount: 4,
    completedLessons: 4,
    cmeCredits: 5,
    lessons: [
      { id: 'm2-l1', title: '1. Post-Mortem Lividity & Sedimentation Artefacts', duration: '40 min', status: 'completed' },
      { id: 'm2-l2', title: '2. Hounsfield Unit Calibration (-1000 to +3071 HU)', duration: '45 min', status: 'completed' },
      { id: 'm2-l3', title: '3. Intravascular Gas Redistribution', duration: '50 min', status: 'completed' },
      { id: 'm2-l4', title: '4. Module 02 Case Practical Assessment', duration: '35 min', status: 'completed' },
    ]
  },
  {
    id: 'mod-3',
    moduleNumber: 3,
    title: 'Cranial & Thoracic Trauma PMCT Volumetric Evaluation',
    subtitle: 'Blunt & Penetrating Trauma Sign Interpretation',
    description: 'Comprehensive study of multi-planar axial, coronal, and sagittal 3D reconstructions for head injury and tension pneumothorax.',
    progressPercent: 60,
    status: 'in_progress',
    duration: '4h 30m',
    lessonsCount: 5,
    completedLessons: 2,
    cmeCredits: 6,
    lessons: [
      { id: 'm3-l1', title: '1. Introduction to PMCT Artefacts', duration: '22 min', status: 'completed' },
      { id: 'm3-l2', title: '2. Volumetric Contrast & Soft Tissue Density', duration: '28 min', status: 'active' },
      { id: 'm3-l3', title: '3. Skeletal Trauma & Fracture Mapping', duration: '35 min', status: 'locked' },
      { id: 'm3-l4', title: '4. Visceral Lacerations & Hemoperitoneum', duration: '30 min', status: 'locked' },
      { id: 'm3-l5', title: '5. Module 03 Diagnostic Assessment', duration: '40 min', status: 'locked' },
    ]
  },
  {
    id: 'mod-4',
    moduleNumber: 4,
    title: 'Visceral Lacerations, Hemoperitoneum & Vascular Dissection',
    subtitle: 'Forensic PMCT Angiography (PMCTA)',
    description: 'Minimally invasive post-mortem angiography techniques, femoral cannulation, contrast injection parameters, and arterial leak detection.',
    progressPercent: 0,
    status: 'locked',
    duration: '3h 45m',
    lessonsCount: 4,
    completedLessons: 0,
    cmeCredits: 5,
    lessons: [
      { id: 'm4-l1', title: '1. PMCTA Equipment & Cannulation Protocols', duration: '45 min', status: 'locked' },
      { id: 'm4-l2', title: '2. Coronary Artery Disease & Myocardial Infarction', duration: '55 min', status: 'locked' },
      { id: 'm4-l3', title: '3. Traumatic Aortic Rupture Diagnostics', duration: '40 min', status: 'locked' },
      { id: 'm4-l4', title: '4. Module 04 Practical Case Submission', duration: '45 min', status: 'locked' },
    ]
  },
  {
    id: 'mod-5',
    moduleNumber: 5,
    title: 'Final Competency Examination & Case Presentation',
    subtitle: 'Fellowship Board Accreditation Assessment',
    description: 'Proctored 60-vignette examination and peer-reviewed case report submission for RCPath / ISFRI Board Certification.',
    progressPercent: 0,
    status: 'locked',
    duration: '2h 00m',
    lessonsCount: 2,
    completedLessons: 0,
    cmeCredits: 4,
    lessons: [
      { id: 'm5-l1', title: '1. Final Exam Bye-Laws & Code of Ethics', duration: '15 min', status: 'locked' },
      { id: 'm5-l2', title: '2. Proctored 60-Vignette Board Exam', duration: '105 min', status: 'locked' },
    ]
  }
];

export const MOCK_ASSIGNMENTS: AssessmentItem[] = [
  {
    id: 'asg-01',
    moduleNumber: 1,
    title: 'Legal Frameworks & Chain of Custody Inquest Documentation',
    type: 'Written Dossier',
    dueDate: 'Sep 28, 2024',
    status: 'graded',
    score: 98,
    maxScore: 100,
    gradeLabel: 'Grade A (Distinction)',
    evaluator: 'Prof. J. Sterling, FRCPath',
    submissionDate: 'Submitted Sep 28, 2024',
    dicomId: 'VA-8102',
    weight: '10% of Final Grade'
  },
  {
    id: 'asg-02',
    moduleNumber: 2,
    title: 'Collimation, Reconstruction Artifacts & HU Calibration',
    type: 'DICOM Analysis',
    dueDate: 'Oct 06, 2024',
    status: 'graded',
    score: 92,
    maxScore: 100,
    gradeLabel: 'Grade A (Excellence)',
    evaluator: 'Dr. M. Lindqvist, MD PhD',
    submissionDate: 'Submitted Oct 06, 2024',
    dicomId: 'VA-8834',
    weight: '15% of Final Grade'
  },
  {
    id: 'asg-03',
    moduleNumber: 3,
    title: 'Cranial & Thoracic Trauma PMCT Volumetric Evaluation',
    type: 'Clinical Case Practical',
    dueDate: 'Oct 18, 2024 (Due in 3 Days)',
    status: 'pending',
    maxScore: 100,
    dicomId: 'VA-9428',
    weight: '15% of Final Grade'
  },
  {
    id: 'asg-04',
    moduleNumber: 4,
    title: 'Ballistic Wound Trajectory & Stippling Identification',
    type: 'PMCTA Case Study',
    dueDate: 'Nov 02, 2024',
    status: 'locked',
    maxScore: 100,
    dicomId: 'VA-9811',
    weight: '20% of Final Grade'
  }
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: '10 mins ago',
    title: 'Completed Lesson 1: Intro to PMCT Artefacts',
    description: 'Scored 100% on interactive volumetric windowing exercise.',
    type: 'dicom'
  },
  {
    id: 'act-2',
    timestamp: '2 hours ago',
    title: 'Saved Draft Notes for Module 03 Case Practical',
    description: 'Updated clinical observation density analysis for DICOM #VA-9428.',
    type: 'assignment'
  },
  {
    id: 'act-3',
    timestamp: 'Yesterday at 16:45',
    title: 'Grades Published: Module 02 Case Worksheet',
    description: 'Evaluated by Dr. M. Lindqvist with score 92/100 (Grade A Excellence).',
    type: 'quiz'
  },
  {
    id: 'act-4',
    timestamp: '3 days ago',
    title: 'PACS Cloud Node Connection Sync',
    description: 'Authenticated GPU WebGL 2.0 DICOM stream for patient volume VA-9428.',
    type: 'system'
  }
];
