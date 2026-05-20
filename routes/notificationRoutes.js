const router = require('express').Router();

const { protect, } = require('../middleware/authMiddleware');

const { myNotifications, markAllAsRead } = require('../controllers/notificationController');

router.get('/my', protect, myNotifications, );

router.patch('/read-all', protect, markAllAsRead, );

module.exports = router;