import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateBunnyStreamToken } from '../services/bunny.service.js';
import { CourseStatus, Role } from '@prisma/client';

export async function getAllCourses(req: Request, res: Response): Promise<void> {
  try {
    const userRole = (req as any).user?.role;
    const isAdmin = userRole === Role.ADMIN;

    const courses = await prisma.course.findMany({
      where: isAdmin ? {} : { status: CourseStatus.PUBLISHED },
      orderBy: { order: 'asc' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            resources: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    sendSuccess(res, courses, 'Courses retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch courses', 500);
  }
}

export async function getCourseById(req: Request, res: Response): Promise<void> {
  try {
    const courseId = req.params.id as string;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    const isAdmin = userRole === Role.ADMIN;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            resources: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      sendError(res, 'Course not found', 404);
      return;
    }

    if (!isAdmin && course.status !== CourseStatus.PUBLISHED) {
      sendError(res, 'Course is not published', 403);
      return;
    }

    // If student is logged in, attach progress and sequential locking status
    let userProgress: Record<string, { isCompleted: boolean; lastVideoTimestamp: number }> = {};
    if (userId) {
      const progressRecords = await prisma.courseProgress.findMany({
        where: { userId },
      });
      progressRecords.forEach((pr) => {
        userProgress[pr.moduleId] = {
          isCompleted: pr.isCompleted,
          lastVideoTimestamp: pr.lastVideoTimestamp,
        };
      });
    }

    let previousModuleCompleted = true;
    const modulesWithLockStatus = course.modules.map((mod, index) => {
      const progress = userProgress[mod.id] || { isCompleted: false, lastVideoTimestamp: 0 };
      const isLocked = isAdmin ? false : (index === 0 ? false : !previousModuleCompleted);
      
      // Update completion tracker for next iteration
      if (!progress.isCompleted) {
        previousModuleCompleted = false;
      }

      return {
        ...mod,
        isCompleted: progress.isCompleted,
        lastVideoTimestamp: progress.lastVideoTimestamp,
        isLocked,
      };
    });

    sendSuccess(
      res,
      {
        ...course,
        modules: modulesWithLockStatus,
      },
      'Course details retrieved'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch course', 500);
  }
}

export async function createCourse(req: Request, res: Response): Promise<void> {
  try {
    const { title, shortDescription, description, duration, thumbnailUrl, status } = req.body;

    if (!title || !description) {
      sendError(res, 'Course title and description are required', 400);
      return;
    }

    const courseCount = await prisma.course.count();
    const newCourse = await prisma.course.create({
      data: {
        title,
        shortDescription: shortDescription || null,
        description,
        duration: duration || '16 Weeks',
        thumbnailUrl: thumbnailUrl || null,
        status: status === 'DRAFT' ? CourseStatus.DRAFT : CourseStatus.PUBLISHED,
        order: courseCount + 1,
      },
      include: {
        modules: true,
      },
    });

    sendSuccess(res, newCourse, 'Course created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create course', 500);
  }
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  try {
    const courseId = req.params.id as string;
    const { title, shortDescription, description, duration, thumbnailUrl, status } = req.body;

    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      sendError(res, 'Course not found', 404);
      return;
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title && { title }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(description && { description }),
        ...(duration !== undefined && { duration }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(status && { status }),
      },
    });

    sendSuccess(res, updated, 'Course updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update course', 500);
  }
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  try {
    const courseId = req.params.id as string;
    await prisma.course.delete({ where: { id: courseId } });
    sendSuccess(res, { deleted: true }, 'Course deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete course', 500);
  }
}

// ==========================================
// Module Operations
// ==========================================

export async function createModule(req: Request, res: Response): Promise<void> {
  try {
    const courseId = req.params.courseId as string;
    const { title, subtitle, description, duration, durationMinutes, cmeCredits, status } = req.body;

    if (!title) {
      sendError(res, 'Module title is required', 400);
      return;
    }

    const moduleCount = await prisma.module.count({ where: { courseId } });
    const newModule = await prisma.module.create({
      data: {
        courseId,
        title,
        subtitle: subtitle || null,
        description: description || null,
        duration: duration || '2h 00m',
        durationMinutes: durationMinutes || 120,
        cmeCredits: cmeCredits || 4,
        order: moduleCount + 1,
        status: status === 'DRAFT' ? CourseStatus.DRAFT : CourseStatus.PUBLISHED,
      },
      include: {
        resources: true,
      },
    });

    sendSuccess(res, newModule, 'Module created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create module', 500);
  }
}

export async function updateModule(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const { title, subtitle, description, duration, durationMinutes, cmeCredits, status, order } = req.body;

    const existing = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!existing) {
      sendError(res, 'Module not found', 404);
      return;
    }

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration }),
        ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
        ...(cmeCredits !== undefined && { cmeCredits: Number(cmeCredits) }),
        ...(status && { status }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    sendSuccess(res, updated, 'Module updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update module', 500);
  }
}

