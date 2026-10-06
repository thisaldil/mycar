import { WrenchIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { ButtonLink } from '../common/ButtonLink';

export function NextServiceCard({ service }) {
  const fmt = useFormat();
  if (!service) return null;
  const overdue = service.remainingKm < 0;
  const tone = service.status === 'overdue' ? 'danger' : service.status === 'due-soon' ? 'warning' : 'brand';

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-sans text-[15px] font-semibold text-ink">Next service</h2>
        <StatusBadge status={service.status} />
      </div>
      <p className="mt-5 font-display text-4xl font-bold text-ink tnum">{fmt.distance(Math.abs(service.remainingKm))}</p>
      <p className="text-sm text-ink-soft">{overdue ? 'past the service interval' : 'remaining until your next service'}</p>
      <ProgressBar
        className="mt-5"
        value={service.progress}
        tone={tone}
        label="Service interval used"
        valueText={`${Math.round(service.progress)}% of the ${fmt.distance(service.interval)} interval used`} />
      
      <div className="mt-2 flex justify-between text-xs text-ink-muted tnum">
        <span>Last at {fmt.distance(service.lastMileage)}</span>
        <span>Due at {fmt.distance(service.dueMileage)}</span>
      </div>
      {service.dueDate ?
      <p className="mt-4 text-sm text-ink-soft">
          Or by <span className="font-medium text-ink">{fmt.date(service.dueDate)}</span>, whichever comes first.
        </p> :
      null}
      <div className="mt-auto pt-5">
        <ButtonLink to="/maintenance?new=1" variant="secondary" className="w-full" leftIcon={WrenchIcon}>
          Log a service
        </ButtonLink>
      </div>
    </Card>);

}