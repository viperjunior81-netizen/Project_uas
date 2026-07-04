const { Cart, Product } = require('../models');

exports.viewCart = async (req, res, next) => {
  try {
    const items = await Cart.findAll({
      where: { buyerId: req.session.user.id },
      include: [{ model: Product, as: 'product' }]
    });
    const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
    res.render('cart/index', { title: 'Keranjang Belanja', items, total });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      req.flash('error', 'Produk tidak ditemukan.');
      return res.redirect(req.get('Referrer') || '/');
    }

    let cartItem = await Cart.findOne({ where: { buyerId: req.session.user.id, productId } });
    if (cartItem) {
      cartItem.quantity += qty;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({ buyerId: req.session.user.id, productId, quantity: qty });
    }

    req.flash('success', 'Produk ditambahkan ke keranjang.');
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);

    await Cart.update(
      { quantity: qty },
      { where: { buyerId: req.session.user.id, productId } }
    );

    req.flash('success', 'Keranjang diperbarui.');
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    await Cart.destroy({ where: { buyerId: req.session.user.id, productId: req.params.productId } });
    req.flash('success', 'Produk dihapus dari keranjang.');
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};