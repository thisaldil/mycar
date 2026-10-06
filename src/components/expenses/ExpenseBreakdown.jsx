import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFormat } from '../../hooks/useFormat';
import { useChartColors } from '../../hooks/useChartColors';
import { EXPENSE_CATEGORIES } from '../../data/options';
import { Card, CardHeader } from '../common/Card';
import { ChartTooltip } from '../common/ChartTooltip';

/** Donut + ranked list — the list carries the numbers, the donut gives the shape. */
export function ExpenseBreakdown({ categories, total, title = 'Where the money goes', description }) {
  const fmt = useFormat();
  const c = useChartColors();
  const colorFor = (category) => c.categorical[EXPENSE_CATEGORIES.indexOf(category) % c.categorical.length] || c.categorical[7];

  return (
    <Card className="min-w-0">
      <CardHeader title={title} description={description} />
      {categories.length ?
      <div className="grid items-center gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="relative mx-auto h-44 w-44" role="img" aria-label="Spending by category">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="amount" nameKey="category" innerRadius="64%" outerRadius="100%" paddingAngle={2} stroke="none">
                  {categories.map((entry) =>
                <Cell key={entry.category} fill={colorFor(entry.category)} />
                )}
                </Pie>
                <Tooltip content={<ChartTooltip valueFormatter={(v) => fmt.money(v)} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-ink-muted">Total</span>
              <span className="font-display text-lg font-bold text-ink tnum">{fmt.money(total, { compact: true })}</span>
            </div>
          </div>
          <ul className="space-y-2.5">
            {categories.slice(0, 7).map((row) => {
            const pct = total ? row.amount / total * 100 : 0;
            return (
              <li key={row.category}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorFor(row.category) }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-ink">{row.category}</span>
                    <span className="text-ink-muted tnum">{pct.toFixed(0)}%</span>
                    <span className="w-24 text-right font-medium text-ink tnum">{fmt.money(row.amount)}</span>
                  </div>
                  <div className="ml-[18px] mt-1 h-1.5 overflow-hidden rounded-full bg-subtle">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colorFor(row.category) }} />
                  </div>
                </li>);

          })}
          </ul>
        </div> :

      <p className="py-8 text-center text-sm text-ink-muted">No spending recorded this year yet.</p>
      }
    </Card>);

}