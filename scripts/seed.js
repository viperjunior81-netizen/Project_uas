require('dotenv').config();
const { sequelize, User, Category, Product } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    console.log('🌱 Menjalankan seeder...');

    // ===== Users =====
    const demoUsers = [
      { name: 'Admin Rawr', email: 'admin@pasar.id', password: 'password123', role: 'admin' },
      { name: 'Toko Sejahtera', email: 'seller@pasar.id', password: 'password123', role: 'seller', storeName: 'Toko Sejahtera' },
      { name: 'Budi Pembeli', email: 'buyer@pasar.id', password: 'password123', role: 'buyer' }
    ];

    const users = {};
    for (const u of demoUsers) {
      const [user] = await User.findOrCreate({ where: { email: u.email }, defaults: u });
      users[u.role] = user;
    }

    // ===== Categories =====
    const demoCategories = [
      { name: 'Elektronik', slug: 'elektronik', description: 'Gadget dan perangkat elektronik' },
      { name: 'Fashion', slug: 'fashion', description: 'Pakaian dan aksesoris' },
      { name: 'Peralatan Rumah', slug: 'peralatan-rumah', description: 'Kebutuhan rumah tangga' }
    ];

    const categories = [];
    for (const c of demoCategories) {
      const [cat] = await Category.findOrCreate({ where: { slug: c.slug }, defaults: c });
      categories.push(cat);
    }

    // ===== Products =====
    const seller = users.seller;
    const demoProducts = [
      { name: 'Mechanical Keyboard RGB', description: 'Keyboard mekanikal dengan lampu RGB.', price: 450000, stock: 25, categoryId: categories[0].id },
      { name: 'Wireless Gaming Mouse', description: 'Mouse gaming nirkabel presisi tinggi.', price: 299000, stock: 40, categoryId: categories[0].id },
      { name: 'Kaos Polos Premium', description: 'Kaos katun combed 30s.', price: 85000, stock: 100, categoryId: categories[1].id },
      { name: 'Deskmat XL Minimalist', description: 'Alas meja ukuran besar, desain minimalis.', price: 150000, stock: 30, categoryId: categories[2].id }
    ];

    for (const p of demoProducts) {
      await Product.findOrCreate({ where: { name: p.name, sellerId: seller.id }, defaults: { ...p, sellerId: seller.id } });
    }

    console.log('✅ Seeder selesai. Akun demo:');
    console.log('   admin@pasar.id / password123');
    console.log('   seller@pasar.id / password123');
    console.log('   buyer@pasar.id / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder gagal:', err);
    process.exit(1);
  }
}

seed();
