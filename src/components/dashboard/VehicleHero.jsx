import { ArrowRightIcon, CarFrontIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { safeUrl } from '../../utils/sanitize';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { StatusBadge } from '../common/StatusBadge';
import { ButtonLink } from '../common/ButtonLink';

export function VehicleHero({ vehicle, health, weekKm, className }) {
  const fmt = useFormat();
  const src = safeUrl(vehicle.image);

  return (
    <Card padded={false} className={cn('overflow-hidden', className)}>
      <div className="grid h-full sm:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-[16/10] bg-subtle sm:aspect-auto">
          {src ?
          <img src={src} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="absolute inset-0 h-full w-full object-cover" /> :

          <div className="absolute inset-0 flex items-center justify-center">
              <CarFrontIcon className="h-16 w-16 text-ink-muted/50" aria-hidden="true" />
            </div>
          }
        </div>
        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">
                {vehicle.year}
                {vehicle.variant ? ` · ${vehicle.variant}` : ''}
              </p>
              <h2 className="truncate text-2xl font-bold text-ink">
                {vehicle.make} {vehicle.model}
              </h2>
            </div>
            {health?.status && health.status !== 'unknown' ? <StatusBadge status={health.status} /> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vehicle.fuelType ? <Badge>{vehicle.fuelType}</Badge> : null}
            {vehicle.transmission ? <Badge>{vehicle.transmission}</Badge> : null}
            {vehicle.registration ? <Badge className="tnum">{fmt.plate(vehicle.registration)}</Badge> : null}
          </div>
          <div className="mt-auto pt-6">
            <p className="text-[13px] font-medium text-ink-muted">Current mileage</p>
            <p className="mt-0.5 font-display text-4xl font-bold text-ink tnum sm:text-[44px] sm:leading-[1.1]">
              {fmt.number(fmt.distanceValue(vehicle.mileage))}
              <span className="ml-1.5 text-lg font-semibold text-ink-muted">{fmt.distanceUnit}</span>
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              {vehicle.mileageUpdatedAt ? `Updated ${fmt.relative(vehicle.mileageUpdatedAt)}` : 'Not updated yet'}
              {weekKm ? ` · ${fmt.distance(weekKm)} driven this week` : ''}
            </p>
          </div>
          <ButtonLink to={`/vehicles/${vehicle.id}`} variant="ghost" size="sm" className="-ml-3 mt-4 self-start" rightIcon={ArrowRightIcon}>
            View vehicle profile
          </ButtonLink>
        </div>
      </div>
    </Card>);

}