const router = require('express').Router();
const { protect, verifyAdmin } = require('../middleware/verifyAdmin');
const c = require('../controllers/customerController');

router.get('/', protect, verifyAdmin, c.list);
router.get('/:id', protect, verifyAdmin, c.detail);

module.exports = router;
