import express from 'express';
import {
  generatePayroll, getPayrolls, getPayslip, markAsPaid,
} from '../controllers/payroll.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPayrolls)
  .post(protect, authorize('admin', 'hr'), generatePayroll);

router.get('/:id',           protect, getPayslip);
router.put('/:id/mark-paid', protect, authorize('admin'), markAsPaid);

export default router;
