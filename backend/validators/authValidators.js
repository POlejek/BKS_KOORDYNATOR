const { body } = require('express-validator');

const loginRules = [
  body('email').isEmail().withMessage('Podaj prawidłowy email').normalizeEmail(),
  body('haslo').notEmpty().withMessage('Hasło jest wymagane'),
];

const registerRules = [
  body('email').isEmail().withMessage('Podaj prawidłowy email').normalizeEmail(),
  body('haslo').isLength({ min: 8 }).withMessage('Hasło musi mieć min. 8 znaków'),
  body('imie').optional().trim(),
  body('rola').optional().isIn(['admin', 'koordynator', 'trener']).withMessage('Nieprawidłowa rola'),
];

module.exports = { loginRules, registerRules };
