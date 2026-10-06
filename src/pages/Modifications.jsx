import { ModulePage } from '../components/common/ModulePage';
import { ModificationsPanel } from '../components/modifications/ModificationsPanel';

export function Modifications() {
  return <ModulePage title="Modifications" description="What you've added to your car">{(v) => <ModificationsPanel vehicle={v} />}</ModulePage>;
}