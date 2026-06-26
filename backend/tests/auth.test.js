const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Autoryzacja', () => {
  it('odrzuca dostęp do chronionej trasy bez tokenu (401)', async () => {
    const res = await request(app).get('/api/zawodnicy');
    expect(res.status).toBe(401);
  });

  it('loguje poprawnie i zwraca token', async () => {
    await User.create({ email: 'admin@test.pl', haslo: 'haslo123', rola: 'admin' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.pl', haslo: 'haslo123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.rola).toBe('admin');
  });

  it('odrzuca błędne hasło (401)', async () => {
    await User.create({ email: 'admin@test.pl', haslo: 'haslo123', rola: 'admin' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.pl', haslo: 'zle' });
    expect(res.status).toBe(401);
  });

  it('waliduje dane logowania (400 dla braku emaila)', async () => {
    const res = await request(app).post('/api/auth/login').send({ haslo: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
