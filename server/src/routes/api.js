import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../controllers/auth.js';
import * as resources from '../controllers/resources.js';

const router = express.Router();
const uploadDir = path.resolve(env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(null, true);
    return cb(Object.assign(new Error('Only PDF and image documents are supported.'), { status: 400 }));
  }
});

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/forgot-password', auth.forgotPassword);
router.post('/auth/reset-password', auth.resetPassword);
router.use(requireAuth);
router.get('/auth/me', auth.me);
router.post('/auth/logout', auth.logout);
router.put('/auth/profile', auth.updateProfile);
router.put('/auth/change-password', auth.changePassword);
router.put('/users/me/settings', auth.settings);
router.get('/users/me/export', auth.exportData);

router.get('/vehicles', resources.listVehicles);
router.post('/vehicles', resources.createVehicle);
router.get('/vehicles/:id', resources.getVehicle);
router.put('/vehicles/:id', resources.updateVehicle);
router.delete('/vehicles/:id', resources.deleteVehicle);
router.patch('/vehicles/:id/archive', resources.archiveVehicle);
router.patch('/vehicles/:id/mileage', resources.updateMileage);
router.get('/vehicles/:id/summary', resources.summary);
router.get('/vehicles/:id/timeline', resources.timeline);

const collections = {
  maintenance: 'Maintenance', fuel: 'Fuel', expenses: 'Expense', insurance: 'Insurance',
  inspections: 'Inspection', tyres: 'Tyre', batteries: 'Battery', accidents: 'Accident',
  modifications: 'Modification', reminders: 'Reminder', trips: 'Trip'
};
for (const [route, name] of Object.entries(collections)) {
  const controller = resources.resourceController(name);
  router.get(`/${route}`, controller.list);
  router.post(`/${route}`, controller.create);
  router.get(`/${route}/:id`, controller.get);
  router.put(`/${route}/:id`, controller.update);
  router.delete(`/${route}/:id`, controller.remove);
}

router.get('/documents', async (req, res) => resources.resourceController('Document').list(req, res));
router.get('/documents/:id', async (req, res) => resources.resourceController('Document').get(req, res));
router.post('/documents', upload.single('file'), resources.uploadDocument);
router.put('/documents/:id', async (req, res) => resources.resourceController('Document').update(req, res));
router.delete('/documents/:id', resources.deleteDocument);
router.get('/documents/:id/file', resources.downloadDocument);

router.get('/reports/summary', async (req, res) => {
  const vehicle = await resources.getVehicleRecord?.(req.user.id, req.query.vehicleId);
  if (req.query.vehicleId && !vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  const records = req.query.vehicleId ? await (await import('../models/Record.js')).default.find({ owner: req.user.id, vehicleId: req.query.vehicleId }) : [];
  const months = [...new Set(records.map((r) => String(r.date || r.createdAt || '').slice(0, 7)).filter(Boolean))].sort().slice(-12);
  const total = records.reduce((sum, r) => sum + Number(r.amount || r.total || r.totalCost || r.cost || 0), 0);
  return res.json({ success: true, data: { range: req.query.range || '12m', months: months.map((month) => ({ month, label: month, total: 0, fuel: 0, maintenance: 0, repair: 0, other: 0 })), totals: { fuel: 0, maintenance: 0, repair: 0, other: total, total }, byCategory: [], distance: 0, costPerKm: 0, monthlyAverage: months.length ? total / months.length : 0, yearly: [], economy: [], fuelMonthly: [], litresMonthly: [], mileage: [], allTime: total, purchasePrice: 0, since: null } });
});

export default router;
