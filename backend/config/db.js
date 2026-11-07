const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri && process.env.VERCEL) {
    throw new Error(
      'MONGO_URI is missing in Vercel Environment Variables. Please add your MongoDB Atlas connection string in Vercel Project Settings > Environment Variables.'
    );
  }

  try {
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/kamrul-yarn-trading', {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
