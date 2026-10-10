import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { uploadFileOrImage } from '../middlewares/upload.middleware.js';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  submitAssignment,
  getAllSubmissions,
  gradeSubmission,
  getModuleAssignment,
  upsertModuleAssignment,
} from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', requireAuth, getAssignments);
router.get('/submissions', requireAuth, getAllSubmissions);
router.get('/module/:moduleId', getModuleAssignment);
router.put('/module/:moduleId', requireAuth, requireRole('ADMIN'), upsertModuleAssignment);
router.post('/module/:moduleId', requireAuth, requireRole('ADMIN'), upsertModuleAssignment);
router.get('/:id', requireAuth, getAssignmentById);
router.post('/', requireAuth, requireRole('ADMIN'), createAssignment);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateAssignment);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteAssignment);
router.patch('/:id/status', requireAuth, requireRole('ADMIN'), updateAssignmentStatus);
router.post('/:assignmentId/submit', requireAuth, uploadFileOrImage.single('file'), submitAssignment);
router.put('/submissions/:submissionId/grade', requireAuth, requireRole('ADMIN'), gradeSubmission);

export default router;
