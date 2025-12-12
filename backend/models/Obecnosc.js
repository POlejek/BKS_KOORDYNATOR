const mongoose = require('mongoose');

const obecnoscSchema = new mongoose.Schema({
  zawodnik: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zawodnik',
    required: true
  },
  druzyna: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Druzyna',
    required: true
  },
  dataTreningu: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['obecny', 'nieobecny', 'usprawiedliwiony', 'spozniony'],
    required: true
  },
  uwagi: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indeks dla szybszego wyszukiwania
obecnoscSchema.index({ druzyna: 1, dataTreningu: 1 });
obecnoscSchema.index({ zawodnik: 1, dataTreningu: 1 });

module.exports = mongoose.model('Obecnosc', obecnoscSchema);
