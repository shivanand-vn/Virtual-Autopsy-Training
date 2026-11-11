import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  user?: TokenPayload & { fullName: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const headerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const cookieToken = req.cookies?.vat_auth_token;
  const queryToken = typeof req.query?.token === 'string' ? req.query.token : undefined;

  let token = headerToken || cookieToken || queryToken;

  if (!token) {
    sendError(res, 'Authentication required. Please log in.', 401);
    return;
  }

  let payload = verifyToken(token);
  // If the primary token candidate failed (e.g. stale cookie vs fresh header), try the alternative token
  if (!payload && headerToken && cookieToken) {
    const alternativeToken = headerToken === token ? cookieToken : headerToken;
    payload = verifyToken(alternativeToken);
    if (payload) {
      token = alternativeToken;
    }
  }

  if (!payload) {
    sendError(res, 'Invalid or expired session. Please log in again.', 401);
    return;
  }

  try {
    // Verify user still exists in database and is active, and check tokenVersion for session revocation (LOGIN-036)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, fullName: true, role: true, isActive: true, tokenVersion: true },
    });

    if (!user || !user.isActive) {
      sendError(res, 'User account is inactive or not found.', 403);
      return;
    }

    // Token revocation check: if user's tokenVersion was incremented (e.g. via password reset/change),
    // any session issued with an older tokenVersion is immediately revoked.
    const userVersion = (user as any).tokenVersion ?? 0;
    const tokenVersion = typeof payload.tokenVersion === 'number' ? payload.tokenVersion : 0;

    if (tokenVersion !== userVersion) {
      res.clearCookie('vat_auth_token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      sendError(res, 'Session has expired due to a password change or reset. Please log in again.', 401);
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tokenVersion: userVersion,
    };

    next();
  } catch (dbErr: any) {
    console.warn('[requireAuth] Database check error:', dbErr?.message || dbErr);
    // If JWT is cryptographically verified, fallback to token identity during transient DB hiccups
    if (payload.userId && payload.role) {
      req.user = {
        userId: payload.userId,
        email: payload.email,
        fullName: payload.email,
        role: payload.role,
        tokenVersion: payload.tokenVersion,
      };
      return next();
    }
    sendError(res, 'Database temporarily unreachable during authentication. Please retry.', 503);
  }
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

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.vat_auth_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, fullName: true, role: true, isActive: true, tokenVersion: true },
          });
          const userVersion = (user as any)?.tokenVersion ?? 0;
          const tokenVersion = typeof payload.tokenVersion === 'number' ? payload.tokenVersion : 0;

          if (user && user.isActive && userVersion === tokenVersion) {
            req.user = {
              userId: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
              tokenVersion: userVersion,
            };
          }
        } catch (dbErr: any) {
          // Gracefully fallback to verified token claims if DB query encounters connection latency
          console.warn('[optionalAuth] DB query bypassed, falling back to verified token:', dbErr?.message || dbErr);
          req.user = {
            userId: payload.userId,
            email: payload.email,
            fullName: payload.email,
            role: payload.role,
            tokenVersion: payload.tokenVersion,
          };
        }
      }
    }
  } catch (err: any) {
    console.warn('[optionalAuth] Unexpected error in optional auth middleware:', err?.message || err);
  }

  next();
}
