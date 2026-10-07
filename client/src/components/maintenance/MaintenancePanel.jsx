import { WrenchIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { maintenanceApi } from '../../services/maintenanceApi';
import { nextService } from '../../utils/status';
import { RecordsView } from '../common/RecordsView';
import { StatGroup } from '../common/StatGroup';
import { Badge } from '../common/Badge';

const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));
const titleOf = (r) => r.serviceType === 'Repair' ? r.description || 'Repair' : r.serviceType;

function MaintenanceSummary({ items, vehicle }) {
  const fmt = useFormat();
  const service = nextService(vehicle);
  const sorted = [...items].sort(byDateDesc);
  const last = sorted.find((r) => r.serviceType !== 'Repair') || sorted[0];
  const year = String(new Date().getFullYear());
  const yearTotal = items.filter((r) => String(r.date).startsWith(year)).reduce((s, r) => s + (Number(r.totalCost) || 0), 0);
  const total = items.reduce((s, r) => s + (Number(r.totalCost) || 0), 0);

  return (
    <StatGroup
      stats={[
      {
        label: 'Next service',
        value: service.remainingKm >= 0 ? `${fmt.distance(service.remainingKm)} left` : `${fmt.distance(-service.remainingKm)} overdue`,
        hint: `Due at ${fmt.distance(service.dueMileage)}${service.dueDate ? ` or ${fmt.date(service.dueDate, 'short')}` : ''}`,
        hintTone: service.status === 'overdue' ? 'danger' : service.status === 'due-soon' ? 'warning' : 'neutral',
        emphasis: true
      },
      { label: 'Last service', value: last ? fmt.date(last.date, 'short') : '—', hint: last ? `${fmt.relative(last.date)} · ${fmt.distance(last.mileage)}` : undefined },
      { label: `Spent in ${year}`, value: fmt.money(yearTotal), hint: 'Services and repairs' },
      { label: 'Total maintenance', value: fmt.money(total), hint: `${items.length} records` }]
      } />);


}

export function MaintenancePanel({ vehicle }) {
  const fmt = useFormat();
  return (
    <RecordsView
      vehicle={vehicle}
      api={maintenanceApi}
      formKey="maintenance"
      listTitle="Service history"
      addLabel="Add service record"
      cardIcon={WrenchIcon}
      sort={byDateDesc}
      getTitle={titleOf}
      getSubtitle={(r) => [fmt.date(r.date), fmt.distance(r.mileage), r.workshop].filter(Boolean).join(' · ')}
      getValue={(r) => fmt.money(r.totalCost)}
      summary={(items) => <MaintenanceSummary items={items} vehicle={vehicle} />}
      empty={{ icon: WrenchIcon, title: 'No service records yet', description: 'Log services and repairs to track costs and know exactly when the next one is due.' }}
      columns={[
      { key: 'date', header: 'Date', render: (r) => <span className="whitespace-nowrap">{fmt.date(r.date)}</span> },
      {
        key: 'service',
        header: 'Service',
        render: (r) =>
        <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium text-ink">
                <span className="truncate">{titleOf(r)}</span>
                {r.serviceType === 'Repair' ? <Badge tone="warning" size="sm">Repair</Badge> : null}
              </p>
              {r.serviceType !== 'Repair' && r.description ? <p className="max-w-sm truncate text-xs text-ink-muted">{r.description}</p> : null}
            </div>

      },
      { key: 'workshop', header: 'Workshop', render: (r) => r.workshop || '—', cellClassName: 'text-ink-soft' },
      { key: 'mileage', header: 'Odometer', align: 'right', render: (r) => fmt.distance(r.mileage) },
      { key: 'totalCost', header: 'Cost', align: 'right', render: (r) => <span className="font-medium">{fmt.money(r.totalCost)}</span> }]
      } />);


}