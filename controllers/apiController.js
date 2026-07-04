const { Op } = require('sequelize');
const { Product, Category, User, Notification, Wishlist } = require('../models');

// GET /api/v1/products?q=&category=&minPrice=&maxPrice=&sort=&page=
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (req.query.q) where.name = { [Op.like]: `%${req.query.q}%` };
    if (req.query.category) where.categoryId = req.query.category;
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = req.query.minPrice;
      if (req.query.maxPrice) where.price[Op.lte] = req.query.maxPrice;
    }

    let order = [['createdAt', 'DESC']];
    if (req.query.sort === 'price_asc') order = [['price', 'ASC']];
    if (req.query.sort === 'price_desc') order = [['price', 'DESC']];

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order,
      limit,
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }, { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] }]
    });
    if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/notifications (privat, milik user login)
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.session.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    const unreadCount = await Notification.count({ where: { userId: req.session.user.id, isRead: false } });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/wishlist/check/:productId (privat)
exports.checkWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({
      where: { buyerId: req.session.user.id, productId: req.params.productId }
    });
    res.json({ success: true, inWishlist: !!item });
  } catch (err) {
    next(err);
  }
};