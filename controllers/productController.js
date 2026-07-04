const { Op } = require('sequelize');
const { Product, Category, User, Review } = require('../models');


// Halaman daftar produk (home) - mendukung search, filter kategori, sort, pagination
exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (req.query.q) {
      where.name = { [Op.like]: `%${req.query.q}%` };
    }
    if (req.query.category) {
      where.categoryId = req.query.category;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = req.query.minPrice;
      if (req.query.maxPrice) where.price[Op.lte] = req.query.maxPrice;
    }

    let order = [['createdAt', 'DESC']];
    if (req.query.sort === 'price_asc') order = [['price', 'ASC']];
    if (req.query.sort === 'price_desc') order = [['price', 'DESC']];
    if (req.query.sort === 'rating') order = [['ratingAvg', 'DESC']];

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] }
      ],
      order,
      limit,
      offset
    });

    const categories = await Category.findAll({ order: [['name', 'ASC']] });

    res.render('products/list', {
      title: 'Belanja Produk',
      products,
      categories,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query
    });
  } catch (err) {
    next(err);
  }
};

// Halaman detail produk
exports.detail = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'seller', attributes: ['id', 'name', 'storeName', 'avatar'] },
        { model: Review, as: 'reviews', include: [{ model: User, as: 'buyer', attributes: ['id', 'name', 'avatar'] }] }
      ]
    });

    if (!product) {
      return res.status(404).render('errors/404', { title: 'Produk Tidak Ditemukan', layout: false });
    }

    const related = await Product.findAll({
      where: { categoryId: product.categoryId, id: { [Op.ne]: product.id }, isActive: true },
      limit: 4
    });

    res.render('products/detail', { title: product.name, product, related });
  } catch (err) {
    next(err);
  }
};