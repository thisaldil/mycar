import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required.' });
    req.user = user;
    next();
  } catch (error) {
    next(error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError'
      ? Object.assign(new Error('Invalid or expired token.'), { status: 401 })
      : error);
  }
}
