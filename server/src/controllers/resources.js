import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Record from '../models/Record.js';
import Document from '../models/Document.js';
import { ok } from '../utils/response.js';
import { readDocument, removeDocument, storeDocument } from '../services/blobStorage.js';

const models = {};
const modelFor = (name) => name === 'Document' ? Document : (models[name] ||= mongoose.model(name, Record));
const safeId = (value) => mongoose.isValidObjectId(value);
const recordFields = new Set([
  'vehicleId', 'title', 'description', 'date', 'category', 'amount', 'total', 'totalCost', 'cost',
  'type', 'serviceType', 'name', 'dueDate', 'status', 'notes', 'provider', 'location', 'odometer',
  'mileage', 'litres', 'pricePerLitre', 'quantity', 'unit', 'brand', 'model', 'registration',
  'policyNumber', 'expiryDate', 'startDate', 'endDate', 'scheduledDate', 'completedDate',
  'frequency', 'priority', 'reminderType', 'tripType', 'distance', 'fuelUsed', 'rating',
  'condition', 'items', 'metadata', 'data', 'station', 'fuelGrade', 'fullTank', 'workshop',
  'labourCost', 'partsCost', 'partsReplaced', 'attachments', 'photos', 'policyType', 'premium',
  'coverageAmount', 'coverage', 'agent', 'result', 'nextDate', 'center', 'position', 'size',
  'treadDepth', 'pressure', 'recommendedPressure', 'installDate', 'installMileage', 'role',
  'capacity', 'warrantyMonths', 'severity', 'damage', 'claimFiled', 'claimNumber', 'claimStatus',
  'repairCost', 'repeat', 'completed', 'dueMileage', 'uploadDate'
]);
const vehicleFields = new Set([
  'type', 'status', 'make', 'model', 'year', 'mileage', 'registration', 'vin', 'images', 'variant',
  'color', 'fuelType', 'transmission', 'mileageUpdatedAt', 'image', 'serviceIntervalKm',
  'serviceIntervalMonths', 'lastServiceMileage', 'lastServiceDate', 'purchase', 'technical',
  'dimensions', 'performance', 'condition'
]);
const documentFields = new Set(['vehicleId', 'name', 'category', 'expiryDate', 'notes']);

function pickFields(body, fields) {
  return Object.fromEntries(Object.entries(body || {}).filter(([key]) => fields.has(key)));
}

async function ownedVehicle(userId, vehicleId) {
  if (!safeId(vehicleId)) return null;
  return Vehicle.findOne({ _id: vehicleId, owner: userId });
}

export async function getVehicleRecord(userId, vehicleId) {
  return ownedVehicle(userId, vehicleId);
}

export function resourceController(name) {
  const Model = modelFor(name);
  const updateFields = name === 'Document' ? documentFields : recordFields;
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
      const record = await Model.create({ ...pickFields(req.body, recordFields), owner: req.user.id });
      return ok(res, record, 'Record created.', 201);
    },
    update: async (req, res) => {
      if (req.body.vehicleId && !await ownedVehicle(req.user.id, req.body.vehicleId)) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      const record = await Model.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { $set: pickFields(req.body, updateFields) }, { new: true, runValidators: true });
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
export async function createVehicle(req, res) { const v = await Vehicle.create({ ...pickFields(req.body, vehicleFields), owner: req.user.id }); return ok(res, v, 'Vehicle created.', 201); }
export async function getVehicle(req, res) { const v = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); return ok(res, v); }
export async function updateVehicle(req, res) { const v = await Vehicle.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { $set: pickFields(req.body, vehicleFields) }, { new: true, runValidators: true }); if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); return ok(res, v); }
export async function deleteVehicle(req, res) {
  const v = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id });
  if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  const documents = await Document.find({ owner: req.user.id, vehicleId: v.id });
  for (const document of documents) {
    if (document.blobPathname) await removeDocument(document.blobPathname);
  }
  await Vehicle.deleteOne({ _id: v.id, owner: req.user.id });
  await Record.deleteMany({ owner: req.user.id, vehicleId: v.id });
  await Document.deleteMany({ owner: req.user.id, vehicleId: v.id });
  return ok(res, { id: req.params.id });
}
export async function archiveVehicle(req, res) { return updateVehicle({ ...req, body: { status: req.body.archived ? 'archived' : 'active' } }, res); }
export async function updateMileage(req, res) { return updateVehicle({ ...req, body: { mileage: req.body.mileage, mileageUpdatedAt: new Date() } }, res); }

async function vehicleRecords(userId, vehicleId) { return Record.find({ owner: userId, vehicleId }).sort({ date: -1, createdAt: -1 }); }
export async function timeline(req, res) { const records = await vehicleRecords(req.user.id, req.params.id); return ok(res, records.map((r) => ({ ...r.toJSON(), title: r.title || r.serviceType || r.type || r.name || r.category || 'Vehicle event', type: r.type || r.serviceType || r.category || 'record' }))); }
export async function summary(req, res) { const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id }); if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' }); const records = await vehicleRecords(req.user.id, req.params.id); const expenses = records.reduce((sum, r) => sum + Number(r.amount || r.total || r.totalCost || r.cost || 0), 0); return ok(res, { vehicle, nextService: null, insurance: null, inspection: null, health: null, expenses: { total: expenses }, reminders: records.filter((r) => r.dueDate).slice(0, 5), recentActivity: records.slice(0, 5), timeline: records.slice(0, 20) }); }

export async function uploadDocument(req, res) {
  if (!await ownedVehicle(req.user.id, req.body.vehicleId)) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  let stored;
  try {
    if (req.uploadedFile) {
      stored = await storeDocument({
        body: req.uploadedFile.buffer,
        contentType: req.uploadedFile.mimetype,
        extension: req.uploadedFile.extension,
        ownerId: req.user.id
      });
    }
    const doc = await Document.create({
      ...pickFields(req.body, documentFields),
      owner: req.user.id,
      ...(req.uploadedFile ? {
        fileName: req.uploadedFile.originalname.replace(/[^\w.\- ]/g, '_').slice(0, 200),
        fileType: req.uploadedFile.mimetype,
        fileSize: req.uploadedFile.size,
        blobUrl: stored.url,
        blobPathname: stored.pathname,
        hasFile: true
      } : {})
    });
    return ok(res, doc, 'Document uploaded.', 201);
  } catch (error) {
    if (stored?.pathname) {
      try {
        await removeDocument(stored.pathname);
      } catch (cleanupError) {
        console.error('Failed to clean up Blob after database error.', cleanupError);
      }
    }
    throw error;
  }
}
export async function downloadDocument(req, res) {
  const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
  if (!doc || !doc.blobPathname) return res.status(404).json({ success: false, message: 'Document file not found.' });
  const result = await readDocument(doc.blobPathname);
  if (!result) return res.status(404).json({ success: false, message: 'Document file not found.' });
  res.status(result.statusCode);
  res.set('Content-Type', doc.fileType || result.headers.get('content-type') || 'application/octet-stream');
  res.set('Content-Disposition', `attachment; filename="${String(doc.fileName || 'document').replace(/["\r\n]/g, '_')}"`);
  return res.send(Buffer.from(await result.stream.arrayBuffer()));
}
export async function deleteDocument(req, res) {
  const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
  if (doc.blobPathname) await removeDocument(doc.blobPathname);
  await Document.deleteOne({ _id: doc.id, owner: req.user.id });
  return ok(res, { id: req.params.id });
}
export { Document };
