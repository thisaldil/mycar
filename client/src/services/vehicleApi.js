import { api, unwrap } from './api';
import { createResourceApi } from './resource';

const base = createResourceApi('/vehicles');

export const vehicleApi = {
  ...base,
  archive: (id, archived = true) => api.patch(`/vehicles/${id}/archive`, { archived }).then(unwrap),
  updateMileage: (id, mileage) => api.patch(`/vehicles/${id}/mileage`, { mileage }).then(unwrap),
  summary: (id) => api.get(`/vehicles/${id}/summary`).then(unwrap),
  timeline: (id) => api.get(`/vehicles/${id}/timeline`).then(unwrap)
};