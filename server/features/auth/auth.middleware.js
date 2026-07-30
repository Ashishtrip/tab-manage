import jwt from 'jsonwebtoken';
import User from '../users/users.model.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};
