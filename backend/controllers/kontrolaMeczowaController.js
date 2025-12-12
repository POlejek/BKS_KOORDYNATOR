const KontrolaMeczowa = require('../models/KontrolaMeczowa');
const Zawodnik = require('../models/Zawodnik');

// Pobierz wszystkie kontrole meczowe
exports.getAllKontroleMeczowe = async (req, res) => {
  try {
    const { druzynaId } = req.query;
    const filter = druzynaId ? { druzynaId } : {};
    
    const kontrole = await KontrolaMeczowa.find(filter)
      .populate('druzynaId', 'nazwa')
      .populate('statystykiZawodnikow.zawodnikId', 'imie nazwisko')
      .sort({ dataMeczu: -1 });
    
    res.json(kontrole);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Pobierz pojedynczą kontrolę meczową
exports.getKontrolaMeczowa = async (req, res) => {
  try {
    const kontrola = await KontrolaMeczowa.findById(req.params.id)
      .populate('druzynaId', 'nazwa')
      .populate('statystykiZawodnikow.zawodnikId', 'imie nazwisko');
    
    if (!kontrola) {
      return res.status(404).json({ message: 'Kontrola meczowa nie znaleziona' });
    }
    
    res.json(kontrola);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Utwórz nową kontrolę meczową
exports.createKontrolaMeczowa = async (req, res) => {
  try {
    const { dataMeczu, przeciwnik, wynik, druzynaId, statystykiZawodnikow } = req.body;
    
    const nowaKontrola = new KontrolaMeczowa({
      dataMeczu,
      przeciwnik,
      wynik: wynik || '',
      druzynaId,
      statystykiZawodnikow: statystykiZawodnikow || []
    });
    
    const zapisanaKontrola = await nowaKontrola.save();
    
    const kontrolaZDanymi = await KontrolaMeczowa.findById(zapisanaKontrola._id)
      .populate('druzynaId', 'nazwa')
      .populate('statystykiZawodnikow.zawodnikId', 'imie nazwisko');
    
    res.status(201).json(kontrolaZDanymi);
  } catch (error) {
    res.status(400).json({ message: 'Błąd tworzenia kontroli meczowej', error: error.message });
  }
};

// Zaktualizuj kontrolę meczową
exports.updateKontrolaMeczowa = async (req, res) => {
  try {
    const { dataMeczu, przeciwnik, wynik, druzynaId, statystykiZawodnikow } = req.body;
    
    const kontrola = await KontrolaMeczowa.findByIdAndUpdate(
      req.params.id,
      {
        dataMeczu,
        przeciwnik,
        wynik,
        druzynaId,
        statystykiZawodnikow
      },
      { new: true, runValidators: true }
    )
      .populate('druzynaId', 'nazwa')
      .populate('statystykiZawodnikow.zawodnikId', 'imie nazwisko');
    
    if (!kontrola) {
      return res.status(404).json({ message: 'Kontrola meczowa nie znaleziona' });
    }
    
    res.json(kontrola);
  } catch (error) {
    res.status(400).json({ message: 'Błąd aktualizacji kontroli meczowej', error: error.message });
  }
};

// Usuń kontrolę meczową
exports.deleteKontrolaMeczowa = async (req, res) => {
  try {
    const kontrola = await KontrolaMeczowa.findByIdAndDelete(req.params.id);
    
    if (!kontrola) {
      return res.status(404).json({ message: 'Kontrola meczowa nie znaleziona' });
    }
    
    res.json({ message: 'Kontrola meczowa usunięta pomyślnie' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Pobierz kontrole meczowe dla danej drużyny w określonym okresie
exports.getKontroleMeczoweByDruzynaAndPeriod = async (req, res) => {
  try {
    const { druzynaId, startDate, endDate } = req.query;
    
    const filter = { druzynaId };
    if (startDate || endDate) {
      filter.dataMeczu = {};
      if (startDate) filter.dataMeczu.$gte = new Date(startDate);
      if (endDate) filter.dataMeczu.$lte = new Date(endDate);
    }
    
    const kontrole = await KontrolaMeczowa.find(filter)
      .populate('druzynaId', 'nazwa')
      .populate('statystykiZawodnikow.zawodnikId', 'imie nazwisko')
      .sort({ dataMeczu: 1 });
    
    res.json(kontrole);
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};
