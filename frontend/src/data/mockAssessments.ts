import type { ModuleAssessment } from '../types/assessment';

export const MOCK_ASSESSMENTS: Record<string, ModuleAssessment> = {
  'mod-1': {
    id: 'test-mod-1',
    moduleId: 'mod-1',
    moduleNumber: 1,
    title: 'Module 01 Foundational Practice Quiz',
    subtitle: 'Principles, Evidentiary Value, & Daubert Admissibility',
    totalQuestions: 5,
    timeLimitMinutes: 20,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q1-1',
        type: 'single',
        question: 'Under international forensic chain of custody standards, what primary advantage does PMCT provide over traditional physical autopsy?',
        options: [
          { id: 'a', text: 'It completely eliminates the legal need for physical tissue sampling in toxicology' },
          { id: 'b', text: 'It provides a permanent, tamper-evident, reproducible 3D digital record before invasive dissection' },
          { id: 'c', text: 'It replaces all court testimony with automated computer diagnostic outputs' },
          { id: 'd', text: 'It requires zero verification of DICOM headers under Daubert criteria' }
        ],
        correctAnswers: ['b'],
        explanation: 'PMCT creates an objective, permanent, digital volumetric dataset that captures unmodified anatomical structures prior to any invasive scalpel incision.'
      },
      {
        id: 'q1-2',
        type: 'single',
        question: 'Which legal standard requires scientific forensic evidence to be generally accepted within the relevant scientific community?',
        options: [
          { id: 'a', text: 'The Daubert Standard' },
          { id: 'b', text: 'The Frye Standard' },
          { id: 'c', text: 'The Locard Exchange Principle' },
          { id: 'd', text: 'The PMCT Protocol Code' }
        ],
        correctAnswers: ['b'],
        explanation: 'The Frye Standard focuses on "general acceptance" within the relevant scientific community, whereas Daubert provides a multi-factor test evaluating peer review, error rates, and testability.'
      },
      {
        id: 'q1-3',
        type: 'single',
        question: 'Why must radiation safety protocols still be maintained in a post-mortem CT suite?',
        options: [
          { id: 'a', text: 'The deceased body emits radioactive decay particles' },
          { id: 'b', text: 'Occupational scatter radiation poses a hazard to radiographers and forensic technicians present' },
          { id: 'c', text: 'PMCT scanners use double the radioactive isotopes of medical imaging' },
          { id: 'd', text: 'Radiation directly alters post-mortem DNA integrity if unshielded' }
        ],
        correctAnswers: ['b'],
        explanation: 'While the deceased patient cannot suffer somatic radiation damage, ionizing scatter radiation generated during scanner operation poses health risks to living personnel in the suite.'
      },
      {
        id: 'q1-4',
        type: 'single',
        question: 'What is the significance of retaining intact DICOM metadata in virtual autopsy evidence?',
        options: [
          { id: 'a', text: 'It ensures forensic timestamps, scanner calibration serials, and patient UID remain verifiable in court' },
          { id: 'b', text: 'It automatically compresses file sizes for standard email transmission' },
          { id: 'c', text: 'It converts CT numbers into subjective pathology interpretations' },
          { id: 'd', text: 'It prevents defense counsel from viewing raw reconstructed datasets' }
        ],
        correctAnswers: ['a'],
        explanation: 'DICOM metadata preserves the audit trail, acquisition parameters, exact timestamps, and UID integrity necessary for court admissibility.'
      },
      {
        id: 'q1-5',
        type: 'true_false',
        question: 'True or False: PMCT completely replaces conventional external examination in forensic autopsy.',
        options: [
          { id: 'a', text: 'True' },
          { id: 'b', text: 'False' }
        ],
        correctAnswers: ['b'],
        explanation: 'False. PMCT complements but does not replace thorough external examination (such as observing post-mortem lividity, subtle skin abrasions, and petechial hemorrhages).'
      }
    ]
  },
  'mod-2': {
    id: 'test-mod-2',
    moduleId: 'mod-2',
    moduleNumber: 2,
    title: 'Module 02 Image Reconstruction & Artifact Quiz',
    subtitle: 'Scanning Parameters, MAR, and Orthogonal MPR Reformations',
    totalQuestions: 5,
    timeLimitMinutes: 20,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q2-1',
        type: 'single',
        question: 'What window setting is optimal for evaluating acute calvarial fractures and discriminating sutural diastasis on PMCT?',
        options: [
          { id: 'a', text: 'Soft Tissue Window (WW: 350, WL: 40)' },
          { id: 'b', text: 'Lung Window (WW: 1500, WL: -600)' },
          { id: 'c', text: 'Bone Window with Sharp Reconstruction Kernel (WW: 2500, WL: 500)' },
          { id: 'd', text: 'Brain Window (WW: 80, WL: 35)' }
        ],
        correctAnswers: ['c'],
        explanation: 'A wide bone window (WW ~2000–3000 HU, WL ~500 HU) combined with a high-spatial-frequency bone kernel optimizes the visualization of cortical bone edges and fine fracture lines.'
      },
      {
        id: 'q2-2',
        type: 'single',
        question: 'Which artifact commonly obscures soft tissue detail around dental amalgam restorations in post-mortem head CT?',
        options: [
          { id: 'a', text: 'Motion artifact' },
          { id: 'b', text: 'Beam hardening streak artifact' },
          { id: 'c', text: 'Ring artifact' },
          { id: 'd', text: 'Chemical shift artifact' }
        ],
        correctAnswers: ['b'],
        explanation: 'High atomic number metallic restorations (such as dental amalgams or gold crowns) cause severe photon starvation and beam hardening streak artifacts across the oral cavity and skull base.'
      },
      {
        id: 'q2-3',
        type: 'single',
        question: 'What is the primary role of Multi-Planar Reformation (MPR) in forensic PMCT analysis?',
        options: [
          { id: 'a', text: 'To artificially smooth jagged boundaries' },
          { id: 'b', text: 'To visualize anatomical structures along orthogonal and oblique planes not aligned with the axial acquisition' },
          { id: 'c', text: 'To compress 3D voxels into flat 2D JPEG files' },
          { id: 'd', text: 'To remove bone structures automatically' }
        ],
        correctAnswers: ['b'],
        explanation: 'MPR allows forensic examiners to reconstruct sagittal, coronal, curved, or oblique planes from volumetric isotropic datasets to trace fractures and projectile trajectories.'
      },
      {
        id: 'q2-4',
        type: 'single',
        question: 'Why are isotropic voxels essential for high-fidelity post-mortem multi-planar reconstruction?',
        options: [
          { id: 'a', text: 'They prevent spatial distortion and pixelation regardless of the reformatting plane angle' },
          { id: 'b', text: 'They double the CT number of soft tissues' },
          { id: 'c', text: 'They enable automated toxicology reporting' },
          { id: 'd', text: 'They only exist in conventional film radiography' }
        ],
        correctAnswers: ['a'],
        explanation: 'When voxel dimensions are equal in all three axes (x = y = z), images reformatted in coronal, sagittal, or oblique planes retain identical spatial resolution to the original axial slice.'
      },
      {
        id: 'q2-5',
        type: 'true_false',
        question: 'True or False: Dual-Energy CT (DECT) can assist in differentiating metallic fragments from high-density bone fragments.',
        options: [
          { id: 'a', text: 'True' },
          { id: 'b', text: 'False' }
        ],
        correctAnswers: ['a'],
        explanation: 'True. Dual-Energy CT evaluates material attenuation at two energy spectra, facilitating virtual non-calcium and metal artifact reduction algorithms.'
      }
    ]
  },
  'mod-3': {
    id: 'test-mod-3',
    moduleId: 'mod-3',
    moduleNumber: 3,
    title: 'Module 03 Traumatology & Fracture Patterns Quiz',
    subtitle: 'Ballistic Trajectories, Entrance/Exit Beveling & Skeletal Mapping',
    totalQuestions: 5,
    timeLimitMinutes: 20,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q3-1',
        type: 'single',
        question: 'On cranial PMCT bone window, internal beveling (conical expansion towards the endocranium) is characteristic of which wound type?',
        options: [
          { id: 'a', text: 'Gunshot exit wound' },
          { id: 'b', text: 'Gunshot entrance wound' },
          { id: 'c', text: 'Blunt force coup fracture' },
          { id: 'd', text: 'Post-mortem weathering crack' }
        ],
        correctAnswers: ['b'],
        explanation: 'Gunshot entrance defects in flat cranial bones exhibit internal beveling (the inner table defect is broader than the outer table defect).'
      },
      {
        id: 'q3-2',
        type: 'single',
        question: 'How does PMCT distinguish primary projectile wound channels from secondary fracture lines?',
        options: [
          { id: 'a', text: 'Pappas law: secondary fractures always cross primary fractures without stopping' },
          { id: 'b', text: 'Puppe\'s Rule: subsequent fractures terminate when they intersect an existing pre-existing fracture line' },
          { id: 'c', text: 'All gunshot fractures run perpendicular to sagittal sutures' },
          { id: 'd', text: 'Secondary fractures have higher Hounsfield units' }
        ],
        correctAnswers: ['b'],
        explanation: 'Puppe\'s Rule of fracture sequence demonstrates that subsequent fracture lines terminate upon intersecting preexisting fracture margins, establishing sequence of impacts.'
      },
      {
        id: 'q3-3',
        type: 'single',
        question: 'What is the characteristic appearance of metallic lead snowstorm on PMCT?',
        options: [
          { id: 'a', text: 'Hypodense fluid accumulation in ventricles' },
          { id: 'b', text: 'Diffuse fine radiopaque high-density flecks along a ballistic disintegration path' },
          { id: 'c', text: 'Circular ring artifacts in subcutaneous fat' },
          { id: 'd', text: 'Complete absorption of all radiation without streak artifact' }
        ],
        correctAnswers: ['b'],
        explanation: 'Unjacketed or high-velocity lead bullets fragment upon bone impact, producing a path of miniature radiopaque metallic specks termed a "lead snowstorm".'
      },
      {
        id: 'q3-4',
        type: 'single',
        question: 'Which volumetric reconstruction technique is most effective for demonstrating spatial relationships of complex maxillofacial Le Fort fractures for courtroom display?',
        options: [
          { id: 'a', text: 'Raw axial CT slices only' },
          { id: 'b', text: '3D Volume Rendering Technique (VRT) with bone surface segmentation' },
          { id: 'c', text: 'Negative inversion ultrasound view' },
          { id: 'd', text: 'Single line densitometry graph' }
        ],
        correctAnswers: ['b'],
        explanation: '3D Volume Rendering provides intuitive spatial visualization of skeletal trauma that lay juries and judicial panels can comprehend instantly.'
      },
      {
        id: 'q3-5',
        type: 'true_false',
        question: 'True or False: PMCT can identify radiopaque projectile fragments that might easily be missed during conventional blind manual forensic dissection.',
        options: [
          { id: 'a', text: 'True' },
          { id: 'b', text: 'False' }
        ],
        correctAnswers: ['a'],
        explanation: 'True. PMCT surveys the entire body volume rapidly, locating bullet fragments or foreign bodies lodged deep in retroperitoneal or spinal tissues prior to dissection.'
      }
    ]
  },
  'mod-4': {
    id: 'test-mod-4',
    moduleId: 'mod-4',
    moduleNumber: 4,
    title: 'Module 04 Comprehensive Pathology & Decomposition Quiz',
    subtitle: 'Decomposition Dynamics, Gas Redistribution vs. Air Embolism',
    totalQuestions: 5,
    timeLimitMinutes: 20,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q4-1',
        type: 'single',
        question: 'How can an experienced forensic imaging specialist differentiate putrefactive decomposition gas from vital air embolism on PMCT?',
        options: [
          { id: 'a', text: 'Vital air embolism is restricted to the portal vein only' },
          { id: 'b', text: 'Putrefactive gas is accompanied by decomposition changes (e.g. fluid sedimentation, organ liquefaction, intravascular gas distribution without trauma)' },
          { id: 'c', text: 'Air embolism exhibits positive Hounsfield units (+100 HU)' },
          { id: 'd', text: 'Decomposition gas cannot be visualized on CT' }
        ],
        correctAnswers: ['b'],
        explanation: 'Putrefactive gas emerges in predictable anatomical sequences (hepatic parenchyma, heart chambers, intravascular spaces) accompanied by tissue lysis, whereas ante-mortem air embolism correlates with specific vascular trauma or surgical intervention in fresh bodies.'
      },
      {
        id: 'q4-2',
        type: 'single',
        question: 'What is the PMCT presentation of post-mortem hypostasis (livor mortis) in the lungs?',
        options: [
          { id: 'a', text: 'Symmetrical apical hyperlucency' },
          { id: 'b', text: 'Bilateral dependent ground-glass attenuation and consolidation in dorsal lung segments in a supine body' },
          { id: 'c', text: 'Complete pneumothorax with lung collapse' },
          { id: 'd', text: 'Diffuse subpleural calcifications' }
        ],
        correctAnswers: ['b'],
        explanation: 'In a supine body, gravitational blood pooling causes increased attenuation and consolidation in the posterior (dependent) segments of both lungs, which must not be mistaken for ante-mortem aspiration or pneumonia.'
      },
      {
        id: 'q4-3',
        type: 'single',
        question: 'In suspected drowning cases, what pathognomonic fluid level is frequently identified on PMCT sinus scans?',
        options: [
          { id: 'a', text: 'Fluid or sediment levels in the sphenoid sinuses (Svechnikov\'s sign)' },
          { id: 'b', text: 'Complete gas distension of the frontal bone' },
          { id: 'c', text: 'Dense metallic deposits in the maxillary antrum' },
          { id: 'd', text: 'Absence of any fluid in the trachea' }
        ],
        correctAnswers: ['a'],
        explanation: 'Aspiration of medium during drowning frequently results in water or sediment accumulation within the paranasal sinuses, especially the sphenoid sinus.'
      },
      {
        id: 'q4-4',
        type: 'single',
        question: 'What is the diagnostic threshold HU range for pure gas pockets on CT imaging?',
        options: [
          { id: 'a', text: '+1000 HU' },
          { id: 'b', text: '+40 to +60 HU' },
          { id: 'c', text: '-1000 to -800 HU' },
          { id: 'd', text: '0 HU' }
        ],
        correctAnswers: ['c'],
        explanation: 'Gas attenuation on CT is calibrated around -1000 HU (ranging typically between -1000 and -800 HU), contrasting sharply with water (0 HU) and soft tissue (+30 to +50 HU).'
      },
      {
        id: 'q4-5',
        type: 'true_false',
        question: 'True or False: PMCT angiography using biphasic contrast injection can reveal vascular lacerations and active sources of hemorrhage that caused death.',
        options: [
          { id: 'a', text: 'True' },
          { id: 'b', text: 'False' }
        ],
        correctAnswers: ['a'],
        explanation: 'True. Targeted post-mortem CT angiography (PMCTA) utilizes oily or water-soluble contrast media to map vascular integrity and identify extravasation points.'
      }
    ]
  }
};
