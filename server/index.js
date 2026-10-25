import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import seedAdmin from './utils/seedAdmin.js';
import errorHandler from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import departmentRoutes from './routes/department.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveUploadDir = () => {
  if (process.env.VERCEL) {
    return '/tmp/uploads';
  }

  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.cwd(), process.env.UPLOAD_DIR);
  }

  return path.resolve(process.cwd(), 'uploads');
};

const normalizeOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [
  ...normalizeOrigins(process.env.CLIENT_URL),
  ...normalizeOrigins(process.env.CLIENT_URLS),
  ...normalizeOrigins(process.env.FRONTEND_URL),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
].filter(Boolean);

const isLocalOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch {
    return false;
  }
};

const isAllowedVercelOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'https:') return false;
    return hostname.endsWith('.vercel.app') || hostname === 'vercel.app';
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      isLocalOrigin(origin) ||
      isAllowedVercelOrigin(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(resolveUploadDir()));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.json({ message: 'HCM Lite API is running' }));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const isVercel = Boolean(process.env.VERCEL);

const start = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set. Add it to server/.env before starting.');
    process.exit(1);
  }

  await connectDB();
  await seedAdmin();

  if (!isVercel) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }
};

if (!isVercel) {
  start().catch((err) => {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
} else {
  start().catch((err) => {
    console.error(`Failed to initialize serverless app: ${err.message}`);
  });
}

export default app;
