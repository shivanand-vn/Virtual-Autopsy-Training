import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { uploadFileOrImage } from '../middlewares/upload.middleware.js';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  getAllSubmissions,
  gradeSubmission,
  getModuleAssignment,
  upsertModuleAssignment,
} from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', requireAuth, getAssignments);
router.get('/submissions', requireAuth, getAllSubmissions);
router.post('/', requireAuth, requireRole('ADMIN'), createAssignment);
router.get('/module/:moduleId', getModuleAssignment);
router.put('/module/:moduleId', requireAuth, requireRole('ADMIN'), upsertModuleAssignment);
router.post('/module/:moduleId', requireAuth, requireRole('ADMIN'), upsertModuleAssignment);
router.post('/:assignmentId/submit', requireAuth, uploadFileOrImage.single('file'), submitAssignment);
router.put('/submissions/:submissionId/grade', requireAuth, requireRole('ADMIN'), gradeSubmission);

export default router;
