const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  // Disimpan sebagai JSON string array path gambar, contoh: ["/uploads/products/a.jpg"]
  images: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('images');
      try { return JSON.parse(raw || '[]'); } catch (e) { return []; }
    },
    set(val) {
      this.setDataValue('images', JSON.stringify(val || []));
    }
  },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  sellerId: { type: DataTypes.INTEGER, allowNull: false },
  ratingAvg: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'Products'
});

module.exports = Product;