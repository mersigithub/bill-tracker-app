const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

// Stricter rate limiter for admin endpoints
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // More strict than regular users (3 attempts)
  message: 'Too many admin login attempts. Please try again later.',
  skipSuccessfulRequests: true // Only count failed attempts
});

// Admin login endpoint - Updated to return token in response
router.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({
        success: false,
        message: 'Passcode is required'
      });
    }

    if (passcode !== process.env.ADMIN_PASSCODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin passcode'
      });
    }

    // Find or create admin user
    let adminUser = await User.findOneAndUpdate(
      { role: 'admin' },
      { 
        $setOnInsert: {
          email: process.env.ADMIN_EMAIL || 'admin@example.com',
          role: 'admin',
          firstname: 'Admin',
          lastname: 'User',
          isVerified: true
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Create token
    const token = jwt.sign(
      {
        userId: adminUser._id,
        role: 'admin',
        isAdmin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 3600000 // 1 hour
    });

    // Return success response with token
    res.json({
      success: true,
      message: 'Admin login successful',
      token, // Include token in response for API clients
      user: {
        id: adminUser._id,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin logout
/*router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ 
    success: true, 
    message: 'Admin logged out successfully' 
  });
});*/

// Admin-only routes
const { adminMiddleware } = require('../middlewares/authMiddleware');

// Get all members
router.get('/members', adminMiddleware, async (req, res) => {
  try {
    const members = await User.find({ role: { $ne: 'admin' } })
      .select('-password -__v -verificationToken');
      
    res.json({ 
      success: true, 
      count: members.length,
      data: members 
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve members' 
    });
  }
});

router.get('/invoices', adminMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('user', 'firstname lastname email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
});
module.exports = router;