import { PrismaClient, Role, CourseStatus, ResourceType, QuestionType, ExamStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Virtual Autopsy LMS...');

  // 1. Seed Primary Admin User (admin@gmail.com)
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      fullName: 'System Administrator',
      title: 'Head of Virtual Autopsy Education',
      organization: 'Virtual Autopsy Global Solutions, UK',
      isActive: true,
    },
    create: {
      email: 'admin@gmail.com',
      passwordHash: adminPasswordHash,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      title: 'Head of Virtual Autopsy Education',
      organization: 'Virtual Autopsy Global Solutions, UK',
      isActive: true,
    },
  });
  console.log(`✅ Seeded Admin User: ${admin.email} (Password: Admin@123)`);

  // Secondary Institutional Admin
  const instAdminPasswordHash = await bcrypt.hash('AdminPassword123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@virtualautopsylms.com' },
    update: {
      passwordHash: instAdminPasswordHash,
      role: Role.ADMIN,
      fullName: 'Dr. Bhargav R',
      title: 'Head of Virtual Autopsy Education',
      organization: 'Virtual Autopsy Global Solutions, UK',
      isActive: true,
    },
    create: {
      email: 'admin@virtualautopsylms.com',
      passwordHash: instAdminPasswordHash,
      fullName: 'Dr. Bhargav R',
      role: Role.ADMIN,
      title: 'Head of Virtual Autopsy Education',
      organization: 'Virtual Autopsy Global Solutions, UK',
      isActive: true,
    },
  });

  // 2. Seed Sample Student User
  const studentPasswordHash = await bcrypt.hash('StudentPassword123!', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@virtualautopsylms.com' },
    update: {
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      fullName: 'Dr. Sarah Jenkins',
      title: 'Forensic Pathology Fellow',
      organization: "King's College Hospital, London",
      isActive: true,
    },
    create: {
      email: 'student@virtualautopsylms.com',
      passwordHash: studentPasswordHash,
      fullName: 'Dr. Sarah Jenkins',
      role: Role.STUDENT,
      title: 'Forensic Pathology Fellow',
      organization: "King's College Hospital, London",
      isActive: true,
    },
  });
  console.log(`✅ Seeded Student User: ${student.email} (Password: StudentPassword123!)`);

  // 3. Seed Primary Course
  const courseTitle = 'Post-Mortem Computed Tomography (PMCT) Comprehensive Training';
  let course = await prisma.course.findFirst({
    where: { title: courseTitle },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: courseTitle,
        shortDescription: 'Accredited masterclass on forensic cross-sectional imaging, virtual autopsy reconstruction, and medicolegal reporting.',
        description: 'An intensive online professional training program designed for forensic pathologists, radiologists, and medicolegal death investigators. Learn state-of-the-art PMCT scanning protocols, traumatology analysis, post-mortem CT angiography (PMCTA), and 3D virtual reconstructions for court testimony.',
        duration: '16 Weeks',
        status: CourseStatus.PUBLISHED,
        order: 1,
      },
    });
    console.log(`✅ Created Primary Course: ${course.title} (ID: ${course.id})`);
  } else {
    console.log(`ℹ️ Course already exists: ${course.title} (ID: ${course.id})`);
  }

  // 4. Seed Modules
  const moduleData = [
    {
      order: 1,
      title: 'Introduction to Post-Mortem CT & Imaging Physics',
      subtitle: 'Fundamentals of scanning parameters, artifacts, and cadaver positioning',
      description: 'Examine the operational foundations of dual-source CT in mortuary environments, standard reconstruction kernels, and identifying decomposition gas versus pathological pneumothorax.',
      duration: '2h 15m',
      durationMinutes: 135,
      cmeCredits: 4,
      topics: [
        {
          title: 'Core Scanning Protocols and Mortuary Workflow',
          type: ResourceType.VIDEO_STREAM,
          bunnyVideoId: 'pmct-mod1-intro',
          durationSeconds: 1800,
          order: 1,
          content: 'High-definition video lecture walking through mortuary scanner calibration, artifact attenuation, and standardized supine cadaver indexing.',
        },
        {
          title: 'Post-Mortem Changes vs Acute Pathology Lecture Notes',
          type: ResourceType.PROTECTED_DOCUMENT,
          order: 2,
          content: 'Detailed clinical reference sheet covering putrefactive gas distribution in the portal venous system, sedimentation hypostasis, and differentiation from intravital thromboembolism.',
        },
      ],
    },
    {
      order: 2,
      title: 'PMCT Traumatology: Blunt Force & Penetrating Trauma',
      subtitle: 'Cranial fractures, ballistic trajectories, and thoracic trauma',
      description: 'Systematic evaluation of skeletal fractures, organ contusions, bullet track trajectories, and forensic 3D volume rendering.',
      duration: '3h 00m',
      durationMinutes: 180,
      cmeCredits: 5,
      topics: [
        {
          title: 'Cranial Depressed Fractures & Intracranial Hemorrhage',
          type: ResourceType.VIDEO_STREAM,
          bunnyVideoId: 'pmct-mod2-cranial',
          durationSeconds: 2400,
          order: 1,
          content: 'In-depth analysis of calvarial hinge fractures, epidural versus subdural hematomas, and parenchymal contusion bloom artifacts.',
        },
        {
          title: 'Thoracic Blast & Deceleration Injury Analysis',
          type: ResourceType.PROTECTED_DOCUMENT,
          order: 2,
          content: 'Reference scans and notes on traumatic aortic transection, flail chest biomechanics, and distinguishing blast lung contusion from pulmonary edema.',
        },
      ],
    },
    {
      order: 3,
      title: 'Post-Mortem CT Angiography (PMCTA) & Vascular Death',
      subtitle: 'Targeted vascular access, contrast perfusion, and natural vs unnatural death',
      description: 'Master multiphase PMCTA protocols, femoral cannulation, contrast injection dynamics, and identifying coronary thrombosis vs ruptured aortic aneurysms.',
      duration: '2h 45m',
      durationMinutes: 165,
      cmeCredits: 5,
      topics: [
        {
          title: 'Multiphase Contrast Perfusion Technique',
          type: ResourceType.VIDEO_STREAM,
          bunnyVideoId: 'pmct-mod3-pmcta',
          durationSeconds: 2100,
          order: 1,
          content: 'Demonstration of automated injection pumps, paraffin oil/contrast mixtures, arterial phase, venous phase, and dynamic extravasation detection.',
        },
        {
          title: 'Coronary Artery Plaque Rupture vs Spasm Guide',
          type: ResourceType.PROTECTED_DOCUMENT,
          order: 2,
          content: 'Diagnostic criteria for acute myocardial infarction on PMCTA, luminal occlusion measurements, and microvascular contrast blush.',
        },
      ],
    },
    {
      order: 4,
      title: 'Medicolegal Reporting, Expert Testimony & Case Studies',
      subtitle: 'Coronial reporting standards, forensic court exhibits, and cross-examination',
      description: 'Synthesize PMCT findings into courtroom-ready forensic reports adhering to international legal standards.',
      duration: '2h 30m',
      durationMinutes: 150,
      cmeCredits: 4,
      topics: [
        {
          title: 'Drafting the Coronial Virtual Autopsy Report',
          type: ResourceType.VIDEO_STREAM,
          bunnyVideoId: 'pmct-mod4-reporting',
          durationSeconds: 1950,
          order: 1,
          content: 'Standardized nomenclature, presenting 3D volume rendered exhibits for jury comprehension, and medicolegal defense strategies.',
        },
        {
          title: 'Forensic Case Exhibit Template (Official Download)',
          type: ResourceType.DOWNLOADABLE_BRIEF,
          order: 2,
          isDownloadable: true,
          content: 'Whitelisted downloadable PDF template for structuring courtroom evidence submissions and multi-angle radiological annotations.',
        },
      ],
    },
  ];

  for (const mData of moduleData) {
    let existingModule = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        order: mData.order,
      },
    });

    if (!existingModule) {
      existingModule = await prisma.module.create({
        data: {
          courseId: course.id,
          title: mData.title,
          subtitle: mData.subtitle,
          description: mData.description,
          duration: mData.duration,
          durationMinutes: mData.durationMinutes,
          cmeCredits: mData.cmeCredits,
          order: mData.order,
          status: CourseStatus.PUBLISHED,
        },
      });
      console.log(`  ➕ Module ${mData.order} created: ${existingModule.title}`);

      // Seed resources/topics for this module
      for (const tData of mData.topics) {
        await prisma.resource.create({
          data: {
            moduleId: existingModule.id,
            title: tData.title,
            type: tData.type,
            bunnyVideoId: tData.bunnyVideoId,
            content: tData.content,
            durationSeconds: tData.durationSeconds,
            order: tData.order,
            isDownloadable: tData.isDownloadable || false,
            status: CourseStatus.PUBLISHED,
          },
        });
      }
      console.log(`    ↳ Added ${mData.topics.length} topics/resources`);
    } else {
      console.log(`  ℹ️ Module ${mData.order} already exists`);
    }
  }

  // 5. Seed Final Exam
  const examTitle = 'PMCT Board Certification Examination';
  let exam = await prisma.finalExam.findFirst({
    where: { courseId: course.id, title: examTitle },
  });

  if (!exam) {
    exam = await prisma.finalExam.create({
      data: {
        courseId: course.id,
        title: examTitle,
        description: 'Comprehensive 60-minute board certification assessment covering PMCT trauma, imaging physics, PMCTA contrast interpretation, and legal reporting.',
        durationMinutes: 60,
        totalMarks: 50,
        passPercentage: 75,
        randomizeQuestions: true,
        status: ExamStatus.PUBLISHED,
      },
    });
    console.log(`✅ Created Final Exam: ${exam.title} (ID: ${exam.id})`);

    // Add sample questions
    const q1 = await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'In post-mortem computed tomography, what is the primary diagnostic sign distinguishing post-mortem decomposition gas from intravital tension pneumothorax?',
        marks: 10,
        explanation: 'Decomposition gas characteristically distributes symmetrically across intravascular spaces, hepatic parenchyma, and subcutaneous tissues without mediastinal shift.',
        order: 1,
        correctAnswer: 'opt-2',
        options: {
          create: [
            { text: 'Unilateral pleural dome depression with severe mediastinal displacement to the contralateral side', order: 1 },
            { text: 'Diffuse intravascular and intrahepatic gas distribution without signs of mediastinal mass effect', order: 2 },
            { text: 'Presence of subcutaneous emphysema isolated exclusively to the thoracic inlet', order: 3 },
            { text: 'Elevated Hounsfield Units (+120 HU) within the pleural cavity', order: 4 },
          ],
        },
      },
    });

    const q2 = await prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_RESPONSE,
        text: 'Which of the following parameters are mandatory for high-resolution post-mortem head CT scanning when evaluating skull base fractures? (Select all that apply)',
        marks: 10,
        explanation: 'Bone reconstruction kernels (ultra-sharp) and sub-millimeter collimation slices are mandatory to detect fine petrous bone and clivus fractures.',
        order: 2,
        correctAnswers: ['opt-1', 'opt-3'],
        options: {
          create: [
            { text: 'Sub-millimeter slice thickness (<= 0.75 mm)', order: 1 },
            { text: 'Standard soft-tissue smooth reconstruction filter only', order: 2 },
            { text: 'High-frequency ultra-sharp bone kernel', order: 3 },
            { text: 'Intravenous iodinated contrast administered prior to initial bone acquisition', order: 4 },
          ],
        },
      },
    });

    const q3 = await prisma.question.create({
      data: {
        type: QuestionType.TRUE_FALSE_COMBINATION,
        text: 'Evaluate the veracity of the following statements regarding Post-Mortem CT Angiography (PMCTA):',
        marks: 10,
        statement1: 'Statement 1: Multiphase PMCTA requires contrast injection through both femoral artery and femoral vein.',
        statement2: 'Statement 2: High contrast extravasation into the pericardial sac confirms fatal cardiac rupture or aortic dissection.',
        explanation: 'Both statements are true. PMCTA utilizes dual femoral access, and contrast hemopericardium demonstrates true structural vascular disruption.',
        order: 3,
        correctAnswer: 'both-true',
        options: {
          create: [
            { text: 'Both Statement 1 and Statement 2 are True', order: 1 },
            { text: 'Statement 1 is True, Statement 2 is False', order: 2 },
            { text: 'Statement 1 is False, Statement 2 is True', order: 3 },
            { text: 'Both Statement 1 and Statement 2 are False', order: 4 },
          ],
        },
      },
    });

    // Link questions to exam
    await prisma.examQuestion.createMany({
      data: [
        { examId: exam.id, questionId: q1.id, order: 1 },
        { examId: exam.id, questionId: q2.id, order: 2 },
        { examId: exam.id, questionId: q3.id, order: 3 },
      ],
    });
    console.log(`  ➕ Linked 3 certification questions to Exam`);
  }

  // 6. Automatically enroll sample student in Course with initial progress
  const firstModule = await prisma.module.findFirst({
    where: { courseId: course.id, order: 1 },
  });

  if (firstModule) {
    await prisma.courseProgress.upsert({
      where: {
        userId_moduleId: {
          userId: student.id,
          moduleId: firstModule.id,
        },
      },
      update: {
        lastVideoTimestamp: 120,
        isCompleted: false,
      },
      create: {
        userId: student.id,
        moduleId: firstModule.id,
        lastVideoTimestamp: 120,
        isCompleted: false,
      },
    });
    console.log(`✅ Initialized Student Progress for Module 1`);
  }

  console.log('✨ Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
