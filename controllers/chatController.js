const { Op } = require('sequelize');
const { Message, User, Product, Notification } = require('../models');

function conversationIdOf(a, b) {
  return [Number(a), Number(b)].sort((x, y) => x - y).join('_');
}

// Daftar percakapan (inbox) milik user yang login
exports.inbox = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const messages = await Message.findAll({
      where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] },
      order: [['createdAt', 'DESC']]
    });

    const seen = new Set();
    const partnerIds = [];
    messages.forEach(m => {
      const partnerId = m.senderId === userId ? m.receiverId : m.senderId;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        partnerIds.push(partnerId);
      }
    });

    const partners = await User.findAll({ where: { id: partnerIds }, attributes: ['id', 'name', 'avatar', 'role'] });

    res.render('chat/inbox', { title: 'Pesan', partners });
  } catch (err) {
    next(err);
  }
};

// Halaman percakapan dengan satu user (misal buyer <-> seller terkait sebuah produk)
exports.conversation = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const partnerId = parseInt(req.params.userId);

    const partner = await User.findByPk(partnerId, { attributes: ['id', 'name', 'avatar', 'role'] });
    if (!partner) {
      req.flash('error', 'Pengguna tidak ditemukan.');
      return res.redirect('/chat');
    }

    const convId = conversationIdOf(userId, partnerId);
    const messages = await Message.findAll({
      where: { conversationId: convId },
      order: [['createdAt', 'ASC']]
    });

    await Message.update(
      { isRead: true },
      { where: { conversationId: convId, receiverId: userId, isRead: false } }
    );

    let product = null;
    if (req.query.productId) {
      product = await Product.findByPk(req.query.productId);
    }

    res.render('chat/conversation', { title: `Chat dengan ${partner.name}`, partner, messages, conversationId: convId, product });
  } catch (err) {
    next(err);
  }
};

// Kirim pesan baru dalam sebuah percakapan (dipanggil dari form chat)
exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.session.user.id;
    const receiverId = parseInt(req.params.userId);
    const text = (req.body.text || '').trim();

    if (!text) {
      req.flash('error', 'Pesan tidak boleh kosong.');
      return res.redirect(`/chat/${receiverId}`);
    }

    // Kalau senderId === receiverId, kemungkinan besar sesi login tertimpa
    // (mis. login sebagai penjual di tab lain menimpa sesi pembeli di tab ini).
    if (senderId === receiverId) {
      req.flash('error', 'Anda mencoba mengirim pesan ke diri sendiri. Sepertinya sesi login Anda tertimpa akun lain — coba gunakan browser/incognito terpisah untuk tiap akun, lalu login ulang.');
      return res.redirect('/chat');
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      req.flash('error', 'Pengguna tidak ditemukan.');
      return res.redirect('/chat');
    }

    const conversationId = conversationIdOf(senderId, receiverId);
    const message = await Message.create({ conversationId, senderId, receiverId, text });

    // Buat notifikasi untuk penerima pesan
    const sender = await User.findByPk(senderId, { attributes: ['id', 'name'] });
    await Notification.create({
      userId: receiverId,
      type: 'chat',
      title: 'Pesan baru',
      message: `${sender ? sender.name : 'Seseorang'} mengirim pesan: "${text.length > 60 ? text.slice(0, 60) + '...' : text}"`,
      link: `/chat/${senderId}`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${receiverId}`).emit('new_message', message);
    }

    res.redirect(`/chat/${receiverId}`);
  } catch (err) {
    next(err);
  }
};

exports.conversationIdOf = conversationIdOf;