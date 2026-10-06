import { api, unwrap } from './api';
import { createResourceApi } from './resource';

const base = createResourceApi('/documents');

export const documentApi = {
  ...base,
  /** Multipart upload: { vehicleId, name, category, expiryDate, notes, file } */
  upload: ({ file, ...meta }) => {
    const form = new FormData();
    Object.entries(meta).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    if (file) form.append('file', file);
    return api.post('/documents', form).then(unwrap);
  },
  /** Files are fetched with the auth header as a Blob — no public file URLs are exposed. */
  getFile: (id) => api.get(`/documents/${id}/file`, { responseType: 'blob' }).then((res) => res.data)
};