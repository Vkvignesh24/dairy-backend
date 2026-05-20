const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: '' },     // optional icon name for Flutter mapping
    color: { type: String, default: '' },    // optional hex
    stock: { type: Number, default: 100 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
