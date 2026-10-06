import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CarFrontIcon, FileClockIcon, PlusIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import { vehicleApi } from '../services/vehicleApi';
import { draftKeyFor } from '../hooks/useVehicleWizard';
import { PageHeader } from '../components/common/PageHeader';
import { ButtonLink } from '../components/common/ButtonLink';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { toast } from '../components/common/Toast';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { VehicleEditDrawer } from '../components/vehicle/VehicleEditDrawer';

function hasDraft(userId) {
  try {
    return !!localStorage.getItem(draftKeyFor(userId));
  } catch {
    return false;
  }
}

export function Vehicles() {
  const { user } = useAuth();
  const { vehicles, activeVehicleId, setActiveVehicle, loaded, error, reload, upsertVehicle, removeVehicle } = useVehicles();
  const [view, setView] = useState('active');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const archivedCount = vehicles.filter((v) => v.status === 'archived').length;
  const list = useMemo(() => vehicles.filter((v) => view === 'active' ? v.status !== 'archived' : v.status === 'archived'), [vehicles, view]);
  const draft = hasDraft(user?.id);

  const setActive = (v) => {
    setActiveVehicle(v.id);
    toast.success(`${v.make} ${v.model} is now your active vehicle`);
  };

  const toggleArchive = async (v) => {
    try {
      const updated = await vehicleApi.archive(v.id, v.status !== 'archived');
      upsertVehicle(updated);
      toast.success(updated.status === 'archived' ? `${v.model} archived. Its history is kept.` : `${v.model} restored`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="My vehicles"
        description={loaded ? `${vehicles.length - archivedCount} in your garage${archivedCount ? ` · ${archivedCount} archived` : ''}` : 'Your garage'}
        actions={
        <ButtonLink to="/vehicles/new" leftIcon={PlusIcon}>
            Add vehicle
          </ButtonLink>
        } />
      

      {draft ?
      <Link to="/vehicles/new" className="mb-5 flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm transition-colors duration-150 hover:bg-brand/15">
          <FileClockIcon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <span className="flex-1 text-ink">You have an unfinished vehicle draft.</span>
          <span className="font-medium text-brand">Continue</span>
        </Link> :
      null}

      {archivedCount ?
      <SegmentedControl
        className="mb-5"
        ariaLabel="Filter vehicles"
        value={view}
        onChange={setView}
        options={[
        { value: 'active', label: `Active (${vehicles.length - archivedCount})` },
        { value: 'archived', label: `Archived (${archivedCount})` }]
        } /> :

      null}

      {!loaded ?
      <LoadingState variant="cards" rows={3} /> :
      error ?
      <ErrorState error={error} onRetry={reload} /> :
      list.length === 0 && view === 'archived' ?
      <EmptyState icon={CarFrontIcon} title="No archived vehicles" description="Archive a vehicle you've sold to keep its history without cluttering your garage." /> :
      list.length === 0 ?
      <EmptyState
        icon={CarFrontIcon}
        title="Your garage is empty"
        description="Add your car to start tracking services, fuel, documents and costs."
        action={
        <ButtonLink to="/vehicles/new" leftIcon={PlusIcon}>
              Add vehicle
            </ButtonLink>
        } /> :


      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((v) =>
        <VehicleCard
          key={v.id}
          vehicle={v}
          isActive={v.id === activeVehicleId}
          onSetActive={() => setActive(v)}
          onEdit={() => setEditing(v)}
          onArchive={() => toggleArchive(v)}
          onDelete={() => setDeleting(v)} />

        )}
          {view === 'active' ?
        <Link
          to="/vehicles/new"
          className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line-strong text-ink-muted transition-colors duration-150 hover:border-brand/60 hover:text-brand">
          
              <PlusIcon className="h-7 w-7" aria-hidden="true" />
              <span className="text-sm font-medium">Add another vehicle</span>
            </Link> :
        null}
        </div>
      }

      <VehicleEditDrawer open={!!editing} vehicle={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting ? `${deleting.make} ${deleting.model}` : 'vehicle'}?`}
        message="This permanently deletes the vehicle and every record attached to it — services, fuel logs, documents and reminders. If you sold it, archive it instead to keep the history."
        confirmLabel="Delete permanently"
        onConfirm={async () => {
          await vehicleApi.remove(deleting.id);
          removeVehicle(deleting.id);
          toast.success('Vehicle deleted');
        }} />
      
    </div>);

}