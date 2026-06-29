const Product = require('../../models/Product');

// Availability is represented by stock > 0. We keep model as-is; toggling sets stock=0 or restores.
exports.list = async (_req, res) => {
  const products = await Product.find().sort({ category: 1, name: 1 });
  res.json({
    items: products.map((p) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      unit: p.unit,
      description: p.description,
      stock: p.stock,
      available: p.stock > 0,
      images: p.images,
    })),
  });
};

exports.update = async (req, res) => {
  try {
    const { name, price, category, unit, description, available, images } = req.body;
    const update = {};
    if (name != null) update.name = String(name).trim();
    if (price != null) update.price = Number(price);
    if (category != null) update.category = String(category).trim();
    if (unit != null) {
      update.unit = String(unit).trim();
    };
    if (description != null) update.description = String(description);

    // if (image !== undefined) { update.image = String(image).trim(); }

    if (images !== undefined) {

      if (!Array.isArray(images)) {
        return res.status(400).json({
          message: 'Images must be an array.'
        });
      }

      if (images.length < 1 || images.length > 5) {
        return res.status(400).json({
          message: 'Minimum 1 and maximum 5 images allowed.'
        });
      }

      update.images = images;
    }

    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });

    Object.assign(p, update);
    if (typeof available === 'boolean') {
      p.stock = available ? Math.max(p.stock, 100) : 0;
    }
    await p.save();
    res.json({ message: 'Updated', product: p });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

exports.toggle = async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  p.stock = p.stock > 0 ? 0 : 100;
  await p.save();
  res.json({ message: 'Toggled', available: p.stock > 0 });
};
