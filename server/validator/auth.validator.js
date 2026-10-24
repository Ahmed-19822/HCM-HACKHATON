export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  if (!email)    errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (email && !/\S+@\S+\.\S+/.test(email)) errors.push('Invalid email format');
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });
  next();
};

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name)     errors.push('Name is required');
  if (!email)    errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters');
  if (email && !/\S+@\S+\.\S+/.test(email)) errors.push('Invalid email format');
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });
  next();
};
