import { passwordStrength } from '../../utils/validation';
import { ProgressBar } from './ProgressBar';

export function PasswordStrength({ password }) {
  if (!password) return null;
  const { score, label, tone } = passwordStrength(password);
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <ProgressBar value={score} max={4} tone={tone} size="sm" label="Password strength" valueText={label} />
      <span className="w-16 shrink-0 text-right text-xs font-medium text-ink-muted">{label}</span>
    </div>);

}