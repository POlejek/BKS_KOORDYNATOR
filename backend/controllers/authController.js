const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const TOKEN_TTL = process.env.JWT_TTL || '8h';

function podpiszToken(user) {
  return jwt.sign({ sub: user._id.toString(), rola: user.rola, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, haslo } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase(), aktywny: true }).select(
      '+haslo'
    );

    if (!user || !(await user.porownajHaslo(haslo))) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
    }

    const token = podpiszToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, imie: user.imie, rola: user.rola },
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd logowania' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    res.json({ id: user._id, email: user.email, imie: user.imie, rola: user.rola });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// POST /api/auth/register (tylko admin)
exports.register = async (req, res) => {
  try {
    const { email, haslo, imie, rola } = req.body;
    const istnieje = await User.findOne({ email: String(email).toLowerCase() });
    if (istnieje) {
      return res.status(400).json({ message: 'Użytkownik o tym emailu już istnieje' });
    }
    const user = await User.create({ email, haslo, imie, rola });
    res.status(201).json({ id: user._id, email: user.email, imie: user.imie, rola: user.rola });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
