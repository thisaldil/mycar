import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CarFrontIcon, PencilIcon } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useAsync } from '../hooks/useAsync';
import { useFormat } from '../hooks/useFormat';
import { vehicleApi } from '../services/vehicleApi';
import { healthFromCondition } from '../utils/status';
import { safeUrl } from '../utils/sanitize';
import { CONDITION_LEVELS, CONDITION_SYSTEMS } from '../data/options';
import { TIMELINE_TYPES, TONE_CLASSES } from '../data/timelineTypes';
import { cn } from '../utils/cn';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader } from '../components/common/Card';
import { Tabs } from '../components/common/Tabs';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Accordion } from '../components/common/Accordion';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { toast } from '../components/common/Toast';
import { VehicleEditDrawer } from '../components/vehicle/VehicleEditDrawer';
import { NextServiceCard } from '../components/dashboard/NextServiceCard';
import { MaintenancePanel } from '../components/maintenance/MaintenancePanel';
import { FuelPanel } from '../components/fuel/FuelPanel';
import { ExpensesPanel } from '../components/expenses/ExpensesPanel';
import { DocumentsPanel } from '../components/documents/DocumentsPanel';
import { InsurancePanel } from '../components/insurance/InsurancePanel';
import { InspectionPanel } from '../components/inspection/InspectionPanel';
import { TyresPanel } from '../components/tyres/TyresPanel';
import { BatteryPanel } from '../components/battery/BatteryPanel';
import { AccidentsPanel } from '../components/accidents/AccidentsPanel';
import { ModificationsPanel } from '../components/modifications/ModificationsPanel';
import { nextService } from '../utils/status';

const TABS = [
['overview', 'Overview'], ['details', 'Details'], ['maintenance', 'Maintenance'], ['fuel', 'Fuel'], ['expenses', 'Expenses'],
['documents', 'Documents'], ['insurance', 'Insurance'], ['inspection', 'Inspection'], ['tyres', 'Tyres'], ['battery', 'Battery'],
['accidents', 'Accidents'], ['modifications', 'Modifications'], ['timeline', 'Timeline']].
map(([id, label]) => ({ id, label }));

const PANELS = { maintenance: MaintenancePanel, fuel: FuelPanel, expenses: ExpensesPanel, documents: DocumentsPanel, insurance: InsurancePanel, inspection: InspectionPanel, tyres: TyresPanel, battery: BatteryPanel, accidents: AccidentsPanel, modifications: ModificationsPanel };

function Facts({ rows }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {rows.map(([label, value]) =>
      <div key={label} className="min-w-0">
          <dt className="text-[13px] text-ink-muted">{label}</dt>
          <dd className={cn('mt-0.5 truncate text-[15px] font-medium', value ? 'text-ink' : 'text-ink-muted')}>{value || 'Not added'}</dd>
        </div>
      )}
    </dl>);

}

function Overview({ vehicle }) {
  const health = healthFromCondition(vehicle.condition);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <NextServiceCard service={nextService(vehicle)} />
      <Card className="lg:col-span-2">
        <CardHeader title="Vehicle health" description={health.score != null ? `${health.score} / 100 overall` : 'Not rated yet'} action={<StatusBadge status={health.status} />} />
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {CONDITION_SYSTEMS.map((s) => {
            const level = vehicle.condition?.[s.key];
            return (
              <li key={s.key} className="flex items-center justify-between border-b border-line pb-3 text-sm">
                <span className="text-ink">{s.label}</span>
                {level ? <StatusBadge status={level} size="sm" label={CONDITION_LEVELS.find((l) => l.value === level)?.label} /> : <span className="text-ink-muted">—</span>}
              </li>);

          })}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">Update ratings from “Edit details” whenever something changes.</p>
      </Card>
    </div>);

}

function Details({ vehicle }) {
  const fmt = useFormat();
  const t = vehicle.technical || {};
  const d = vehicle.dimensions || {};
  const p = vehicle.performance || {};
  const mm = (v) => v ? `${fmt.number(v)} mm` : null;
  return (
    <div className="space-y-4">
      <Card>
        <Facts rows={[['Make', vehicle.make], ['Model', vehicle.model], ['Year', vehicle.year], ['Variant', vehicle.variant], ['Registration', fmt.plate(vehicle.registration)], ['Mileage', fmt.distance(vehicle.mileage)], ['Fuel', vehicle.fuelType], ['Transmission', vehicle.transmission], ['VIN / chassis', vehicle.vin]]} />
      </Card>
      <Accordion
        items={[
        { id: 'engine', title: 'Engine', subtitle: [t.capacity && `${t.capacity} cc`, t.power].filter(Boolean).join(' · '), content: <Facts rows={[['Engine type', t.engineType], ['Capacity', t.capacity && `${t.capacity} cc`], ['Cylinders', t.cylinders], ['Power', t.power], ['Torque', t.torque], ['Aspiration', t.aspiration]]} /> },
        { id: 'transmission', title: 'Transmission', subtitle: [vehicle.transmission, t.driveType].filter(Boolean).join(' · '), content: <Facts rows={[['Type', vehicle.transmission], ['Gears', t.gears], ['Drive type', t.driveType]]} /> },
        { id: 'dimensions', title: 'Dimensions', subtitle: d.length ? `${mm(d.length)} long` : '', content: <Facts rows={[['Length', mm(d.length)], ['Width', mm(d.width)], ['Height', mm(d.height)], ['Wheelbase', mm(d.wheelbase)], ['Weight', d.weight && `${fmt.number(d.weight)} kg`], ['Boot capacity', d.boot && `${d.boot} L`]]} /> },
        { id: 'performance', title: 'Performance', subtitle: p.economy || '', content: <Facts rows={[['Top speed', p.topSpeed && `${p.topSpeed} km/h`], ['0–100 km/h', p.zeroTo100 && `${p.zeroTo100} s`], ['Fuel economy', p.economy], ['Emissions', p.emissions]]} /> }]
        } />
      
    </div>);

}

