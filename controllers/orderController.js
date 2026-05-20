const Order = require('../models/Order');
const Product = require('../models/Product');

exports.placeOrder = async (req, res) => {
  try {
    const {
      items = [],
      address,
      paymentMethod = 'COD',
      deliveryFee = 25,
    } = req.body;

    // validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'No items in order',
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        message: 'Address is required',
      });
    }

    // normalize item data
    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity) || 1,
    }));

    // fetch all products
    const productIds = normalizedItems.map((i) => i.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    // map products
    const productMap = new Map(
      products.map((p) => [p._id.toString(), p])
    );

    let subtotal = 0;

    const orderItems = [];

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      const quantity = Math.max(1, item.quantity);

      subtotal += product.price * quantity;

      // STORE PRODUCT SNAPSHOT
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const total = subtotal + Number(deliveryFee);

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      address: address.trim(),
      paymentMethod,
      status: 'placed',
    });

    return res.status(201).json({
      order,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Failed to place order',
    });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      orders,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to load orders',
    });
  }
};


// const Order = require('../models/Order');
// const Product = require('../models/Product');

// // POST /api/orders
// // Body: { items: [{ productId, quantity }], address, paymentMethod, deliveryFee? }
// //
// // SECURITY: We IGNORE any price/name/subtotal sent from the client.
// // All prices and totals are recomputed on the server using the DB Product collection.
// exports.placeOrder = async (req, res) => {
//   try {
//     const {
//       items = [],
//       address,
//       paymentMethod = 'COD',
//       deliveryFee: clientDeliveryFee,
//     } = req.body;

//     // Basic validation
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ message: 'No items in order' });
//     }
//     if (!address || typeof address !== 'string' || !address.trim()) {
//       return res.status(400).json({ message: 'Delivery address is required' });
//     }

//     // Normalize and validate every line item
//     const normalized = [];
//     for (const it of items) {
//       const productId = it.productId;
//       const quantity = Number(it.quantity);

//       if (!productId) {
//         return res.status(400).json({ message: 'Each item must include productId' });
//       }
//       if (!Number.isFinite(quantity) || quantity < 1) {
//         return res.status(400).json({ message: 'Invalid quantity for item ' + productId });
//       }
//       normalized.push({ productId: String(productId), quantity: Math.floor(quantity) });
//     }

//     // Fetch all products in one query
//     const ids = normalized.map((n) => n.productId);
//     const products = await Product.find({ _id: { $in: ids } });
//     const productMap = new Map(products.map((p) => [p._id.toString(), p]));

//     // Build the trusted order items using DB prices ONLY
//     const orderItems = [];
//     let subtotal = 0;

//     for (const n of normalized) {
//       const product = productMap.get(n.productId);
//       if (!product) {
//         return res
//           .status(404)
//           .json({ message: `Product not found: ${n.productId}` });
//       }
//       if (typeof product.stock === 'number' && product.stock < n.quantity) {
//         return res
//           .status(400)
//           .json({ message: `Insufficient stock for ${product.name}` });
//       }

//       const lineTotal = product.price * n.quantity;
//       subtotal += lineTotal;

//       orderItems.push({
//         productId: product._id,
//         name: product.name,
//         price: product.price, // trusted DB price
//         quantity: n.quantity,
//       });
//     }

//     // Server-controlled delivery fee (ignore tampered client value if you want a fixed fee)
//     const deliveryFee =
//       Number.isFinite(Number(clientDeliveryFee)) && Number(clientDeliveryFee) >= 0
//         ? Number(clientDeliveryFee)
//         : 25;

//     const total = subtotal + deliveryFee;

//     const order = await Order.create({
//       userId: req.user._id,
//       items: orderItems,
//       subtotal,
//       deliveryFee,
//       total,
//       address: address.trim(),
//       paymentMethod,
//       status: 'placed',
//     });

//     return res.status(201).json({ order });
//   } catch (err) {
//     console.error('placeOrder error:', err);
//     return res.status(500).json({ message: 'Failed to place order' });
//   }
// };

// // GET /api/orders/my-orders
// exports.myOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
//     return res.status(200).json({ orders });
//   } catch (err) {
//     console.error('myOrders error:', err);
//     return res.status(500).json({ message: 'Failed to load orders' });
//   }
// };

