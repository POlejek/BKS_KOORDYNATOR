const mongoose = require('mongoose');

const statystykiZawodnikaSchema = new mongoose.Schema({
  zawodnikId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zawodnik',
    required: true
  },
  ileMinut: {
    type: Number,
    default: 0,
    min: 0,
    max: 120
  },
  ileAsyst: {
    type: Number,
    default: 0,
    min: 0
  },
  ileBramek: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['MP', 'MR', 'MN'], // MP - mecz podstawowy, MR - mecz rezerwowy, MN - mecz nieobecny
    default: 'MN'
  }
});

const kontrolaMeczowaSchema = new mongoose.Schema({
  dataMeczu: {
    type: Date,
    required: true
  },
  przeciwnik: {
    type: String,
    required: true,
    trim: true
  },
  wynik: {
    type: String,
    default: '',
    trim: true
  },
  druzynaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Druzyna',
    required: true
  },
  statystykiZawodnikow: [statystykiZawodnikaSchema]
}, {
  timestamps: true
});

// Indeks dla szybszego wyszukiwania
kontrolaMeczowaSchema.index({ dataMeczu: 1, druzynaId: 1 });

module.exports = mongoose.model('KontrolaMeczowa', kontrolaMeczowaSchema);
