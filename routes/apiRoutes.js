const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated } = require('../middleware/auth');

// REST API publik untuk pencarian & filter produk (dipakai fetch/AJAX di halaman produk)
router.get('/products', apiController.getProducts);
router.get('/products/:id', apiController.getProductById);

// REST API privat untuk notifikasi user yang login
router.get('/notifications', isAuthenticated, apiController.getMyNotifications);

// REST API privat untuk cek status wishlist sebuah produk
router.get('/wishlist/check/:productId', isAuthenticated, apiController.checkWishlist);

module.exports = router;