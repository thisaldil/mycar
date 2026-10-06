import { api, unwrap } from './api';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then(unwrap),
  register: (payload) => api.post('/auth/register', payload).then(unwrap),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(unwrap),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }).then(unwrap),
  me: () => api.get('/auth/me').then(unwrap),
  updateProfile: (payload) => api.put('/auth/profile', payload).then(unwrap),
  changePassword: (payload) => api.put('/auth/change-password', payload).then(unwrap),
  logout: () => api.post('/auth/logout').then(unwrap),
  updateSettings: (settings) => api.put('/users/me/settings', settings).then(unwrap),
  exportData: () => api.get('/users/me/export').then(unwrap)
};