const userModel = require('../models/user.model');

// Server start pe: agar koi admin nahi hai to .env se bana do
const ensureAdmin = async () => {
  if (await userModel.exists({ role: 'admin' })) return;

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('No admin found. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    return;
  }
  await userModel.create({
    name: ADMIN_NAME || 'Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log('Admin created:', ADMIN_EMAIL);
};

module.exports = ensureAdmin;