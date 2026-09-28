import { Router } from 'express';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.middleware.js';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  startExamAttempt,
  submitExamAttempt,
  verifyCertificate,
} from '../controllers/exam.controller.js';

const router = Router();

// Public / Learner Exams
router.get('/', optionalAuth, getAllExams);
router.get('/:id', optionalAuth, getExamById);

// Public Certificate Verification
router.get('/certificates/verify/:code', verifyCertificate);

// Admin Exam Management
router.post('/', requireAuth, requireRole('ADMIN'), createExam);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateExam);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteExam);

// Student Exam Execution
router.post('/:id/start', requireAuth, startExamAttempt);
router.post('/attempts/:attemptId/submit', requireAuth, submitExamAttempt);

export default router;
