const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, defaultValue: '' },
  // Balasan dari penjual atas ulasan ini (opsional)
  sellerReply: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  sellerReplyAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
}, {
  tableName: 'Reviews',
  indexes: [{ unique: true, fields: ['buyerId', 'productId', 'orderId'] }]
});

module.exports = Review;