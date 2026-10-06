/**
 * Demo backend used when VITE_API_URL is not set.
 * It mirrors the REST contract the Express API should implement (see README),
 * so UI code is identical in demo and production. Data persists in localStorage.
 */
import { AxiosError } from 'axios';
import { addMonths, format, parseISO } from 'date-fns';
import { createSeed } from '../data/seed';
import { buildReport, buildTimeline, buildVehicleSummary } from '../utils/analytics';
import { dataUrlToBlob, readAsDataURL } from '../utils/files';

const DB_KEY = 'carlife_mock_db_v1';
const COLLECTIONS = ['maintenance', 'fuel', 'expenses', 'documents', 'insurance', 'inspections', 'tyres', 'batteries', 'accidents', 'modifications', 'reminders', 'trips'];

class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = (h << 5) + h + str.charCodeAt(i) | 0;
  return `mock$${(h >>> 0).toString(16)}`;
}

const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
const nowISO = () => new Date().toISOString();
const todayISO = () => format(new Date(), 'yyyy-MM-dd');

let db = null;

function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {

    /* Storage full — changes stay in memory for this session. */}
}

function getDb() {
  if (db) return db;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) db = JSON.parse(raw);
  } catch {
    db = null;
  }
  if (!db) {
    db = createSeed({ hash });
    COLLECTIONS.forEach((name) => db[name].forEach((record) => syncExpense(name, record)));
    save();
  }
  return db;
}

/* ----------------------------- Linked expenses ---------------------------- */
// Cost-bearing records automatically create a linked expense (as the backend should).
const LINKS = {
  fuel: (r) => ({ category: 'Fuel', amount: r.total, title: r.station ? `Fuel — ${r.station}` : 'Fuel', date: r.date, mileage: r.mileage }),
  maintenance: (r) => ({ category: r.serviceType === 'Repair' ? 'Repair' : 'Maintenance', amount: r.totalCost, title: r.serviceType === 'Repair' ? r.description || 'Repair' : r.serviceType, date: r.date, mileage: r.mileage }),
  insurance: (r) => ({ category: 'Insurance', amount: r.premium, title: `${r.provider || 'Insurance'} premium`, date: r.startDate }),
  inspections: (r) => ({ category: 'Registration', amount: r.cost, title: r.type || 'Inspection', date: r.date }),
  tyres: (r) => ({ category: 'Tyres', amount: r.cost, title: `${r.brand || 'Tyre'} (${r.position})`, date: r.installDate }),
  batteries: (r) => ({ category: 'Battery', amount: r.cost, title: `${r.brand || 'Battery'} — ${r.role || ''}`.trim(), date: r.installDate }),
  accidents: (r) => r.claimFiled ? null : { category: 'Repair', amount: r.repairCost, title: `Accident repair — ${r.location || ''}`.trim(), date: r.date },
  modifications: (r) => ({ category: 'Accessories', amount: r.cost, title: r.name, date: r.date })
};

function syncExpense(collection, record) {
  const map = LINKS[collection];
  if (!map) return;
  const linked = map(record);
  const index = db.expenses.findIndex((e) => e.source?.id === record.id);
  const amount = Number(linked?.amount) || 0;
  if (!linked || amount <= 0 || !linked.date) {
    if (index >= 0) db.expenses.splice(index, 1);
    return;
  }
  const expense = { id: index >= 0 ? db.expenses[index].id : uid('exp'), vehicleId: record.vehicleId, notes: '', ...linked, amount, source: { type: collection, id: record.id } };
  if (index >= 0) db.expenses[index] = expense;else
  db.expenses.push(expense);
}

function removeLinkedExpense(recordId) {
  db.expenses = db.expenses.filter((e) => e.source?.id !== recordId);
}

/* --------------------------------- Helpers -------------------------------- */
function currentUser(userId) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new ApiError(401, 'Your session has expired. Please sign in again.');
  return user;
}

function publicUser(user) {
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, resetToken, resetExpires, ...rest } = user;
  return rest;
}

