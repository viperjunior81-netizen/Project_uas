-- =========================================================
-- SKEMA DATABASE: ecommerce_uas (MySQL)
-- Catatan: file ini hanya REFERENSI. Saat aplikasi dijalankan,
-- Sequelize (sequelize.sync({ alter: true })) akan otomatis
-- membuat/menyesuaikan seluruh tabel berikut berdasarkan model
-- di folder /models. Import manual file ini bersifat opsional.
-- =========================================================

CREATE DATABASE IF NOT EXISTS `ecommerce_uas`;
USE `ecommerce_uas`;

-- 1. TABEL USER (Admin, Seller, Buyer)
CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'seller', 'buyer') DEFAULT 'buyer',
  `phone` VARCHAR(50) DEFAULT '',
  `address` VARCHAR(255) DEFAULT '',
  `avatar` VARCHAR(255) DEFAULT '/img/default-avatar.png',
  `storeName` VARCHAR(255) DEFAULT '',
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TABEL KATEGORI
CREATE TABLE IF NOT EXISTS `Categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. TABEL PRODUK
CREATE TABLE IF NOT EXISTS `Products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(12,2) NOT NULL,
  `stock` INT DEFAULT 0,
  `images` TEXT, -- JSON string array path gambar, contoh: ["/uploads/products/a.jpg"]
  `sellerId` INT NOT NULL,
  `categoryId` INT NOT NULL,
  `ratingAvg` DECIMAL(2,1) DEFAULT 0,
  `ratingCount` INT DEFAULT 0,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`sellerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TABEL KERANJANG BELANJA (Cart)
CREATE TABLE IF NOT EXISTS `Carts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyerId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` INT DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_buyer_product` (`buyerId`, `productId`),
  FOREIGN KEY (`buyerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. TABEL PESANAN (Order)
CREATE TABLE IF NOT EXISTS `Orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyerId` INT NOT NULL,
  `totalAmount` DECIMAL(12,2) NOT NULL,
  `shippingAddress` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  `notes` VARCHAR(255) DEFAULT '',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. TABEL ITEM PESANAN (OrderItems) -- sebelumnya hilang dari skema awal
CREATE TABLE IF NOT EXISTS `OrderItems` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `sellerId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sellerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. TABEL ULASAN (Review)
CREATE TABLE IF NOT EXISTS `Reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyerId` INT NOT NULL,
  `productId` INT NOT NULL,
  `orderId` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_review` (`buyerId`, `productId`, `orderId`),
  FOREIGN KEY (`buyerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. TABEL WISHLIST
CREATE TABLE IF NOT EXISTS `Wishlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyerId` INT NOT NULL,
  `productId` INT NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_wishlist` (`buyerId`, `productId`),
  FOREIGN KEY (`buyerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. TABEL PESAN CHAT (Message untuk Real-time Chat / RTC)
CREATE TABLE IF NOT EXISTS `Messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversationId` VARCHAR(50) NOT NULL,
  `senderId` INT NOT NULL,
  `receiverId` INT NOT NULL,
  `text` TEXT NOT NULL,
  `isRead` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`senderId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiverId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. TABEL NOTIFIKASI
CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `type` ENUM('order', 'chat', 'system') DEFAULT 'system',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(255) DEFAULT '',
  `isRead` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. TABEL SESSION (dibuat otomatis oleh connect-session-sequelize)
CREATE TABLE IF NOT EXISTS `Sessions` (
  `sid` VARCHAR(36) PRIMARY KEY,
  `expires` DATETIME,
  `data` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;