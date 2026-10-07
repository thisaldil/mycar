import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  avatar: { type: String, default: '' },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  resetTokenHash: { type: String, select: false },
  resetExpires: { type: Date, select: false }
}, { timestamps: true, toJSON: { transform: (_, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.passwordHash; delete ret.resetTokenHash; delete ret.resetExpires; return ret; } } });

export default mongoose.model('User', userSchema);
