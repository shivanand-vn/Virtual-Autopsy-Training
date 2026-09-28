import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { Role } from '@prisma/client';

export async function getDiscussions(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.query.moduleId as string | undefined;

    const discussions = await prisma.discussion.findMany({
      where: moduleId ? { moduleId } : {},
      include: {
        user: { select: { id: true, fullName: true, role: true, title: true, avatar: true } },
        module: { select: { id: true, title: true, order: true } },
        replies: {
          include: {
            user: { select: { id: true, fullName: true, role: true, title: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, discussions, 'Discussions retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch discussions', 500);
  }
}

export async function getDiscussionById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, role: true, title: true, avatar: true } },
        module: { select: { id: true, title: true, order: true } },
        replies: {
          include: {
            user: { select: { id: true, fullName: true, role: true, title: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!discussion) {
      sendError(res, 'Discussion not found', 404);
      return;
    }

    sendSuccess(res, discussion, 'Discussion retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch discussion', 500);
  }
}

export async function createDiscussion(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { title, content, moduleId } = req.body;

    if (!title || !content) {
      sendError(res, 'Title and content are required', 400);
      return;
    }

    const discussion = await prisma.discussion.create({
      data: {
        userId,
        title,
        content,
        moduleId: moduleId || null,
      },
      include: {
        user: { select: { id: true, fullName: true, role: true, title: true } },
      },
    });

    sendSuccess(res, discussion, 'Discussion created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create discussion', 500);
  }
}

export async function replyDiscussion(req: Request, res: Response): Promise<void> {
  try {
    const discussionId = req.params.id as string;
    const userId = (req as any).user.userId;
    const { content } = req.body;

    if (!content) {
      sendError(res, 'Reply content is required', 400);
      return;
    }

    const reply = await prisma.discussionReply.create({
      data: {
        discussionId,
        userId,
        content,
      },
      include: {
        user: { select: { id: true, fullName: true, role: true, title: true } },
      },
    });

    sendSuccess(res, reply, 'Reply posted successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to post reply', 500);
  }
}

export async function toggleResolved(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = (req as any).user;

    const existing = await prisma.discussion.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, 'Discussion not found', 404);
      return;
    }

    // Only thread author or admin can toggle resolved
    if (user.role !== Role.ADMIN && existing.userId !== user.userId) {
      sendError(res, 'Unauthorized to update this discussion', 403);
      return;
    }

    const updated = await prisma.discussion.update({
      where: { id },
      data: { isResolved: !existing.isResolved },
    });

    sendSuccess(res, updated, 'Discussion resolved status updated');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update discussion status', 500);
  }
}
