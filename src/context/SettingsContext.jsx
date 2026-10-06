import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../services/authApi';
import { useAuth } from './AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { toast } from '../components/common/Toast';

const STORAGE_KEY = 'carlife_settings';

export const DEFAULT_SETTINGS = {
  theme: 'system',
  language: 'en-GB',
  currency: 'LKR',
  units: 'metric',
  notifications: {
    email: true,
    push: true,
    service: true,
    insurance: true,
    inspection: true,
    other: true,
    weeklySummary: false,
    leadDays: 30
  },
  privacy: {
    maskRegistration: false,
    analytics: false,
    crashReports: true
  }
};

function merge(base, patch) {
  const out = { ...base };
  Object.entries(patch || {}).forEach(([k, v]) => {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? { ...(base[k] || {}), ...v } : v;
  });
  return out;
}

function loadLocal() {
  try {
    return merge(DEFAULT_SETTINGS, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(loadLocal);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedTheme = settings.theme === 'system' ? prefersDark ? 'dark' : 'light' : settings.theme;

  // Server-stored settings win after sign-in.
  useEffect(() => {
    if (user?.settings) setSettings(merge(DEFAULT_SETTINGS, user.settings));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {

      /* ignore */}
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.lang = settings.language;
  }, [resolvedTheme, settings.language]);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const updateSettings = useCallback(
    async (patch) => {
      const next = merge(settingsRef.current, patch);
      settingsRef.current = next;
      setSettings(next);
      if (!isAuthenticated) return;
      try {
        await authApi.updateSettings(next);
      } catch (err) {
        toast.error(err.message || 'Could not sync settings.');
      }
    },
    [isAuthenticated]
  );

  const value = useMemo(() => ({ settings, resolvedTheme, updateSettings }), [settings, resolvedTheme, updateSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}