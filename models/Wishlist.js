const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'Wishlists',
  indexes: [{ unique: true, fields: ['buyerId', 'productId'] }]
});

module.exports = Wishlist;