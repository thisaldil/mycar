import { cn } from '../../utils/cn';

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-line/70', className)} aria-hidden="true" />;
}