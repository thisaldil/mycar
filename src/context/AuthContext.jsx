import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../services/authApi';
import { SESSION_EXPIRED_EVENT } from '../services/api';
import { tokenStorage } from '../utils/token';
import { toast } from '../components/common/Toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => tokenStorage.get() ? 'loading' : 'guest');
  const userRef = useRef(null);
  userRef.current = user;

  // Restore the session from a stored token.
  useEffect(() => {
    if (!tokenStorage.get()) return undefined;
    let active = true;
    authApi.
    me().
    then((me) => {
      if (!active) return;
      setUser(me);
      setStatus('authenticated');
    }).
    catch(() => {
      if (!active) return;
      tokenStorage.clear();
      setUser(null);
      setStatus('guest');
    });
    return () => {
      active = false;
    };
  }, []);

  // Expired / rejected tokens anywhere in the app sign the user out.
  useEffect(() => {
    const onExpired = () => {
      if (userRef.current) toast.error('Your session has expired. Please sign in again.');
      setUser(null);
      setStatus('guest');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const { token, user: me } = await authApi.login({ email, password, rememberMe });
    tokenStorage.set(token, rememberMe);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const { token, user: me } = await authApi.register({ name, email, password });
    tokenStorage.set(token, false);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {

      /* Server logout is best-effort; the local session is always cleared. */}
    tokenStorage.clear();
    setUser(null);
    setStatus('guest');
  }, []);

  const value = useMemo(
    () => ({ user, status, isAuthenticated: status === 'authenticated', login, register, logout, setUser }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}