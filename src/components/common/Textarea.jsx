import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';
import { FieldShell, describedBy } from './FieldShell';

export const Textarea = forwardRef(function Textarea({ label, error, hint, id, className, required, rows = 3, ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} required={required} className={className}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        aria-required={required || undefined}
        className={cn(
          'w-full resize-y rounded-xl border bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-muted',
          'transition-[border-color,box-shadow] duration-150 ease-out focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15',
          error ? 'border-danger' : 'border-line hover:border-line-strong'
        )}
        {...props} />
      
    </FieldShell>);

});