const { Review, Product, OrderItem, Order } = require('../models');

exports.createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const buyerId = req.session.user.id;

    // Pastikan buyer benar-benar sudah membeli & pesanan selesai
    const order = await Order.findOne({
      where: { id: orderId, buyerId, status: 'completed' },
      include: [{ model: OrderItem, as: 'items', where: { productId } }]
    });

    if (!order) {
      req.flash('error', 'Anda hanya bisa memberi ulasan untuk pesanan yang sudah selesai.');
      return res.redirect(req.get('Referrer') || '/');
    }

    const existing = await Review.findOne({ where: { buyerId, productId, orderId } });
    if (existing) {
      req.flash('error', 'Anda sudah memberi ulasan untuk produk ini pada pesanan tersebut.');
      return res.redirect(req.get('Referrer') || '/');
    }

    await Review.create({ buyerId, productId, orderId, rating, comment });

    // Update rating rata-rata produk
    const reviews = await Review.findAll({ where: { productId } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Product.update(
      { ratingAvg: avg.toFixed(1), ratingCount: reviews.length },
      { where: { id: productId } }
    );

    req.flash('success', 'Terima kasih atas ulasan Anda!');
    res.redirect(`/products/${productId}`);
  } catch (err) {
    next(err);
  }
};

// Penjual membalas ulasan pada produknya sendiri
exports.replyReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const sellerId = req.session.user.id;

    const review = await Review.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    if (!review) {
      req.flash('error', 'Ulasan tidak ditemukan.');
      return res.redirect(req.get('Referrer') || '/');
    }

    // Pastikan hanya penjual pemilik produk yang boleh membalas
    if (review.product.sellerId !== sellerId) {
      req.flash('error', 'Anda tidak berhak membalas ulasan ini.');
      return res.redirect(req.get('Referrer') || '/');
    }

    if (!comment || !comment.trim()) {
      req.flash('error', 'Balasan tidak boleh kosong.');
      return res.redirect(req.get('Referrer') || '/');
    }

    review.sellerReply = comment.trim();
    review.sellerReplyAt = new Date();
    await review.save();

    req.flash('success', 'Balasan berhasil dikirim.');
    res.redirect(`/products/${review.productId}`);
  } catch (err) {
    next(err);
  }
};