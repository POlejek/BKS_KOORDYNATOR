const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const zawodnikController = require('../controllers/zawodnikController');
const validate = require('../middleware/validate');
const { requireRole } = require('../middleware/auth');
const {
  createZawodnikRules,
  updateZawodnikRules,
  idParam,
} = require('../validators/zawodnikValidators');

// Multer w pamięci – plik trafia do GridFS, nie na dysk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Tylko pliki JPG, PNG i PDF są dozwolone!'));
  },
});

// Funkcje specjalne (przed trasami z :id, by uniknąć kolizji)
router.get('/alerty/badania', zawodnikController.getWygasajaceBadania);
router.get('/export/csv', zawodnikController.exportCsv);

// Trasy dla zawodników
router.get('/', zawodnikController.getAllZawodnicy);
router.get('/druzyna/:druzynaId', zawodnikController.getZawodnicyByDruzyna);
router.get('/:id', validate(idParam), zawodnikController.getZawodnikById);
router.post(
  '/',
  requireRole('admin', 'koordynator'),
  validate(createZawodnikRules),
  zawodnikController.createZawodnik
);
router.put(
  '/:id',
  requireRole('admin', 'koordynator'),
  validate(updateZawodnikRules),
  zawodnikController.updateZawodnik
);
router.delete(
  '/:id',
  requireRole('admin', 'koordynator'),
  validate(idParam),
  zawodnikController.deleteZawodnik
);

// Trasy dla dokumentów
router.post(
  '/:id/dokumenty',
  requireRole('admin', 'koordynator'),
  upload.single('plik'),
  zawodnikController.addDokument
);
router.get('/:id/dokumenty/:dokumentId/plik', zawodnikController.getDokument);
router.delete(
  '/:id/dokumenty/:dokumentId',
  requireRole('admin', 'koordynator'),
  zawodnikController.deleteDokument
);

module.exports = router;
