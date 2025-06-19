const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect regular user routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use decoded.userId if that's what your user token contains
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);

    let message = 'Not authorized, token failed';
    if (error.name === 'JsonWebTokenError') {
      message = 'Not authorized, invalid token';
    } else if (error.name === 'TokenExpiredError') {
      message = 'Not authorized, token expired';
    }

    return res.status(401).json({
      success: false,
      message,
      error: error.message
    });
  }
};

// Middleware for admin-only routes
const adminMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.adminToken || 
                  req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin' || !decoded.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = { protect, adminMiddleware };
