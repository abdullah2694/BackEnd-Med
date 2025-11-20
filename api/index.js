
const serverless = require('serverless-http');
const app = require('../app.js');
const { connectDB } = require('../lib/db');
const { logger } = require('../lib/logger');

// Connect to DB once when the module is loaded (cold-start)
connectDB()
  .then(() => {
    if (process.env.MONGO_URI) logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', { message: err && err.message ? err.message : err });
  });

module.exports = serverless(app);
