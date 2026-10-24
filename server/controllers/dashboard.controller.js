import Employee from '../models/Employee.model.js';
import Attendance from '../models/Attendance.model.js';
import Leave from '../models/Leave.model.js';
import Department from '../models/Department.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// GET dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      presentToday,
      pendingLeaves,
      recentHires,
      departmentBreakdown,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Department.countDocuments({ isActive: true }),
      Attendance.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['present', 'late'] },
      }),
      Leave.countDocuments({ status: 'pending' }),
      Employee.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName designation createdAt')
        .populate('department', 'name'),
      Employee.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1, _id: 0 } },
      ]),
    ]);

    res.json(new ApiResponse(200, 'Dashboard stats', {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      presentToday,
      absentToday: Math.max(activeEmployees - presentToday, 0),
      pendingLeaves,
      recentHires,
      departmentBreakdown,
    }));
  } catch (error) {
    next(error);
  }
};
