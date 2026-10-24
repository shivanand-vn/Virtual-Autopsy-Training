import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';
import courseRoutes from './course.routes.js';
import examRoutes from './exam.routes.js';
import assignmentRoutes from './assignment.routes.js';
import discussionRoutes from './discussion.routes.js';
import paymentRoutes from './payment.routes.js';
import supportRoutes from './support.routes.js';
import { verifyEmailService, sendTestEmail } from '../services/email.service.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/courses', courseRoutes);
router.use('/exams', examRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/discussions', discussionRoutes);
router.use('/payments', paymentRoutes);
router.use('/support', supportRoutes);

import { verifyRedisConnection } from '../services/redis.service.js';
import { verifyCloudinaryConnection } from '../services/cloudinary.service.js';

// Health check endpoint
router.get('/health', async (_req, res) => {
  const mailStatusPromise = verifyEmailService().catch((err) => ({
    connected: false,
    provider: 'Brevo',
    sender: env.BREVO_SENDER_EMAIL,
    accountEmail: undefined as string | undefined,
    error: err?.message || 'Check failed',
  }));

  const redisStatusPromise = verifyRedisConnection().catch((err) => ({
    connected: false,
    provider: 'Upstash Redis',
    latencyMs: undefined as number | undefined,
    error: err?.message || 'Check failed',
  }));

  const storageStatusPromise = verifyCloudinaryConnection().catch((err) => ({
    connected: false,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    error: err?.message || 'Check failed',
  }));

  const dbStart = Date.now();
  let dbStatus = 'connected';
  let dbLatencyMs = 0;
  let dbError: string | undefined = undefined;

  try {
    // 5-second race timeout for DB ping
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database ping timeout (5s)')), 5000)),
    ]);
    dbLatencyMs = Date.now() - dbStart;
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err?.message || 'Database query failed';
    dbLatencyMs = Date.now() - dbStart;
  }

  const [mailStatus, redisStatus, storageStatus] = await Promise.all([
    mailStatusPromise,
    redisStatusPromise,
    storageStatusPromise,
  ]);

  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'VAT-LMS Backend API',
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      ...(dbError ? { error: dbError } : {}),
    },
    redis: {
      status: redisStatus.connected ? 'connected' : 'error',
      provider: redisStatus.provider,
      latencyMs: redisStatus.latencyMs,
      error: redisStatus.error,
    },
    storage: {
      status: storageStatus.connected ? 'connected' : 'error',
      provider: 'Cloudinary',
      cloudName: storageStatus.cloudName,
      error: storageStatus.error,
    },
    email: {
      status: mailStatus.connected ? 'connected' : 'error',
      provider: mailStatus.provider,
      sender: mailStatus.sender,
      accountEmail: mailStatus.accountEmail,
      error: mailStatus.error,
    },
    timestamp: new Date().toISOString(),
  });
});

router.post('/health/test-email', async (req, res) => {
  try {
    const targetEmail = req.body?.email;
    const result = await sendTestEmail(targetEmail);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to dispatch test email',
    });
  }
});

export default router;
