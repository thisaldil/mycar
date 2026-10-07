import { z } from 'zod';
import { CONDITION_SYSTEMS } from '../data/options';
import { todayISO } from './format';

const toNum = (v) => v === '' || v === null || v === undefined ? undefined : typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
const str = (max = 80) => z.string().trim().max(max, 'This is too long').optional().or(z.literal(''));
const dateOpt = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date').optional().or(z.literal(''));

function numOpt(label, { int = false, max, min = 0 } = {}) {
  let n = z.number({ invalid_type_error: `${label} must be a number` }).min(min, min === 0 ? `${label} can't be negative` : `${label} must be at least ${min}`);
  if (int) n = n.int(`${label} must be a whole number`);
  if (max != null) n = n.max(max, `${label} looks too high`);
  return z.preprocess(toNum, n.optional());
}

const CURRENT_YEAR = new Date().getFullYear();
const LEVEL = z.enum(['excellent', 'good', 'fair', 'poor']);

export const vehicleBasicsShape = {
  make: z.string().trim().min(1, 'Make is required').max(40, 'Make is too long'),
  model: z.string().trim().min(1, 'Model is required').max(40, 'Model is too long'),
  variant: str(60),
  year: z.preprocess(
    toNum,
    z.
    number({ required_error: 'Year is required', invalid_type_error: 'Enter a valid year' }).
    int('Enter a valid year').
    min(1950, 'Enter a year after 1950').
    max(CURRENT_YEAR + 1, `Year can't be after ${CURRENT_YEAR + 1}`)
  ),
  registration: str(15),
  vin: z.
  string().
  trim().
  max(17, 'VIN is at most 17 characters').
  refine((v) => !v || /^[A-Za-z0-9-]{6,17}$/.test(v), 'Use 6–17 letters and numbers').
  optional().
  or(z.literal('')),
  fuelType: z.string({ required_error: 'Choose a fuel type' }).min(1, 'Choose a fuel type'),
  transmission: z.string({ required_error: 'Choose a transmission' }).min(1, 'Choose a transmission'),
  mileage: z.preprocess(
    toNum,
    z.
    number({ required_error: 'Current mileage is required', invalid_type_error: 'Mileage must be a number' }).
    int('Use whole kilometres').
    min(0, "Mileage can't be negative").
    max(2000000, 'That mileage looks too high')
  ),
  color: str(30)
};

export const conditionShape = Object.fromEntries(CONDITION_SYSTEMS.map((s) => [s.key, LEVEL]));

const purchaseShape = z.object({
  date: dateOpt,
  price: numOpt('Price'),
  dealer: str(),
  warranty: str(),
  financing: str(),
  financeProvider: str(),
  monthlyPayment: numOpt('Monthly payment'),
  seller: str(),
  previousOwners: numOpt('Previous owners', { int: true, max: 20 }),
  mileageAtPurchase: numOpt('Mileage at purchase', { int: true, max: 2000000 }),
  accidentHistory: str(),
  condition: str(),
  inspected: str(),
  inspectionNotes: str(300)
});

const technicalShape = z.object({
  engineType: str(),
  capacity: numOpt('Engine capacity', { int: true, max: 10000 }),
  cylinders: numOpt('Cylinders', { int: true, max: 16 }),
  aspiration: str(),
  power: str(40),
  torque: str(40),
  gears: str(40),
  driveType: str(),
  bodyType: str(),
  seats: numOpt('Seats', { int: true, max: 15 }),
  doors: numOpt('Doors', { int: true, max: 6 })
});

export const wizardSchema = z.
object({
  type: z.enum(['new', 'used'], { errorMap: () => ({ message: 'Choose new or used to continue' }) }),
  ...vehicleBasicsShape,
  purchase: purchaseShape,
  technical: technicalShape,
  condition: z.object(conditionShape),
  documents: z.array(z.any()),
  images: z.array(z.string()),
  makeActive: z.boolean().optional()
}).
superRefine((v, ctx) => {
  if (v.purchase?.mileageAtPurchase != null && v.mileage != null && v.purchase.mileageAtPurchase > v.mileage) {
    ctx.addIssue({ code: 'custom', path: ['purchase', 'mileageAtPurchase'], message: "Can't be more than the current mileage" });
  }
  if (v.purchase?.date && v.purchase.date > todayISO()) {
    ctx.addIssue({ code: 'custom', path: ['purchase', 'date'], message: "Purchase date can't be in the future" });
  }
});

export const WIZARD_DEFAULTS = {
  type: undefined,
  make: '',
  model: '',
  variant: '',
  year: '',
  registration: '',
  vin: '',
  fuelType: '',
  transmission: '',
  mileage: '',
  color: '',
  purchase: { financing: 'None' },
  technical: {},
  condition: Object.fromEntries(CONDITION_SYSTEMS.map((s) => [s.key, 'good'])),
  documents: [],
  images: [],
  makeActive: true
};

export const vehicleEditSchema = z.object({
  ...vehicleBasicsShape,
  serviceIntervalKm: z.preprocess(
    toNum,
    z.number({ required_error: 'Service interval is required', invalid_type_error: 'Must be a number' }).int().min(500, 'At least 500 km').max(50000, 'At most 50,000 km')
  ),
  serviceIntervalMonths: numOpt('Months', { int: true, max: 36, min: 1 }),
  lastServiceMileage: numOpt('Last service mileage', { int: true, max: 2000000 }),
  lastServiceDate: dateOpt,
  condition: z.object(conditionShape),
  images: z.array(z.string())
});

/** Removes empty values from a nested object before sending it to the API. */
export function compact(obj = {}) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null && !(typeof v === 'number' && Number.isNaN(v))));
}