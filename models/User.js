const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true, required: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);