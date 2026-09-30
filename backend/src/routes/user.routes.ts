import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// All user management routes require authenticated admin access
router.use(requireAuth, requireRole('ADMIN'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
