const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Middleware to ensure DB connection per request (ideal for serverless & traditional servers)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check endpoint (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running smoothly.' });
});

// Root API info
app.get(['/api', '/api/'], (req, res) => {
  res.json({ status: 'ok', message: 'Kamrul Yarn Trading API is active.' });
});

// App State routes (supports both /api/state and /state)
app.use(['/api/state', '/state'], require('./routes/state'));

// Normalized API routes (supports both /api and /)
app.use(['/api', '/'], require('./routes/api'));

// Express error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ status: 'error', message: err.message || 'Server error occurred.' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
