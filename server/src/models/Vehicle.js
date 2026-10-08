import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['new', 'used'], default: 'used' },
  status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1950, max: 2200 },
  mileage: { type: Number, required: true, min: 0 },
  registration: { type: String, trim: true, index: true },
  vin: { type: String, trim: true, index: true },
  images: { type: [String], default: [] },
  variant: String,
  color: String,
  fuelType: String,
  transmission: String,
  mileageUpdatedAt: Date,
  image: String,
  serviceIntervalKm: Number,
  serviceIntervalMonths: Number,
  lastServiceMileage: Number,
  lastServiceDate: String,
  purchase: mongoose.Schema.Types.Mixed,
  technical: mongoose.Schema.Types.Mixed,
  dimensions: mongoose.Schema.Types.Mixed,
  performance: mongoose.Schema.Types.Mixed,
  condition: mongoose.Schema.Types.Mixed
}, { timestamps: true });

vehicleSchema.set('toJSON', { transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.owner; return ret; } });
export default mongoose.model('Vehicle', vehicleSchema);
