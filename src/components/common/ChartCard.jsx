import { ChartColumnIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card, CardHeader } from './Card';

export function ChartCard({ title, description, action, height = 260, empty = false, emptyText = 'Not enough data yet', className, children }) {
  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader title={title} description={description} action={action} />
      {empty ?
      <div style={{ height }} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-subtle text-sm text-ink-muted">
          <ChartColumnIcon className="h-5 w-5" aria-hidden="true" />
          {emptyText}
        </div> :

      <div style={{ height }} className="-ml-3 -mr-1">
          {children}
        </div>
      }
    </Card>);

}