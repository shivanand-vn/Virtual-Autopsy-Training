import { Router } from 'express';
import authRoutes from './auth.routes.js';
import applicationRoutes from './application.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'VAT-LMS Backend API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
