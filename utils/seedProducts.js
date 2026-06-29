require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');


  const products = [
  {
    name: 'Pure Cow Ghee',
    category: 'Ghee',
    price: 650,
    unit: '500 g',

    images: [
      'https://your-domain.com/images/ghee.jpg'
    ],

    icon: 'water_drop',
    color: '#FFC93C',
    description: 'Traditionally made from cultured cream, rich aroma.'
  },
];


(async () => {
  await connectDB();
  // await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
  await mongoose.disconnect();
})();
