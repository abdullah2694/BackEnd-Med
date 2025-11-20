const jwt = require('jsonwebtoken');
const { logger } = require('../lib/logger');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    logger.warn('Auth failed: no token provided', { method: req.method, url: req.originalUrl });
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    logger.warn('Auth failed: invalid token', { err: err && err.message });
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
