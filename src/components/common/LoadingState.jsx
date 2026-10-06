import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Skeleton } from './Skeleton';

/** variant: spinner | list | cards | page */
export function LoadingState({ variant = 'spinner', label = 'Loading…', rows = 5, className }) {
  if (variant === 'spinner') {
    return (
      <div role="status" className={cn('flex items-center justify-center gap-2 py-16 text-sm text-ink-muted', className)}>
        <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span>{label}</span>
      </div>);

  }

  return (
    <div role="status" aria-label={label} className={cn('space-y-6', className)}>
      <span className="sr-only">{label}</span>
      {variant === 'page' ?
      <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36 md:col-span-2" />
          <Skeleton className="h-36" />
        </div> :
      null}
      {variant === 'cards' ?
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: Math.min(rows, 6) }).map((_, i) =>
        <div key={i} className="rounded-2xl border border-line bg-surface p-4">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
        )}
        </div> :

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {Array.from({ length: rows }).map((_, i) =>
        <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
        )}
        </div>
      }
    </div>);

}