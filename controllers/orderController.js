const { sequelize, Cart, Product, Order, OrderItem, User, Notification, Review } = require('../models');

exports.showCheckout = async (req, res, next) => {
  try {
    const items = await Cart.findAll({
      where: { buyerId: req.session.user.id },
      include: [{ model: Product, as: 'product' }]
    });

    if (items.length === 0) {
      req.flash('error', 'Keranjang Anda kosong.');
      return res.redirect('/cart');
    }

    const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
    const buyer = await User.findByPk(req.session.user.id);

    res.render('orders/checkout', { title: 'Checkout', items, total, buyer });
  } catch (err) {
    next(err);
  }
};

exports.placeOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { shippingAddress, notes } = req.body;
    const items = await Cart.findAll({
      where: { buyerId: req.session.user.id },
      include: [{ model: Product, as: 'product' }],
      transaction: t
    });

    if (items.length === 0) {
      await t.rollback();
      req.flash('error', 'Keranjang Anda kosong.');
      return res.redirect('/cart');
    }

    // Validasi stok
    for (const item of items) {
      if (item.quantity > item.product.stock) {
        await t.rollback();
        req.flash('error', `Stok "${item.product.name}" tidak mencukupi.`);
        return res.redirect('/cart');
      }
    }

    const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

    const order = await Order.create({
      buyerId: req.session.user.id,
      totalAmount: total,
      shippingAddress: shippingAddress || req.session.user.address,
      notes: notes || '',
      status: 'pending'
    }, { transaction: t });

    const io = req.app.get('io');
    const sellersNotified = new Set();

    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.product.id,
        sellerId: item.product.sellerId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }, { transaction: t });

      await item.product.decrement('stock', { by: item.quantity, transaction: t });

      if (!sellersNotified.has(item.product.sellerId)) {
        sellersNotified.add(item.product.sellerId);
        const notif = await Notification.create({
          userId: item.product.sellerId,
          type: 'order',
          title: 'Pesanan Baru',
          message: `Ada pesanan baru untuk produk "${item.product.name}" (Order #${order.id}).`,
          link: `/seller/orders`
        }, { transaction: t });
        io.to(`user_${item.product.sellerId}`).emit('new_notification', notif);
      }
    }

    await Cart.destroy({ where: { buyerId: req.session.user.id }, transaction: t });

    await t.commit();
    req.flash('success', `Pesanan #${order.id} berhasil dibuat!`);
    res.redirect(`/orders/${order.id}`);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.session.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']]
    });
    res.render('orders/my-orders', { title: 'Pesanan Saya', orders });
  } catch (err) {
    next(err);
  }
};

exports.orderDetail = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'address', 'phone'] }
      ]
    });

    if (!order) {
      return res.status(404).render('errors/404', { title: 'Pesanan Tidak Ditemukan', layout: false });
    }

    const { id: userId, role } = req.session.user;
    const isOwner = order.buyerId === userId;
    const isRelatedSeller = role === 'seller' && order.items.some(i => i.sellerId === userId);
    const isAdmin = role === 'admin';

    if (!isOwner && !isRelatedSeller && !isAdmin) {
      return res.status(403).render('errors/403', { title: 'Akses Ditolak', layout: false });
    }

    // Ambil ulasan yang sudah dibuat buyer untuk pesanan ini (kalau ada), dikelompokkan per productId
    const reviews = await Review.findAll({ where: { orderId: order.id } });
    const reviewsByProduct = {};
    reviews.forEach(r => { reviewsByProduct[r.productId] = r; });

    res.render('orders/detail', { title: `Pesanan #${order.id}`, order, reviewsByProduct });
  } catch (err) {
    next(err);
  }
};

// Seller/Admin mengubah status pesanan (misal: diproses -> dikirim -> selesai)
exports.updateStatus = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    if (!order) {
      req.flash('error', 'Pesanan tidak ditemukan.');
      return res.redirect(req.get('Referrer') || '/');
    }

    const { role, id: userId } = req.session.user;
    const isRelatedSeller = role === 'seller' && order.items.some(i => i.sellerId === userId);
    if (role !== 'admin' && !isRelatedSeller) {
      req.flash('error', 'Anda tidak berhak mengubah pesanan ini.');
      return res.redirect(req.get('Referrer') || '/');
    }

    order.status = req.body.status;
    await order.save();

    const notif = await Notification.create({
      userId: order.buyerId,
      type: 'order',
      title: 'Status Pesanan Diperbarui',
      message: `Pesanan #${order.id} kini berstatus "${order.status}".`,
      link: `/orders/${order.id}`
    });
    req.app.get('io').to(`user_${order.buyerId}`).emit('new_notification', notif);

    req.flash('success', 'Status pesanan diperbarui.');
    res.redirect(req.get('Referrer') || '/');
  } catch (err) {
    next(err);
  }
};