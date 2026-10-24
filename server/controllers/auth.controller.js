import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// @desc   Register user
// @route  POST /api/auth/register
// @access Admin
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(400, 'Email already registered');

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);

    res.status(201).json(
      new ApiResponse(201, 'User registered successfully', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }
    if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

    const token = generateToken(user._id, user.role);

    res.json(
      new ApiResponse(200, 'Login successful', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged-in user profile
// @route  GET /api/auth/me
// @access Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'employee',
      populate: { path: 'department', select: 'name' },
    });
    res.json(new ApiResponse(200, 'Profile fetched', user));
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      throw new ApiError(400, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    res.json(new ApiResponse(200, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};
