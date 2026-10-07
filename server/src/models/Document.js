import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'Other' },
  expiryDate: String,
  notes: String,
  fileName: String,
  fileType: String,
  fileSize: Number,
  filePath: String,
  hasFile: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

documentSchema.set('toJSON', { transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.owner; delete ret.filePath; return ret; } });
export default mongoose.model('Document', documentSchema);
