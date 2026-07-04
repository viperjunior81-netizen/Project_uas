const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  sellerId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false }, // snapshot nama produk saat dibeli
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, // snapshot harga saat dibeli
  quantity: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'OrderItems'
});

module.exports = OrderItem;