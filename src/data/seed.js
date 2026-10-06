// Demo data used by the built-in mock backend (services/mockAdapter.js).
// Dates are generated relative to "today" so the demo always looks current.
import { addDays, format } from 'date-fns';

export const VEHICLE_IMAGES = {
  aqua: "/96f20910-5d1e-4fee-a5df-2ebd20e4fe3d.jpg",
  vezel: "/019ae1df-9a9b-4f05-97b8-89bbb36221e9.jpg"
};

export const AUTH_IMAGE = "/c52e2dc9-9781-421d-96a1-a13c2d8bb93c.jpg";

const d = (offset) => format(addDays(new Date(), offset), 'yyyy-MM-dd');

function random(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function fuelLog(vehicleId, { from, to, endMileage, kmPerDay, economy, stations, seed }) {
  const rand = random(seed);
  const records = [];
  let offset = from;
  let lastMileage = null;
  let i = 0;
  while (offset <= to) {
    const mileage = Math.round(endMileage + kmPerDay * offset - rand() * 40);
    const distance = lastMileage == null ? 480 : mileage - lastMileage;
    const eco = economy[0] + rand() * (economy[1] - economy[0]);
    const litres = Math.round(distance / eco * 100) / 100;
    const price = offset < -300 ? 332 : offset < -150 ? 309 : 299;
    records.push({
      id: `fuel_${vehicleId}_${i}`,
      vehicleId,
      date: d(offset),
      mileage,
      litres,
      pricePerLitre: price,
      total: Math.round(litres * price),
      station: stations[i % stations.length],
      fuelGrade: 'Petrol 92',
      fullTank: i % 6 !== 4,
      notes: ''
    });
    lastMileage = mileage;
    offset += 23 + Math.round(rand() * 6);
    i += 1;
  }
  return records;
}

export function createSeed({ hash }) {
  const now = new Date().toISOString();
  const user = {
    id: 'usr_demo',
    name: 'Nimal Fernando',
    email: 'demo@carlife.app',
    avatar: null,
    passwordHash: hash('Demo1234!'),
    createdAt: now,
    settings: null
  };

  const aqua = {
    id: 'veh_aqua',
    userId: user.id,
    type: 'used',
    status: 'active',
    make: 'Toyota',
    model: 'Aqua',
    variant: 'S Style Black',
    year: 2018,
    registration: 'CBH-7821',
    vin: 'NHP106721458',
    color: 'Silver metallic',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    mileage: 85200,
    mileageUpdatedAt: d(-1),
    image: VEHICLE_IMAGES.aqua,
    images: [VEHICLE_IMAGES.aqua],
    serviceIntervalKm: 5000,
    serviceIntervalMonths: 12,
    lastServiceMileage: 81700,
    lastServiceDate: d(-178),
    purchase: {
      date: d(-1680),
      price: 5250000,
      seller: 'Private seller, Kandy',
      previousOwners: 1,
      mileageAtPurchase: 52000,
      accidentHistory: 'None reported',
      condition: 'Good',
      inspected: 'Yes',
      inspectionNotes: 'Pre-purchase inspection at AutoMiraj — minor advisories only'
    },
    technical: {
      engineType: '1NZ-FXE inline-4 hybrid',
      capacity: 1496,
      cylinders: 4,
      power: '100 hp (combined)',
      torque: '111 Nm',
      aspiration: 'Naturally aspirated',
      gears: 'e-CVT',
      driveType: 'FWD',
      bodyType: 'Hatchback',
      seats: 5,
      doors: 5
    },
    dimensions: { length: 3995, width: 1695, height: 1455, wheelbase: 2550, weight: 1090, boot: 305 },
    performance: { topSpeed: 170, zeroTo100: 10.9, economy: '33.8 km/L (JC08)', emissions: 'Euro 5 · 69 g/km CO₂' },
    condition: { engine: 'good', transmission: 'excellent', brakes: 'good', suspension: 'good', tyres: 'good', battery: 'fair', interior: 'good', exterior: 'good' },
    createdAt: now
  };

  const vezel = {
    id: 'veh_vezel',
    userId: user.id,
    type: 'used',
    status: 'active',
    make: 'Honda',
    model: 'Vezel',
    variant: 'Hybrid RS',
    year: 2016,
    registration: 'CAQ-4512',
    vin: 'RU31104512',
    color: 'Pearl white',
    fuelType: 'Hybrid',
    transmission: 'Dual-clutch (DCT)',
    mileage: 102400,
    mileageUpdatedAt: d(-6),
    image: VEHICLE_IMAGES.vezel,
    images: [VEHICLE_IMAGES.vezel],
    serviceIntervalKm: 5000,
    serviceIntervalMonths: 12,
    lastServiceMileage: 97800,
    lastServiceDate: d(-150),
    purchase: { date: d(-1180), price: 7400000, seller: 'Autolanka Traders', previousOwners: 2, mileageAtPurchase: 74500, accidentHistory: 'Minor, repaired', condition: 'Fair', inspected: 'Yes' },
    technical: { engineType: 'LEB i-VTEC hybrid', capacity: 1496, cylinders: 4, power: '152 hp (combined)', torque: '156 Nm', aspiration: 'Naturally aspirated', gears: '7-speed DCT', driveType: 'FWD', bodyType: 'Crossover', seats: 5, doors: 5 },
    dimensions: { length: 4295, width: 1770, height: 1605, wheelbase: 2610, weight: 1270, boot: 393 },
    performance: { topSpeed: 180, zeroTo100: 9.8, economy: '26.0 km/L (JC08)', emissions: 'Euro 5' },
    condition: { engine: 'good', transmission: 'fair', brakes: 'fair', suspension: 'good', tyres: 'fair', battery: 'good', interior: 'good', exterior: 'good' },
    createdAt: now
  };

  const stations = ['Ceypetco — Nugegoda', 'Lanka IOC — Kirulapone', 'Sinopec — Borella', 'Ceypetco — Rajagiriya'];
  const fuel = [
  ...fuelLog(aqua.id, { from: -420, to: -3, endMileage: 85200, kmPerDay: 20, economy: [21.5, 24.8], stations, seed: 7 }),
  ...fuelLog(vezel.id, { from: -110, to: -8, endMileage: 102400, kmPerDay: 26, economy: [16.5, 19], stations: ['Lanka IOC — Dehiwala', 'Ceypetco — Maharagama'], seed: 3 })];


  const svc = (id, vehicleId, offset, mileage, labour, parts, workshop, partsReplaced, extra = {}) => ({
    id,
    vehicleId,
    date: d(offset),
    mileage,
    serviceType: 'Periodic service',
    description: 'Scheduled 5,000 km service and multipoint inspection',
    workshop,
    labourCost: labour,
    partsCost: parts,
    totalCost: labour + parts,
    partsReplaced,
    notes: '',
    attachments: [],
    ...extra
  });

  const maintenance = [
  svc('mnt_1', aqua.id, -178, 81700, 6500, 17800, 'Toyota Lanka — Wattala', 'Engine oil 0W-20 (3.7 L), oil filter, cabin filter, wiper blades', { notes: 'Technician noted 12V battery showing slow crank. Recheck next visit.' }),
  { id: 'mnt_2', vehicleId: aqua.id, date: d(-55), mileage: 84100, serviceType: 'Wheel alignment', description: 'Four-wheel alignment and balancing', workshop: 'City Wheel Alignment — Havelock', labourCost: 4500, partsCost: 0, totalCost: 4500, partsReplaced: '', notes: 'Slight pull to the left corrected.', attachments: [] },
  { id: 'mnt_3', vehicleId: aqua.id, date: d(-120), mileage: 82900, serviceType: 'Hybrid system check', description: 'Hybrid battery cooling fan and intake filter cleaned', workshop: 'AutoMiraj — Rajagiriya', labourCost: 5500, partsCost: 2000, totalCost: 7500, partsReplaced: 'Cooling intake filter', notes: 'Hybrid battery health 88%.', attachments: [] },
  { id: 'mnt_4', vehicleId: aqua.id, date: d(-395), mileage: 77400, serviceType: 'Repair', description: 'Front brake pads replaced & rotors resurfaced', workshop: 'AutoMiraj — Rajagiriya', labourCost: 6000, partsCost: 12900, totalCost: 18900, partsReplaced: 'Front brake pads (Akebono)', notes: '', attachments: [] },
  svc('mnt_5', aqua.id, -428, 76700, 6000, 16900, 'Toyota Lanka — Wattala', 'Engine oil, oil filter, air filter'),
  svc('mnt_6', aqua.id, -678, 71700, 5500, 15400, 'Toyota Lanka — Wattala', 'Engine oil, oil filter, spark plugs'),
  svc('mnt_7', aqua.id, -928, 66700, 5500, 14800, 'AutoMiraj — Rajagiriya', 'Engine oil, oil filter, brake fluid'),
  svc('mnt_8', aqua.id, -1178, 61700, 5000, 13900, 'AutoMiraj — Rajagiriya', 'Engine oil, oil filter, cabin filter'),
  svc('mnt_9', vezel.id, -150, 97800, 7500, 21500, 'Stafford Motors — Colombo 3', 'Engine oil, oil filter, DCT fluid top-up'),
  { id: 'mnt_10', vehicleId: vezel.id, date: d(-60), mileage: 100300, serviceType: 'Brake service', description: 'Rear brake shoes adjusted, front pads inspected', workshop: 'Stafford Motors — Colombo 3', labourCost: 4000, partsCost: 0, totalCost: 4000, partsReplaced: '', notes: 'Front pads at 35%. Replace within 5,000 km.', attachments: [] }];


  const insurance = [
  { id: 'ins_1', vehicleId: aqua.id, provider: 'Allianz Insurance Lanka', policyNumber: 'MV-2026-0048213', policyType: 'Comprehensive', startDate: d(-196), expiryDate: d(169), premium: 92500, coverageAmount: 5800000, coverage: 'Own damage, third-party liability, flood & natural perils, riot & strike, windscreen cover, 24/7 roadside assistance', agent: 'Dilani Perera · 077 123 4567', notes: '' },
  { id: 'ins_0', vehicleId: aqua.id, provider: 'Allianz Insurance Lanka', policyNumber: 'MV-2025-0031877', policyType: 'Comprehensive', startDate: d(-561), expiryDate: d(-197), premium: 86000, coverageAmount: 5500000, coverage: 'Own damage, third-party liability, natural perils', agent: 'Dilani Perera · 077 123 4567', notes: '' },
  { id: 'ins_2', vehicleId: vezel.id, provider: 'Ceylinco General', policyNumber: 'CG-TPF-884120', policyType: 'Third party, fire & theft', startDate: d(-345), expiryDate: d(20), premium: 38400, coverageAmount: 3000000, coverage: 'Third-party liability, fire and theft', agent: '', notes: '' }];


  const inspections = [
  { id: 'insp_1', vehicleId: aqua.id, date: d(-311), type: 'Emission test', center: 'Laugfs Eco Sri — Nugegoda', result: 'Pass', nextDate: d(54), cost: 1800, mileage: 79200, notes: 'CO 0.12%, HC 45 ppm — well within limits.' },
  { id: 'insp_2', vehicleId: aqua.id, date: d(-676), type: 'Emission test', center: 'Laugfs Eco Sri — Nugegoda', result: 'Pass', nextDate: d(-311), cost: 1650, mileage: 72100, notes: '' },
  { id: 'insp_3', vehicleId: aqua.id, date: d(-1683), type: 'Pre-purchase inspection', center: 'AutoMiraj Inspection', result: 'Advisory', nextDate: '', cost: 7500, mileage: 51980, notes: 'Rear brake pads at 30%. Hybrid battery health 92%.' },
  { id: 'insp_4', vehicleId: vezel.id, date: d(-330), type: 'Emission test', center: 'Clean Co — Maharagama', result: 'Pass', nextDate: d(35), cost: 1800, mileage: 94100, notes: '' }];


  const tyre = (id, position, tread, pressure) => ({
    id,
    vehicleId: aqua.id,
    position,
    brand: 'Bridgestone',
    model: 'Ecopia EP150',
    size: '175/65 R15',
    treadDepth: tread,
    pressure,
    recommendedPressure: 33,
    installDate: d(-678),
    installMileage: 71700,
    condition: 'Good',
    cost: 17500,
    notes: ''
  });
  const tyres = [tyre('tyr_fl', 'FL', 4.1, 33), tyre('tyr_fr', 'FR', 4.0, 32), tyre('tyr_rl', 'RL', 5.2, 33), tyre('tyr_rr', 'RR', 5.1, 28)];

  const batteries = [
  { id: 'bat_1', vehicleId: aqua.id, role: '12V auxiliary', brand: 'Amaron Hi Life Pro', type: 'AGM', capacity: '35 Ah (S34B20R)', installDate: d(-840), installMileage: 68500, warrantyMonths: 24, condition: 'Fair', cost: 28500, notes: 'Slow crank on cold mornings. Test at next service.' },
  { id: 'bat_2', vehicleId: aqua.id, role: 'Hybrid traction', brand: 'Toyota (OEM)', type: 'NiMH', capacity: '6.5 Ah · 144 V', installDate: '2018-02-01', installMileage: 0, warrantyMonths: 120, condition: 'Good', cost: 0, notes: 'Health 88% at last hybrid check.' }];


  const accidents = [
  { id: 'acc_1', vehicleId: aqua.id, date: d(-410), location: 'Liberty Plaza car park, Kollupitiya', description: 'Contact with a concrete pillar while reversing out of a tight bay.', damage: 'Rear bumper scuffed and cracked, right tail-light cover chipped', severity: 'Minor', claimFiled: false, claimNumber: '', claimStatus: '', repairCost: 38000, photos: [] },
  { id: 'acc_2', vehicleId: aqua.id, date: d(-980), location: 'Galle Road, Wellawatte', description: 'Rear-ended by a three-wheeler at a traffic light.', damage: 'Rear bumper replaced, boot lid realigned', severity: 'Moderate', claimFiled: true, claimNumber: 'CLM-23-77120', claimStatus: 'Settled', repairCost: 142000, photos: [] }];


  const modifications = [
  { id: 'mod_1', vehicleId: aqua.id, name: '70mai A500S dash cam (front + rear)', category: 'Electronics', date: d(-700), cost: 32500, workshop: 'CarTech — Colombo 5', description: 'Hard-wired with parking mode, rear camera on tailgate glass.', photos: [] },
  { id: 'mod_2', vehicleId: aqua.id, name: 'Android head unit with CarPlay', category: 'Electronics', date: d(-520), cost: 54000, workshop: 'CarTech — Colombo 5', description: '9" display, reverse camera integration, steering controls retained.', photos: [] },
  { id: 'mod_3', vehicleId: aqua.id, name: 'Ceramic window tint (35%)', category: 'Exterior', date: d(-1640), cost: 28000, workshop: 'Tint Pro — Nugegoda', description: 'Side and rear windows. Windscreen untouched.', photos: [] }];


  const doc = (id, vehicleId, name, category, uploadOffset, expiryOffset, fileName, size) => ({
    id,
    vehicleId,
    name,
    category,
    uploadDate: d(uploadOffset),
    expiryDate: expiryOffset == null ? '' : d(expiryOffset),
    fileName,
    fileType: 'image/png',
    fileSize: size,
    notes: ''
  });
  const documents = [
  doc('doc_1', aqua.id, 'Certificate of Registration', 'Registration', -1675, null, 'CR_CBH-7821.png', 482000),
  doc('doc_2', aqua.id, 'Revenue licence 2025/26', 'Registration', -311, 54, 'revenue-licence-2025.png', 214000),
  doc('doc_3', aqua.id, 'Insurance certificate 2026/27', 'Insurance', -196, 169, 'allianz-certificate-2026.png', 356000),
  doc('doc_4', aqua.id, 'Vehicle sale agreement', 'Purchase', -1680, null, 'sale-agreement.png', 628000),
  doc('doc_5', aqua.id, 'Service book scans', 'Service', -178, null, 'service-book.png', 1240000),
  doc('doc_6', aqua.id, 'Emission test certificate', 'Inspection', -311, 54, 'emission-2025.png', 188000),
  doc('doc_7', aqua.id, '12V battery warranty card', 'Warranty', -840, -110, 'amaron-warranty.png', 96000),
  doc('doc_8', vezel.id, 'Insurance certificate', 'Insurance', -345, 20, 'ceylinco-tpft.png', 301000)];


  const reminders = [
  { id: 'rem_1', vehicleId: aqua.id, title: 'Periodic service', type: 'Service', dueDate: d(187), dueMileage: 86700, repeat: 'none', notes: 'Book at Toyota Lanka, Wattala.', completed: false },
  { id: 'rem_2', vehicleId: aqua.id, title: 'Renew insurance', type: 'Insurance', dueDate: d(155), dueMileage: '', repeat: 'yearly', notes: 'Compare quotes two weeks before renewal.', completed: false },
  { id: 'rem_3', vehicleId: aqua.id, title: 'Emission test & revenue licence', type: 'Inspection', dueDate: d(54), dueMileage: '', repeat: 'yearly', notes: '', completed: false },
  { id: 'rem_4', vehicleId: aqua.id, title: 'Rotate tyres', type: 'Tyres', dueDate: d(-6), dueMileage: '', repeat: 'none', notes: 'Front tyres wearing faster than rear.', completed: false },
  { id: 'rem_5', vehicleId: aqua.id, title: 'Test 12V battery', type: 'Battery', dueDate: d(9), dueMileage: '', repeat: 'none', notes: '', completed: false },
  { id: 'rem_6', vehicleId: aqua.id, title: 'Hybrid battery warranty ends', type: 'Warranty', dueDate: '2028-02-01', dueMileage: '', repeat: 'none', notes: '', completed: false },
  { id: 'rem_7', vehicleId: aqua.id, title: 'Replace wiper blades', type: 'Other', dueDate: d(-62), dueMileage: '', repeat: 'none', notes: '', completed: true, completedAt: d(-60) },
  { id: 'rem_8', vehicleId: vezel.id, title: 'Renew insurance', type: 'Insurance', dueDate: d(12), dueMileage: '', repeat: 'yearly', notes: '', completed: false },
  { id: 'rem_9', vehicleId: vezel.id, title: 'Lease instalment', type: 'Finance', dueDate: d(8), dueMileage: '', repeat: 'monthly', notes: 'LKR 68,500 to Commercial Leasing', completed: false },
  { id: 'rem_10', vehicleId: vezel.id, title: 'Periodic service', type: 'Service', dueDate: d(215), dueMileage: 102800, repeat: 'none', notes: '', completed: false }];


  const trips = [
  { id: 'trp_1', vehicleId: aqua.id, date: d(-1), distance: 32, purpose: 'Commute', endMileage: 85200 },
  { id: 'trp_2', vehicleId: aqua.id, date: d(-2), distance: 28, purpose: 'Commute', endMileage: 85168 },
  { id: 'trp_3', vehicleId: aqua.id, date: d(-4), distance: 64, purpose: 'Weekend — Mount Lavinia', endMileage: 85140 },
  { id: 'trp_4', vehicleId: aqua.id, date: d(-5), distance: 27, purpose: 'Commute', endMileage: 85076 },
  { id: 'trp_5', vehicleId: aqua.id, date: d(-9), distance: 118, purpose: 'Family visit — Kandy', endMileage: 85049 }];


  const expenses = [];
  const rand = random(11);
  for (let k = 0; k < 14; k += 1) {
    expenses.push({ id: `exp_wash_${k}`, vehicleId: aqua.id, date: d(-12 - 30 * k), category: 'Cleaning', amount: 2000 + Math.round(rand() * 6) * 100, title: 'Car wash & vacuum', notes: '' });
    expenses.push({ id: `exp_park_${k}`, vehicleId: aqua.id, date: d(-6 - 30 * k), category: 'Parking', amount: 400 + Math.round(rand() * 10) * 50, title: 'City parking', notes: '' });
    if (k % 2 === 0) expenses.push({ id: `exp_toll_${k}`, vehicleId: aqua.id, date: d(-20 - 30 * k), category: 'Tolls', amount: 1300 + Math.round(rand() * 4) * 100, title: 'Southern Expressway', notes: '' });
  }
  expenses.push({ id: 'exp_lic', vehicleId: aqua.id, date: d(-311), category: 'Registration', amount: 4300, title: 'Revenue licence renewal', notes: '' });
  expenses.push({ id: 'exp_mats', vehicleId: aqua.id, date: d(-240), category: 'Accessories', amount: 12500, title: 'All-weather floor mats', notes: '' });
  expenses.push({ id: 'exp_vz_park', vehicleId: vezel.id, date: d(-10), category: 'Parking', amount: 800, title: 'Airport parking', notes: '' });

  return {
    users: [user],
    vehicles: [aqua, vezel],
    maintenance,
    fuel,
    expenses,
    documents,
    insurance,
    inspections,
    tyres,
    batteries,
    accidents,
    modifications,
    reminders,
    trips
  };
}