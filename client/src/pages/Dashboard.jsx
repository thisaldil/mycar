import { useState } from 'react';
import { CarFrontIcon, FuelIcon, GaugeIcon, PlusIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import { useAsync } from '../hooks/useAsync';
import { vehicleApi } from '../services/vehicleApi';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Skeleton } from '../components/common/Skeleton';
import { VehicleHero } from '../components/dashboard/VehicleHero';
import { NextServiceCard } from '../components/dashboard/NextServiceCard';
import { StatusTiles } from '../components/dashboard/StatusTiles';
import { RunningCostCard } from '../components/dashboard/RunningCostCard';
import { UpcomingList } from '../components/dashboard/UpcomingList';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UpdateMileageModal } from '../components/dashboard/UpdateMileageModal';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading dashboard">
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>);

}

export function Dashboard() {
  const { user } = useAuth();
  const { activeVehicle, loaded, error, reload: reloadVehicles } = useVehicles();
  const [mileageOpen, setMileageOpen] = useState(false);
  const summary = useAsync(
    () => activeVehicle ? vehicleApi.summary(activeVehicle.id) : Promise.resolve(null),
    [activeVehicle?.id, activeVehicle?.mileage]
  );
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (!loaded) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reloadVehicles} />;

  if (!activeVehicle) {
    return (
      <div className="mx-auto max-w-2xl pt-6">
        <p className="text-sm text-ink-muted">
          {greeting()}, {firstName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-[28px]">Let's set up your garage</h1>
        <EmptyState
          className="mt-6"
          icon={CarFrontIcon}
          title="Add your first vehicle"
          description="It takes about two minutes. Start with the basics — you can add purchase details, documents and photos any time."
          action={
          <ButtonLink to="/vehicles/new" size="lg" leftIcon={PlusIcon}>
              Add vehicle
            </ButtonLink>
          } />
        
      </div>);

  }

  const s = summary.data;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-ink-muted">
            {greeting()}, {firstName}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-ink sm:text-[28px]">Here's how your {activeVehicle.model} is doing</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={GaugeIcon} onClick={() => setMileageOpen(true)} className="flex-1 sm:flex-none">
            Update mileage
          </Button>
          <ButtonLink to="/fuel?new=1" leftIcon={FuelIcon} className="flex-1 sm:flex-none">
            Log fuel
          </ButtonLink>
        </div>
      </header>

      {summary.loading && !s ?
      <DashboardSkeleton /> :
      summary.error && !s ?
      <ErrorState error={summary.error} onRetry={summary.reload} /> :
      s ?
      <>
          <div className="grid gap-4 lg:grid-cols-3">
            <VehicleHero className="lg:col-span-2" vehicle={s.vehicle} health={s.health} weekKm={s.weekKm} />
            <NextServiceCard service={s.nextService} />
          </div>
          <StatusTiles insurance={s.insurance} inspection={s.inspection} health={s.health} vehicleId={s.vehicle.id} />
          <div className="grid gap-4 lg:grid-cols-3">
            <RunningCostCard className="lg:col-span-2" costs={s.costs} />
            <UpcomingList reminders={s.reminders} />
          </div>
          <RecentActivity items={s.recent} vehicleId={s.vehicle.id} />
        </> :
      null}

      <UpdateMileageModal open={mileageOpen} onClose={() => setMileageOpen(false)} vehicle={activeVehicle} onUpdated={reloadVehicles} />
    </div>);

}