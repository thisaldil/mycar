import { useMemo, useState } from 'react';
import { format, parseISO, startOfMonth, subMonths, addMonths } from 'date-fns';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFormat } from '../../hooks/useFormat';
import { useChartColors } from '../../hooks/useChartColors';
import { ChartCard } from '../common/ChartCard';
import { ChartTooltip } from '../common/ChartTooltip';
import { SegmentedControl } from '../common/SegmentedControl';

/** One chart at a time — the user picks the question they care about. */
export function FuelCharts({ records, withEco }) {
  const fmt = useFormat();
  const c = useChartColors();
  const [metric, setMetric] = useState('cost');

  const monthly = useMemo(() => {
    const end = startOfMonth(new Date());
    const months = [];
    for (let d = subMonths(end, 11); d <= end; d = addMonths(d, 1)) months.push(format(d, 'yyyy-MM'));
    return months.map((key) => {
      const inMonth = records.filter((r) => String(r.date).startsWith(key));
      return {
        label: format(parseISO(`${key}-01`), 'MMM'),
        fullLabel: format(parseISO(`${key}-01`), 'MMMM yyyy'),
        cost: inMonth.reduce((s, r) => s + (Number(r.total) || 0), 0),
        litres: Math.round(inMonth.reduce((s, r) => s + (Number(r.litres) || 0), 0) * 10) / 10
      };
    });
  }, [records]);

  const economy = useMemo(
    () =>
    withEco.
    filter((r) => r.economy).
    slice(-16).
    map((r) => ({ label: format(parseISO(r.date), 'd MMM'), value: Math.round(fmt.economyValue(r.economy) * 10) / 10 })),
    [withEco, fmt]
  );

  const axis = { tickLine: false, axisLine: false, tick: { fill: c.muted, fontSize: 12 } };
  const titles = {
    cost: ['Fuel cost', 'Spend per month, last 12 months'],
    litres: ['Fuel consumption', 'Volume filled per month'],
    economy: ['Fuel economy', `${fmt.economyUnit} between full fills`]
  };
  const empty = metric === 'economy' ? economy.length < 2 : !monthly.some((m) => m[metric] > 0);

  return (
    <ChartCard
      title={titles[metric][0]}
      description={titles[metric][1]}
      height={260}
      empty={empty}
      emptyText={metric === 'economy' ? 'Log two full-tank fills to see economy' : 'No fuel records in the last year'}
      action={
      <SegmentedControl
        size="sm"
        ariaLabel="Chart metric"
        value={metric}
        onChange={setMetric}
        options={[
        { value: 'cost', label: 'Cost' },
        { value: 'litres', label: 'Litres' },
        { value: 'economy', label: 'Economy' }]
        } />

      }>
      
      <ResponsiveContainer width="100%" height="100%">
        {metric === 'cost' ?
        <AreaChart data={monthly}>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="label" {...axis} />
            <YAxis {...axis} width={56} tickFormatter={(v) => fmt.money(v, { compact: true })} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => fmt.money(v)} labelFormatter={(l, p) => p?.[0]?.payload?.fullLabel || l} />} />
            <Area type="monotone" dataKey="cost" name="Fuel cost" stroke={c.brand} strokeWidth={2} fill={c.brandSoft} fillOpacity={0.7} />
          </AreaChart> :
        metric === 'litres' ?
        <BarChart data={monthly} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="label" {...axis} />
            <YAxis {...axis} width={40} />
            <Tooltip cursor={{ fill: c.grid, opacity: 0.4 }} content={<ChartTooltip valueFormatter={(v) => fmt.volume(v)} labelFormatter={(l, p) => p?.[0]?.payload?.fullLabel || l} />} />
            <Bar dataKey="litres" name="Filled" fill={c.groups.maintenance} radius={[6, 6, 0, 0]} />
          </BarChart> :

        <LineChart data={economy}>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="label" {...axis} />
            <YAxis {...axis} width={40} domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(v) => Math.round(v)} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} ${fmt.economyUnit}`} />} />
            <Line type="monotone" dataKey="value" name="Economy" stroke={c.brand} strokeWidth={2} dot={{ r: 3, fill: c.brand }} activeDot={{ r: 5 }} />
          </LineChart>
        }
      </ResponsiveContainer>
    </ChartCard>);

}