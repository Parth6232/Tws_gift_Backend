const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

// Token cookie se, ya Authorization: Bearer <token> se
const protect = async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ message: 'UnAuthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'UnAuthorized' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "you don't have access" });
  }
  next();
};

// Admin ko hamesha allow, manager ko sirf tab jab admin ne permission di ho
const requirePermission = (perm) => (req, res, next) => {
  if (!req.user.can(perm)) {
    return res.status(403).json({ message: `Permission required: ${perm}` });
  }
  next();
};

module.exports = { protect, adminOnly, requirePermission };