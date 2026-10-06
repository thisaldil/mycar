import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { useChartColors } from '../../hooks/useChartColors';
import { Card, CardHeader } from '../common/Card';
import { ChartTooltip } from '../common/ChartTooltip';

export function RunningCostCard({ costs, className }) {
  const fmt = useFormat();
  const c = useChartColors();
  const hasData = costs.months.some((m) => m.total > 0);
  const diff = costs.monthlyAverage ? costs.thisMonth - costs.monthlyAverage : 0;

  const breakdown = [
  { key: 'fuel', label: 'Fuel', value: costs.fuel },
  { key: 'maintenance', label: 'Maintenance', value: costs.maintenance },
  { key: 'other', label: 'Other', value: costs.other }];


  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader
        title="Running costs"
        description="This month"
        action={
        <Link to="/reports" className="text-sm font-medium text-brand hover:underline">
            Full report
          </Link>
        } />
      
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <p className="font-display text-3xl font-bold text-ink tnum">{fmt.money(costs.thisMonth)}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {costs.monthlyAverage ?
            `${diff > 0 ? fmt.money(diff) + ' above' : fmt.money(Math.abs(diff)) + ' below'} your 6-month average` :
            'No history yet'}
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {breakdown.map((b) =>
          <div key={b.key}>
              <dt className="flex items-center gap-1.5 text-ink-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: c.groups[b.key] }} aria-hidden="true" />
                {b.label}
              </dt>
              <dd className="mt-0.5 font-semibold text-ink tnum">{fmt.money(b.value)}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="mt-6 h-44 -ml-2" role="img" aria-label="Monthly running costs for the last six months">
        {hasData ?
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costs.months} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 12 }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: c.grid, opacity: 0.4 }} content={<ChartTooltip valueFormatter={(v) => fmt.money(v)} hideZero labelFormatter={(l, p) => p?.[0]?.payload?.fullLabel || l} />} />
              <Bar dataKey="fuel" name="Fuel" stackId="cost" fill={c.groups.fuel} />
              <Bar dataKey="maintenance" name="Maintenance" stackId="cost" fill={c.groups.maintenance} />
              <Bar dataKey="repair" name="Repairs" stackId="cost" fill={c.groups.repair} />
              <Bar dataKey="other" name="Other" stackId="cost" fill={c.groups.other} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> :

        <div className="flex h-full items-center justify-center rounded-xl bg-subtle text-sm text-ink-muted">Log fuel or expenses to see trends</div>
        }
      </div>
      {costs.costPerKm ?
      <p className="mt-3 text-sm text-ink-muted">
          Costing you <span className="font-medium text-ink tnum">{fmt.money(costs.costPerKm, { decimals: 2 })}</span> per km over the last 6 months.
        </p> :
      null}
    </Card>);

}