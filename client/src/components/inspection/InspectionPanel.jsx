import { ClipboardCheckIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { inspectionApi } from '../../services/inspectionApi';
import { daysUntil } from '../../utils/status';
import { RecordsView } from '../common/RecordsView';
import { StatGroup } from '../common/StatGroup';
import { StatusBadge } from '../common/StatusBadge';

const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

function InspectionSummary({ items }) {
  const fmt = useFormat();
  const last = [...items].sort(byDateDesc)[0];
  const nextDate = last?.nextDate;
  const days = daysUntil(nextDate);

  return (
    <StatGroup
      stats={[
      {
        label: 'Next inspection',
        value: nextDate ? fmt.date(nextDate) : 'Not scheduled',
        hint: nextDate ? days < 0 ? `${Math.abs(days)} days overdue` : `Due ${fmt.relative(nextDate)}` : 'Add a next due date',
        hintTone: days != null && days < 0 ? 'danger' : days != null && days <= 45 ? 'warning' : 'neutral',
        emphasis: true
      },
      { label: 'Last result', value: last?.result || '—', hint: last?.type, hintTone: last?.result === 'Fail' ? 'danger' : last?.result === 'Advisory' ? 'warning' : 'success' },
      { label: 'Last inspection', value: last ? fmt.date(last.date, 'short') : '—', hint: last?.center },
      { label: 'Last cost', value: last?.cost ? fmt.money(last.cost) : '—' }]
      } />);


}

export function InspectionPanel({ vehicle }) {
  const fmt = useFormat();
  return (
    <RecordsView
      vehicle={vehicle}
      api={inspectionApi}
      formKey="inspections"
      listTitle="Inspection history"
      addLabel="Add inspection"
      cardIcon={ClipboardCheckIcon}
      sort={byDateDesc}
      getTitle={(r) => `${r.type} — ${r.result}`}
      getSubtitle={(r) => [fmt.date(r.date), r.center].filter(Boolean).join(' · ')}
      getValue={(r) => r.cost ? fmt.money(r.cost) : ''}
      summary={(items) => <InspectionSummary items={items} />}
      empty={{ icon: ClipboardCheckIcon, title: 'No inspections yet', description: 'Record emission tests and inspections so you never miss the next one.' }}
      columns={[
      { key: 'date', header: 'Date', render: (r) => <span className="whitespace-nowrap">{fmt.date(r.date)}</span> },
      { key: 'type', header: 'Type', render: (r) => <span className="font-medium">{r.type}</span> },
      { key: 'center', header: 'Centre', render: (r) => r.center || '—', cellClassName: 'text-ink-soft' },
      { key: 'result', header: 'Result', render: (r) => <StatusBadge status={String(r.result).toLowerCase()} size="sm" /> },
      { key: 'next', header: 'Next due', render: (r) => r.nextDate ? fmt.date(r.nextDate) : '—' },
      { key: 'cost', header: 'Cost', align: 'right', render: (r) => r.cost ? fmt.money(r.cost) : '—' }]
      } />);


}