function ownedVehicle(userId, vehicleId) {
  const vehicle = db.vehicles.find((v) => v.id === vehicleId && v.userId === userId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');
  return vehicle;
}

const userVehicleIds = (userId) => new Set(db.vehicles.filter((v) => v.userId === userId).map((v) => v.id));

function recordsFor(vehicleId) {
  return Object.fromEntries(COLLECTIONS.map((name) => [name, db[name].filter((r) => r.vehicleId === vehicleId)]));
}

function decorateVehicle(vehicle) {
  const policy = db.insurance.filter((p) => p.vehicleId === vehicle.id).sort((a, b) => String(b.expiryDate).localeCompare(String(a.expiryDate)))[0];
  return { ...vehicle, insuranceExpiry: policy?.expiryDate || null };
}

const dateOf = (r) => r.date || r.startDate || r.installDate || r.uploadDate || r.dueDate || r.createdAt || '';
const sortDesc = (list) => [...list].sort((a, b) => String(dateOf(b)).localeCompare(String(dateOf(a))));

function deepMerge(target, source) {
  const out = { ...target };
  Object.entries(source || {}).forEach(([k, v]) => {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && target?.[k] && typeof target[k] === 'object' ? deepMerge(target[k], v) : v;
  });
  return out;
}

const b64url = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

function signToken(userId, remember) {
  const exp = Math.floor(Date.now() / 1000) + (remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12);
  return `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: userId, exp })}.demo`;
}

function readToken(config) {
  const headers = config.headers || {};
  const raw = typeof headers.get === 'function' && headers.get('Authorization') || headers.Authorization || headers.authorization;
  const token = typeof raw === 'string' ? raw.replace(/^Bearer\s+/i, '') : null;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp * 1000 < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

async function parseBody(data) {
  if (!data) return {};
  if (typeof data === 'string') return JSON.parse(data);
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const out = {};
    for (const [key, value] of data.entries()) {
      if (typeof File !== 'undefined' && value instanceof File) {
        out[key] = { name: value.name, type: value.type, size: value.size, dataUrl: value.size <= 3 * 1024 * 1024 ? await readAsDataURL(value) : null };
      } else out[key] = value;
    }
    return out;
  }
  return data;
}

function placeholderScan(doc) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 850;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fbfbf8';
    ctx.fillRect(0, 0, 850, 1100);
    ctx.fillStyle = '#1e40dc';
    ctx.fillRect(0, 0, 850, 12);
    ctx.fillStyle = '#0d1117';
    ctx.font = '600 34px Arial';
    ctx.fillText(String(doc.name).slice(0, 38), 64, 110);
    ctx.fillStyle = '#646c7a';
    ctx.font = '20px Arial';
    ctx.fillText(`${doc.category} document · uploaded ${doc.uploadDate}`, 64, 150);
    ctx.fillStyle = '#e2e5ea';
    for (let i = 0; i < 14; i += 1) ctx.fillRect(64, 220 + i * 46, i % 4 === 3 ? 460 : 722, 14);
    ctx.strokeStyle = '#cfd4db';
    ctx.lineWidth = 2;
    ctx.strokeRect(64, 900, 300, 120);
    ctx.fillText('Authorised signature', 84, 1060);
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/* --------------------------------- Router --------------------------------- */
const routes = [];
function route(method, pattern, handler, { auth = true } = {}) {
  const keys = [];
  const re = new RegExp(`^${pattern.replace(/\/:(\w+)/g, (_, k) => {keys.push(k);return '/([^/]+)';})}/?$`);
  routes.push({ method, re, keys, handler, auth });
}

function requireFields(body, fields) {
  const errors = {};
  fields.forEach(([key, label]) => {
    if (body[key] === undefined || body[key] === null || String(body[key]).trim() === '') errors[key] = `${label} is required`;
  });
  if (Object.keys(errors).length) throw new ApiError(422, 'Please check the highlighted fields.', errors);
}

// Auth
route('post', '/auth/login', ({ body }) => {
  requireFields(body, [['email', 'Email'], ['password', 'Password']]);
  const user = db.users.find((u) => u.email.toLowerCase() === String(body.email).trim().toLowerCase());
  if (!user || user.passwordHash !== hash(body.password)) throw new ApiError(401, 'Incorrect email or password.');
  return { token: signToken(user.id, body.rememberMe), user: publicUser(user) };
}, { auth: false });

route('post', '/auth/register', ({ body }) => {
  requireFields(body, [['name', 'Name'], ['email', 'Email'], ['password', 'Password']]);
  const email = String(body.email).trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === email)) throw new ApiError(409, 'An account with this email already exists.', { email: 'This email is already registered' });
  const user = { id: uid('usr'), name: String(body.name).trim(), email, avatar: null, passwordHash: hash(body.password), createdAt: nowISO(), settings: null };
  db.users.push(user);
  return { token: signToken(user.id, false), user: publicUser(user) };
}, { auth: false });

