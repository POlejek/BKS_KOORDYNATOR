const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { loginRules, registerRules } = require('../validators/authValidators');

// Ostrzejszy limiter dla logowania (ochrona przed brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Zbyt wiele prób logowania. Spróbuj ponownie później.' },
});

router.post('/login', loginLimiter, validate(loginRules), authController.login);
router.get('/me', requireAuth, authController.me);
router.post(
  '/register',
  requireAuth,
  requireRole('admin'),
  validate(registerRules),
  authController.register
);

module.exports = router;
