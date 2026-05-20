const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { sendCsv, sendHtmlPdf, toCsv } = require('../utils/exporters');

function dateRange(req) {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const t = new Date(to);
      t.setDate(t.getDate() + 1);
      filter.createdAt.$lt = t;
    }
  }
  return filter;
}

// Recompute subtotal/total securely from DB; never trust stored items prices.
async function reprice(order) {
  const ids = order.items.map((i) => i.productId).filter(Boolean);
  const products = ids.length ? await Product.find({ _id: { $in: ids } }) : [];
  const pmap = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  const items = order.items.map((it) => {
    const p = pmap.get(String(it.productId));
    const price = p ? p.price : it.price || 0;
    const name = p ? p.name : it.name || '-';
    const qty = it.quantity || 1;
    subtotal += price * qty;
    return { productId: it.productId, name, price, quantity: qty, lineTotal: price * qty };
  });
  const deliveryFee = order.deliveryFee || 0;
  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee,
    total: Number((subtotal + deliveryFee).toFixed(2)),
  };
}

exports.list = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { q = '' } = req.query;

    const filter = dateRange(req);
    let docs = await Order.find(filter).populate('userId', 'name phone email address').sort({ createdAt: -1 });

    if (q) {
      const n = q.toLowerCase();
      docs = docs.filter(
        (o) =>
          String(o._id).toLowerCase().includes(n) ||
          (o.userId?.name || '').toLowerCase().includes(n) ||
          (o.userId?.phone || '').toLowerCase().includes(n)
      );
    }

    const total = docs.length;
    const slice = docs.slice((page - 1) * limit, (page - 1) * limit + limit);

    const items = await Promise.all(
      slice.map(async (o) => {
        const priced = await reprice(o);
        return {
          id: o._id,
          customerName: o.userId?.name || '-',
          phone: o.userId?.phone || '-',
          address: o.address,
          items: priced.items,
          subtotal: priced.subtotal,
          deliveryFee: priced.deliveryFee,
          total: priced.total,
          status: o.status,
          createdAt: o.createdAt,
        };
      })
    );

    res.json({ total, page, limit, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const cols = [
  { key: 'id', label: 'Order ID' },
  { key: 'customerName', label: 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'products', label: 'Products', value: (r) => (r.items || []).map((i) => `${i.name} x${i.quantity}`).join('; ') },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'deliveryFee', label: 'Delivery' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Date', value: (r) => new Date(r.createdAt).toISOString().slice(0, 10) },
];

async function fetchAll(req) {
  const filter = dateRange(req);
  const docs = await Order.find(filter).populate('userId', 'name phone').sort({ createdAt: -1 });
  return Promise.all(
    docs.map(async (o) => {
      const priced = await reprice(o);
      return {
        id: o._id,
        customerName: o.userId?.name || '-',
        phone: o.userId?.phone || '-',
        address: o.address,
        items: priced.items,
        subtotal: priced.subtotal,
        deliveryFee: priced.deliveryFee,
        total: priced.total,
        status: o.status,
        createdAt: o.createdAt,
      };
    })
  );
}

exports.exportCsv = async (req, res) => {
  const rows = await fetchAll(req);
  sendCsv(res, 'orders', toCsv(rows, cols));
};

exports.exportPdf = async (req, res) => {
  const rows = await fetchAll(req);
  sendHtmlPdf(res, 'Orders', rows, cols);
};
