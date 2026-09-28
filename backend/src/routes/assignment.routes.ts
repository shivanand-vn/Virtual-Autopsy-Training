import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { uploadFileOrImage } from '../middlewares/upload.middleware.js';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', requireAuth, getAssignments);
router.post('/', requireAuth, requireRole('ADMIN'), createAssignment);
router.post('/:assignmentId/submit', requireAuth, uploadFileOrImage.single('file'), submitAssignment);
router.put('/submissions/:submissionId/grade', requireAuth, requireRole('ADMIN'), gradeSubmission);

export default router;
