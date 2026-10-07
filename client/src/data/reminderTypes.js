import {
  BatteryChargingIcon,
  BellIcon,
  CircleDotIcon,
  ClipboardCheckIcon,
  LandmarkIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  WrenchIcon } from
'lucide-react';

export const REMINDER_TYPE_ICONS = {
  Service: WrenchIcon,
  Insurance: ShieldCheckIcon,
  Inspection: ClipboardCheckIcon,
  Warranty: BadgeCheckIcon,
  Tyres: CircleDotIcon,
  Battery: BatteryChargingIcon,
  Finance: LandmarkIcon,
  Other: BellIcon
};