require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`${envVar} is required`);
    process.exit(1);
  }
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

