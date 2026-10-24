import express from 'express';
import {
  checkIn, checkOut, markAttendance, getAttendance, getTodaySummary,
} from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/checkin',  protect, checkIn);
router.put('/checkout',  protect, checkOut);
router.post('/mark',     protect, authorize('admin', 'hr'), markAttendance);
router.get('/today',     protect, authorize('admin', 'hr'), getTodaySummary);
router.get('/',          protect, getAttendance);

export default router;