route('post', '/auth/forgot-password', ({ body }) => {
  requireFields(body, [['email', 'Email']]);
  const user = db.users.find((u) => u.email.toLowerCase() === String(body.email).trim().toLowerCase());
  let devResetToken;
  if (user) {
    user.resetToken = uid('rst');
    user.resetExpires = Date.now() + 60 * 60 * 1000;
    devResetToken = user.resetToken;
  }
  return { message: 'If an account exists for that email, a reset link is on its way.', devResetToken };
}, { auth: false });

route('post', '/auth/reset-password', ({ body }) => {
  const user = db.users.find((u) => u.resetToken && u.resetToken === body.token && u.resetExpires > Date.now());
  if (!user) throw new ApiError(400, 'This reset link is invalid or has expired. Request a new one.');
  user.passwordHash = hash(body.password);
  delete user.resetToken;
  delete user.resetExpires;
  return { message: 'Password updated.' };
}, { auth: false });

route('get', '/auth/me', ({ userId }) => publicUser(currentUser(userId)));
route('post', '/auth/logout', () => ({ message: 'Signed out.' }));

route('put', '/auth/profile', ({ userId, body }) => {
  const user = currentUser(userId);
  requireFields(body, [['name', 'Name'], ['email', 'Email']]);
  const email = String(body.email).trim().toLowerCase();
  if (db.users.some((u) => u.id !== userId && u.email.toLowerCase() === email)) throw new ApiError(409, 'That email is already in use.', { email: 'This email is already in use' });
  Object.assign(user, { name: String(body.name).trim(), email, avatar: body.avatar ?? user.avatar });
  return publicUser(user);
});

route('put', '/auth/change-password', ({ userId, body }) => {
  const user = currentUser(userId);
  if (user.passwordHash !== hash(body.currentPassword || '')) throw new ApiError(400, 'Your current password is incorrect.', { currentPassword: 'Current password is incorrect' });
  user.passwordHash = hash(body.newPassword);
  return { message: 'Password changed.' };
});

route('put', '/users/me/settings', ({ userId, body }) => {
  const user = currentUser(userId);
  user.settings = body;
  return user.settings;
});

route('get', '/users/me/export', ({ userId }) => {
  const user = currentUser(userId);
  const ids = userVehicleIds(userId);
  const records = Object.fromEntries(COLLECTIONS.map((name) => [name, db[name].filter((r) => ids.has(r.vehicleId)).map(({ fileData, ...r }) => r)]));
  return { exportedAt: nowISO(), user: publicUser(user), vehicles: db.vehicles.filter((v) => v.userId === userId), records };
});

// Vehicles
route('get', '/vehicles', ({ userId }) => db.vehicles.filter((v) => v.userId === userId).map(decorateVehicle).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))));

route('post', '/vehicles', ({ userId, body }) => {
  requireFields(body, [['make', 'Make'], ['model', 'Model'], ['year', 'Year']]);
  const vehicle = {
    serviceIntervalKm: 5000,
    serviceIntervalMonths: 12,
    ...body,
    id: uid('veh'),
    userId,
    status: 'active',
    mileage: Number(body.mileage) || 0,
    lastServiceMileage: body.lastServiceMileage ?? Number(body.mileage) ?? 0,
    lastServiceDate: body.lastServiceDate || todayISO(),
    mileageUpdatedAt: todayISO(),
    createdAt: nowISO()
  };
  db.vehicles.push(vehicle);
  return decorateVehicle(vehicle);
});

route('get', '/vehicles/:id', ({ userId, params }) => decorateVehicle(ownedVehicle(userId, params.id)));

route('put', '/vehicles/:id', ({ userId, params, body }) => {
  const vehicle = ownedVehicle(userId, params.id);
  // eslint-disable-next-line no-unused-vars
  const { id, userId: _u, createdAt, ...changes } = body;
  const updated = deepMerge(vehicle, changes);
  Object.assign(vehicle, updated);
  return decorateVehicle(vehicle);
});

route('delete', '/vehicles/:id', ({ userId, params }) => {
  ownedVehicle(userId, params.id);
  db.vehicles = db.vehicles.filter((v) => v.id !== params.id);
  COLLECTIONS.forEach((name) => {
    db[name] = db[name].filter((r) => r.vehicleId !== params.id);
  });
  return { id: params.id };
});

