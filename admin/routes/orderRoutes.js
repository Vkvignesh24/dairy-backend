const router = require('express').Router();
const { protect, verifyAdmin } = require('../middleware/verifyAdmin');
const c = require('../controllers/orderController');

router.get('/', protect, verifyAdmin, c.list);
router.get('/export/csv', protect, verifyAdmin, c.exportCsv);
router.get('/export/pdf', protect, verifyAdmin, c.exportPdf);

module.exports = router;
