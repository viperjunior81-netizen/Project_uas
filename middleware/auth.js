// Middleware: memastikan user sudah login (autentikasi)
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' });
  }
  req.flash('error', 'Silakan login terlebih dahulu.');
  return res.redirect('/auth/login');
}

// Middleware: jika sudah login, tidak boleh akses halaman login/register lagi
function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  return next();
}

// Middleware: menyisipkan data user & flash message ke semua view (res.locals)
function attachUserToLocals(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
}

module.exports = { isAuthenticated, isGuest, attachUserToLocals };