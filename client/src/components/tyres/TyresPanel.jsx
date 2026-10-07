import { CircleDotIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { tyreApi } from '../../services/tyreApi';
import { tyreStatus } from '../../utils/status';
import { RecordsView } from '../common/RecordsView';
import { StatusBadge } from '../common/StatusBadge';
import { TyreLayout } from './TyreLayout';

const ORDER = { FL: 0, FR: 1, RL: 2, RR: 3, SP: 4 };
const LABELS = { FL: 'Front left', FR: 'Front right', RL: 'Rear left', RR: 'Rear right', SP: 'Spare' };
const byPosition = (a, b) => (ORDER[a.position] ?? 9) - (ORDER[b.position] ?? 9);

export function TyresPanel({ vehicle }) {
  const fmt = useFormat();
  return (
    <RecordsView
      vehicle={vehicle}
      api={tyreApi}
      formKey="tyres"
      listTitle="Fitted tyres"
      addLabel="Add tyre"
      cardIcon={CircleDotIcon}
      sort={byPosition}
      getTitle={(r) => `${LABELS[r.position] || r.position} · ${r.brand}`}
      getSubtitle={(r) => [r.size, r.treadDepth ? `${r.treadDepth} mm tread` : null, r.pressure ? `${r.pressure} psi` : null].filter(Boolean).join(' · ')}
      summary={(items, h) => <TyreLayout tyres={items} onOpen={h.open} onAdd={(position) => h.create({ position })} />}
      empty={{ icon: CircleDotIcon, title: 'No tyres recorded', description: 'Add each tyre to track tread depth, pressure and when they were fitted.' }}
      columns={[
      { key: 'position', header: 'Position', render: (r) => <span className="font-medium">{LABELS[r.position] || r.position}</span> },
      { key: 'brand', header: 'Tyre', render: (r) => `${r.brand}${r.model ? ` ${r.model}` : ''}` },
      { key: 'size', header: 'Size', render: (r) => r.size, cellClassName: 'text-ink-soft tnum' },
      { key: 'tread', header: 'Tread', align: 'right', render: (r) => r.treadDepth ? `${r.treadDepth} mm` : '—' },
      { key: 'pressure', header: 'Pressure', align: 'right', render: (r) => r.pressure ? `${r.pressure} psi` : '—' },
      { key: 'installed', header: 'Fitted', render: (r) => r.installDate ? fmt.date(r.installDate) : '—' },
      { key: 'status', header: 'Status', render: (r) => <StatusBadge status={tyreStatus(r)} size="sm" /> }]
      } />);


}