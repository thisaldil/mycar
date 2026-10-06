import { CheckIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { ProgressBar } from '../../common/ProgressBar';

export function WizardProgress({ steps, current, maxStep, onSelect }) {
  return (
    <>
      {/* Mobile / tablet: compact progress */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">{steps[current].title}</span>
          <span className="text-ink-muted tnum">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <ProgressBar value={current + 1} max={steps.length} label="Wizard progress" valueText={`Step ${current + 1} of ${steps.length}`} />
      </div>

      {/* Desktop: vertical step list */}
      <nav aria-label="Add vehicle steps" className="hidden lg:block">
        <ol className="sticky top-24 space-y-1">
          {steps.map((s, i) => {
            const done = i < current || i <= maxStep && i !== current && i < maxStep;
            const isCurrent = i === current;
            const reachable = i <= maxStep;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  disabled={!reachable}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150',
                    isCurrent ? 'bg-surface font-semibold text-ink shadow-card ring-1 ring-line' : reachable ? 'text-ink-soft hover:bg-surface' : 'cursor-default text-ink-muted'
                  )}>
                  
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tnum',
                      done ? 'bg-brand text-brand-on' : isCurrent ? 'bg-brand-soft text-brand ring-2 ring-brand' : 'bg-subtle text-ink-muted ring-1 ring-line'
                    )}>
                    
                    {done ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  {s.optional ? <span className="text-xs font-normal text-ink-muted">Optional</span> : null}
                </button>
              </li>);

          })}
        </ol>
      </nav>
    </>);

}