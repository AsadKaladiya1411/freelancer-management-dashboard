const mongoose = require('mongoose');
const dns = require('dns');

// Force Google Public DNS — fixes SRV lookup failures on restrictive ISP/network DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * MongoDB Atlas Connection Configuration
 * Handles: DNS SRV connections, SSL, retryWrites, connection pooling,
 * graceful reconnection, health monitoring, and production-ready error handling
 */

const ATLAS_OPTIONS = {
  // Connection pool
  maxPoolSize: 10,
  minPoolSize: 2,

  // Timeouts
  serverSelectionTimeoutMS: 10000,   // 10s to find a server
  socketTimeoutMS: 45000,            // 45s socket timeout
  connectTimeoutMS: 10000,           // 10s to establish connection

  // Write concern
  retryWrites: true,
  w: 'majority',

  // Heartbeat
  heartbeatFrequencyMS: 10000,       // Check server health every 10s
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  // Validate URI format
  const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');
  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

  if (process.env.NODE_ENV === 'production' && isLocal) {
    console.error('❌ Cannot use local MongoDB in production. Please set MONGODB_URI to your Atlas connection string.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, ATLAS_OPTIONS);

    const { host, port, name } = conn.connection;
    console.log(`\n✅ MongoDB Connected Successfully`);
    console.log(`   Host: ${host}${port ? ':' + port : ''}`);
    console.log(`   Database: ${name}`);
    console.log(`   Mode: ${isAtlas ? '☁️  Atlas (Cloud)' : '💻 Local'}`);
    console.log(`   Pool Size: ${ATLAS_OPTIONS.maxPoolSize}\n`);

    return conn;
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed`);

    // Provide helpful error messages based on error type
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   → DNS resolution failed. Check your Atlas cluster hostname.');
      console.error('   → Make sure your internet connection is active.');
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      console.error('   → Authentication failed. Check your username and password in MONGODB_URI.');
      console.error('   → Make sure the database user exists in Atlas → Database Access.');
    } else if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('network')) {
      console.error('   → Network access denied. Add your IP to Atlas → Network Access.');
      console.error('   → For development, you can allow 0.0.0.0/0 (all IPs).');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
      console.error('   → Connection timed out. Check:');
      console.error('     1. Your Atlas cluster is running (not paused)');
      console.error('     2. Your IP is whitelisted in Atlas → Network Access');
      console.error('     3. Your firewall is not blocking port 27017');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('   → SSL/TLS error. Atlas requires TLS 1.2+.');
      console.error('   → Make sure your Node.js version supports TLS 1.2.');
    } else {
      console.error(`   → ${error.message}`);
    }

    console.error(`\n   Full Error: ${error.message}\n`);
    process.exit(1);
  }
};

// ===== Connection Event Handlers =====

mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to database');
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from database');
  // Mongoose auto-reconnects by default in v6+
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

// ===== Graceful Shutdown =====

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ===== Health Check Helper =====

/**
 * Check if the database connection is healthy
 * @returns {Object} { connected, readyState, host, latencyMs }
 */
const getDBHealth = async () => {
  const state = mongoose.connection.readyState;
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  let latencyMs = null;
  if (state === 1) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      latencyMs = Date.now() - start;
    } catch (e) {
      latencyMs = -1;
    }
  }

  return {
    connected: state === 1,
    readyState: stateMap[state] || 'unknown',
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || null,
    latencyMs,
  };
};

module.exports = { connectDB, getDBHealth };
