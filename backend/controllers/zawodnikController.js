const mongoose = require('mongoose');
const Zawodnik = require('../models/Zawodnik');
const { getBucket } = require('../config/gridfs');

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
      aktywny: true,
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

// Pobierz zawodników z wygasającymi/nieaktualnymi badaniami lub DGA
// GET /api/zawodnicy/alerty/badania?dni=30
exports.getWygasajaceBadania = async (req, res) => {
  try {
    const dni = parseInt(req.query.dni, 10) || 30;
    const teraz = new Date();
    const prog = new Date();
    prog.setDate(prog.getDate() + dni);

    const zawodnicy = await Zawodnik.find({
      aktywny: true,
      $or: [{ okresWaznosciBadan: { $lte: prog } }, { dgaWazneDo: { $lte: prog } }],
    })
      .populate('druzyna')
      .sort({ okresWaznosciBadan: 1 });

    const wynik = zawodnicy.map((z) => ({
      _id: z._id,
      imie: z.imie,
      nazwisko: z.nazwisko,
      druzyna: z.druzyna,
      okresWaznosciBadan: z.okresWaznosciBadan,
      dgaWazneDo: z.dgaWazneDo,
      badaniaPoTerminie: z.okresWaznosciBadan ? z.okresWaznosciBadan < teraz : false,
      dgaPoTerminie: z.dgaWazneDo ? z.dgaWazneDo < teraz : false,
    }));

    res.json(wynik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eksport listy zawodników do CSV
// GET /api/zawodnicy/export/csv
exports.exportCsv = async (req, res) => {
  try {
    const zawodnicy = await Zawodnik.find({ aktywny: true })
      .populate('druzyna')
      .sort({ nazwisko: 1 });

    const naglowki = [
      'Imie',
      'Nazwisko',
      'DataUrodzenia',
      'Druzyna',
      'WaznoscBadan',
      'DGAWazneDo',
      'Status',
      'Mail',
      'Telefon',
    ];

    const escape = (val) => {
      const s = val == null ? '' : String(val);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const dataISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

    const wiersze = zawodnicy.map((z) =>
      [
        z.imie,
        z.nazwisko,
        dataISO(z.dataUrodzenia),
        z.druzyna?.nazwa || '',
        dataISO(z.okresWaznosciBadan),
        dataISO(z.dgaWazneDo),
        z.status,
        z.mail1 || '',
        z.telefon1 || '',
      ]
        .map(escape)
        .join(';')
    );

    const csv = '﻿' + [naglowki.join(';'), ...wiersze].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="zawodnicy.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utwórz nowego zawodnika
exports.createZawodnik = async (req, res) => {
  try {
    const { imie, nazwisko, dataUrodzenia, druzyna, status, statusKomentarz } = req.body;
    const existing = await Zawodnik.findOne({ imie, nazwisko, dataUrodzenia, druzyna });
    if (existing) {
      return res.status(400).json({ message: 'Zawodnik o tych danych już istnieje' });
    }

    if (status === 'NIEAKTYWNY' && !statusKomentarz) {
      return res.status(400).json({ message: 'Podaj powód nieaktywności (statusKomentarz)' });
    }

    const zawodnik = new Zawodnik(req.body);
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

    if (status === 'NIEAKTYWNY' && !statusKomentarz) {
      return res.status(400).json({ message: 'Podaj powód nieaktywności (statusKomentarz)' });
    }

    if (imie && nazwisko && dataUrodzenia && druzyna) {
      const duplikat = await Zawodnik.findOne({
        imie,
        nazwisko,
        dataUrodzenia,
        druzyna,
        _id: { $ne: req.params.id },
      });
      if (duplikat) {
        return res.status(400).json({ message: 'Inny zawodnik o tych danych już istnieje' });
      }
    }

    if (status) {
      req.body.aktywny = status !== 'NIEAKTYWNY';
    }

    const zawodnik = await Zawodnik.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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

// Dodaj dokument do zawodnika (zapis do GridFS)
exports.addDokument = async (req, res) => {
  try {
    const zawodnik = await Zawodnik.findById(req.params.id);
    if (!zawodnik) {
      return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Nie przesłano pliku' });
    }

    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);

    uploadStream.on('error', () =>
      res.status(500).json({ message: 'Błąd zapisu pliku' })
    );

    uploadStream.on('finish', async () => {
      zawodnik.dokumenty.push({
        typ: req.body.typ,
        nazwa: req.file.originalname,
        fileId: uploadStream.id,
        contentType: req.file.mimetype,
      });
      await zawodnik.save();
      res.status(201).json(zawodnik);
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Pobierz/strumieniuj dokument
exports.getDokument = async (req, res) => {
  try {
    const zawodnik = await Zawodnik.findById(req.params.id);
    if (!zawodnik) {
      return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
    }
    const dokument = zawodnik.dokumenty.id(req.params.dokumentId);
    if (!dokument || !dokument.fileId) {
      return res.status(404).json({ message: 'Dokument nie znaleziony' });
    }

    const bucket = getBucket();
    res.setHeader('Content-Type', dokument.contentType || 'application/octet-stream');
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(dokument.fileId)
    );
    downloadStream.on('error', () =>
      res.status(404).json({ message: 'Plik nie znaleziony' })
    );
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Usuń dokument zawodnika (z GridFS)
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

    if (dokument.fileId) {
      try {
        await getBucket().delete(new mongoose.Types.ObjectId(dokument.fileId));
      } catch (err) {
        console.error('Błąd usuwania pliku z GridFS:', err.message);
      }
    }

    zawodnik.dokumenty = zawodnik.dokumenty.filter(
      (d) => d._id.toString() !== dokument._id.toString()
    );
    await zawodnik.save();

    res.json({ message: 'Dokument został usunięty' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
