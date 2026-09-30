import { Router } from 'express';
import {
  login,
  logout,
  getCurrentUser,
  changePassword,
  uploadAvatar,
  removeAvatar,
  updateProfile,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadAvatarImage } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);
router.post('/change-password', requireAuth, changePassword);

// Profile & Avatar management
router.put('/profile', requireAuth, updateProfile);
router.patch('/profile', requireAuth, updateProfile);
router.post('/avatar', requireAuth, uploadAvatarImage.single('avatar'), uploadAvatar);
router.delete('/avatar', requireAuth, removeAvatar);

export default router;
