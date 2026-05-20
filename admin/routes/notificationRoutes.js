const router = require('express').Router();

const {
  protect,
  verifyAdmin,
} = require('../middleware/verifyAdmin');

const {
  sendSubscriptionReminder,
} = require('../controllers/notificationController');

router.post(
  '/subscription-reminder',
  protect,
  verifyAdmin,
  sendSubscriptionReminder
);

module.exports = router;