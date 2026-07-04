// Middleware otorisasi: hanya boleh diakses oleh role tertentu
// Penggunaan: authorizeRoles('admin'), authorizeRoles('admin', 'seller'), dst.
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' });
      }
      req.flash('error', 'Silakan login terlebih dahulu.');
      return res.redirect('/auth/login');
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({ success: false, message: 'Akses ditolak untuk role ini.' });
      }
      return res.status(403).render('errors/403', {
        title: 'Akses Ditolak',
        layout: false
      });
    }

    next();
  };
}

module.exports = authorizeRoles;