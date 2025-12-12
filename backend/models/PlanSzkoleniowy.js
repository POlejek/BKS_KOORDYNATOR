const mongoose = require('mongoose');

const planSzkoleniowy = new mongoose.Schema({
  druzyna: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Druzyna',
    required: true
  },
  dataTreningu: {
    type: Date,
    required: true
  },
  typWydarzenia: {
    type: String,
    enum: ['trening', 'mecz'],
    default: 'trening'
  },
  dominujacaFazaGry: {
    type: String,
    enum: [
      'Finalizacja+Obrona Niska',
      'Budowanie Gry + Obrona Średnia',
      'Otwarcie gry + Obrona wysoka',
      'Transfer Atak/Obrona',
      'Transfer Obrona/Atak',
      ''
    ],
    required: false
  },
  dnaTechniki: [{
    type: String
  }],
  celMotoryczny: [{
    type: String
  }],
  celMentalny: [{
    type: String
  }],
  cwiczenia: [{
    type: String,
    trim: true
  }],
  opisCelow: {
    type: String,
    trim: true
  },
  wybrane_zasady: {
    type: String,
    trim: true
  },
  zalozenia: {
    type: String,
    trim: true
  },
  numerTreningWTygodniu: {
    type: Number,
    enum: [1, 2, 3, 4, 0],
    required: false
  }
}, {
  timestamps: true
});

planSzkoleniowy.index({ druzyna: 1, dataTreningu: 1 });

module.exports = mongoose.model('PlanSzkoleniowy', planSzkoleniowy);
