import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ExamStatus, Role, QuestionType, CertificateStatus } from '@prisma/client';
import crypto from 'crypto';

export async function getAllExams(req: Request, res: Response): Promise<void> {
  try {
    const userRole = (req as any).user?.role;
    const isAdmin = userRole === Role.ADMIN;
    const courseId = req.query.courseId as string | undefined;

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.status = ExamStatus.PUBLISHED;
    }
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const exams = await prisma.finalExam.findMany({
      where: whereClause,
      include: {
        course: {
          select: { id: true, title: true },
        },
        examQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sanitizedExams = exams.map((exam) => {
      const allQuestions = exam.examQuestions.map((eq) => {
        const q = eq.question;
        const setNumber = eq.setNumber || 1;
        if (!isAdmin) {
          // Omit correct answers for students
          const { correctAnswer, correctAnswers, explanation, ...safeQuestion } = q;
          return { ...safeQuestion, order: eq.order, setNumber };
        }
        return { ...q, order: eq.order, setNumber };
      });

      const set1 = allQuestions.filter((q) => q.setNumber === 1);
      const set2 = allQuestions.filter((q) => q.setNumber === 2);
      const set3 = allQuestions.filter((q) => q.setNumber === 3);

      return {
        id: exam.id,
        courseId: exam.courseId,
        courseTitle: exam.course.title,
        title: exam.title,
        description: exam.description,
        duration: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passPercentage: exam.passPercentage || 70,
        maxAttempts: exam.maxAttempts || 3,
        randomizeQuestions: exam.randomizeQuestions,
        status: exam.status.toLowerCase(),
        questionsCount: allQuestions.length,
        questions: set1.length > 0 ? set1 : allQuestions,
        questionSets: {
          set1: set1.length > 0 ? set1 : allQuestions,
          set2,
          set3,
        },
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      };
    });

    sendSuccess(res, sanitizedExams, 'Final exams retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch exams', 500);
  }
}

export async function getExamById(req: Request, res: Response): Promise<void> {
  try {
    const examId = req.params.id as string;
    const userRole = (req as any).user?.role;
    const isAdmin = userRole === Role.ADMIN;

    const exam = await prisma.finalExam.findUnique({
      where: { id: examId },
      include: {
        course: {
          select: { id: true, title: true },
        },
        examQuestions: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      sendError(res, 'Exam not found', 404);
      return;
    }

    if (!isAdmin && exam.status !== ExamStatus.PUBLISHED) {
      sendError(res, 'Exam is not currently published', 403);
      return;
    }

    const allQuestions = exam.examQuestions.map((eq) => {
      const q = eq.question;
      const setNumber = eq.setNumber || 1;
      if (!isAdmin) {
        // Redact grading keys for students
        const { correctAnswer, correctAnswers, explanation, ...safeQuestion } = q;
        return { ...safeQuestion, order: eq.order, setNumber };
      }
      return { ...q, order: eq.order, setNumber };
    });

    const set1 = allQuestions.filter((q) => q.setNumber === 1);
    const set2 = allQuestions.filter((q) => q.setNumber === 2);
    const set3 = allQuestions.filter((q) => q.setNumber === 3);

    sendSuccess(
      res,
      {
        id: exam.id,
        courseId: exam.courseId,
        courseTitle: exam.course.title,
        title: exam.title,
        description: exam.description,
        duration: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passPercentage: exam.passPercentage || 70,
        maxAttempts: exam.maxAttempts || 3,
        randomizeQuestions: exam.randomizeQuestions,
        status: exam.status.toLowerCase(),
        questions: set1.length > 0 ? set1 : allQuestions,
        questionSets: {
          set1: set1.length > 0 ? set1 : allQuestions,
          set2,
          set3,
        },
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      },
      'Exam retrieved successfully'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch exam', 500);
  }
}

export async function createExam(req: Request, res: Response): Promise<void> {
  try {
    const { courseId, title, description, duration, passPercentage, status, questions, questionSets } = req.body;

    if (!courseId || !title) {
      sendError(res, 'Course ID and Exam Title are required', 400);
      return;
    }

    const set1 = questionSets?.set1 || (Array.isArray(questions) ? questions : []);
    const set2 = questionSets?.set2 || [];
    const set3 = questionSets?.set3 || [];

    const totalMarks = Math.max(
      set1.reduce((sum: number, q: any) => sum + (Number(q.marks) || 10), 0),
      set2.reduce((sum: number, q: any) => sum + (Number(q.marks) || 10), 0),
      set3.reduce((sum: number, q: any) => sum + (Number(q.marks) || 10), 0),
      60
    );

    const newExam = await prisma.finalExam.create({
      data: {
        courseId,
        title,
        description: description || null,
        durationMinutes: duration ? Number(duration) : 45,
        totalMarks,
        passPercentage: 70, // Strictly 70% threshold
        maxAttempts: 3,
        status: status === 'published' ? ExamStatus.PUBLISHED : ExamStatus.DRAFT,
      },
    });

    const createAndLinkSet = async (questionsList: any[], setNum: number) => {
      for (let i = 0; i < questionsList.length; i++) {
        const q = questionsList[i];
        let qType: QuestionType = QuestionType.SINGLE_CHOICE;
        if (q.type === 'multiple-response') qType = QuestionType.MULTIPLE_RESPONSE;
        if (q.type === 'true-false-combination') qType = QuestionType.TRUE_FALSE_COMBINATION;

        const createdQuestion = await prisma.question.create({
          data: {
            type: qType,
            text: q.text,
            imageUrl: q.image || null,
            marks: Number(q.marks) || 10,
            explanation: q.explanation || null,
            order: i + 1,
            statement1: q.statements?.statement1 || null,
            statement2: q.statements?.statement2 || null,
            correctAnswer: q.correctAnswer || null,
            correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [],
            options: {
              create: (q.options || []).map((opt: any, optIdx: number) => ({
                text: opt.text,
                order: optIdx + 1,
              })),
            },
          },
        });

        await prisma.examQuestion.create({
          data: {
            examId: newExam.id,
            questionId: createdQuestion.id,
            order: i + 1,
            setNumber: setNum,
          },
        });
      }
    };

    await createAndLinkSet(set1, 1);
    await createAndLinkSet(set2, 2);
    await createAndLinkSet(set3, 3);

    sendSuccess(res, newExam, 'Final exam created successfully with 3 question sets', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create final exam', 500);
  }
}

export async function updateExam(req: Request, res: Response): Promise<void> {
  try {
    const examId = req.params.id as string;
    const { title, description, duration, status } = req.body;

    const existing = await prisma.finalExam.findUnique({ where: { id: examId } });
    if (!existing) {
      sendError(res, 'Exam not found', 404);
      return;
    }

    const updated = await prisma.finalExam.update({
      where: { id: examId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { durationMinutes: Number(duration) }),
        passPercentage: 70, // Strictly 70% threshold
        maxAttempts: 3,
        ...(status && {
          status: status === 'published' ? ExamStatus.PUBLISHED : ExamStatus.DRAFT,
        }),
      },
    });

    sendSuccess(res, updated, 'Exam updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update exam', 500);
  }
}

export async function deleteExam(req: Request, res: Response): Promise<void> {
  try {
    const examId = req.params.id as string;
    await prisma.finalExam.delete({ where: { id: examId } });
    sendSuccess(res, { deleted: true }, 'Exam deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete exam', 500);
  }
}

// ==========================================
// Student Exam Taking & 3-Attempt Multi-Set Engine
// ==========================================

export async function startExamAttempt(req: Request, res: Response): Promise<void> {
  try {
    const examId = req.params.id as string;
    const userId = (req as any).user.userId;

    const exam = await prisma.finalExam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam || exam.status !== ExamStatus.PUBLISHED) {
      sendError(res, 'Exam not available or not published', 404);
      return;
    }

    // Check past attempts
    const pastAttempts = await prisma.examAttempt.findMany({
      where: { userId, examId },
      orderBy: { attemptNumber: 'asc' },
    });

    const alreadyPassed = pastAttempts.some((a) => a.passed);
    if (alreadyPassed) {
      sendError(res, 'You have already passed this accredited final exam. Further attempts are locked.', 400);
      return;
    }

    if (pastAttempts.length >= (exam.maxAttempts || 3)) {
      sendError(res, 'Maximum 3 attempts limit has been exhausted for this final examination.', 400);
      return;
    }

    const currentAttemptNumber = pastAttempts.length + 1;
    const targetSetNumber = currentAttemptNumber;

    // Filter questions by setNumber
    let questionsForThisAttempt = exam.examQuestions.filter(
      (eq) => (eq.setNumber || 1) === targetSetNumber
    );

    // Fallback if specific set not seeded
    if (questionsForThisAttempt.length === 0) {
      questionsForThisAttempt = exam.examQuestions;
    }

    const setTotalMarks = questionsForThisAttempt.reduce(
      (sum, eq) => sum + (Number(eq.question.marks) || 10),
      0
    );

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId,
        attemptNumber: currentAttemptNumber,
        setUsed: targetSetNumber,
        startedAt: new Date(),
        maxScore: setTotalMarks || exam.totalMarks,
      },
    });

    // Sanitize questions (remove answer keys for candidate view)
    const sanitizedQuestions = questionsForThisAttempt.map((eq) => {
      const { correctAnswer, correctAnswers, explanation, ...safeQ } = eq.question;
      return { ...safeQ, order: eq.order, setNumber: eq.setNumber || targetSetNumber };
    });

    sendSuccess(
      res,
      {
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        setUsed: attempt.setUsed,
        startedAt: attempt.startedAt,
        durationMinutes: exam.durationMinutes,
        totalMarks: attempt.maxScore,
        passPercentage: 70,
        maxAttempts: 3,
        questions: sanitizedQuestions,
      },
      `Exam attempt ${currentAttemptNumber} of 3 started (Question Set ${targetSetNumber})`
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to start exam attempt', 500);
  }
}

export async function submitExamAttempt(req: Request, res: Response): Promise<void> {
  try {
    const attemptId = req.params.attemptId as string;
    const userId = (req as any).user.userId;
    const { answers, timeSpentSeconds, tabSwitchViolations } = req.body;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            course: true,
            examQuestions: {
              include: {
                question: {
                  include: { options: true },
                },
              },
            },
          },
        },
        user: true,
      },
    });

    if (!attempt || attempt.userId !== userId) {
      sendError(res, 'Attempt not found or unauthorized', 404);
      return;
    }

    if (attempt.completedAt) {
      sendError(res, 'This exam attempt has already been submitted', 400);
      return;
    }

    // Auto-Grading Engine for the specific set used
    let totalScore = 0;
    const setQuestions = attempt.exam.examQuestions.filter(
      (eq) => (eq.setNumber || 1) === (attempt.setUsed || 1)
    );
    const questionsToGrade =
      setQuestions.length > 0
        ? setQuestions.map((eq) => eq.question)
        : attempt.exam.examQuestions.map((eq) => eq.question);

    const answersRecord = answers || {};

    questionsToGrade.forEach((q) => {
      const studentAns = answersRecord[q.id];
      if (!studentAns) return;

      if (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.TRUE_FALSE_COMBINATION) {
        if (studentAns === q.correctAnswer) {
          totalScore += q.marks;
        }
      } else if (q.type === QuestionType.MULTIPLE_RESPONSE) {
        const correctSet = new Set(q.correctAnswers || []);
        const studentSet = new Set(Array.isArray(studentAns) ? studentAns : [studentAns]);

        if (correctSet.size === studentSet.size && [...correctSet].every((item) => studentSet.has(item))) {
          totalScore += q.marks;
        }
      }
    });

    const maxScore = attempt.maxScore || attempt.exam.totalMarks || 60;
    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    const passThreshold = 70; // Strict 70% threshold per specification
    const passed = scorePercentage >= passThreshold;

    // Update attempt record
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        timeSpentSeconds: timeSpentSeconds ? Number(timeSpentSeconds) : 0,
        totalScore,
        percentage: scorePercentage,
        passed,
        tabSwitchViolations: Number(tabSwitchViolations) || 0,
        answersJson: answersRecord,
      },
    });

    // If passed, issue official verifiable certificate
    let certificate = null;
    if (passed) {
      const certCode = `VAT-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      certificate = await prisma.certificate.create({
        data: {
          certificateCode: certCode,
          userId,
          courseId: attempt.exam.courseId,
          examAttemptId: attempt.id,
          recipientName: attempt.user.fullName,
          courseTitle: attempt.exam.course.title,
          pdfUrl: `/api/certificates/download/${certCode}`,
          status: CertificateStatus.ACTIVE,
        },
      });
    }

    sendSuccess(
      res,
      {
        attemptId: updatedAttempt.id,
        attemptNumber: updatedAttempt.attemptNumber,
        setUsed: updatedAttempt.setUsed,
        totalScore,
        maxScore,
        scorePercentage,
        passPercentage: passThreshold,
        passed,
        attemptsRemaining: passed ? 0 : Math.max(0, 3 - updatedAttempt.attemptNumber),
        isPermanentlyLocked: passed || updatedAttempt.attemptNumber >= 3,
        certificate: certificate
          ? {
              code: certificate.certificateCode,
              recipientName: certificate.recipientName,
              courseTitle: certificate.courseTitle,
              issueDate: certificate.issueDate,
              pdfUrl: certificate.pdfUrl,
            }
          : null,
      },
      'Exam submitted and graded successfully'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit exam attempt', 500);
  }
}

export async function verifyCertificate(req: Request, res: Response): Promise<void> {
  try {
    const code = req.params.code as string;
    const cert = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        user: { select: { fullName: true, email: true } },
        course: { select: { title: true } },
      },
    });

    if (!cert) {
      sendError(res, 'Certificate not found or invalid verification code', 404);
      return;
    }

    sendSuccess(
      res,
      {
        valid: cert.status === CertificateStatus.ACTIVE,
        code: cert.certificateCode,
        recipient: cert.recipientName,
        course: cert.courseTitle,
        issueDate: cert.issueDate,
        status: cert.status,
      },
      'Certificate verified'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to verify certificate', 500);
  }
}
