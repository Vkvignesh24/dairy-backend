const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 25 },
    total: { type: Number, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, default: 'placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