export async function deleteModule(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    await prisma.module.delete({ where: { id: moduleId } });
    sendSuccess(res, { deleted: true }, 'Module deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete module', 500);
  }
}

// ==========================================
// Topic / Resource Operations
// ==========================================

export async function createTopic(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const { title, description, type, bunnyVideoId, videoUrl, content, durationSeconds, isDownloadable, status } = req.body;

    if (!title) {
      sendError(res, 'Topic title is required', 400);
      return;
    }

    const count = await prisma.resource.count({ where: { moduleId } });
    const newTopic = await prisma.resource.create({
      data: {
        moduleId,
        title,
        description: description || null,
        type: type || 'VIDEO_STREAM',
        bunnyVideoId: bunnyVideoId || null,
        videoUrl: videoUrl || null,
        content: content || null,
        durationSeconds: durationSeconds ? Number(durationSeconds) : null,
        isDownloadable: Boolean(isDownloadable),
        order: count + 1,
        status: status === 'DRAFT' ? CourseStatus.DRAFT : CourseStatus.PUBLISHED,
      },
    });

    sendSuccess(res, newTopic, 'Topic created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create topic', 500);
  }
}

export async function updateTopic(req: Request, res: Response): Promise<void> {
  try {
    const topicId = req.params.topicId as string;
    const { title, description, type, bunnyVideoId, videoUrl, content, durationSeconds, isDownloadable, status, order } = req.body;

    const existing = await prisma.resource.findUnique({ where: { id: topicId } });
    if (!existing) {
      sendError(res, 'Topic not found', 404);
      return;
    }

    const updated = await prisma.resource.update({
      where: { id: topicId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(bunnyVideoId !== undefined && { bunnyVideoId }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(content !== undefined && { content }),
        ...(durationSeconds !== undefined && { durationSeconds: Number(durationSeconds) }),
        ...(isDownloadable !== undefined && { isDownloadable: Boolean(isDownloadable) }),
        ...(status && { status }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    sendSuccess(res, updated, 'Topic updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update topic', 500);
  }
}

export async function deleteTopic(req: Request, res: Response): Promise<void> {
  try {
    const topicId = req.params.topicId as string;
    await prisma.resource.delete({ where: { id: topicId } });
    sendSuccess(res, { deleted: true }, 'Topic deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete topic', 500);
  }
}

// ==========================================
// Student Video Token & Progress Tracking
// ==========================================

export async function getVideoStreamToken(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const user = (req as any).user;
    const isAdmin = user?.role === Role.ADMIN;

    const targetModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: 'asc' },
            },
          },
        },
        resources: {
          where: { type: 'VIDEO_STREAM' },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!targetModule) {
      sendError(res, 'Module not found', 404);
      return;
    }

    // Enforce sequential gating if student
    if (!isAdmin && targetModule.order > 1) {
      const priorModules = targetModule.course.modules.filter((m) => m.order < targetModule.order);
      const priorModuleIds = priorModules.map((m) => m.id);

      const completedCount = await prisma.courseProgress.count({
        where: {
          userId: user.userId,
          moduleId: { in: priorModuleIds },
          isCompleted: true,
        },
      });

      if (completedCount < priorModules.length) {
        sendError(res, 'Module is locked. Prior modules must be completed sequentially.', 403);
        return;
      }
    }

    const videoResource = targetModule.resources[0];
    const videoId = videoResource?.bunnyVideoId || 'sample-pmct-video';

    // Generate signed Bunny DRM token valid for 2 hours
    const streamToken = generateBunnyStreamToken(videoId, 7200);

    sendSuccess(
      res,
      {
        videoId,
        streamUrl: streamToken.streamUrl,
        embedUrl: streamToken.embedUrl,
        expiresAt: streamToken.expiresAt,
        token: streamToken.token,
      },
      'Signed DRM stream token generated'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to generate video stream token', 500);
  }
}

export async function updateProgress(req: Request, res: Response): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const userId = (req as any).user.userId;
    const { lastVideoTimestamp, isCompleted } = req.body;

    const progress = await prisma.courseProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: {
        ...(lastVideoTimestamp !== undefined && { lastVideoTimestamp: Number(lastVideoTimestamp) }),
        ...(isCompleted !== undefined && {
          isCompleted: Boolean(isCompleted),
          completedAt: isCompleted ? new Date() : null,
        }),
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        moduleId,
        lastVideoTimestamp: lastVideoTimestamp ? Number(lastVideoTimestamp) : 0,
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
    });

    sendSuccess(res, progress, 'Progress updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update progress', 500);
  }
}
