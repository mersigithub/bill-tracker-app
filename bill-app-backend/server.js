require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

console.log('Starting app...');

// Print environment info
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const app = express();

// Middleware Setup
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bill-app-frontend.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// DB connection function
const connectDB = async () => {
  console.log('Connecting to MongoDB...');
  const connectionOptions = {
    dbName: 'billapp_user',
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 2,
    heartbeatFrequencyMS: 10000
  };

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    console.log(`✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.db.databaseName}`);

    mongoose.connection.on('connected', () => console.log('Mongoose connected event fired'));
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected!');
      if (process.env.NODE_ENV === 'production') {
        console.log('Trying to reconnect in 5 seconds...');
        setTimeout(connectDB, 5000);
      }
    });
    mongoose.connection.on('error', err => console.error('Mongoose connection error:', err));
    return connection;
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    throw err;
  }
};

// Routes setup
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/invoices', require('./routes/invoiceRoutes'));
  app.use('/api/admin/invoices', require('./routes/invoiceRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  console.log('Routes loaded successfully');
} catch (routeErr) {
  console.error('Failed loading routes:', routeErr);
}

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({
    status: 'OK',
    message: 'Backend is operational',
    database: dbStatus,
    uptime: `${process.uptime().toFixed(2)} seconds`,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => res.send('Backend API is running ✅'));

const startServer = async () => {
  try {
    console.log('Starting DB connection...');
    await connectDB();
    console.log('DB connected');

    const PORT = parseInt(process.env.PORT, 10) || 5000;
    console.log(`Starting server on port ${PORT}`);

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        mongoose.disconnect();
        console.log('Process terminated');
      });
    });
  } catch (startErr) {
    console.error('Fatal error during server startup:', startErr);
    // Fail gracefully
    process.exit(1);
  }
};

if (process.env.VERCEL_ENV) {
  module.exports = app;
} else {
  startServer();
}
