import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { vehicleApi } from '../services/vehicleApi';
import { useAuth } from './AuthContext';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const { status, user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const storageKey = user ? `carlife_active_vehicle_${user.id}` : null;

  const reload = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    setError(null);
    try {
      const list = await vehicleApi.list();
      setVehicles(list || []);
      setActiveId((prev) => {
        let stored = prev;
        if (!stored && storageKey) {
          try {
            stored = localStorage.getItem(storageKey);
          } catch {
            stored = null;
          }
        }
        const valid = (list || []).find((v) => v.id === stored && v.status !== 'archived');
        return valid ? valid.id : (list || []).find((v) => v.status !== 'archived')?.id || null;
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [status, storageKey]);

  useEffect(() => {
    if (status === 'authenticated') reload();
    if (status === 'guest') {
      setVehicles([]);
      setActiveId(null);
      setLoaded(false);
    }
  }, [status, reload]);

  useEffect(() => {
    if (!storageKey || !activeId) return;
    try {
      localStorage.setItem(storageKey, activeId);
    } catch {

      /* ignore */}
  }, [activeId, storageKey]);

  // Keep a valid active vehicle when vehicles are archived or deleted.
  useEffect(() => {
    const current = vehicles.find((v) => v.id === activeId && v.status !== 'archived');
    if (!current) {
      const next = vehicles.find((v) => v.status !== 'archived')?.id || null;
      if (next !== activeId) setActiveId(next);
    }
  }, [vehicles, activeId]);

  const upsertVehicle = useCallback((vehicle) => {
    setVehicles((list) => list.some((v) => v.id === vehicle.id) ? list.map((v) => v.id === vehicle.id ? { ...v, ...vehicle } : v) : [...list, vehicle]);
  }, []);

  const removeVehicle = useCallback((id) => setVehicles((list) => list.filter((v) => v.id !== id)), []);

  const value = useMemo(() => {
    const activeVehicles = vehicles.filter((v) => v.status !== 'archived');
    return {
      vehicles,
      activeVehicles,
      activeVehicle: vehicles.find((v) => v.id === activeId) || null,
      activeVehicleId: activeId,
      setActiveVehicle: setActiveId,
      loading,
      loaded,
      error,
      reload,
      upsertVehicle,
      removeVehicle
    };
  }, [vehicles, activeId, loading, loaded, error, reload, upsertVehicle, removeVehicle]);

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export function useVehicles() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicles must be used inside VehicleProvider');
  return ctx;
}