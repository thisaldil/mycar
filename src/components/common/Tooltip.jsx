import { cn } from '../../utils/cn';

const SIDES = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  right: 'left-full top-1/2 ml-3 -translate-y-1/2'
};

/** Visual tooltip on hover/focus. The wrapped control must have its own accessible name. */
export function Tooltip({ content, side = 'top', children, className, disabled = false }) {
  if (disabled || !content) return children;
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-canvas opacity-0 shadow-pop',
          'transition-opacity duration-150 ease-out group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          SIDES[side]
        )}>
        
        {content}
      </span>
    </span>);

}