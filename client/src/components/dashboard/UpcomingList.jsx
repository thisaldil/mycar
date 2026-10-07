import { Link } from 'react-router-dom';
import { CheckCircle2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { REMINDER_TYPE_ICONS } from '../../data/reminderTypes';
import { describeDue } from '../../utils/reminderText';
import { Card, CardHeader } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';

const ICON_TONE = { overdue: 'bg-danger-soft text-danger', 'due-soon': 'bg-warning-soft text-warning', upcoming: 'bg-subtle text-ink-soft' };

export function UpcomingList({ reminders, className }) {
  const fmt = useFormat();
  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader
        title="Coming up"
        action={
        <Link to="/reminders" className="text-sm font-medium text-brand hover:underline">
            All reminders
          </Link>
        } />
      
      {reminders.length ?
      <ul className="-mx-1 divide-y divide-line">
          {reminders.map((r) => {
          const Icon = REMINDER_TYPE_ICONS[r.type] || REMINDER_TYPE_ICONS.Other;
          return (
            <li key={r.id} className="flex items-center gap-3 px-1 py-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ICON_TONE[r.state.status])}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                  <p className="truncate text-xs text-ink-muted">{describeDue(r, r.state, fmt)}</p>
                </div>
                {r.state.status !== 'upcoming' ? <StatusBadge status={r.state.status} size="sm" /> : null}
              </li>);

        })}
        </ul> :

      <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2Icon className="h-6 w-6 text-success" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">Nothing coming up</p>
          <p className="text-xs text-ink-muted">Add reminders for renewals and services.</p>
        </div>
      }
    </Card>);

}