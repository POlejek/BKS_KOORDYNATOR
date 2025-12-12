const UstawieniaKlubu = require('../models/UstawieniaKlubu');

// Pobierz ustawienia klubu
exports.getUstawienia = async (req, res) => {
  try {
    let ustawienia = await UstawieniaKlubu.findOne();
    
    // Jeśli nie ma jeszcze ustawień, utwórz domyślne
    if (!ustawienia) {
      ustawienia = new UstawieniaKlubu({
        dnaTechniki: [],
        celeMotoryczne: [],
        celeMentalne: [],
        zalozeniaTreningow: {
          trening1: '',
          trening2: '',
          trening3: '',
          trening4: ''
        }
      });
      await ustawienia.save();
    }
    
    res.json(ustawienia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aktualizuj ustawienia klubu
exports.updateUstawienia = async (req, res) => {
  try {
    let ustawienia = await UstawieniaKlubu.findOne();
    
    if (!ustawienia) {
      ustawienia = new UstawieniaKlubu(req.body);
    } else {
      Object.assign(ustawienia, req.body);
    }
    
    await ustawienia.save();
    res.json(ustawienia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Dodaj DNA Techniki
exports.addDnaTechniki = async (req, res) => {
  try {
    const ustawienia = await UstawieniaKlubu.findOne();
    if (!ustawienia) {
      return res.status(404).json({ message: 'Ustawienia nie znalezione' });
    }

    ustawienia.dnaTechniki.push(req.body);
    await ustawienia.save();
    res.json(ustawienia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Dodaj Cel Motoryczny
exports.addCelMotoryczny = async (req, res) => {
  try {
    const ustawienia = await UstawieniaKlubu.findOne();
    if (!ustawienia) {
      return res.status(404).json({ message: 'Ustawienia nie znalezione' });
    }

    ustawienia.celeMotoryczne.push(req.body);
    await ustawienia.save();
    res.json(ustawienia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Dodaj Cel Mentalny
exports.addCelMentalny = async (req, res) => {
  try {
    const ustawienia = await UstawieniaKlubu.findOne();
    if (!ustawienia) {
      return res.status(404).json({ message: 'Ustawienia nie znalezione' });
    }

    ustawienia.celeMentalne.push(req.body);
    await ustawienia.save();
    res.json(ustawienia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
