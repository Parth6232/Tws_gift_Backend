const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Database Connected Successfully');
  } catch (error) {
    console.error('Database Connection error', error);
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 5000));
      return connectDB(retries - 1);
    }
    process.exit(1);
  }
};

module.exports = connectDB;