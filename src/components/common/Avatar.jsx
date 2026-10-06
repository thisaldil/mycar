import { cn } from '../../utils/cn';
import { safeUrl } from '../../utils/sanitize';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };

export function Avatar({ name = '', src, size = 'md', className }) {
  const initials = name.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((p) => p[0]?.toUpperCase()).
  join('');
  const url = safeUrl(src);
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand', SIZES[size], className)}>
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span aria-hidden="true">{initials || '?'}</span>}
    </span>);

}