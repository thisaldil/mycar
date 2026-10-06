import { CarFrontIcon, PlusIcon } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { useFormat } from '../../hooks/useFormat';
import { vehicleName } from '../../utils/format';
import { PageHeader } from './PageHeader';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { ButtonLink } from './ButtonLink';

/** Page shell for modules that work on the active vehicle. `children` is a render function receiving the vehicle. */
export function ModulePage({ title, description, children }) {
  const { activeVehicle, loaded, error, reload } = useVehicles();
  const fmt = useFormat();

  const context = activeVehicle ?
  `${activeVehicle.year} ${vehicleName(activeVehicle)}${activeVehicle.registration ? ` · ${fmt.plate(activeVehicle.registration)}` : ''}` :
  null;

  return (
    <div>
      <PageHeader title={title} description={context ? `${description} — ${context}` : description} />
      {!loaded ?
      <LoadingState variant="page" /> :
      error ?
      <ErrorState error={error} onRetry={reload} /> :
      !activeVehicle ?
      <EmptyState
        icon={CarFrontIcon}
        title="Add your first vehicle"
        description="CarLife keeps records per vehicle. Add your car to start tracking."
        action={
        <ButtonLink to="/vehicles/new" leftIcon={PlusIcon}>
              Add vehicle
            </ButtonLink>
        } /> :


      children(activeVehicle)
      }
    </div>);

}