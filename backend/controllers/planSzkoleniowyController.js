const PlanSzkoleniowy = require('../models/PlanSzkoleniowy');

// Pobierz plany szkoleniowe dla drużyny
exports.getPlanyByDruzyna = async (req, res) => {
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

    const plany = await PlanSzkoleniowy.find(query)
      .populate('druzyna')
      .sort({ dataTreningu: 1 });
    
    res.json(plany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pobierz pojedynczy plan
exports.getPlanById = async (req, res) => {
  try {
    const plan = await PlanSzkoleniowy.findById(req.params.id).populate('druzyna');
    if (!plan) {
      return res.status(404).json({ message: 'Plan szkoleniowy nie znaleziony' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utwórz nowy plan szkoleniowy
exports.createPlan = async (req, res) => {
  try {
    const plan = new PlanSzkoleniowy(req.body);
    const nowyPlan = await plan.save();
    res.status(201).json(nowyPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Aktualizuj plan szkoleniowy
exports.updatePlan = async (req, res) => {
  try {
    const plan = await PlanSzkoleniowy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Plan szkoleniowy nie znaleziony' });
    }
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Usuń plan szkoleniowy
exports.deletePlan = async (req, res) => {
  try {
    const plan = await PlanSzkoleniowy.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan szkoleniowy nie znaleziony' });
    }
    res.json({ message: 'Plan szkoleniowy został usunięty' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
