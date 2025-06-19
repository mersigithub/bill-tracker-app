const Invoice = require('../models/Invoice');

// Get ALL invoices (for admin)
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('user', 'firstname lastname email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching invoices',
      error: error.message
    });
  }
};

// Existing functions remain the same
exports.uploadInvoice = async (req, res) => {
  try {
    const file = req.file;
    const { month } = req.body;
    const userId = req.user._id;

    const newInvoice = new Invoice({
      user: userId,
      filename: file.filename,
      fileUrl: `/uploads/${file.filename}`,
      month,
    });

    await newInvoice.save();
    res.status(201).json({ 
      success: true,
      message: 'Invoice uploaded', 
      invoice: newInvoice 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getUserInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    const invoices = await Invoice.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getInvoicesByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const invoices = await Invoice.find({ month })
      .populate('user', 'firstname lastname email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};