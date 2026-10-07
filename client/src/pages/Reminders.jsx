import { ModulePage } from '../components/common/ModulePage';
import { RemindersPanel } from '../components/reminders/RemindersPanel';

export function Reminders() {
  return <ModulePage title="Reminders" description="What's due and when">{(v) => <RemindersPanel vehicle={v} />}</ModulePage>;
}