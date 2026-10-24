import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) throw new ApiError(401, 'Not authorized, no token');

    if (!process.env.JWT_SECRET) {
      throw new ApiError(500, 'Server JWT configuration is missing');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) {
      throw new ApiError(401, 'Not authorized, user not found or deactivated');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Role '${req.user.role}' is not authorized`));
    }
    next();
  };
};
