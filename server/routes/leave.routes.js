import express from 'express';
import {
  applyLeave, getLeaves, getLeave, updateLeaveStatus, cancelLeave,
} from '../controllers/leave.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getLeaves)
  .post(protect, applyLeave);

router.route('/:id')
  .get(protect, getLeave)
  .put(protect, authorize('admin', 'hr'), updateLeaveStatus)
  .delete(protect, cancelLeave);

export default router;
