import { PlusIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { tyreStatus } from '../../utils/status';
import { Card, CardHeader } from '../common/Card';

const STATUS_STYLES = {
  good: { ring: 'border-success/40', dot: 'bg-success', text: 'Good' },
  fair: { ring: 'border-warning/50', dot: 'bg-warning', text: 'Check soon' },
  attention: { ring: 'border-danger/50', dot: 'bg-danger', text: 'Needs attention' },
  unknown: { ring: 'border-line', dot: 'bg-ink-muted', text: 'No data' }
};

const LABELS = { FL: 'Front left', FR: 'Front right', RL: 'Rear left', RR: 'Rear right', SP: 'Spare' };

function TyreSlot({ position, tyre, onOpen, onAdd, align }) {
  const fmt = useFormat();
  if (!tyre) {
    return (
      <button
        type="button"
        onClick={() => onAdd(position)}
        className={cn(
          'flex min-h-[112px] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line-strong p-3 text-ink-muted transition-colors duration-150 hover:border-brand/60 hover:text-brand'
        )}>
        
        <PlusIcon className="h-5 w-5" aria-hidden="true" />
        <span className="text-xs font-medium">Add {LABELS[position].toLowerCase()}</span>
      </button>);

  }
  const status = tyreStatus(tyre);
  const s = STATUS_STYLES[status];
  const pressureOff = tyre.recommendedPressure && tyre.pressure && Math.abs(tyre.pressure - tyre.recommendedPressure) > 3;
  return (
    <button
      type="button"
      onClick={() => onOpen(tyre)}
      aria-label={`${LABELS[position]}: ${tyre.brand}, tread ${tyre.treadDepth ?? 'unknown'} millimetres, ${s.text}`}
      className={cn(
        'flex min-h-[112px] w-full flex-col rounded-2xl border-2 bg-surface p-3 text-left shadow-card transition-colors duration-150 hover:bg-subtle sm:p-4',
        s.ring,
        align === 'right' ? 'sm:items-end sm:text-right' : ''
      )}>
      
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        <span className={cn('h-2 w-2 rounded-full', s.dot)} aria-hidden="true" />
        {LABELS[position]}
      </span>
      <span className="mt-1.5 font-display text-2xl font-bold text-ink tnum">
        {tyre.treadDepth != null && tyre.treadDepth !== '' ? `${tyre.treadDepth} mm` : '—'}
      </span>
      <span className="text-xs text-ink-muted">tread</span>
      <span className={cn('mt-1 text-xs font-medium tnum', pressureOff ? 'text-warning' : 'text-ink-soft')}>
        {tyre.pressure ? `${tyre.pressure} psi` : 'Pressure —'}
        {pressureOff ? ` (target ${tyre.recommendedPressure})` : ''}
      </span>
    </button>);

}

function CarTopView() {
  return (
    <svg viewBox="0 0 120 240" className="h-full w-full" aria-hidden="true">
      <rect x="14" y="6" width="92" height="228" rx="40" className="fill-subtle stroke-line-strong" strokeWidth="2" />
      <path d="M26 70 Q60 52 94 70 L88 100 Q60 92 32 100 Z" className="fill-line" />
      <path d="M32 170 Q60 178 88 170 L92 196 Q60 210 28 196 Z" className="fill-line" />
      <rect x="30" y="106" width="60" height="58" rx="10" className="fill-surface stroke-line" strokeWidth="1.5" />
      <circle cx="30" cy="18" r="4" className="fill-warning/60" />
      <circle cx="90" cy="18" r="4" className="fill-warning/60" />
    </svg>);

}

export function TyreLayout({ tyres, onOpen, onAdd }) {
  const byPos = Object.fromEntries(tyres.map((t) => [t.position, t]));
  return (
    <Card>
      <CardHeader title="Tyre overview" description="Top-down view. Select a tyre for its full details." />
      <div className="mx-auto grid max-w-xl grid-cols-[1fr_72px_1fr] items-center gap-3 sm:grid-cols-[1fr_110px_1fr] sm:gap-6">
        <TyreSlot position="FL" tyre={byPos.FL} onOpen={onOpen} onAdd={onAdd} align="right" />
        <div className="row-span-2 h-56 sm:h-72">
          <CarTopView />
        </div>
        <TyreSlot position="FR" tyre={byPos.FR} onOpen={onOpen} onAdd={onAdd} />
        <TyreSlot position="RL" tyre={byPos.RL} onOpen={onOpen} onAdd={onAdd} align="right" />
        <TyreSlot position="RR" tyre={byPos.RR} onOpen={onOpen} onAdd={onAdd} />
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-ink-muted">
        {['good', 'fair', 'attention'].map((k) =>
        <span key={k} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', STATUS_STYLES[k].dot)} aria-hidden="true" />
            {STATUS_STYLES[k].text}
          </span>
        )}
        <span>Legal minimum tread: 1.6 mm</span>
      </div>
    </Card>);

}