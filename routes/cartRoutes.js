const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

router.use(isAuthenticated, authorizeRoles('buyer'));

router.get('/', cartController.viewCart);
router.post('/add', cartController.addToCart);
router.post('/update', cartController.updateCartItem);
router.post('/remove/:productId', cartController.removeCartItem);

module.exports = router;