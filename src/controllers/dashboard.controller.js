const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const activityModel = require('../models/activity.model');

const TZ = 'Asia/Kolkata';
const dayKey = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

// GET /api/dashboard/stats  -> KPI cards + charts
const getStats = async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [products, activeProducts, soldOut, categories, managers, activeManagers, perDay, recentProducts] =
    await Promise.all([
      productModel.countDocuments(),
      productModel.countDocuments({ isActive: true }),
      productModel.countDocuments({ stock: { $lte: 0 } }),
      categoryModel.countDocuments(),
      userModel.countDocuments({ role: 'manager' }),
      userModel.countDocuments({ role: 'manager', isActive: true }),
      productModel.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, count: { $sum: 1 } } },
      ]),
      productModel
        .find()
        .sort('-createdAt')
        .limit(5)
        .populate('createdBy', 'name')
        .populate('category', 'name'),
    ]);

  // Last 30 din, missing din 0 ke saath (chart ke liye)
  const map = new Map(perDay.map((d) => [d._id, d.count]));
  const productsPerDay = [];
  for (let i = 29; i >= 0; i--) {
    const key = dayKey(Date.now() - i * 24 * 60 * 60 * 1000);
    productsPerDay.push({ date: key, count: map.get(key) || 0 });
  }

  res.json({
    totals: { products, activeProducts, soldOut, categories, managers, activeManagers },
    productsPerDay,
    recentProducts,
  });
};

// GET /api/dashboard/team -> har user: permissions, kisne diye, kab, last login, kitne products
const getTeam = async (req, res) => {
  const [users, counts] = await Promise.all([
    userModel
      .find()
      .populate('createdBy', 'name')
      .populate('permissionsUpdatedBy', 'name')
      .sort('-createdAt'),
    productModel.aggregate([
      { $group: { _id: '$createdBy', productCount: { $sum: 1 }, lastProductAt: { $max: '$createdAt' } } },
    ]),
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c]));
  res.json(
    users.map((u) => {
      const c = countMap.get(String(u._id));
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        permissions: u.permissions,
        isActive: u.isActive,
        createdAt: u.createdAt,
        createdBy: u.createdBy?.name || null,
        permissionsUpdatedBy: u.permissionsUpdatedBy?.name || null,
        permissionsUpdatedAt: u.permissionsUpdatedAt || null,
        lastLoginAt: u.lastLoginAt || null,
        productCount: c?.productCount || 0,
        lastProductAt: c?.lastProductAt || null,
      };
    })
  );
};

// GET /api/dashboard/activity?page=1&limit=20&actor=<userId>&action=product.create&entityId=<id>
// actor = kisne kiya, entityId = kis user/product par kiya (access history ke liye)
const getActivity = async (req, res) => {
  const { actor, action, entityId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (actor) filter.actor = actor;
  if (entityId) filter.entityId = entityId;
  if (action) filter.action = action;

  const p = Math.max(Number(page), 1);
  const l = Math.min(Math.max(Number(limit), 1), 100);

  const [items, total] = await Promise.all([
    activityModel
      .find(filter)
      .populate('actor', 'name role')
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l),
    activityModel.countDocuments(filter),
  ]);
  res.json({ items, total, page: p, pages: Math.ceil(total / l) });
};

// GET /api/dashboard/users/:id/products -> is user ne kaunse products kab add kiye
const getUserProducts = async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const items = await productModel
    .find({ createdBy: user._id })
    .select('title slug price images stock isActive category createdAt')
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(limit);

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    items,
  });
};

module.exports = { getStats, getTeam, getActivity, getUserProducts };