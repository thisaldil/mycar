import { forwardRef, useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FieldShell, describedBy } from './FieldShell';

const normalize = (options) => options.map((o) => typeof o === 'string' || typeof o === 'number' ? { value: String(o), label: String(o) } : o);

export const Select = forwardRef(function Select(
{ label, error, hint, id, options = [], placeholder, className, selectClassName, required, ...props },
ref)
{
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <FieldShell id={selectId} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, hint)}
          aria-required={required || undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border bg-surface pl-3 pr-10 text-[15px] text-ink',
            'transition-[border-color,box-shadow] duration-150 ease-out focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15',
            error ? 'border-danger' : 'border-line hover:border-line-strong',
            selectClassName
          )}
          {...props}>
          
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {normalize(options).map((o) =>
          <option key={o.value} value={o.value}>
              {o.label}
            </option>
          )}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      </div>
    </FieldShell>);

});