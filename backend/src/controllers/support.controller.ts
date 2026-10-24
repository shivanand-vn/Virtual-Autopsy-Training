import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// ------------------------------------------
// Validation Schemas
// ------------------------------------------

const createIssueSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(200),
  studentEmail: z.string().email('Please enter a valid email address'),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters').max(5000),
  screenshotBase64: z
    .string()
    .max(7 * 1024 * 1024, 'Screenshot data must not exceed ~5 MB (base64-encoded)')
    .optional()
    .nullable(),
});

// ------------------------------------------
// API Response Mapper
// ------------------------------------------

function toSupportIssueReport(issue: {
  id: string;
  studentName: string;
  studentEmail: string;
  category: string;
  description: string;
  screenshotBase64: string | null;
  status: string;
  submittedAt: Date;
  resolvedAt: Date | null;
}) {
  return {
    id: issue.id,
    studentName: issue.studentName,
    studentEmail: issue.studentEmail,
    category: issue.category,
    description: issue.description,
    screenshotBase64: issue.screenshotBase64 ?? undefined,
    status: issue.status === 'SOLVED' ? 'solved' : 'pending',
    submittedAt: issue.submittedAt.toISOString(),
    resolvedAt: issue.resolvedAt ? issue.resolvedAt.toISOString() : undefined,
  };
}

// ------------------------------------------
// POST /api/support/issues — Authenticated students
// ------------------------------------------

export async function createSupportIssue(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const parsed = createIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Validation failed';
      sendError(res, errorMsg, 400);
      return;
    }

    const { studentName, studentEmail, category, description, screenshotBase64 } = parsed.data;

    const issue = await prisma.supportIssue.create({
      data: {
        userId: req.user.userId,
        studentName: studentName.trim(),
        studentEmail: studentEmail.toLowerCase().trim(),
        category: category.trim(),
        description: description.trim(),
        screenshotBase64: screenshotBase64 || null,
        status: 'PENDING',
      },
    });

    sendSuccess(res, 'Support issue submitted successfully', toSupportIssueReport(issue), 201);
  } catch (error: any) {
    console.error('[createSupportIssue] Error:', error?.message || error);
    sendError(res, 'Failed to submit support issue. Please try again.', 500);
  }
}

// ------------------------------------------
// GET /api/support/issues — Admin only
// ------------------------------------------

export async function getSupportIssues(req: AuthRequest, res: Response): Promise<void> {
  try {
    const issues = await prisma.supportIssue.findMany({
      orderBy: { submittedAt: 'desc' },
    });

    const mapped = issues.map(toSupportIssueReport);

    sendSuccess(res, 'Support issues retrieved', mapped);
  } catch (error: any) {
    console.error('[getSupportIssues] Error:', error?.message || error);
    sendError(res, 'Failed to retrieve support issues. Please try again.', 500);
  }
}

// ------------------------------------------
// PATCH /api/support/issues/:id/resolve — Admin only
// ------------------------------------------

export async function resolveSupportIssue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      sendError(res, 'Valid issue ID is required.', 400);
      return;
    }

    const existing = await prisma.supportIssue.findUnique({ where: { id } });

    if (!existing) {
      sendError(res, 'Support issue not found.', 404);
      return;
    }

    if (existing.status === 'SOLVED') {
      // Idempotent — return current state without error
      sendSuccess(res, 'Support issue is already resolved', toSupportIssueReport(existing));
      return;
    }

    const updated = await prisma.supportIssue.update({
      where: { id },
      data: {
        status: 'SOLVED',
        resolvedAt: new Date(),
      },
    });

    sendSuccess(res, 'Support issue resolved successfully', toSupportIssueReport(updated));
  } catch (error: any) {
    console.error('[resolveSupportIssue] Error:', error?.message || error);
    sendError(res, 'Failed to resolve support issue. Please try again.', 500);
  }
}

// ------------------------------------------
// DELETE /api/support/issues/:id — Admin only
// ------------------------------------------

export async function deleteSupportIssue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      sendError(res, 'Valid issue ID is required.', 400);
      return;
    }

    const existing = await prisma.supportIssue.findUnique({ where: { id } });

    if (!existing) {
      sendError(res, 'Support issue not found.', 404);
      return;
    }

    if (existing.status !== 'SOLVED') {
      sendError(
        res,
        'Only resolved issues can be deleted. Please resolve the issue first.',
        400
      );
      return;
    }

    await prisma.supportIssue.delete({ where: { id } });

    sendSuccess(res, 'Support issue deleted successfully');
  } catch (error: any) {
    console.error('[deleteSupportIssue] Error:', error?.message || error);
    sendError(res, 'Failed to delete support issue. Please try again.', 500);
  }
}
