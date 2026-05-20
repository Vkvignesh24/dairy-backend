const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const Order = require('../../models/Order');
const { getDeliveriesForDate, getTomorrowDate } = require('../services/deliveryService');

exports.summary = async (_req, res) => {
  try {
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(startToday); endToday.setDate(endToday.getDate() + 1);

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      totalCustomers,
      activeSubscriptions,
      todayOrders,
      monthlyAgg,
      cancelledTodayAgg,
      tomorrow,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Subscription.countDocuments({ status: 'active' }),
      Order.countDocuments({ createdAt: { $gte: startToday, $lt: endToday } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startMonth, $lt: endMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Subscription.aggregate([
        { $unwind: '$cancelledDates' },
        { $match: { cancelledDates: { $gte: startToday, $lt: endToday } } },
        { $count: 'count' },
      ]),
      getDeliveriesForDate(getTomorrowDate(now)),
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('userId', 'name phone');

    const recentSubs = await Subscription.find()
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('userId', 'name phone');

    res.json({
      totalCustomers,
      activeSubscriptions,
      todayOrders,
      tomorrowMilkQuantity: tomorrow.totalQuantity,
      monthlyRevenue: monthlyAgg[0]?.total || 0,
      cancelledDeliveriesToday: cancelledTodayAgg[0]?.count || 0,
      recentOrders,
      recentSubscriptions: recentSubs,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};
