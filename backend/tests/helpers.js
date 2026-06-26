const jwt = require('jsonwebtoken');

// Generuje token dla testów (JWT_SECRET ustawiony w setup.js)
function tokenDla(rola = 'koordynator', id = '507f1f77bcf86cd799439011') {
  return jwt.sign({ sub: id, rola, email: `${rola}@test.pl` }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

function authHeader(rola) {
  return `Bearer ${tokenDla(rola)}`;
}

module.exports = { tokenDla, authHeader };
