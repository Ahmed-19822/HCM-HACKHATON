import Attendance from '../models/Attendance.model.js';
import Employee from '../models/Employee.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Helper: get start/end of day
const dayBounds = (dateStr) => {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// POST check-in
export const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');

    const today = new Date();
    const { start, end } = dayBounds(today.toDateString());

    const existing = await Attendance.findOne({ employee: employee._id, date: { '': start, '': end } });
    if (existing) throw new ApiError(400, 'Already checked in today');

    const now = new Date();
    const hour = now.getHours();
    const status = hour >= 9 && (hour < 9 || (hour === 9 && now.getMinutes() > 15)) ? 'late' : 'present';

    const record = await Attendance.create({
      employee: employee._id,
      date: now,
      checkIn: now,
      status: hour > 9 || (hour === 9 && now.getMinutes() > 15) ? 'late' : 'present',
    });

    res.status(201).json(new ApiResponse(201, 'Checked in successfully', record));
  } catch (error) { next(error); }
};

// PUT check-out
export const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');

    const today = new Date();
    const { start, end } = dayBounds(today.toDateString());

    const record = await Attendance.findOne({ employee: employee._id, date: { '': start, '': end } });
    if (!record) throw new ApiError(400, 'No check-in found for today');
    if (record.checkOut) throw new ApiError(400, 'Already checked out');

    record.checkOut = new Date();
    await record.save();

    res.json(new ApiResponse(200, 'Checked out successfully', record));
  } catch (error) { next(error); }
};

// POST manual attendance (HR/Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    const { start, end } = dayBounds(date);

    const existing = await Attendance.findOne({ employee: employeeId, date: { '': start, '': end } });
    if (existing) {
      Object.assign(existing, { status, checkIn, checkOut, notes });
      await existing.save();
      return res.json(new ApiResponse(200, 'Attendance updated', existing));
    }

    const record = await Attendance.create({
      employee: employeeId, date: new Date(date), status, checkIn, checkOut, notes,
    });
    res.status(201).json(new ApiResponse(201, 'Attendance marked', record));
  } catch (error) { next(error); }
};

// GET attendance log (with filters)
export const getAttendance = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (status)     filter.status   = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date[''] = new Date(startDate);
      if (endDate)   filter.date[''] = new Date(endDate);
    }
    const records = await Attendance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });
    res.json(new ApiResponse(200, 'Attendance fetched', records));
  } catch (error) { next(error); }
};

// GET today's attendance summary (Admin/HR)
export const getTodaySummary = async (req, res, next) => {
  try {
    const { start, end } = dayBounds(new Date().toDateString());
    const records = await Attendance.find({ date: { '': start, '': end } })
      .populate('employee', 'firstName lastName employeeId department');
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    res.json(new ApiResponse(200, 'Today summary', {
      totalEmployees,
      present: records.filter(r => r.status === 'present' || r.status === 'late').length,
      absent:  totalEmployees - records.length,
      late:    records.filter(r => r.status === 'late').length,
      records,
    }));
  } catch (error) { next(error); }
};
