import { addMonths, format, parseISO, startOfMonth, startOfYear, subMonths, subDays, isAfter } from 'date-fns';
import { withEconomy } from './fuel';
import { daysUntil, expiryStatus, healthFromCondition, nextService, reminderState, URGENCY_ORDER } from './status';

export const COST_GROUPS = [
{ key: 'fuel', label: 'Fuel', categories: ['Fuel'] },
{ key: 'maintenance', label: 'Maintenance', categories: ['Maintenance', 'Tyres', 'Battery'] },
{ key: 'repair', label: 'Repairs', categories: ['Repair'] },
{ key: 'other', label: 'Other', categories: null }];


const monthKey = (iso) => String(iso || '').slice(0, 7);

export function groupOf(category) {
  const g = COST_GROUPS.find((x) => x.categories && x.categories.includes(category));
  return g ? g.key : 'other';
}

export function monthRange(range, earliest) {
  const end = startOfMonth(new Date());
  let start;
  if (range === 'ytd') start = startOfYear(end);else
  if (range === '6m') start = subMonths(end, 5);else
  if (range === 'all' && earliest) start = startOfMonth(parseISO(earliest));else
  start = subMonths(end, 11);
  if (start > end) start = end;
  const months = [];
  let guard = 0;
  for (let d = start; d <= end && guard < 120; d = addMonths(d, 1), guard += 1) months.push(d);
  const long = months.length > 12;
  return months.map((d) => ({
    key: format(d, 'yyyy-MM'),
    label: long ? format(d, "MMM ''yy") : format(d, 'MMM'),
    fullLabel: format(d, 'MMMM yyyy')
  }));
}

export function expenseTotals(expenses = []) {
  const mk = format(new Date(), 'yyyy-MM');
  const yk = format(new Date(), 'yyyy');
  let month = 0;
  let year = 0;
  let total = 0;
  const byCategory = {};
  for (const e of expenses) {
    const amount = Number(e.amount) || 0;
    total += amount;
    if (String(e.date).startsWith(mk)) month += amount;
    if (String(e.date).startsWith(yk)) {
      year += amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + amount;
    }
  }
  const categories = Object.entries(byCategory).
  map(([category, amount]) => ({ category, amount })).
  sort((a, b) => b.amount - a.amount);
  return { month, year, total, categories };
}

