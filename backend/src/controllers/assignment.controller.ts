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

export async function getModuleAssignment(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const assignment = await prisma.assignment.findFirst({
      where: { moduleId },
      include: {
        submissions: true,
      },
    });

    if (!assignment) {
      sendSuccess(res, null, 'No assignment found for module');
      return;
    }

    sendSuccess(res, assignment, 'Module assignment retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch module assignment', 500);
  }
}

export async function upsertModuleAssignment(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const { title, description, instructions, maxScore, dueDate, templateFileName, templateFileUrl } = req.body;

    if (!moduleId) {
      sendError(res, 'Module ID is required', 400);
      return;
    }

    const moduleExists = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!moduleExists) {
      sendError(res, 'Module not found', 404);
      return;
    }

    const existing = await prisma.assignment.findFirst({
      where: { moduleId },
    });

    let assignment;
    if (existing) {
      assignment = await prisma.assignment.update({
        where: { id: existing.id },
        data: {
          title: title !== undefined ? title : existing.title,
          description: description !== undefined ? description : existing.description,
          instructions: instructions !== undefined ? instructions : existing.instructions,
          maxScore: maxScore !== undefined ? Number(maxScore) : existing.maxScore,
          dueDate: dueDate ? new Date(dueDate) : (dueDate === null ? null : existing.dueDate),
          templateFileName: templateFileName !== undefined ? templateFileName : existing.templateFileName,
          templateFileUrl: templateFileUrl !== undefined ? templateFileUrl : existing.templateFileUrl,
        },
      });
    } else {
      assignment = await prisma.assignment.create({
        data: {
          moduleId,
          title: title || 'Module Case Assignment',
          description: description || null,
          instructions: instructions || '',
          maxScore: maxScore ? Number(maxScore) : 100,
          dueDate: dueDate ? new Date(dueDate) : null,
          templateFileName: templateFileName || null,
          templateFileUrl: templateFileUrl || null,
        },
      });
    }

    sendSuccess(res, assignment, 'Module assignment saved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to save module assignment', 500);
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
      } as any,
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
        submissionGuidelines: submissionGuidelines !== undefined ? submissionGuidelines : (existing as any).submissionGuidelines,
        attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : (existing as any).attachmentUrl,
        ...(status && { status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED' }),
        ...(maxScore !== undefined && { maxScore: Number(maxScore) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      } as any,
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
      } as any,
    });

    sendSuccess(res, updated, `Assignment status updated to ${status}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update assignment status', 500);
  }
}

export async function submitAssignment(req: Request, res: Response): Promise<void> {
  try {
    const idParam = (req.params.assignmentId || req.params.moduleId) as string;
    const userId = (req as any).user?.userId;
    const file = req.file;

    if (!file) {
      sendError(res, 'Submission document PDF is required', 400);
      return;
    }

    if (!userId) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    let assignment = await prisma.assignment.findUnique({ where: { id: idParam } });
    if (!assignment) {
      assignment = await prisma.assignment.findFirst({ where: { moduleId: idParam } });
    }

    if (!assignment) {
      sendError(res, 'Assignment not found', 404);
      return;
    }

    const existing = await prisma.submission.findFirst({
      where: { assignmentId: assignment.id, userId },
    });

    if (existing && (existing.status === SubmissionStatus.SUBMITTED || existing.status === SubmissionStatus.GRADED)) {
      sendError(res, 'This assignment has already been submitted and cannot be resubmitted.', 400);
      return;
    }

    const studentResponseText = req.body.studentResponseText || req.body.responseText || null;
    const isResubmission = Boolean(
      existing &&
        (existing.status === SubmissionStatus.RESUBMISSION_REQUESTED || (existing as any).isResubmission)
    );

    const cleanOrigName = (file.originalname || 'case_report.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${userId}_${Date.now()}_${cleanOrigName}`;
    const fileUrl = await uploadDocument(file.buffer, `submissions/${assignment.id}`, fileName, file.mimetype);

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          fileUrl,
          responseText: studentResponseText,
          isResubmission: true,
          status: SubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
        } as any,
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          userId,
          fileUrl,
          responseText: studentResponseText,
          isResubmission: isResubmission,
          status: SubmissionStatus.SUBMITTED,
        } as any,
      });
    }

    sendSuccess(
      res,
      {
        ...submission,
        originalFileName: file.originalname,
      },
      'Assignment submitted successfully',
      201
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit assignment', 500);
  }
}

