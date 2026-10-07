import { useId } from 'react';
import { cn } from '../../utils/cn';

export function Switch({ checked, onChange, label, description, disabled, className }) {
  const id = useId();
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3', className)}>
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-medium text-ink">
          {label}
        </p>
        {description ?
        <p id={`${id}-desc`} className="mt-0.5 text-[13px] text-ink-muted">
            {description}
          </p> :
        null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ease-out disabled:opacity-50',
          checked ? 'bg-brand' : 'bg-line-strong'
        )}>
        
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out',
            checked ? 'translate-x-6' : 'translate-x-1'
          )} />
        
      </button>
    </div>);

}