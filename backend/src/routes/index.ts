import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';
import courseRoutes from './course.routes.js';
import examRoutes from './exam.routes.js';
import assignmentRoutes from './assignment.routes.js';
import discussionRoutes from './discussion.routes.js';
import paymentRoutes from './payment.routes.js';
import { verifyEmailService, sendTestEmail } from '../services/email.service.js';
import { env } from '../config/env.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/courses', courseRoutes);
router.use('/exams', examRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/discussions', discussionRoutes);
router.use('/payments', paymentRoutes);

// Health check endpoint
router.get('/health', async (_req, res) => {
  const mailStatus = await verifyEmailService().catch((err) => ({
    connected: false,
    provider: 'Brevo',
    sender: env.BREVO_SENDER_EMAIL,
    accountEmail: undefined as string | undefined,
    error: err?.message || 'Check failed',
  }));

  res.status(200).json({
    status: 'ok',
    service: 'VAT-LMS Backend API',
    database: 'connected',
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
