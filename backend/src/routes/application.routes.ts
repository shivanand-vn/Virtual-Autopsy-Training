import { Router } from 'express';
import {
  submitApplication,
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  getApplicationCv,
} from '../controllers/application.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { uploadCV } from '../middlewares/upload.middleware.js';

const router = Router();

// Public: Student registers eligibility application with CV PDF upload
router.post('/submit', uploadCV.single('cvFile'), submitApplication);

// Admin Protected Routes
router.get('/admin', requireAuth, requireRole('ADMIN'), getApplications);
router.get('/admin/:id', requireAuth, requireRole('ADMIN'), getApplicationById);
router.get('/admin/:id/cv', requireAuth, requireRole('ADMIN'), getApplicationCv);
router.get('/:id/cv', requireAuth, requireRole('ADMIN'), getApplicationCv);
router.post('/admin/:id/approve', requireAuth, requireRole('ADMIN'), approveApplication);
router.post('/admin/:id/reject', requireAuth, requireRole('ADMIN'), rejectApplication);

export default router;
