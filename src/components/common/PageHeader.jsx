import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from 'lucide-react';

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ?
        <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink">
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            {back.label}
          </Link> :
        null}
        <h1 className="text-2xl font-bold text-ink sm:text-[28px] sm:leading-9">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>);

}