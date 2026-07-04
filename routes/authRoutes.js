const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/auth');

router.get('/register', isGuest, authController.showRegister);
router.post(
  '/register',
  isGuest,
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
  ],
  authController.register
);

router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, authController.login);

router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

module.exports = router;