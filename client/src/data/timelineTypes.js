import {
  BatteryChargingIcon,
  CircleDotIcon,
  ClipboardCheckIcon,
  FuelIcon,
  HammerIcon,
  KeyRoundIcon,
  PackagePlusIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  WrenchIcon } from
'lucide-react';

/** Icon + tone for each kind of vehicle event (timeline, recent activity). */
export const TIMELINE_TYPES = {
  purchase: { label: 'Purchase', icon: KeyRoundIcon, tone: 'brand' },
  insurance: { label: 'Insurance', icon: ShieldCheckIcon, tone: 'success' },
  service: { label: 'Service', icon: WrenchIcon, tone: 'brand' },
  repair: { label: 'Repair', icon: HammerIcon, tone: 'warning' },
  fuel: { label: 'Fuel', icon: FuelIcon, tone: 'neutral' },
  tyres: { label: 'Tyres', icon: CircleDotIcon, tone: 'neutral' },
  battery: { label: 'Battery', icon: BatteryChargingIcon, tone: 'neutral' },
  inspection: { label: 'Inspection', icon: ClipboardCheckIcon, tone: 'success' },
  accident: { label: 'Accident', icon: TriangleAlertIcon, tone: 'danger' },
  modification: { label: 'Modification', icon: PackagePlusIcon, tone: 'neutral' }
};

export const TONE_CLASSES = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-subtle text-ink-soft'
};