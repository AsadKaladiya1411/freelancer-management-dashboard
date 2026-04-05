require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required');
  process.exit(1);
}

const parseAllowedOrigins = () => {
  const origins = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000';
  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server calls and local tools with no origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// MongoDB connection
const connectDB = require('./config/db');
connectDB();

// Routes
const testRoute = require('./routes/testRoute');
app.use('/api', testRoute);

app.use('/api', (req, res) => {
  return res.status(404).json({ message: 'API route not found' });
});

app.use((error, req, res, next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy does not allow this origin' });
  }

  console.error('Unhandled server error:', error);
  return res.status(500).json({ message: 'Server error' });
});

if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

