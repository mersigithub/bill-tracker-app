const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

// Admin login endpoint
router.post('/login', async (req, res) => {
  const { passcode } = req.body;

  if (!passcode || passcode !== process.env.ADMIN_PASSCODE) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid admin passcode' 
    });
  }

  // Simulate an admin user (replace with real DB lookup if necessary)
  const adminUser = {
    id: 'admin-static-id',
    role: 'admin',
    isAdmin: true
  };

  // Create token with userId, role, and isAdmin
  const token = jwt.sign(
    {
      userId: adminUser.id,
      role: adminUser.role,
      isAdmin: adminUser.isAdmin
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    token,
    user: adminUser,
    message: 'Admin login successful'
  });
});

// Get all members (non-admin users)
router.get('/members', adminMiddleware, async (req, res) => {
  try {
    const members = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .lean();
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all invoices
router.get('/invoices', adminMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('user', 'firstname lastname email')
      .lean();
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available months for invoices
router.get('/invoices/months', adminMiddleware, async (req, res) => {
  try {
    const months = await Invoice.aggregate([
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    res.json({ success: true, data: months });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
