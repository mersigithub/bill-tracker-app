const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Invoice = require('../models/Invoice');
const { protect, adminMiddleware } = require('../middlewares/authMiddleware'); // Using your existing protect middleware
const jwt = require('jsonwebtoken');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin login endpoint
router.post('/login', async (req, res) => {
  const { passcode } = req.body;

  if (!passcode || passcode !== process.env.ADMIN_PASSCODE) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin passcode'
    });
  }

  // Create token (you might want to use an actual admin user from DB)
  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    token,
    message: 'Admin login successful'
  });
});

// Upload invoice - using your protect middleware
router.post('/upload', protect, upload.single('invoice'), async (req, res) => {
  try {
    const { month } = req.body;
    const { filename, mimetype, path: filePath, size } = req.file;

    // Check if invoice already exists for this month and user
    const existingInvoice = await Invoice.findOne({
      user: req.user._id,
      month
    });

    if (existingInvoice) {
      // Delete the newly uploaded file since we won't be using it
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Invoice for ${month} already exists`
      });
    }

    const newInvoice = new Invoice({
      user: req.user._id,
      month,
      fileName: filename,
      fileType: mimetype,
      fileSize: size,
      url: `/uploads/${filename}`
    });

    await newInvoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice uploaded successfully',
      data: newInvoice
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload invoice'
    });
  }
});

// Get all invoices for the authenticated user, optionally filtered by month
router.get('/', protect, async (req, res) => {
  try {
    const { month } = req.query; // Retrieve the month from query parameters

    // Build the query object
    const query = { user: req.user._id };
    if (month) {
      // Ensure the month is a valid number between 1 and 12
      const monthNumber = parseInt(month, 10);
      if (monthNumber >= 1 && monthNumber <= 12) {
        query.month = monthNumber;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid month. Please provide a month between 1 and 12.'
        });
      }
    }

    // Fetch invoices based on the constructed query
    const invoices = await Invoice.find(query).sort({ month: 1 });

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
});

// @route   GET /api/invoices/month/:month
// @desc    Get all invoices for a given month (admin)
// @access  Admin only
router.get('/month/:month', adminMiddleware, async (req, res) => {
  const { month } = req.params;
  const monthRegex = new RegExp(`^${month.trim()}$`, 'i');

  const invoices = await Invoice.find({
    month: { $regex: monthRegex }
  }).populate('user', 'firstname lastname email');

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices
  });
});

// @route   GET /api/invoices/months
// @desc    Get all months, including those with and without invoices (admin)
// @access  Admin
router.get('/months', protect, adminMiddleware, async (req, res) => {
  try {
    // Get all distinct months where invoices exist
    const monthsWithInvoices = await Invoice.distinct('month');

    // Define the complete list of months (January to December)
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Now merge and return all months in chronological order
    // Include months that have invoices and ensure we keep all months
    const fullMonthsList = allMonths;

    // Return the full months list
    res.status(200).json({ success: true, data: fullMonthsList });
  } catch (error) {
    console.error('Error fetching months:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch months' });
  }
});

module.exports = router;
