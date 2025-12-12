require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statyczne pliki (dla uploadowanych dokumentów)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bks_koordynator')
.then(() => console.log('Połączono z MongoDB'))
.catch((err) => console.error('Błąd połączenia z MongoDB:', err));

// Trasy API
app.use('/api/zawodnicy', require('./routes/zawodnicy'));
app.use('/api/druzyny', require('./routes/druzyny'));
app.use('/api/obecnosci', require('./routes/obecnosci'));
app.use('/api/plany-szkoleniowe', require('./routes/planySzkoleniowe'));
app.use('/api/ustawienia', require('./routes/ustawienia'));

// Podstawowa trasa
app.get('/', (req, res) => {
  res.json({ 
    message: 'BKS Koordynator API',
    version: '1.0.0'
  });
});

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Wystąpił błąd serwera',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

module.exports = app;
