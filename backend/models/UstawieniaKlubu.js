const mongoose = require('mongoose');

const ustawieniaKlubuSchema = new mongoose.Schema({
  dnaTechniki: [{
    nazwa: String,
    aktywne: {
      type: Boolean,
      default: true
    }
  }],
  celeMotoryczne: [{
    nazwa: String,
    aktywne: {
      type: Boolean,
      default: true
    }
  }],
  celeMentalne: [{
    nazwa: String,
    aktywne: {
      type: Boolean,
      default: true
    }
  }],
  zalozeniaTreningow: {
    trening1: String,
    trening2: String,
    trening3: String,
    trening4: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UstawieniaKlubu', ustawieniaKlubuSchema);
