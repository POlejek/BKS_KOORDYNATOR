const express = require('express');
const router = express.Router();
const obecnoscController = require('../controllers/obecnoscController');

router.get('/druzyna/:druzynaId', obecnoscController.getObecnosciByDruzyna);
router.get('/zawodnik/:zawodnikId', obecnoscController.getObecnosciByZawodnik);
router.post('/druzyna/:druzynaId', obecnoscController.upsertObecnosc);
router.post('/druzyna/:druzynaId/masowo', obecnoscController.saveObecnosciMasowo);
router.delete('/:id', obecnoscController.deleteObecnosc);

module.exports = router;
