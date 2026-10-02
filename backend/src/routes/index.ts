import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';
import courseRoutes from './course.routes.js';
import examRoutes from './exam.routes.js';
import assignmentRoutes from './assignment.routes.js';
import discussionRoutes from './discussion.routes.js';
import paymentRoutes from './payment.routes.js';

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
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'VAT-LMS Backend API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
