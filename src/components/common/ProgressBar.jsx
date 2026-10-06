import { cn } from '../../utils/cn';

const TONES = { brand: 'bg-brand', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', neutral: 'bg-ink-muted' };

export function ProgressBar({ value = 0, max = 100, tone = 'brand', label, size = 'md', className, valueText }) {
  const pct = Math.max(0, Math.min(100, Number(value) / Number(max) * 100 || 0));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-valuetext={valueText}
      className={cn('w-full overflow-hidden rounded-full bg-subtle ring-1 ring-inset ring-line', size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2', className)}>
      
      <div className={cn('h-full rounded-full transition-[width] duration-300 ease-out', TONES[tone])} style={{ width: `${pct}%` }} />
    </div>);

}