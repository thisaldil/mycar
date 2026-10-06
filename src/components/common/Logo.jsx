import { GaugeIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Logo({ className, inverted = false, showText = true }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-on">
        <GaugeIcon className="h-5 w-5" aria-hidden="true" />
      </span>
      {showText ?
      <span className={cn('font-display text-lg font-bold tracking-tight', inverted ? 'text-sidebar-ink' : 'text-ink')}>CarLife</span> :

      <span className="sr-only">CarLife</span>
      }
    </span>);

}