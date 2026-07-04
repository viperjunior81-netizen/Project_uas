const { Wishlist, Product, Category } = require('../models');

exports.viewWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { buyerId: req.session.user.id },
      include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category' }] }]
    });
    res.render('wishlist/index', { title: 'Wishlist Saya', items });
  } catch (err) {
    next(err);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const buyerId = req.session.user.id;

    const existing = await Wishlist.findOne({ where: { buyerId, productId } });
    if (existing) {
      await existing.destroy();
      req.flash('success', 'Dihapus dari wishlist.');
    } else {
      await Wishlist.create({ buyerId, productId });
      req.flash('success', 'Ditambahkan ke wishlist.');
    }

    res.redirect(req.get('Referrer') || '/');
  } catch (err) {
    next(err);
  }
};