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
      const questions = exam.examQuestions.map((eq) => {
        const q = eq.question;
        if (!isAdmin) {
          // Omit correct answers for students
          const { correctAnswer, correctAnswers, explanation, ...safeQuestion } = q;
          return { ...safeQuestion, order: eq.order };
        }
        return { ...q, order: eq.order };
      });

      return {
        id: exam.id,
        courseId: exam.courseId,
        courseTitle: exam.course.title,
        title: exam.title,
        description: exam.description,
        duration: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passPercentage: exam.passPercentage,
        randomizeQuestions: exam.randomizeQuestions,
        status: exam.status.toLowerCase(),
        questionsCount: questions.length,
        questions,
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

    const questions = exam.examQuestions.map((eq) => {
      const q = eq.question;
      if (!isAdmin) {
        // Redact grading keys for students
        const { correctAnswer, correctAnswers, explanation, ...safeQuestion } = q;
        return { ...safeQuestion, order: eq.order };
      }
      return { ...q, order: eq.order };
    });

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
        passPercentage: exam.passPercentage,
        randomizeQuestions: exam.randomizeQuestions,
        status: exam.status.toLowerCase(),
        questions,
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
    const { courseId, title, description, duration, passPercentage, status, questions } = req.body;

    if (!courseId || !title) {
      sendError(res, 'Course ID and Exam Title are required', 400);
      return;
    }

    const questionsArray = Array.isArray(questions) ? questions : [];
    const totalMarks = questionsArray.reduce((acc: number, q: any) => acc + (Number(q.marks) || 1), 0);

    const newExam = await prisma.finalExam.create({
      data: {
        courseId,
        title,
        description: description || null,
        durationMinutes: duration ? Number(duration) : 60,
        totalMarks: totalMarks > 0 ? totalMarks : 100,
        passPercentage: passPercentage ? Number(passPercentage) : 75,
        status: status === 'published' ? ExamStatus.PUBLISHED : ExamStatus.DRAFT,
      },
    });

    // Create and link questions
    for (let i = 0; i < questionsArray.length; i++) {
      const q = questionsArray[i];
      let qType: QuestionType = QuestionType.SINGLE_CHOICE;
      if (q.type === 'multiple-response') qType = QuestionType.MULTIPLE_RESPONSE;
      if (q.type === 'true-false-combination') qType = QuestionType.TRUE_FALSE_COMBINATION;

      const createdQuestion = await prisma.question.create({
        data: {
          type: qType,
          text: q.text,
          imageUrl: q.image || null,
          marks: Number(q.marks) || 1,
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
        },
      });
    }

    sendSuccess(res, newExam, 'Final exam created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create final exam', 500);
  }
}

export async function updateExam(req: Request, res: Response): Promise<void> {
  try {
    const examId = req.params.id as string;
    const { title, description, duration, passPercentage, status, questions } = req.body;

    const existing = await prisma.finalExam.findUnique({ where: { id: examId } });
    if (!existing) {
      sendError(res, 'Exam not found', 404);
      return;
    }

    let calculatedTotalMarks: number | undefined;
    if (Array.isArray(questions)) {
      calculatedTotalMarks = questions.reduce((acc: number, q: any) => acc + (Number(q.marks) || 1), 0);
    }

    const updated = await prisma.finalExam.update({
      where: { id: examId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { durationMinutes: Number(duration) }),
        ...(passPercentage !== undefined && { passPercentage: Number(passPercentage) }),
        ...(calculatedTotalMarks !== undefined && { totalMarks: calculatedTotalMarks }),
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
// Student Exam Taking & Auto-Grading Engine
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
      sendError(res, 'Exam not available', 404);
      return;
    }

    // Determine attempt number
    const previousAttemptsCount = await prisma.examAttempt.count({
      where: { userId, examId },
    });

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId,
        attemptNumber: previousAttemptsCount + 1,
        startedAt: new Date(),
        maxScore: exam.totalMarks,
      },
    });

    // Sanitize questions (remove answer keys)
    const sanitizedQuestions = exam.examQuestions.map((eq) => {
      const { correctAnswer, correctAnswers, explanation, ...safeQ } = eq.question;
      return { ...safeQ, order: eq.order };
    });

    sendSuccess(
      res,
      {
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passPercentage: exam.passPercentage,
        questions: sanitizedQuestions,
      },
      'Exam attempt started'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to start exam attempt', 500);
  }
}

export async function submitExamAttempt(req: Request, res: Response): Promise<void> {
  try {
    const attemptId = req.params.attemptId as string;
    const userId = (req as any).user.userId;
    const { answers, timeSpentSeconds } = req.body;

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

    // Auto-Grading Engine
    let totalScore = 0;
    const questions = attempt.exam.examQuestions.map((eq) => eq.question);
    const answersRecord = answers || {};

    questions.forEach((q) => {
      const studentAns = answersRecord[q.id];
      if (!studentAns) return;

      if (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.TRUE_FALSE_COMBINATION) {
        if (studentAns === q.correctAnswer) {
          totalScore += q.marks;
        }
      } else if (q.type === QuestionType.MULTIPLE_RESPONSE) {
        // Multi-select comparison
        const correctSet = new Set(q.correctAnswers || []);
        const studentSet = new Set(Array.isArray(studentAns) ? studentAns : [studentAns]);

        if (correctSet.size === studentSet.size && [...correctSet].every((item) => studentSet.has(item))) {
          totalScore += q.marks;
        }
      }
    });

    const maxScore = attempt.exam.totalMarks || 100;
    const scorePercentage = (totalScore / maxScore) * 100;
    const passed = scorePercentage >= (attempt.exam.passPercentage || 75);

    // Update attempt record
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        timeSpentSeconds: timeSpentSeconds ? Number(timeSpentSeconds) : 0,
        totalScore,
        passed,
        answersJson: answersRecord,
      },
    });

    // If passed, issue official certificate
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
        totalScore,
        maxScore,
        scorePercentage: Math.round(scorePercentage * 10) / 10,
        passPercentage: attempt.exam.passPercentage,
        passed,
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
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        user: { select: { fullName: true, organization: true } },
        course: { select: { title: true } },
      },
    });

    if (!certificate || certificate.status !== CertificateStatus.ACTIVE) {
      sendError(res, 'Certificate not found or revoked', 404);
      return;
    }

    sendSuccess(
      res,
      {
        certificateCode: certificate.certificateCode,
        recipientName: certificate.recipientName,
        courseTitle: certificate.courseTitle,
        issueDate: certificate.issueDate,
        status: certificate.status,
        verified: true,
      },
      'Certificate verified successfully'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to verify certificate', 500);
  }
}
