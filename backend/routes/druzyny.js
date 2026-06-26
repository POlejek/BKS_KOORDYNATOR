const express = require('express');
const router = express.Router();
const druzynaController = require('../controllers/druzynaController');
const validate = require('../middleware/validate');
const { requireRole } = require('../middleware/auth');
const {
  createDruzynaRules,
  updateDruzynaRules,
  idParam,
} = require('../validators/druzynaValidators');

router.get('/', druzynaController.getAllDruzyny);
router.get('/:id', validate(idParam), druzynaController.getDruzynaById);
router.post(
  '/',
  requireRole('admin', 'koordynator'),
  validate(createDruzynaRules),
  druzynaController.createDruzyna
);
router.put(
  '/:id',
  requireRole('admin', 'koordynator'),
  validate(updateDruzynaRules),
  druzynaController.updateDruzyna
);
router.delete(
  '/:id',
  requireRole('admin', 'koordynator'),
  validate(idParam),
  druzynaController.deleteDruzyna
);

module.exports = router;
