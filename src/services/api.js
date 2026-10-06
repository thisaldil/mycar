import axios from 'axios';
import { tokenStorage } from '../utils/token';
import { mockAdapter } from './mockAdapter';

const env = typeof import.meta !== 'undefined' && import.meta.env || {};

export const API_URL = (env.VITE_API_URL || '').replace(/\/$/, '');
export const USE_MOCK = !API_URL || env.VITE_USE_MOCK === 'true';
export const SESSION_EXPIRED_EVENT = 'carlife:session-expired';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

export const api = axios.create({
  baseURL: API_URL || '/api',
  timeout: 20000,
  withCredentials: false,
  ...(USE_MOCK ? { adapter: mockAdapter } : {})
});

function expireSession() {
  tokenStorage.clear();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    if (tokenStorage.isExpired(token)) {
      expireSession();
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !PUBLIC_AUTH_PATHS.some((p) => url.startsWith(p))) {
      expireSession();
    }
    return Promise.reject(normalizeError(error));
  }
);

/** Converts Axios errors into a predictable Error with message, status and field errors. */
export function normalizeError(error) {
  const data = error.response?.data;
  let message = data?.message;
  if (!message) {
    if (error.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';else
    if (!error.response) message = 'Unable to reach the server. Check your connection and try again.';else
    if (error.response.status >= 500) message = 'The server ran into a problem. Please try again shortly.';else
    message = 'Something went wrong. Please try again.';
  }
  const normalized = new Error(message);
  normalized.status = error.response?.status;
  normalized.fieldErrors = data?.errors || null;
  return normalized;
}

/** Backend responses are expected as { success, data, message }. */
export const unwrap = (response) => response?.data && 'data' in response.data ? response.data.data : response?.data;