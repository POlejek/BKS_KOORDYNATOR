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
  dgaWazneDo: {
    type: Date
  },
  druzyna: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Druzyna',
    required: true
  },
  // Status zawodnika i powód nieaktywności
  status: {
    type: String,
    enum: ['AKTYWNY', 'NIEAKTYWNY'],
    default: 'AKTYWNY'
  },
  statusKomentarz: {
    type: String
  },
  // Kontakty
  mail1: { type: String },
  mail2: { type: String },
  telefon1: { type: String },
  telefon2: { type: String },
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

// Unikalny indeks aby zapobiec duplikatom (imię, nazwisko, data urodzenia, drużyna)
zawodnikSchema.index({ imie: 1, nazwisko: 1, dataUrodzenia: 1, druzyna: 1 }, { unique: true, sparse: true });

// Metoda do sprawdzenia czy badania są ważne
zawodnikSchema.methods.czySaBadaniaWazne = function() {
  return this.okresWaznosciBadan > new Date();
};

module.exports = mongoose.model('Zawodnik', zawodnikSchema);
