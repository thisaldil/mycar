import { cn } from '../../utils/cn';

export function Card({ as: Component = 'div', className, padded = true, children, ...props }) {
  return (
    <Component className={cn('rounded-2xl border border-line bg-surface shadow-card', padded && 'p-5 sm:p-6', className)} {...props}>
      {children}
    </Component>);

}

export function CardHeader({ title, description, action, className, as: Heading = 'h2', id }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <Heading id={id} className="text-base font-semibold text-ink">
          {title}
        </Heading>
        {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>);

}