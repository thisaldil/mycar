import { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/** Accessible radio-group styled as a segmented control. */
export function SegmentedControl({ options, value, onChange, ariaLabel, size = 'md', className, fullWidth = false }) {
  const layoutId = useId();
  const refs = useRef([]);
  const items = options.map((o) => typeof o === 'string' ? { value: o, label: o } : o);

  const onKeyDown = (e, index) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = (index + dir + items.length) % items.length;
    onChange(items[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('inline-flex rounded-xl bg-subtle p-1 ring-1 ring-inset ring-line', fullWidth && 'flex w-full', className)}>
      
      {items.map((item, index) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'relative flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors duration-150',
              size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9 px-3.5 text-sm',
              fullWidth && 'flex-1',
              active ? 'text-ink' : 'text-ink-muted hover:text-ink'
            )}>
            
            {active ?
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-surface shadow-card ring-1 ring-line"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }} /> :

            null}
            <span className="relative flex items-center gap-1.5">
              {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
              {item.label}
            </span>
          </button>);

      })}
    </div>);

}