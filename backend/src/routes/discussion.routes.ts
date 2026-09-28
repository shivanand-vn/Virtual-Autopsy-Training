import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  replyDiscussion,
  toggleResolved,
} from '../controllers/discussion.controller.js';

const router = Router();

router.get('/', requireAuth, getDiscussions);
router.get('/:id', requireAuth, getDiscussionById);
router.post('/', requireAuth, createDiscussion);
router.post('/:id/replies', requireAuth, replyDiscussion);
router.patch('/:id/resolve', requireAuth, toggleResolved);

export default router;
