const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.post('/:id/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllRead);

module.exports = router;
