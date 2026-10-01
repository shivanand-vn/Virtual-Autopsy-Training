export type ContentType = 'video' | 'theory';

export interface Topic {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  content?: string; // For theory / reading topics
  videoUrl?: string; // For video topics
  requiredWatchPercentage?: number; // Default 90% for video topics
  assignmentInstructions?: string; // For assignment topics
  submissionInstructions?: string; // For assignment topics
  referenceAttachmentUrl?: string; // Optional reference file for assignment
  referenceAttachmentName?: string;
  thumbnail?: string;
  order: number;
  status: 'draft' | 'published';
}

export interface ModuleAssignment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  instructions: string;
  totalMarks: number;
  dueDate?: string;
  templateFileName?: string;
  templateFileUrl?: string;
  submissionStatus: 'pending' | 'submitted' | 'graded';
  submittedFileName?: string;
  submittedFileUrl?: string;
  submittedAt?: string;
  score?: number;
  feedback?: string;
}

export interface ModuleTest {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScorePercent: number; // Standard 70% passing threshold
  unlimitedRetakes: boolean; // Always true for module practice tests
  attemptsCount?: number;
  bestScorePercent?: number;
  status?: 'not_attempted' | 'passed' | 'retake_recommended';
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
  assignment?: ModuleAssignment;
  test?: ModuleTest;
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
            contentType: 'theory',
            content: 'Virtual autopsy (PMCT) provides a permanent, tamper-evident digital record. This dossier reviews international chain-of-custody standards, DICOM metadata verification, and admissibility under Daubert/Frye legal frameworks.',
            order: 2,
            status: 'published'
          },
          {
            id: 't-3',
            title: 'Theoretical Foundations: Medicolegal Integration & Protocols',
            description: 'Core concepts governing PMCT deployment in contemporary forensic institutes.',
            contentType: 'theory',
            content: 'Comprehensive examination of operational integration: standard scanning protocols, radiation safety in post-mortem suites, and ethical guidelines for non-invasive forensic imaging.',
            order: 3,
            status: 'published'
          }
        ],
        assignment: {
          id: 'asgn-mod-1',
          moduleId: 'mod-1',
          title: 'Module 01 Case Assignment: Evidentiary Admissibility & Chain-of-Custody Report',
          description: 'Draft a formal forensic technical statement establishing DICOM metadata integrity and chain-of-custody protocols for PMCT submission in a medicolegal trial.',
          instructions: 'Review the provided case summary briefing. Complete sections A through D adhering to Daubert/Frye admissibility requirements. Upload your completed report in PDF format (max 10MB).',
          totalMarks: 100,
          dueDate: '2026-10-15',
          templateFileName: 'Forensic_Admissibility_Template_M1.pdf',
          submissionStatus: 'pending'
        },
        test: {
          id: 'test-mod-1',
          moduleId: 'mod-1',
          title: 'Module 01 Foundational Practice Quiz',
          description: 'Comprehensive self-paced practice quiz assessing PMCT physics, acquisition fundamentals, and medicolegal protocols.',
          durationMinutes: 20,
          totalQuestions: 10,
          passingScorePercent: 70,
          unlimitedRetakes: true,
          attemptsCount: 0,
          status: 'not_attempted'
        }
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
            title: 'PACS Theory: Multi-Planar Orthogonal & Curved Reformations',
            description: 'Detailed theoretical guide to window widths, window levels, and bone kernel algorithms.',
            contentType: 'theory',
            content: 'Multi-planar reformations (MPR) enable orthogonal analysis of complex fracture margins. This theory module outlines optimal window width and level settings for brain, lung, bone, and soft tissue post-mortem analysis.',
            order: 3,
            status: 'published'
          }
        ],
        assignment: {
          id: 'asgn-mod-2',
          moduleId: 'mod-2',
          title: 'Module 02 Case Assignment: Multi-Planar Orthogonal Reformation Analysis',
          description: 'Evaluate axial PMCT cross-sections and formulate optimal MPR window width/level protocols for calvarial fracture assessment.',
          instructions: 'Formulate a windowing guideline sheet for bone kernel vs. soft tissue windowing. Provide sample HU measurements and submit as a PDF case report.',
          totalMarks: 100,
          dueDate: '2026-10-22',
          templateFileName: 'MPR_Reconstruction_Worksheet_M2.pdf',
          submissionStatus: 'pending'
        },
        test: {
          id: 'test-mod-2',
          moduleId: 'mod-2',
          title: 'Module 02 Image Reconstruction & Artifact Quiz',
          description: 'Practice test covering beam hardening artifacts, dental amalgam scatter reduction, and 3D volume rendering.',
          durationMinutes: 20,
          totalQuestions: 10,
          passingScorePercent: 70,
          unlimitedRetakes: true,
          attemptsCount: 0,
          status: 'not_attempted'
        }
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
            title: 'Traumatology Theory: Beveling, Fracture Propagation & Wound Ballistics',
            description: 'Forensic pathology principles for discriminating entrance from exit cranial wounds.',
            contentType: 'theory',
            content: 'Analysis of internal vs. external beveling in gunshot trauma, distinguishing vital reaction signs on CT, and differentiating ante-mortem blunt force skeletal trauma from post-mortem alterations.',
            order: 3,
            status: 'published'
          }
        ],
        assignment: {
          id: 'asgn-mod-3',
          moduleId: 'mod-3',
          title: 'Module 03 Case Assignment: Traumatology & Ballistic Defect Mapping',
          description: 'Perform ballistic wound tract reconstruction and distinguish entrance beveling from exit defect on cranial PMCT.',
          instructions: 'Using the provided high-resolution orthogonal PMCT slices, map the projectile trajectory vector, evaluate secondary fracture lines, and submit your forensic autopsy addendum.',
          totalMarks: 100,
          dueDate: '2026-10-29',
          templateFileName: 'Ballistic_Traumatology_Report_M3.pdf',
          submissionStatus: 'pending'
        },
        test: {
          id: 'test-mod-3',
          moduleId: 'mod-3',
          title: 'Module 03 Traumatology & Fracture Patterns Quiz',
          description: 'Self-assessment covering gunshot entrance/exit identification, blunt trauma differentiation, and vital reactions.',
          durationMinutes: 20,
          totalQuestions: 10,
          passingScorePercent: 70,
          unlimitedRetakes: true,
          attemptsCount: 0,
          status: 'not_attempted'
        }
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
            title: 'Decomposition Dynamics & Imaging Pathology Theory',
            description: 'Theoretical evaluation of fluid sedimentation, putrefactive emphysema, and hypostasis on PMCT.',
            contentType: 'theory',
            content: 'Critical guidelines for interpreting intravascular decomposition gas patterns, liver gas sedimentation, and hemoconcentration gradients without misdiagnosing them as ante-mortem pathology.',
            order: 3,
            status: 'published'
          }
        ],
        assignment: {
          id: 'asgn-mod-4',
          moduleId: 'mod-4',
          title: 'Module 04 Case Assignment: Postmortem Decomposition & Forensic Case Analysis',
          description: 'Formulate a differential diagnosis differentiating putrefactive intravascular gas from ante-mortem air embolism.',
          instructions: 'Analyze intravascular gas distribution, organ hypostasis, and fluid sedimentation across thoracic/abdominal PMCT views. Submit your completed differential evaluation report in PDF format.',
          totalMarks: 100,
          dueDate: '2026-11-05',
          templateFileName: 'Decomposition_Artifact_Analysis_M4.pdf',
          submissionStatus: 'pending'
        },
        test: {
          id: 'test-mod-4',
          moduleId: 'mod-4',
          title: 'Module 04 Comprehensive Pathology & Decomposition Quiz',
          description: 'Evaluate your readiness across all core module competencies, decomposition dynamics, and diagnostic thresholds.',
          durationMinutes: 20,
          totalQuestions: 10,
          passingScorePercent: 70,
          unlimitedRetakes: true,
          attemptsCount: 0,
          status: 'not_attempted'
        }
      }
    ]
  }
];
