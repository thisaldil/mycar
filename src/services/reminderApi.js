import { api, unwrap } from './api';
import { createResourceApi } from './resource';

const base = createResourceApi('/reminders');

export const reminderApi = {
  ...base,
  /** Marks a reminder complete (or reopens it). Repeating reminders return the next occurrence too. */
  complete: (id, completed = true) => api.patch(`/reminders/${id}/complete`, { completed }).then(unwrap)
};