const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelancer_db';

  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required in production environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

