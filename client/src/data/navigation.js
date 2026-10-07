import {
  BatteryChargingIcon,
  BellIcon,
  CarFrontIcon,
  ChartColumnIcon,
  CircleDotIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  FuelIcon,
  LayoutDashboardIcon,
  PackagePlusIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  WalletIcon,
  WrenchIcon } from
'lucide-react';

export const NAV_ITEMS = {
  dashboard: { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboardIcon },
  vehicles: { to: '/vehicles', label: 'My Vehicles', short: 'Vehicles', icon: CarFrontIcon },
  maintenance: { to: '/maintenance', label: 'Maintenance', short: 'Service', icon: WrenchIcon },
  fuel: { to: '/fuel', label: 'Fuel', short: 'Fuel', icon: FuelIcon },
  expenses: { to: '/expenses', label: 'Expenses', short: 'Expenses', icon: WalletIcon },
  documents: { to: '/documents', label: 'Documents', short: 'Docs', icon: FileTextIcon },
  insurance: { to: '/insurance', label: 'Insurance', short: 'Insurance', icon: ShieldCheckIcon },
  inspections: { to: '/inspections', label: 'Inspections', short: 'Inspections', icon: ClipboardCheckIcon },
  tyres: { to: '/tyres', label: 'Tyres', short: 'Tyres', icon: CircleDotIcon },
  battery: { to: '/battery', label: 'Battery', short: 'Battery', icon: BatteryChargingIcon },
  accidents: { to: '/accidents', label: 'Accidents', short: 'Accidents', icon: TriangleAlertIcon },
  modifications: { to: '/modifications', label: 'Modifications', short: 'Mods', icon: PackagePlusIcon },
  reminders: { to: '/reminders', label: 'Reminders', short: 'Reminders', icon: BellIcon },
  reports: { to: '/reports', label: 'Reports', short: 'Reports', icon: ChartColumnIcon },
  settings: { to: '/settings', label: 'Settings', short: 'Settings', icon: SettingsIcon }
};

export const NAV_GROUPS = [
{ id: 'main', label: null, items: [NAV_ITEMS.dashboard, NAV_ITEMS.vehicles] },
{
  id: 'records',
  label: 'Records',
  items: [NAV_ITEMS.maintenance, NAV_ITEMS.fuel, NAV_ITEMS.expenses, NAV_ITEMS.documents, NAV_ITEMS.insurance, NAV_ITEMS.inspections]
},
{ id: 'parts', label: 'Parts & history', items: [NAV_ITEMS.tyres, NAV_ITEMS.battery, NAV_ITEMS.accidents, NAV_ITEMS.modifications] },
{ id: 'plan', label: 'Plan & insights', items: [NAV_ITEMS.reminders, NAV_ITEMS.reports] }];


export const BOTTOM_NAV = [NAV_ITEMS.dashboard, NAV_ITEMS.vehicles, NAV_ITEMS.fuel, NAV_ITEMS.maintenance];

export const QUICK_ADD = [
{ to: '/fuel?new=1', label: 'Fuel fill-up', icon: FuelIcon },
{ to: '/maintenance?new=1', label: 'Service record', icon: WrenchIcon },
{ to: '/expenses?new=1', label: 'Expense', icon: WalletIcon },
{ to: '/documents?new=1', label: 'Document', icon: FileTextIcon },
{ to: '/reminders?new=1', label: 'Reminder', icon: BellIcon }];