const mongoose = require('mongoose');

const BUCKET_NAME = 'dokumenty';

/**
 * Zwraca instancję GridFSBucket osadzoną na aktywnym połączeniu mongoose.
 * Pliki zawodników trzymamy w MongoDB (GridFS), aby przetrwały redeploy
 * na efemerycznym systemie plików (np. Railway).
 */
function getBucket() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Brak połączenia z bazą danych');
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
}

module.exports = { getBucket, BUCKET_NAME };
