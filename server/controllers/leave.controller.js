import Leave from '../models/Leave.model.js';
import Employee from '../models/Employee.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const workingDaysBetween = (start, end) => {
  let days = 0;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

// POST apply leave (employee)
export const applyLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');

    const { leaveType, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new ApiError(400, 'Invalid leave dates');
    }
    if (end < start) throw new ApiError(400, 'End date must be after start date');

    const totalDays = workingDaysBetween(start, end);
    if (totalDays < 1) throw new ApiError(400, 'Leave must include at least one working day');

    if ((employee.leaveBalance?.[leaveType] ?? 0) < totalDays) {
      throw new ApiError(400, `Insufficient ${leaveType} leave balance`);
    }

    const overlap = await Leave.findOne({
      employee: employee._id,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlap) throw new ApiError(400, 'Leave overlaps with an existing request');

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      totalDays,
    });

    res.status(201).json(new ApiResponse(201, 'Leave applied successfully', leave));
  } catch (error) {
    next(error);
  }
};

// GET all leaves (admin/hr) or own leaves (employee)
export const getLeaves = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) throw new ApiError(404, 'Employee not found');
      filter.employee = employee._id;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.employeeId && req.user.role !== 'employee') {
      filter.employee = req.query.employeeId;
    }

    const leaves = await Leave.find(filter)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, 'Leaves fetched', leaves));
  } catch (error) {
    next(error);
  }
};

// GET single leave
export const getLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId user')
      .populate('approvedBy', 'name');
    if (!leave) throw new ApiError(404, 'Leave not found');

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee || String(leave.employee._id) !== String(employee._id)) {
        throw new ApiError(403, 'Not authorized to view this leave');
      }
    }

    res.json(new ApiResponse(200, 'Leave fetched', leave));
  } catch (error) {
    next(error);
  }
};

// PUT approve/reject leave (admin/hr)
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, approverComment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Status must be approved or rejected');
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) throw new ApiError(404, 'Leave not found');
    if (leave.status !== 'pending') throw new ApiError(400, 'Leave already processed');

    if (status === 'approved') {
      const employee = await Employee.findById(leave.employee);
      if (!employee) throw new ApiError(404, 'Employee not found');
      if ((employee.leaveBalance?.[leave.leaveType] ?? 0) < leave.totalDays) {
        throw new ApiError(400, `Insufficient ${leave.leaveType} leave balance`);
      }
      employee.leaveBalance[leave.leaveType] -= leave.totalDays;
      await employee.save();
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approverComment = approverComment || '';
    await leave.save();

    res.json(new ApiResponse(200, `Leave ${status}`, leave));
  } catch (error) {
    next(error);
  }
};

// DELETE cancel leave (employee ? only pending)
export const cancelLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const leave = await Leave.findOne({ _id: req.params.id, employee: employee?._id });
    if (!leave) throw new ApiError(404, 'Leave not found');
    if (leave.status !== 'pending') throw new ApiError(400, 'Cannot cancel a processed leave');
    await leave.deleteOne();
    res.json(new ApiResponse(200, 'Leave cancelled'));
  } catch (error) {
    next(error);
  }
};
