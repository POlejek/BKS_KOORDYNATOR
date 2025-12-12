const express = require('express');
const router = express.Router();
const zawodnikController = require('../controllers/zawodnikController');
const multer = require('multer');
const path = require('path');

// Konfiguracja multer dla uploadowania plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tylko pliki JPG, PNG i PDF są dozwolone!'));
    }
  }
});

// Trasy dla zawodników
router.get('/', zawodnikController.getAllZawodnicy);
router.get('/druzyna/:druzynaId', zawodnikController.getZawodnicyByDruzyna);
router.get('/:id', zawodnikController.getZawodnikById);
router.post('/', zawodnikController.createZawodnik);
router.put('/:id', zawodnikController.updateZawodnik);
router.delete('/:id', zawodnikController.deleteZawodnik);

// Trasy dla dokumentów
router.post('/:id/dokumenty', upload.single('plik'), zawodnikController.addDokument);
router.delete('/:id/dokumenty/:dokumentId', zawodnikController.deleteDokument);

module.exports = router;
