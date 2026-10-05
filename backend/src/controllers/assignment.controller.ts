import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { uploadDocument } from '../services/storage.service.js';
import { Role, SubmissionStatus } from '@prisma/client';

export async function getAssignments(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.query.moduleId as string | undefined;
    const courseId = req.query.courseId as string | undefined;

    let whereClause: any = {};
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }
    if (courseId) {
      whereClause.module = { courseId };
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
            courseId: true,
            course: { select: { id: true, title: true } },
          },
        },
        submissions: {
          select: { id: true, userId: true, status: true, score: true, submittedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, assignments, 'Assignments retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch assignments', 500);
  }
}

export async function getAssignmentById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
            courseId: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!assignment) {
      sendError(res, 'Assignment not found', 404);
      return;
    }

    sendSuccess(res, assignment, 'Assignment retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch assignment', 500);
  }
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { moduleId, title, instructions, submissionGuidelines, attachmentUrl, status, maxScore, dueDate } = req.body;

    if (!moduleId || !title || !instructions) {
      sendError(res, 'Module ID, title, and instructions are required', 400);
      return;
    }

    const assignment = await prisma.assignment.create({
      data: {
        moduleId,
        title,
        instructions,
        submissionGuidelines: submissionGuidelines || null,
        attachmentUrl: attachmentUrl || null,
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
        maxScore: maxScore ? Number(maxScore) : 100,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
            courseId: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
    });

    sendSuccess(res, assignment, 'Assignment created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create assignment', 500);
  }
}

export async function updateAssignment(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { moduleId, title, instructions, submissionGuidelines, attachmentUrl, status, maxScore, dueDate } = req.body;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, 'Assignment not found', 404);
      return;
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(moduleId && { moduleId }),
        ...(title && { title }),
        ...(instructions && { instructions }),
        submissionGuidelines: submissionGuidelines !== undefined ? submissionGuidelines : existing.submissionGuidelines,
        attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : existing.attachmentUrl,
        ...(status && { status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED' }),
        ...(maxScore !== undefined && { maxScore: Number(maxScore) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
            courseId: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
    });

    sendSuccess(res, updated, 'Assignment updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update assignment', 500);
  }
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, 'Assignment not found', 404);
      return;
    }

    await prisma.assignment.delete({ where: { id } });
    sendSuccess(res, null, 'Assignment deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete assignment', 500);
  }
}

export async function updateAssignmentStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, 'Assignment not found', 404);
      return;
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
      },
    });

    sendSuccess(res, updated, `Assignment status updated to ${status}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update assignment status', 500);
  }
}

export async function submitAssignment(req: Request, res: Response): Promise<void> {
  try {
    const assignmentId = req.params.assignmentId as string;
    const userId = (req as any).user.userId;
    const file = req.file;

    if (!file) {
      sendError(res, 'Submission document PDF is required', 400);
      return;
    }

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      sendError(res, 'Assignment not found', 404);
      return;
    }

    const fileName = `${userId}_${Date.now()}.pdf`;
    const fileUrl = await uploadDocument(file.buffer, `submissions/${assignmentId}`, fileName, file.mimetype);

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        userId,
        fileUrl,
        status: SubmissionStatus.SUBMITTED,
      },
    });

    sendSuccess(res, submission, 'Assignment submitted successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit assignment', 500);
  }
}

export async function gradeSubmission(req: Request, res: Response): Promise<void> {
  try {
    const submissionId = req.params.submissionId as string;
    const adminUser = (req as any).user;
    const { score, feedback, status } = req.body;

    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) {
      sendError(res, 'Submission not found', 404);
      return;
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: score !== undefined ? Number(score) : submission.score,
        feedback: feedback !== undefined ? feedback : submission.feedback,
        status: status === 'RESUBMISSION_REQUESTED' ? SubmissionStatus.RESUBMISSION_REQUESTED : SubmissionStatus.GRADED,
        gradedBy: adminUser.fullName,
        gradedAt: new Date(),
      },
    });

    sendSuccess(res, updated, 'Submission graded successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to grade submission', 500);
  }
}
