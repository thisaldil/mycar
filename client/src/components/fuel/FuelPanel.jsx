import { useMemo } from 'react';
import { FuelIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useFormat } from '../../hooks/useFormat';
import { fuelApi } from '../../services/fuelApi';
import { fuelStats } from '../../utils/fuel';
import { RecordsView } from '../common/RecordsView';
import { StatGroup } from '../common/StatGroup';
import { Badge } from '../common/Badge';
import { FuelCharts } from './FuelCharts';

const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date)) || b.mileage - a.mileage;

function FuelSummary({ items }) {
  const fmt = useFormat();
  const stats = useMemo(() => fuelStats(items), [items]);
  const monthKey = format(new Date(), 'yyyy-MM');
  const month = items.filter((r) => String(r.date).startsWith(monthKey)).reduce((s, r) => s + (Number(r.total) || 0), 0);
  const trend = stats.latest && stats.average ? stats.latest - stats.average : 0;

  return (
    <div className="space-y-6">
      <StatGroup
        stats={[
        {
          label: 'Current fuel economy',
          value: stats.latest ? fmt.economy(stats.latest) : '—',
          hint: stats.average ? `${trend >= 0 ? 'Better' : 'Worse'} than your ${fmt.economy(stats.average)} average` : 'Needs two full fills',
          hintTone: stats.average ? trend >= 0 ? 'success' : 'warning' : 'neutral',
          emphasis: true
        },
        { label: 'Fuel this month', value: fmt.money(month) },
        { label: 'Cost per km', value: stats.costPerKm ? fmt.money(stats.costPerKm, { decimals: 2 }) : '—', hint: 'Fuel only' },
        { label: 'Total fuel', value: fmt.volume(stats.totalLitres, { decimals: 0 }), hint: `${items.length} fills · ${fmt.money(stats.totalCost, { compact: true })}` }]
        } />
      
      <FuelCharts records={items} withEco={stats.withEco} />
    </div>);

}

export function FuelPanel({ vehicle }) {
  const fmt = useFormat();
  return (
    <RecordsView
      vehicle={vehicle}
      api={fuelApi}
      formKey="fuel"
      listTitle="Fuel log"
      addLabel="Add fuel record"
      cardIcon={FuelIcon}
      sort={byDateDesc}
      getTitle={(r) => r.station || 'Fuel fill'}
      getSubtitle={(r) => `${fmt.date(r.date)} · ${fmt.volume(r.litres)} · ${fmt.distance(r.mileage)}`}
      getValue={(r) => fmt.money(r.total)}
      summary={(items) => <FuelSummary items={items} />}
      empty={{ icon: FuelIcon, title: 'No fuel records yet', description: 'Log each fill-up to see your fuel economy, monthly spend and cost per kilometre.' }}
      columns={[
      { key: 'date', header: 'Date', render: (r) => <span className="whitespace-nowrap">{fmt.date(r.date)}</span> },
      {
        key: 'station',
        header: 'Station',
        render: (r) =>
        <span className="flex items-center gap-2">
              <span className="truncate">{r.station || '—'}</span>
              {!r.fullTank ? <Badge size="sm">Partial</Badge> : null}
            </span>

      },
      { key: 'mileage', header: 'Odometer', align: 'right', render: (r) => fmt.distance(r.mileage) },
      { key: 'litres', header: 'Volume', align: 'right', render: (r) => fmt.volume(r.litres) },
      { key: 'price', header: 'Price / L', align: 'right', render: (r) => fmt.money(r.pricePerLitre, { decimals: 2 }) },
      { key: 'total', header: 'Total', align: 'right', render: (r) => <span className="font-medium">{fmt.money(r.total)}</span> }]
      } />);


}