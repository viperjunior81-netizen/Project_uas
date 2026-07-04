const { validationResult } = require('express-validator');
const { User } = require('../models');

exports.showRegister = (req, res) => {
  res.render('auth/register', { title: 'Daftar Akun', old: {}, errors: [] });
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const { name, email, password, role } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render('auth/register', {
        title: 'Daftar Akun',
        old: req.body,
        errors: errors.array()
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).render('auth/register', {
        title: 'Daftar Akun',
        old: req.body,
        errors: [{ msg: 'Email sudah terdaftar, silakan gunakan email lain.' }]
      });
    }

    // Hanya boleh mendaftar sebagai buyer atau seller (admin dibuat manual via seeder)
    const safeRole = ['buyer', 'seller'].includes(role) ? role : 'buyer';

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      storeName: safeRole === 'seller' ? (req.body.storeName || `${name}'s Store`) : ''
    });

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    req.flash('success', `Selamat datang, ${user.name}! Akun berhasil dibuat.`);
    return res.redirect('/');
  } catch (err) {
    next(err);
  }
};

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Masuk', errors: [] });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).render('auth/login', {
        title: 'Masuk',
        errors: [{ msg: 'Email atau password salah.' }]
      });
    }

    if (!user.isActive) {
      return res.status(403).render('auth/login', {
        title: 'Masuk',
        errors: [{ msg: 'Akun Anda telah dinonaktifkan. Hubungi admin.' }]
      });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    req.flash('success', `Selamat datang kembali, ${user.name}!`);

    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    if (user.role === 'seller') return res.redirect('/seller/dashboard');
    return res.redirect('/');
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};