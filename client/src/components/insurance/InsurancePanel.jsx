import { ShieldCheckIcon } from 'lucide-react';
import { addDays, addYears, format } from 'date-fns';
import { useFormat } from '../../hooks/useFormat';
import { insuranceApi } from '../../services/insuranceApi';
import { expiryStatus } from '../../utils/status';
import { toDate } from '../../utils/format';
import { RecordsView } from '../common/RecordsView';
import { StatusBadge } from '../common/StatusBadge';
import { PolicyCard } from './PolicyCard';

const byExpiryDesc = (a, b) => String(b.expiryDate).localeCompare(String(a.expiryDate));

export function InsurancePanel({ vehicle }) {
  const fmt = useFormat();

  const renewalPreset = (policy) => {
    const start = toDate(policy.expiryDate) ? addDays(toDate(policy.expiryDate), 1) : new Date();
    return {
      provider: policy.provider,
      policyType: policy.policyType,
      coverage: policy.coverage,
      agent: policy.agent,
      startDate: format(start, 'yyyy-MM-dd'),
      expiryDate: format(addDays(addYears(start, 1), -1), 'yyyy-MM-dd')
    };
  };

  return (
    <RecordsView
      vehicle={vehicle}
      api={insuranceApi}
      formKey="insurance"
      listTitle="Policy history"
      addLabel="Add policy"
      cardIcon={ShieldCheckIcon}
      sort={byExpiryDesc}
      getTitle={(r) => r.provider}
      getSubtitle={(r) => `${r.policyType} · ${fmt.date(r.startDate, 'monthShort')} – ${fmt.date(r.expiryDate, 'monthShort')}`}
      getValue={(r) => fmt.money(r.premium)}
      summary={(items, h) => {
        const current = [...items].sort(byExpiryDesc)[0];
        return <PolicyCard policy={current} onOpen={() => h.open(current)} onRenew={() => h.create(renewalPreset(current))} />;
      }}
      empty={{ icon: ShieldCheckIcon, title: 'No insurance policy yet', description: 'Add your policy and we’ll remind you before it expires.' }}
      columns={[
      { key: 'provider', header: 'Provider', render: (r) => <span className="font-medium">{r.provider}</span> },
      { key: 'type', header: 'Type', render: (r) => r.policyType, cellClassName: 'text-ink-soft' },
      { key: 'period', header: 'Period', render: (r) => <span className="whitespace-nowrap">{`${fmt.date(r.startDate)} – ${fmt.date(r.expiryDate)}`}</span> },
      { key: 'status', header: 'Status', render: (r) => <StatusBadge status={expiryStatus(r.expiryDate, 30)} size="sm" /> },
      { key: 'premium', header: 'Premium', align: 'right', render: (r) => <span className="font-medium">{fmt.money(r.premium)}</span> }]
      } />);


}