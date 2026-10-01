export type ContentType = 'description' | 'theory' | 'video' | 'assignment';

export interface Topic {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  content?: string; // For text / theory topics
  videoUrl?: string; // For video topics
  bunnyVideoId?: string; // Bunny Stream video GUID
  requiredWatchPercentage?: number; // Default 90% for video topics
  assignmentInstructions?: string; // For assignment topics
  submissionInstructions?: string; // For assignment topics
  referenceAttachmentUrl?: string; // Optional reference file for assignment
  referenceAttachmentName?: string;
  thumbnail?: string;
  order: number;
  status: 'draft' | 'published';
}

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleTitle: string;
  topicId: string;
  topicTitle: string;
  submittedAt: string;
  status: SubmissionStatus;
  assignmentInstructions?: string;
  studentResponseText?: string;
  uploadedFileUrl?: string;
  uploadedFileName?: string;
  adminFeedback?: string;
  reviewedAt?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number; // Derived from position (1, 2, 3...)
  title: string;
  subtitle?: string;
  description: string;
  duration: string;
  cmeCredits: number;
  order: number;
  status: 'draft' | 'published';
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  title?: string;
  shortDescription: string;
  description: string;
  duration: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  status: 'draft' | 'published';
  createdAt: string;
  modules: CourseModule[];
}

// INITIAL STATE CONTAINING DEFAULT VIRTUAL AUTOPSY ONLINE TRAINING COURSE
export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-va-001',
    name: 'Virtual Autopsy Online Training',
    shortDescription: 'Advanced training in Postmortem Computed Tomography (PMCT), virtual autopsy techniques, forensic imaging, and modern postmortem investigation.',
    description: 'An introduction to Post-Mortem CT (PMCT), covering its principles, forensic applications, benefits, limitations, and role alongside conventional autopsy. This course is constructed by forensic imaging authorities to modernize non-invasive investigation methodologies across legal and clinical spheres.',
    duration: '8 Hours • 4 Core Modules',
    thumbnail: '/autop.png',
    status: 'published',
    createdAt: '2025-01-15',
    modules: [
      {
        id: 'mod-1',
        moduleNumber: 1,
        title: 'Introduction to Virtual Autopsy & Legal Frameworks',
        subtitle: 'Principles, evidentiary value, comparative autopsy review',
        description: 'Principles, evidentiary value, comparative autopsy review',
        duration: '2h 00m',
        cmeCredits: 4,
        order: 1,
        status: 'published',
        topics: [
          {
            id: 't-1',
            title: 'High-Definition Lecture: History and Physics of PMCT',
            description: 'Comprehensive overview of PMCT history, physics, and hardware setup.',
            contentType: 'video',
            videoUrl: '/autopsy.mp4',
            order: 1,
            status: 'published'
          },
          {
            id: 't-2',
            title: 'Reading Dossier: International Chain of Custody & Admissibility',
            description: 'Legal protocols for digital autopsy admissibility in courtroom proceedings.',
            contentType: 'description',
            order: 2,
            status: 'published'
          },
          {
            id: 't-3',
            title: 'Module 01 Foundational Competency Quiz',
            description: 'Assessment covering fundamental PMCT concepts.',
            contentType: 'description',
            order: 3,
            status: 'published'
          }
        ]
      },
      {
        id: 'mod-2',
        moduleNumber: 2,
        title: 'PMCT Acquisition Protocols & MPR Reconstruction',
        subtitle: 'Scanning parameters, metal artifact reduction, multi-planar reformations',
        description: 'Scanning parameters, metal artifact reduction, multi-planar reformations',
        duration: '2h 00m',
        cmeCredits: 4,
        order: 2,
        status: 'published',
        topics: [
          {
            id: 't-4',
            title: 'Volumetric CT Calibration & Artifact Reduction Protocols',
            description: 'Technical calibration procedures for reducing metallic streak artifacts.',
            contentType: 'video',
            videoUrl: '/autopsy.mp4',
            order: 1,
            status: 'published'
          },
          {
            id: 't-5',
            title: 'Multi-Planar Reconstruction (MPR) Hands-on PACS Exercise',
            description: 'Interactive PACS exercise for coronal, sagittal, and axial MPR reformations.',
            contentType: 'assignment',
            assignmentInstructions: 'Review the provided PMCT dataset for metallic artifact reduction. Perform coronal and sagittal MPR reformations and submit a summary of your findings including Hounsfield unit measurements and artifact mitigation strategy.',
            submissionInstructions: 'Type your clinical observations and findings in the response field below. Optionally attach a PDF report or annotated screenshot.',
            referenceAttachmentName: 'MPR_Reconstruction_Guidelines.pdf',
            order: 2,
            status: 'published'
          },
          {
            id: 't-6',
            title: 'Module 02 Assessment: MPR Analysis & Artifact Identification',
            description: 'Evaluation testing artifact recognition and image quality optimization.',
            contentType: 'description',
            order: 3,
            status: 'published'
          }
        ]
      },
      {
        id: 'mod-3',
        moduleNumber: 3,
        title: 'Forensic Traumatology: Ballistics, Blunt & Sharp Force',
        subtitle: 'Volumetric wound trajectory analysis, bone fracture mapping',
        description: 'Volumetric wound trajectory analysis, bone fracture mapping',
        duration: '2h 00m',
        cmeCredits: 4,
        order: 3,
        status: 'published',
        topics: [
          {
            id: 't-7',
            title: 'Cranial & Maxillofacial Trauma Reconstruction in PMCT',
            description: '3D bone rendering and fracture line mapping in complex head trauma.',
            contentType: 'video',
            videoUrl: '/autopsy.mp4',
            order: 1,
            status: 'published'
          },
          {
            id: 't-8',
            title: 'Ballistic Trajectory & Fragment Localization Case Vault',
            description: 'Wound track reconstruction and metallic projectile tracing.',
            contentType: 'video',
            videoUrl: '/autopsy.mp4',
            order: 2,
            status: 'published'
          },
          {
            id: 't-9',
            title: 'Module 03 Assessment: Traumatology Interpretation',
            description: 'Trauma analysis exam based on real forensic PMCT case studies.',
            contentType: 'description',
            order: 3,
            status: 'published'
          }
        ]
      },
      {
        id: 'mod-4',
        moduleNumber: 4,
        title: 'Asphyxia, Drowning & Postmortem Alterations',
        subtitle: 'Internal fluid level identification, gas redistribution vs embolism',
        description: 'Internal fluid level identification, gas redistribution vs embolism',
        duration: '2h 00m',
        cmeCredits: 4,
        order: 4,
        status: 'published',
        topics: [
          {
            id: 't-10',
            title: 'Differentiating Postmortem Redistribution from Intravital Pathology',
            description: 'PMCT findings distinguishing putrefactive gas from vital air embolism.',
            contentType: 'video',
            videoUrl: '/autopsy.mp4',
            order: 1,
            status: 'published'
          },
          {
            id: 't-11',
            title: 'PMCT Angiography & Pulmonary Embolism Evaluation',
            description: 'Techniques for targeted postmortem vascular contrast injection.',
            contentType: 'video',
            videoUrl: '/autopsy.mp4',
            order: 2,
            status: 'published'
          },
          {
            id: 't-12',
            title: 'Module 04 Final Competency Examination & Case Review',
            description: 'Comprehensive final examination covering all 4 core modules.',
            contentType: 'description',
            order: 3,
            status: 'published'
          }
        ]
      }
    ]
  }
];
