import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import Vehicle from '../models/Vehicle.js';
import Record from '../models/Record.js';
import Document from '../models/Document.js';
import { env } from '../config/env.js';
import { ok } from '../utils/response.js';

const models = {};
const modelFor = (name) => name === 'Document' ? Document : (models[name] ||= mongoose.model(name, Record));
const safeId = (value) => mongoose.isValidObjectId(value);

async function ownedVehicle(userId, vehicleId) {
  if (!safeId(vehicleId)) return null;
  return Vehicle.findOne({ _id: vehicleId, owner: userId });
}

export async function getVehicleRecord(userId, vehicleId) {
  return ownedVehicle(userId, vehicleId);
}

export function resourceController(name) {
  const Model = modelFor(name);
  return {
    list: async (req, res) => {
      const filter = { owner: req.user.id };
      if (req.query.vehicleId) { if (!await ownedVehicle(req.user.id, req.query.vehicleId)) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); filter.vehicleId = req.query.vehicleId; }
      if (req.query.category) filter.category = req.query.category;
      return ok(res, await Model.find(filter).sort({ date: -1, createdAt: -1 }));
    },
    get: async (req, res) => ok(res, await Model.findOne({ _id: req.params.id, owner: req.user.id }) || (() => { throw Object.assign(new Error('Record not found.'), { status: 404 }); })()),
    create: async (req, res) => {
      if (!await ownedVehicle(req.user.id, req.body.vehicleId)) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      const record = await Model.create({ ...req.body, owner: req.user.id });
      return ok(res, record, 'Record created.', 201);
    },
    update: async (req, res) => {
      const record = await Model.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { $set: req.body }, { new: true, runValidators: true });
      if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
      return ok(res, record);
    },
    remove: async (req, res) => {
      const record = await Model.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
      if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
      return ok(res, { id: req.params.id }, 'Record deleted.');
    }
  };
}

export async function listVehicles(req, res) { return ok(res, await Vehicle.find({ owner: req.user.id }).sort({ createdAt: -1 })); }
export async function createVehicle(req, res) { const v = await Vehicle.create({ ...req.body, owner: req.user.id }); return ok(res, v, 'Vehicle created.', 201); }
export async function getVehicle(req, res) { const v = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); return ok(res, v); }
export async function updateVehicle(req, res) { const v = await Vehicle.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { $set: req.body }, { new: true, runValidators: true }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); return ok(res, v); }
export async function deleteVehicle(req, res) { const v = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.user.id }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); await Record.deleteMany({ owner: req.user.id, vehicleId: v.id }); await Document.deleteMany({ owner: req.user.id, vehicleId: v.id }); return ok(res, { id: req.params.id }); }
export async function archiveVehicle(req, res) { return updateVehicle({ ...req, body: { status: req.body.archived ? 'archived' : 'active' } }, res); }
export async function updateMileage(req, res) { return updateVehicle({ ...req, body: { mileage: req.body.mileage, mileageUpdatedAt: new Date() } }, res); }

async function vehicleRecords(userId, vehicleId) { return Record.find({ owner: userId, vehicleId }).sort({ date: -1, createdAt: -1 }); }
export async function timeline(req, res) { const records = await vehicleRecords(req.user.id, req.params.id); return ok(res, records.map((r) => ({ ...r.toJSON(), title: r.title || r.serviceType || r.type || r.name || r.category || 'Vehicle event', type: r.type || r.serviceType || r.category || 'record' }))); }
export async function summary(req, res) { const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id }); if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); const records = await vehicleRecords(req.user.id, req.params.id); const expenses = records.reduce((sum, r) => sum + Number(r.amount || r.total || r.totalCost || r.cost || 0), 0); return ok(res, { vehicle, nextService: null, insurance: null, inspection: null, health: null, expenses: { total: expenses }, reminders: records.filter((r) => r.dueDate).slice(0, 5), recentActivity: records.slice(0, 5), timeline: records.slice(0, 20) }); }

export async function uploadDocument(req, res) { if (!await ownedVehicle(req.user.id, req.body.vehicleId)) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); const doc = await Document.create({ ...req.body, owner: req.user.id, ...(req.file ? { fileName: req.file.originalname, fileType: req.file.mimetype, fileSize: req.file.size, filePath: req.file.path, hasFile: true } : {}) }); return ok(res, doc, 'Document uploaded.', 201); }
export async function downloadDocument(req, res) { const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id }); if (!doc || !doc.filePath) return res.status(404).json({ success: false, message: 'Document file not found.' }); res.type(doc.fileType || 'application/octet-stream'); res.download(path.resolve(doc.filePath), doc.fileName); }
export async function deleteDocument(req, res) { const doc = await Document.findOneAndDelete({ _id: req.params.id, owner: req.user.id }); if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' }); if (doc.filePath) await fs.rm(doc.filePath, { force: true }); return ok(res, { id: req.params.id }); }
export { Document };
