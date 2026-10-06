import { z } from 'zod';

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(254, 'Email is too long');

export const passwordSchema = z.
string().
min(8, 'Use at least 8 characters').
max(128, 'Password is too long').
regex(/[A-Za-z]/, 'Include at least one letter').
regex(/\d/, 'Include at least one number');

export function passwordStrength(pw = '') {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const tones = ['danger', 'danger', 'warning', 'success', 'success'];
  return { score, label: labels[score], tone: tones[score] };
}