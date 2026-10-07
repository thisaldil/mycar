import {
  ACCIDENT_SEVERITY,
  BATTERY_ROLES,
  BATTERY_TYPES,
  CLAIM_STATUSES,
  EXPENSE_CATEGORIES,
  GENERAL_CONDITIONS,
  INSPECTION_RESULTS,
  INSPECTION_TYPES,
  MODIFICATION_CATEGORIES,
  POLICY_TYPES,
  REMINDER_REPEAT,
  REMINDER_TYPES,
  SERVICE_TYPES,
  TYRE_CONDITIONS,
  TYRE_POSITIONS } from
'../data/options';
import { todayISO } from './format';

const hasValue = (v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(Number(v));
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Field config drives both the record form (RecordFormModal) and the detail view (RecordDrawer).
 * `advanced: true` fields are tucked behind "More details" — progressive disclosure inside forms.
 */
export const RECORD_FORMS = {
  maintenance: {
    label: 'Service record',
    defaults: (v) => ({ date: todayISO(), mileage: v?.mileage ?? '', serviceType: 'Periodic service', attachments: [], photos: [] }),
    fields: [
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'mileage', label: 'Odometer', type: 'number', required: true, integer: true, suffix: 'km' },
    { name: 'serviceType', label: 'Service type', type: 'select', options: SERVICE_TYPES, required: true },
    { name: 'workshop', label: 'Workshop', type: 'text', placeholder: 'e.g. Toyota Lanka — Wattala' },
    { name: 'description', label: 'What was done', type: 'textarea', placeholder: 'Oil change, filters, multipoint check…' },
    { name: 'labourCost', label: 'Labour', type: 'currency' },
    { name: 'partsCost', label: 'Parts', type: 'currency' },
    { name: 'totalCost', label: 'Total cost', type: 'currency', required: true, hint: 'Adds up labour and parts — you can override it.' },
    { name: 'partsReplaced', label: 'Parts replaced', type: 'textarea', advanced: true },
    { name: 'notes', label: 'Notes', type: 'textarea', advanced: true },
    { name: 'attachments', label: 'Invoice & files', type: 'files', advanced: true, accept: 'image/*,application/pdf' },
    { name: 'photos', label: 'Photos', type: 'images', advanced: true }],

    computed: [{ name: 'totalCost', deps: ['labourCost', 'partsCost'], fn: (v) => hasValue(v.labourCost) || hasValue(v.partsCost) ? (Number(v.labourCost) || 0) + (Number(v.partsCost) || 0) : undefined }]
  },

  fuel: {
    label: 'Fuel record',
    defaults: (v) => ({ date: todayISO(), mileage: v?.mileage ?? '', fullTank: true, fuelGrade: v?.fuelType === 'Diesel' ? 'Diesel' : 'Petrol 92' }),
    fields: [
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'mileage', label: 'Odometer', type: 'number', required: true, integer: true, suffix: 'km' },
    { name: 'litres', label: 'Litres', type: 'number', required: true, min: 0.1, suffix: 'L', decimals: 2 },
    { name: 'pricePerLitre', label: 'Price per litre', type: 'currency', required: true, min: 0.01, decimals: 2 },
    { name: 'total', label: 'Total', type: 'currency', required: true, hint: 'Calculated automatically.' },
    { name: 'station', label: 'Fuel station', type: 'text', placeholder: 'e.g. Ceypetco — Nugegoda' },
    { name: 'fullTank', label: 'Filled to full', type: 'checkbox', hint: 'Full fills are used to calculate fuel economy.' },
    { name: 'fuelGrade', label: 'Fuel grade', type: 'text', advanced: true },
    { name: 'notes', label: 'Notes', type: 'textarea', advanced: true }],

    computed: [{ name: 'total', deps: ['litres', 'pricePerLitre'], fn: (v) => hasValue(v.litres) && hasValue(v.pricePerLitre) ? round2(Number(v.litres) * Number(v.pricePerLitre)) : undefined }]
  },

  expenses: {
    label: 'Expense',
    defaults: () => ({ date: todayISO(), category: 'Parking', attachments: [] }),
    fields: [
    { name: 'title', label: 'Description', type: 'text', required: true, placeholder: 'e.g. Car wash' },
    { name: 'amount', label: 'Amount', type: 'currency', required: true, min: 0.01 },
    { name: 'category', label: 'Category', type: 'select', options: EXPENSE_CATEGORIES, required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'mileage', label: 'Odometer', type: 'number', integer: true, suffix: 'km', advanced: true },
    { name: 'notes', label: 'Notes', type: 'textarea', advanced: true },
    { name: 'attachments', label: 'Receipt', type: 'files', advanced: true, accept: 'image/*,application/pdf' }]

  },

  insurance: {
    label: 'Insurance policy',
    defaults: () => ({ startDate: todayISO(), policyType: 'Comprehensive', attachments: [] }),
    fields: [
    { name: 'provider', label: 'Provider', type: 'text', required: true, placeholder: 'e.g. Allianz Insurance Lanka' },
    { name: 'policyNumber', label: 'Policy number', type: 'text', required: true, sensitive: true },
    { name: 'policyType', label: 'Policy type', type: 'select', options: POLICY_TYPES, required: true },
    { name: 'premium', label: 'Premium', type: 'currency', required: true },
    { name: 'startDate', label: 'Start date', type: 'date', required: true },
    { name: 'expiryDate', label: 'Expiry date', type: 'date', required: true },
    { name: 'coverageAmount', label: 'Sum insured', type: 'currency' },
    { name: 'coverage', label: 'What is covered', type: 'textarea', placeholder: 'Own damage, third party, natural perils…' },
    { name: 'agent', label: 'Agent / contact', type: 'text', advanced: true },
    { name: 'notes', label: 'Notes', type: 'textarea', advanced: true },
    { name: 'attachments', label: 'Policy documents', type: 'files', advanced: true, accept: 'image/*,application/pdf' }],

    validate: (v, ctx) => {
      if (v.startDate && v.expiryDate && v.expiryDate <= v.startDate) ctx.addIssue({ code: 'custom', path: ['expiryDate'], message: 'Expiry must be after the start date' });
    }
  },

  inspections: {
    label: 'Inspection',
    defaults: (v) => ({ date: todayISO(), type: 'Emission test', result: 'Pass', mileage: v?.mileage ?? '', attachments: [] }),
    fields: [
    { name: 'date', label: 'Inspection date', type: 'date', required: true },
    { name: 'type', label: 'Type', type: 'select', options: INSPECTION_TYPES, required: true },
    { name: 'result', label: 'Result', type: 'select', options: INSPECTION_RESULTS, required: true },
    { name: 'nextDate', label: 'Next inspection due', type: 'date' },
    { name: 'center', label: 'Inspection centre', type: 'text' },
    { name: 'cost', label: 'Cost', type: 'currency' },
    { name: 'mileage', label: 'Odometer', type: 'number', integer: true, suffix: 'km', advanced: true },
    { name: 'notes', label: 'Findings & notes', type: 'textarea', advanced: true },
    { name: 'attachments', label: 'Certificate', type: 'files', advanced: true, accept: 'image/*,application/pdf' }],

    validate: (v, ctx) => {
      if (v.date && v.nextDate && v.nextDate <= v.date) ctx.addIssue({ code: 'custom', path: ['nextDate'], message: 'Next inspection must be after this one' });
    }
  },

  tyres: {
    label: 'Tyre',
    defaults: (v) => ({ position: 'FL', installDate: todayISO(), installMileage: v?.mileage ?? '', condition: 'New', recommendedPressure: 33 }),
    fields: [
    { name: 'position', label: 'Position', type: 'select', options: TYRE_POSITIONS, required: true },
    { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g. Bridgestone' },
    { name: 'size', label: 'Size', type: 'text', required: true, placeholder: '175/65 R15' },
    { name: 'condition', label: 'Condition', type: 'select', options: TYRE_CONDITIONS },
    { name: 'treadDepth', label: 'Tread depth', type: 'number', suffix: 'mm', max: 12, decimals: 1 },
    { name: 'pressure', label: 'Pressure', type: 'number', suffix: 'psi', max: 80 },
    { name: 'installDate', label: 'Installed on', type: 'date' },
    { name: 'model', label: 'Model', type: 'text', advanced: true },
    { name: 'recommendedPressure', label: 'Recommended pressure', type: 'number', suffix: 'psi', max: 80, advanced: true },
    { name: 'installMileage', label: 'Odometer at install', type: 'number', integer: true, suffix: 'km', advanced: true },
    { name: 'cost', label: 'Cost', type: 'currency', advanced: true },
    { name: 'notes', label: 'Notes', type: 'textarea', advanced: true }]

  },

  batteries: {
    label: 'Battery',
    defaults: (v) => ({ role: '12V auxiliary', installDate: todayISO(), installMileage: v?.mileage ?? '', condition: 'Good', warrantyMonths: 24 }),
    fields: [
    { name: 'role', label: 'Battery', type: 'select', options: BATTERY_ROLES, required: true },
    { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g. Amaron' },
    { name: 'type', label: 'Type', type: 'select', options: BATTERY_TYPES, placeholder: 'Select type' },
    { name: 'capacity', label: 'Capacity / model', type: 'text', placeholder: 'e.g. 45 Ah (NS60)' },
    { name: 'installDate', label: 'Installed on', type: 'date', required: true },
    { name: 'warrantyMonths', label: 'Warranty', type: 'number', integer: true, suffix: 'months', max: 240 },
    { name: 'condition', label: 'Condition', type: 'select', options: GENERAL_CONDITIONS },
    { name: 'installMileage', label: 'Odometer at install', type: 'number', integer: true, suffix: 'km' },
    { name: 'cost', label: 'Cost', type: 'currency', advanced: true },
    { name: 'notes', label: 'Notes', type: 'textarea', advanced: true }]

  },

  accidents: {
    label: 'Accident',
    defaults: () => ({ date: todayISO(), severity: 'Minor', claimFiled: false, photos: [] }),
    fields: [
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'severity', label: 'Severity', type: 'select', options: ACCIDENT_SEVERITY, required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'description', label: 'What happened', type: 'textarea', required: true },
    { name: 'damage', label: 'Damage', type: 'textarea' },
    { name: 'repairCost', label: 'Repair cost', type: 'currency' },
    { name: 'claimFiled', label: 'Insurance claim filed', type: 'checkbox', hint: 'Claimed repairs are not counted as your own expense.' },
    { name: 'claimNumber', label: 'Claim number', type: 'text', showIf: (v) => v.claimFiled },
    { name: 'claimStatus', label: 'Claim status', type: 'select', options: CLAIM_STATUSES, placeholder: 'Select status', showIf: (v) => v.claimFiled },
    { name: 'photos', label: 'Photos', type: 'images' }]

  },

  modifications: {
    label: 'Modification',
    defaults: () => ({ date: todayISO(), category: 'Electronics', photos: [] }),
    fields: [
    { name: 'name', label: 'Modification', type: 'text', required: true, placeholder: 'e.g. Dash camera' },
    { name: 'category', label: 'Category', type: 'select', options: MODIFICATION_CATEGORIES },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'cost', label: 'Cost', type: 'currency' },
    { name: 'workshop', label: 'Installed by', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'photos', label: 'Photos', type: 'images' }]

  },

  reminders: {
    label: 'Reminder',
    defaults: () => ({ type: 'Service', repeat: 'none', completed: false }),
    fields: [
    { name: 'title', label: 'Reminder', type: 'text', required: true, placeholder: 'e.g. Renew revenue licence' },
    { name: 'type', label: 'Type', type: 'select', options: REMINDER_TYPES, required: true },
    { name: 'dueDate', label: 'Due date', type: 'date' },
    { name: 'dueMileage', label: 'Due at odometer', type: 'number', integer: true, suffix: 'km', hint: 'Optional. Whichever comes first.' },
    { name: 'repeat', label: 'Repeat', type: 'select', options: REMINDER_REPEAT },
    { name: 'notes', label: 'Notes', type: 'textarea', advanced: true }],

    validate: (v, ctx) => {
      if (!v.dueDate && (v.dueMileage === undefined || v.dueMileage === '')) ctx.addIssue({ code: 'custom', path: ['dueDate'], message: 'Set a due date, an odometer reading, or both' });
    }
  }
};