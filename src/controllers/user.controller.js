const userModel = require('../models/user.model');
const { PERMISSIONS } = require('../models/user.model');
const { logActivity } = require('../services/activity.services');

const cleanPerms = (perms = []) => perms.filter((p) => PERMISSIONS.includes(p));

// Admin naya manager banata hai (aur permission deta hai)
const createUser = async (req, res) => {
  const { name, email, password, permissions } = req.body || {};
  const user = await userModel.create({
    name,
    email,
    password,
    role: 'manager',
    permissions: cleanPerms(permissions),
    createdBy: req.user._id,
  });
  await logActivity({
    actor: req.user._id,
    action: 'user.create',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name,
    meta: { permissions: user.permissions },
  });
  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  });
};

const listUsers = async (req, res) => {
  res.json(await userModel.find().sort('-createdAt'));
};

// Permission grant / revoke
const updatePermissions = async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Admin ki permission change nahi hoti' });
  }
  const before = [...user.permissions];
  user.permissions = cleanPerms(req.body?.permissions);
  user.permissionsUpdatedBy = req.user._id;
  user.permissionsUpdatedAt = new Date();
  await user.save();
  await logActivity({
    actor: req.user._id,
    action: 'user.permissions',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name,
    meta: { before, after: user.permissions },
  });
  res.json(user);
};

const setStatus = async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Admin ko deactivate nahi kar sakte' });
  }
  user.isActive = !!req.body?.isActive;
  await user.save();
  await logActivity({
    actor: req.user._id,
    action: 'user.status',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name,
    meta: { isActive: user.isActive },
  });
  res.json(user);
};

module.exports = { createUser, listUsers, updatePermissions, setStatus };