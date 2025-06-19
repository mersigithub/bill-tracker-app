require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'billapp_user',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10 // Optimal for Vercel
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.db.databaseName}`);
    return conn;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

module.exports = connectDB;