const express = require('express');
const router = express.Router();
const ustawieniaController = require('../controllers/ustawieniaController');
const { requireRole } = require('../middleware/auth');

// Ustawienia klubu może zmieniać tylko admin / koordynator
const moznaEdytowac = requireRole('admin', 'koordynator');

router.get('/', ustawieniaController.getUstawienia);
router.put('/', moznaEdytowac, ustawieniaController.updateUstawienia);
router.post('/dna-techniki', moznaEdytowac, ustawieniaController.addDnaTechniki);
router.post('/cele-motoryczne', moznaEdytowac, ustawieniaController.addCelMotoryczny);
router.post('/cele-mentalne', moznaEdytowac, ustawieniaController.addCelMentalny);

module.exports = router;
