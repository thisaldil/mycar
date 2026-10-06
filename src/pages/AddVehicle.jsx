import { PageHeader } from '../components/common/PageHeader';
import { AddVehicleWizard } from '../components/vehicle/wizard/AddVehicleWizard';

export function AddVehicle() {
  return (
    <div>
      <PageHeader back={{ to: '/vehicles', label: 'My vehicles' }} title="Add a vehicle" description="Start with the basics. Everything after that is optional and can be added later." />
      <AddVehicleWizard />
    </div>);

}