import User from '../models/User.model.js';

const seedAdmin = async () => {
  const count = await User.countDocuments();
  if (count > 0) return;

  const email = process.env.ADMIN_EMAIL || 'admin@hcm.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.ADMIN_NAME || 'System Admin';

  await User.create({
    name,
    email,
    password,
    role: 'admin',
  });

  console.log(`Seeded first admin account (${email}). Change this password after first login.`);
};

export default seedAdmin;
