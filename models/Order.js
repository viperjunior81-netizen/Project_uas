const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  shippingAddress: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: { type: DataTypes.STRING, defaultValue: '' }
}, {
  tableName: 'Orders'
});

module.exports = Order;