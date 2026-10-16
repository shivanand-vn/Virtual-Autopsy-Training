import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { getRedisClient, isRedisConnected } from '../services/redis.service.js';

interface AttemptRecord {
  count: number;
  lockoutUntil: number;
  firstAttemptAt: number;
}

// Security Configuration for LOGIN-030
const ACCOUNT_MAX_ATTEMPTS = 5;
const IP_MAX_ATTEMPTS = 15;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes (900 seconds)
const LOCKOUT_TTL_SEC = 15 * 60;
export const RATE_LIMIT_MESSAGE = 'Too many login attempts. Please try again after 15 minutes';

// In-memory fallback map (active if Redis is temporarily unreachable)
const loginAttempts = new Map<string, AttemptRecord>();

// Periodic memory cleanup (every 5 minutes)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (now > record.lockoutUntil && (now - record.firstAttemptAt) > LOCKOUT_DURATION_MS * 2) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

function getEmailKey(email?: string): string | null {
  if (!email || typeof email !== 'string') return null;
  const clean = email.toLowerCase().trim();
  return clean ? `email:${clean}` : null;
}

function getIpKey(req: Request): string {
  return `ip:${getClientIp(req)}`;
}

export async function checkLoginRateLimit(
  req: Request,
  email?: string
): Promise<{ isBlocked: boolean; retryAfterSeconds: number; message: string }> {
  const now = Date.now();
  const keysToCheck: { key: string; maxAttempts: number }[] = [];

  const emailKey = getEmailKey(email);
  if (emailKey) {
    keysToCheck.push({ key: emailKey, maxAttempts: ACCOUNT_MAX_ATTEMPTS });
  }
  keysToCheck.push({ key: getIpKey(req), maxAttempts: IP_MAX_ATTEMPTS });

  // 1. Check Upstash Redis for distributed lockout state
  const redis = getRedisClient();
  if (redis && isRedisConnected()) {
    try {
      for (const { key } of keysToCheck) {
        const lockoutKey = `rl:lockout:${key}`;
        const ttl = await redis.ttl(lockoutKey);
        if (ttl > 0) {
          return {
            isBlocked: true,
            retryAfterSeconds: ttl,
            message: RATE_LIMIT_MESSAGE,
          };
        }
      }
    } catch {
      // Fall through to memory check if Redis query errors
    }
  }

  // 2. Memory check (local fallback)
  for (const { key } of keysToCheck) {
    const record = loginAttempts.get(key);
    if (record && record.lockoutUntil > now) {
      const remainingSeconds = Math.max(1, Math.ceil((record.lockoutUntil - now) / 1000));
      return {
        isBlocked: true,
        retryAfterSeconds: remainingSeconds,
        message: RATE_LIMIT_MESSAGE,
      };
    }
  }

  return {
    isBlocked: false,
    retryAfterSeconds: 0,
    message: '',
  };
}

export async function recordFailedLogin(
  req: Request,
  email?: string
): Promise<{ isBlocked: boolean; retryAfterSeconds: number; message: string }> {
  const now = Date.now();
  let isNowBlocked = false;
  let maxRetrySeconds = LOCKOUT_TTL_SEC;

  const entriesToUpdate: { key: string; maxAttempts: number }[] = [];
  const emailKey = getEmailKey(email);
  if (emailKey) {
    entriesToUpdate.push({ key: emailKey, maxAttempts: ACCOUNT_MAX_ATTEMPTS });
  }
  entriesToUpdate.push({ key: getIpKey(req), maxAttempts: IP_MAX_ATTEMPTS });

  // 1. Update Upstash Redis
  const redis = getRedisClient();
  if (redis && isRedisConnected()) {
    try {
      for (const { key, maxAttempts } of entriesToUpdate) {
        const attemptKey = `rl:attempts:${key}`;
        const lockoutKey = `rl:lockout:${key}`;

        const count = await redis.incr(attemptKey);
        if (count === 1) {
          await redis.expire(attemptKey, LOCKOUT_TTL_SEC);
        }

        if (count >= maxAttempts) {
          await redis.set(lockoutKey, '1', 'EX', LOCKOUT_TTL_SEC);
          isNowBlocked = true;
          maxRetrySeconds = LOCKOUT_TTL_SEC;
        }
      }
    } catch (err: any) {
      console.warn('[RateLimit Redis] Failed to record in Redis, updating memory fallback:', err.message);
    }
  }

  // 2. Update local in-memory fallback
  for (const { key, maxAttempts } of entriesToUpdate) {
    let record = loginAttempts.get(key);
    if (!record || (now > record.lockoutUntil && (now - record.firstAttemptAt) > LOCKOUT_DURATION_MS)) {
      record = {
        count: 1,
        lockoutUntil: 0,
        firstAttemptAt: now,
      };
    } else {
      record.count += 1;
    }

    if (record.count >= maxAttempts) {
      record.lockoutUntil = now + LOCKOUT_DURATION_MS;
      isNowBlocked = true;
    }

    loginAttempts.set(key, record);
  }

  if (isNowBlocked) {
    return {
      isBlocked: true,
      retryAfterSeconds: maxRetrySeconds,
      message: RATE_LIMIT_MESSAGE,
    };
  }

  return {
    isBlocked: false,
    retryAfterSeconds: 0,
    message: '',
  };
}

export async function resetLoginRateLimit(req: Request, email?: string): Promise<void> {
  const emailKey = getEmailKey(email);
  const ipKey = getIpKey(req);

  // 1. Reset in Redis
  const redis = getRedisClient();
  if (redis && isRedisConnected()) {
    try {
      const keysToDel: string[] = [];
      if (emailKey) {
        keysToDel.push(`rl:attempts:${emailKey}`, `rl:lockout:${emailKey}`);
      }
      keysToDel.push(`rl:attempts:${ipKey}`, `rl:lockout:${ipKey}`);
      await redis.del(...keysToDel);
    } catch {
      // Ignore Redis del failure
    }
  }

  // 2. Reset in memory
  if (emailKey) {
    loginAttempts.delete(emailKey);
  }
  loginAttempts.delete(ipKey);
}

/**
 * Express middleware to enforce login rate limiting prior to authentication processing
 */
export async function loginRateLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const email = req.body?.email;
  const status = await checkLoginRateLimit(req, email);

  if (status.isBlocked) {
    res.setHeader('Retry-After', status.retryAfterSeconds);
    sendError(res, status.message, 429, { retryAfter: status.retryAfterSeconds });
    return;
  }

  next();
}
