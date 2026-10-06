import { Link } from 'react-router-dom';
import { ArchiveIcon, ArchiveRestoreIcon, CarFrontIcon, CheckCircle2Icon, EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { expiryStatus, healthFromCondition, nextService } from '../../utils/status';
import { safeUrl } from '../../utils/sanitize';
import { Badge } from '../common/Badge';
import { StatusBadge } from '../common/StatusBadge';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';

export function VehicleCard({ vehicle, isActive, onSetActive, onEdit, onArchive, onDelete }) {
  const fmt = useFormat();
  const archived = vehicle.status === 'archived';
  const service = nextService(vehicle);
  const health = healthFromCondition(vehicle.condition);
  const insurance = expiryStatus(vehicle.insuranceExpiry);
  const src = safeUrl(vehicle.image);
  const name = `${vehicle.make} ${vehicle.model}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <Link to={`/vehicles/${vehicle.id}`} className="relative block aspect-[16/10] bg-subtle" tabIndex={-1} aria-hidden="true">
        {src ?
        <img src={src} alt="" className={cn('h-full w-full object-cover', archived && 'grayscale')} /> :

        <span className="flex h-full items-center justify-center">
            <CarFrontIcon className="h-12 w-12 text-ink-muted/50" />
          </span>
        }
        {isActive ?
        <Badge tone="brand" className="absolute left-3 top-3 bg-surface">
            Active
          </Badge> :
        null}
        {archived ? <Badge className="absolute left-3 top-3 bg-surface">Archived</Badge> : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-ink">
              <Link to={`/vehicles/${vehicle.id}`} className="rounded hover:underline">
                {name}
              </Link>
            </h3>
            <p className="truncate text-sm text-ink-muted">
              {vehicle.year}
              {vehicle.variant ? ` · ${vehicle.variant}` : ''}
              {vehicle.registration ? ` · ${fmt.plate(vehicle.registration)}` : ''}
            </p>
          </div>
          <Dropdown
            items={[
            { label: 'View profile', icon: EyeIcon, to: `/vehicles/${vehicle.id}` },
            { label: 'Edit details', icon: PencilIcon, onSelect: onEdit },
            ...(!isActive && !archived ? [{ label: 'Set as active vehicle', icon: CheckCircle2Icon, onSelect: onSetActive }] : []),
            { label: archived ? 'Restore from archive' : 'Archive', icon: archived ? ArchiveRestoreIcon : ArchiveIcon, onSelect: onArchive },
            { type: 'divider' },
            { label: 'Delete vehicle', icon: Trash2Icon, danger: true, onSelect: onDelete }]
            }
            trigger={(props) =>
            <Button {...props} variant="ghost" size="icon-sm" className="-mr-2 -mt-1" aria-label={`Actions for ${name}`}>
                <MoreHorizontalIcon aria-hidden="true" />
              </Button>
            } />
          
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-ink-muted">Mileage</dt>
            <dd className="mt-0.5 font-semibold text-ink tnum">{fmt.distance(vehicle.mileage)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Fuel</dt>
            <dd className="mt-0.5 font-medium text-ink">{vehicle.fuelType || '—'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Next service</dt>
            <dd className={cn('mt-0.5 font-medium tnum', service.status === 'overdue' ? 'text-danger' : service.status === 'due-soon' ? 'text-warning' : 'text-ink')}>
              {service.remainingKm >= 0 ? `${fmt.distance(service.remainingKm)} left` : `${fmt.distance(-service.remainingKm)} overdue`}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Insurance</dt>
            <dd className="mt-0.5">
              <StatusBadge status={insurance} size="sm" label={insurance === 'unknown' ? 'Not added' : undefined} />
            </dd>
          </div>
        </dl>

        <div className="flex-1" aria-hidden="true" />
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
          <span className="flex items-center gap-2 text-sm text-ink-muted">
            Health
            <StatusBadge status={health.status} size="sm" label={health.status === 'unknown' ? 'Not rated' : undefined} />
          </span>
          {!isActive && !archived ?
          <Button size="sm" variant="soft" onClick={onSetActive}>
              Set active
            </Button> :
          null}
        </div>
      </div>
    </article>);

}