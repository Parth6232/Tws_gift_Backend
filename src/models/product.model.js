const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // sale price
    comparePrice: { type: Number, min: 0 }, // regular (cut) price
    images: [{ url: String, publicId: String }], // publicId = ImageKit fileId
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
    tags: [{ type: String, trim: true }],
    stock: { type: Number, default: 0, min: 0 },
    freeShipping: { type: Boolean, default: true },
    isNewArrival: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('soldOut').get(function () {
  return this.stock <= 0;
});

productSchema.index({ title: 'text', tags: 'text' });

productSchema.pre('validate', async function () {
  if (!this.isModified('title') && this.slug) return;
  const base = slugify(this.title, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${i++}`;
  }
  this.slug = slug;
});

const productModel = mongoose.model('product', productSchema);

module.exports = productModel;