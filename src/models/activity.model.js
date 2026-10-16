const mongoose = require('mongoose');

// Admin dashboard ke liye: kisne, kab, kya kiya
const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    action: {
      type: String,
      required: true,
      enum: [
        'product.create',
        'product.update',
        'product.delete',
        'user.create',
        'user.permissions',
        'user.status',
      ],
    },
    entityType: { type: String, enum: ['product', 'user'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityName: { type: String }, // product title / user name (delete ke baad bhi dikhe)
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });

const activityModel = mongoose.model('activity', activitySchema);

module.exports = activityModel;