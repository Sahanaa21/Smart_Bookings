const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).lean();
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Account is inactive or unavailable' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
