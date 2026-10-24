import Department from '../models/Department.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// GET all departments
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('head', 'firstName lastName');
    res.json(new ApiResponse(200, 'Departments fetched', departments));
  } catch (error) { next(error); }
};

// GET single department
export const getDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id).populate('head', 'firstName lastName');
    if (!dept) throw new ApiError(404, 'Department not found');
    res.json(new ApiResponse(200, 'Department fetched', dept));
  } catch (error) { next(error); }
};

// POST create department
export const createDepartment = async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(new ApiResponse(201, 'Department created', dept));
  } catch (error) { next(error); }
};

// PUT update department
export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!dept) throw new ApiError(404, 'Department not found');
    res.json(new ApiResponse(200, 'Department updated', dept));
  } catch (error) { next(error); }
};

// DELETE department
export const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) throw new ApiError(404, 'Department not found');
    res.json(new ApiResponse(200, 'Department deleted'));
  } catch (error) { next(error); }
};
