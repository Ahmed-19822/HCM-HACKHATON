import express from 'express';
import {
  getDepartments, getDepartment,
  createDepartment, updateDepartment, deleteDepartment,
} from '../controllers/department.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('admin', 'hr'), createDepartment);

router.route('/:id')
  .get(protect, getDepartment)
  .put(protect, authorize('admin', 'hr'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

export default router;
