import express from 'express';
import { register, login, getMe, changePassword } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateLogin, validateRegister } from '../validator/auth.validator.js';

const router = express.Router();

router.post('/register', protect, authorize('admin'), validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;