export async function getAllSubmissions(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const isAdmin = user?.role === 'ADMIN';

    const submissions = await prisma.submission.findMany({
      where: isAdmin ? {} : { userId: user?.userId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        assignment: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                course: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const mapped = submissions.map((s) => {
      const rawName = s.fileUrl ? s.fileUrl.split('/').pop()?.split('?')[0] || '' : '';
      const baseName = rawName.replace(/^[a-f0-9-]+_\d+_/, '') || 'Case_Report.pdf';
      const cleanName = baseName.toLowerCase().endsWith('.pdf') ? baseName : `${baseName}.pdf`;
      return {
        id: s.id,
        studentId: s.userId,
        studentName: s.user?.fullName || 'Student',
        studentEmail: s.user?.email || '',
        courseId: s.assignment?.module?.course?.id || '',
        courseName: s.assignment?.module?.course?.title || 'Forensic Medicine & Pathology',
        moduleId: s.assignment?.module?.id || '',
        moduleTitle: s.assignment?.module?.title || 'Module Assignment',
        topicId: s.assignmentId,
        topicTitle: s.assignment?.title || 'Case Evaluation Report',
        assignmentInstructions: s.assignment?.instructions || s.assignment?.description || '',
        studentResponseText: (s as any).responseText || '',
        isResubmission: Boolean((s as any).isResubmission),
        submittedAt: new Date(s.submittedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        status:
          s.status === SubmissionStatus.GRADED
            ? 'APPROVED'
            : s.status === SubmissionStatus.RESUBMISSION_REQUESTED
            ? 'REJECTED'
            : (s as any).isResubmission
            ? 'RESUBMITTED'
            : 'PENDING',
        score: s.score,
        maxScore: s.assignment?.maxScore || 100,
        adminFeedback: s.feedback || '',
        uploadedFileUrl: s.fileUrl,
        uploadedFileName: cleanName,
        reviewedAt: s.gradedAt ? new Date(s.gradedAt).toLocaleDateString('en-US') : undefined,
      };
    });

    sendSuccess(res, mapped, 'Submissions retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch submissions', 500);
  }
}

export async function gradeSubmission(req: Request, res: Response): Promise<void> {
  try {
    const submissionId = req.params.submissionId as string;
    const adminUser = (req as any).user;
    const { score, feedback, status } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission) {
      sendError(res, 'Submission not found', 404);
      return;
    }

    let finalStatus: SubmissionStatus = SubmissionStatus.GRADED;
    if (status === 'REJECTED' || status === 'RESUBMISSION_REQUESTED') {
      finalStatus = SubmissionStatus.RESUBMISSION_REQUESTED;
    } else if (status === 'PENDING') {
      finalStatus = SubmissionStatus.SUBMITTED;
    }

    const maxScore = submission.assignment?.maxScore || 100;
    let calculatedScore =
      score !== undefined && score !== null
        ? Number(score)
        : status === 'APPROVED'
        ? maxScore
        : (status === 'REJECTED' || status === 'RESUBMISSION_REQUESTED' ? 0 : submission.score);

    if (calculatedScore !== null && calculatedScore !== undefined) {
      if (calculatedScore > maxScore) {
        calculatedScore = maxScore;
      } else if (calculatedScore < 0) {
        calculatedScore = 0;
      }
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: calculatedScore,
        feedback: feedback !== undefined ? feedback : submission.feedback,
        status: finalStatus,
        gradedBy: adminUser?.fullName || 'Academic Faculty',
        gradedAt: new Date(),
      },
    });

    sendSuccess(res, updated, 'Submission evaluated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to grade submission', 500);
  }
}
