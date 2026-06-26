const mongoose = require('mongoose');

/**
 * Łączy z MongoDB. URI brany ze zmiennej środowiskowej MONGODB_URI,
 * z fallbackiem na lokalną bazę (przydatne w developmencie).
 */
async function connectDB(uri = process.env.MONGODB_URI) {
  const mongoUri = uri || 'mongodb://localhost:27017/bks_koordynator';
  await mongoose.connect(mongoUri);
  console.log('Połączono z MongoDB');
  return mongoose.connection;
}

module.exports = connectDB;
