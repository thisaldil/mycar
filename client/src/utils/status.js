import { differenceInCalendarDays, addMonths, format } from 'date-fns';
import { toDate } from './format';

export function daysUntil(value) {
  const d = toDate(value);
  if (!d) return null;
  return differenceInCalendarDays(d, new Date());
}

/** valid | expiring | expired | unknown */
export function expiryStatus(value, soonDays = 30) {
  const n = daysUntil(value);
  if (n == null) return 'unknown';
  if (n < 0) return 'expired';
  if (n <= soonDays) return 'expiring';
  return 'valid';
}

/** Returns { status: overdue | due-soon | upcoming | completed, days, km } */
export function reminderState(reminder, mileage) {
  if (!reminder) return { status: 'upcoming', days: null, km: null };
  if (reminder.completed) return { status: 'completed', days: null, km: null };
  const days = reminder.dueDate ? daysUntil(reminder.dueDate) : null;
  const km =
  reminder.dueMileage != null && reminder.dueMileage !== '' && mileage != null ?
  Number(reminder.dueMileage) - Number(mileage) :
  null;
  const overdue = days != null && days < 0 || km != null && km < 0;
  const soon = days != null && days <= 14 || km != null && km <= 1000;
  return { status: overdue ? 'overdue' : soon ? 'due-soon' : 'upcoming', days, km };
}

export const URGENCY_ORDER = { overdue: 0, 'due-soon': 1, upcoming: 2, completed: 3 };

export const CONDITION_SCORES = { excellent: 100, good: 82, fair: 55, poor: 25 };

export function healthFromCondition(condition = {}) {
  const values = Object.values(condition || {}).filter((v) => CONDITION_SCORES[v] != null);
  if (!values.length) return { score: null, status: 'unknown' };
  const score = Math.round(values.reduce((sum, v) => sum + CONDITION_SCORES[v], 0) / values.length);
  const hasPoor = values.includes('poor');
  const status = hasPoor || score < 50 ? 'attention' : score < 72 ? 'fair' : 'good';
  return { score, status };
}

export function nextService(vehicle) {
  if (!vehicle) return null;
  const interval = Number(vehicle.serviceIntervalKm) || 5000;
  const mileage = Number(vehicle.mileage) || 0;
  const last = Number(vehicle.lastServiceMileage ?? mileage);
  const dueMileage = last + interval;
  const remainingKm = dueMileage - mileage;
  const progress = Math.min(100, Math.max(0, (mileage - last) / interval * 100));
  let dueDate = null;
  const lastDate = toDate(vehicle.lastServiceDate);
  if (lastDate && vehicle.serviceIntervalMonths) {
    dueDate = format(addMonths(lastDate, Number(vehicle.serviceIntervalMonths)), 'yyyy-MM-dd');
  }
  const daysLeft = dueDate ? daysUntil(dueDate) : null;
  const overdue = remainingKm < 0 || daysLeft != null && daysLeft < 0;
  const soon = remainingKm <= 1000 || daysLeft != null && daysLeft <= 21;
  return {
    interval,
    lastMileage: last,
    dueMileage,
    remainingKm,
    progress,
    dueDate,
    daysLeft,
    status: overdue ? 'overdue' : soon ? 'due-soon' : 'ok'
  };
}

export function tyreStatus(tyre) {
  if (!tyre) return 'unknown';
  const tread = Number(tyre.treadDepth);
  const pressure = Number(tyre.pressure);
  const target = Number(tyre.recommendedPressure) || null;
  if (!Number.isNaN(tread) && tread > 0 && tread < 2) return 'attention';
  if (tyre.condition === 'Damaged' || tyre.condition === 'Replace soon') return 'attention';
  if (tread && tread < 3.5 || target && pressure && Math.abs(pressure - target) > 3) return 'fair';
  return 'good';
}