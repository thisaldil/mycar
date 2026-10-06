import { ModulePage } from '../components/common/ModulePage';
import { InsurancePanel } from '../components/insurance/InsurancePanel';

export function Insurance() {
  return <ModulePage title="Insurance" description="Your policy and renewals">{(v) => <InsurancePanel vehicle={v} />}</ModulePage>;
}