import { Router } from 'express';
import {
  createSupportIssue,
  getSupportIssues,
  resolveSupportIssue,
  deleteSupportIssue,
} from '../controllers/support.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Student: Submit a support issue (any authenticated user)
router.post('/issues', requireAuth, createSupportIssue);

// Admin: Fetch all support issues
router.get('/issues', requireAuth, requireRole('ADMIN'), getSupportIssues);

// Admin: Resolve a support issue
router.patch('/issues/:id/resolve', requireAuth, requireRole('ADMIN'), resolveSupportIssue);

// Admin: Delete a resolved support issue
router.delete('/issues/:id', requireAuth, requireRole('ADMIN'), deleteSupportIssue);

export default router;
