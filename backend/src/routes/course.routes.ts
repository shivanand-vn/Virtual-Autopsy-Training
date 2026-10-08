import { Router } from 'express';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth.middleware.js';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createTopic,
  updateTopic,
  deleteTopic,
  getVideoStreamToken,
  getVideoStreamTokenByVideoId,
  updateProgress,
  uploadCourseMediaHandler,
  deleteCourseMediaHandler,
} from '../controllers/course.controller.js';
import { uploadCourseMedia } from '../middlewares/upload.middleware.js';

const router = Router();

// Public / Learner Course Access
router.get('/', optionalAuth, getAllCourses);
router.get('/:id', optionalAuth, getCourseById);
router.get('/stream-token/:videoId', requireAuth, getVideoStreamTokenByVideoId);

// Admin Course CRUD
router.post('/', requireAuth, requireRole('ADMIN'), createCourse);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateCourse);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteCourse);

// Admin Module CRUD
router.post('/:courseId/modules', requireAuth, requireRole('ADMIN'), createModule);
router.put('/modules/:moduleId', requireAuth, requireRole('ADMIN'), updateModule);
router.delete('/modules/:moduleId', requireAuth, requireRole('ADMIN'), deleteModule);

// Admin Topic / Resource CRUD
router.post('/upload-media', requireAuth, requireRole('ADMIN'), uploadCourseMedia.single('file'), uploadCourseMediaHandler);
router.post('/delete-media', requireAuth, requireRole('ADMIN'), deleteCourseMediaHandler);
router.delete('/delete-media', requireAuth, requireRole('ADMIN'), deleteCourseMediaHandler);
router.post('/modules/:moduleId/topics', requireAuth, requireRole('ADMIN'), createTopic);
router.put('/topics/:topicId', requireAuth, requireRole('ADMIN'), updateTopic);
router.delete('/topics/:topicId', requireAuth, requireRole('ADMIN'), deleteTopic);

// Student Protected Streaming & Progress Tracking
router.get('/modules/:moduleId/video-token', requireAuth, getVideoStreamToken);
router.post('/modules/:moduleId/progress', requireAuth, updateProgress);

export default router;
