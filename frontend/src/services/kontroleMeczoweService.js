import api from './api';

const kontroleMeczoweService = {
  getAll: () => api.get('/kontrole-meczowe'),
  
  getByDruzyna: (druzynaId) => {
    return api.get('/kontrole-meczowe', { params: { druzynaId } });
  },

  getById: (id) => api.get(`/kontrole-meczowe/${id}`),

  getByPeriod: (druzynaId, startDate = null, endDate = null) => {
    const params = { druzynaId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/kontrole-meczowe/by-period', { params });
  },

  create: (kontrolaData) => api.post('/kontrole-meczowe', kontrolaData),

  update: (id, kontrolaData) => api.put(`/kontrole-meczowe/${id}`, kontrolaData),

  delete: (id) => api.delete(`/kontrole-meczowe/${id}`)
};

export default kontroleMeczoweService;
