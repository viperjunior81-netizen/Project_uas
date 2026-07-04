const { sequelize } = require('../config/db');

const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const Message = require('./Message');
const Notification = require('./Notification');

// =====================
// Associations
// =====================

// Product belongs to Category & Seller (User)
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Cart belongs to Buyer (User) & Product
User.hasMany(Cart, { foreignKey: 'buyerId', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Product.hasMany(Cart, { foreignKey: 'productId', as: 'cartEntries' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order belongs to Buyer (User), has many OrderItems
User.hasMany(Order, { foreignKey: 'buyerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(OrderItem, { foreignKey: 'sellerId', as: 'soldItems' });
OrderItem.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Review belongs to Buyer (User), Product & Order
User.hasMany(Review, { foreignKey: 'buyerId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Wishlist belongs to Buyer (User) & Product
User.hasMany(Wishlist, { foreignKey: 'buyerId', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistedBy' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Message belongs to Sender & Receiver (User)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Notification belongs to User
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  Order,
  OrderItem,
  Review,
  Wishlist,
  Message,
  Notification
};
