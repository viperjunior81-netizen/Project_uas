const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

router.use(isAuthenticated, authorizeRoles('admin'));

router.get('/dashboard', adminController.dashboard);

router.get('/users', adminController.listUsers);
router.post('/users/:id/toggle', adminController.toggleUserStatus);

router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.post('/categories/:id/delete', adminController.deleteCategory);

router.get('/products', adminController.listProducts);
router.post('/products/:id/toggle', adminController.toggleProductStatus);

router.get('/orders', adminController.listOrders);

module.exports = router;