export function odometerReadings({ vehicle, fuel = [], maintenance = [], trips = [] }) {
  const readings = [];
  fuel.forEach((r) => r.mileage && readings.push({ date: r.date, mileage: Number(r.mileage) }));
  maintenance.forEach((r) => r.mileage && readings.push({ date: r.date, mileage: Number(r.mileage) }));
  trips.forEach((r) => r.endMileage && readings.push({ date: r.date, mileage: Number(r.endMileage) }));
  if (vehicle?.purchase?.date && vehicle?.purchase?.mileageAtPurchase != null) {
    readings.push({ date: vehicle.purchase.date, mileage: Number(vehicle.purchase.mileageAtPurchase) });
  }
  if (vehicle?.mileage) {
    readings.push({ date: (vehicle.mileageUpdatedAt || new Date().toISOString()).slice(0, 10), mileage: Number(vehicle.mileage) });
  }
  return readings.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function mileageByMonth(months, readings) {
  if (!months.length) return [];
  const startKey = months[0].key;
  const before = readings.filter((r) => monthKey(r.date) < startKey);
  let prev = before.length ? Math.max(...before.map((r) => r.mileage)) : null;
  return months.map((m) => {
    const upTo = readings.filter((r) => monthKey(r.date) <= m.key);
    const cum = upTo.length ? Math.max(...upTo.map((r) => r.mileage)) : prev;
    if (prev == null) {
      const inMonth = readings.filter((r) => monthKey(r.date) === m.key);
      prev = inMonth.length ? Math.min(...inMonth.map((r) => r.mileage)) : cum;
    }
    const km = cum != null && prev != null ? Math.max(0, cum - prev) : 0;
    prev = cum ?? prev;
    return { month: m.key, label: m.label, km };
  });
}

export function buildReport({ vehicle, expenses = [], fuel = [], maintenance = [], trips = [], range = '12m' }) {
  const earliest = [...expenses.map((e) => e.date), vehicle?.purchase?.date].filter(Boolean).sort()[0];
  const months = monthRange(range, earliest);
  const startKey = months[0]?.key || '0000-00';
  const rows = months.map((m) => ({ month: m.key, label: m.label, fullLabel: m.fullLabel, fuel: 0, maintenance: 0, repair: 0, other: 0, total: 0 }));
  const rowByKey = Object.fromEntries(rows.map((r) => [r.month, r]));
  const byCategory = {};
  let total = 0;

  expenses.forEach((e) => {
    const row = rowByKey[monthKey(e.date)];
    if (!row) return;
    const amount = Number(e.amount) || 0;
    const g = groupOf(e.category);
    row[g] += amount;
    row.total += amount;
    total += amount;
    byCategory[e.category] = (byCategory[e.category] || 0) + amount;
  });

  const readings = odometerReadings({ vehicle, fuel, maintenance, trips });
  const mileage = mileageByMonth(months, readings);
  const distance = mileage.reduce((s, m) => s + m.km, 0);

  const economy = withEconomy(fuel).
  filter((r) => r.economy && monthKey(r.date) >= startKey).
  sort((a, b) => String(a.date).localeCompare(String(b.date))).
  map((r) => ({ date: r.date, label: format(parseISO(r.date), 'd MMM'), value: Math.round(r.economy * 100) / 100 }));

  const fuelMonthly = rows.map((r) => ({ label: r.label, month: r.month, amount: r.fuel }));
  const litresMonthly = rows.map((r) => ({
    label: r.label,
    month: r.month,
    litres: Math.round(fuel.filter((f) => monthKey(f.date) === r.month).reduce((s, f) => s + (Number(f.litres) || 0), 0) * 10) / 10
  }));

  const yearlyMap = {};
  expenses.forEach((e) => {
    const y = String(e.date).slice(0, 4);
    if (y) yearlyMap[y] = (yearlyMap[y] || 0) + (Number(e.amount) || 0);
  });
  const yearly = Object.entries(yearlyMap).
  map(([year, amount]) => ({ year, amount })).
  sort((a, b) => a.year.localeCompare(b.year));

  const totals = COST_GROUPS.reduce((acc, g) => ({ ...acc, [g.key]: rows.reduce((s, r) => s + r[g.key], 0) }), { total });
  const allTime = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return {
    range,
    months: rows,
    totals,
    byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
    distance,
    costPerKm: distance > 0 ? total / distance : null,
    monthlyAverage: rows.length ? total / rows.length : 0,
    yearly,
    economy,
    fuelMonthly,
    litresMonthly,
    mileage,
    allTime,
    purchasePrice: Number(vehicle?.purchase?.price) || 0,
    since: vehicle?.purchase?.date || earliest || null
  };
}

export function buildTimeline({ vehicle, maintenance = [], fuel = [], insurance = [], inspections = [], tyres = [], batteries = [], accidents = [], modifications = [] }) {
  const events = [];
  if (vehicle?.purchase?.date) {
    events.push({
      id: `purchase-${vehicle.id}`,
      type: 'purchase',
      date: vehicle.purchase.date,
      title: vehicle.type === 'new' ? 'Vehicle purchased new' : 'Vehicle purchased',
      description: [vehicle.purchase.seller || vehicle.purchase.dealer, vehicle.purchase.mileageAtPurchase ? `${Number(vehicle.purchase.mileageAtPurchase).toLocaleString()} km on the clock` : null].filter(Boolean).join(' · '),
      amount: Number(vehicle.purchase.price) || null
    });
  }
  insurance.forEach((p) => events.push({ id: `ins-${p.id}`, type: 'insurance', date: p.startDate, title: `${p.policyType || 'Insurance'} policy started`, description: p.provider, amount: Number(p.premium) || null }));
  maintenance.forEach((m) => events.push({ id: `mnt-${m.id}`, type: m.serviceType === 'Repair' ? 'repair' : 'service', date: m.date, title: m.serviceType === 'Repair' ? m.description || 'Repair' : m.serviceType, description: [m.workshop, m.serviceType === 'Repair' ? null : m.description].filter(Boolean).join(' · '), mileage: m.mileage, amount: Number(m.totalCost) || null }));
  inspections.forEach((i) => events.push({ id: `insp-${i.id}`, type: 'inspection', date: i.date, title: `${i.type || 'Inspection'} — ${i.result || 'Recorded'}`, description: i.center, mileage: i.mileage, amount: Number(i.cost) || null, result: i.result }));
  tyres.forEach((t) => events.push({ id: `tyre-${t.id}`, type: 'tyres', date: t.installDate, title: `${t.brand || 'New'} tyre fitted`, description: [t.position, t.size].filter(Boolean).join(' · '), mileage: t.installMileage, amount: Number(t.cost) || null }));
  batteries.forEach((b) => events.push({ id: `bat-${b.id}`, type: 'battery', date: b.installDate, title: `${b.role || 'Battery'} installed`, description: [b.brand, b.type].filter(Boolean).join(' · '), mileage: b.installMileage, amount: Number(b.cost) || null }));
  accidents.forEach((a) => events.push({ id: `acc-${a.id}`, type: 'accident', date: a.date, title: `${a.severity || ''} accident`.trim(), description: a.location, amount: Number(a.repairCost) || null }));
  modifications.forEach((m) => events.push({ id: `mod-${m.id}`, type: 'modification', date: m.date, title: m.name, description: m.workshop, amount: Number(m.cost) || null }));

  // Fuel records are grouped by month so the timeline stays readable.
  const fuelByMonth = {};
  fuel.forEach((f) => {
    const k = monthKey(f.date);
    if (!fuelByMonth[k]) fuelByMonth[k] = { count: 0, litres: 0, total: 0, date: f.date };
    const g = fuelByMonth[k];
    g.count += 1;
    g.litres += Number(f.litres) || 0;
    g.total += Number(f.total) || 0;
    if (f.date > g.date) g.date = f.date;
  });
  Object.entries(fuelByMonth).forEach(([k, g]) => events.push({ id: `fuel-${k}`, type: 'fuel', date: g.date, title: `${g.count} fuel ${g.count === 1 ? 'fill' : 'fills'}`, description: `${g.litres.toFixed(1)} L this month`, amount: g.total }));

  return events.filter((e) => e.date).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function buildVehicleSummary({ vehicle, insurance = [], inspections = [], expenses = [], reminders = [], trips = [], fuel = [], maintenance = [], timeline = [] }) {
  const policy = [...insurance].sort((a, b) => String(b.expiryDate).localeCompare(String(a.expiryDate)))[0] || null;
  const lastInspection = [...inspections].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null;
  const health = healthFromCondition(vehicle.condition);
  const watch = Object.entries(vehicle.condition || {}).
  filter(([, v]) => v === 'fair' || v === 'poor').
  map(([system, level]) => ({ system, level }));
  const report = buildReport({ vehicle, expenses, fuel, maintenance, trips, range: '6m' });
  const current = report.months[report.months.length - 1] || { total: 0, fuel: 0, maintenance: 0, repair: 0, other: 0 };
  const weekAgo = subDays(new Date(), 7);
  const weekKm = trips.filter((t) => isAfter(parseISO(t.date), weekAgo)).reduce((s, t) => s + (Number(t.distance) || 0), 0);
  const upcoming = reminders.
  filter((r) => !r.completed).
  map((r) => ({ ...r, state: reminderState(r, vehicle.mileage) })).
  sort((a, b) => URGENCY_ORDER[a.state.status] - URGENCY_ORDER[b.state.status] || (a.state.days ?? 9999) - (b.state.days ?? 9999)).
  slice(0, 4);

  return {
    vehicle,
    nextService: nextService(vehicle),
    insurance: policy ? { ...policy, status: expiryStatus(policy.expiryDate, 30), daysLeft: daysUntil(policy.expiryDate) } : null,
    inspection: lastInspection ? { ...lastInspection, nextStatus: expiryStatus(lastInspection.nextDate, 45), daysLeft: daysUntil(lastInspection.nextDate) } : null,
    health: { ...health, watch },
    costs: {
      thisMonth: current.total,
      fuel: current.fuel,
      maintenance: current.maintenance + current.repair,
      other: current.other,
      monthlyAverage: report.monthlyAverage,
      costPerKm: report.costPerKm,
      months: report.months
    },
    reminders: upcoming,
    recent: timeline.slice(0, 5),
    weekKm
  };
}