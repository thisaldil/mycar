import { ModulePage } from '../components/common/ModulePage';
import { AccidentsPanel } from '../components/accidents/AccidentsPanel';

export function Accidents() {
  return <ModulePage title="Accidents" description="Incidents, damage and claims">{(v) => <AccidentsPanel vehicle={v} />}</ModulePage>;
}