function Timeline({ vehicleId }) {
  const fmt = useFormat();
  const [limit, setLimit] = useState(20);
  const { data, loading, error, reload } = useAsync(() => vehicleApi.timeline(vehicleId), [vehicleId]);
  if (loading && !data) return <LoadingState variant="list" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data?.length) return <EmptyState title="No history yet" description="Records you add will appear here in order." />;
  return (
    <div>
      <ol className="relative ml-4 space-y-5 border-l-2 border-line pl-8">
        {data.slice(0, limit).map((e) => {
          const meta = TIMELINE_TYPES[e.type] || TIMELINE_TYPES.service;
          const Icon = meta.icon;
          return (
            <li key={e.id} className="relative">
              <span className={cn('absolute -left-[53px] flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-canvas', TONE_CLASSES[meta.tone])}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="font-semibold text-ink">{e.title}</p>
                {e.amount ? <span className="text-sm font-medium text-ink tnum">{fmt.money(e.amount)}</span> : null}
              </div>
              <p className="text-sm text-ink-muted">
                {fmt.date(e.date, 'long')}
                {e.mileage ? ` · ${fmt.distance(e.mileage)}` : ''}
                {e.description ? ` · ${e.description}` : ''}
              </p>
            </li>);

        })}
      </ol>
      {data.length > limit ?
      <Button variant="secondary" className="mt-6" onClick={() => setLimit((l) => l + 20)}>
          Show older events
        </Button> :
      null}
    </div>);

}

export function VehicleProfile() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview';
  const { vehicles, activeVehicleId, setActiveVehicle } = useVehicles();
  const { data, loading, error, reload, setData } = useAsync(() => vehicleApi.get(id), [id]);
  const [editOpen, setEditOpen] = useState(false);
  const fmt = useFormat();

  if (loading && !data) return <LoadingState variant="page" />;
  if (error && !data) return <ErrorState title={error.status === 404 ? 'Vehicle not found' : undefined} error={error} onRetry={reload} />;
  if (!data) return null;

  const vehicle = { ...data, ...(vehicles.find((v) => v.id === id) || {}) };
  const health = healthFromCondition(vehicle.condition);
  const isActive = activeVehicleId === vehicle.id;
  const src = safeUrl(vehicle.image);
  const Panel = PANELS[tab];

  return (
    <div>
      <PageHeader back={{ to: '/vehicles', label: 'My vehicles' }} title={`${vehicle.make} ${vehicle.model}`} description={`${vehicle.year}${vehicle.variant ? ` · ${vehicle.variant}` : ''}`} />
      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-[16/9] bg-subtle md:aspect-auto md:w-[40%]">
            {src ? <img src={src} alt={`${vehicle.make} ${vehicle.model}`} className="absolute inset-0 h-full w-full object-cover" /> : <CarFrontIcon className="absolute inset-0 m-auto h-14 w-14 text-ink-muted/50" aria-hidden="true" />}
          </div>
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex flex-wrap gap-1.5">
              {isActive ? <Badge tone="brand">Active vehicle</Badge> : null}
              {vehicle.registration ? <Badge>{fmt.plate(vehicle.registration)}</Badge> : null}
              {vehicle.status === 'archived' ? <Badge>Archived</Badge> : null}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[13px] text-ink-muted">Mileage</dt>
                <dd className="font-display text-2xl font-bold text-ink tnum">{fmt.distance(vehicle.mileage)}</dd>
              </div>
              <div><dt className="text-[13px] text-ink-muted">Fuel</dt><dd className="mt-1 font-medium text-ink">{vehicle.fuelType}</dd></div>
              <div><dt className="text-[13px] text-ink-muted">Transmission</dt><dd className="mt-1 font-medium text-ink">{vehicle.transmission}</dd></div>
              <div><dt className="text-[13px] text-ink-muted">Health</dt><dd className="mt-1"><StatusBadge status={health.status} /></dd></div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" leftIcon={PencilIcon} onClick={() => setEditOpen(true)}>Edit details</Button>
              {!isActive && vehicle.status !== 'archived' ?
              <Button variant="soft" onClick={() => {setActiveVehicle(vehicle.id);toast.success(`${vehicle.model} is now your active vehicle`);}}>Set as active</Button> :
              null}
            </div>
          </div>
        </div>
      </Card>

      <Tabs className="mt-6" ariaLabel="Vehicle sections" tabs={TABS} value={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} />
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-6">
        {tab === 'overview' ? <Overview vehicle={vehicle} /> : tab === 'details' ? <Details vehicle={vehicle} /> : tab === 'timeline' ? <Timeline vehicleId={vehicle.id} /> : <Panel key={tab} vehicle={vehicle} />}
      </div>
      <VehicleEditDrawer open={editOpen} vehicle={vehicle} onClose={() => setEditOpen(false)} onSaved={setData} />
    </div>);

}