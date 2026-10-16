const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin jisko jo permission de, wahi kar sakega
const PERMISSIONS = ['product:create'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'manager'], default: 'manager' },
    permissions: [{ type: String, enum: PERMISSIONS }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // kis admin ne banaya
    permissionsUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // kisne permission di
    permissionsUpdatedAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.can = function (perm) {
  return this.role === 'admin' || this.permissions.includes(perm);
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
module.exports.PERMISSIONS = PERMISSIONS;