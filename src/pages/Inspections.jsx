import { ModulePage } from '../components/common/ModulePage';
import { InspectionPanel } from '../components/inspection/InspectionPanel';

export function Inspections() {
  return <ModulePage title="Inspections" description="Emission tests and inspections">{(v) => <InspectionPanel vehicle={v} />}</ModulePage>;
}