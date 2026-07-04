const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'seller', 'buyer'), defaultValue: 'buyer' },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  address: { type: DataTypes.STRING, defaultValue: '' },
  avatar: { type: DataTypes.STRING, defaultValue: '/img/default-avatar.png' },
  storeName: { type: DataTypes.STRING, defaultValue: '' }, // hanya dipakai jika role = seller
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'Users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// jangan pernah kirim password ke view/JSON
User.prototype.toSafeJSON = function () {
  const { id, name, email, role, phone, address, avatar, storeName, isActive, createdAt } = this;
  return { id, name, email, role, phone, address, avatar, storeName, isActive, createdAt };
};

module.exports = User;