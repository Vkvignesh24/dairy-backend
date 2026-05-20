require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const products = [
  { name: 'Pure Cow Ghee', category: 'Ghee', price: 650, unit: '500 g', icon: 'water_drop', color: '#FFC93C', description: 'Traditionally made from cultured cream, rich aroma.' },
  { name: 'Ghee', category: 'Ghee', price: 720, unit: '500 g', icon: 'water_drop', color: '#FFB627', description: 'Creamy texture, perfect for sweets and curries.' },
  { name: 'White Butter', category: 'Butter', price: 320, unit: '250 g', icon: 'cake', color: '#FFE08A', description: 'Soft, fresh, churned daily from cream.' },
  { name: 'Salted Butter', category: 'Butter', price: 180, unit: '100 g', icon: 'cake', color: '#FFE08A', description: 'Lightly salted, ideal for breakfast.' },
  { name: 'Fresh Paneer', category: 'Paneer', price: 90, unit: '200 g', icon: 'dinner_dining', color: '#E8F7EE', description: 'Soft and fresh paneer, made daily.' },
  { name: 'Greek Yogurt', category: 'Curd', price: 60, unit: '400 g', icon: 'icecream', color: '#E3F2FD', description: 'Thick and creamy, naturally probiotic.' },
  { name: 'Sweet Curd', category: 'Curd', price: 45, unit: '400 g', icon: 'icecream', color: '#E3F2FD', description: 'Mildly sweet, perfect with meals.' },
  { name: 'Buttermilk', category: 'Drinks', price: 25, unit: '500 ml', icon: 'local_drink', color: '#E0F7FA', description: 'Refreshing spiced buttermilk.' },
];

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
  await mongoose.disconnect();
})();
