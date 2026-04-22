import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rentora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // If sending FormData, delete the default JSON Content-Type
  // so the browser can automatically set multipart/form-data with the correct boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rentora_token');
      localStorage.removeItem('rentora_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    throw err.response?.data || err;
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  getMyListings: () => api.get('/vehicles/my/listings'),
  checkAvailability: (id, params) => api.get(`/vehicles/${id}/availability`, { params }),
  uploadImages: (data) => api.post('/vehicles/images', data),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getMy: (params) => api.get('/bookings/my', { params }),
  getProvider: (params) => api.get('/bookings/provider', { params }),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  getStats: () => api.get('/bookings/stats'),
};

export const documentAPI = {
  upload: (data) => api.post('/documents', data),
  getMy: () => api.get('/documents/my'),
  getById: (id) => api.get(`/documents/${id}`),
  verify: (id, data) => api.put(`/documents/${id}/verify`, data),
  getPending: (params) => api.get('/documents/pending', { params }),
};

export const paymentAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
  getHistory: (params) => api.get('/payments/history', { params }),
  getInvoice: (bookingId) => api.get(`/payments/invoice/${bookingId}`),
  getEarnings: (params) => api.get('/payments/earnings', { params }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, data) => api.put(`/admin/users/${id}/ban`, data),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  approveVehicle: (id) => api.put(`/admin/vehicles/${id}/approve`),
  removeVehicle: (id, data) => api.delete(`/admin/vehicles/${id}`, { data }),
  getVerifications: (params) => api.get('/admin/verifications', { params }),
  getRevenue: (params) => api.get('/admin/revenue', { params }),
};

export const supportAPI = {
  create: (data) => api.post('/support', data),
  getMy: () => api.get('/support/my'),
  getAll: () => api.get('/support'),
  reply: (id, data) => api.put(`/support/${id}`, data),
};

export const chatAPI = {
  getMessages: (bookingId) => api.get(`/chat/${bookingId}`),
  sendMessage: (bookingId, data) => api.post(`/chat/${bookingId}`, data),
};

export default api;
