import { cn } from '../../utils/cn';

const HINT_TONES = { neutral: 'text-ink-muted', success: 'text-success', warning: 'text-warning', danger: 'text-danger', brand: 'text-brand' };
const COLS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };

/**
 * A single surface holding related metrics, separated by hairlines instead of separate cards.
 * stats: [{ label, value, hint?, hintTone?, icon?, emphasis? }]
 */
export function StatGroup({ stats, className }) {
  return (
    <dl className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card', COLS[stats.length] || 'sm:grid-cols-4', className)}>
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={cn('min-w-0 bg-surface p-4 sm:p-5', s.emphasis && 'col-span-2 sm:col-span-1')}>
            <dt className="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted">
              {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              <span className="truncate">{s.label}</span>
            </dt>
            <dd className={cn('mt-1.5 truncate font-display font-semibold text-ink tnum', s.emphasis ? 'text-2xl sm:text-[28px]' : 'text-xl')}>{s.value}</dd>
            {s.hint ? <dd className={cn('mt-0.5 truncate text-[13px]', HINT_TONES[s.hintTone || 'neutral'])}>{s.hint}</dd> : null}
          </div>);

      })}
    </dl>);

}