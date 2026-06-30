const User = require('../../models/User');
const Order = require('../../models/Order');
const Subscription = require('../../models/Subscription');

exports.list = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { q = '' } = req.query;

    const filter = { role: 'user' };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

    const ids = users.map((u) => u._id);
    const [orderCounts, activeSubs] = await Promise.all([
      Order.aggregate([{ $match: { userId: { $in: ids } } }, { $group: { _id: '$userId', count: { $sum: 1 } } }]),
      Subscription.find({ userId: { $in: ids }, status: 'active' }).select('userId'),
    ]);
    const ocMap = new Map(orderCounts.map((o) => [String(o._id), o.count]));
    const subSet = new Set(activeSubs.map((s) => String(s.userId)));

    const items = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      houseImages: u.houseImages || [],
      totalOrders: ocMap.get(String(u._id)) || 0,
      activeSubscription: subSet.has(String(u._id)),
      joinedAt: u.createdAt,
    }));

    res.json({ total, page, limit, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

exports.detail = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u || u.role !== 'user') return res.status(404).json({ message: 'Customer not found' });

    const [orders, subscriptions] = await Promise.all([
      Order.find({ userId: u._id }).sort({ createdAt: -1 }).limit(20),
      Subscription.find({ userId: u._id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      customer: {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        address: u.address,
        houseImages: u.houseImages || [],
        joinedAt: u.createdAt,
      },
      orders,
      subscriptions,
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
};
