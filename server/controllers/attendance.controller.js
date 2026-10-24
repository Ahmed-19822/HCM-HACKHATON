import Attendance from '../models/Attendance.model.js';
import Employee from '../models/Employee.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const parseLocalDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
};

const dayBounds = (dateValue) => {
  const start = parseLocalDate(dateValue);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const lateStatus = (now) => {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes > 9 * 60 + 15 ? 'late' : 'present';
};

// POST check-in
export const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');

    const now = new Date();
    const { start, end } = dayBounds(now);

    const existing = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });
    if (existing) throw new ApiError(409, 'Already checked in today');

    const record = await Attendance.create({
      employee: employee._id,
      date: start,
      checkIn: now,
      status: lateStatus(now),
    });

    res.status(201).json(new ApiResponse(201, 'Checked in successfully', record));
  } catch (error) {
    next(error);
  }
};

// PUT check-out
export const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');

    const { start, end } = dayBounds(new Date());

    const record = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });
    if (!record) throw new ApiError(400, 'No check-in found for today');
    if (record.checkOut) throw new ApiError(400, 'Already checked out');

    record.checkOut = new Date();
    const hours = (record.checkOut - record.checkIn) / (1000 * 60 * 60);
    if (hours < 5 && record.status !== 'absent') {
      record.status = 'half-day';
    }
    await record.save();

    res.json(new ApiResponse(200, 'Checked out successfully', record));
  } catch (error) {
    next(error);
  }
};

// POST manual attendance (HR/Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    if (!employeeId || !date) throw new ApiError(400, 'employeeId and date are required');
    const { start, end } = dayBounds(date);

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });
    if (existing) {
      Object.assign(existing, { status, notes });
      if (checkIn) existing.checkIn = new Date(checkIn);
      if (checkOut) existing.checkOut = new Date(checkOut);
      await existing.save();
      return res.json(new ApiResponse(200, 'Attendance updated', existing));
    }

    const record = await Attendance.create({
      employee: employeeId,
      date: start,
      status,
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      notes,
    });
    res.status(201).json(new ApiResponse(201, 'Attendance marked', record));
  } catch (error) {
    next(error);
  }
};

// GET attendance log (with filters)
export const getAttendance = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const filter = {};

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) throw new ApiError(404, 'Employee profile not found');
      filter.employee = employee._id;
    } else if (employeeId) {
      filter.employee = employeeId;
    }

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = dayBounds(startDate).start;
      if (endDate) filter.date.$lte = dayBounds(endDate).end;
    }

    const records = await Attendance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });
    res.json(new ApiResponse(200, 'Attendance fetched', records));
  } catch (error) {
    next(error);
  }
};

// GET today's attendance summary (Admin/HR)
export const getTodaySummary = async (req, res, next) => {
  try {
    const { start, end } = dayBounds(new Date());
    const records = await Attendance.find({ date: { $gte: start, $lte: end } })
      .populate('employee', 'firstName lastName employeeId department');
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    res.json(new ApiResponse(200, 'Today summary', {
      totalEmployees,
      present: records.filter((r) => r.status === 'present' || r.status === 'late').length,
      absent: Math.max(totalEmployees - records.length, 0),
      late: records.filter((r) => r.status === 'late').length,
      records,
    }));
  } catch (error) {
    next(error);
  }
};
