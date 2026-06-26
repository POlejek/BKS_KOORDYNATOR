/* eslint-disable no-console */
/**
 * Jednorazowy skrypt tworzący pierwszego administratora.
 * Uruchomienie:
 *   ADMIN_EMAIL=admin@klub.pl ADMIN_PASSWORD=TwojeHaslo123 npm run seed:admin
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const haslo = process.env.ADMIN_PASSWORD;

  if (!email || !haslo) {
    console.error('Ustaw zmienne ADMIN_EMAIL oraz ADMIN_PASSWORD przed uruchomieniem.');
    process.exit(1);
  }

  await connectDB();

  const istnieje = await User.findOne({ email: email.toLowerCase() });
  if (istnieje) {
    console.log(`Użytkownik ${email} już istnieje – pomijam.`);
  } else {
    await User.create({ email, haslo, imie: 'Administrator', rola: 'admin' });
    console.log(`Utworzono administratora: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Błąd seeda:', err);
  process.exit(1);
});
