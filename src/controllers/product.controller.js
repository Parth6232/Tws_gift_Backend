const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const { uploadfile, deletefile } = require('../services/storage.services');
const { logActivity } = require('../services/activity.services');

const bool = (v) => (v === undefined ? undefined : v === true || v === 'true');
const num = (v) => (v === undefined || v === '' ? undefined : Number(v));
const arr = (v) => {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [String(p)];
  } catch {
    return String(v).split(',').map((s) => s.trim()).filter(Boolean);
  }
};

const pick = (body = {}) => {
  const data = {
    title: body.title,
    description: body.description,
    price: num(body.price),
    comparePrice: num(body.comparePrice),
    category: body.category,
    tags: arr(body.tags),
    stock: num(body.stock),
    freeShipping: bool(body.freeShipping),
    isNewArrival: bool(body.isNewArrival),
    isBestSeller: bool(body.isBestSeller),
    isPremium: bool(body.isPremium),
    isActive: bool(body.isActive),
  };
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return data;
};

// PUBLIC: GET /api/products?category=mug&search=pen&minPrice=0&maxPrice=999&bestSeller=true&premium=true&page=1&limit=12&sort=-createdAt
const listProducts = async (req, res) => {
  const { category, search, minPrice, maxPrice, bestSeller, premium, newArrival, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const filter = { isActive: true };

  if (category) {
    const cat = await categoryModel.findOne({ slug: category });
    filter.category = cat ? cat._id : null;
  }
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (bestSeller === 'true') filter.isBestSeller = true;
  if (premium === 'true') filter.isPremium = true;
  if (newArrival === 'true') filter.isNewArrival = true;

  const p = Math.max(Number(page), 1);
  const l = Math.min(Math.max(Number(limit), 1), 60);

  const [items, total] = await Promise.all([
    productModel.find(filter).populate('category', 'name slug').sort(sort).skip((p - 1) * l).limit(l),
    productModel.countDocuments(filter),
  ]);
  res.json({ items, total, page: p, pages: Math.ceil(total / l) });
};

// PUBLIC
const getProductBySlug = async (req, res) => {
  const product = await productModel
    .findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// PANEL: apne banaye products (admin ko sab)
const myProducts = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
  res.json(
    await productModel
      .find(filter)
      .populate('category', 'name slug')
      .populate('createdBy', 'name')
      .sort('-createdAt')
  );
};

// POST (multipart/form-data, images field = "images")
const createProduct = async (req, res) => {
  const images = await Promise.all((req.files || []).map((f) => uploadfile(f)));
  const product = await productModel.create({ ...pick(req.body), images, createdBy: req.user._id });
  await logActivity({
    actor: req.user._id,
    action: 'product.create',
    entityType: 'product',
    entityId: product._id,
    entityName: product.title,
    meta: { price: product.price, images: images.length },
  });
  res.status(201).json(product);
};

// PUT: naye images add hote hain; hatane ke liye removeImages=["fileId1","fileId2"]
const updateProduct = async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const isOwner = product.createdBy.equals(req.user._id);
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Aap sirf apne products edit kar sakte ho' });
  }

  const toRemove = arr(req.body?.removeImages) || [];
  if (toRemove.length) {
    await Promise.all(toRemove.map(deletefile));
    product.images = product.images.filter((i) => !toRemove.includes(i.publicId));
  }
  const newImages = await Promise.all((req.files || []).map((f) => uploadfile(f)));
  product.images.push(...newImages);

  Object.assign(product, pick(req.body));
  await product.save();
  await logActivity({
    actor: req.user._id,
    action: 'product.update',
    entityType: 'product',
    entityId: product._id,
    entityName: product.title,
    meta: { fields: Object.keys(pick(req.body)), imagesAdded: newImages.length, imagesRemoved: toRemove.length },
  });
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const isOwner = product.createdBy.equals(req.user._id);
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Aap sirf apne products delete kar sakte ho' });
  }
  await Promise.all(product.images.map((i) => deletefile(i.publicId)));
  await product.deleteOne();
  await logActivity({
    actor: req.user._id,
    action: 'product.delete',
    entityType: 'product',
    entityId: product._id,
    entityName: product.title,
  });
  res.json({ message: 'Product deleted' });
};

module.exports = {
  listProducts,
  getProductBySlug,
  myProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};