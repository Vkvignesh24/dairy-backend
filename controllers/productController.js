const Product = require('../models/Product');

// GET /api/products?category=Ghee&q=ghee
// exports.getProducts = async (req, res) => {
//   try {
//     const { category, q } = req.query;
//     const filter = {};
//     if (category && category !== 'All') filter.category = category;
//     if (q) filter.name = { $regex: q, $options: 'i' };
//     const products = await Product.find(filter).sort({ createdAt: -1 });
//     res.json({ products });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch products' });
//   }
// };

exports.getProducts = async (req, res) => {
  try {
    const { category, q } = req.query;

    const filter = {
      stock: { $gt: 0 }, // ONLY AVAILABLE PRODUCTS
    };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (q) {
      filter.name = {
        $regex: q,
        $options: 'i',
      };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    res.json({ products });

  } catch (err) {

    res.status(500).json({
      message: 'Failed to fetch products',
    });
  }
};


// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: 'Invalid product id' });
  }
};

// POST /api/products  (admin/seed)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
