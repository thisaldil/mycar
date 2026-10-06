import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';
import { FieldShell, describedBy } from './FieldShell';

export const Input = forwardRef(function Input(
{ label, error, hint, id, prefix, suffix, className, inputClassName, required, labelAction, ...props },
ref)
{
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} required={required} className={className} labelAction={labelAction}>
      <div
        className={cn(
          'flex h-11 items-center rounded-xl border bg-surface transition-[border-color,box-shadow] duration-150 ease-out',
          'focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15',
          error ? 'border-danger' : 'border-line hover:border-line-strong',
          props.disabled && 'opacity-60'
        )}>
        
        {prefix ? <span className="shrink-0 pl-3 text-sm text-ink-muted">{prefix}</span> : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          aria-required={required || undefined}
          className={cn(
            'h-full w-full min-w-0 rounded-xl bg-transparent px-3 text-[15px] text-ink placeholder:text-ink-muted focus:outline-none',
            inputClassName
          )}
          {...props} />
        
        {suffix ? <span className="shrink-0 pr-3 text-sm text-ink-muted">{suffix}</span> : null}
      </div>
    </FieldShell>);

});