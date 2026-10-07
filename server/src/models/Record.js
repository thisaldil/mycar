import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true }
}, { timestamps: true, strict: false });

recordSchema.index({ vehicleId: 1, date: -1 });
recordSchema.set('toJSON', { transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.owner; return ret; } });
export default recordSchema;
