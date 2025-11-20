const app = require('./app');
const { connectDB } = require('./lib/db');
const { logger } = require('./lib/logger');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    if (process.env.MONGO_URI) logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', { message: err && err.message ? err.message : err });
  }

  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
})();
