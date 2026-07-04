const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { isAuthenticated } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

router.use(isAuthenticated, authorizeRoles('buyer'));

router.get('/', wishlistController.viewWishlist);
router.post('/toggle', wishlistController.toggleWishlist);

module.exports = router;
