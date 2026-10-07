import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Record from '../models/Record.js';
import Document from '../models/Document.js';
import { env } from '../config/env.js';
import { ok } from '../utils/response.js';

const publicUser = (user) => user.toJSON();
const tokenFor = (user, remember = false) => jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: remember ? '30d' : env.jwtExpiresIn });

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ success: false, message: 'Name, email and a password of at least 8 characters are required.', errors: { password: 'Password must be at least 8 characters.' } });
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  return ok(res, { token: tokenFor(user), user: publicUser(user) }, 'Account created.', 201);
}

export async function login(req, res) {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  return ok(res, { token: tokenFor(user, Boolean(req.body.rememberMe)), user: publicUser(user) });
}

export async function me(req, res) { return ok(res, publicUser(req.user)); }
export async function logout(req, res) { return ok(res, null, 'Signed out.'); }

export async function updateProfile(req, res) {
  const allowed = ['name', 'email', 'avatar'];
  allowed.forEach((key) => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
  await req.user.save();
  return ok(res, publicUser(req.user));
}

export async function changePassword(req, res) {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.currentPassword || '', user.passwordHash))) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  user.passwordHash = await bcrypt.hash(req.body.newPassword || '', 12);
  await user.save();
  return ok(res, null, 'Password changed.');
}

export async function forgotPassword(req, res) {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+resetTokenHash +resetExpires');
  if (!user) return ok(res, { message: 'If that account exists, reset instructions have been sent.' });
  const raw = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  user.resetExpires = new Date(Date.now() + 3600000);
  await user.save();
  return ok(res, { message: 'Reset token created.', ...(env.nodeEnv !== 'production' ? { devResetToken: raw } : {}) });
}

export async function resetPassword(req, res) {
  const hash = crypto.createHash('sha256').update(req.body.token || '').digest('hex');
  const user = await User.findOne({ resetTokenHash: hash, resetExpires: { $gt: new Date() } }).select('+resetTokenHash +resetExpires +passwordHash');
  if (!user || !req.body.password || req.body.password.length < 8) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  user.passwordHash = await bcrypt.hash(req.body.password, 12); user.resetTokenHash = undefined; user.resetExpires = undefined; await user.save();
  return ok(res, null, 'Password reset.');
}

export async function settings(req, res) { req.user.settings = { ...(req.user.settings || {}), ...req.body }; await req.user.save(); return ok(res, req.user.settings); }
export async function exportData(req, res) {
  const vehicles = await Vehicle.find({ owner: req.user.id });
  const vehicleIds = vehicles.map((v) => v.id);
  const records = await Record.find({ owner: req.user.id, vehicleId: { $in: vehicleIds } });
  const documents = await Document.find({ owner: req.user.id, vehicleId: { $in: vehicleIds } });
  return ok(res, { exportedAt: new Date().toISOString(), user: publicUser(req.user), vehicles, records, documents });
}
