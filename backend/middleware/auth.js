const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-niebezpieczny-sekret-zmien-mnie';

/**
 * Weryfikuje token Bearer i ustawia req.user = { id, rola, email }.
 * Zwraca 401, jeśli token jest brakujący lub nieprawidłowy.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Brak autoryzacji – zaloguj się' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, rola: payload.rola, email: payload.email };
    next();
  } catch (_err) {
    return res.status(401).json({ message: 'Token nieprawidłowy lub wygasł' });
  }
}

/**
 * Wymaga, aby zalogowany użytkownik miał jedną z podanych ról.
 * Użycie: router.post('/', requireAuth, requireRole('admin', 'koordynator'), handler)
 */
function requireRole(...role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Brak autoryzacji' });
    }
    if (!role.includes(req.user.rola)) {
      return res.status(403).json({ message: 'Brak uprawnień do tej operacji' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };
