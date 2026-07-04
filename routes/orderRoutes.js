const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// Checkout khusus buyer
router.get('/checkout', isAuthenticated, authorizeRoles('buyer'), orderController.showCheckout);
router.post('/checkout', isAuthenticated, authorizeRoles('buyer'), orderController.placeOrder);

// Daftar pesanan (buyer)
router.get('/orders', isAuthenticated, authorizeRoles('buyer'), orderController.myOrders);

// Detail pesanan (buyer pemilik, seller terkait, atau admin - divalidasi di controller)
router.get('/orders/:id', isAuthenticated, orderController.orderDetail);

// Ubah status pesanan (seller terkait atau admin - divalidasi di controller)
router.post('/orders/:id/status', isAuthenticated, orderController.updateStatus);

// Kirim ulasan produk (buyer)
router.post('/reviews', isAuthenticated, authorizeRoles('buyer'), reviewController.createReview);

// Balas ulasan produk (seller pemilik produk - divalidasi lagi di controller)
router.post('/reviews/:id/reply', isAuthenticated, authorizeRoles('seller'), reviewController.replyReview);

module.exports = router;