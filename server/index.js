import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/error.middleware.js';

// Routes
import authRoutes       from './routes/auth.routes.js';
import departmentRoutes from './routes/department.routes.js';
import employeeRoutes   from './routes/employee.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes      from './routes/leave.routes.js';
import payrollRoutes    from './routes/payroll.routes.js';
import dashboardRoutes  from './routes/dashboard.routes.js';

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// -- Middlewares -------------------------------------------------------
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// -- API Routes --------------------------------------------------------
app.use('/api/auth',        authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees',   employeeRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/leaves',      leaveRoutes);
app.use('/api/payroll',     payrollRoutes);
app.use('/api/dashboard',   dashboardRoutes);

// -- Health check ------------------------------------------------------
app.get('/', (req, res) => res.json({ message: 'HCM Lite API is running' }));

// -- 404 handler -------------------------------------------------------
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// -- Global error handler ----------------------------------------------
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(Server running on port  in  mode));
