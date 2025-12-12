const express = require('express');
const router = express.Router();
const ustawieniaController = require('../controllers/ustawieniaController');

router.get('/', ustawieniaController.getUstawienia);
router.put('/', ustawieniaController.updateUstawienia);
router.post('/dna-techniki', ustawieniaController.addDnaTechniki);
router.post('/cele-motoryczne', ustawieniaController.addCelMotoryczny);
router.post('/cele-mentalne', ustawieniaController.addCelMentalny);

module.exports = router;
