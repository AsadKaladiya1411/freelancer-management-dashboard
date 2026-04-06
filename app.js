require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const testRoute = require('./routes/testRoute');

const app = express();
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');

const parseAllowedOrigins = () => {
  const configuredOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000';

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) {
      return true;
    }

    if (allowedOrigin.startsWith('*.')) {
      const suffix = allowedOrigin.slice(1);
      return origin.endsWith(suffix);
    }

    return false;
  });
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin, allowedOrigins)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.use('/api', testRoute);

app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

app.use((error, req, res, next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy does not allow this origin'
    });
  }

  const statusCode = error.statusCode || 500;
  const isOperational = statusCode < 500;

  if (!isOperational) {
    console.error('Unhandled server error:', error);
  }

  return res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : 'Internal server error'
  });
});

module.exports = app;
