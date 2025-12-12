const express = require('express');
const router = express.Router();
const kontrolaMeczowaController = require('../controllers/kontrolaMeczowaController');

// Pobierz wszystkie kontrole meczowe (z opcjonalnym filtrem po drużynie)
router.get('/', kontrolaMeczowaController.getAllKontroleMeczowe);

// Pobierz kontrole meczowe dla drużyny w okresie
router.get('/by-period', kontrolaMeczowaController.getKontroleMeczoweByDruzynaAndPeriod);

// Pobierz pojedynczą kontrolę meczową
router.get('/:id', kontrolaMeczowaController.getKontrolaMeczowa);

// Utwórz nową kontrolę meczową
router.post('/', kontrolaMeczowaController.createKontrolaMeczowa);

// Zaktualizuj kontrolę meczową
router.put('/:id', kontrolaMeczowaController.updateKontrolaMeczowa);

// Usuń kontrolę meczową
router.delete('/:id', kontrolaMeczowaController.deleteKontrolaMeczowa);

module.exports = router;
