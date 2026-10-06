import { api, unwrap } from './api';

export const reportApi = {
  /** range: '12m' | 'ytd' | 'all' */
  summary: ({ vehicleId, range = '12m' }) => api.get('/reports/summary', { params: { vehicleId, range } }).then(unwrap)
};