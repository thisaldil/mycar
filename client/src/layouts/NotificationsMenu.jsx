import { Link, useLocation } from 'react-router-dom';
import { BellIcon, CheckCircle2Icon } from 'lucide-react';
import { cn } from '../utils/cn';
import { useVehicles } from '../context/VehicleContext';
import { useSettings } from '../context/SettingsContext';
import { useAsync } from '../hooks/useAsync';
import { useFormat } from '../hooks/useFormat';
import { reminderApi } from '../services/reminderApi';
import { reminderState, URGENCY_ORDER } from '../utils/status';
import { Dropdown } from '../components/common/Dropdown';
import { StatusBadge } from '../components/common/StatusBadge';

const TYPE_SETTING = { Service: 'service', Insurance: 'insurance', Inspection: 'inspection' };

export function NotificationsMenu() {
  const { activeVehicle } = useVehicles();
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const fmt = useFormat();
  const { data } = useAsync(
    () => activeVehicle ? reminderApi.list({ vehicleId: activeVehicle.id }) : Promise.resolve([]),
    [activeVehicle?.id, pathname]
  );

  const prefs = settings.notifications || {};
  const leadDays = Number(prefs.leadDays) || 30;
  const items = (data || []).
  filter((r) => !r.completed && prefs[TYPE_SETTING[r.type] || 'other'] !== false).
  map((r) => ({ ...r, state: reminderState(r, activeVehicle?.mileage) })).
  filter((r) => r.state.status === 'overdue' || r.state.status === 'due-soon' || r.state.days != null && r.state.days <= leadDays).
  sort((a, b) => URGENCY_ORDER[a.state.status] - URGENCY_ORDER[b.state.status] || (a.state.days ?? 9999) - (b.state.days ?? 9999));
  const urgent = items.filter((r) => r.state.status !== 'upcoming').length;

  return (
    <Dropdown
      role="dialog"
      menuClassName="w-[20rem] p-0"
      trigger={(props) =>
      <button
        {...props}
        type="button"
        className="relative flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 hover:bg-subtle hover:text-ink"
        aria-label={items.length ? `Notifications: ${items.length} reminders need attention` : 'Notifications'}>
        
          <BellIcon className="h-5 w-5" aria-hidden="true" />
          {items.length ?
        <span
          className={cn(
            'absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ring-canvas tnum',
            urgent ? 'bg-danger text-danger-on' : 'bg-brand text-brand-on'
          )}
          aria-hidden="true">
          
              {items.length}
            </span> :
        null}
        </button>
      }>
      
      {(close) =>
      <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Needs attention</p>
            <Link to="/reminders" onClick={close} className="text-sm font-medium text-brand hover:underline">
              All reminders
            </Link>
          </div>
          {items.length ?
        <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
              {items.map((r) =>
          <li key={r.id}>
                  <Link to="/reminders" onClick={close} className="flex items-start gap-3 px-4 py-3 transition-colors duration-100 hover:bg-subtle">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{r.title}</span>
                      <span className="block text-xs text-ink-muted">
                        {r.dueDate ? `${fmt.date(r.dueDate)} · ${fmt.relative(r.dueDate)}` : `At ${fmt.distance(r.dueMileage)}`}
                      </span>
                    </span>
                    <StatusBadge status={r.state.status} size="sm" />
                  </Link>
                </li>
          )}
            </ul> :

        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <CheckCircle2Icon className="h-6 w-6 text-success" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">You're all caught up</p>
              <p className="text-xs text-ink-muted">Nothing due in the next {leadDays} days.</p>
            </div>
        }
        </div>
      }
    </Dropdown>);

}