import express from 'express';
import {
  getEmployees, getEmployee, createEmployee,
  updateEmployee, deactivateEmployee,
} from '../controllers/employee.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { validateEmployee } from '../validator/employee.validator.js';

const router = express.Router();

router.route('/')
  .get(protect, getEmployees)
  .post(protect, authorize('admin', 'hr'), upload.single('avatar'), validateEmployee, createEmployee);

router.route('/:id')
  .get(protect, getEmployee)
  .put(protect, authorize('admin', 'hr'), upload.single('avatar'), updateEmployee)
  .delete(protect, authorize('admin', 'hr'), deactivateEmployee);

export default router;
