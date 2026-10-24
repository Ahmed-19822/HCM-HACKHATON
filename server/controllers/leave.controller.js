import Leave from '../models/Leave.model.js';
import Employee from '../models/Employee.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// POST apply leave (employee)
export const applyLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');

    const { leaveType, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end < start) throw new ApiError(400, 'End date must be after start date');

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (employee.leaveBalance[leaveType] < totalDays) {
      throw new ApiError(400, Insufficient  leave balance);
    }

    const leave = await Leave.create({
      employee: employee._id, leaveType, startDate: start, endDate: end, reason, totalDays,
    });

    res.status(201).json(new ApiResponse(201, 'Leave applied successfully', leave));
  } catch (error) { next(error); }
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
    if (req.query.employeeId) filter.employee = req.query.employeeId;

    const leaves = await Leave.find(filter)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, 'Leaves fetched', leaves));
  } catch (error) { next(error); }
};

// GET single leave
export const getLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'name');
    if (!leave) throw new ApiError(404, 'Leave not found');
    res.json(new ApiResponse(200, 'Leave fetched', leave));
  } catch (error) { next(error); }
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

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approverComment = approverComment || '';
    await leave.save();

    // Deduct balance on approval
    if (status === 'approved') {
      const employee = await Employee.findById(leave.employee);
      if (employee && employee.leaveBalance[leave.leaveType] >= leave.totalDays) {
        employee.leaveBalance[leave.leaveType] -= leave.totalDays;
        await employee.save();
      }
    }

    res.json(new ApiResponse(200, Leave , leave));
  } catch (error) { next(error); }
};

// DELETE cancel leave (employee – only pending)
export const cancelLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const leave = await Leave.findOne({ _id: req.params.id, employee: employee?._id });
    if (!leave) throw new ApiError(404, 'Leave not found');
    if (leave.status !== 'pending') throw new ApiError(400, 'Cannot cancel a processed leave');
    await leave.deleteOne();
    res.json(new ApiResponse(200, 'Leave cancelled'));
  } catch (error) { next(error); }
};
