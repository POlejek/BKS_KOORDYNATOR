const express = require('express');
const router = express.Router();
const druzynaController = require('../controllers/druzynaController');

router.get('/', druzynaController.getAllDruzyny);
router.get('/:id', druzynaController.getDruzynaById);
router.post('/', druzynaController.createDruzyna);
router.put('/:id', druzynaController.updateDruzyna);
router.delete('/:id', druzynaController.deleteDruzyna);

module.exports = router;
