const Zawodnik = require('../models/Zawodnik');
const path = require('path');
const fs = require('fs').promises;

// Pobierz wszystkich zawodników
exports.getAllZawodnicy = async (req, res) => {
  try {
    const zawodnicy = await Zawodnik.find({ aktywny: true })
      .populate('druzyna')
      .sort({ nazwisko: 1 });
    res.json(zawodnicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pobierz zawodników z drużyny
exports.getZawodnicyByDruzyna = async (req, res) => {
  try {
    const zawodnicy = await Zawodnik.find({ 
      druzyna: req.params.druzynaId, 
      aktywny: true 
    }).sort({ nazwisko: 1 });
    res.json(zawodnicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pobierz jednego zawodnika
exports.getZawodnikById = async (req, res) => {
  try {
    const zawodnik = await Zawodnik.findById(req.params.id).populate('druzyna');
    if (!zawodnik) {
      return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
    }
    res.json(zawodnik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utwórz nowego zawodnika
exports.createZawodnik = async (req, res) => {
  try {
    // Zapobieganie duplikatom (imię, nazwisko, data urodzenia, drużyna)
    const { imie, nazwisko, dataUrodzenia, druzyna, status, statusKomentarz } = req.body;
    const existing = await Zawodnik.findOne({ imie, nazwisko, dataUrodzenia, druzyna });
    if (existing) {
      return res.status(400).json({ message: 'Zawodnik o tych danych już istnieje' });
    }

    // Jeśli status NIEAKTYWNY wymaga komentarza (powód)
    if (status === 'NIEAKTYWNY' && !statusKomentarz) {
      return res.status(400).json({ message: 'Podaj powód nieaktywności (statusKomentarz)' });
    }

    const zawodnik = new Zawodnik(req.body);
    // synchronizuj pole aktywny dla kompatybilności
    zawodnik.aktywny = zawodnik.status !== 'NIEAKTYWNY';

    const nowyZawodnik = await zawodnik.save();
    res.status(201).json(nowyZawodnik);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Aktualizuj zawodnika
exports.updateZawodnik = async (req, res) => {
  try {
    const { imie, nazwisko, dataUrodzenia, druzyna, status, statusKomentarz } = req.body;

    // Jeśli status NIEAKTYWNY wymaga komentarza
    if (status === 'NIEAKTYWNY' && !statusKomentarz) {
      return res.status(400).json({ message: 'Podaj powód nieaktywności (statusKomentarz)' });
    }

    // Sprawdź czy inny zawodnik nie ma tych samych danych
    if (imie && nazwisko && dataUrodzenia && druzyna) {
      const duplikat = await Zawodnik.findOne({ imie, nazwisko, dataUrodzenia, druzyna, _id: { $ne: req.params.id } });
      if (duplikat) {
        return res.status(400).json({ message: 'Inny zawodnik o tych danych już istnieje' });
      }
    }

    // Synchronizuj pole aktywny
    if (status) {
      req.body.aktywny = status !== 'NIEAKTYWNY';
    }

    const zawodnik = await Zawodnik.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!zawodnik) {
      return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
    }
    res.json(zawodnik);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Usuń zawodnika (soft delete)
exports.deleteZawodnik = async (req, res) => {
  try {
    const zawodnik = await Zawodnik.findByIdAndUpdate(
      req.params.id,
      { aktywny: false },
      { new: true }
    );
    if (!zawodnik) {
      return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
    }
    res.json({ message: 'Zawodnik został usunięty' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dodaj dokument do zawodnika
exports.addDokument = async (req, res) => {
  try {
    const zawodnik = await Zawodnik.findById(req.params.id);
    if (!zawodnik) {
      return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nie przesłano pliku' });
    }

    const dokument = {
      typ: req.body.typ,
      nazwa: req.file.originalname,
      sciezkaPliku: req.file.path
    };

    zawodnik.dokumenty.push(dokument);
    await zawodnik.save();

    res.status(201).json(zawodnik);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Usuń dokument zawodnika
exports.deleteDokument = async (req, res) => {
  try {
    const zawodnik = await Zawodnik.findById(req.params.id);
    if (!zawodnik) {
      return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
    }

    const dokument = zawodnik.dokumenty.id(req.params.dokumentId);
    if (!dokument) {
      return res.status(404).json({ message: 'Dokument nie znaleziony' });
    }

    // Usuń plik z dysku
    try {
      await fs.unlink(dokument.sciezkaPliku);
    } catch (err) {
      console.error('Błąd usuwania pliku:', err);
    }

    dokument.remove();
    await zawodnik.save();

    res.json({ message: 'Dokument został usunięty' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
