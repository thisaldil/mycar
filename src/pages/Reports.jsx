import { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFormat } from '../hooks/useFormat';
import { useAsync } from '../hooks/useAsync';
import { useChartColors } from '../hooks/useChartColors';
import { reportApi } from '../services/reportApi';
import { downloadText } from '../utils/files';
import { ModulePage } from '../components/common/ModulePage';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { StatGroup } from '../components/common/StatGroup';
import { ChartCard } from '../components/common/ChartCard';
import { ChartTooltip } from '../components/common/ChartTooltip';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

function ReportBody({ vehicle }) {
  const fmt = useFormat();
  const c = useChartColors();
  const [range, setRange] = useState('12m');
  const { data: r, loading, error, reload } = useAsync(() => reportApi.summary({ vehicleId: vehicle.id, range }), [vehicle.id, range]);
  const axis = { tickLine: false, axisLine: false, tick: { fill: c.muted, fontSize: 12 } };

  const exportCsv = () => {
    const rows = [['Month', 'Fuel', 'Maintenance', 'Repairs', 'Other', 'Total'], ...r.months.map((m) => [m.fullLabel, m.fuel, m.maintenance, m.repair, m.other, m.total])];
    downloadText(rows.map((row) => row.map((v) => `"${v}"`).join(',')).join('\n'), `carlife-${vehicle.model}-${range}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl ariaLabel="Report period" value={range} onChange={setRange} options={[{ value: '12m', label: 'Last 12 months' }, { value: 'ytd', label: 'This year' }, { value: 'all', label: 'All time' }]} />
        <Button variant="secondary" leftIcon={DownloadIcon} onClick={exportCsv} disabled={!r}>Export CSV</Button>
      </div>
      {loading && !r ? <LoadingState variant="page" /> : error && !r ? <ErrorState error={error} onRetry={reload} /> : r ?
      <>
          <StatGroup
          stats={[
          { label: 'Total ownership cost', value: fmt.money(r.allTime + r.purchasePrice), hint: `${fmt.money(r.allTime)} running + purchase`, emphasis: true },
          { label: 'Spent in period', value: fmt.money(r.totals.total), hint: `Fuel ${fmt.money(r.totals.fuel, { compact: true })} · Maint. ${fmt.money(r.totals.maintenance, { compact: true })} · Repairs ${fmt.money(r.totals.repair, { compact: true })}` },
          { label: 'Monthly average', value: fmt.money(r.monthlyAverage), hint: r.yearly.length ? `${fmt.money(r.yearly[r.yearly.length - 1].amount)} this year` : undefined },
          { label: 'Cost per km', value: r.costPerKm ? fmt.money(r.costPerKm, { decimals: 2 }) : '—', hint: `${fmt.distance(r.distance)} driven` }]
          } />
        
          <ChartCard title="Monthly expenses" description="By type" height={300} empty={!r.months.some((m) => m.total)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.months} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} width={56} tickFormatter={(v) => fmt.money(v, { compact: true })} />
                <Tooltip cursor={{ fill: c.grid, opacity: 0.4 }} content={<ChartTooltip valueFormatter={(v) => fmt.money(v)} hideZero />} />
                <Bar dataKey="fuel" name="Fuel" stackId="a" fill={c.groups.fuel} />
                <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill={c.groups.maintenance} />
                <Bar dataKey="repair" name="Repairs" stackId="a" fill={c.groups.repair} />
                <Bar dataKey="other" name="Other" stackId="a" fill={c.groups.other} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Distance driven" description="Per month" empty={!r.mileage.some((m) => m.km)}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r.mileage}>
                  <CartesianGrid vertical={false} stroke={c.grid} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis {...axis} width={44} />
                  <Tooltip cursor={{ fill: c.grid, opacity: 0.4 }} content={<ChartTooltip valueFormatter={(v) => fmt.distance(v)} />} />
                  <Bar dataKey="km" name="Distance" fill={c.brand} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Fuel economy" description={`${fmt.economyUnit} per full fill`} empty={r.economy.length < 2}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={r.economy.map((e) => ({ ...e, value: Math.round(fmt.economyValue(e.value) * 10) / 10 }))}>
                  <CartesianGrid vertical={false} stroke={c.grid} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis {...axis} width={40} domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(v) => Math.round(v)} />
                  <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} ${fmt.economyUnit}`} />} />
                  <Line type="monotone" dataKey="value" name="Economy" stroke={c.groups.maintenance} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </> :
      null}
    </div>);

}

export function Reports() {
  return <ModulePage title="Reports" description="Where your money goes">{(v) => <ReportBody vehicle={v} />}</ModulePage>;
}