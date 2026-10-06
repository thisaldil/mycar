import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  currencySymbol,
  distanceUnit,
  economyUnit,
  formatDate,
  formatDistance,
  formatEconomy,
  formatMoney,
  formatNumber,
  formatRelativeDays,
  formatVolume,
  convertDistance,
  convertEconomy } from
'../utils/format';
import { maskValue } from '../utils/sanitize';

/** Formatters bound to the user's currency, units and language settings. */
export function useFormat() {
  const { settings } = useSettings();
  return useMemo(
    () => ({
      settings,
      money: (v, opts) => formatMoney(v, settings, opts),
      number: (v, decimals = 0) => formatNumber(v, decimals, settings),
      distance: (km, opts) => formatDistance(km, settings, opts),
      distanceValue: (km) => convertDistance(km, settings),
      volume: (l, opts) => formatVolume(l, settings, opts),
      economy: (kmpl) => formatEconomy(kmpl, settings),
      economyValue: (kmpl) => convertEconomy(kmpl, settings),
      date: (v, style) => formatDate(v, settings, style),
      relative: (v) => formatRelativeDays(v),
      plate: (reg) => settings.privacy?.maskRegistration ? maskValue(reg, 2) : reg,
      currencySymbol: currencySymbol(settings),
      distanceUnit: distanceUnit(settings),
      economyUnit: economyUnit(settings)
    }),
    [settings]
  );
}