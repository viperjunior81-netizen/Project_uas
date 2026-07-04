require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const { Server } = require("socket.io");

const { sequelize } = require("./config/db");
const { attachUserToLocals } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const requestLogger = require("./middleware/logger");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set("io", io);

// =====================
// View engine (EJS + layout)
// =====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// =====================
// Core middleware
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(requestLogger);
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "rawr_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 hari
  })
);
app.use(flash());
app.use(attachUserToLocals);

// =====================
// Load Models & Associations
// =====================
const { Product } = require("./models");

// =====================
// Routes
// =====================
app.get("/", (req, res) => res.redirect("/products"));

app.use("/auth", require("./routes/authRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/", require("./routes/orderRoutes")); // /checkout, /orders, /orders/:id, /reviews
app.use("/seller", require("./routes/sellerRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/wishlist", require("./routes/wishlistRoutes"));
app.use("/chat", require("./routes/chatRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));
app.use("/api", require("./routes/apiRoutes"));

// =====================
// 404 & Error handling
// =====================
app.use(notFound);
app.use(errorHandler);

// =====================
// Socket.IO — join room pribadi berdasarkan userId
// =====================
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });
});

// =====================
// Database Connection
// =====================
const PORT = process.env.PORT || 3000;

async function ensureOrderItemsSellerId() {
  const qi = sequelize.getQueryInterface();
  const tables = await qi.showAllTables();
  if (!tables.includes("OrderItems")) return; // tabel belum ada -> sync akan buat dari awal, sudah benar

  const columns = await qi.describeTable("OrderItems");
  if (columns.sellerId) return; // kolom sudah ada, tidak perlu perbaikan

  console.log("🔧 Kolom OrderItems.sellerId tidak ditemukan (skema lama). Memperbaiki otomatis...");

  await sequelize.query("ALTER TABLE `OrderItems` ADD COLUMN `sellerId` INT NULL");
  await sequelize.query(`
    UPDATE \`OrderItems\` oi
    JOIN \`Products\` p ON p.id = oi.productId
    SET oi.sellerId = p.sellerId
    WHERE oi.sellerId IS NULL
  `);

  const [[{ orphanCount }]] = await sequelize.query(
    "SELECT COUNT(*) AS orphanCount FROM `OrderItems` WHERE sellerId IS NULL"
  );

  if (Number(orphanCount) > 0) {
    console.log(
      `${orphanCount} baris OrderItems tidak bisa diperbaiki otomatis (produk sudah dihapus). ` +
      "Kolom sellerId dibiarkan boleh kosong untuk baris tsb."
    );
  } else {
    await sequelize.query("ALTER TABLE `OrderItems` MODIFY COLUMN `sellerId` INT NOT NULL");
    await sequelize.query(
      "ALTER TABLE `OrderItems` ADD CONSTRAINT `OrderItems_sellerId_fk` FOREIGN KEY (`sellerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE"
    );
  }

  console.log("Perbaikan kolom OrderItems.sellerId selesai. Pesanan lama akan muncul kembali ke penjual.");
}

sequelize
  .authenticate()
  .then(() => {
    console.log("Database Connected");
    return ensureOrderItemsSellerId();
  })
  .then(() => {
    // alter:true supaya Sequelize otomatis menambahkan kolom/relasi baru
    // ke tabel yang sudah lebih dulu ada di database, bukan cuma membuat
    // tabel yang benar-benar baru.
    return sequelize.sync({ alter: true });
  })
  .then(async () => {
    console.log("Database Synced");

    // Cek apakah tabel produk masih kosong (biasanya berarti belum di-seed)
    const totalProducts = await Product.count().catch(() => 0);
    if (totalProducts === 0) {
      console.log("  Database masih kosong (belum ada data produk).");
      console.log("   Jalankan perintah berikut untuk mengisi data awal (akun demo + produk):");
      console.log("   npm run seed");
    }

    server.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Gagal terhubung ke database:", err.message);
  });
