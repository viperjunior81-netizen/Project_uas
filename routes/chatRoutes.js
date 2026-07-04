const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', chatController.inbox);
router.get('/:userId', chatController.conversation);
router.post('/:userId/messages', chatController.sendMessage);

module.exports = router;
