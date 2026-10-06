import { CircleAlertIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function describedBy(id, error, hint) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function FieldShell({ id, label, hint, error, required, className, labelAction, children }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      {label ?
      <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
            {required ?
          <span className="ml-0.5 text-danger" aria-hidden="true">
                *
              </span> :
          null}
          </label>
          {labelAction}
        </div> :
      null}
      {children}
      {error ?
      <p id={`${id}-error`} className="flex items-start gap-1.5 text-[13px] text-danger">
          <CircleAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p> :
      hint ?
      <p id={`${id}-hint`} className="text-[13px] text-ink-muted">
          {hint}
        </p> :
      null}
    </div>);

}