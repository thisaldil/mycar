import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

export const KM_PER_MILE = 1.609344;
export const L_PER_GALLON = 3.785411784;

const localeFor = (language) => language === 'en-US' ? 'en-US' : 'en-GB';

export function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : parseISO(String(value));
  return isValid(d) ? d : null;
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatNumber(value, decimals = 0, settings = {}) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat(localeFor(settings.language), {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(Number(value));
}

export function formatMoney(value, settings = {}, { compact = false, decimals } = {}) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const currency = settings.currency || 'LKR';
  const max = decimals ?? (compact ? 1 : 0);
  try {
    return new Intl.NumberFormat(localeFor(settings.language), {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: max,
      minimumFractionDigits: decimals ?? 0
    }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toLocaleString()}`;
  }
}

export function currencySymbol(settings = {}) {
  try {
    const parts = new Intl.NumberFormat(localeFor(settings.language), {
      style: 'currency',
      currency: settings.currency || 'LKR'
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value || settings.currency;
  } catch {
    return settings.currency || 'LKR';
  }
}

export const distanceUnit = (settings = {}) => settings.units === 'imperial' ? 'mi' : 'km';
export const volumeUnit = (settings = {}) => settings.units === 'imperial' ? 'gal' : 'L';
export const economyUnit = (settings = {}) => settings.units === 'imperial' ? 'mpg' : 'km/L';

export function convertDistance(km, settings = {}) {
  if (km == null || Number.isNaN(Number(km))) return null;
  return settings.units === 'imperial' ? Number(km) / KM_PER_MILE : Number(km);
}

export function formatDistance(km, settings = {}, { decimals = 0, unit = true } = {}) {
  const v = convertDistance(km, settings);
  if (v == null) return '—';
  const n = formatNumber(v, decimals, settings);
  return unit ? `${n} ${distanceUnit(settings)}` : n;
}

export function formatVolume(litres, settings = {}, { decimals = 1 } = {}) {
  if (litres == null || Number.isNaN(Number(litres))) return '—';
  const v = settings.units === 'imperial' ? Number(litres) / L_PER_GALLON : Number(litres);
  return `${formatNumber(v, decimals, settings)} ${volumeUnit(settings)}`;
}

export function convertEconomy(kmPerLitre, settings = {}) {
  if (kmPerLitre == null || Number.isNaN(Number(kmPerLitre))) return null;
  return settings.units === 'imperial' ? Number(kmPerLitre) * 2.352145 : Number(kmPerLitre);
}

export function formatEconomy(kmPerLitre, settings = {}) {
  const v = convertEconomy(kmPerLitre, settings);
  if (v == null) return '—';
  return `${formatNumber(v, 1, settings)} ${economyUnit(settings)}`;
}

const DATE_PATTERNS = {
  'en-GB': { medium: 'd MMM yyyy', short: 'd MMM', long: 'd MMMM yyyy', month: 'MMMM yyyy', monthShort: 'MMM yyyy' },
  'en-US': { medium: 'MMM d, yyyy', short: 'MMM d', long: 'MMMM d, yyyy', month: 'MMMM yyyy', monthShort: 'MMM yyyy' }
};

export function formatDate(value, settings = {}, style = 'medium') {
  const d = toDate(value);
  if (!d) return '—';
  const patterns = DATE_PATTERNS[localeFor(settings.language)];
  return format(d, patterns[style] || patterns.medium);
}

export function formatRelativeDays(value) {
  const d = toDate(value);
  if (!d) return '';
  const days = differenceInCalendarDays(d, new Date());
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  const abs = Math.abs(days);
  let label;
  if (abs < 45) label = `${abs} days`;else
  if (abs < 365) label = `${Math.round(abs / 30)} months`;else
  {
    const years = Math.round(abs / 365 * 10) / 10;
    label = `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  return days > 0 ? `in ${label}` : `${label} ago`;
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function vehicleName(vehicle) {
  if (!vehicle) return '';
  return [vehicle.make, vehicle.model].filter(Boolean).join(' ');
}