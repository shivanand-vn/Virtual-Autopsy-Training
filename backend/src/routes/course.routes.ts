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
  updateProgress,
} from '../controllers/course.controller.js';

const router = Router();

// Public / Learner Course Access
router.get('/', optionalAuth, getAllCourses);
router.get('/:id', optionalAuth, getCourseById);

// Admin Course CRUD
router.post('/', requireAuth, requireRole('ADMIN'), createCourse);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateCourse);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteCourse);

// Admin Module CRUD
router.post('/:courseId/modules', requireAuth, requireRole('ADMIN'), createModule);
router.put('/modules/:moduleId', requireAuth, requireRole('ADMIN'), updateModule);
router.delete('/modules/:moduleId', requireAuth, requireRole('ADMIN'), deleteModule);

// Admin Topic / Resource CRUD
router.post('/modules/:moduleId/topics', requireAuth, requireRole('ADMIN'), createTopic);
router.put('/topics/:topicId', requireAuth, requireRole('ADMIN'), updateTopic);
router.delete('/topics/:topicId', requireAuth, requireRole('ADMIN'), deleteTopic);

// Student Protected Streaming & Progress Tracking
router.get('/modules/:moduleId/video-token', requireAuth, getVideoStreamToken);
router.post('/modules/:moduleId/progress', requireAuth, updateProgress);

export default router;
