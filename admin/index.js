// Admin module entry — mount in main server.js with:
//   const adminRouter = require('./admin');
//   app.use('/api/admin', adminRouter);
const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const tomorrowRoutes = require('./routes/tomorrowRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const notificationRoutes =require('./routes/notificationRoutes');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/tomorrow', tomorrowRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);

router.use(
  '/notifications',
  notificationRoutes
);

module.exports = router;
