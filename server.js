require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const orderRoutes = require('./routes/orderRoutes');
// const notificationRoutes =require('./routes/notificationRoutes');
const notificationRoutes =require('./routes/notificationRoutes');

const adminRoutes = require('./admin');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'dairy-backend',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/orders', orderRoutes);


app.use(
  '/api/notifications',
  notificationRoutes
);

app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});