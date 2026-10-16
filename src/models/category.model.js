const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function () {
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true, strict: true });
});

const categoryModel = mongoose.model('category', categorySchema);

module.exports = categoryModel;