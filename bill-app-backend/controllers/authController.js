const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register User
const registerUser = async (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;

  try {
    // Validation
    if (!firstname || !lastname || !email || !phonenumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstname,
      lastname,
      email,
      phonenumber,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phonenumber: user.phonenumber
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials! Please login with correct email and password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true }); // Security: don't reveal if user exists
    }

    // Generate and log the unhashed token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('🔑 UNHASHED RESET TOKEN:', resetToken); // <-- THIS IS CRUCIAL

    // Hash the token for database storage
    const hashedToken = crypto.createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Send email (verify this is working)
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: `Reset link: ${resetUrl}`
    });

    res.json({ success: true, message: 'Reset email sent' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Validate Reset Token
const validateResetToken = async (req, res) => {
  const { token } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token Validation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating token'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log('\n=== RESET PASSWORD DEBUG ===');
  console.log('🔑 Received raw token:', token);
  console.log('🔄 Password to set:', password);

  try {
    if (!token || !password) {
      console.log('❌ Missing token or password');
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('🔒 Hashed token:', hashedToken);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    console.log('👤 User found:', user ? user.email : 'NO USER FOUND');
    if (user) {
      console.log('⏰ Token expires:', new Date(user.resetPasswordExpire));
      console.log('⏱️ Current time:', new Date());
      console.log('🕒 Time remaining:', 
        Math.round((user.resetPasswordExpire - Date.now()) / 1000 / 60) + ' minutes');
    }

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    console.log('✅ Password updated for:', user.email);

    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('❌ Reset error:', error);
    
    // Specific error handling
    if (error.name === 'ValidationError') {
      console.log('Validation errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: process.env.NODE_ENV === 'development' ? error.errors : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  validateResetToken,
  resetPassword,
  generateToken
};
