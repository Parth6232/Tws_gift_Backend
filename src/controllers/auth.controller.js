const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  permissions: u.permissions,
});

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  const user = await userModel.findOne({ email }).select('+password');

  if (!user || !user.isActive || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  await userModel.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  res.cookie('token', token, cookieOptions);
  res.json({ message: 'Login successful', user: publicUser(user) });
};

const logoutUser = (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out' });
};

const me = (req, res) => {
  res.json(publicUser(req.user));
};

module.exports = { loginUser, logoutUser, me };