route('patch', '/vehicles/:id/archive', ({ userId, params, body }) => {
  const vehicle = ownedVehicle(userId, params.id);
  vehicle.status = body.archived ? 'archived' : 'active';
  return decorateVehicle(vehicle);
});

route('patch', '/vehicles/:id/mileage', ({ userId, params, body }) => {
  const vehicle = ownedVehicle(userId, params.id);
  const mileage = Number(body.mileage);
  if (!Number.isFinite(mileage) || mileage < 0) throw new ApiError(422, 'Enter a valid odometer reading.', { mileage: 'Enter a valid reading' });
  if (mileage < vehicle.mileage) throw new ApiError(422, 'The new reading is lower than the current odometer.', { mileage: `Must be at least ${vehicle.mileage.toLocaleString()} km` });
  vehicle.mileage = mileage;
  vehicle.mileageUpdatedAt = todayISO();
  return decorateVehicle(vehicle);
});

route('get', '/vehicles/:id/summary', ({ userId, params }) => {
  const vehicle = decorateVehicle(ownedVehicle(userId, params.id));
  const records = recordsFor(vehicle.id);
  const timeline = buildTimeline({ vehicle, ...records });
  return buildVehicleSummary({ vehicle, ...records, timeline });
});

route('get', '/vehicles/:id/timeline', ({ userId, params }) => {
  const vehicle = ownedVehicle(userId, params.id);
  return buildTimeline({ vehicle, ...recordsFor(vehicle.id) });
});

// Reports
route('get', '/reports/summary', ({ userId, query }) => {
  const vehicle = ownedVehicle(userId, query.vehicleId);
  const records = recordsFor(vehicle.id);
  return buildReport({ vehicle, ...records, range: query.range || '12m' });
});

// Documents file download (authorised Blob, no public URL)
route('get', '/documents/:id/file', async ({ userId, params }) => {
  const doc = db.documents.find((d) => d.id === params.id);
  if (!doc || !userVehicleIds(userId).has(doc.vehicleId)) throw new ApiError(404, 'Document not found.');
  if (doc.fileData) return dataUrlToBlob(doc.fileData);
  return placeholderScan(doc);
});

// Reminders: complete / reopen
route('patch', '/reminders/:id/complete', ({ userId, params, body }) => {
  const reminder = db.reminders.find((r) => r.id === params.id);
  if (!reminder || !userVehicleIds(userId).has(reminder.vehicleId)) throw new ApiError(404, 'Reminder not found.');
  reminder.completed = body.completed !== false;
  reminder.completedAt = reminder.completed ? todayISO() : null;
  let next = null;
  if (reminder.completed && reminder.repeat && reminder.repeat !== 'none' && reminder.dueDate) {
    const months = { monthly: 1, '6m': 6, yearly: 12 }[reminder.repeat] || 0;
    if (months) {
      next = { ...reminder, id: uid('rem'), completed: false, completedAt: null, dueDate: format(addMonths(parseISO(reminder.dueDate), months), 'yyyy-MM-dd') };
      db.reminders.push(next);
    }
  }
  return { reminder, next };
});

