import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const Checkbox = forwardRef(function Checkbox({ label, description, id, className, ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <label htmlFor={inputId} className={cn('flex min-h-[44px] cursor-pointer items-start gap-3 py-1', className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md border-line-strong accent-brand"
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...props} />
      
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ?
        <span id={`${inputId}-desc`} className="block text-[13px] text-ink-muted">
            {description}
          </span> :
        null}
      </span>
    </label>);

});