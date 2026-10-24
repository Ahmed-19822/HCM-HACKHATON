export const validateLeave = (req, res, next) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const errors = [];
  if (!leaveType) errors.push('Leave type is required');
  if (!startDate) errors.push('Start date is required');
  if (!endDate)   errors.push('End date is required');
  if (!reason)    errors.push('Reason is required');
  if (!['casual', 'sick', 'annual'].includes(leaveType)) errors.push('Invalid leave type');
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    errors.push('End date must be after start date');
  }
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });
  next();
};
