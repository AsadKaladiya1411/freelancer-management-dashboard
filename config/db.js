// ============================================================
// ⚠️  DEPRECATED — This file is from the old backend structure.
// The new backend lives in /server/config/db.js
// This file is kept for reference only. Do NOT use it.
// ============================================================

// To use the new backend:
//   cd server
//   npm run dev

console.warn('⚠️  You are using the OLD db.js config. Please use server/config/db.js instead.');

const mongoose = require('mongoose');

const connectDB = async () => {
  // The new config reads from process.env.MONGODB_URI (Atlas)
  // See server/.env for configuration
  const uri = process.env.MONGODB_URI || 'mongodb+srv://your_user:your_pass@cluster0.xxxxx.mongodb.net/freelancer_db';

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    });
    console.log('MongoDB Connected (legacy config)');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
