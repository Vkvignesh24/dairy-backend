const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createSubscription,
  mySubscriptions,
  getCurrentSubscription,
  getSubscriptionByMonth,
} = require('../controllers/subscriptionController');

router.post('/', protect, createSubscription);
router.get('/my', protect, mySubscriptions);
// router.put('/:id', protect, updateSubscription);
// router.get('/current', protect, getCurrentSubscription);
router.get('/current', protect, getCurrentSubscription);
router.get(
  '/month/:month',
  protect,
  getSubscriptionByMonth
);

module.exports = router;
