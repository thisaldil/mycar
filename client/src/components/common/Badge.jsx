import { cn } from '../../utils/cn';

const TONES = {
  neutral: 'bg-subtle text-ink-soft ring-line',
  brand: 'bg-brand-soft text-brand ring-brand/15',
  success: 'bg-success-soft text-success ring-success/20',
  warning: 'bg-warning-soft text-warning ring-warning/25',
  danger: 'bg-danger-soft text-danger ring-danger/20'
};

export function Badge({ tone = 'neutral', dot = false, className, children, size = 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        TONES[tone],
        className
      )}>
      
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>);

}