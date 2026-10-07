import { ShieldCheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { daysUntil, expiryStatus } from '../../utils/status';
import { toDate } from '../../utils/format';
import { cleanText } from '../../utils/sanitize';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { SensitiveValue } from '../common/SensitiveValue';
import { Button } from '../common/Button';

export function PolicyCard({ policy, onOpen, onRenew }) {
  const fmt = useFormat();
  const status = expiryStatus(policy.expiryDate, 30);
  const daysLeft = daysUntil(policy.expiryDate);
  const start = toDate(policy.startDate);
  const end = toDate(policy.expiryDate);
  const elapsed = start && end ? (Date.now() - start.getTime()) / (end.getTime() - start.getTime()) * 100 : 0;
  const tone = status === 'expired' ? 'danger' : status === 'expiring' ? 'warning' : 'success';

  return (
    <Card>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', status === 'valid' ? 'bg-success-soft text-success' : status === 'expiring' ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger')}>
              <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">Current policy</p>
              <h2 className="truncate text-xl font-bold text-ink">{policy.provider}</h2>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-sm text-ink-soft">{policy.policyType}</span>
          </div>
        </div>
        <div className="lg:text-right">
          <p className="font-display text-3xl font-bold text-ink tnum">
            {status === 'expired' ? 'Expired' : `${daysLeft} days`}
          </p>
          <p className="text-sm text-ink-muted">
            {status === 'expired' ? `on ${fmt.date(policy.expiryDate)}` : `left · expires ${fmt.date(policy.expiryDate)}`}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar value={elapsed} tone={tone} label="Policy period elapsed" valueText={`${Math.round(Math.min(100, Math.max(0, elapsed)))}% of the policy period has passed`} />
        <div className="mt-2 flex justify-between text-xs text-ink-muted">
          <span>{fmt.date(policy.startDate)}</span>
          <span>{fmt.date(policy.expiryDate)}</span>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-[13px] text-ink-muted">Premium</dt>
          <dd className="mt-0.5 font-semibold text-ink tnum">{fmt.money(policy.premium)}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-ink-muted">Sum insured</dt>
          <dd className="mt-0.5 font-semibold text-ink tnum">{policy.coverageAmount ? fmt.money(policy.coverageAmount) : '—'}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[13px] text-ink-muted">Policy number</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            <SensitiveValue value={policy.policyNumber} />
          </dd>
        </div>
      </dl>
      {policy.coverage ?
      <div className="mt-4">
          <p className="text-[13px] text-ink-muted">Coverage</p>
          <p className="mt-0.5 text-sm text-ink">{cleanText(policy.coverage)}</p>
        </div> :
      null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onOpen}>
          View details
        </Button>
        {status !== 'valid' ? <Button onClick={onRenew}>Add renewed policy</Button> : null}
      </div>
    </Card>);

}