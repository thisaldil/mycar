import { CheckIcon, MoreHorizontalIcon, PencilIcon, RepeatIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { REMINDER_TYPE_ICONS } from '../../data/reminderTypes';
import { REMINDER_REPEAT } from '../../data/options';
import { describeDue } from '../../utils/reminderText';
import { cleanText } from '../../utils/sanitize';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { StatusBadge } from '../common/StatusBadge';
import { Dropdown } from '../common/Dropdown';

const TONES = {
  overdue: { icon: 'bg-danger-soft text-danger', text: 'text-danger' },
  'due-soon': { icon: 'bg-warning-soft text-warning', text: 'text-warning' },
  upcoming: { icon: 'bg-subtle text-ink-soft', text: 'text-ink-soft' },
  completed: { icon: 'bg-success-soft text-success', text: 'text-ink-muted' }
};

export function ReminderCard({ reminder, onComplete, onReopen, onEdit, onDelete, busy }) {
  const fmt = useFormat();
  const { state } = reminder;
  const tone = TONES[state.status];
  const Icon = REMINDER_TYPE_ICONS[reminder.type] || REMINDER_TYPE_ICONS.Other;
  const repeat = REMINDER_REPEAT.find((r) => r.value === reminder.repeat && r.value !== 'none');

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone.icon)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('text-[15px] font-semibold text-ink', reminder.completed && 'line-through decoration-ink-muted/60')}>{reminder.title}</h3>
            {state.status !== 'upcoming' ? <StatusBadge status={state.status} size="sm" /> : null}
            {repeat ?
            <Badge size="sm">
                <RepeatIcon className="h-3 w-3" aria-hidden="true" />
                {repeat.label}
              </Badge> :
            null}
          </div>
          <p className={cn('mt-0.5 text-sm font-medium', tone.text)}>{describeDue(reminder, state, fmt)}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {reminder.type}
            {reminder.notes ? ` · ${cleanText(reminder.notes, 140)}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-[60px] sm:pl-0">
        {reminder.completed ?
        <Button size="sm" variant="ghost" leftIcon={RotateCcwIcon} onClick={onReopen} loading={busy}>
            Reopen
          </Button> :

        <Button size="sm" variant="secondary" leftIcon={CheckIcon} onClick={onComplete} loading={busy}>
            Mark done
          </Button>
        }
        <Dropdown
          items={[
          { label: 'Edit', icon: PencilIcon, onSelect: onEdit },
          { label: 'Delete', icon: Trash2Icon, danger: true, onSelect: onDelete }]
          }
          trigger={(props) =>
          <Button {...props} variant="ghost" size="icon-sm" aria-label={`More actions for ${reminder.title}`}>
              <MoreHorizontalIcon aria-hidden="true" />
            </Button>
          } />
        
      </div>
    </li>);

}