import { CheckCircle2Icon, KeyRoundIcon, SparklesIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';

const OPTIONS = [
{
  value: 'new',
  title: 'New vehicle',
  description: 'Bought new from a dealer. We’ll ask about the dealer, warranty and financing.',
  icon: SparklesIcon
},
{
  value: 'used',
  title: 'Used vehicle',
  description: 'Previously owned. We’ll ask about previous owners, accident history and condition at purchase.',
  icon: KeyRoundIcon
}];


export function StepType({ form }) {
  const { register, watch, formState } = form;
  const value = watch('type');
  const error = formState.errors.type?.message;

  return (
    <fieldset aria-describedby={error ? 'type-error' : undefined}>
      <legend className="font-display text-xl font-bold text-ink sm:text-2xl">What are you adding?</legend>
      <p className="mt-1 text-sm text-ink-soft">This decides which purchase questions we ask. You can't get it wrong — it only changes the next few fields.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((o) => {
          const selected = value === o.value;
          const Icon = o.icon;
          return (
            <label
              key={o.value}
              className={cn(
                'relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition-[border-color,background-color] duration-150',
                'focus-within:ring-4 focus-within:ring-brand/15',
                selected ? 'border-brand bg-brand-soft/50' : 'border-line hover:border-line-strong'
              )}>
              
              <input type="radio" value={o.value} className="sr-only" {...register('type')} />
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', selected ? 'bg-brand text-brand-on' : 'bg-subtle text-ink-soft')}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mt-4 text-base font-semibold text-ink">{o.title}</span>
              <span className="mt-1 text-sm text-ink-soft">{o.description}</span>
              {selected ? <CheckCircle2Icon className="absolute right-4 top-4 h-5 w-5 text-brand" aria-hidden="true" /> : null}
            </label>);

        })}
      </div>
      {error ?
      <p id="type-error" role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p> :
      null}
    </fieldset>);

}