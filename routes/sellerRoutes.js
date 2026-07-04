const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { isAuthenticated } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { uploadProduct } = require('../middleware/upload');

router.use(isAuthenticated, authorizeRoles('seller'));

router.get('/dashboard', sellerController.dashboard);

router.get('/products', sellerController.listProducts);
router.get('/products/new', sellerController.showCreateProduct);
router.post('/products', uploadProduct.array('images', 5), sellerController.createProduct);
router.get('/products/:id/edit', sellerController.showEditProduct);
router.post('/products/:id', uploadProduct.array('images', 5), sellerController.updateProduct);
router.post('/products/:id/delete', sellerController.deleteProduct);

router.get('/orders', sellerController.listOrders);

module.exports = router;
