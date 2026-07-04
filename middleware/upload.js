const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeStorage(subfolder) {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });
}

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan.'));
}

const uploadProduct = multer({
  storage: makeStorage('products'),
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // maks 3MB per file
});

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = { uploadProduct, uploadAvatar };