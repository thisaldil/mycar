/** Human-readable "when is this due" copy for a reminder. `fmt` comes from useFormat(). */
export function describeDue(reminder, state, fmt) {
  if (reminder.completed) return reminder.completedAt ? `Completed ${fmt.date(reminder.completedAt)}` : 'Completed';
  const parts = [];
  if (state.days != null) {
    if (state.days < 0) parts.push(`${Math.abs(state.days)} ${Math.abs(state.days) === 1 ? 'day' : 'days'} overdue`);else
    if (state.days === 0) parts.push('Due today');else
    parts.push(`${fmt.relative(reminder.dueDate).replace(/^in /, 'In ')} · ${fmt.date(reminder.dueDate, 'short')}`);
  }
  if (state.km != null) {
    parts.push(state.km < 0 ? `${fmt.distance(Math.abs(state.km))} over` : `${fmt.distance(state.km)} to go`);
  }
  return parts.join(' · ') || 'No due date';
}