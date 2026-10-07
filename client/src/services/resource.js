import { api, unwrap } from './api';

/** Standard REST resource: GET/POST /path, GET/PUT/DELETE /path/:id */
export function createResourceApi(path) {
  return {
    path,
    list: (params) => api.get(path, { params }).then(unwrap),
    get: (id) => api.get(`${path}/${id}`).then(unwrap),
    create: (data) => api.post(path, data).then(unwrap),
    update: (id, data) => api.put(`${path}/${id}`, data).then(unwrap),
    remove: (id) => api.delete(`${path}/${id}`).then(unwrap)
  };
}