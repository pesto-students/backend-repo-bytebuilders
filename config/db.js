const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const url = process.env.MONGO_URL;

const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, { dbName: 'HRMS'})
      .then(() => {
        console.log('MongoDB Connected...');
        resolve();
      })
      .catch((err) => {
        console.error('Error occurred while connecting to MongoDB:', err);
        reject(err);
      });
  });
};

module.exports = connectDB;