import { ModulePage } from '../components/common/ModulePage';
import { FuelPanel } from '../components/fuel/FuelPanel';

export function Fuel() {
  return <ModulePage title="Fuel" description="Fill-ups and economy">{(v) => <FuelPanel vehicle={v} />}</ModulePage>;
}