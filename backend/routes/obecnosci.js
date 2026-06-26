const express = require('express');
const router = express.Router();
const obecnoscController = require('../controllers/obecnoscController');
const { requireRole } = require('../middleware/auth');

// Odczyt – każdy zalogowany. Zapis obecności – trener i wyżej.
const moznaEdytowac = requireRole('admin', 'koordynator', 'trener');

router.get('/druzyna/:druzynaId', obecnoscController.getObecnosciByDruzyna);
router.get('/zawodnik/:zawodnikId', obecnoscController.getObecnosciByZawodnik);
router.post('/druzyna/:druzynaId', moznaEdytowac, obecnoscController.upsertObecnosc);
router.post('/druzyna/:druzynaId/masowo', moznaEdytowac, obecnoscController.saveObecnosciMasowo);
router.delete('/:id', moznaEdytowac, obecnoscController.deleteObecnosc);

module.exports = router;
