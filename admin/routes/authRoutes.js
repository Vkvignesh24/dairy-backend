const router = require('express').Router();
const { protect, verifyAdmin } = require('../middleware/verifyAdmin');
const { adminLogin, me } = require('../controllers/authController');

router.post('/login', adminLogin);
router.get('/me', protect, verifyAdmin, me);

module.exports = router;
