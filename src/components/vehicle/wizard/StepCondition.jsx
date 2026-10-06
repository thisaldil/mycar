import { Controller } from 'react-hook-form';
import { CONDITION_LEVELS, CONDITION_SYSTEMS } from '../../../data/options';
import { healthFromCondition } from '../../../utils/status';
import { SegmentedControl } from '../../common/SegmentedControl';
import { StatusBadge } from '../../common/StatusBadge';
import { StepHeading } from './StepHeading';

export function StepCondition({ form }) {
  const { control, watch } = form;
  const condition = watch('condition');
  const health = healthFromCondition(condition);

  return (
    <div>
      <StepHeading title="How is it holding up?" description="A quick honest rating of each area. It sets your starting vehicle-health score, and you can update it anytime." />
      <div className="mb-5 flex items-center justify-between rounded-xl bg-subtle px-4 py-3">
        <span className="text-sm text-ink-soft">
          Starting health score <span className="ml-1 font-semibold text-ink tnum">{health.score ?? '—'} / 100</span>
        </span>
        <StatusBadge status={health.status} />
      </div>
      <ul className="divide-y divide-line">
        {CONDITION_SYSTEMS.map((s) =>
        <li key={s.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span id={`cond-${s.key}`} className="text-[15px] font-medium text-ink">
              {s.label}
            </span>
            <Controller
            name={`condition.${s.key}`}
            control={control}
            render={({ field }) =>
            <SegmentedControl size="sm" ariaLabel={`${s.label} condition`} options={CONDITION_LEVELS} value={field.value} onChange={field.onChange} className="self-start" />
            } />
          
          </li>
        )}
      </ul>
    </div>);

}