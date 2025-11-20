const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (!MONGO_URI) {
    console.warn('MONGO_URI not set in environment. DB operations will fail until set.');
    return;
  }

  // Reuse existing connection if available (important for serverless)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Use a global cache to avoid creating many connections in dev/watch
  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGO_URI).then((m) => m.connection);
  }
  return global._mongoosePromise;
}

module.exports = { connectDB };
