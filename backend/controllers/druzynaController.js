const Druzyna = require('../models/Druzyna');

// Pobierz wszystkie drużyny
exports.getAllDruzyny = async (req, res) => {
  try {
    const druzyny = await Druzyna.find({ aktywna: true }).sort({ nazwa: 1 });
    res.json(druzyny);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pobierz jedną drużynę
exports.getDruzynaById = async (req, res) => {
  try {
    const druzyna = await Druzyna.findById(req.params.id);
    if (!druzyna) {
      return res.status(404).json({ message: 'Drużyna nie znaleziona' });
    }
    res.json(druzyna);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utwórz nową drużynę
exports.createDruzyna = async (req, res) => {
  try {
    const druzyna = new Druzyna(req.body);
    const nowaDruzyna = await druzyna.save();
    res.status(201).json(nowaDruzyna);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Aktualizuj drużynę
exports.updateDruzyna = async (req, res) => {
  try {
    const druzyna = await Druzyna.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!druzyna) {
      return res.status(404).json({ message: 'Drużyna nie znaleziona' });
    }
    res.json(druzyna);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Usuń drużynę (soft delete)
exports.deleteDruzyna = async (req, res) => {
  try {
    const druzyna = await Druzyna.findByIdAndUpdate(
      req.params.id,
      { aktywna: false },
      { new: true }
    );
    if (!druzyna) {
      return res.status(404).json({ message: 'Drużyna nie znaleziona' });
    }
    res.json({ message: 'Drużyna została usunięta' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
