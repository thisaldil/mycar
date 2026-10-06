import { BatteryChargingIcon } from 'lucide-react';
import { addMonths, differenceInMonths, format } from 'date-fns';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { batteryApi } from '../../services/batteryApi';
import { toDate } from '../../utils/format';
import { RecordsView } from '../common/RecordsView';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';

const byInstallDesc = (a, b) => String(b.installDate).localeCompare(String(a.installDate));

function warrantyInfo(battery) {
  const installed = toDate(battery.installDate);
  const months = Number(battery.warrantyMonths) || 0;
  if (!installed || !months) return null;
  const used = differenceInMonths(new Date(), installed);
  const until = addMonths(installed, months);
  return { used, months, until: format(until, 'yyyy-MM-dd'), left: months - used };
}

function BatteryCards({ items, onOpen }) {
  const fmt = useFormat();
  // Latest battery per role (e.g. 12V + hybrid pack).
  const latest = Object.values(
    [...items].sort(byInstallDesc).reduce((acc, b) => {
      if (!acc[b.role]) acc[b.role] = b;
      return acc;
    }, {})
  );

  return (
    <div className={cn('grid gap-4', latest.length > 1 && 'md:grid-cols-2')}>
      {latest.map((b) => {
        const w = warrantyInfo(b);
        const installed = toDate(b.installDate);
        const ageYears = installed ? (Date.now() - installed.getTime()) / (365.25 * 24 * 3600 * 1000) : null;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onOpen(b)}
            className="flex flex-col rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition-colors duration-150 hover:border-line-strong">
            
            <div className="flex w-full items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-ink-muted">{b.role}</p>
                <h3 className="truncate text-lg font-bold text-ink">{b.brand}</h3>
                <p className="truncate text-sm text-ink-soft">{[b.type, b.capacity].filter(Boolean).join(' · ')}</p>
              </div>
              <StatusBadge status={String(b.condition || 'unknown').toLowerCase()} />
            </div>
            <dl className="mt-5 grid w-full grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink-muted">Age</dt>
                <dd className="mt-0.5 font-semibold text-ink tnum">{ageYears != null ? `${ageYears.toFixed(1)} years` : '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Installed</dt>
                <dd className="mt-0.5 font-semibold text-ink">{b.installDate ? fmt.date(b.installDate, 'monthShort') : '—'}</dd>
              </div>
            </dl>
            {w ?
            <div className="mt-5 w-full">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-ink-muted">Warranty</span>
                  <span className={cn('font-medium', w.left < 0 ? 'text-danger' : w.left <= 3 ? 'text-warning' : 'text-ink-soft')}>
                    {w.left < 0 ? `Ended ${fmt.date(w.until, 'monthShort')}` : `${w.left} months left`}
                  </span>
                </div>
                <ProgressBar
                value={Math.min(w.used, w.months)}
                max={w.months}
                tone={w.left < 0 ? 'danger' : w.left <= 3 ? 'warning' : 'success'}
                size="sm"
                label="Warranty used"
                valueText={`${Math.min(w.used, w.months)} of ${w.months} months used`} />
              
              </div> :
            null}
          </button>);

      })}
    </div>);

}

export function BatteryPanel({ vehicle }) {
  const fmt = useFormat();
  return (
    <RecordsView
      vehicle={vehicle}
      api={batteryApi}
      formKey="batteries"
      listTitle="Battery history"
      addLabel="Add battery"
      cardIcon={BatteryChargingIcon}
      sort={byInstallDesc}
      getTitle={(r) => `${r.brand} — ${r.role}`}
      getSubtitle={(r) => [r.type, r.installDate ? `Installed ${fmt.date(r.installDate)}` : null].filter(Boolean).join(' · ')}
      summary={(items, h) => <BatteryCards items={items} onOpen={h.open} />}
      empty={{ icon: BatteryChargingIcon, title: 'No battery recorded', description: 'Track your 12V (and hybrid) battery so you know its age and when the warranty ends.' }}
      columns={[
      { key: 'role', header: 'Battery', render: (r) => <span className="font-medium">{r.role}</span> },
      { key: 'brand', header: 'Brand', render: (r) => r.brand },
      { key: 'type', header: 'Type', render: (r) => r.type || '—', cellClassName: 'text-ink-soft' },
      { key: 'installed', header: 'Installed', render: (r) => r.installDate ? fmt.date(r.installDate) : '—' },
      { key: 'mileage', header: 'At odometer', align: 'right', render: (r) => r.installMileage != null && r.installMileage !== '' ? fmt.distance(r.installMileage) : '—' },
      { key: 'condition', header: 'Condition', render: (r) => <StatusBadge status={String(r.condition || 'unknown').toLowerCase()} size="sm" /> }]
      } />);


}