import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Extract token from httpOnly cookie or Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.',
      });
    }

    // 2. Verify token
    const secret = process.env.JWT_SECRET || 'kachra_bazar_super_secure_jwt_secret_sirte_2026';
    const decoded = jwt.verify(token, secret);

    // 3. Find user and check if active
    const user = await User.findById(decoded.id).select('+passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists or is disabled.',
      });
    }

    // Attach user to request (omit passwordHash for security)
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};

// Role-based access control middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is '${req.user?.role}'.`,
      });
    }
    next();
  };
};

// Generate JWT token and set httpOnly cookie
export const sendTokenResponse = (user, statusCode, res) => {
  const secret = process.env.JWT_SECRET || 'kachra_bazar_super_secure_jwt_secret_sirte_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('token', token, cookieOptions);

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;
  delete userObj.__v;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};
