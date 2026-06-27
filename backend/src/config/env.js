const dotenv = require('dotenv');
dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_bookings',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '8h',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = env;
