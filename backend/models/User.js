const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    haslo: {
      type: String,
      required: true,
      select: false, // domyślnie nie zwracaj hasła w zapytaniach
    },
    imie: {
      type: String,
      trim: true,
    },
    rola: {
      type: String,
      enum: ['admin', 'koordynator', 'trener'],
      default: 'trener',
    },
    aktywny: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Haszuj hasło przed zapisem (jeśli zostało zmienione)
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('haslo')) return next();
  const salt = await bcrypt.genSalt(10);
  this.haslo = await bcrypt.hash(this.haslo, salt);
  next();
});

userSchema.methods.porownajHaslo = function porownajHaslo(kandydat) {
  return bcrypt.compare(kandydat, this.haslo);
};

module.exports = mongoose.model('User', userSchema);
