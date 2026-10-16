const categoryModel = require('../models/category.model');
const productModel = require('../models/product.model');

const listCategories = async (req, res) => {
  res.json(await categoryModel.find().sort('name'));
};

const createCategory = async (req, res) => {
  res.status(201).json(await categoryModel.create({ name: req.body?.name }));
};

const updateCategory = async (req, res) => {
  const cat = await categoryModel.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  cat.name = req.body?.name ?? cat.name;
  await cat.save();
  res.json(cat);
};

const deleteCategory = async (req, res) => {
  if (await productModel.exists({ category: req.params.id })) {
    return res.status(400).json({ message: 'Is category me products hain, pehle unhe hatao/move karo' });
  }
  await categoryModel.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };