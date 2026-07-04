const { User, Product, Order, Category, sequelize } = require('../models');

exports.dashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalBuyers = await User.count({ where: { role: 'buyer' } });
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const revenueRow = await Order.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']],
      where: { status: ['paid', 'processing', 'shipped', 'completed'] },
      raw: true
    });

    const recentOrders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 8,
      include: [{ model: User, as: 'buyer', attributes: ['name', 'email'] }]
    });

    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      totalUsers, totalBuyers, totalSellers, totalProducts, totalOrders,
      totalRevenue: Number(revenueRow.total) || 0,
      recentOrders
    });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.render('admin/users', { title: 'Kelola Pengguna', users });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      req.flash('error', 'Pengguna tidak ditemukan.');
      return res.redirect('/admin/users');
    }
    if (user.role === 'admin') {
      req.flash('error', 'Tidak bisa menonaktifkan akun admin.');
      return res.redirect('/admin/users');
    }
    user.isActive = !user.isActive;
    await user.save();
    req.flash('success', `Akun ${user.name} telah ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
    res.redirect('/admin/users');
  } catch (err) {
    next(err);
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('admin/categories', { title: 'Kelola Kategori', categories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await Category.create({ name, slug, description });
    req.flash('success', 'Kategori berhasil ditambahkan.');
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    req.flash('success', 'Kategori berhasil dihapus.');
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }, { model: User, as: 'seller', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.render('admin/products', { title: 'Kelola Semua Produk', products });
  } catch (err) {
    next(err);
  }
};

exports.toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      req.flash('error', 'Produk tidak ditemukan.');
      return res.redirect('/admin/products');
    }
    product.isActive = !product.isActive;
    await product.save();
    req.flash('success', `Produk "${product.name}" telah ${product.isActive ? 'ditampilkan' : 'disembunyikan'}.`);
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'buyer', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.render('admin/orders', { title: 'Kelola Semua Pesanan', orders });
  } catch (err) {
    next(err);
  }
};