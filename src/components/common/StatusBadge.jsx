import { Badge } from './Badge';

const STATUS = {
  valid: ['success', 'Valid'],
  expiring: ['warning', 'Expiring soon'],
  expired: ['danger', 'Expired'],
  good: ['success', 'Good'],
  excellent: ['success', 'Excellent'],
  fair: ['warning', 'Fair'],
  poor: ['danger', 'Poor'],
  attention: ['danger', 'Needs attention'],
  overdue: ['danger', 'Overdue'],
  'due-soon': ['warning', 'Due soon'],
  upcoming: ['brand', 'Upcoming'],
  ok: ['success', 'On track'],
  completed: ['success', 'Completed'],
  pass: ['success', 'Pass'],
  advisory: ['warning', 'Advisory'],
  fail: ['danger', 'Fail'],
  active: ['brand', 'Active'],
  archived: ['neutral', 'Archived'],
  unknown: ['neutral', 'No data'],
  'no-expiry': ['neutral', 'No expiry']
};

export function statusTone(status) {
  return (STATUS[String(status || '').toLowerCase()] || STATUS.unknown)[0];
}

export function StatusBadge({ status, label, className, size }) {
  const [tone, defaultLabel] = STATUS[String(status || '').toLowerCase()] || STATUS.unknown;
  return (
    <Badge tone={tone} dot className={className} size={size}>
      {label || defaultLabel}
    </Badge>);

}