// Generic collections
COLLECTIONS.forEach((name) => {
  const path = `/${name}`;

  route('get', path, ({ userId, query }) => {
    const ids = userVehicleIds(userId);
    let list = db[name].filter((r) => ids.has(r.vehicleId));
    if (query.vehicleId) list = list.filter((r) => r.vehicleId === query.vehicleId);
    if (query.category) list = list.filter((r) => r.category === query.category);
    if (name === 'documents') list = list.map(({ fileData, ...r }) => ({ ...r, hasFile: true }));
    return sortDesc(list);
  });

  route('get', `${path}/:id`, ({ userId, params }) => {
    const record = db[name].find((r) => r.id === params.id);
    if (!record || !userVehicleIds(userId).has(record.vehicleId)) throw new ApiError(404, 'Record not found.');
    if (name === 'documents') {
      // eslint-disable-next-line no-unused-vars
      const { fileData, ...rest } = record;
      return rest;
    }
    return record;
  });

  route('post', path, ({ userId, body }) => {
    requireFields(body, [['vehicleId', 'Vehicle']]);
    const vehicle = ownedVehicle(userId, body.vehicleId);
    let record = { ...body, id: uid(name.slice(0, 3)), createdAt: nowISO() };
    if (name === 'documents') {
      requireFields(body, [['name', 'Document name'], ['category', 'Category']]);
      const { file, ...meta } = body;
      if (!file) throw new ApiError(422, 'Choose a file to upload.', { file: 'A file is required' });
      record = { ...meta, id: record.id, uploadDate: todayISO(), fileName: file.name, fileType: file.type, fileSize: file.size, fileData: file.dataUrl, createdAt: record.createdAt };
    }
    if (name === 'trips') {
      const distance = Number(body.distance) || 0;
      record.endMileage = vehicle.mileage + distance;
      vehicle.mileage = record.endMileage;
      vehicle.mileageUpdatedAt = todayISO();
    }
    if (name === 'fuel' || name === 'maintenance') {
      const mileage = Number(body.mileage) || 0;
      if (mileage > vehicle.mileage) {
        vehicle.mileage = mileage;
        vehicle.mileageUpdatedAt = todayISO();
      }
      if (name === 'maintenance' && ['Periodic service', 'Oil change'].includes(body.serviceType) && mileage >= (vehicle.lastServiceMileage || 0)) {
        vehicle.lastServiceMileage = mileage;
        vehicle.lastServiceDate = body.date;
      }
    }
    db[name].push(record);
    syncExpense(name, record);
    if (name === 'documents') {
      // eslint-disable-next-line no-unused-vars
      const { fileData, ...rest } = record;
      return { ...rest, hasFile: true };
    }
    return record;
  });

  route('put', `${path}/:id`, ({ userId, params, body }) => {
    const index = db[name].findIndex((r) => r.id === params.id);
    const existing = db[name][index];
    if (!existing || !userVehicleIds(userId).has(existing.vehicleId)) throw new ApiError(404, 'Record not found.');
    if (name === 'expenses' && existing.source) throw new ApiError(400, `This expense comes from a ${existing.source.type} record. Edit it there instead.`);
    // eslint-disable-next-line no-unused-vars
    const { id, fileData, file, ...changes } = body;
    const updated = { ...existing, ...changes, id: existing.id, vehicleId: existing.vehicleId, updatedAt: nowISO() };
    db[name][index] = updated;
    syncExpense(name, updated);
    if (name === 'documents') {
      // eslint-disable-next-line no-unused-vars
      const { fileData: _f, ...rest } = updated;
      return rest;
    }
    return updated;
  });

  route('delete', `${path}/:id`, ({ userId, params }) => {
    const existing = db[name].find((r) => r.id === params.id);
    if (!existing || !userVehicleIds(userId).has(existing.vehicleId)) throw new ApiError(404, 'Record not found.');
    if (name === 'expenses' && existing.source) throw new ApiError(400, `This expense comes from a ${existing.source.type} record. Delete it there instead.`);
    db[name] = db[name].filter((r) => r.id !== params.id);
    removeLinkedExpense(params.id);
    return { id: params.id };
  });
});

/* --------------------------------- Adapter -------------------------------- */
function buildResponse(config, status, data, headers = {}) {
  return { data, status, statusText: String(status), headers, config, request: {} };
}

export async function mockAdapter(config) {
  getDb();
  await new Promise((r) => setTimeout(r, 220 + Math.random() * 260));

  const method = (config.method || 'get').toLowerCase();
  const path = String(config.url || '').split('?')[0].replace(/^https?:\/\/[^/]+/, '').replace(/^\/api(?=\/)/, '');
  const query = config.params || {};

  try {
    let body = {};
    try {
      body = await parseBody(config.data);
    } catch {
      throw new ApiError(400, 'Malformed request body.');
    }

    let matched = null;
    for (const r of routes) {
      if (r.method !== method) continue;
      const m = path.match(r.re);
      if (m) {
        matched = { ...r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
        break;
      }
    }
    if (!matched) throw new ApiError(404, `Endpoint not found: ${method.toUpperCase()} ${path}`);

    const userId = readToken(config);
    if (matched.auth && !userId) throw new ApiError(401, 'Your session has expired. Please sign in again.');
    if (matched.auth) currentUser(userId);

    const result = await matched.handler({ params: matched.params, query, body, userId });
    save();

    if (typeof Blob !== 'undefined' && result instanceof Blob) {
      return buildResponse(config, 200, result, { 'content-type': result.type });
    }
    return buildResponse(config, method === 'post' ? 201 : 200, { success: true, data: result });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Unexpected server error.';
    const response = buildResponse(config, status, { success: false, message, errors: err.errors });
    throw new AxiosError(message, status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, {}, response);
  }
}