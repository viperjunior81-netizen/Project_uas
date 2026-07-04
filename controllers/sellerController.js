const { Op } = require('sequelize');
const { Product, Category, Order, OrderItem, sequelize } = require('../models');

exports.dashboard = async (req, res, next) => {
  try {
    const sellerId = req.session.user.id;

    const totalProducts = await Product.count({ where: { sellerId } });
    const totalStock = await Product.sum('stock', { where: { sellerId } }) || 0;

    const salesRows = await OrderItem.findAll({
      where: { sellerId },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('price * quantity')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'unitsSold']
      ],
      raw: true
    });
    const revenue = Number(salesRows[0].revenue) || 0;
    const unitsSold = Number(salesRows[0].unitsSold) || 0;

    // Data 7 hari terakhir untuk grafik penjualan (self-learned tech: Chart.js)
    const recentItems = await OrderItem.findAll({
      where: { sellerId },
      include: [{ model: Order, as: 'order', attributes: ['createdAt'] }]
    });
    const salesByDay = {};
    recentItems.forEach(item => {
      const day = item.order.createdAt.toISOString().slice(0, 10);
      salesByDay[day] = (salesByDay[day] || 0) + Number(item.price) * item.quantity;
    });

    const lowStockProducts = await Product.findAll({
      where: { sellerId, stock: { [Op.lte]: 5 } },
      limit: 5
    });

    res.render('seller/dashboard', {
      title: 'Dashboard Penjual',
      totalProducts,
      totalStock,
      revenue,
      unitsSold,
      salesByDay,
      lowStockProducts
    });
  } catch (err) {
    next(err);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { sellerId: req.session.user.id },
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });
    res.render('seller/products', { title: 'Produk Saya', products });
  } catch (err) {
    next(err);
  }
};

exports.showCreateProduct = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('seller/product-form', { title: 'Tambah Produk', categories, product: null });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const images = (req.files || []).map(f => `/uploads/products/${f.filename}`);

    await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      sellerId: req.session.user.id,
      images
    });

    req.flash('success', 'Produk berhasil ditambahkan.');
    res.redirect('/seller/products');
  } catch (err) {
    next(err);
  }
};

exports.showEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.session.user.id } });
    if (!product) {
      req.flash('error', 'Produk tidak ditemukan.');
      return res.redirect('/seller/products');
    }
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('seller/product-form', { title: 'Edit Produk', categories, product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.session.user.id } });
    if (!product) {
      req.flash('error', 'Produk tidak ditemukan.');
      return res.redirect('/seller/products');
    }

    const { name, description, price, stock, categoryId, isActive } = req.body;
    let images = product.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/products/${f.filename}`);
    }

    await product.update({
      name, description, price, stock, categoryId,
      isActive: isActive === 'on' || isActive === 'true',
      images
    });

    req.flash('success', 'Produk berhasil diperbarui.');
    res.redirect('/seller/products');
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.destroy({ where: { id: req.params.id, sellerId: req.session.user.id } });
    req.flash('success', 'Produk berhasil dihapus.');
    res.redirect('/seller/products');
  } catch (err) {
    next(err);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const sellerId = req.session.user.id;
    const items = await OrderItem.findAll({
      where: { sellerId },
      include: [{ model: Order, as: 'order' }],
      order: [['createdAt', 'DESC']]
    });
    res.render('seller/orders', { title: 'Pesanan Masuk', items });
  } catch (err) {
    next(err);
  }
};