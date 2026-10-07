import { CarFrontIcon, CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useFormat } from '../hooks/useFormat';
import { vehicleName } from '../utils/format';
import { safeUrl } from '../utils/sanitize';
import { Dropdown } from '../components/common/Dropdown';
import { ButtonLink } from '../components/common/ButtonLink';
import { Skeleton } from '../components/common/Skeleton';
import { toast } from '../components/common/Toast';

function thumbIcon(vehicle) {
  const src = safeUrl(vehicle.image);
  return function VehicleThumb() {
    return src ?
    <img src={src} alt="" className="h-7 w-10 shrink-0 rounded-md bg-subtle object-cover" /> :

    <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded-md bg-subtle">
        <CarFrontIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
      </span>;

  };
}

export function VehicleSwitcher() {
  const { activeVehicles, activeVehicle, setActiveVehicle, loaded } = useVehicles();
  const fmt = useFormat();

  if (!loaded) return <Skeleton className="h-10 w-44" />;
  if (!activeVehicle) {
    return (
      <ButtonLink to="/vehicles/new" size="sm" variant="soft" leftIcon={PlusIcon}>
        Add vehicle
      </ButtonLink>);

  }

  const src = safeUrl(activeVehicle.image);
  const items = [
  { type: 'label', label: 'Switch active vehicle' },
  ...activeVehicles.map((v) => ({
    label: `${v.year} ${vehicleName(v)}`,
    icon: thumbIcon(v),
    active: v.id === activeVehicle.id,
    trailing: v.id === activeVehicle.id ? <CheckIcon className="h-4 w-4 text-brand" aria-label="Active" /> : null,
    onSelect: () => {
      if (v.id === activeVehicle.id) return;
      setActiveVehicle(v.id);
      toast.success(`Now showing ${vehicleName(v)}`);
    }
  })),
  { type: 'divider' },
  { label: 'Manage vehicles', icon: CarFrontIcon, to: '/vehicles' },
  { label: 'Add vehicle', icon: PlusIcon, to: '/vehicles/new' }];


  return (
    <Dropdown
      align="start"
      items={items}
      menuClassName="w-72"
      trigger={(props) =>
      <button
        {...props}
        type="button"
        className="flex h-11 min-w-0 max-w-[15rem] items-center gap-3 rounded-xl py-1 pl-1 pr-2 text-left transition-colors duration-150 hover:bg-subtle sm:max-w-xs"
        aria-label={`Active vehicle: ${vehicleName(activeVehicle)}. Change vehicle`}>
        
          {src ?
        <img src={src} alt="" className="h-9 w-12 shrink-0 rounded-lg bg-subtle object-cover" /> :

        <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-subtle">
              <CarFrontIcon className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            </span>
        }
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{vehicleName(activeVehicle)}</span>
            <span className="block truncate text-xs text-ink-muted tnum">
              {activeVehicle.registration ? `${fmt.plate(activeVehicle.registration)} · ` : ''}
              {fmt.distance(activeVehicle.mileage)}
            </span>
          </span>
          <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
        </button>
      } />);


}