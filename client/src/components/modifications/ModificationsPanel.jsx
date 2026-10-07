import { PackagePlusIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { modificationApi } from '../../services/modificationApi';
import { safeUrl } from '../../utils/sanitize';
import { RecordsView } from '../common/RecordsView';
import { StatGroup } from '../common/StatGroup';
import { Badge } from '../common/Badge';

const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

function ModificationGrid({ items, onOpen }) {
  const fmt = useFormat();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((m) => {
        const src = safeUrl(m.photos?.[0]);
        return (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onOpen(m)}
              className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-card transition-colors duration-150 hover:border-line-strong">
              
              {src ? <img src={src} alt="" className="aspect-[16/9] w-full object-cover" /> : null}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-ink">{m.name}</h3>
                  {m.category ? <Badge size="sm">{m.category}</Badge> : null}
                </div>
                {m.description ? <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{m.description}</p> : null}
                <div className="flex-1" />
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3 text-sm">
                  <span className="min-w-0 text-ink-muted">
                    <span className="block">{fmt.date(m.date)}</span>
                    {m.workshop ? <span className="block truncate">{m.workshop}</span> : null}
                  </span>
                  <span className="shrink-0 font-semibold text-ink tnum">{m.cost ? fmt.money(m.cost) : '—'}</span>
                </div>
              </div>
            </button>
          </li>);

      })}
    </ul>);

}

export function ModificationsPanel({ vehicle }) {
  const fmt = useFormat();
  return (
    <RecordsView
      vehicle={vehicle}
      api={modificationApi}
      formKey="modifications"
      listTitle="Modifications"
      addLabel="Add modification"
      sort={byDateDesc}
      getTitle={(r) => r.name}
      getSubtitle={(r) => `${fmt.date(r.date)}${r.workshop ? ` · ${r.workshop}` : ''}`}
      summary={(items) => {
        const total = items.reduce((s, m) => s + (Number(m.cost) || 0), 0);
        const latest = [...items].sort(byDateDesc)[0];
        return (
          <StatGroup
            stats={[
            { label: 'Total invested', value: fmt.money(total), emphasis: true },
            { label: 'Modifications', value: String(items.length) },
            { label: 'Most recent', value: latest?.name || '—', hint: latest ? fmt.date(latest.date) : undefined }]
            } />);


      }}
      renderItems={(items, h) => <ModificationGrid items={items} onOpen={h.open} />}
      empty={{ icon: PackagePlusIcon, title: 'No modifications yet', description: 'Dash cams, tint, wheels, audio — keep a record of what you’ve added and what it cost.' }} />);


}