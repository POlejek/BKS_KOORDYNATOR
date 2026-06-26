const express = require('express');
const router = express.Router();
const planController = require('../controllers/planSzkoleniowyController');
const { requireRole } = require('../middleware/auth');

const moznaEdytowac = requireRole('admin', 'koordynator', 'trener');

router.get('/druzyna/:druzynaId', planController.getPlanyByDruzyna);
router.get('/:id', planController.getPlanById);
router.post('/', moznaEdytowac, planController.createPlan);
router.put('/:id', moznaEdytowac, planController.updatePlan);
router.delete('/:id', moznaEdytowac, planController.deletePlan);

module.exports = router;
