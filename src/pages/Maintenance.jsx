import { ModulePage } from '../components/common/ModulePage';
import { MaintenancePanel } from '../components/maintenance/MaintenancePanel';

export function Maintenance() {
  return <ModulePage title="Maintenance" description="Services and repairs">{(v) => <MaintenancePanel vehicle={v} />}</ModulePage>;
}