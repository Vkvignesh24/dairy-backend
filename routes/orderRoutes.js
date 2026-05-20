const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { placeOrder, myOrders } = require('../controllers/orderController');

router.post('/', protect, placeOrder);
router.get('/my-orders', protect, myOrders);

module.exports = router;
