import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { TIMELINE_TYPES, TONE_CLASSES } from '../../data/timelineTypes';

export function RecentActivity({ items, vehicleId }) {
  const fmt = useFormat();
  if (!items?.length) return null;
  return (
    <section aria-labelledby="recent-activity">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="recent-activity" className="text-base font-semibold text-ink">
          Recent activity
        </h2>
        <Link to={`/vehicles/${vehicleId}?tab=timeline`} className="text-sm font-medium text-brand hover:underline">
          Full timeline
        </Link>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {items.map((e) => {
          const meta = TIMELINE_TYPES[e.type] || TIMELINE_TYPES.service;
          const Icon = meta.icon;
          return (
            <li key={e.id} className="flex items-center gap-3 py-3">
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', TONE_CLASSES[meta.tone])}>
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                <p className="truncate text-xs text-ink-muted">
                  {fmt.date(e.date)}
                  {e.description ? ` · ${e.description}` : ''}
                </p>
              </div>
              {e.amount ? <span className="shrink-0 text-sm font-medium text-ink tnum">{fmt.money(e.amount)}</span> : null}
            </li>);

        })}
      </ul>
    </section>);

}