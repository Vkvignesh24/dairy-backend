const router = require('express').Router();
const { protect, verifyAdmin } = require('../middleware/verifyAdmin');
const { summary } = require('../controllers/dashboardController');

router.get('/summary', protect, verifyAdmin, summary);

module.exports = router;
