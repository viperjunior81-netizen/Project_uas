// Middleware logger sederhana - mencatat setiap request yang masuk beserta info user
function requestLogger(req, res, next) {
  const time = new Date().toISOString();
  const userInfo = req.session && req.session.user ? `[${req.session.user.role}:${req.session.user.email}]` : '[guest]';
  console.log(`${time} ${req.method} ${req.originalUrl} ${userInfo}`);
  next();
}

module.exports = requestLogger;