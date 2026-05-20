const router = require('express').Router();
const { protect, verifyAdmin } = require('../middleware/verifyAdmin');
const c = require('../controllers/productController');

router.get('/', protect, verifyAdmin, c.list);
router.put('/:id', protect, verifyAdmin, c.update);
router.patch('/:id/toggle', protect, verifyAdmin, c.toggle);

module.exports = router;
