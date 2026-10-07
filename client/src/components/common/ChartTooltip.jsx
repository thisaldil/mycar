/** Custom Recharts tooltip that follows the app theme. */
export function ChartTooltip({ active, payload, label, valueFormatter = (v) => v, labelFormatter, hideZero = false }) {
  if (!active || !payload?.length) return null;
  const rows = hideZero ? payload.filter((p) => Number(p.value) !== 0) : payload;
  const total = payload.length > 1 ? payload.reduce((s, p) => s + (Number(p.value) || 0), 0) : null;
  return (
    <div className="min-w-[10rem] rounded-xl border border-line bg-surface px-3 py-2.5 text-sm shadow-pop">
      <p className="mb-1.5 font-medium text-ink">{labelFormatter ? labelFormatter(label, payload) : label}</p>
      <div className="space-y-1">
        {rows.map((p) =>
        <div key={p.dataKey} className="flex items-center gap-2 text-ink-soft">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color || p.fill || p.stroke }} aria-hidden="true" />
            <span>{p.name}</span>
            <span className="ml-auto pl-4 font-medium text-ink tnum">{valueFormatter(p.value, p)}</span>
          </div>
        )}
      </div>
      {total != null ?
      <div className="mt-1.5 flex justify-between border-t border-line pt-1.5 text-ink">
          <span>Total</span>
          <span className="font-semibold tnum">{valueFormatter(total)}</span>
        </div> :
      null}
    </div>);

}