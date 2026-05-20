const router = require('express').Router();
const { getProducts, getProduct, createProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct); // simple add (no admin guard for beginner-level)

module.exports = router;
