import api from './api';

export const druzynyService = {
  getAll: () => api.get('/druzyny'),
  getById: (id) => api.get(`/druzyny/${id}`),
  create: (data) => api.post('/druzyny', data),
  update: (id, data) => api.put(`/druzyny/${id}`, data),
  delete: (id) => api.delete(`/druzyny/${id}`),
};

export const zawodnicyService = {
  getAll: () => api.get('/zawodnicy'),
  getByDruzyna: (druzynaId) => api.get(`/zawodnicy/druzyna/${druzynaId}`),
  getById: (id) => api.get(`/zawodnicy/${id}`),
  create: (data) => api.post('/zawodnicy', data),
  update: (id, data) => api.put(`/zawodnicy/${id}`, data),
  delete: (id) => api.delete(`/zawodnicy/${id}`),
  addDokument: (id, formData) => api.post(`/zawodnicy/${id}/dokumenty`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDokument: (id, dokumentId) => api.delete(`/zawodnicy/${id}/dokumenty/${dokumentId}`),
};

export const obecnosciService = {
  getByDruzyna: (druzynaId, params) => api.get(`/obecnosci/druzyna/${druzynaId}`, { params }),
  getByZawodnik: (zawodnikId, params) => api.get(`/obecnosci/zawodnik/${zawodnikId}`, { params }),
  upsert: (druzynaId, data) => api.post(`/obecnosci/druzyna/${druzynaId}`, data),
  saveMasowo: (druzynaId, data) => api.post(`/obecnosci/druzyna/${druzynaId}/masowo`, data),
  delete: (id) => api.delete(`/obecnosci/${id}`),
};

export const planySzkolenioweService = {
  getByDruzyna: (druzynaId, params) => api.get(`/plany-szkoleniowe/druzyna/${druzynaId}`, { params }),
  getById: (id) => api.get(`/plany-szkoleniowe/${id}`),
  create: (data) => api.post('/plany-szkoleniowe', data),
  update: (id, data) => api.put(`/plany-szkoleniowe/${id}`, data),
  delete: (id) => api.delete(`/plany-szkoleniowe/${id}`),
};

export const ustawieniaService = {
  get: () => api.get('/ustawienia'),
  update: (data) => api.put('/ustawienia', data),
  addDnaTechniki: (data) => api.post('/ustawienia/dna-techniki', data),
  addCelMotoryczny: (data) => api.post('/ustawienia/cele-motoryczne', data),
  addCelMentalny: (data) => api.post('/ustawienia/cele-mentalne', data),
};
