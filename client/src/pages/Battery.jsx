import { ModulePage } from '../components/common/ModulePage';
import { BatteryPanel } from '../components/battery/BatteryPanel';

export function Battery() {
  return <ModulePage title="Battery" description="Age, warranty and condition">{(v) => <BatteryPanel vehicle={v} />}</ModulePage>;
}