// Middleware 404 - halaman/route tidak ditemukan
function notFound(req, res, next) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
  }
  res.status(404).render('errors/404', {
    title: 'Halaman Tidak Ditemukan',
    layout: false
  });
}

// Middleware error handler global - menangkap semua error yang dilempar di aplikasi
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.stack || err.message);
  const status = err.status || 500;

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan pada server.'
    });
  }

  res.status(status).render('errors/500', {
    title: 'Terjadi Kesalahan',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan pada server.',
    layout: false
  });
}

module.exports = { notFound, errorHandler };