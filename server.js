const app = require('./app');
const { connectDB } = require('./lib/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    if (process.env.MONGO_URI) console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
