import Department from '../models/Department.model.js';
import Employee from '../models/Employee.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('head', 'firstName lastName').sort({ name: 1 });
    res.json(new ApiResponse(200, 'Departments fetched', departments));
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id).populate('head', 'firstName lastName');
    if (!dept) throw new ApiError(404, 'Department not found');
    res.json(new ApiResponse(200, 'Department fetched', dept));
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, head } = req.body;
    if (!name?.trim()) throw new ApiError(400, 'Department name is required');
    const dept = await Department.create({ name: name.trim(), description, head });
    res.status(201).json(new ApiResponse(201, 'Department created', dept));
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dept) throw new ApiError(404, 'Department not found');
    res.json(new ApiResponse(200, 'Department updated', dept));
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const inUse = await Employee.countDocuments({ department: req.params.id });
    if (inUse > 0) {
      throw new ApiError(400, 'Cannot delete a department that still has employees');
    }
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) throw new ApiError(404, 'Department not found');
    res.json(new ApiResponse(200, 'Department deleted'));
  } catch (error) {
    next(error);
  }
};
