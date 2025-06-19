const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const User = require('../models/User'); 

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { passcode } = req.body;

    // Validate input
    if (!passcode || typeof passcode !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Valid passcode is required' 
      });
    }

    // Get admin user from database
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(500).json({
        success: false,
        message: 'Admin user not configured'
      });
    }

    // Secure passcode comparison
    const isPasscodeValid = crypto.timingSafeEqual(
      Buffer.from(passcode),
      Buffer.from(process.env.ADMIN_PASSCODE || '')
    );

    if (!isPasscodeValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid passcode' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: adminUser._id,
        role: 'admin',
        iss: 'your-app-name',
        aud: 'your-app-client'
      }, 
      process.env.JWT_SECRET,
      { 
        expiresIn: '1h',
        algorithm: 'HS256'
      }
    );

    // Set secure cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });

    res.json({
      success: true,
      token,
      message: 'Admin login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;