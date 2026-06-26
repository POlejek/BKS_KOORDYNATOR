const request = require('supertest');
const app = require('../server');
const Druzyna = require('../models/Druzyna');
const { authHeader } = require('./helpers');

async function utworzDruzyne() {
  const d = await Druzyna.create({ nazwa: 'U12', rocznik: '2012', trener: 'Jan Kowalski' });
  return d._id.toString();
}

describe('Trasy zawodników', () => {
  it('GET /api/zawodnicy zwraca pustą listę dla zalogowanego', async () => {
    const res = await request(app)
      .get('/api/zawodnicy')
      .set('Authorization', authHeader('koordynator'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/zawodnicy tworzy zawodnika dla koordynatora (201)', async () => {
    const druzyna = await utworzDruzyne();
    const res = await request(app)
      .post('/api/zawodnicy')
      .set('Authorization', authHeader('koordynator'))
      .send({
        imie: 'Adam',
        nazwisko: 'Nowak',
        dataUrodzenia: '2012-05-01',
        okresWaznosciBadan: '2026-12-31',
        druzyna,
      });
    expect(res.status).toBe(201);
    expect(res.body.nazwisko).toBe('Nowak');
  });

  it('POST /api/zawodnicy zwraca 400 dla braku wymaganych pól', async () => {
    const res = await request(app)
      .post('/api/zawodnicy')
      .set('Authorization', authHeader('koordynator'))
      .send({ imie: 'Adam' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/zawodnicy zwraca 403 dla roli trener (brak uprawnień)', async () => {
    const druzyna = await utworzDruzyne();
    const res = await request(app)
      .post('/api/zawodnicy')
      .set('Authorization', authHeader('trener'))
      .send({
        imie: 'Adam',
        nazwisko: 'Nowak',
        dataUrodzenia: '2012-05-01',
        okresWaznosciBadan: '2026-12-31',
        druzyna,
      });
    expect(res.status).toBe(403);
  });

  it('blokuje duplikat zawodnika (400)', async () => {
    const druzyna = await utworzDruzyne();
    const dane = {
      imie: 'Adam',
      nazwisko: 'Nowak',
      dataUrodzenia: '2012-05-01',
      okresWaznosciBadan: '2026-12-31',
      druzyna,
    };
    const auth = authHeader('koordynator');
    await request(app).post('/api/zawodnicy').set('Authorization', auth).send(dane);
    const res = await request(app).post('/api/zawodnicy').set('Authorization', auth).send(dane);
    expect(res.status).toBe(400);
  });

  it('GET /api/zawodnicy/alerty/badania zwraca zawodników z wygasającymi badaniami', async () => {
    const druzyna = await utworzDruzyne();
    const auth = authHeader('koordynator');
    await request(app).post('/api/zawodnicy').set('Authorization', auth).send({
      imie: 'Po',
      nazwisko: 'Terminie',
      dataUrodzenia: '2012-05-01',
      okresWaznosciBadan: '2020-01-01',
      druzyna,
    });
    const res = await request(app)
      .get('/api/zawodnicy/alerty/badania')
      .set('Authorization', auth);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].badaniaPoTerminie).toBe(true);
  });
});
