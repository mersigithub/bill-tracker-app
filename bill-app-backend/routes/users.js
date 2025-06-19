const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, 'firstname lastname email phonenumber role createdAt');
    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
