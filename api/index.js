const serverless = require('serverless-http');
const app = require('../app');
const { connectDB } = require('../lib/db');

// Connect to DB once when the module is loaded (cold-start)
connectDB().catch((err) => {
  console.error('Error connecting to DB in serverless handler:', err && err.message ? err.message : err);
});

module.exports = serverless(app);
