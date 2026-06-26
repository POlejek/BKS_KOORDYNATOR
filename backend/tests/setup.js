const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Ustaw deterministyczny sekret PRZED załadowaniem aplikacji/middleware
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
