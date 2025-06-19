const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  validateResetToken,
  resetPassword 
} = require('../controllers/authController'); // Only import what exists
const { protect } = require('../middlewares/authMiddleware');

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Login user
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);

router.post('/validate-reset-token', validateResetToken);

// PUT /api/auth/reset-password/:token
//router.route('/reset-password/:token')
 // .put(resetPassword);
 router.put('/reset-password/:token', resetPassword);

// @route   POST api/auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
