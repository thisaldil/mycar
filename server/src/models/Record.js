import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  title: String, description: String, date: String, category: String, amount: Number, total: Number,
  totalCost: Number, cost: Number, type: String, serviceType: String, name: String, dueDate: String,
  status: String, notes: String, provider: String, location: String, odometer: Number, mileage: Number,
  litres: Number, pricePerLitre: Number, quantity: Number, unit: String, brand: String, model: String,
  registration: String, policyNumber: String, expiryDate: String, startDate: String, endDate: String,
  scheduledDate: String, completedDate: String, frequency: String, priority: String, reminderType: String,
  tripType: String, distance: Number, fuelUsed: Number, rating: Number, condition: String,
  items: mongoose.Schema.Types.Mixed, metadata: mongoose.Schema.Types.Mixed, data: mongoose.Schema.Types.Mixed,
  station: String, fuelGrade: String, fullTank: Boolean, workshop: String, labourCost: Number,
  partsCost: Number, partsReplaced: String, attachments: [mongoose.Schema.Types.Mixed], photos: [String],
  policyType: String, premium: Number, coverageAmount: Number, coverage: String, agent: String,
  result: String, nextDate: String, center: String, position: String, size: String, treadDepth: Number,
  pressure: Number, recommendedPressure: Number, installDate: String, installMileage: Number,
  role: String, capacity: String, warrantyMonths: Number, severity: String, damage: String,
  claimFiled: Boolean, claimNumber: String, claimStatus: String, repairCost: Number, repeat: String,
  completed: Boolean, dueMileage: Number, uploadDate: String
}, { timestamps: true });

recordSchema.index({ vehicleId: 1, date: -1 });
recordSchema.set('toJSON', { transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.owner; return ret; } });
export default recordSchema;
