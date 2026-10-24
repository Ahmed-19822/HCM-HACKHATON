import Employee from '../models/Employee.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const avatarPath = (file) => (file ? `/uploads/${file.filename}` : '');

const employeeSelect = (role) =>
  role === 'employee' ? '-salary' : '';

// GET all employees (with filters)
export const getEmployees = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { firstName: rx },
        { lastName: rx },
        { employeeId: rx },
        { email: rx },
      ];
    }

    const employees = await Employee.find(filter)
      .select(employeeSelect(req.user.role))
      .populate('department', 'name')
      .populate('user', 'email role')
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, 'Employees fetched', employees));
  } catch (error) {
    next(error);
  }
};

// GET single employee
export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select(employeeSelect(req.user.role))
      .populate('department', 'name')
      .populate('user', 'email role');
    if (!employee) throw new ApiError(404, 'Employee not found');

    if (req.user.role === 'employee' && String(employee.user?._id || employee.user) !== String(req.user._id)) {
      // Directory view is allowed; salary already stripped
    }

    res.json(new ApiResponse(200, 'Employee fetched', employee));
  } catch (error) {
    next(error);
  }
};

// POST create employee + user account
export const createEmployee = async (req, res, next) => {
  let createdUserId = null;
  try {
    const {
      employeeId, firstName, lastName, email, phone, address,
      designation, department, dateOfJoining, salary,
      userPassword, userRole, status,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) throw new ApiError(400, 'Email already registered');

    const empExists = await Employee.findOne({
      $or: [{ email }, { employeeId }],
    });
    if (empExists) throw new ApiError(400, 'Employee ID or email already exists');

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: userPassword || 'HCM@1234',
      role: userRole || 'employee',
    });
    createdUserId = user._id;

    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      designation,
      department,
      dateOfJoining,
      salary,
      status: status || 'active',
      avatar: avatarPath(req.file),
      user: user._id,
    });

    user.employee = employee._id;
    await user.save({ validateBeforeSave: false });

    const populated = await employee.populate('department', 'name');
    res.status(201).json(new ApiResponse(201, 'Employee created', populated));
  } catch (error) {
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(() => {});
    }
    next(error);
  }
};

// PUT update employee
export const updateEmployee = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.user;
    delete updates.userPassword;
    if (req.file) updates.avatar = avatarPath(req.file);

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('department', 'name');
    if (!employee) throw new ApiError(404, 'Employee not found');
    res.json(new ApiResponse(200, 'Employee updated', employee));
  } catch (error) {
    next(error);
  }
};

// DELETE (soft delete ? change status)
export const deactivateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status || 'terminated' },
      { new: true }
    );
    if (!employee) throw new ApiError(404, 'Employee not found');

    if (employee.user) await User.findByIdAndUpdate(employee.user, { isActive: false });

    res.json(new ApiResponse(200, 'Employee deactivated', employee));
  } catch (error) {
    next(error);
  }
};
