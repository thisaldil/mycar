import { Link } from 'react-router-dom';
import { ChevronRightIcon, ClipboardCheckIcon, HeartPulseIcon, ShieldCheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { CONDITION_SYSTEMS } from '../../data/options';
import { StatusBadge, statusTone } from '../common/StatusBadge';

const ICON_TONES = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  brand: 'bg-brand-soft text-brand',
  neutral: 'bg-subtle text-ink-soft'
};

function Tile({ to, icon: Icon, label, status, statusLabel, value, detail }) {
  const tone = statusTone(status);
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-[border-color,background-color] duration-150 hover:border-line-strong hover:bg-subtle/60">
      
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', ICON_TONES[tone])}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          {label}
        </span>
        <StatusBadge status={status} label={statusLabel} />
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-muted">
        <span className="min-w-0 truncate">{detail}</span>
        <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
      </p>
    </Link>);

}

export function StatusTiles({ insurance, inspection, health, vehicleId }) {
  const fmt = useFormat();

  const insuranceValue = !insurance ? 'Not added' : insurance.status === 'expired' ? 'Expired' : insurance.status === 'expiring' ? `${insurance.daysLeft} days left` : 'Valid';
  const insuranceDetail = insurance ? `${insurance.status === 'expired' ? 'Expired' : 'Expires'} ${fmt.date(insurance.expiryDate, 'monthShort')} · ${insurance.provider}` : 'Add your policy to track renewal';

  const nextDate = inspection?.nextDate;
  const inspectionValue = !inspection ? 'Not added' : !nextDate ? `Last: ${inspection.result}` : inspection.daysLeft < 0 ? 'Overdue' : `Due ${fmt.relative(nextDate)}`;
  const inspectionStatus = !inspection ? 'unknown' : nextDate && inspection.daysLeft < 0 ? 'overdue' : nextDate && inspection.daysLeft <= 45 ? 'due-soon' : String(inspection.result || '').toLowerCase();
  const inspectionDetail = inspection ? nextDate ? `Next ${inspection.type.toLowerCase()} ${fmt.date(nextDate)}` : `${inspection.type} on ${fmt.date(inspection.date)}` : 'Add your last inspection';

  const watchLabel = health?.watch?.length ?
  `${health.watch.map((w) => CONDITION_SYSTEMS.find((s) => s.key === w.system)?.label || w.system).join(', ')} ${health.watch.length === 1 ? 'needs' : 'need'} a look` :
  'All systems look good';

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Tile to="/insurance" icon={ShieldCheckIcon} label="Insurance" status={insurance?.status || 'unknown'} value={insuranceValue} detail={insuranceDetail} />
      <Tile to="/inspections" icon={ClipboardCheckIcon} label="Inspection" status={inspectionStatus} value={inspectionValue} detail={inspectionDetail} />
      <Tile
        to={`/vehicles/${vehicleId}?tab=overview`}
        icon={HeartPulseIcon}
        label="Vehicle health"
        status={health?.status || 'unknown'}
        value={health?.score != null ? `${health.score} / 100` : 'No data'}
        detail={health?.score != null ? watchLabel : 'Rate your car’s condition'} />
      
    </div>);

}