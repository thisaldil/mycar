import { MapPinIcon, TriangleAlertIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { accidentApi } from '../../services/accidentApi';
import { cleanText, safeUrl } from '../../utils/sanitize';
import { RecordsView } from '../common/RecordsView';
import { StatGroup } from '../common/StatGroup';
import { Badge } from '../common/Badge';

const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));
const SEVERITY_TONE = { Minor: 'warning', Moderate: 'warning', Major: 'danger' };
const DOT = { Minor: 'bg-warning', Moderate: 'bg-warning', Major: 'bg-danger' };

function AccidentSummary({ items }) {
  const fmt = useFormat();
  const outOfPocket = items.filter((a) => !a.claimFiled).reduce((s, a) => s + (Number(a.repairCost) || 0), 0);
  const claims = items.filter((a) => a.claimFiled).length;
  const last = [...items].sort(byDateDesc)[0];
  return (
    <StatGroup
      stats={[
      { label: 'Incidents recorded', value: String(items.length), emphasis: true, hint: last ? `Last one ${fmt.relative(last.date)}` : undefined },
      { label: 'Paid out of pocket', value: fmt.money(outOfPocket), hint: 'Repairs not claimed' },
      { label: 'Insurance claims', value: String(claims), hint: claims ? 'Filed with your insurer' : 'None filed' },
      { label: 'Most recent', value: last ? fmt.date(last.date, 'short') : '—', hint: last?.severity }]
      } />);


}

function AccidentTimeline({ items, onOpen }) {
  const fmt = useFormat();
  return (
    <ol className="relative ml-2 space-y-4 border-l-2 border-line pl-6 sm:ml-3">
      {items.map((a) =>
      <li key={a.id} className="relative">
          <span className={cn('absolute -left-[33px] top-6 h-4 w-4 rounded-full ring-4 ring-canvas', DOT[a.severity] || 'bg-ink-muted')} aria-hidden="true" />
          <button
          type="button"
          onClick={() => onOpen(a)}
          className="w-full rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition-colors duration-150 hover:border-line-strong">
          
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <time dateTime={a.date} className="font-medium text-ink">
                {fmt.date(a.date, 'long')}
              </time>
              <Badge tone={SEVERITY_TONE[a.severity] || 'neutral'} size="sm">
                {a.severity}
              </Badge>
              {a.claimFiled ?
            <Badge tone="brand" size="sm">
                  Claim {a.claimStatus ? a.claimStatus.toLowerCase() : 'filed'}
                </Badge> :
            null}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[15px] font-semibold text-ink">
              <MapPinIcon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="truncate">{a.location}</span>
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{cleanText(a.description)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm sm:grid-cols-3">
              <div className="col-span-2 min-w-0 sm:col-span-1">
                <dt className="text-ink-muted">Damage</dt>
                <dd className="mt-0.5 line-clamp-2 text-ink">{a.damage || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Repair cost</dt>
                <dd className="mt-0.5 font-medium text-ink tnum">{a.repairCost ? fmt.money(a.repairCost) : '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Insurance</dt>
                <dd className="mt-0.5 text-ink">{a.claimFiled ? a.claimNumber || 'Claimed' : 'Not claimed'}</dd>
              </div>
            </dl>
            {a.photos?.length ?
          <div className="mt-4 flex gap-2 overflow-x-auto">
                {a.photos.slice(0, 4).map((src, i) =>
            <img key={i} src={safeUrl(src)} alt={`Accident photo ${i + 1}`} className="h-16 w-24 shrink-0 rounded-lg border border-line object-cover" />
            )}
              </div> :
          null}
          </button>
        </li>
      )}
    </ol>);

}

export function AccidentsPanel({ vehicle }) {
  const fmt = useFormat();
  return (
    <RecordsView
      vehicle={vehicle}
      api={accidentApi}
      formKey="accidents"
      listTitle="Accident history"
      addLabel="Record accident"
      sort={byDateDesc}
      getTitle={(r) => r.location}
      getSubtitle={(r) => `${fmt.date(r.date)} · ${r.severity}`}
      summary={(items) => <AccidentSummary items={items} />}
      renderItems={(items, h) => <AccidentTimeline items={items} onOpen={h.open} />}
      empty={{ icon: TriangleAlertIcon, title: 'No accidents recorded', description: 'Hopefully it stays that way. If something happens, record it here with photos and claim details.' }} />);


}