export const validateEmployee = (req, res, next) => {
  const { employeeId, firstName, lastName, email, designation, department, dateOfJoining } = req.body;
  const errors = [];
  if (!employeeId)    errors.push('Employee ID is required');
  if (!firstName)     errors.push('First name is required');
  if (!lastName)      errors.push('Last name is required');
  if (!email)         errors.push('Email is required');
  if (!designation)   errors.push('Designation is required');
  if (!department)    errors.push('Department is required');
  if (!dateOfJoining) errors.push('Date of joining is required');
  if (email && !/\S+@\S+\.\S+/.test(email)) errors.push('Invalid email format');
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });
  next();
};
