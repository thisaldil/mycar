import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ page, pageSize, total, onChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-ink-muted tnum" aria-live="polite">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon-sm" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <span className="min-w-[4.5rem] text-center text-sm text-ink-soft tnum">
          {page} / {pageCount}
        </span>
        <Button variant="secondary" size="icon-sm" onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
    </nav>);

}