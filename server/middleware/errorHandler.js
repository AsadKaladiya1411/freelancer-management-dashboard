const ApiError = require('../utils/ApiError');

/**
 * Global error handler middleware
 * Handles Mongoose, JWT, Atlas network, and custom API errors
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value for '${field}'. This ${field} already exists.`;
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = messages.join('. ');
    error = new ApiError(400, message, messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // MongoDB Atlas / Network errors
  if (err.name === 'MongoServerError') {
    if (err.code === 8000 || err.codeName === 'AtlasError') {
      error = new ApiError(503, 'Database service temporarily unavailable. Please try again.');
    }
  }

  if (err.name === 'MongoNetworkError' || err.name === 'MongoNetworkTimeoutError') {
    error = new ApiError(503, 'Database connection lost. Please try again in a moment.');
  }

  if (err.name === 'MongoServerSelectionError') {
    error = new ApiError(503, 'Unable to connect to database. The service may be starting up.');
  }

  // Mongoose disconnected during operation
  if (err.message?.includes('buffering timed out')) {
    error = new ApiError(503, 'Database operation timed out. Please try again.');
  }

  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
