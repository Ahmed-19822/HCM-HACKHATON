import Employee from '../models/Employee.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// GET all employees (with filters)
export const getEmployees = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status)     filter.status     = status;
    if (search) {
      filter[''] = [
        { firstName: { '': search, '': 'i' } },
        { lastName:  { '': search, '': 'i' } },
        { employeeId: { '': search, '': 'i' } },
      ];
    }
    const employees = await Employee.find(filter)
      .populate('department', 'name')
      .populate('user', 'email role');
    res.json(new ApiResponse(200, 'Employees fetched', employees));
  } catch (error) { next(error); }
};

// GET single employee
export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('user', 'email role');
    if (!employee) throw new ApiError(404, 'Employee not found');
    res.json(new ApiResponse(200, 'Employee fetched', employee));
  } catch (error) { next(error); }
};

// POST create employee + user account
export const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId, firstName, lastName, email, phone, address,
      designation, department, dateOfJoining, salary,
      userPassword, userRole,
    } = req.body;

    // Create linked user account
    const userExists = await User.findOne({ email });
    if (userExists) throw new ApiError(400, 'Email already registered');

    const user = await User.create({
      name: ${firstName} ,
      email,
      password: userPassword || 'HCM@1234',
      role: userRole || 'employee',
    });

    const employee = await Employee.create({
      employeeId, firstName, lastName, email, phone, address,
      designation, department, dateOfJoining, salary,
      avatar: req.file ? req.file.path : '',
      user: user._id,
    });

    // Link user to employee
    user.employee = employee._id;
    await user.save({ validateBeforeSave: false });

    res.status(201).json(new ApiResponse(201, 'Employee created', employee));
  } catch (error) { next(error); }
};

// PUT update employee
export const updateEmployee = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.avatar = req.file.path;

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });
    if (!employee) throw new ApiError(404, 'Employee not found');
    res.json(new ApiResponse(200, 'Employee updated', employee));
  } catch (error) { next(error); }
};

// DELETE (soft delete – change status)
export const deactivateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status || 'terminated' },
      { new: true }
    );
    if (!employee) throw new ApiError(404, 'Employee not found');

    // Deactivate linked user
    if (employee.user) await User.findByIdAndUpdate(employee.user, { isActive: false });

    res.json(new ApiResponse(200, 'Employee deactivated', employee));
  } catch (error) { next(error); }
};
