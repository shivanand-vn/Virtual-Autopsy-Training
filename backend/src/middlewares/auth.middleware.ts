import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

export interface AuthRequest extends Request {
  user?: TokenPayload & { fullName: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // Check HTTP-only cookie first, then Bearer header
  const token = req.cookies?.vat_auth_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    sendError(res, 'Authentication required. Please log in.', 401);
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    sendError(res, 'Invalid or expired session. Please log in again.', 401);
    return;
  }

  // Verify user still exists in database and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, fullName: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    sendError(res, 'User account is inactive or not found.', 403);
    return;
  }

  req.user = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };

  next();
}

export function requireRole(...allowedRoles: Array<'ADMIN' | 'STUDENT' | 'PENDING_APPROVAL'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Access denied. You do not have permission to perform this action.', 403);
      return;
    }

    next();
  };
}
