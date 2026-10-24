import Payroll from '../models/Payroll.model.js';
import Employee from '../models/Employee.model.js';
import Attendance from '../models/Attendance.model.js';
import Leave from '../models/Leave.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// POST generate payroll
export const generatePayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year, workingDays, bonuses = 0, deductions = 0 } = req.body;
    const monthNum = Number(month);
    const yearNum = Number(year);
    const days = Number(workingDays);

    if (!employeeId || !monthNum || !yearNum || !days) {
      throw new ApiError(400, 'employeeId, month, year and workingDays are required');
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new ApiError(404, 'Employee not found');

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['present', 'late'] },
    });

    const approvedLeaves = await Leave.find({
      employee: employeeId,
      status: 'approved',
      leaveType: 'annual',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    const leaveDays = approvedLeaves.reduce((sum, l) => sum + (l.totalDays || 0), 0);
    const presentDays = Math.min(attendance.length + leaveDays, days);
    const unpaidLeaveDays = Math.max(days - presentDays, 0);

    const payroll = await Payroll.create({
      employee: employeeId,
      month: monthNum,
      year: yearNum,
      basicSalary: employee.salary,
      workingDays: days,
      presentDays,
      leaveDays,
      unpaidLeaveDays,
      bonuses: Number(bonuses) || 0,
      deductions: Number(deductions) || 0,
      generatedBy: req.user._id,
    });

    const populated = await payroll.populate('employee', 'firstName lastName employeeId designation');
    res.status(201).json(new ApiResponse(201, 'Payroll generated', populated));
  } catch (error) {
    next(error);
  }
};

// GET payrolls (own or all)
export const getPayrolls = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) throw new ApiError(404, 'Employee not found');
      filter.employee = employee._id;
    } else if (req.query.employeeId) {
      filter.employee = req.query.employeeId;
    }
    if (req.query.month) filter.month = Number(req.query.month);
    if (req.query.year) filter.year = Number(req.query.year);

    const payrolls = await Payroll.find(filter)
      .populate('employee', 'firstName lastName employeeId designation')
      .populate('generatedBy', 'name')
      .sort({ year: -1, month: -1 });

    res.json(new ApiResponse(200, 'Payrolls fetched', payrolls));
  } catch (error) {
    next(error);
  }
};

// GET single payslip
export const getPayslip = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId designation department salary user')
      .populate('generatedBy', 'name');
    if (!payroll) throw new ApiError(404, 'Payroll not found');

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee || String(payroll.employee._id) !== String(employee._id)) {
        throw new ApiError(403, 'Not authorized to view this payslip');
      }
    }

    res.json(new ApiResponse(200, 'Payslip fetched', payroll));
  } catch (error) {
    next(error);
  }
};

// PUT mark as paid
export const markAsPaid = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    );
    if (!payroll) throw new ApiError(404, 'Payroll not found');
    res.json(new ApiResponse(200, 'Payroll marked as paid', payroll));
  } catch (error) {
    next(error);
  }
};
