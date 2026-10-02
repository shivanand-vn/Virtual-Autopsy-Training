import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

/**
 * GET /api/users
 * Returns list of all registered users with their eligibility application & metadata
 */
export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, role, status } = req.query as {
      search?: string;
      role?: string;
      status?: string;
    };

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      if (role.toUpperCase() === 'STUDENT') {
        where.role = 'STUDENT';
      } else if (role.toUpperCase() === 'ADMIN') {
        where.role = 'ADMIN';
      }
    } else {
      // Do not display Admins in the user management section
      where.role = { not: 'ADMIN' };
    }

    if (status && status !== 'all') {
      if (status.toLowerCase() === 'active') {
        where.isActive = true;
      } else if (status.toLowerCase() === 'suspended') {
        where.isActive = false;
      }
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        title: true,
        organization: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        application: {
          select: {
            id: true,
            qualification: true,
            professionalRole: true,
            organization: true,
            countryCode: true,
            cvFileUrl: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            courseProgress: true,
            submissions: true,
            certificates: true,
          },
        },
      },
    });

    sendSuccess(res, 'Users retrieved successfully', { users });
  } catch (error: any) {
    console.error('[getAllUsers] Error retrieving users:', error);
    sendError(res, 'Failed to retrieve users', 500);
  }
}

/**
 * GET /api/users/:id
 * Returns single user details by ID
 */
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        title: true,
        organization: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        application: true,
        courseProgress: {
          select: {
            id: true,
            moduleId: true,
            isCompleted: true,
            completedAt: true,
          },
        },
        certificates: true,
        submissions: {
          take: 10,
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, 'User details retrieved', { user });
  } catch (error: any) {
    console.error('[getUserById] Error retrieving user:', error);
    sendError(res, 'Failed to retrieve user', 500);
  }
}

/**
 * PATCH /api/users/:id/status
 * Toggle user active/suspended status
 */
export async function updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { isActive, status } = req.body;

    const nextIsActive = typeof isActive === 'boolean'
      ? isActive
      : status === 'active';

    // Prevent admin from locking themselves out
    if (req.user?.userId === id && !nextIsActive) {
      sendError(res, 'You cannot suspend your own administrator account.', 400);
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      sendError(res, 'User not found', 404);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: nextIsActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    sendSuccess(
      res,
      `User account ${nextIsActive ? 'activated' : 'suspended'} successfully`,
      { user: updatedUser }
    );
  } catch (error: any) {
    console.error('[updateUserStatus] Error updating status:', error);
    sendError(res, 'Failed to update user status', 500);
  }
}

/**
 * DELETE /api/users/:id
 * Delete or deactivate a user
 */
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);

    if (req.user?.userId === id) {
      sendError(res, 'You cannot delete your own administrator account.', 400);
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Unlink any application reference first to avoid foreign key violation
    await prisma.application.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    await prisma.user.delete({ where: { id } });

    sendSuccess(res, 'User deleted successfully', { id });
  } catch (error: any) {
    console.error('[deleteUser] Error deleting user:', error);
    sendError(res, 'Failed to delete user', 500);
  }
}
