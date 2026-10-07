import { useCallback, useMemo, useState } from 'react';
import { WalletIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { useAsync } from '../../hooks/useAsync';
import { expenseApi } from '../../services/expenseApi';
import { reportApi } from '../../services/reportApi';
import { expenseTotals } from '../../utils/analytics';
import { EXPENSE_CATEGORIES } from '../../data/options';
import { RecordsView } from '../common/RecordsView';
import { StatGroup } from '../common/StatGroup';
import { Badge } from '../common/Badge';
import { Select } from '../common/Select';
import { ExpenseBreakdown } from './ExpenseBreakdown';

const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));
const SOURCE_LABEL = { fuel: 'Fuel log', maintenance: 'Service record', insurance: 'Insurance', inspections: 'Inspection', tyres: 'Tyres', batteries: 'Battery', accidents: 'Accident', modifications: 'Modification' };

function ExpensesSummary({ items, vehicleId, refreshKey }) {
  const fmt = useFormat();
  const totals = useMemo(() => expenseTotals(items), [items]);
  const ytd = useAsync(() => reportApi.summary({ vehicleId, range: 'ytd' }), [vehicleId, refreshKey]);
  const year = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <StatGroup
        stats={[
        { label: 'This month', value: fmt.money(totals.month), emphasis: true, hint: new Date().toLocaleString(undefined, { month: 'long' }) },
        { label: `This year`, value: fmt.money(totals.year), hint: String(year) },
        {
          label: 'Cost per km',
          value: ytd.data?.costPerKm ? fmt.money(ytd.data.costPerKm, { decimals: 2 }) : ytd.loading ? '…' : '—',
          hint: ytd.data?.distance ? `${fmt.distance(ytd.data.distance)} driven this year` : 'All running costs'
        },
        { label: 'Top category', value: totals.categories[0]?.category || '—', hint: totals.categories[0] ? fmt.money(totals.categories[0].amount) : undefined }]
        } />
      
      <ExpenseBreakdown categories={totals.categories} total={totals.year} description={`${year} so far, by category`} />
    </div>);

}

export function ExpensesPanel({ vehicle }) {
  const fmt = useFormat();
  const [category, setCategory] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const filter = useCallback((r) => !category || r.category === category, [category]);

  return (
    <RecordsView
      vehicle={vehicle}
      api={expenseApi}
      formKey="expenses"
      listTitle="All expenses"
      addLabel="Add expense"
      cardIcon={WalletIcon}
      sort={byDateDesc}
      filter={filter}
      onMutated={() => setRefreshKey((k) => k + 1)}
      canEdit={(r) => !r.source}
      readOnlyReason={(r) => `This expense was created automatically from a ${SOURCE_LABEL[r.source.type]?.toLowerCase() || 'record'}. Edit or delete it there.`}
      toolbar={
      <Select
        aria-label="Filter by category"
        className="w-44"
        selectClassName="h-9 text-sm"
        options={EXPENSE_CATEGORIES}
        placeholder="All categories"
        value={category}
        onChange={(e) => setCategory(e.target.value)} />

      }
      getTitle={(r) => r.title || r.category}
      getSubtitle={(r) => `${fmt.date(r.date)} · ${r.category}`}
      getValue={(r) => fmt.money(r.amount)}
      summary={(items) => <ExpensesSummary items={items} vehicleId={vehicle.id} refreshKey={refreshKey} />}
      empty={{ icon: WalletIcon, title: 'No expenses yet', description: 'Fuel, services and insurance are added automatically. Add parking, tolls, cleaning and anything else here.' }}
      columns={[
      { key: 'date', header: 'Date', render: (r) => <span className="whitespace-nowrap">{fmt.date(r.date)}</span> },
      { key: 'title', header: 'Description', render: (r) => <span className="block max-w-xs truncate font-medium">{r.title || '—'}</span> },
      { key: 'category', header: 'Category', render: (r) => <Badge>{r.category}</Badge> },
      { key: 'source', header: 'From', render: (r) => <span className="text-ink-muted">{r.source ? SOURCE_LABEL[r.source.type] : 'Manual'}</span> },
      { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="font-medium">{fmt.money(r.amount)}</span> }]
      } />);


}