import { Router } from 'express';
import {
  completeRegistrationAndPayment,
  getAdminPayments,
  getPaymentReceipt,
} from '../controllers/payment.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public: Process tuition payment and complete candidate enrollment
router.post('/complete-registration', completeRegistrationAndPayment);

// Public: View single receipt details by transaction reference
router.get('/receipt/:transactionRef', getPaymentReceipt);

// Protected: Admin view of all financial transactions and revenue
router.get('/admin', requireAuth, requireRole('ADMIN'), getAdminPayments);
router.get('/', requireAuth, requireRole('ADMIN'), getAdminPayments);

export default router;
