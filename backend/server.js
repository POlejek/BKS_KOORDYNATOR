require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { requireAuth } = require('./middleware/auth');

const app = express();

// Bezpieczne nagłówki HTTP
app.use(helmet());

// CORS – allowlista z FRONTEND_URL (oddzielone przecinkami). Brak '*'.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Brak origin (np. narzędzia serwerowe, healthcheck) – przepuść
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Niedozwolone źródło CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Globalny limiter zapytań
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Trasy publiczne
app.use('/api/auth', require('./routes/auth'));

// Trasy API – wszystkie wymagają zalogowania
app.use('/api/zawodnicy', requireAuth, require('./routes/zawodnicy'));
app.use('/api/druzyny', requireAuth, require('./routes/druzyny'));
app.use('/api/obecnosci', requireAuth, require('./routes/obecnosci'));
app.use('/api/plany-szkoleniowe', requireAuth, require('./routes/planySzkoleniowe'));
app.use('/api/ustawienia', requireAuth, require('./routes/ustawienia'));
app.use('/api/kontrole-meczowe', requireAuth, require('./routes/kontroleMeczowe'));

// Podstawowa trasa / healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'BKS Koordynator API', version: '1.0.0' });
});

// Obsługa błędów – nie ujawniaj szczegółów klientowi
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  if (err.message === 'Niedozwolone źródło CORS') {
    return res.status(403).json({ message: 'Niedozwolone źródło CORS' });
  }
  res.status(err.status || 500).json({ message: 'Wystąpił błąd serwera' });
});

// Start serwera tylko gdy plik uruchomiony bezpośrednio (nie w testach)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
    })
    .catch((err) => console.error('Błąd połączenia z MongoDB:', err));
}

module.exports = app;
