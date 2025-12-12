const mongoose = require('mongoose');

const druzynaSchema = new mongoose.Schema({
  nazwa: {
    type: String,
    required: true,
    trim: true
  },
  rocznik: {
    type: String,
    required: true
  },
  trener: {
    type: String,
    required: true
  },
  aktywna: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Druzyna', druzynaSchema);
