// Only the JWT is stored — never passwords or other credentials.
// "Remember me" keeps the token in localStorage; otherwise it lives in sessionStorage
// and is cleared when the browser tab closes.
const KEY = 'carlife_token';

function decodePayload(token) {
  try {
    const part = token.split('.')[1];
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token, remember = false) {
    this.clear();
    try {
      (remember ? localStorage : sessionStorage).setItem(KEY, token);
    } catch {

      /* storage unavailable (private mode) */}
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {

      /* ignore */}
  },
  isExpired(token) {
    const payload = token ? decodePayload(token) : null;
    if (!payload || !payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  }
};