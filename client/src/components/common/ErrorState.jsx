import { CloudOffIcon, RotateCwIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export function ErrorState({ title = "We couldn't load this", error, onRetry, className }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-12 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <CloudOffIcon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{error?.message || 'Something went wrong. Please try again.'}</p>
      {onRetry ?
      <Button variant="secondary" className="mt-5" leftIcon={RotateCwIcon} onClick={onRetry}>
          Try again
        </Button> :
      null}
    </div>);

}