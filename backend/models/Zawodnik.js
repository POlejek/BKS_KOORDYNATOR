const mongoose = require('mongoose');

const zawodnikSchema = new mongoose.Schema({
  imie: {
    type: String,
    required: true,
    trim: true
  },
  nazwisko: {
    type: String,
    required: true,
    trim: true
  },
  dataUrodzenia: {
    type: Date,
    required: true
  },
  okresWaznosciBadan: {
    type: Date,
    required: true
  },
  druzyna: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Druzyna',
    required: true
  },
  dokumenty: [{
    typ: {
      type: String,
      enum: ['badania_lekarskie', 'deklaracja_gry_amatora', 'inne'],
      required: true
    },
    nazwa: String,
    sciezkaPliku: String,
    dataZaladowania: {
      type: Date,
      default: Date.now
    }
  }],
  aktywny: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Metoda do sprawdzenia czy badania są ważne
zawodnikSchema.methods.czySaBadaniaWazne = function() {
  return this.okresWaznosciBadan > new Date();
};

module.exports = mongoose.model('Zawodnik', zawodnikSchema);
