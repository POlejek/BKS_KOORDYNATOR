const Obecnosc = require('../models/Obecnosc');

// Pobierz obecności dla drużyny w określonym okresie
exports.getObecnosciByDruzyna = async (req, res) => {
  try {
    const { druzynaId } = req.params;
    const { dataOd, dataDo } = req.query;

    const query = { druzyna: druzynaId };
    
    if (dataOd && dataDo) {
      query.dataTreningu = {
        $gte: new Date(dataOd),
        $lte: new Date(dataDo)
      };
    }

    const obecnosci = await Obecnosc.find(query)
      .populate('zawodnik')
      .sort({ dataTreningu: 1 });
    
    res.json(obecnosci);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pobierz obecności dla zawodnika
exports.getObecnosciByZawodnik = async (req, res) => {
  try {
    const { zawodnikId } = req.params;
    const { dataOd, dataDo } = req.query;

    const query = { zawodnik: zawodnikId };
    
    if (dataOd && dataDo) {
      query.dataTreningu = {
        $gte: new Date(dataOd),
        $lte: new Date(dataDo)
      };
    }

    const obecnosci = await Obecnosc.find(query)
      .sort({ dataTreningu: 1 });
    
    res.json(obecnosci);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utwórz lub zaktualizuj obecność
exports.upsertObecnosc = async (req, res) => {
  try {
    const { zawodnikId, dataTreningu, status, uwagi } = req.body;
    const { druzynaId } = req.params;

    const obecnosc = await Obecnosc.findOneAndUpdate(
      {
        zawodnik: zawodnikId,
        druzyna: druzynaId,
        dataTreningu: new Date(dataTreningu)
      },
      {
        status,
        uwagi
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    ).populate('zawodnik');

    res.json(obecnosc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Zapisz obecności dla całej drużyny na dany trening
exports.saveObecnosciMasowo = async (req, res) => {
  try {
    const { druzynaId } = req.params;
    const { dataTreningu, obecnosci } = req.body;

    const wyniki = [];
    
    for (const obs of obecnosci) {
      const obecnosc = await Obecnosc.findOneAndUpdate(
        {
          zawodnik: obs.zawodnikId,
          druzyna: druzynaId,
          dataTreningu: new Date(dataTreningu)
        },
        {
          status: obs.status,
          uwagi: obs.uwagi
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );
      wyniki.push(obecnosc);
    }

    res.json(wyniki);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Usuń obecność
exports.deleteObecnosc = async (req, res) => {
  try {
    const obecnosc = await Obecnosc.findByIdAndDelete(req.params.id);
    if (!obecnosc) {
      return res.status(404).json({ message: 'Obecność nie znaleziona' });
    }
    res.json({ message: 'Obecność została usunięta' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
