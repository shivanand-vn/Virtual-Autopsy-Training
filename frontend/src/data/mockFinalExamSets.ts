import type { FinalExamQuestion, ExamQuestionSets } from '../types/finalExam';

export const FINAL_EXAM_SET_1: FinalExamQuestion[] = [
  {
    id: 'q-s1-1',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'On cranial PMCT bone window, internal beveling (conical expansion towards the endocranium) is characteristic of which wound type?',
    options: [
      { id: 'opt-1', text: 'Gunshot exit defect' },
      { id: 'opt-2', text: 'Gunshot entrance defect' },
      { id: 'opt-3', text: 'Low-velocity coup blunt contusion' },
      { id: 'opt-4', text: 'Thermal burst fracture' }
    ],
    correctAnswer: 'opt-2',
    marks: 10,
    explanation: 'Gunshot entrance wounds in flat cranial bones characteristically show internal beveling, where the defect expands inward toward the endocranium.',
    order: 1
  },
  {
    id: 'q-s1-2',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'According to Puppe\'s Rule of fracture sequencing in forensic skeletal trauma, how is the chronology of multiple skull fractures determined?',
    options: [
      { id: 'opt-1', text: 'Subsequent fracture lines propagate freely across preexisting fracture margins' },
      { id: 'opt-2', text: 'Subsequent fracture lines arrest upon intersecting a preexisting fracture line' },
      { id: 'opt-3', text: 'Earlier fractures always exhibit higher Hounsfield attenuation' },
      { id: 'opt-4', text: 'Fracture sequence cannot be differentiated on non-contrast PMCT' }
    ],
    correctAnswer: 'opt-2',
    marks: 10,
    explanation: 'Puppe\'s Rule dictates that a subsequent fracture line ceases its propagation when it intersects a preexisting fracture line, proving the chronology of impacts.',
    order: 2
  },
  {
    id: 'q-s1-3',
    examId: 'default-final-exam',
    type: 'multiple-response',
    text: 'Which of the following acquisition parameters are essential when evaluating fine petrous bone and clivus fractures on post-mortem CT? (Select all that apply)',
    options: [
      { id: 'opt-1', text: 'Sub-millimeter slice thickness (<= 0.75 mm)' },
      { id: 'opt-2', text: 'Standard soft-tissue smooth reconstruction filter only' },
      { id: 'opt-3', text: 'High-frequency ultra-sharp bone kernel' },
      { id: 'opt-4', text: 'Isotropic voxel reconstruction for multi-planar reformations' }
    ],
    correctAnswers: ['opt-1', 'opt-3', 'opt-4'],
    marks: 10,
    explanation: 'High spatial resolution requires thin sub-millimeter collimation, dedicated sharp bone kernels, and isotropic voxels for distortion-free reformations.',
    order: 3
  },
  {
    id: 'q-s1-4',
    examId: 'default-final-exam',
    type: 'true-false-combination',
    text: 'Evaluate the validity of the following statements regarding Post-Mortem CT Angiography (PMCTA):',
    statements: {
      statement1: 'Statement 1: Multiphase PMCTA requires arterial and venous cannulation with standardized pressure infusion.',
      statement2: 'Statement 2: Massive contrast extravasation into the pericardial sac confirms fatal cardiac rupture or aortic root dissection.'
    },
    options: [
      { id: 'opt-1', text: 'Both Statement 1 and Statement 2 are True' },
      { id: 'opt-2', text: 'Statement 1 is True, Statement 2 is False' },
      { id: 'opt-3', text: 'Statement 1 is False, Statement 2 is True' },
      { id: 'opt-4', text: 'Both Statement 1 and Statement 2 are False' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Both statements are true. PMCTA utilizes standardized dual access and confirms vascular tears with contrast extravasation into closed pericardial or pleural spaces.',
    order: 4
  },
  {
    id: 'q-s1-5',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'What is the diagnostic threshold for pure gas pockets on CT imaging?',
    options: [
      { id: 'opt-1', text: '+1000 HU' },
      { id: 'opt-2', text: '+40 to +60 HU' },
      { id: 'opt-3', text: '-1000 to -800 HU' },
      { id: 'opt-4', text: '0 HU' }
    ],
    correctAnswer: 'opt-3',
    marks: 10,
    explanation: 'Gas attenuation on CT is calibrated around -1000 HU (ranging typically between -1000 and -800 HU), contrasting sharply with water (0 HU) and soft tissue.',
    order: 5
  },
  {
    id: 'q-s1-6',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'In forensic immersion and drowning fatalities, what fluid collection pattern in the sphenoid sinuses is termed Svechnikov\'s sign?',
    options: [
      { id: 'opt-1', text: 'Accumulation of aspirated drowning fluid or sediment in the sphenoid sinus cavities' },
      { id: 'opt-2', text: 'Complete pneumatization devoid of any mucosal thickening' },
      { id: 'opt-3', text: 'Hyperdense metallic scatter along the sellar floor' },
      { id: 'opt-4', text: 'Intrasellar osteolytic bone destruction' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Svechnikov\'s sign refers to fluid and sediment levels in the sphenoid sinuses as a marker of active fluid inhalation during submersion.',
    order: 6
  }
];

export const FINAL_EXAM_SET_2: FinalExamQuestion[] = [
  {
    id: 'q-s2-1',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'What is the classic PMCT manifestation of high-velocity unjacketed lead bullet disintegration upon bone impact?',
    options: [
      { id: 'opt-1', text: 'Homogeneous hypodense cavity without radiopaque particles' },
      { id: 'opt-2', text: 'Diffuse fine radiopaque high-density flecks along the ballistic wound tract ("lead snowstorm")' },
      { id: 'opt-3', text: 'Isolated ring artifacts around the entrance wound only' },
      { id: 'opt-4', text: 'Complete absorption of X-rays with no streak artifacts' }
    ],
    correctAnswer: 'opt-2',
    marks: 10,
    explanation: 'High-velocity lead projectile fragmentation produces a characteristic trail of radiopaque metallic specks termed a "lead snowstorm".',
    order: 1
  },
  {
    id: 'q-s2-2',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'How can an examiner differentiate post-mortem hypostasis (livor mortis) in the lungs from antemortem aspiration pneumonia on PMCT?',
    options: [
      { id: 'opt-1', text: 'Hypostasis strictly respects dependent anatomical segments bilaterally in supine positioning' },
      { id: 'opt-2', text: 'Hypostasis displays air bronchograms in non-dependent anterior segments' },
      { id: 'opt-3', text: 'Aspiration pneumonia never produces bilateral changes' },
      { id: 'opt-4', text: 'Hypostasis has negative Hounsfield units (-800 HU)' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Post-mortem hypostasis produces bilateral dependent ground-glass attenuation and consolidation in dorsal lung segments of a supine body, following gravity.',
    order: 2
  },
  {
    id: 'q-s2-3',
    examId: 'default-final-exam',
    type: 'multiple-response',
    text: 'Which metal artifact reduction (MAR) strategies are recommended when scanning bodies with dental restorations or ballistic fragments? (Select all that apply)',
    options: [
      { id: 'opt-1', text: 'Applying algorithmic iterative metal artifact reduction (iMAR/SEMAR)' },
      { id: 'opt-2', text: 'Increasing tube voltage (e.g. 140 kVp) to improve photon penetration' },
      { id: 'opt-3', text: 'Tilting the gantry or repositioning the subject to steer streak trajectories away from critical organs' },
      { id: 'opt-4', text: 'Using lowest possible tube current (< 20 mAs) without filtration' }
    ],
    correctAnswers: ['opt-1', 'opt-2', 'opt-3'],
    marks: 10,
    explanation: 'Iterative MAR software, higher tube energy (140 kVp), and geometric repositioning minimize beam hardening and photon starvation artifacts caused by dense metals.',
    order: 3
  },
  {
    id: 'q-s2-4',
    examId: 'default-final-exam',
    type: 'true-false-combination',
    text: 'Evaluate the validity of the following statements regarding Daubert forensic evidentiary admissibility of PMCT:',
    statements: {
      statement1: 'Statement 1: The original raw DICOM dataset must be archived with cryptographic hash verification to maintain strict chain-of-custody.',
      statement2: 'Statement 2: 3D rendered surface models can be admitted in court as long as the reconstruction methodology is peer-reviewed and reproducible.'
    },
    options: [
      { id: 'opt-1', text: 'Both Statement 1 and Statement 2 are True' },
      { id: 'opt-2', text: 'Statement 1 is True, Statement 2 is False' },
      { id: 'opt-3', text: 'Statement 1 is False, Statement 2 is True' },
      { id: 'opt-4', text: 'Both Statement 1 and Statement 2 are False' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Both statements are true. Under Daubert/Frye rules, digital forensic imaging requires verifiable chain of custody (hash integrity) and scientifically validated reconstruction pipelines.',
    order: 4
  },
  {
    id: 'q-s2-5',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'What critical CT sign differentiates ante-mortem tension pneumothorax from post-mortem putrefactive gas collection?',
    options: [
      { id: 'opt-1', text: 'Contralateral mediastinal shift and flattening/inversion of the ipsilateral hemidiaphragm' },
      { id: 'opt-2', text: 'Diffuse intravascular gas bubbles within the liver parenchyma' },
      { id: 'opt-3', text: 'Subcutaneous crepitus along both flanks symmetrically' },
      { id: 'opt-4', text: 'Complete absence of any pleural air' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Ante-mortem tension pneumothorax produces mass effect: significant contralateral mediastinal shift and hemidiaphragmatic depression. Putrefactive gas is diffuse and lacks unilateral tension vectors.',
    order: 5
  },
  {
    id: 'q-s2-6',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'In fatal air embolism cases, where does antemortem air characteristically accumulate in a supine body on immediate PMCT?',
    options: [
      { id: 'opt-1', text: 'Dependent posterior vena cava only' },
      { id: 'opt-2', text: 'Non-dependent right ventricular outflow tract (RVOT) and main pulmonary artery' },
      { id: 'opt-3', text: 'Within the deep medullary space of femur bones' },
      { id: 'opt-4', text: 'Intra-articular space of the knee' }
    ],
    correctAnswer: 'opt-2',
    marks: 10,
    explanation: 'In a supine corpse, embolized gas rises to the highest anatomical point: the anterior right ventricular outflow tract (RVOT) and main pulmonary trunk.',
    order: 6
  }
];

export const FINAL_EXAM_SET_3: FinalExamQuestion[] = [
  {
    id: 'q-s3-1',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'A circular ring fracture encircling the foramen magnum on PMCT is most commonly caused by which mechanical trauma mechanism?',
    options: [
      { id: 'opt-1', text: 'Axial force transmission through the spine (e.g. falls from height landing on feet or vertex impact)' },
      { id: 'opt-2', text: 'Low-velocity lateral cheek abrasion' },
      { id: 'opt-3', text: 'Isolated thermal radiant heat exposure' },
      { id: 'opt-4', text: 'Ante-mortem hypertensive stroke' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Ring fractures around the foramen magnum result from severe axial loading driving the occipital condyles against the atlas (vertex impact or landing from heights onto feet/buttocks).',
    order: 1
  },
  {
    id: 'q-s3-2',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'What is the typical attenuation range (HU) of acute antemortem clotted hematoma versus post-mortem sedimented lysed blood?',
    options: [
      { id: 'opt-1', text: 'Fresh clot: +60 to +80 HU; Lysed postmortem serum: +30 to +45 HU' },
      { id: 'opt-2', text: 'Fresh clot: -50 HU; Lysed serum: +120 HU' },
      { id: 'opt-3', text: 'Both always measure exactly 0 HU' },
      { id: 'opt-4', text: 'Fresh clot: +1000 HU; Lysed serum: -1000 HU' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Fibrin clot formation concentrates hemoglobin (+60 to +80 HU), whereas unretracted or lysed post-mortem blood components settle into lower attenuating serum layers (+30 to +45 HU).',
    order: 2
  },
  {
    id: 'q-s3-3',
    examId: 'default-final-exam',
    type: 'multiple-response',
    text: 'Which of the following signs on PMCT indicate an ante-mortem vital reaction in skeletal fracture trauma? (Select all that apply)',
    options: [
      { id: 'opt-1', text: 'Extensive intramuscular hematoma tracking along fascial planes' },
      { id: 'opt-2', text: 'Clean, bloodless bone fracture margins occurring in advanced decomposition' },
      { id: 'opt-3', text: 'Active contrast extravasation during PMCTA into surrounding muscular compartments' },
      { id: 'opt-4', text: 'Displaced bone fragments accompanied by local soft tissue hyperattenuation' }
    ],
    correctAnswers: ['opt-1', 'opt-3', 'opt-4'],
    marks: 10,
    explanation: 'Vital reactions demonstrate active ante-mortem perfusion: extravasated blood dissecting fascial sheaths, soft-tissue hematomas, and vascular leaks upon PMCTA.',
    order: 3
  },
  {
    id: 'q-s3-4',
    examId: 'default-final-exam',
    type: 'true-false-combination',
    text: 'Evaluate the validity of the following statements regarding sudden unexpected cardiac death (SUD) assessment on PMCT:',
    statements: {
      statement1: 'Statement 1: Heavy coronary artery calcification (Agatston calcium score) on unenhanced PMCT reliably indicates severe underlying coronary atherosclerotic disease.',
      statement2: 'Statement 2: PMCTA can visualize acute thrombotic coronary occlusion and localized myocardial perfusion deficits.'
    },
    options: [
      { id: 'opt-1', text: 'Both Statement 1 and Statement 2 are True' },
      { id: 'opt-2', text: 'Statement 1 is True, Statement 2 is False' },
      { id: 'opt-3', text: 'Statement 1 is False, Statement 2 is True' },
      { id: 'opt-4', text: 'Both Statement 1 and Statement 2 are False' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Both statements are true. Agatston scores quantify chronic atherosclerosis on native PMCT, while PMCTA demonstrates acute lumen occlusion and myocardial ischemia zones.',
    order: 4
  },
  {
    id: 'q-s3-5',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'In decomposing remains, what is the earliest internal organ to exhibit putrefactive gas formation on PMCT scans?',
    options: [
      { id: 'opt-1', text: 'Liver (portal and hepatic parenchymal distribution)' },
      { id: 'opt-2', text: 'Femoral compact bone' },
      { id: 'opt-3', text: 'Petrous apex of temporal bone' },
      { id: 'opt-4', text: 'Achilles tendon' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Due to intestinal bacterial translocation through the portal venous system, the liver is typically the first parenchymal organ to demonstrate putrefactive gas bubbles.',
    order: 5
  },
  {
    id: 'q-s3-6',
    examId: 'default-final-exam',
    type: 'single-choice',
    text: 'What is the pathognomonic finding of thermal "pugilistic attitude" on full-body PMCT in charred bodies?',
    options: [
      { id: 'opt-1', text: 'Universal flexion contracture of limbs due to heat-induced muscle protein coagulation' },
      { id: 'opt-2', text: 'Extreme hyperextension of all peripheral joints' },
      { id: 'opt-3', text: 'Absence of all limb bones' },
      { id: 'opt-4', text: 'Selective paralysis of facial muscles only' }
    ],
    correctAnswer: 'opt-1',
    marks: 10,
    explanation: 'Thermal denaturation and heat coagulation of muscular proteins cause dominant flexor muscles to contract, producing the classic "pugilistic attitude" visible on 3D PMCT.',
    order: 6
  }
];

export const DEFAULT_EXAM_QUESTION_SETS: ExamQuestionSets = {
  set1: FINAL_EXAM_SET_1,
  set2: FINAL_EXAM_SET_2,
  set3: FINAL_EXAM_SET_3
};
