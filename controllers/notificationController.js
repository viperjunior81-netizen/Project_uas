const { Notification } = require('../models');

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: req.session.user.id } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.session.user.id, isRead: false } }
    );
    res.redirect(req.get('Referrer') || '/');
  } catch (err) {
    next(err);
  }
};